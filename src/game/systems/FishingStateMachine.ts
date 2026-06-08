import { FishingState } from '../types/GameStateTypes'
import { WorldConfig } from '../config/WorldConfig'
import { FishingConfig } from '../config/FishingConfig'
import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/GameEvents'
import { CameraController, CameraMode } from './CameraController'
import { CastPowerConfig } from '../config/CastPowerConfig'
import { CastPower } from './CastPower'
import { LinePayoutController } from './LinePayoutController'
import type { InputSystem } from './InputSystem'
import type { PlayerStats } from './PlayerStats'
import type { FishPopulation } from '../types/SpawnPointTypes'
import type { FishAISystem } from './FishAISystem'
import type { PredatorSystem } from './PredatorSystem'
import type { BiomeSystem } from './BiomeSystem'
import type { HookCollisionSystem } from './HookCollisionSystem'
import type { CastPowerBar } from '../entities/CastPowerBar'
import type { PlayerHorse } from '../entities/PlayerHorse'
import type { Lure } from '../entities/Lure'
import type { Fish } from '../entities/Fish'
import type { BaitSystem } from './BaitSystem'
import type { CatchDecisionSystem } from './CatchDecisionSystem'

export interface FishingDeps {
  horse: PlayerHorse
  lure: Lure
  camera: CameraController
  input: InputSystem
  castPowerBar: CastPowerBar
  stats: PlayerStats
  spawn: FishPopulation
  fishAI: FishAISystem
  predators: PredatorSystem
  biomes: BiomeSystem
  hook: HookCollisionSystem
  bait: BaitSystem
  catchDecision: CatchDecisionSystem
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
  /** False after a hooked fish is eaten; restored when the lure docks at the surface. */
  private hookHasBait = true
  /** Reset upgraded bait tier when the player reels in after a theft. */
  private resetBaitOnLanding = false
  /** True between a fresh press (in idle) and its release: the cast is charging. */
  private charging = false
  private sellRequested = false
  private wasReeling = false
  /** Owns per-cast line payout and taut-line depth constraints. */
  private readonly linePayout = new LinePayoutController()

  constructor(private readonly deps: FishingDeps) {
    deps.camera.setFollowTarget(deps.lure.sprite)
    deps.camera.setMode(CameraMode.SurfaceIdle)
    deps.lure.setBaitColor(deps.bait.color)
    EventBus.on(GameEvents.BAIT_CHANGED, this.onBaitChanged)
    EventBus.on(GameEvents.CATCH_SELL_REQUESTED, this.onSellRequested)
  }

  get current(): FishingState {
    return this.state
  }

  destroy(): void {
    EventBus.off(GameEvents.BAIT_CHANGED, this.onBaitChanged)
    EventBus.off(GameEvents.CATCH_SELL_REQUESTED, this.onSellRequested)
    EventBus.emit(GameEvents.REELING_CHANGED, { active: false })
  }

  update(dtSec: number): void {
    // Drain the press down-edge every frame so a press that begins while a lure
    // is out (i.e. starting a reel) can never linger and auto-arm a charge once
    // the lure docks. Only a fresh press made while idle charges a cast.
    const pressedDownEdge = this.deps.input.consumeDownEdge()
    const pressedSell = this.deps.input.consumeSellDownEdge() || this.consumeSellRequest()

    if (!this.deps.lure.isActive) {
      this.handleIdleInput(pressedDownEdge, pressedSell)
    } else {
      const rodTip = this.deps.horse.getRodTipWorldPosition()
      const lineConstraint = this.linePayout.update(dtSec, {
        lureMode: this.deps.lure.mode,
        reeling: this.deps.input.isReeling,
        reelSpeedMultiplier: this.deps.stats.reelSpeedMultiplier,
        rodTipX: rodTip.x,
        rodTipY: rodTip.y,
        lureX: this.deps.lure.x,
        lureY: this.deps.lure.y,
      })
      this.deps.lure.update(dtSec, {
        reeling: this.deps.input.isReeling,
        reelTargetX: rodTip.x,
        reelTargetY: rodTip.y,
        maxReachY: lineConstraint.maxReachY,
        isTaut: lineConstraint.isTaut,
        reelSpeedMultiplier: this.deps.stats.reelSpeedMultiplier,
      })
      this.handleWaterEntry()
    }

    const fishing = this.enteredWater && this.deps.lure.isActive
    const spawnDepth = fishing ? this.linePayout.currentLineLengthCap : this.deps.stats.maxDepth

    if (fishing) {
      this.deps.biomes.update(this.deps.lure.depth)
    }

    this.deps.spawn.update(dtSec, { lureUnderwater: fishing, maxDepth: spawnDepth })
    this.deps.fishAI.update(dtSec, this.deps.spawn.list, {
      lureX: this.deps.lure.x,
      lureY: this.deps.lure.y,
      lureActive: fishing && this.hookHasBait && !this.hookedFish,
      hookedFish: this.hookedFish,
    })

    if (fishing) {
      this.handleHooking(dtSec)
    }

    // Predators chase the hooked fish; a successful steal resolves CatchLost.
    const stoleCatch = this.deps.predators.update(dtSec, {
      hookedFish: this.hookedFish,
      fish: this.deps.spawn.list,
      canSpawn: fishing,
      maxDepth: spawnDepth,
    })
    if (stoleCatch) {
      this.loseCatch()
    }

    if (fishing) {
      this.updateUnderwaterState()
      this.checkLanding()
    }

    this.updateReelingSignal()
  }

