import Phaser from 'phaser'
import { ShopUIConfig } from '../config/ShopUIConfig'
import { SettingsUIConfig } from '../config/SettingsUIConfig'

type ToggleHandler = () => void

/**
 * Small, screen-fixed gear button used to open/close the settings window.
 */
export class SettingsToggleButton {
  private readonly scene: Phaser.Scene
  private readonly root: Phaser.GameObjects.Container
  private readonly buttonBg: Phaser.GameObjects.Rectangle
  private readonly gearIcon: Phaser.GameObjects.Graphics
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

    this.gearIcon = this.scene.add.graphics()
    this.drawGearIcon()

    this.root.add([this.buttonBg, this.gearIcon])
    this.layout()
  }

  layout(): void {
    const half = ShopUIConfig.iconButton.size * 0.5
    this.root.setPosition(
      this.scene.scale.width - ShopUIConfig.iconButton.edgePadding - half,
      SettingsUIConfig.iconButton.topOffset,
    )
  }

  setActive(isActive: boolean): void {
    const activeAlpha = isActive ? 0.82 : ShopUIConfig.iconButton.fillAlpha
    this.buttonBg.setAlpha(activeAlpha)
  }

  destroy(): void {
    this.buttonBg.off(Phaser.Input.Events.POINTER_DOWN)
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
