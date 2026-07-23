"use client";

// Pure canvas / ImageData helpers for the pencil-sketch conversion algorithm.
// Classic pencil-sketch pipeline:
//   1. grayscale the source
//   2. invert the grayscale
//   3. box-blur the inverted grayscale
//   4. color-dodge blend the original grayscale with the blurred inversion
// The blur on the inverted layer produces the soft "pencil shading" edges.

const MAX_EDGE = 2000;

// Load a File into a decoded HTMLImageElement (rejects on decode failure).
export function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      reject(new Error("Please choose a valid image file (JPG, PNG, or WEBP)."));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode this image. Try a different file."));
    };
    img.src = url;
  });
}

// Downscale very large images so processing stays responsive.
// Returns a canvas sized to the (possibly) downscaled dimensions.
export function downscaleImage(image, maxEdge = MAX_EDGE) {
  const ratio = Math.min(1, maxEdge / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, width, height);
  return { canvas, width, height };
}

// Convert RGBA ImageData into a single-channel grayscale Float32Array.
export function toGrayscale(data) {
  const px = data.length / 4;
  const gray = new Float32Array(px);
  for (let i = 0; i < px; i++) {
    const o = i * 4;
    gray[i] = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
  }
  return gray;
}

// Apply a contrast curve (-100..100) around mid-gray (128).
export function applyContrast(gray, contrast) {
  if (!contrast) return gray;
  const factor =
    (259 * (contrast + 255)) / (255 * (259 - contrast));
  const out = new Float32Array(gray.length);
  for (let i = 0; i < gray.length; i++) {
    out[i] = factor * (gray[i] - 128) + 128;
  }
  return out;
}

// Invert a single-channel array.
export function invert(gray) {
  const out = new Float32Array(gray.length);
  for (let i = 0; i < gray.length; i++) out[i] = 255 - gray[i];
  return out;
}

// Separable box blur (horizontal then vertical) on a single-channel Float32Array.
// Clamped edge sampling keeps the window valid at borders.
export function boxBlur1D(src, width, height, radius) {
  const r = Math.floor(radius);
  if (r < 1) return src.slice();
  const out = new Float32Array(src.length);
  const tmp = new Float32Array(src.length);
  const win = r * 2 + 1;

  for (let y = 0; y < height; y++) {
    const base = y * width;
    let sum = 0;
    for (let k = -r; k <= r; k++) {
      const xx = Math.min(width - 1, Math.max(0, k));
      sum += src[base + xx];
    }
    for (let x = 0; x < width; x++) {
      tmp[base + x] = sum / win;
      const addX = Math.min(width - 1, x + r + 1);
      const subX = Math.max(0, x - r);
      sum += src[base + addX] - src[base + subX];
    }
  }

  for (let x = 0; x < width; x++) {
    const base = x;
    let sum = 0;
    for (let k = -r; k <= r; k++) {
      const yy = Math.min(height - 1, Math.max(0, k));
      sum += tmp[base + yy * width];
    }
    for (let y = 0; y < height; y++) {
      out[base + y * width] = sum / win;
      const addY = Math.min(height - 1, y + r + 1);
      const subY = Math.max(0, y - r);
      sum += tmp[base + addY * width] - tmp[base + subY * width];
    }
  }

  return out;
}

// Color-dodge blend: result = base / (1 - blend). Brightest where blend is dark.
export function colorDodge(base, blend) {
  const out = new Float32Array(base.length);
  for (let i = 0; i < base.length; i++) {
    const b = blend[i];
    out[i] = b >= 255 ? 255 : Math.min(255, (base[i] * 255) / (255 - b));
  }
  return out;
}

// Core conversion: returns a new ImageData with the sketch applied.
// settings: { blurRadius, contrast, intensity (0..1), colored (bool) }
export function sketchFromImageData(imageData, settings) {
  const { width, height, data } = imageData;
  const { blurRadius = 6, contrast = 20, intensity = 0.85, colored = false } = settings || {};

  const gray = applyContrast(toGrayscale(data), contrast);
  const inverted = invert(gray);
  const blurred = boxBlur1D(inverted, width, height, blurRadius);
  const dodged = colorDodge(gray, blurred);

  const out = new Uint8ClampedArray(data.length);
  for (let i = 0; i < gray.length; i++) {
    const line = gray[i] * (1 - intensity) + dodged[i] * intensity;
    const o = i * 4;
    if (colored) {
      // Colored-pencil look: tint the sketch by the original pixel color.
      const factor = line / 255;
      out[o] = data[o] * factor;
      out[o + 1] = data[o + 1] * factor;
      out[o + 2] = data[o + 2] * factor;
    } else {
      out[o] = line;
      out[o + 1] = line;
      out[o + 2] = line;
    }
    out[o + 3] = 255;
  }

  return new ImageData(out, width, height);
}

// Convenience: convert an HTMLImageElement into a sketch canvas.
export function sketchFromImage(image, settings) {
  const { canvas, width, height } = downscaleImage(image);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, width, height);
  const result = sketchFromImageData(imageData, settings);

  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  out.getContext("2d").putImageData(result, 0, 0);
  return { canvas: out, width, height };
}
