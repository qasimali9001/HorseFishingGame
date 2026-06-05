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
 * Owns current bait tier for the active session. Catch systems ask whether a
 * fish is hookable; upgraded bait is spent on a successful land, and
 * `upgradeFromFishSize` applies when a landed fish is chucked back.
 */
export class BaitSystem {
  private tierValue: BaitTier = BaitConfig.startingTier

  constructor() {
    EventBus.on(GameEvents.BAIT_STATE_REQUESTED, this.onBaitStateRequested)
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

  destroy(): void {
    EventBus.off(GameEvents.BAIT_STATE_REQUESTED, this.onBaitStateRequested)
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

  /** Upgraded bait is spent when a fish is successfully landed. */
  consumeOnCatch(): boolean {
    if (this.tierValue === BaitConfig.startingTier) {
      return false
    }
    this.tierValue = BaitConfig.startingTier
    this.emitChange()
    return true
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

  private readonly onBaitStateRequested = (): void => {
    this.emitChange()
  }
}
