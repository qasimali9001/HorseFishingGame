import Phaser from 'phaser'
import { FishingConfig } from '../config/FishingConfig'
import { LureMotionConfig } from '../config/LureMotionConfig'
import { WorldConfig, worldRightX } from '../config/WorldConfig'
import { HorseTextures } from '../assets/HorseAssets'

/** How the lure is currently moving. */
export type LureMode = 'docked' | 'airborne' | 'sinking' | 'reeling' | 'hanging'

/** Per-frame inputs to the lure's motion (composed by the fishing system). */
export interface LureUpdateContext {
  reeling: boolean
  /** Effective max depth (world units below waterline) from PlayerStats. */
  maxDepth: number
  /** Reel-up speed multiplier from PlayerStats. */
  reelSpeedMultiplier: number
}

/**
 * The lure: the center of gameplay and the camera's follow target underwater.
 * Pure custom kinematics (no physics engine) -- mostly vertical, with a little
 * decaying horizontal momentum while reeling. It owns its world position +
 * velocity + hook reach, and nothing else (no horse/rod/line/economy).
 */
export class Lure {
  /** The visual whose transform IS the lure's world position. */
  readonly sprite: Phaser.GameObjects.Image
  private vx = 0
  private vy = 0
  private modeValue: LureMode = 'docked'
  /** While hanging: the X the lure sways around, and a time accumulator. */
  private hangAnchorX = 0
  private hangTime = 0
  /** A failed (tap) cast: pops up, never fishes; the FSM aborts it. */
  private failedCast = false
  /** Y the cast launched from, so a failed cast knows when it has flopped back. */
  private launchY = 0

  constructor(scene: Phaser.Scene) {
    this.sprite = scene.add
      .image(0, 0, HorseTextures.lure)
      .setOrigin(FishingConfig.lure.originX, FishingConfig.lure.originY)
      .setScale(FishingConfig.lure.scale)
      .setDepth(9)
      .setVisible(false)
  }

  get x(): number {
    return this.sprite.x
  }

  get y(): number {
    return this.sprite.y
  }

  /** Depth below the waterline (0 at/above surface). */
  get depth(): number {
    return Math.max(0, this.sprite.y - WorldConfig.waterlineY)
  }

  get mode(): LureMode {
    return this.modeValue
  }

  get hookRadius(): number {
    return FishingConfig.hookRadius
  }

  get isActive(): boolean {
    return this.modeValue !== 'docked'
  }

  /** True while a failed (tap) cast is in the air; the FSM aborts it on flop-back. */
  get isFailedCast(): boolean {
    return this.failedCast
  }

  /**
   * Fires the lure out of the rod tip at `speed` (world units/sec) along
   * `angleDeg` elevation above horizontal (forward = +x, up = -y). Gravity then
   * arcs it. `failed` marks a tap cast that should never enter the water.
   */
  launch(fromX: number, fromY: number, speed: number, angleDeg: number, failed: boolean): void {
    const rad = Phaser.Math.DegToRad(angleDeg)
    this.sprite.setPosition(fromX, fromY).setVisible(true)
    this.vx = Math.cos(rad) * speed
    this.vy = -Math.sin(rad) * speed
    this.modeValue = 'airborne'
    this.failedCast = failed
    this.launchY = fromY
  }

  /**
   * For a failed cast: true once it has arced back down past its launch height,
   * so the FSM can dock it and return to idle (it never enters the water).
   */
  failedCastFinished(): boolean {
    return this.failedCast && this.modeValue === 'airborne' && this.vy > 0 && this.sprite.y >= this.launchY
  }

  /** Called when the lure crosses the waterline going down. */
  enterWater(): void {
    if (this.modeValue === 'airborne') {
      this.modeValue = 'sinking'
    }
  }

  /** Reset to the rod (hidden) after a landing or a failed-cast flop. */
  dock(): void {
    this.modeValue = 'docked'
    this.vx = 0
    this.vy = 0
    this.failedCast = false
    this.sprite.setVisible(false)
  }

  /**
   * Integrates one frame. `reeling` only matters underwater; airborne flight
   * ignores it. The lure sinks until it reaches `ctx.maxDepth`, then hangs on a
   * taut line (gentle bob/sway) until reeled. Callers read `y`/`depth`/`mode`.
   */
  update(dtSec: number, ctx: LureUpdateContext): void {
    if (this.modeValue === 'docked') {
      return
    }

    const limitY = WorldConfig.waterlineY + Math.min(ctx.maxDepth, WorldConfig.maxDepth)

    if (this.modeValue === 'airborne') {
      // Airborne the lure arcs through the sky (y < 0 is above water), so the
      // floor is the sky top -- NOT the waterline. Horizontal momentum is the
      // launch velocity, never clamped/dragged, so the arc keeps its shape.
      this.vy += LureMotionConfig.lureGravity * dtSec
      const nextX = this.sprite.x + this.vx * dtSec
      const nextY = this.sprite.y + this.vy * dtSec
      this.sprite.x = Phaser.Math.Clamp(nextX, WorldConfig.worldLeftX, worldRightX)
      this.sprite.y = Phaser.Math.Clamp(nextY, -WorldConfig.skyHeight, limitY)
      return
    }

    if (ctx.reeling) {
      this.modeValue = 'reeling'
      this.vy = -LureMotionConfig.reelUpVelocity * ctx.reelSpeedMultiplier
      this.vx *= Math.pow(LureMotionConfig.horizontalMomentumRetentionWhileReeling, dtSec * 60)
      this.integrate(dtSec, limitY)
      return
    }

    // Not reeling: sink until the line runs out, then hang.
    const atLimit = this.sprite.y >= limitY - 0.5
    if (atLimit) {
      this.hang(dtSec, limitY)
      return
    }

    this.modeValue = 'sinking'
    this.vy = LureMotionConfig.sinkVelocity
    this.vx *= Math.pow(LureMotionConfig.horizontalDrag, dtSec * 60)
    this.integrate(dtSec, limitY)
  }

  /** Applies velocity underwater, clamping X to the world and Y to [waterline, limit]. */
  private integrate(dtSec: number, limitY: number): void {
    this.vx = Phaser.Math.Clamp(
      this.vx,
      -LureMotionConfig.maxHorizontalVelocity,
      LureMotionConfig.maxHorizontalVelocity,
    )
    const nextX = this.sprite.x + this.vx * dtSec
    const nextY = this.sprite.y + this.vy * dtSec
    this.sprite.x = Phaser.Math.Clamp(nextX, WorldConfig.worldLeftX, worldRightX)
    this.sprite.y = Phaser.Math.Clamp(nextY, WorldConfig.waterlineY, limitY)
  }

  /** Holds at the line limit with a soft bob + sway so it reads as alive. */
  private hang(dtSec: number, limitY: number): void {
    if (this.modeValue !== 'hanging') {
      this.modeValue = 'hanging'
      this.hangAnchorX = this.sprite.x
      this.hangTime = 0
      this.vx = 0
      this.vy = 0
    }
    this.hangTime += dtSec
    this.sprite.y = limitY + Math.sin(this.hangTime * LureMotionConfig.hangBobSpeed) * LureMotionConfig.hangBobAmplitude
    this.sprite.x = this.hangAnchorX + Math.sin(this.hangTime * LureMotionConfig.hangSwaySpeed) * LureMotionConfig.hangSwayAmplitude
  }
}
