/**
 * Page weight budgeting for images: how many images of a given size and format
 * fit inside a byte budget, and how long they take to arrive.
 */

/** Kilobyte and megabyte as browsers and dev tools report them. */
export const BYTES_PER_KB = 1024;
export const BYTES_PER_MB = 1024 * 1024;

/** Bits in a byte — used for both file size and transfer time. */
export const BITS_PER_BYTE = 8;

/**
 * Bits per pixel for a photographic JPEG. Quality 75-85 typically lands
 * between 0.5 and 1.5 bpp depending on how much detail the photo carries;
 * 1.0 is a fair planning default for a mixed set of marketing photography.
 * Flat illustrations compress far below this, dense textures above it.
 */
export const DEFAULT_JPEG_BPP = 1.0;

/**
 * Size of each format relative to a JPEG of the same visual quality.
 * WebP lossy is reported by its authors as 25-34% smaller than JPEG, so 0.70
 * sits in the middle of that band. AVIF is widely measured at roughly half a
 * comparable JPEG. PNG is lossless, so a photograph in PNG-24 balloons; PNG-8
 * is only sensible for flat graphics with few colours.
 */
export const FORMATS = [
  { id: "jpeg", label: "JPEG (quality 75-85)", factor: 1.0, lossy: true },
  { id: "webp", label: "WebP lossy", factor: 0.7, lossy: true },
  { id: "avif", label: "AVIF", factor: 0.5, lossy: true },
  { id: "png24", label: "PNG-24 (lossless photo)", factor: 8.0, lossy: false },
  { id: "png8", label: "PNG-8 (flat graphics)", factor: 1.5, lossy: false },
];

/**
 * Connection speeds in kilobits per second. The first two are the throttling
 * presets Chrome DevTools and Lighthouse use for mobile testing; the rest are
 * round figures for planning.
 */
export const CONNECTIONS = [
  { id: "slow3g", label: "Slow 3G (DevTools preset)", kbps: 400 },
  { id: "fast3g", label: "Fast 3G / Lighthouse mobile", kbps: 1600 },
  { id: "4g", label: "4G", kbps: 9000 },
  { id: "broadband", label: "Broadband", kbps: 30000 },
];

/**
 * Common total page weight budgets. 1 MB is the figure performance teams most
 * often set for a content page; 500 KB is an aggressive mobile-first target.
 */
export const BUDGET_PRESETS = [
  { id: "lean", label: "500 KB — lean mobile", kb: 500 },
  { id: "typical", label: "1,000 KB — common target", kb: 1000 },
  { id: "rich", label: "2,000 KB — media-heavy page", kb: 2000 },
];

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/** Look up a format by id. */
export function findFormat(id) {
  return FORMATS.find((format) => format.id === id) || null;
}

/** Format a byte count for display. */
export function formatBytes(bytes) {
  if (!isNum(bytes)) return "—";
  const sign = bytes < 0 ? "-" : "";
  const value = Math.abs(bytes);
  if (value < BYTES_PER_KB) return `${sign}${Math.round(value)} B`;
  if (value < BYTES_PER_MB) return `${sign}${(value / BYTES_PER_KB).toFixed(1)} KB`;
  return `${sign}${(value / BYTES_PER_MB).toFixed(2)} MB`;
}

/**
 * Bytes for one image: pixel count x bits per pixel x format factor / 8.
 * The device pixel ratio squares because it scales both width and height.
 */
export function imageBytes({ width, height, dpr = 1, jpegBpp = DEFAULT_JPEG_BPP, formatId }) {
  const format = findFormat(formatId);
  if (!format) return NaN;
  if (![width, height, dpr, jpegBpp].every(isNum)) return NaN;
  if (width <= 0 || height <= 0 || dpr <= 0 || jpegBpp <= 0) return NaN;
  const pixels = width * height * dpr * dpr;
  return (pixels * jpegBpp * format.factor) / BITS_PER_BYTE;
}

/** Seconds to transfer a number of bytes at a connection speed in kbps. */
export function transferSeconds(bytes, kbps) {
  if (!isNum(bytes) || !isNum(kbps) || kbps <= 0 || bytes < 0) return NaN;
  const bitsPerSecond = kbps * 1000;
  return (bytes * BITS_PER_BYTE) / bitsPerSecond;
}

