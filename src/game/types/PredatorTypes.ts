/**
 * Data-driven predator species. Predators are a separate concern from regular
 * fish: they are not hookable and create reel-in tension by chasing a hooked
 * catch. New predators = new entries in predatorData, no new classes.
 * Depths are world units below the waterline.
 */
export interface PredatorDefinition {
  id: string
  displayName: string
  /** Placeholder body color. */
  color: number
  /** Biomes this predator can appear in (see biomeData). */
  biomeIds: string[]
  minDepth: number
  maxDepth: number
  /** Body radius in world units (drives visual + attack reach). */
  radius: number
  /** Idle patrol speed range (world units / second). */
  patrolSpeedMin: number
  patrolSpeedMax: number
  /** A hooked fish inside this radius makes the predator give chase. */
  detectionRadius: number
  /** Speed while chasing a hooked fish (world units / second). */
  chaseSpeed: number
  /** Within this distance of the hooked fish the predator can attempt a steal. */
  attackRadius: number
  /** Probability (0..1) of stealing the catch on each attack attempt. */
  eatChance: number
}
