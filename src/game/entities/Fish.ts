import Phaser from 'phaser'
import { FishConfig } from '../config/FishConfig'
import { WorldConfig } from '../config/WorldConfig'
import { FishBodySprite } from './FishBodySprite'
import { FishHookedPose } from './FishHookedPose'
import { FishOrientation } from './FishOrientation'
import type { FishDefinition, FishSwimBounds } from '../types/FishTypes'

export type FishMode = 'swimming' | 'hooked'

/**
 * One fish. Owns its own visual + swim pose + movement integration. While
 * swimming it drifts horizontally with a soft vertical wobble; FishAISystem may
 * steer it toward bait (see `applySteer`) or back home; once hooked it follows
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
  private readonly swimBounds: FishSwimBounds
  private readonly hookedMouthLead: number
  private readonly homeX: number
  private readonly homeY: number
  private baseY: number
  private wobbleTime = Math.random() * Math.PI * 2
  private hangTime = 0
  /** True while bait/hooked-fish AI is actively steering this fish. */
  private chaseUnlocked = false

  constructor(
    scene: Phaser.Scene,
    def: FishDefinition,
    x: number,
    y: number,
    dir: 1 | -1,
    swimBounds: FishSwimBounds = {
      minX: WorldConfig.worldLeftX,
      maxX: WorldConfig.worldLeftX + WorldConfig.worldWidth,
    },
  ) {
    this.def = def
    this.homeX = x
    this.homeY = y
    this.baseY = y
    this.swimSpeedValue = def.speed * FishConfig.speedMultiplier
    this.swimBounds = swimBounds
    this.vx = this.swimSpeedValue * dir
    this.hookedMouthLead = FishHookedPose.mouthLeadFromCenter(scene, def)

    // `facing` holds the art; scaleX flips it to match travel direction.
    this.facing = scene.add.container(0, 0)
    this.facing.add(FishBodySprite.create(scene, def))
    this.facing.scaleX = FishOrientation.scaleXForDirection(dir)

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

  get aggressionRadius(): number {
    return this.def.aggressionRadius
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

  setChasingStimulus(active: boolean): void {
    this.chaseUnlocked = active
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

  /** Recover from bait/hooked-fish aggro and drift back to the original path. */
  returnHome(dtSec: number): void {
    if (this.modeValue !== 'swimming') {
      return
    }

    const cfg = FishConfig.returnHome
    const dx = this.homeX - this.container.x
    if (Math.abs(dx) > cfg.horizontalTolerance) {
      const steerAlpha = 1 - Math.pow(1 - cfg.steerResponse, dtSec * 60)
      const desiredVx = (Math.sign(dx) || 1) * this.swimSpeedValue * cfg.speedScale
      this.vx = Phaser.Math.Linear(this.vx, desiredVx, steerAlpha)
    }

    const dy = this.homeY - this.baseY
    const baseYDelta = Phaser.Math.Clamp(dy, -cfg.verticalSpeed * dtSec, cfg.verticalSpeed * dtSec)
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
    this.enforcePatrolBounds()
    this.wobbleTime += dtSec * FishConfig.wobbleSpeed
    this.container.y = this.baseY + Math.sin(this.wobbleTime) * FishConfig.wobbleAmplitude
    this.facing.scaleX = FishOrientation.scaleXForVelocity(this.vx)
  }

  /** Instantly place mouth on the bait/hook point (used right when contact happens). */
  snapToHook(hookX: number, hookY: number): void {
    const target = FishHookedPose.bodyTargetAtHookFromLead(
      hookX,
      hookY,
      this.hookedMouthLead,
    )
    this.container.x = target.x
    this.container.y = target.y
    FishHookedPose.applyVisual(this.facing, 0)
  }

  /** Hooked fish tracks the bait/hook point; tighter follow while reeling upward. */
  followLure(hookX: number, hookY: number, dtSec: number, reeling = false): void {
    const pose = FishConfig.hookedPose
    const followLerp = reeling
      ? FishConfig.hookedFollowLerpWhileReeling
      : FishConfig.hookedFollowLerp
    const t = 1 - Math.pow(1 - followLerp, dtSec * 60)

    const target = FishHookedPose.bodyTargetAtHookFromLead(
      hookX,
      hookY,
      this.hookedMouthLead,
    )

    this.container.x = Phaser.Math.Linear(this.container.x, target.x, t)
    this.container.y = Phaser.Math.Linear(this.container.y, target.y, t)

    this.hangTime += dtSec
    const sway = Math.sin(this.hangTime * pose.hangSwaySpeed) * pose.hangSwayDeg
    FishHookedPose.applyVisual(this.facing, sway)
  }

  destroy(): void {
    this.container.destroy()
  }

  /**
   * Patrol walls apply during normal idle swim. Chasing bait/hooked fish may
   * leave the box; once aggro drops, returnHome + these walls keep fish inside
   * the editor-authored swim range.
   */
  private enforcePatrolBounds(): void {
    if (this.chaseUnlocked) {
      return
    }

    const { minX, maxX } = this.swimBounds
    const x = this.container.x

    if (x < minX) {
      this.container.x = minX
      if (this.vx < 0) {
        this.vx = Math.abs(this.vx)
      }
      return
    }

    if (x > maxX) {
      this.container.x = maxX
      if (this.vx > 0) {
        this.vx = -Math.abs(this.vx)
      }
      return
    }

    if (x <= minX && this.vx < 0) {
      this.container.x = minX
      this.vx = Math.abs(this.vx)
    } else if (x >= maxX && this.vx > 0) {
      this.container.x = maxX
      this.vx = -Math.abs(this.vx)
    }
  }
}
