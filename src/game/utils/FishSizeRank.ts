import type { FishSizeTier } from '../types/BaitTypes'

const FISH_SIZE_RANK: Record<FishSizeTier, number> = {
  small: 0,
  medium: 1,
  large: 2,
  veryLarge: 3,
}

/** True when a fish of `predatorTier` is large enough to eat `preyTier`. */
export function canEatFishSize(predatorTier: FishSizeTier, preyTier: FishSizeTier): boolean {
  return FISH_SIZE_RANK[predatorTier] > FISH_SIZE_RANK[preyTier]
}
