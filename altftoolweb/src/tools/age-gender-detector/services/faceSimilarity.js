import * as faceapi from "@vladmandic/face-api";
import { loadModels } from "./faceDetection";

export async function getFaceDescriptor(imageElement) {
  await loadModels();

  const detection = await faceapi
    .detectSingleFace(
      imageElement,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 512,
        scoreThreshold: 0.9
      })
    )
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;

  return detection.descriptor;
}

export function compareFaces(descriptor1, descriptor2) {
  if (!descriptor1 || !descriptor2) return null;

  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);

  const similarity = Math.max(0, (1 - distance)) * 100;

  return {
    similarity: similarity.toFixed(1),
    samePerson: similarity > 55
  };
}
