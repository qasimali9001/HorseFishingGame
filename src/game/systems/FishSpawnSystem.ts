import Phaser from 'phaser'
import { Fish } from '../entities/Fish'
import { FISH_DATA } from '../data/fishData'
import { FishConfig } from '../config/FishConfig'
import { WorldConfig, worldRightX } from '../config/WorldConfig'
import type { FishDefinition } from '../types/FishTypes'

export interface SpawnContext {
  /** Only spawn new fish while the lure is fishing underwater. */
  lureUnderwater: boolean
  /** Player's reachable depth (PlayerStats.maxDepth) -- caps where fish appear. */
  maxDepth: number
}

/**
 * Maintains the live fish population around the camera view. Fish swim in from
 * just offscreen, cross the visible area, and despawn once well past it, so we
 * only ever pay for a handful of fish near gameplay regardless of world size.
 */
export class FishSpawnSystem {
  private readonly scene: Phaser.Scene
  private readonly fish: Fish[] = []
  private spawnTimer = 0

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  get list(): readonly Fish[] {
    return this.fish
  }

  update(dtSec: number, ctx: SpawnContext): void {
    for (const f of this.fish) {
      f.update(dtSec)
    }
    this.despawnOffscreen()

    this.spawnTimer += dtSec * 1000
    if (
      ctx.lureUnderwater &&
      this.fish.length < FishConfig.maxActive &&
      this.spawnTimer >= FishConfig.spawnIntervalMs
    ) {
      this.spawnTimer = 0
      this.trySpawn(ctx.maxDepth)
    }
  }

  /** Removes a specific fish (e.g. once landed). */
  remove(target: Fish): void {
    const i = this.fish.indexOf(target)
    if (i !== -1) {
      this.fish.splice(i, 1)
      target.destroy()
    }
  }

  private despawnOffscreen(): void {
    const view = this.scene.cameras.main.worldView
    for (let i = this.fish.length - 1; i >= 0; i--) {
      const f = this.fish[i]
      if (f.isHooked) {
        continue
      }
      if (f.x < view.left - FishConfig.despawnOffscreenMargin || f.x > view.right + FishConfig.despawnOffscreenMargin) {
        f.destroy()
        this.fish.splice(i, 1)
      }
    }
  }

  private trySpawn(maxDepth: number): void {
    const view = this.scene.cameras.main.worldView
    const loDepth = Math.max(20, view.top - WorldConfig.waterlineY)
    const hiDepth = Math.min(maxDepth, view.bottom - WorldConfig.waterlineY)
    if (hiDepth - loDepth < 10) {
      return
    }

    const candidates = FISH_DATA.filter((d) => d.minDepth <= hiDepth && d.maxDepth >= loDepth)
    if (candidates.length === 0) {
      return
    }
    const def: FishDefinition = Phaser.Utils.Array.GetRandom(candidates)

    const dLo = Math.max(def.minDepth, loDepth)
    const dHi = Math.min(def.maxDepth, hiDepth)
    const y = WorldConfig.waterlineY + Phaser.Math.Between(dLo, dHi)

    const fromLeft = Math.random() < 0.5
    let x = fromLeft ? view.left - FishConfig.spawnOffscreenMargin : view.right + FishConfig.spawnOffscreenMargin
    let dir: 1 | -1 = fromLeft ? 1 : -1
    if (x < WorldConfig.worldLeftX) {
      x = view.right + FishConfig.spawnOffscreenMargin
      dir = -1
    } else if (x > worldRightX) {
      x = view.left - FishConfig.spawnOffscreenMargin
      dir = 1
    }

    this.fish.push(new Fish(this.scene, def, x, y, dir))
  }
}
