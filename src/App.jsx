import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection'
import Webcam from 'react-webcam'
import { drawHand } from './utils/drawHand'
import { poseDetect } from './utils/poseDetect'

const FACING_MODE_USER = "user"
const FACING_MODE_ENVIRONMENT = "environment"

function App() {
  const [facingMode, setFacingMode] = useState(FACING_MODE_USER)
  const [loading, setLoading] = useState(true)
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 })
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const detectorRef = useRef(null)
  const containerRef = useRef(null)

  const runHandpose = async () => {
    await tf.ready()
    console.log("TensorFlow.js backend:", tf.getBackend())

    const model = handPoseDetection.SupportedModels.MediaPipeHands
    const detectorConfig = {
      runtime: 'tfjs',
      modelType: 'full'
    }
    const detector = await handPoseDetection.createDetector(model, detectorConfig);
    detectorRef.current = detector
    setLoading(false)

    console.log("model loaded")

    setInterval(() => {
      detect()
    }, 100)
  }

  const detect = async () => {
    const detector = detectorRef.current
    if (!detector) return

    // Cek apakah webcam ada
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video !== null
    ) {
      const video = webcamRef.current.video;

      // CHECK POINT: Pastikan video sudah siap DAN memiliki dimensi
      if (video.readyState === 4 && video.videoWidth > 0 && video.videoHeight > 0) {
        // Gunakan dimensi aktual dari video stream
        const actualVideoWidth = video.videoWidth;
        const actualVideoHeight = video.videoHeight;

        // Update state jika dimensi berubah
        if (actualVideoWidth !== videoDimensions.width || actualVideoHeight !== videoDimensions.height) {
          setVideoDimensions({ width: actualVideoWidth, height: actualVideoHeight })
        }

        // Set dimensi video element
        video.width = actualVideoWidth;
        video.height = actualVideoHeight;

        // Set dimensi canvas internal (untuk drawing)
        if (canvasRef.current) {
          canvasRef.current.width = actualVideoWidth;
          canvasRef.current.height = actualVideoHeight;
        }

        // Lakukan deteksi
        const hands = await detector.estimateHands(video);

        // Log untuk debugging
        if (hands.length > 0) {
          poseDetect(hands[0].keypoints)
        }

        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          const isMirrored = facingMode === FACING_MODE_USER;
          drawHand(hands, ctx, actualVideoWidth, isMirrored);
        }
      }
    }
  };

  useEffect(() => { runHandpose() }, [])

  const handleClick = useCallback(() => {
    setFacingMode(prev =>
      prev === FACING_MODE_USER ? FACING_MODE_ENVIRONMENT : FACING_MODE_USER)
  }, [])

  // Video constraints yang lebih fleksibel untuk mobile
  const videoConstraints = {
    facingMode: facingMode,
    // Tidak memaksa width/height agar camera bisa memilih resolusi terbaik
  }

  // Hitung ukuran tampilan yang responsif
  const getDisplaySize = () => {
    const maxWidth = Math.min(window.innerWidth - 20, 720);
    const aspectRatio = videoDimensions.height / videoDimensions.width;
    const displayWidth = maxWidth;
    const displayHeight = displayWidth * aspectRatio;
    return { displayWidth, displayHeight };
  }

  const { displayWidth, displayHeight } = getDisplaySize();

  return (
    <>
      <div>
        <h1>handpose with tensorflow js 🚀🚀</h1>
        {loading ? <p>loading model...</p> : <p>Model ready! ({videoDimensions.width}x{videoDimensions.height})</p>}
        <button onClick={handleClick}>
          {facingMode === FACING_MODE_USER ? "Switch to Back Camera" : "Switch to Front Camera"}
        </button>
      </div>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: displayWidth,
          height: displayHeight,
          margin: "0 auto",
        }}
      >
        <Webcam
          ref={webcamRef}
          audio={false}
          videoConstraints={videoConstraints}
          mirrored={facingMode === FACING_MODE_USER}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 9,
            pointerEvents: "none",
          }}
        />
      </div>
    </>
  )
}

export default App