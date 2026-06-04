import Phaser from 'phaser'
import { Fish } from '../entities/Fish'
import { FISH_DATA } from '../data/fishData'
import { SPAWN_POINT_DATA } from '../data/spawnPointData'
import { SpawnConfig } from '../config/SpawnConfig'
import { WorldConfig } from '../config/WorldConfig'
import type { FishDefinition } from '../types/FishTypes'
import type {
  FishPopulation,
  FishSpawnContext,
  SpawnPointDefinition,
} from '../types/SpawnPointTypes'

/** Mutable per-point bookkeeping kept entirely inside the system. */
interface PointRuntime {
  readonly def: SpawnPointDefinition
  readonly fishDef: FishDefinition | undefined
  aliveCount: number
  /** Earliest elapsed time (ms) at which this point may spawn again. */
  nextSpawnAtMs: number
}

/**
 * Population from fixed, hand-authored spawn points (see spawnPointData /
 * `?editor`). Each point owns the fish it spawns; when one is removed (landed,
 * stolen, or despawned offscreen) the point starts a respawn cooldown, so an
 * area you have fished out goes quiet and the player roams to keep catching.
 *
 * Implements the same `FishPopulation` contract as the legacy procedural
 * spawner, so `WorldScene` can swap between them via `SpawnConfig.mode` and the
 * `FishingStateMachine` is unaffected. Movement/AI stays in FishAISystem -- this
 * system only manages which fish exist and where they first appear.
 */
export class SpawnPointSystem implements FishPopulation {
  private readonly scene: Phaser.Scene
  private readonly fish: Fish[] = []
  private readonly points: PointRuntime[]
  private readonly ownerOf = new Map<Fish, PointRuntime>()
  private elapsedMs = 0

  constructor(scene: Phaser.Scene, points: readonly SpawnPointDefinition[] = SPAWN_POINT_DATA) {
    this.scene = scene
    this.points = points.map((def) => ({
      def,
      fishDef: FISH_DATA.find((f) => f.id === def.fishId),
      aliveCount: 0,
      // Stagger the very first spawn so points don't all pop on frame one.
      nextSpawnAtMs: Phaser.Math.Between(0, SpawnConfig.initialSpawnJitterMs),
    }))
  }

  get list(): readonly Fish[] {
    return this.fish
  }

  update(dtSec: number, ctx: FishSpawnContext): void {
    this.elapsedMs += dtSec * 1000
    this.despawnOffscreen()

    if (!ctx.lureUnderwater) {
      return
    }
    const activation = this.activationRect()
    const centerX = this.scene.cameras.main.worldView.centerX
    for (const point of this.points) {
      this.tryPointSpawn(point, ctx, activation, centerX)
    }
  }

  /** Removes a specific fish (landed or stolen) and arms its point's respawn. */
  remove(target: Fish): void {
    const i = this.fish.indexOf(target)
    if (i === -1) {
      return
    }
    this.fish.splice(i, 1)
    this.releaseOwnership(target)
    target.destroy()
  }

  private tryPointSpawn(
    point: PointRuntime,
    ctx: FishSpawnContext,
    activation: Phaser.Geom.Rectangle,
    centerX: number,
  ): void {
    if (point.def.enabled === false || !point.fishDef) {
      return
    }
    if (point.aliveCount >= point.def.maxAlive || this.elapsedMs < point.nextSpawnAtMs) {
      return
    }
    // Respect reachable depth + only activate near the camera (perf).
    const depth = point.def.y - WorldConfig.waterlineY
    if (depth > ctx.maxDepth) {
      return
    }
    if (!Phaser.Geom.Rectangle.Contains(activation, point.def.x, point.def.y)) {
      return
    }

    // Head toward the visible area so the fresh fish swims in rather than out.
    const dir: 1 | -1 = point.def.x <= centerX ? 1 : -1
    const fish = new Fish(this.scene, point.fishDef, point.def.x, point.def.y, dir)
    this.fish.push(fish)
    this.ownerOf.set(fish, point)
    point.aliveCount += 1
    point.nextSpawnAtMs = this.elapsedMs + point.def.respawnMs
  }

  private despawnOffscreen(): void {
    const view = this.scene.cameras.main.worldView
    for (let i = this.fish.length - 1; i >= 0; i--) {
      const f = this.fish[i]
      if (f.isHooked) {
        continue
      }
      if (
        f.x < view.left - SpawnConfig.despawnOffscreenMargin ||
        f.x > view.right + SpawnConfig.despawnOffscreenMargin
      ) {
        this.fish.splice(i, 1)
        this.releaseOwnership(f)
        f.destroy()
      }
    }
  }

  /** Frees a point's slot and starts its respawn cooldown from now. */
  private releaseOwnership(fish: Fish): void {
    const point = this.ownerOf.get(fish)
    if (!point) {
      return
    }
    this.ownerOf.delete(fish)
    point.aliveCount = Math.max(0, point.aliveCount - 1)
    point.nextSpawnAtMs = this.elapsedMs + point.def.respawnMs
  }

  private activationRect(): Phaser.Geom.Rectangle {
    const v = this.scene.cameras.main.worldView
    const m = SpawnConfig.activationMargin
    return new Phaser.Geom.Rectangle(v.x - m, v.y - m, v.width + m * 2, v.height + m * 2)
  }
}