  private updateReelingSignal(): void {
    const isReeling = this.deps.lure.isActive && this.deps.input.isReeling
    if (isReeling === this.wasReeling) {
      return
    }

    this.wasReeling = isReeling
    EventBus.emit(GameEvents.REELING_CHANGED, { active: isReeling })
  }

  private consumeSellRequest(): boolean {
    const requested = this.sellRequested
    this.sellRequested = false
    return requested
  }

  /** A larger fish ate the hooked fish: announce it and leave the hook baitless. */
  private loseCatch(): void {
    const fish = this.hookedFish
    if (!fish) {
      return
    }
    EventBus.emit(GameEvents.CATCH_LOST, { fishId: fish.def.id, displayName: fish.def.displayName })
    this.deps.spawn.remove(fish)
    this.hookedFish = null
    this.hookHasBait = false
    this.resetBaitOnLanding = true
    this.deps.lure.setBaitVisible(false)
    this.setState(FishingState.CatchLost)
  }

  /**
   * Charge-cast input. A charge arms ONLY on a fresh press (down-edge) made
   * while idle, so a pointer still held from reeling -- when the lure lands --
   * cannot auto-fire a cast. Releasing fires the lure with that charge power.
   */
  private handleIdleInput(pressedDownEdge: boolean, pressedSell: boolean): void {
    if (this.deps.catchDecision.hasPending) {
      if (pressedSell) {
        if (this.deps.catchDecision.sellPending('hotkey')) {
          this.setState(FishingState.IdleAtSurface)
        }
        return
      }
      if (pressedDownEdge) {
        this.deps.catchDecision.resolveOnRecast()
      }
    }
    this.handleChargeInput(pressedDownEdge)
  }

  /**
   * Charge-cast input. A charge arms ONLY on a fresh press (down-edge) made
   * while idle, so a pointer still held from reeling -- when the lure lands --
   * cannot auto-fire a cast. Releasing fires the lure with that charge power.
   */
  private handleChargeInput(pressedDownEdge: boolean): void {
    const canChargeFromState =
      this.state === FishingState.IdleAtSurface || this.state === FishingState.AwaitingCatchDecision
    if (pressedDownEdge && canChargeFromState) {
      this.charging = true
      this.setState(FishingState.Charging)
    }

    if (this.charging && this.deps.input.isPressed) {
      const holdMs = Math.min(this.deps.input.currentHoldMs, CastPowerConfig.maxChargeMs)
      const previewPower = CastPower.normalizedPower(holdMs)
      this.deps.castPowerBar.show(previewPower)
    }

    if (this.charging && !this.deps.input.isPressed) {
      const holdMs = this.deps.input.consumeRelease() ?? 0
      this.charging = false
      this.deps.castPowerBar.hide()
      this.releaseCast(holdMs)
    }
  }

  /** Fires the lure on release; hold time sets launch speed + line payout profile. */
  private releaseCast(holdMs: number): void {
    const solution = CastPower.resolve(holdMs, this.deps.stats.castPowerMultiplier)
    this.linePayout.beginCast(solution.power01, this.deps.stats.maxDepth)
    this.enteredWater = false
    this.hookHasBait = true
    this.deps.camera.setMode(CameraMode.Casting)

    this.deps.horse.playCastAnimation(() => {
      const tip = this.deps.horse.getRodTipWorldPosition()
      this.deps.lure.launch(tip.x, tip.y, solution.velocityX, solution.velocityY)
    })

    this.setState(FishingState.Casting)
  }

  private handleWaterEntry(): void {
    if (this.enteredWater || this.deps.lure.mode !== 'airborne') {
      return
    }
    if (this.deps.lure.y >= WorldConfig.waterlineY) {
      this.enteredWater = true
      this.deps.lure.enterWater()
      EventBus.emit(GameEvents.LURE_WATER_ENTERED)
      this.deps.camera.setMode(CameraMode.LureFollow)
      this.setState(FishingState.Sinking)
    }
  }

  private handleHooking(dtSec: number): void {
    if (this.hookedFish) {
      this.hookedFish.followLure(
        this.deps.lure.x,
        this.deps.lure.y,
        dtSec,
        this.deps.input.isReeling,
      )
      return
    }
    if (!this.hookHasBait) {
      return
    }
    const caught = this.deps.hook.findCatch(
      this.deps.lure,
      this.deps.spawn.list,
      (candidate) => this.deps.bait.canHook(candidate.def.requiredBaitTier),
    )
    if (caught) {
      caught.setHooked()
      caught.snapToHook(this.deps.lure.x, this.deps.lure.y)
      this.deps.lure.setBaitVisible(false)
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
      this.deps.bait.consumeOnCatch()
      EventBus.emit(GameEvents.CATCH_LANDED, {
        fishId: fish.def.id,
        displayName: fish.def.displayName,
        value: fish.value,
        sizeTier: fish.def.sizeTier,
      })
      this.deps.catchDecision.queueFromFish(fish)
      this.deps.spawn.remove(fish)
      this.hookedFish = null
    }

    this.deps.lure.dock()
    this.hookHasBait = true
    if (this.resetBaitOnLanding) {
      this.deps.bait.resetOnTheft()
      this.resetBaitOnLanding = false
    }
    this.enteredWater = false
    this.linePayout.reset()
    this.deps.biomes.reset()
    this.deps.camera.setMode(CameraMode.LandingCatch)
    this.setState(
      this.deps.catchDecision.hasPending
        ? FishingState.AwaitingCatchDecision
        : FishingState.IdleAtSurface,
    )
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

  private readonly onSellRequested = (): void => {
    this.sellRequested = true
  }

  private readonly onBaitChanged = (payload: { color: number }): void => {
    this.deps.lure.setBaitColor(payload.color)
  }
}
