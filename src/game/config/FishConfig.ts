/** Fish population + spawn/movement feel. */
export const FishConfig = {
  /** Max fish alive at once (kept small for the prototype). */
  maxActive: 7,
  /** How often the spawner tries to add a fish while the lure is underwater. */
  spawnIntervalMs: 650,

  /** Spawn this far outside the current camera view (so fish swim in). */
  spawnOffscreenMargin: 70,
  /** Despawn once a fish has drifted this far beyond the view. */
  despawnOffscreenMargin: 160,

  /** Gentle vertical wobble while swimming. */
  wobbleAmplitude: 7,
  wobbleSpeed: 2.0,

  /** How quickly a hooked fish snaps to the lure (per 1/60s). */
  hookedFollowLerp: 0.25,

  /** Render depth while swimming (behind lure/line). */
  renderDepth: 5,
  /** Render depth while hooked so the fish reads on the hook. */
  hookedRenderDepth: 10,

  /**
   * Hooked pose relative to the lure anchor (bobber eyelet). The fish mouth
   * meets the hook and the body hangs nose-down.
   */
  hookedPose: {
    /** Hook position offset from lure world position. */
    hookOffsetX: 0,
    hookOffsetY: 34,
    /** How far the fish mouth sits from its body center (along the head axis). */
    mouthLeadRadiusScale: 0.72,
    /** Nose-down hang angle (fish art points right at 0 deg). */
    rotationDeg: 92,
    /** Gentle idle sway while dangling. */
    hangSwayDeg: 5,
    hangSwaySpeed: 1.6,
  },

  /** Simple bait attraction driven by FishAISystem. Bigger fish react harder. */
  baitAttraction: {
    /** Base lure proximity (world units) in which fish start to care. */
    baseRadius: 230,
    /** Extra reaction radius per fish radius unit. */
    radiusPerFishSize: 5,
    /** Minimum attraction speed multiplier for tiny fish. */
    minSpeedScale: 0.45,
    /** Maximum attraction speed multiplier for larger/aggressive fish. */
    maxSpeedScale: 1.25,
    /** Fish radius range used to normalize aggression. */
    minAggressiveRadius: 10,
    maxAggressiveRadius: 28,
    /** Horizontal velocity steering toward the bait (per 1/60s). */
    steerResponse: 0.045,
    /** Vertical attraction speed range (world units / second). */
    minVerticalSpeed: 18,
    maxVerticalSpeed: 70,
  },
} as const
