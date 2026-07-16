// BlendEngine: produces soft, anti-aliased, feathered edges so assets no longer
// show hard PNG-like boundaries, and preserves underlying skin texture.

import { clamp } from './geometry.js';

// Draw a soft contact shadow from a pre-rendered mask canvas.
// `dir` is light direction (-1..1, + left). Returns nothing; draws onto ctx.
export function drawContactShadow(ctx, maskCanvas, offset, blur, alpha, dir = 0) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.filter = `blur(${blur}px)`;
  ctx.translate(offset.x + dir * 2, offset.y);
  ctx.drawImage(maskCanvas, 0, 0);
  ctx.restore();
}

// Feather the alpha channel of a canvas using a separable box blur on alpha.
// This turns hard edges into soft matte edges (Gaussian-like feather).
export function featherAlpha(canvas, radius) {
  if (radius <= 0) return canvas;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const a = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) a[i] = src.data[i * 4 + 3];

  const tmp = new Float32Array(w * h);
  const r = Math.max(1, Math.round(radius));
  // horizontal pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let count = 0;
      for (let k = -r; k <= r; k++) {
        const xx = x + k;
        if (xx >= 0 && xx < w) {
          sum += a[y * w + xx];
          count++;
        }
      }
      tmp[y * w + x] = sum / count;
    }
  }
  // vertical pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let count = 0;
      for (let k = -r; k <= r; k++) {
        const yy = y + k;
        if (yy >= 0 && yy < h) {
          sum += tmp[yy * w + x];
          count++;
        }
      }
      const v = sum / count;
      const i = (y * w + x) * 4;
      dst.data[i] = src.data[i];
      dst.data[i + 1] = src.data[i + 1];
      dst.data[i + 2] = src.data[i + 2];
      dst.data[i + 3] = clamp(v, 0, 255);
    }
  }
  ctx.putImageData(dst, 0, 0);
  return canvas;
}

// Multiply the alpha of `overlay` by a vertical gradient that fades the bottom
// edge (used to melt hair/beard into skin instead of a straight cut).
export function fadeAlphaVertical(canvas, topFade, bottomFade) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    const t = y / h;
    let factor = 1;
    if (t < topFade) factor = t / topFade;
    else if (t > 1 - bottomFade) factor = (1 - t) / bottomFade;
    factor = clamp(factor, 0, 1);
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      d[i + 3] = d[i + 3] * factor;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

// Composite an offscreen asset canvas onto the main ctx using 'source-over'
// but with a soft 'overlay'-like luminance so skin texture shows through.
export function compositeSoft(ctx, assetCanvas, x = 0, y = 0, globalAlpha = 1) {
  ctx.save();
  ctx.globalAlpha = globalAlpha;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(assetCanvas, x, y);
  ctx.restore();
}

// Re-color a solid mask canvas using a gradient (hair/beard shading pass).
export function tintCanvas(canvas, gradient) {
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  return canvas;
}
