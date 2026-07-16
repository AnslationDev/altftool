// ExportEngine: renders the final composite at the device pixel ratio (retina)
// and supports upscaled hi-res / 4K export without re-detecting the face.

export function createHiResCanvas(sourceCanvas, scale = 1) {
  const out = document.createElement('canvas');
  out.width = Math.round(sourceCanvas.width * scale);
  out.height = Math.round(sourceCanvas.height * scale);
  const ctx = out.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sourceCanvas, 0, 0, out.width, out.height);
  return out;
}

export async function exportCanvas(canvas, { type = 'png', quality = 0.95 } = {}) {
  const mime = type === 'jpg' ? 'image/jpeg' : 'image/png';
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mime, quality);
  });
}

// Choose an upscale factor that keeps the longest side under `maxDim`
// (e.g. 3840 for 4K) but at least at devicePixelRatio for retina crispness.
export function pickScale(width, height, maxDim = 3840, minDpr = 1) {
  const longest = Math.max(width, height);
  const fit = maxDim / longest;
  return clampNum(Math.max(minDpr, Math.min(fit, 4)), 1, 4);
}

function clampNum(v, a, b) {
  return v < a ? a : v > b ? b : v;
}
