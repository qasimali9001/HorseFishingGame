import Phaser from 'phaser'
import { SceneKeys } from './SceneKeys'
import { TitleScreenConfig } from '../config/TitleScreenConfig'
import { WorldArtConfig } from '../config/WorldArtConfig'
import { WorldConfig } from '../config/WorldConfig'
import { TitleScreenView } from '../ui/TitleScreenView'
import { PlayerHorse } from '../entities/PlayerHorse'
import { BackgroundLayer } from '../world/BackgroundLayer'
import { SurfaceLayer } from '../world/SurfaceLayer'
import { UnderwaterLayer } from '../world/UnderwaterLayer'

/** First player-facing scene: title sign in the sky, then a pan into gameplay. */
export class TitleScene extends Phaser.Scene {
  private titleView?: TitleScreenView
  private titleHorse?: PlayerHorse
  private isStarting = false
  private hasQueuedGameplay = false

  constructor() {
    super(SceneKeys.Title)
  }

  create(): void {
    this.drawExtendedSky()
    new BackgroundLayer(this)
    new UnderwaterLayer(this)
    new SurfaceLayer(this)

    this.titleHorse = new PlayerHorse(this, WorldConfig.surfaceAnchorX, WorldConfig.waterlineY)
    this.titleView = new TitleScreenView(this)
    this.frameTitle()
    this.bindStartInput()

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.titleHorse?.destroy())
  }

  private drawExtendedSky(): void {
    const { sky } = TitleScreenConfig
    const width = WorldConfig.worldWidth
    const x = WorldConfig.worldLeftX + width / 2
    const height = sky.bottomY - sky.topY

    this.add
      .rectangle(x, sky.topY + height / 2, width, height, WorldArtConfig.palette.skyTop)
      .setDepth(WorldArtConfig.depths.sky - 1)

    const g = this.add.graphics().setDepth(WorldArtConfig.depths.distantProps)
    g.fillStyle(WorldArtConfig.palette.cloud, 0.72)
    this.drawSoftCloud(g, 250, -1030, 1.15)
    this.drawSoftCloud(g, 980, -1110, 0.95)
    this.drawSoftCloud(g, 1780, -950, 1.3)
  }

  private drawSoftCloud(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    scale: number,
  ): void {
    g.fillEllipse(x, y + 14 * scale, 160 * scale, 42 * scale)
    g.fillCircle(x - 52 * scale, y + 4 * scale, 26 * scale)
    g.fillCircle(x - 8 * scale, y - 17 * scale, 38 * scale)
    g.fillCircle(x + 44 * scale, y - 6 * scale, 30 * scale)
    g.fillCircle(x + 72 * scale, y + 12 * scale, 22 * scale)
  }

  private frameTitle(): void {
    const { camera } = TitleScreenConfig
    this.cameras.main.centerOn(camera.startCenterX, camera.startCenterY)
  }

  private bindStartInput(): void {
    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => this.startIntroPan())

    const space = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    const enter = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
    space?.once(Phaser.Input.Keyboard.Events.DOWN, () => this.startIntroPan())
    enter?.once(Phaser.Input.Keyboard.Events.DOWN, () => this.startIntroPan())
  }

  private startIntroPan(): void {
    if (this.isStarting) {
      return
    }
    this.isStarting = true
    this.titleView?.hidePrompt()

    const { camera } = TitleScreenConfig
    this.cameras.main.pan(
      camera.surfaceCenterX,
      camera.surfaceCenterY,
      camera.panDurationMs,
      'Sine.easeInOut',
      false,
      (_cam, progress) => {
        if (progress < 1 || this.hasQueuedGameplay) {
          return
        }
        this.hasQueuedGameplay = true
        this.startGameplay()
      },
    )
  }

  private startGameplay(): void {
    this.scene.start(SceneKeys.World)
    this.scene.launch(SceneKeys.UI)
  }
}
