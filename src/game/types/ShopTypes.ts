import type {
  ShopCatalogItemState,
  ShopCatalogPlaceholderState,
  ShopPlaceholderKind,
} from './ShopCatalogTypes'

export type ShopCategoryId = 'rods' | 'boats' | 'lures' | 'investments'

export interface ShopCategoryDefinition {
  id: ShopCategoryId
  title: string
  description: string
}

export interface ShopCatalogSectionState {
  items: readonly ShopCatalogItemState[]
  placeholders: readonly ShopCatalogPlaceholderState[]
  placeholderKind: ShopPlaceholderKind
}

export interface ShopStateSnapshot {
  money: number
  categories: readonly ShopCategoryDefinition[]
  catalogs: Record<ShopCategoryId, ShopCatalogSectionState>
}
