import Phaser from 'phaser'
import { FISH_ART_CATALOG } from './FishArtCatalog'

export { FishTextures, FISH_ART_CATALOG, findFishArtEntry } from './FishArtCatalog'
export type { FishArtEntry } from './FishArtCatalog'

/** Queues every fish texture on the given scene's loader. */
export function loadFishAssets(scene: Phaser.Scene): void {
  for (const entry of FISH_ART_CATALOG) {
    if (!scene.textures.exists(entry.textureKey)) {
      scene.load.image(entry.textureKey, entry.sourceUrl)
    }
  }
}

/** @deprecated Use loadFishAssets in preload(); kept for callers that already loaded. */
export function ensureFishAssets(scene: Phaser.Scene): void {
  loadFishAssets(scene)
}
