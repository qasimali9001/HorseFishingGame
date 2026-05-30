/** Predator population + chase/steal feel. Kept small for the prototype. */
export const PredatorConfig = {
  /** Max predators alive at once. */
  maxActive: 2,
  /** How often the spawner tries to add a predator while fishing. */
  spawnIntervalMs: 4200,

  /** Spawn this far outside the current camera view. */
  spawnOffscreenMargin: 90,
  /** Despawn once a (non-chasing) predator has drifted this far past the view. */
  despawnOffscreenMargin: 260,

  /** Gentle vertical wobble while patrolling. */
  wobbleAmplitude: 6,
  wobbleSpeed: 1.4,

  /** Velocity steering toward the chase target (per 1/60s). */
  chaseSteerResponse: 0.09,

  /** Time between steal attempts while within attack range (ms). */
  attackIntervalMs: 600,

  /** Render depth: behind fish so a chasing predator reads as "looming". */
  renderDepth: 4,
} as const
