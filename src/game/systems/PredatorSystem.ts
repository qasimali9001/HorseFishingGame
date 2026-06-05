import type { Fish } from '../entities/Fish'
import { FishConfig } from '../config/FishConfig'
import { canEatFishSize } from '../utils/FishSizeRank'
import Phaser from 'phaser'
import type { BiomeSystem } from './BiomeSystem'

export interface PredatorContext {
  /** The fish currently on the line, or null. Predators only chase this. */
  hookedFish: Fish | null
  /** Live fish population that may eat a smaller hooked fish. */
  fish: readonly Fish[]
  /** Only spawn new predators while the lure is fishing underwater. */
  canSpawn: boolean
  /** Player's reachable depth -- caps where predators appear. */
  maxDepth: number
}

/** Lets larger regular fish steal smaller fish from the hook. */
export class PredatorSystem {
  constructor(_scene: Phaser.Scene, _biomes: BiomeSystem) {}

  /** Steps predation; returns true if a larger fish ate the hooked fish this frame. */
  update(_dtSec: number, ctx: PredatorContext): boolean {
    if (!ctx.canSpawn || !ctx.hookedFish) {
      return false
    }

    for (const candidate of ctx.fish) {
      if (candidate === ctx.hookedFish || candidate.isHooked) {
        continue
      }
      if (!canEatFishSize(candidate.def.sizeTier, ctx.hookedFish.def.sizeTier)) {
        continue
      }

      const reach =
        candidate.radius + ctx.hookedFish.radius + FishConfig.hookedPredation.bitePadding
      if (
        Phaser.Math.Distance.Squared(
          candidate.x,
          candidate.y,
          ctx.hookedFish.x,
          ctx.hookedFish.y,
        ) <=
        reach * reach
      ) {
        return true
      }
    }

    return false
  }
}
