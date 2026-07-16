// BeardRenderer: renders facial hair that follows the jawline, chin, neck and
// lip contour, blends with skin, adapts to face shape, and gets a soft under-
// lip shadow + feathered edges so it never floats.

import { buildPath, clamp, makeRng } from './geometry.js';
import { matchBeardColor } from './colorMatcher.js';
import { featherAlpha, fadeAlphaVertical, compositeSoft } from './blendEngine.js';
import { castShadow, shadowOffset } from './shadowGenerator.js';

// Build the beard outline for a style from the jawline + lip contour.
function buildBeardOutline(face, style, opts) {
  const { landmarks, chin, lipCenter, box } = face;
  const jaw = landmarks.jawline;
  if (!jaw || jaw.length < 17) return null;

  // Jaw contour (both sides) plus a downward neck extension.
  const leftJaw = jaw[0];
  const rightJaw = jaw[16];
  const leftMid = jaw[4];
  const rightMid = jaw[12];
  const neckDrop = box.height * (0.05 + opts.length * 0.004);
  const leftCheek = jaw[2];
  const rightCheek = jaw[14];

  const full = [
    { x: leftJaw.x, y: leftJaw.y },
    { x: leftCheek.x - box.width * 0.01, y: leftCheek.y - box.height * 0.01 },
    { x: leftMid.x, y: leftMid.y + box.height * 0.02 },
    { x: lipCenter.x - box.width * 0.06, y: lipCenter.y + box.height * 0.01 },
    { x: lipCenter.x, y: lipCenter.y + box.height * 0.02 },
    { x: lipCenter.x + box.width * 0.06, y: lipCenter.y + box.height * 0.01 },
    { x: rightMid.x, y: rightMid.y + box.height * 0.02 },
    { x: rightCheek.x + box.width * 0.01, y: rightCheek.y - box.height * 0.01 },
    { x: rightJaw.x, y: rightJaw.y },
    // neck underside
    { x: rightJaw.x + box.width * 0.02, y: rightJaw.y + neckDrop },
    { x: lipCenter.x, y: chin.y + neckDrop * 1.15 },
    { x: leftJaw.x - box.width * 0.02, y: leftJaw.y + neckDrop },
  ];

  const goateeOutline = [
    { x: lipCenter.x - box.width * 0.05, y: lipCenter.y + box.height * 0.01 },
    { x: lipCenter.x, y: lipCenter.y + box.height * 0.02 },
    { x: lipCenter.x + box.width * 0.05, y: lipCenter.y + box.height * 0.01 },
    { x: chin.x + box.width * 0.04, y: chin.y - box.height * 0.01 },
    { x: chin.x, y: chin.y + box.height * 0.04 * (0.5 + opts.length / 100) },
    { x: chin.x - box.width * 0.04, y: chin.y - box.height * 0.01 },
  ];

  const stubbleOnly = false;

  const map = {
    'clean-shaven': null,
    'light-stubble': 'stubble',
    'medium-stubble': 'stubble',
    'heavy-stubble': 'stubble',
    goatee: 'goatee',
    'circle-beard': 'full',
    'van-dyke': 'goatee',
    balbo: 'goatee',
    anchor: 'goatee',
    'french-beard': 'goatee',
    'full-beard': 'full',
    garibaldi: 'full',
    ducktail: 'full',
    corporate: 'full',
    bandholz: 'full',
    'mutton-chops': 'chops',
    'chin-strap': 'strap',
    'soul-patch': 'soul',
    handlebar: 'full',
    custom: 'full',
  };
  const kind = map[style] || 'full';
  if (kind === null) return null;

  let pts = full;
  if (kind === 'goatee') pts = goateeOutline;
  else if (kind === 'soul') pts = goateeOutline;
  else if (kind === 'chops') {
    pts = [
      ...full.slice(0, 5),
      { x: lipCenter.x + box.width * 0.06, y: lipCenter.y + box.height * 0.01 },
      rightMid,
      rightCheek,
      rightJaw,
      { x: rightJaw.x + box.width * 0.02, y: rightJaw.y + neckDrop },
      { x: rightJaw.x - box.width * 0.04, y: rightJaw.y + neckDrop * 0.5 },
      { x: lipCenter.x + box.width * 0.02, y: lipCenter.y + box.height * 0.005 },
      { x: lipCenter.x - box.width * 0.02, y: lipCenter.y + box.height * 0.005 },
      { x: leftJaw.x + box.width * 0.04, y: leftJaw.y + neckDrop * 0.5 },
      { x: leftJaw.x - box.width * 0.02, y: leftJaw.y + neckDrop },
      leftJaw,
    ];
  } else if (kind === 'strap') {
    pts = [
      leftJaw,
      leftCheek,
      leftMid,
      { x: lipCenter.x - box.width * 0.06, y: lipCenter.y + box.height * 0.005 },
      { x: lipCenter.x + box.width * 0.06, y: lipCenter.y + box.height * 0.005 },
      rightMid,
      rightCheek,
      rightJaw,
    ];
  }

  return { pts, kind };
}

