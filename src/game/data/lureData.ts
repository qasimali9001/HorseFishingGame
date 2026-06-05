import { LureTextures } from '../assets/LureAssets'
import type { ShopLureDefinition } from '../types/LureTypes'

/** Catalog of lures available in the shop and on the hook rig. */
export const ShopLures: readonly ShopLureDefinition[] = [
  {
    id: 'lure-basic',
    displayName: 'Basic Lure',
    description: 'Simple hook and bobber. Gets the job done.',
    textureKey: LureTextures.basic,
    visualId: 'lure-basic',
    cost: 0,
    starterOwned: true,
    sinkSpeedMultiplier: 1,
    maxDepthBonus: 0,
  },
  {
    id: 'lure-10kg-weight',
    displayName: '10kg Weight',
    description: 'Heavy sinker that pulls your line down faster.',
    textureKey: LureTextures.weight10kg,
    visualId: 'lure-10kg-weight',
    cost: 95,
    sinkSpeedMultiplier: 1.18,
    maxDepthBonus: 25,
  },
] as const

export const DefaultLureId = ShopLures[0].id

export function getShopLureById(lureId: string): ShopLureDefinition | undefined {
  return ShopLures.find((lure) => lure.id === lureId)
}
