/** Stat modifiers an equippable lure contributes at read-time. */
export interface LureStats {
  sinkSpeedMultiplier: number
  maxDepthBonus: number
}

/** Data-driven lure definition for shop + gameplay. */
export interface LureDefinition extends LureStats {
  id: string
  displayName: string
  visualId: string
  textureKey: string
}

/** Lure entry in the shop catalog. */
export interface ShopLureDefinition extends LureDefinition {
  description: string
  cost: number
  /** Optional square shop-row icon texture key. */
  shopIconKey?: string
  starterOwned?: boolean
}
