import Phaser from 'phaser'
import branchRodUrl from '../../assets/horse/rod_basic_driftwood.png'
import woodenRodUrl from '../../assets/horse/rod_wooden.png'
import carrotRodUrl from '../../assets/horse/rod_carrot.png'

/** Texture keys for equippable fishing rods (butt left, tip right). */
export const RodTextures = {
  branch: 'rod-branch',
  wooden: 'rod-wooden',
  carrot: 'rod-carrot',
} as const

const SOURCES: ReadonlyArray<readonly [string, string]> = [
  [RodTextures.branch, branchRodUrl],
  [RodTextures.wooden, woodenRodUrl],
  [RodTextures.carrot, carrotRodUrl],
]

/** Queues every rod texture on the given scene's loader. */
export function loadRodAssets(scene: Phaser.Scene): void {
  for (const [key, url] of SOURCES) {
    if (!scene.textures.exists(key)) {
      scene.load.image(key, url)
    }
  }
}
