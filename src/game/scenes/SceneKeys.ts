/** Stable scene identifiers so scene transitions never use string literals. */
export const SceneKeys = {
  Boot: 'BootScene',
  Preload: 'PreloadScene',
  Title: 'TitleScene',
  World: 'WorldScene',
  UI: 'UIScene',
  HorseRigTest: 'HorseRigTestScene',
  LevelEditor: 'LevelEditorScene',
} as const
