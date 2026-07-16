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

export function computeDiff(image1, image2) {
  const w = Math.max(image1.width, image2.width);
  const h = Math.max(image1.height, image2.height);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(image1, 0, 0);
  const data1 = ctx.getImageData(0, 0, w, h);

  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(image2, 0, 0);
  const data2 = ctx.getImageData(0, 0, w, h);

  const diffData = ctx.createImageData(w, h);
  const diffCanvas = document.createElement("canvas");
  diffCanvas.width = w;
  diffCanvas.height = h;
  const diffCtx = diffCanvas.getContext("2d");

  let changedPixels = 0;
  const totalPixels = w * h;

  for (let i = 0; i < data1.data.length; i += 4) {
    const dr = Math.abs(data1.data[i] - data2.data[i]);
    const dg = Math.abs(data1.data[i + 1] - data2.data[i + 1]);
    const db = Math.abs(data1.data[i + 2] - data2.data[i + 2]);
    const diff = dr + dg + db;

    if (diff > 30) {
      changedPixels++;
      diffData.data[i] = 255;
      diffData.data[i + 1] = 0;
      diffData.data[i + 2] = 0;
      diffData.data[i + 3] = 180;
    } else {
      diffData.data[i] = data2.data[i] * 0.3;
      diffData.data[i + 1] = data2.data[i + 1] * 0.3;
      diffData.data[i + 2] = data2.data[i + 2] * 0.3;
      diffData.data[i + 3] = 180;
    }
  }

  diffCtx.putImageData(diffData, 0, 0);
  const diffUrl = diffCanvas.toDataURL();

  const diffPercent = ((changedPixels / totalPixels) * 100);
  const totalDiff = diffPercent;

  return {
    diffUrl,
    diffPercent,
    changedPixels,
    totalPixels,
    width: w,
    height: h,
  };
}

export function computeDiffOverlay(image1, image2) {
  const w = Math.max(image1.width, image2.width);
  const h = Math.max(image1.height, image2.height);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(image1, 0, 0);
  const data1 = ctx.getImageData(0, 0, w, h);

  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(image2, 0, 0);
  const data2 = ctx.getImageData(0, 0, w, h);

  const overlayData = ctx.createImageData(w, h);

  for (let i = 0; i < data1.data.length; i += 4) {
    const dr = Math.abs(data1.data[i] - data2.data[i]);
    const dg = Math.abs(data1.data[i + 1] - data2.data[i + 1]);
    const db = Math.abs(data1.data[i + 2] - data2.data[i + 2]);
    const diff = dr + dg + db;

    if (diff > 30) {
      overlayData.data[i] = data2.data[i];
      overlayData.data[i + 1] = data2.data[i + 1];
      overlayData.data[i + 2] = data2.data[i + 2];
      overlayData.data[i + 3] = 255;
    } else {
      overlayData.data[i] = data2.data[i] * 0.15;
      overlayData.data[i + 1] = data2.data[i + 1] * 0.15;
      overlayData.data[i + 2] = data2.data[i + 2] * 0.15;
      overlayData.data[i + 3] = 100;
    }
  }

  ctx.putImageData(overlayData, 0, 0);
  return canvas.toDataURL();
}

export function formatFileSize(bytes) {
  if (!bytes) return "Unknown";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
