/**
 * Vector index storage estimator.
 *
 * Raw vector data is exact arithmetic (count x dimensions x bytes per dim).
 * Index overhead follows the published Faiss sizing rules of thumb:
 *   - Flat (brute force): no graph, overhead is just the id list.
 *   - HNSW: each vector stores ~M*2 neighbour links of 4 bytes each on top of
 *     its data (Faiss guidelines: HNSW memory per vector = d*4 + M*2*4 bytes).
 *   - IVF: vectors gain an 8-byte id inside the inverted lists, plus the
 *     centroid table of nlist x d float32 values; Faiss recommends nlist
 *     between 4 x sqrt(N) and 16 x sqrt(N) cells — this estimator uses the
 *     conservative 4 x sqrt(N) end of that range.
 */

/** Bytes per dimension for each storage data type (IEEE 754 / ML formats). */
export const DATA_TYPES = [
  { id: "float64", label: "float64 — 8 bytes/dim", bytesPerDim: 8 },
  { id: "float32", label: "float32 — 4 bytes/dim", bytesPerDim: 4 },
  { id: "float16", label: "float16 / bfloat16 — 2 bytes/dim", bytesPerDim: 2 },
  { id: "int8", label: "int8 — 1 byte/dim", bytesPerDim: 1 },
  { id: "binary", label: "binary — 1 bit/dim", bytesPerDim: 1 / 8 },
];

export const INDEX_TYPES = [
  { id: "flat", label: "Flat (exact search, no graph)" },
  { id: "hnsw", label: "HNSW graph" },
  { id: "ivf", label: "IVF (inverted file)" },
];

/** Bytes of one HNSW neighbour link — a 4-byte (uint32) node id, per Faiss/hnswlib storage. */
export const HNSW_LINK_BYTES = 4;

/** Default and bounds for HNSW M (links per node); Faiss/hnswlib default M = 16, sane range 4-96. */
export const HNSW_M_DEFAULT = 16;
export const HNSW_M_MIN = 4;
export const HNSW_M_MAX = 96;

/**
 * HNSW stores M*2 links per vector on the base layer; upper layers add ~1/M
 * more nodes and are negligible at this precision, matching the Faiss
 * guideline of (d*4 + M*2*4) bytes per float32 vector.
 */
export const HNSW_LINKS_PER_VECTOR_FACTOR = 2;

/** IVF inverted lists store an 8-byte (int64) id per vector, per Faiss IVF storage layout. */
export const IVF_ID_BYTES = 8;

/** IVF centroids are kept in float32 regardless of the stored vector dtype. */
export const IVF_CENTROID_BYTES_PER_DIM = 4;

/**
 * Faiss recommends nlist between 4x sqrt(N) and 16x sqrt(N) inverted-list
 * cells; this estimator uses the conservative low end of that range.
 */
export const IVF_NLIST_MULTIPLIER = 4;

/** Sanity ceilings so absurd input is rejected instead of overflowing the display. */
export const MAX_DIMENSIONS = 65536;
export const MAX_VECTORS = 1e12; // one trillion — beyond any single index in practice
export const MAX_REPLICAS = 100;

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

/**
 * Estimate the total size of a vector index.
 *
 * @param {object} input
 * @param {number} input.vectorCount     Number of vectors stored.
 * @param {number} input.dimensions      Dimensions per vector.
 * @param {string} input.dataTypeId      One of DATA_TYPES ids.
 * @param {string} input.indexTypeId     One of INDEX_TYPES ids.
 * @param {number} [input.hnswM]         HNSW M parameter (links per node).
 * @param {number} [input.metadataBytes] Payload bytes stored per vector.
 * @param {number} [input.replicas]      Total copies of the index (1 = no replication).
 * @returns {object} result or { error }
 */
