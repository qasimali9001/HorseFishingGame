import Phaser from 'phaser'
import { LevelEditorConfig } from '../config/LevelEditorConfig'
import { WorldConfig } from '../config/WorldConfig'

/**
 * DEV-ONLY world-space marker showing where the horse stands at runtime
 * (WorldConfig.surfaceAnchorX on the waterline). Helps place fish spawns
 * relative to the cast origin without booting the full game loop.
 */
export class HorseSpawnMarker {
  private readonly root: Phaser.GameObjects.Container

  constructor(scene: Phaser.Scene) {
    const cfg = LevelEditorConfig.horseSpawn
    const x = WorldConfig.surfaceAnchorX
    const y = WorldConfig.waterlineY

    this.root = scene.add.container(x, y).setDepth(cfg.depth)

    const guide = scene.add.graphics()
    guide.lineStyle(cfg.guideWidth, cfg.color, cfg.guideAlpha)
    guide.lineBetween(0, -cfg.guideAbove, 0, cfg.guideBelow)

    const ring = scene.add.graphics()
    ring.lineStyle(cfg.ringWidth, cfg.color, 1)
    ring.strokeCircle(0, 0, cfg.ringRadius)
    ring.lineStyle(2, cfg.color, 0.85)
    ring.lineBetween(-cfg.ringRadius, 0, cfg.ringRadius, 0)
    ring.lineBetween(0, -cfg.ringRadius * 0.55, 0, cfg.ringRadius * 0.55)

    const label = scene.add
      .text(0, -cfg.guideAbove - 10, cfg.label, {
        fontFamily: 'monospace',
        fontSize: `${cfg.labelFontSize}px`,
        color: cfg.labelColor,
        backgroundColor: cfg.labelBackground,
        align: 'center',
        padding: { x: 6, y: 4 },
      })
      .setOrigin(0.5, 1)

    this.root.add([guide, ring, label])
  }

  destroy(): void {
    this.root.destroy()
  }
}
