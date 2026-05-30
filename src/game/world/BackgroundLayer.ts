import Phaser from 'phaser'
import { WorldArtConfig } from '../config/WorldArtConfig'
import { WorldConfig } from '../config/WorldConfig'

/** Sky, distant dunes, and sparse desert props behind the playable surface. */
export class BackgroundLayer {
  constructor(scene: Phaser.Scene) {
    this.drawSky(scene)
    this.drawDunes(scene)
    this.drawDistantProps(scene)
  }

  private drawSky(scene: Phaser.Scene): void {
    const { palette, depths } = WorldArtConfig
    const top = WorldConfig.waterlineY - WorldConfig.skyHeight
    const midpoint = top + WorldConfig.skyHeight * 0.46
    const bottomHeight = WorldConfig.skyHeight - (midpoint - top)

    scene.add
      .rectangle(
        WorldConfig.worldLeftX + WorldConfig.worldWidth / 2,
        top + (midpoint - top) / 2,
        WorldConfig.worldWidth,
        midpoint - top,
        palette.skyTop,
      )
      .setDepth(depths.sky)

    scene.add
      .rectangle(
        WorldConfig.worldLeftX + WorldConfig.worldWidth / 2,
        midpoint + bottomHeight / 2,
        WorldConfig.worldWidth,
        bottomHeight,
        palette.skyBottom,
      )
      .setDepth(depths.sky)

    const clouds = scene.add.graphics().setDepth(depths.distantProps)
    for (const cloud of WorldArtConfig.background.clouds) {
      this.drawCloud(clouds, cloud.x, cloud.y, cloud.scale)
    }

    const birds = scene.add.graphics().setDepth(depths.distantProps)
    for (const bird of WorldArtConfig.background.birds) {
      this.drawBird(birds, bird.x, bird.y, bird.scale)
    }
  }

  private drawDunes(scene: Phaser.Scene): void {
    const { background, depths, palette } = WorldArtConfig

    for (const dune of background.dunes) {
      const g = scene.add.graphics().setDepth(depths.dunes)
      g.fillStyle(dune.color, 1)
      g.fillEllipse(dune.x, dune.y, dune.width, dune.height)
      g.lineStyle(2, palette.outline, 0.5)
      g.strokeEllipse(dune.x, dune.y, dune.width, dune.height)
    }

    const horizon = scene.add.graphics().setDepth(depths.dunes + 1)
    horizon.fillStyle(palette.sand, 1)
    horizon.fillRect(WorldConfig.worldLeftX, -18, WorldConfig.worldWidth, 46)
    horizon.lineStyle(2, palette.outline, 0.35)
    horizon.lineBetween(WorldConfig.worldLeftX, -18, WorldConfig.worldLeftX + WorldConfig.worldWidth, -18)

    horizon.fillStyle(palette.sandShade, 0.6)
    for (let x = WorldConfig.worldLeftX + 80; x < WorldConfig.worldLeftX + WorldConfig.worldWidth; x += 260) {
      horizon.fillEllipse(x, 4 + ((x / 260) % 2) * 8, 34, 8)
      horizon.fillEllipse(x + 56, -2, 14, 6)
    }
  }

  private drawDistantProps(scene: Phaser.Scene): void {
    const g = scene.add.graphics().setDepth(WorldArtConfig.depths.distantProps)

    for (const cactus of WorldArtConfig.background.cacti) {
      this.drawCactus(g, cactus.x, cactus.y, cactus.scale)
    }

    for (const palm of WorldArtConfig.background.palms) {
      this.drawPalm(g, palm.x, palm.y, palm.scale)
    }
  }

  private drawCloud(g: Phaser.GameObjects.Graphics, x: number, y: number, scale: number): void {
    const { cloud } = WorldArtConfig.palette
    g.fillStyle(cloud, 1)
    g.fillEllipse(x, y + 12 * scale, 132 * scale, 36 * scale)
    g.fillCircle(x - 44 * scale, y + 2 * scale, 22 * scale)
    g.fillCircle(x - 10 * scale, y - 15 * scale, 34 * scale)
    g.fillCircle(x + 34 * scale, y - 5 * scale, 27 * scale)
    g.fillCircle(x + 58 * scale, y + 11 * scale, 18 * scale)
  }

  private drawBird(g: Phaser.GameObjects.Graphics, x: number, y: number, scale: number): void {
    g.lineStyle(3 * scale, WorldArtConfig.palette.outline, 0.45)
    g.lineBetween(x - 18 * scale, y, x - 7 * scale, y - 8 * scale)
    g.lineBetween(x - 7 * scale, y - 8 * scale, x, y)
    g.lineBetween(x, y, x + 10 * scale, y - 8 * scale)
    g.lineBetween(x + 10 * scale, y - 8 * scale, x + 22 * scale, y)
  }

