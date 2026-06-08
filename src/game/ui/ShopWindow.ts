import Phaser from 'phaser'
import { ShopUIConfig } from '../config/ShopUIConfig'
import { ShopChromePainter } from './ShopChromePainter'
import { ShopCatalogPanel } from './ShopCatalogPanel'
import type { ShopCategoryDefinition, ShopCategoryId, ShopStateSnapshot } from '../types/ShopTypes'

/**
 * Shop window with category tabs and catalog list rows per section.
 */
export class ShopWindow {
  private readonly scene: Phaser.Scene
  private readonly root: Phaser.GameObjects.Container
  private readonly backdrop: Phaser.GameObjects.Rectangle
  private readonly frame: Phaser.GameObjects.Graphics
  private readonly contentPanel: Phaser.GameObjects.Graphics
  private readonly panelHitArea: Phaser.GameObjects.Rectangle
  private readonly moneyPanel: Phaser.GameObjects.Graphics
  private readonly coinIcon: Phaser.GameObjects.Graphics
  private readonly closeButtonSkin: Phaser.GameObjects.Graphics
  private readonly closeButtonHitArea: Phaser.GameObjects.Rectangle
  private readonly titleShadow: Phaser.GameObjects.Text
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

    this.frame = this.scene.add.graphics()
    this.contentPanel = this.scene.add.graphics()
    this.panelHitArea = this.scene.add
      .rectangle(0, 0, ShopUIConfig.window.width, ShopUIConfig.window.height, 0xffffff, 0.001)
      .setInteractive()
    this.panelHitArea.on(Phaser.Input.Events.POINTER_DOWN, () => undefined)
    this.moneyPanel = this.scene.add.graphics()
    this.coinIcon = this.scene.add.graphics()

