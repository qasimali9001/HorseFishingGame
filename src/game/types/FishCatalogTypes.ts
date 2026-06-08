import type { FishRarity } from './FishTypes'
import type { FishSizeTier, BaitTier } from './BaitTypes'

export interface FishCatalogEntrySnapshot {
  readonly id: string
  readonly displayName: string
  readonly artId: string
  readonly sizeTier: FishSizeTier
  readonly requiredBaitTier: BaitTier
  readonly rarity: FishRarity
  readonly value: number
  readonly speed: number
  readonly biomeNames: readonly string[]
  readonly caught: boolean
}

export interface FishCatalogStateSnapshot {
  readonly gridEntries: readonly FishCatalogEntrySnapshot[]
  readonly featuredEntry: FishCatalogEntrySnapshot | null
  readonly caughtCount: number
  readonly totalCount: number
}
