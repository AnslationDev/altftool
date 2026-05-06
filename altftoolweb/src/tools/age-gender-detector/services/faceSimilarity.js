import { loadModels } from "./faceDetection";
import { getFaceApi } from "./faceApiClient";

function euclideanDistance(descriptor1, descriptor2) {
  const length = Math.min(descriptor1.length, descriptor2.length);
  let sum = 0;

  for (let i = 0; i < length; i += 1) {
    const diff = descriptor1[i] - descriptor2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

export async function getFaceDescriptor(imageElement) {
  await loadModels();
  const faceapi = await getFaceApi();

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

  const distance = euclideanDistance(descriptor1, descriptor2);

  const similarity = Math.max(0, (1 - distance)) * 100;

  return {
    similarity: similarity.toFixed(1),
    samePerson: similarity > 55
  };
}
