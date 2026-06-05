import Phaser from 'phaser'
import { LevelEditorConfig } from '../config/LevelEditorConfig'
import { FishBodySprite } from '../entities/FishBodySprite'
import type { FishDefinition } from '../types/FishTypes'
import type { SpawnPointDefinition } from '../types/SpawnPointTypes'

/** Scene-level actions the handles trigger but do not own. */
export interface SpawnPointHandleCallbacks {
  /** A marker was pressed; the scene updates its selection. */
  onSelect: (id: string) => void
  /** A marker was dragged to a new (already-snapped) world position. */
  onMove: (id: string, x: number, y: number) => void
  /** Snap a raw world coordinate to the editor grid. */
  snap: (value: number) => number
}

/** Visual + draggable bits for one spawn point. */
interface MarkerView {
  container: Phaser.GameObjects.Container
  ring: Phaser.GameObjects.Graphics
  label: Phaser.GameObjects.Text
  def: SpawnPointDefinition
}

/**
 * DEV-ONLY draggable spawn-point markers for the level editor. Owns the marker
 * visuals (fish preview + ring + label) and drag handling only; the editable
 * data model, selection state, and keyboard editing live in LevelEditorScene.
 * Mirrors the rig harness's RigAnchorHandles split (visuals here, logic there).
 */
export class SpawnPointHandles {
  private readonly scene: Phaser.Scene
  private readonly callbacks: SpawnPointHandleCallbacks
  private readonly markers = new Map<string, MarkerView>()
  private selectedId: string | null = null
  private fishCatalog: readonly FishDefinition[] = []
  private maxRespawnMs = 1

  constructor(scene: Phaser.Scene, callbacks: SpawnPointHandleCallbacks) {
    this.scene = scene
    this.callbacks = callbacks
  }

  /** Recreate all markers from the current model (structural changes). */
  rebuild(
    points: readonly SpawnPointDefinition[],
    selectedId: string | null,
    fishCatalog: readonly FishDefinition[],
  ): void {
    this.fishCatalog = fishCatalog
    this.maxRespawnMs = Math.max(1, ...fishCatalog.map((f) => f.respawnMs))
    this.clear()
    this.selectedId = selectedId
    for (const def of points) {
      this.markers.set(def.id, this.createMarker(def))
    }
  }

  /** Recolor rings to reflect a new selection (no destroy/recreate). */
  setSelected(id: string | null): void {
    this.selectedId = id
    for (const view of this.markers.values()) {
      this.drawRing(view, view.def.id === id)
    }
  }

  /** Move a marker to an already-validated world position. */
  move(id: string, x: number, y: number): void {
    const view = this.markers.get(id)
    if (!view) {
      return
    }
    view.container.setPosition(x, y)
    view.def.x = x
    view.def.y = y
    this.drawRing(view, view.def.id === this.selectedId)
    this.refreshLabel(view)
  }

  destroy(): void {
    this.clear()
  }

  private clear(): void {
    for (const view of this.markers.values()) {
      view.container.destroy()
    }
    this.markers.clear()
  }

  private createMarker(def: SpawnPointDefinition): MarkerView {
    const container = this.scene.add.container(def.x, def.y).setDepth(50)

    const fishDef = this.fishCatalog.find((f) => f.id === def.fishId)
    const preview = fishDef
      ? FishBodySprite.create(this.scene, fishDef)
      : this.scene.add.image(0, 0, '__WHITE').setDisplaySize(32, 20)

    const ring = this.scene.add.graphics()
    const label = this.scene.add
      .text(0, LevelEditorConfig.markerRingRadius + 6, '', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: LevelEditorConfig.labelColor,
        backgroundColor: LevelEditorConfig.labelBackground,
        align: 'center',
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5, 0)

    container.add([ring, preview, label])
    container.setAlpha(def.enabled === false ? LevelEditorConfig.disabledAlpha : 1)

    const view: MarkerView = { container, ring, label, def }
    this.drawRing(view, def.id === this.selectedId)
    this.refreshLabel(view)
    this.applyHitArea(view)

    container.on('pointerdown', () => this.callbacks.onSelect(def.id))
    container.on('drag', (_p: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      const x = this.callbacks.snap(dragX)
      const y = this.callbacks.snap(dragY)
      this.move(def.id, x, y)
      this.callbacks.onMove(def.id, x, y)
    })

    return view
  }

