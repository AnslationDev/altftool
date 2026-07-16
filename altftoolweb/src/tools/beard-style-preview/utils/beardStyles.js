export const BEARD_STYLES = [
  { id: 'clean-shaven', name: 'Clean Shaven', category: 'none', complexity: 'simple' },
  { id: 'light-stubble', name: 'Light Stubble', category: 'stubble', complexity: 'simple' },
  { id: 'medium-stubble', name: 'Medium Stubble', category: 'stubble', complexity: 'simple' },
  { id: 'heavy-stubble', name: 'Heavy Stubble', category: 'stubble', complexity: 'simple' },
  { id: 'goatee', name: 'Goatee', category: 'partial', complexity: 'medium' },
  { id: 'circle-beard', name: 'Circle Beard', category: 'partial', complexity: 'medium' },
  { id: 'van-dyke', name: 'Van Dyke', category: 'partial', complexity: 'complex' },
  { id: 'balbo', name: 'Balbo', category: 'partial', complexity: 'complex' },
  { id: 'anchor', name: 'Anchor', category: 'partial', complexity: 'complex' },
  { id: 'french-beard', name: 'French Beard', category: 'partial', complexity: 'medium' },
  { id: 'full-beard', name: 'Full Beard', category: 'full', complexity: 'complex' },
  { id: 'garibaldi', name: 'Garibaldi', category: 'full', complexity: 'complex' },
  { id: 'ducktail', name: 'Ducktail', category: 'full', complexity: 'complex' },
  { id: 'corporate', name: 'Corporate Beard', category: 'full', complexity: 'medium' },
  { id: 'bandholz', name: 'Bandholz', category: 'full', complexity: 'complex' },
  { id: 'mutton-chops', name: 'Mutton Chops', category: 'side', complexity: 'complex' },
  { id: 'chin-strap', name: 'Chin Strap', category: 'side', complexity: 'medium' },
  { id: 'soul-patch', name: 'Soul Patch', category: 'minimal', complexity: 'simple' },
  { id: 'handlebar', name: 'Handlebar Combo', category: 'full', complexity: 'complex' },
  { id: 'custom', name: 'Custom', category: 'full', complexity: 'complex' },
];

export const BEARD_COLORS = [
  { name: 'Black', value: '#1a1a1a' },
  { name: 'Brown', value: '#5c3a1e' },
  { name: 'Gray', value: '#9a9a9a' },
  { name: 'Golden', value: '#c4a843' },
  { name: 'White', value: '#e8e8e8' },
  { name: 'Red', value: '#b83a1a' },
  { name: 'Custom', value: '' },
];

export function renderBeardStyle(ctx, style, faceData, options) {
  const { box, landmarks } = faceData;
  const { color, scale, opacity, length, density, darkness, sharpness, rotation } = options;

  ctx.save();
  ctx.globalAlpha = opacity / 100;

  const cx = box.x + box.width / 2;
  const chinY = landmarks.jawline[8]?.y || (box.y + box.height * 0.8);
  const jawPoints = landmarks.jawline;

  const beardMap = {
    'clean-shaven': () => {},
    'light-stubble': (ctx) => drawStubble(ctx, cx, chinY, box, 0.15, color, density),
    'medium-stubble': (ctx) => drawStubble(ctx, cx, chinY, box, 0.3, color, density),
    'heavy-stubble': (ctx) => drawStubble(ctx, cx, chinY, box, 0.5, color, density),
    'goatee': (ctx) => drawGoatee(ctx, cx, chinY, box, color, scale, length, density),
    'circle-beard': (ctx) => drawCircleBeard(ctx, cx, chinY, box, color, scale, length),
    'van-dyke': (ctx) => drawVanDyke(ctx, cx, chinY, box, color, scale, length, jawPoints),
    'balbo': (ctx) => drawBalbo(ctx, cx, chinY, box, color, scale, length, jawPoints),
    'anchor': (ctx) => drawAnchor(ctx, cx, chinY, box, color, scale, length, jawPoints),
    'french-beard': (ctx) => drawFrenchBeard(ctx, cx, chinY, box, color, scale, length, jawPoints),
    'full-beard': (ctx) => drawFullBeard(ctx, cx, chinY, box, color, scale, length, density, jawPoints, darkness),
    'garibaldi': (ctx) => drawGaribaldi(ctx, cx, chinY, box, color, scale, length, density, jawPoints),
    'ducktail': (ctx) => drawDucktail(ctx, cx, chinY, box, color, scale, length, density, jawPoints),
    'corporate': (ctx) => drawCorporate(ctx, cx, chinY, box, color, scale, length, density, jawPoints),
    'bandholz': (ctx) => drawBandholz(ctx, cx, chinY, box, color, scale, length, density, jawPoints),
    'mutton-chops': (ctx) => drawMuttonChops(ctx, cx, chinY, box, color, scale, length, jawPoints),
    'chin-strap': (ctx) => drawChinStrap(ctx, cx, chinY, box, color, scale, length, jawPoints),
    'soul-patch': (ctx) => drawSoulPatch(ctx, cx, chinY, box, color, scale),
    'handlebar': (ctx) => drawHandlebar(ctx, cx, chinY, box, color, scale, length, density, jawPoints),
    'custom': (ctx) => drawFullBeard(ctx, cx, chinY, box, color, scale, length, density, jawPoints, darkness),
  };

  const drawer = beardMap[style] || drawFullBeard;
  drawer(ctx);

  ctx.restore();
}

