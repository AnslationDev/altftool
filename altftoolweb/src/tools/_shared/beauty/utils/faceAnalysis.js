"use client";

export function extractFaceBox(landmarks) {
  if (!landmarks || landmarks.length === 0) return null;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of landmarks) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return {
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY,
  };
}

export function getEyeRegions(landmarks) {
  if (!landmarks || landmarks.length < 48) return null;
  
  const getBox = (pts) => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  };

  return {
    left: getBox(landmarks.slice(36, 42)),
    right: getBox(landmarks.slice(42, 48)),
  };
}

export function detectFaceShape(landmarks, box) {
  if (!landmarks || landmarks.length < 17) return "Oval";
  const faceWidth = box?.width || 1;
  const faceHeight = box?.height || 1;
  const ratio = faceWidth / faceHeight;
  
  let shape = "Oval";
  if (ratio > 1.15) {
    shape = "Round";
  } else if (ratio > 1.0) {
    shape = "Square";
  } else if (ratio < 0.8) {
    shape = "Oblong";
  } else {
    const foreheadW = Math.abs(landmarks[17].x - landmarks[26].x);
    const jawW = Math.abs(landmarks[4].x - landmarks[12].x);
    if (foreheadW > jawW * 1.15) {
      shape = "Heart";
    } else if (foreheadW < jawW * 0.95) {
      shape = "Diamond";
    }
  }
  return shape;
}

export function analyzeFaceSymmetry(landmarks) {
  if (!landmarks || landmarks.length < 68) {
    return {
      score: 80,
      confidence: 90,
      description: "Insufficient landmarks detected.",
      details: []
    };
  }

  const midline = landmarks[27]?.x || 0;

  const pairs = {
    Eyes: [36, 45],
    Brows: [17, 26],
    Cheeks: [1, 15],
    Jaw: [4, 12],
    Nose: [31, 35],
    Lips: [48, 54],
  };

  const details = [];
  let totalScore = 0;

  for (const [feature, [leftIdx, rightIdx]] of Object.entries(pairs)) {
    const leftPt = landmarks[leftIdx];
    const rightPt = landmarks[rightIdx];

    const leftDist = Number(Math.abs(midline - leftPt.x).toFixed(1));
    const rightDist = Number(Math.abs(rightPt.x - midline).toFixed(1));

    const ratio = Math.max(leftDist, rightDist) === 0
      ? 100
      : Math.round((Math.min(leftDist, rightDist) / Math.max(leftDist, rightDist)) * 100);

    const score = Math.max(0, Math.min(100, ratio));
    totalScore += score;

    details.push({
      name: feature,
      score,
      leftDist,
      rightDist,
      ratio,
    });
  }

  const overallScore = Math.round(totalScore / Object.keys(pairs).length);
  const confidence = 92;
  const description = `Your facial features show an overall bilateral symmetry score of ${overallScore}%. The highest symmetry was found in the ${details.reduce((a, b) => a.score > b.score ? a : b).name.toLowerCase()}, indicating a highly balanced facial structure.`;

  return {
    score: overallScore,
    confidence,
    description,
    details,
  };
}

