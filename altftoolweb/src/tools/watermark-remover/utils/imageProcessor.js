"use client";

export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url, file, width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}

export function formatFileSize(bytes) {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function drawImageOnCanvas(img, maxW = 4096) {
  const canvas = document.createElement("canvas");
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  if (w > maxW) { h = (h * maxW) / w; w = maxW; }
  if (h > maxW) { w = (w * maxW) / h; h = maxW; }
  canvas.width = Math.round(w);
  canvas.height = Math.round(h);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function getPixel(imgData, x, y) {
  const i = (y * imgData.width + x) * 4;
  return { r: imgData.data[i], g: imgData.data[i + 1], b: imgData.data[i + 2], a: imgData.data[i + 3] };
}

function setPixel(imgData, x, y, r, g, b, a = 255) {
  const i = (y * imgData.width + x) * 4;
  imgData.data[i] = r;
  imgData.data[i + 1] = g;
  imgData.data[i + 2] = b;
  imgData.data[i + 3] = a;
}

function dist(c1, c2) {
  return Math.sqrt((c1.r - c2.r) ** 2 + (c1.g - c2.g) ** 2 + (c1.b - c2.b) ** 2);
}

export function removeWatermarkSimple(sourceCanvas, selectionMask, mode = "content-aware") {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  const result = document.createElement("canvas");
  result.width = w;
  result.height = h;
  const ctx = result.getContext("2d");
  ctx.drawImage(sourceCanvas, 0, 0);
  const imgData = ctx.getImageData(0, 0, w, h);

  if (mode === "fast") {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const mi = (y * w + x);
        if (selectionMask[mi]) {
          const neighbors = [];
          const radius = 3;
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx, ny = y + dy;
              if (nx >= 0 && nx < w && ny >= 0 && ny < h && !selectionMask[ny * w + nx]) {
                neighbors.push(getPixel(imgData, nx, ny));
              }
            }
          }
          if (neighbors.length > 0) {
            const avgR = neighbors.reduce((s, p) => s + p.r, 0) / neighbors.length;
            const avgG = neighbors.reduce((s, p) => s + p.g, 0) / neighbors.length;
            const avgB = neighbors.reduce((s, p) => s + p.b, 0) / neighbors.length;
            setPixel(imgData, x, y, avgR, avgG, avgB);
          }
        }
      }
    }
  } else {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const mi = (y * w + x);
        if (selectionMask[mi]) {
          let bestR = 0, bestG = 0, bestB = 0, totalW = 0;
          const maxRadius = mode === "high-quality" ? 40 : mode === "ultra" ? 60 : 20;
          const dirs = mode === "professional"
            ? [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]]
            : [[-1, 0], [1, 0], [0, -1], [0, 1]];
          for (const [ddx, ddy] of dirs) {
            for (let r = 1; r <= maxRadius; r++) {
              const nx = x + ddx * r, ny = y + ddy * r;
              if (nx < 0 || nx >= w || ny < 0 || ny >= h) break;
              if (selectionMask[ny * w + nx]) continue;
              const p = getPixel(imgData, nx, ny);
              const weight = 1 / (r * r);
              bestR += p.r * weight;
              bestG += p.g * weight;
              bestB += p.b * weight;
              totalW += weight;
              break;
            }
          }
          if (totalW > 0) {
            setPixel(imgData, x, y, bestR / totalW, bestG / totalW, bestB / totalW);
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return result;
}

export function createSelectionMask(w, h, selectionType, data) {
  const mask = new Uint8Array(w * h);
  if (!data) return mask;

  if (selectionType === "rect" && data.rect) {
    const { x, y, width, height } = data.rect;
    for (let py = y; py < y + height && py < h; py++) {
      for (let px = x; px < x + width && px < w; px++) {
        if (py >= 0 && px >= 0) mask[py * w + px] = 1;
      }
    }
  }

  if (selectionType === "brush" && data.points) {
    for (const pt of data.points) {
      const bx = Math.round(pt.x), by = Math.round(pt.y);
      const br = pt.size || 10;
      for (let dy = -br; dy <= br; dy++) {
        for (let dx = -br; dx <= br; dx++) {
          if (dx * dx + dy * dy > br * br) continue;
          const px = bx + dx, py = by + dy;
          if (px >= 0 && px < w && py >= 0 && py < h) {
            mask[py * w + px] = 1;
          }
        }
      }
    }
  }

  return mask;
}

export function featherMask(mask, w, h, radius = 5) {
  const result = new Float32Array(mask.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let count = 0, total = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            total += mask[ny * w + nx];
            count++;
          }
        }
      }
      result[y * w + x] = total / count;
    }
  }
  return result;
}

