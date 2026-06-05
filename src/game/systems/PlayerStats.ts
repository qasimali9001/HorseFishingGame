import { PlayerStatsConfig } from '../config/PlayerStatsConfig'
import type { RodStats } from '../types/RodTypes'
import type { LureStats } from '../types/LureTypes'

/** Anything that can report the currently-equipped rod's stats. */
export interface RodStatsProvider {
  readonly rodStats: RodStats
}

/** Anything that can report the currently-equipped lure's stats. */
export interface LureStatsProvider {
  readonly lureStats: LureStats
}

/**
 * The single read-time composer of effective player stats:
 *
 *   effective = base (config) + equipped rod/lure bonuses
 *
 * Gameplay systems read from here instead of hardcoding numbers, so when the
 * upgrade system arrives it only has to feed `upgradeLevels` -- nothing
 * downstream changes. This is the clean stat seam the old project lacked.
 */
export class PlayerStats {
  constructor(
    private readonly rodProvider: RodStatsProvider,
    private readonly lureProvider: LureStatsProvider,
  ) {}

  get maxDepth(): number {
    return (
      PlayerStatsConfig.baseMaxDepth +
      this.rodProvider.rodStats.maxDepthBonus +
      this.lureProvider.lureStats.maxDepthBonus
    )
  }

  get reelSpeedMultiplier(): number {
    return (
      PlayerStatsConfig.baseReelSpeedMultiplier * this.rodProvider.rodStats.reelSpeedMultiplier
    )
  }

  get castPowerMultiplier(): number {
    return (
      PlayerStatsConfig.baseCastPowerMultiplier * this.rodProvider.rodStats.castPowerMultiplier
    )
  }

  get sinkSpeedMultiplier(): number {
    return this.lureProvider.lureStats.sinkSpeedMultiplier
  }
}
