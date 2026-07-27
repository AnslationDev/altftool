/**
 * Impossible-object generator: builds Penrose-style figures out of unit cubes on a 3D lattice and
 * projects them with a general axonometric projection.
 *
 * Why these figures work
 * ---------------------
 * 1. A parallel (orthographic) projection is not injective: it throws depth away. Under the
 *    isometric view direction (1, 1, 1) the whole line of points t(1, 1, 1) collapses onto a
 *    single screen point. That is the entire trick — a bar can travel n cells in x, n in y and n
 *    in z and come back to exactly where it started *in the picture* while being 3n cells away in
 *    space.
 * 2. So any closed circuit of axis-aligned bars whose net 3D displacement is t(1, 1, 1) looks
 *    closed on screen and cannot exist as drawn. The Penrose tribar is the smallest case: one arm
 *    along +x, one along +y, one along +z, net displacement (n, n, n).
 * 3. General axonometric projection with azimuth θ and elevation φ:
 *        sx = x·cos θ − z·sin θ
 *        sy = (x·sin θ + z·cos θ)·sin φ − y·cos φ
 *    True isometric is θ = 45° and φ = asin(1/√3) ≈ 35.264°, the only pair for which the three
 *    axes are equally foreshortened and (1, 1, 1) projects to the origin. Move either angle and
 *    the illusion visibly breaks — which is what the "projection gap" figure measures.
 * 4. Faces are painted back to front (painter's algorithm) using the depth along the view
 *    direction (sin θ·cos φ, sin φ, cos θ·cos φ). No z-buffer, no WebGL, no dependencies.
 *
 * Everything here is pure: numbers in, plain arrays of 2D points out. No DOM, no React.
 */

/** Azimuth of a true isometric view, in degrees. */
export const ISOMETRIC_AZIMUTH_DEG = 45;

/** Elevation of a true isometric view: asin(1/sqrt(3)) in degrees. */
export const ISOMETRIC_ELEVATION_DEG = (Math.asin(1 / Math.sqrt(3)) * 180) / Math.PI;

/** Largest lattice size accepted, to keep the SVG a sane number of polygons. */
export const MAX_SIZE = 12;

/**
 * How close the two ends of the circuit must land for the illusion to hold. A quarter of a screen
 * pixel is below what any display can resolve, so the join reads as seamless.
 */
export const CLOSURE_TOLERANCE_PX = 0.25;

/** Steps-per-rise values for which the staircase circuit closes with whole cells. */
export const STAIRCASE_RISE_OPTIONS = [3, 4, 6];

/** The three figures this builder knows how to construct. */
export const OBJECT_KINDS = [
  {
    id: "penrose-triangle",
    label: "Penrose triangle (tribar)",
    blurb: "Three bars along +x, +y and +z. Net displacement (n, n, n) projects to zero.",
  },
  {
    id: "impossible-rectangle",
    label: "Impossible rectangle (four bars)",
    blurb: "Four bars: +x, +y, +z, −y. The −y bar is shortened so the net stays on the (1,1,1) line.",
  },
  {
    id: "impossible-staircase",
    label: "Endless staircase",
    blurb: "A rectangular circuit that rises one cell every k cells and still closes in projection.",
  },
];

const DEG = Math.PI / 180;
const isBadNumber = (value) => typeof value !== "number" || !Number.isFinite(value);
const round3 = (value) => Math.round((value + Number.EPSILON) * 1000) / 1000;

/**
 * Project a lattice point with a general axonometric projection.
 * @returns {{x: number, y: number}} screen coordinates, y increasing downwards.
 */
export function projectPoint(x, y, z, azimuthDeg, elevationDeg) {
  const theta = azimuthDeg * DEG;
  const phi = elevationDeg * DEG;
  return {
    x: x * Math.cos(theta) - z * Math.sin(theta),
    y: (x * Math.sin(theta) + z * Math.cos(theta)) * Math.sin(phi) - y * Math.cos(phi),
  };
}

/** Depth along the view direction; larger is nearer the camera. */
export function depthOf(x, y, z, azimuthDeg, elevationDeg) {
  const theta = azimuthDeg * DEG;
  const phi = elevationDeg * DEG;
  return (
    x * Math.sin(theta) * Math.cos(phi) + y * Math.sin(phi) + z * Math.cos(theta) * Math.cos(phi)
  );
}

/**
 * The cells of a Penrose tribar: three arms of length n along the three positive axes.
 * The last cell of the third arm projects onto the first cell of the first arm.
 */
