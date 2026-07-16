import { renderGlasses as renderGlassesReal } from '../../_shared/render/glassesRenderer.js';

export const GLASSES_STYLES = [
  { id: 'rectangle', name: 'Rectangle', category: 'classic' },
  { id: 'square', name: 'Square', category: 'classic' },
  { id: 'round', name: 'Round', category: 'classic' },
  { id: 'oval', name: 'Oval', category: 'classic' },
  { id: 'aviator', name: 'Aviator', category: 'retro' },
  { id: 'wayfarer', name: 'Wayfarer', category: 'retro' },
  { id: 'cat-eye', name: 'Cat Eye', category: 'fashion' },
  { id: 'clubmaster', name: 'Clubmaster', category: 'retro' },
  { id: 'rimless', name: 'Rimless', category: 'minimal' },
  { id: 'half-rim', name: 'Half Rim', category: 'minimal' },
  { id: 'sports', name: 'Sports', category: 'sport' },
  { id: 'reading', name: 'Reading', category: 'classic' },
  { id: 'luxury', name: 'Luxury', category: 'fashion' },
  { id: 'fashion', name: 'Fashion', category: 'fashion' },
  { id: 'gaming', name: 'Gaming', category: 'sport' },
  { id: 'blue-light', name: 'Blue Light', category: 'minimal' },
  { id: 'sunglasses', name: 'Sunglasses', category: 'sun' },
  { id: 'oversized', name: 'Oversized', category: 'fashion' },
  { id: 'retro', name: 'Retro', category: 'retro' },
  { id: 'kids', name: 'Kids', category: 'classic' },
];

export const LENS_COLORS = [
  { name: 'Clear', value: 'rgba(255,255,255,0.15)' },
  { name: 'Black', value: 'rgba(0,0,0,0.8)' },
  { name: 'Transparent', value: 'rgba(255,255,255,0.05)' },
  { name: 'Blue', value: 'rgba(59,130,246,0.3)' },
  { name: 'Brown', value: 'rgba(139,90,43,0.4)' },
  { name: 'Green', value: 'rgba(34,197,94,0.3)' },
  { name: 'Gray', value: 'rgba(156,163,175,0.4)' },
  { name: 'Purple', value: 'rgba(168,85,247,0.3)' },
  { name: 'Pink', value: 'rgba(236,72,153,0.3)' },
  { name: 'Yellow', value: 'rgba(234,179,8,0.3)' },
  { name: 'Mirror', value: 'rgba(192,192,192,0.5)' },
  { name: 'Gradient', value: 'gradient' },
];

export const FRAME_COLORS = [
  { name: 'Black', value: '#1a1a1a' },
  { name: 'Silver', value: '#c0c0c0' },
  { name: 'Gold', value: '#d4a843' },
  { name: 'Brown', value: '#5c3a1e' },
  { name: 'White', value: '#f0f0f0' },
  { name: 'Transparent', value: 'rgba(200,200,200,0.3)' },
  { name: 'Custom', value: '' },
];

export function renderGlasses(ctx, style, faceData, options) {
  const enriched = faceData.hairline || faceData.eyeCenter ? faceData : null;
  const face = enriched || legacyToFace(faceData, options);
  renderGlassesReal(ctx, style, face, options);
}

function legacyToFace(faceData, options) {
  const { box, landmarks } = faceData;
  const leftEye = landmarks?.leftEye || [];
  const rightEye = landmarks?.rightEye || [];
  const le = {
    x: leftEye[3]?.x || box.x + box.width * 0.4,
    y: leftEye[1]?.y || box.y + box.height * 0.4,
  };
  const re = {
    x: rightEye[0]?.x || box.x + box.width * 0.6,
    y: rightEye[1]?.y || box.y + box.height * 0.4,
  };
  const eyeCenter = midpoint(le, re);
  return {
    box,
    landmarks,
    eyeCenter,
    leftEye: le,
    rightEye: re,
    eyeDistance: dist(le, re),
    noseTip: landmarks?.noseTip?.[2] || { x: eyeCenter.x, y: eyeCenter.y + box.height * 0.1 },
    pose: { roll: 0, yaw: 0, pitch: 0 },
    faceShape: 'Oval',
    lighting: null,
    jawWidth: box.width * 0.85,
    foreheadWidth: box.width,
    faceWidth: box.width,
    faceHeight: box.height,
  };
}

