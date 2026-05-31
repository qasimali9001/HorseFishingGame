import Phaser from 'phaser'
import { ShopUIConfig } from '../config/ShopUIConfig'

type ToggleHandler = () => void

/**
 * Small, screen-fixed cart button used to open/close the shop window.
 */
export class ShopToggleButton {
  private readonly scene: Phaser.Scene
  private readonly root: Phaser.GameObjects.Container
  private readonly buttonBg: Phaser.GameObjects.Rectangle
  private readonly cartIcon: Phaser.GameObjects.Graphics
  private readonly onToggle: ToggleHandler

  constructor(scene: Phaser.Scene, onToggle: ToggleHandler) {
    this.scene = scene
    this.onToggle = onToggle

    this.root = this.scene.add.container(0, 0).setScrollFactor(0)
    this.buttonBg = this.scene.add
      .rectangle(0, 0, ShopUIConfig.iconButton.size, ShopUIConfig.iconButton.size, ShopUIConfig.iconButton.fillColor)
      .setAlpha(ShopUIConfig.iconButton.fillAlpha)
      .setStrokeStyle(ShopUIConfig.iconButton.strokeWidth, ShopUIConfig.iconButton.strokeColor)
      .setInteractive({ useHandCursor: true })
    this.buttonBg.on(Phaser.Input.Events.POINTER_DOWN, () => this.onToggle())

    this.cartIcon = this.scene.add.graphics()
    this.drawCartIcon()

    this.root.add([this.buttonBg, this.cartIcon])
    this.layout()
  }

  layout(): void {
    const half = ShopUIConfig.iconButton.size * 0.5
    this.root.setPosition(this.scene.scale.width - ShopUIConfig.iconButton.edgePadding - half, 86)
  }

  setActive(isActive: boolean): void {
    const activeAlpha = isActive ? 0.82 : ShopUIConfig.iconButton.fillAlpha
    this.buttonBg.setAlpha(activeAlpha)
  }

  destroy(): void {
    this.buttonBg.off(Phaser.Input.Events.POINTER_DOWN)
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
