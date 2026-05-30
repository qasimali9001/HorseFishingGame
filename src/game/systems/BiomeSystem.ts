import { BIOME_DATA } from '../data/biomeData'
import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/GameEvents'
import type { BiomeDefinition } from '../types/BiomeTypes'

/**
 * Maps a world depth to its vertical biome and tracks transitions as the lure
 * descends. The single source of truth for "which biome are we in", so spawn
 * tables and (later) backgrounds/ambience can read it without duplicating the
 * depth bands. Pure lookups + a transition event; no rendering or spawning.
 */
export class BiomeSystem {
  private currentId: string | null = null

  /** The biome that contains `depth` (clamped to the first/last band). */
  biomeAt(depth: number): BiomeDefinition {
    for (const biome of BIOME_DATA) {
      if (depth >= biome.minDepth && depth < biome.maxDepth) {
        return biome
      }
    }
    return depth < BIOME_DATA[0].minDepth ? BIOME_DATA[0] : BIOME_DATA[BIOME_DATA.length - 1]
  }

  /** Every biome whose depth band overlaps the inclusive [minDepth, maxDepth]. */
  biomesInRange(minDepth: number, maxDepth: number): BiomeDefinition[] {
    return BIOME_DATA.filter((b) => b.minDepth <= maxDepth && b.maxDepth >= minDepth)
  }

  /** Track the lure's current biome and announce changes for visuals/UI. */
  update(lureDepth: number): void {
    const biome = this.biomeAt(lureDepth)
    if (biome.id !== this.currentId) {
      this.currentId = biome.id
      EventBus.emit(GameEvents.BIOME_CHANGED, { biomeId: biome.id, displayName: biome.displayName })
    }
  }

  reset(): void {
    this.currentId = null
  }
}
