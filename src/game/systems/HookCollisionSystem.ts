import Phaser from 'phaser'
import type { Lure } from '../entities/Lure'
import type { Fish } from '../entities/Fish'

/**
 * Lightweight hook detection: a simple distance check between the lure and each
 * hookable fish (no physics engine). Returns the first fish within reach, or
 * null. Stateless -- the state machine decides what to do with the result.
 */
export class HookCollisionSystem {
  findCatch(lure: Lure, fish: readonly Fish[], canHook?: (candidate: Fish) => boolean): Fish | null {
    for (const f of fish) {
      if (!f.canBeHooked) {
        continue
      }
      if (canHook && !canHook(f)) {
        continue
      }
      const reach = lure.hookRadius + f.radius
      if (Phaser.Math.Distance.Squared(lure.baitX, lure.baitY, f.x, f.y) <= reach * reach) {
        return f
      }
    }
    return null
  }
}
