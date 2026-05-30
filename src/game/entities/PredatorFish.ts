import Phaser from 'phaser'
import { PredatorConfig } from '../config/PredatorConfig'
import type { PredatorDefinition } from '../types/PredatorTypes'

export type PredatorMode = 'patrol' | 'chasing'

/**
 * One predator. Patrols horizontally with a soft wobble until given a chase
 * target (a hooked fish), then steers toward it. It owns only its visual +
 * movement; PredatorSystem decides when to chase and whether a steal lands.
 */
export class PredatorFish {
  readonly def: PredatorDefinition
  private readonly container: Phaser.GameObjects.Container
  private readonly facing: Phaser.GameObjects.Container
  private modeValue: PredatorMode = 'patrol'
  private vx: number
  private vy = 0
  private baseY: number
  private wobbleTime = Math.random() * Math.PI * 2
  private attackTimer = 0

  constructor(scene: Phaser.Scene, def: PredatorDefinition, x: number, y: number, dir: 1 | -1) {
    this.def = def
    this.baseY = y
    this.vx = Phaser.Math.Between(def.patrolSpeedMin, def.patrolSpeedMax) * dir

    this.facing = scene.add.container(0, 0)
    const body = scene.add.ellipse(0, 0, def.radius * 2.6, def.radius * 1.5, def.color)
    const tail = scene.add.triangle(
      -def.radius * 1.4,
      0,
      0,
      0,
      def.radius * 1.1,
      -def.radius * 0.85,
      def.radius * 1.1,
      def.radius * 0.85,
      def.color,
    )
    const jaw = scene.add.triangle(
      def.radius * 1.1,
      def.radius * 0.2,
      0,
      0,
      def.radius * 0.7,
      -def.radius * 0.45,
      def.radius * 0.7,
      def.radius * 0.45,
      0x10110f,
    )
    const eye = scene.add.circle(def.radius * 0.8, -def.radius * 0.35, Math.max(2, def.radius * 0.14), 0xffffff)
    this.facing.add([tail, body, jaw, eye])
    this.facing.scaleX = dir

    this.container = scene.add.container(x, y, [this.facing]).setDepth(PredatorConfig.renderDepth)
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

  get isChasing(): boolean {
    return this.modeValue === 'chasing'
  }

  /**
   * Move one frame. With a `target` the predator chases it; otherwise it
   * patrols. Returns nothing -- PredatorSystem reads position to judge attacks.
   */
  update(dtSec: number, target: { x: number; y: number } | null): void {
    if (target) {
      this.chase(dtSec, target)
      return
    }
    if (this.modeValue !== 'patrol') {
      this.modeValue = 'patrol'
      this.baseY = this.container.y
      this.vy = 0
    }
    this.container.x += this.vx * dtSec
    this.wobbleTime += dtSec * PredatorConfig.wobbleSpeed
    this.container.y = this.baseY + Math.sin(this.wobbleTime) * PredatorConfig.wobbleAmplitude
    this.facing.scaleX = this.vx >= 0 ? 1 : -1
  }

  private chase(dtSec: number, target: { x: number; y: number }): void {
    this.modeValue = 'chasing'
    const dx = target.x - this.container.x
    const dy = target.y - this.container.y
    const dist = Math.hypot(dx, dy) || 1
    const desiredVx = (dx / dist) * this.def.chaseSpeed
    const desiredVy = (dy / dist) * this.def.chaseSpeed
    const alpha = 1 - Math.pow(1 - PredatorConfig.chaseSteerResponse, dtSec * 60)
    this.vx = Phaser.Math.Linear(this.vx, desiredVx, alpha)
    this.vy = Phaser.Math.Linear(this.vy, desiredVy, alpha)
    this.container.x += this.vx * dtSec
    this.container.y += this.vy * dtSec
    this.facing.scaleX = dx >= 0 ? 1 : -1
  }

  /**
   * Accumulate time toward the next steal attempt. Returns true once an attempt
   * is due (and resets the timer); the system then rolls the eat chance.
   */
  readyToAttack(dtSec: number): boolean {
    this.attackTimer += dtSec * 1000
    if (this.attackTimer >= PredatorConfig.attackIntervalMs) {
      this.attackTimer = 0
      return true
    }
    return false
  }

  resetAttack(): void {
    this.attackTimer = 0
  }

  destroy(): void {
    this.container.destroy()
  }
}
