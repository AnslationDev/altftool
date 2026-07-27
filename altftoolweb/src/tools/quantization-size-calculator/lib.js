/**
 * Quantization Size Calculator — estimates LLM weight-file sizes across
 * quantization formats.
 *
 * Core formula: bytes = parameters × bits-per-weight / 8.
 *
 * Bits-per-weight values for the GGUF formats are derived exactly from the
 * llama.cpp block layouts (ggml quantization structs):
 * - Q8_0: blocks of 32 weights stored as 2-byte fp16 scale + 32 int8 values
 *   = 34 bytes per 32 weights = 8.5 bits/weight.
 * - Q6_K: 256-weight superblock = 128 (ql) + 64 (qh) + 16 (scales) + 2 (d)
 *   = 210 bytes = 6.5625 bits/weight.
 * - Q5_K: 256-weight superblock = 2 (d) + 2 (dmin) + 12 (scales) + 32 (qh)
 *   + 128 (qs) = 176 bytes = 5.5 bits/weight.
 * - Q4_K: 256-weight superblock = 2 (d) + 2 (dmin) + 12 (scales) + 128 (qs)
 *   = 144 bytes = 4.5 bits/weight.
 * - Q3_K: 256-weight superblock = 32 (hmask) + 64 (qs) + 12 (scales) + 2 (d)
 *   = 110 bytes = 3.4375 bits/weight.
 * - Q2_K: 256-weight superblock = 16 (scales) + 64 (qs) + 2 (d) + 2 (dmin)
 *   = 84 bytes = 2.625 bits/weight.
 * FP32/FP16/BF16/INT8 store one value per weight at their native width.
 *
 * Real GGUF files run a few percent larger than this weight-only estimate:
 * the "_M" mixed variants keep some tensors at a higher format (e.g. Q6_K),
 * and token embeddings, output layers and metadata add overhead. The UI
 * surfaces that caveat rather than inventing a fudge factor.
 */

export const BYTES_PER_GB = 1e9; // decimal gigabyte, as used on disk-size labels
export const BYTES_PER_GIB = 2 ** 30; // binary gibibyte, as reported by most OS tools

export const FORMAT_OPTIONS = [
  { id: "fp32", label: "FP32 (full precision)", bpw: 32, group: "32-bit" },
  { id: "fp16", label: "FP16 / BF16 (half precision)", bpw: 16, group: "16-bit" },
  { id: "q8_0", label: "GGUF Q8_0", bpw: 8.5, group: "8-bit" },
  { id: "int8", label: "Plain INT8 (per-weight)", bpw: 8, group: "8-bit" },
  { id: "q6_k", label: "GGUF Q6_K", bpw: 6.5625, group: "6-bit" },
  { id: "q5_k", label: "GGUF Q5_K (S)", bpw: 5.5, group: "5-bit" },
  { id: "q4_k", label: "GGUF Q4_K (S) / Q4_0", bpw: 4.5, group: "4-bit" },
  { id: "q3_k", label: "GGUF Q3_K", bpw: 3.4375, group: "3-bit" },
  { id: "q2_k", label: "GGUF Q2_K", bpw: 2.625, group: "2-bit" },
];

/** Reference format used for the savings column: FP16 is the usual distribution precision. */
export const REFERENCE_FORMAT_ID = "fp16";

const BITS_PER_BYTE = 8;

/** Sanity ceiling — largest published models are ~2T params; 100T catches typos like "7000". */
export const MAX_PARAMS_BILLIONS = 100000;

/**
 * Compute weight-file size estimates for every format.
 *
 * @param {object} input
 * @param {number} input.paramsBillions  Model parameter count in billions (e.g. 7 for a 7B model).
 * @returns {object} { rows, fp16Gb } or { error }.
 */
export function computeQuantSizes({ paramsBillions }) {
  const params = Number(paramsBillions);
  if (!Number.isFinite(params)) {
    return { error: "Enter the model's parameter count in billions (e.g. 7 for a 7B model)." };
  }
  if (params <= 0) {
    return { error: "Parameter count must be greater than zero." };
  }
  if (params > MAX_PARAMS_BILLIONS) {
    return { error: `Parameter count looks too large — enter billions (e.g. 70, not ${MAX_PARAMS_BILLIONS}+).` };
  }

  const paramCount = params * 1e9;
  const reference = FORMAT_OPTIONS.find((f) => f.id === REFERENCE_FORMAT_ID);
  const referenceBytes = (paramCount * reference.bpw) / BITS_PER_BYTE;

  const rows = FORMAT_OPTIONS.map((format) => {
    const bytes = (paramCount * format.bpw) / BITS_PER_BYTE;
    return {
      id: format.id,
      label: format.label,
      group: format.group,
      bpw: format.bpw,
      bytes,
      gb: bytes / BYTES_PER_GB,
      gib: bytes / BYTES_PER_GIB,
      // Savings relative to FP16; negative for FP32 (which is larger).
      savingsVsFp16Pct: ((referenceBytes - bytes) / referenceBytes) * 100,
    };
  });

  return {
    rows,
    paramsBillions: params,
    fp16Gb: referenceBytes / BYTES_PER_GB,
    fp16Gib: referenceBytes / BYTES_PER_GIB,
  };
}
