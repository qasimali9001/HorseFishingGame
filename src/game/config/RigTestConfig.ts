/**
 * Constants for the isolated rig test scene (`?rig` in the URL). This scene is
 * a dev harness for dialing in HorseConfig -- it deliberately does NOT use the
 * world/camera, so these are plain screen pixels for a fixed, framed stage.
 */
export const RigTestConfig = {
  skyColor: 0x9fd3e8,
  waterColor: 0x14668a,
  groundLineColor: 0xffffff,

  /** Where the horse's root (its seat on the waterline) sits on screen. */
  horseScreenX: 540,
  waterlineScreenY: 500,

  /** Lure preview hung straight below the rod tip while previewing. */
  lurePreviewDrop: 90,
  lineColor: 0xf4f4f4,
  lineThickness: 2,

  /** Tuner step multiplier while SHIFT is held (coarse adjust). */
  coarseStepMultiplier: 5,

  /** Draggable anchor handles in the rig harness (screen-space, above the horse). */
  anchorHandleRadius: 14,
  anchorHandleStroke: 0xffffff,
  anchorHandleStrokeWidth: 2,
  neckHandleColor: 0xff2d6f,
  mouthHandleColor: 0x2d6fff,
  rodTipHandleColor: 0x2dd4bf,
} as const
