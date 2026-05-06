import { getFaceApi } from "./faceApiClient";

let modelsLoaded = false;

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

/* -------- NEW: FACE QUALITY ANALYSIS -------- */

function calculateFaceQuality(imageElement, box, detectionScore) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = box.width;
  canvas.height = box.height;

  ctx.drawImage(
    imageElement,
    box.x,
    box.y,
    box.width,
    box.height,
    0,
    0,
    box.width,
    box.height
  );

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  let brightnessTotal = 0;
  let edgeTotal = 0;

  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];

    const brightness = (r + g + b) / 3;
    brightnessTotal += brightness;

    const edge = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
    edgeTotal += edge;
  }

  const pixelCount = imageData.length / 4;

  const avgBrightness = brightnessTotal / pixelCount;
  const edgeStrength = edgeTotal / pixelCount;

  let lighting = "Poor";
  if (avgBrightness > 160) lighting = "Excellent";
  else if (avgBrightness > 120) lighting = "Good";
  else if (avgBrightness > 80) lighting = "Fair";

  let blur = "High";
  if (edgeStrength > 60) blur = "Low";
  else if (edgeStrength > 35) blur = "Medium";

  const faceArea = box.width * box.height;
  const visibilityScore = detectionScore * 100;

  let visibility = "Fair";
  if (visibilityScore > 85 && faceArea > 20000) visibility = "Excellent";
  else if (visibilityScore > 70) visibility = "Good";

  let score = 0;

  score += Math.min(30, (avgBrightness / 255) * 30);
  score += Math.min(35, (edgeStrength / 80) * 35);
  score += Math.min(35, visibilityScore * 0.35);

  score = Math.round(Math.min(100, score));

  return {
    lighting,
    visibility,
    blur,
    score
  };
}

/* -------------------------------------------- */

export async function loadModels() {
  if (modelsLoaded) return;

  const MODEL_URL = "/models";
  const faceapi = await getFaceApi();

  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
  ]);

  modelsLoaded = true;
}

export async function detectFace(imageElement) {
  await loadModels();
  const faceapi = await getFaceApi();

  const detections = await faceapi
    .detectAllFaces(
      imageElement,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.6 })
    )
    .withFaceLandmarks()
    .withFaceExpressions()
    .withAgeAndGender()
    .withFaceDescriptors();

  if (!detections || detections.length === 0) {
    return null;
  }

  const results = detections.map((detection) => {

    const expressions = detection.expressions;
    const emotionEntries = Object.entries(expressions);
    const topEmotion = emotionEntries.sort((a, b) => b[1] - a[1])[0];

    const jawPoints = detection.landmarks.getJawOutline();
    const faceShape = calculateFaceShape(jawPoints);

    const estimatedAge = Math.round(detection.age);

    const box = detection.detection.box;

    const faceQuality = calculateFaceQuality(
      imageElement,
      box,
      detection.detection.score
    );

    return {
      ageRange: {
        min: estimatedAge - 2,
        max: estimatedAge + 2
      },

      gender: detection.gender,
      genderConfidence: detection.genderProbability,

      emotions: expressions,
      dominantEmotion: topEmotion ? topEmotion[0] : null,

      box,

      landmarks: {
        jaw: jawPoints,
        nose: detection.landmarks.getNose(),
        mouth: detection.landmarks.getMouth(),
        leftEye: detection.landmarks.getLeftEye(),
        rightEye: detection.landmarks.getRightEye(),
        leftBrow: detection.landmarks.getLeftEyeBrow(),
        rightBrow: detection.landmarks.getRightEyeBrow()
      },

      faceShape,

      descriptor: detection.descriptor,

      /* NEW FEATURE */
      faceQuality
    };
  });

  console.log("Multi-face results:", results);

  return results;
}
