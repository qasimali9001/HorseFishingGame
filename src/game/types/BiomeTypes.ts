/**
 * Data-driven vertical depth biome. New biomes = new entries in biomeData; the
 * spawn + (future) background systems read these without code changes.
 * Depths are world units below the waterline; colors are Phaser hex numbers.
 */
export interface BiomeDefinition {
  id: string
  displayName: string
  minDepth: number
  maxDepth: number
  backgroundColorTop: number
  backgroundColorBottom: number
  /** 0..1 murk overlay strength (deeper = foggier); consumed by visuals later. */
  fogOpacity: number
  /** Ambient light scalar (1 = bright surface, lower = darker depths). */
  lightMultiplier: number
  ambienceId?: string
  /** Species allowed to spawn here (matched against FishDefinition.biomeIds). */
  fishIds: string[]
  /** Decorative prop ids for this band (consumed by world props later). */
  propIds: string[]
}
