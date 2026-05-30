/** Visual tuning for the anchored cast-angle triangle preview. */
export const CastTrackerConfig = {
  /**
   * Position relative to the fixed surface anchor (world space), not the rod.
   * This keeps the indicator planted in front of the horse and independent of
   * bob/head animation.
   */
  offsetFromSurfaceAnchor: {
    x: 150,
    y: -55,
  },

  /** Triangle side lengths (world units). */
  baseLength: 46,
  angledLength: 56,

  /** Line style. */
  lineWidth: 2.5,
  normalColor: 0xf7f0c8,
  failedColor: 0xff6b6b,
  alpha: 0.95,

  /** Tiny arrow head for the direction indicator. */
  headLength: 10,
  headHalfWidth: 5,

  /** Small origin dot so the angle pivot is readable. */
  pivotRadius: 4,
} as const
