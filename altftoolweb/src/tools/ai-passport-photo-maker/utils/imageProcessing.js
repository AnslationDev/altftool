export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

export function getImageData(canvas, ctx) {
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export function applyAdjustments(ctx, width, height, adjustments) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const b = adjustments.brightness || 0;
  const c = adjustments.contrast || 0;
  const s = adjustments.saturation || 0;

  const contrastFactor = (100 + c) / 100;
  contrastFactor *= contrastFactor;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let bVal = data[i + 2];

    if (b !== 0) {
      r += b;
      g += b;
      bVal += b;
    }

    if (c !== 0) {
      r = ((r / 255 - 0.5) * contrastFactor + 0.5) * 255;
      g = ((g / 255 - 0.5) * contrastFactor + 0.5) * 255;
      bVal = ((bVal / 255 - 0.5) * contrastFactor + 0.5) * 255;
    }

    if (s !== 0) {
      const gray = 0.2989 * r + 0.587 * g + 0.114 * bVal;
      const satFactor = 1 + s / 100;
      r = gray + (r - gray) * satFactor;
      g = gray + (g - gray) * satFactor;
      bVal = gray + (bVal - gray) * satFactor;
    }

    data[i] = Math.max(0, Math.min(255, Math.round(r)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(bVal)));
  }

  ctx.putImageData(imageData, 0, 0);
}

export function compositeImage(canvas, image, adjustments, background, template) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  if (background && background !== 'transparent' && background !== 'blur' && background !== 'gradient') {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);
  }

  if (adjustments.rotation) {
    const rad = (adjustments.rotation * Math.PI) / 180;
    ctx.translate(w / 2, h / 2);
    ctx.rotate(rad);
    ctx.translate(-w / 2, -h / 2);
  }

  if (adjustments.flipH || adjustments.flipV) {
    ctx.translate(adjustments.flipH ? w : 0, adjustments.flipV ? h : 0);
    ctx.scale(adjustments.flipH ? -1 : 1, adjustments.flipV ? -1 : 1);
  }

  const zoom = adjustments.zoom || 1;
  const dw = w * zoom;
  const dh = h * zoom;
  const dx = (w - dw) / 2;
  const dy = (h - dh) / 2;

  ctx.drawImage(image, dx, dy, dw, dh);

  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (adjustments.brightness || adjustments.contrast || adjustments.saturation) {
    applyAdjustments(ctx, w, h, adjustments);
  }
}

export function detectFaceRegion(imageData) {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const skinPixels = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;

      let hVal = 0;
      if (delta !== 0) {
        if (max === r) hVal = 60 * (((g - b) / delta) % 6);
        else if (max === g) hVal = 60 * ((b - r) / delta + 2);
        else hVal = 60 * ((r - g) / delta + 4);
      }
      if (hVal < 0) hVal += 360;

      const l = (max + min) / 2;
      const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l / 255 - 1));

      const hNorm = hVal;
      const sNorm = s;
      const lNorm = l / 255;

      if (hNorm >= 0 && hNorm <= 50 && sNorm >= 0.1 && sNorm <= 0.6 && lNorm >= 0.2 && lNorm <= 0.8) {
        skinPixels.push({ x, y });
      }
    }
  }

  if (skinPixels.length < 50) return null;

  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (const p of skinPixels) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }

  const margin = 10;
  return {
    x: Math.max(0, minX - margin),
    y: Math.max(0, minY - margin),
    w: Math.min(w - minX + margin * 2, maxX - minX + margin * 2),
    h: Math.min(h - minY + margin * 2, maxY - minY + margin * 2),
  };
}

export function cropToTemplate(image, template, cropArea, adjustments) {
  const canvas = document.createElement('canvas');
  canvas.width = template.width;
  canvas.height = template.height;
  const ctx = canvas.getContext('2d');

  const bgColor = template.background === 'white' ? '#FFFFFF' : template.background;
  ctx.fillStyle = bgColor || '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const sourceX = cropArea?.x || 0;
  const sourceY = cropArea?.y || 0;
  const sourceW = cropArea?.w || image.width;
  const sourceH = cropArea?.h || image.height;

  ctx.drawImage(image, sourceX, sourceY, sourceW, sourceH, 0, 0, canvas.width, canvas.height);

  if (adjustments) {
    applyAdjustments(ctx, canvas.width, canvas.height, adjustments);
  }

  return canvas;
}
