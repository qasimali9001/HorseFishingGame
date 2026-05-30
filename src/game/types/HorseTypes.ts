/**
 * Data-driven layout for the goofy horse rig. Everything here is LOCAL to the
 * horse (the horse is placed in the world via WorldConfig); nothing is a screen
 * coordinate. Up is negative Y, the horse faces right out over the water.
 *
 * This is the single contract the rig test scene tunes and the game consumes,
 * so dialing values in the tuner and pasting them into HorseConfig is all that
 * stands between "test rig" and "shipped rig".
 */

/** One textured rig part placed relative to its parent's origin. */
export interface HorseSpritePart {
  /** Texture key (see HorseTextures). */
  textureKey: string
  /** Texture origin (0..1). For the head this doubles as its rotation pivot. */
  originX: number
  originY: number
  /** Position relative to the parent container's origin (local px). */
  offsetX: number
  offsetY: number
  /** Uniform display scale applied to the texture. */
  scale: number
}

/** Subtle "alive" idle motion. */
export interface HorseIdleConfig {
  bobAmplitude: number
  bobDurationMs: number
  headWobbleDeg: number
  headWobbleDurationMs: number
}

/** Goofy cast: head winds back, snaps forward, recovers. Head-pivot angles (deg). */
export interface HorseCastConfig {
  backBendDeg: number
  windupMs: number
  snapForwardDeg: number
  snapMs: number
  recoverMs: number
}

export interface HorseRigLayout {
  /** Seated body, child of the root container. */
  body: HorseSpritePart
  /** Neck pivot: the point the whole head + rod rotate around (local to root). */
  neck: { x: number; y: number }
  /** Head, child of the neck pivot. Its origin is the rotation pivot. */
  head: HorseSpritePart
  /** Mouth attachment point (local to the neck pivot). The rod butt sits here. */
  mouthOffset: { x: number; y: number }
  /** Resting rod angle out of the mouth (deg; negative = up/back). */
  restRodAngleDeg: number
  /** Rod display length butt -> tip (local px). */
  rodLengthPx: number
  idle: HorseIdleConfig
  cast: HorseCastConfig
}
