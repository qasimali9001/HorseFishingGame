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

  /** Adds a landed catch's value and announces the new balance. */
  sell(value: number): number {
    this.moneyValue += value
    EventBus.emit(GameEvents.MONEY_CHANGED, { money: this.moneyValue })
    return this.moneyValue
  }
}
