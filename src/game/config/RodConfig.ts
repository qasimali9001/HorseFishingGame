import { DefaultRodId, getShopRodById } from '../data/rodData'
import type { RodDefinition } from '../types/RodTypes'

/** Rod visual constants + the default starter rod definition. */
export const RodConfig = {
  /** Debug tip marker (shown only when DebugConfig.showAnchors / tuner). */
  tipColor: 0x2dd4bf,
  tipRadius: 5,

  /** The rod every horse starts holding. */
  starter: getShopRodById(DefaultRodId)! satisfies RodDefinition,
} as const
