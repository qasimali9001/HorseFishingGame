import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/GameEvents'
import type { ShopCatalogId, ShopCatalogItemState } from '../types/ShopCatalogTypes'
import { resolveShopIconTextureKey } from '../utils/resolveShopIconTextureKey'
import type { EconomySystem } from './EconomySystem'
import type { CatalogSaveState } from './GameSaveSystem'

export interface ShopCatalogItemDefinition {
  id: string
  displayName: string
  description: string
  textureKey: string
  /** Optional square shop-row icon; falls back to textureKey when omitted. */
  shopIconKey?: string
  cost: number
  starterOwned?: boolean
}

export interface ShopCatalogInventoryOptions<TItem extends ShopCatalogItemDefinition> {
  catalogId: ShopCatalogId
  items: readonly TItem[]
  defaultItemId: string
  getById: (itemId: string) => TItem | undefined
  statsSummary: (item: TItem) => string
  equippedEvent: string
  toEquippedPayload: (item: TItem) => unknown
  persistence?: ShopCatalogSavePort
}

export interface ShopCatalogSavePort {
  getCatalogState(catalogId: ShopCatalogId): CatalogSaveState | undefined
  setCatalogState(catalogId: ShopCatalogId, state: CatalogSaveState): void
}

/**
 * Generic owned/equipped catalog for shop tabs (rods, lures, etc.).
 */
export class ShopCatalogInventorySystem<TItem extends ShopCatalogItemDefinition> {
  private readonly ownedIds = new Set<string>()
  private equippedId: string

  constructor(
    private readonly economy: EconomySystem,
    private readonly options: ShopCatalogInventoryOptions<TItem>,
  ) {
    this.equippedId = options.defaultItemId
    for (const item of options.items) {
      if (item.starterOwned) {
        this.ownedIds.add(item.id)
      }
    }
    this.applySavedState()

    EventBus.on(GameEvents.SHOP_ITEM_PURCHASE_REQUESTED, this.onPurchaseRequested)
    EventBus.on(GameEvents.SHOP_ITEM_EQUIP_REQUESTED, this.onEquipRequested)
    EventBus.on(GameEvents.MONEY_CHANGED, this.onMoneyChanged)
    this.emitEquipped()
  }

  destroy(): void {
    EventBus.off(GameEvents.SHOP_ITEM_PURCHASE_REQUESTED, this.onPurchaseRequested)
    EventBus.off(GameEvents.SHOP_ITEM_EQUIP_REQUESTED, this.onEquipRequested)
    EventBus.off(GameEvents.MONEY_CHANGED, this.onMoneyChanged)
  }

  getShopItemStates(): readonly ShopCatalogItemState[] {
    return this.options.items.map((item) => this.toShopItemState(item))
  }

  /** Dev cheat: mark every catalog row as owned without spending money. */
  debugUnlockAll(): void {
    for (const item of this.options.items) {
      this.ownedIds.add(item.id)
    }
    this.persist()
    this.emitChanged()
  }

  private toShopItemState(item: TItem): ShopCatalogItemState {
    const owned = this.ownedIds.has(item.id)
    const equipped = this.equippedId === item.id
    return {
      id: item.id,
      displayName: item.displayName,
      description: item.description,
      textureKey: item.textureKey,
      iconTextureKey: resolveShopIconTextureKey(item),
      cost: item.cost,
      owned,
      equipped,
      affordable: !owned && item.cost > 0 && this.economy.canAfford(item.cost),
      statsSummary: this.options.statsSummary(item),
      itemKind: 'equippable',
    }
  }

  private emitEquipped(): void {
    const item = this.options.getById(this.equippedId) ?? this.options.items[0]
    EventBus.emit(this.options.equippedEvent, this.options.toEquippedPayload(item))
  }

  private emitChanged(): void {
    EventBus.emit(GameEvents.SHOP_CATALOG_CHANGED, { catalogId: this.options.catalogId })
  }

  private applySavedState(): void {
    const savedState = this.options.persistence?.getCatalogState(this.options.catalogId)
    if (!savedState) {
      return
    }

    for (const ownedId of savedState.ownedIds) {
      if (this.options.getById(ownedId)) {
        this.ownedIds.add(ownedId)
      }
    }

    if (this.ownedIds.has(savedState.equippedId) && this.options.getById(savedState.equippedId)) {
      this.equippedId = savedState.equippedId
    }
  }

  private persist(): void {
    this.options.persistence?.setCatalogState(this.options.catalogId, {
      ownedIds: [...this.ownedIds],
      equippedId: this.equippedId,
    })
  }

  private readonly onMoneyChanged = (): void => {
    this.emitChanged()
  }

  private readonly onPurchaseRequested = (payload: { catalogId: ShopCatalogId; itemId: string }): void => {
    if (payload.catalogId !== this.options.catalogId) {
      return
    }

    const item = this.options.getById(payload.itemId)
    if (!item) {
      EventBus.emit(GameEvents.SHOP_PURCHASE_FEEDBACK, { message: 'Unknown item.', tone: 'error' })
      return
    }

    if (this.ownedIds.has(item.id)) {
      EventBus.emit(GameEvents.SHOP_PURCHASE_FEEDBACK, {
        message: `${item.displayName} is already yours.`,
        tone: 'neutral',
      })
      this.emitChanged()
      return
    }

    if (item.cost <= 0) {
      this.ownedIds.add(item.id)
      this.persist()
      EventBus.emit(GameEvents.SHOP_PURCHASE_FEEDBACK, {
        message: `${item.displayName} is free to use.`,
        tone: 'success',
      })
      this.emitChanged()
      return
    }

    if (!this.economy.trySpend(item.cost)) {
      EventBus.emit(GameEvents.SHOP_PURCHASE_FEEDBACK, {
        message: `Not enough money for ${item.displayName}.`,
        tone: 'error',
      })
      this.emitChanged()
      return
    }

    this.ownedIds.add(item.id)
    this.equippedId = item.id
    this.persist()
    EventBus.emit(GameEvents.SHOP_ITEM_PURCHASED, {
      catalogId: this.options.catalogId,
      itemId: item.id,
    })
    EventBus.emit(GameEvents.SHOP_PURCHASE_FEEDBACK, {
      message: `Bought and equipped ${item.displayName} for $${item.cost}.`,
      tone: 'success',
    })
    this.emitChanged()
    this.emitEquipped()
  }

  private readonly onEquipRequested = (payload: { catalogId: ShopCatalogId; itemId: string }): void => {
    if (payload.catalogId !== this.options.catalogId) {
      return
    }

    const item = this.options.getById(payload.itemId)
    if (!item) {
      EventBus.emit(GameEvents.SHOP_PURCHASE_FEEDBACK, { message: 'Unknown item.', tone: 'error' })
      return
    }

    if (!this.ownedIds.has(item.id)) {
      EventBus.emit(GameEvents.SHOP_PURCHASE_FEEDBACK, {
        message: `Buy ${item.displayName} first.`,
        tone: 'error',
      })
      return
    }

    if (this.equippedId === item.id) {
      return
    }

    this.equippedId = item.id
    this.persist()
    EventBus.emit(GameEvents.SHOP_PURCHASE_FEEDBACK, {
      message: `Equipped ${item.displayName}.`,
      tone: 'success',
    })
    this.emitChanged()
    this.emitEquipped()
  }
}
