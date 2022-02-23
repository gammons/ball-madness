import Phaser from 'phaser';
import config from './config';
import GameScene from './scenes/MatterGame';

new Phaser.Game(
  Object.assign(config, {
    scene: [GameScene]
  })
);
