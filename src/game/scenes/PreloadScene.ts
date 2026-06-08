import Phaser from 'phaser'
import { SceneKeys } from './SceneKeys'
import { loadHorseAssets } from '../assets/HorseAssets'
import { loadRodAssets } from '../assets/RodAssets'
import { loadLureAssets } from '../assets/LureAssets'
import { loadFishAssets } from '../assets/FishAssets'
import { loadTitleAssets } from '../assets/TitleAssets'
import { loadAudioAssets } from '../assets/AudioAssets'
import { loadShopIconAssets } from '../assets/ShopIconAssets'

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
    loadRodAssets(this)
    loadLureAssets(this)
    loadTitleAssets(this)
    loadFishAssets(this)
    loadShopIconAssets(this)
    loadAudioAssets(this)
  }

  create(): void {
    this.scene.start(SceneKeys.Title)
  }
}
