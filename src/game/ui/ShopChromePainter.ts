import Phaser from 'phaser'
import { ShopUIConfig } from '../config/ShopUIConfig'

type ButtonTone = 'primary' | 'disabled' | 'close'

/**
 * Small procedural painter for the western shop chrome. Gameplay/UI modules own
 * layout and input; this class only draws reusable wood/parchment shapes.
 */
export class ShopChromePainter {
  static drawWindowFrame(graphics: Phaser.GameObjects.Graphics, width: number, height: number): void {
    const { frame } = ShopUIConfig.window
    const left = -width * 0.5
    const top = -height * 0.5

    graphics.clear()
    graphics.fillStyle(frame.shadowColor, frame.shadowAlpha)
    graphics.fillRoundedRect(left + 8, top + 10, width, height, frame.radius)

    graphics.fillStyle(frame.outerWoodColor, 1)
    graphics.lineStyle(frame.outerStrokeWidth, frame.outerStrokeColor, 1)
    graphics.fillRoundedRect(left, top, width, height, frame.radius)
    graphics.strokeRoundedRect(left, top, width, height, frame.radius)

    graphics.fillStyle(frame.innerWoodColor, 1)
    graphics.fillRoundedRect(
      left + frame.railInset,
      top + frame.railInset,
      width - frame.railInset * 2,
      height - frame.railInset * 2,
      frame.radius - 4,
    )

    graphics.fillStyle(frame.plankLineColor, frame.plankLineAlpha)
    graphics.fillRect(left + frame.railInset, top + frame.headerHeight, width - frame.railInset * 2, 3)
    graphics.fillRect(left + frame.railInset, top + height - frame.footerHeight, width - frame.railInset * 2, 3)
    graphics.fillRect(left + frame.railInset + 10, top + frame.headerHeight - 22, width - frame.railInset * 2 - 20, 2)
    graphics.fillRect(left + frame.railInset + 10, top + height - frame.footerHeight + 18, width - frame.railInset * 2 - 20, 2)

    const capSize = frame.cornerSize
    const capPositions = [
      [left, top],
      [left + width - capSize, top],
      [left, top + height - capSize],
      [left + width - capSize, top + height - capSize],
    ] as const

    for (const [x, y] of capPositions) {
      graphics.fillStyle(frame.cornerColor, 1)
      graphics.lineStyle(frame.outerStrokeWidth, frame.outerStrokeColor, 1)
      graphics.fillRoundedRect(x, y, capSize, capSize, frame.radius)
      graphics.strokeRoundedRect(x, y, capSize, capSize, frame.radius)
      graphics.fillStyle(frame.boltColor, 1)
      graphics.lineStyle(3, frame.outerStrokeColor, 1)
      graphics.fillCircle(x + capSize * 0.5, y + capSize * 0.5, frame.boltRadius)
      graphics.strokeCircle(x + capSize * 0.5, y + capSize * 0.5, frame.boltRadius)
    }
  }

  static drawParchmentPanel(graphics: Phaser.GameObjects.Graphics, width: number, height: number, radius = 10): void {
    const { parchment } = ShopUIConfig.window
    graphics.clear()
    graphics.fillStyle(parchment.shadowColor, parchment.shadowAlpha)
    graphics.fillRoundedRect(-width * 0.5 + 4, -height * 0.5 + 5, width, height, radius)
    graphics.fillStyle(parchment.fillColor, 1)
    graphics.lineStyle(parchment.strokeWidth, parchment.strokeColor, 1)
    graphics.fillRoundedRect(-width * 0.5, -height * 0.5, width, height, radius)
    graphics.strokeRoundedRect(-width * 0.5, -height * 0.5, width, height, radius)
    graphics.lineStyle(1, parchment.highlightColor, parchment.highlightAlpha)
    graphics.strokeRoundedRect(-width * 0.5 + 5, -height * 0.5 + 5, width - 10, height - 10, Math.max(2, radius - 4))
  }

  static drawTab(graphics: Phaser.GameObjects.Graphics, width: number, height: number, selected: boolean): void {
    const { tabs, window } = ShopUIConfig
    graphics.clear()
    graphics.fillStyle(selected ? window.cardActiveColor : tabs.inactiveFillColor, 1)
    graphics.lineStyle(tabs.strokeWidth, selected ? tabs.activeBorderColor : tabs.inactiveBorderColor, 1)
    graphics.fillRoundedRect(-width * 0.5, -height * 0.5, width, height, tabs.radius)
    graphics.strokeRoundedRect(-width * 0.5, -height * 0.5, width, height, tabs.radius)
  }

  static drawCatalogRow(graphics: Phaser.GameObjects.Graphics, width: number, height: number, locked: boolean): void {
    const { row } = ShopUIConfig.catalogList
    graphics.clear()
    graphics.fillStyle(locked ? row.lockedFillColor : row.fillColor, locked ? row.lockedAlpha : 1)
    graphics.lineStyle(row.strokeWidth, row.strokeColor, 1)
    graphics.fillRoundedRect(-width * 0.5, -height * 0.5, width, height, row.radius)
    graphics.strokeRoundedRect(-width * 0.5, -height * 0.5, width, height, row.radius)
  }

  static drawIconCard(graphics: Phaser.GameObjects.Graphics, width: number, height: number, locked: boolean): void {
    const { iconCard } = ShopUIConfig.catalogList
    graphics.clear()
    graphics.fillStyle(locked ? iconCard.lockedFillColor : iconCard.fillColor, 1)
    graphics.lineStyle(iconCard.strokeWidth, iconCard.strokeColor, 1)
    graphics.fillRoundedRect(-width * 0.5, -height * 0.5, width, height, iconCard.radius)
    graphics.strokeRoundedRect(-width * 0.5, -height * 0.5, width, height, iconCard.radius)
  }

  static drawButton(graphics: Phaser.GameObjects.Graphics, width: number, height: number, tone: ButtonTone): void {
    const colors = ShopUIConfig.window.buttons[tone]
    graphics.clear()
    graphics.fillStyle(colors.fillColor, 1)
    graphics.lineStyle(colors.strokeWidth, colors.strokeColor, 1)
    graphics.fillRoundedRect(-width * 0.5, -height * 0.5, width, height, colors.radius)
    graphics.strokeRoundedRect(-width * 0.5, -height * 0.5, width, height, colors.radius)
    graphics.lineStyle(1, colors.highlightColor, colors.highlightAlpha)
    graphics.strokeRoundedRect(-width * 0.5 + 4, -height * 0.5 + 4, width - 8, height - 8, Math.max(2, colors.radius - 4))
  }

  static drawCoin(graphics: Phaser.GameObjects.Graphics, radius: number): void {
    const { money } = ShopUIConfig.window
    graphics.clear()
    graphics.fillStyle(money.coinOuterColor, 1)
    graphics.lineStyle(3, money.coinStrokeColor, 1)
    graphics.fillCircle(0, 0, radius)
    graphics.strokeCircle(0, 0, radius)
    graphics.fillStyle(money.coinInnerColor, 1)
    graphics.fillCircle(0, 0, radius - 6)
    graphics.lineStyle(2, money.coinStrokeColor, 0.7)
    graphics.strokeCircle(0, 0, radius - 6)
  }
}
