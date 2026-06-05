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

  /** Body-center position so the mouth sits on the hook point. */
  static bodyTargetAtHook(
    scene: Phaser.Scene,
    def: FishDefinition,
    lureX: number,
    lureY: number,
  ): HookedBodyTarget {
    return FishHookedPose.bodyTargetAtHookFromLead(
      lureX,
      lureY,
      FishHookedPose.mouthLeadFromCenter(scene, def),
    )
  }

  /** Same as bodyTargetAtHook but reuses a precomputed mouth lead (per-fish cache). */
  static bodyTargetAtHookFromLead(
    lureX: number,
    lureY: number,
    mouthLead: number,
  ): HookedBodyTarget {
    const pose = FishConfig.hookedPose
    return {
      x: lureX + pose.hookOffsetX,
      y: lureY + pose.hookOffsetY + mouthLead,
    }
  }

  static applyVisual(facing: Phaser.GameObjects.Container, swayDeg: number): void {
    const pose = FishConfig.hookedPose
    facing.setAngle(pose.rotationDeg + swayDeg)
    facing.scaleX = 1
  }
}
