import Phaser from 'phaser'
import { createGameConfig } from './game/config/GameConfig'

const parent = document.getElementById('game-root')
if (!parent) {
  throw new Error('Missing #game-root element')
}

new Phaser.Game(createGameConfig(parent))
