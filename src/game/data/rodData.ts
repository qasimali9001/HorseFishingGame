import { RodTextures } from '../assets/RodAssets'
import type { ShopRodDefinition } from '../types/RodTypes'

/** Catalog of rods available in the shop and on the horse rig. */
export const ShopRods: readonly ShopRodDefinition[] = [
  {
    id: 'rod-branch',
    displayName: 'Branch Rod',
    description: 'A crooked twig from the shore. Free, but it works.',
    textureKey: RodTextures.branch,
    visualId: 'rod-branch',
    lengthPx: 230,
    cost: 0,
    starterOwned: true,
    castPowerMultiplier: 1,
    reelSpeedMultiplier: 1,
    maxDepthBonus: 0,
    lineStrengthBonus: 0,
  },
  {
    id: 'rod-wooden',
    displayName: 'Wooden Rod',
    description: 'Wrapped driftwood grip. Launches hard and reaches much deeper water.',
    textureKey: RodTextures.wooden,
    visualId: 'rod-wooden',
    lengthPx: 250,
    cost: 120,
    castPowerMultiplier: 1.5,
    reelSpeedMultiplier: 1.15,
    maxDepthBonus: 100,
    lineStrengthBonus: 0,
  },
] as const

export const DefaultRodId = ShopRods[0].id

export function getShopRodById(rodId: string): ShopRodDefinition | undefined {
  return ShopRods.find((rod) => rod.id === rodId)
}
