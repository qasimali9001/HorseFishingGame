import type { SpawnPointDefinition } from '../types/SpawnPointTypes'

/**
 * Hand-authored fish spawn points, surface -> deep. Each point pins a species
 * to a world position; respawn timing comes from that species in fishData.
 * Author/edit these visually with `?editor` (place, tune, press E to log arrays).
 *
 * y is the world depth below the waterline (waterline = y 0). `swimRange` is
 * the horizontal patrol width centered on x.
 */
export const SPAWN_POINT_DATA: readonly SpawnPointDefinition[] = [
  { id: 'sp-shallow-goldfish-a', x: 840, y: 160, fishId: 'goldfish-orange', maxAlive: 1, swimRange: 320 },
  { id: 'sp-shallow-minnow-a', x: 1360, y: 140, fishId: 'slender-blue-white', maxAlive: 1, swimRange: 300 },
  { id: 'sp-shallow-mud-a', x: 1040, y: 560, fishId: 'greenish-brown', maxAlive: 1, swimRange: 500 },
  { id: 'sp-kelp-pike-a', x: 720, y: 640, fishId: 'olive-pike', maxAlive: 1, swimRange: 520 },
  { id: 'sp-kelp-pink-a', x: 1500, y: 760, fishId: 'pink-round', maxAlive: 1, swimRange: 380 },
  { id: 'sp-kelp-grouper-a', x: 2080, y: 880, fishId: 'purple-chunky', maxAlive: 1, swimRange: 420 },
  { id: 'sp-twilight-tuna-a', x: 600, y: 1300, fishId: 'blue-tuna', maxAlive: 1, swimRange: 620 },
  { id: 'sp-twilight-catfish-a', x: 1700, y: 1520, fishId: 'grey-catfish', maxAlive: 1, swimRange: 480 },
  { id: 'sp-edit-10', x: 760, y: 240, fishId: 'goldfish-orange', maxAlive: 1, swimRange: 360 },
  { id: 'sp-edit-11', x: 880, y: 280, fishId: 'goldfish-orange', maxAlive: 1, swimRange: 360 },
  { id: 'sp-edit-13', x: 1260, y: 320, fishId: 'slender-blue-white', maxAlive: 1, swimRange: 680 },
  { id: 'sp-edit-14', x: 1440, y: 260, fishId: 'slender-blue-white', maxAlive: 1, swimRange: 600 },
  { id: 'sp-edit-15', x: 560, y: 560, fishId: 'greenish-brown', maxAlive: 1, swimRange: 360 },
  { id: 'sp-edit-16', x: 1980, y: 1080, fishId: 'horse-fish', maxAlive: 1, swimRange: 800 },
  { id: 'sp-edit-17', x: 860, y: 760, fishId: 'greenish-brown', maxAlive: 1, swimRange: 360 },
  { id: 'sp-edit-18', x: 1440, y: 460, fishId: 'greenish-brown', maxAlive: 1, swimRange: 360 },
  { id: 'sp-edit-19', x: 1900, y: 140, fishId: 'greenish-brown', maxAlive: 1, swimRange: 360 },
  { id: 'sp-edit-20', x: 560, y: 940, fishId: 'olive-pike', maxAlive: 1, swimRange: 360 },
  { id: 'sp-edit-21', x: 2260, y: 260, fishId: 'olive-pike', maxAlive: 1, swimRange: 360 },
  { id: 'sp-edit-24', x: 1720, y: 380, fishId: 'pink-round', maxAlive: 1, swimRange: 360 },
  { id: 'sp-edit-28', x: 1600, y: 1180, fishId: 'blue-tuna', maxAlive: 1, swimRange: 360 },
  { id: 'sp-edit-30', x: 1840, y: 960, fishId: 'blue-tuna', maxAlive: 1, swimRange: 360 },
  { id: 'sp-edit-24', x: 2160, y: 700, fishId: 'purple-chunky', maxAlive: 1, swimRange: 360 },
]
