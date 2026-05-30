import Phaser from 'phaser'
import type { PlayerHorse } from '../entities/PlayerHorse'
import { RigTestConfig } from '../config/RigTestConfig'

/** One draggable rig anchor (neck, mouth, or rod tip). */
interface AnchorHandle {
  readonly id: 'neck' | 'mouth' | 'rodTip'
  readonly gfx: Phaser.GameObjects.Arc
  readonly syncWorld: () => Phaser.Math.Vector2
  readonly applyWorld: (worldX: number, worldY: number) => void
}

export interface RigAnchorHandlesOptions {
  onLayoutChange: () => void
  /** Whether idle bob/wobble should resume after a drag ends. */
  getIdleEnabled: () => boolean
}

/**
 * Draggable on-screen handles for the rig harness (`?rig`). Dragging updates
 * HorseConfig layout values live; keyboard tuning in RigTuner stays in sync.
 */
export class RigAnchorHandles {
  private readonly horse: PlayerHorse
  private readonly scene: Phaser.Scene
  private readonly handles: AnchorHandle[]
  private readonly onLayoutChange: () => void
  private readonly getIdleEnabled: () => boolean
  private draggingId: AnchorHandle['id'] | null = null

  constructor(
    scene: Phaser.Scene,
    horse: PlayerHorse,
    options: RigAnchorHandlesOptions,
  ) {
    this.scene = scene
    this.horse = horse
    this.onLayoutChange = options.onLayoutChange
    this.getIdleEnabled = options.getIdleEnabled

    this.handles = [
      this.makeHandle('neck', RigTestConfig.neckHandleColor, () => {
        const n = horse.layout.neck
        return new Phaser.Math.Vector2(horse.root.x + n.x, horse.root.y + n.y)
      }, (x, y) => horse.setNeckFromWorld(x, y)),
      this.makeHandle('mouth', RigTestConfig.mouthHandleColor, () => horse.getMouthWorldPosition(), (x, y) =>
        horse.setMouthFromWorld(x, y),
      ),
      this.makeHandle('rodTip', RigTestConfig.rodTipHandleColor, () => horse.getRodTipWorldPosition(), (x, y) =>
        horse.setRodTipFromWorld(x, y),
      ),
    ]

    this.syncPositions()
  }

  /** Keep handles on anchors when idle/cast moves them (unless that handle is dragging). */
  update(): void {
    if (this.draggingId === null) {
      this.syncPositions()
    }
  }

  setVisible(visible: boolean): void {
    for (const h of this.handles) {
      h.gfx.setVisible(visible)
    }
    if (visible) {
      this.syncPositions()
    }
  }

  private makeHandle(
    id: AnchorHandle['id'],
    color: number,
    syncWorld: () => Phaser.Math.Vector2,
    applyWorld: (worldX: number, worldY: number) => void,
  ): AnchorHandle {
    const r = RigTestConfig.anchorHandleRadius
    const gfx = this.scene.add
      .circle(0, 0, r, color, 0.85)
      .setStrokeStyle(RigTestConfig.anchorHandleStrokeWidth, RigTestConfig.anchorHandleStroke)
      .setDepth(50)
      .setInteractive({ draggable: true, useHandCursor: true })

    this.scene.input.setDraggable(gfx)

    gfx.on('dragstart', () => {
      this.draggingId = id
      this.horse.stopMotion()
    })

    gfx.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      applyWorld(dragX, dragY)
      gfx.setPosition(dragX, dragY)
      this.onLayoutChange()
    })

    gfx.on('dragend', () => {
      this.draggingId = null
      if (this.getIdleEnabled()) {
        this.horse.restartIdle()
      }
      this.syncPositions()
      this.onLayoutChange()
    })

    return { id, gfx, syncWorld, applyWorld }
  }

  private syncPositions(): void {
    for (const h of this.handles) {
      if (h.id === this.draggingId) {
        continue
      }
      const w = h.syncWorld()
      h.gfx.setPosition(w.x, w.y)
    }
  }
}
