/**
 * Twin Finder — perceptual image comparison.
 *
 * This is entertainment, not biometrics: it measures how alike two pictures are,
 * not whether two people are related. Everything here is pure arithmetic over
 * RGBA pixel arrays, so the caller does the canvas work and passes the numbers in.
 */

/** Average-hash and difference-hash both work on an 8x8 luma grid (Krawetz, 2011). */
export const HASH_SIZE = 8;
/** dHash compares each pixel with its right neighbour, so it needs one extra column. */
export const DHASH_COLUMNS = HASH_SIZE + 1;
/** aHash (64 bits) + dHash (64 bits) = 128 bits of structure. */
export const HASH_BITS = HASH_SIZE * HASH_SIZE * 2;

/** ITU-R BT.601 luma coefficients — the standard perceptual grey weighting. */
export const LUMA_R = 0.299;
export const LUMA_G = 0.587;
export const LUMA_B = 0.114;

/** Colour histogram: 4 levels per channel = 64 bins, coarse enough to ignore noise. */
export const COLOUR_LEVELS = 4;
export const COLOUR_BINS = COLOUR_LEVELS ** 3;

/** 8-bit channel maximum, used to normalise tone differences. */
export const CHANNEL_MAX = 255;

/**
 * Blend weights for the playful score. They sum to 1.
 * Structure dominates because layout and pose drive the "do these look alike"
 * reaction more than palette does.
 */
export const STRUCTURE_WEIGHT = 0.55;
export const COLOUR_WEIGHT = 0.3;
export const TONE_WEIGHT = 0.15;

/**
 * Two unrelated images already agree on about half of their hash bits by chance,
 * so raw hash agreement is rescaled from [0.5, 1] onto [0, 1].
 */
export const HASH_CHANCE_FLOOR = 0.5;

/**
 * A perceptual hash is meaningless on a flat image: every cell equals the mean,
 * so two blank pictures of different colours produce identical hashes. When the
 * 8x8 luma grid varies by less than this (out of 255) the structure term is
 * dropped and its weight is shared out over colour and tone.
 */
export const FLAT_GRID_STDDEV = 3;

/** Guard: reject anything that is not a plausible RGBA buffer. */
export const MIN_PIXELS = 4;

export const VERDICT_BANDS = [
  { min: 90, label: "Separated at birth", blurb: "These two could swap places and nobody would notice." },
  { min: 75, label: "Unmistakably matching", blurb: "Same energy, same framing, same palette." },
  { min: 60, label: "Family resemblance", blurb: "Plenty in common, but you can still tell them apart." },
  { min: 45, label: "Distant cousins", blurb: "A few shared traits and a lot of differences." },
  { min: 25, label: "Barely related", blurb: "Mostly coincidence at this point." },
  { min: 0, label: "Complete strangers", blurb: "Two entirely different pictures." },
];

function isPixelBuffer(pixels) {
  return (
    pixels &&
    typeof pixels.length === "number" &&
    pixels.length >= MIN_PIXELS * 4 &&
    pixels.length % 4 === 0
  );
}

/** Single RGB triple -> BT.601 luma, 0-255. */
export function luma(r, g, b) {
  return LUMA_R * r + LUMA_G * g + LUMA_B * b;
}

/**
 * Box-average an RGBA buffer down to a cols x rows grid of luma values.
 * @returns {Float64Array} length cols*rows, values 0-255
 */
export function lumaGrid(pixels, width, height, cols, rows) {
  const grid = new Float64Array(cols * rows);
  const counts = new Float64Array(cols * rows);

  for (let y = 0; y < height; y += 1) {
    const gy = Math.min(rows - 1, Math.floor((y / height) * rows));
    for (let x = 0; x < width; x += 1) {
      const gx = Math.min(cols - 1, Math.floor((x / width) * cols));
      const offset = (y * width + x) * 4;
      const index = gy * cols + gx;
      grid[index] += luma(pixels[offset], pixels[offset + 1], pixels[offset + 2]);
      counts[index] += 1;
    }
  }

  for (let i = 0; i < grid.length; i += 1) {
    grid[i] = counts[i] > 0 ? grid[i] / counts[i] : 0;
  }
  return grid;
}