function drawLens(ctx, x, y, w, h, color, transparency) {
  ctx.save();
  if (color === 'gradient') {
    const grad = ctx.createLinearGradient(x - w, y - h, x + w, y + h);
    grad.addColorStop(0, 'rgba(59,130,246,0.2)');
    grad.addColorStop(0.5, 'rgba(168,85,247,0.2)');
    grad.addColorStop(1, 'rgba(236,72,153,0.2)');
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = color;
  }
  ctx.globalAlpha = (transparency || 50) / 100;
  ctx.beginPath();
  ctx.ellipse(x, y, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.1;
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.ellipse(x - w * 0.12, y - h * 0.15, w * 0.15, h * 0.1, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawRectGlasses(ctx, cx, cy, eyeDist, lw, lh, bw, fw, frameColor, lensColor, lt) {
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = fw;
  ctx.lineJoin = 'round';

  ctx.strokeRect(cx - eyeDist * 0.5 - lw * 0.2, cy - lh * 0.4, lw, lh);
  ctx.strokeRect(cx + eyeDist * 0.5 - lw * 0.8, cy - lh * 0.4, lw, lh);

  const bridgeX1 = cx - eyeDist * 0.5 - lw * 0.2 + lw;
  const bridgeX2 = cx + eyeDist * 0.5 - lw * 0.8;
  ctx.beginPath();
  ctx.moveTo(bridgeX1, cy + lh * 0.1);
  ctx.quadraticCurveTo((bridgeX1 + bridgeX2) / 2, cy - lh * 0.3, bridgeX2, cy + lh * 0.1);
  ctx.stroke();

  if (lensColor && lt > 0) {
    drawLens(ctx, cx - eyeDist * 0.5 - lw * 0.2 + lw * 0.5, cy, lw, lh, lensColor, lt);
    drawLens(ctx, cx + eyeDist * 0.5 - lw * 0.8 + lw * 0.5, cy, lw, lh, lensColor, lt);
  }

  ctx.beginPath();
  ctx.moveTo(bridgeX1 - lw * 0.1, cy + lh * 0.4);
  ctx.lineTo(bridgeX1 - lw * 0.1, cy + lh * 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bridgeX2 + lw * 0.1, cy + lh * 0.4);
  ctx.lineTo(bridgeX2 + lw * 0.1, cy + lh * 0.8);
  ctx.stroke();
}

function drawSquareGlasses(ctx, cx, cy, eyeDist, lw, lh, bw, fw, frameColor, lensColor, lt) {
  const side = Math.min(lw, lh);
  drawRectGlasses(ctx, cx, cy, eyeDist, side, side, bw, fw, frameColor, lensColor, lt);
}

function drawRoundGlasses(ctx, cx, cy, eyeDist, lw, lh, bw, fw, frameColor, lensColor, lt) {
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = fw;
  ctx.beginPath();
  ctx.ellipse(cx - eyeDist * 0.5, cy, lw * 0.5, lh * 0.5, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx + eyeDist * 0.5, cy, lw * 0.5, lh * 0.5, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - eyeDist * 0.5 + lw * 0.5, cy - lh * 0.1);
  ctx.quadraticCurveTo(cx, cy - lh * 0.35, cx + eyeDist * 0.5 - lw * 0.5, cy - lh * 0.1);
  ctx.stroke();

  if (lensColor && lt > 0) {
    drawLens(ctx, cx - eyeDist * 0.5, cy, lw, lh, lensColor, lt);
    drawLens(ctx, cx + eyeDist * 0.5, cy, lw, lh, lensColor, lt);
  }
}

function drawOvalGlasses(ctx, cx, cy, eyeDist, lw, lh, bw, fw, frameColor, lensColor, lt) {
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = fw;
  const oh = lh * 0.7;
  ctx.beginPath();
  ctx.ellipse(cx - eyeDist * 0.5, cy, lw * 0.5, oh * 0.5, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx + eyeDist * 0.5, cy, lw * 0.5, oh * 0.5, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - eyeDist * 0.5 + lw * 0.5, cy - oh * 0.1);
  ctx.quadraticCurveTo(cx, cy - oh * 0.3, cx + eyeDist * 0.5 - lw * 0.5, cy - oh * 0.1);
  ctx.stroke();

  if (lensColor && lt > 0) {
    drawLens(ctx, cx - eyeDist * 0.5, cy, lw, oh, lensColor, lt);
    drawLens(ctx, cx + eyeDist * 0.5, cy, lw, oh, lensColor, lt);
  }
}

function drawAviatorGlasses(ctx, cx, cy, eyeDist, lw, lh, bw, fw, frameColor, lensColor, lt) {
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = fw;
  ctx.lineJoin = 'round';

  const ah = lh * 0.6;
  const aw = lw * 0.5;

  ctx.beginPath();
  ctx.moveTo(cx - eyeDist * 0.5 - aw, cy - ah * 0.2);
  ctx.quadraticCurveTo(cx - eyeDist * 0.5 - aw, cy + ah * 0.8, cx - eyeDist * 0.5, cy + ah * 0.3);
  ctx.quadraticCurveTo(cx - eyeDist * 0.5 + aw, cy + ah * 0.8, cx - eyeDist * 0.5 + aw, cy - ah * 0.2);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + eyeDist * 0.5 - aw, cy - ah * 0.2);
  ctx.quadraticCurveTo(cx + eyeDist * 0.5 - aw, cy + ah * 0.8, cx + eyeDist * 0.5, cy + ah * 0.3);
  ctx.quadraticCurveTo(cx + eyeDist * 0.5 + aw, cy + ah * 0.8, cx + eyeDist * 0.5 + aw, cy - ah * 0.2);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - eyeDist * 0.5 + aw, cy - ah * 0.1);
  ctx.quadraticCurveTo(cx, cy - ah * 0.4, cx + eyeDist * 0.5 - aw, cy - ah * 0.1);
  ctx.stroke();

  ctx.lineWidth = fw * 0.8;
  ctx.beginPath();
  ctx.moveTo(cx - eyeDist * 0.5 - aw, cy - ah * 0.2);
  ctx.lineTo(cx - eyeDist * 0.5 - aw, cy - ah * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + eyeDist * 0.5 + aw, cy - ah * 0.2);
  ctx.lineTo(cx + eyeDist * 0.5 + aw, cy - ah * 0.3);
  ctx.stroke();

  if (lensColor && lt > 0) {
    drawLens(ctx, cx - eyeDist * 0.5, cy + ah * 0.1, lw, ah, lensColor, lt);
    drawLens(ctx, cx + eyeDist * 0.5, cy + ah * 0.1, lw, ah, lensColor, lt);
  }
}

function drawWayfarerGlasses(ctx, cx, cy, eyeDist, lw, lh, bw, fw, frameColor, lensColor, lt) {
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = fw * 1.2;
  ctx.lineJoin = 'round';

  const ww = lw * 0.55;
  const wh = lh * 0.55;

  ctx.beginPath();
  ctx.moveTo(cx - eyeDist * 0.5 - ww * 0.8, cy - wh * 0.3);
  ctx.quadraticCurveTo(cx - eyeDist * 0.5 - ww, cy + wh * 0.1, cx - eyeDist * 0.5 - ww * 0.7, cy + wh * 0.6);
  ctx.quadraticCurveTo(cx - eyeDist * 0.5, cy + wh * 0.8, cx - eyeDist * 0.5 + ww * 0.7, cy + wh * 0.6);
  ctx.quadraticCurveTo(cx - eyeDist * 0.5 + ww, cy + wh * 0.1, cx - eyeDist * 0.5 + ww * 0.8, cy - wh * 0.3);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + eyeDist * 0.5 - ww * 0.8, cy - wh * 0.3);
  ctx.quadraticCurveTo(cx + eyeDist * 0.5 - ww, cy + wh * 0.1, cx + eyeDist * 0.5 - ww * 0.7, cy + wh * 0.6);
  ctx.quadraticCurveTo(cx + eyeDist * 0.5, cy + wh * 0.8, cx + eyeDist * 0.5 + ww * 0.7, cy + wh * 0.6);
  ctx.quadraticCurveTo(cx + eyeDist * 0.5 + ww, cy + wh * 0.1, cx + eyeDist * 0.5 + ww * 0.8, cy - wh * 0.3);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - eyeDist * 0.5 + ww * 0.8, cy - wh * 0.1);
  ctx.quadraticCurveTo(cx, cy - wh * 0.35, cx + eyeDist * 0.5 - ww * 0.8, cy - wh * 0.1);
  ctx.stroke();

  if (lensColor && lt > 0) {
    drawLens(ctx, cx - eyeDist * 0.5, cy + wh * 0.15, ww, wh, lensColor, lt);
    drawLens(ctx, cx + eyeDist * 0.5, cy + wh * 0.15, ww, wh, lensColor, lt);
  }
}

