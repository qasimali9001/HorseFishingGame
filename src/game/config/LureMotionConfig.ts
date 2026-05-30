/**
 * Lure movement feel. The lure mostly moves vertically; reeling preserves a
 * little decaying horizontal drift (never direct steering). Velocities are in
 * world units per second; drag/retention are per-1/60s and applied
 * frame-rate-independently in Lure.update().
 */
export const LureMotionConfig = {
  /** Cast launch velocity out of the rod tip (toward the water = +x, down = +y). */
  castHorizontalVelocity: 150,
  castDownwardVelocity: 230,

  /** Constant sink speed once underwater and not reeling. */
  sinkVelocity: 95,
  /** Upward speed while reeling. */
  reelUpVelocity: 200,

  /** Horizontal momentum kept per 1/60s while reeling (closer to 1 = driftier). */
  horizontalMomentumRetentionWhileReeling: 0.92,
  /** Horizontal momentum kept per 1/60s while sinking. */
  horizontalDrag: 0.985,
  /** Clamp so drift never becomes steering. */
  maxHorizontalVelocity: 180,

  /** Downward acceleration while airborne (0 = straight-line cast). */
  lureGravity: 0,

  /** Gentle motion while the lure hangs at the end of the line (max depth). */
  hangBobAmplitude: 7,
  hangBobSpeed: 2.2,
  hangSwayAmplitude: 12,
  hangSwaySpeed: 1.1,
} as const
