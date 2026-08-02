/**
 * Low Poly Budget Planner — triangle budget maths.
 *
 * Everything derives from one identity:
 *   triangles per frame = geometry throughput (tris/second) x geometry share of
 *                         the frame / target frame rate
 * Nothing here is React-, DOM- or clock-dependent.
 */

/** Frame time in milliseconds for a given frame rate: 1000 / fps. */
export function frameTimeMs(fps) {
  if (!(fps > 0)) return Infinity;
  return 1000 / fps;
}

/**
 * Throughput tiers, in millions of triangles per second.
 * These are deliberately broad starting points, not vendor specifications —
 * profile one representative scene on your own target device and replace them.
 */
export const THROUGHPUT_TIERS = [
  { id: "entry-mobile", label: "Entry / older mobile", triRateMillionPerSec: 30 },
  { id: "modern-mobile", label: "Modern mobile & standalone VR", triRateMillionPerSec: 100 },
  { id: "console", label: "Current-generation console", triRateMillionPerSec: 400 },
  { id: "desktop", label: "Desktop enthusiast GPU", triRateMillionPerSec: 900 },
];

/**
 * Default asset classes and their relative share of the on-screen budget.
 * `instances` is how many of that class are typically visible at once.
 */
export const ASSET_CLASSES = [
  { id: "hero", label: "Hero character", weight: 15, instances: 1 },
  { id: "npc", label: "Secondary characters / NPCs", weight: 20, instances: 8 },
  { id: "props", label: "Props & weapons", weight: 15, instances: 25 },
  { id: "environment", label: "Environment modules", weight: 30, instances: 60 },
  { id: "vehicles", label: "Vehicles & large set pieces", weight: 10, instances: 3 },
  { id: "foliage", label: "Foliage & scatter", weight: 10, instances: 200 },
];

/**
 * Classic halving LOD chain. Each level keeps half the triangles of the level
 * above it, which is the ratio most engine LOD groups default to.
 */
export const LOD_RATIOS = [1, 0.5, 0.25, 0.125];

/**
 * Bytes per GPU vertex for a common static-mesh layout:
 * position float32 x3 (12) + packed normal (4) + packed tangent (4) + UV half2 (4).
 */
export const BYTES_PER_VERTEX = 24;

/** 16-bit indices are valid only while a mesh stays under 65,536 vertices. */
export const MAX_16BIT_VERTICES = 65536;

/**
 * Real meshes duplicate vertices at UV seams and hard edges, so the GPU vertex
 * count is higher than the topological one. 1.0 = no duplication.
 */
export const DEFAULT_VERTEX_DUPLICATION = 1.4;

export const LIMITS = {
  minFps: 1,
  maxFps: 1000,
  minTriRateMillionPerSec: 0.1,
  maxTriRateMillionPerSec: 100000,
  minGeometryShare: 0.01,
  maxGeometryShare: 1,
  maxInstances: 1000000,
};

/**
 * Vertices of a closed triangle mesh from its triangle count.
 * Euler's formula V - E + F = 2 with E = 3F/2 for a closed triangulation gives
 * V = F/2 + 2. Real meshes are open, so treat this as a lower bound.
 */
export function verticesFromTriangles(triangles) {
  if (!(triangles > 0)) return 0;
  return triangles / 2 + 2;
}

/**
 * On-screen triangle budget for one frame.
 * budget = triRate x 1e6 x geometryShare / fps
 */
export function computeTriangleBudget({ triRateMillionPerSec, targetFps, geometryShare } = {}) {
  const rate = Number(triRateMillionPerSec);
  const fps = Number(targetFps);
  const share = Number(geometryShare);

  if (![rate, fps, share].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for throughput, frame rate and geometry share." };
  }
  if (rate < LIMITS.minTriRateMillionPerSec || rate > LIMITS.maxTriRateMillionPerSec) {
    return {
      error: `Throughput must be between ${LIMITS.minTriRateMillionPerSec} and ${LIMITS.maxTriRateMillionPerSec} million triangles per second.`,
    };
  }
  if (fps < LIMITS.minFps || fps > LIMITS.maxFps) {
    return { error: `Target frame rate must be between ${LIMITS.minFps} and ${LIMITS.maxFps} fps.` };
  }
  if (share < LIMITS.minGeometryShare || share > LIMITS.maxGeometryShare) {
    return { error: "Geometry share of the frame must be between 0.01 and 1." };
  }

  const frameMs = frameTimeMs(fps);
  const geometryMs = frameMs * share;
  const exact = (rate * 1e6 * share) / fps;

  return {
    frameTimeMs: frameMs,
    geometryBudgetMs: geometryMs,
    triangleBudget: Math.floor(exact),
    triangleBudgetExact: exact,
  };
}

/** Convert a percentage (0-100) into the 0-1 share the budget maths expects. */
export function shareFromPercent(percent) {
  const value = Number(percent);
  if (!Number.isFinite(value)) return NaN;
  return value / 100;
}

/**
 * Largest remainder (Hare quota) apportionment — the parts always sum to
 * exactly `total`, so no triangles are lost to rounding.
 */
export function allocateByLargestRemainder(total, weights) {
  const keys = Object.keys(weights);
  const sum = keys.reduce((acc, key) => acc + Math.max(0, weights[key] || 0), 0);
  const result = {};
  keys.forEach((key) => {
    result[key] = 0;
  });
  if (!(total > 0) || !(sum > 0)) return result;

  const parts = keys.map((key) => {
    const share = (Math.max(0, weights[key] || 0) / sum) * total;
    return { key, floor: Math.floor(share), remainder: share - Math.floor(share) };
  });

  let assigned = 0;
  parts.forEach((part) => {
    result[part.key] = part.floor;
    assigned += part.floor;
  });

  const ordered = parts
    .slice()
    .sort((a, b) => b.remainder - a.remainder || keys.indexOf(a.key) - keys.indexOf(b.key));

  let index = 0;
  while (assigned < total && ordered.length > 0) {
    result[ordered[index % ordered.length].key] += 1;
    assigned += 1;
    index += 1;
  }
  return result;
}

