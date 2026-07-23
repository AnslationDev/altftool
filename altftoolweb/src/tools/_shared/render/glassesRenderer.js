"use client";

// GlassesRenderer: snaps frames onto the eye centers + nose bridge, warps them
// with head pose (roll/yaw/pitch) for true perspective, draws realistic lens
// tint/reflection/transparency, frame lighting, and a soft contact shadow on
// the nose + cheeks. Frames wrap naturally and do not float above the face.

import { clamp, midpoint, dist } from './geometry.js';
import { featherAlpha, compositeSoft } from './blendEngine.js';
import { castShadow, shadowOffset } from './shadowGenerator.js';
import { hexToRgb } from './colorMatcher.js';

function lensColorToRgba(lensColor, transparency) {
  if (!lensColor || lensColor === 'gradient') {
    // handled separately
    return null;
  }
  if (lensColor.startsWith('rgba')) {
    return lensColor;
  }
  const { r, g, b } = hexToRgb(lensColor);
  return `rgba(${r}, ${g}, ${b}, ${clamp(transparency / 100, 0, 0.9)})`;
}

function drawLensShape(ctx, cx, cy, lw, lh, styleKind) {
  // Returns nothing; assumes ctx has already begun a path region via clip.
  ctx.beginPath();
  switch (styleKind) {
    case 'round':
    case 'retro':
      ctx.ellipse(cx, cy, lw * 0.5, lh * 0.5, 0, 0, Math.PI * 2);
      break;
    case 'square':
    case 'rectangle':
    case 'reading':
    case 'kids': {
      const x = cx - lw / 2;
      const y = cy - lh / 2;
      ctx.moveTo(x + lw * 0.12, y);
      ctx.quadraticCurveTo(x, y, x, y + lh * 0.12);
      ctx.lineTo(x, y + lh * 0.88);
      ctx.quadraticCurveTo(x, y + lh, x + lw * 0.12, y + lh);
      ctx.lineTo(x + lw * 0.88, y + lh);
      ctx.quadraticCurveTo(x + lw, y + lh, x + lw, y + lh * 0.88);
      ctx.lineTo(x + lw, y + lh * 0.12);
      ctx.quadraticCurveTo(x + lw, y, x + lw * 0.88, y);
      ctx.closePath();
      break;
    }
    case 'oval': {
      const oh = lh * 0.7;
      ctx.ellipse(cx, cy, lw * 0.5, oh * 0.5, 0, 0, Math.PI * 2);
      break;
    }
    case 'aviator':
    case 'sunglasses': {
      const aw = lw * 0.5;
      const ah = lh * 0.6;
      ctx.moveTo(cx - aw, cy - ah * 0.2);
      ctx.quadraticCurveTo(cx - aw, cy + ah * 0.8, cx, cy + ah * 0.3);
      ctx.quadraticCurveTo(cx + aw, cy + ah * 0.8, cx + aw, cy - ah * 0.2);
      ctx.closePath();
      break;
    }
    case 'wayfarer':
    case 'luxury': {
      const ww = lw * 0.55;
      const wh = lh * 0.55;
      ctx.moveTo(cx - ww * 0.8, cy - wh * 0.3);
      ctx.quadraticCurveTo(cx - ww, cy + wh * 0.1, cx - ww * 0.7, cy + wh * 0.6);
      ctx.quadraticCurveTo(cx, cy + wh * 0.8, cx + ww * 0.7, cy + wh * 0.6);
      ctx.quadraticCurveTo(cx + ww, cy + wh * 0.1, cx + ww * 0.8, cy - wh * 0.3);
      ctx.closePath();
      break;
    }
    case 'cat-eye':
    case 'fashion': {
      const cw = lw * 0.5;
      const ch = lh * 0.55;
      ctx.moveTo(cx - cw * 0.7, cy - ch * 0.1);
      ctx.quadraticCurveTo(cx - cw * 0.9, cy + ch * 0.1, cx - cw * 0.7, cy + ch * 0.6);
      ctx.quadraticCurveTo(cx - cw * 0.1, cy + ch * 0.9, cx + cw * 0.5, cy + ch * 0.5);
      ctx.quadraticCurveTo(cx + cw * 0.9, cy + ch * 0.15, cx + cw * 0.8, cy - ch * 0.3);
      ctx.quadraticCurveTo(cx + cw * 0.2, cy - ch * 0.2, cx, cy - ch * 0.1);
      ctx.closePath();
      break;
    }
    case 'clubmaster': {
      const cw = lw * 0.5;
      const ch = lh * 0.5;
      ctx.moveTo(cx - cw * 0.8, cy - ch * 0.3);
      ctx.quadraticCurveTo(cx - cw * 0.9, cy + ch * 0.1, cx - cw * 0.7, cy + ch * 0.5);
      ctx.quadraticCurveTo(cx + cw * 0.8, cy + ch * 0.4, cx + cw * 0.7, cy - ch * 0.3);
      ctx.closePath();
      break;
    }
    case 'sports':
    case 'gaming': {
      const sw = lw * 0.6;
      const sh = lh * 0.55;
      ctx.moveTo(cx - sw * 0.7, cy - sh * 0.3);
      ctx.quadraticCurveTo(cx - sw * 0.9, cy + sh * 0.2, cx - sw * 0.6, cy + sh * 0.6);
      ctx.quadraticCurveTo(cx, cy + sh * 0.7, cx + sw * 0.6, cy + sh * 0.6);
      ctx.quadraticCurveTo(cx + sw * 0.9, cy + sh * 0.2, cx + sw * 0.7, cy - sh * 0.3);
      ctx.closePath();
      break;
    }
    case 'oversized': {
      const ow = lw * 0.8;
      const oh = lh * 0.8;
      ctx.ellipse(cx, cy, ow * 0.5, oh * 0.5, 0, 0, Math.PI * 2);
      break;
    }
    case 'rimless':
    case 'blue-light':
    default:
      ctx.ellipse(cx, cy, lw * 0.5, lh * 0.5, 0, 0, Math.PI * 2);
      break;
  }
}

