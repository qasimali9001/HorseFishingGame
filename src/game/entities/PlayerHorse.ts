import Phaser from 'phaser'
import { HorseConfig } from '../config/HorseConfig'
import { DebugConfig } from '../config/DebugConfig'
import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/GameEvents'
import { FishingRod } from './FishingRod'
import type { RodDefinition, RodStats } from '../types/RodTypes'
import type { HorseRigLayout } from '../types/HorseTypes'

/**
 * The goofy surface horse, built as a modular textured rig:
 *   root container (placed at a WORLD position)
 *     ├─ body sprite
 *     └─ headPivot container (rotates for idle wobble + cast bend)
 *          ├─ rod (behind the head, still pivots with the mouth)
 *          ├─ head sprite (origin = neck/throat joint, so it nods naturally)
 *          └─ mouth anchor (debug marker, on top)
 *
 * PlayerHorse owns ONLY the visual rig + its anchors + animation states. It
 * does not own fish, economy, camera, lure physics, or save logic. The fishing
 * system asks it for the mouth / rod-tip world positions when needed.
 *
 * The whole rig is driven by a `HorseRigLayout`. `applyLayout()` re-projects
 * every part from that data, so the rig test scene can tune values live and the
 * game consumes the exact same class with the exact same result.
 */
export class PlayerHorse {
  readonly root: Phaser.GameObjects.Container
  /** Mutable working copy of the layout (cloned so config consts stay frozen). */
  readonly layout: HorseRigLayout
  private readonly headPivot: Phaser.GameObjects.Container
  private readonly body: Phaser.GameObjects.Image
  private readonly head: Phaser.GameObjects.Image
  private readonly mouthMarker: Phaser.GameObjects.Arc
  private readonly neckMarker: Phaser.GameObjects.Arc
  private readonly rod: FishingRod
  private readonly scene: Phaser.Scene
  private bobTween?: Phaser.Tweens.Tween
  private headWobbleTween?: Phaser.Tweens.Tween
  private baseRootY: number
  private idleEnabled = true

