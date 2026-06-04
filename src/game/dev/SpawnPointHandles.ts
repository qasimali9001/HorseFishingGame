import Phaser from 'phaser'
import { FISH_DATA } from '../data/fishData'
import { LevelEditorConfig } from '../config/LevelEditorConfig'
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

  constructor(scene: Phaser.Scene, callbacks: SpawnPointHandleCallbacks) {
    this.scene = scene
    this.callbacks = callbacks
  }

  /** Recreate all markers from the current model (structural changes). */
  rebuild(points: readonly SpawnPointDefinition[], selectedId: string | null): void {
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

    const fishDef = FISH_DATA.find((f) => f.id === def.fishId)
    const artKey =
      fishDef && this.scene.textures.exists(fishDef.artId) ? fishDef.artId : '__WHITE'
    const preview = this.scene.add.image(0, 0, artKey)
    const r = fishDef?.radius ?? 16
    preview.setDisplaySize(r * 2.4, r * 1.6)
    if (artKey === '__WHITE' && fishDef) {
      preview.setTintFill(fishDef.color)
    }

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

    const radius = LevelEditorConfig.markerHitRadius
    container
      .setSize(radius * 2, radius * 2)
      .setInteractive(new Phaser.Geom.Circle(0, 0, radius), Phaser.Geom.Circle.Contains)
    this.scene.input.setDraggable(container)

    const view: MarkerView = { container, ring, label, def }
    this.drawRing(view, def.id === this.selectedId)
    this.refreshLabel(view)

    container.on('pointerdown', () => this.callbacks.onSelect(def.id))
    container.on('drag', (_p: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      const x = this.callbacks.snap(dragX)
      const y = this.callbacks.snap(dragY)
      container.setPosition(x, y)
      def.x = x
      def.y = y
      this.refreshLabel(view)
      this.callbacks.onMove(def.id, x, y)
    })

    return view
  }

  private drawRing(view: MarkerView, selected: boolean): void {
    const cfg = LevelEditorConfig
    view.ring.clear()
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

  /** Refresh a marker's label + alpha after a model edit. */
  refreshLabel(view: MarkerView): void {
    const def = view.def
    const off = def.enabled === false ? '  (off)' : ''
    view.label.setText(`${def.fishId}\n×${def.maxAlive}  ${(def.respawnMs / 1000).toFixed(0)}s${off}`)
    view.container.setAlpha(def.enabled === false ? LevelEditorConfig.disabledAlpha : 1)
  }

  /** Refresh the marker for a given id after a keyboard edit. */
  refresh(id: string): void {
    const view = this.markers.get(id)
    if (view) {
      this.refreshLabel(view)
    }
  }
}
