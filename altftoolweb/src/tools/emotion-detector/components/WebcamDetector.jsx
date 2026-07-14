"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getFaceApi } from "../services/faceApiClient";

export default function WebcamDetector({ onResult, onCameraDenied, setStartCamera }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [running, setRunning] = useState(false);
  const [cameraDenied, setCameraDenied] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);

  const loadModels = useCallback(async () => {
    try {
      const MODEL_URL = "/models";
      const faceapi = await getFaceApi();

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
      ]);
      setLoadingModels(false);
    } catch (e) {
      console.error("Failed to load models inside WebcamDetector", e);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) return; // Already running

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      });
      streamRef.current = stream;

      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = () => {
        if (!videoRef.current) return;
        videoRef.current.play();

        if (canvasRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
        }

        setRunning(true);
        setCameraDenied(false);
      };
    } catch (err) {
      console.error("Camera access denied or unavailable:", err);
      setCameraDenied(true);
      if (onCameraDenied) onCameraDenied();
    }
  }, [onCameraDenied]);

  useEffect(() => {
    if (typeof setStartCamera === "function") {
      setStartCamera(() => startCamera);
    }
  }, [setStartCamera, startCamera]);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setRunning(false);
  }, []);

  const detect = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !running) return;
    if (video.readyState !== 4 || video.videoWidth === 0) return;

    try {
      const faceapi = await getFaceApi();

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceExpressions();

      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);

      const resized = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const results = resized.map((det, idx) => {
        const { box } = det.detection;
        
        // Draw Bounding Box (Teal-500 `#14B8A6`)
        ctx.strokeStyle = "#14B8A6";
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        // Find dominant emotion
        const expressions = det.expressions;
        const emotionEntries = Object.entries(expressions);
        const topEmotion = emotionEntries.sort((a, b) => b[1] - a[1])[0];
        const dominant = topEmotion ? topEmotion[0] : "neutral";
        const confidence = topEmotion ? topEmotion[1] : 0;

        // Draw emotion tag box (Teal-600 `#0D9488`)
        const labelText = `${dominant.toUpperCase()} (${Math.round(confidence * 100)}%)`;
        ctx.font = "bold 12px sans-serif";
        const textWidth = ctx.measureText(labelText).width;
        const labelHeight = 20;
        
        ctx.fillStyle = "#0D9488";
        const labelY = box.y - labelHeight - 5 > 0 ? box.y - labelHeight - 5 : box.y + 5;
        const labelX = box.x;
        
        ctx.beginPath();
        ctx.roundRect(labelX, labelY, textWidth + 12, labelHeight, 4);
        ctx.fill();

        // Label text (White)
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "middle";
        ctx.fillText(labelText, labelX + 6, labelY + labelHeight / 2);

        // Draw landmarks (Cyan-400 `#22D3EE`)
        const landmarks = det.landmarks;
        if (landmarks) {
          ctx.fillStyle = "#22D3EE";
          const drawPoints = (points) => {
            if (!points) return;
            points.forEach((pt) => {
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
              ctx.fill();
            });
          };

          drawPoints(landmarks.getLeftEye());
          drawPoints(landmarks.getRightEye());
          drawPoints(landmarks.getNose());
          drawPoints(landmarks.getMouth());
          drawPoints(landmarks.getLeftEyeBrow());
          drawPoints(landmarks.getRightEyeBrow());
        }

        // Return structured face item (without raw face-api complex classes to keep state lightweight)
        return {
          id: idx,
          emotions: expressions,
          dominantEmotion: dominant,
          dominantConfidence: confidence,
          box,
          faceQuality: {
            lighting: "Good",
            visibility: "Excellent",
            blur: "Low",
            score: 90
          }
        };
      });

      if (onResult && results.length > 0) {
        onResult(results);
      }
    } catch (e) {
      console.error("Error during real-time face detection:", e);
    }
  }, [onResult, running]);

  useEffect(() => {
    async function init() {
      await loadModels();
      await startCamera();
    }
    init();
    return () => {
      stopCamera();
    };
  }, [loadModels, startCamera, stopCamera]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => detect(), 250);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [detect, running]);

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-xl border border-border">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover scale-x-[-1]"
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full scale-x-[-1]"
      />

      {loadingModels && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white z-10">
          <div className="alt-ui-spinner alt-ui-spinner--md mb-4 border-t-primary" />
          <span className="text-sm font-medium tracking-wide">Loading AI Models...</span>
        </div>
      )}

      {cameraDenied && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white p-4 text-center z-10">
          <span className="text-xl mb-2">📷</span>
          <span className="font-semibold mb-1">Camera Access Blocked</span>
          <span className="text-xs text-muted-foreground max-w-xs">
            Please check your browser permissions to allow access to your camera for real-time expression detection.
          </span>
        </div>
      )}
    </div>
  );
}
