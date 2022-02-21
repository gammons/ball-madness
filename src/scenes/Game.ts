// see below as a reference:
// https://docs.idew.org/video-game/project-references/phaser-coding/physics-and-collisions
import Phaser from 'phaser'

import * as handPoseDetection from '@tensorflow-models/hand-pose-detection'
import * as mpHands from '@mediapipe/hands'

export default class Demo extends Phaser.Scene {
  balls: any[]
  graphics: any
  leftHand: any
  rightHand: any
  ctx: any
  detector: any
  videoLoaded: boolean
  detectorLoaded: boolean
  photo: any
  canvas: any

  constructor() {
    super({
      key: "balls",
      physics: {
        default: 'matter',
        matter: {
          enableSleeping: true,
          gravity: {
            y: 0.2,
          },
          debug: {
            showBody: true,
            showStaticBody: true
          }
        }
      }
    });

    this.canvas = document.querySelector("canvas#webcam-image")
    this.canvas.width = 640
    this.canvas.height = 480

    this.ctx = this.canvas.getContext('2d')
    this.ctx.translate(640, 0)
    this.ctx.scale(-1, 1)

    this.photo = document.querySelector("#photo")

    this.videoLoaded = false
    this.detectorLoaded = false
  }

  async preload() {
    this.load.image('ball', 'assets/aqua_ball.png')
    this.load.image('hand', 'assets/platform.png')

    const videoConfig = {
      audio: false,
      video: {
        facingMode: 'user',
        width: {
          ideal: 640
        },
        height: {
          ideal: 480
        },
        frameRate: {
          ideal: 60
        }
      },
    }

    const stream = await navigator.mediaDevices.getUserMedia(videoConfig);
    //const canvas = document.getElementById('output')
    //this.ctx = canvas.getContext('2d')

    this.video = document.querySelector('video')
    this.video.srcObject = stream
    this.video.play()
    this.videoLoaded = true

    const model = handPoseDetection.SupportedModels.MediaPipeHands;
    const detectorConfig = {
      runtime: 'mediapipe',
      modelType: 'full',
      solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${mpHands.VERSION}`
    }
    this.detector = await handPoseDetection.createDetector(model, detectorConfig);
    this.detectorLoaded = true


    //canvas.width = 800
    //canvas.height = 600
    //this.ctx.translate(800, 0)
    //this.ctx.scale(-1, 1)
  }

  create() {
    this.graphics = this.add.graphics()
    this.matter.world.setBounds(0, 0, 800, 600, 32, true, true, false, true)

    for (var i = 0; i < 50; i++) {
      const ball = this.matter.add.image(Phaser.Math.Between(100, 700), Phaser.Math.Between(-600, 0), 'ball');
      ball.setCircle()
      ball.setFriction(1.005);
      ball.setBounce(1);
    }

    this.leftHand = this.add.rectangle(200, 30, 100, 20, 0xffffff);
    this.matter.add.gameObject(this.leftHand)

    this.rightHand = this.add.rectangle(400, 30, 100, 20, 0xffffff);
    this.matter.add.gameObject(this.rightHand)

    this.matter.add.mouseSpring();

    // tweens do not mess with physics.
    //var timeline = this.tweens.add(
    //  {
    //    targets: this.leftHand,
    //    loop: 4,
    //    x: 600,
    //    ease: 'Power1',
    //    duration: 3000,
    //    delay: 1000,
    //    repeat: -1,
    //    hold: 1000,
    //    onUpdate: (tween, target) => {
    //      console.log("target.value = ", target)
    //      // const y = target.startY + target.value
    //      //const dy = y - target.y
    //      //target.y = y
    //      target.setVelocityX(3)
    //    }
    //  }
    //)
    //timeline.play()
  }

  async update() {
    if (this.videoLoaded && this.detectorLoaded) {
      //this.ctx.drawImage(this.video, 0, 0, 640, 480)
      //var data = this.canvas.toDataURL('image/png');
      const hands = await this.detector.estimateHands(this.video);
      if (hands.length > 0) {
        console.log(hands)
      }

    }
    //console.log(this.leftHand.body.position)
    //if (this.leftHand.y > 550 && this.leftHand.x < 600) {
    //  this.leftHand.setPosition(this.leftHand.x + 1, this.leftHand.y)
    //}
  }
  //  this.graphics.clear();
  //  this.graphics.fillStyle(0x3916ff, 1);

  //  for (let b in this.balls) {
  //    var ball = this.balls[b];
  //    ball.x += ball.v * Math.cos(ball.a);
  //    ball.y += ball.v * Math.sin(ball.a);
  //    ball.a += 0.03;

  //    this.graphics.fillCircle(ball.x, ball.y, ball.a);
  //  }
  //}
}
