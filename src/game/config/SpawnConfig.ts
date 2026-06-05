/** Which fish population source the world uses. */
export type SpawnMode = 'points' | 'procedural'

/**
 * Runtime tuning for the spawn-point population system (fixed editor-authored
 * points; species respawn timers live in fishData). No gameplay logic here.
 */
export const SpawnConfig = {
  /**
   * 'points'     = fixed, editor-authored spawn points (species respawn from fishData).
   * 'procedural' = legacy camera-edge spawner (kept as a parity fallback).
   */
  mode: 'points' as SpawnMode,

  /** Defaults applied to a freshly placed spawn point in the editor. */
  defaultMaxAlive: 2,

  /**
   * A point only spawns while it lies within the camera view expanded by this
   * world-unit margin, so distant points stay dormant (perf + exploration).
   * Respawn timers still tick everywhere, so fish are ready when you return.
   * Keep this smaller than `despawnOffscreenMargin` so a fresh spawn does not
   * immediately despawn.
   */
  activationMargin: 160,

  /** Despawn a free-swimming spawned fish once this far beyond the view. */
  despawnOffscreenMargin: 300,

  /** Spread each point's first spawn across this window so they don't all pop at once. */
  initialSpawnJitterMs: 1400,
} as const
