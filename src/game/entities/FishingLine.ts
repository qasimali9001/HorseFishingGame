import Phaser from 'phaser'
import { FishingConfig } from '../config/FishingConfig'

/**
 * Lightweight line drawn between the rod tip and the lure. Drawn in WORLD
 * space (default scroll factor), so the camera scrolls it with everything
 * else. When the lure is deep and the rod is offscreen, the straight segment
 * to the real rod-tip world position naturally exits the top of the screen --
 * which is exactly the "implied connection upward" the design calls for. No
 * rope physics.
 */
export class FishingLine {
  private readonly gfx: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene) {
    this.gfx = scene.add.graphics().setDepth(8)
  }

  /** Redraw each frame. Pass null endpoints (or visible=false) to hide. */
  redraw(rodTip: Phaser.Math.Vector2, lureX: number, lureY: number, visible: boolean): void {
    this.gfx.clear()
    if (!visible) {
      return
    }
    this.gfx.lineStyle(FishingConfig.line.thickness, FishingConfig.line.color, FishingConfig.line.alpha)
    this.gfx.lineBetween(rodTip.x, rodTip.y, lureX, lureY)
  }
}
