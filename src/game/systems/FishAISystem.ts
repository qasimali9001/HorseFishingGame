import Phaser from 'phaser'
import { FishConfig } from '../config/FishConfig'
import { canEatFishSize } from '../utils/FishSizeRank'
import type { Fish } from '../entities/Fish'

export interface FishAIContext {
  lureX: number
  lureY: number
  /** Only react to the lure while it is actually fishing underwater. */
  lureActive: boolean
  /** Other fish can also react to the currently caught fish. */
  hookedFish: Fish | null
}

/**
 * Drives a deliberately simple bait attraction model:
 *   - every free-swimming fish is attracted to bait when close enough
 *   - larger fish can also chase smaller fish once they are hooked
 *   - each species owns its detection radius (`aggressionRadius` in fishData)
 *
 * This keeps the prototype readable without per-species AI branches. Future
 * behaviors can layer on top once the basic fishing loop feels right.
 * Integration itself stays in the Fish entity (`applySteer` / `returnHome`).
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

      const target = this.closestStimulus(f, ctx)
      if (target) {
        this.steerTowardBait(f, target.dx, target.dy, steerAlpha, dtSec)
      } else {
        f.returnHome(dtSec)
      }

      f.update(dtSec)
    }
  }

  /** Steers a fish toward bait or a hooked fish; larger fish steer harder. */
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

  private closestStimulus(
    fish: Fish,
    ctx: FishAIContext,
  ): { dx: number; dy: number; dist: number } | null {
    const candidates: Array<{ dx: number; dy: number; dist: number }> = []
    if (ctx.lureActive) {
      const dx = ctx.lureX - fish.x
      const dy = ctx.lureY - fish.y
      candidates.push({ dx, dy, dist: Math.hypot(dx, dy) })
    }
    if (ctx.hookedFish && this.canEatHookedFish(fish, ctx.hookedFish)) {
      const dx = ctx.hookedFish.x - fish.x
      const dy = ctx.hookedFish.y - fish.y
      candidates.push({ dx, dy, dist: Math.hypot(dx, dy) })
    }

    const inRange = candidates
      .filter((candidate) => candidate.dist <= fish.aggressionRadius && candidate.dist > 0.001)
      .sort((a, b) => a.dist - b.dist)
    return inRange[0] ?? null
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

  private canEatHookedFish(predator: Fish, prey: Fish): boolean {
    return canEatFishSize(predator.def.sizeTier, prey.def.sizeTier)
  }
}
