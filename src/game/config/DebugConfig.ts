/** Debug overlays + dev helpers. Flip these off for a clean build. */
export const DebugConfig = {
  /** Show the on-screen debug HUD (state, depth, camera mode). */
  showOverlay: true,

  /** Show the old world-space ruler grid over the real scene art. */
  showWorldGrid: false,

  /** Show rig attachment points (mouth anchor, rod tip) as small dots. */
  showAnchors: false,
} as const