export function expandMask(mask, w, h, pixels = 3) {
  const result = new Uint8Array(mask);
  for (let iter = 0; iter < pixels; iter++) {
    const copy = new Uint8Array(result);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (copy[y * w + x]) continue;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h && copy[ny * w + nx]) {
              result[y * w + x] = 1;
            }
          }
        }
      }
    }
  }
  return result;
}

export function shrinkMask(mask, w, h, pixels = 2) {
  const result = new Uint8Array(mask);
  for (let iter = 0; iter < pixels; iter++) {
    const copy = new Uint8Array(result);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!copy[y * w + x]) continue;
        let edge = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || nx >= w || ny < 0 || ny >= h || !copy[ny * w + nx]) edge = true;
          }
        }
        if (edge) result[y * w + x] = 0;
      }
    }
  }
  return result;
}

export function smoothMask(mask, w, h, iterations = 2) {
  let result = new Uint8Array(mask);
  for (let iter = 0; iter < iterations; iter++) {
    const copy = new Uint8Array(result);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++)
            count += copy[(y + dy) * w + (x + dx)];
        result[y * w + x] = count >= 5 ? 1 : 0;
      }
    }
  }
  return result;
}

export function applyEnhancement(canvas, enhancement, intensity = 0.5) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);

  if (enhancement === "sharpen") {
    const kernel = [0, -1, 0, -1, 5 + intensity * 4, -1, 0, -1, 0];
    const data = new Uint8ClampedArray(imgData.data);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++)
            for (let kx = -1; kx <= 1; kx++)
              sum += data[((y + ky) * w + (x + kx)) * 4 + c] * kernel[(ky + 1) * 3 + (kx + 1)];
          const i = (y * w + x) * 4 + c;
          imgData.data[i] = Math.max(0, Math.min(255, sum));
        }
      }
    }
  }

  if (enhancement === "denoise") {
    const data = new Uint8ClampedArray(imgData.data);
    const radius = 2;
    for (let y = radius; y < h - radius; y++) {
      for (let x = radius; x < w - radius; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0, count = 0;
          for (let dy = -radius; dy <= radius; dy++)
            for (let dx = -radius; dx <= radius; dx++) {
              sum += data[((y + dy) * w + (x + dx)) * 4 + c];
              count++;
            }
          imgData.data[(y * w + x) * 4 + c] = sum / count;
        }
      }
    }
  }

  if (enhancement === "brightness") {
    const factor = 1 + (intensity - 0.5) * 0.8;
    for (let i = 0; i < imgData.data.length; i += 4) {
      imgData.data[i] = Math.min(255, imgData.data[i] * factor);
      imgData.data[i + 1] = Math.min(255, imgData.data[i + 1] * factor);
      imgData.data[i + 2] = Math.min(255, imgData.data[i + 2] * factor);
    }
  }

  if (enhancement === "contrast") {
    const factor = 1 + (intensity - 0.5) * 0.6;
    for (let i = 0; i < imgData.data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        imgData.data[i + c] = Math.max(0, Math.min(255, 128 + (imgData.data[i + c] - 128) * factor));
      }
    }
  }

  if (enhancement === "color-balance") {
    const rf = 1 + (intensity - 0.5) * 0.2;
    const gf = 1;
    const bf = 1 - (intensity - 0.5) * 0.2;
    for (let i = 0; i < imgData.data.length; i += 4) {
      imgData.data[i] = Math.min(255, imgData.data[i] * rf);
      imgData.data[i + 2] = Math.min(255, imgData.data[i + 2] * bf);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

export function upscaleCanvas(canvas, scale) {
  const w = Math.round(canvas.width * scale);
  const h = Math.round(canvas.height * scale);
  const result = document.createElement("canvas");
  result.width = w;
  result.height = h;
  const ctx = result.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(canvas, 0, 0, w, h);
  return result;
}

export function canvasToBlob(canvas, format = "png", quality = 0.92) {
  return new Promise((resolve) => {
    const mimeTypes = { png: "image/png", jpg: "image/jpeg", webp: "image/webp", tiff: "image/tiff", avif: "image/avif" };
    canvas.toBlob((blob) => resolve(blob), mimeTypes[format] || "image/png", quality);
  });
}

export function canvasToDataURL(canvas, format = "png", quality = 0.92) {
  const mimeTypes = { png: "image/png", jpg: "image/jpeg", webp: "image/webp", tiff: "image/tiff", avif: "image/avif" };
  return canvas.toDataURL(mimeTypes[format] || "image/png", quality);
}
