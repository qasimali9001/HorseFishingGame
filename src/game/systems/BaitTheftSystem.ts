import Phaser from 'phaser'
import { FishConfig } from '../config/FishConfig'
import type { Fish } from '../entities/Fish'
import type { BaitTier } from '../types/BaitTypes'

export interface BaitTheftContext {
  baitX: number
  baitY: number
  hookRadius: number
  canHook: (requiredBaitTier: BaitTier) => boolean
  fish: readonly Fish[]
  /** Only while the lure is fishing underwater with bait still on the hook. */
  active: boolean
}

/** Larger fish eat bait that is too small to hook them. */
export class BaitTheftSystem {
  private biteHoldSec = 0
  private bitingFish: Fish | null = null

  /** Returns the fish that ate the bait this frame, if any. */
  update(dtSec: number, ctx: BaitTheftContext): Fish | null {
    if (!ctx.active) {
      this.resetHold()
      return null
    }

    const eater = this.closestEater(ctx)
    if (!eater) {
      this.resetHold()
      return null
    }

    if (this.bitingFish !== eater) {
      this.bitingFish = eater
      this.biteHoldSec = 0
    }

    this.biteHoldSec += dtSec
    if (this.biteHoldSec < FishConfig.baitTheft.biteHoldSec) {
      return null
    }

    this.resetHold()
    return eater
  }

  private closestEater(ctx: BaitTheftContext): Fish | null {
    const theft = FishConfig.baitTheft
    let closest: Fish | null = null
    let closestDistSq = Number.POSITIVE_INFINITY

    for (const candidate of ctx.fish) {
      if (!candidate.canBeHooked || candidate.isHooked) {
        continue
      }
      if (ctx.canHook(candidate.def.requiredBaitTier)) {
        continue
      }

      const reach = ctx.hookRadius + candidate.radius + theft.bitePadding
      const distSq = Phaser.Math.Distance.Squared(
        ctx.baitX,
        ctx.baitY,
        candidate.x,
        candidate.y,
      )
      if (distSq <= reach * reach && distSq < closestDistSq) {
        closest = candidate
        closestDistSq = distSq
      }
    }

    return closest
  }

  private resetHold(): void {
    this.biteHoldSec = 0
    this.bitingFish = null
  }
}
