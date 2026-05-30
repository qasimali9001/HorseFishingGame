import Phaser from 'phaser'
import { SceneKeys } from './SceneKeys'

/** First scene. Reserved for one-time setup; hands off to preload. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Boot)
  }

  create(): void {
    this.scene.start(SceneKeys.Preload)
  }
}
