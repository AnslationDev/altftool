import { getFaceApi } from "../../age-gender-detector/services/faceApiClient";

let modelsLoaded = false;

export async function loadModels() {
  if (modelsLoaded) return;
  const MODEL_URL = "/models";
  const faceapi = await getFaceApi();

  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  ]);

  modelsLoaded = true;
}

function calculateDistance(point1, point2) {
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

export async function calculateBeautyScore(imageElement) {
  await loadModels();
  const faceapi = await getFaceApi();

  const detection = await faceapi
    .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 }))
    .withFaceLandmarks();

  if (!detection) return null;

  const landmarks = detection.landmarks;
  const positions = landmarks.positions;

  // Key facial points
  const leftEyeCenter = landmarks.getLeftEye().reduce((acc, curr) => ({ x: acc.x + curr.x, y: acc.y + curr.y }), { x: 0, y: 0 });
  leftEyeCenter.x /= 6; leftEyeCenter.y /= 6;

  const rightEyeCenter = landmarks.getRightEye().reduce((acc, curr) => ({ x: acc.x + curr.x, y: acc.y + curr.y }), { x: 0, y: 0 });
  rightEyeCenter.x /= 6; rightEyeCenter.y /= 6;

  const noseTip = landmarks.getNose()[3];
  const mouthCenter = landmarks.getMouth().reduce((acc, curr) => ({ x: acc.x + curr.x, y: acc.y + curr.y }), { x: 0, y: 0 });
  mouthCenter.x /= 20; mouthCenter.y /= 20;

  const jawPoints = landmarks.getJawOutline();
  const faceLeft = jawPoints[0];
  const faceRight = jawPoints[16];
  const chin = jawPoints[8];

  // 1. Symmetry Score (comparing left vs right distances)
  const leftSideWidth = calculateDistance(faceLeft, noseTip);
  const rightSideWidth = calculateDistance(faceRight, noseTip);
  const symmetryRatio = Math.min(leftSideWidth, rightSideWidth) / Math.max(leftSideWidth, rightSideWidth);
  const symmetryScore = symmetryRatio * 100;

  // 2. Golden Ratio Score (Ideal proportions usually around 1.618)
  const faceWidth = calculateDistance(faceLeft, faceRight);
  const faceHeight = calculateDistance({ x: (leftEyeCenter.x + rightEyeCenter.x) / 2, y: Math.min(leftEyeCenter.y, rightEyeCenter.y) - 50 }, chin); // approximation of height
  const eyeDistance = calculateDistance(leftEyeCenter, rightEyeCenter);
  const noseToChin = calculateDistance(noseTip, chin);

  // Proportions
  const heightWidthRatio = faceHeight / faceWidth;
  const goldenHeightWidth = 1.618;
  const hwScore = Math.max(0, 100 - (Math.abs(heightWidthRatio - goldenHeightWidth) * 100));

  const eyeToFaceRatio = faceWidth / eyeDistance;
  const goldenEyeRatio = 2.15; // approximation
  const eyeScore = Math.max(0, 100 - (Math.abs(eyeToFaceRatio - goldenEyeRatio) * 50));

  const goldenScore = (hwScore + eyeScore) / 2;

  // 3. Final Score Calculation (weighted)
  // Give some random variance so it's fun and not totally rigid
  const variance = (Math.random() * 5) - 2.5; 
  let finalScore = (symmetryScore * 0.6) + (goldenScore * 0.4) + variance;

  // Normalize between 65 and 99 for a fun user experience (nobody wants a 12/100)
  if (finalScore < 65) finalScore = 65 + (Math.random() * 10);
  if (finalScore > 99) finalScore = 99;

  const box = detection.detection.box;
  const imageWidth = imageElement.naturalWidth || imageElement.width;
  const imageHeight = imageElement.naturalHeight || imageElement.height;

  return {
    score: Math.round(finalScore),
    breakdown: {
      symmetry: Math.round(symmetryScore),
      goldenRatio: Math.round(goldenScore),
    },
    box: {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      imageWidth,
      imageHeight,
    },
  };
}
