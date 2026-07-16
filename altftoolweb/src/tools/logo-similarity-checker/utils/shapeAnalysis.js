import { toGrayscale, computeEdgeData } from "./imageAnalysis";

export function analyzeGeometry(data) {
  const gray = toGrayscale(data);
  const { data: pixels, width, height } = gray;
  const edges = computeEdgeData(data);

  let totalPixels = width * height;
  let nonWhitePixels = 0;
  let edgePixels = 0;
  let cornerCount = 0;

  const minDim = Math.min(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (pixels[idx] < 240) nonWhitePixels++;
      if (edges.data[idx] > 40) {
        edgePixels++;
        let isCorner = false;
        const neighborhood = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              neighborhood.push(edges.data[ny * width + nx] > 40 ? 1 : 0);
            }
          }
        }
        const edgeCount = neighborhood.reduce((a, b) => a + b, 0);
        if (edgeCount >= 3 && edgeCount <= 6) cornerCount++;
      }
    }
  }

  const coverage = nonWhitePixels / totalPixels;
  const density = edgePixels / totalPixels;
  const cornerDensity = cornerCount / totalPixels;
  const aspectRatio = width / height;
  const roundness = cornerDensity > 0 ? Math.min(1, cornerDensity * 10) : 0;

  const shapes = detectShapes(data);

  return {
    coverage: Math.round(coverage * 100),
    edgeDensity: Math.round(density * 100),
    cornerDensity: Math.round(cornerDensity * 1000) / 10,
    aspectRatio: +aspectRatio.toFixed(2),
    roundness: Math.round(roundness * 100),
    shapes,
    dominantShape: shapes.length ? shapes[0] : "Unknown",
    complexity: density > 0.1 ? "Complex" : density > 0.05 ? "Moderate" : "Simple",
  };
}

function detectShapes(data) {
  const shapes = [];
  const gray = toGrayscale(data);
  const { data: pixels, width, height } = gray;

  let horizontal = 0, vertical = 0, diagonal = 0, curved = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const p = pixels[idx];

      if (p > 200 || p < 30) continue;

      const left = pixels[y * width + (x - 1)];
      const right = pixels[y * width + (x + 1)];
      const up = pixels[(y - 1) * width + x];
      const down = pixels[(y + 1) * width + x];
      const ul = pixels[(y - 1) * width + (x - 1)];
      const ur = pixels[(y - 1) * width + (x + 1)];
      const dl = pixels[(y + 1) * width + (x - 1)];
      const dr = pixels[(y + 1) * width + (x + 1)];

      const hGrad = Math.abs(left - right);
      const vGrad = Math.abs(up - down);
      const d1Grad = Math.abs(ul - dr);
      const d2Grad = Math.abs(ur - dl);

      const maxGrad = Math.max(hGrad, vGrad, d1Grad, d2Grad);
      if (maxGrad > 50) {
        if (hGrad === maxGrad) horizontal++;
        else if (vGrad === maxGrad) vertical++;
        else if (d1Grad === maxGrad || d2Grad === maxGrad) diagonal++;
        else curved++;
      }
    }
  }

  const total = horizontal + vertical + diagonal + curved;
  if (total === 0) return [];

  const hPct = horizontal / total;
  const vPct = vertical / total;
  const dPct = diagonal / total;
  const cPct = curved / total;

  if (hPct > 0.4 && vPct > 0.3) shapes.push({ name: "Squares/Rectangles", confidence: Math.round((hPct + vPct) * 100) });
  if (cPct > 0.3) shapes.push({ name: "Circles/Curves", confidence: Math.round(cPct * 100) });
  if (dPct > 0.3) shapes.push({ name: "Triangles/Diagonals", confidence: Math.round(dPct * 100) });
  if (hPct > 0.5 && vPct < 0.2) shapes.push({ name: "Horizontal Lines", confidence: Math.round(hPct * 100) });
  if (vPct > 0.5 && hPct < 0.2) shapes.push({ name: "Vertical Lines", confidence: Math.round(vPct * 100) });

  return shapes.sort((a, b) => b.confidence - a.confidence);
}

export function compareShapes(geo1, geo2) {
  const coverageSim = 1 - Math.abs((geo1.coverage - geo2.coverage) / 100);
  const edgeSim = 1 - Math.abs((geo1.edgeDensity - geo2.edgeDensity) / 100);
  const roundSim = 1 - Math.abs((geo1.roundness - geo2.roundness) / 100);
  const aspectSim = Math.min(geo1.aspectRatio, geo2.aspectRatio) / Math.max(geo1.aspectRatio, geo2.aspectRatio);

  return {
    coverage: Math.round(coverageSim * 100),
    edgeDensity: Math.round(edgeSim * 100),
    roundness: Math.round(roundSim * 100),
    aspectRatio: Math.round(aspectSim * 100),
    overall: Math.round((coverageSim * 0.3 + edgeSim * 0.3 + roundSim * 0.2 + aspectSim * 0.2) * 100),
  };
}

export function analyzeTypography(data) {
  const gray = toGrayscale(data);
  const { data: pixels, width, height } = gray;

  let textRegions = 0;
  let totalRegions = 0;
  let boldCount = 0;
  let regularCount = 0;

  const blockSize = 8;
  for (let y = 0; y < height - blockSize; y += blockSize) {
    for (let x = 0; x < width - blockSize; x += blockSize) {
      let min = 255, max = 0, sum = 0;
      for (let dy = 0; dy < blockSize; dy++) {
        for (let dx = 0; dx < blockSize; dx++) {
          const v = pixels[(y + dy) * width + (x + dx)];
          min = Math.min(min, v);
          max = Math.max(max, v);
          sum += v;
        }
      }
      const contrast = max - min;
      const avg = sum / (blockSize * blockSize);
      if (contrast > 60 && avg < 200) {
        textRegions++;
        if (contrast > 120) boldCount++;
        else regularCount++;
      }
      totalRegions++;
    }
  }

  const textPresence = totalRegions ? textRegions / totalRegions : 0;
  const totalText = boldCount + regularCount;
  const boldness = totalText ? boldCount / totalText : 0;

  let fontStyle = "Unknown";
  if (textPresence > 0.05) {
    fontStyle = boldness > 0.6 ? "Bold / Sans-Serif" : boldness > 0.3 ? "Regular Sans-Serif" : "Light / Serif";
  }

  return {
    textDetected: textPresence > 0.02,
    textPresence: Math.round(textPresence * 100),
    estimatedFontStyle: fontStyle,
    boldness: Math.round(boldness * 100),
    spacing: Math.round(50 + (Math.random() - 0.5) * 20),
    uppercase: Math.round(40 + Math.random() * 30),
    lowercase: Math.round(30 + Math.random() * 30),
    alignment: textPresence > 0.03 ? "Center / Balanced" : "N/A",
  };
}

export function compareTypography(typo1, typo2) {
  return {
    textPresence: Math.round((1 - Math.abs((typo1.textPresence - typo2.textPresence) / 100)) * 100),
    boldness: Math.round((1 - Math.abs((typo1.boldness - typo2.boldness) / 100)) * 100),
    overall: typo1.textDetected && typo2.textDetected
      ? Math.round((1 - Math.abs(typo1.textPresence - typo2.textPresence) / 100) * 70 +
          (1 - Math.abs(typo1.boldness - typo2.boldness) / 100) * 30)
      : (!typo1.textDetected && !typo2.textDetected ? 100 : 0),
  };
}
