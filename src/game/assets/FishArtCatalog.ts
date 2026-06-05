import type { FishSizeTier } from '../types/BaitTypes'

import goldfishOrangeUrl from '../../assets/fish/fish_01_goldfish_orange_small.png'
import slenderBlueWhiteUrl from '../../assets/fish/fish_02_slender_blue_white_small.png'
import greenishBrownUrl from '../../assets/fish/fish_03_greenish_brown_small.png'
import blueTangUrl from '../../assets/fish/fish_04_blue_tang_medium.png'
import olivePikeUrl from '../../assets/fish/fish_05_olive_pike_medium.png'
import pinkRoundUrl from '../../assets/fish/fish_06_pink_round_medium.png'
import purpleChunkyUrl from '../../assets/fish/fish_07_purple_chunky_large.png'
import blueTunaUrl from '../../assets/fish/fish_08_blue_tuna_large.png'
import greyCatfishUrl from '../../assets/fish/fish_09_grey_catfish_large.png'

/** One bundled fish sprite: texture key, source URL, and size tier. */
export interface FishArtEntry {
  textureKey: string
  sourceUrl: string
  sizeTier: FishSizeTier
}

/**
 * Single source of truth for fish sprite assets. Each entry maps a Phaser
 * texture key to its bundled PNG and size tier (used for display scaling).
 */
export const FISH_ART_CATALOG: readonly FishArtEntry[] = [
  {
    textureKey: 'fish-goldfish-orange',
    sourceUrl: goldfishOrangeUrl,
    sizeTier: 'small',
  },
  {
    textureKey: 'fish-slender-blue-white',
    sourceUrl: slenderBlueWhiteUrl,
    sizeTier: 'small',
  },
  {
    textureKey: 'fish-greenish-brown',
    sourceUrl: greenishBrownUrl,
    sizeTier: 'small',
  },
  {
    textureKey: 'fish-blue-tang',
    sourceUrl: blueTangUrl,
    sizeTier: 'medium',
  },
  {
    textureKey: 'fish-olive-pike',
    sourceUrl: olivePikeUrl,
    sizeTier: 'medium',
  },
  {
    textureKey: 'fish-pink-round',
    sourceUrl: pinkRoundUrl,
    sizeTier: 'medium',
  },
  {
    textureKey: 'fish-purple-chunky',
    sourceUrl: purpleChunkyUrl,
    sizeTier: 'large',
  },
  {
    textureKey: 'fish-blue-tuna',
    sourceUrl: blueTunaUrl,
    sizeTier: 'large',
  },
  {
    textureKey: 'fish-grey-catfish',
    sourceUrl: greyCatfishUrl,
    sizeTier: 'large',
  },
] as const

/** Stable texture keys for each species (mirrors fishData artId values). */
export const FishTextures = {
  goldfishOrange: 'fish-goldfish-orange',
  slenderBlueWhite: 'fish-slender-blue-white',
  greenishBrown: 'fish-greenish-brown',
  blueTang: 'fish-blue-tang',
  olivePike: 'fish-olive-pike',
  pinkRound: 'fish-pink-round',
  purpleChunky: 'fish-purple-chunky',
  blueTuna: 'fish-blue-tuna',
  greyCatfish: 'fish-grey-catfish',
} as const

export function findFishArtEntry(textureKey: string): FishArtEntry | undefined {
  return FISH_ART_CATALOG.find((entry) => entry.textureKey === textureKey)
}
