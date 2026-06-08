import Phaser from 'phaser'
import { SceneKeys } from './SceneKeys'
import { DebugConfig } from '../config/DebugConfig'
import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/GameEvents'
import { ShopToggleButton } from '../ui/ShopToggleButton'
import { ShopWindow } from '../ui/ShopWindow'
import { SettingsToggleButton } from '../ui/SettingsToggleButton'
import { SettingsWindow } from '../ui/SettingsWindow'
import { audioSettings } from '../systems/AudioSettingsSystem'
import type { ShopStateSnapshot } from '../types/ShopTypes'

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
  sizeTier: string
}

interface CatchLostPayload {
  displayName: string
}

interface CatchDecisionPayload {
  displayName: string
  value: number
  canChuck: boolean
}

interface CatchSoldPayload {
  displayName: string
  value: number
}

interface CatchChuckedPayload {
  displayName: string
  nextBaitTier: string
}

interface BaitChangedPayload {
  label: string
}

interface BiomeChangedPayload {
  displayName: string
}

interface ShopFeedbackPayload {
  message: string
  tone: 'success' | 'error' | 'neutral'
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
  private baitText?: Phaser.GameObjects.Text
  private decisionText?: Phaser.GameObjects.Text
  private sellButtonBg?: Phaser.GameObjects.Rectangle
  private sellButtonLabel?: Phaser.GameObjects.Text
  private shopButton?: ShopToggleButton
  private shopWindow?: ShopWindow
  private shopToggleKey?: Phaser.Input.Keyboard.Key
  private settingsButton?: SettingsToggleButton
  private settingsWindow?: SettingsWindow

  constructor() {
    super(SceneKeys.UI)
  }

