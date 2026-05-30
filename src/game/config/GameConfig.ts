import Phaser from 'phaser'
import { WorldConfig } from './WorldConfig'
import { BootScene } from '../scenes/BootScene'
import { PreloadScene } from '../scenes/PreloadScene'
import { WorldScene } from '../scenes/WorldScene'
import { UIScene } from '../scenes/UIScene'

/** Phaser game configuration. Orchestration only -- no gameplay logic here. */
export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: WorldConfig.viewWidth,
    height: WorldConfig.viewHeight,
    backgroundColor: '#0b1020',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      antialias: true,
      pixelArt: false,
    },
    scene: [BootScene, PreloadScene, WorldScene, UIScene],
  }
}
