import Phaser from 'phaser'
import type { PlayerHorse } from '../entities/PlayerHorse'
import { RigTestConfig } from '../config/RigTestConfig'
import { RigAnchorHandles } from './RigAnchorHandles'

/** Scene-level actions the tuner triggers but does not own. */
export interface RigTunerHandlers {
  onTogglePreview: (visible: boolean) => void
  onReset: () => void
}

/** One adjustable rig value, wired straight to the horse's live layout. */
interface Tunable {
  label: string
  get: () => number
  set: (value: number) => void
  step: number
  /** 'int' = whole-number step, 'deg' = 1 decimal, 'unit' = 2 decimals (0..1). */
  kind: 'int' | 'deg' | 'unit'
  /** Called after a change (e.g. restart idle when wobble degrees change). */
  after?: () => void
}

/**
 * Dev-only live tuner for the horse rig. Lists every HorseConfig value, lets you
 * nudge them with the keyboard, and prints the result so it can be pasted back
 * into HorseConfig. Lives in `dev/` because it ships with the test scene only.
 *
 * Keys:
 *   UP/DOWN     select parameter
 *   LEFT/RIGHT  decrease / increase (hold SHIFT for coarse steps)
 *   SPACE       play the cast animation
 *   B           toggle idle bob + head wobble
 *   M           toggle anchor markers + drag handles
 *   (drag)      pink = neck, blue = mouth, teal = rod tip
 *   N           toggle line + lure preview
 *   P           log current layout to the console
 *   R           reset the scene
 */
export class RigTuner {
  private readonly scene: Phaser.Scene
  private readonly horse: PlayerHorse
  private readonly handlers: RigTunerHandlers
  private readonly tunables: Tunable[]
  private readonly anchorHandles: RigAnchorHandles
  private readonly readout: Phaser.GameObjects.Text
  private selected = 0
  private idleOn = true
  private anchorsOn = true
  private previewOn = true

  constructor(scene: Phaser.Scene, horse: PlayerHorse, handlers: RigTunerHandlers) {
    this.scene = scene
    this.horse = horse
    this.handlers = handlers
    this.tunables = this.buildTunables()

    this.anchorHandles = new RigAnchorHandles(scene, horse, {
      onLayoutChange: () => this.refresh(),
      getIdleEnabled: () => this.idleOn,
    })

    this.readout = scene.add
      .text(16, 16, '', {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.55)',
        padding: { x: 10, y: 8 },
      })
      .setScrollFactor(0)
      .setDepth(1000)

