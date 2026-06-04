import Phaser from 'phaser'
import { TitleTextures } from '../assets/TitleAssets'
import { TitleScreenConfig } from '../config/TitleScreenConfig'

/** Draws the title artwork and prompt. No scene flow or input lives here. */
export class TitleScreenView {
  private readonly container: Phaser.GameObjects.Container
  private readonly prompt: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene) {
    const { board } = TitleScreenConfig
    this.container = scene.add.container(board.x, board.y).setDepth(200)

    const sign = scene.add
      .image(0, 0, TitleTextures.titleScreen)
      .setOrigin(0.5)
      .setDisplaySize(board.width, board.height)
    this.container.add(sign)

    this.prompt = this.createPrompt(scene)
    this.container.add(this.prompt)

    scene.tweens.add({
      targets: this.prompt,
      alpha: 0.45,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  hidePrompt(): void {
    this.prompt.scene.tweens.killTweensOf(this.prompt)
    this.prompt.setAlpha(0)
  }

  private createPrompt(scene: Phaser.Scene): Phaser.GameObjects.Text {
    const y = TitleScreenConfig.board.height / 2 + 44
    return scene.add
      .text(0, y, TitleScreenConfig.text.prompt, {
        align: 'center',
        color: '#fff4c4',
        fontFamily: 'Georgia, serif',
        fontSize: '27px',
        fontStyle: 'bold',
        shadow: {
          offsetX: 3,
          offsetY: 3,
          color: '#2b1208',
          fill: true,
        },
      })
      .setOrigin(0.5)
  }
}
