export async function removeBackground(image) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;

    const edgeSamples = [];
    for (let x = 0; x < w; x++) {
      edgeSamples.push(getPixel(data, x, 0, w));
      edgeSamples.push(getPixel(data, x, h - 1, w));
    }
    for (let y = 0; y < h; y++) {
      edgeSamples.push(getPixel(data, 0, y, w));
      edgeSamples.push(getPixel(data, w - 1, y, w));
    }

    const bgColor = averageColor(edgeSamples);

    for (let i = 0; i < data.length; i += 4) {
      const dr = Math.abs(data[i] - bgColor.r);
      const dg = Math.abs(data[i + 1] - bgColor.g);
      const db = Math.abs(data[i + 2] - bgColor.b);
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);

      if (dist < 30) {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const edgeCanvas = document.createElement('canvas');
    edgeCanvas.width = w;
    edgeCanvas.height = h;
    const edgeCtx = edgeCanvas.getContext('2d');
    edgeCtx.putImageData(imageData, 0, 0);

    return edgeCanvas;
  } catch {
    const fallback = document.createElement('canvas');
    fallback.width = image.width;
    fallback.height = image.height;
    const fctx = fallback.getContext('2d');
    fctx.drawImage(image, 0, 0);
    return fallback;
  }
}

export async function replaceBackground(image, newBackground) {
  const transparentCanvas = await removeBackground(image);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = transparentCanvas.width;
  canvas.height = transparentCanvas.height;

  if (newBackground && newBackground !== 'transparent') {
    ctx.fillStyle = newBackground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(transparentCanvas, 0, 0);
  return canvas;
}

export const BACKGROUND_REMOVAL_AVAILABLE = false;

function getPixel(data, x, y, w) {
  const i = (y * w + x) * 4;
  return { r: data[i], g: data[i + 1], b: data[i + 2] };
}

function averageColor(pixels) {
  let r = 0, g = 0, b = 0;
  for (const p of pixels) {
    r += p.r;
    g += p.g;
    b += p.b;
  }
  const len = pixels.length || 1;
  return { r: r / len, g: g / len, b: b / len };
}
