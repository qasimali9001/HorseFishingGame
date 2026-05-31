import { ShopCategories, ShopUpgrades } from '../data/shopData'
import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/GameEvents'
import type { ShopEffectId, ShopStateSnapshot, ShopUpgradeDefinition, ShopUpgradeState } from '../types/ShopTypes'
import { EconomySystem } from './EconomySystem'
import { UpgradeSystem } from './UpgradeSystem'

/**
 * Handles shop purchase requests and emits read-only shop snapshots for UI.
 */
export class ShopSystem {
  private readonly upgrades = new UpgradeSystem(ShopUpgrades)
  private purchaseInFlight = false

  constructor(private readonly economy: EconomySystem) {
    EventBus.on(GameEvents.SHOP_PURCHASE_REQUESTED, this.onPurchaseRequested)
    EventBus.on(GameEvents.SHOP_STATE_REQUESTED, this.onStateRequested)
    EventBus.on(GameEvents.MONEY_CHANGED, this.onMoneyChanged)
    this.emitState()
  }

  destroy(): void {
    EventBus.off(GameEvents.SHOP_PURCHASE_REQUESTED, this.onPurchaseRequested)
    EventBus.off(GameEvents.SHOP_STATE_REQUESTED, this.onStateRequested)
    EventBus.off(GameEvents.MONEY_CHANGED, this.onMoneyChanged)
  }

  getContribution(effectId: ShopEffectId): number {
    return this.upgrades.getContribution(effectId)
  }

  private emitState(): void {
    const snapshot: ShopStateSnapshot = {
      money: this.economy.money,
      categories: ShopCategories,
      upgrades: ShopUpgrades.map((definition) => this.toUpgradeState(definition)),
    }
    EventBus.emit(GameEvents.SHOP_STATE_CHANGED, snapshot)
  }

  private toUpgradeState(definition: ShopUpgradeDefinition): ShopUpgradeState {
    const level = this.upgrades.getLevel(definition.id)
    const isMaxed = level >= definition.maxLevel
    const nextCost = isMaxed ? 0 : this.upgrades.getNextCost(definition.id)
    return {
      id: definition.id,
      categoryId: definition.categoryId,
      title: definition.title,
      description: definition.description,
      level,
      maxLevel: definition.maxLevel,
      nextCost,
      isMaxed,
      affordable: !isMaxed && this.economy.canAfford(nextCost),
      effectText: this.effectText(definition),
    }
  }

  private effectText(definition: ShopUpgradeDefinition): string {
    switch (definition.effectId) {
      case 'castPower':
        return `+${Math.round(definition.effectPerLevel * 100)}% cast power per level`
      case 'reelSpeed':
        return `+${Math.round(definition.effectPerLevel * 100)}% reel speed per level`
      case 'maxDepth':
        return `+${Math.round(definition.effectPerLevel)} max depth per level`
      default:
        return 'Upgrade effect'
    }
  }

  private readonly onStateRequested = (): void => {
    this.emitState()
  }

  private readonly onMoneyChanged = (): void => {
    if (this.purchaseInFlight) {
      return
    }
    this.emitState()
  }

  private readonly onPurchaseRequested = (payload: { upgradeId: string }): void => {
    const definition = this.upgrades.getDefinition(payload.upgradeId)
    if (!definition) {
      EventBus.emit(GameEvents.SHOP_PURCHASE_FEEDBACK, { message: 'Unknown upgrade.', tone: 'error' })
      return
    }

    if (this.upgrades.isMaxed(definition.id)) {
      EventBus.emit(GameEvents.SHOP_PURCHASE_FEEDBACK, {
        message: `${definition.title} is already maxed.`,
        tone: 'neutral',
      })
      this.emitState()
      return
    }

    const cost = this.upgrades.getNextCost(definition.id)
    this.purchaseInFlight = true
    if (!this.economy.trySpend(cost)) {
      this.purchaseInFlight = false
      EventBus.emit(GameEvents.SHOP_PURCHASE_FEEDBACK, { message: `Not enough money for ${definition.title}.`, tone: 'error' })
      this.emitState()
      return
    }

    this.upgrades.tryLevelUp(definition.id)
    this.purchaseInFlight = false
    EventBus.emit(GameEvents.SHOP_PURCHASE_FEEDBACK, {
      message: `Bought ${definition.title} for $${cost}.`,
      tone: 'success',
    })
    this.emitState()
  }
}