/** Average hash: one bit per cell, set when the cell is brighter than the mean. */
export function averageHash(grid) {
  let sum = 0;
  for (let i = 0; i < grid.length; i += 1) sum += grid[i];
  const mean = sum / grid.length;
  const bits = new Uint8Array(grid.length);
  for (let i = 0; i < grid.length; i += 1) bits[i] = grid[i] >= mean ? 1 : 0;
  return bits;
}

/** Difference hash: one bit per adjacent pair, set when the left cell is brighter. */
export function differenceHash(wideGrid, cols, rows) {
  const bits = new Uint8Array((cols - 1) * rows);
  let index = 0;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols - 1; x += 1) {
      bits[index] = wideGrid[y * cols + x] > wideGrid[y * cols + x + 1] ? 1 : 0;
      index += 1;
    }
  }
  return bits;
}

/** Number of positions where two equal-length bit arrays differ. */
export function hammingDistance(a, b) {
  const length = Math.min(a.length, b.length);
  let distance = 0;
  for (let i = 0; i < length; i += 1) if (a[i] !== b[i]) distance += 1;
  return distance;
}

/** Normalised 4x4x4 RGB histogram; the bins sum to 1. */
export function colourHistogram(pixels) {
  const bins = new Float64Array(COLOUR_BINS);
  const step = 256 / COLOUR_LEVELS;
  let counted = 0;
  for (let offset = 0; offset < pixels.length; offset += 4) {
    // Skip fully transparent pixels — they carry no colour information.
    if (pixels[offset + 3] === 0) continue;
    const r = Math.min(COLOUR_LEVELS - 1, Math.floor(pixels[offset] / step));
    const g = Math.min(COLOUR_LEVELS - 1, Math.floor(pixels[offset + 1] / step));
    const b = Math.min(COLOUR_LEVELS - 1, Math.floor(pixels[offset + 2] / step));
    bins[r * COLOUR_LEVELS * COLOUR_LEVELS + g * COLOUR_LEVELS + b] += 1;
    counted += 1;
  }
  if (counted === 0) return bins;
  for (let i = 0; i < bins.length; i += 1) bins[i] /= counted;
  return bins;
}

/** Histogram intersection: sum of per-bin minimums, 0 (nothing shared) to 1 (identical). */
export function histogramIntersection(a, b) {
  let total = 0;
  for (let i = 0; i < a.length; i += 1) total += Math.min(a[i], b[i]);
  return total;
}

/** Mean luma and standard deviation of an RGBA buffer, both 0-255. */
export function toneStats(pixels) {
  let sum = 0;
  let sumSquares = 0;
  let counted = 0;
  for (let offset = 0; offset < pixels.length; offset += 4) {
    const value = luma(pixels[offset], pixels[offset + 1], pixels[offset + 2]);
    sum += value;
    sumSquares += value * value;
    counted += 1;
  }
  if (counted === 0) return { mean: 0, stdDev: 0 };
  const mean = sum / counted;
  const variance = Math.max(0, sumSquares / counted - mean * mean);
  return { mean: Number(mean.toFixed(2)), stdDev: Number(Math.sqrt(variance).toFixed(2)) };
}

/** Population standard deviation of a luma grid, 0-255. */
export function gridStdDev(grid) {
  if (!grid || grid.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < grid.length; i += 1) sum += grid[i];
  const mean = sum / grid.length;
  let variance = 0;
  for (let i = 0; i < grid.length; i += 1) variance += (grid[i] - mean) ** 2;
  return Math.sqrt(variance / grid.length);
}

export function verdictFor(score) {
  return VERDICT_BANDS.find((band) => score >= band.min) ?? VERDICT_BANDS[VERDICT_BANDS.length - 1];
}

/**
 * Compare two decoded images.
 * @param {{pixels:Uint8ClampedArray,width:number,height:number}} a
 * @param {{pixels:Uint8ClampedArray,width:number,height:number}} b
 * @returns {object|{error:string}}
 */
