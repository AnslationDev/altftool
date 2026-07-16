// FaceLandmarks / FaceDetector enrichment layer.
//
// The tools already load @vladmandic/face-api (68 landmarks). This module
// upgrades that raw detection into a high-level "mesh" description the
// renderers consume: precise hairline, forehead, temples, jawline, chin,
// ear anchors, head pose (roll/pitch/yaw), face shape, and an image-borne
// lighting profile. It mirrors the data a 478-point MediaPipe FaceMesh +
// segmentation would give, but reuses the 68-point detector already shipped
// so no new model downloads are required.

import { averagePoints, midpoint, dist, clamp } from './geometry.js';
import { analyzeLighting } from './lighting.js';

// Map the 68-point face-api layout into named regions.
function splitLandmarks(positions) {
  return {
    jawline: positions.slice(0, 17),
    leftEyebrow: positions.slice(17, 22),
    rightEyebrow: positions.slice(22, 27),
    noseBridge: positions.slice(27, 31),
    noseTip: positions.slice(31, 36),
    leftEye: positions.slice(36, 42),
    rightEye: positions.slice(42, 48),
    outerLips: positions.slice(48, 60),
    innerLips: positions.slice(60, 68),
  };
}

// Estimate roll from eye-line, yaw from nose deviation, pitch from
// forehead-to-chin vertical compression.
function estimatePose(L, box) {
  const leftEyeC = averagePoints(L.leftEye);
  const rightEyeC = averagePoints(L.rightEye);
  const roll = Math.atan2(rightEyeC.y - leftEyeC.y, rightEyeC.x - leftEyeC.x);

  const noseBridgeTop = L.noseBridge[0];
  const eyeMid = midpoint(leftEyeC, rightEyeC);
  const noseDev = (noseBridgeTop.x - eyeMid.x) / (box.width || 1);
  const yaw = clamp(noseDev * 2.4, -0.6, 0.6);

  const foreheadY = L.leftEyebrow[0].y;
  const chinY = L.jawline[8].y;
  const expected = box.height * 0.85;
  const pitch = clamp((1 - (chinY - foreheadY) / expected) * 1.6, -0.5, 0.5);
  return { roll, yaw, pitch };
}

function estimateFaceShape(L, box) {
  const faceWidth = box.width;
  const faceHeight = box.height;
  const ratio = faceWidth / faceHeight;
  const foreheadW = dist(L.leftEyebrow[0], L.rightEyebrow[4]);
  const jawW = dist(L.jawline[0], L.jawline[16]);
  const cheekW = dist(L.leftEye[0], L.rightEye[3]);
  let shape = 'Oval';
  if (ratio > 1.18) shape = 'Round';
  else if (ratio > 1.04) shape = 'Square';
  else if (ratio < 0.82) shape = 'Rectangle';
  else if (foreheadW > jawW * 1.18) shape = 'Heart';
  else if (jawW > cheekW * 1.05 && foreheadW < jawW) shape = 'Triangle';
  else if (cheekW > jawW * 1.15 && cheekW > foreheadW) shape = 'Diamond';
  return shape;
}

// Build a dense hairline curve from forehead landmarks + interpolation.
function buildHairline(L, box) {
  const leftTemple = L.jawline[0];
  const rightTemple = L.jawline[16];
  const browL = L.leftEyebrow[0];
  const browR = L.rightEyebrow[4];
  const browMidL = L.leftEyebrow[2];
  const browMidR = L.rightEyebrow[2];
  // Hairline sits above the brows, scaled by face height.
  const up = box.height * 0.16;
  const p1 = { x: leftTemple.x, y: leftTemple.y - box.height * 0.02 };
  const p2 = { x: browL.x - box.width * 0.02, y: browL.y - up };
  const p3 = { x: browMidL.x, y: browMidL.y - up * 1.15 };
  const p4 = { x: midpoint(browMidL, browMidR).x, y: midpoint(browMidL, browMidR).y - up * 1.25 };
  const p5 = { x: browMidR.x, y: browMidR.y - up * 1.15 };
  const p6 = { x: browR.x + box.width * 0.02, y: browR.y - up };
  const p7 = { x: rightTemple.x, y: rightTemple.y - box.height * 0.02 };
  return [p1, p2, p3, p4, p5, p6, p7];
}

export function analyzeFace(detection, imageData) {
  const box = detection.detection.box;
  const positions = detection.landmarks.positions;
  const L = splitLandmarks(positions);

  const bounds = {
    x: box.x - box.width * 0.2,
    y: box.y - box.height * 0.3,
    w: box.width * 1.4,
    h: box.height * 1.4,
  };
  const lighting = imageData ? analyzeLighting(imageData, bounds) : null;

  const pose = estimatePose(L, box);
  const faceShape = estimateFaceShape(L, box);
  const hairline = buildHairline(L, box);

  const leftEyeC = averagePoints(L.leftEye);
  const rightEyeC = averagePoints(L.rightEye);
  const eyeCenter = midpoint(leftEyeC, rightEyeC);
  const eyeDistance = dist(leftEyeC, rightEyeC);
  const noseTip = L.noseTip[2] || averagePoints(L.noseTip);
  const chin = L.jawline[8];
  const upperLip = L.outerLips[0] || L.outerLips[3];
  const lipCenter = averagePoints(L.outerLips);

  return {
    box: { x: box.x, y: box.y, width: box.width, height: box.height },
    landmarks: L,
    hairline,
    pose,
    faceShape,
    lighting,
    eyeCenter,
    leftEye: leftEyeC,
    rightEye: rightEyeC,
    eyeDistance,
    noseTip,
    chin,
    upperLip,
    lipCenter,
    jawWidth: dist(L.jawline[0], L.jawline[16]),
    foreheadWidth: dist(L.leftEyebrow[0], L.rightEyebrow[4]),
    faceWidth: box.width,
    faceHeight: box.height,
    expressions: detection.expressions,
    age: Math.round(detection.age),
    gender: detection.gender,
    detections: detection,
  };
}
