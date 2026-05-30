/** Central registry of cross-module event names. */
export const GameEvents = {
  /** Fishing state machine changed state. payload: { state } */
  STATE_CHANGED: 'state-changed',
  /** A fish made contact with the hook. payload: { fishId } */
  FISH_HOOKED: 'fish-hooked',
  /** A hooked fish reached the surface and was landed. payload: { fishId, value } */
  CATCH_LANDED: 'catch-landed',
  /** A predator stole the hooked fish before landing. payload: { fishId, displayName } */
  CATCH_LOST: 'catch-lost',
  /** The lure entered a new depth biome. payload: { biomeId, displayName } */
  BIOME_CHANGED: 'biome-changed',
  /** Player money changed. payload: { money } */
  MONEY_CHANGED: 'money-changed',
  /** Camera mode changed (debug/diagnostics). payload: { mode } */
  CAMERA_MODE_CHANGED: 'camera-mode-changed',
  /** Per-frame debug snapshot for the overlay. payload: { depth, cameraMode } */
  DEBUG_TICK: 'debug-tick',
} as const

export type GameEventName = (typeof GameEvents)[keyof typeof GameEvents]