function drawStubbleTexture(layer, face, opts, color, rng, intensity) {
  const { landmarks, box } = face;
  const jaw = landmarks.jawline;
  const lip = face.lipCenter;
  const region = [
    ...jaw,
    { x: lip.x - box.width * 0.12, y: lip.y },
    lip,
    { x: lip.x + box.width * 0.12, y: lip.y },
  ];
  buildPath(layer.getContext('2d'), region, true);
  const ctx = layer.getContext('2d');
  ctx.save();
  ctx.clip();
  const count = Math.round((120 + opts.density * 2) * intensity);
  for (let i = 0; i < count; i++) {
    const x = face.box.x + rng() * face.box.width;
    const y = face.box.y + face.box.height * 0.45 + rng() * face.box.height * 0.4;
    const len = 1 + rng() * 3 * intensity;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rng() - 0.5), y + len);
    ctx.strokeStyle = color.css;
    ctx.globalAlpha = 0.25 + rng() * 0.5 * intensity;
    ctx.lineWidth = 0.6 + rng();
    ctx.stroke();
  }
  ctx.restore();
}

export function renderBeard(ctx, style, face, options) {
  const {
    color = '#5c3a1e',
    scale = 100,
    opacity = 100,
    length = 50,
    density = 50,
    darkness = 50,
    sharpness = 50,
  } = options;

  if (style === 'clean-shaven') return;

  const lighting = face.lighting || {
    brightness: 1,
    contrast: 1,
    lightFromLeft: 0.2,
    shadowStrength: 0.5,
    saturation: 1,
    meanColor: { r: 128, g: 128, b: 128 },
  };
  const colorMatched = matchBeardColor(color, lighting);
  const dh = darkness / 100;
  const opts = { scale, length, density, darkness, sharpness };

  const out = buildBeardOutline(face, style, opts);
  if (!out) return;
  const { pts, kind } = out;

  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const layer = document.createElement('canvas');
  layer.width = W;
  layer.height = H;
  const lctx = layer.getContext('2d');

  lctx.save();
  lctx.globalAlpha = clamp((opacity / 100) * (0.55 + density / 200), 0, 1);
  buildPath(lctx, pts, true);
  // vertical shading: lighter at cheeks, deeper at neck/shadow.
  const grad = lctx.createLinearGradient(
    face.box.x,
    face.lipCenter.y,
    face.box.x,
    face.chin.y + face.box.height * 0.15
  );
  grad.addColorStop(0, colorMatched.css);
  grad.addColorStop(1, colorMatched.shade);
  lctx.fillStyle = grad;
  lctx.fill();
  lctx.restore();

  const rng = makeRng(Math.round(face.box.x * 17 + face.box.y * 5 + style.length * 23));

  if (kind === 'stubble') {
    const intensity = style === 'light-stubble' ? 0.2 : style === 'medium-stubble' ? 0.4 : 0.65;
    drawStubbleTexture(layer, face, opts, colorMatched, rng, intensity);
  } else {
    // Hair strand density for full/goatee styles.
    lctx.save();
    buildPath(lctx, pts, true);
    lctx.clip();
    const count = Math.round(60 + density * 1.2);
    for (let i = 0; i < count; i++) {
      const x = face.box.x + rng() * face.box.width;
      const y = face.box.y + face.box.height * 0.5 + rng() * face.box.height * 0.35;
      const len = 2 + rng() * 6 * (length / 100);
      lctx.beginPath();
      lctx.moveTo(x, y);
      lctx.lineTo(x + (rng() - 0.5) * 2, y + len);
      lctx.strokeStyle = rng() > 0.5 ? colorMatched.shade : colorMatched.css;
      lctx.globalAlpha = 0.12 + rng() * 0.2 * (0.5 + dh * 0.5);
      lctx.lineWidth = 0.8 + rng() * 1.5 * (0.5 + dh * 0.5);
      lctx.stroke();
    }
    lctx.restore();
  }

  // Feather + fade bottom edge into neck.
  featherAlpha(layer, Math.max(1.5, face.box.width * 0.004));
  fadeAlphaVertical(layer, 0.0, 0.1);

  // Soft shadow under the lip / on the neck.
  const off = shadowOffset(lighting.lightFromLeft, face.box.width * 0.012);
  castShadow(ctx, layer, {
    dx: off.dx,
    dy: off.dy + face.box.height * 0.01,
    blur: face.box.width * 0.015,
    alpha: 0.22 * lighting.shadowStrength,
  });

  compositeSoft(ctx, layer, 0, 0, clamp(opacity / 100, 0, 1));
}
