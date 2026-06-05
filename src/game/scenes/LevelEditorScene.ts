import Phaser from 'phaser'
import { SceneKeys } from './SceneKeys'
import { loadFishAssets } from '../assets/FishAssets'
import { FISH_DATA } from '../data/fishData'
import { SPAWN_POINT_DATA } from '../data/spawnPointData'
import { FishConfig } from '../config/FishConfig'
import { LevelEditorConfig } from '../config/LevelEditorConfig'
import { SpawnConfig } from '../config/SpawnConfig'
import { WorldConfig, worldRightX } from '../config/WorldConfig'
import { HorseSpawnMarker } from '../dev/HorseSpawnMarker'
import { formatLevelEditorExport } from '../dev/LevelEditorExport'
import { SpawnPointHandles } from '../dev/SpawnPointHandles'
import type { FishDefinition } from '../types/FishTypes'
import type { SpawnPointDefinition } from '../types/SpawnPointTypes'

/**
 * DEV-ONLY level editor (launched with `?editor` in the URL). It runs ONLY this
 * scene -- no fishing loop, no horse rig -- and works directly in WORLD
 * coordinates so placed points map 1:1 onto spawnPointData. Place fish, tune
 * respawn timers + caps, then press E to log a fresh SPAWN_POINT_DATA array and
 * paste it into data/spawnPointData.ts.
 * Starts in select-only mode; press F to toggle "add fish on empty-water click".
 *
 * Orchestrator only: the draggable marker visuals live in SpawnPointHandles,
 * the schema in SpawnPointTypes, and all tuning in LevelEditorConfig.
 */
export class LevelEditorScene extends Phaser.Scene {
  private points: SpawnPointDefinition[] = []
  /** Working copy of species tuning (respawn, speed, etc.) edited in the editor. */
  private fish: FishDefinition[] = []
  private horseMarker!: HorseSpawnMarker
  private handles!: SpawnPointHandles
  private readout!: Phaser.GameObjects.Text
  private panKeys!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key[]>
  private selectedId: string | null = null
  private paletteIndex = 0
  private idCounter = 0
  private zoom = 0.8
  private addOnClick: boolean = LevelEditorConfig.addOnClickDefault

  constructor() {
    super(SceneKeys.LevelEditor)
  }

  preload(): void {
    loadFishAssets(this)
  }

  create(): void {
    this.points = SPAWN_POINT_DATA.map((p) => ({ ...p }))
    this.fish = FISH_DATA.map((f) => ({ ...f }))
    this.idCounter = this.points.length

    this.drawBackdrop()
    this.setupCamera()
    this.horseMarker = new HorseSpawnMarker(this)

    this.handles = new SpawnPointHandles(this, {
      onSelect: (id) => this.select(id),
      onMove: () => this.refreshReadout(),
      snap: (v) => this.snap(v),
    })
    this.handles.rebuild(this.points, this.selectedId, this.fish)

    this.readout = this.add
      .text(12, 12, '', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: { x: 10, y: 8 },
      })
      .setScrollFactor(0)
      .setDepth(1000)

