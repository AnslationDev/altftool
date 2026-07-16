"use client";

import { useState, useCallback, useRef, useEffect } from 'react';

let modelsLoaded = false;
let loadingPromise = null;

const MODEL_URL = '/models';

async function ensureModels() {
  if (modelsLoaded) return;
  if (loadingPromise) return loadingPromise;
  const faceapi = await import('@vladmandic/face-api');
  loadingPromise = Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
  ]);
  await loadingPromise;
  modelsLoaded = true;
  loadingPromise = null;
}

export function useFaceDetection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [faceData, setFaceData] = useState(null);
  const [modelsReady, setModelsReady] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const loadModels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await ensureModels();
      if (mountedRef.current) setModelsReady(true);
    } catch (err) {
      if (mountedRef.current) setError('Failed to load face detection models. Please refresh and try again.');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const detectFace = useCallback(async (image) => {
    if (!modelsReady) await ensureModels();
    setLoading(true);
    setError(null);
    setFaceData(null);
    try {
      const faceapi = await import('@vladmandic/face-api');
      const detection = await faceapi
        .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

      if (!detection || detection.length === 0) {
        throw new Error('No face detected. Please try a different image.');
      }
      if (detection.length > 1) {
        throw new Error('Multiple faces detected. Please use an image with one face.');
      }

      const result = detection[0];
      const box = result.detection.box;
      const landmarks = result.landmarks.positions;
      const jawline = landmarks.slice(0, 17);
      const leftEyebrow = landmarks.slice(17, 22);
      const rightEyebrow = landmarks.slice(22, 27);
      const noseBridge = landmarks.slice(27, 31);
      const noseTip = landmarks.slice(31, 36);
      const leftEye = landmarks.slice(36, 42);
      const rightEye = landmarks.slice(42, 48);
      const outerLips = landmarks.slice(48, 60);
      const innerLips = landmarks.slice(60, 68);

      const expressions = result.expressions;
      const age = Math.round(result.age);
      const gender = result.gender;

      const foreheadWidth = Math.abs(rightEyebrow[4]?.x - leftEyebrow[0]?.x) || box.width;
      const jawWidth = Math.abs(jawline[16]?.x - jawline[0]?.x) || box.width;
      const faceWidth = box.width;
      const faceHeight = box.height;
      const faceRatio = faceWidth / faceHeight;

      let faceShape = 'Oval';
      if (faceRatio > 1.2) faceShape = 'Round';
      else if (faceRatio > 1.05) faceShape = 'Square';
      else if (faceRatio < 0.85) faceShape = 'Rectangle';
      else if (foreheadWidth > jawWidth * 1.15) faceShape = 'Heart';
      const eyeDistance = Math.abs(rightEye[0]?.x - leftEye[3]?.x) || box.width * 0.4;
      const headWidth = box.width;

      const data = {
        box: { x: box.x, y: box.y, width: box.width, height: box.height },
        landmarks: { jawline, leftEyebrow, rightEyebrow, noseBridge, noseTip, leftEye, rightEye, outerLips, innerLips },
        expressions,
        age,
        gender,
        faceShape,
        faceWidth,
        faceHeight,
        foreheadWidth,
        jawWidth,
        eyeDistance,
        headWidth,
        detection,
      };

      if (mountedRef.current) setFaceData(data);
      return data;
    } catch (err) {
      if (mountedRef.current) setError(err.message || 'Face detection failed. Please try again.');
      return null;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [modelsReady]);

  const reset = useCallback(() => {
    setFaceData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { loading, error, faceData, modelsReady, loadModels, detectFace, reset };
}
