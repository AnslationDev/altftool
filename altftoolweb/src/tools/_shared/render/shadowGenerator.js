"use client";

// ShadowGenerator: produces soft, directionally-correct contact shadows for
// hair-over-forehead, beard-under-lip and glasses-on-nose/cheek. Shadows are
// drawn from a copy of the asset's alpha mask, offset toward the light-reversed
// direction and blurred.

import { featherAlpha } from './blendEngine.js';

// Create a single-channel-ish mask canvas (black silhouette on transparent)
// from any drawn shape on a source canvas.
export function buildMask(sourceCanvas) {
  const out = document.createElement('canvas');
  out.width = sourceCanvas.width;
  out.height = sourceCanvas.height;
  const octx = out.getContext('2d');
  octx.drawImage(sourceCanvas, 0, 0);
  const img = octx.getImageData(0, 0, out.width, out.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3];
    d[i] = 0;
    d[i + 1] = 0;
    d[i + 2] = 0;
    d[i + 3] = a;
  }
  octx.putImageData(img, 0, 0);
  return out;
}

// Cast a soft shadow of `sourceCanvas` onto ctx at full scale.
export function castShadow(ctx, sourceCanvas, { dx, dy, blur = 6, alpha = 0.35 }) {
  const mask = buildMask(sourceCanvas);
  featherAlpha(mask, blur / 2);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.filter = `blur(${blur}px)`;
  ctx.drawImage(mask, dx, dy);
  ctx.restore();
}

// Given a light direction (-1..1, +left), return shadow offset scaled by size.
export function shadowOffset(lightFromLeft, magnitude) {
  const dir = -Math.sign(lightFromLeft || 0.0001);
  return { dx: dir * magnitude * 0.5, dy: magnitude * 0.5 };
}
