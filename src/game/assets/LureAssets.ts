import Phaser from 'phaser'
import basicLureUrl from '../../assets/horse/lure_basic.png'
import weight10kgUrl from '../../assets/lures/lure_10kg_weight.png'

export const LureTextures = {
  basic: 'lure-basic',
  weight10kg: 'lure-10kg-weight',
} as const

const SOURCES: ReadonlyArray<readonly [string, string]> = [
  [LureTextures.basic, basicLureUrl],
  [LureTextures.weight10kg, weight10kgUrl],
]

/** Queues lure shop + gameplay textures on the given scene's loader. */
export function loadLureAssets(scene: Phaser.Scene): void {
  for (const [key, url] of SOURCES) {
    if (!scene.textures.exists(key)) {
      scene.load.image(key, url)
    }
  }
}
