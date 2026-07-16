import { renderHair } from '../../_shared/render/hairRenderer.js';

export const HAIR_STYLES = [
  { id: 'buzz-cut', name: 'Buzz Cut', category: 'short', complexity: 'simple' },
  { id: 'fade', name: 'Fade', category: 'short', complexity: 'medium' },
  { id: 'crew-cut', name: 'Crew Cut', category: 'short', complexity: 'simple' },
  { id: 'french-crop', name: 'French Crop', category: 'short', complexity: 'medium' },
  { id: 'pompadour', name: 'Pompadour', category: 'medium', complexity: 'complex' },
  { id: 'quiff', name: 'Quiff', category: 'medium', complexity: 'complex' },
  { id: 'undercut', name: 'Undercut', category: 'medium', complexity: 'complex' },
  { id: 'side-part', name: 'Side Part', category: 'medium', complexity: 'medium' },
  { id: 'middle-part', name: 'Middle Part', category: 'medium', complexity: 'medium' },
  { id: 'curtains', name: 'Curtains', category: 'medium', complexity: 'medium' },
  { id: 'slick-back', name: 'Slick Back', category: 'medium', complexity: 'medium' },
  { id: 'comb-over', name: 'Comb Over', category: 'medium', complexity: 'medium' },
  { id: 'messy', name: 'Messy Hair', category: 'medium', complexity: 'medium' },
  { id: 'spiky', name: 'Spiky Hair', category: 'medium', complexity: 'medium' },
  { id: 'long', name: 'Long Hair', category: 'long', complexity: 'complex' },
  { id: 'wolf-cut', name: 'Wolf Cut', category: 'long', complexity: 'complex' },
  { id: 'mullet', name: 'Mullet', category: 'long', complexity: 'complex' },
  { id: 'man-bun', name: 'Man Bun', category: 'long', complexity: 'complex' },
  { id: 'curly', name: 'Curly Hair', category: 'medium', complexity: 'complex' },
  { id: 'afro', name: 'Afro', category: 'medium', complexity: 'complex' },
  { id: 'bald', name: 'Bald', category: 'none', complexity: 'simple' },
];

export const HAIR_COLORS = [
  { name: 'Black', value: '#1a1a1a' },
  { name: 'Brown', value: '#5c3a1e' },
  { name: 'Dark Brown', value: '#3b2313' },
  { name: 'Light Brown', value: '#8b5e34' },
  { name: 'Blonde', value: '#e8c87a' },
  { name: 'Ash Blonde', value: '#c4b08a' },
  { name: 'Golden', value: '#d4a843' },
  { name: 'Red', value: '#b83a1a' },
  { name: 'White', value: '#e8e8e8' },
  { name: 'Gray', value: '#9a9a9a' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Silver', value: '#c0c0c0' },
];

export function renderHairStyle(ctx, style, faceData, options) {
  // Delegate to the realistic HairRenderer. `faceData` is the enriched object
  // produced by analyzeFace(); legacy fields are read as a fallback.
  const enriched = faceData.hairline ? faceData : null;
  const face = enriched || legacyToFace(faceData, options);
  renderHair(ctx, style, face, options);
}

// Minimal shim for the old { box, landmarks } shape so this module is robust.
function legacyToFace(faceData, options) {
  const { box, landmarks } = faceData;
  const leftEye = landmarks?.leftEye || [];
  const rightEye = landmarks?.rightEye || [];
  const jawline = landmarks?.jawline || [];
  const hairline = [
    { x: box.x, y: box.y },
    { x: box.x + box.width * 0.25, y: box.y - box.height * 0.12 },
    { x: box.x + box.width * 0.5, y: box.y - box.height * 0.18 },
    { x: box.x + box.width * 0.75, y: box.y - box.height * 0.12 },
    { x: box.x + box.width, y: box.y },
  ];
  return {
    box,
    hairline,
    landmarks,
    pose: { roll: 0, yaw: 0, pitch: 0 },
    faceShape: 'Oval',
    lighting: null,
    eyeCenter: { x: box.x + box.width / 2, y: box.y + box.height * 0.4 },
    leftEye: leftEye[3] || { x: box.x + box.width * 0.4, y: box.y + box.height * 0.4 },
    rightEye: rightEye[0] || { x: box.x + box.width * 0.6, y: box.y + box.height * 0.4 },
    eyeDistance: box.width * 0.4,
    noseTip: { x: box.x + box.width / 2, y: box.y + box.height * 0.55 },
    chin: jawline[8] || { x: box.x + box.width / 2, y: box.y + box.height * 0.85 },
    upperLip: { x: box.x + box.width / 2, y: box.y + box.height * 0.7 },
    lipCenter: { x: box.x + box.width / 2, y: box.y + box.height * 0.72 },
    jawWidth: box.width * 0.85,
    foreheadWidth: box.width,
    faceWidth: box.width,
    faceHeight: box.height,
  };
}

function drawBuzzCut(ctx, cx, box, bw, bh, topY, color) {
  ctx.fillStyle = color;
  const y = topY - bh * 0.1;
  const h = bh * 0.7;
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.5, bw * 0.5, h * 0.5, 0, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.3, bw * 0.45, h * 0.35, 0, 0, Math.PI);
  ctx.fill();
}