  private drawRing(view: MarkerView, selected: boolean): void {
    const cfg = LevelEditorConfig
    view.ring.clear()
    const fishDef = this.fishCatalog.find((f) => f.id === view.def.fishId)
    if (fishDef) {
      this.drawRespawnIndicator(view, fishDef)
    }
    if (selected) {
      if (fishDef) {
        view.ring.lineStyle(
          cfg.aggressionRangeWidth,
          cfg.aggressionRangeColor,
          cfg.aggressionRangeAlpha,
        )
        view.ring.strokeCircle(0, 0, fishDef.aggressionRadius)
      }

      const halfRange = view.def.swimRange / 2
      view.ring.lineStyle(cfg.swimRangeWidth, cfg.swimRangeColor, cfg.swimRangeAlpha)
      view.ring.lineBetween(-halfRange, 0, halfRange, 0)
      view.ring.lineBetween(-halfRange, -8, -halfRange, 8)
      view.ring.lineBetween(halfRange, -8, halfRange, 8)
    }
    view.ring.lineStyle(
      selected ? cfg.selectedRingWidth : cfg.markerRingWidth,
      selected ? cfg.selectedRingColor : cfg.markerRingColor,
      1,
    )
    view.ring.strokeCircle(0, 0, cfg.markerRingRadius)
    // Small crosshair at the exact spawn coordinate.
    view.ring.lineStyle(1, selected ? cfg.selectedRingColor : cfg.markerRingColor, 0.9)
    view.ring.lineBetween(-4, 0, 4, 0)
    view.ring.lineBetween(0, -4, 0, 4)
    view.container.setAlpha(view.def.enabled === false ? cfg.disabledAlpha : 1)
  }

  private drawRespawnIndicator(view: MarkerView, fishDef: FishDefinition): void {
    const cfg = LevelEditorConfig.respawnIndicator
    const x = -cfg.width / 2
    const y = cfg.y
    const normalized = Phaser.Math.Clamp(fishDef.respawnMs / this.maxRespawnMs, 0, 1)
    const fillWidth = Math.max(cfg.height, cfg.width * normalized)
    const color = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(cfg.fastColor),
      Phaser.Display.Color.ValueToColor(cfg.slowColor),
      100,
      Math.round(normalized * 100),
    )
    const fillColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b)

    view.ring.fillStyle(cfg.backgroundColor, cfg.backgroundAlpha)
    view.ring.fillRoundedRect(x, y, cfg.width, cfg.height, cfg.height / 2)
    view.ring.fillStyle(fillColor, 1)
    view.ring.fillRoundedRect(x, y, fillWidth, cfg.height, cfg.height / 2)
    view.ring.lineStyle(1, cfg.outlineColor, cfg.outlineAlpha)
    view.ring.strokeRoundedRect(x, y, cfg.width, cfg.height, cfg.height / 2)
  }

  /** Rectangle hit zone sized to include the fish art and the label block. */
  private applyHitArea(view: MarkerView): void {
    const area = LevelEditorConfig.markerHitArea
    const labelBottom = view.label.y + view.label.height
    const bottom = Math.max(area.bottom, labelBottom + 10)
    const height = bottom - area.top
    const width = Math.max(area.halfWidth * 2, view.label.width + 24)

    view.container.disableInteractive()
    view.container.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, area.top, width, height),
      Phaser.Geom.Rectangle.Contains,
    )
    this.scene.input.setDraggable(view.container)
  }

  /** Refresh a marker's label + alpha after a model edit. */
  refreshLabel(view: MarkerView): void {
    const def = view.def
    const off = def.enabled === false ? '  (off)' : ''
    const fishDef = this.fishCatalog.find((f) => f.id === def.fishId)
    const name = fishDef?.displayName ?? def.fishId
    const respawnSec = fishDef ? (fishDef.respawnMs / 1000).toFixed(0) : '?'
    const aggression = fishDef?.aggressionRadius ?? '?'
    const speed = fishDef?.speed ?? '?'
    view.label.setText(
      `${name}\nspd ${speed}  ×${def.maxAlive}  ${respawnSec}s  swim ${def.swimRange}\naggro ${aggression}${off}`,
    )
    view.container.setAlpha(def.enabled === false ? LevelEditorConfig.disabledAlpha : 1)
    this.applyHitArea(view)
  }

  /** Refresh every marker after species-wide edits like respawn/aggression. */
  refreshAll(): void {
    for (const view of this.markers.values()) {
      this.drawRing(view, view.def.id === this.selectedId)
      this.refreshLabel(view)
    }
  }

  /** Refresh the marker for a given id after a keyboard edit. */
  refresh(id: string): void {
    const view = this.markers.get(id)
    if (view) {
      this.drawRing(view, view.def.id === this.selectedId)
      this.refreshLabel(view)
    }
  }
}
