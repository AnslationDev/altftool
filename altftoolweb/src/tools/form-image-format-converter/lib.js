/**
 * Image format converter for government-portal form uploads.
 *
 * Pure logic only: format tables, file-name and validation rules, and the
 * binary-search steps used to hit a target JPEG file size. The actual pixel
 * re-encoding happens in the UI with a canvas (a DOM API), driven entirely by
 * the functions here.
 *
 * Facts encoded:
 *  - "JPG" and "JPEG" are the SAME format (JPEG); only the file extension
 *    differs, and some portals' upload validators accept just one spelling.
 *  - PNG is lossless and supports transparency; JPEG is lossy with a quality
 *    parameter and no transparency, so converting PNG -> JPEG must flatten
 *    transparency onto a background.
 *  - Portals state size limits in KB; 1 KB = 1024 bytes here.
 */

export const BYTES_PER_KB = 1024;

/** Reject inputs above this — far beyond any form-photo use and enough to stall phones. */
export const MAX_INPUT_BYTES = 25 * 1024 * 1024; // 25 MB

/** Canvas JPEG quality range; 0.92 is the common browser default for toBlob. */
export const DEFAULT_JPEG_QUALITY = 0.92;
export const MIN_JPEG_QUALITY = 0.05;
export const MAX_JPEG_QUALITY = 1;

/** Max binary-search encodes when targeting a file size; 7 halvings narrow quality to <1%. */
export const MAX_SIZE_SEARCH_STEPS = 7;

export const FORMATS = [
  {
    id: "jpeg",
    label: "JPEG / JPG",
    mime: "image/jpeg",
    extensions: ["jpg", "jpeg"],
    lossy: true,
    supportsTransparency: false,
  },
  {
    id: "png",
    label: "PNG",
    mime: "image/png",
    extensions: ["png"],
    lossy: false,
    supportsTransparency: true,
  },
];

/** Extension spellings a user can demand for JPEG output (portal validators differ). */
export const JPEG_EXTENSION_STYLES = [
  { id: "jpg", label: ".jpg" },
  { id: "jpeg", label: ".jpeg" },
];

export function formatById(id) {
  return FORMATS.find((format) => format.id === id) ?? null;
}

/** Identify a format from a MIME type or file name; null when unsupported. */
export function detectFormat(mimeOrName) {
  if (typeof mimeOrName !== "string") return null;
  const value = mimeOrName.toLowerCase();
  if (value === "image/jpeg" || value === "image/jpg") return "jpeg";
  if (value === "image/png") return "png";
  const extMatch = value.match(/\.([a-z0-9]+)$/);
  if (extMatch) {
    const ext = extMatch[1];
    for (const format of FORMATS) {
      if (format.extensions.includes(ext)) return format.id;
    }
  }
  return null;
}

/** Validate an input file's type and size before conversion. */
export function validateInputFile({ name, type, sizeBytes }) {
  const detected = detectFormat(type) ?? detectFormat(name ?? "");
  if (!detected) {
    return { error: "Only JPG, JPEG and PNG images can be converted here." };
  }
  const size = Number(sizeBytes);
  if (!Number.isFinite(size) || size <= 0) {
    return { error: "The selected file appears to be empty." };
  }
  if (size > MAX_INPUT_BYTES) {
    return { error: `The file is larger than ${MAX_INPUT_BYTES / (1024 * 1024)} MB — use a smaller photo.` };
  }
  return { formatId: detected };
}

/**
 * Build the output file name: original base name with the new extension.
 * @param {object} input
 * @param {string} input.originalName
 * @param {string} input.formatId          "jpeg" | "png"
 * @param {string} [input.extensionStyle]  "jpg" | "jpeg" (JPEG output only)
 */
export function outputFileName({ originalName, formatId, extensionStyle = "jpg" }) {
  const format = formatById(formatId);
  if (!format) return { error: "Choose JPG/JPEG or PNG as the output format." };
  const base =
    typeof originalName === "string" && originalName.trim() !== ""
      ? originalName.replace(/\.[^.]*$/, "")
      : "converted";
  const extension =
    format.id === "jpeg" && format.extensions.includes(extensionStyle) ? extensionStyle : format.extensions[0];
  return { name: `${base}.${extension}` };
}

/** Convert a byte count to KB (1 KB = 1024 bytes), one decimal. */
export function bytesToKB(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round((value / BYTES_PER_KB) * 10) / 10;
}

/**
 * Validate a JPEG quality typed by the user.
 * The <input type="number"> min/max attributes only constrain the spinner
 * arrows, not typed or pasted values, so out-of-range input must be rejected
 * here before it reaches canvas.toBlob (which silently ignores an
 * out-of-range value and falls back to the browser default instead).
 */
export function validateQuality(quality) {
  const value = Number(quality);
  if (!Number.isFinite(value)) {
    return { error: "JPEG quality must be a number." };
  }
  if (value < MIN_JPEG_QUALITY || value > MAX_JPEG_QUALITY) {
    return { error: `JPEG quality must be between ${MIN_JPEG_QUALITY} and ${MAX_JPEG_QUALITY}.` };
  }
  return { quality: value };
}

/** Validate a target size in KB typed by the user (blank means no target). */
export function validateTargetKB(targetKB) {
  if (targetKB === "" || targetKB === null || targetKB === undefined) return { targetBytes: null };
  const value = Number(targetKB);
  if (!Number.isFinite(value) || value <= 0) {
    return { error: "Target size must be a positive number of KB." };
  }
  if (value < 2) {
    return { error: "A target below 2 KB is not achievable for a real photo." };
  }
  return { targetBytes: Math.floor(value * BYTES_PER_KB) };
}

/**
 * One step of the binary search for a JPEG quality that lands under targetBytes.
 * JPEG size grows monotonically with quality, so:
 *  - result too big  -> search lower half,
 *  - result fits     -> remember it and search upper half for better quality.
 * @returns {object} { done, nextQuality?, low, high, bestQuality?, }
 */
export function nextQualityStep({ low, high, quality, resultBytes, targetBytes, bestQuality, step }) {
  const fits = resultBytes <= targetBytes;
  const newBest = fits ? quality : bestQuality ?? null;
  const newLow = fits ? quality : low;
  const newHigh = fits ? high : quality;

  if (step >= MAX_SIZE_SEARCH_STEPS || newHigh - newLow < 0.01) {
    return { done: true, bestQuality: newBest, low: newLow, high: newHigh };
  }
  return {
    done: false,
    bestQuality: newBest,
    low: newLow,
    high: newHigh,
    nextQuality: (newLow + newHigh) / 2,
  };
}
