import { PlayerStatsConfig } from '../config/PlayerStatsConfig'
import type { RodStats } from '../types/RodTypes'

/** Anything that can report the currently-equipped rod's stats. */
export interface RodStatsProvider {
  readonly rodStats: RodStats
}

/** Anything that can provide aggregated upgrade contributions by effect id. */
export interface UpgradeContributionProvider {
  getContribution(effectId: 'castPower' | 'reelSpeed' | 'maxDepth'): number
}

/**
 * The single read-time composer of effective player stats:
 *
 *   effective = base (config) + equipped rod bonus + upgrade levels
 *
 * Gameplay systems read from here instead of hardcoding numbers, so when the
 * upgrade system arrives it only has to feed `upgradeLevels` -- nothing
 * downstream changes. This is the clean stat seam the old project lacked.
 */
export class PlayerStats {
  constructor(
    private readonly rodProvider: RodStatsProvider,
    private readonly upgrades?: UpgradeContributionProvider,
  ) {}

  get maxDepth(): number {
    return (
      PlayerStatsConfig.baseMaxDepth +
      this.rodProvider.rodStats.maxDepthBonus +
      this.upgradeContribution('maxDepth')
    )
  }

  get reelSpeedMultiplier(): number {
    return (
      PlayerStatsConfig.baseReelSpeedMultiplier *
      this.rodProvider.rodStats.reelSpeedMultiplier *
      (1 + this.upgradeContribution('reelSpeed'))
    )
  }

  get castPowerMultiplier(): number {
    return (
      PlayerStatsConfig.baseCastPowerMultiplier *
      this.rodProvider.rodStats.castPowerMultiplier *
      (1 + this.upgradeContribution('castPower'))
    )
  }

  /**
   * Contribution from purchased upgrades. With no upgrade system yet, every
   * level is 0, so stats currently equal base + rod bonus. When the upgrade
   * system lands it will scale these levels by per-level effect data -- the
   * call sites above stay unchanged.
   */
  private upgradeContribution(effectId: string): number {
    if (!this.upgrades) {
      return 0
    }
    if (effectId === 'castPower' || effectId === 'reelSpeed' || effectId === 'maxDepth') {
      return this.upgrades.getContribution(effectId)
    }
    return 0
  }
}
