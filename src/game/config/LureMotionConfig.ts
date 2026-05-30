/**
 * Lure movement feel. The lure mostly moves vertically; reeling preserves a
 * little decaying horizontal drift (never direct steering). Velocities are in
 * world units per second; drag/retention are per-1/60s and applied
 * frame-rate-independently in Lure.update().
 */
export const LureMotionConfig = {
  /** Constant sink speed once underwater and not reeling. */
  sinkVelocity: 95,
  /** Upward speed while reeling. */
  reelUpVelocity: 200,
  /** How quickly reel motion turns toward the rod target (per 1/60s frame). */
  reelDirectionResponse: 0.2,

  /** Horizontal momentum kept per 1/60s while reeling (closer to 1 = driftier). */
  horizontalMomentumRetentionWhileReeling: 0.92,
  /** Horizontal momentum kept per 1/60s while sinking. */
  horizontalDrag: 0.985,
  /** Clamp so drift never becomes steering. */
  maxHorizontalVelocity: 180,

  /** Downward acceleration (world units/sec^2) while the lure is airborne, so a
   *  charged cast arcs (rises, then falls into the water). */
  lureGravity: 900,

  /** Gentle motion while the lure hangs at the end of the line (max depth). */
  hangBobAmplitude: 1.5,
  hangBobSpeed: 2.2,
  hangSwayAmplitude: 0,
  hangSwaySpeed: 1.1,
} as const
