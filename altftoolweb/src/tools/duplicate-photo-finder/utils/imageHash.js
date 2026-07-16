"use client";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function getPixel(imgData, x, y, w) {
  const i = (y * w + x) * 4;
  return imgData[i] * 0.299 + imgData[i + 1] * 0.587 + imgData[i + 2] * 0.114;
}

function dHash(imgData, w) {
  let hash = 0n;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const left = getPixel(imgData, x, y, w);
      const right = getPixel(imgData, x + 1, y, w);
      if (left > right) hash |= 1n << BigInt(y * 8 + x);
    }
  }
  return hash;
}

function hammingDistance(a, b) {
  let diff = a ^ b;
  let count = 0;
  while (diff) {
    count += Number(diff & 1n);
    diff >>= 1n;
  }
  return count;
}

export async function computeHash(src) {
  const img = await loadImage(src);
  const dimensions = `${img.naturalWidth}x${img.naturalHeight}`;
  const w = 9;
  const h = 8;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  const imgData = ctx.getImageData(0, 0, w, h).data;
  const hash = dHash(imgData, w);
  return { hash, dimensions };
}

export function computeSimilarity(hashA, hashB) {
  const dist = hammingDistance(hashA, hashB);
  return Math.round(((64 - dist) / 64) * 100);
}
