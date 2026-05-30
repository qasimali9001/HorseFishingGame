import Phaser from 'phaser'
import { WorldConfig, worldRightX } from '../config/WorldConfig'

/**
 * STEP 2 ONLY. Draws static world-space reference visuals (sky band, water
 * band, waterline, depth rulers) so camera follow/clamp/idle-framing are
 * obviously visible before any real art exists. Everything is drawn in world
 * coordinates, so the native camera scrolls it for free.
 *
 * Delete this once real world layers (BackgroundLayer/SurfaceLayer) land.
 */
export class DebugWorldGrid {
  private static readonly SKY_COLOR = 0x8ecae6
  private static readonly WATER_COLOR = 0x0a4f6e
  private static readonly WATERLINE_COLOR = 0xffffff
  private static readonly RULER_COLOR = 0x2b88a8
  private static readonly DEPTH_STEP = 250
  private static readonly X_STEP = 300

  constructor(scene: Phaser.Scene) {
    const g = scene.add.graphics()
    const top = WorldConfig.waterlineY - WorldConfig.skyHeight
    const left = WorldConfig.worldLeftX
    const width = WorldConfig.worldWidth
    const bottom = WorldConfig.waterlineY + WorldConfig.maxDepth

    // Sky (above waterline) and water (below).
    g.fillStyle(DebugWorldGrid.SKY_COLOR, 1)
    g.fillRect(left, top, width, WorldConfig.skyHeight)
    g.fillStyle(DebugWorldGrid.WATER_COLOR, 1)
    g.fillRect(left, WorldConfig.waterlineY, width, WorldConfig.maxDepth)

    // Waterline at world y = 0.
    g.lineStyle(4, DebugWorldGrid.WATERLINE_COLOR, 1)
    g.lineBetween(left, WorldConfig.waterlineY, worldRightX, WorldConfig.waterlineY)

    // Horizontal depth rulers + labels every DEPTH_STEP, so vertical scroll is readable.
    g.lineStyle(1, DebugWorldGrid.RULER_COLOR, 0.8)
    for (let depth = DebugWorldGrid.DEPTH_STEP; depth <= WorldConfig.maxDepth; depth += DebugWorldGrid.DEPTH_STEP) {
      const y = WorldConfig.waterlineY + depth
      g.lineBetween(left, y, worldRightX, y)
      scene.add
        .text(left + 12, y - 8, `${depth}m`, { color: '#bfe6f2', fontSize: '14px' })
        .setName(`depth-${depth}`)
    }

    // Vertical X-reference columns + labels, so HORIZONTAL scroll is readable.
    g.lineStyle(1, DebugWorldGrid.RULER_COLOR, 0.6)
    for (let x = left + DebugWorldGrid.X_STEP; x < worldRightX; x += DebugWorldGrid.X_STEP) {
      g.lineBetween(x, top, x, bottom)
      scene.add
        .text(x + 4, WorldConfig.waterlineY + 8, `x:${x}`, { color: '#7fc6db', fontSize: '12px' })
        .setName(`x-${x}`)
    }

    // Left/right world edges so horizontal clamp is visible.
    g.lineStyle(3, 0xffd166, 0.7)
    g.lineBetween(left, top, left, bottom)
    g.lineBetween(worldRightX, top, worldRightX, bottom)
  }
}
