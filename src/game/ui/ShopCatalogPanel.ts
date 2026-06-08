import Phaser from 'phaser'
import { ShopIconConfig } from '../config/ShopIconConfig'
import { ShopUIConfig } from '../config/ShopUIConfig'
import { RodSilhouetteCycle } from '../data/rodPlaceholderData'
import { RodSilhouetteIcon } from './RodSilhouetteIcon'
import { ShopChromePainter } from './ShopChromePainter'
import { ShopPlaceholderIcon } from './ShopPlaceholderIcon'
import type {
  ShopCatalogItemState,
  ShopCatalogPlaceholderState,
  ShopPlaceholderKind,
} from '../types/ShopCatalogTypes'

export interface ShopCatalogPanelHandlers {
  onPurchaseRequested: (itemId: string) => void
  onEquipRequested: (itemId: string) => void
}

interface CatalogRowSlot {
  row: Phaser.GameObjects.Graphics
  iconHost: Phaser.GameObjects.Graphics | Phaser.GameObjects.Container
  icon?: Phaser.GameObjects.Image
  name: Phaser.GameObjects.Text
  detail: Phaser.GameObjects.Text
  actionSkin: Phaser.GameObjects.Graphics
  actionButton: Phaser.GameObjects.Rectangle
  actionLabel: Phaser.GameObjects.Text
  badge?: Phaser.GameObjects.Text
  objects: Phaser.GameObjects.GameObject[]
}

/**
 * Vertical catalog list shared by rods, boats, lures, and investments tabs.
 */
export class ShopCatalogPanel {
  private readonly scene: Phaser.Scene
  private readonly handlers: ShopCatalogPanelHandlers
  private readonly slots: CatalogRowSlot[] = []
  private lastBuiltObjectCount = 0
  private placeholderKind: ShopPlaceholderKind = 'rod'
  private silhouetteIndex = 0

  constructor(scene: Phaser.Scene, handlers: ShopCatalogPanelHandlers) {
    this.scene = scene
    this.handlers = handlers
  }

  get builtObjectCount(): number {
    return this.lastBuiltObjectCount
  }

  build(
    items: readonly ShopCatalogItemState[],
    placeholders: readonly ShopCatalogPlaceholderState[],
    placeholderKind: ShopPlaceholderKind,
  ): Phaser.GameObjects.GameObject[] {
    this.reset()
    this.placeholderKind = placeholderKind
    this.silhouetteIndex = 0
    const objects: Phaser.GameObjects.GameObject[] = []

    for (const item of items) {
      const slot = this.buildItemRow(item)
      this.slots.push(slot)
      objects.push(...slot.objects)
    }

    for (const placeholder of this.padPlaceholders(placeholders, items.length)) {
      const slot = this.buildPlaceholderRow(placeholder)
      this.slots.push(slot)
      objects.push(...slot.objects)
    }

    this.lastBuiltObjectCount = objects.length
    return objects
  }

  layout(centerX: number, startY: number): number {
    const { rowHeight, rowGap } = ShopUIConfig.catalogList

    for (let i = 0; i < this.slots.length; i += 1) {
      const top = startY + i * (rowHeight + rowGap)
      this.layoutRow(this.slots[i], centerX, top)
    }

    return startY + this.slots.length * rowHeight + Math.max(0, this.slots.length - 1) * rowGap
  }

  destroy(): void {
    this.reset()
  }

  reset(): void {
    for (const slot of this.slots) {
      slot.actionButton.off(Phaser.Input.Events.POINTER_DOWN)
    }
    this.slots.length = 0
    this.lastBuiltObjectCount = 0
  }

