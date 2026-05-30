import { HorseTextures } from '../assets/HorseAssets'
import type { HorseRigLayout } from '../types/HorseTypes'

/**
 * Goofy horse rig tuning, texture-backed. All offsets are LOCAL to the horse
 * (placed in the world via WorldConfig). Up is negative Y; the horse faces
 * right, out over the water. Nothing here is a screen coordinate -- the camera
 * decides where the horse appears on screen (see CameraConfig).
 *
 * These values are dialed in with the rig test scene (`?rig` in the URL). After
 * tuning, press P in that scene to log the current layout and paste it here.
 */
export const HorseConfig: HorseRigLayout = {
  /** Seated body. Origin at bottom-centre so the seat rests on the waterline. */
  body: {
    textureKey: HorseTextures.body,
    originX: 0.5,
    originY: 1,
    offsetX: 0,
    offsetY: 8,
    scale: 0.46,
  },

  /** Neck pivot: where the head rotates (front-top of the body). */
  neck: {
    x: 76,
    y: -216,
  },

  /**
   * Head, child of the neck pivot. Origin sits near the throat/neck base so the
   * head nods/swings around that joint (not its centre).
   */
  head: {
    textureKey: HorseTextures.head,
    originX: 0.46,
    originY: 0.89,
    offsetX: 0,
    offsetY: 0,
    scale: 0.35,
  },

  /** Mouth attachment point (local to the neck pivot). The rod butt sits here. */
  mouthOffset: {
    x: 124,
    y: -69,
  },

  /** Resting rod angle out of the mouth (deg; negative = up/back). */
  restRodAngleDeg: -10,

  /** Rod display length butt -> tip (local px). */
  rodLengthPx: 230,

  /** Subtle living-idle motion. */
  idle: {
    bobAmplitude: 6,
    bobDurationMs: 1700,
    headWobbleDeg: 5,
    headWobbleDurationMs: 1500,
  },

  /**
   * Goofy cast: head winds backward dramatically, then snaps forward to fling
   * the lure, then recovers to rest. Angles are head-pivot rotations (deg).
   */
  cast: {
    backBendDeg: -120,
    windupMs: 420,
    snapForwardDeg: 40,
    snapMs: 150,
    recoverMs: 520,
  },
}
