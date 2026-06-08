import Phaser from 'phaser'
import catfishChordsUrl from '../../assets/audio/catfish_chords.mp3'
import titleWhooshUrl from '../../assets/audio/sfx/title_whoosh.wav'
import castThrowUrl from '../../assets/audio/sfx/cast_throw.wav'
import waterSplashUrl from '../../assets/audio/sfx/water_splash.wav'
import lureBobLoopUrl from '../../assets/audio/sfx/lure_bob_loop.wav'
import reelLoopUrl from '../../assets/audio/sfx/reel_loop.wav'
import fishBiteUrl from '../../assets/audio/sfx/fish_bite.wav'
import fishStruggleLoopUrl from '../../assets/audio/sfx/fish_struggle_loop.wav'
import catchLandedUrl from '../../assets/audio/sfx/catch_landed.wav'
import catchLostUrl from '../../assets/audio/sfx/catch_lost.wav'

/** Audio keys for the game's sound manager. */
export const AudioKeys = {
  backgroundMusic: 'music-catfish-chords',
  titleWhoosh: 'sfx-title-whoosh',
  castThrow: 'sfx-cast-throw',
  waterSplash: 'sfx-water-splash',
  lureBobLoop: 'sfx-lure-bob-loop',
  reelLoop: 'sfx-reel-loop',
  fishBite: 'sfx-fish-bite',
  fishStruggleLoop: 'sfx-fish-struggle-loop',
  catchLanded: 'sfx-catch-landed',
  catchLost: 'sfx-catch-lost',
} as const

const AUDIO_SOURCES: ReadonlyArray<readonly [string, string]> = [
  [AudioKeys.backgroundMusic, catfishChordsUrl],
  [AudioKeys.titleWhoosh, titleWhooshUrl],
  [AudioKeys.castThrow, castThrowUrl],
  [AudioKeys.waterSplash, waterSplashUrl],
  [AudioKeys.lureBobLoop, lureBobLoopUrl],
  [AudioKeys.reelLoop, reelLoopUrl],
  [AudioKeys.fishBite, fishBiteUrl],
  [AudioKeys.fishStruggleLoop, fishStruggleLoopUrl],
  [AudioKeys.catchLanded, catchLandedUrl],
  [AudioKeys.catchLost, catchLostUrl],
]

/** Queues game music and sound effects on the given scene's loader. */
export function loadAudioAssets(scene: Phaser.Scene): void {
  for (const [key, url] of AUDIO_SOURCES) {
    if (!scene.cache.audio.exists(key)) {
      scene.load.audio(key, url)
    }
  }
}
