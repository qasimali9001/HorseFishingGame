import type { SpawnPointDefinition } from '../types/SpawnPointTypes'

/**
 * Hand-authored fish spawn points, surface -> deep. Each point pins a species
 * to a world position with its own respawn timer, so catching a fish clears it
 * for a while and the player must roam to keep landing catches. Author/edit
 * these visually with `?editor` (place, tune, press E to log a fresh array).
 *
 * y is the world depth below the waterline (waterline = y 0). Keep each point's
 * y inside its species' depth range (see fishData) so the fish reads naturally.
 */
export const SPAWN_POINT_DATA: readonly SpawnPointDefinition[] = [
  // Sunny Shores (0 - 500)
  { id: 'sp-shallow-minnow-a', x: 540, y: 160, fishId: 'pebble-minnow', respawnMs: 6000, maxAlive: 2 },
  { id: 'sp-shallow-skipper-a', x: 1320, y: 220, fishId: 'sand-skipper', respawnMs: 6000, maxAlive: 2 },
  { id: 'sp-shallow-perch-a', x: 1980, y: 360, fishId: 'sun-perch', respawnMs: 9000, maxAlive: 1 },

  // Kelp Forest (500 - 1000)
  { id: 'sp-kelp-darter-a', x: 720, y: 640, fishId: 'kelp-darter', respawnMs: 9000, maxAlive: 2 },
  { id: 'sp-kelp-snapper-a', x: 1500, y: 760, fishId: 'dune-snapper', respawnMs: 11000, maxAlive: 1 },
  { id: 'sp-kelp-gulper-a', x: 2080, y: 880, fishId: 'deep-gulper', respawnMs: 14000, maxAlive: 1 },

  // Twilight Waters (1000 - 1800)
  { id: 'sp-twilight-grouper-a', x: 600, y: 1300, fishId: 'canyon-grouper', respawnMs: 16000, maxAlive: 1 },
  { id: 'sp-twilight-lantern-a', x: 1700, y: 1520, fishId: 'lantern-drifter', respawnMs: 20000, maxAlive: 1 },

  // Midnight Trench (1800 - 2700)
  { id: 'sp-midnight-lantern-a', x: 1120, y: 2200, fishId: 'lantern-drifter', respawnMs: 24000, maxAlive: 1 },
]