export function buildPenroseTriangleCells(size) {
  const cells = [];
  for (let i = 0; i <= size; i += 1) cells.push({ x: i, y: 0, z: 0, arm: 0 });
  for (let j = 1; j <= size; j += 1) cells.push({ x: size, y: j, z: 0, arm: 1 });
  for (let k = 1; k <= size; k += 1) cells.push({ x: size, y: size, z: k, arm: 2 });
  return { cells, netDisplacement: { x: size, y: size, z: size } };
}

/**
 * Four bars: +x by n, +y by m, +z by n, then −y by (m − n).
 * Net displacement is (n, n, n), so the circuit closes on screen.
 */
export function buildImpossibleRectangleCells(size, height) {
  const cells = [];
  for (let i = 0; i <= size; i += 1) cells.push({ x: i, y: 0, z: 0, arm: 0 });
  for (let j = 1; j <= height; j += 1) cells.push({ x: size, y: j, z: 0, arm: 1 });
  for (let k = 1; k <= size; k += 1) cells.push({ x: size, y: height, z: k, arm: 2 });
  for (let j = 1; j <= height - size; j += 1) {
    cells.push({ x: size, y: height - j, z: size, arm: 3 });
  }
  return { cells, netDisplacement: { x: size, y: size, z: size } };
}

/**
 * A rectangular circuit p x q that rises one cell every k cells.
 * Closing in projection requires p(k − 2) = q(k + 2), and the net displacement then works out to
 * (p − q, (2p + 2q)/k, p − q) = t(1, 1, 1).
 */
export function buildStaircaseCells(shortSide, stepsPerRise) {
  const q = shortSide;
  const k = stepsPerRise;
  const ratioNumerator = k + 2;
  const ratioDenominator = k - 2;
  const p = (q * ratioNumerator) / ratioDenominator;
  if (!Number.isInteger(p)) {
    return {
      error: `A circuit that rises every ${k} cells needs a short side that makes ${k + 2}/${k - 2} whole. Try ${STAIRCASE_RISE_OPTIONS.join(", ")}.`,
    };
  }

  const cells = [];
  let x = 0;
  let y = 0;
  let z = 0;
  let travelled = 0;
  const walk = (dx, dz, count, arm) => {
    for (let step = 0; step < count; step += 1) {
      x += dx;
      z += dz;
      travelled += 1;
      if (travelled % k === 0) y += 1;
      cells.push({ x, y, z, arm });
    }
  };

  cells.push({ x, y, z, arm: 0 });
  walk(1, 0, p, 0);
  walk(0, 1, p, 1);
  walk(-1, 0, q, 2);
  walk(0, -1, q, 3);

  return { cells, netDisplacement: { x, y, z }, longSide: p, shortSide: q, stepsPerRise: k };
}

/** The three faces of a unit cube that face a camera above the +x +z quadrant. */
function cubeFaces(cell, azimuthDeg, elevationDeg) {
  const { x, y, z } = cell;
  const p = (px, py, pz) => {
    const point = projectPoint(px, py, pz, azimuthDeg, elevationDeg);
    return [round3(point.x), round3(point.y)];
  };
  return [
    {
      role: "top",
      points: [p(x, y + 1, z), p(x + 1, y + 1, z), p(x + 1, y + 1, z + 1), p(x, y + 1, z + 1)],
    },
    {
      role: "right",
      points: [p(x + 1, y, z), p(x + 1, y + 1, z), p(x + 1, y + 1, z + 1), p(x + 1, y, z + 1)],
    },
    {
      role: "front",
      points: [p(x, y, z + 1), p(x, y + 1, z + 1), p(x + 1, y + 1, z + 1), p(x + 1, y, z + 1)],
    },
  ];
}

/**
 * Build a complete, ready-to-draw scene.
 *
 * @param {object} input
 * @param {"penrose-triangle"|"impossible-rectangle"|"impossible-staircase"} input.kind
 * @param {number} input.size            Arm length in cells (1-12).
 * @param {number} [input.height]        Long side for the rectangle (must exceed size).
 * @param {number} [input.stepsPerRise]  Cells per one-cell rise on the staircase.
 * @param {number} [input.azimuthDeg]
 * @param {number} [input.elevationDeg]
 * @param {number} [input.cubeSize]      Screen units per lattice cell.
 * @returns {object} faces, bounds and diagnostics, or { error }.
 */
