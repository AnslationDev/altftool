"use client";

export function loadImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) { reject(new Error("No file")); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url, file });
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}

export function getImageData(img, maxSize) {
  const canvas = document.createElement("canvas");
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  if (maxSize && (w > maxSize || h > maxSize)) {
    const s = maxSize / Math.max(w, h);
    w = Math.round(w * s); h = Math.round(h * s);
  }
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

export function computeHistogram(data) {
  const r = new Array(256).fill(0);
  const g = new Array(256).fill(0);
  const b = new Array(256).fill(0);
  for (let i = 0; i < data.data.length; i += 4) {
    r[data.data[i]]++;
    g[data.data[i + 1]]++;
    b[data.data[i + 2]]++;
  }
  const total = data.data.length / 4;
  return {
    r: r.map(v => v / total),
    g: g.map(v => v / total),
    b: b.map(v => v / total),
  };
}

export function analyzeExif(file) {
  return new Promise((resolve) => {
    if (!file || !file.slice) { resolve({}); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const view = new DataView(e.target.result);
      const exif = {};
      if (view.getUint16(0, false) !== 0xFFD8) { resolve(exif); return; }
      let offset = 2;
      while (offset < view.byteLength) {
        if (view.getUint16(offset, false) === 0xFFE1) {
          const tiffOffset = offset + 10;
          const littleEndian = view.getUint16(tiffOffset, false) === 0x4949;
          const ifdOffset = view.getUint32(tiffOffset + 4, littleEndian) + tiffOffset;
          const entries = view.getUint16(ifdOffset, littleEndian);
          for (let i = 0; i < entries; i++) {
            const entry = ifdOffset + 2 + i * 12;
            const tag = view.getUint16(entry, littleEndian);
            const type = view.getUint16(entry + 2, littleEndian);
            const count = view.getUint32(entry + 4, littleEndian);
            const valueOffset = entry + 8;
            let value;
            if (type === 2) {
              const strOffset = count <= 4 ? valueOffset : view.getUint32(valueOffset, littleEndian) + tiffOffset;
              const chars = [];
              for (let j = 0; j < count - 1 && strOffset + j < view.byteLength; j++) {
                chars.push(String.fromCharCode(view.getUint8(strOffset + j)));
              }
              value = chars.join("");
            } else if (type === 3) {
              value = view.getUint16(valueOffset, littleEndian);
            } else if (type === 4 || type === 9) {
              value = view.getUint32(valueOffset, littleEndian);
            } else if (type === 5 || type === 10) {
              const num = view.getUint32(valueOffset, littleEndian);
              const den = view.getUint32(valueOffset + 4, littleEndian);
              value = den ? (num / den).toFixed(2) : 0;
            }
            const tags = {
              0x010F: "cameraModel", 0x0110: "cameraModel",
              0x0112: "orientation", 0x8769: "gpsOffset",
              0x8827: "iso", 0x829A: "shutterSpeed",
              0x829D: "aperture", 0x920A: "focalLength",
            };
            if (tags[tag]) exif[tags[tag]] = value;
          }
          break;
        }
        offset += 2 + view.getUint16(offset + 2, false);
        if (offset >= view.byteLength) break;
      }
      resolve(exif);
    };
    reader.onerror = () => resolve({});
    reader.readAsArrayBuffer(file.slice(0, 65536));
  });
}

export function analyzeImageData(img, file) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const mp = ((w * h) / 1000000).toFixed(2);
  const aspect = (w / h).toFixed(3);
  const orientation = w > h ? "Landscape" : w < h ? "Portrait" : "Square";
  const data256 = getImageData(img, 256);

  const gray = new Float32Array(256 * 256);
  for (let i = 0; i < data256.data.length; i += 4) {
    const idx = i / 4;
    gray[idx] = 0.299 * data256.data[i] + 0.587 * data256.data[i + 1] + 0.114 * data256.data[i + 2];
  }

  const hist = computeHistogram(data256);
  const sharpness = computeSharpness(data256);
  const noise = computeNoise(data256);
  const brightness = computeBrightness(data256);
  const contrast = computeContrast(data256);
  const saturation = computeSaturation(data256);
  const dynamicRange = computeDynamicRange(data256);
  const edgeDensity = computeEdgeDensity(data256);
  const blurScore = computeBlur(data256);

  return {
    width: w, height: h,
    megapixels: parseFloat(mp),
    aspectRatio: parseFloat(aspect),
    orientation,
    dpi: 72,
    ppi: 72,
    fileSize: file?.size || 0,
    compressionRatio: file?.size ? ((w * h * 3) / file.size).toFixed(1) : 0,
    bitDepth: 24,
    colorSpace: "sRGB",
    colorProfile: "sRGB IEC61966-2.1",
    transparency: checkTransparency(data256),
    exif: {},
    sharpness, noise, brightness, contrast, saturation,
    dynamicRange,
    edgeDensity,
    blurScore,
    histogram: hist,
    qualityScore: 0,
  };
}

function checkTransparency(data) {
  let t = 0;
  for (let i = 3; i < data.data.length; i += 4) {
    if (data.data[i] < 255) t++;
  }
  return (t / (data.data.length / 4)) * 100;
}

function computeSharpness(data) {
  let score = 0, count = 0;
  for (let y = 1; y < data.height - 1; y++) {
    for (let x = 1; x < data.width - 1; x++) {
      const idx = (y * data.width + x) * 4;
      const dx = Math.abs(data.data[idx] - data.data[idx + 4]);
      const dy = Math.abs(data.data[idx] - data.data[idx + data.width * 4]);
      score += (dx + dy) / 2;
      count++;
    }
  }
  return Math.min(100, ((count ? (score / count) : 0) / 64) * 100);
}

