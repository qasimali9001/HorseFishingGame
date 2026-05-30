import Phaser from 'phaser'
import { SceneKeys } from './SceneKeys'
import { loadHorseAssets } from '../assets/HorseAssets'

/**
 * Asset loading lives here. Loads the horse rig textures, then launches the
 * World + UI scenes together.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Preload)
  }

  preload(): void {
    loadHorseAssets(this)
  }

  create(): void {
    this.scene.start(SceneKeys.World)
    this.scene.launch(SceneKeys.UI)
  }
}
