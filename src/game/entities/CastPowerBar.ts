import Phaser from 'phaser'
import { CastPowerBarConfig } from '../config/CastPowerBarConfig'
import { WorldConfig } from '../config/WorldConfig'

/**
 * Lightweight world-space cast power preview shown while charging at surface.
 */
export class CastPowerBar {
  private readonly gfx: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene) {
    this.gfx = scene.add.graphics().setDepth(12).setVisible(false)
  }

  show(power01: number): void {
    const p = Phaser.Math.Clamp(power01, 0, 1)
    const x = WorldConfig.surfaceAnchorX + CastPowerBarConfig.offsetFromSurfaceAnchor.x
    const y = WorldConfig.waterlineY + CastPowerBarConfig.offsetFromSurfaceAnchor.y
    const w = CastPowerBarConfig.width
    const h = CastPowerBarConfig.height

    this.gfx.clear()
    this.gfx.fillStyle(CastPowerBarConfig.backgroundColor, CastPowerBarConfig.alpha)
    this.gfx.fillRect(x, y, w, h)

    if (p > 0) {
      const fillInset = CastPowerBarConfig.borderThickness
      const fillW = (w - fillInset * 2) * p
      const fillH = h - fillInset * 2
      this.gfx.fillStyle(CastPowerBarConfig.fillColor, CastPowerBarConfig.alpha)
      this.gfx.fillRect(x + fillInset, y + fillInset, fillW, fillH)
    }

    this.gfx.lineStyle(
      CastPowerBarConfig.borderThickness,
      CastPowerBarConfig.borderColor,
      CastPowerBarConfig.alpha,
    )
    this.gfx.strokeRect(x, y, w, h)
    this.gfx.setVisible(true)
  }

  hide(): void {
    this.gfx.clear()
    this.gfx.setVisible(false)
  }

  destroy(): void {
    this.gfx.destroy()
  }
}
