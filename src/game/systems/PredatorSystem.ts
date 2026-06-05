import type { Fish } from '../entities/Fish'
import type Phaser from 'phaser'
import type { BiomeSystem } from './BiomeSystem'

export interface PredatorContext {
  /** The fish currently on the line, or null. Predators only chase this. */
  hookedFish: Fish | null
  /** Only spawn new predators while the lure is fishing underwater. */
  canSpawn: boolean
  /** Player's reachable depth -- caps where predators appear. */
  maxDepth: number
}

/** Predator behavior is disabled until non-placeholder predator art exists. */
export class PredatorSystem {
  constructor(_scene: Phaser.Scene, _biomes: BiomeSystem) {}

  /** Steps predators; returns true if a predator stole the hooked fish this frame. */
  update(_dtSec: number, _ctx: PredatorContext): boolean {
    return false
  }
}
