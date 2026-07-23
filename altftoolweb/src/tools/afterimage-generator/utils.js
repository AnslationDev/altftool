// src/tools/afterimage-generator/utils.js

/**
 * COLOR UTILITIES & COMPLEMENTARY LOGIC
 */

export const invertColor = (hex) => {
  if (!hex || typeof hex !== 'string') return '#00ffff';
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  let r = parseInt(cleanHex.slice(0, 2), 16) || 0;
  let g = parseInt(cleanHex.slice(2, 4), 16) || 0;
  let b = parseInt(cleanHex.slice(4, 6), 16) || 0;

  r = 255 - r;
  g = 255 - g;
  b = 255 - b;

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export const hexToRgb = (hex) => {
  if (!hex) return { r: 255, g: 0, b: 0 };
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 0, b: 0 };
};

export const rgbToHex = (r, g, b) => {
  const clamp = (v) => Math.min(255, Math.max(0, Math.round(v)));
  return `#${((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b)).toString(16).slice(1)}`;
};

export const getComplementaryColor = (hex, intensity = 1) => {
  const inverted = invertColor(hex);
  if (intensity === 1) return inverted;

  const originalRgb = hexToRgb(hex);
  const invertedRgb = hexToRgb(inverted);

  const blended = {
    r: originalRgb.r * (1 - intensity) + invertedRgb.r * intensity,
    g: originalRgb.g * (1 - intensity) + invertedRgb.g * intensity,
    b: originalRgb.b * (1 - intensity) + invertedRgb.b * intensity,
  };

  return rgbToHex(blended.r, blended.g, blended.b);
};

export const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

export const hexToHue = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b).h;
};

export const getColorName = (hex) => {
  const hue = hexToHue(hex);
  if (hue >= 345 || hue < 15) return 'Red';
  if (hue >= 15 && hue < 45) return 'Orange';
  if (hue >= 45 && hue < 75) return 'Yellow';
  if (hue >= 75 && hue < 165) return 'Green';
  if (hue >= 165 && hue < 195) return 'Cyan';
  if (hue >= 195 && hue < 255) return 'Blue';
  if (hue >= 255 && hue < 285) return 'Purple';
  if (hue >= 285 && hue < 345) return 'Magenta';
  return 'Custom';
};

/**
 * SHAPE DRAWING UTILITIES ON CANVAS
 */
export const drawShapeOnCanvas = (ctx, shape, x, y, size, color) => {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;

  ctx.beginPath();
  if (shape === 'circle') {
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (shape === 'square') {
    const half = size / 2;
    ctx.rect(x - half, y - half, size, size);
    ctx.fill();
    ctx.stroke();
  } else if (shape === 'cross') {
    const thickness = size / 3;
    const halfSize = size / 2;
    const halfThick = thickness / 2;

    ctx.moveTo(x - halfThick, y - halfSize);
    ctx.lineTo(x + halfThick, y - halfSize);
    ctx.lineTo(x + halfThick, y - halfThick);
    ctx.lineTo(x + halfSize, y - halfThick);
    ctx.lineTo(x + halfSize, y + halfThick);
    ctx.lineTo(x + halfThick, y + halfThick);
    ctx.lineTo(x + halfThick, y + halfSize);
    ctx.lineTo(x - halfThick, y + halfSize);
    ctx.lineTo(x - halfThick, y + halfThick);
    ctx.lineTo(x - halfSize, y + halfThick);
    ctx.lineTo(x - halfSize, y - halfThick);
    ctx.lineTo(x - halfThick, y - halfThick);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (shape === 'star') {
    const points = 5;
    const outerRadius = size / 2;
    const innerRadius = size / 4;
    let angle = (Math.PI / 2) * 3;
    const step = Math.PI / points;

    ctx.moveTo(x, y - outerRadius);
    for (let i = 0; i < points; i++) {
      let curX = x + Math.cos(angle) * outerRadius;
      let curY = y + Math.sin(angle) * outerRadius;
      ctx.lineTo(curX, curY);
      angle += step;

      curX = x + Math.cos(angle) * innerRadius;
      curY = y + Math.sin(angle) * innerRadius;
      ctx.lineTo(curX, curY);
      angle += step;
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
};

/**
 * IMAGE PROCESSING & NEGATIVE HELPERS
 */
export const loadImage = (fileOrUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;

    if (typeof fileOrUrl === 'string') {
      img.src = fileOrUrl;
    } else if (fileOrUrl instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrUrl);
    } else {
      reject(new Error('Invalid image source'));
    }
  });
};

export const resizeImageToCanvas = (img, maxWidth = 800, maxHeight = 600) => {
  let width = img.width;
  let height = img.height;

  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  return ctx.getImageData(0, 0, width, height);
};

export const generateNegativeImage = (imageData, inversionIntensity = 1) => {
  const data = imageData.data;
  const outputData = new Uint8ClampedArray(data.length);

  for (let i = 0; i < data.length; i += 4) {
    const invR = 255 - data[i];
    const invG = 255 - data[i + 1];
    const invB = 255 - data[i + 2];

    outputData[i] = data[i] * (1 - inversionIntensity) + invR * inversionIntensity;
    outputData[i + 1] = data[i + 1] * (1 - inversionIntensity) + invG * inversionIntensity;
    outputData[i + 2] = data[i + 2] * (1 - inversionIntensity) + invB * inversionIntensity;
    outputData[i + 3] = data[i + 3];
  }

  return new ImageData(outputData, imageData.width, imageData.height);
};

export const createTimer = (duration, onTick, onComplete) => {
  let remaining = duration;
  let intervalId = null;

  const start = () => {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      remaining -= 1;
      if (onTick) onTick(remaining);
      if (remaining <= 0) {
        clearInterval(intervalId);
        if (onComplete) onComplete();
      }
    }, 1000);
  };

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const reset = () => {
    stop();
    remaining = duration;
    if (onTick) onTick(remaining);
  };

  return { start, stop, reset, getRemaining: () => remaining };
};
