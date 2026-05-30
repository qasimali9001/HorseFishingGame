import { HorseTextures } from '../assets/HorseAssets'
import type { RodDefinition } from '../types/RodTypes'

/** Rod visual constants + the default starter rod definition. */
export const RodConfig = {
  /** Texture used for the rod shaft (butt on the left, tip on the right). */
  textureKey: HorseTextures.rod,
  /** Debug tip marker (shown only when DebugConfig.showAnchors / tuner). */
  tipColor: 0x2dd4bf,
  tipRadius: 5,

  /** The rod every horse starts holding. */
  starter: {
    id: 'starter-rod',
    displayName: 'Twig Rod',
    visualId: 'rod-basic',
    lengthPx: 230,
    castPowerMultiplier: 1,
    reelSpeedMultiplier: 1,
    maxDepthBonus: 0,
    lineStrengthBonus: 0,
  } satisfies RodDefinition,
} as const