  private drawCactus(g: Phaser.GameObjects.Graphics, x: number, groundY: number, scale: number): void {
    const { cactus, cactusDark, cactusLight, cactusFlower, outline } = WorldArtConfig.palette
    const trunkW = 18 * scale
    const trunkH = 84 * scale
    const armW = 14 * scale
    const armH = 40 * scale

    g.fillStyle(cactus, 1)
    g.lineStyle(2, outline, 0.8)
    g.fillRoundedRect(x - trunkW / 2, groundY - trunkH, trunkW, trunkH, trunkW / 2)
    g.strokeRoundedRect(x - trunkW / 2, groundY - trunkH, trunkW, trunkH, trunkW / 2)
    g.fillRoundedRect(x - 36 * scale, groundY - 58 * scale, armW, armH, armW / 2)
    g.strokeRoundedRect(x - 36 * scale, groundY - 58 * scale, armW, armH, armW / 2)
    g.fillRoundedRect(x + 22 * scale, groundY - 70 * scale, armW, armH, armW / 2)
    g.strokeRoundedRect(x + 22 * scale, groundY - 70 * scale, armW, armH, armW / 2)

    g.lineStyle(2, cactusDark, 0.7)
    g.lineBetween(x, groundY - trunkH + 10 * scale, x, groundY - 8 * scale)
    g.lineBetween(x - 28 * scale, groundY - 26 * scale, x - 28 * scale, groundY - 48 * scale)
    g.lineBetween(x + 30 * scale, groundY - 35 * scale, x + 30 * scale, groundY - 62 * scale)

    g.lineStyle(2, cactusLight, 0.95)
    for (let y = groundY - trunkH + 18 * scale; y < groundY - 12 * scale; y += 18 * scale) {
      g.lineBetween(x - 5 * scale, y, x - 12 * scale, y - 5 * scale)
      g.lineBetween(x + 5 * scale, y + 6 * scale, x + 12 * scale, y + 1 * scale)
    }

    g.fillStyle(cactusFlower, 1)
    g.fillCircle(x + 30 * scale, groundY - 72 * scale, 4 * scale)
  }

  private drawPalm(g: Phaser.GameObjects.Graphics, x: number, groundY: number, scale: number): void {
    const { palmTrunk, palmLeaf, outline } = WorldArtConfig.palette
    const topY = groundY - 86 * scale

    g.lineStyle(14 * scale, outline, 0.45)
    g.lineBetween(x, groundY, x + 18 * scale, topY)
    g.lineStyle(10 * scale, palmTrunk, 1)
    g.lineBetween(x, groundY, x + 18 * scale, topY)
    g.lineStyle(2 * scale, outline, 0.25)
    for (let t = 0.2; t < 0.9; t += 0.22) {
      const tx = Phaser.Math.Linear(x, x + 18 * scale, t)
      const ty = Phaser.Math.Linear(groundY, topY, t)
      g.lineBetween(tx - 8 * scale, ty, tx + 5 * scale, ty - 3 * scale)
    }

    g.fillStyle(palmLeaf, 1)
    g.lineStyle(2, outline, 0.35)
    this.drawPalmLeaf(g, x + 18 * scale, topY, x - 44 * scale, topY + 12 * scale, x - 4 * scale, topY + 28 * scale)
    this.drawPalmLeaf(g, x + 18 * scale, topY, x + 82 * scale, topY + 10 * scale, x + 38 * scale, topY + 30 * scale)
    this.drawPalmLeaf(g, x + 18 * scale, topY, x - 22 * scale, topY - 40 * scale, x + 7 * scale, topY - 16 * scale)
    this.drawPalmLeaf(g, x + 18 * scale, topY, x + 58 * scale, topY - 36 * scale, x + 30 * scale, topY - 14 * scale)
    this.drawPalmLeaf(g, x + 18 * scale, topY, x - 30 * scale, topY - 8 * scale, x - 2 * scale, topY + 12 * scale)
    this.drawPalmLeaf(g, x + 18 * scale, topY, x + 62 * scale, topY - 2 * scale, x + 28 * scale, topY + 16 * scale)
  }

  private drawPalmLeaf(
    g: Phaser.GameObjects.Graphics,
    ax: number,
    ay: number,
    bx: number,
    by: number,
    cx: number,
    cy: number,
  ): void {
    g.fillTriangle(ax, ay, bx, by, cx, cy)
    g.strokeTriangle(ax, ay, bx, by, cx, cy)
  }
}
