"use client";

function toHex(r, g, b) {
  return `#${[r, g, b]
    .map((value) => Math.min(255, Math.max(0, value)).toString(16).padStart(2, "0"))
    .join("")}`;
}

export class ColorAnalyzer {
  static extractColorPalette(imageElement, count = 8) {
    try {
      const canvas = document.createElement("canvas");
      const size = 96;
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(imageElement, 0, 0, size, size);
      const data = context.getImageData(0, 0, size, size).data;
      const buckets = new Map();

      for (let index = 0; index < data.length; index += 4) {
        const alpha = data[index + 3];
        if (alpha < 128) continue;
        const r = Math.round(data[index] / 32) * 32;
        const g = Math.round(data[index + 1] / 32) * 32;
        const b = Math.round(data[index + 2] / 32) * 32;
        const key = `${r},${g},${b}`;
        buckets.set(key, (buckets.get(key) || 0) + 1);
      }

      return [...buckets.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([key]) => {
          const [r, g, b] = key.split(",").map(Number);
          return toHex(r, g, b);
        });
    } catch {
      return [];
    }
  }

  static getDominantColor(imageElement) {
    const palette = ColorAnalyzer.extractColorPalette(imageElement, 1);
    return palette.length > 0 ? palette[0] : "#000000";
  }

  static getAverageColor(imageElement) {
    try {
      const canvas = document.createElement("canvas");
      const size = 96;
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(imageElement, 0, 0, size, size);
      const data = context.getImageData(0, 0, size, size).data;

      let totalR = 0;
      let totalG = 0;
      let totalB = 0;
      let pixelCount = 0;

      for (let index = 0; index < data.length; index += 4) {
        const alpha = data[index + 3];
        if (alpha < 128) continue;
        totalR += data[index];
        totalG += data[index + 1];
        totalB += data[index + 2];
        pixelCount += 1;
      }

      if (pixelCount === 0) return "#000000";

      const avgR = Math.round(totalR / pixelCount);
      const avgG = Math.round(totalG / pixelCount);
      const avgB = Math.round(totalB / pixelCount);

      return toHex(avgR, avgG, avgB);
    } catch {
      return "#000000";
    }
  }

  static hasTransparency(imageElement) {
    try {
      const canvas = document.createElement("canvas");
      const size = 96;
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(imageElement, 0, 0, size, size);
      const data = context.getImageData(0, 0, size, size).data;

      for (let index = 3; index < data.length; index += 4) {
        if (data[index] < 255) return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  static getColorSpace(imageElement) {
    try {
      const canvas = document.createElement("canvas");
      const size = 96;
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(imageElement, 0, 0, size, size);
      const data = context.getImageData(0, 0, size, size).data;

      for (let index = 3; index < data.length; index += 4) {
        if (data[index] < 255) return "RGBA";
      }
      return "RGB";
    } catch {
      return "RGBA";
    }
  }
}

export default ColorAnalyzer;