  create(): void {
    this.createMoneyDisplay()
    this.createBaitDisplay()
    this.createCatchNotifier()
    this.createBiomeBanner()

    if (DebugConfig.showOverlay) {
      this.createDebugOverlay()
    }

    this.createShopUI()
    this.createSettingsUI()
    audioSettings.applyToMusic()
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
    EventBus.emit(GameEvents.MONEY_STATE_REQUESTED)
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

    const onCatch = (p: CatchPayload) => this.showNotice(`Caught ${p.displayName} (${p.sizeTier})`, '#d6fff0')
    const onDecision = (p: CatchDecisionPayload) => this.showCatchDecision(p)
    const onSold = (p: CatchSoldPayload) => this.showNotice(`Sold ${p.displayName}!  +$${p.value}`, '#d6fff0')
    const onChucked = (p: CatchChuckedPayload) =>
      this.showNotice(`${p.displayName} became ${p.nextBaitTier} bait`, '#fff4c4')
    const onCleared = () => this.hideCatchDecision()
    const onLost = (p: CatchLostPayload) => this.showNotice(`${p.displayName} got away!`, '#ffd0d0')
    EventBus.on(GameEvents.CATCH_LANDED, onCatch)
    EventBus.on(GameEvents.CATCH_DECISION_REQUIRED, onDecision)
    EventBus.on(GameEvents.CATCH_SOLD, onSold)
    EventBus.on(GameEvents.CATCH_CHUCKED, onChucked)
    EventBus.on(GameEvents.CATCH_DECISION_CLEARED, onCleared)
    EventBus.on(GameEvents.CATCH_LOST, onLost)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(GameEvents.CATCH_LANDED, onCatch)
      EventBus.off(GameEvents.CATCH_DECISION_REQUIRED, onDecision)
      EventBus.off(GameEvents.CATCH_SOLD, onSold)
      EventBus.off(GameEvents.CATCH_CHUCKED, onChucked)
      EventBus.off(GameEvents.CATCH_DECISION_CLEARED, onCleared)
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

  private createBaitDisplay(): void {
    this.baitText = this.add
      .text(18, 50, 'Bait: Small Bait', {
        color: '#f7f7f7',
        fontSize: '18px',
        fontFamily: 'monospace',
        backgroundColor: '#00000055',
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0)

    const onBait = (p: BaitChangedPayload) => this.baitText?.setText(`Bait: ${p.label}`)
    EventBus.on(GameEvents.BAIT_CHANGED, onBait)
    EventBus.emit(GameEvents.BAIT_STATE_REQUESTED)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => EventBus.off(GameEvents.BAIT_CHANGED, onBait))
  }

  private showCatchDecision(payload: CatchDecisionPayload): void {
    const y = this.scale.height * 0.36
    if (!this.decisionText) {
      this.decisionText = this.add
        .text(this.scale.width / 2, y, '', {
          color: '#f5f5f5',
          fontSize: '18px',
          fontFamily: 'monospace',
          backgroundColor: '#0d1f2ecc',
          padding: { x: 12, y: 10 },
          align: 'center',
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
    }
    if (!this.sellButtonBg) {
      this.sellButtonBg = this.add
        .rectangle(this.scale.width / 2, y + 56, 148, 40, 0x215d35, 0.95)
        .setScrollFactor(0)
        .setStrokeStyle(2, 0xb7f4c7)
        .setInteractive({ useHandCursor: true })
      this.sellButtonBg.on(Phaser.Input.Events.POINTER_DOWN, () => {
        EventBus.emit(GameEvents.CATCH_SELL_REQUESTED)
      })
    }
    if (!this.sellButtonLabel) {
      this.sellButtonLabel = this.add
        .text(this.scale.width / 2, y + 56, 'Sell [S]', {
          color: '#ebfff2',
          fontSize: '19px',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
    }
    const secondLine = payload.canChuck
      ? 'Press S to sell, or recast to chuck for bait'
      : 'Press S to sell (very large fish cannot be chucked)'
    this.decisionText.setText(`Landed ${payload.displayName} ($${payload.value})\n${secondLine}`).setVisible(true)
    this.sellButtonBg.setVisible(true)
    this.sellButtonLabel.setVisible(true)
  }

  private hideCatchDecision(): void {
    this.decisionText?.setVisible(false)
    this.sellButtonBg?.setVisible(false)
    this.sellButtonLabel?.setVisible(false)
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
      .text(16, this.scale.height - 28, 'Mouse1/Space cast+reel  ·  S sell  ·  B shop', {
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

  private createShopUI(): void {
    this.shopWindow = new ShopWindow(this, {
      onCloseRequested: () => this.setShopOpen(false),
      onCatalogPurchaseRequested: (catalogId, itemId) => {
        EventBus.emit(GameEvents.SHOP_ITEM_PURCHASE_REQUESTED, { catalogId, itemId })
      },
      onCatalogEquipRequested: (catalogId, itemId) => {
        EventBus.emit(GameEvents.SHOP_ITEM_EQUIP_REQUESTED, { catalogId, itemId })
      },
    })
    this.shopButton = new ShopToggleButton(this, () => this.toggleShop())
    this.shopButton.setActive(false)

    this.shopToggleKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.B)
    this.shopToggleKey?.on(Phaser.Input.Keyboard.Events.DOWN, () => this.toggleShop())

    const onShopState = (state: ShopStateSnapshot) => this.shopWindow?.setState(state)
    const onShopFeedback = (payload: ShopFeedbackPayload) => {
      const color = payload.tone === 'error' ? '#ffd0d0' : payload.tone === 'success' ? '#d6fff0' : '#e7f0ff'
      this.showNotice(payload.message, color)
    }
    EventBus.on(GameEvents.SHOP_STATE_CHANGED, onShopState)
    EventBus.on(GameEvents.SHOP_PURCHASE_FEEDBACK, onShopFeedback)
    EventBus.emit(GameEvents.SHOP_STATE_REQUESTED)

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleShopResize, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.shopToggleKey?.off(Phaser.Input.Keyboard.Events.DOWN)
      EventBus.off(GameEvents.SHOP_STATE_CHANGED, onShopState)
      EventBus.off(GameEvents.SHOP_PURCHASE_FEEDBACK, onShopFeedback)
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleShopResize, this)
      this.shopButton?.destroy()
      this.shopWindow?.destroy()
    })
  }

  private handleShopResize(): void {
    this.shopButton?.layout()
    this.shopWindow?.layout()
  }

  private toggleShop(): void {
    const nextOpen = !(this.shopWindow?.isOpen ?? false)
    if (nextOpen) {
      this.setSettingsOpen(false)
    }
    this.setShopOpen(nextOpen)
  }

  private setShopOpen(nextOpen: boolean): void {
    this.shopWindow?.setOpen(nextOpen)
    this.shopButton?.setActive(nextOpen)
  }

  private createSettingsUI(): void {
    this.settingsWindow = new SettingsWindow(this, {
      onCloseRequested: () => this.setSettingsOpen(false),
    })
    this.settingsButton = new SettingsToggleButton(this, () => this.toggleSettings())

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleSettingsResize, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleSettingsResize, this)
      this.settingsButton?.destroy()
      this.settingsWindow?.destroy()
    })
  }

  private handleSettingsResize(): void {
    this.settingsButton?.layout()
    this.settingsWindow?.layout()
  }

  private toggleSettings(): void {
    const nextOpen = !(this.settingsWindow?.isOpen ?? false)
    if (nextOpen) {
      this.setShopOpen(false)
    }
    this.setSettingsOpen(nextOpen)
  }

  private setSettingsOpen(nextOpen: boolean): void {
    this.settingsWindow?.setOpen(nextOpen)
    this.settingsButton?.setActive(nextOpen)
  }

  private shutdownCleanup(): void {
    this.events.once(Phaser.Scenes.Events.DESTROY, () => EventBus.removeAllListeners())
  }
}
