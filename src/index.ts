import Phaser from 'phaser';
import config from './config';
import GameScene from './scenes/Game';

new Phaser.Game(
  Object.assign(config, {
    scene: [GameScene]
  })
);

window.onresize = () => {
  // ensure these things are the same size
  const canvas = document.querySelector('canvas')
  const video = document.querySelector('video')
  console.log(canvas.style)
  video.style.width = canvas.style.width
  video.style.height = canvas.style.height
}
