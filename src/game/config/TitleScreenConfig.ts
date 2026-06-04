import { CameraConfig } from './CameraConfig'
import { WorldConfig } from './WorldConfig'

const surfaceCameraCenterY =
  WorldConfig.waterlineY +
  WorldConfig.viewHeight * (0.5 - CameraConfig.restWaterlineScreenRatio) +
  CameraConfig.restOffsetYWorld

/** Layout/timing for the first-run title scene. */
export const TitleScreenConfig = {
  camera: {
    startCenterX: WorldConfig.viewWidth / 2,
    startCenterY: -820,
    surfaceCenterX: WorldConfig.viewWidth / 2,
    surfaceCenterY: surfaceCameraCenterY,
    panDurationMs: 1700,
  },

  sky: {
    topY: -1260,
    bottomY: WorldConfig.waterlineY - WorldConfig.skyHeight,
  },

  board: {
    x: WorldConfig.viewWidth / 2,
    y: -820,
    width: 860,
    height: 484,
  },

  text: {
    prompt: 'Click or press Space to play',
  },
} as const