function getJawWidth(box, jawPoints) {
  if (jawPoints && jawPoints.length >= 17) {
    return Math.abs(jawPoints[16].x - jawPoints[0].x);
  }
  return box.width * 0.85;
}

function getJawLeft(box, jawPoints) {
  if (jawPoints && jawPoints.length > 0) return jawPoints[0].x;
  return box.x + box.width * 0.08;
}

function drawStubble(ctx, cx, chinY, box, intensity, color, density) {
  ctx.save();
  const d = (density || 50) / 100;
  const count = Math.round(80 * intensity * d);
  for (let i = 0; i < count; i++) {
    const x = cx + (Math.random() - 0.5) * box.width * 0.8;
    const y = chinY + Math.random() * box.height * 0.15;
    const len = 1 + Math.random() * 3 * intensity;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 1, y + len);
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.3 + Math.random() * 0.5 * intensity;
    ctx.lineWidth = 1 + Math.random();
    ctx.stroke();
  }
  ctx.restore();
}

function drawGoatee(ctx, cx, chinY, box, color, scale, length, density) {
  const s = (scale || 100) / 100;
  const l = (length || 50) / 100;
  const d = (density || 50) / 100;
  const w = box.width * 0.15 * s;
  const h = box.height * 0.12 * s * (0.5 + l * 0.8);

  ctx.fillStyle = color;
  ctx.globalAlpha = d * 0.85 + 0.15;
  ctx.beginPath();
  ctx.ellipse(cx, chinY + h * 0.3, w, h * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = d * 0.6 + 0.2;
  for (let i = 0; i < 15 * d; i++) {
    const ex = cx + (Math.random() - 0.5) * w * 1.2;
    const ey = chinY + Math.random() * h * 0.6;
    const elen = 1 + Math.random() * 4 * l;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex, ey + elen);
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5 + Math.random() * 1.5;
    ctx.stroke();
  }
}

function drawCircleBeard(ctx, cx, chinY, box, color, scale, length) {
  const s = (scale || 100) / 100;
  const l = (length || 50) / 100;
  const w = box.width * 0.18 * s;
  const h = box.height * 0.15 * s * (0.6 + l * 0.8);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx - w * 0.15, chinY - h * 0.1, w * 0.55, h * 0.5, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, chinY + h * 0.1, w * 0.7, h * 0.6, 0, Math.PI, 0);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.5, chinY - h * 0.3);
  ctx.quadraticCurveTo(cx, chinY - h * 0.4, cx + w * 0.5, chinY - h * 0.3);
  ctx.stroke();
}

