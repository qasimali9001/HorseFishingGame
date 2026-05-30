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

  /** Render depth so fish sit behind the line + lure but above the backdrop. */
  renderDepth: 5,
} as const
