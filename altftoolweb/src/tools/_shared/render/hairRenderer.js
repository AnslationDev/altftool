// HairRenderer: renders hair as a naturally-grown, lighting-matched,
// perspective-warped mass that follows the detected hairline instead of a
// flat sticker. Edges are feathered and a soft contact shadow falls on the
// forehead. This is the module the hairstyle utils delegate to.

import {
  buildPath,
  clamp,
  lerpPoint,
  makeRng,
  catmullRom,
} from './geometry.js';
import { matchHairColor, hairShadeGradient } from './colorMatcher.js';
import { featherAlpha, fadeAlphaVertical, compositeSoft } from './blendEngine.js';
import { castShadow, shadowOffset } from './shadowGenerator.js';

// Hair silhouette points for a given style, in a unit space roughly spanning
// the forehead/head. Returns an array of {x,y} in absolute image coordinates
// already placed relative to the hairline + head.
function buildHairSilhouette(face, style, opts) {
  const { hairline, box, landmarks } = face;
  const leftTemple = hairline[0];
  const rightTemple = hairline[6];
  const topMid = hairline[3];
  const headTop = {
    x: topMid.x,
    y: box.y - box.height * (0.55 + opts.length * 0.012),
  };
  const sideDrop = box.height * (0.18 + opts.length * 0.006);

  const shapeFor = {
    buzz: 'cap',
    fade: 'cap',
    crew: 'cap',
    'french-crop': 'cap',
    pompadour: 'volume',
    quiff: 'volume',
    undercut: 'volume',
    'side-part': 'volume',
    'middle-part': 'volume',
    curtains: 'volume',
    'slick-back': 'volume',
    'comb-over': 'volume',
    messy: 'volume',
    spiky: 'volume',
    long: 'long',
    'wolf-cut': 'long',
    mullet: 'long',
    'man-bun': 'bun',
    curly: 'volume',
    afro: 'afro',
    bald: 'none',
  };
  const kind = shapeFor[style] || 'cap';
  if (kind === 'none') return null;

  let pts;
  if (kind === 'cap') {
    pts = [
      leftTemple,
      { x: lerpPoint(leftTemple, topMid, 0.4).x, y: box.y - box.height * 0.42 },
      { x: topMid.x - box.width * 0.1, y: headTop.y + box.height * 0.05 },
      headTop,
      { x: topMid.x + box.width * 0.1, y: headTop.y + box.height * 0.05 },
      { x: lerpPoint(rightTemple, topMid, 0.4).x, y: box.y - box.height * 0.42 },
      rightTemple,
    ];
  } else if (kind === 'volume') {
    const lift = box.height * (0.12 + opts.volume * 0.004);
    pts = [
      leftTemple,
      { x: leftTemple.x - box.width * 0.04, y: box.y - box.height * 0.55 },
      { x: topMid.x - box.width * 0.25, y: headTop.y - lift * 0.4 },
      { x: topMid.x, y: headTop.y - lift },
      { x: topMid.x + box.width * 0.25, y: headTop.y - lift * 0.4 },
      { x: rightTemple.x + box.width * 0.04, y: box.y - box.height * 0.55 },
      rightTemple,
    ];
  } else if (kind === 'long') {
    const dropL = { x: leftTemple.x - box.width * 0.06, y: box.y + sideDrop };
    const dropR = { x: rightTemple.x + box.width * 0.06, y: box.y + sideDrop };
    pts = [
      leftTemple,
      { x: leftTemple.x - box.width * 0.05, y: box.y - box.height * 0.6 },
      { x: topMid.x, y: headTop.y - box.height * 0.1 },
      { x: rightTemple.x + box.width * 0.05, y: box.y - box.height * 0.6 },
      rightTemple,
      dropR,
      { x: rightTemple.x + box.width * 0.02, y: box.y + sideDrop * 0.5 },
      { x: topMid.x, y: box.y + sideDrop * 0.6 },
      { x: leftTemple.x - box.width * 0.02, y: box.y + sideDrop * 0.5 },
      dropL,
    ];
  } else if (kind === 'bun') {
    pts = [
      leftTemple,
      { x: topMid.x - box.width * 0.18, y: box.y - box.height * 0.5 },
      { x: topMid.x, y: box.y - box.height * 0.62 },
      { x: topMid.x + box.width * 0.18, y: box.y - box.height * 0.5 },
      rightTemple,
    ];
  } else if (kind === 'afro') {
    const r = box.width * 0.62;
    pts = [];
    const c = { x: topMid.x, y: box.y - box.height * 0.2 };
    for (let i = 0; i <= 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const wob = 0.85 + Math.sin(a * 3) * 0.12;
      pts.push({
        x: c.x + Math.cos(a) * r * wob,
        y: c.y + Math.sin(a) * r * wob * 0.9,
      });
    }
  }
  return { pts, kind, headTop, leftTemple, rightTemple, topMid };
}

