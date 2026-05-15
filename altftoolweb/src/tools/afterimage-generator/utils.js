// src/tools/afterimage-generator/utils.js

/**
 * COLOR UTILITIES
 */
export const invertColor = (hex) => {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  
  r = 255 - r;
  g = 255 - g;
  b = 255 - b;
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r, g, b) => {
  return `#${((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1)}`;
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

/**
 * IMAGE PROCESSING UTILITIES
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
      reader.onload = (e) => { img.src = e.target.result; };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrUrl);
    } else {
      reject(new Error('Invalid image source'));
    }
  });
};

export const applyImageFilters = (imageData, intensity) => {
  const { saturation = 1, brightness = 1, contrast = 1 } = intensity;
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    
    const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
    r = factor * (r - 128) + 128;
    g = factor * (g - 128) + 128;
    b = factor * (b - 128) + 128;
    
    r *= brightness;
    g *= brightness;
    b *= brightness;
    
    const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
    r = gray + (r - gray) * saturation;
    g = gray + (g - gray) * saturation;
    b = gray + (b - gray) * saturation;
    
    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }
  
  return imageData;
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

/**
 * TIMER UTILITIES
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
