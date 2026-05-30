import { WorldConfig } from './WorldConfig'

/** Visual-only constants for the ultra-simple desert/oasis world art. */
export const WorldArtConfig = {
  depths: {
    sky: -60,
    distantProps: -55,
    dunes: -50,
    underwaterBase: -45,
    underwaterDetails: -25,
    surfaceBack: 1,
    surfaceWater: 3,
    surfaceFront: 11,
  },

  palette: {
    outline: 0x1f2a2d,
    skyTop: 0x86daf6,
    skyBottom: 0xcdf6ff,
    cloud: 0xffffff,
    cloudShade: 0xeaf7fb,
    sand: 0xf8d98a,
    sandShade: 0xedb96d,
    duneFar: 0xf0bc79,
    duneNear: 0xf5cc84,
    cactus: 0x75b957,
    cactusLight: 0x9adf6f,
    cactusDark: 0x4f8f45,
    cactusFlower: 0xff7ab6,
    palmTrunk: 0xa66f44,
    palmLeaf: 0x5eb65e,
    rope: 0x8b5d31,
    waterTop: 0x6dd7e8,
    waterMid: 0x1e8fba,
    waterDeep: 0x0b355f,
    waterDark: 0x061d3a,
    waterRipple: 0xbff7ff,
    foam: 0xf4ffff,
    rock: 0x927b68,
    rockDark: 0x5f524b,
    bubble: 0xd7fbff,
  },

  background: {
    clouds: [
      { x: 270, y: -510, scale: 1.25 },
      { x: 780, y: -345, scale: 0.8 },
      { x: 1460, y: -505, scale: 1.35 },
      { x: 2120, y: -350, scale: 0.65 },
    ],
    birds: [
      { x: 560, y: -455, scale: 1.0 },
      { x: 1320, y: -395, scale: 0.75 },
      { x: 1980, y: -500, scale: 0.9 },
    ],
    dunes: [
      { x: 110, y: -10, width: 560, height: 130, color: 0xf1bd78 },
      { x: 620, y: 8, width: 460, height: 95, color: 0xf7cf8c },
      { x: 1520, y: 0, width: 520, height: 120, color: 0xf2bf7b },
      { x: 2140, y: -16, width: 620, height: 145, color: 0xf8d08c },
    ],
    cacti: [
      { x: 205, y: -44, scale: 0.9 },
      { x: 1760, y: -50, scale: 1.0 },
      { x: 2210, y: -36, scale: 0.72 },
    ],
    palms: [
      { x: 95, y: -42, scale: 0.85 },
      { x: 1510, y: -26, scale: 0.42 },
      { x: 2075, y: -44, scale: 0.7 },
    ],
  },

  surface: {
    platform: {
      x: WorldConfig.surfaceAnchorX - 20,
      y: 12,
      logWidth: 330,
      logHeight: 34,
      logGap: 24,
      ropeOffsetX: 104,
      cactusSpineSpacing: 34,
    },
    waterline: {
      foamStep: 145,
      rippleStep: 150,
      rippleWidth: 70,
      rippleHeight: 8,
      waveStep: 190,
      waveWidth: 90,
      waveAmplitude: 7,
    },
    props: {
      sign: { x: WorldConfig.surfaceAnchorX - 235, y: -24, scale: 1 },
      bucket: { x: WorldConfig.surfaceAnchorX + 150, y: -8, scale: 1 },
    },
  },

  underwater: {
    bands: [
      { y: 0, height: 720, color: 0x5dcfe1 },
      { y: 720, height: 880, color: 0x238fb9 },
      { y: 1600, height: 1050, color: 0x0e5f92 },
      { y: 2650, height: 1350, color: 0x083764 },
    ],
    lightRays: [
      { x: 260, y: 0, width: 140, height: 1250, alpha: 0.16 },
      { x: 940, y: 0, width: 190, height: 1450, alpha: 0.11 },
      { x: 1700, y: 0, width: 150, height: 1200, alpha: 0.12 },
    ],
    rocks: [
      { x: 180, y: 420, scale: 1.0 },
      { x: 760, y: 970, scale: 0.85 },
      { x: 1420, y: 1720, scale: 1.15 },
      { x: 2150, y: 2600, scale: 1.3 },
      { x: 420, y: 3450, scale: 1.1 },
    ],
    cactusWeeds: [
      { x: 360, y: 650, scale: 0.75 },
      { x: 1180, y: 1350, scale: 1.0 },
      { x: 1980, y: 2100, scale: 0.9 },
      { x: 910, y: 3150, scale: 1.15 },
    ],
    bubbles: [
      { x: 560, y: 260, scale: 0.8 },
      { x: 1680, y: 640, scale: 1.0 },
      { x: 310, y: 1480, scale: 0.7 },
      { x: 2070, y: 1880, scale: 0.9 },
      { x: 1220, y: 3020, scale: 0.85 },
    ],
  },
} as const
