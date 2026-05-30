/**
 * World-space constants. These describe the GAME WORLD, never the screen.
 *
 * Coordinate system:
 *   - `y = 0` is the waterline (WATERLINE_Y).
 *   - `+y` goes downward into the water.
 *   - `-y` goes upward into the sky/air.
 *   - depth = Math.max(0, lure.y)
 *
 * Nothing here is a screen pixel. Where the world appears on screen is owned
 * entirely by the camera (see CameraConfig + CameraController).
 */
export const WorldConfig = {
  /** Logical render size. Scale manager fits this to the window. */
  viewWidth: 1280,
  viewHeight: 720,

  /** The waterline. The whole world is anchored to this single world Y. */
  waterlineY: 0,

  /** Horizontal world extent the lure/fish can occupy. */
  worldLeftX: 0,
  worldWidth: 2400,

  /**
   * World X where the surface character (horse) stands. The idle camera
   * centers horizontally on this. A WORLD coordinate -- not a screen pixel.
   */
  surfaceAnchorX: 360,

  /** How far above the waterline the sky/air world extends (negative space). */
  skyHeight: 600,

  /** Max depth reachable for the first milestone (world units below waterline). */
  maxDepth: 4000,
} as const

/** Rightmost world X. */
export const worldRightX = WorldConfig.worldLeftX + WorldConfig.worldWidth
