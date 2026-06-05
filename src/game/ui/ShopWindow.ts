import Phaser from 'phaser'
import { ShopUIConfig } from '../config/ShopUIConfig'
import { ShopCatalogPanel } from './ShopCatalogPanel'
import type { ShopCategoryDefinition, ShopCategoryId, ShopStateSnapshot } from '../types/ShopTypes'

/**
 * Shop window with category tabs and catalog list rows per section.
 */
export class ShopWindow {
  private readonly scene: Phaser.Scene
  private readonly root: Phaser.GameObjects.Container
  private readonly backdrop: Phaser.GameObjects.Rectangle
  private readonly panel: Phaser.GameObjects.Rectangle
  private readonly closeButtonBg: Phaser.GameObjects.Rectangle
  private readonly closeButtonLabel: Phaser.GameObjects.Text
  private readonly title: Phaser.GameObjects.Text
  private readonly subtitle: Phaser.GameObjects.Text
  private readonly moneyText: Phaser.GameObjects.Text
  private readonly catalogPanel: ShopCatalogPanel

  private readonly dynamicObjects: Phaser.GameObjects.GameObject[] = []
  private state: ShopStateSnapshot | null = null
  private selectedCategoryId: ShopCategoryId | null = null
  private activeCatalogId: ShopCategoryId | null = null

  constructor(
    scene: Phaser.Scene,
    handlers: {
      onCloseRequested: () => void
      onCatalogPurchaseRequested: (catalogId: ShopCategoryId, itemId: string) => void
      onCatalogEquipRequested: (catalogId: ShopCategoryId, itemId: string) => void
    },
  ) {
    this.scene = scene
    this.catalogPanel = new ShopCatalogPanel(scene, {
      onPurchaseRequested: (itemId) => {
        if (this.activeCatalogId) {
          handlers.onCatalogPurchaseRequested(this.activeCatalogId, itemId)
        }
      },
      onEquipRequested: (itemId) => {
        if (this.activeCatalogId) {
          handlers.onCatalogEquipRequested(this.activeCatalogId, itemId)
        }
      },
    })
    this.root = this.scene.add.container(0, 0).setScrollFactor(0).setVisible(false)

    this.backdrop = this.scene.add
      .rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, ShopUIConfig.window.backdropColor)
      .setOrigin(0)
      .setAlpha(ShopUIConfig.window.backdropAlpha)
      .setInteractive({ useHandCursor: true })
    this.backdrop.on(Phaser.Input.Events.POINTER_DOWN, () => handlers.onCloseRequested())

    this.panel = this.scene.add
      .rectangle(0, 0, ShopUIConfig.window.width, ShopUIConfig.window.height, ShopUIConfig.window.panelColor)
      .setStrokeStyle(ShopUIConfig.window.panelBorderWidth, ShopUIConfig.window.panelBorderColor)
      .setAlpha(ShopUIConfig.window.panelAlpha)

    this.title = this.scene.add
      .text(0, 0, 'Shop Window', {
        fontFamily: 'monospace',
        fontSize: '30px',
        color: ShopUIConfig.window.titleColor,
      })
      .setOrigin(0.5, 0)

    this.subtitle = this.scene.add
      .text(0, 0, 'Buy rods, boats, lures, and investments.', {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: ShopUIConfig.window.subtitleColor,
      })
      .setOrigin(0.5, 0)

    this.moneyText = this.scene.add
      .text(0, 0, '$0', {
        fontFamily: 'monospace',
        fontSize: '17px',
        color: '#ffe08a',
      })
      .setOrigin(0, 0.5)

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

