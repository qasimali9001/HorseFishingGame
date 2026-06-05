import type { ShopCatalogPlaceholderState, ShopPlaceholderKind } from '../types/ShopCatalogTypes'

/** Builds locked placeholder rows for catalog tabs without real items yet. */
export function buildPlaceholderRows(
  kind: ShopPlaceholderKind,
  count: number,
  idPrefix: string,
): readonly ShopCatalogPlaceholderState[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${idPrefix}-${index + 1}`,
    placeholderKind: kind,
  }))
}

export const RodPlaceholders = buildPlaceholderRows('rod', 2, 'rod-placeholder')
export const BoatPlaceholders = buildPlaceholderRows('boat', 4, 'boat-placeholder')
export const LurePlaceholders = buildPlaceholderRows('lure', 2, 'lure-placeholder')
export const InvestmentPlaceholders = buildPlaceholderRows('investment', 4, 'investment-placeholder')
