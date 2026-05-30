/**
 * Charge-cast tuning. The player presses to start charging, holds, and releases
 * to fling the lure. Hold *time* maps to the launch ELEVATION ANGLE (degrees
 * above horizontal); the launch SPEED is fixed (scaled by rod cast power). With
 * gravity (LureMotionConfig.lureGravity) the lure arcs, so a flatter angle =
 * a farther cast.
 *
 * Coordinate note: forward is +x (the horse faces right), "up" is -y. The
 * forward (+x) component is always >= 0, so a backward cast is impossible by
 * construction -- no clamp required.
 *
 * Constants only. The hold->angle interpolation + failed/normal decision live
 * in systems/CastCharge.ts (this file never contains logic).
 */
export const CastChargeConfig = {
  /** Hold <= this (a tap/click) is a FAILED cast: it pops up and flops back. */
  clickThresholdMs: 120,

  /** Holds longer than this are clamped to the max-distance angle. */
  maxChargeMs: 1000,

  /** Base launch speed (world units/sec) before the rod cast-power multiplier. */
  baseLaunchSpeed: 520,

  /** A failed cast launches weakly and steeply up, then falls back to the horse. */
  failedLaunchSpeed: 260,
  /** Near-vertical so a failed cast goes up with almost no forward travel. */
  failedAngleDeg: 85,

  /**
   * Hold-time -> elevation angle breakpoints (degrees above horizontal).
   * Longer hold => smaller angle => flatter => farther. Linearly interpolated
   * between points; clamped to the first/last entry outside the range.
   * (~45 deg is the natural max-range angle, so we stop a little above it.)
   */
  holdToAngleDeg: [
    { holdMs: 150, angleDeg: 70 },
    { holdMs: 1000, angleDeg: 40 },
  ],
} as const