function boundingBox(pts) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function drawStrands(ctx, sil, face, opts, color, rng) {
  // Add subtle strand texture following head curvature for realism.
  const { pts, kind } = sil;
  if (kind === 'none') return;
  const bbox = boundingBox(pts);
  const smooth = catmullRom(pts, 6);
  const count = Math.round(40 + opts.density * 0.8);
  ctx.save();
  buildPath(ctx, pts, true);
  ctx.clip();
  for (let i = 0; i < count; i++) {
    const t = rng();
    const base = smooth[Math.min(smooth.length - 1, Math.floor(t * smooth.length))];
    const x = base.x + (rng() - 0.5) * bbox.w * 0.3;
    const y = bbox.y + rng() * bbox.h * 0.5;
    const len = bbox.h * (0.08 + rng() * 0.22) * (kind === 'long' ? 1.8 : 1);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + (rng() - 0.5) * 20,
      y + len * 0.5,
      x + (rng() - 0.5) * 30,
      y + len
    );
    ctx.strokeStyle = rng() > 0.5 ? color.shade : color.css;
    ctx.globalAlpha = 0.12 + rng() * 0.18;
    ctx.lineWidth = 0.8 + rng() * (1.5 + opts.thickness * 0.03);
    ctx.stroke();
  }
  ctx.restore();
}

export function renderHair(ctx, style, face, options) {
  const {
    color = '#1a1a1a',
    scale = 100,
    rotation = 180,
    opacity = 100,
    thickness = 50,
    density = 50,
    length = 100,
    volume = 50,
    shine = 50,
  } = options;

  if (style === 'bald') return;

  const lighting = face.lighting || {
    brightness: 1,
    contrast: 1,
    lightFromLeft: 0.2,
    shadowStrength: 0.5,
    saturation: 1,
    meanColor: { r: 128, g: 128, b: 128 },
  };
  const colorMatched = matchHairColor(color, lighting, { shine: shine / 100 });

  const opts = { scale, length, density, thickness, volume };
  const sil = buildHairSilhouette(face, style, opts);
  if (!sil) return;

  // Offscreen canvas at full resolution for feathering.
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const layer = document.createElement('canvas');
  layer.width = W;
  layer.height = H;
  const lctx = layer.getContext('2d');

  // Apply head roll + slight yaw foreshortening via transform.
  const roll = face.pose.roll + ((rotation - 180) * Math.PI) / 180 * 0.15;
  lctx.save();
  const center = { x: face.box.x + face.box.width / 2, y: face.box.y };
  lctx.translate(center.x, center.y);
  lctx.rotate(roll);
  lctx.scale((scale / 100) * (1 - Math.min(0.35, Math.abs(face.pose.yaw) * 0.8)), 1);
  lctx.translate(-center.x, -center.y);

  // Fill silhouette with vertical shading gradient (root dark -> tip lit).
  buildPath(lctx, sil.pts, true);
  const grad = hairShadeGradient(
    lctx,
    { x: sil.topMid.x, y: sil.topMid.y - face.box.height * 0.4 },
    { x: sil.topMid.x, y: sil.topMid.y + face.box.height * 0.2 },
    colorMatched,
    colorMatched.shade
  );
  lctx.fillStyle = grad;
  lctx.fill();

  // Strand texture (deterministic per face+style so no flicker on re-render).
  const rng = makeRng(
    Math.round(face.box.x * 13 + face.box.y * 7 + style.length * 31)
  );
  drawStrands(lctx, sil, face, opts, colorMatched, rng);
  lctx.restore();

  // Feather edges + melt the bottom into forehead.
  featherAlpha(layer, Math.max(2, face.box.width * 0.006));
  fadeAlphaVertical(layer, 0.0, 0.12);

  // Soft contact shadow on the forehead (cast before compositing hair).
  const off = shadowOffset(lighting.lightFromLeft, face.box.width * 0.02);
  castShadow(ctx, layer, {
    dx: off.dx,
    dy: off.dy - face.box.height * 0.01,
    blur: face.box.width * 0.02,
    alpha: 0.18 * lighting.shadowStrength,
  });

  // Composite hair with user opacity.
  compositeSoft(ctx, layer, 0, 0, clamp(opacity / 100, 0, 1));
}
