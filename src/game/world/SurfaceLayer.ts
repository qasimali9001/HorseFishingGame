import Phaser from 'phaser'
import { WorldArtConfig } from '../config/WorldArtConfig'
import { WorldConfig } from '../config/WorldConfig'

/** Waterline, desert foreground, and the goofy cactus raft under the horse. */
export class SurfaceLayer {
  constructor(scene: Phaser.Scene) {
    this.drawWaterline(scene)
    this.drawPlatform(scene)
    this.drawProps(scene)
  }

  private drawWaterline(scene: Phaser.Scene): void {
    const { depths, palette, surface } = WorldArtConfig
    const g = scene.add.graphics().setDepth(depths.surfaceWater)

    g.fillStyle(palette.waterTop, 1)
    g.fillRect(WorldConfig.worldLeftX, WorldConfig.waterlineY - 6, WorldConfig.worldWidth, 28)
    g.lineStyle(3, palette.foam, 0.9)
    g.lineBetween(WorldConfig.worldLeftX, WorldConfig.waterlineY - 6, WorldConfig.worldLeftX + WorldConfig.worldWidth, WorldConfig.waterlineY - 6)

    g.lineStyle(3, palette.foam, 0.8)
    for (
      let x = WorldConfig.worldLeftX + 40;
      x < WorldConfig.worldLeftX + WorldConfig.worldWidth;
      x += surface.waterline.foamStep
    ) {
      g.strokeEllipse(x, WorldConfig.waterlineY + 4, 48, 8)
    }

    g.lineStyle(2, palette.waterMid, 0.45)
    for (
      let x = WorldConfig.worldLeftX + 110;
      x < WorldConfig.worldLeftX + WorldConfig.worldWidth;
      x += surface.waterline.rippleStep
    ) {
      g.strokeEllipse(
        x,
        WorldConfig.waterlineY + 24,
        surface.waterline.rippleWidth,
        surface.waterline.rippleHeight,
      )
    }

    g.lineStyle(3, palette.waterRipple, 0.42)
    for (
      let x = WorldConfig.worldLeftX + 90;
      x < WorldConfig.worldLeftX + WorldConfig.worldWidth;
      x += surface.waterline.waveStep
    ) {
      this.drawWave(
        g,
        x,
        WorldConfig.waterlineY + 48 + ((x / surface.waterline.waveStep) % 2) * 18,
        surface.waterline.waveWidth,
        surface.waterline.waveAmplitude,
      )
    }
  }

  private drawPlatform(scene: Phaser.Scene): void {
    const { depths, palette, surface } = WorldArtConfig
    const { platform } = surface
    const back = scene.add.graphics().setDepth(depths.surfaceWater + 1)
    const front = scene.add.graphics().setDepth(depths.surfaceFront)

    const logYs = [
      platform.y - platform.logGap,
      platform.y,
      platform.y + platform.logGap,
    ]

    for (const [index, y] of logYs.entries()) {
      this.drawCactusFloat(back, platform.x, y, index === 1 ? platform.logWidth + 22 : platform.logWidth, platform.logHeight)
    }

    this.drawCactusPad(back, platform.x - platform.logWidth * 0.48, platform.y - 6, 42, 22, -16)
    this.drawCactusPad(back, platform.x + platform.logWidth * 0.46, platform.y + 6, 50, 24, 12)
    this.drawCactusPad(back, platform.x + 28, platform.y - platform.logGap - 22, 36, 18, -8)

    this.drawRopeBand(back, platform.x - platform.ropeOffsetX, platform.y, platform.logGap * 2.35)
    this.drawRopeBand(back, platform.x + platform.ropeOffsetX, platform.y, platform.logGap * 2.35)

    front.lineStyle(5, palette.rope, 1)
    front.lineBetween(platform.x - platform.logWidth * 0.42, platform.y + platform.logGap + 10, platform.x + platform.logWidth * 0.42, platform.y + platform.logGap + 10)
    front.lineStyle(2, palette.outline, 0.55)
    front.lineBetween(platform.x - platform.logWidth * 0.42, platform.y + platform.logGap + 14, platform.x + platform.logWidth * 0.42, platform.y + platform.logGap + 14)
  }

