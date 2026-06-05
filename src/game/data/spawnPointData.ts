import type { SpawnPointDefinition } from '../types/SpawnPointTypes'

/**
 * Hand-authored fish spawn points, surface -> deep. Each point pins a species
 * to a world position; respawn timing comes from that species in fishData.
 * Author/edit these visually with `?editor` (place, tune, press E to log arrays).
 *
 * y is the world depth below the waterline (waterline = y 0). `swimRange` is
 * the horizontal patrol width centered on x. Keep each point's y inside its
 * species' depth range (see fishData) so the fish reads naturally.
 */
export const SPAWN_POINT_DATA: readonly SpawnPointDefinition[] = [
  { id: 'sp-shallow-goldfish-a', x: 600, y: 160, fishId: 'goldfish-orange', maxAlive: 2, swimRange: 320 },
  { id: 'sp-shallow-minnow-a', x: 1420, y: 140, fishId: 'slender-blue-white', maxAlive: 2, swimRange: 780 },
  { id: 'sp-shallow-mud-a', x: 1040, y: 560, fishId: 'greenish-brown', maxAlive: 2, swimRange: 500 },
  { id: 'sp-kelp-pike-a', x: 720, y: 640, fishId: 'olive-pike', maxAlive: 2, swimRange: 520 },
  { id: 'sp-kelp-pink-a', x: 1500, y: 760, fishId: 'pink-round', maxAlive: 1, swimRange: 380 },
  { id: 'sp-kelp-grouper-a', x: 2080, y: 880, fishId: 'purple-chunky', maxAlive: 1, swimRange: 420 },
  { id: 'sp-twilight-tuna-a', x: 600, y: 1300, fishId: 'blue-tuna', maxAlive: 1, swimRange: 620 },
  { id: 'sp-twilight-catfish-a', x: 1700, y: 1520, fishId: 'grey-catfish', maxAlive: 1, swimRange: 480 },
  { id: 'sp-edit-10', x: 500, y: 220, fishId: 'goldfish-orange', maxAlive: 2, swimRange: 360 },
  { id: 'sp-edit-11', x: 620, y: 280, fishId: 'goldfish-orange', maxAlive: 2, swimRange: 360 },
  { id: 'sp-edit-13', x: 1240, y: 300, fishId: 'slender-blue-white', maxAlive: 2, swimRange: 720 },
  { id: 'sp-edit-14', x: 1640, y: 240, fishId: 'slender-blue-white', maxAlive: 2, swimRange: 960 },
  { id: 'sp-edit-15', x: 560, y: 560, fishId: 'greenish-brown', maxAlive: 2, swimRange: 360 },
  { id: 'sp-edit-17', x: 1040, y: 640, fishId: 'purple-chunky', maxAlive: 2, swimRange: 120 },
]
