import Phaser from 'phaser'
import { SceneKeys } from './SceneKeys'
import { WorldConfig } from '../config/WorldConfig'
import { DebugWorldGrid } from '../world/DebugWorldGrid'
import { CameraController } from '../systems/CameraController'
import { PlayerHorse } from '../entities/PlayerHorse'
import { Lure } from '../entities/Lure'
import { FishingLine } from '../entities/FishingLine'
import { InputSystem } from '../systems/InputSystem'
import { PlayerStats } from '../systems/PlayerStats'
import { FishSpawnSystem } from '../systems/FishSpawnSystem'
import { HookCollisionSystem } from '../systems/HookCollisionSystem'
import { EconomySystem } from '../systems/EconomySystem'
import { FishingStateMachine } from '../systems/FishingStateMachine'
import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/GameEvents'

/**
 * The single world scene: one coordinate system, one camera. Orchestrator
 * only -- it builds the modules and runs them in a fixed update order. All
 * gameplay logic lives in the entities/systems it wires together.
 */
export class WorldScene extends Phaser.Scene {
  private cameraController!: CameraController
  private horse!: PlayerHorse
  private lure!: Lure
  private line!: FishingLine
  private inputSystem!: InputSystem
  private stats!: PlayerStats
  private spawn!: FishSpawnSystem
  private economy!: EconomySystem
  private fishing!: FishingStateMachine

  constructor() {
    super(SceneKeys.World)
  }

  create(): void {
    new DebugWorldGrid(this)

    this.cameraController = new CameraController(this)
    this.horse = new PlayerHorse(this, WorldConfig.surfaceAnchorX, WorldConfig.waterlineY)
    this.lure = new Lure(this)
    this.line = new FishingLine(this)
    this.inputSystem = new InputSystem(this)
    this.stats = new PlayerStats(this.horse)
    this.spawn = new FishSpawnSystem(this)
    this.economy = new EconomySystem()

    this.fishing = new FishingStateMachine({
      horse: this.horse,
      lure: this.lure,
      camera: this.cameraController,
      input: this.inputSystem,
      stats: this.stats,
      spawn: this.spawn,
      hook: new HookCollisionSystem(),
      economy: this.economy,
    })
  }

  update(_time: number, deltaMs: number): void {
    const dtSec = deltaMs / 1000

    // 1-2. Input + fishing state machine (also steps lure kinematics + camera).
    this.fishing.update(dtSec)

    // 7. Line redraw (rod tip -> lure) after positions settle this frame.
    this.line.redraw(
      this.horse.getRodTipWorldPosition(),
      this.lure.x,
      this.lure.y,
      this.lure.isActive,
    )

    // 8. UI reacts to this snapshot.
    EventBus.emit(GameEvents.DEBUG_TICK, {
      depth: this.lure.depth,
      maxDepth: this.stats.maxDepth,
      cameraMode: this.cameraController.currentMode,
      state: this.fishing.current,
    })
  }
}
