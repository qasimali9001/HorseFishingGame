/**
 * Camera FRAMING + feel. This is the ONLY place that decides where world
 * objects appear on screen.
 *
 * Critical decoupling rule (see ARCHITECTURE.md):
 *   To move the player up/down the screen at rest you change `restOffsetY`
 *   here -- and ONLY here. The horse's world position, the waterline, fish
 *   depths, and follow math are all untouched. One concern, one knob.
 */
export const CameraConfig = {
  /**
   * Where the waterline sits on screen while idle at the surface, as a ratio
   * of view height (0 = top edge, 1 = bottom edge). 0.5 puts the surface (and
   * the horse standing on it) in the vertical middle of the screen.
   */
  restWaterlineScreenRatio: 0.5,

  /**
   * Where the follow target (lure) sits on screen while following, as ratios
   * of the view. 0.5 / 0.5 = screen center.
   */
  followScreenXRatio: 0.5,
  followScreenYRatio: 0.5,

  /** Native follow smoothing (0..1 per frame). Lower = smoother/laggier. */
  followLerpX: 0.08,
  followLerpY: 0.08,

  /** Deadzone (world units) so tiny lure jitter doesn't nudge the camera. */
  deadzoneWidth: 40,
  deadzoneHeight: 28,

  /**
   * Extra world padding kept below max depth so the camera never reveals empty
   * space past the bottom of the playable world.
   */
  maxDepthPadding: 200,

  /** Smooth pan back to the surface framing when a cast ends (ms). */
  surfaceReturnPanMs: 600,
} as const
