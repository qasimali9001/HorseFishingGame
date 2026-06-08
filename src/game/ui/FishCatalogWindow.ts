import Phaser from 'phaser'
import { FishCatalogUIConfig } from '../config/FishCatalogUIConfig'
import { ShopUIConfig } from '../config/ShopUIConfig'
import type { FishCatalogEntrySnapshot, FishCatalogStateSnapshot } from '../types/FishCatalogTypes'
import { ShopChromePainter } from './ShopChromePainter'

interface FishCardObjects {
  readonly skin: Phaser.GameObjects.Graphics
  readonly iconCard: Phaser.GameObjects.Graphics
  readonly fishImage: Phaser.GameObjects.Image
  readonly label: Phaser.GameObjects.Text
  readonly status: Phaser.GameObjects.Text
  readonly hitArea: Phaser.GameObjects.Rectangle
  readonly entry: FishCatalogEntrySnapshot
}

/**
 * Fish discovery catalog. Locked fish stay as silhouettes; caught fish become
 * clickable and reveal their stats in the detail panel.
 */
export class FishCatalogWindow {
  private readonly scene: Phaser.Scene
  private readonly root: Phaser.GameObjects.Container
  private readonly backdrop: Phaser.GameObjects.Rectangle
  private readonly frame: Phaser.GameObjects.Graphics
  private readonly contentPanel: Phaser.GameObjects.Graphics
  private readonly panelHitArea: Phaser.GameObjects.Rectangle
  private readonly closeButtonSkin: Phaser.GameObjects.Graphics
  private readonly closeButtonHitArea: Phaser.GameObjects.Rectangle
  private readonly titleShadow: Phaser.GameObjects.Text
  private readonly closeButtonLabel: Phaser.GameObjects.Text
  private readonly title: Phaser.GameObjects.Text
  private readonly subtitle: Phaser.GameObjects.Text
  private readonly progressText: Phaser.GameObjects.Text
  private readonly detailPanel: Phaser.GameObjects.Graphics
  private readonly detailTitle: Phaser.GameObjects.Text
  private readonly detailImage: Phaser.GameObjects.Image
  private readonly detailBody: Phaser.GameObjects.Text

  private readonly cards: FishCardObjects[] = []
  private state: FishCatalogStateSnapshot | null = null
  private selectedFishId: string | null = null

