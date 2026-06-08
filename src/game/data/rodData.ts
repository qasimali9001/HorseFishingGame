import { RodTextures } from '../assets/RodAssets'
import { ShopIconTextures } from '../assets/ShopIconAssets'
import type { ShopRodDefinition } from '../types/RodTypes'

/** Catalog of rods available in the shop and on the horse rig. */
export const ShopRods: readonly ShopRodDefinition[] = [
  {
    id: 'rod-branch',
    displayName: 'Branch Rod',
    description: 'A crooked twig from the shore. Free, but it works.',
    textureKey: RodTextures.branch,
    shopIconKey: ShopIconTextures.rodBranch,
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
    shopIconKey: ShopIconTextures.rodWooden,
    visualId: 'rod-wooden',
    lengthPx: 250,
    cost: 120,
    castPowerMultiplier: 1.5,
    reelSpeedMultiplier: 1.15,
    maxDepthBonus: 100,
    lineStrengthBonus: 0,
  },
  {
    id: 'rod-carrot',
    displayName: 'Carrot Rod',
    description: 'Crunchy orange shaft with leafy grip. Casts far and fishes the deep.',
    textureKey: RodTextures.carrot,
    shopIconKey: ShopIconTextures.rodCarrot,
    visualId: 'rod-carrot',
    lengthPx: 270,
    cost: 320,
    castPowerMultiplier: 2,
    reelSpeedMultiplier: 1.3,
    maxDepthBonus: 200,
    lineStrengthBonus: 0,
  },
] as const

export const DefaultRodId = ShopRods[0].id

export function getShopRodById(rodId: string): ShopRodDefinition | undefined {
  return ShopRods.find((rod) => rod.id === rodId)
}
