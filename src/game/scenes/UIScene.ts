import Phaser from 'phaser'
import { SceneKeys } from './SceneKeys'
import { DebugConfig } from '../config/DebugConfig'
import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/GameEvents'

interface DebugTickPayload {
  depth: number
  maxDepth: number
  cameraMode: string
  state: string
}

interface MoneyPayload {
  money: number
}

interface CatchPayload {
  displayName: string
  value: number
}

interface CatchLostPayload {
  displayName: string
}

interface BiomeChangedPayload {
  displayName: string
}

/**
 * Screen-fixed UI. Its own camera never scrolls, so HUD elements use plain
 * screen coordinates here (this is the one place that's correct). Reacts to
 * gameplay via the EventBus -- never reaches into the world scene.
 */
export class UIScene extends Phaser.Scene {
  private debugText?: Phaser.GameObjects.Text
  private moneyText?: Phaser.GameObjects.Text
  private catchText?: Phaser.GameObjects.Text
  private biomeText?: Phaser.GameObjects.Text

  constructor() {
    super(SceneKeys.UI)
  }

  create(): void {
    this.createMoneyDisplay()
    this.createCatchNotifier()
    this.createBiomeBanner()

    if (DebugConfig.showOverlay) {
      this.createDebugOverlay()
    }

    this.shutdownCleanup()
  }

  private createMoneyDisplay(): void {
    this.moneyText = this.add
      .text(this.scale.width - 18, 16, '$0', {
        color: '#ffe08a',
        fontSize: '28px',
        fontFamily: 'monospace',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)

    const onMoney = (p: MoneyPayload) => this.moneyText?.setText(`$${p.money}`)
    EventBus.on(GameEvents.MONEY_CHANGED, onMoney)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => EventBus.off(GameEvents.MONEY_CHANGED, onMoney))
  }

  private createCatchNotifier(): void {
    this.catchText = this.add
      .text(this.scale.width / 2, this.scale.height * 0.28, '', {
        color: '#ffffff',
        fontSize: '24px',
        fontFamily: 'monospace',
        backgroundColor: '#1b9aaaaa',
        padding: { x: 12, y: 8 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0)

    const onCatch = (p: CatchPayload) => this.showNotice(`Caught ${p.displayName}!  +$${p.value}`, '#d6fff0')
    const onLost = (p: CatchLostPayload) => this.showNotice(`${p.displayName} got away!`, '#ffd0d0')
    EventBus.on(GameEvents.CATCH_LANDED, onCatch)
    EventBus.on(GameEvents.CATCH_LOST, onLost)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(GameEvents.CATCH_LANDED, onCatch)
      EventBus.off(GameEvents.CATCH_LOST, onLost)
    })
  }

  private showNotice(message: string, color: string): void {
    if (!this.catchText) {
      return
    }
    this.tweens.killTweensOf(this.catchText)
    const baseY = this.scale.height * 0.28
    this.catchText.setColor(color).setText(message).setAlpha(1).setY(baseY)
    this.tweens.add({
      targets: this.catchText,
      y: baseY - 40,
      alpha: 0,
      delay: 900,
      duration: 700,
      ease: 'Sine.easeIn',
    })
  }

  private createBiomeBanner(): void {
    this.biomeText = this.add
      .text(this.scale.width / 2, this.scale.height * 0.12, '', {
        color: '#cfeffb',
        fontSize: '18px',
        fontFamily: 'monospace',
        backgroundColor: '#0c2b3aaa',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0)

    const onBiome = (p: BiomeChangedPayload) => this.showBiome(p.displayName)
    EventBus.on(GameEvents.BIOME_CHANGED, onBiome)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => EventBus.off(GameEvents.BIOME_CHANGED, onBiome))
  }

  private showBiome(displayName: string): void {
    if (!this.biomeText) {
      return
    }
    this.tweens.killTweensOf(this.biomeText)
    this.biomeText.setText(displayName).setAlpha(1)
    this.tweens.add({
      targets: this.biomeText,
      alpha: 0,
      delay: 1400,
      duration: 600,
      ease: 'Sine.easeIn',
    })
  }

  private createDebugOverlay(): void {
    this.debugText = this.add
      .text(16, 16, '', {
        color: '#e6f7ff',
        fontSize: '16px',
        fontFamily: 'monospace',
        backgroundColor: '#00000066',
        padding: { x: 8, y: 6 },
      })
      .setScrollFactor(0)

    this.add
      .text(16, this.scale.height - 28, 'Hold + release to cast  ·  hold to reel  ·  release to stop', {
        color: '#9fd6e6',
        fontSize: '13px',
        fontFamily: 'monospace',
      })
      .setScrollFactor(0)

    const onTick = (payload: DebugTickPayload) => {
      this.debugText?.setText(
        [
          `state:  ${payload.state}`,
          `camera: ${payload.cameraMode}`,
          `depth:  ${payload.depth.toFixed(0)} / ${payload.maxDepth.toFixed(0)}`,
        ].join('\n'),
      )
    }
    EventBus.on(GameEvents.DEBUG_TICK, onTick)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => EventBus.off(GameEvents.DEBUG_TICK, onTick))
  }

  private shutdownCleanup(): void {
    this.events.once(Phaser.Scenes.Events.DESTROY, () => EventBus.removeAllListeners())
  }
}