  private layoutRow(slot: CatalogRowSlot, centerX: number, top: number): void {
    const { rowWidth, rowHeight, iconLeft, textLeft, buttonRight, buttonBottom } = ShopUIConfig.catalogList
    const left = centerX - rowWidth * 0.5
    const yMid = top + rowHeight * 0.5
    const buttonY = top + rowHeight - buttonBottom

    slot.row.setPosition(centerX, yMid)
    slot.iconHost.setPosition(left + iconLeft, yMid)
    slot.icon?.setPosition(left + iconLeft, yMid)
    slot.icon?.setScale(this.fitIconScale(slot.icon, ShopIconConfig.fitMaxSize))
    slot.name.setPosition(left + textLeft, top + 9)
    slot.detail.setPosition(left + textLeft, top + 31)
    if (slot.badge) {
      slot.badge.setPosition(left + textLeft + slot.name.width + 12, top + 14)
    }
    slot.actionSkin.setPosition(left + rowWidth - buttonRight, buttonY)
    slot.actionButton.setPosition(left + rowWidth - buttonRight, buttonY)
    slot.actionLabel.setPosition(slot.actionButton.x, slot.actionButton.y)
  }

  private padPlaceholders(
    placeholders: readonly ShopCatalogPlaceholderState[],
    itemCount: number,
  ): ShopCatalogPlaceholderState[] {
    const { listSlots } = ShopUIConfig.catalogList
    const targetCount = Math.max(0, listSlots - itemCount)
    const padded = placeholders.map((entry) => ({ ...entry }))

    while (padded.length < targetCount) {
      padded.push({
        id: `${this.placeholderKind}-placeholder-list-${padded.length}`,
        placeholderKind: this.placeholderKind,
      })
    }

    return padded.slice(0, targetCount)
  }

  private nextRodSilhouette() {
    const variant = RodSilhouetteCycle[this.silhouetteIndex % RodSilhouetteCycle.length]
    this.silhouetteIndex += 1
    return variant
  }

  private buildItemRow(item: ShopCatalogItemState): CatalogRowSlot {
    const { rowWidth, rowHeight, textWidth, buttonWidth, buttonHeight } = ShopUIConfig.catalogList

    const row = this.scene.add.graphics()
    ShopChromePainter.drawCatalogRow(row, rowWidth, rowHeight, false)

    const iconHost = this.scene.add.graphics()
    ShopChromePainter.drawIconCard(iconHost, ShopIconConfig.hostSize, ShopIconConfig.hostSize, false)

    const icon = this.scene.add.image(0, 0, item.iconTextureKey).setOrigin(0.5)

    const name = this.scene.add
      .text(0, 0, item.displayName, {
        fontFamily: 'Georgia, serif',
        fontSize: '22px',
        color: ShopUIConfig.window.cardTextColor,
        fontStyle: 'bold',
      })
      .setOrigin(0, 0)

    const detailLine =
      item.statsSummary === 'Starter stats' || item.statsSummary === 'Standard setup'
        ? item.description
        : `${item.description}  ·  ${item.statsSummary}`

    const detail = this.scene.add
      .text(0, 0, detailLine, {
        fontFamily: 'Georgia, serif',
        fontSize: '12px',
        color: ShopUIConfig.window.cardSubtextColor,
        wordWrap: { width: textWidth },
        lineSpacing: 0,
        fontStyle: 'bold',
      })
      .setOrigin(0, 0)

    const { label, enabled, action } = this.actionForItem(item)
    const actionSkin = this.scene.add.graphics()
    ShopChromePainter.drawButton(actionSkin, buttonWidth, buttonHeight, enabled ? 'primary' : 'disabled')
    const actionButton = this.scene.add
      .rectangle(0, 0, buttonWidth, buttonHeight, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: enabled })