function drawCatEyeGlasses(ctx, cx, cy, eyeDist, lw, lh, bw, fw, frameColor, lensColor, lt) {
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = fw * 1.1;
  ctx.lineJoin = 'round';

  const cw = lw * 0.5;
  const ch = lh * 0.55;

  ctx.beginPath();
  ctx.moveTo(cx - eyeDist * 0.5 - cw * 0.7, cy - ch * 0.1);
  ctx.quadraticCurveTo(cx - eyeDist * 0.5 - cw * 0.9, cy + ch * 0.1, cx - eyeDist * 0.5 - cw * 0.7, cy + ch * 0.6);
  ctx.quadraticCurveTo(cx - eyeDist * 0.5 - cw * 0.1, cy + ch * 0.9, cx - eyeDist * 0.5 + cw * 0.5, cy + ch * 0.5);
  ctx.quadraticCurveTo(cx - eyeDist * 0.5 + cw * 0.9, cy + ch * 0.15, cx - eyeDist * 0.5 + cw * 0.8, cy - ch * 0.3);
  ctx.quadraticCurveTo(cx - eyeDist * 0.5 + cw * 0.5, cy - ch * 0.2, cx - eyeDist * 0.5, cy - ch * 0.1);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + eyeDist * 0.5 - cw * 0.7, cy - ch * 0.1);
  ctx.quadraticCurveTo(cx + eyeDist * 0.5 - cw * 0.9, cy + ch * 0.1, cx + eyeDist * 0.5 - cw * 0.7, cy + ch * 0.6);
  ctx.quadraticCurveTo(cx + eyeDist * 0.5 - cw * 0.1, cy + ch * 0.9, cx + eyeDist * 0.5 + cw * 0.5, cy + ch * 0.5);
  ctx.quadraticCurveTo(cx + eyeDist * 0.5 + cw * 0.9, cy + ch * 0.15, cx + eyeDist * 0.5 + cw * 0.8, cy - ch * 0.3);
  ctx.quadraticCurveTo(cx + eyeDist * 0.5 + cw * 0.5, cy - ch * 0.2, cx + eyeDist * 0.5, cy - ch * 0.1);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - eyeDist * 0.5 + cw * 0.6, cy - ch * 0.1);
  ctx.quadraticCurveTo(cx, cy - ch * 0.35, cx + eyeDist * 0.5 - cw * 0.6, cy - ch * 0.1);
  ctx.stroke();

  if (lensColor && lt > 0) {
    drawLens(ctx, cx - eyeDist * 0.5, cy + ch * 0.2, cw, ch, lensColor, lt);
    drawLens(ctx, cx + eyeDist * 0.5, cy + ch * 0.2, cw, ch, lensColor, lt);
  }
}