function drawVanDyke(ctx, cx, chinY, box, color, scale, length, jawPoints) {
  const s = (scale || 100) / 100;
  const l = (length || 50) / 100;
  const jawW = getJawWidth(box, jawPoints) * s;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - jawW * 0.08, chinY - box.height * 0.02);
  ctx.quadraticCurveTo(cx, chinY - box.height * 0.1, cx + jawW * 0.08, chinY - box.height * 0.02);
  ctx.quadraticCurveTo(cx + jawW * 0.12, chinY + box.height * 0.06, cx + jawW * 0.1, chinY + box.height * 0.12 * l);
  ctx.quadraticCurveTo(cx, chinY + box.height * 0.15 * l, cx - jawW * 0.1, chinY + box.height * 0.12 * l);
  ctx.quadraticCurveTo(cx - jawW * 0.12, chinY + box.height * 0.06, cx - jawW * 0.08, chinY - box.height * 0.02);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.8;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, chinY + box.height * 0.12 * l, jawW * 0.04, box.height * 0.08 * l, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBalbo(ctx, cx, chinY, box, color, scale, length, jawPoints) {
  const s = (scale || 100) / 100;
  const l = (length || 50) / 100;
  const jawW = getJawWidth(box, jawPoints) * s;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - jawW * 0.3, chinY);
  ctx.lineTo(cx - jawW * 0.05, chinY + box.height * 0.08);
  ctx.lineTo(cx + jawW * 0.05, chinY + box.height * 0.08);
  ctx.lineTo(cx + jawW * 0.3, chinY);
  ctx.lineTo(cx + jawW * 0.15, chinY + box.height * 0.1 * l);
  ctx.lineTo(cx, chinY + box.height * 0.14 * l);
  ctx.lineTo(cx - jawW * 0.15, chinY + box.height * 0.1 * l);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.6;
  const mw = jawW * 0.03;
  const mh = box.height * 0.06 * l;
  ctx.beginPath();
  ctx.ellipse(cx, chinY + box.height * 0.12 * l, mw, mh, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawAnchor(ctx, cx, chinY, box, color, scale, length, jawPoints) {
  const s = (scale || 100) / 100;
  const l = (length || 50) / 100;
  const jawW = getJawWidth(box, jawPoints) * s;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - jawW * 0.35, chinY - box.height * 0.03);
  ctx.quadraticCurveTo(cx - jawW * 0.4, chinY + box.height * 0.05, cx - jawW * 0.2, chinY + box.height * 0.08);
  ctx.lineTo(cx - jawW * 0.05, chinY + box.height * 0.06);
  ctx.quadraticCurveTo(cx, chinY + box.height * 0.15 * l, cx + jawW * 0.05, chinY + box.height * 0.06);
  ctx.lineTo(cx + jawW * 0.2, chinY + box.height * 0.08);
  ctx.quadraticCurveTo(cx + jawW * 0.4, chinY + box.height * 0.05, cx + jawW * 0.35, chinY - box.height * 0.03);
  ctx.lineTo(cx + jawW * 0.25, chinY - box.height * 0.02);
  ctx.lineTo(cx + jawW * 0.05, chinY - box.height * 0.01);
  ctx.lineTo(cx - jawW * 0.05, chinY - box.height * 0.01);
  ctx.lineTo(cx - jawW * 0.25, chinY - box.height * 0.02);
  ctx.closePath();
  ctx.fill();
}

function drawFrenchBeard(ctx, cx, chinY, box, color, scale, length, jawPoints) {
  const s = (scale || 100) / 100;
  const l = (length || 50) / 100;
  const jawW = getJawWidth(box, jawPoints) * s;

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.ellipse(cx, chinY + box.height * 0.04, jawW * 0.12, box.height * 0.08 * (0.5 + l * 0.7), 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx - jawW * 0.15, chinY);
  ctx.quadraticCurveTo(cx - jawW * 0.2, chinY + box.height * 0.12 * l, cx - jawW * 0.08, chinY + box.height * 0.15 * l);
  ctx.quadraticCurveTo(cx, chinY + box.height * 0.18 * l, cx + jawW * 0.08, chinY + box.height * 0.15 * l);
  ctx.quadraticCurveTo(cx + jawW * 0.2, chinY + box.height * 0.12 * l, cx + jawW * 0.15, chinY);
  ctx.closePath();
  ctx.fill();
}