    if (enabled && action) {
      actionButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
        if (action === 'buy') {
          this.handlers.onPurchaseRequested(item.id)
        } else {
          this.handlers.onEquipRequested(item.id)
        }
      })
    }

    const actionLabel = this.scene.add
      .text(0, 0, label, {
        fontFamily: 'Georgia, serif',
        fontSize: '19px',
        color: enabled ? '#fff0ce' : '#eee2cf',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    const objects: Phaser.GameObjects.GameObject[] = [
      row,
      iconHost,
      icon,
      name,
      detail,
      actionSkin,
      actionButton,
      actionLabel,
    ]

    let badge: Phaser.GameObjects.Text | undefined
    if (item.equipped) {
      badge = this.scene.add
        .text(0, 0, 'EQUIPPED', {
          fontFamily: 'Georgia, serif',
          fontSize: '13px',
          color: '#b5791d',
          fontStyle: 'bold',
        })
        .setOrigin(0, 0)
      objects.push(badge)
    }

    return { row, iconHost, icon, name, detail, actionSkin, actionButton, actionLabel, badge, objects }
  }

  private buildPlaceholderRow(placeholder: ShopCatalogPlaceholderState): CatalogRowSlot {
    const { rowWidth, rowHeight, textWidth, buttonWidth, buttonHeight, iconSize } = ShopUIConfig.catalogList

    const row = this.scene.add.graphics()
    ShopChromePainter.drawCatalogRow(row, rowWidth, rowHeight, true)

    const iconHost =
      placeholder.placeholderKind === 'rod'
        ? RodSilhouetteIcon.create(this.scene, this.nextRodSilhouette(), iconSize, iconSize)
        : ShopPlaceholderIcon.create(this.scene, placeholder.placeholderKind, iconSize, iconSize)

    const name = this.scene.add
      .text(0, 0, '???', {
        fontFamily: 'Georgia, serif',
        fontSize: '22px',
        color: ShopUIConfig.window.placeholderTextColor,
        fontStyle: 'bold',
      })
      .setOrigin(0, 0)

    const detail = this.scene.add
      .text(0, 0, 'Coming soon', {
        fontFamily: 'Georgia, serif',
        fontSize: '12px',
        color: ShopUIConfig.window.placeholderTextColor,
        wordWrap: { width: textWidth },
        fontStyle: 'bold',
      })
      .setOrigin(0, 0)

    const actionSkin = this.scene.add.graphics()
    ShopChromePainter.drawButton(actionSkin, buttonWidth, buttonHeight, 'disabled')
    const actionButton = this.scene.add
      .rectangle(0, 0, buttonWidth, buttonHeight, 0xffffff, 0.001)

    const actionLabel = this.scene.add
      .text(0, 0, 'Locked', {
        fontFamily: 'Georgia, serif',
        fontSize: '19px',
        color: '#eee2cf',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    const objects = [row, iconHost, name, detail, actionSkin, actionButton, actionLabel]

    return { row, iconHost, name, detail, actionSkin, actionButton, actionLabel, objects }
  }

  private actionForItem(item: ShopCatalogItemState): {
    fill: number
    border: number
    label: string
    enabled: boolean
    action: 'buy' | 'equip' | null
  } {
    if (item.itemKind === 'passive' && item.owned) {
      return {
        fill: ShopUIConfig.window.purchaseButtonDisabledColor,
        border: ShopUIConfig.window.purchaseButtonDisabledBorderColor,
        label: 'Earning',
        enabled: false,
        action: null,
      }
    }

    if (item.equipped) {
      return {
        fill: ShopUIConfig.window.purchaseButtonDisabledColor,
        border: ShopUIConfig.window.purchaseButtonDisabledBorderColor,
        label: 'Equipped',
        enabled: false,
        action: null,
      }
    }

    if (item.owned) {
      return {
        fill: ShopUIConfig.window.purchaseButtonColor,
        border: ShopUIConfig.window.purchaseButtonBorderColor,
        label: 'Equip',
        enabled: true,
        action: 'equip',
      }
    }

    if (item.cost <= 0) {
      return {
        fill: ShopUIConfig.window.purchaseButtonColor,
        border: ShopUIConfig.window.purchaseButtonBorderColor,
        label: 'Free',
        enabled: true,
        action: 'buy',
      }
    }

    const canBuy = item.affordable
    return {
      fill: canBuy
        ? ShopUIConfig.window.purchaseButtonColor
        : ShopUIConfig.window.purchaseButtonDisabledColor,
      border: canBuy
        ? ShopUIConfig.window.purchaseButtonBorderColor
        : ShopUIConfig.window.purchaseButtonDisabledBorderColor,
      label: `$${item.cost}`,
      enabled: canBuy,
      action: 'buy',
    }
  }

  private fitIconScale(icon: Phaser.GameObjects.Image, maxSize: number): number {
    const width = icon.width || maxSize
    const height = icon.height || maxSize
    return Math.min(maxSize / width, maxSize / height)
  }
}
