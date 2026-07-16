"use client";

export function getImageData(canvas) {
  const ctx = canvas.getContext('2d');
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export function analyzeSharpness(imageData) {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  let total = 0;
  let count = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      const g = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      const gx = 0.299 * data[(y * w + x + 1) * 4] + 0.587 * data[(y * w + x + 1) * 4 + 1] + 0.114 * data[(y * w + x + 1) * 4 + 2];
      const gy = 0.299 * data[((y + 1) * w + x) * 4] + 0.587 * data[((y + 1) * w + x) * 4 + 1] + 0.114 * data[((y + 1) * w + x) * 4 + 2];
      total += Math.abs(g - gx) + Math.abs(g - gy);
      count++;
    }
  }
  const avg = total / count;
  const score = Math.min(100, Math.round((avg / 30) * 100));
  return { score, raw: avg };
}

export function analyzeBrightness(imageData) {
  const data = imageData.data;
  let total = 0;
  const len = data.length / 4;
  for (let i = 0; i < len; i++) {
    total += 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }
  const avg = total / len;
  let score = 50;
  if (avg < 40) score = Math.round((avg / 40) * 30);
  else if (avg > 200) score = Math.round(100 - ((avg - 200) / 55) * 30);
  else score = 50 + Math.round(((avg - 40) / 160) * 50);
  return { score: Math.max(0, Math.min(100, score)), avg: Math.round(avg) };
}

export function analyzeContrast(imageData) {
  const data = imageData.data;
  const len = data.length / 4;
  const grays = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    grays[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }
  grays.sort();
  const low = grays[Math.round(len * 0.05)];
  const high = grays[Math.round(len * 0.95)];
  const range = high - low;
  const score = Math.min(100, Math.max(0, Math.round((range / 200) * 100)));
  return { score, range: Math.round(range), low: Math.round(low), high: Math.round(high) };
}

export function analyzeNoise(imageData) {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  let noise = 0;
  let count = 0;
  for (let y = 2; y < h - 2; y++) {
    for (let x = 2; x < w - 2; x++) {
      const idx = (y * w + x) * 4;
      const g = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      const neighbors = [
        ((y - 1) * w + x) * 4, ((y + 1) * w + x) * 4,
        (y * w + x - 1) * 4, (y * w + x + 1) * 4,
      ];
      let avg = 0;
      for (const n of neighbors) avg += 0.299 * data[n] + 0.587 * data[n + 1] + 0.114 * data[n + 2];
      avg /= 4;
      noise += Math.abs(g - avg);
      count++;
    }
  }
  const avgNoise = noise / count;
  const score = Math.max(0, Math.min(100, Math.round(100 - (avgNoise / 20) * 100)));
  return { score, raw: avgNoise };
}

export function analyzeExposure(imageData) {
  const data = imageData.data;
  const len = data.length / 4;
  let underExposed = 0;
  let overExposed = 0;
  for (let i = 0; i < len; i++) {
    const g = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
    if (g < 25) underExposed++;
    else if (g > 230) overExposed++;
  }
  const uRatio = underExposed / len;
  const oRatio = overExposed / len;
  let score = 100;
  if (uRatio > 0.05) score -= Math.round(uRatio * 200);
  if (oRatio > 0.05) score -= Math.round(oRatio * 200);
  return {
    score: Math.max(0, Math.min(100, score)),
    underExposed: Math.round(uRatio * 100),
    overExposed: Math.round(oRatio * 100),
  };
}

