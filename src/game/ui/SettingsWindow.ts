import Phaser from 'phaser'
import { SettingsUIConfig } from '../config/SettingsUIConfig'
import { audioSettings } from '../systems/AudioSettingsSystem'
import { VolumeSlider } from './VolumeSlider'

/**
 * Modal settings panel with separate music and sound-effects volume sliders.
 */
export class SettingsWindow {
  private readonly scene: Phaser.Scene
  private readonly root: Phaser.GameObjects.Container
  private readonly backdrop: Phaser.GameObjects.Rectangle
  private readonly panel: Phaser.GameObjects.Rectangle
  private readonly closeButtonBg: Phaser.GameObjects.Rectangle
  private readonly closeButtonLabel: Phaser.GameObjects.Text
  private readonly title: Phaser.GameObjects.Text
  private readonly subtitle: Phaser.GameObjects.Text
  private readonly musicSlider: VolumeSlider
  private readonly sfxSlider: VolumeSlider

  constructor(scene: Phaser.Scene, handlers: { onCloseRequested: () => void }) {
    this.scene = scene
    this.root = this.scene.add.container(0, 0).setScrollFactor(0).setVisible(false)

    this.backdrop = this.scene.add
      .rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, SettingsUIConfig.window.backdropColor)
      .setOrigin(0)
      .setAlpha(SettingsUIConfig.window.backdropAlpha)
      .setInteractive({ useHandCursor: true })
    this.backdrop.on(Phaser.Input.Events.POINTER_DOWN, () => handlers.onCloseRequested())

    this.panel = this.scene.add
      .rectangle(0, 0, SettingsUIConfig.window.width, SettingsUIConfig.window.height, SettingsUIConfig.window.panelColor)
      .setStrokeStyle(SettingsUIConfig.window.panelBorderWidth, SettingsUIConfig.window.panelBorderColor)
      .setAlpha(SettingsUIConfig.window.panelAlpha)
      .setInteractive()

    this.title = this.scene.add
      .text(0, 0, 'Settings', {
        fontFamily: 'monospace',
        fontSize: '30px',
        color: SettingsUIConfig.window.titleColor,
      })
      .setOrigin(0.5, 0)

    this.subtitle = this.scene.add
      .text(0, 0, 'Adjust audio levels.', {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: SettingsUIConfig.window.subtitleColor,
      })
      .setOrigin(0.5, 0)

    this.closeButtonBg = this.scene.add
      .rectangle(0, 0, 56, 32, 0x234055, 0.95)
      .setStrokeStyle(2, 0xa6d9ed)
      .setInteractive({ useHandCursor: true })
    this.closeButtonBg.on(Phaser.Input.Events.POINTER_DOWN, () => handlers.onCloseRequested())

    this.closeButtonLabel = this.scene.add
      .text(0, 0, 'Close', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ebf7ff',
      })
      .setOrigin(0.5)

    this.musicSlider = new VolumeSlider(
      this.scene,
      'Music volume',
      audioSettings.getMusicVolume(),
      (value) => audioSettings.setMusicVolume(value),
    )

    this.sfxSlider = new VolumeSlider(
      this.scene,
      'Sound effects volume',
      audioSettings.getSfxVolume(),
      (value) => audioSettings.setSfxVolume(value),
    )

    this.root.add([
      this.backdrop,
      this.panel,
      this.title,
      this.subtitle,
      this.closeButtonBg,
      this.closeButtonLabel,
      this.musicSlider.root,
      this.sfxSlider.root,
    ])
    this.layout()
  }

  get isOpen(): boolean {
    return this.root.visible
  }

  setOpen(nextOpen: boolean): void {
    this.root.setVisible(nextOpen)
    if (nextOpen) {
      this.musicSlider.setValue(audioSettings.getMusicVolume())
      this.sfxSlider.setValue(audioSettings.getSfxVolume())
    }
  }

  layout(): void {
    this.backdrop.setSize(this.scene.scale.width, this.scene.scale.height)

    const centerX = this.scene.scale.width * 0.5
    const centerY = this.scene.scale.height * 0.5
    const panelTop = centerY - SettingsUIConfig.window.height * 0.5
    const contentLeft = centerX - SettingsUIConfig.slider.trackWidth * 0.5

    this.panel.setPosition(centerX, centerY)
    this.title.setPosition(centerX, panelTop + 16)
    this.subtitle.setPosition(centerX, panelTop + 52)
    this.closeButtonBg.setPosition(centerX + SettingsUIConfig.window.width * 0.5 - 48, panelTop + 26)
    this.closeButtonLabel.setPosition(this.closeButtonBg.x, this.closeButtonBg.y)

    this.musicSlider.root.setPosition(contentLeft, panelTop + SettingsUIConfig.slider.firstRowYOffset)
    this.sfxSlider.root.setPosition(
      contentLeft,
      panelTop + SettingsUIConfig.slider.firstRowYOffset + SettingsUIConfig.slider.rowGap,
    )
  }

  destroy(): void {
    this.backdrop.off(Phaser.Input.Events.POINTER_DOWN)
    this.closeButtonBg.off(Phaser.Input.Events.POINTER_DOWN)
    this.musicSlider.destroy()
    this.sfxSlider.destroy()
    this.root.destroy(true)
  }
}
