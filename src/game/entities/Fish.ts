import Phaser from 'phaser'
import { FishConfig } from '../config/FishConfig'
import { WorldConfig } from '../config/WorldConfig'
import type { FishDefinition } from '../types/FishTypes'

export type FishMode = 'swimming' | 'hooked'

/**
 * One fish. Owns its own visual + swim pose + movement integration. While
 * swimming it drifts horizontally with a soft vertical wobble; FishAISystem may
 * steer it toward bait (see `applySteer`); once hooked it follows
 * the lure. It knows nothing about spawning rules, collision, or economy.
 */
export class Fish {
  readonly def: FishDefinition
  private readonly container: Phaser.GameObjects.Container
  private readonly facing: Phaser.GameObjects.Container
  private modeValue: FishMode = 'swimming'
  private vx: number
  /** Chosen base swim speed magnitude (used by AI steering scales). */
  private readonly swimSpeedValue: number
  private baseY: number
  private wobbleTime = Math.random() * Math.PI * 2
  private hangTime = 0

  constructor(scene: Phaser.Scene, def: FishDefinition, x: number, y: number, dir: 1 | -1) {
    this.def = def
    this.baseY = y
    this.swimSpeedValue = Phaser.Math.Between(def.speedMin, def.speedMax)
    this.vx = this.swimSpeedValue * dir

    // `facing` holds the art (drawn pointing right) so we can flip via scaleX.
    this.facing = scene.add.container(0, 0)
    const outlineColor = 0x15313f
    const bodyOutline = scene.add.ellipse(
      0,
      0,
      def.radius * 2.65,
      def.radius * 1.82,
      outlineColor,
      0.95,
    )
    const tailOutline = scene.add.triangle(
      -def.radius * 1.32,
      0,
      0,
      0,
      def.radius * 1.05,
      -def.radius * 0.86,
      def.radius * 1.05,
      def.radius * 0.86,
      outlineColor,
      0.95,
    )
    const body = scene.add.ellipse(0, 0, def.radius * 2.4, def.radius * 1.6, def.color)
    const tail = scene.add.triangle(
      -def.radius * 1.2,
      0,
      0,
      0,
      def.radius * 0.9,
      -def.radius * 0.7,
      def.radius * 0.9,
      def.radius * 0.7,
      def.color,
    )
    const highlight = scene.add.ellipse(
      def.radius * 0.15,
      -def.radius * 0.34,
      def.radius * 0.9,
      def.radius * 0.24,
      0xffffff,
      0.28,
    )
    const eye = scene.add.circle(def.radius * 0.7, -def.radius * 0.25, Math.max(2, def.radius * 0.16), 0x1a1110)
    this.facing.add([tailOutline, bodyOutline, tail, body, highlight, eye])
    this.facing.scaleX = dir

    this.container = scene.add.container(x, y, [this.facing]).setDepth(FishConfig.renderDepth)
  }

  get x(): number {
    return this.container.x
  }

  get y(): number {
    return this.container.y
  }

  get radius(): number {
    return this.def.radius
  }

  get value(): number {
    return this.def.value
  }

  /** Base swim speed magnitude (world units / second). */
  get swimSpeed(): number {
    return this.swimSpeedValue
  }

  get isHooked(): boolean {
    return this.modeValue === 'hooked'
  }

  get canBeHooked(): boolean {
    return this.def.canBeHooked && this.modeValue === 'swimming'
  }

  setHooked(): void {
    this.modeValue = 'hooked'
    this.hangTime = 0
    this.container.setDepth(FishConfig.hookedRenderDepth)
  }

  /**
   * Apply AI steering for one frame. `steerAlpha` is the already dt-adjusted
   * lerp weight; `baseYDelta` shifts the swim line vertically (clamped to water).
   */
  applySteer(desiredVx: number, steerAlpha: number, baseYDelta: number): void {
    if (this.modeValue !== 'swimming') {
      return
    }
    this.vx = Phaser.Math.Linear(this.vx, desiredVx, steerAlpha)
    this.baseY = Phaser.Math.Clamp(
      this.baseY + baseYDelta,
      WorldConfig.waterlineY + 8,
      WorldConfig.waterlineY + WorldConfig.maxDepth,
    )
  }

  /** Swimming movement for one frame. */
  update(dtSec: number): void {
    if (this.modeValue !== 'swimming') {
      return
    }
    this.container.x += this.vx * dtSec
    this.wobbleTime += dtSec * FishConfig.wobbleSpeed
    this.container.y = this.baseY + Math.sin(this.wobbleTime) * FishConfig.wobbleAmplitude
    this.facing.scaleX = this.vx >= 0 ? 1 : -1
  }

  /** Instantly place mouth on hook (used right when contact happens). */
  snapToHook(lureX: number, lureY: number): void {
    const pose = FishConfig.hookedPose
    const mouthLead = this.def.radius * pose.mouthLeadRadiusScale
    this.container.x = lureX + pose.hookOffsetX
    this.container.y = lureY + pose.hookOffsetY + mouthLead
    this.facing.setAngle(pose.rotationDeg)
    this.facing.scaleX = 1
  }

  /** Hooked fish tracks hook; tighter follow while reeling upward. */
  followLure(lureX: number, lureY: number, dtSec: number, reeling = false): void {
    const pose = FishConfig.hookedPose
    const followLerp = reeling
      ? FishConfig.hookedFollowLerpWhileReeling
      : FishConfig.hookedFollowLerp
    const t = 1 - Math.pow(1 - followLerp, dtSec * 60)

    const hookX = lureX + pose.hookOffsetX
    const hookY = lureY + pose.hookOffsetY
    const mouthLead = this.def.radius * pose.mouthLeadRadiusScale
    const targetX = hookX
    const targetY = hookY + mouthLead

    this.container.x = Phaser.Math.Linear(this.container.x, targetX, t)
    this.container.y = Phaser.Math.Linear(this.container.y, targetY, t)

    this.hangTime += dtSec
    const sway = Math.sin(this.hangTime * pose.hangSwaySpeed) * pose.hangSwayDeg
    this.facing.setAngle(pose.rotationDeg + sway)
    this.facing.scaleX = 1
  }

  destroy(): void {
    this.container.destroy()
  }
}
