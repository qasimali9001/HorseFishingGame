import { ShopIconTextures } from '../assets/ShopIconAssets'
import type { InvestmentDefinition } from '../types/InvestmentTypes'

/** Catalog of passive-income investments in the shop. */
export const ShopInvestments: readonly InvestmentDefinition[] = [
  {
    id: 'invest-horse-coin',
    displayName: 'Horse Coin',
    description: 'Invest in the hottest equine crypto. Pays while you fish.',
    textureKey: ShopIconTextures.horseCoin,
    shopIconKey: ShopIconTextures.horseCoin,
    cost: 250,
    incomePerTick: 4,
  },
] as const

export function getInvestmentById(investmentId: string): InvestmentDefinition | undefined {
  return ShopInvestments.find((investment) => investment.id === investmentId)
}