    this.bindKeys()
    this.refresh()
  }

  /** Call each frame so drag handles track anchors during idle/cast. */
  update(): void {
    this.anchorHandles.update()
  }

  private buildTunables(): Tunable[] {
    const L = this.horse.layout
    const apply = () => this.horse.applyLayout()
    const restart = () => this.horse.restartIdle()
    return [
      { label: 'body.scale', kind: 'unit', step: 0.01, get: () => L.body.scale, set: (v) => (L.body.scale = v), after: apply },
      { label: 'body.offsetX', kind: 'int', step: 2, get: () => L.body.offsetX, set: (v) => (L.body.offsetX = v), after: apply },
      { label: 'body.offsetY', kind: 'int', step: 2, get: () => L.body.offsetY, set: (v) => (L.body.offsetY = v), after: apply },
      { label: 'neck.x', kind: 'int', step: 2, get: () => L.neck.x, set: (v) => (L.neck.x = v), after: apply },
      { label: 'neck.y', kind: 'int', step: 2, get: () => L.neck.y, set: (v) => (L.neck.y = v), after: apply },
      { label: 'head.scale', kind: 'unit', step: 0.01, get: () => L.head.scale, set: (v) => (L.head.scale = v), after: apply },
      { label: 'head.originX', kind: 'unit', step: 0.01, get: () => L.head.originX, set: (v) => (L.head.originX = v), after: apply },
      { label: 'head.originY', kind: 'unit', step: 0.01, get: () => L.head.originY, set: (v) => (L.head.originY = v), after: apply },
      { label: 'head.offsetX', kind: 'int', step: 2, get: () => L.head.offsetX, set: (v) => (L.head.offsetX = v), after: apply },
      { label: 'head.offsetY', kind: 'int', step: 2, get: () => L.head.offsetY, set: (v) => (L.head.offsetY = v), after: apply },
      { label: 'mouth.x', kind: 'int', step: 2, get: () => L.mouthOffset.x, set: (v) => (L.mouthOffset.x = v), after: apply },
      { label: 'mouth.y', kind: 'int', step: 2, get: () => L.mouthOffset.y, set: (v) => (L.mouthOffset.y = v), after: apply },
      { label: 'restRodAngleDeg', kind: 'deg', step: 1, get: () => L.restRodAngleDeg, set: (v) => (L.restRodAngleDeg = v), after: apply },
      { label: 'rodLengthPx', kind: 'int', step: 5, get: () => L.rodLengthPx, set: (v) => (L.rodLengthPx = v), after: apply },
      { label: 'idle.headWobbleDeg', kind: 'deg', step: 0.5, get: () => L.idle.headWobbleDeg, set: (v) => (L.idle.headWobbleDeg = v), after: restart },
      { label: 'cast.backBendDeg', kind: 'deg', step: 2, get: () => L.cast.backBendDeg, set: (v) => (L.cast.backBendDeg = v) },
      { label: 'cast.snapForwardDeg', kind: 'deg', step: 2, get: () => L.cast.snapForwardDeg, set: (v) => (L.cast.snapForwardDeg = v) },
    ]
  }

  private bindKeys(): void {
    const kb = this.scene.input.keyboard
    if (!kb) {
      return
    }
    kb.on('keydown-UP', () => this.move(-1))
    kb.on('keydown-DOWN', () => this.move(1))
    kb.on('keydown-LEFT', (e: KeyboardEvent) => this.adjust(-1, e.shiftKey))
    kb.on('keydown-RIGHT', (e: KeyboardEvent) => this.adjust(1, e.shiftKey))
    kb.on('keydown-SPACE', () => this.horse.playCastAnimation())
    kb.on('keydown-B', () => this.toggleIdle())
    kb.on('keydown-M', () => this.toggleAnchors())
    kb.on('keydown-N', () => this.togglePreview())
    kb.on('keydown-P', () => this.logLayout())
    kb.on('keydown-R', () => this.handlers.onReset())
  }

  private move(dir: number): void {
    this.selected = Phaser.Math.Wrap(this.selected + dir, 0, this.tunables.length)
    this.refresh()
  }

  private adjust(dir: number, coarse: boolean): void {
    const t = this.tunables[this.selected]
    const step = t.step * (coarse ? RigTestConfig.coarseStepMultiplier : 1)
    t.set(t.get() + dir * step)
    t.after?.()
    this.refresh()
  }

  private toggleIdle(): void {
    this.idleOn = !this.idleOn
    this.horse.setIdleEnabled(this.idleOn)
    this.refresh()
  }

  private toggleAnchors(): void {
    this.anchorsOn = !this.anchorsOn
    this.horse.setAnchorsVisible(this.anchorsOn)
    this.anchorHandles.setVisible(this.anchorsOn)
    this.refresh()
  }

  private togglePreview(): void {
    this.previewOn = !this.previewOn
    this.handlers.onTogglePreview(this.previewOn)
    this.refresh()
  }

  private logLayout(): void {
    // Pasteable straight into HorseConfig.
    console.log('[RigTuner] HorseConfig layout:\n' + JSON.stringify(this.horse.layout, null, 2))
  }

  private format(t: Tunable): string {
    const v = t.get()
    if (t.kind === 'int') {
      return Math.round(v).toString()
    }
    return v.toFixed(t.kind === 'unit' ? 2 : 1)
  }

  private refresh(): void {
    const lines = this.tunables.map((t, i) => {
      const cursor = i === this.selected ? '>' : ' '
      return `${cursor} ${t.label.padEnd(20)} ${this.format(t)}`
    })
    const footer = [
      '',
      `idle:${this.idleOn ? 'on' : 'off'}  anchors:${this.anchorsOn ? 'on' : 'off'}  preview:${this.previewOn ? 'on' : 'off'}`,
      'DRAG pink=neck  blue=mouth  teal=rod tip',
      'UP/DOWN pick  LEFT/RIGHT adjust (SHIFT=coarse)',
      'SPACE cast  B idle  M anchors  N preview  P log  R reset',
    ]
    this.readout.setText([...lines, ...footer].join('\n'))
  }
}
