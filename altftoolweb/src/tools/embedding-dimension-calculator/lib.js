/**
 * Embedding vector memory calculator.
 *
 * The size of one dense embedding is exact arithmetic, not an estimate:
 *   bytes per vector = ceil(dimensions x bits-per-dimension / 8)
 * Bit widths follow the IEEE 754 / ML storage formats each name refers to.
 */

/** Bits per dimension for each storage precision. */
export const PRECISIONS = [
  { id: "float64", label: "float64 — 8 bytes/dim", bitsPerDim: 64, note: "IEEE 754 double precision (NumPy default dtype)." },
  { id: "float32", label: "float32 — 4 bytes/dim", bitsPerDim: 32, note: "IEEE 754 single precision; the default in Faiss, pgvector and most vector databases." },
  { id: "float16", label: "float16 — 2 bytes/dim", bitsPerDim: 16, note: "IEEE 754 half precision." },
  { id: "bfloat16", label: "bfloat16 — 2 bytes/dim", bitsPerDim: 16, note: "Truncated float32 (8-bit exponent, 7-bit mantissa) used on TPUs and modern GPUs." },
  { id: "int8", label: "int8 — 1 byte/dim", bitsPerDim: 8, note: "Scalar quantisation to one signed byte per dimension." },
  { id: "binary", label: "binary — 1 bit/dim", bitsPerDim: 1, note: "Binary quantisation: each dimension keeps only its sign bit." },
];

/**
 * Published output dimensions of widely used embedding models
 * (from each vendor's model documentation).
 */
export const MODEL_PRESETS = [
  { id: "openai-3-small", label: "OpenAI text-embedding-3-small", dimensions: 1536 },
  { id: "openai-3-large", label: "OpenAI text-embedding-3-large", dimensions: 3072 },
  { id: "openai-ada-002", label: "OpenAI text-embedding-ada-002", dimensions: 1536 },
  { id: "cohere-v3", label: "Cohere embed-english-v3.0", dimensions: 1024 },
  { id: "minilm-l6", label: "all-MiniLM-L6-v2", dimensions: 384 },
  { id: "bge-base", label: "BGE base-en-v1.5", dimensions: 768 },
  { id: "e5-large", label: "E5-large-v2", dimensions: 1024 },
];

/** Sanity ceiling: no shipping embedding model exceeds this dimension count. */
export const MAX_DIMENSIONS = 65536;

const BITS_PER_BYTE = 8;
/** IEC binary units: 1 KiB = 1024 bytes. */
export const BYTES_PER_KIB = 1024;

const UNITS = ["bytes", "KiB", "MiB", "GiB", "TiB", "PiB"];

/** Human-readable byte size using IEC binary units. */
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < BYTES_PER_KIB) return `${Math.round(bytes)} bytes`;
  let value = bytes;
  let unitIndex = 0;
  while (value >= BYTES_PER_KIB && unitIndex < UNITS.length - 1) {
    value /= BYTES_PER_KIB;
    unitIndex += 1;
  }
  return `${value >= 100 ? value.toFixed(0) : value.toFixed(2)} ${UNITS[unitIndex]}`;
}

/** Exact bytes needed to store one vector of `dimensions` dims at `bitsPerDim`. */
export function bytesPerVector(dimensions, bitsPerDim) {
  return Math.ceil((dimensions * bitsPerDim) / BITS_PER_BYTE);
}

/**
 * Compute per-vector memory plus fleet totals.
 *
 * @param {object} input
 * @param {number} input.dimensions      Output dimension count of the model.
 * @param {string} input.precisionId     One of PRECISIONS ids.
 * @param {number} [input.metadataBytes] Extra payload stored alongside each vector (id, text, JSON).
 * @returns {object} result or { error }
 */
export function computeEmbeddingMemory({ dimensions, precisionId, metadataBytes = 0 }) {
  const dims = Number(dimensions);
  const metadata = Number(metadataBytes);

  if (!Number.isFinite(dims) || dims <= 0) {
    return { error: "Enter the embedding dimension count as a positive number." };
  }
  if (!Number.isInteger(dims)) {
    return { error: "Dimension count must be a whole number — a model outputs an integer number of dimensions." };
  }
  if (dims > MAX_DIMENSIONS) {
    return { error: `Dimension count above ${MAX_DIMENSIONS} is not a real embedding size — check the model card.` };
  }
  if (!Number.isFinite(metadata) || metadata < 0) {
    return { error: "Metadata bytes per vector cannot be negative." };
  }

  const precision = PRECISIONS.find((p) => p.id === precisionId);
  if (!precision) {
    return { error: "Choose a storage precision." };
  }

  const dataBytes = bytesPerVector(dims, precision.bitsPerDim);
  const totalPerVector = dataBytes + metadata;

  const float32Bytes = bytesPerVector(dims, 32);
  const savingsVsFloat32Percent =
    float32Bytes > 0 ? ((float32Bytes - dataBytes) / float32Bytes) * 100 : 0;

  // Same vector at every precision, for the comparison table (data only, no metadata).
  const comparison = PRECISIONS.map((p) => ({
    id: p.id,
    label: p.label,
    bytes: bytesPerVector(dims, p.bitsPerDim),
    per1M: bytesPerVector(dims, p.bitsPerDim) * 1_000_000,
  }));

  return {
    dimensions: dims,
    precision,
    dataBytes,
    metadataBytes: metadata,
    totalPerVector,
    per1K: totalPerVector * 1_000,
    per1M: totalPerVector * 1_000_000,
    per10M: totalPerVector * 10_000_000,
    savingsVsFloat32Percent,
    comparison,
  };
}
