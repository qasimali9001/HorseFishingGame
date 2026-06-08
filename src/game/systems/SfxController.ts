import Phaser from 'phaser'
import { SfxConfig, type SfxLoopId, type SfxOneShotId } from '../config/SfxConfig'
import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/GameEvents'
import { FishingState } from '../types/GameStateTypes'
import { audioSettings } from './AudioSettingsSystem'

interface StateChangedPayload {
  readonly state: FishingState
}

interface ReelingChangedPayload {
  readonly active: boolean
}

/**
 * Owns sound-effect playback and keeps all effects on the SFX volume slider.
 * Gameplay only emits events; this controller decides which loops are active.
 */
export class SfxController {
  private sound?: Phaser.Sound.BaseSoundManager
  private readonly loops = new Map<SfxLoopId, Phaser.Sound.WebAudioSound>()
  private eventsConnected = false

  bind(scene: Phaser.Scene): void {
    this.sound = scene.sound
    this.refreshLoopVolumes()
  }

  connectGameplayEvents(): void {
    this.disconnectGameplayEvents()
    EventBus.on(GameEvents.STATE_CHANGED, this.handleStateChanged)
    EventBus.on(GameEvents.REELING_CHANGED, this.handleReelingChanged)
    EventBus.on(GameEvents.LURE_WATER_ENTERED, this.handleLureWaterEntered)
    EventBus.on(GameEvents.FISH_HOOKED, this.handleFishHooked)
    EventBus.on(GameEvents.CATCH_LANDED, this.handleCatchLanded)
    EventBus.on(GameEvents.CATCH_LOST, this.handleCatchLost)
    EventBus.on(GameEvents.SFX_VOLUME_CHANGED, this.handleSfxVolumeChanged)
    this.eventsConnected = true
  }

  disconnectGameplayEvents(): void {
    if (!this.eventsConnected) {
      return
    }

    EventBus.off(GameEvents.STATE_CHANGED, this.handleStateChanged)
    EventBus.off(GameEvents.REELING_CHANGED, this.handleReelingChanged)
    EventBus.off(GameEvents.LURE_WATER_ENTERED, this.handleLureWaterEntered)
    EventBus.off(GameEvents.FISH_HOOKED, this.handleFishHooked)
    EventBus.off(GameEvents.CATCH_LANDED, this.handleCatchLanded)
    EventBus.off(GameEvents.CATCH_LOST, this.handleCatchLost)
    EventBus.off(GameEvents.SFX_VOLUME_CHANGED, this.handleSfxVolumeChanged)
    this.eventsConnected = false
    this.stopAllLoops()
  }

  playOneShot(id: SfxOneShotId): void {
    if (!this.sound) {
      return
    }

    const config = SfxConfig.oneShots[id]
    this.sound.play(config.key, {
      volume: audioSettings.resolveSfxVolume(config.volume),
    })
  }

  refreshLoopVolumes(): void {
    for (const [id, sound] of this.loops) {
      sound.setVolume(this.resolveLoopVolume(id))
    }
  }

  private playLoop(id: SfxLoopId): void {
    if (!this.sound) {
      return
    }

    let loop = this.loops.get(id)
    if (!loop) {
      loop = this.sound.add(SfxConfig.loops[id].key, {
        loop: true,
        volume: this.resolveLoopVolume(id),
      }) as Phaser.Sound.WebAudioSound
      this.loops.set(id, loop)
    }

    loop.setVolume(this.resolveLoopVolume(id))
    if (!loop.isPlaying) {
      loop.play()
    }
  }

  private stopLoop(id: SfxLoopId): void {
    this.loops.get(id)?.stop()
  }

  private stopAllLoops(): void {
    for (const loop of this.loops.values()) {
      loop.stop()
    }
  }

  private resolveLoopVolume(id: SfxLoopId): number {
    return audioSettings.resolveSfxVolume(SfxConfig.loops[id].volume)
  }

  private readonly handleStateChanged = (payload: StateChangedPayload): void => {
    switch (payload.state) {
      case FishingState.Casting:
        this.playOneShot('castThrow')
        this.stopLoop('lureBob')
        this.stopLoop('fishStruggle')
        return
      case FishingState.Sinking:
        this.stopLoop('lureBob')
        return
      case FishingState.WaitingForBite:
        this.playLoop('lureBob')
        return
      case FishingState.FishHooked:
        this.stopLoop('lureBob')
        this.playLoop('fishStruggle')
        return
      case FishingState.CatchLanded:
      case FishingState.CatchLost:
      case FishingState.IdleAtSurface:
      case FishingState.AwaitingCatchDecision:
        this.stopLoop('lureBob')
        this.stopLoop('reel')
        this.stopLoop('fishStruggle')
        return
      default:
        return
    }
  }

  private readonly handleReelingChanged = (payload: ReelingChangedPayload): void => {
    if (payload.active) {
      this.playLoop('reel')
    } else {
      this.stopLoop('reel')
    }
  }

  private readonly handleFishHooked = (): void => {
    this.playOneShot('fishBite')
  }

  private readonly handleLureWaterEntered = (): void => {
    this.playOneShot('waterSplash')
  }

  private readonly handleCatchLanded = (): void => {
    this.playOneShot('catchLanded')
  }

  private readonly handleCatchLost = (): void => {
    this.playOneShot('catchLost')
  }

  private readonly handleSfxVolumeChanged = (): void => {
    this.refreshLoopVolumes()
  }
}

export const sfxController = new SfxController()
