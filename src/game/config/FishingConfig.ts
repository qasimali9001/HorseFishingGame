/** Fishing loop tuning: lure visual, line visual, hook reach, surface thresholds. */
export const FishingConfig = {
  /** Lure visual (textured bobber + hook). */
  lure: {
    /** Uniform display scale applied to the lure texture. */
    scale: 0.08,
    /** Origin (0..1): the bobber's top eyelet, so the line attaches there. */
    originX: 0.5,
    originY: 0.12,
  },

  /** Hook contact reach (world units) used later for fish collision. */
  hookRadius: 28,

  /** Dynamic line visual (rod tip -> lure). */
  line: {
    thickness: 2,
    color: 0xf4f4f4,
    alpha: 0.9,
  },

  /**
   * While reeling, once the lure rises to within this many units of the
   * waterline it counts as landed (loop resets, camera returns to surface).
   */
  surfaceReturnDepth: 6,
} as const
