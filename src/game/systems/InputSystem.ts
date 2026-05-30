import Phaser from 'phaser'

/**
 * Abstracts the minimal controls so gameplay never reads raw pointer state:
 *   - a press queues a one-shot "cast" intent (consumed by the state machine)
 *   - holding the pointer means "reel"; releasing stops
 *
 * Keeping this behind one class means rebinding (keyboard, touch) later touches
 * nothing else.
 */
export class InputSystem {
  private castQueued = false
  private holding = false

  constructor(scene: Phaser.Scene) {
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.onDown, this)
    scene.input.on(Phaser.Input.Events.POINTER_UP, this.onUp, this)
    scene.input.on(Phaser.Input.Events.GAME_OUT, this.onUp, this)
  }

  /** True once per press; clears itself so a cast can't double-fire. */
  consumeCast(): boolean {
    const queued = this.castQueued
    this.castQueued = false
    return queued
  }

  get isReeling(): boolean {
    return this.holding
  }

  private onDown(): void {
    this.castQueued = true
    this.holding = true
  }

  private onUp(): void {
    this.holding = false
  }
}
