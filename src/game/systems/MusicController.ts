import Phaser from 'phaser'
import { AudioKeys } from '../assets/AudioAssets'
import { AudioConfig } from '../config/AudioConfig'

/**
 * Owns looping background music across scene transitions. Phaser's sound
 * manager is game-wide, so one controller keeps playback continuous from
 * title through gameplay.
 */
export class MusicController {
  private sound?: Phaser.Sound.BaseSoundManager
  private music?: Phaser.Sound.WebAudioSound
  private musicVolume: number = AudioConfig.defaultMusicVolume

  /** Attach to a scene so the controller can reach the shared sound manager. */
  bind(scene: Phaser.Scene): void {
    this.sound = scene.sound
  }

  /** Start the background track if it is loaded and not already playing. */
  startBackgroundMusic(): void {
    if (!this.sound?.locked) {
      this.playBackgroundMusic()
      return
    }

    this.sound.once(Phaser.Sound.Events.UNLOCKED, () => this.playBackgroundMusic())
  }

  /** Update music volume for the active background track only. */
  setMusicVolume(volume: number): void {
    this.musicVolume = Phaser.Math.Clamp(volume, 0, 1)
    this.music?.setVolume(this.musicVolume)
  }

  private playBackgroundMusic(): void {
    if (!this.sound) {
      return
    }

    if (this.music?.isPlaying) {
      this.music.setVolume(this.musicVolume)
      return
    }

    if (!this.music) {
      this.music = this.sound.add(AudioKeys.backgroundMusic, {
        loop: true,
        volume: this.musicVolume,
      }) as Phaser.Sound.WebAudioSound
    } else {
      this.music.setVolume(this.musicVolume)
    }

    if (!this.music.isPlaying) {
      this.music.play()
    }
  }
}

export const musicController = new MusicController()