function drawClubmasterGlasses(ctx, cx, cy, eyeDist, lw, lh, bw, fw, frameColor, lensColor, lt) {
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = fw * 1.2;

  const cw = lw * 0.5;
  const ch = lh * 0.5;

  ctx.beginPath();
  ctx.moveTo(cx - eyeDist * 0.5 - cw * 0.8, cy - ch * 0.3);
  ctx.quadraticCurveTo(cx - eyeDist * 0.5 - cw * 0.9, cy + ch * 0.1, cx - eyeDist * 0.5 - cw * 0.7, cy + ch * 0.5);
  ctx.quadraticCurveTo(cx - eyeDist * 0.5 - cw * 0.2, cy + ch * 0.7, cx - eyeDist * 0.5 + cw * 0.6, cy + ch * 0.5);
  ctx.quadraticCurveTo(cx - eyeDist * 0.5 + cw * 0.8, cy + ch * 0.15, cx - eyeDist * 0.5 + cw * 0.7, cy - ch * 0.3);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(0,0,0,0.05)';
  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  ctx.beginPath();
  ctx.moveTo(cx - eyeDist * 0.5 - cw * 0.7, cy + ch * 0.5);
  ctx.lineTo(cx - eyeDist * 0.5 + cw * 0.6, cy + ch * 0.5);
  ctx.quadraticCurveTo(cx - eyeDist * 0.5 + cw * 0.8, cy + ch * 0.4, cx - eyeDist * 0.5 + cw * 0.7, cy + ch * 0.15);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + eyeDist * 0.5 - cw * 0.8, cy - ch * 0.3);
  ctx.quadraticCurveTo(cx + eyeDist * 0.5 - cw * 0.9, cy + ch * 0.1, cx + eyeDist * 0.5 - cw * 0.7, cy + ch * 0.5);
  ctx.quadraticCurveTo(cx + eyeDist * 0.5 - cw * 0.2, cy + ch * 0.7, cx + eyeDist * 0.5 + cw * 0.6, cy + ch * 0.5);
  ctx.quadraticCurveTo(cx + eyeDist * 0.5 + cw * 0.8, cy + ch * 0.15, cx + eyeDist * 0.5 + cw * 0.7, cy - ch * 0.3);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(0,0,0,0.05)';
  ctx.beginPath();
  ctx.moveTo(cx + eyeDist * 0.5 - cw * 0.7, cy + ch * 0.5);
  ctx.lineTo(cx + eyeDist * 0.5 + cw * 0.6, cy + ch * 0.5);
  ctx.quadraticCurveTo(cx + eyeDist * 0.5 + cw * 0.8, cy + ch * 0.4, cx + eyeDist * 0.5 + cw * 0.7, cy + ch * 0.15);
  ctx.stroke();

  ctx.lineWidth = fw * 0.8;
  ctx.strokeStyle = frameColor;
  ctx.beginPath();
  ctx.moveTo(cx - eyeDist * 0.5 + cw * 0.6, cy - ch * 0.1);
  ctx.quadraticCurveTo(cx, cy - ch * 0.3, cx + eyeDist * 0.5 - cw * 0.6, cy - ch * 0.1);
  ctx.stroke();

  if (lensColor && lt > 0) {
    drawLens(ctx, cx - eyeDist * 0.5, cy + ch * 0.1, cw, ch, lensColor, lt);
    drawLens(ctx, cx + eyeDist * 0.5, cy + ch * 0.1, cw, ch, lensColor, lt);
  }
}

