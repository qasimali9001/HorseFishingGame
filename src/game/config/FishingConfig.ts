/** Fishing loop tuning: lure visual, line visual, hook reach, surface thresholds. */
export const FishingConfig = {
  /** Lure placeholder visual. */
  lure: {
    radius: 9,
    color: 0xffd166,
    strokeColor: 0x3a2417,
    strokeWidth: 2,
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
