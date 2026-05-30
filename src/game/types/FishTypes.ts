/** Spawn-weight tier; lower tiers are rarer. */
export type FishRarity = 'common' | 'uncommon' | 'rare' | 'legendary'

/**
 * Data-driven fish species. New fish = new entries in fishData, no new classes.
 * Depths are world units below the waterline.
 */
export interface FishDefinition {
  id: string
  displayName: string
  /** Placeholder body color. */
  color: number
  /** Biomes this species can appear in (see biomeData). */
  biomeIds: string[]
  minDepth: number
  maxDepth: number
  rarity: FishRarity
  /** Sell value when landed. */
  value: number
  /** Horizontal swim speed range (world units / second). */
  speedMin: number
  speedMax: number
  /** Body radius in world units (drives visual + hook reach). */
  radius: number
  canBeHooked: boolean
}
