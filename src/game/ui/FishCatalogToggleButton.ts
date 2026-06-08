import Phaser from 'phaser'
import { ShopUIConfig } from '../config/ShopUIConfig'
import { ShopChromePainter } from './ShopChromePainter'

type ToggleHandler = () => void

/**
 * Small, screen-fixed book button used to open/close the fish catalog.
 */
export class FishCatalogToggleButton {
  private readonly root: Phaser.GameObjects.Container
  private readonly buttonSkin: Phaser.GameObjects.Graphics
  private readonly hitArea: Phaser.GameObjects.Rectangle
  private readonly icon: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene, onToggle: ToggleHandler) {
    this.root = scene.add.container(0, 0).setScrollFactor(0)
    this.buttonSkin = scene.add.graphics()
    ShopChromePainter.drawButton(this.buttonSkin, ShopUIConfig.iconButton.size, ShopUIConfig.iconButton.size, 'close')
    this.hitArea = scene.add
      .rectangle(0, 0, ShopUIConfig.iconButton.size, ShopUIConfig.iconButton.size, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true })
    this.hitArea.on(Phaser.Input.Events.POINTER_DOWN, () => onToggle())

    this.icon = scene.add.graphics()
    this.drawBookIcon()
    this.root.add([this.buttonSkin, this.hitArea, this.icon])
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

  private drawBookIcon(): void {
    const line = ShopUIConfig.iconButton.iconColor
    this.icon.clear()
    this.icon.lineStyle(2.2, line, 1)
    this.icon.strokeRoundedRect(-14, -13, 28, 26, 3)
    this.icon.beginPath()
    this.icon.moveTo(0, -13)
    this.icon.lineTo(0, 13)
    this.icon.strokePath()
    this.icon.strokeEllipse(-7, 0, 10, 6)
    this.icon.beginPath()
    this.icon.moveTo(-13, -8)
    this.icon.lineTo(-3, -8)
    this.icon.moveTo(3, -8)
    this.icon.lineTo(12, -8)
    this.icon.strokePath()
  }
}
