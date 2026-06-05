import Phaser from 'phaser'
import { SceneKeys } from './SceneKeys'
import { WorldConfig } from '../config/WorldConfig'
import { DebugConfig } from '../config/DebugConfig'
import { DebugWorldGrid } from '../world/DebugWorldGrid'
import { BackgroundLayer } from '../world/BackgroundLayer'
import { UnderwaterLayer } from '../world/UnderwaterLayer'
import { SurfaceLayer } from '../world/SurfaceLayer'
import { CameraController } from '../systems/CameraController'
import { PlayerHorse } from '../entities/PlayerHorse'
import { Lure } from '../entities/Lure'
import { CastPowerBar } from '../entities/CastPowerBar'
import { FishingLine } from '../entities/FishingLine'
import { InputSystem } from '../systems/InputSystem'
import { PlayerStats } from '../systems/PlayerStats'
import { BiomeSystem } from '../systems/BiomeSystem'
import { FishSpawnSystem } from '../systems/FishSpawnSystem'
import { SpawnPointSystem } from '../systems/SpawnPointSystem'
import { SpawnConfig } from '../config/SpawnConfig'
import type { FishPopulation } from '../types/SpawnPointTypes'
import { FishAISystem } from '../systems/FishAISystem'
import { PredatorSystem } from '../systems/PredatorSystem'
import { HookCollisionSystem } from '../systems/HookCollisionSystem'
import { EconomySystem } from '../systems/EconomySystem'
import { GameSaveSystem } from '../systems/GameSaveSystem'
import { ShopSystem } from '../systems/ShopSystem'
import { FishingStateMachine } from '../systems/FishingStateMachine'
import { BaitSystem } from '../systems/BaitSystem'
import { CatchDecisionSystem } from '../systems/CatchDecisionSystem'
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
  private castPowerBar!: CastPowerBar
  private line!: FishingLine
  private inputSystem!: InputSystem
  private stats!: PlayerStats
  private biomes!: BiomeSystem
  private spawn!: FishPopulation
  private fishAI!: FishAISystem
  private predators!: PredatorSystem
  private save!: GameSaveSystem
  private economy!: EconomySystem
  private shop!: ShopSystem
  private bait!: BaitSystem
  private catchDecision!: CatchDecisionSystem
  private fishing!: FishingStateMachine

  constructor() {
    super(SceneKeys.World)
  }

  create(): void {
    new BackgroundLayer(this)
    new UnderwaterLayer(this)
    new SurfaceLayer(this)

    if (DebugConfig.showWorldGrid) {
      new DebugWorldGrid(this)
    }

    this.cameraController = new CameraController(this)
    this.horse = new PlayerHorse(this, WorldConfig.surfaceAnchorX, WorldConfig.waterlineY)
    this.lure = new Lure(this)
    this.castPowerBar = new CastPowerBar(this)
    this.line = new FishingLine(this)
    this.inputSystem = new InputSystem(this)
    this.biomes = new BiomeSystem()
    // Population source is config-driven: editor-authored spawn points by
    // default, with the legacy procedural spawner kept as a parity fallback.
    this.spawn =
      SpawnConfig.mode === 'points'
        ? new SpawnPointSystem(this)
        : new FishSpawnSystem(this, this.biomes)
    this.fishAI = new FishAISystem()
    this.predators = new PredatorSystem(this, this.biomes)
    this.save = new GameSaveSystem()
    this.economy = new EconomySystem(this.save)
    this.shop = new ShopSystem(this.economy, this.save)
    this.stats = new PlayerStats(this.horse, this.lure)
    this.bait = new BaitSystem()
    this.catchDecision = new CatchDecisionSystem(this.economy, this.bait)
    this.lure.setBaitColor(this.bait.color)

    this.fishing = new FishingStateMachine({
      horse: this.horse,
      lure: this.lure,
      castPowerBar: this.castPowerBar,
      camera: this.cameraController,
      input: this.inputSystem,
      stats: this.stats,
      spawn: this.spawn,
      fishAI: this.fishAI,
      predators: this.predators,
      biomes: this.biomes,
      hook: new HookCollisionSystem(),
      bait: this.bait,
      catchDecision: this.catchDecision,
    })

    // Re-frame once layout/scale is settled so idle start shows horse + surface.
    this.time.delayedCall(0, () => this.cameraController.refreshSurfaceFrame())
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleViewportResize, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleViewportResize, this)
      this.inputSystem.destroy()
      this.fishing.destroy()
      this.shop.destroy()
      this.economy.destroy()
      this.bait.destroy()
    })
  }

  private handleViewportResize(): void {
    this.cameraController.refreshSurfaceFrame()
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