function computeNoise(data) {
  let noise = 0, count = 0;
  for (let y = 2; y < data.height - 2; y++) {
    for (let x = 2; x < data.width - 2; x++) {
      const idx = (y * data.width + x) * 4;
      const center = 0.299 * data.data[idx] + 0.587 * data.data[idx + 1] + 0.114 * data.data[idx + 2];
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nidx = ((y + dy) * data.width + (x + dx)) * 4;
          sum += 0.299 * data.data[nidx] + 0.587 * data.data[nidx + 1] + 0.114 * data.data[nidx + 2];
        }
      const avg = sum / 9;
      noise += Math.abs(center - avg);
      count++;
    }
  }
  return Math.min(100, ((count ? (noise / count) : 0) / 20) * 100);
}

function computeBrightness(data) {
  let sum = 0;
  for (let i = 0; i < data.data.length; i += 4) {
    sum += 0.299 * data.data[i] + 0.587 * data.data[i + 1] + 0.114 * data.data[i + 2];
  }
  return (sum / (data.data.length / 4) / 255) * 100;
}

function computeContrast(data) {
  const gray = [];
  for (let i = 0; i < data.data.length; i += 4) {
    gray.push(0.299 * data.data[i] + 0.587 * data.data[i + 1] + 0.114 * data.data[i + 2]);
  }
  const mean = gray.reduce((a, b) => a + b, 0) / gray.length;
  const variance = gray.reduce((a, b) => a + (b - mean) ** 2, 0) / gray.length;
  return Math.min(100, (Math.sqrt(variance) / 128) * 100);
}

function computeSaturation(data) {
  let sum = 0;
  for (let i = 0; i < data.data.length; i += 4) {
    const r = data.data[i], g = data.data[i + 1], b = data.data[i + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const s = max !== min ? (max - min) / (1 - Math.abs(2 * l / 255 - 1)) : 0;
    sum += s;
  }
  return (sum / (data.data.length / 4)) * 100;
}

function computeDynamicRange(data) {
  let min = 255, max = 0;
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 0.299 * data.data[i] + 0.587 * data.data[i + 1] + 0.114 * data.data[i + 2];
    min = Math.min(min, v);
    max = Math.max(max, v);
  }
  return ((max - min) / 255) * 100;
}

function computeEdgeDensity(data) {
  let edges = 0;
  for (let y = 1; y < data.height - 1; y++) {
    for (let x = 1; x < data.width - 1; x++) {
      const idx = (y * data.width + x) * 4;
      const gx = Math.abs(data.data[idx] - data.data[idx + 4 * data.width]) * 2;
      const gy = Math.abs(data.data[idx] - data.data[idx + 4]);
      if ((gx + gy) / 2 > 40) edges++;
    }
  }
  return (edges / (data.width * data.height)) * 100;
}

function computeBlur(data) {
  let laplacian = 0, count = 0;
  for (let y = 1; y < data.height - 1; y++) {
    for (let x = 1; x < data.width - 1; x++) {
      const idx = (y * data.width + x) * 4;
      const center = 0.299 * data.data[idx] + 0.587 * data.data[idx + 1] + 0.114 * data.data[idx + 2];
      const top = 0.299 * data.data[idx - data.width * 4] + 0.587 * data.data[idx - data.width * 4 + 1] + 0.114 * data.data[idx - data.width * 4 + 2];
      const bottom = 0.299 * data.data[idx + data.width * 4] + 0.587 * data.data[idx + data.width * 4 + 1] + 0.114 * data.data[idx + data.width * 4 + 2];
      const left = 0.299 * data.data[idx - 4] + 0.587 * data.data[idx - 3] + 0.114 * data.data[idx - 2];
      const right = 0.299 * data.data[idx + 4] + 0.587 * data.data[idx + 5] + 0.114 * data.data[idx + 6];
      laplacian += Math.abs(4 * center - top - bottom - left - right);
      count++;
    }
  }
  const variance = count ? laplacian / count : 0;
  return Math.min(100, Math.max(0, 100 - (variance / 20) * 100));
}

export function computeQualityScore(analysis) {
  const s = analysis;
  const resScore = s.megapixels >= 12 ? 100 : s.megapixels >= 8 ? 80 : s.megapixels >= 4 ? 60 : s.megapixels >= 2 ? 40 : 20;
  const sharpScore = s.sharpness;
  const compressScore = s.compressionRatio > 10 ? 90 : s.compressionRatio > 5 ? 70 : s.compressionRatio > 2 ? 50 : 30;
  const noiseScore = 100 - s.noise;
  const colorScore = Math.min(100, s.saturation * 1.2 + 30);
  const brightScore = Math.min(100, 100 - Math.abs(50 - s.brightness) * 1.5);
  const contrastScore = s.contrast;
  const drScore = s.dynamicRange;

  const overall = Math.round(
    resScore * 0.20 + sharpScore * 0.20 + compressScore * 0.10 +
    noiseScore * 0.10 + colorScore * 0.10 + brightScore * 0.10 +
    contrastScore * 0.10 + drScore * 0.10
  );

  return {
    overall: Math.min(100, Math.max(0, overall)),
    resolution: Math.round(resScore),
    sharpness: Math.round(sharpScore),
    compression: Math.round(compressScore),
    noise: Math.round(noiseScore),
    colorQuality: Math.round(colorScore),
    brightness: Math.round(brightScore),
    contrast: Math.round(contrastScore),
    dynamicRange: Math.round(drScore),
  };
}
