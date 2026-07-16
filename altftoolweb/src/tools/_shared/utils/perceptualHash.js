"use client";

export function averageHash(canvas, size = 8) {
  const ctx = canvas.getContext('2d');
  const small = document.createElement('canvas');
  small.width = size;
  small.height = size;
  const sCtx = small.getContext('2d');
  sCtx.imageSmoothingEnabled = true;
  sCtx.drawImage(canvas, 0, 0, size, size);
  const data = sCtx.getImageData(0, 0, size, size).data;
  let sum = 0;
  const pixels = [];
  for (let i = 0; i < size * size; i++) {
    const g = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
    pixels.push(g);
    sum += g;
  }
  const avg = sum / pixels.length;
  return pixels.map(v => (v > avg ? 1 : 0));
}

export function differenceHash(canvas, size = 8) {
  const ctx = canvas.getContext('2d');
  const small = document.createElement('canvas');
  small.width = size + 1;
  small.height = size;
  const sCtx = small.getContext('2d');
  sCtx.imageSmoothingEnabled = true;
  sCtx.drawImage(canvas, 0, 0, size + 1, size);
  const data = sCtx.getImageData(0, 0, size + 1, size).data;
  const hash = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const left = y * (size + 1) + x;
      const right = y * (size + 1) + x + 1;
      const gLeft = 0.299 * data[left * 4] + 0.587 * data[left * 4 + 1] + 0.114 * data[left * 4 + 2];
      const gRight = 0.299 * data[right * 4] + 0.587 * data[right * 4 + 1] + 0.114 * data[right * 4 + 2];
      hash.push(gLeft > gRight ? 1 : 0);
    }
  }
  return hash;
}

export function hammingDistance(hash1, hash2) {
  if (hash1.length !== hash2.length) return Infinity;
  let dist = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) dist++;
  }
  return dist;
}

export function similarityPercentage(hash1, hash2) {
  const dist = hammingDistance(hash1, hash2);
  const maxDist = hash1.length;
  return Math.round(((maxDist - dist) / maxDist) * 100);
}

export function hashToHex(hash) {
  const bits = hash.join('');
  let hex = '';
  for (let i = 0; i < bits.length; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

export function hexToHash(hex) {
  const bits = [];
  for (const c of hex) {
    const val = parseInt(c, 16);
    for (let i = 3; i >= 0; i--) bits.push((val >> i) & 1);
  }
  return bits;
}

export function computeImageHash(canvas) {
  const dHash = differenceHash(canvas);
  const aHash = averageHash(canvas);
  return {
    dHash,
    aHash,
    dHashHex: hashToHex(dHash),
    aHashHex: hashToHex(aHash),
  };
}

export async function hashFromFile(file) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext('2d').drawImage(img, 0, 0);
  URL.revokeObjectURL(url);
  return computeImageHash(canvas);
}

export function compareImages(hash1, hash2) {
  const dDist = hammingDistance(hash1.dHash, hash2.dHash);
  const aDist = hammingDistance(hash1.aHash, hash2.aHash);
  const dSim = Math.round(((hash1.dHash.length - dDist) / hash1.dHash.length) * 100);
  const aSim = Math.round(((hash1.aHash.length - aDist) / hash1.aHash.length) * 100);
  return {
    dHashSimilarity: dSim,
    aHashSimilarity: aSim,
    overallSimilarity: Math.round((dSim + aSim) / 2),
    exactDuplicate: dSim === 100 && aSim === 100,
    nearDuplicate: dSim >= 90 && aSim >= 85,
  };
}