function drawRimlessGlasses(ctx, cx, cy, eyeDist, lw, lh, bw, fw, frameColor, lensColor, lt) {
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(cx - eyeDist * 0.5 - lw * 0.2, cy);
  ctx.lineTo(cx - eyeDist * 0.5 - lw * 0.2 + lw, cy);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + eyeDist * 0.5 - lw * 0.8, cy);
  ctx.lineTo(cx + eyeDist * 0.5 - lw * 0.8 + lw, cy);
  ctx.stroke();

  if (lensColor && lt > 0) {
    ctx.strokeStyle = 'rgba(200,200,200,0.2)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(cx - eyeDist * 0.5 - lw * 0.2, cy - lh * 0.4, lw, lh);
    ctx.strokeRect(cx + eyeDist * 0.5 - lw * 0.8, cy - lh * 0.4, lw, lh);
    drawLens(ctx, cx - eyeDist * 0.5 - lw * 0.2 + lw * 0.5, cy, lw, lh, lensColor, lt);
    drawLens(ctx, cx + eyeDist * 0.5 - lw * 0.8 + lw * 0.5, cy, lw, lh, lensColor, lt);
  }
}

function drawHalfRimGlasses(ctx, cx, cy, eyeDist, lw, lh, bw, fw, frameColor, lensColor, lt) {
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = fw;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(cx - eyeDist * 0.5, cy + lh * 0.05, lw * 0.5, Math.PI * 0.3, Math.PI * 0.7);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx + eyeDist * 0.5, cy + lh * 0.05, lw * 0.5, Math.PI * 0.3, Math.PI * 0.7);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - eyeDist * 0.5 - lw * 0.3, cy - lh * 0.3);
  ctx.lineTo(cx - eyeDist * 0.5 + lw * 0.3, cy - lh * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + eyeDist * 0.5 - lw * 0.3, cy - lh * 0.3);
  ctx.lineTo(cx + eyeDist * 0.5 + lw * 0.3, cy - lh * 0.3);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - eyeDist * 0.5 + lw * 0.3, cy - lh * 0.3);
  ctx.quadraticCurveTo(cx, cy - lh * 0.45, cx + eyeDist * 0.5 - lw * 0.3, cy - lh * 0.3);
  ctx.stroke();

  if (lensColor && lt > 0) {
    drawLens(ctx, cx - eyeDist * 0.5, cy, lw, lh, lensColor, lt);
    drawLens(ctx, cx + eyeDist * 0.5, cy, lw, lh, lensColor, lt);
  }
}

