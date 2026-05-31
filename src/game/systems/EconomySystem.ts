import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/GameEvents'

/**
 * Owns the player's money. Selling happens here -- not in fish, lure, or the
 * scene -- and changes are announced via the EventBus so the UI stays
 * decoupled.
 */
export class EconomySystem {
  private moneyValue = 0

  get money(): number {
    return this.moneyValue
  }

  canAfford(cost: number): boolean {
    return this.moneyValue >= cost
  }

  /** Adds a landed catch's value and announces the new balance. */
  sell(value: number): number {
    this.moneyValue += value
    EventBus.emit(GameEvents.MONEY_CHANGED, { money: this.moneyValue })
    return this.moneyValue
  }

  /** Attempts to spend money; returns false if the player cannot afford it. */
  trySpend(cost: number): boolean {
    if (cost <= 0 || this.moneyValue < cost) {
      return false
    }
    this.moneyValue -= cost
    EventBus.emit(GameEvents.MONEY_CHANGED, { money: this.moneyValue })
    return true
  }
}
