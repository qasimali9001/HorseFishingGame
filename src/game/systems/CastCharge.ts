import Phaser from 'phaser'
import { CastChargeConfig } from '../config/CastChargeConfig'

/** The resolved launch parameters for one cast. */
export interface CastSolution {
  /** Launch speed (world units/sec). */
  speed: number
  /** Elevation angle above horizontal, in degrees (forward = +x, up = -y). */
  angleDeg: number
  /** A failed cast (tap): it pops up and flops back without entering the water. */
  failed: boolean
}

/**
 * Pure resolver from charge time -> launch parameters. Holds the hold->angle
 * interpolation so neither the config (constants only) nor the state machine
 * (orchestration only) owns this math. No Phaser scene state, no side effects.
 */
export class CastCharge {
  /**
   * @param holdMs            how long the player held before releasing
   * @param castPowerMultiplier  scales launch speed (from PlayerStats / rod)
   */
  static resolve(holdMs: number, castPowerMultiplier: number): CastSolution {
    if (holdMs <= CastChargeConfig.clickThresholdMs) {
      return {
        speed: CastChargeConfig.failedLaunchSpeed * castPowerMultiplier,
        angleDeg: CastChargeConfig.failedAngleDeg,
        failed: true,
      }
    }

    const clampedHold = Math.min(holdMs, CastChargeConfig.maxChargeMs)
    return {
      speed: CastChargeConfig.baseLaunchSpeed * castPowerMultiplier,
      angleDeg: CastCharge.angleForHold(clampedHold),
      failed: false,
    }
  }

  /** Linear interpolation across the hold->angle breakpoints, clamped to ends. */
  private static angleForHold(holdMs: number): number {
    const points = CastChargeConfig.holdToAngleDeg
    if (holdMs <= points[0].holdMs) {
      return points[0].angleDeg
    }
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const next = points[i]
      if (holdMs <= next.holdMs) {
        const t = (holdMs - prev.holdMs) / (next.holdMs - prev.holdMs)
        return Phaser.Math.Linear(prev.angleDeg, next.angleDeg, t)
      }
    }
    return points[points.length - 1].angleDeg
  }
}
