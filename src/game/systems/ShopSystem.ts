import { ShopCategories } from '../data/shopData'
import {
  BoatPlaceholders,
  InvestmentPlaceholders,
  LurePlaceholders,
  RodPlaceholders,
} from '../data/placeholderCatalogData'
import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/GameEvents'
import type { ShopCatalogSectionState, ShopStateSnapshot } from '../types/ShopTypes'
import type { EconomySystem } from './EconomySystem'
import type { ShopCatalogSavePort } from './ShopCatalogInventorySystem'
import { ShopCatalogInventorySystem } from './ShopCatalogInventorySystem'
import { createLureCatalogInventory, createRodCatalogInventory } from './shopCatalogInventories'
import type { InvestmentCatalogPort } from './InvestmentSystem'

/**
 * Emits read-only shop snapshots for the UI and routes catalog purchases.
 */
export class ShopSystem {
  private readonly rods: ShopCatalogInventorySystem<(typeof import('../data/rodData').ShopRods)[number]>
  private readonly lures: ShopCatalogInventorySystem<(typeof import('../data/lureData').ShopLures)[number]>
  private readonly investments: InvestmentCatalogPort

  constructor(
    private readonly economy: EconomySystem,
    persistence: ShopCatalogSavePort | undefined,
    investments: InvestmentCatalogPort,
  ) {
    this.rods = createRodCatalogInventory(economy, persistence)
    this.lures = createLureCatalogInventory(economy, persistence)
    this.investments = investments

    EventBus.on(GameEvents.SHOP_STATE_REQUESTED, this.onStateRequested)
    EventBus.on(GameEvents.MONEY_CHANGED, this.onMoneyChanged)
    EventBus.on(GameEvents.SHOP_CATALOG_CHANGED, this.onCatalogChanged)
    this.emitState()
  }

  destroy(): void {
    EventBus.off(GameEvents.SHOP_STATE_REQUESTED, this.onStateRequested)
    EventBus.off(GameEvents.MONEY_CHANGED, this.onMoneyChanged)
    EventBus.off(GameEvents.SHOP_CATALOG_CHANGED, this.onCatalogChanged)
    this.rods.destroy()
    this.lures.destroy()
  }

  private emitState(): void {
    const snapshot: ShopStateSnapshot = {
      money: this.economy.money,
      categories: ShopCategories,
      catalogs: {
        rods: this.buildCatalogSection(this.rods.getShopItemStates(), RodPlaceholders, 'rod'),
        boats: this.buildCatalogSection([], BoatPlaceholders, 'boat'),
        lures: this.buildCatalogSection(this.lures.getShopItemStates(), LurePlaceholders, 'lure'),
        investments: this.buildCatalogSection(
          this.investments.getShopItemStates(),
          InvestmentPlaceholders,
          'investment',
        ),
      },
    }
    EventBus.emit(GameEvents.SHOP_STATE_CHANGED, snapshot)
  }

  private buildCatalogSection(
    items: ShopCatalogSectionState['items'],
    placeholders: ShopCatalogSectionState['placeholders'],
    placeholderKind: ShopCatalogSectionState['placeholderKind'],
  ): ShopCatalogSectionState {
    return { items, placeholders, placeholderKind }
  }

  private readonly onStateRequested = (): void => {
    this.emitState()
  }

  private readonly onMoneyChanged = (): void => {
    this.emitState()
  }

  private readonly onCatalogChanged = (): void => {
    this.emitState()
  }
}
