import Phaser from 'phaser'

export const FishTextures = {
  pebbleMinnow: 'fish-pebble-minnow',
  sunPerch: 'fish-sun-perch',
  kelpDarter: 'fish-kelp-darter',
  deepGulper: 'fish-deep-gulper',
  lanternDrifter: 'fish-lantern-drifter',
  sandSkipper: 'fish-sand-skipper',
  duneSnapper: 'fish-dune-snapper',
  canyonGrouper: 'fish-canyon-grouper',
} as const

interface FishArtRecipe {
  textureKey: string
  bodyColor: number
  stripeColor: number
  eyeColor: number
}

const FISH_ART_RECIPES: ReadonlyArray<FishArtRecipe> = [
  {
    textureKey: FishTextures.pebbleMinnow,
    bodyColor: 0x9ad1e6,
    stripeColor: 0x6eb8d4,
    eyeColor: 0x101010,
  },
  {
    textureKey: FishTextures.sunPerch,
    bodyColor: 0xf4a259,
    stripeColor: 0xd98134,
    eyeColor: 0x20110b,
  },
  {
    textureKey: FishTextures.kelpDarter,
    bodyColor: 0x6fcf97,
    stripeColor: 0x3ca568,
    eyeColor: 0x16311e,
  },
  {
    textureKey: FishTextures.deepGulper,
    bodyColor: 0x8a7bd8,
    stripeColor: 0x6555b7,
    eyeColor: 0x110f22,
  },
  {
    textureKey: FishTextures.lanternDrifter,
    bodyColor: 0xffd166,
    stripeColor: 0xf0b733,
    eyeColor: 0x2a1b08,
  },
  {
    textureKey: FishTextures.sandSkipper,
    bodyColor: 0xf5c57a,
    stripeColor: 0xe2ab56,
    eyeColor: 0x20150c,
  },
  {
    textureKey: FishTextures.duneSnapper,
    bodyColor: 0xf08f6b,
    stripeColor: 0xd26d46,
    eyeColor: 0x2a120d,
  },
  {
    textureKey: FishTextures.canyonGrouper,
    bodyColor: 0x8f9fcf,
    stripeColor: 0x6478ae,
    eyeColor: 0x12182a,
  },
]

/**
 * Creates lightweight fish textures once. Keeping fish art centralized here
 * makes swapping one species' look a one-file change.
 */
export function ensureFishAssets(scene: Phaser.Scene): void {
  for (const recipe of FISH_ART_RECIPES) {
    if (scene.textures.exists(recipe.textureKey)) {
      continue
    }
    buildFishTexture(scene, recipe)
  }
}

function buildFishTexture(scene: Phaser.Scene, recipe: FishArtRecipe): void {
  const width = 96
  const height = 64
  const g = scene.add.graphics().setVisible(false)

  const bodyCx = 52
  const bodyCy = 32
  const bodyW = 52
  const bodyH = 30
  const outline = 0x14313a
  const tailRootX = 31
  const tailTipX = 11
  const tailTopY = 19
  const tailBottomY = 45
  const tailMidY = 32

  g.fillStyle(outline, 1)
  g.fillEllipse(bodyCx, bodyCy, bodyW + 6, bodyH + 6)
  drawForkedTail(g, {
    rootX: tailRootX - 2,
    tipX: tailTipX - 2,
    topY: tailTopY - 2,
    midY: tailMidY,
    bottomY: tailBottomY + 2,
    notchInset: 5,
  })

  g.fillStyle(recipe.bodyColor, 1)
  g.fillEllipse(bodyCx, bodyCy, bodyW, bodyH)
  drawForkedTail(g, {
    rootX: tailRootX,
    tipX: tailTipX,
    topY: tailTopY,
    midY: tailMidY,
    bottomY: tailBottomY,
    notchInset: 6,
  })

  g.fillStyle(recipe.stripeColor, 0.95)
  g.fillEllipse(52, 31, 30, 8)

  g.fillStyle(lighten(recipe.bodyColor, 28), 0.45)
  g.fillEllipse(58, 26, 22, 7)

  g.fillStyle(darken(recipe.bodyColor, 24), 0.85)
  g.fillTriangle(46, 29, 56, 22, 56, 29)

  g.fillStyle(0xffffff, 1)
  g.fillCircle(67, 26, 4.2)
  g.fillStyle(recipe.eyeColor, 1)
  g.fillCircle(68, 26, 2)

  g.generateTexture(recipe.textureKey, width, height)
  g.destroy()
}

interface ForkedTailGeometry {
  rootX: number
  tipX: number
  topY: number
  midY: number
  bottomY: number
  notchInset: number
}

function drawForkedTail(g: Phaser.GameObjects.Graphics, geo: ForkedTailGeometry): void {
  const upperLobe = [
    new Phaser.Math.Vector2(geo.tipX, geo.midY),
    new Phaser.Math.Vector2(geo.rootX, geo.topY),
    new Phaser.Math.Vector2(geo.rootX, geo.midY),
  ]
  const lowerLobe = [
    new Phaser.Math.Vector2(geo.tipX, geo.midY),
    new Phaser.Math.Vector2(geo.rootX, geo.midY),
    new Phaser.Math.Vector2(geo.rootX, geo.bottomY),
  ]
  g.fillPoints(upperLobe, true)
  g.fillPoints(lowerLobe, true)

  // Carve a tiny center notch so the tail reads as two fins.
  g.fillStyle(0x000000, 0.12)
  g.fillTriangle(
    geo.tipX + geo.notchInset,
    geo.midY,
    geo.rootX - 1,
    geo.midY - 2,
    geo.rootX - 1,
    geo.midY + 2,
  )
}

function lighten(color: number, amount: number): number {
  const c = Phaser.Display.Color.IntegerToColor(color)
  return Phaser.Display.Color.GetColor(
    Math.min(255, c.red + amount),
    Math.min(255, c.green + amount),
    Math.min(255, c.blue + amount),
  )
}

function darken(color: number, amount: number): number {
  const c = Phaser.Display.Color.IntegerToColor(color)
  return Phaser.Display.Color.GetColor(
    Math.max(0, c.red - amount),
    Math.max(0, c.green - amount),
    Math.max(0, c.blue - amount),
  )
}
