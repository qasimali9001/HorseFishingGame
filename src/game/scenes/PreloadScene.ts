import Phaser from 'phaser'
import { SceneKeys } from './SceneKeys'
import { loadHorseAssets } from '../assets/HorseAssets'
import { loadFishAssets } from '../assets/FishAssets'
import { loadTitleAssets } from '../assets/TitleAssets'

/**
 * Asset loading lives here. Loads the horse rig textures, then launches the
 * player-facing title scene.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Preload)
  }

  preload(): void {
    loadHorseAssets(this)
    loadTitleAssets(this)
    loadFishAssets(this)
  }

  create(): void {
    this.scene.start(SceneKeys.Title)
  }
}
