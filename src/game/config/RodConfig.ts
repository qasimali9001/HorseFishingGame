import type { RodDefinition } from '../types/RodTypes'

/** Rod visual constants + the default starter rod definition. */
export const RodConfig = {
  thickness: 5,
  color: 0x6b4423,
  tipColor: 0xfff3c4,
  tipRadius: 4,

  /** The rod every horse starts holding. */
  starter: {
    id: 'starter-rod',
    displayName: 'Twig Rod',
    visualId: 'rod-basic',
    lengthPx: 150,
    castPowerMultiplier: 1,
    reelSpeedMultiplier: 1,
    maxDepthBonus: 0,
    lineStrengthBonus: 0,
  } satisfies RodDefinition,
} as const
