import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/GameEvents'

export interface EconomySavePort {
  readonly money: number
  setMoney(money: number): void
}

/**
 * Owns the player's money. Selling happens here -- not in fish, lure, or the
 * scene -- and changes are announced via the EventBus so the UI stays
 * decoupled.
 */
export class EconomySystem {
  private moneyValue: number

  constructor(private readonly save?: EconomySavePort) {
    this.moneyValue = save?.money ?? 0
    EventBus.on(GameEvents.MONEY_STATE_REQUESTED, this.onMoneyStateRequested)
  }

  get money(): number {
    return this.moneyValue
  }

  destroy(): void {
    EventBus.off(GameEvents.MONEY_STATE_REQUESTED, this.onMoneyStateRequested)
  }

  canAfford(cost: number): boolean {
    return this.moneyValue >= cost
  }

  /** Adds a landed catch's value and announces the new balance. */
  sell(value: number): number {
    this.moneyValue += value
    this.commitMoneyChange()
    return this.moneyValue
  }

  /** Attempts to spend money; returns false if the player cannot afford it. */
  trySpend(cost: number): boolean {
    if (cost <= 0 || this.moneyValue < cost) {
      return false
    }
    this.moneyValue -= cost
    this.commitMoneyChange()
    return true
  }

  private commitMoneyChange(): void {
    this.save?.setMoney(this.moneyValue)
    this.emitMoney()
  }

  private emitMoney(): void {
    EventBus.emit(GameEvents.MONEY_CHANGED, { money: this.moneyValue })
  }

  private readonly onMoneyStateRequested = (): void => {
    this.emitMoney()
  }
}