function drawSportsGlasses(ctx, cx, cy, eyeDist, lw, lh, bw, fw, frameColor, lensColor, lt) {
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = fw * 1.5;
  ctx.lineJoin = 'round';

  const sw = lw * 0.6;
  const sh = lh * 0.55;

  ctx.beginPath();
  ctx.moveTo(cx - eyeDist * 0.5 - sw * 0.7, cy - sh * 0.3);
  ctx.quadraticCurveTo(cx - eyeDist * 0.5 - sw * 0.9, cy + sh * 0.2, cx - eyeDist * 0.5 - sw * 0.6, cy + sh * 0.6);
  ctx.quadraticCurveTo(cx - eyeDist * 0.5, cy + sh * 0.7, cx - eyeDist * 0.5 + sw * 0.6, cy + sh * 0.6);
  ctx.quadraticCurveTo(cx - eyeDist * 0.5 + sw * 0.9, cy + sh * 0.2, cx - eyeDist * 0.5 + sw * 0.7, cy - sh * 0.3);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + eyeDist * 0.5 - sw * 0.7, cy - sh * 0.3);
  ctx.quadraticCurveTo(cx + eyeDist * 0.5 - sw * 0.9, cy + sh * 0.2, cx + eyeDist * 0.5 - sw * 0.6, cy + sh * 0.6);
  ctx.quadraticCurveTo(cx + eyeDist * 0.5, cy + sh * 0.7, cx + eyeDist * 0.5 + sw * 0.6, cy + sh * 0.6);
  ctx.quadraticCurveTo(cx + eyeDist * 0.5 + sw * 0.9, cy + sh * 0.2, cx + eyeDist * 0.5 + sw * 0.7, cy - sh * 0.3);
  ctx.closePath();
  ctx.stroke();

  ctx.lineWidth = fw * 0.8;
  ctx.beginPath();
  ctx.moveTo(cx - eyeDist * 0.5 + sw * 0.5, cy - sh * 0.1);
  ctx.quadraticCurveTo(cx, cy - sh * 0.4, cx + eyeDist * 0.5 - sw * 0.5, cy - sh * 0.1);
  ctx.stroke();

  ctx.lineWidth = fw * 0.6;
  ctx.strokeStyle = frameColor;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(cx - eyeDist * 0.5 - sw * 0.7, cy - sh * 0.3);
  ctx.lineTo(cx - eyeDist * 0.5 - sw * 0.7, cy - sh * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + eyeDist * 0.5 + sw * 0.7, cy - sh * 0.3);
  ctx.lineTo(cx + eyeDist * 0.5 + sw * 0.7, cy - sh * 0.5);
  ctx.stroke();

  ctx.globalAlpha = 1;
  if (lensColor && lt > 0) {
    drawLens(ctx, cx - eyeDist * 0.5, cy + sh * 0.1, sw, sh, lensColor, lt);
    drawLens(ctx, cx + eyeDist * 0.5, cy + sh * 0.1, sw, sh, lensColor, lt);
  }
}

function drawOversizedGlasses(ctx, cx, cy, eyeDist, lw, lh, bw, fw, frameColor, lensColor, lt) {
  const ow = lw * 0.8;
  const oh = lh * 0.8;
  drawRectGlasses(ctx, cx, cy, eyeDist * 1.1, ow, oh, bw, fw * 1.3, frameColor, lensColor, lt);
}
