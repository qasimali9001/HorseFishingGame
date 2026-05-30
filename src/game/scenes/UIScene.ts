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

/**
 * Screen-fixed UI. Its own camera never scrolls, so HUD elements use plain
 * screen coordinates here (this is the one place that's correct). Reacts to
 * gameplay via the EventBus -- never reaches into the world scene.
 */
export class UIScene extends Phaser.Scene {
  private debugText?: Phaser.GameObjects.Text
  private moneyText?: Phaser.GameObjects.Text
  private catchText?: Phaser.GameObjects.Text

  constructor() {
    super(SceneKeys.UI)
  }

  create(): void {
    this.createMoneyDisplay()
    this.createCatchNotifier()

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

    const onCatch = (p: CatchPayload) => this.showCatch(p)
    EventBus.on(GameEvents.CATCH_LANDED, onCatch)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => EventBus.off(GameEvents.CATCH_LANDED, onCatch))
  }

  private showCatch(p: CatchPayload): void {
    if (!this.catchText) {
      return
    }
    this.tweens.killTweensOf(this.catchText)
    const baseY = this.scale.height * 0.28
    this.catchText.setText(`Caught ${p.displayName}!  +$${p.value}`).setAlpha(1).setY(baseY)
    this.tweens.add({
      targets: this.catchText,
      y: baseY - 40,
      alpha: 0,
      delay: 900,
      duration: 700,
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
