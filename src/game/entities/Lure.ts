import Phaser from 'phaser'
import { FishingConfig } from '../config/FishingConfig'
import { LureMotionConfig } from '../config/LureMotionConfig'
import { WorldConfig, worldRightX } from '../config/WorldConfig'
import { DefaultLureId, getShopLureById } from '../data/lureData'
import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/GameEvents'
import type { LureDefinition, LureStats } from '../types/LureTypes'

/** How the lure is currently moving. */
export type LureMode = 'docked' | 'airborne' | 'sinking' | 'reeling' | 'hanging'

/** Per-frame inputs to the lure's motion (composed by the fishing system). */
export interface LureUpdateContext {
  reeling: boolean
  /** Rod tip world position used as reel-in target. */
  reelTargetX: number
  reelTargetY: number
  /** Max world Y reachable this frame from line-length constraint. */
  maxReachY: number
  /** Whether the line is currently taut at the lure position. */
  isTaut: boolean
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
  private readonly baitVisual: Phaser.GameObjects.Arc
  private vx = 0
  private vy = 0
  private modeValue: LureMode = 'docked'
  /** While hanging: the X the lure sways around, and a time accumulator. */
  private hangAnchorX = 0
  private hangTime = 0
  private showBaitMarker = true
  private definition: LureDefinition = getShopLureById(DefaultLureId)!

  constructor(scene: Phaser.Scene) {
    this.sprite = scene.add
      .image(0, 0, this.definition.textureKey)
      .setOrigin(FishingConfig.lure.originX, FishingConfig.lure.originY)
      .setScale(FishingConfig.lure.scale)
      .setDepth(9)
      .setVisible(false)
    this.baitVisual = scene.add
      .circle(0, 0, FishingConfig.baitVisual.radius, FishingConfig.baitVisual.color)
      .setDepth(10)
      .setAlpha(FishingConfig.baitVisual.alpha)
      .setVisible(false)
    EventBus.on(GameEvents.LURE_EQUIPPED, this.onLureEquipped)
  }

  /** Lure-derived stats, read by the fishing system. */
  get lureStats(): LureStats {
    return this.definition
  }

  equipLure(definition: LureDefinition): void {
    this.definition = definition
    this.sprite.setTexture(definition.textureKey)
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

  setBaitColor(color: number): void {
    this.baitVisual.setFillStyle(color)
  }

  /** Hide bait marker while a fish is on the hook; restore when line is bait-only again. */
  setBaitVisible(visible: boolean): void {
    this.showBaitMarker = visible
    if (!visible) {
      this.baitVisual.setVisible(false)
      return
    }
    if (this.isActive) {
      this.syncBaitVisual()
      this.baitVisual.setVisible(true)
    }
  }

  /**
   * Fires the lure out of the rod tip with explicit world-space velocity
   * components. Gravity then arcs it until water entry.
   */
  launch(fromX: number, fromY: number, velocityX: number, velocityY: number): void {
    this.sprite.setPosition(fromX, fromY).setVisible(true)
    this.syncBaitVisual()
    this.baitVisual.setVisible(this.showBaitMarker)
    this.vx = velocityX
    this.vy = velocityY
    this.modeValue = 'airborne'
  }

  /** Called when the lure crosses the waterline going down. */
  enterWater(): void {
    if (this.modeValue === 'airborne') {
      this.modeValue = 'sinking'
    }
  }

  /** Reset to the rod (hidden) after a landing. */
  dock(): void {
    this.modeValue = 'docked'
    this.vx = 0
    this.vy = 0
    this.sprite.setVisible(false)
    this.baitVisual.setVisible(false)
    this.showBaitMarker = true
  }

  /**
   * Integrates one frame. `reeling` only matters underwater; airborne flight
   * ignores it. The lure sinks until it reaches `ctx.maxReachY`, then hangs on a
   * taut line (gentle bob/sway) until reeled. Callers read `y`/`depth`/`mode`.
   */
  update(dtSec: number, ctx: LureUpdateContext): void {
    if (this.modeValue === 'docked') {
      return
    }

    const limitY = Phaser.Math.Clamp(
      ctx.maxReachY,
      WorldConfig.waterlineY,
      WorldConfig.waterlineY + WorldConfig.maxDepth,
    )

    if (this.modeValue === 'airborne') {
      // Airborne the lure arcs through the sky (y < 0 is above water), so the
      // floor is the sky top -- NOT the waterline. Horizontal momentum is the
      // launch velocity, never clamped/dragged, so the arc keeps its shape.
      this.vy += LureMotionConfig.lureGravity * dtSec
      const nextX = this.sprite.x + this.vx * dtSec
      const nextY = this.sprite.y + this.vy * dtSec
      this.sprite.x = Phaser.Math.Clamp(nextX, WorldConfig.worldLeftX, worldRightX)
      this.sprite.y = Phaser.Math.Clamp(nextY, -WorldConfig.skyHeight, limitY)
      this.syncBaitVisual()
      return
    }

    if (ctx.reeling) {
      this.modeValue = 'reeling'
      const dx = ctx.reelTargetX - this.sprite.x
      const dy = ctx.reelTargetY - this.sprite.y
      const distance = Math.hypot(dx, dy)
      if (distance > 0.001) {
        const pullSpeed = LureMotionConfig.reelUpVelocity * ctx.reelSpeedMultiplier
        const desiredVx = (dx / distance) * pullSpeed
        const desiredVy = (dy / distance) * pullSpeed
        const steerAlpha =
          1 - Math.pow(1 - LureMotionConfig.reelDirectionResponse, dtSec * 60)
        this.vx = Phaser.Math.Linear(this.vx, desiredVx, steerAlpha)
        this.vy = Phaser.Math.Linear(this.vy, desiredVy, steerAlpha)
      } else {
        this.vx = 0
        this.vy = 0
      }

      // Keep some decaying carry while reeling so it doesn't feel rigid.
      this.vx *= Math.pow(LureMotionConfig.horizontalMomentumRetentionWhileReeling, dtSec * 60)
      this.integrate(dtSec, limitY)
      return
    }

    // Not reeling: sink until the line runs out, then hang.
    const atLimit = ctx.isTaut
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
    this.syncBaitVisual()
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
    this.syncBaitVisual()
  }

  private syncBaitVisual(): void {
    if (!this.showBaitMarker) {
      return
    }
    this.baitVisual.x = this.sprite.x + FishingConfig.baitVisual.offsetX
    this.baitVisual.y = this.sprite.y + FishingConfig.baitVisual.offsetY
  }

  private readonly onLureEquipped = (payload: { lure: LureDefinition }): void => {
    this.equipLure(payload.lure)
  }
}
