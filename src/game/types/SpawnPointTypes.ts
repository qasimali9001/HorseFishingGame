import type { Fish } from '../entities/Fish'

/**
 * A hand-authored fish spawn point in WORLD coordinates. The level editor
 * (`?editor`) places and tunes these; `SpawnPointSystem` runs them at runtime.
 * Depth = y (the waterline is world y = 0), so `y` directly chooses the band.
 *
 * New spawn points = new entries in spawnPointData, no new classes.
 */
export interface SpawnPointDefinition {
  /** Stable id (used for selection in the editor + respawn bookkeeping). */
  id: string
  /** World X. */
  x: number
  /** World Y (depth below the waterline). */
  y: number
  /** Which species this point spawns (must exist in fishData). */
  fishId: string
  /** Cooldown before this point may spawn again after a fish is removed. */
  respawnMs: number
  /** How many of this point's fish may be alive at once. */
  maxAlive: number
  /** Defaults to true; `false` keeps the point in data but dormant. */
  enabled?: boolean
  /** Optional designer note (ignored at runtime). */
  notes?: string
  /** Optional tags for future quest targeting (e.g. quest-only species). */
  tags?: string[]
}

/** What a population system needs to know each frame to decide spawning. */
export interface FishSpawnContext {
  /** Only spawn new fish while the lure is fishing underwater. */
  lureUnderwater: boolean
  /** Player's reachable depth (PlayerStats.maxDepth) -- caps where fish appear. */
  maxDepth: number
}

/**
 * Common contract shared by every fish population source (the legacy
 * procedural `FishSpawnSystem` and the new `SpawnPointSystem`). Keeping this
 * interface lets `WorldScene` swap implementations behind a config flag without
 * the `FishingStateMachine` knowing which one it drives.
 */
export interface FishPopulation {
  /** Live fish (read-only) for AI steering + hook collision. */
  readonly list: readonly Fish[]
  /** Advance population for one frame. */
  update(dtSec: number, ctx: FishSpawnContext): void
  /** Remove a specific fish (landed, stolen, or despawned). */
  remove(target: Fish): void
}