    this.root.add([
      this.backdrop,
      this.panel,
      this.title,
      this.subtitle,
      this.moneyText,
      this.closeButtonBg,
      this.closeButtonLabel,
    ])
    this.layout()
  }

  get isOpen(): boolean {
    return this.root.visible
  }

  setOpen(nextOpen: boolean): void {
    this.root.setVisible(nextOpen)
  }

  setState(nextState: ShopStateSnapshot): void {
    this.state = nextState
    this.moneyText.setText(`Money: $${nextState.money}`)

    if (
      !this.selectedCategoryId ||
      !nextState.categories.some((category) => category.id === this.selectedCategoryId)
    ) {
      this.selectedCategoryId = nextState.categories[0]?.id ?? null
    }
    this.rebuildDynamicContent()
  }

  layout(): void {
    this.backdrop.setSize(this.scene.scale.width, this.scene.scale.height)

    const centerX = this.scene.scale.width * 0.5
    const centerY = this.scene.scale.height * 0.5
    const panelTop = centerY - ShopUIConfig.window.height * 0.5

    this.panel.setPosition(centerX, centerY)
    this.title.setPosition(centerX, panelTop + 16)
    this.subtitle.setPosition(centerX, panelTop + 52)
    this.moneyText.setPosition(centerX - ShopUIConfig.window.width * 0.5 + 20, panelTop + 84)

    this.closeButtonBg.setPosition(centerX + ShopUIConfig.window.width * 0.5 - 48, panelTop + 26)
    this.closeButtonLabel.setPosition(this.closeButtonBg.x, this.closeButtonBg.y)
    this.layoutDynamicContent(centerX, panelTop)
  }

  destroy(): void {
    this.backdrop.off(Phaser.Input.Events.POINTER_DOWN)
    this.closeButtonBg.off(Phaser.Input.Events.POINTER_DOWN)
    this.clearDynamicContent()
    this.catalogPanel.destroy()
    this.root.destroy(true)
  }

  private rebuildDynamicContent(): void {
    this.clearDynamicContent()
    if (!this.state || !this.selectedCategoryId) {
      return
    }

    this.buildCategoryButtons(this.state.categories)
    const selectedCategory = this.state.categories.find((category) => category.id === this.selectedCategoryId)
    if (!selectedCategory) {
      return
    }

    const categoryTitle = this.scene.add
      .text(0, 0, selectedCategory.title, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: ShopUIConfig.window.cardTextColor,
        fontStyle: 'bold',
      })
      .setOrigin(0, 0)
    const categoryDesc = this.scene.add
      .text(0, 0, selectedCategory.description, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: ShopUIConfig.window.cardSubtextColor,
      })
      .setOrigin(0, 0)
    this.trackDynamic(categoryTitle, categoryDesc)

    const catalog = this.state.catalogs[this.selectedCategoryId]
    this.activeCatalogId = this.selectedCategoryId
    const catalogObjects = this.catalogPanel.build(
      catalog.items,
      catalog.placeholders,
      catalog.placeholderKind,
    )
    this.trackDynamic(...catalogObjects)

    this.layout()
  }

  private buildCategoryButtons(categories: readonly ShopCategoryDefinition[]): void {
    const { width: tabWidth, height: tabHeight } = ShopUIConfig.tabs
    for (const category of categories) {
      const selected = category.id === this.selectedCategoryId
      const fill = selected ? ShopUIConfig.window.cardActiveColor : ShopUIConfig.window.cardColor
      const button = this.scene.add
        .rectangle(0, 0, tabWidth, tabHeight, fill, 0.95)
        .setStrokeStyle(1, ShopUIConfig.window.cardBorderColor)
        .setInteractive({ useHandCursor: true })
      button.on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.selectedCategoryId = category.id
        this.rebuildDynamicContent()
      })

      const label = this.scene.add
        .text(0, 0, category.title, {
          fontFamily: 'monospace',
          fontSize: '14px',
          color: ShopUIConfig.window.cardTextColor,
        })
        .setOrigin(0.5)

      this.trackDynamic(button, label)
    }
  }

  private trackDynamic(...objects: Phaser.GameObjects.GameObject[]): void {
    this.dynamicObjects.push(...objects)
    this.root.add(objects)
  }

  private clearDynamicContent(): void {
    this.catalogPanel.reset()
    this.activeCatalogId = null
    for (const object of this.dynamicObjects) {
      if ('off' in object && typeof object.off === 'function') {
        object.off(Phaser.Input.Events.POINTER_DOWN)
      }
      object.destroy()
    }
    this.dynamicObjects.length = 0
  }

  private layoutDynamicContent(centerX: number, panelTop: number): void {
    if (!this.state || !this.selectedCategoryId) {
      return
    }

    let index = 0
    const categories = this.state.categories
    const { width: tabWidth, gap: tabGap, yOffset: tabYOffset } = ShopUIConfig.tabs
    const tabsWidth = categories.length * tabWidth + Math.max(0, categories.length - 1) * tabGap
    const tabStartX = centerX - tabsWidth * 0.5 + tabWidth * 0.5
    const tabY = panelTop + tabYOffset
    for (let i = 0; i < categories.length; i += 1) {
      const button = this.dynamicObjects[index] as Phaser.GameObjects.Rectangle
      const label = this.dynamicObjects[index + 1] as Phaser.GameObjects.Text
      button.setPosition(tabStartX + i * (tabWidth + tabGap), tabY)
      label.setPosition(button.x, button.y)
      index += 2
    }

    const contentLeft = centerX - ShopUIConfig.window.width * 0.5 + ShopUIConfig.window.contentInsetX
    const title = this.dynamicObjects[index] as Phaser.GameObjects.Text
    const desc = this.dynamicObjects[index + 1] as Phaser.GameObjects.Text
    title.setPosition(contentLeft, panelTop + 152)
    desc.setPosition(contentLeft, panelTop + 176)
    index += 2

    if (this.activeCatalogId) {
      this.catalogPanel.layout(centerX, panelTop + ShopUIConfig.catalogList.contentTopOffset)
    }
  }
}
