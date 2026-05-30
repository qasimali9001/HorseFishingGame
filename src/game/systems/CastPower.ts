import Phaser from 'phaser'
import { CastPowerConfig } from '../config/CastPowerConfig'

export interface CastPowerSolution {
  power01: number
  speed: number
  velocityX: number
  velocityY: number
  depthFactor: number
}

/**
 * Pure resolver from hold duration -> cast power solution.
 * Keeps cast math out of both config and the state machine.
 */
export class CastPower {
  static normalizedPower(holdMs: number): number {
    return Phaser.Math.Clamp(holdMs / CastPowerConfig.maxChargeMs, 0, 1)
  }

  static resolve(holdMs: number, castPowerMultiplier: number): CastPowerSolution {
    const power01 = CastPower.normalizedPower(holdMs)
    const easedPower = Phaser.Math.Easing.Cubic.Out(power01)
    const baseSpeed = Phaser.Math.Linear(
      CastPowerConfig.minLaunchSpeed,
      CastPowerConfig.maxLaunchSpeed,
      easedPower,
    )
    const speed = baseSpeed * castPowerMultiplier
    const depthFactor = Phaser.Math.Linear(
      CastPowerConfig.minDepthFactor,
      CastPowerConfig.maxDepthFactor,
      easedPower,
    )
    const rad = Phaser.Math.DegToRad(CastPowerConfig.launchAngleDeg)
    return {
      power01,
      speed,
      velocityX: Math.cos(rad) * speed,
      velocityY: -Math.sin(rad) * speed,
      depthFactor,
    }
  }
}
