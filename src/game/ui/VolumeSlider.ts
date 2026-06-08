import Phaser from 'phaser'
import { SettingsUIConfig } from '../config/SettingsUIConfig'

type VolumeChangeHandler = (value: number) => void

/**
 * Horizontal 0–1 volume slider for settings panels.
 */
export class VolumeSlider {
  readonly root: Phaser.GameObjects.Container

  private readonly scene: Phaser.Scene
  private readonly track: Phaser.GameObjects.Rectangle
  private readonly fill: Phaser.GameObjects.Rectangle
  private readonly handle: Phaser.GameObjects.Rectangle
  private readonly label: Phaser.GameObjects.Text
  private readonly valueText: Phaser.GameObjects.Text
  private readonly trackWidth: number
  private readonly onChange: VolumeChangeHandler
  private value: number
  private dragging = false

  constructor(
    scene: Phaser.Scene,
    label: string,
    initialValue: number,
    onChange: VolumeChangeHandler,
  ) {
    this.scene = scene
    this.onChange = onChange
    this.trackWidth = SettingsUIConfig.slider.trackWidth
    this.value = Phaser.Math.Clamp(initialValue, 0, 1)

    this.root = scene.add.container(0, 0)

    this.label = scene.add
      .text(0, -28, label, {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        color: SettingsUIConfig.slider.labelColor,
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5)

    this.valueText = scene.add
      .text(this.trackWidth, -28, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '17px',
        color: SettingsUIConfig.slider.valueColor,
        fontStyle: 'bold',
      })
      .setOrigin(1, 0.5)

    this.track = scene.add
      .rectangle(0, 0, this.trackWidth, SettingsUIConfig.slider.trackHeight, SettingsUIConfig.slider.trackColor, 0.95)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, SettingsUIConfig.slider.trackBorderColor)
      .setInteractive({ useHandCursor: true })

    this.fill = scene.add
      .rectangle(0, 0, 0, SettingsUIConfig.slider.trackHeight, SettingsUIConfig.slider.fillColor, 1)
      .setOrigin(0, 0.5)

    const handleSize = SettingsUIConfig.slider.handleSize
    this.handle = scene.add
      .rectangle(0, 0, handleSize, handleSize, SettingsUIConfig.slider.handleColor, 1)
      .setStrokeStyle(2, SettingsUIConfig.slider.handleBorderColor)
      .setInteractive({ useHandCursor: true, draggable: true })

    this.root.add([this.label, this.valueText, this.track, this.fill, this.handle])
    this.bindInput()
    this.refreshVisuals()
  }

  setValue(nextValue: number, emitChange = false): void {
    this.value = Phaser.Math.Clamp(nextValue, 0, 1)
    this.refreshVisuals()
    if (emitChange) {
      this.onChange(this.value)
    }
  }

  destroy(): void {
    this.unbindInput()
    this.root.destroy(true)
  }

  private bindInput(): void {
    this.track.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
      this.setValueFromPointer(pointer, true)
      this.dragging = true
    })

    this.handle.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.dragging = true
    })

    this.scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.handlePointerMove)
    this.scene.input.on(Phaser.Input.Events.POINTER_UP, this.handlePointerUp)
  }

  private unbindInput(): void {
    this.track.off(Phaser.Input.Events.POINTER_DOWN)
    this.handle.off(Phaser.Input.Events.POINTER_DOWN)
    this.scene.input.off(Phaser.Input.Events.POINTER_MOVE, this.handlePointerMove)
    this.scene.input.off(Phaser.Input.Events.POINTER_UP, this.handlePointerUp)
  }

  private readonly handlePointerMove = (pointer: Phaser.Input.Pointer): void => {
    if (!this.dragging) {
      return
    }
    this.setValueFromPointer(pointer, true)
  }

  private readonly handlePointerUp = (): void => {
    this.dragging = false
  }

  private setValueFromPointer(pointer: Phaser.Input.Pointer, emitChange: boolean): void {
    const matrix = this.root.getWorldTransformMatrix()
    const trackLeft = matrix.tx
    const localX = Phaser.Math.Clamp(pointer.x - trackLeft, 0, this.trackWidth)
    this.setValue(localX / this.trackWidth, emitChange)
  }

  private refreshVisuals(): void {
    const fillWidth = Math.max(2, this.trackWidth * this.value)
    this.fill.width = fillWidth

    this.handle.x = fillWidth
    this.handle.y = 0

    this.valueText.setText(`${Math.round(this.value * 100)}%`)
    this.valueText.x = this.trackWidth
  }
}
