import { InvestmentConfig } from '../config/InvestmentConfig'
import { getInvestmentById, ShopInvestments } from '../data/investmentData'
import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/GameEvents'
import type { ShopCatalogItemState } from '../types/ShopCatalogTypes'
import { resolveShopIconTextureKey } from '../utils/resolveShopIconTextureKey'
import type { EconomySystem } from './EconomySystem'
import type { ShopCatalogSavePort } from './ShopCatalogInventorySystem'

export interface InvestmentCatalogPort {
  getShopItemStates(): readonly ShopCatalogItemState[]
}

/**
 * Owns passive-income investments: shop purchases, payout ticks, and save
 * persistence via the investments catalog slot.
 */
export class InvestmentSystem implements InvestmentCatalogPort {
  private readonly ownedIds = new Set<string>()
  private payoutTimerMs = 0

  constructor(
    private readonly economy: EconomySystem,
    private readonly save?: ShopCatalogSavePort,
  ) {
    this.applySavedState()
    EventBus.on(GameEvents.SHOP_ITEM_PURCHASE_REQUESTED, this.onPurchaseRequested)
    EventBus.on(GameEvents.MONEY_CHANGED, this.onMoneyChanged)
  }

  destroy(): void {
    EventBus.off(GameEvents.SHOP_ITEM_PURCHASE_REQUESTED, this.onPurchaseRequested)
    EventBus.off(GameEvents.MONEY_CHANGED, this.onMoneyChanged)
  }

  getShopItemStates(): readonly ShopCatalogItemState[] {
    return ShopInvestments.map((investment) => this.toShopItemState(investment))
  }

  /** Grants passive income on the global payout interval. */
  update(dtSec: number): void {
    if (this.ownedIds.size === 0) {
      return
    }

    this.payoutTimerMs += dtSec * 1000
    if (this.payoutTimerMs < InvestmentConfig.payoutIntervalMs) {
      return
    }

    this.payoutTimerMs -= InvestmentConfig.payoutIntervalMs
    const payout = this.totalIncomePerTick()
    if (payout <= 0) {
      return
    }

    this.economy.sell(payout)
    EventBus.emit(GameEvents.INVESTMENT_PAYOUT, { amount: payout })
  }

  private totalIncomePerTick(): number {
    let total = 0
    for (const investmentId of this.ownedIds) {
      const investment = getInvestmentById(investmentId)
      if (investment) {
        total += investment.incomePerTick
      }
    }
    return total
  }

  private toShopItemState(investment: (typeof ShopInvestments)[number]): ShopCatalogItemState {
    const owned = this.ownedIds.has(investment.id)
    const intervalSec = InvestmentConfig.payoutIntervalMs / 1000
    return {
      id: investment.id,
      displayName: investment.displayName,
      description: investment.description,
      textureKey: investment.textureKey,
      iconTextureKey: resolveShopIconTextureKey(investment),
      cost: investment.cost,
      owned,
      equipped: false,
      affordable: !owned && investment.cost > 0 && this.economy.canAfford(investment.cost),
      statsSummary: `+$${investment.incomePerTick} every ${intervalSec}s`,
      itemKind: 'passive',
    }
  }

  private emitChanged(): void {
    EventBus.emit(GameEvents.SHOP_CATALOG_CHANGED, { catalogId: 'investments' })
  }

  private persist(): void {
    this.save?.setCatalogState('investments', {
      ownedIds: [...this.ownedIds],
      equippedId: '',
    })
  }

  private applySavedState(): void {
    const saved = this.save?.getCatalogState('investments')
    if (!saved) {
      return
    }

    for (const ownedId of saved.ownedIds) {
      if (getInvestmentById(ownedId)) {
        this.ownedIds.add(ownedId)
      }
    }
  }

  private readonly onPurchaseRequested = (payload: {
    catalogId: string
    itemId: string
  }): void => {
    if (payload.catalogId !== 'investments') {
      return
    }

    const investment = getInvestmentById(payload.itemId)
    if (!investment) {
      EventBus.emit(GameEvents.SHOP_PURCHASE_FEEDBACK, { message: 'Unknown investment.', tone: 'error' })
      return
    }

    if (this.ownedIds.has(investment.id)) {
      EventBus.emit(GameEvents.SHOP_PURCHASE_FEEDBACK, {
        message: `${investment.displayName} is already yours.`,
        tone: 'neutral',
      })
      this.emitChanged()
      return
    }

    if (!this.economy.trySpend(investment.cost)) {
      EventBus.emit(GameEvents.SHOP_PURCHASE_FEEDBACK, {
        message: `Not enough money for ${investment.displayName}.`,
        tone: 'error',
      })
      this.emitChanged()
      return
    }

    this.ownedIds.add(investment.id)
    this.persist()
    EventBus.emit(GameEvents.SHOP_ITEM_PURCHASED, {
      catalogId: 'investments',
      itemId: investment.id,
    })
    EventBus.emit(GameEvents.SHOP_PURCHASE_FEEDBACK, {
      message: `Invested in ${investment.displayName} for $${investment.cost}.`,
      tone: 'success',
    })
    this.emitChanged()
  }

  private readonly onMoneyChanged = (): void => {
    this.emitChanged()
  }
}
