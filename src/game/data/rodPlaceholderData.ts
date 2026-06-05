export type RodSilhouetteVariant = 'thin' | 'medium' | 'thick' | 'curved' | 'reel' | 'tall'

/** Static teaser slots shown in the rod shop before real art exists. */
export interface ShopRodPlaceholderDefinition {
  id: string
  silhouetteVariant: RodSilhouetteVariant
}

/** Cycle used to auto-fill empty cells in the rod shop grid. */
export const RodSilhouetteCycle: readonly RodSilhouetteVariant[] = [
  'reel',
  'thick',
  'curved',
  'tall',
  'thin',
  'medium',
] as const

export const ShopRodPlaceholders: readonly ShopRodPlaceholderDefinition[] = [
  { id: 'rod-placeholder-reel', silhouetteVariant: 'reel' },
  { id: 'rod-placeholder-thick', silhouetteVariant: 'thick' },
  { id: 'rod-placeholder-curved', silhouetteVariant: 'curved' },
  { id: 'rod-placeholder-tall', silhouetteVariant: 'tall' },
] as const