    this.titleShadow = this.scene.add
      .text(0, 0, 'Shop Window', {
        fontFamily: 'Georgia, serif',
        fontSize: '38px',
        color: '#1b0d05',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)

    this.title = this.scene.add
      .text(0, 0, 'Shop Window', {
        fontFamily: 'Georgia, serif',
        fontSize: '38px',
        color: ShopUIConfig.window.titleColor,
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)

    this.subtitle = this.scene.add
      .text(0, 0, 'Buy rods, boats, lures, and investments.', {
        fontFamily: 'Georgia, serif',
        fontSize: '17px',
        color: ShopUIConfig.window.titleColor,
        fontStyle: 'bold',
      })
      .setOrigin(0, 0)

    this.moneyText = this.scene.add
      .text(0, 0, '$0', {
        fontFamily: 'Georgia, serif',
        fontSize: '20px',
        color: ShopUIConfig.window.money.valueColor,
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5)

    this.closeButtonSkin = this.scene.add.graphics()
    this.closeButtonHitArea = this.scene.add
      .rectangle(0, 0, 104, 42, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true })
    this.closeButtonHitArea.on(Phaser.Input.Events.POINTER_DOWN, () => handlers.onCloseRequested())

    this.closeButtonLabel = this.scene.add
      .text(0, 0, 'Close', {
        fontFamily: 'Georgia, serif',
        fontSize: '20px',
        color: '#2a160a',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.root.add([
      this.backdrop,
      this.frame,
      this.contentPanel,
      this.panelHitArea,
      this.moneyPanel,
      this.coinIcon,
      this.titleShadow,
      this.title,
      this.subtitle,
      this.moneyText,
      this.closeButtonSkin,
      this.closeButtonHitArea,
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

    const contentWidth = ShopUIConfig.catalogList.rowWidth + 22
    const contentHeight = ShopUIConfig.window.height - 92
    const contentTop = panelTop + 76
    const contentPanelLeft = centerX - contentWidth * 0.5
    const contentPanelRight = centerX + contentWidth * 0.5
    const controlY = panelTop + 116
    const controlInset = 8
    const moneyX = contentPanelLeft + controlInset + ShopUIConfig.window.money.width * 0.5
    const closeX = contentPanelRight - controlInset - 52

    this.frame.setPosition(centerX, centerY)
    ShopChromePainter.drawWindowFrame(this.frame, ShopUIConfig.window.width, ShopUIConfig.window.height)
    this.contentPanel.setPosition(centerX, contentTop + contentHeight * 0.5)
    ShopChromePainter.drawParchmentPanel(this.contentPanel, contentWidth, contentHeight, 12)
    this.panelHitArea.setPosition(centerX, centerY)
    this.moneyPanel.setPosition(moneyX, controlY)
    ShopChromePainter.drawParchmentPanel(this.moneyPanel, ShopUIConfig.window.money.width, ShopUIConfig.window.money.height, 8)
    this.coinIcon.setPosition(moneyX - 84, controlY)
    ShopChromePainter.drawCoin(this.coinIcon, ShopUIConfig.window.money.coinRadius)

    this.titleShadow.setPosition(centerX + 3, panelTop + 19)
    this.title.setPosition(centerX, panelTop + 14)
    this.subtitle.setPosition(centerX - this.subtitle.width * 0.5, panelTop + 56)
    this.moneyText.setPosition(moneyX - 58, controlY)

    this.closeButtonSkin.setPosition(closeX, controlY)
    ShopChromePainter.drawButton(this.closeButtonSkin, 104, 42, 'close')
    this.closeButtonHitArea.setPosition(closeX, controlY)
    this.closeButtonLabel.setPosition(closeX, controlY)
    this.layoutDynamicContent(centerX, panelTop)
  }

  destroy(): void {
    this.backdrop.off(Phaser.Input.Events.POINTER_DOWN)
    this.panelHitArea.off(Phaser.Input.Events.POINTER_DOWN)
    this.closeButtonHitArea.off(Phaser.Input.Events.POINTER_DOWN)
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
        fontFamily: 'Georgia, serif',
        fontSize: '30px',
        color: ShopUIConfig.window.cardTextColor,
        fontStyle: 'bold',
      })
      .setOrigin(0, 0)
    const categoryDesc = this.scene.add
      .text(0, 0, selectedCategory.description, {
        fontFamily: 'Georgia, serif',
        fontSize: '17px',
        color: ShopUIConfig.window.cardSubtextColor,
        fontStyle: 'bold',
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
      const buttonSkin = this.scene.add.graphics()
      ShopChromePainter.drawTab(buttonSkin, tabWidth, tabHeight, selected)

      const button = this.scene.add
        .rectangle(0, 0, tabWidth, tabHeight, 0xffffff, 0.001)
        .setInteractive({ useHandCursor: true })
      button.on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.selectedCategoryId = category.id
        this.rebuildDynamicContent()
      })

      const label = this.scene.add
        .text(0, 0, category.title, {
          fontFamily: 'Georgia, serif',
          fontSize: '20px',
          color: selected ? '#fff0ce' : ShopUIConfig.window.cardTextColor,
          fontStyle: 'bold',
        })
        .setOrigin(0.5)

      this.trackDynamic(buttonSkin, button, label)
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
      const buttonSkin = this.dynamicObjects[index] as Phaser.GameObjects.Graphics
      const button = this.dynamicObjects[index + 1] as Phaser.GameObjects.Rectangle
      const label = this.dynamicObjects[index + 2] as Phaser.GameObjects.Text
      const x = tabStartX + i * (tabWidth + tabGap)
      buttonSkin.setPosition(x, tabY)
      button.setPosition(x, tabY)
      label.setPosition(x, tabY)
      index += 3
    }

    const contentLeft = centerX - ShopUIConfig.window.width * 0.5 + ShopUIConfig.window.contentInsetX
    const title = this.dynamicObjects[index] as Phaser.GameObjects.Text
    const desc = this.dynamicObjects[index + 1] as Phaser.GameObjects.Text
    title.setPosition(contentLeft + 18, panelTop + 190)
    desc.setPosition(contentLeft + 58, panelTop + 220)
    index += 2

    if (this.activeCatalogId) {
      this.catalogPanel.layout(centerX, panelTop + ShopUIConfig.catalogList.contentTopOffset)
    }
  }
}
