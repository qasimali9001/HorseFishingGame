import Phaser from 'phaser'
import { LinePayoutConfig } from '../config/LinePayoutConfig'
import { WorldConfig } from '../config/WorldConfig'
import type { LureMode } from '../entities/Lure'

export interface LinePayoutUpdateContext {
  lureMode: LureMode
  reeling: boolean
  reelSpeedMultiplier: number
  rodTipX: number
  rodTipY: number
  lureX: number
  lureY: number
}

export interface LineConstraintSnapshot {
  maxReachY: number
  lineLengthOut: number
  lineLengthCap: number
  isTaut: boolean
}

/**
 * Owns how much line is out and converts it into a rod-tip-to-lure depth
 * constraint. This makes depth emerge from line mechanics instead of direct
 * per-cast depth clamps.
 */
export class LinePayoutController {
  private lineLengthOut = 0
  private lineLengthCap = 0
  private castPayoutSpeed: number = LinePayoutConfig.minCastPayoutSpeed
  private underwaterDepthBudget = 0
  private enteredWater = false
  /** Frozen attachment point once underwater, so horse idle wobble can't drag lure. */
  private lineAnchorX = 0
  private lineAnchorY = 0

  get currentLineLengthCap(): number {
    return this.lineLengthCap
  }

  beginCast(castPower01: number, maxLineLength: number): void {
    const cap = Math.max(1, maxLineLength)
    const easedPower = Phaser.Math.Easing.Cubic.Out(castPower01)
    this.underwaterDepthBudget = Phaser.Math.Linear(
      cap * LinePayoutConfig.minCastLineFactor,
      cap * LinePayoutConfig.maxCastLineFactor,
      easedPower,
    )
    this.castPayoutSpeed = Phaser.Math.Linear(
      LinePayoutConfig.minCastPayoutSpeed,
      LinePayoutConfig.maxCastPayoutSpeed,
      easedPower,
    )
    // While airborne, payout is unconstrained; once underwater we convert the
    // cast into a finite cap = water-entry line distance + depth budget.
    this.lineLengthCap = Number.POSITIVE_INFINITY
    this.lineLengthOut = 0
    this.enteredWater = false
  }

  reset(): void {
    this.lineLengthOut = 0
    this.lineLengthCap = 0
    this.castPayoutSpeed = LinePayoutConfig.minCastPayoutSpeed
    this.underwaterDepthBudget = 0
    this.enteredWater = false
    this.lineAnchorX = 0
    this.lineAnchorY = 0
  }

  update(dtSec: number, ctx: LinePayoutUpdateContext): LineConstraintSnapshot {
    if (this.lineLengthCap <= 0) {
      return {
        maxReachY: WorldConfig.waterlineY,
        lineLengthOut: 0,
        lineLengthCap: 0,
        isTaut: false,
      }
    }

    const anchorX = this.enteredWater ? this.lineAnchorX : ctx.rodTipX
    const anchorY = this.enteredWater ? this.lineAnchorY : ctx.rodTipY
    const lureDistance = Phaser.Math.Distance.Between(anchorX, anchorY, ctx.lureX, ctx.lureY)

    if (!this.enteredWater && ctx.lureMode !== 'airborne') {
      this.enteredWater = true
      this.lineAnchorX = ctx.rodTipX
      this.lineAnchorY = ctx.rodTipY
      const entryDistance = Phaser.Math.Distance.Between(
        this.lineAnchorX,
        this.lineAnchorY,
        ctx.lureX,
        ctx.lureY,
      )
      this.lineLengthCap = lureDistance + this.underwaterDepthBudget
      this.lineLengthOut = Math.max(this.lineLengthOut, entryDistance)
    }

    if (ctx.reeling) {
      this.lineLengthOut = Math.max(
        0,
        this.lineLengthOut - LinePayoutConfig.baseRetractSpeed * ctx.reelSpeedMultiplier * dtSec,
      )
    } else if (ctx.lureMode === 'hanging') {
      // When the lure is already hanging taut, avoid ratcheting extra payout
      // each frame (which can create subtle drift). Only grow if rod motion
      // truly requires more line to maintain the existing position.
      this.lineLengthOut = Math.min(this.lineLengthCap, Math.max(this.lineLengthOut, lureDistance))
    } else {
      const payoutSpeed =
        ctx.lureMode === 'airborne' ? this.castPayoutSpeed : LinePayoutConfig.sinkPayoutSpeed
      const payoutStep = payoutSpeed * dtSec
      this.lineLengthOut = Math.min(this.lineLengthCap, Math.max(this.lineLengthOut + payoutStep, lureDistance))
    }

    const dx = Math.abs(ctx.lureX - anchorX)
    const verticalReach = Math.sqrt(Math.max(0, this.lineLengthOut ** 2 - dx ** 2))
    const maxReachY = Phaser.Math.Clamp(
      anchorY + verticalReach,
      WorldConfig.waterlineY,
      WorldConfig.waterlineY + WorldConfig.maxDepth,
    )
    const isTaut =
      ctx.lureMode === 'hanging'
        ? ctx.lureY >= maxReachY - LinePayoutConfig.tautReleaseEpsilon
        : ctx.lureY >= maxReachY - LinePayoutConfig.tautEpsilon
    return {
      maxReachY,
      lineLengthOut: this.lineLengthOut,
      lineLengthCap: this.lineLengthCap,
      isTaut,
    }
  }
}
