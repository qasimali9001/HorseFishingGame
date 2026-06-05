/** Spawn-weight tier; lower tiers are rarer. */
import type { BaitTier, FishSizeTier } from './BaitTypes'

export type FishRarity = 'common' | 'uncommon' | 'rare' | 'legendary'

/**
 * Data-driven fish species. New fish = new entries in fishData, no new classes.
 * Depths are world units below the waterline.
 */
export interface FishDefinition {
  id: string
  displayName: string
  /** Texture id from FishAssets (lets each species swap art independently). */
  artId: string
  /** Size tier used by bait progression + catch gating. */
  sizeTier: FishSizeTier
  /** Minimum bait tier required to hook this fish. */
  requiredBaitTier: BaitTier
  /** Fallback tint used if a texture key is missing. */
  color: number
  /** Biomes this species can appear in (see biomeData). */
  biomeIds: string[]
  minDepth: number
  maxDepth: number
  rarity: FishRarity
  /** Sell value when landed. */
  value: number
  /** Horizontal swim speed (world units / second). */
  speed: number
  /** World-unit radius in which this fish detects bait or a hooked fish. */
  aggressionRadius: number
  /** Cooldown before a spawn point of this species may respawn (ms). */
  respawnMs: number
  /** Body radius in world units (drives visual + hook reach). */
  radius: number
  canBeHooked: boolean
}

/** Horizontal patrol bounds for one fish instance in world coordinates. */
export interface FishSwimBounds {
  minX: number
  maxX: number
}