function drawFade(ctx, cx, box, bw, bh, topY, color) {
  ctx.fillStyle = color;
  const y = topY - bh * 0.05;
  const h = bh * 0.5;
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.3, bw * 0.5, h * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha *= 0.3;
  ctx.beginPath();
  ctx.ellipse(cx, box.y + box.height * 0.1, bw * 0.55, bh * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawFrenchCrop(ctx, cx, box, bw, bh, topY, color) {
  ctx.fillStyle = color;
  const y = topY - bh * 0.15;
  const h = bh * 0.45;
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.4, bw * 0.5, h * 0.5, 0, 0, Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - bw * 0.35, y + h * 0.2);
  ctx.quadraticCurveTo(cx + bw * 0.1, y - bh * 0.1, cx + bw * 0.4, y + h * 0.3);
  ctx.lineTo(cx + bw * 0.4, y + h * 0.5);
  ctx.quadraticCurveTo(cx, y + h * 0.4, cx - bw * 0.35, y + h * 0.5);
  ctx.closePath();
  ctx.fill();
}

function drawPompadour(ctx, cx, box, bw, bh, topY, color) {
  ctx.fillStyle = color;
  const y = topY - bh * 0.25;
  const h = bh * 0.8;
  ctx.beginPath();
  ctx.ellipse(cx, y, bw * 0.45, h * 0.4, 0, 0, Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - bw * 0.2, y - h * 0.1);
  ctx.quadraticCurveTo(cx, y - h * 0.4, cx + bw * 0.25, y - h * 0.1);
  ctx.quadraticCurveTo(cx + bw * 0.4, y + h * 0.05, cx + bw * 0.35, y + h * 0.35);
  ctx.quadraticCurveTo(cx, y + h * 0.25, cx - bw * 0.35, y + h * 0.35);
  ctx.quadraticCurveTo(cx - bw * 0.4, y + h * 0.05, cx - bw * 0.2, y - h * 0.1);
  ctx.closePath();
  ctx.fill();
}

function drawQuiff(ctx, cx, box, bw, bh, topY, color) {
  ctx.fillStyle = color;
  const y = topY - bh * 0.2;
  const h = bh * 0.7;
  ctx.beginPath();
  ctx.moveTo(cx - bw * 0.3, y + h * 0.3);
  ctx.quadraticCurveTo(cx - bw * 0.1, y - h * 0.25, cx, y - h * 0.3);
  ctx.quadraticCurveTo(cx + bw * 0.1, y - h * 0.25, cx + bw * 0.3, y + h * 0.3);
  ctx.quadraticCurveTo(cx, y + h * 0.2, cx - bw * 0.3, y + h * 0.3);
  ctx.closePath();
  ctx.fill();
  drawUndercutSides(ctx, cx, box, bw, bh, topY, color);
}

function drawUndercut(ctx, cx, box, bw, bh, topY, color) {
  ctx.fillStyle = color;
  const y = topY - bh * 0.15;
  const h = bh * 0.55;
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.3, bw * 0.4, h * 0.4, 0, 0, Math.PI);
  ctx.fill();
  drawUndercutSides(ctx, cx, box, bw, bh, topY, color);
}

