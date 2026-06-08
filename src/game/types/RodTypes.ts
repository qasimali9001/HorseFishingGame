import type { RodSilhouetteVariant } from '../data/rodPlaceholderData'

/** Stat modifiers a rod contributes. Composed at read-time by the fishing system. */
export interface RodStats {
  castPowerMultiplier: number
  reelSpeedMultiplier: number
  maxDepthBonus: number
  lineStrengthBonus: number
}

/** Data-driven rod definition. New rods = new data, no new classes. */
export interface RodDefinition extends RodStats {
  id: string
  displayName: string
  visualId: string
  /** Phaser texture key (butt on the left, tip on the right). */
  textureKey: string
  /** Rod length in world/local pixels from butt to tip. */
  lengthPx: number
}

/** Rod entry in the shop catalog — gameplay stats plus purchase metadata. */
export interface ShopRodDefinition extends RodDefinition {
  description: string
  cost: number
  /** Optional square shop-row icon texture key. */
  shopIconKey?: string
  /** When true the player starts with this rod already owned. */
  starterOwned?: boolean
}

/** Read-only rod row for the shop UI. */
export interface ShopRodState {
  id: string
  displayName: string
  description: string
  textureKey: string
  cost: number
  owned: boolean
  equipped: boolean
  affordable: boolean
  statsSummary: string
}

/** Locked teaser slot in the rod shop grid. */
export interface ShopRodPlaceholderState {
  id: string
  silhouetteVariant: RodSilhouetteVariant
}
