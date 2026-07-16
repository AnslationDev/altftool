export function analyzeSmile(expressions, landmarks) {
  if (!expressions) return null;

  const {
    happy = 0, neutral = 0, sad = 0,
    angry = 0, fearful = 0, surprised = 0, disgusted = 0,
  } = expressions;

  const smileScore = happy * 100;
  const confidence = Math.max(happy, neutral, sad, angry, fearful, surprised, disgusted) * 100;

  let emotion = 'Neutral';
  let expressionLabel = 'Neutral';
  let emoji = '😐';

  if (happy > 0.5 && happy > neutral && happy > sad) {
    emotion = 'Happy';
    if (happy > 0.85) {
      expressionLabel = 'Big Smile';
      emoji = '😁';
    } else if (happy > 0.65) {
      expressionLabel = 'Smiling';
      emoji = '😊';
    } else {
      expressionLabel = 'Slight Smile';
      emoji = '🙂';
    }
  } else if (sad > 0.4 && sad > happy) {
    emotion = 'Sad';
    expressionLabel = 'Sad';
    emoji = '😢';
  } else if (surprised > 0.4) {
    emotion = 'Surprised';
    expressionLabel = 'Surprised';
    emoji = '😮';
  } else if (angry > 0.4) {
    emotion = 'Angry';
    expressionLabel = 'Angry';
    emoji = '😠';
  } else {
    expressionLabel = 'Neutral';
    emoji = '😐';
  }

  const fakeSmileProbability = happy > 0.5 && happy < 0.7 ? Math.round((0.7 - happy) * 200) : happy > 0.7 ? 5 : 0;
  const naturalSmileScore = happy > 0.5 ? Math.round(happy * 85 + 15) : Math.round(happy * 30);
  const happinessPercent = Math.round(happy * 100);

  const mouthCurve = analyzeMouthCurve(landmarks);
  const teethVisibility = analyzeTeethVisibility(landmarks);
  const eyeSquint = analyzeEyeSquint(landmarks);
  const cheekRaise = analyzeCheekRaise(landmarks);
  const lipSymmetry = analyzeLipSymmetry(landmarks);
  const faceSymmetry = analyzeFaceSymmetry(landmarks);

  const overallScore = Math.round(
    (smileScore * 0.3) + (mouthCurve * 0.15) + (teethVisibility * 0.1) +
    (eyeSquint * 0.1) + (naturalSmileScore * 0.2) + (lipSymmetry * 0.1) + (faceSymmetry * 0.05)
  );

  return {
    smileScore: Math.round(smileScore),
    confidence: Math.round(confidence),
    emotion,
    expressionLabel,
    emoji,
    fakeSmileProbability,
    naturalSmileScore,
    happinessPercent,
    overallScore: Math.min(100, Math.max(0, overallScore)),
    details: {
      mouthCurve: Math.round(mouthCurve),
      teethVisibility: Math.round(teethVisibility),
      eyeSquint: Math.round(eyeSquint),
      cheekRaise: Math.round(cheekRaise),
      lipSymmetry: Math.round(lipSymmetry),
      faceSymmetry: Math.round(faceSymmetry),
    },
    raw: { happy, neutral, sad, angry, fearful, surprised, disgusted },
  };
}

function analyzeMouthCurve(landmarks) {
  if (!landmarks?.outerLips || landmarks.outerLips.length < 20) return 50;
  const lips = landmarks.outerLips;
  const leftCorner = lips[0];
  const rightCorner = lips[6];
  const topMid = lips[3];
  const bottomMid = lips[9];
  if (!leftCorner || !rightCorner || !topMid || !bottomMid) return 50;
  const mouthWidth = Math.abs(rightCorner.x - leftCorner.x);
  const mouthOpen = Math.abs(bottomMid.y - topMid.y);
  const cornerDiff = Math.abs(leftCorner.y - rightCorner.y);
  if (mouthWidth === 0) return 50;
  const ratio = mouthOpen / mouthWidth;
  if (ratio > 0.15) return 80 + Math.min(20, ratio * 100);
  if (ratio > 0.08) return 60 + ratio * 100;
  return Math.max(10, ratio * 200);
}

