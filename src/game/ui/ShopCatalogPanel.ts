import Phaser from 'phaser'
import { ShopUIConfig } from '../config/ShopUIConfig'
import { RodSilhouetteCycle } from '../data/rodPlaceholderData'
import { RodSilhouetteIcon } from './RodSilhouetteIcon'
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
  row: Phaser.GameObjects.Rectangle
  iconHost: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Container
  icon?: Phaser.GameObjects.Image
  name: Phaser.GameObjects.Text
  detail: Phaser.GameObjects.Text
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
    const { rowWidth, rowHeight, iconLeft, textLeft, iconSize, buttonRight, buttonBottom } =
      ShopUIConfig.catalogList
    const left = centerX - rowWidth * 0.5
    const yMid = top + rowHeight * 0.5
    const buttonY = top + rowHeight - buttonBottom

    slot.row.setPosition(centerX, yMid)
    slot.iconHost.setPosition(left + iconLeft, yMid)
    slot.icon?.setPosition(left + iconLeft, yMid)
    slot.icon?.setScale(this.fitIconScale(slot.icon, iconSize - 8))
    slot.name.setPosition(left + textLeft, top + 14)
    slot.detail.setPosition(left + textLeft, top + 32)
    if (slot.badge) {
      slot.badge.setPosition(left + textLeft + slot.name.width + 8, top + 15)
    }
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
    const { rowWidth, rowHeight, iconSize, textWidth, buttonWidth, buttonHeight } = ShopUIConfig.catalogList
    const fill = item.equipped ? ShopUIConfig.window.cardActiveColor : ShopUIConfig.window.cardColor

    const row = this.scene.add
      .rectangle(0, 0, rowWidth, rowHeight, fill, 0.94)
      .setStrokeStyle(1, ShopUIConfig.window.cardBorderColor)

    const iconHost = this.scene.add
      .rectangle(0, 0, iconSize, iconSize, 0x0a2230, 0.95)
      .setStrokeStyle(1, ShopUIConfig.window.cardBorderColor)

    const icon = this.scene.add.image(0, 0, item.textureKey).setOrigin(0.5)

    const name = this.scene.add
      .text(0, 0, item.displayName, {
        fontFamily: 'monospace',
        fontSize: '14px',
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
        fontFamily: 'monospace',
        fontSize: '11px',
        color: ShopUIConfig.window.cardSubtextColor,
        wordWrap: { width: textWidth },
        lineSpacing: 2,
      })
      .setOrigin(0, 0)

    const { fill: actionFill, border: actionBorder, label, enabled, action } = this.actionForItem(item)
    const actionButton = this.scene.add
      .rectangle(0, 0, buttonWidth, buttonHeight, actionFill, 0.95)
      .setStrokeStyle(1, actionBorder)
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
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#ebfff2',
      })
      .setOrigin(0.5)

    const objects: Phaser.GameObjects.GameObject[] = [
      row,
      iconHost,
      icon,
      name,
      detail,
      actionButton,
      actionLabel,
    ]

    let badge: Phaser.GameObjects.Text | undefined
    if (item.equipped) {
      badge = this.scene.add
        .text(0, 0, 'EQUIPPED', {
          fontFamily: 'monospace',
          fontSize: '9px',
          color: '#ffe08a',
        })
        .setOrigin(0, 0)
      objects.push(badge)
    }

    return { row, iconHost, icon, name, detail, actionButton, actionLabel, badge, objects }
  }

  private buildPlaceholderRow(placeholder: ShopCatalogPlaceholderState): CatalogRowSlot {
    const { rowWidth, rowHeight, textWidth, buttonWidth, buttonHeight, iconSize } = ShopUIConfig.catalogList

    const row = this.scene.add
      .rectangle(0, 0, rowWidth, rowHeight, ShopUIConfig.window.cardLockedColor, 0.88)
      .setStrokeStyle(1, 0x3d5668)

    const iconHost =
      placeholder.placeholderKind === 'rod'
        ? RodSilhouetteIcon.create(this.scene, this.nextRodSilhouette(), iconSize, iconSize)
        : ShopPlaceholderIcon.create(this.scene, placeholder.placeholderKind, iconSize, iconSize)

    const name = this.scene.add
      .text(0, 0, '???', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: ShopUIConfig.window.placeholderTextColor,
        fontStyle: 'bold',
      })
      .setOrigin(0, 0)

    const detail = this.scene.add
      .text(0, 0, 'Coming soon', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: ShopUIConfig.window.placeholderTextColor,
        wordWrap: { width: textWidth },
      })
      .setOrigin(0, 0)

    const actionButton = this.scene.add
      .rectangle(0, 0, buttonWidth, buttonHeight, ShopUIConfig.window.purchaseButtonDisabledColor, 0.95)
      .setStrokeStyle(1, ShopUIConfig.window.purchaseButtonDisabledBorderColor)

    const actionLabel = this.scene.add
      .text(0, 0, 'Locked', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#b8c2ca',
      })
      .setOrigin(0.5)

    const objects = [row, iconHost, name, detail, actionButton, actionLabel]

    return { row, iconHost, name, detail, actionButton, actionLabel, objects }
  }

  private actionForItem(item: ShopCatalogItemState): {
    fill: number
    border: number
    label: string
    enabled: boolean
    action: 'buy' | 'equip' | null
  } {
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
