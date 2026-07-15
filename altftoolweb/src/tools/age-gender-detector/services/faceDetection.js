"use client";

import { getFaceApi } from "./faceApiClient";

const MODEL_URL = "/models";

let modelsPromise = null;

/**
 * Load only the nets this tool needs (tiny detector + age/gender).
 * Keeping the download small makes the first analysis fast.
 */
export function loadModels() {
  if (!modelsPromise) {
    modelsPromise = (async () => {
      const faceapi = await getFaceApi();
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
      ]);
      return faceapi;
    })().catch((error) => {
      modelsPromise = null; // allow retry on transient failures
      throw error;
    });
  }
  return modelsPromise;
}

/**
 * Detect every face in the image element.
 * Returns [] when no face is found.
 */
export async function detectFaces(imageElement) {
  const faceapi = await loadModels();

  const detections = await faceapi
    .detectAllFaces(
      imageElement,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 }),
    )
    .withAgeAndGender();

  if (!detections || detections.length === 0) return [];

  return detections.map((detection) => ({
    age: Math.round(detection.age),
    gender: detection.gender, // "male" | "female"
    genderConfidence: detection.genderProbability,
    score: detection.detection.score,
    box: {
      x: detection.detection.box.x,
      y: detection.detection.box.y,
      width: detection.detection.box.width,
      height: detection.detection.box.height,
    },
  }));
}
