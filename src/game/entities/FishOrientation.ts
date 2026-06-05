import { FishConfig } from '../config/FishConfig'

/**
 * Maps swim velocity to horizontal flip so bundled fish art faces its travel
 * direction. Reference PNGs face left; older procedural art faced right.
 */
export class FishOrientation {
  static scaleXForVelocity(vx: number): number {
    if (FishConfig.artFacesLeft) {
      return vx >= 0 ? -1 : 1
    }
    return vx >= 0 ? 1 : -1
  }

  static scaleXForDirection(dir: 1 | -1): number {
    return FishOrientation.scaleXForVelocity(dir)
  }
}
