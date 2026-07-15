export async function detectFace(image) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;

    const skinPixels = [];

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        let hue = 0;
        if (delta !== 0) {
          if (max === r) hue = 60 * (((g - b) / delta) % 6);
          else if (max === g) hue = 60 * ((b - r) / delta + 2);
          else hue = 60 * ((r - g) / delta + 4);
        }
        if (hue < 0) hue += 360;

        const lightness = (max + min) / 2;
        const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness / 255 - 1));

        if (hue >= 0 && hue <= 50 && saturation >= 0.1 && saturation <= 0.6 && lightness / 255 >= 0.2 && lightness / 255 <= 0.8) {
          skinPixels.push({ x, y });
        }
      }
    }

    if (skinPixels.length < 100) {
      return {
        bounds: { x: 0, y: 0, w: w, h: h },
        eyes: { x: w / 2, y: h * 0.35 },
        center: { x: w / 2, y: h / 2 },
        confidence: 0,
      };
    }

    let minX = w, minY = h, maxX = 0, maxY = 0;
    for (const p of skinPixels) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }

    const faceW = maxX - minX;
    const faceH = maxY - minY;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const faceArea = faceW * faceH;
    const imageArea = w * h;
    const confidence = Math.min(1, faceArea / (imageArea * 0.3));

    return {
      bounds: { x: minX, y: minY, w: faceW, h: faceH },
      eyes: { x: centerX, y: minY + faceH * 0.35 },
      center: { x: centerX, y: centerY },
      confidence,
    };
  } catch {
    return {
      bounds: { x: 0, y: 0, w: image.width, h: image.height },
      eyes: { x: image.width / 2, y: image.height * 0.35 },
      center: { x: image.width / 2, y: image.height / 2 },
      confidence: 0,
    };
  }
}

export const FACE_DETECTION_AVAILABLE = true;
