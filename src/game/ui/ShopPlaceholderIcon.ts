import Phaser from 'phaser'
import type { ShopPlaceholderKind } from '../types/ShopCatalogTypes'

/**
 * Procedural silhouettes for locked shop rows (boats, lures, investments, etc.).
 */
export class ShopPlaceholderIcon {
  static create(
    scene: Phaser.Scene,
    kind: ShopPlaceholderKind,
    width = 48,
    height = 48,
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(0, 0)
    const backdrop = scene.add
      .rectangle(0, 0, width, height, 0x0a1822, 0.95)
      .setStrokeStyle(1, 0x3d5668)
    const graphics = scene.add.graphics()
    ShopPlaceholderIcon.draw(graphics, kind, width, height)
    container.add([backdrop, graphics])
    return container
  }

  private static draw(
    graphics: Phaser.GameObjects.Graphics,
    kind: ShopPlaceholderKind,
    width: number,
    height: number,
  ): void {
    const cx = width * 0.5
    const cy = height * 0.5
    const fill = 0x2a3f4f
    const highlight = 0x3a5568

    graphics.fillStyle(fill, 1)

    switch (kind) {
      case 'boat':
        graphics.fillRoundedRect(cx - 22, cy + 2, 44, 10, 3)
        graphics.fillTriangle(cx - 18, cy + 2, cx, cy - 14, cx + 18, cy + 2)
        graphics.fillStyle(highlight, 1)
        graphics.fillRect(cx - 4, cy - 8, 8, 10)
        break
      case 'lure':
        graphics.fillCircle(cx + 10, cy - 6, 5)
        graphics.lineStyle(3, fill, 1)
        graphics.lineBetween(cx + 10, cy - 1, cx - 16, cy + 10)
        graphics.fillStyle(highlight, 1)
        graphics.fillTriangle(cx - 16, cy + 10, cx - 22, cy + 16, cx - 10, cy + 16)
        break
      case 'investment':
        graphics.fillRoundedRect(cx - 18, cy + 6, 36, 8, 2)
        graphics.fillRect(cx - 14, cy - 8, 6, 14)
        graphics.fillRect(cx - 4, cy - 14, 6, 20)
        graphics.fillRect(cx + 6, cy - 4, 6, 10)
        graphics.fillStyle(highlight, 1)
        graphics.fillCircle(cx + 16, cy - 12, 4)
        break
      case 'rod':
      default:
        graphics.fillRoundedRect(cx - 22, cy - 3, 44, 6, 2)
        graphics.fillStyle(highlight, 1)
        graphics.fillRoundedRect(cx - 24, cy - 4, 8, 8, 2)
        break
    }
  }
}