export function compareImages(a, b) {
  for (const [name, image] of [["first", a], ["second", b]]) {
    if (!image || !isPixelBuffer(image.pixels)) {
      return { error: `The ${name} photo has not finished loading yet.` };
    }
    if (!Number.isFinite(image.width) || !Number.isFinite(image.height) || image.width < 1 || image.height < 1) {
      return { error: `The ${name} photo has no usable width or height.` };
    }
    if (image.pixels.length !== image.width * image.height * 4) {
      return { error: `The ${name} photo's pixel data does not match its size.` };
    }
  }

  const gridA = lumaGrid(a.pixels, a.width, a.height, HASH_SIZE, HASH_SIZE);
  const gridB = lumaGrid(b.pixels, b.width, b.height, HASH_SIZE, HASH_SIZE);
  const wideA = lumaGrid(a.pixels, a.width, a.height, DHASH_COLUMNS, HASH_SIZE);
  const wideB = lumaGrid(b.pixels, b.width, b.height, DHASH_COLUMNS, HASH_SIZE);

  const aHashDistance = hammingDistance(averageHash(gridA), averageHash(gridB));
  const dHashDistance = hammingDistance(
    differenceHash(wideA, DHASH_COLUMNS, HASH_SIZE),
    differenceHash(wideB, DHASH_COLUMNS, HASH_SIZE)
  );

  const rawHashAgreement = 1 - (aHashDistance + dHashDistance) / HASH_BITS;
  const structure = Math.max(
    0,
    (rawHashAgreement - HASH_CHANCE_FLOOR) / (1 - HASH_CHANCE_FLOOR)
  );

  const colour = histogramIntersection(colourHistogram(a.pixels), colourHistogram(b.pixels));

  const toneA = toneStats(a.pixels);
  const toneB = toneStats(b.pixels);
  const tone = 1 - Math.abs(toneA.mean - toneB.mean) / CHANNEL_MAX;

  // Flat images defeat perceptual hashing, so only trust structure when both
  // grids actually vary. Otherwise renormalise the remaining weights to sum to 1.
  const structureMeasurable =
    gridStdDev(gridA) >= FLAT_GRID_STDDEV && gridStdDev(gridB) >= FLAT_GRID_STDDEV;

  const blended = structureMeasurable
    ? structure * STRUCTURE_WEIGHT + colour * COLOUR_WEIGHT + tone * TONE_WEIGHT
    : (colour * COLOUR_WEIGHT + tone * TONE_WEIGHT) / (COLOUR_WEIGHT + TONE_WEIGHT);
  const score = Math.max(0, Math.min(100, Math.round(blended * 100)));

  // Per-cell luma gap for the heat map, normalised to 0-1.
  const heatmap = Array.from(gridA, (value, index) =>
    Number((Math.abs(value - gridB[index]) / CHANNEL_MAX).toFixed(3))
  );

  const band = verdictFor(score);

  return {
    score,
    verdict: band.label,
    blurb: band.blurb,
    structureMeasurable,
    structurePercent: structureMeasurable ? Number((structure * 100).toFixed(1)) : null,
    colourPercent: Number((colour * 100).toFixed(1)),
    tonePercent: Number((tone * 100).toFixed(1)),
    aHashDistance,
    dHashDistance,
    hashBits: HASH_BITS,
    brightnessA: toneA.mean,
    brightnessB: toneB.mean,
    contrastA: toneA.stdDev,
    contrastB: toneB.stdDev,
    heatmap,
    gridSize: HASH_SIZE,
  };
}

/** One-line shareable result. */
export function buildShareText(result, { labelA = "Photo A", labelB = "Photo B" } = {}) {
  if (!result || result.error) return { error: result?.error || "Compare two photos first." };
  const structure =
    result.structurePercent === null ? "not measurable (flat image)" : `${result.structurePercent}%`;
  return {
    text:
      `${labelA} vs ${labelB}: ${result.score}% similar — ${result.verdict}. ` +
      `Structure ${structure}, colour ${result.colourPercent}%, tone ${result.tonePercent}%. ` +
      `(Twin Finder is for fun — it is not face recognition.)`,
  };
}
