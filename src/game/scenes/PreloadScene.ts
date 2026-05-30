import Phaser from 'phaser'
import { SceneKeys } from './SceneKeys'

/**
 * Asset loading lives here. The first milestone uses Phaser shapes (no
 * textures), so this currently just launches the World + UI scenes together.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Preload)
  }

  preload(): void {
    // Placeholder shapes for now -- real textures get loaded here later.
  }

  create(): void {
    this.scene.start(SceneKeys.World)
    this.scene.launch(SceneKeys.UI)
  }
}
