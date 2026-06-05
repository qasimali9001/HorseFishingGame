import Phaser from 'phaser'
import { FishConfig } from '../config/FishConfig'
import type { FishDefinition } from '../types/FishTypes'

/** Width/height pair for a fish sprite in world units. */
export interface FishDisplaySize {
  width: number
  height: number
}

/**
 * Shared fish body sprite factory. Keeps sizing + fallback tint logic in one
 * place so Fish (runtime) and SpawnPointHandles (level editor) stay in sync.
 */
export class FishBodySprite {
  static create(scene: Phaser.Scene, def: FishDefinition): Phaser.GameObjects.Image {
    const artKey = scene.textures.exists(def.artId) ? def.artId : '__WHITE'
    const body = scene.add.image(0, 0, artKey)
    const size = FishBodySprite.displaySizeFor(scene, def)
    body.setDisplaySize(size.width, size.height)
    if (artKey === '__WHITE') {
      body.setTintFill(def.color)
    } else {
      body.clearTint()
    }
    return body
  }

  static displaySizeFor(scene: Phaser.Scene, def: FishDefinition): FishDisplaySize {
    const widthScale = FishConfig.displayWidthScaleByTier[def.sizeTier]
    const targetWidth = def.radius * widthScale

    if (scene.textures.exists(def.artId)) {
      const frame = scene.textures.get(def.artId).get()
      const aspect = frame.height / frame.width
      return { width: targetWidth, height: targetWidth * aspect }
    }

    const heightScale = FishConfig.displayHeightScaleByTier[def.sizeTier]
    return { width: targetWidth, height: def.radius * heightScale }
  }
}
