"use client";

export function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
        if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Compression failed'));
          resolve(blob);
        }, 'image/jpeg', quality);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

export function getCanvasBlob(canvas, type = 'image/png', quality = 1) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

export function rotateCanvas(canvas, degrees) {
  const rad = (degrees * Math.PI) / 180;
  const w = canvas.width;
  const h = canvas.height;
  const output = document.createElement('canvas');
  if (degrees % 180 === 0) {
    output.width = w;
    output.height = h;
  } else {
    output.width = h;
    output.height = w;
  }
  const ctx = output.getContext('2d');
  ctx.translate(output.width / 2, output.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(canvas, -w / 2, -h / 2);
  return output;
}

export function flipCanvas(canvas, horizontal = true) {
  const output = document.createElement('canvas');
  output.width = canvas.width;
  output.height = canvas.height;
  const ctx = output.getContext('2d');
  if (horizontal) ctx.scale(-1, 1);
  else ctx.scale(1, -1);
  ctx.drawImage(canvas, horizontal ? -canvas.width : 0, horizontal ? 0 : -canvas.height);
  return output;
}

export function applyCanvasFilters(canvas, { brightness = 100, contrast = 100 } = {}) {
  const output = document.createElement('canvas');
  output.width = canvas.width;
  output.height = canvas.height;
  const ctx = output.getContext('2d');
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
  ctx.drawImage(canvas, 0, 0);
  return output;
}

export function validateImage(file) {
  const errors = [];
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  if (!validTypes.includes(file.type) && !file.name.match(/\.(heic|heif)$/i)) {
    errors.push('Unsupported image type. Please use JPG, PNG, WEBP, or HEIC.');
  }
  const maxSize = 20 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push('Image too large. Maximum size is 20MB.');
  }
  if (file.size === 0) {
    errors.push('Image file appears to be empty or corrupted.');
  }
  return errors;
}

export function dataURLToCanvas(dataURL) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      resolve(canvas);
    };
    img.src = dataURL;
  });
}

export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
