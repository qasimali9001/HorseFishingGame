import Phaser from 'phaser'
import { SceneKeys } from './SceneKeys'
import { loadHorseAssets, HorseTextures } from '../assets/HorseAssets'
import { PlayerHorse } from '../entities/PlayerHorse'
import { RigTuner } from '../dev/RigTuner'
import { RigTestConfig } from '../config/RigTestConfig'
import { FishingConfig } from '../config/FishingConfig'
import { WorldConfig } from '../config/WorldConfig'

/**
 * Isolated dev harness for the horse rig (launched with `?rig` in the URL). It
 * runs ONLY this scene -- no world, no camera, no fishing loop -- so the rig can
 * be tuned in a stable, framed stage. It reuses the real PlayerHorse class, so
 * whatever looks right here looks identical in the game once HorseConfig is
 * updated with the tuned values (press P to log them).
 */
export class HorseRigTestScene extends Phaser.Scene {
  private horse!: PlayerHorse
  private tuner!: RigTuner
  private lurePreview!: Phaser.GameObjects.Image
  private previewLine!: Phaser.GameObjects.Graphics
  private previewOn = true

  constructor() {
    super(SceneKeys.HorseRigTest)
  }

  preload(): void {
    loadHorseAssets(this)
  }

  create(): void {
    this.drawStage()

    this.horse = new PlayerHorse(
      this,
      RigTestConfig.horseScreenX,
      RigTestConfig.waterlineScreenY,
    )

    this.previewLine = this.add.graphics().setDepth(8)
    this.lurePreview = this.add
      .image(0, 0, HorseTextures.lure)
      .setOrigin(FishingConfig.lure.originX, FishingConfig.lure.originY)
      .setScale(FishingConfig.lure.scale)
      .setDepth(9)

    this.tuner = new RigTuner(this, this.horse, {
      onTogglePreview: (visible) => this.setPreviewVisible(visible),
      onReset: () => this.scene.restart(),
    })
  }

  update(): void {
    this.tuner.update()

    if (!this.previewOn) {
      return
    }
    const tip = this.horse.getRodTipWorldPosition()
    const lureX = tip.x
    const lureY = tip.y + RigTestConfig.lurePreviewDrop
    this.lurePreview.setPosition(lureX, lureY)

    this.previewLine.clear()
    this.previewLine.lineStyle(RigTestConfig.lineThickness, RigTestConfig.lineColor, 0.9)
    this.previewLine.lineBetween(tip.x, tip.y, lureX, lureY)
  }

  private setPreviewVisible(visible: boolean): void {
    this.previewOn = visible
    this.lurePreview.setVisible(visible)
    this.previewLine.setVisible(visible)
    if (!visible) {
      this.previewLine.clear()
    }
  }

  private drawStage(): void {
    const w = WorldConfig.viewWidth
    const h = WorldConfig.viewHeight
    const waterY = RigTestConfig.waterlineScreenY
    const g = this.add.graphics().setDepth(0)

    g.fillStyle(RigTestConfig.skyColor, 1)
    g.fillRect(0, 0, w, waterY)
    g.fillStyle(RigTestConfig.waterColor, 1)
    g.fillRect(0, waterY, w, h - waterY)
    g.lineStyle(3, RigTestConfig.groundLineColor, 1)
    g.lineBetween(0, waterY, w, waterY)
  }
}