    this.bindKeys()
    this.bindPointer()
    this.refreshReadout()

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.horseMarker.destroy()
      this.handles.destroy()
    })
  }

  update(_time: number, deltaMs: number): void {
    const cam = this.cameras.main
    const dist = (LevelEditorConfig.panSpeed * (deltaMs / 1000)) / cam.zoom
    if (this.anyDown(this.panKeys.left)) cam.scrollX -= dist
    if (this.anyDown(this.panKeys.right)) cam.scrollX += dist
    if (this.anyDown(this.panKeys.up)) cam.scrollY -= dist
    if (this.anyDown(this.panKeys.down)) cam.scrollY += dist
  }

  private anyDown(keys: Phaser.Input.Keyboard.Key[]): boolean {
    return keys.some((k) => k.isDown)
  }

  // -- setup ---------------------------------------------------------------

  private setupCamera(): void {
    const cam = this.cameras.main
    const top = WorldConfig.waterlineY - WorldConfig.skyHeight
    cam.setBounds(
      WorldConfig.worldLeftX,
      top,
      WorldConfig.worldWidth,
      WorldConfig.skyHeight + WorldConfig.maxDepth,
    )
    cam.setZoom(this.zoom)
    cam.centerOn(WorldConfig.surfaceAnchorX, WorldConfig.waterlineY + 300)
  }

  private drawBackdrop(): void {
    const cfg = LevelEditorConfig
    const top = WorldConfig.waterlineY - WorldConfig.skyHeight
    const left = WorldConfig.worldLeftX
    const width = WorldConfig.worldWidth
    const g = this.add.graphics().setDepth(0)

    g.fillStyle(cfg.skyColor, 1)
    g.fillRect(left, top, width, WorldConfig.skyHeight)
    g.fillStyle(cfg.waterColorTop, 1)
    g.fillRect(left, WorldConfig.waterlineY, width, WorldConfig.maxDepth)

    // Reference grid (snap target is finer than this draw step).
    g.lineStyle(1, cfg.gridColor, cfg.gridAlpha)
    for (let x = left; x <= worldRightX; x += cfg.gridDrawStep) {
      g.lineBetween(x, top, x, WorldConfig.waterlineY + WorldConfig.maxDepth)
    }
    for (let y = WorldConfig.waterlineY; y <= WorldConfig.maxDepth; y += cfg.gridDrawStep) {
      g.lineBetween(left, y, worldRightX, y)
    }

    // Waterline.
    g.lineStyle(3, cfg.waterlineColor, 1)
    g.lineBetween(left, WorldConfig.waterlineY, worldRightX, WorldConfig.waterlineY)

    // Depth labels so vertical position reads as a depth.
    for (let d = cfg.depthLabelStep; d <= WorldConfig.maxDepth; d += cfg.depthLabelStep) {
      this.add
        .text(left + 8, WorldConfig.waterlineY + d - 8, `${d}`, {
          color: '#bfe6f2',
          fontSize: '13px',
        })
        .setDepth(1)
    }

    // World edges.
    g.lineStyle(2, 0xffd166, 0.6)
    g.strokeRect(left, top, width, WorldConfig.skyHeight + WorldConfig.maxDepth)
  }

  // -- input ---------------------------------------------------------------

  private bindKeys(): void {
    const kb = this.input.keyboard
    if (!kb) {
      return
    }
    const Codes = Phaser.Input.Keyboard.KeyCodes
    // WASD pans the camera; arrow keys nudge the selected spawn marker.
    this.panKeys = {
      up: [kb.addKey(Codes.W)],
      down: [kb.addKey(Codes.S)],
      left: [kb.addKey(Codes.A)],
      right: [kb.addKey(Codes.D)],
    }

    kb.on('keydown-UP', () => this.nudgeSelected(0, -1))
    kb.on('keydown-DOWN', () => this.nudgeSelected(0, 1))
    kb.on('keydown-LEFT', () => this.nudgeSelected(-1, 0))
    kb.on('keydown-RIGHT', () => this.nudgeSelected(1, 0))
    kb.on('keydown-OPEN_BRACKET', () => this.cycleSpecies(-1))
    kb.on('keydown-CLOSED_BRACKET', () => this.cycleSpecies(1))
    kb.on('keydown-T', () => this.adjustRespawn(-1))
    kb.on('keydown-Y', () => this.adjustRespawn(1))
    kb.on('keydown-SEMICOLON', () => this.adjustMaxAlive(-1))
    kb.on('keydown-QUOTES', () => this.adjustMaxAlive(1))
    kb.on('keydown-G', () => this.toggleEnabled())
    kb.on('keydown-Z', () => this.adjustSwimRange(-1))
    kb.on('keydown-X', () => this.adjustSwimRange(1))
    kb.on('keydown-N', () => this.adjustAggression(-1))
    kb.on('keydown-M', () => this.adjustAggression(1))
    kb.on('keydown-COMMA', () => this.adjustSpeed(-1))
    kb.on('keydown-PERIOD', () => this.adjustSpeed(1))
    kb.on('keydown-F', () => this.toggleAddOnClick())
    kb.on('keydown-DELETE', () => this.deleteSelected())
    kb.on('keydown-BACKSPACE', () => this.deleteSelected())
    kb.on('keydown-E', () => this.exportToConsole())
    kb.on('keydown-R', () => this.scene.restart())
  }

  private bindPointer(): void {
    this.input.on(
      Phaser.Input.Events.POINTER_DOWN,
      (pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
        if (over.length > 0 || pointer.rightButtonDown()) {
          return
        }
        if (this.addOnClick) {
          this.placeAtPointer(pointer)
        } else {
          this.clearSelection()
        }
      },
    )
    this.input.on('wheel', (_p: Phaser.Input.Pointer, _o: unknown, _dx: number, dy: number) => {
      const step = dy > 0 ? -LevelEditorConfig.zoomStep : LevelEditorConfig.zoomStep
      this.zoom = Phaser.Math.Clamp(
        this.zoom + step,
        LevelEditorConfig.zoomMin,
        LevelEditorConfig.zoomMax,
      )
      this.cameras.main.setZoom(this.zoom)
    })
  }

  // -- editing -------------------------------------------------------------

  private placeAtPointer(pointer: Phaser.Input.Pointer): void {
    const wp = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
    const y = this.snap(wp.y)
    if (y <= WorldConfig.waterlineY) {
      return // spawn points must sit underwater
    }
    const x = Phaser.Math.Clamp(this.snap(wp.x), WorldConfig.worldLeftX, worldRightX)
    const fishId = this.fish[this.paletteIndex].id
    const def: SpawnPointDefinition = {
      id: this.nextId(),
      x,
      y,
      fishId,
      maxAlive: SpawnConfig.defaultMaxAlive,
      swimRange: LevelEditorConfig.defaultSwimRange,
    }
    this.points.push(def)
    this.selectedId = def.id
    this.handles.rebuild(this.points, this.selectedId, this.fish)
    this.refreshReadout()
  }

  private select(id: string): void {
    this.selectedId = id
    // Keep the palette in sync with the selected point's species.
    const def = this.selected()
    if (def) {
      const idx = this.fish.findIndex((f) => f.id === def.fishId)
      if (idx >= 0) {
        this.paletteIndex = idx
      }
    }
    this.handles.setSelected(id)
    this.refreshReadout()
  }

  private clearSelection(): void {
    this.selectedId = null
    this.handles.setSelected(null)
    this.refreshReadout()
  }

  /** Cycle species: edits the selected point if any, else the placement palette. */
  private cycleSpecies(dir: number): void {
    this.paletteIndex = Phaser.Math.Wrap(this.paletteIndex + dir, 0, this.fish.length)
    const def = this.selected()
    if (def) {
      def.fishId = this.fish[this.paletteIndex].id
      this.handles.rebuild(this.points, this.selectedId, this.fish)
    }
    this.refreshReadout()
  }

  /** Adjust respawn for the selected point's species (global per fish). */
  private adjustRespawn(dir: number): void {
    const species = this.selectedSpecies()
    if (!species) {
      return
    }
    const tuning = FishConfig.speciesRespawn
    species.respawnMs = Math.max(
      tuning.minMs,
      species.respawnMs + dir * tuning.editorStepMs,
    )
    if (this.selectedId) {
      this.handles.refreshAll()
    }
    this.refreshReadout()
  }

  /** Adjust swim speed for the selected point's species (global per fish). */
  private adjustSpeed(dir: number): void {
    const species = this.selectedSpecies()
    if (!species) {
      return
    }
    const tuning = FishConfig.speciesSpeed
    species.speed = Phaser.Math.Clamp(
      species.speed + dir * tuning.editorStepSpeed,
      tuning.minSpeed,
      tuning.maxSpeed,
    )
    this.handles.refreshAll()
    this.refreshReadout()
  }

  /** Adjust detection radius for the selected point's species (global per fish). */
  private adjustAggression(dir: number): void {
    const species = this.selectedSpecies()
    if (!species) {
      return
    }
    const tuning = FishConfig.speciesAggression
    species.aggressionRadius = Phaser.Math.Clamp(
      species.aggressionRadius + dir * tuning.editorStepRadius,
      tuning.minRadius,
      tuning.maxRadius,
    )
    this.handles.refreshAll()
    this.refreshReadout()
  }

  private adjustMaxAlive(dir: number): void {
    const def = this.selected()
    if (!def) {
      return
    }
    def.maxAlive = Phaser.Math.Clamp(
      def.maxAlive + dir * LevelEditorConfig.maxAliveStep,
      LevelEditorConfig.maxAliveMin,
      LevelEditorConfig.maxAliveMax,
    )
    this.handles.refresh(def.id)
    this.refreshReadout()
  }

  private adjustSwimRange(dir: number): void {
    const def = this.selected()
    if (!def) {
      return
    }
    def.swimRange = Phaser.Math.Clamp(
      def.swimRange + dir * LevelEditorConfig.swimRangeStep,
      LevelEditorConfig.swimRangeMin,
      LevelEditorConfig.swimRangeMax,
    )
    this.handles.refresh(def.id)
    this.refreshReadout()
  }

  private nudgeSelected(dx: number, dy: number): void {
    const def = this.selected()
    if (!def) {
      return
    }
    const step = LevelEditorConfig.moveStep
    const x = Phaser.Math.Clamp(def.x + dx * step, WorldConfig.worldLeftX, worldRightX)
    const y = Phaser.Math.Clamp(
      def.y + dy * step,
      WorldConfig.waterlineY + step,
      WorldConfig.waterlineY + WorldConfig.maxDepth,
    )
    this.handles.move(def.id, this.snap(x), this.snap(y))
    this.refreshReadout()
  }

  private toggleEnabled(): void {
    const def = this.selected()
    if (!def) {
      return
    }
    def.enabled = def.enabled === false ? true : false
    this.handles.refresh(def.id)
    this.refreshReadout()
  }

  private toggleAddOnClick(): void {
    this.addOnClick = !this.addOnClick
    this.refreshReadout()
  }

  private deleteSelected(): void {
    if (!this.selectedId) {
      return
    }
    this.points = this.points.filter((p) => p.id !== this.selectedId)
    this.selectedId = null
    this.handles.rebuild(this.points, this.selectedId, this.fish)
    this.refreshReadout()
  }

  // -- export --------------------------------------------------------------

  private exportToConsole(): void {
    const out = formatLevelEditorExport(this.points, this.fish)
    console.log('[LevelEditor] Paste into data/spawnPointData.ts and data/fishData.ts:\n\n' + out)
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(out).catch(() => undefined)
    }
    this.flashStatus(`Exported ${this.points.length} points + ${this.fish.length} fish`)
  }

  private flashStatus(message: string): void {
    const note = this.add
      .text(this.scale.width / 2, 24, message, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#0b1020',
        backgroundColor: '#ffd166',
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(1001)
    this.time.delayedCall(1600, () => note.destroy())
  }

  // -- helpers -------------------------------------------------------------

  private selected(): SpawnPointDefinition | undefined {
    return this.points.find((p) => p.id === this.selectedId)
  }

  private selectedSpecies(): FishDefinition | undefined {
    const point = this.selected()
    if (!point) {
      return undefined
    }
    return this.fish.find((f) => f.id === point.fishId)
  }

  private snap(value: number): number {
    const step = LevelEditorConfig.gridStep
    return Math.round(value / step) * step
  }

  private nextId(): string {
    this.idCounter += 1
    return `sp-edit-${this.idCounter}`
  }

  private refreshReadout(): void {
    const def = this.selected()
    const palette = this.fish[this.paletteIndex]
    const species = this.selectedSpecies()
    const lines: string[] = [
      'LEVEL EDITOR  (?editor)',
      '',
      `add-on-click: ${this.addOnClick ? 'ON' : 'OFF'}  (F toggles)`,
      `place species: ${palette.displayName} (${palette.id})`,
      `  speed ${palette.speed}  respawn ${(palette.respawnMs / 1000).toFixed(0)}s  aggro ${palette.aggressionRadius}`,
      `points: ${this.points.length}`,
      `horse spawn: x:${WorldConfig.surfaceAnchorX}  y:${WorldConfig.waterlineY} (red marker)`,
      '',
    ]
    if (def) {
      lines.push(
        `selected: ${def.id}`,
        `  fish     ${species?.displayName ?? def.fishId} (${def.fishId})`,
        `  pos      x:${def.x}  y:${def.y}`,
        `  speed    ${species?.speed ?? '?'}  (species-wide)`,
        `  respawn  ${species ? (species.respawnMs / 1000).toFixed(0) : '?'}s  (species-wide)`,
        `  aggro    ${species?.aggressionRadius ?? '?'} radius  (species-wide)`,
        `  maxAlive ${def.maxAlive}`,
        `  swim     ${def.swimRange}w  (${Math.round(def.x - def.swimRange / 2)}-${Math.round(def.x + def.swimRange / 2)} x)`,
        `  enabled  ${def.enabled === false ? 'no' : 'yes'}`,
      )
    } else {
      lines.push('selected: none (click a marker)')
    }
    lines.push(
      '',
      'click marker  select      drag  move',
      'F  add-on-click mode      click water adds only when ON',
      'WASD  pan      wheel  zoom      arrows  move selected',
      '[ ]  species      T Y  species respawn',
      'N M  species aggression      , .  species speed',
      "; '  maxAlive      G  toggle on/off",
      'Z X  swim range',
      'DEL  delete      E  export      R  reset',
    )
    this.readout.setText(lines.join('\n'))
  }
}