export function computeIndexSize({
  vectorCount,
  dimensions,
  dataTypeId,
  indexTypeId,
  hnswM = HNSW_M_DEFAULT,
  metadataBytes = 0,
  replicas = 1,
}) {
  const count = Number(vectorCount);
  const dims = Number(dimensions);
  const metadata = Number(metadataBytes);
  const copies = Number(replicas);
  const m = Number(hnswM);

  if (!Number.isFinite(count) || count <= 0 || !Number.isInteger(count)) {
    return { error: "Enter the number of vectors as a positive whole number." };
  }
  if (count > MAX_VECTORS) {
    return { error: "Vector count above one trillion is outside any single index — shard the estimate." };
  }
  if (!Number.isFinite(dims) || dims <= 0 || !Number.isInteger(dims)) {
    return { error: "Enter the dimension count as a positive whole number." };
  }
  if (dims > MAX_DIMENSIONS) {
    return { error: `Dimension count above ${MAX_DIMENSIONS} is not a real embedding size — check the model card.` };
  }
  if (!Number.isFinite(metadata) || metadata < 0) {
    return { error: "Metadata bytes per vector cannot be negative." };
  }
  if (!Number.isFinite(copies) || copies < 1 || !Number.isInteger(copies)) {
    return { error: "Replicas must be a whole number of at least 1." };
  }
  if (copies > MAX_REPLICAS) {
    return { error: `More than ${MAX_REPLICAS} replicas is outside this estimator's range.` };
  }

  const dataType = DATA_TYPES.find((t) => t.id === dataTypeId);
  if (!dataType) return { error: "Choose a vector data type." };
  const indexType = INDEX_TYPES.find((t) => t.id === indexTypeId);
  if (!indexType) return { error: "Choose an index type." };

  if (
    indexTypeId === "hnsw" &&
    (!Number.isFinite(m) || m < HNSW_M_MIN || m > HNSW_M_MAX || !Number.isInteger(m))
  ) {
    return {
      error: `HNSW M must be a whole number between ${HNSW_M_MIN} and ${HNSW_M_MAX} (library default is ${HNSW_M_DEFAULT}).`,
    };
  }

  const bytesPerVectorData = Math.ceil(dims * dataType.bytesPerDim);
  const rawDataBytes = count * bytesPerVectorData;
  const metadataTotal = count * metadata;

  let indexOverheadBytes = 0;
  let overheadNote = "Flat index: vectors are scanned directly, no graph or list overhead.";
  let nlist = 0;

  if (indexTypeId === "hnsw") {
    // Faiss guideline: M*2 links x 4 bytes per vector.
    indexOverheadBytes = count * m * HNSW_LINKS_PER_VECTOR_FACTOR * HNSW_LINK_BYTES;
    overheadNote = `HNSW graph: ${m} × ${HNSW_LINKS_PER_VECTOR_FACTOR} links × ${HNSW_LINK_BYTES} bytes = ${m * HNSW_LINKS_PER_VECTOR_FACTOR * HNSW_LINK_BYTES} bytes per vector.`;
  } else if (indexTypeId === "ivf") {
    nlist = Math.max(1, Math.round(IVF_NLIST_MULTIPLIER * Math.sqrt(count)));
    const centroidBytes = nlist * dims * IVF_CENTROID_BYTES_PER_DIM;
    const idBytes = count * IVF_ID_BYTES;
    indexOverheadBytes = centroidBytes + idBytes;
    overheadNote = `IVF: ${IVF_ID_BYTES}-byte id per vector plus ${nlist.toLocaleString("en-US")} float32 centroids (nlist ≈ ${IVF_NLIST_MULTIPLIER}×√N, the low end of Faiss's recommended 4×√N-16×√N range).`;
  }

  const perReplicaBytes = rawDataBytes + metadataTotal + indexOverheadBytes;
  const totalBytes = perReplicaBytes * copies;

  return {
    vectorCount: count,
    dimensions: dims,
    dataType,
    indexType,
    bytesPerVectorData,
    rawDataBytes,
    metadataTotal,
    indexOverheadBytes,
    overheadNote,
    nlist,
    perReplicaBytes,
    replicas: copies,
    totalBytes,
    overheadPercent: rawDataBytes > 0 ? (indexOverheadBytes / rawDataBytes) * 100 : 0,
  };
}
