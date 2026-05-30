import { FishingState } from '../types/GameStateTypes'
import { WorldConfig } from '../config/WorldConfig'
import { FishingConfig } from '../config/FishingConfig'
import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/GameEvents'
import { CameraController, CameraMode } from './CameraController'
import type { InputSystem } from './InputSystem'
import type { PlayerStats } from './PlayerStats'
import type { FishSpawnSystem } from './FishSpawnSystem'
import type { HookCollisionSystem } from './HookCollisionSystem'
import type { EconomySystem } from './EconomySystem'
import type { PlayerHorse } from '../entities/PlayerHorse'
import type { Lure } from '../entities/Lure'
import type { Fish } from '../entities/Fish'

export interface FishingDeps {
  horse: PlayerHorse
  lure: Lure
  camera: CameraController
  input: InputSystem
  stats: PlayerStats
  spawn: FishSpawnSystem
  hook: HookCollisionSystem
  economy: EconomySystem
}

/**
 * Single source of truth for the fishing loop. Owns transitions, drives the
 * camera mode, and coordinates hooking + selling. It does not draw anything,
 * read raw input, or contain fish AI / economy rules (those live in their own
 * systems) -- it just orchestrates them.
 */
export class FishingStateMachine {
  private state: FishingState = FishingState.IdleAtSurface
  private enteredWater = false
  private hookedFish: Fish | null = null

  constructor(private readonly deps: FishingDeps) {
    deps.camera.setFollowTarget(deps.lure.sprite)
    deps.camera.setMode(CameraMode.SurfaceIdle)
  }

  get current(): FishingState {
    return this.state
  }

  update(dtSec: number): void {
    if (this.state === FishingState.IdleAtSurface) {
      if (this.deps.input.consumeCast()) {
        this.beginCast()
      }
    } else if (this.deps.lure.isActive) {
      this.deps.lure.update(dtSec, {
        reeling: this.deps.input.isReeling,
        maxDepth: this.deps.stats.maxDepth,
        reelSpeedMultiplier: this.deps.stats.reelSpeedMultiplier,
      })
      this.handleWaterEntry()
    }

    const fishing = this.enteredWater && this.deps.lure.isActive
    this.deps.spawn.update(dtSec, { lureUnderwater: fishing, maxDepth: this.deps.stats.maxDepth })

    if (fishing) {
      this.handleHooking(dtSec)
      this.updateUnderwaterState()
      this.checkLanding()
    }
  }

  private beginCast(): void {
    this.setState(FishingState.Casting)
    this.enteredWater = false
    this.deps.camera.setMode(CameraMode.Casting)
    this.deps.horse.playCastAnimation(() => this.launchLure())
  }

  private launchLure(): void {
    const tip = this.deps.horse.getRodTipWorldPosition()
    this.deps.lure.launch(tip.x, tip.y, this.deps.stats.castPowerMultiplier)
  }

  private handleWaterEntry(): void {
    if (this.enteredWater || this.deps.lure.mode !== 'airborne') {
      return
    }
    if (this.deps.lure.y >= WorldConfig.waterlineY) {
      this.enteredWater = true
      this.deps.lure.enterWater()
      this.deps.camera.setMode(CameraMode.LureFollow)
      this.setState(FishingState.Sinking)
    }
  }

  private handleHooking(dtSec: number): void {
    if (this.hookedFish) {
      this.hookedFish.followLure(this.deps.lure.x, this.deps.lure.y, dtSec)
      return
    }
    const caught = this.deps.hook.findCatch(this.deps.lure, this.deps.spawn.list)
    if (caught) {
      caught.setHooked()
      this.hookedFish = caught
      EventBus.emit(GameEvents.FISH_HOOKED, { fishId: caught.def.id })
    }
  }

  private updateUnderwaterState(): void {
    const desired = this.hookedFish ? FishingState.FishHooked : this.stateForLureMode()
    if (this.state !== desired && this.state !== FishingState.CatchLanded) {
      this.setState(desired)
    }
  }

  private checkLanding(): void {
    const backAtSurface =
      this.deps.lure.y <= WorldConfig.waterlineY + FishingConfig.surfaceReturnDepth
    if (this.deps.input.isReeling && backAtSurface) {
      this.land()
    }
  }

  private land(): void {
    this.setState(FishingState.CatchLanded)

    if (this.hookedFish) {
      const fish = this.hookedFish
      this.deps.economy.sell(fish.value)
      EventBus.emit(GameEvents.CATCH_LANDED, {
        fishId: fish.def.id,
        displayName: fish.def.displayName,
        value: fish.value,
      })
      this.deps.spawn.remove(fish)
      this.hookedFish = null
    }

    this.deps.lure.dock()
    this.enteredWater = false
    this.deps.camera.setMode(CameraMode.LandingCatch)
    this.setState(FishingState.IdleAtSurface)
  }

  private stateForLureMode(): FishingState {
    switch (this.deps.lure.mode) {
      case 'reeling':
        return FishingState.Reeling
      case 'hanging':
        return FishingState.WaitingForBite
      default:
        return FishingState.Sinking
    }
  }

  private setState(next: FishingState): void {
    if (next === this.state) {
      return
    }
    this.state = next
    EventBus.emit(GameEvents.STATE_CHANGED, { state: next })
  }
}
