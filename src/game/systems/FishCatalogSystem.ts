import { FISH_DATA } from '../data/fishData'
import { BIOME_DATA } from '../data/biomeData'
import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/GameEvents'
import type { FishCatalogEntrySnapshot, FishCatalogStateSnapshot } from '../types/FishCatalogTypes'

export interface FishCatalogSavePort {
  getCaughtFishIds(): readonly string[]
  setCaughtFishIds(caughtFishIds: readonly string[]): void
}

const HorseFishId = 'horse-fish'
const ValidFishIds = new Set(FISH_DATA.map((fish) => fish.id))

/**
 * Owns the player's discovered fish list. World systems only emit catches;
 * UI receives a snapshot and never reaches into fish entities.
 */
export class FishCatalogSystem {
  private readonly caughtFishIds: Set<string>

  constructor(private readonly save?: FishCatalogSavePort) {
    this.caughtFishIds = new Set((save?.getCaughtFishIds() ?? []).filter((id) => ValidFishIds.has(id)))

    EventBus.on(GameEvents.CATCH_LANDED, this.onCatchLanded)
    EventBus.on(GameEvents.FISH_CATALOG_STATE_REQUESTED, this.onStateRequested)
    this.emitState()
  }

  destroy(): void {
    EventBus.off(GameEvents.CATCH_LANDED, this.onCatchLanded)
    EventBus.off(GameEvents.FISH_CATALOG_STATE_REQUESTED, this.onStateRequested)
  }

  private buildSnapshot(): FishCatalogStateSnapshot {
    const entries = FISH_DATA.map((fish) => {
      const biomeNames = fish.biomeIds.map((biomeId) => {
        return BIOME_DATA.find((biome) => biome.id === biomeId)?.displayName ?? biomeId
      })

      return {
        id: fish.id,
        displayName: fish.displayName,
        artId: fish.artId,
        sizeTier: fish.sizeTier,
        requiredBaitTier: fish.requiredBaitTier,
        rarity: fish.rarity,
        value: fish.value,
        speed: fish.speed,
        biomeNames,
        caught: this.caughtFishIds.has(fish.id),
      } satisfies FishCatalogEntrySnapshot
    })

    return {
      gridEntries: entries.filter((entry) => entry.id !== HorseFishId),
      featuredEntry: entries.find((entry) => entry.id === HorseFishId) ?? null,
      caughtCount: entries.filter((entry) => entry.caught).length,
      totalCount: entries.length,
    }
  }

  private emitState(): void {
    EventBus.emit(GameEvents.FISH_CATALOG_STATE_CHANGED, this.buildSnapshot())
  }

  private persist(): void {
    this.save?.setCaughtFishIds([...this.caughtFishIds])
  }

  private readonly onCatchLanded = (payload: { fishId: string }): void => {
    if (!ValidFishIds.has(payload.fishId) || this.caughtFishIds.has(payload.fishId)) {
      return
    }

    this.caughtFishIds.add(payload.fishId)
    this.persist()
    this.emitState()
  }

  private readonly onStateRequested = (): void => {
    this.emitState()
  }
}
