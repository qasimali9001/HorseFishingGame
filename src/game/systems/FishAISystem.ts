import Phaser from 'phaser'
import { FishConfig } from '../config/FishConfig'
import type { Fish } from '../entities/Fish'

export interface FishAIContext {
  lureX: number
  lureY: number
  /** Only react to the lure while it is actually fishing underwater. */
  lureActive: boolean
}

/**
 * Drives a deliberately simple bait attraction model:
 *   - every free-swimming fish is attracted to the lure when close enough
 *   - bigger fish have a larger reaction radius and stronger pull
 *
 * This keeps the prototype readable without per-species AI branches. Future
 * behaviors can layer on top once the basic fishing loop feels right.
 * Integration itself stays in the Fish entity (`applySteer` + `update`).
 */
export class FishAISystem {
  update(dtSec: number, fish: readonly Fish[], ctx: FishAIContext): void {
    const attraction = FishConfig.baitAttraction
    const steerAlpha = 1 - Math.pow(1 - attraction.steerResponse, dtSec * 60)

    for (const f of fish) {
      if (f.isHooked) {
        f.update(dtSec)
        continue
      }

      if (ctx.lureActive) {
        const dx = ctx.lureX - f.x
        const dy = ctx.lureY - f.y
        const dist = Math.hypot(dx, dy)
        const reactionRadius = this.reactionRadius(f.radius)
        if (dist <= reactionRadius && dist > 0.001) {
          this.steerTowardBait(f, dx, dy, steerAlpha, dtSec)
        }
      }

      f.update(dtSec)
    }
  }

  /** Steers a fish toward bait; larger fish steer harder. */
  private steerTowardBait(
    fish: Fish,
    dx: number,
    dy: number,
    steerAlpha: number,
    dtSec: number,
  ): void {
    const aggression = this.aggressionForSize(fish.radius)
    const attraction = FishConfig.baitAttraction
    const horizontalDir = Math.sign(dx) || 1
    const speedScale = Phaser.Math.Linear(
      attraction.minSpeedScale,
      attraction.maxSpeedScale,
      aggression,
    )
    const desiredVx = horizontalDir * fish.swimSpeed * speedScale

    const verticalSpeed = Phaser.Math.Linear(
      attraction.minVerticalSpeed,
      attraction.maxVerticalSpeed,
      aggression,
    )
    const verticalDir = Math.sign(dy) || 1
    const baseYDelta = verticalDir * verticalSpeed * dtSec

    fish.applySteer(desiredVx, steerAlpha, Phaser.Math.Clamp(baseYDelta, -Math.abs(dy), Math.abs(dy)))
  }

  private reactionRadius(fishRadius: number): number {
    const attraction = FishConfig.baitAttraction
    return attraction.baseRadius + fishRadius * attraction.radiusPerFishSize
  }

  private aggressionForSize(fishRadius: number): number {
    const attraction = FishConfig.baitAttraction
    return Phaser.Math.Clamp(
      (fishRadius - attraction.minAggressiveRadius) /
        (attraction.maxAggressiveRadius - attraction.minAggressiveRadius),
      0,
      1,
    )
  }
}
