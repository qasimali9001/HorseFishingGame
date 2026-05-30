import Phaser from 'phaser'
import { FishConfig } from '../config/FishConfig'
import type { FishDefinition } from '../types/FishTypes'

export type FishMode = 'swimming' | 'hooked'

/**
 * One fish. Owns its own visual + swim pose. While swimming it drifts
 * horizontally with a soft vertical wobble; once hooked it follows the lure.
 * It knows nothing about spawning rules, collision, or economy.
 */
export class Fish {
  readonly def: FishDefinition
  private readonly container: Phaser.GameObjects.Container
  private readonly facing: Phaser.GameObjects.Container
  private modeValue: FishMode = 'swimming'
  private vx: number
  private readonly baseY: number
  private wobbleTime = Math.random() * Math.PI * 2

  constructor(scene: Phaser.Scene, def: FishDefinition, x: number, y: number, dir: 1 | -1) {
    this.def = def
    this.baseY = y
    const speed = Phaser.Math.Between(def.speedMin, def.speedMax)
    this.vx = speed * dir

    // `facing` holds the art (drawn pointing right) so we can flip via scaleX.
    this.facing = scene.add.container(0, 0)
    const body = scene.add.ellipse(0, 0, def.radius * 2.4, def.radius * 1.6, def.color)
    const tail = scene.add.triangle(
      -def.radius * 1.2,
      0,
      0,
      0,
      def.radius * 0.9,
      -def.radius * 0.7,
      def.radius * 0.9,
      def.radius * 0.7,
      def.color,
    )
    const eye = scene.add.circle(def.radius * 0.7, -def.radius * 0.25, Math.max(2, def.radius * 0.16), 0x1a1110)
    this.facing.add([tail, body, eye])
    this.facing.scaleX = dir

    this.container = scene.add.container(x, y, [this.facing]).setDepth(FishConfig.renderDepth)
  }

  get x(): number {
    return this.container.x
  }

  get y(): number {
    return this.container.y
  }

  get radius(): number {
    return this.def.radius
  }

  get value(): number {
    return this.def.value
  }

  get isHooked(): boolean {
    return this.modeValue === 'hooked'
  }

  get canBeHooked(): boolean {
    return this.def.canBeHooked && this.modeValue === 'swimming'
  }

  setHooked(): void {
    this.modeValue = 'hooked'
  }

  /** Swimming movement for one frame. */
  update(dtSec: number): void {
    if (this.modeValue !== 'swimming') {
      return
    }
    this.container.x += this.vx * dtSec
    this.wobbleTime += dtSec * FishConfig.wobbleSpeed
    this.container.y = this.baseY + Math.sin(this.wobbleTime) * FishConfig.wobbleAmplitude
    this.facing.scaleX = this.vx >= 0 ? 1 : -1
  }

  /** Hooked fish eases toward the lure each frame. */
  followLure(lureX: number, lureY: number, dtSec: number): void {
    const t = 1 - Math.pow(1 - FishConfig.hookedFollowLerp, dtSec * 60)
    this.container.x = Phaser.Math.Linear(this.container.x, lureX, t)
    this.container.y = Phaser.Math.Linear(this.container.y, lureY, t)
    this.facing.scaleX = lureX >= this.container.x ? 1 : -1
  }

  destroy(): void {
    this.container.destroy()
  }
}
