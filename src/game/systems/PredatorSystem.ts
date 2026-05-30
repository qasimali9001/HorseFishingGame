import Phaser from 'phaser'
import { PredatorFish } from '../entities/PredatorFish'
import { PREDATOR_DATA } from '../data/predatorData'
import { PredatorConfig } from '../config/PredatorConfig'
import { WorldConfig, worldRightX } from '../config/WorldConfig'
import type { BiomeSystem } from './BiomeSystem'
import type { Fish } from '../entities/Fish'
import type { PredatorDefinition } from '../types/PredatorTypes'

export interface PredatorContext {
  /** The fish currently on the line, or null. Predators only chase this. */
  hookedFish: Fish | null
  /** Only spawn new predators while the lure is fishing underwater. */
  canSpawn: boolean
  /** Player's reachable depth -- caps where predators appear. */
  maxDepth: number
}

/**
 * Maintains a small predator population near the view. Predators patrol until
 * the player has a hooked fish within detection range, then chase it; reaching
 * it rolls a steal chance. Returns true from `update` on the frame a catch is
 * stolen so the fishing state machine can resolve CatchLost. No combat system.
 */
export class PredatorSystem {
  private readonly scene: Phaser.Scene
  private readonly biomes: BiomeSystem
  private readonly predators: PredatorFish[] = []
  private spawnTimer = 0

  constructor(scene: Phaser.Scene, biomes: BiomeSystem) {
    this.scene = scene
    this.biomes = biomes
  }

  /** Steps predators; returns true if a predator stole the hooked fish this frame. */
  update(dtSec: number, ctx: PredatorContext): boolean {
    let stoleCatch = false

    for (const p of this.predators) {
      const target = this.chaseTargetFor(p, ctx.hookedFish)
      p.update(dtSec, target)

      if (target && ctx.hookedFish) {
        const dist = Phaser.Math.Distance.Between(p.x, p.y, ctx.hookedFish.x, ctx.hookedFish.y)
        if (dist <= p.def.attackRadius) {
          if (p.readyToAttack(dtSec) && Math.random() < p.def.eatChance) {
            stoleCatch = true
          }
        } else {
          p.resetAttack()
        }
      } else {
        p.resetAttack()
      }
    }

    this.despawnOffscreen()

    this.spawnTimer += dtSec * 1000
    if (
      ctx.canSpawn &&
      this.predators.length < PredatorConfig.maxActive &&
      this.spawnTimer >= PredatorConfig.spawnIntervalMs
    ) {
      this.spawnTimer = 0
      this.trySpawn(ctx.maxDepth)
    }

    return stoleCatch
  }

  /** A hooked fish within detection range becomes the chase target. */
  private chaseTargetFor(p: PredatorFish, hookedFish: Fish | null): { x: number; y: number } | null {
    if (!hookedFish) {
      return null
    }
    const dist = Phaser.Math.Distance.Between(p.x, p.y, hookedFish.x, hookedFish.y)
    return dist <= p.def.detectionRadius ? { x: hookedFish.x, y: hookedFish.y } : null
  }

  private despawnOffscreen(): void {
    const view = this.scene.cameras.main.worldView
    for (let i = this.predators.length - 1; i >= 0; i--) {
      const p = this.predators[i]
      if (p.isChasing) {
        continue
      }
      if (p.x < view.left - PredatorConfig.despawnOffscreenMargin || p.x > view.right + PredatorConfig.despawnOffscreenMargin) {
        p.destroy()
        this.predators.splice(i, 1)
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

    const allowedBiomes = new Set(this.biomes.biomesInRange(loDepth, hiDepth).map((b) => b.id))
    const candidates = PREDATOR_DATA.filter(
      (d) =>
        d.minDepth <= hiDepth &&
        d.maxDepth >= loDepth &&
        d.biomeIds.some((id) => allowedBiomes.has(id)),
    )
    if (candidates.length === 0) {
      return
    }
    const def: PredatorDefinition = Phaser.Utils.Array.GetRandom(candidates)

    const dLo = Math.max(def.minDepth, loDepth)
    const dHi = Math.min(def.maxDepth, hiDepth)
    const y = WorldConfig.waterlineY + Phaser.Math.Between(dLo, dHi)

    const fromLeft = Math.random() < 0.5
    let x = fromLeft ? view.left - PredatorConfig.spawnOffscreenMargin : view.right + PredatorConfig.spawnOffscreenMargin
    let dir: 1 | -1 = fromLeft ? 1 : -1
    if (x < WorldConfig.worldLeftX) {
      x = view.right + PredatorConfig.spawnOffscreenMargin
      dir = -1
    } else if (x > worldRightX) {
      x = view.left - PredatorConfig.spawnOffscreenMargin
      dir = 1
    }

    this.predators.push(new PredatorFish(this.scene, def, x, y, dir))
  }
}
