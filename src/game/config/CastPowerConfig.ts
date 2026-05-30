/**
 * Charge-cast tuning for the simplified power bar model.
 * Hold duration maps to a normalized cast power (0..1), which controls:
 *   - launch speed (farther cast at higher power)
 */
export const CastPowerConfig = {
  /** Holds longer than this are clamped to full power. */
  maxChargeMs: 1000,

  /** Launch speed range before rod cast-power multiplier. */
  minLaunchSpeed: 260,
  maxLaunchSpeed: 560,

  /**
   * Fixed launch elevation above horizontal (forward = +x, up = -y).
   * Angle is no longer player-controlled.
   */
  launchAngleDeg: 52,
} as const
