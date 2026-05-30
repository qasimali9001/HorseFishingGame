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
  /** Rod length in world/local pixels from butt to tip. */
  lengthPx: number
}