/**
 * Vertex and index buffer bytes for one mesh at a given triangle count.
 * Index width flips to 32-bit once the mesh needs 65,536 vertices or more.
 */
export function meshMemoryBytes(triangles, duplication = DEFAULT_VERTEX_DUPLICATION) {
  if (!(triangles > 0)) {
    return { topologicalVertices: 0, gpuVertices: 0, indexBytes: 0, vertexBytes: 0, totalBytes: 0, indexWidth: 16 };
  }
  const topological = verticesFromTriangles(triangles);
  const gpuVertices = Math.ceil(topological * Math.max(1, duplication));
  const indexWidth = gpuVertices >= MAX_16BIT_VERTICES ? 32 : 16;
  const indexBytes = Math.round(triangles) * 3 * (indexWidth / 8);
  const vertexBytes = gpuVertices * BYTES_PER_VERTEX;
  return {
    topologicalVertices: topological,
    gpuVertices,
    indexWidth,
    indexBytes,
    vertexBytes,
    totalBytes: indexBytes + vertexBytes,
  };
}

/**
 * LOD chain for one instance budget, using the halving ratios above.
 * A genuinely-zero instance budget (the per-instance allocation rounded down
 * to nothing) produces an all-zero chain rather than a fabricated minimum —
 * only a real, non-zero budget gets floored up to at least 1 triangle per
 * level so a visible mesh never reports 0 triangles at any LOD.
 */
export function buildLodChain(triangles) {
  const base = Number(triangles) || 0;
  if (!(base > 0)) {
    return LOD_RATIOS.map((ratio, level) => ({
      level,
      label: `LOD${level}`,
      ratio,
      triangles: 0,
    }));
  }
  return LOD_RATIOS.map((ratio, level) => ({
    level,
    label: `LOD${level}`,
    ratio,
    triangles: Math.max(1, Math.round(base * ratio)),
  }));
}

/**
 * Full plan: on-screen budget, per-class allocation, per-instance budget,
 * LOD chain and buffer memory.
 *
 * @param {object} input
 * @param {number} input.triRateMillionPerSec measured geometry throughput.
 * @param {number} input.targetFps            frame rate you must hold.
 * @param {number} input.geometryShare        share of the frame geometry may use (0-1).
 * @param {Array}  [input.classes]            [{ id, label, weight, instances }]
 * @param {number} [input.duplication]        vertex duplication factor (>= 1).
 */
export function planTriangleBudget({
  triRateMillionPerSec,
  targetFps,
  geometryShare,
  classes = ASSET_CLASSES,
  duplication = DEFAULT_VERTEX_DUPLICATION,
} = {}) {
  const budget = computeTriangleBudget({ triRateMillionPerSec, targetFps, geometryShare });
  if (budget.error) return budget;

  const list = Array.isArray(classes) ? classes : [];
  if (list.length === 0) return { error: "Add at least one asset class." };

  const dup = Number(duplication);
  if (!Number.isFinite(dup) || dup < 1 || dup > 4) {
    return { error: "Vertex duplication factor must be between 1 and 4." };
  }

  const weights = {};
  let weightSum = 0;
  for (const item of list) {
    const weight = Number(item.weight);
    const instances = Number(item.instances);
    if (!Number.isFinite(weight) || weight < 0) {
      return { error: `Share for "${item.label}" must be zero or more.` };
    }
    if (!Number.isFinite(instances) || instances < 1 || instances > LIMITS.maxInstances) {
      return { error: `Visible count for "${item.label}" must be between 1 and ${LIMITS.maxInstances}.` };
    }
    weights[item.id] = weight;
    weightSum += weight;
  }
  if (!(weightSum > 0)) return { error: "Give at least one asset class a share above zero." };

  const allocation = allocateByLargestRemainder(budget.triangleBudget, weights);

  let totalMemoryBytes = 0;
  const rows = list.map((item) => {
    const classBudget = allocation[item.id] || 0;
    const instances = Math.round(Number(item.instances));
    const perInstance = Math.floor(classBudget / instances);
    const memory = meshMemoryBytes(perInstance, dup);
    totalMemoryBytes += memory.totalBytes * instances;
    return {
      id: item.id,
      label: item.label,
      weight: Number(item.weight),
      share: budget.triangleBudget > 0 ? (classBudget / budget.triangleBudget) * 100 : 0,
      instances,
      classBudget,
      perInstance,
      lods: buildLodChain(perInstance),
      gpuVertices: memory.gpuVertices,
      indexWidth: memory.indexWidth,
      meshBytes: memory.totalBytes,
    };
  });

  const allocated = rows.reduce((acc, row) => acc + row.classBudget, 0);

  return {
    frameTimeMs: budget.frameTimeMs,
    geometryBudgetMs: budget.geometryBudgetMs,
    triangleBudget: budget.triangleBudget,
    allocatedTriangles: allocated,
    unallocatedTriangles: budget.triangleBudget - allocated,
    totalInstances: rows.reduce((acc, row) => acc + row.instances, 0),
    totalMemoryBytes,
    totalMemoryMb: totalMemoryBytes / (1024 * 1024),
    duplication: dup,
    rows,
  };
}