function drawUndercutSides(ctx, cx, box, bw, bh, topY, color) {
  ctx.fillStyle = color;
  ctx.globalAlpha *= 0.5;
  ctx.beginPath();
  ctx.ellipse(cx - bw * 0.35, box.y + box.height * 0.05, bw * 0.12, bh * 0.2, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + bw * 0.35, box.y + box.height * 0.05, bw * 0.12, bh * 0.2, 0.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawSidePart(ctx, cx, box, bw, bh, topY, color) {
  ctx.fillStyle = color;
  const y = topY - bh * 0.15;
  const h = bh * 0.6;
  ctx.beginPath();
  ctx.ellipse(cx - bw * 0.05, y + h * 0.3, bw * 0.55, h * 0.5, 0.05, 0, Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + bw * 0.05, y + bh * 0.05);
  ctx.lineTo(cx + bw * 0.05, y + h * 0.5);
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawMiddlePart(ctx, cx, box, bw, bh, topY, color) {
  ctx.fillStyle = color;
  const y = topY - bh * 0.15;
  const h = bh * 0.6;
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.3, bw * 0.55, h * 0.5, 0, 0, Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx, y + bh * 0.05);
  ctx.lineTo(cx, y + h * 0.5);
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawCurtains(ctx, cx, box, bw, bh, topY, color) {
  ctx.fillStyle = color;
  const y = topY - bh * 0.2;
  const h = bh * 0.7;
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.2, bw * 0.5, h * 0.45, 0, 0, Math.PI);
  ctx.fill();
  ctx.globalAlpha *= 0.7;
  ctx.beginPath();
  ctx.moveTo(cx - bw * 0.05, y + h * 0.3);
  ctx.quadraticCurveTo(cx - bw * 0.25, y + h * 0.6, cx - bw * 0.35, y + h * 0.4);
  ctx.lineTo(cx - bw * 0.45, y + h * 0.3);
  ctx.quadraticCurveTo(cx - bw * 0.3, y + h * 0.15, cx - bw * 0.05, y + h * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + bw * 0.05, y + h * 0.3);
  ctx.quadraticCurveTo(cx + bw * 0.25, y + h * 0.6, cx + bw * 0.35, y + h * 0.4);
  ctx.lineTo(cx + bw * 0.45, y + h * 0.3);
  ctx.quadraticCurveTo(cx + bw * 0.3, y + h * 0.15, cx + bw * 0.05, y + h * 0.3);
  ctx.closePath();
  ctx.fill();
}

function drawSlickBack(ctx, cx, box, bw, bh, topY, color) {
  ctx.fillStyle = color;
  const y = topY - bh * 0.1;
  const h = bh * 0.55;
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.2, bw * 0.55, h * 0.4, 0.08, 0, Math.PI);
  ctx.fill();
}

function drawCombOver(ctx, cx, box, bw, bh, topY, color) {
  ctx.fillStyle = color;
  const y = topY - bh * 0.15;
  const h = bh * 0.6;
  ctx.beginPath();
  ctx.ellipse(cx - bw * 0.05, y + h * 0.25, bw * 0.55, h * 0.45, 0.1, 0, Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - bw * 0.2, y + bh * 0.05);
  ctx.lineTo(cx + bw * 0.15, y + h * 0.5);
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const offset = i * bw * 0.03;
    ctx.beginPath();
    ctx.moveTo(cx - bw * 0.2 + offset, y + bh * 0.05 + i * h * 0.08);
    ctx.lineTo(cx + bw * 0.15 + offset, y + h * 0.5 + i * h * 0.02);
    ctx.stroke();
  }
}

function drawMessy(ctx, cx, box, bw, bh, topY, color, r) {
  ctx.fillStyle = color;
  const y = topY - bh * 0.2;
  const h = bh * 0.7;
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.25, bw * 0.5, h * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 12 + r * 12; i++) {
    const angle = Math.random() * Math.PI - Math.PI * 0.3;
    const len = h * (0.15 + Math.random() * 0.3);
    const sx = cx + (Math.random() - 0.5) * bw * 0.7;
    const sy = y + Math.random() * h * 0.4;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.sin(angle) * len, sy - Math.cos(angle) * len * 0.7);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5 + Math.random() * r;
    ctx.stroke();
  }
}