  constructor(scene: Phaser.Scene, handlers: { onCloseRequested: () => void }) {
    this.scene = scene
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
      .rectangle(0, 0, FishCatalogUIConfig.window.width, FishCatalogUIConfig.window.height, 0xffffff, 0.001)
      .setInteractive()
    this.panelHitArea.on(Phaser.Input.Events.POINTER_DOWN, () => undefined)

    this.titleShadow = this.scene.add
      .text(0, 0, 'Fish Catalog', {
        fontFamily: 'Georgia, serif',
        fontSize: '34px',
        color: '#1b0d05',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)
    this.title = this.scene.add
      .text(0, 0, 'Fish Catalog', {
        fontFamily: 'Georgia, serif',
        fontSize: '34px',
        color: ShopUIConfig.window.titleColor,
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)
    this.subtitle = this.scene.add
      .text(0, 0, 'Catch fish to reveal their records.', {
        fontFamily: 'Georgia, serif',
        fontSize: '17px',
        color: ShopUIConfig.window.titleColor,
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)
    this.progressText = this.scene.add
      .text(0, 0, 'Discovered 0 / 0', {
        fontFamily: 'Georgia, serif',
        fontSize: '17px',
        color: ShopUIConfig.window.cardTextColor,
        fontStyle: 'bold',
      })
      .setOrigin(0, 0)

    this.closeButtonSkin = this.scene.add.graphics()
    this.closeButtonHitArea = this.scene.add
      .rectangle(0, 0, 92, 38, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true })
    this.closeButtonHitArea.on(Phaser.Input.Events.POINTER_DOWN, () => handlers.onCloseRequested())
    this.closeButtonLabel = this.scene.add
      .text(0, 0, 'Close', {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        color: '#2a160a',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.detailPanel = this.scene.add.graphics()
    this.detailTitle = this.scene.add
      .text(0, 0, 'Undiscovered', {
        fontFamily: 'Georgia, serif',
        fontSize: '20px',
        color: ShopUIConfig.window.cardTextColor,
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: FishCatalogUIConfig.detail.width - 20 },
      })
      .setOrigin(0.5, 0)
    this.detailImage = this.scene.add.image(0, 0, 'fish-goldfish-orange').setVisible(false)
    this.detailBody = this.scene.add
      .text(0, 0, 'Catch a fish, then click its portrait to study it.', {
        fontFamily: 'Georgia, serif',
        fontSize: '15px',
        color: ShopUIConfig.window.cardSubtextColor,
        fontStyle: 'bold',
        lineSpacing: 4,
        wordWrap: { width: FishCatalogUIConfig.detail.width - 24 },
      })
      .setOrigin(0, 0)

    this.root.add([
      this.backdrop,
      this.frame,
      this.contentPanel,
      this.panelHitArea,
      this.titleShadow,
      this.title,
      this.subtitle,
      this.progressText,
      this.closeButtonSkin,
      this.closeButtonHitArea,
      this.closeButtonLabel,
      this.detailPanel,
      this.detailTitle,
      this.detailImage,
      this.detailBody,
    ])
    this.layout()
  }

  get isOpen(): boolean {
    return this.root.visible
  }

  setOpen(nextOpen: boolean): void {
    this.root.setVisible(nextOpen)
  }

  setState(nextState: FishCatalogStateSnapshot): void {
    this.state = nextState
    if (!this.selectedFishId || !this.findEntry(this.selectedFishId)?.caught) {
      this.selectedFishId = this.findFirstCaughtEntry()?.id ?? null
    }

    this.progressText.setText(`Discovered ${nextState.caughtCount} / ${nextState.totalCount}`)
    this.rebuildCards()
    this.refreshDetail()
    this.layout()
  }

  layout(): void {
    this.backdrop.setSize(this.scene.scale.width, this.scene.scale.height)

    const centerX = this.scene.scale.width * 0.5
    const centerY = this.scene.scale.height * 0.5
    const panelTop = centerY - FishCatalogUIConfig.window.height * 0.5
    const contentCenterY = panelTop + 336

    this.frame.setPosition(centerX, centerY)
    ShopChromePainter.drawWindowFrame(
      this.frame,
      FishCatalogUIConfig.window.width,
      FishCatalogUIConfig.window.height,
    )
    this.contentPanel.setPosition(centerX, contentCenterY)
    ShopChromePainter.drawParchmentPanel(
      this.contentPanel,
      FishCatalogUIConfig.window.contentWidth,
      FishCatalogUIConfig.window.contentHeight,
      10,
    )
    this.panelHitArea.setPosition(centerX, centerY)
    this.titleShadow.setPosition(centerX + 3, panelTop + 19)
    this.title.setPosition(centerX, panelTop + 14)
    this.subtitle.setPosition(centerX, panelTop + 58)
    this.progressText.setPosition(centerX - FishCatalogUIConfig.window.contentWidth * 0.5 + 22, panelTop + 92)

    const closeX = centerX + FishCatalogUIConfig.window.width * 0.5 - 74
    const closeY = panelTop + 37
    this.closeButtonSkin.setPosition(closeX, closeY)
    ShopChromePainter.drawButton(this.closeButtonSkin, 92, 38, 'close')
    this.closeButtonHitArea.setPosition(closeX, closeY)
    this.closeButtonLabel.setPosition(closeX, closeY)

    this.layoutCards(centerX, panelTop)
    this.layoutDetail(centerX, panelTop)
  }

  destroy(): void {
    this.backdrop.off(Phaser.Input.Events.POINTER_DOWN)
    this.panelHitArea.off(Phaser.Input.Events.POINTER_DOWN)
    this.closeButtonHitArea.off(Phaser.Input.Events.POINTER_DOWN)
    this.clearCards()
    this.root.destroy(true)
  }

  private rebuildCards(): void {
    this.clearCards()
    if (!this.state) {
      return
    }

    const entries = [...this.state.gridEntries]
    if (this.state.featuredEntry) {
      entries.push(this.state.featuredEntry)
    }

    for (const entry of entries) {
      const skin = this.scene.add.graphics()
      const iconCard = this.scene.add.graphics()
      const fishImage = this.scene.add.image(0, 0, entry.artId)
      const label = this.scene.add
        .text(0, 0, entry.caught ? entry.displayName : '???', {
          fontFamily: 'Georgia, serif',
          fontSize: entry.id === 'horse-fish' ? '18px' : '15px',
          color: ShopUIConfig.window.cardTextColor,
          fontStyle: 'bold',
          align: 'center',
          wordWrap: {
            width:
              entry.id === 'horse-fish'
                ? FishCatalogUIConfig.featured.width - 24
                : FishCatalogUIConfig.grid.cellWidth - 16,
          },
        })
        .setOrigin(0.5)
      const status = this.scene.add
        .text(0, 0, entry.caught ? 'Click for notes' : 'Silhouette locked', {
          fontFamily: 'Georgia, serif',
          fontSize: entry.id === 'horse-fish' ? '13px' : '11px',
          color: entry.caught ? '#287c2b' : ShopUIConfig.window.placeholderTextColor,
          fontStyle: 'bold',
          align: 'center',
          wordWrap: {
            width:
              entry.id === 'horse-fish'
                ? FishCatalogUIConfig.featured.width - 24
                : FishCatalogUIConfig.grid.cellWidth - 16,
          },
        })
        .setOrigin(0.5)
      const hitArea = this.scene.add
        .rectangle(0, 0, 10, 10, 0xffffff, 0.001)
        .setInteractive({ useHandCursor: entry.caught })

      hitArea.on(Phaser.Input.Events.POINTER_DOWN, () => {
        if (!entry.caught) {
          return
        }
        this.selectedFishId = entry.id
        this.refreshDetail()
      })

      this.cards.push({ skin, iconCard, fishImage, label, status, hitArea, entry })
      this.root.add([skin, iconCard, fishImage, label, status, hitArea])
    }
  }

  private clearCards(): void {
    for (const card of this.cards) {
      card.hitArea.off(Phaser.Input.Events.POINTER_DOWN)
      card.skin.destroy()
      card.iconCard.destroy()
      card.fishImage.destroy()
      card.label.destroy()
      card.status.destroy()
      card.hitArea.destroy()
    }
    this.cards.length = 0
  }

  private layoutCards(centerX: number, panelTop: number): void {
    const grid = FishCatalogUIConfig.grid
    const gridWidth = grid.columns * grid.cellWidth + (grid.columns - 1) * grid.gapX
    const gridLeft = centerX - FishCatalogUIConfig.window.contentWidth * 0.5 + 22
    const cardTop = panelTop + grid.topOffset

    for (let index = 0; index < this.cards.length; index += 1) {
      const card = this.cards[index]
      const isFeatured = card.entry.id === 'horse-fish'
      const width = isFeatured ? FishCatalogUIConfig.featured.width : grid.cellWidth
      const height = isFeatured ? FishCatalogUIConfig.featured.height : grid.cellHeight
      const x = isFeatured
        ? gridLeft + gridWidth * 0.5
        : gridLeft + (index % grid.columns) * (grid.cellWidth + grid.gapX) + grid.cellWidth * 0.5
      const y = isFeatured
        ? panelTop + FishCatalogUIConfig.featured.topOffset + height * 0.5
        : cardTop + Math.floor(index / grid.columns) * (grid.cellHeight + grid.gapY) + grid.cellHeight * 0.5

      const selected = card.entry.id === this.selectedFishId
      this.drawCardSkin(card.skin, width, height, card.entry.caught, selected)
      card.skin.setPosition(x, y)
      card.iconCard.setPosition(x, y - (isFeatured ? 16 : 20))
      ShopChromePainter.drawIconCard(card.iconCard, isFeatured ? 122 : 74, isFeatured ? 70 : 50, !card.entry.caught)
      card.hitArea.setPosition(x, y).setSize(width, height)
      card.label.setPosition(x, y + (isFeatured ? 26 : 22))
      card.status.setPosition(x, y + (isFeatured ? 46 : 39))

      this.layoutFishImage(card.fishImage, card.entry, isFeatured ? 104 : 58, isFeatured ? 48 : 36)
      card.fishImage.setPosition(x, y - (isFeatured ? 17 : 20))
    }
  }

  private layoutDetail(centerX: number, panelTop: number): void {
    const detail = FishCatalogUIConfig.detail
    const detailX = centerX + FishCatalogUIConfig.window.contentWidth * 0.5 - 22 - detail.width * 0.5
    const detailY = panelTop + detail.topOffset + detail.height * 0.5

    this.detailPanel.setPosition(detailX, detailY)
    ShopChromePainter.drawParchmentPanel(this.detailPanel, detail.width, detail.height, 8)
    this.detailTitle.setPosition(detailX, detailY - detail.height * 0.5 + 18)
    this.detailImage.setPosition(detailX, detailY - detail.height * 0.5 + 93)
    this.detailBody.setPosition(detailX - detail.width * 0.5 + 12, detailY - detail.height * 0.5 + 143)
  }

  private refreshDetail(): void {
    const entry = this.selectedFishId ? this.findEntry(this.selectedFishId) : null
    if (!entry || !entry.caught) {
      this.detailTitle.setText('Undiscovered')
      this.detailImage.setVisible(false)
      this.detailBody.setText('Catch a fish, then click its portrait to study it.')
      return
    }

    this.detailTitle.setText(entry.displayName)
    this.detailImage.setTexture(entry.artId).setVisible(true).clearTint().setAlpha(1)
    this.layoutFishImage(this.detailImage, entry, 126, 70)
    this.detailBody.setText(
      [
        `Rarity: ${formatLabel(entry.rarity)}`,
        `Size: ${formatLabel(entry.sizeTier)}`,
        `Bait: ${formatLabel(entry.requiredBaitTier)}`,
        `Value: $${entry.value}`,
        `Speed: ${Math.round(entry.speed)}`,
        `Found: ${entry.biomeNames.join(', ')}`,
      ].join('\n'),
    )
  }

  private findEntry(fishId: string): FishCatalogEntrySnapshot | null {
    if (!this.state) {
      return null
    }

    if (this.state.featuredEntry?.id === fishId) {
      return this.state.featuredEntry
    }
    return this.state.gridEntries.find((entry) => entry.id === fishId) ?? null
  }

  private findFirstCaughtEntry(): FishCatalogEntrySnapshot | null {
    if (!this.state) {
      return null
    }

    return (
      this.state.gridEntries.find((entry) => entry.caught) ??
      (this.state.featuredEntry?.caught ? this.state.featuredEntry : null)
    )
  }

  private drawCardSkin(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    caught: boolean,
    selected: boolean,
  ): void {
    graphics.clear()
    graphics.fillStyle(caught ? ShopUIConfig.catalogList.row.fillColor : ShopUIConfig.catalogList.row.lockedFillColor, caught ? 1 : 0.86)
    graphics.lineStyle(selected ? 4 : 3, selected ? ShopUIConfig.window.cardActiveColor : ShopUIConfig.window.cardBorderColor, 1)
    graphics.fillRoundedRect(-width * 0.5, -height * 0.5, width, height, 9)
    graphics.strokeRoundedRect(-width * 0.5, -height * 0.5, width, height, 9)
  }

  private layoutFishImage(
    image: Phaser.GameObjects.Image,
    entry: FishCatalogEntrySnapshot,
    maxWidth: number,
    maxHeight: number,
  ): void {
    const source = image.texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement
    const scale = Math.min(maxWidth / source.width, maxHeight / source.height)
    image.setDisplaySize(source.width * scale, source.height * scale)
    if (entry.caught) {
      image.clearTint().setAlpha(1)
      return
    }

    image.setTint(0x16110b).setAlpha(0.78)
  }
}

function formatLabel(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[-\s]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
