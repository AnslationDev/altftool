/**
 * Vector similarity maths for embedding comparison.
 *
 * Standard linear-algebra definitions (any linear algebra text, e.g.
 * Strang, "Introduction to Linear Algebra"):
 *   dot(a, b)        = sum(a_i * b_i)
 *   ||a||            = sqrt(sum(a_i^2))                (L2 / Euclidean norm)
 *   cosine(a, b)     = dot(a, b) / (||a|| * ||b||)     (undefined for a zero vector)
 *   cosineDistance   = 1 - cosine(a, b)                 (range 0..2)
 *   euclidean(a, b)  = sqrt(sum((a_i - b_i)^2))         (L2 distance)
 *   manhattan(a, b)  = sum(|a_i - b_i|)                 (L1 distance)
 *   angle            = acos(clamp(cosine, -1, 1)) in degrees
 */

/**
 * Hard cap on dimensions parsed, to keep the browser responsive on a paste of
 * an entire embedding matrix. Real embedding models top out well below this
 * (OpenAI text-embedding-3-large: 3072; Cohere embed-v4: 1536).
 */
export const MAX_DIMENSIONS = 20000;

/** Floating-point comparisons: cosine may drift a hair outside [-1, 1]. */
const COSINE_CLAMP_MIN = -1;
const COSINE_CLAMP_MAX = 1;

/** Radians-to-degrees conversion factor: 180 / pi. */
const DEG_PER_RAD = 180 / Math.PI;

/**
 * Parse a pasted vector. Accepts JSON arrays ("[0.1, 0.2]") or plain values
 * separated by commas, spaces, semicolons or newlines.
 *
 * @param {string} text
 * @returns {{values: number[]} | {error: string}}
 */
export function parseVector(text) {
  const raw = String(text ?? "").trim();
  if (raw === "") return { error: "The vector is empty — paste at least one number." };

  // Strip JSON-array or parenthesis wrappers so "[1,2,3]" and "(1,2,3)" both work.
  const stripped = raw.replace(/^[\[\(]+/, "").replace(/[\]\)]+$/, "");
  const parts = stripped.split(/[\s,;]+/).filter((part) => part !== "");

  if (parts.length === 0) return { error: "The vector is empty — paste at least one number." };
  if (parts.length > MAX_DIMENSIONS) {
    return { error: `Too many dimensions (${parts.length}). The limit is ${MAX_DIMENSIONS}.` };
  }

  const values = new Array(parts.length);
  for (let i = 0; i < parts.length; i += 1) {
    const value = Number(parts[i]);
    if (!Number.isFinite(value)) {
      return { error: `"${parts[i].slice(0, 24)}" at position ${i + 1} is not a number.` };
    }
    values[i] = value;
  }
  return { values };
}

/** dot(a, b) = sum(a_i * b_i). Assumes equal lengths. */
export function dotProduct(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += a[i] * b[i];
  return sum;
}

/** L2 norm: sqrt(sum(a_i^2)). */
export function l2Norm(a) {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += a[i] * a[i];
  return Math.sqrt(sum);
}

/**
 * Compare two pasted vectors.
 *
 * @param {object} input
 * @param {string} input.vectorA  Raw text of the first vector.
 * @param {string} input.vectorB  Raw text of the second vector.
 * @returns {object} metrics, or { error } when the input is unusable.
 */
export function compareVectors({ vectorA, vectorB }) {
  const parsedA = parseVector(vectorA);
  if (parsedA.error) return { error: `Vector A: ${parsedA.error}` };
  const parsedB = parseVector(vectorB);
  if (parsedB.error) return { error: `Vector B: ${parsedB.error}` };

  const a = parsedA.values;
  const b = parsedB.values;

  if (a.length !== b.length) {
    return {
      error: `The vectors have different dimensions (${a.length} vs ${b.length}). Cosine similarity is only defined for vectors of the same length.`,
    };
  }

  const dot = dotProduct(a, b);
  const normA = l2Norm(a);
  const normB = l2Norm(b);

  // Euclidean (L2) and Manhattan (L1) distances are defined even for zero vectors.
  let sumSq = 0;
  let sumAbs = 0;
  for (let i = 0; i < a.length; i += 1) {
    const diff = a[i] - b[i];
    sumSq += diff * diff;
    sumAbs += Math.abs(diff);
  }
  const euclidean = Math.sqrt(sumSq);

  if (normA === 0 || normB === 0) {
    return {
      error:
        "One of the vectors is all zeros. Cosine similarity divides by the vector norms, so it is undefined for a zero vector.",
    };
  }

  const rawCosine = dot / (normA * normB);
  const cosine = Math.min(COSINE_CLAMP_MAX, Math.max(COSINE_CLAMP_MIN, rawCosine));
  const angleDegrees = Math.acos(cosine) * DEG_PER_RAD;

  return {
    dimensions: a.length,
    dotProduct: dot,
    normA,
    normB,
    cosineSimilarity: cosine,
    cosineDistance: 1 - cosine,
    angleDegrees,
    euclideanDistance: euclidean,
    manhattanDistance: sumAbs,
  };
}

/** Plain-language reading of a cosine similarity value, for embedding work. */
export function interpretCosine(cosine) {
  if (!Number.isFinite(cosine)) return "";
  if (cosine >= 0.95) return "Near-identical direction — likely duplicates or paraphrases.";
  if (cosine >= 0.8) return "Strongly similar — typical of closely related texts.";
  if (cosine >= 0.5) return "Moderately similar — related topic, different content.";
  if (cosine > 0) return "Weakly similar — little shared meaning.";
  if (cosine === 0) return "Orthogonal — no similarity along any shared direction.";
  return "Opposed directions — negative similarity is rare for normalised text embeddings.";
}
