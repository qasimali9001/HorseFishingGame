import Phaser from 'phaser'
import { RodConfig } from '../config/RodConfig'
import { DebugConfig } from '../config/DebugConfig'
import type { RodDefinition, RodStats } from '../types/RodTypes'

/**
 * The fishing rod as an independent entity. It owns its own visual (a textured
 * shaft inside `root`) and its stats, and can report its tip's world position.
 * It knows nothing about the horse -- the horse attaches `root` at its mouth
 * anchor, so the rod tracks the mouth (and swings during the cast) for free.
 *
 * The shaft texture is drawn with the butt on the left at local x=0 and the tip
 * on the right, origin (0, 0.5), uniformly scaled so its on-screen length is
 * `definition.lengthPx`. The line attaches at the tip.
 */
export class FishingRod {
  /** Local container: butt at (0,0), rod extends along +X to the tip. */
  readonly root: Phaser.GameObjects.Container
  private definition: RodDefinition
  private readonly shaft: Phaser.GameObjects.Image
  private readonly tip: Phaser.GameObjects.Arc

  constructor(scene: Phaser.Scene, definition: RodDefinition = RodConfig.starter) {
    this.definition = definition
    this.root = scene.add.container(0, 0)

    this.shaft = scene.add.image(0, 0, RodConfig.textureKey).setOrigin(0, 0.5)
    this.tip = scene.add
      .circle(0, 0, RodConfig.tipRadius, RodConfig.tipColor)
      .setVisible(DebugConfig.showAnchors)

    this.root.add([this.shaft, this.tip])
    this.setDisplayLength(definition.lengthPx)
  }

  get stats(): RodStats {
    const { castPowerMultiplier, reelSpeedMultiplier, maxDepthBonus, lineStrengthBonus } =
      this.definition
    return { castPowerMultiplier, reelSpeedMultiplier, maxDepthBonus, lineStrengthBonus }
  }

  /** World-space position of the rod tip (where the line attaches). */
  getTipWorldPosition(): Phaser.Math.Vector2 {
    const m = this.tip.getWorldTransformMatrix()
    return new Phaser.Math.Vector2(m.tx, m.ty)
  }

  /** Scale the shaft so butt->tip spans `lengthPx`, keeping the art's aspect. */
  setDisplayLength(lengthPx: number): void {
    const texWidth = this.shaft.width || lengthPx
    const scale = lengthPx / texWidth
    this.shaft.setScale(scale)
    this.tip.setPosition(lengthPx, 0)
  }

  /** Toggle the debug tip marker (used by the rig tuner / debug overlay). */
  setTipVisible(visible: boolean): void {
    this.tip.setVisible(visible)
  }

  /** Swap rod data (visual length + stats). Used by rod upgrades later. */
  setRodDefinition(definition: RodDefinition): void {
    this.definition = definition
    this.setDisplayLength(definition.lengthPx)
  }
}
