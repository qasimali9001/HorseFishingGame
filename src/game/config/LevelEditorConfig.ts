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
  markerRingRadius: 22,
  markerHitRadius: 34,
  markerRingColor: 0xffffff,
  markerRingWidth: 2,
  selectedRingColor: 0xffd166,
  selectedRingWidth: 4,
  disabledAlpha: 0.35,
  labelColor: '#ffffff',
  labelBackground: 'rgba(0,0,0,0.55)',

  /** Keyboard edit steps for the selected point. */
  respawnStepMs: 1000,
  respawnMinMs: 1000,
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
} as const
