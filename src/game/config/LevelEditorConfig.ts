/**
 * Constants for the dev-only level editor scene (`?editor` in the URL). The
 * editor works directly in WORLD coordinates (the same space fish/lure use), so
 * a placed point's x/y can be pasted straight into spawnPointData.
 */
export const LevelEditorConfig = {
  /** Backdrop colours (the editor draws its own simple world reference). */
  skyColor: 0x8ecae6,
  waterColorTop: 0x2f93b8,
  waterColorBottom: 0x06222f,
  waterlineColor: 0xffffff,

  /** Placement grid: points snap to this world-unit step. */
  gridStep: 20,
  /** Visible reference grid spacing (coarser than the snap step). */
  gridDrawStep: 100,
  gridColor: 0x2b88a8,
  gridAlpha: 0.25,
  /** Depth ruler labels every N world units. */
  depthLabelStep: 250,
  rulerColor: 0xbfe6f2,

  /** Camera pan speed (world units / second) for WASD / arrow keys. */
  panSpeed: 900,
  /** Mouse-wheel zoom step + clamp. */
  zoomStep: 0.1,
  zoomMin: 0.35,
  zoomMax: 2.0,

  /** Start in selection mode so clicks never create points accidentally. */
  addOnClickDefault: false,

  /** Spawn-point marker visuals. */
  markerRingRadius: 26,
  /**
   * Rectangular click target covering the fish preview + label (local coords).
   * The label sits below the spawn point, so a center circle misses most clicks.
   */
  markerHitArea: {
    halfWidth: 96,
    top: -52,
    bottom: 92,
  },
  markerRingColor: 0xffffff,
  markerRingWidth: 2,
  selectedRingColor: 0xffd166,
  selectedRingWidth: 4,
  disabledAlpha: 0.35,
  labelColor: '#ffffff',
  labelBackground: 'rgba(0,0,0,0.55)',

  /** Mini bar above each marker showing species respawn time at a glance. */
  respawnIndicator: {
    width: 70,
    height: 7,
    y: -48,
    backgroundColor: 0x0b1020,
    backgroundAlpha: 0.75,
    outlineColor: 0xffffff,
    outlineAlpha: 0.65,
    fastColor: 0x54d86a,
    slowColor: 0xff6b6b,
  },

  /** Keyboard edit steps for the selected spawn point. */
  moveStep: 20,
  maxAliveStep: 1,
  maxAliveMin: 1,
  maxAliveMax: 8,

  /** Horizontal swim range edited per spawn point. */
  defaultSwimRange: 360,
  swimRangeStep: 40,
  swimRangeMin: 80,
  swimRangeMax: 1200,

  /** Selected spawn-point patrol range visual. */
  swimRangeColor: 0xffd166,
  swimRangeAlpha: 0.8,
  swimRangeWidth: 3,

  /** Selected species bait/hooked-fish detection radius visual. */
  aggressionRangeColor: 0xff6b6b,
  aggressionRangeAlpha: 0.28,
  aggressionRangeWidth: 2,

  /** Runtime horse anchor (WorldConfig.surfaceAnchorX on the waterline). */
  horseSpawn: {
    depth: 2,
    color: 0xff6b6b,
    ringRadius: 32,
    ringWidth: 3,
    guideAbove: 140,
    guideBelow: 100,
    guideWidth: 2,
    guideAlpha: 0.55,
    label: 'horse spawn',
    labelFontSize: 13,
    labelColor: '#ffffff',
    labelBackground: 'rgba(180, 40, 40, 0.75)',
  },
} as const