function drawSpiky(ctx, cx, box, bw, bh, topY, color) {
  ctx.fillStyle = color;
  const y = topY - bh * 0.2;
  const h = bh * 0.5;
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.2, bw * 0.4, h * 0.35, 0, 0, Math.PI);
  ctx.fill();
  for (let i = 0; i < 15; i++) {
    const angle = -Math.PI * 0.4 + Math.random() * Math.PI * 0.8;
    const len = h * (0.2 + Math.random() * 0.4);
    const sx = cx + (Math.random() - 0.5) * bw * 0.5;
    const sy = y + Math.random() * h * 0.2;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.sin(angle) * len, sy - Math.cos(angle) * len);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 + Math.random() * 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

function drawLong(ctx, cx, box, bw, bh, topY, color, r, density) {
  ctx.fillStyle = color;
  const y = topY - bh * 0.1;
  const h = bh * 1.2;
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.2, bw * 0.5, h * 0.3, 0, 0, Math.PI);
  ctx.fill();
  const strands = Math.round(20 + density * 0.5);
  for (let i = 0; i < strands; i++) {
    const side = (i / strands - 0.5) * bw * 0.8;
    const startY = y + bh * 0.1 + Math.random() * bh * 0.15;
    const len = h * (0.6 + Math.random() * 0.4);
    const curve = side * 0.3 + (Math.random() - 0.5) * bw * 0.1;
    ctx.beginPath();
    ctx.moveTo(cx + side, startY);
    ctx.quadraticCurveTo(cx + side + curve, startY + len * 0.5, cx + side + curve * 0.5, startY + len);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5 + r * 0.5;
    ctx.globalAlpha = 0.3 + Math.random() * 0.3;
    ctx.stroke();
  }
}

function drawWolfCut(ctx, cx, box, bw, bh, topY, color, r, density) {
  drawLong(ctx, cx, box, bw, bh, topY, color, r, density);
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  const y = topY - bh * 0.2;
  const h = bh * 0.5;
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.2, bw * 0.5, h * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawMullet(ctx, cx, box, bw, bh, topY, color) {
  ctx.fillStyle = color;
  const y = topY - bh * 0.1;
  ctx.beginPath();
  ctx.ellipse(cx, y, bw * 0.5, bh * 0.25, 0, 0, Math.PI);
  ctx.fill();
  ctx.globalAlpha *= 0.8;
  ctx.beginPath();
  ctx.moveTo(cx - bw * 0.15, y + bh * 0.1);
  ctx.quadraticCurveTo(cx - bw * 0.3, y + bh * 0.6, cx - bw * 0.25, y + bh * 0.8);
  ctx.quadraticCurveTo(cx, y + bh * 0.7, cx + bw * 0.25, y + bh * 0.8);
  ctx.quadraticCurveTo(cx + bw * 0.3, y + bh * 0.6, cx + bw * 0.15, y + bh * 0.1);
  ctx.closePath();
  ctx.fill();
}

function drawManBun(ctx, cx, box, bw, bh, topY, color) {
  ctx.fillStyle = color;
  const y = topY - bh * 0.1;
  const h = bh * 0.4;
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.3, bw * 0.5, h * 0.5, 0, 0, Math.PI);
  ctx.fill();
  const bunY = y - bh * 0.2;
  ctx.beginPath();
  ctx.ellipse(cx, bunY, bw * 0.2, bh * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCurly(ctx, cx, box, bw, bh, topY, color, r) {
  ctx.fillStyle = color;
  const y = topY - bh * 0.2;
  const h = bh * 0.55;
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.3, bw * 0.55, h * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 20 + r * 15; i++) {
    const bx = cx + (Math.random() - 0.5) * bw * 0.9;
    const by = y + Math.random() * h * 0.7;
    const size = 4 + Math.random() * 8 * r;
    ctx.beginPath();
    ctx.arc(bx, by, size, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.5 + Math.random() * 0.3;
    ctx.stroke();
  }
}

function drawAfro(ctx, cx, box, bw, bh, topY, color, r) {
  const y = topY - bh * 0.25;
  const h = bh * 0.65;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.4, bw * 0.65, h * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 40 + r * 20; i++) {
    const bx = cx + (Math.random() - 0.5) * bw * 1.1;
    const by = y + Math.random() * h;
    const size = 3 + Math.random() * 6 * r;
    ctx.beginPath();
    ctx.arc(bx, by, size, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4 + Math.random() * 0.4;
    ctx.stroke();
  }
}
