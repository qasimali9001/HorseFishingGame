import { AudioKeys } from '../assets/AudioAssets'

/** Per-effect gain and loop behavior before the player's SFX master volume. */
export const SfxConfig = {
  oneShots: {
    titleWhoosh: {
      key: AudioKeys.titleWhoosh,
      volume: 0.85,
    },
    castThrow: {
      key: AudioKeys.castThrow,
      volume: 0.7,
    },
    waterSplash: {
      key: AudioKeys.waterSplash,
      volume: 0.65,
    },
    fishBite: {
      key: AudioKeys.fishBite,
      volume: 0.8,
    },
    catchLanded: {
      key: AudioKeys.catchLanded,
      volume: 0.75,
    },
    catchLost: {
      key: AudioKeys.catchLost,
      volume: 0.85,
    },
  },
  loops: {
    lureBob: {
      key: AudioKeys.lureBobLoop,
      volume: 0.24,
    },
    reel: {
      key: AudioKeys.reelLoop,
      volume: 0.42,
    },
    fishStruggle: {
      key: AudioKeys.fishStruggleLoop,
      volume: 0.38,
    },
  },
} as const

export type SfxOneShotId = keyof typeof SfxConfig.oneShots
export type SfxLoopId = keyof typeof SfxConfig.loops
