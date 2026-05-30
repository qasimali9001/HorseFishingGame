import Phaser from 'phaser'
import { HorseConfig } from '../config/HorseConfig'
import { DebugConfig } from '../config/DebugConfig'
import { FishingRod } from './FishingRod'
import type { RodStats } from '../types/RodTypes'

/**
 * The goofy surface horse, built as a modular rig:
 *   root container (placed at a WORLD position)
 *     ├─ body
 *     └─ headPivot container (rotates for idle wobble + cast bend)
 *          ├─ head / snout / ear / eye
 *          ├─ mouth anchor
 *          └─ rod (attached at the mouth)
 *
 * PlayerHorse owns ONLY the visual rig + its anchors + animation states. It
 * does not own fish, economy, camera, lure physics, or save logic. The fishing
 * system asks it for the mouth / rod-tip world positions when needed.
 */
export class PlayerHorse {
  readonly root: Phaser.GameObjects.Container
  private readonly headPivot: Phaser.GameObjects.Container
  private readonly mouthMarker: Phaser.GameObjects.Arc
  private readonly rod: FishingRod
  private readonly scene: Phaser.Scene
  private bobTween?: Phaser.Tweens.Tween
  private headWobbleTween?: Phaser.Tweens.Tween

  constructor(scene: Phaser.Scene, worldX: number, worldY: number) {
    this.scene = scene
    this.root = scene.add.container(worldX, worldY).setDepth(10)

    const body = this.makeEllipse(HorseConfig.body)
    this.headPivot = scene.add.container(HorseConfig.neck.x, HorseConfig.neck.y)

    const head = this.makeEllipse(HorseConfig.head)
    const snout = this.makeEllipse(HorseConfig.snout)
    const ear = this.makeEllipse(HorseConfig.ear)
    const eye = scene.add.circle(
      HorseConfig.eye.offsetX,
      HorseConfig.eye.offsetY,
      HorseConfig.eye.radius,
      HorseConfig.eye.color,
    )

    this.mouthMarker = scene.add
      .circle(HorseConfig.mouthOffset.x, HorseConfig.mouthOffset.y, 4, 0xff2d6f)
      .setVisible(DebugConfig.showAnchors)

    this.rod = new FishingRod(scene)
    this.rod.root.setPosition(HorseConfig.mouthOffset.x, HorseConfig.mouthOffset.y)
    this.rod.root.setAngle(HorseConfig.restRodAngleDeg)

    this.headPivot.add([head, ear, snout, eye, this.mouthMarker, this.rod.root])
    this.root.add([body, this.headPivot])

    this.startBob()
    this.startHeadWobble()
  }

  /** World-space mouth attachment point. */
  getMouthWorldPosition(): Phaser.Math.Vector2 {
    const m = this.mouthMarker.getWorldTransformMatrix()
    return new Phaser.Math.Vector2(m.tx, m.ty)
  }

  /** World-space rod tip, delegated to the rod entity. */
  getRodTipWorldPosition(): Phaser.Math.Vector2 {
    return this.rod.getTipWorldPosition()
  }

  /** Rod-derived stats, read by the fishing system (never stored on the horse). */
  get rodStats(): RodStats {
    return this.rod.stats
  }

  /**
   * Goofy cast: head winds backward, snaps forward (fires `onRelease` at the
   * snap so the lure can launch), then recovers and resumes idle wobble.
   */
  playCastAnimation(onRelease?: () => void): void {
    this.headWobbleTween?.stop()
    this.scene.tweens.killTweensOf(this.headPivot)

    this.scene.tweens.chain({
      targets: this.headPivot,
      onComplete: () => this.startHeadWobble(),
      tweens: [
        { angle: HorseConfig.cast.backBendDeg, duration: HorseConfig.cast.windupMs, ease: 'Sine.easeIn' },
        {
          angle: HorseConfig.cast.snapForwardDeg,
          duration: HorseConfig.cast.snapMs,
          ease: 'Back.easeIn',
          onComplete: () => onRelease?.(),
        },
        { angle: 0, duration: HorseConfig.cast.recoverMs, ease: 'Sine.easeOut' },
      ],
    })
  }

  destroy(): void {
    this.bobTween?.stop()
    this.headWobbleTween?.stop()
    this.root.destroy()
  }

  private makeEllipse(part: {
    offsetX: number
    offsetY: number
    width: number
    height: number
    color: number
  }): Phaser.GameObjects.Ellipse {
    return this.scene.add
      .ellipse(part.offsetX, part.offsetY, part.width, part.height, part.color)
      .setStrokeStyle(HorseConfig.strokeWidth, HorseConfig.strokeColor)
  }

  private startBob(): void {
    this.bobTween = this.scene.tweens.add({
      targets: this.root,
      y: this.root.y + HorseConfig.idle.bobAmplitude,
      duration: HorseConfig.idle.bobDurationMs,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  private startHeadWobble(): void {
    this.headPivot.setAngle(0)
    this.headWobbleTween = this.scene.tweens.add({
      targets: this.headPivot,
      angle: HorseConfig.idle.headWobbleDeg,
      duration: HorseConfig.idle.headWobbleDurationMs,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }
}
