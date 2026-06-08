import Phaser from 'phaser'
import { SettingsUIConfig } from '../config/SettingsUIConfig'
import { audioSettings } from '../systems/AudioSettingsSystem'
import { ShopChromePainter } from './ShopChromePainter'
import { VolumeSlider } from './VolumeSlider'

/**
 * Modal settings panel with separate music and sound-effects volume sliders.
 */
export class SettingsWindow {
  private readonly scene: Phaser.Scene
  private readonly root: Phaser.GameObjects.Container
  private readonly backdrop: Phaser.GameObjects.Rectangle
  private readonly frame: Phaser.GameObjects.Graphics
  private readonly contentPanel: Phaser.GameObjects.Graphics
  private readonly panelHitArea: Phaser.GameObjects.Rectangle
  private readonly closeButtonSkin: Phaser.GameObjects.Graphics
  private readonly closeButtonHitArea: Phaser.GameObjects.Rectangle
  private readonly titleShadow: Phaser.GameObjects.Text
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

    this.frame = this.scene.add.graphics()
    this.contentPanel = this.scene.add.graphics()
    this.panelHitArea = this.scene.add
      .rectangle(0, 0, SettingsUIConfig.window.width, SettingsUIConfig.window.height, 0xffffff, 0.001)
      .setInteractive()
    this.panelHitArea.on(Phaser.Input.Events.POINTER_DOWN, () => undefined)

    this.titleShadow = this.scene.add
      .text(0, 0, 'Settings', {
        fontFamily: 'Georgia, serif',
        fontSize: '34px',
        color: '#1b0d05',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)

    this.title = this.scene.add
      .text(0, 0, 'Settings', {
        fontFamily: 'Georgia, serif',
        fontSize: '34px',
        color: SettingsUIConfig.window.titleColor,
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)

    this.subtitle = this.scene.add
      .text(0, 0, 'Adjust audio levels.', {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        color: SettingsUIConfig.window.subtitleColor,
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)

    this.closeButtonSkin = this.scene.add.graphics()
    this.closeButtonHitArea = this.scene.add
      .rectangle(0, 0, 92, 38, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true })
    this.closeButtonHitArea.on(Phaser.Input.Events.POINTER_DOWN, () => handlers.onCloseRequested())

    this.closeButtonLabel = this.scene.add
      .text(0, 0, 'Close', {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        color: '#2a160a',
        fontStyle: 'bold',
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
      this.frame,
      this.contentPanel,
      this.panelHitArea,
      this.titleShadow,
      this.title,
      this.subtitle,
      this.closeButtonSkin,
      this.closeButtonHitArea,
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

    this.frame.setPosition(centerX, centerY)
    ShopChromePainter.drawWindowFrame(this.frame, SettingsUIConfig.window.width, SettingsUIConfig.window.height)
    this.contentPanel.setPosition(centerX, centerY + 30)
    ShopChromePainter.drawParchmentPanel(this.contentPanel, SettingsUIConfig.window.width - 54, SettingsUIConfig.window.height - 112, 10)
    this.panelHitArea.setPosition(centerX, centerY)
    this.titleShadow.setPosition(centerX + 3, panelTop + 19)
    this.title.setPosition(centerX, panelTop + 14)
    this.subtitle.setPosition(centerX, panelTop + 58)
    this.closeButtonSkin.setPosition(centerX + SettingsUIConfig.window.width * 0.5 - 74, panelTop + 37)
    ShopChromePainter.drawButton(this.closeButtonSkin, 92, 38, 'close')
    this.closeButtonHitArea.setPosition(this.closeButtonSkin.x, this.closeButtonSkin.y)
    this.closeButtonLabel.setPosition(this.closeButtonSkin.x, this.closeButtonSkin.y)

    this.musicSlider.root.setPosition(contentLeft, panelTop + SettingsUIConfig.slider.firstRowYOffset)
    this.sfxSlider.root.setPosition(
      contentLeft,
      panelTop + SettingsUIConfig.slider.firstRowYOffset + SettingsUIConfig.slider.rowGap,
    )
  }

  destroy(): void {
    this.backdrop.off(Phaser.Input.Events.POINTER_DOWN)
    this.panelHitArea.off(Phaser.Input.Events.POINTER_DOWN)
    this.closeButtonHitArea.off(Phaser.Input.Events.POINTER_DOWN)
    this.musicSlider.destroy()
    this.sfxSlider.destroy()
    this.root.destroy(true)
  }
}