function analyzeTeethVisibility(landmarks) {
  if (!landmarks?.outerLips || !landmarks?.innerLips) return 50;
  const outer = landmarks.outerLips;
  const inner = landmarks.innerLips;
  if (outer.length < 12 || inner.length < 8) return 50;
  const outerTop = outer[3]?.y || 0;
  const outerBottom = outer[9]?.y || 0;
  const innerTop = inner[3]?.y || 0;
  const innerBottom = inner[7]?.y || 0;
  const mouthOpen = Math.abs(outerBottom - outerTop);
  const teethGap = Math.abs(innerBottom - innerTop);
  if (mouthOpen === 0) return 30;
  const ratio = teethGap / mouthOpen;
  if (ratio > 0.4) return 90;
  if (ratio > 0.2) return 70;
  return 40;
}

function analyzeEyeSquint(landmarks) {
  if (!landmarks?.leftEye || !landmarks?.rightEye) return 50;
  const lEye = landmarks.leftEye;
  const rEye = landmarks.rightEye;
  if (lEye.length < 6 || rEye.length < 6) return 50;
  const lHeight = Math.abs(lEye[1].y - lEye[4].y);
  const rHeight = Math.abs(rEye[1].y - rEye[4].y);
  const lWidth = Math.abs(lEye[0].x - lEye[3].x);
  const rWidth = Math.abs(rEye[0].x - rEye[3].x);
  if (lWidth === 0 || rWidth === 0) return 50;
  const lRatio = lHeight / lWidth;
  const rRatio = rHeight / rWidth;
  const avg = (lRatio + rRatio) / 2;
  if (avg < 0.2) return 90;
  if (avg < 0.3) return 70;
  return Math.max(10, (1 - avg) * 100);
}

function analyzeCheekRaise(landmarks) {
  if (!landmarks?.jawline || !landmarks?.leftEye || !landmarks?.rightEye) return 50;
  const jaw = landmarks.jawline;
  const lEye = landmarks.leftEye;
  const rEye = landmarks.rightEye;
  if (jaw.length < 5 || lEye.length < 3 || rEye.length < 3) return 50;
  const leftCheek = jaw[4]?.y || 0;
  const rightCheek = jaw[12]?.y || 0;
  const eyeY = (lEye[1]?.y + rEye[1]?.y) / 2;
  const diff = (leftCheek + rightCheek) / 2 - eyeY;
  const faceHeight = jaw[8]?.y - eyeY || 100;
  if (faceHeight === 0) return 50;
  const ratio = diff / faceHeight;
  if (ratio < 0.25) return 80 + Math.min(20, (0.25 - ratio) * 200);
  return Math.max(20, (1 - ratio) * 80);
}

function analyzeLipSymmetry(landmarks) {
  if (!landmarks?.outerLips || landmarks.outerLips.length < 12) return 80;
  const lips = landmarks.outerLips;
  const left = lips[0];
  const right = lips[6];
  if (!left || !right) return 80;
  const diff = Math.abs(left.y - right.y);
  const mouthWidth = Math.abs(right.x - left.x);
  if (mouthWidth === 0) return 80;
  const ratio = diff / mouthWidth;
  return Math.max(40, Math.round((1 - ratio * 5)) * 100);
}

function analyzeFaceSymmetry(landmarks) {
  if (!landmarks?.jawline || landmarks.jawline.length < 17) return 70;
  const jaw = landmarks.jawline;
  const midPoint = Math.floor(jaw.length / 2);
  let totalDiff = 0;
  let count = 0;
  for (let i = 1; i < midPoint; i++) {
    const left = jaw[midPoint - i];
    const right = jaw[midPoint + i];
    if (left && right) {
      totalDiff += Math.abs(left.y - right.y);
      count++;
    }
  }
  if (count === 0) return 70;
  const avgDiff = totalDiff / count;
  const faceHeight = Math.abs(jaw[0]?.y - jaw[8]?.y || 100);
  if (faceHeight === 0) return 70;
  const ratio = avgDiff / faceHeight;
  return Math.max(40, Math.round((1 - ratio * 8)) * 100);
}
