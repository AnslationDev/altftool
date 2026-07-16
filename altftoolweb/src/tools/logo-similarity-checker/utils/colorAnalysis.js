export function extractDominantColors(data, count = 5) {
  const pixels = [];
  for (let i = 0; i < data.data.length; i += 4) {
    const r = data.data[i];
    const g = data.data[i + 1];
    const b = data.data[i + 2];
    const a = data.data[i + 3];
    if (a < 128) continue;
    pixels.push([r, g, b]);
  }

  if (pixels.length === 0) return [];

  const kmeans = (data, k, maxIter = 10) => {
    let centroids = [];
    const step = Math.max(1, Math.floor(data.length / k));
    for (let i = 0; i < k; i++) centroids.push(data[Math.min(i * step, data.length - 1)]);

    for (let iter = 0; iter < maxIter; iter++) {
      const clusters = new Array(k).fill(null).map(() => []);
      for (const p of data) {
        let minDist = Infinity, best = 0;
        for (let j = 0; j < k; j++) {
          const d = colorDistance(p, centroids[j]);
          if (d < minDist) { minDist = d; best = j; }
        }
        clusters[best].push(p);
      }
      let changed = false;
      for (let j = 0; j < k; j++) {
        if (clusters[j].length === 0) continue;
        const avg = clusters[j][0].map((_, dim) =>
          Math.round(clusters[j].reduce((s, p) => s + p[dim], 0) / clusters[j].length)
        );
        if (avg.some((v, idx) => v !== centroids[j][idx])) changed = true;
        centroids[j] = avg;
      }
      if (!changed) break;
    }

    const clusters = new Array(k).fill(null).map(() => []);
    for (const p of data) {
      let minDist = Infinity, best = 0;
      for (let j = 0; j < k; j++) {
        const d = colorDistance(p, centroids[j]);
        if (d < minDist) { minDist = d; best = j; }
      }
      clusters[best].push(p);
    }

    return centroids
      .map((c, i) => ({
        rgb: c,
        hex: rgbToHex(c[0], c[1], c[2]),
        percentage: data.length ? (clusters[i].length / data.length) * 100 : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);
  };

  const sampled = [];
  const sampleSize = Math.min(10000, pixels.length);
  const step = Math.floor(pixels.length / sampleSize);
  for (let i = 0; i < pixels.length; i += step) {
    if (sampled.length < sampleSize) sampled.push(pixels[i]);
  }

  return kmeans(sampled, count);
}

export function colorDistance(c1, c2) {
  const dr = c1[0] - c2[0];
  const dg = c1[1] - c2[1];
  const db = c1[2] - c2[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

export function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");
}

export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
}

export function compareColorPalettes(palette1, palette2) {
  if (!palette1?.length || !palette2?.length) return { similarity: 0, matches: [] };
  const matches = [];
  let totalSim = 0;

  for (const c1 of palette1) {
    let bestDist = Infinity, bestMatch = null;
    for (const c2 of palette2) {
      const d = colorDistance(c1.rgb, c2.rgb);
      if (d < bestDist) { bestDist = d; bestMatch = c2; }
    }
    const sim = Math.max(0, 1 - bestDist / 441.67);
    totalSim += sim * (c1.percentage / 100);
    matches.push({ from: c1, to: bestMatch, distance: Math.round(bestDist), similarity: Math.round(sim * 100) });
  }

  return {
    similarity: Math.min(100, Math.round(totalSim * 100)),
    matches,
  };
}

export function getDesignStyle(palette) {
  if (!palette?.length) return "Minimal";
  const hasVibrant = palette.some((c) => {
    const max = Math.max(...c.rgb);
    const min = Math.min(...c.rgb);
    return max > 200 && (max - min) > 100;
  });
  const hasDark = palette.some((c) => c.rgb.every((v) => v < 50));
  const hasWarm = palette.some((c) => c.rgb[0] > 180 && c.rgb[1] < 150);
  const hasCool = palette.some((c) => c.rgb[2] > 180 && c.rgb[0] < 150);
  const isFlat = palette.every((c) => {
    const max = Math.max(...c.rgb);
    const min = Math.min(...c.rgb);
    return (max - min) < 80;
  });
  const isGradient = palette.some((c) => {
    const max = Math.max(...c.rgb);
    const min = Math.min(...c.rgb);
    return (max - min) > 150;
  });
  const isCorporate = palette.every((c) => {
    const max = Math.max(...c.rgb);
    const min = Math.min(...c.rgb);
    return max < 180 && (max - min) < 100;
  });

  if (isFlat) return "Flat";
  if (isGradient && hasVibrant) return "Gradient";
  if (hasVibrant) return "Modern";
  if (isCorporate) return "Corporate";
  if (hasDark) return "Luxury";
  if (hasWarm) return "Playful";
  if (hasCool) return "Modern";
  return "Minimal";
}
