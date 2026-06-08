import Phaser from 'phaser'
import { ShopUIConfig } from '../config/ShopUIConfig'
import { ShopChromePainter } from './ShopChromePainter'

type ToggleHandler = () => void

/**
 * Small, screen-fixed gear button used to open/close the settings window.
 */
export class SettingsToggleButton {
  private readonly scene: Phaser.Scene
  private readonly root: Phaser.GameObjects.Container
  private readonly buttonSkin: Phaser.GameObjects.Graphics
  private readonly hitArea: Phaser.GameObjects.Rectangle
  private readonly gearIcon: Phaser.GameObjects.Graphics
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

    this.gearIcon = this.scene.add.graphics()
    this.drawGearIcon()

    this.root.add([this.buttonSkin, this.hitArea, this.gearIcon])
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

  private drawGearIcon(): void {
    const line = ShopUIConfig.iconButton.iconColor
    this.gearIcon.clear()
    this.gearIcon.lineStyle(2, line, 1)
    this.gearIcon.strokeCircle(0, 0, 8)
    this.gearIcon.fillStyle(line, 1)
    this.gearIcon.fillCircle(0, 0, 3)

    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      this.gearIcon.fillRect(cos * 10 - 1.5, sin * 10 - 3, 3, 6)
    }
  }
}
