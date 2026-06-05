import type { SpawnPointDefinition } from '../types/SpawnPointTypes'

/**
 * Hand-authored fish spawn points, surface -> deep. Each point pins a species
 * to a world position with its own respawn timer, so catching a fish clears it
 * for a while and the player must roam to keep landing catches. Author/edit
 * these visually with `?editor` (place, tune, press E to log a fresh array).
 *
 * y is the world depth below the waterline (waterline = y 0). `swimRange` is
 * the horizontal patrol width centered on x. Keep each point's y inside its
 * species' depth range (see fishData) so the fish reads naturally.
 */
export const SPAWN_POINT_DATA: readonly SpawnPointDefinition[] = [
  // Sunny Shores (0 - 500) — small + medium starters
  { id: 'sp-shallow-goldfish-a', x: 540, y: 160, fishId: 'goldfish-orange', respawnMs: 6000, maxAlive: 2, swimRange: 320 },
  { id: 'sp-shallow-minnow-a', x: 1320, y: 220, fishId: 'slender-blue-white', respawnMs: 6000, maxAlive: 2, swimRange: 420 },
  { id: 'sp-shallow-mud-a', x: 1980, y: 320, fishId: 'greenish-brown', respawnMs: 7000, maxAlive: 2, swimRange: 300 },
  { id: 'sp-shallow-tang-a', x: 960, y: 400, fishId: 'blue-tang', respawnMs: 9000, maxAlive: 1, swimRange: 460 },

  // Kelp Forest (500 - 1000)
  { id: 'sp-kelp-pike-a', x: 720, y: 640, fishId: 'olive-pike', respawnMs: 9000, maxAlive: 2, swimRange: 520 },
  { id: 'sp-kelp-pink-a', x: 1500, y: 760, fishId: 'pink-round', respawnMs: 11000, maxAlive: 1, swimRange: 380 },
  { id: 'sp-kelp-grouper-a', x: 2080, y: 880, fishId: 'purple-chunky', respawnMs: 14000, maxAlive: 1, swimRange: 420 },

  // Twilight Waters (1000 - 1800)
  { id: 'sp-twilight-tuna-a', x: 600, y: 1300, fishId: 'blue-tuna', respawnMs: 16000, maxAlive: 1, swimRange: 620 },
  { id: 'sp-twilight-catfish-a', x: 1700, y: 1520, fishId: 'grey-catfish', respawnMs: 20000, maxAlive: 1, swimRange: 480 },
]
