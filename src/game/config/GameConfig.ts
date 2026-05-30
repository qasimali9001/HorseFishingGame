import Phaser from 'phaser'
import { WorldConfig } from './WorldConfig'
import { BootScene } from '../scenes/BootScene'
import { PreloadScene } from '../scenes/PreloadScene'
import { WorldScene } from '../scenes/WorldScene'
import { UIScene } from '../scenes/UIScene'
import { HorseRigTestScene } from '../scenes/HorseRigTestScene'

/** True when the page was opened with `?rig` -- runs the isolated rig harness. */
function isRigTestMode(): boolean {
  return (
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('rig')
  )
}

/** Phaser game configuration. Orchestration only -- no gameplay logic here. */
export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  // `?rig` boots ONLY the rig test scene, fully isolated from the game loop.
  const scene = isRigTestMode()
    ? [HorseRigTestScene]
    : [BootScene, PreloadScene, WorldScene, UIScene]

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
    scene,
  }
}
