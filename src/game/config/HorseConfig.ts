/**
 * Goofy horse rig tuning. All offsets are LOCAL to the horse, measured in the
 * horse's own space (the horse is placed in the world via WorldConfig). Up is
 * negative Y. The horse faces right, out over the water.
 *
 * Nothing here is a screen coordinate -- the camera decides where the horse
 * appears on screen (see CameraConfig).
 */
export const HorseConfig = {
  strokeColor: 0x3a2417,
  strokeWidth: 3,

  /** Body ellipse, centered above the waterline (local origin = standing point). */
  body: {
    offsetX: 0,
    offsetY: -70,
    width: 140,
    height: 92,
    color: 0xd98c5f,
  },

  /** Neck pivot: the point the whole head rotates around (front-top of body). */
  neck: {
    x: 46,
    y: -104,
  },

  /** Head + face parts, all LOCAL to the neck pivot so they rotate together. */
  head: {
    offsetX: 34,
    offsetY: -16,
    width: 74,
    height: 62,
    color: 0xe6a172,
  },
  snout: {
    offsetX: 72,
    offsetY: 4,
    width: 46,
    height: 36,
    color: 0xd98c5f,
  },
  ear: {
    offsetX: 14,
    offsetY: -48,
    width: 16,
    height: 28,
    color: 0xd98c5f,
  },
  eye: {
    offsetX: 50,
    offsetY: -20,
    radius: 6,
    color: 0x201008,
  },

  /** Mouth attachment point (LOCAL to neck pivot). The rod butt sits here. */
  mouthOffset: {
    x: 94,
    y: 10,
  },

  /** Resting rod angle out of the mouth (degrees; negative = up/back). */
  restRodAngleDeg: -58,

  /** Subtle living-idle motion. */
  idle: {
    bobAmplitude: 6,
    bobDurationMs: 1700,
    headWobbleDeg: 4,
    headWobbleDurationMs: 1500,
  },

  /**
   * Goofy cast: head winds backward dramatically, then snaps forward to fling
   * the lure, then recovers to rest. Angles are head-pivot rotations (deg).
   */
  cast: {
    backBendDeg: -125,
    windupMs: 420,
    snapForwardDeg: 38,
    snapMs: 150,
    recoverMs: 520,
  },
} as const
