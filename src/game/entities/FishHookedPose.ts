import Phaser from 'phaser'
import { FishConfig } from '../config/FishConfig'
import { FishBodySprite } from './FishBodySprite'
import type { FishDefinition } from '../types/FishTypes'

/** World position for the fish body center while dangling from the hook. */
export interface HookedBodyTarget {
  x: number
  y: number
}

/**
 * Hooked-fish pose math. Bundled art faces left; at +90° the mouth points up
 * toward the lure and the tail hangs down (+y).
 */
export class FishHookedPose {
  /** Distance from body center to mouth along the head axis (world units). */
  static mouthLeadFromCenter(scene: Phaser.Scene, def: FishDefinition): number {
    const { width } = FishBodySprite.displaySizeFor(scene, def)
    return width * FishConfig.hookedPose.mouthLeadWidthScale
  }

  /** Body-center position so the mouth sits on the bait/hook point. */
  static bodyTargetAtHook(
    scene: Phaser.Scene,
    def: FishDefinition,
    hookX: number,
    hookY: number,
  ): HookedBodyTarget {
    return FishHookedPose.bodyTargetAtHookFromLead(
      hookX,
      hookY,
      FishHookedPose.mouthLeadFromCenter(scene, def),
    )
  }

  /** Same as bodyTargetAtHook but reuses a precomputed mouth lead (per-fish cache). */
  static bodyTargetAtHookFromLead(
    hookX: number,
    hookY: number,
    mouthLead: number,
  ): HookedBodyTarget {
    const pose = FishConfig.hookedPose
    return {
      x: hookX + pose.hookOffsetX,
      y: hookY + pose.hookOffsetY + mouthLead,
    }
  }

  static applyVisual(facing: Phaser.GameObjects.Container, swayDeg: number): void {
    const pose = FishConfig.hookedPose
    facing.setAngle(pose.rotationDeg + swayDeg)
    facing.scaleX = 1
  }
}
