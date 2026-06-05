/** Shared shop row state for equippable catalog tabs. */
export interface ShopCatalogItemState {
  id: string
  displayName: string
  description: string
  textureKey: string
  cost: number
  owned: boolean
  equipped: boolean
  affordable: boolean
  statsSummary: string
}

/** Locked teaser row shown before real catalog art exists. */
export interface ShopCatalogPlaceholderState {
  id: string
  placeholderKind: ShopPlaceholderKind
}

export type ShopPlaceholderKind = 'rod' | 'boat' | 'lure' | 'investment'

export type ShopCatalogId = 'rods' | 'boats' | 'lures' | 'investments'
