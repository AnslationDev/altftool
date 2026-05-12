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

  const loadModels = useCallback(async () => {
    const MODEL_URL = "/models";
    const faceapi = await getFaceApi();

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    ]);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
      console.error("Camera access denied:", err);
      setCameraDenied(true);
      if (onCameraDenied) onCameraDenied();
    }
  }, [onCameraDenied]);

  useEffect(() => {
    if (typeof setStartCamera === "function") {
      setStartCamera(() => startCamera); // FIX: ensure stable reference
    }
  }, [setStartCamera, startCamera]);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setRunning(false);
  }, []);

  function calculateFaceShape(jawPoints) {
    if (!jawPoints || jawPoints.length < 17) return "unknown";

    const left = jawPoints[0];
    const right = jawPoints[16];
    const chin = jawPoints[8];

    const width = Math.abs(right.x - left.x);
    const height = Math.abs(chin.y - ((left.y + right.y) / 2));

    const ratio = height / width;

    if (ratio > 1.45) return "oval";
    if (ratio > 1.25) return "round";
    if (ratio > 1.05) return "square";

    return "heart";
  }

  const detect = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    if (video.readyState !== 4 || video.videoWidth === 0) return;

    const faceapi = await getFaceApi();

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    const resized = faceapi.resizeResults(detections, displaySize);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const results = resized.map((det) => {
      const box = det.detection.box;
      ctx.strokeStyle = "#6366F1";
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      const dominantEmotion = Object.entries(det.expressions).sort((a, b) => b[1] - a[1])[0][0];

      const jawPoints = det.landmarks.getJawOutline();

      const faceShape = calculateFaceShape(jawPoints);

      const estimatedAge = Math.round(det.age);
      const minAge = estimatedAge - 2;
      const maxAge = estimatedAge + 2;

      const text = `${det.gender} ${minAge}-${maxAge} (${dominantEmotion})`;

      ctx.fillStyle = "#6366F1";
      ctx.font = "16px sans-serif";
      ctx.fillText(text, box.x, box.y - 10);

      const landmarks = det.landmarks;
      if (landmarks) {
        const drawPoint = (pt) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = "#FF5733";
          ctx.fill();
        };

        landmarks.getLeftEye().forEach(drawPoint);
        landmarks.getRightEye().forEach(drawPoint);
        landmarks.getNose().forEach(drawPoint);
        landmarks.getMouth().forEach(drawPoint);
        landmarks.getJawOutline().forEach(drawPoint);
      }

      return {
        ageRange: {
          min: estimatedAge - 2,
          max: estimatedAge + 2
        },
        gender: det.gender,
        genderConfidence: det.genderProbability,
        dominantEmotion,
        faceShape
      };
    });

    if (onResult) onResult(results);
  }, [onResult]);

  useEffect(() => {
    async function init() {
      try {
        await loadModels();
        await startCamera();
      } catch (err) {
        console.error("Init failed:", err);
        setCameraDenied(true);
        if (onCameraDenied) onCameraDenied();
      }
    }
    init();
  }, [loadModels, onCameraDenied, startCamera]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => detect(), 300);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [detect, running]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="relative w-full ">
      <>
        <video ref={videoRef} autoPlay muted className="rounded-xl w-full h-full object-cover" />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />

        {cameraDenied && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-sm">
            Camera access denied or failed to initialize
          </div>
        )}
      </>
    </div>
  );
}
