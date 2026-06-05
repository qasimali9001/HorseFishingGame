import { DefaultRodId, ShopRods, getShopRodById } from '../data/rodData'
import { DefaultLureId, ShopLures, getShopLureById } from '../data/lureData'
import { GameEvents } from '../events/GameEvents'
import type { RodDefinition } from '../types/RodTypes'
import type { LureDefinition } from '../types/LureTypes'
import type { EconomySystem } from './EconomySystem'
import { ShopCatalogInventorySystem, type ShopCatalogSavePort } from './ShopCatalogInventorySystem'

function rodStatsSummary(rod: RodDefinition): string {
  const parts: string[] = []
  if (rod.castPowerMultiplier !== 1) {
    parts.push(`+${Math.round((rod.castPowerMultiplier - 1) * 100)}% cast`)
  }
  if (rod.reelSpeedMultiplier !== 1) {
    parts.push(`+${Math.round((rod.reelSpeedMultiplier - 1) * 100)}% reel`)
  }
  if (rod.maxDepthBonus > 0) {
    parts.push(`+${rod.maxDepthBonus} depth`)
  }
  return parts.length > 0 ? parts.join(', ') : 'Starter stats'
}

function lureStatsSummary(lure: LureDefinition): string {
  const parts: string[] = []
  if (lure.sinkSpeedMultiplier !== 1) {
    parts.push(`+${Math.round((lure.sinkSpeedMultiplier - 1) * 100)}% sink`)
  }
  if (lure.maxDepthBonus > 0) {
    parts.push(`+${lure.maxDepthBonus} depth`)
  }
  return parts.length > 0 ? parts.join(', ') : 'Standard setup'
}

export function createRodCatalogInventory(
  economy: EconomySystem,
  persistence?: ShopCatalogSavePort,
): ShopCatalogInventorySystem<(typeof ShopRods)[number]> {
  return new ShopCatalogInventorySystem(economy, {
    catalogId: 'rods',
    items: ShopRods,
    defaultItemId: DefaultRodId,
    getById: getShopRodById,
    statsSummary: rodStatsSummary,
    equippedEvent: GameEvents.ROD_EQUIPPED,
    toEquippedPayload: (rod) => ({ rod }),
    persistence,
  })
}

export function createLureCatalogInventory(
  economy: EconomySystem,
  persistence?: ShopCatalogSavePort,
): ShopCatalogInventorySystem<(typeof ShopLures)[number]> {
  return new ShopCatalogInventorySystem(economy, {
    catalogId: 'lures',
    items: ShopLures,
    defaultItemId: DefaultLureId,
    getById: getShopLureById,
    statsSummary: lureStatsSummary,
    equippedEvent: GameEvents.LURE_EQUIPPED,
    toEquippedPayload: (lure) => ({ lure }),
    persistence,
  })
}
