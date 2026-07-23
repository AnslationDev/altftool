"use client";

export function loadImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) { reject(new Error("No file")); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { resolve({ img, url }); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}

export function getImageData(img, maxSize = 256) {
  const canvas = document.createElement("canvas");
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  if (w > maxSize || h > maxSize) {
    const scale = maxSize / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

export function toGrayscale(data) {
  const gray = new Uint8Array(data.width * data.height);
  for (let i = 0; i < data.data.length; i += 4) {
    gray[i / 4] = Math.round(0.299 * data.data[i] + 0.587 * data.data[i + 1] + 0.114 * data.data[i + 2]);
  }
  return { data: gray, width: data.width, height: data.height };
}

export function computeHistogram(data) {
  const gray = toGrayscale(data);
  const hist = new Array(256).fill(0);
  for (const v of gray.data) hist[v]++;
  return hist;
}

export function normalizeHistogram(hist) {
  const total = hist.reduce((a, b) => a + b, 0);
  return total ? hist.map((v) => v / total) : hist;
}

export function histogramIntersection(h1, h2) {
  let sim = 0;
  for (let i = 0; i < 256; i++) sim += Math.min(h1[i], h2[i]);
  return sim;
}

export function computeEdgeData(data) {
  const gray = toGrayscale(data);
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  const { data: pixels, width, height } = gray;
  const edges = new Float32Array(width * height);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = (y + ky) * width + (x + kx);
          const ki = (ky + 1) * 3 + (kx + 1);
          gx += pixels[idx] * sobelX[ki];
          gy += pixels[idx] * sobelY[ki];
        }
      }
      edges[y * width + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return { data: edges, width, height };
}

export function edgeSimilarity(edges1, edges2) {
  const min = Math.min(edges1.data.length, edges2.data.length);
  let diff = 0, count = 0;
  for (let i = 0; i < min; i++) {
    if (edges1.data[i] > 30 || edges2.data[i] > 30) {
      diff += Math.abs(edges1.data[i] - edges2.data[i]);
      count++;
    }
  }
  if (count === 0) return 0.5;
  const avgDiff = diff / count;
  return Math.max(0, Math.min(1, 1 - avgDiff / 255));
}

export function pixelSimilarity(data1, data2) {
  const min = Math.min(data1.data.length, data2.data.length);
  let diff = 0;
  const n = min / 4;
  for (let i = 0; i < min; i += 4) {
    const dr = data1.data[i] - data2.data[i];
    const dg = data1.data[i + 1] - data2.data[i + 1];
    const db = data1.data[i + 2] - data2.data[i + 2];
    diff += Math.sqrt(dr * dr + dg * dg + db * db);
  }
  const maxDist = Math.sqrt(3 * 255 * 255);
  const avgDiff = diff / n;
  return Math.max(0, Math.min(1, 1 - avgDiff / maxDist));
}

export function aspectRatioSimilarity(img1, img2) {
  const r1 = img1.naturalWidth / img1.naturalHeight;
  const r2 = img2.naturalWidth / img2.naturalHeight;
  const ratio = Math.min(r1, r2) / Math.max(r1, r2);
  return ratio;
}

export function brightnessSimilarity(data1, data2) {
  const avg = (data) => {
    let s = 0, c = 0;
    for (let i = 0; i < data.data.length; i += 4) {
      s += 0.299 * data.data[i] + 0.587 * data.data[i + 1] + 0.114 * data.data[i + 2];
      c++;
    }
    return c ? s / c : 0;
  };
  const b1 = avg(data1);
  const b2 = avg(data2);
  return Math.max(0, 1 - Math.abs(b1 - b2) / 255);
}

export function contrastSimilarity(data1, data2) {
  const contrast = (data) => {
    const gray = toGrayscale(data);
    const mean = gray.data.reduce((a, b) => a + b, 0) / gray.data.length;
    let varSum = 0;
    for (const v of gray.data) varSum += (v - mean) ** 2;
    return Math.sqrt(varSum / gray.data.length);
  };
  const c1 = contrast(data1);
  const c2 = contrast(data2);
  return Math.max(0, 1 - Math.abs(c1 - c2) / 128);
}

export function complexityScore(data) {
  const edges = computeEdgeData(data);
  const edgePixels = edges.data.filter((v) => v > 40).length;
  return edgePixels / edges.data.length;
}

export function symmetryScore(data) {
  const gray = toGrayscale(data);
  const { data: pixels, width, height } = gray;
  let symScore = 0, count = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width / 2; x++) {
      const left = pixels[y * width + x];
      const right = pixels[y * width + (width - 1 - x)];
      symScore += 1 - Math.abs(left - right) / 255;
      count++;
    }
  }
  return count ? symScore / count : 0.5;
}

