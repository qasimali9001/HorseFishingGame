import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/GameEvents'
import type { Fish } from '../entities/Fish'
import type { FishSizeTier } from '../types/BaitTypes'
import type { BaitSystem } from './BaitSystem'
import type { EconomySystem } from './EconomySystem'

export interface PendingCatch {
  fishId: string
  displayName: string
  value: number
  sizeTier: FishSizeTier
}

/**
 * Owns the landed-catch decision point:
 * - queue landed fish for player decision
 * - sell immediately on explicit request
 * - on recast, chuck into bait upgrade (or auto-sell if chuck is disabled)
 */
export class CatchDecisionSystem {
  private pending: PendingCatch | null = null

  constructor(
    private readonly economy: EconomySystem,
    private readonly bait: BaitSystem,
  ) {}

  get hasPending(): boolean {
    return this.pending !== null
  }

  queueFromFish(fish: Fish): void {
    this.pending = {
      fishId: fish.def.id,
      displayName: fish.def.displayName,
      value: fish.value,
      sizeTier: fish.def.sizeTier,
    }
    EventBus.emit(GameEvents.CATCH_DECISION_REQUIRED, {
      fishId: this.pending.fishId,
      displayName: this.pending.displayName,
      value: this.pending.value,
      sizeTier: this.pending.sizeTier,
      canChuck: this.bait.canUpgradeFromFishSize(this.pending.sizeTier),
    })
  }

  sellPending(reason: 'hotkey' | 'auto'): boolean {
    if (!this.pending) {
      return false
    }
    const sold = this.pending
    this.economy.sell(sold.value)
    EventBus.emit(GameEvents.CATCH_SOLD, {
      fishId: sold.fishId,
      displayName: sold.displayName,
      value: sold.value,
      reason,
    })
    this.clearPending()
    return true
  }

  resolveOnRecast(): boolean {
    if (!this.pending) {
      return false
    }
    const fish = this.pending
    const upgrade = this.bait.upgradeFromFishSize(fish.sizeTier)
    if (upgrade) {
      EventBus.emit(GameEvents.CATCH_CHUCKED, {
        fishId: fish.fishId,
        displayName: fish.displayName,
        fishSizeTier: fish.sizeTier,
        previousBaitTier: upgrade.previousTier,
        nextBaitTier: upgrade.nextTier,
      })
      this.clearPending()
      return true
    }
    return this.sellPending('auto')
  }

  private clearPending(): void {
    this.pending = null
    EventBus.emit(GameEvents.CATCH_DECISION_CLEARED)
  }
}
