import Phaser from 'phaser';

export default class Demo extends Phaser.Scene {
  balls: any[]
  graphics: any

  constructor() {
    super('GameScene');

    this.balls = []
  }

  create() {
    this.graphics = this.add.graphics()

    for (var i = 0; i < 2000; i++) {
      this.balls.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        v: 1,
        a: Math.random() * 2 * Math.PI,
      });
    }
  }

  update() {
    this.graphics.clear();
    this.graphics.fillStyle(0x3916ff, 1);

    for (let b in this.balls) {
      var ball = this.balls[b];
      ball.x += ball.v * Math.cos(ball.a);
      ball.y += ball.v * Math.sin(ball.a);
      ball.a += 0.03;

      this.graphics.fillCircle(ball.x, ball.y, ball.a);
    }
  }
}
