import Phaser from 'phaser'
import { CastTrackerConfig } from '../config/CastTrackerConfig'
import { WorldConfig } from '../config/WorldConfig'

/**
 * Lightweight world-space cast preview shown while charging at the surface.
 * Draws an anchored mini angle triangle in front of the horse (relative to the
 * fixed surface anchor), so it stays planted while horse/rod animation moves.
 */
export class CastAngleTracker {
  private readonly gfx: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene) {
    this.gfx = scene.add.graphics().setDepth(12).setVisible(false)
  }

  /** Draw/refresh the anchored angle triangle from the current cast angle. */
  show(angleDeg: number, failed: boolean): void {
    const rad = Phaser.Math.DegToRad(angleDeg)
    const dirX = Math.cos(rad)
    const dirY = -Math.sin(rad)

    const originX = WorldConfig.surfaceAnchorX + CastTrackerConfig.offsetFromSurfaceAnchor.x
    const originY = WorldConfig.waterlineY + CastTrackerConfig.offsetFromSurfaceAnchor.y
    const baseX = originX + CastTrackerConfig.baseLength
    const baseY = originY
    const angleX = originX + dirX * CastTrackerConfig.angledLength
    const angleY = originY + dirY * CastTrackerConfig.angledLength

    const color = failed ? CastTrackerConfig.failedColor : CastTrackerConfig.normalColor
    this.gfx.clear()
    this.gfx.lineStyle(CastTrackerConfig.lineWidth, color, CastTrackerConfig.alpha)

    // Open triangle look: baseline + angled arm (no closing edge).
    this.gfx.lineBetween(originX, originY, baseX, baseY)
    this.gfx.lineBetween(originX, originY, angleX, angleY)

    // Arrow traveling down the angled arm (tip -> toward the pivot).
    const downDirX = -dirX
    const downDirY = -dirY
    const arrowStartX = originX + dirX * (CastTrackerConfig.angledLength * 0.78)
    const arrowStartY = originY + dirY * (CastTrackerConfig.angledLength * 0.78)
    const arrowTipX = arrowStartX + downDirX * CastTrackerConfig.headLength
    const arrowTipY = arrowStartY + downDirY * CastTrackerConfig.headLength

    this.gfx.lineBetween(arrowStartX, arrowStartY, arrowTipX, arrowTipY)
    const backX = arrowTipX - downDirX * CastTrackerConfig.headLength
    const backY = arrowTipY - downDirY * CastTrackerConfig.headLength
    const perpX = -downDirY
    const perpY = downDirX
    this.gfx.lineBetween(
      arrowTipX,
      arrowTipY,
      backX + perpX * CastTrackerConfig.headHalfWidth,
      backY + perpY * CastTrackerConfig.headHalfWidth,
    )
    this.gfx.lineBetween(
      arrowTipX,
      arrowTipY,
      backX - perpX * CastTrackerConfig.headHalfWidth,
      backY - perpY * CastTrackerConfig.headHalfWidth,
    )

    this.gfx.fillStyle(color, CastTrackerConfig.alpha)
    this.gfx.fillCircle(originX, originY, CastTrackerConfig.pivotRadius)
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
