import type { ShopCategoryDefinition } from '../types/ShopTypes'

export const ShopCategories: readonly ShopCategoryDefinition[] = [
  {
    id: 'rods',
    title: 'Rods',
    description: 'Pick a rod to equip. More rods coming soon.',
  },
  {
    id: 'boats',
    title: 'Boats',
    description: 'Surface rides for your horse. More boats coming soon.',
  },
  {
    id: 'lures',
    title: 'Lures',
    description: 'Pick a lure to equip. More lures coming soon.',
  },
  {
    id: 'investments',
    title: 'Investments',
    description: 'Long-term upgrades. More options coming soon.',
  },
] as const
