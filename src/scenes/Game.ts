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


    this.photo = document.querySelector("#photo")

    this.videoLoaded = false
    this.detectorLoaded = false

    this.l1LastX = -1
    this.l1LastY = -1
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
    window.leftHand = this.leftHand
    this.leftHandPhysics = this.matter.add.gameObject(this.leftHand)
    this.leftHandPhysics.setIgnoreGravity(true)

    //this.rightHand = this.add.rectangle(400, 30, 100, 20, 0xffffff);
    //this.matter.add.gameObject(this.rightHand)

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
        this.leftHand.setSize(Math.abs(x1 - x2), Math.abs(y1 - y2))
        this.leftHandPhysics.setPosition(x1, y1)
        this.leftHandPhysics.setBody(Math.abs(x1 - x2), Math.abs(y1 - y2))

        const velocityX = Math.abs(x2 - this.l1LastX)
        const velocityY = Math.abs(y2 - this.l1LastY)

        if (this.l1LastX > -1) {
          this.leftHandPhysics.setVelocityX(velocityX)
        }
        this.l1LastX = x2
        if (this.l1LastY > -1) {
          this.leftHandPhysics.setVelocityY(velocityY)
          //this.l1Physics.setVelocityY(velocityY)
        }
        this.l1LastY = y2
      }
    }
  }
}
