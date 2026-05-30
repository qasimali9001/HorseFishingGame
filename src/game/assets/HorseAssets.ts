import Phaser from 'phaser'
import bodyUrl from '../../assets/horse/horse_body.png'
import headUrl from '../../assets/horse/horse_head.png'
import rodDriftwoodUrl from '../../assets/horse/rod_basic_driftwood.png'
import lureUrl from '../../assets/horse/lure_basic.png'

/**
 * Single source of truth for the horse rig's texture keys + their bundled URLs.
 * Both the real PreloadScene and the isolated rig test scene load through
 * `loadHorseAssets`, so the rig looks identical wherever it is used.
 */
export const HorseTextures = {
  body: 'horse-body',
  head: 'horse-head',
  rod: 'rod-basic',
  lure: 'lure-basic',
} as const

const SOURCES: ReadonlyArray<readonly [string, string]> = [
  [HorseTextures.body, bodyUrl],
  [HorseTextures.head, headUrl],
  [HorseTextures.rod, rodDriftwoodUrl],
  [HorseTextures.lure, lureUrl],
]

/** Queues every horse-rig texture on the given scene's loader. */
export function loadHorseAssets(scene: Phaser.Scene): void {
  for (const [key, url] of SOURCES) {
    if (!scene.textures.exists(key)) {
      scene.load.image(key, url)
    }
  }
}
