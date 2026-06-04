import Phaser from 'phaser'
import { WorldConfig } from './WorldConfig'
import { BootScene } from '../scenes/BootScene'
import { PreloadScene } from '../scenes/PreloadScene'
import { TitleScene } from '../scenes/TitleScene'
import { WorldScene } from '../scenes/WorldScene'
import { UIScene } from '../scenes/UIScene'
import { HorseRigTestScene } from '../scenes/HorseRigTestScene'
import { LevelEditorScene } from '../scenes/LevelEditorScene'

/** True when the page was opened with `?<flag>` in the query string. */
function hasUrlFlag(flag: string): boolean {
  return typeof window !== 'undefined' && new URLSearchParams(window.location.search).has(flag)
}

/** Phaser game configuration. Orchestration only -- no gameplay logic here. */
export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  // Dev harnesses each boot ONLY their own scene, isolated from the game loop:
  //   ?rig    -> horse rig tuner
  //   ?editor -> spawn-point level editor
  const scene = hasUrlFlag('rig')
    ? [HorseRigTestScene]
    : hasUrlFlag('editor')
      ? [LevelEditorScene]
      : [BootScene, PreloadScene, TitleScene, WorldScene, UIScene]

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