/**
 * Work out the image budget for a page and how many images fit in it.
 *
 * @param {object} input
 * @param {number} input.pageBudgetKb total page weight budget in KB
 * @param {number} input.overheadKb   HTML, CSS, JS and fonts already spent
 * @param {number} input.width        image display width in CSS pixels
 * @param {number} input.height       image display height in CSS pixels
 * @param {number} input.dpr          export multiplier (1, 2, 3)
 * @param {number} input.jpegBpp      bits per pixel for a reference JPEG
 * @param {string} input.formatId     format the page will actually ship
 * @param {number} input.plannedCount how many images the design calls for
 * @returns {object} result, or { error } when the input cannot be used
 */
export function computeImageBudget({
  pageBudgetKb,
  overheadKb = 0,
  width,
  height,
  dpr = 1,
  jpegBpp = DEFAULT_JPEG_BPP,
  formatId = "webp",
  plannedCount = 6,
} = {}) {
  const format = findFormat(formatId);
  if (!format) return { error: "Choose one of the listed image formats." };

  const values = [pageBudgetKb, overheadKb, width, height, dpr, jpegBpp, plannedCount];
  if (values.some((value) => !isNum(value))) {
    return { error: "Enter a number in every field." };
  }
  if (pageBudgetKb <= 0) return { error: "Page weight budget must be greater than zero." };
  if (overheadKb < 0) return { error: "Code and font weight cannot be negative." };
  if (overheadKb >= pageBudgetKb) {
    return { error: "Code and fonts already use the whole budget — nothing is left for images." };
  }
  if (width <= 0 || height <= 0) {
    return { error: "Image width and height must be greater than zero." };
  }
  if (width > 10000 || height > 10000) {
    return { error: "Image sides above 10000 px are outside normal web use." };
  }
  if (dpr <= 0 || dpr > 4) return { error: "Device pixel ratio should be between 1 and 4." };
  if (jpegBpp <= 0 || jpegBpp > 24) {
    return { error: "Bits per pixel should be between 0 and 24." };
  }
  if (plannedCount < 0 || plannedCount > 1000) {
    return { error: "Plan for between 0 and 1000 images on one page." };
  }

  const budgetBytes = pageBudgetKb * BYTES_PER_KB;
  const overheadBytes = overheadKb * BYTES_PER_KB;
  const imageBudgetBytes = budgetBytes - overheadBytes;

  const perImageBytes = imageBytes({ width, height, dpr, jpegBpp, formatId });
  if (!isNum(perImageBytes) || perImageBytes <= 0) {
    return { error: "Those settings do not produce a usable file size." };
  }

  const count = Math.round(plannedCount);
  const fitsInBudget = Math.floor(imageBudgetBytes / perImageBytes);
  const plannedBytes = perImageBytes * count;
  const remainingBytes = imageBudgetBytes - plannedBytes;

  const formatComparison = FORMATS.map((entry) => {
    const bytes = imageBytes({ width, height, dpr, jpegBpp, formatId: entry.id });
    return {
      id: entry.id,
      label: entry.label,
      bytes,
      fits: Math.floor(imageBudgetBytes / bytes),
      savingVsJpeg: 1 - entry.factor,
    };
  });

  const transfers = CONNECTIONS.map((connection) => ({
    id: connection.id,
    label: connection.label,
    kbps: connection.kbps,
    secondsForPlanned: transferSeconds(plannedBytes + overheadBytes, connection.kbps),
    secondsForOne: transferSeconds(perImageBytes, connection.kbps),
  }));

  return {
    format,
    budgetBytes,
    overheadBytes,
    imageBudgetBytes,
    imageBudgetShare: imageBudgetBytes / budgetBytes,
    pixelsPerImage: width * height * dpr * dpr,
    perImageBytes,
    plannedCount: count,
    plannedBytes,
    remainingBytes,
    overBudget: remainingBytes < 0,
    fitsInBudget,
    totalPageBytes: overheadBytes + plannedBytes,
    budgetUsedShare: (overheadBytes + plannedBytes) / budgetBytes,
    formatComparison,
    transfers,
  };
}
