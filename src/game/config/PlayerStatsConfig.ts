/**
 * Base player capabilities, BEFORE rod bonuses and upgrades are composed in.
 * These are the floor values a brand-new save has. Upgrades and rods add on
 * top at read-time (see PlayerStats) -- they never overwrite these.
 *
 * Note: max depth is its own axis, deliberately independent of cast distance,
 * so "buy more line / go deeper" and "cast further" stay separate upgrades and
 * the vertical biome design has a clean depth axis.
 */
export const PlayerStatsConfig = {
  /** Reachable depth (world units below the waterline) with the starter rod. */
  baseMaxDepth: 300,
  /** Multiplier applied to the lure's base reel-up speed. */
  baseReelSpeedMultiplier: 1,
  /** Multiplier applied to cast launch velocity. */
  baseCastPowerMultiplier: 1,
} as const