function drawFullBeard(ctx, cx, chinY, box, color, scale, length, density, jawPoints, darkness) {
  const s = (scale || 100) / 100;
  const l = (length || 50) / 100;
  const d = (density || 50) / 100;
  const jawW = getJawWidth(box, jawPoints) * s;
  const leftX = getJawLeft(box, jawPoints) + box.width * 0.02;
  const rightX = leftX + jawW;
  const dh = (darkness || 50) / 100;

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.4 + d * 0.5;

  ctx.beginPath();
  ctx.moveTo(leftX, chinY - box.height * 0.05);
  ctx.quadraticCurveTo(leftX - box.width * 0.02, chinY + box.height * 0.1, leftX + jawW * 0.15, chinY + box.height * 0.15 * l);
  ctx.quadraticCurveTo(cx, chinY + box.height * 0.2 * l, rightX - jawW * 0.15, chinY + box.height * 0.15 * l);
  ctx.quadraticCurveTo(rightX + box.width * 0.02, chinY + box.height * 0.1, rightX, chinY - box.height * 0.05);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.15 + d * 0.25;
  for (let i = 0; i < 30 + d * 40; i++) {
    const bx = leftX + Math.random() * jawW;
    const by = chinY - box.height * 0.03 + Math.random() * (box.height * 0.18 * l);
    const hairLen = 2 + Math.random() * 6 * l;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + (Math.random() - 0.5) * 2, by + hairLen);
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.8 + Math.random() * 1.5 * (0.5 + dh * 0.5);
    ctx.stroke();
  }

  ctx.globalAlpha = 0.3 + d * 0.3;
  ctx.fillStyle = color;
  const sideH = box.height * 0.08 * l;
  ctx.beginPath();
  ctx.ellipse(leftX + box.width * 0.02, chinY - box.height * 0.02, box.width * 0.04, sideH, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(rightX - box.width * 0.02, chinY - box.height * 0.02, box.width * 0.04, sideH, -0.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawGaribaldi(ctx, cx, chinY, box, color, scale, length, density, jawPoints) {
  drawFullBeard(ctx, cx, chinY, box, color, scale, length, density, jawPoints, 80);
  const s = (scale || 100) / 100;
  const jawW = getJawWidth(box, jawPoints) * s;
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, chinY + box.height * 0.1 * (length / 100), jawW * 0.12, box.height * 0.06 * (length / 100), 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawDucktail(ctx, cx, chinY, box, color, scale, length, density, jawPoints) {
  const s = (scale || 100) / 100;
  const l = (length || 50) / 100;
  const d = (density || 50) / 100;
  const jawW = getJawWidth(box, jawPoints) * s;
  const leftX = getJawLeft(box, jawPoints);

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.5 + d * 0.4;
  ctx.beginPath();
  ctx.moveTo(leftX, chinY - box.height * 0.03);
  ctx.quadraticCurveTo(leftX - box.width * 0.01, chinY + box.height * 0.08, leftX + jawW * 0.2, chinY + box.height * 0.12 * l);
  ctx.quadraticCurveTo(cx, chinY + box.height * 0.25 * l, leftX + jawW * 0.8, chinY + box.height * 0.12 * l);
  ctx.quadraticCurveTo(leftX + jawW + box.width * 0.01, chinY + box.height * 0.08, leftX + jawW, chinY - box.height * 0.03);
  ctx.closePath();
  ctx.fill();
}

function drawCorporate(ctx, cx, chinY, box, color, scale, length, density, jawPoints) {
  const s = (scale || 100) / 100;
  const l = (length || 50) / 100;
  const d = (density || 50) / 100;
  const jawW = getJawWidth(box, jawPoints) * s;

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.5 + d * 0.3;
  ctx.beginPath();
  ctx.moveTo(cx - jawW * 0.35, chinY - box.height * 0.02);
  ctx.quadraticCurveTo(cx - jawW * 0.4, chinY + box.height * 0.06, cx - jawW * 0.2, chinY + box.height * 0.08 * l);
  ctx.quadraticCurveTo(cx, chinY + box.height * 0.1 * l, cx + jawW * 0.2, chinY + box.height * 0.08 * l);
  ctx.quadraticCurveTo(cx + jawW * 0.4, chinY + box.height * 0.06, cx + jawW * 0.35, chinY - box.height * 0.02);
  ctx.lineTo(cx + jawW * 0.25, chinY - box.height * 0.01);
  ctx.lineTo(cx - jawW * 0.25, chinY - box.height * 0.01);
  ctx.closePath();
  ctx.fill();
}

function drawBandholz(ctx, cx, chinY, box, color, scale, length, density, jawPoints) {
  drawFullBeard(ctx, cx, chinY, box, color, scale, 70, density, jawPoints, 70);
  const s = (scale || 100) / 100;
  const l = (length || 50) / 100;
  const jawW = getJawWidth(box, jawPoints) * s;
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, chinY + box.height * 0.08 * l, jawW * 0.15, box.height * 0.08 * l, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawMuttonChops(ctx, cx, chinY, box, color, scale, length, jawPoints) {
  const s = (scale || 100) / 100;
  const l = (length || 50) / 100;
  const jawW = getJawWidth(box, jawPoints) * s;
  const leftX = getJawLeft(box, jawPoints);

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(leftX + box.width * 0.05, chinY - box.height * 0.05);
  ctx.quadraticCurveTo(leftX, chinY + box.height * 0.08, leftX + jawW * 0.25, chinY + box.height * 0.15 * l);
  ctx.quadraticCurveTo(leftX + jawW * 0.15, chinY + box.height * 0.05, leftX + box.width * 0.08, chinY - box.height * 0.03);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(leftX + jawW - box.width * 0.05, chinY - box.height * 0.05);
  ctx.quadraticCurveTo(leftX + jawW, chinY + box.height * 0.08, leftX + jawW * 0.75, chinY + box.height * 0.15 * l);
  ctx.quadraticCurveTo(leftX + jawW * 0.85, chinY + box.height * 0.05, leftX + jawW - box.width * 0.08, chinY - box.height * 0.03);
  ctx.closePath();
  ctx.fill();
}

function drawChinStrap(ctx, cx, chinY, box, color, scale, length, jawPoints) {
  const s = (scale || 100) / 100;
  const l = (length || 50) / 100;
  const jawW = getJawWidth(box, jawPoints) * s;
  const leftX = getJawLeft(box, jawPoints);

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.8;
  const strapY = chinY + box.height * 0.01;
  const strapH = box.height * 0.025 * s;

  ctx.beginPath();
  ctx.ellipse(cx, strapY, jawW * 0.5, strapH, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(leftX + box.width * 0.02, strapY);
  ctx.lineTo(leftX + box.width * 0.02, chinY - box.height * 0.08);
  ctx.lineTo(leftX + box.width * 0.07, chinY - box.height * 0.08);
  ctx.lineTo(leftX + box.width * 0.07, strapY);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(leftX + jawW - box.width * 0.02, strapY);
  ctx.lineTo(leftX + jawW - box.width * 0.02, chinY - box.height * 0.08);
  ctx.lineTo(leftX + jawW - box.width * 0.07, chinY - box.height * 0.08);
  ctx.lineTo(leftX + jawW - box.width * 0.07, strapY);
  ctx.closePath();
  ctx.fill();
}

function drawSoulPatch(ctx, cx, chinY, box, color, scale) {
  const s = (scale || 100) / 100;
  const w = box.width * 0.04 * s;
  const h = box.height * 0.05 * s;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, chinY + h * 0.2, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHandlebar(ctx, cx, chinY, box, color, scale, length, density, jawPoints) {
  const s = (scale || 100) / 100;
  const l = (length || 50) / 100;
  const d = (density || 50) / 100;
  const jawW = getJawWidth(box, jawPoints) * s;

  drawFullBeard(ctx, cx, chinY, box, color, scale, length, density, jawPoints, 60);

  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3 * s;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(cx - jawW * 0.2, chinY);
  ctx.quadraticCurveTo(cx - jawW * 0.35, chinY - box.height * 0.02, cx - jawW * 0.3, chinY + box.height * 0.02);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + jawW * 0.2, chinY);
  ctx.quadraticCurveTo(cx + jawW * 0.35, chinY - box.height * 0.02, cx + jawW * 0.3, chinY + box.height * 0.02);
  ctx.stroke();
}
