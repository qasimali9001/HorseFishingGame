import Phaser from 'phaser'

/**
 * Abstracts the minimal pointer controls into intent primitives so gameplay
 * never reads raw pointer state. It exposes:
 *   - `consumeDownEdge()` -- true once per fresh press (the down transition)
 *   - `isPressed`         -- whether the pointer is currently held
 *   - `consumeRelease()`  -- on release, the hold duration in ms (one-shot)
 *
 * The state machine decides what these MEAN per state: while idle a press
 * charges a cast and release fires it; while a lure is out, holding reels. By
 * only ever charging on a down-EDGE that occurs in the idle state, a button
 * that is still held from reeling (when the lure lands) can never auto-fire a
 * cast -- the player must release and click again.
 */
export class InputSystem {
  private pressed = false
  private downEdgePending = false
  private sellEdgePending = false
  private pressStartMs = 0
  private releaseHoldMs: number | null = null
  private pointerHeld = false
  private castKeyHeld = false

  constructor(private readonly scene: Phaser.Scene) {
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.onDown, this)
    scene.input.on(Phaser.Input.Events.POINTER_UP, this.onUp, this)
    scene.input.on(Phaser.Input.Events.GAME_OUT, this.onUp, this)
    scene.input.keyboard?.on('keydown-SPACE', this.onCastKeyDown, this)
    scene.input.keyboard?.on('keyup-SPACE', this.onCastKeyUp, this)
    scene.input.keyboard?.on('keydown-S', this.onSellKeyDown, this)
  }

  /** True exactly once for each new press (consumed so it can't double-fire). */
  consumeDownEdge(): boolean {
    const edge = this.downEdgePending
    this.downEdgePending = false
    return edge
  }

  /** True exactly once for each fresh S key press. */
  consumeSellDownEdge(): boolean {
    const edge = this.sellEdgePending
    this.sellEdgePending = false
    return edge
  }

  /** Whether the pointer is currently held (used for hold-to-charge / reel). */
  get isPressed(): boolean {
    return this.pressed
  }

  /** Hold-to-reel is just "currently pressed" (the FSM applies it underwater). */
  get isReeling(): boolean {
    return this.pressed
  }

  /** Live hold duration while pressed (0 when not pressed). */
  get currentHoldMs(): number {
    if (!this.pressed) {
      return 0
    }
    return this.scene.time.now - this.pressStartMs
  }

  /** On release, returns how long the pointer was held (ms); null otherwise. */
  consumeRelease(): number | null {
    const ms = this.releaseHoldMs
    this.releaseHoldMs = null
    return ms
  }

  destroy(): void {
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.onDown, this)
    this.scene.input.off(Phaser.Input.Events.POINTER_UP, this.onUp, this)
    this.scene.input.off(Phaser.Input.Events.GAME_OUT, this.onUp, this)
    this.scene.input.keyboard?.off('keydown-SPACE', this.onCastKeyDown, this)
    this.scene.input.keyboard?.off('keyup-SPACE', this.onCastKeyUp, this)
    this.scene.input.keyboard?.off('keydown-S', this.onSellKeyDown, this)
  }

  private onDown(): void {
    this.pointerHeld = true
    this.recomputePressedState()
  }

  private onUp(): void {
    this.pointerHeld = false
    this.recomputePressedState()
  }

  private onCastKeyDown(): void {
    this.castKeyHeld = true
    this.recomputePressedState()
  }

  private onCastKeyUp(): void {
    this.castKeyHeld = false
    this.recomputePressedState()
  }

  private onSellKeyDown(): void {
    this.sellEdgePending = true
  }

  private recomputePressedState(): void {
    const nextPressed = this.pointerHeld || this.castKeyHeld
    if (nextPressed === this.pressed) {
      return
    }
    this.pressed = nextPressed
    if (this.pressed) {
      this.downEdgePending = true
      this.pressStartMs = this.scene.time.now
      return
    }
    this.releaseHoldMs = this.scene.time.now - this.pressStartMs
  }
}
