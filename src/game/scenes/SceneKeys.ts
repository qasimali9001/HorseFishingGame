/** Stable scene identifiers so scene transitions never use string literals. */
export const SceneKeys = {
  Boot: 'BootScene',
  Preload: 'PreloadScene',
  World: 'WorldScene',
  UI: 'UIScene',
  HorseRigTest: 'HorseRigTestScene',
} as const