export function analyzeWhiteBalance(imageData) {
  const data = imageData.data;
  const len = data.length / 4;
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < len; i++) {
    r += data[i * 4];
    g += data[i * 4 + 1];
    b += data[i * 4 + 2];
  }
  r /= len; g /= len; b /= len;
  const avg = (r + g + b) / 3;
  const dr = Math.abs(r - avg);
  const dg = Math.abs(g - avg);
  const db = Math.abs(b - avg);
  const deviation = (dr + dg + db) / avg;
  const score = Math.max(0, Math.min(100, Math.round(100 - deviation * 100)));
  return { score, r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

export function analyzeSaturation(imageData) {
  const data = imageData.data;
  const len = data.length / 4;
  let totalSat = 0;
  for (let i = 0; i < len; i++) {
    const r = data[i * 4] / 255;
    const g = data[i * 4 + 1] / 255;
    const b = data[i * 4 + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (l === 0 || l === 1) continue;
    const sat = (max - min) / (1 - Math.abs(2 * l - 1));
    totalSat += sat;
  }
  const avgSat = totalSat / len;
  const score = Math.min(100, Math.max(0, Math.round((avgSat / 0.5) * 100)));
  return { score, avg: Math.round(avgSat * 100) / 100 };
}

export function analyzeDynamicRange(imageData) {
  const data = imageData.data;
  const len = data.length / 4;
  let minV = 255, maxV = 0;
  for (let i = 0; i < len; i++) {
    const g = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
    if (g < minV) minV = g;
    if (g > maxV) maxV = g;
  }
  const range = maxV - minV;
  const score = Math.min(100, Math.max(0, Math.round((range / 255) * 100)));
  return { score, range: Math.round(range), min: Math.round(minV), max: Math.round(maxV) };
}

export function generateHistogram(imageData, bins = 64) {
  const data = imageData.data;
  const len = data.length / 4;
  const hist = new Float32Array(bins);
  const binSize = 256 / bins;
  for (let i = 0; i < len; i++) {
    const g = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
    const bin = Math.min(bins - 1, Math.floor(g / binSize));
    hist[bin]++;
  }
  const max = Math.max(...hist);
  return {
    bins: Array.from(hist).map(v => Math.round(v)),
    max: Math.round(max),
    normalized: Array.from(hist).map(v => Math.round((v / max) * 100)),
  };
}

export function generateRGBHistogram(imageData) {
  const data = imageData.data;
  const len = data.length / 4;
  const r = new Float32Array(256);
  const g = new Float32Array(256);
  const b = new Float32Array(256);
  for (let i = 0; i < len; i++) {
    r[data[i * 4]]++;
    g[data[i * 4 + 1]]++;
    b[data[i * 4 + 2]]++;
  }
  const max = Math.max(...r, ...g, ...b);
  return {
    r: Array.from(r).map(v => Math.round(v)),
    g: Array.from(g).map(v => Math.round(v)),
    b: Array.from(b).map(v => Math.round(v)),
    max: Math.round(max),
  };
}

export function analyzeResolution(canvas) {
  const pixels = canvas.width * canvas.height;
  let score = 100;
  if (pixels < 100000) score = 20;
  else if (pixels < 300000) score = 40;
  else if (pixels < 600000) score = 60;
  else if (pixels < 1000000) score = 80;
  return {
    score,
    width: canvas.width,
    height: canvas.height,
    megapixels: (pixels / 1000000).toFixed(2),
  };
}

export function detectBlurType(imageData) {
  const sharpness = analyzeSharpness(imageData);
  const laplacianVar = sharpness.raw;
  if (laplacianVar < 5) return { type: 'severe', label: 'Severe Blur', score: 5 };
  if (laplacianVar < 15) return { type: 'significant', label: 'Significant Blur', score: 15 };
  if (laplacianVar < 30) return { type: 'moderate', label: 'Moderate Blur', score: 35 };
  if (laplacianVar < 50) return { type: 'slight', label: 'Slight Blur', score: 60 };
  if (laplacianVar < 80) return { type: 'minimal', label: 'Minimal Blur', score: 80 };
  return { type: 'sharp', label: 'Sharp', score: 95 };
}

export function computeEdgeDensity(imageData) {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  let edgeCount = 0;
  let total = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      const g = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      const gx = 0.299 * data[(y * w + x + 1) * 4] + 0.587 * data[(y * w + x + 1) * 4 + 1] + 0.114 * data[(y * w + x + 1) * 4 + 2];
      const gy = 0.299 * data[((y + 1) * w + x) * 4] + 0.587 * data[((y + 1) * w + x) * 4 + 1] + 0.114 * data[((y + 1) * w + x) * 4 + 2];
      const mag = Math.sqrt(gx * gx + gy * gy);
      if (mag > 30) edgeCount++;
      total++;
    }
  }
  return { density: Math.round((edgeCount / total) * 100), edgeCount, total };
}