  private drawWave(g: Phaser.GameObjects.Graphics, x: number, y: number, width: number, amplitude: number): void {
    g.beginPath()
    const segments = 8
    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments
      const px = x - width / 2 + width * t
      const py = y + Math.sin(t * Math.PI * 2) * amplitude
      if (i === 0) {
        g.moveTo(px, py)
      } else {
        g.lineTo(px, py)
      }
    }
    g.strokePath()
  }

  private drawCactusFloat(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const { cactus, cactusDark, cactusLight, cactusFlower, outline } = WorldArtConfig.palette
    g.fillStyle(cactusDark, 0.22)
    g.fillRoundedRect(x - width / 2 + 8, y - height / 2 + 7, width, height, height / 2)
    g.fillStyle(cactus, 1)
    g.fillRoundedRect(x - width / 2, y - height / 2, width, height, height / 2)
    g.lineStyle(3, outline, 0.8)
    g.strokeRoundedRect(x - width / 2, y - height / 2, width, height, height / 2)

    g.lineStyle(2, cactusDark, 0.42)
    for (let ribX = x - width / 2 + 34; ribX < x + width / 2 - 20; ribX += 38) {
      g.lineBetween(ribX, y - height / 2 + 6, ribX + 10, y + height / 2 - 6)
    }

    g.lineStyle(2, cactusLight, 0.95)
    for (let spineX = x - width / 2 + 28; spineX < x + width / 2 - 18; spineX += 34) {
      g.lineBetween(spineX, y - 4, spineX + 8, y - 11)
      g.lineBetween(spineX + 8, y + 6, spineX + 16, y + 12)
    }

    g.fillStyle(cactusFlower, 1)
    g.fillCircle(x + width * 0.34, y - height * 0.35, 4)
  }

  private drawCactusPad(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    angleDeg: number,
  ): void {
    const { cactusLight, cactusDark, outline } = WorldArtConfig.palette
    g.save()
    g.translateCanvas(x, y)
    g.rotateCanvas(Phaser.Math.DegToRad(angleDeg))
    g.fillStyle(cactusLight, 1)
    g.fillEllipse(0, 0, width, height)
    g.lineStyle(2, outline, 0.75)
    g.strokeEllipse(0, 0, width, height)
    g.lineStyle(2, cactusDark, 0.45)
    g.lineBetween(-width * 0.25, 0, width * 0.25, 0)
    g.restore()
  }

  private drawProps(scene: Phaser.Scene): void {
    const g = scene.add.graphics().setDepth(WorldArtConfig.depths.surfaceBack + 2)
    const { surface } = WorldArtConfig

    this.drawSign(g, surface.props.sign.x, surface.props.sign.y, surface.props.sign.scale)
    this.drawBucket(g, surface.props.bucket.x, surface.props.bucket.y, surface.props.bucket.scale)
  }

  private drawRopeBand(g: Phaser.GameObjects.Graphics, x: number, y: number, height: number): void {
    const { rope, outline } = WorldArtConfig.palette
    g.lineStyle(10, rope, 1)
    g.lineBetween(x, y - height / 2, x, y + height / 2)
    g.lineStyle(2, outline, 0.6)
    g.lineBetween(x - 6, y - height / 2, x - 6, y + height / 2)
    g.lineBetween(x + 6, y - height / 2, x + 6, y + height / 2)
  }

  private drawSign(g: Phaser.GameObjects.Graphics, x: number, y: number, scale: number): void {
    const { outline, rope, sandShade } = WorldArtConfig.palette
    g.fillStyle(rope, 1)
    g.fillRect(x - 4 * scale, y - 24 * scale, 8 * scale, 42 * scale)
    g.fillStyle(sandShade, 1)
    g.fillRoundedRect(x - 38 * scale, y - 52 * scale, 76 * scale, 30 * scale, 5 * scale)
    g.lineStyle(2, outline, 0.8)
    g.strokeRoundedRect(x - 38 * scale, y - 52 * scale, 76 * scale, 30 * scale, 5 * scale)
    g.lineBetween(x - 18 * scale, y - 42 * scale, x + 18 * scale, y - 42 * scale)
  }

  private drawBucket(g: Phaser.GameObjects.Graphics, x: number, y: number, scale: number): void {
    const { outline, waterMid, foam } = WorldArtConfig.palette
    g.fillStyle(waterMid, 1)
    g.fillRoundedRect(x - 17 * scale, y - 26 * scale, 34 * scale, 32 * scale, 5 * scale)
    g.fillStyle(foam, 0.9)
    g.fillEllipse(x, y - 26 * scale, 36 * scale, 10 * scale)
    g.lineStyle(2, outline, 0.8)
    g.strokeRoundedRect(x - 17 * scale, y - 26 * scale, 34 * scale, 32 * scale, 5 * scale)
    g.strokeEllipse(x, y - 26 * scale, 36 * scale, 10 * scale)
  }
}
