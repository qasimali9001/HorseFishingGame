import { BaitConfig } from '../config/BaitConfig'
import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/GameEvents'
import type { BaitTier, FishSizeTier } from '../types/BaitTypes'

export interface BaitUpgradeResult {
  previousTier: BaitTier
  nextTier: BaitTier
  changed: boolean
}

/**
 * Owns current bait tier and progression. Catch systems ask this module whether
 * a fish is hookable and call `upgradeFromFishSize` when a landed fish is
 * chucked back into the water.
 */
export class BaitSystem {
  private tierValue: BaitTier = BaitConfig.startingTier

  constructor() {
    this.emitChange()
  }

  get tier(): BaitTier {
    return this.tierValue
  }

  get color(): number {
    return BaitConfig.visuals[this.tierValue].color
  }

  get label(): string {
    return BaitConfig.visuals[this.tierValue].label
  }

  canHook(requiredTier: BaitTier): boolean {
    return this.rank(this.tierValue) >= this.rank(requiredTier)
  }

  canUpgradeFromFishSize(sizeTier: FishSizeTier): boolean {
    return BaitConfig.chuckUpgradeByFishSize[sizeTier] !== null
  }

  upgradeFromFishSize(sizeTier: FishSizeTier): BaitUpgradeResult | null {
    const nextTier = BaitConfig.chuckUpgradeByFishSize[sizeTier]
    if (!nextTier) {
      return null
    }
    const previousTier = this.tierValue
    this.tierValue = nextTier
    const result: BaitUpgradeResult = {
      previousTier,
      nextTier,
      changed: previousTier !== nextTier,
    }
    this.emitChange()
    return result
  }

  private rank(tier: BaitTier): number {
    return BaitConfig.tiers.indexOf(tier)
  }

  private emitChange(): void {
    EventBus.emit(GameEvents.BAIT_CHANGED, {
      baitTier: this.tierValue,
      color: this.color,
      label: this.label,
    })
  }
}
