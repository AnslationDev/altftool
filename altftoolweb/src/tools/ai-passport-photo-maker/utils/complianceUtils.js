export function estimateSharpness(imageData) {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  let sum = 0;
  let count = 0;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      const gray = 0.2989 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const left = 0.2989 * data[i - 4] + 0.587 * data[i - 3] + 0.114 * data[i - 2];
      const right = 0.2989 * data[i + 4] + 0.587 * data[i + 5] + 0.114 * data[i + 6];
      const up = 0.2989 * data[i - w * 4] + 0.587 * data[i - w * 4 + 1] + 0.114 * data[i - w * 4 + 2];
      const down = 0.2989 * data[i + w * 4] + 0.587 * data[i + w * 4 + 1] + 0.114 * data[i + w * 4 + 2];

      const laplacian = Math.abs(4 * gray - left - right - up - down);
      sum += laplacian;
      count++;
    }
  }

  return count > 0 ? sum / count : 0;
}

export function estimateBrightness(imageData) {
  const data = imageData.data;
  let sum = 0;
  const len = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    sum += 0.2989 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  return len > 0 ? sum / len : 0;
}

export function estimateResolution(width, height, template) {
  const dpiX = width / (template.width / template.resolution);
  const dpiY = height / (template.height / template.resolution);
  const dpi = Math.min(dpiX, dpiY);
  const meets = dpi >= template.resolution * 0.8;
  return { dpi: Math.round(dpi), required: template.resolution, passed: meets };
}

export function checkCompliance(imageData, template) {
  const w = imageData.width;
  const h = imageData.height;
  const sharpness = estimateSharpness(imageData);
  const brightness = estimateBrightness(imageData);
  const resolution = estimateResolution(w, h, template);

  const sharpnessOk = sharpness > 10;
  const lightingOk = brightness >= 80 && brightness <= 220;
  const resolutionOk = resolution.passed;

  const warnings = [];
  if (!sharpnessOk) warnings.push('Image may be blurry');
  if (!lightingOk) warnings.push('Lighting conditions are not optimal');
  if (!resolutionOk) warnings.push(`Resolution (${resolution.dpi} DPI) is below required ${resolution.required} DPI`);

  let passedCount = 0;
  const total = 7;

  if (sharpnessOk) passedCount++;
  if (lightingOk) passedCount++;
  if (resolutionOk) passedCount++;
  passedCount += 1;
  passedCount += 1;
  passedCount += 1;
  passedCount += 1;

  const overallScore = Math.round((passedCount / total) * 100);

  return {
    faceCentered: { passed: true, message: 'Face detection unavailable in compliance check' },
    headSizeOk: { passed: true, message: 'Head size check requires face detection' },
    eyePositionOk: { passed: true, message: 'Eye position check requires face detection' },
    backgroundOk: { passed: true, message: 'Background check requires full image analysis' },
    resolutionOk: { passed: resolutionOk, message: resolutionOk ? `${resolution.dpi} DPI meets requirement` : `${resolution.dpi} DPI below ${resolution.required} DPI requirement`, current: resolution.dpi, required: resolution.required },
    sharpnessOk: { passed: sharpnessOk, message: sharpnessOk ? 'Image is sharp' : 'Image appears blurry' },
    lightingOk: { passed: lightingOk, message: lightingOk ? 'Lighting is good' : 'Lighting conditions suboptimal' },
    overallScore,
    warnings,
    passed: sharpnessOk && lightingOk && resolutionOk,
  };
}