export function computeBlurHeatmap(imageData) {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const blockSize = Math.max(8, Math.round(Math.min(w, h) / 40));
  const cols = Math.floor(w / blockSize);
  const rows = Math.floor(h / blockSize);
  const heatmap = [];
  for (let ry = 0; ry < rows; ry++) {
    for (let rx = 0; rx < cols; rx++) {
      let laplacian = 0;
      let count = 0;
      for (let y = ry * blockSize + 1; y < (ry + 1) * blockSize - 1; y++) {
        for (let x = rx * blockSize + 1; x < (rx + 1) * blockSize - 1; x++) {
          const idx = (y * w + x) * 4;
          const g = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          const gx = 0.299 * data[(y * w + x + 1) * 4] + 0.587 * data[(y * w + x + 1) * 4 + 1] + 0.114 * data[(y * w + x + 1) * 4 + 2];
          const gy = 0.299 * data[((y + 1) * w + x) * 4] + 0.587 * data[((y + 1) * w + x) * 4 + 1] + 0.114 * data[((y + 1) * w + x) * 4 + 2];
          laplacian += Math.abs(g - gx) + Math.abs(g - gy);
          count++;
        }
      }
      const avg = count > 0 ? laplacian / count : 0;
      const blurScore = Math.max(0, Math.min(100, 100 - (avg / 50) * 100));
      heatmap.push({ x: rx * blockSize, y: ry * blockSize, w: blockSize, h: blockSize, value: Math.round(blurScore) });
    }
  }
  return { heatmap, cols, rows };
}

export function computeOverallQuality(imageData, canvas) {
  const sharp = analyzeSharpness(imageData);
  const bright = analyzeBrightness(imageData);
  const contrast = analyzeContrast(imageData);
  const noise = analyzeNoise(imageData);
  const exposure = analyzeExposure(imageData);
  const wb = analyzeWhiteBalance(imageData);
  const sat = analyzeSaturation(imageData);
  const dr = analyzeDynamicRange(imageData);
  const res = analyzeResolution(canvas);

  const overall = Math.round(
    sharp.score * 0.2 +
    bright.score * 0.1 +
    contrast.score * 0.1 +
    noise.score * 0.15 +
    exposure.score * 0.1 +
    wb.score * 0.1 +
    sat.score * 0.05 +
    dr.score * 0.05 +
    res.score * 0.15
  );

  let grade = 'D';
  if (overall >= 90) grade = 'A+';
  else if (overall >= 80) grade = 'A';
  else if (overall >= 70) grade = 'B+';
  else if (overall >= 60) grade = 'B';
  else if (overall >= 50) grade = 'C+';
  else if (overall >= 40) grade = 'C';

  return { overall, grade, sharpness: sharp, brightness: bright, contrast, noise, exposure, whiteBalance: wb, saturation: sat, dynamicRange: dr, resolution: res };
}

export function detectBlur(imageData) {
  const sharpness = analyzeSharpness(imageData);
  const edges = computeEdgeDensity(imageData);
  const blurType = detectBlurType(imageData);
  const blurPct = Math.max(0, Math.min(100, 100 - sharpness.score));
  return {
    blurScore: blurPct,
    sharpnessScore: sharpness.score,
    edgeDensity: edges.density,
    focusArea: edges.edgeCount > 0 ? Math.round((edges.edgeCount / edges.total) * 100) : 0,
    focusConfidence: sharpness.score > 50 ? Math.round(50 + (sharpness.score / 2)) : Math.round(sharpness.score / 2),
    blurPercentage: blurPct,
    blurType: blurType.label,
    blurTypeId: blurType.type,
  };
}