export function transparencyAnalysis(data) {
  let transparent = 0;
  for (let i = 3; i < data.data.length; i += 4) {
    if (data.data[i] < 255) transparent++;
  }
  return data.data.length / 4 ? transparent / (data.data.length / 4) : 0;
}

export function sharpnessScore(data) {
  const gray = toGrayscale(data);
  const { data: pixels, width, height } = gray;
  let score = 0, count = 0;
  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const dx = Math.abs(pixels[y * width + x] - pixels[y * width + x + 1]);
      const dy = Math.abs(pixels[y * width + x] - pixels[(y + 1) * width + x]);
      score += (dx + dy) / 2;
      count++;
    }
  }
  return count ? Math.min(1, (score / count) / 128) : 0;
}

export function noiseEstimate(data) {
  const gray = toGrayscale(data);
  const { data: pixels, width, height } = gray;
  let noise = 0, count = 0;
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const center = pixels[y * width + x];
      const localAvg = (
        pixels[(y - 1) * width + x] + pixels[(y + 1) * width + x] +
        pixels[y * width + (x - 1)] + pixels[y * width + (x + 1)]
      ) / 4;
      noise += Math.abs(center - localAvg);
      count++;
    }
  }
  return count ? Math.min(1, (noise / count) / 64) : 0;
}

export function computeAllSimilarity(img1, img2, data1, data2) {
  const d1 = data1 || getImageData(img1, 256);
  const d2 = data2 || getImageData(img2, 256);

  const edges1 = computeEdgeData(d1);
  const edges2 = computeEdgeData(d2);

  const hist1 = normalizeHistogram(computeHistogram(d1));
  const hist2 = normalizeHistogram(computeHistogram(d2));

  const pixelSim = pixelSimilarity(d1, d2);
  const edgeSim = edgeSimilarity(edges1, edges2);
  const histSim = histogramIntersection(hist1, hist2);
  const aspectSim = aspectRatioSimilarity(img1, img2);
  const brightSim = brightnessSimilarity(d1, d2);
  const contrastSim = contrastSimilarity(d1, d2);
  const sym1 = symmetryScore(d1);
  const sym2 = symmetryScore(d2);
  const symSim = 1 - Math.abs(sym1 - sym2);
  const comp1 = complexityScore(d1);
  const comp2 = complexityScore(d2);
  const compSim = 1 - Math.abs(comp1 - comp2);

  const overall = Math.round(
    (pixelSim * 0.20 +
      edgeSim * 0.20 +
      histSim * 0.15 +
      aspectSim * 0.05 +
      brightSim * 0.05 +
      contrastSim * 0.05 +
      symSim * 0.10 +
      compSim * 0.05 +
      Math.max(0, 1 - Math.abs(comp1 - comp2) * 0.15)) * 100
  );

  return {
    overall: Math.min(100, Math.max(0, overall)),
    shape: Math.round(edgeSim * 100),
    color: Math.round(histSim * 100),
    icon: Math.round((pixelSim * 0.5 + edgeSim * 0.5) * 100),
    text: Math.round(histSim * 100),
    layout: Math.round(aspectSim * 100),
    edge: Math.round(edgeSim * 100),
    geometry: Math.round((aspectSim * 0.5 + symSim * 0.5) * 100),
    symmetry: Math.round(symSim * 100),
    brightness: Math.round(brightSim * 100),
    contrast: Math.round(contrastSim * 100),
    complexity: comp1,
    symmetryScoreA: sym1,
    symmetryScoreB: sym2,
    histogram: histSim,
    pixelSimilarity: pixelSim,
  };
}
