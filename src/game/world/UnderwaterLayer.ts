import Phaser from 'phaser'
import { WorldArtConfig } from '../config/WorldArtConfig'
import { WorldConfig } from '../config/WorldConfig'

/** Simple underwater colour bands and sparse weird desert-oasis props. */
export class UnderwaterLayer {
  constructor(scene: Phaser.Scene) {
    this.drawWaterBands(scene)
    this.drawLightRays(scene)
    this.drawProps(scene)
  }

  private drawWaterBands(scene: Phaser.Scene): void {
    const { depths, palette, underwater } = WorldArtConfig
    const g = scene.add.graphics().setDepth(depths.underwaterBase)

    for (const band of underwater.bands) {
      g.fillStyle(band.color, 1)
      g.fillRect(WorldConfig.worldLeftX, WorldConfig.waterlineY + band.y, WorldConfig.worldWidth, band.height)
    }

    const finalBand = underwater.bands[underwater.bands.length - 1]
    const finalBottom = finalBand.y + finalBand.height
    if (finalBottom < WorldConfig.maxDepth) {
      g.fillStyle(palette.waterDark, 1)
      g.fillRect(
        WorldConfig.worldLeftX,
        WorldConfig.waterlineY + finalBottom,
        WorldConfig.worldWidth,
        WorldConfig.maxDepth - finalBottom,
      )
    }
  }

  private drawLightRays(scene: Phaser.Scene): void {
    const g = scene.add.graphics().setDepth(WorldArtConfig.depths.underwaterBase + 1)

    for (const ray of WorldArtConfig.underwater.lightRays) {
      g.fillStyle(WorldArtConfig.palette.foam, ray.alpha)
      g.beginPath()
      g.moveTo(ray.x, WorldConfig.waterlineY)
      g.lineTo(ray.x + ray.width, WorldConfig.waterlineY)
      g.lineTo(ray.x + ray.width * 0.35, WorldConfig.waterlineY + ray.height)
      g.lineTo(ray.x - ray.width * 0.15, WorldConfig.waterlineY + ray.height)
      g.closePath()
      g.fillPath()
    }
  }

  private drawProps(scene: Phaser.Scene): void {
    const g = scene.add.graphics().setDepth(WorldArtConfig.depths.underwaterDetails)

    for (const rock of WorldArtConfig.underwater.rocks) {
      this.drawRockCluster(g, rock.x, rock.y, rock.scale)
    }

    for (const cactus of WorldArtConfig.underwater.cactusWeeds) {
      this.drawCactusWeed(g, cactus.x, cactus.y, cactus.scale)
    }

    for (const bubbles of WorldArtConfig.underwater.bubbles) {
      this.drawBubbleStack(g, bubbles.x, bubbles.y, bubbles.scale)
    }
  }

  private drawRockCluster(g: Phaser.GameObjects.Graphics, x: number, y: number, scale: number): void {
    const { outline, rock, rockDark } = WorldArtConfig.palette
    g.fillStyle(rockDark, 0.8)
    g.fillEllipse(x + 16 * scale, y + 12 * scale, 90 * scale, 32 * scale)
    g.fillStyle(rock, 1)
    g.fillEllipse(x - 30 * scale, y, 74 * scale, 42 * scale)
    g.fillEllipse(x + 26 * scale, y - 10 * scale, 96 * scale, 58 * scale)
    g.fillEllipse(x + 78 * scale, y + 4 * scale, 54 * scale, 34 * scale)
    g.lineStyle(2, outline, 0.45)
    g.strokeEllipse(x - 30 * scale, y, 74 * scale, 42 * scale)
    g.strokeEllipse(x + 26 * scale, y - 10 * scale, 96 * scale, 58 * scale)
    g.strokeEllipse(x + 78 * scale, y + 4 * scale, 54 * scale, 34 * scale)
  }

  private drawCactusWeed(g: Phaser.GameObjects.Graphics, x: number, groundY: number, scale: number): void {
    const { outline, cactus, cactusDark } = WorldArtConfig.palette
    const trunkW = 18 * scale
    const trunkH = 108 * scale
    const armW = 14 * scale

    g.fillStyle(cactusDark, 0.26)
    g.fillEllipse(x + 10 * scale, groundY + 8 * scale, 84 * scale, 22 * scale)

    g.fillStyle(cactus, 0.72)
    g.lineStyle(2, outline, 0.35)
    g.fillRoundedRect(x - trunkW / 2, groundY - trunkH, trunkW, trunkH, trunkW / 2)
    g.strokeRoundedRect(x - trunkW / 2, groundY - trunkH, trunkW, trunkH, trunkW / 2)

    g.fillRoundedRect(x - 34 * scale, groundY - 70 * scale, armW, 46 * scale, armW / 2)
    g.strokeRoundedRect(x - 34 * scale, groundY - 70 * scale, armW, 46 * scale, armW / 2)
    g.fillRoundedRect(x + 20 * scale, groundY - 86 * scale, armW, 50 * scale, armW / 2)
    g.strokeRoundedRect(x + 20 * scale, groundY - 86 * scale, armW, 50 * scale, armW / 2)

    g.lineStyle(2, cactusDark, 0.45)
    g.lineBetween(x, groundY - trunkH + 14 * scale, x, groundY - 10 * scale)
  }

  private drawBubbleStack(g: Phaser.GameObjects.Graphics, x: number, y: number, scale: number): void {
    const { bubble, foam } = WorldArtConfig.palette
    const bubbles = [
      { x: 0, y: 0, radius: 9 },
      { x: 22, y: -46, radius: 6 },
      { x: -16, y: -88, radius: 5 },
      { x: 12, y: -132, radius: 8 },
    ]

    for (const bubbleSpec of bubbles) {
      g.fillStyle(bubble, 0.22)
      g.fillCircle(x + bubbleSpec.x * scale, y + bubbleSpec.y * scale, bubbleSpec.radius * scale)
      g.lineStyle(2, foam, 0.42)
      g.strokeCircle(x + bubbleSpec.x * scale, y + bubbleSpec.y * scale, bubbleSpec.radius * scale)
    }
  }
}
