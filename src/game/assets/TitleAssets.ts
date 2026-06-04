import Phaser from 'phaser'
import titleScreenUrl from '../../assets/title/title_screen.png'

/** Texture keys and loader for the title-screen artwork. */
export const TitleTextures = {
  titleScreen: 'title-screen',
} as const

/** Queues title-screen artwork on the given scene's loader. */
export function loadTitleAssets(scene: Phaser.Scene): void {
  if (!scene.textures.exists(TitleTextures.titleScreen)) {
    scene.load.image(TitleTextures.titleScreen, titleScreenUrl)
  }
}
