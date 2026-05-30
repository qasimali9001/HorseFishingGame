/** Debug overlays + dev helpers. Flip these off for a clean build. */
export const DebugConfig = {
  /** Show the on-screen debug HUD (state, depth, camera mode). */
  showOverlay: true,

  /** Show rig attachment points (mouth anchor, rod tip) as small dots. */
  showAnchors: true,
} as const
