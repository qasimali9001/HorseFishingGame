import type { BaitTier, FishSizeTier } from '../types/BaitTypes'

type BaitVisualConfig = {
  label: string
  color: number
}

export const BaitConfig: {
  readonly startingTier: BaitTier
  readonly tiers: readonly BaitTier[]
  readonly visuals: Record<BaitTier, BaitVisualConfig>
  readonly chuckUpgradeByFishSize: Record<FishSizeTier, BaitTier | null>
} = {
  startingTier: 'small',
  tiers: ['small', 'medium', 'large'] as const,
  visuals: {
    small: { label: 'Small Bait', color: 0xffffff },
    medium: { label: 'Medium Bait', color: 0xffe066 },
    large: { label: 'Large Bait', color: 0xffa94d },
  },
  chuckUpgradeByFishSize: {
    small: 'medium',
    medium: 'large',
    large: 'large',
    veryLarge: null,
  },
} as const
