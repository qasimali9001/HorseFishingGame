import type { FishSizeTier } from '../types/BaitTypes'

/** Fish population + spawn/movement feel. */
export const FishConfig = {
  /** Max fish alive at once (kept small for the prototype). */
  maxActive: 7,

  /** World-unit width multiplier (radius * scale) per size tier for PNG art. */
  displayWidthScaleByTier: {
    small: 2.8,
    medium: 2.9,
    large: 3.0,
    veryLarge: 3.1,
  } satisfies Record<FishSizeTier, number>,

  /** Fallback height multiplier when a texture is missing. */
  displayHeightScaleByTier: {
    small: 1.8,
    medium: 1.9,
    large: 2.0,
    veryLarge: 2.1,
  } satisfies Record<FishSizeTier, number>,

  /** Reference PNGs face left (+x is tail); flip when swimming right. */
  artFacesLeft: true,

  /** Global per-species respawn tuning (see FishDefinition.respawnMs). */
  speciesRespawn: {
    defaultMs: 9000,
    minMs: 1000,
    editorStepMs: 1000,
  },

  /** Global per-species detection radius tuning (see FishDefinition.aggressionRadius). */
  speciesAggression: {
    minRadius: 40,
    maxRadius: 1200,
    editorStepRadius: 20,
  },

  /** Global per-species swim speed tuning (see FishDefinition.speed). */
  speciesSpeed: {
    defaultSpeed: 55,
    minSpeed: 10,
    maxSpeed: 200,
    editorStepSpeed: 5,
  },

  /** Runtime multiplier applied to every species' swim speed. */
  speedMultiplier: 2,
  /** How often the spawner tries to add a fish while the lure is underwater. */
  spawnIntervalMs: 650,

  /** Spawn this far outside the current camera view (so fish swim in). */
  spawnOffscreenMargin: 70,
  /** Despawn once a fish has drifted this far beyond the view. */
  despawnOffscreenMargin: 160,

  /** Gentle vertical wobble while swimming. */
  wobbleAmplitude: 7,
  wobbleSpeed: 2.0,

  /** Hooked fish follow while dangling (per 1/60s frame). */
  hookedFollowLerp: 0.45,
  /** Tight lock to hook while reeling so the catch does not lag behind. */
  hookedFollowLerpWhileReeling: 0.92,

  /** Render depth while swimming (behind lure/line). */
  renderDepth: 5,
  /** Render depth while hooked so the fish reads on the hook. */
  hookedRenderDepth: 10,

  /**
   * Hooked pose relative to the lure bait point (see Lure.baitX/baitY). Mouth
   * meets the hook; body hangs with tail pointing downward (+y).
   */
  hookedPose: {
    /** Fine-tune mouth vs bait marker (world units). */
    hookOffsetX: 0,
    hookOffsetY: 0,
    /** Mouth inset from sprite edge as a fraction of display width (art faces left). */
    mouthLeadWidthScale: 0.48,
    /** Mouth up, tail down (+y) for left-facing PNG art in Phaser rotation space. */
    rotationDeg: 90,
    /** Gentle idle sway while dangling. */
    hangSwayDeg: 5,
    hangSwaySpeed: 1.6,
  },

  /** Simple bait/caught-fish attraction driven by FishAISystem. */
  baitAttraction: {
    /** Minimum attraction speed multiplier for tiny fish. */
    minSpeedScale: 0.45,
    /** Maximum attraction speed multiplier for larger/aggressive fish. */
    maxSpeedScale: 1.25,
    /** Fish radius range used to normalize aggression. */
    minAggressiveRadius: 10,
    maxAggressiveRadius: 28,
    /** Horizontal velocity steering toward the bait (per 1/60s). */
    steerResponse: 0.045,
    /** Vertical chase speed as a fraction of horizontal chase speed. */
    verticalSpeedRatio: 0.75,
  },

  /** When aggro drops, fish drift back to their spawn/home path. */
  returnHome: {
    /** Horizontal steering back toward the initial spawn point (per 1/60s). */
    steerResponse: 0.035,
    /** Return speed multiplier relative to the species' normal swim speed. */
    speedScale: 0.85,
    /** Stop forcing horizontal return once close enough to resume patrol. */
    horizontalTolerance: 20,
    /** Max vertical swim-line recovery speed (world units / second). */
    verticalSpeed: 55,
  },

  /** Larger free-swimming fish can steal smaller fish from the hook. */
  hookedPredation: {
    /** Extra world-unit reach added to predator radius + prey radius. */
    bitePadding: 10,
    /** Time a predator must stay in bite range before the hooked fish is stolen. */
    biteHoldSec: 0.75,
  },

  /** Fish that need bigger bait can eat undersized bait off the hook. */
  baitTheft: {
    bitePadding: 10,
    biteHoldSec: 0.65,
  },
} as const
