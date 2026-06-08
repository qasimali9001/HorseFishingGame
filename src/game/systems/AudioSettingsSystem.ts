import { AudioConfig } from '../config/AudioConfig'
import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/GameEvents'
import { musicController } from './MusicController'

interface AudioSettingsData {
  readonly musicVolume: number
  readonly sfxVolume: number
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function resolveLocalStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const testKey = `${AudioConfig.settingsStorageKey}:test`
    window.localStorage.setItem(testKey, '1')
    window.localStorage.removeItem(testKey)
    return window.localStorage
  } catch {
    return null
  }
}

function parseVolume(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? clamp01(value) : fallback
}

/**
 * Persists player audio preferences and routes music volume to the active
 * background track. SFX volume is stored for future one-shot sounds only.
 */
export class AudioSettingsSystem {
  private musicVolume: number
  private sfxVolume: number

  constructor(private readonly storage: Storage | null = resolveLocalStorage()) {
    const saved = this.load()
    this.musicVolume = saved.musicVolume
    this.sfxVolume = saved.sfxVolume
  }

  getMusicVolume(): number {
    return this.musicVolume
  }

  getSfxVolume(): number {
    return this.sfxVolume
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = clamp01(volume)
    musicController.setMusicVolume(this.musicVolume)
    this.persist()
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = clamp01(volume)
    EventBus.emit(GameEvents.SFX_VOLUME_CHANGED, { volume: this.sfxVolume })
    this.persist()
  }

  /** Re-apply saved music volume after the sound manager is bound. */
  applyToMusic(): void {
    musicController.setMusicVolume(this.musicVolume)
  }

  /** Future SFX playback should multiply source volume by this master level. */
  resolveSfxVolume(sourceVolume = 1): number {
    return clamp01(sourceVolume) * this.sfxVolume
  }

  private load(): AudioSettingsData {
    if (!this.storage) {
      return {
        musicVolume: AudioConfig.defaultMusicVolume,
        sfxVolume: AudioConfig.defaultSfxVolume,
      }
    }

    try {
      const raw = this.storage.getItem(AudioConfig.settingsStorageKey)
      if (!raw) {
        return {
          musicVolume: AudioConfig.defaultMusicVolume,
          sfxVolume: AudioConfig.defaultSfxVolume,
        }
      }

      const parsed: unknown = JSON.parse(raw)
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return {
          musicVolume: AudioConfig.defaultMusicVolume,
          sfxVolume: AudioConfig.defaultSfxVolume,
        }
      }

      const record = parsed as Record<string, unknown>
      return {
        musicVolume: parseVolume(record.musicVolume, AudioConfig.defaultMusicVolume),
        sfxVolume: parseVolume(record.sfxVolume, AudioConfig.defaultSfxVolume),
      }
    } catch {
      return {
        musicVolume: AudioConfig.defaultMusicVolume,
        sfxVolume: AudioConfig.defaultSfxVolume,
      }
    }
  }

  private persist(): void {
    if (!this.storage) {
      return
    }

    try {
      this.storage.setItem(
        AudioConfig.settingsStorageKey,
        JSON.stringify({
          musicVolume: this.musicVolume,
          sfxVolume: this.sfxVolume,
        }),
      )
    } catch {
      // Ignore quota/private-mode failures.
    }
  }
}

export const audioSettings = new AudioSettingsSystem()
