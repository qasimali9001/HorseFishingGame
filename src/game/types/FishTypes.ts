/** Broad movement personalities. Prototype uses them lightly; expandable later. */
export type FishBehavior = 'casual' | 'skittish' | 'curious'

/**
 * Data-driven fish species. New fish = new entries in fishData, no new classes.
 * Depths are world units below the waterline.
 */
export interface FishDefinition {
  id: string
  displayName: string
  /** Placeholder body color. */
  color: number
  minDepth: number
  maxDepth: number
  /** Sell value when landed. */
  value: number
  /** Horizontal swim speed range (world units / second). */
  speedMin: number
  speedMax: number
  /** Body radius in world units (drives visual + hook reach). */
  radius: number
  behavior: FishBehavior
  canBeHooked: boolean
}
