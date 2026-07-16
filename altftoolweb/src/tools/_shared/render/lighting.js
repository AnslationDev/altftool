// LightingAnalyzer: inspects the user photo around the face to derive lighting
// properties that added assets should inherit, so the composite looks like a
// single coherent photo rather than a sticker dropped on top.

function sampleRegion(imageData, x0, y0, x1, y1) {
  x0 = Math.max(0, Math.floor(x0));
  y0 = Math.max(0, Math.floor(y0));
  x1 = Math.min(imageData.width, Math.ceil(x1));
  y1 = Math.min(imageData.height, Math.ceil(y1));
  let r = 0;
  let g = 0;
  let b = 0;
  let lum = 0;
  let n = 0;
  const data = imageData.data;
  const w = imageData.width;
  const stepX = Math.max(1, Math.floor((x1 - x0) / 40));
  const stepY = Math.max(1, Math.floor((y1 - y0) / 40));
  for (let y = y0; y < y1; y += stepY) {
    for (let x = x0; x < x1; x += stepX) {
      const idx = (y * w + x) * 4;
      const pr = data[idx];
      const pg = data[idx + 1];
      const pb = data[idx + 2];
      r += pr;
      g += pg;
      b += pb;
      lum += 0.299 * pr + 0.587 * pg + 0.114 * pb;
      n++;
    }
  }
  if (n === 0) return { r: 128, g: 128, b: 128, lum: 128 };
  return { r: r / n, g: g / n, b: b / n, lum: lum / n };
}

// Estimate light direction from face using left vs right half luminance.
function estimateLightDir(imageData, leftBox, rightBox) {
  const l = sampleRegion(imageData, leftBox.x, leftBox.y, leftBox.x + leftBox.w, leftBox.y + leftBox.h);
  const r = sampleRegion(imageData, rightBox.x, rightBox.y, rightBox.x + rightBox.w, rightBox.y + rightBox.h);
  const dl = (l.lum - r.lum) / 255;
  // +1 => light from left, -1 => light from right
  return { fromLeft: dl, strength: Math.min(1, Math.abs(dl) * 2.2 + 0.25) };
}

export function analyzeLighting(imageData, bounds) {
  const { x, y, w, h } = bounds;
  const cx = x + w / 2;
  const cy = y + h / 2;

  const forehead = sampleRegion(imageData, x, y, x + w, y + h * 0.25);
  const leftHalf = sampleRegion(imageData, x, y, cx, y + h);
  const rightHalf = sampleRegion(imageData, cx, y, x + w, y + h);
  const whole = sampleRegion(imageData, x, y, x + w, y + h);
  const chin = sampleRegion(imageData, x + w * 0.25, y + h * 0.8, x + w * 0.75, y + h);

  const lum = whole.lum;
  // brightness factor centred on ~140 mid-grey.
  const brightness = clamp(lum / 140, 0.45, 1.6);
  const contrast = clamp(
    Math.abs(forehead.lum - chin.lum) / 60 + 0.85,
    0.7,
    1.4
  );

  const light = estimateLightDir(
    imageData,
    { x, y, w: w * 0.35, h: h },
    { x: x + w * 0.65, y, w: w * 0.35, h: h }
  );

  // Colour temperature from red/blue balance.
  const tempBias = (whole.r - whole.b) / 255; // + => warm, - => cool

  // Saturation of the surrounding skin/background.
  const sat =
    (Math.abs(whole.r - whole.g) + Math.abs(whole.g - whole.b) + Math.abs(whole.b - whole.r)) /
    (3 * 255);

  return {
    brightness,
    contrast,
    lightFromLeft: light.fromLeft,
    shadowStrength: light.strength,
    tempBias: clamp(tempBias, -0.35, 0.35),
    saturation: clamp(0.4 + sat * 1.4, 0.4, 1.3),
    ambient: clamp(lum / 200, 0.4, 1.0),
    meanColor: { r: whole.r, g: whole.g, b: whole.b },
  };
}

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}
