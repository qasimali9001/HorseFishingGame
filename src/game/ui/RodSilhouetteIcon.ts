import Phaser from 'phaser'
import type { RodSilhouetteVariant } from '../data/rodPlaceholderData'

/**
 * Procedural dark rod silhouettes for locked shop slots.
 * Each variant hints at a future rod shape without needing art yet.
 */
export class RodSilhouetteIcon {
  static create(
    scene: Phaser.Scene,
    variant: RodSilhouetteVariant,
    width = 56,
    height = 56,
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(0, 0)
    const backdrop = scene.add
      .rectangle(0, 0, width, height, 0xddc184, 0.95)
      .setStrokeStyle(1, 0x3a210d)
    const graphics = scene.add.graphics()
    RodSilhouetteIcon.draw(graphics, variant, width, height)
    container.add([backdrop, graphics])
    return container
  }

  private static draw(
    graphics: Phaser.GameObjects.Graphics,
    variant: RodSilhouetteVariant,
    width: number,
    height: number,
  ): void {
    const cx = width * 0.5
    const cy = height * 0.5
    const fill = 0x80683f
    const highlight = 0xa28450

    graphics.fillStyle(fill, 1)

    switch (variant) {
      case 'thin':
        graphics.fillRoundedRect(cx - 24, cy - 2, 48, 4, 2)
        break
      case 'medium':
        graphics.fillRoundedRect(cx - 22, cy - 3, 44, 6, 2)
        graphics.fillStyle(highlight, 1)
        graphics.fillRoundedRect(cx - 24, cy - 4, 8, 8, 2)
        break
      case 'thick':
        graphics.fillRoundedRect(cx - 20, cy - 4, 40, 8, 3)
        graphics.fillStyle(highlight, 1)
        graphics.fillRoundedRect(cx - 22, cy - 5, 10, 10, 2)
        break
      case 'curved':
        graphics.fillRoundedRect(cx - 20, cy - 1, 18, 4, 2)
        graphics.fillRoundedRect(cx - 4, cy - 5, 18, 4, 2)
        graphics.fillRoundedRect(cx + 10, cy - 2, 14, 4, 2)
        break
      case 'reel':
        graphics.fillRoundedRect(cx - 22, cy - 2, 44, 4, 2)
        graphics.fillStyle(highlight, 1)
        graphics.fillCircle(cx - 8, cy, 6)
        graphics.fillRoundedRect(cx - 24, cy - 3, 6, 6, 1)
        break
      case 'tall':
        graphics.fillRoundedRect(cx - 3, cy - 22, 6, 44, 2)
        graphics.fillStyle(highlight, 1)
        graphics.fillRoundedRect(cx - 5, cy + 14, 10, 8, 2)
        break
      default:
        graphics.fillRoundedRect(cx - 22, cy - 3, 44, 6, 2)
    }
  }
}
