import Phaser from 'phaser'
import rodBranchIconUrl from '../../assets/shop/icons/rod_branch.png'
import rodWoodenIconUrl from '../../assets/shop/icons/rod_wooden.png'
import rodCarrotIconUrl from '../../assets/shop/icons/rod_carrot.png'
import lureBasicIconUrl from '../../assets/shop/icons/lure_basic.png'
import lure10kgIconUrl from '../../assets/shop/icons/lure_10kg_weight.png'
import horseCoinIconUrl from '../../assets/shop/icons/invest_horse_coin.png'

/** Phaser texture keys for square shop-row icons (separate from gameplay art). */
export const ShopIconTextures = {
  rodBranch: 'shop-icon-rod-branch',
  rodWooden: 'shop-icon-rod-wooden',
  rodCarrot: 'shop-icon-rod-carrot',
  lureBasic: 'shop-icon-lure-basic',
  lure10kg: 'shop-icon-lure-10kg',
  horseCoin: 'shop-icon-invest-horse-coin',
} as const

const SOURCES: ReadonlyArray<readonly [string, string]> = [
  [ShopIconTextures.rodBranch, rodBranchIconUrl],
  [ShopIconTextures.rodWooden, rodWoodenIconUrl],
  [ShopIconTextures.rodCarrot, rodCarrotIconUrl],
  [ShopIconTextures.lureBasic, lureBasicIconUrl],
  [ShopIconTextures.lure10kg, lure10kgIconUrl],
  [ShopIconTextures.horseCoin, horseCoinIconUrl],
]

/** Queues dedicated shop icon textures on the given scene's loader. */
export function loadShopIconAssets(scene: Phaser.Scene): void {
  for (const [key, url] of SOURCES) {
    if (!scene.textures.exists(key)) {
      scene.load.image(key, url)
    }
  }
}
