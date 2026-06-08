export type ShopItemKind = 'equippable' | 'passive'

/** Shared shop row state for equippable catalog tabs. */
export interface ShopCatalogItemState {
  id: string
  displayName: string
  description: string
  /** Gameplay texture used on the horse rig or lure. */
  textureKey: string
  /** Resolved shop-row icon texture (shopIconKey when set, else textureKey). */
  iconTextureKey: string
  cost: number
  owned: boolean
  equipped: boolean
  affordable: boolean
  statsSummary: string
  /** Passive investments skip equip and show an owned/active label instead. */
  itemKind?: ShopItemKind
}

/** Locked teaser row shown before real catalog art exists. */
export interface ShopCatalogPlaceholderState {
  id: string
  placeholderKind: ShopPlaceholderKind
}

export type ShopPlaceholderKind = 'rod' | 'boat' | 'lure' | 'investment'

export type ShopCatalogId = 'rods' | 'boats' | 'lures' | 'investments'