export function buildScene(input = {}) {
  const {
    kind = "penrose-triangle",
    size = 4,
    height = 7,
    stepsPerRise = 4,
    azimuthDeg = ISOMETRIC_AZIMUTH_DEG,
    elevationDeg = ISOMETRIC_ELEVATION_DEG,
    cubeSize = 28,
  } = input;

  if (isBadNumber(size) || !Number.isInteger(size) || size < 1 || size > MAX_SIZE) {
    return { error: `Arm length must be a whole number of cells between 1 and ${MAX_SIZE}.` };
  }
  if (isBadNumber(azimuthDeg) || azimuthDeg < 0 || azimuthDeg > 90) {
    return { error: "Azimuth must be between 0° and 90°." };
  }
  if (isBadNumber(elevationDeg) || elevationDeg < 1 || elevationDeg > 89) {
    return { error: "Elevation must be between 1° and 89°." };
  }
  if (isBadNumber(cubeSize) || cubeSize < 4 || cubeSize > 120) {
    return { error: "Cell size must be between 4 and 120 screen units." };
  }

  let built;
  if (kind === "penrose-triangle") {
    built = buildPenroseTriangleCells(size);
  } else if (kind === "impossible-rectangle") {
    if (isBadNumber(height) || !Number.isInteger(height) || height <= size || height > MAX_SIZE * 2) {
      return { error: `The upright must be a whole number of cells taller than the arm (more than ${size}).` };
    }
    built = buildImpossibleRectangleCells(size, height);
  } else if (kind === "impossible-staircase") {
    if (!STAIRCASE_RISE_OPTIONS.includes(stepsPerRise)) {
      return { error: `Cells per rise must be one of ${STAIRCASE_RISE_OPTIONS.join(", ")}.` };
    }
    built = buildStaircaseCells(size, stepsPerRise);
  } else {
    return { error: "Choose one of the three impossible objects." };
  }
  if (built.error) return { error: built.error };

  const { cells, netDisplacement } = built;

  // How far apart the circuit's two ends land on screen. Zero means the figure reads as closed.
  const start = projectPoint(0, 0, 0, azimuthDeg, elevationDeg);
  const end = projectPoint(
    netDisplacement.x,
    netDisplacement.y,
    netDisplacement.z,
    azimuthDeg,
    elevationDeg,
  );
  const projectionGap = round3(Math.hypot(end.x - start.x, end.y - start.y) * cubeSize);

  const faces = [];
  for (const cell of cells) {
    const depth = depthOf(cell.x + 0.5, cell.y + 0.5, cell.z + 0.5, azimuthDeg, elevationDeg);
    for (const face of cubeFaces(cell, azimuthDeg, elevationDeg)) {
      faces.push({
        role: face.role,
        arm: cell.arm,
        depth: round3(depth),
        points: face.points.map(([px, py]) => [round3(px * cubeSize), round3(py * cubeSize)]),
      });
    }
  }
  // Painter's algorithm: farthest first, so nearer cubes overwrite them.
  faces.sort((a, b) => a.depth - b.depth);

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const face of faces) {
    for (const [px, py] of face.points) {
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }
  }
  if (!Number.isFinite(minX)) {
    return { error: "That combination produced no geometry to draw." };
  }

  const padding = Math.max(4, cubeSize / 4);
  const bounds = {
    minX: round3(minX - padding),
    minY: round3(minY - padding),
    width: round3(maxX - minX + padding * 2),
    height: round3(maxY - minY + padding * 2),
  };

  return {
    kind,
    faces,
    bounds,
    cellCount: cells.length,
    faceCount: faces.length,
    netDisplacement,
    projectionGap,
    isImpossible: projectionGap < CLOSURE_TOLERANCE_PX,
    azimuthDeg: round3(azimuthDeg),
    elevationDeg: round3(elevationDeg),
    longSide: built.longSide,
    stepsPerRise: built.stepsPerRise,
    viewBox: `${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`,
  };
}

/** Turn a face's points into an SVG polygon "points" attribute. */
export function toPolygonPoints(points) {
  if (!Array.isArray(points)) return "";
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

/**
 * Opacity per cube face, standing in for the three light levels of a lit cube.
 * Top catches the most light, the +z face the least.
 */
export const FACE_OPACITY = { top: 0.95, right: 0.68, front: 0.45 };

/**
 * Serialise a scene as a standalone SVG document. Colours use `currentColor` so the file inherits
 * whatever text colour it is dropped into, and works in both light and dark contexts.
 * @returns {string} SVG markup, or "" when the scene is not drawable.
 */
export function toSvgMarkup(scene, options = {}) {
  const { strokeWidth = 1 } = options;
  if (!scene || scene.error || !Array.isArray(scene.faces)) return "";
  const polygons = scene.faces
    .map(
      (face) =>
        `  <polygon points="${toPolygonPoints(face.points)}" fill="currentColor" fill-opacity="${
          FACE_OPACITY[face.role] ?? 0.6
        }" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linejoin="round" />`,
    )
    .join("\n");
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${scene.viewBox}" role="img" aria-label="${scene.kind}">`,
    polygons,
    "</svg>",
    "",
  ].join("\n");
}