  constructor(
    scene: Phaser.Scene,
    worldX: number,
    worldY: number,
    layout: HorseRigLayout = HorseConfig,
  ) {
    this.scene = scene
    this.layout = structuredClone(layout)
    this.baseRootY = worldY
    this.root = scene.add.container(worldX, worldY).setDepth(10)

    this.body = scene.add.image(0, 0, this.layout.body.textureKey)
    this.headPivot = scene.add.container(0, 0)
    this.head = scene.add.image(0, 0, this.layout.head.textureKey)

    this.neckMarker = scene.add.circle(0, 0, 5, 0xff2d6f)
    this.mouthMarker = scene.add.circle(0, 0, 5, 0x2d6fff)

    this.rod = new FishingRod(scene)

    // Rod first so it draws behind the head (mouth-grip look).
    this.headPivot.add([this.rod.root, this.head, this.mouthMarker])
    this.root.add([this.body, this.headPivot, this.neckMarker])

    this.applyLayout()
    this.setAnchorsVisible(DebugConfig.showAnchors)
    this.startBob()
    this.startHeadWobble()

    EventBus.on(GameEvents.ROD_EQUIPPED, this.onRodEquipped)
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

  /** Apply a new rod definition to the rig (texture, length, and stat modifiers). */
  equipRod(definition: RodDefinition): void {
    this.layout.rodLengthPx = definition.lengthPx
    this.rod.setRodDefinition(definition)
    this.applyLayout()
  }

  /**
   * Re-project every rig part from the current layout. Cheap; safe to call on
   * every tuner keystroke. Does not touch the live head rotation (idle/cast own
   * that) or the animated root.y (the bob owns that).
   */
  applyLayout(): void {
    const L = this.layout

    this.body
      .setOrigin(L.body.originX, L.body.originY)
      .setPosition(L.body.offsetX, L.body.offsetY)
      .setScale(L.body.scale)

    this.headPivot.setPosition(L.neck.x, L.neck.y)
    this.neckMarker.setPosition(L.neck.x, L.neck.y)

    this.head
      .setOrigin(L.head.originX, L.head.originY)
      .setPosition(L.head.offsetX, L.head.offsetY)
      .setScale(L.head.scale)

    this.mouthMarker.setPosition(L.mouthOffset.x, L.mouthOffset.y)
    this.rod.root.setPosition(L.mouthOffset.x, L.mouthOffset.y).setAngle(L.restRodAngleDeg)
    this.rod.setDisplayLength(L.rodLengthPx)
  }

  /**
   * Rig-tuner only: move the neck pivot from a screen/world drag position.
   * Converts to local root space and updates `layout.neck`.
   */
  setNeckFromWorld(worldX: number, worldY: number): void {
    const local = new Phaser.Math.Vector2()
    this.root.getLocalPoint(worldX, worldY, local)
    this.layout.neck.x = Math.round(local.x)
    this.layout.neck.y = Math.round(local.y)
    this.applyLayout()
  }

  /**
   * Rig-tuner only: move the mouth / rod-butt anchor from a drag position.
   * Converts to local head-pivot space and updates `layout.mouthOffset`.
   */
  setMouthFromWorld(worldX: number, worldY: number): void {
    const local = new Phaser.Math.Vector2()
    this.headPivot.getLocalPoint(worldX, worldY, local)
    this.layout.mouthOffset.x = Math.round(local.x)
    this.layout.mouthOffset.y = Math.round(local.y)
    this.applyLayout()
  }

  /**
   * Rig-tuner only: drag the rod tip to set `rodLengthPx` and `restRodAngleDeg`
   * from the mouth anchor.
   */
  setRodTipFromWorld(worldX: number, worldY: number): void {
    const tipLocal = new Phaser.Math.Vector2()
    this.headPivot.getLocalPoint(worldX, worldY, tipLocal)
    const mx = this.layout.mouthOffset.x
    const my = this.layout.mouthOffset.y
    const dx = tipLocal.x - mx
    const dy = tipLocal.y - my
    const len = Math.hypot(dx, dy)
    if (len < 8) {
      return
    }
    this.layout.rodLengthPx = Math.round(len)
    this.layout.restRodAngleDeg = Phaser.Math.RadToDeg(Math.atan2(dy, dx))
    this.applyLayout()
  }

  /** Show/hide the rig anchor markers (neck, mouth, rod tip). */
  setAnchorsVisible(visible: boolean): void {
    this.neckMarker.setVisible(visible)
    this.mouthMarker.setVisible(visible)
    this.rod.setTipVisible(visible)
  }

  /** Toggle the idle bob + head wobble (handy while tuning static offsets). */
  setIdleEnabled(enabled: boolean): void {
    this.idleEnabled = enabled
    this.restartIdle()
  }

  /** Stop bob/wobble tweens without re-enabling (rig tuner drag). */
  stopMotion(): void {
    this.bobTween?.stop()
    this.headWobbleTween?.stop()
    this.scene.tweens.killTweensOf(this.headPivot)
    this.root.y = this.baseRootY
    this.headPivot.setAngle(0)
  }

  /** Restart idle motion after layout changes (e.g. wobble degrees were tuned). */
  restartIdle(): void {
    this.bobTween?.stop()
    this.headWobbleTween?.stop()
    this.root.y = this.baseRootY
    this.headPivot.setAngle(0)
    if (this.idleEnabled) {
      this.startBob()
      this.startHeadWobble()
    }
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
        { angle: this.layout.cast.backBendDeg, duration: this.layout.cast.windupMs, ease: 'Sine.easeIn' },
        {
          angle: this.layout.cast.snapForwardDeg,
          duration: this.layout.cast.snapMs,
          ease: 'Back.easeIn',
          onComplete: () => onRelease?.(),
        },
        { angle: 0, duration: this.layout.cast.recoverMs, ease: 'Sine.easeOut' },
      ],
    })
  }

  destroy(): void {
    EventBus.off(GameEvents.ROD_EQUIPPED, this.onRodEquipped)
    this.bobTween?.stop()
    this.headWobbleTween?.stop()
    this.root.destroy()
  }

  private readonly onRodEquipped = (payload: { rod: RodDefinition }): void => {
    this.equipRod(payload.rod)
  }

  private startBob(): void {
    if (!this.idleEnabled) {
      return
    }
    this.bobTween = this.scene.tweens.add({
      targets: this.root,
      y: this.baseRootY + this.layout.idle.bobAmplitude,
      duration: this.layout.idle.bobDurationMs,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  private startHeadWobble(): void {
    this.headPivot.setAngle(0)
    if (!this.idleEnabled) {
      return
    }
    this.headWobbleTween = this.scene.tweens.add({
      targets: this.headPivot,
      angle: this.layout.idle.headWobbleDeg,
      duration: this.layout.idle.headWobbleDurationMs,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }
}
