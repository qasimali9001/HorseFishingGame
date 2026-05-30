import Phaser from 'phaser'
import { RodConfig } from '../config/RodConfig'
import { DebugConfig } from '../config/DebugConfig'
import type { RodDefinition, RodStats } from '../types/RodTypes'

/**
 * The fishing rod as an independent entity. It owns its own visual (a shape
 * group inside `root`) and its stats, and can report its tip's world position.
 * It knows nothing about the horse -- the horse attaches `root` at its mouth
 * anchor, so the rod tracks the mouth (and swings during the cast) for free.
 */
export class FishingRod {
  /** Local container: butt at (0,0), rod extends along +X to the tip. */
  readonly root: Phaser.GameObjects.Container
  private definition: RodDefinition
  private readonly shaft: Phaser.GameObjects.Rectangle
  private readonly tip: Phaser.GameObjects.Arc

  constructor(scene: Phaser.Scene, definition: RodDefinition = RodConfig.starter) {
    this.definition = definition
    this.root = scene.add.container(0, 0)

    this.shaft = scene.add
      .rectangle(0, 0, definition.lengthPx, RodConfig.thickness, RodConfig.color)
      .setOrigin(0, 0.5)
    this.tip = scene.add
      .circle(definition.lengthPx, 0, RodConfig.tipRadius, RodConfig.tipColor)
      .setVisible(DebugConfig.showAnchors)

    this.root.add([this.shaft, this.tip])
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

  /** Swap rod data (visual length + stats). Used by rod upgrades later. */
  setRodDefinition(definition: RodDefinition): void {
    this.definition = definition
    this.shaft.setSize(definition.lengthPx, RodConfig.thickness)
    this.shaft.setOrigin(0, 0.5)
    this.tip.setPosition(definition.lengthPx, 0)
  }
}
