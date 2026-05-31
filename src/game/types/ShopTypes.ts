export type ShopCategoryId = 'rods' | 'boats' | 'lures' | 'gadgets'

export type ShopEffectId = 'castPower' | 'reelSpeed' | 'maxDepth'

export interface ShopCategoryDefinition {
  id: ShopCategoryId
  title: string
  description: string
  placeholderMessage?: string
}

export interface ShopUpgradeDefinition {
  id: string
  categoryId: ShopCategoryId
  title: string
  description: string
  effectId: ShopEffectId
  effectPerLevel: number
  maxLevel: number
  baseCost: number
  costMultiplier: number
}

export interface ShopUpgradeState {
  id: string
  categoryId: ShopCategoryId
  title: string
  description: string
  level: number
  maxLevel: number
  nextCost: number
  isMaxed: boolean
  affordable: boolean
  effectText: string
}

export interface ShopStateSnapshot {
  money: number
  categories: readonly ShopCategoryDefinition[]
  upgrades: readonly ShopUpgradeState[]
}

