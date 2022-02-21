import Phaser from 'phaser';

export default {
  type: Phaser.WEBGL,
  parent: 'game',
  scale: {
    width: 640,
    height: 480,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
