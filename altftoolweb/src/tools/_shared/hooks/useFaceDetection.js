"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeFace } from '../render/faceAnalysis.js';

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
  const [faces, setFaces] = useState(null);
  const lastFacesRef = useRef(null);
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

  const detectFace = useCallback(async (image, { faceIndex = 0 } = {}) => {
    if (!modelsReady) await ensureModels();
    setLoading(true);
    setError(null);
    setFaceData(null);
    try {
      const faceapi = await import('@vladmandic/face-api');
      const detections = await faceapi
        .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 }))
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

      if (!detections || detections.length === 0) {
        throw new Error('No face detected. Please try a different image.');
      }

      // Capture the list of faces for multi-face handling.
      const allBoxes = detections.map((d) => {
        const b = d.detection.box;
        return { x: b.x, y: b.y, width: b.width, height: b.height };
      });
      lastFacesRef.current = allBoxes;
      allBoxes._w = image.width;
      allBoxes._h = image.height;
      if (mountedRef.current) setFaces(allBoxes);

      if (detections.length > 1 && faceIndex < 0) {
        // Multi-face: surface the face list; do not show a blocking error.
        if (mountedRef.current) setError(null);
        throw new Error('MULTIPLE_FACES');
      }

      const idx = faceIndex >= 0 ? Math.min(faceIndex, detections.length - 1) : 0;
      const result = detections[idx];

      // Pull image pixels for lighting analysis.
      let imageData = null;
      try {
        const probe = document.createElement('canvas');
        const maxDim = 512;
        const scale = Math.min(1, maxDim / Math.max(image.width, image.height));
        probe.width = Math.max(1, Math.round(image.width * scale));
        probe.height = Math.max(1, Math.round(image.height * scale));
        const pctx = probe.getContext('2d');
        pctx.drawImage(image, 0, 0, probe.width, probe.height);
        imageData = pctx.getImageData(0, 0, probe.width, probe.height);
      } catch (e) {
        imageData = null;
      }

      const data = analyzeFace(result, imageData);

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
    setFaces(null);
    setError(null);
    setLoading(false);
  }, []);

  return { loading, error, faceData, faces, modelsReady, loadModels, detectFace, reset };
}