export function renderGlasses(ctx, style, face, options) {
  const {
    frameColor = '#1a1a1a',
    lensColor = 'rgba(255,255,255,0.15)',
    frameWidth = 50,
    height = 50,
    rotation = 180,
    lensTransparency = 50,
    scale = 100,
    bridgeWidth = 50,
    reflection = 50,
  } = options;

  const lighting = face.lighting || {
    brightness: 1,
    contrast: 1,
    lightFromLeft: 0.2,
    shadowStrength: 0.5,
    meanColor: { r: 128, g: 128, b: 128 },
  };

  const leftEye = face.leftEye;
  const rightEye = face.rightEye;
  const eyeCenter = face.eyeCenter || midpoint(leftEye, rightEye);
  const eyeDist = face.eyeDistance || dist(leftEye, rightEye);
  const noseBridge = face.noseTip || face.landmarks?.noseBridge?.[0] || eyeCenter;

  const s = scale / 100;
  const lw = eyeDist * 0.95 * s;
  const lh = (height / 100) * eyeDist * 0.7 * s;
  const fw = clamp((frameWidth / 100) * 10 + 2.5, 2.5, 14) * s;
  const bridgeW = eyeDist * 0.22 * (bridgeWidth / 50) * s;

  const styleKind = style;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const layer = document.createElement('canvas');
  layer.width = W;
  layer.height = H;
  const lctx = layer.getContext('2d');

  // Apply head pose transform so glasses wrap with the face.
  lctx.save();
  const cx0 = eyeCenter.x;
  const cy0 = eyeCenter.y;
  lctx.translate(cx0, cy0);
  lctx.rotate(face.pose.roll + ((rotation - 180) * Math.PI) / 180 * 0.12);
  lctx.scale(1 - Math.min(0.35, Math.abs(face.pose.yaw) * 0.7), 1 - Math.min(0.2, Math.abs(face.pose.pitch) * 0.5));
  lctx.translate(-cx0, -cy0);

  const lx = eyeCenter.x - eyeDist / 2;
  const rx = eyeCenter.x + eyeDist / 2;

  // --- Lenses (tint + reflection) ---
  const lensAlpha = clamp(lensTransparency / 100, 0, 0.92);
  if (lensAlpha > 0.01) {
    for (const [ex, ey] of [[lx, cy0], [rx, cy0]]) {
      lctx.save();
      drawLensShape(lctx, ex, ey, lw, lh, styleKind);
      lctx.clip();
      if (lensColor === 'gradient') {
        const g = lctx.createLinearGradient(ex - lw / 2, ey - lh / 2, ex + lw / 2, ey + lh / 2);
        g.addColorStop(0, `rgba(59,130,246,${lensAlpha * 0.5})`);
        g.addColorStop(0.5, `rgba(168,85,247,${lensAlpha * 0.5})`);
        g.addColorStop(1, `rgba(236,72,153,${lensAlpha * 0.5})`);
        lctx.fillStyle = g;
      } else {
        lctx.fillStyle = lensColorToRgba(lensColor, lensTransparency) || `rgba(255,255,255,${lensAlpha * 0.4})`;
      }
      lctx.fillRect(ex - lw, ey - lh, lw * 2, lh * 2);

      // Lens reflection highlight (top-left band), scaled by reflection control.
      const refA = clamp(reflection / 100, 0, 1) * 0.5;
      lctx.globalAlpha = refA;
      const rg = lctx.createLinearGradient(ex - lw / 2, ey - lh / 2, ex + lw / 4, ey + lh / 4);
      rg.addColorStop(0, 'rgba(255,255,255,0.9)');
      rg.addColorStop(0.4, 'rgba(255,255,255,0.1)');
      rg.addColorStop(1, 'rgba(255,255,255,0)');
      lctx.fillStyle = rg;
      lctx.fillRect(ex - lw / 2, ey - lh / 2, lw * 0.75, lh);
      lctx.restore();
    }
  }

  // --- Frame outline ---
  lctx.strokeStyle = resolveFrame(frameColor, lighting);
  lctx.lineWidth = fw;
  lctx.lineJoin = 'round';
  lctx.lineCap = 'round';
  for (const [ex, ey] of [[lx, cy0], [rx, cy0]]) {
    drawLensShape(lctx, ex, ey, lw, lh, styleKind);
    lctx.stroke();
  }

  // --- Bridge ---
  if (styleKind !== 'rimless' && styleKind !== 'blue-light') {
    lctx.beginPath();
    lctx.moveTo(lx + lw * 0.45, cy0 - lh * 0.05);
    lctx.quadraticCurveTo(eyeCenter.x, cy0 - lh * 0.18, rx - lw * 0.45, cy0 - lh * 0.05);
    lctx.stroke();
  }

  // --- Temple arms toward ears ---
  const earY = (face.landmarks?.jawline?.[0]?.y || cy0) + lh * 0.1;
  const earL = face.landmarks?.jawline?.[0] || { x: lx - lw * 0.4, y: earY };
  const earR = face.landmarks?.jawline?.[16] || { x: rx + lw * 0.4, y: earY };
  lctx.beginPath();
  lctx.moveTo(lx - lw * 0.45, cy0 - lh * 0.05);
  lctx.quadraticCurveTo(earL.x + eyeDist * 0.1, cy0, earL.x, earL.y);
  lctx.stroke();
  lctx.beginPath();
  lctx.moveTo(rx + lw * 0.45, cy0 - lh * 0.05);
  lctx.quadraticCurveTo(earR.x - eyeDist * 0.1, cy0, earR.x, earR.y);
  lctx.stroke();

  // --- Frame top highlight (lighting) ---
  lctx.globalAlpha = 0.35 * lighting.brightness;
  lctx.strokeStyle = 'rgba(255,255,255,0.8)';
  lctx.lineWidth = Math.max(0.6, fw * 0.25);
  for (const [ex, ey] of [[lx, cy0], [rx, cy0]]) {
    drawLensShape(lctx, ex, ey, lw, lh, styleKind);
    lctx.save();
    lctx.clip();
    lctx.beginPath();
    lctx.moveTo(ex - lw * 0.45, ey - lh * 0.3);
    lctx.lineTo(ex + lw * 0.2, ey - lh * 0.3);
    lctx.stroke();
    lctx.restore();
  }
  lctx.restore();

  // Feather to avoid hard edge aliasing, then soft nose/cheek shadow.
  featherAlpha(layer, Math.max(1, face.box.width * 0.002));
  const off = shadowOffset(lighting.lightFromLeft, face.box.width * 0.008);
  castShadow(ctx, layer, {
    dx: off.dx,
    dy: off.dy + face.box.height * 0.005,
    blur: face.box.width * 0.01,
    alpha: 0.2 * lighting.shadowStrength,
  });

  compositeSoft(ctx, layer, 0, 0, 1);
}

function resolveFrame(frameColor, lighting) {
  if (!frameColor || frameColor === 'rgba(200,200,200,0.3)' || frameColor === 'transparent') {
    return 'rgba(40,40,40,0.85)';
  }
  if (frameColor.startsWith('rgba') || frameColor.startsWith('rgb')) return frameColor;
  const { r, g, b } = hexToRgb(frameColor);
  const lift = (lighting.brightness - 1) * 20;
  return `rgb(${clamp(r + lift, 0, 255)}, ${clamp(g + lift, 0, 255)}, ${clamp(b + lift, 0, 255)})`;
}
