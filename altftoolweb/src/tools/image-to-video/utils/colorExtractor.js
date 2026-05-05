export function extractDominantColor(img) {
  const canvas = document.createElement("canvas");
  canvas.width  = 50; // small sample size = fast
  canvas.height = 50;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, 50, 50);

  const data = ctx.getImageData(0, 0, 50, 50).data;

  let r = 0, g = 0, b = 0, count = 0;

  // Sample every 4th pixel to keep it fast
  for (let i = 0; i < data.length; i += 16) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count++;
  }

  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count),
  };
}

export function darkenColor(color, factor = 0.35) {
  return {
    r: Math.round(color.r * factor),
    g: Math.round(color.g * factor),
    b: Math.round(color.b * factor),
  };
}

export function toRgba(color, alpha = 1) {
  return `rgba(${color.r},${color.g},${color.b},${alpha})`;
}

export function animatedGradientColors(baseColor, p) {
  const shift = Math.sin(p * Math.PI) * 18; // subtle hue pulse

  const top = {
    r: Math.min(255, Math.round(baseColor.r + shift * 0.6)),
    g: Math.min(255, Math.round(baseColor.g + shift * 0.3)),
    b: Math.min(255, Math.round(baseColor.b + shift * 0.1)),
  };

  const bottom = darkenColor(baseColor, 0.3 + p * 0.15);

  return { top, bottom };
}