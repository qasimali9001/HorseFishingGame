import Phaser from 'phaser'
import { ShopUIConfig } from '../config/ShopUIConfig'
import { ShopChromePainter } from './ShopChromePainter'

type ToggleHandler = () => void

/**
 * Small, screen-fixed cart button used to open/close the shop window.
 */
export class ShopToggleButton {
  private readonly scene: Phaser.Scene
  private readonly root: Phaser.GameObjects.Container
  private readonly buttonSkin: Phaser.GameObjects.Graphics
  private readonly hitArea: Phaser.GameObjects.Rectangle
  private readonly cartIcon: Phaser.GameObjects.Graphics
  private readonly onToggle: ToggleHandler

  constructor(scene: Phaser.Scene, onToggle: ToggleHandler) {
    this.scene = scene
    this.onToggle = onToggle

    this.root = this.scene.add.container(0, 0).setScrollFactor(0)
    this.buttonSkin = this.scene.add.graphics()
    ShopChromePainter.drawButton(this.buttonSkin, ShopUIConfig.iconButton.size, ShopUIConfig.iconButton.size, 'close')
    this.hitArea = this.scene.add
      .rectangle(0, 0, ShopUIConfig.iconButton.size, ShopUIConfig.iconButton.size, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true })
    this.hitArea.on(Phaser.Input.Events.POINTER_DOWN, () => this.onToggle())

    this.cartIcon = this.scene.add.graphics()
    this.drawCartIcon()

    this.root.add([this.buttonSkin, this.hitArea, this.cartIcon])
  }

  layoutAt(x: number, y: number): void {
    this.root.setPosition(x, y)
  }

  setActive(isActive: boolean): void {
    this.buttonSkin.setAlpha(isActive ? 0.82 : 1)
  }

  destroy(): void {
    this.hitArea.off(Phaser.Input.Events.POINTER_DOWN)
    this.root.destroy(true)
  }

  private drawCartIcon(): void {
    const line = ShopUIConfig.iconButton.iconColor
    this.cartIcon.clear()
    this.cartIcon.lineStyle(2.2, line, 1)
    this.cartIcon.strokeRect(-11, -8, 18, 10)
    this.cartIcon.beginPath()
    this.cartIcon.moveTo(-15, -12)
    this.cartIcon.lineTo(-11, -2)
    this.cartIcon.strokePath()
    this.cartIcon.fillStyle(line, 1)
    this.cartIcon.fillCircle(-5, 7, 2.6)
    this.cartIcon.fillCircle(5, 7, 2.6)
  }
}
