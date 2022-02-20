import Phaser from 'phaser';

export default {
  type: Phaser.WEBGL,
  parent: 'game',
  scale: {
    width: 800,
    height: 600,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
