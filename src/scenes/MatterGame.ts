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
  leftHandPhysics: any
  rightHandPhysics: any
  detector: any
  videoLoaded: boolean
  detectorLoaded: boolean
  photo: any
  l1: Phaser.Geom.Line
  l2: Phaser.Geom.Line
  l1Physics: any
  l2Physics: any
  l1LastX: number
  l1LastY: number
  text: any
  lastTime: number
  velocityX: number
  velocityY: number

  constructor() {
    super({
      key: "balls",
      physics: {
        default: 'matter',
        matter: {
          enableSleeping: false,
          gravity: {
            y: 0.2,
          },
          debug: {
            showBody: false,
            showStaticBody: false
          }
        }
      }
    });


    this.photo = document.querySelector("#photo")

    this.videoLoaded = false
    this.detectorLoaded = false

    this.l1LastX = -1
    this.l1LastY = -1
    this.lastTime = 0

    this.velocityX = 5
    this.velocityY = 5
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
  }

  create() {
    this.graphics = this.add.graphics()
    this.matter.world.setBounds(0, 0, 640, 480, 32, true, true, false, true)

    for (var i = 0; i < 50; i++) {
      const ball = this.matter.add.image(Phaser.Math.Between(100, 700), Phaser.Math.Between(-600, 0), 'ball');
      ball.setCircle()
      ball.setFriction(1.005);
      ball.setBounce(1);
    }

    this.leftHand = this.add.rectangle(200, 30, 100, 20, 0x00ff00);
    this.leftHandPhysics = this.matter.add.gameObject(this.leftHand)
    this.leftHandPhysics.setIgnoreGravity(true)
    this.leftHandPhysics.setFriction(0)
    this.leftHandPhysics.setFrictionAir(0)
    this.leftHandPhysics.setVelocity(10, 10)
    this.leftHandPhysics.setAngularVelocity(0)


    //this.rightHand = this.add.rectangle(400, 30, 100, 20, 0xffffff);
    //this.matter.add.gameObject(this.rightHand)
    //
    this.text = this.add.text(0, 0, '', { font: '16px Courier', fill: '#00ff00' });

    this.matter.add.mouseSpring();

    this.l1 = this.add.line(0, 0, 0, 0, 0, 0, 0xff0000)
  }

  async update() {
    if (this.videoLoaded && this.detectorLoaded) {
      const hands = await this.detector.estimateHands(this.video);
      if (hands.length > 0) {
        const x1 = 640 - hands[0].keypoints[0].x
        const y1 = hands[0].keypoints[0].y
        const x2 = 640 - hands[0].keypoints[12].x
        const y2 = hands[0].keypoints[12].y

        this.l1.setTo(x1, y1, x2, y2)

        this.leftHand.setPosition(x1, y1)
        this.leftHand.setAngularVelocity(0)
        //this.leftHand.setSize(Math.abs(x1 - x2), Math.abs(y1 - y2))
        this.leftHandPhysics.setPosition(x1, y1)
        this.leftHandPhysics.setAngularVelocity(0)
        //this.leftHandPhysics.setBody(Math.abs(x1 - x2), Math.abs(y1 - y2))

        const diffX = Math.abs(x2 - this.l1LastX)
        const diffY = Math.abs(y2 - this.l1LastY)
        //this.text.setText(`Velocity: (${Math.round(velocityX)}, ${Math.round(velocityY)})`)
        //

        //this.velocityX = diffX > this.velocityX ? this.velocityX + 1 : this.velocityX - 1
        //this.velocityY = diffX > this.velocityY ? this.velocityY + 1 : this.velocityY - 1

        //this.leftHandPhysics.setVelocityX(this.velocityX)
        //this.leftHandPhysics.setVelocityY(this.velocityY)

        // not sure if I need this any more
        this.l1LastX = x2
        this.l1LastY = y2

        this.text.setText([
          `FPS: ${Math.round(1000 / (Date.now() - this.lastTime))}`,
          `Pos: (${Math.round(x1)}, ${Math.round(y1)})`,
          `Vel: (${Math.round(this.velocityX)}, ${Math.round(this.velocityY)})`
        ])
        this.lastTime = Date.now()
      }
    }
  }
}
