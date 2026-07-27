/**
 * Miter angles and moulding lengths for picture frames.
 *
 * ANGLES. A closed frame with n equal sides turns through 360 degrees in total,
 * so each corner turns 360/n. That turn is shared by the two pieces meeting
 * there, so each end is cut 180/n degrees away from square - which is exactly
 * the number you dial into a miter saw:
 *
 *   miter saw setting = 180 / n      (45 for a square, 30 for a hexagon,
 *                                     22.5 for an octagon, 60 for a triangle)
 *   interior corner angle = 180 - 360 / n
 *
 * LENGTHS. Widening a regular n-gon by the moulding width m pushes each side
 * out by m and lengthens it, because side length = 2 x apothem x tan(pi/n):
 *
 *   long point  = short point + 2 x m x tan(pi / n)
 *
 * For a rectangle tan(pi/4) = 1, so the long point of each rail is simply the
 * rabbet dimension plus twice the moulding width - the familiar
 * "opening + 2 x moulding" rule.
 *
 * The rabbet opening itself is the artwork plus a small clearance so the piece
 * drops in without binding; glass is normally cut a little under the rabbet for
 * the same reason.
 */

export const UNITS = [
  { id: "mm", label: "millimetres (mm)", defaultKerf: 3, defaultClearance: 3, defaultStock: 2400 },
  { id: "cm", label: "centimetres (cm)", defaultKerf: 0.3, defaultClearance: 0.3, defaultStock: 240 },
  { id: "in", label: "inches (in)", defaultKerf: 0.125, defaultClearance: 0.125, defaultStock: 96 },
];

export const SHAPE_MODES = [
  { id: "rectangle", label: "Rectangle or square" },
  { id: "polygon", label: "Regular polygon (equal sides)" },
];

/** Common regular shapes and their side count. */
export const POLYGON_PRESETS = [
  { sides: 3, label: "Triangle" },
  { sides: 5, label: "Pentagon" },
  { sides: 6, label: "Hexagon" },
  { sides: 8, label: "Octagon" },
  { sides: 10, label: "Decagon" },
  { sides: 12, label: "Dodecagon" },
];

export const MIN_SIDES = 3;
export const MAX_SIDES = 24;

/** Glass is cut this fraction of the clearance under the rabbet so it drops in. */
export const GLASS_UNDERCUT_FRACTION = 0.5;

const DEG = 180 / Math.PI;

/** Miter saw setting, in degrees away from a square cut, for an n-sided frame. */
export function miterAngle(sides) {
  const n = Number(sides);
  if (!Number.isInteger(n) || n < MIN_SIDES) return NaN;
  return 180 / n;
}

/** Interior angle at each corner of a regular n-sided frame, in degrees. */
export function cornerAngle(sides) {
  const n = Number(sides);
  if (!Number.isInteger(n) || n < MIN_SIDES) return NaN;
  return 180 - 360 / n;
}

/** How much longer the outside edge of a rail is than its inside edge, per end. */
export function miterOverhang(mouldingWidth, sides) {
  const n = Number(sides);
  const m = Number(mouldingWidth);
  if (!(m > 0) || !Number.isInteger(n) || n < MIN_SIDES) return NaN;
  return m * Math.tan(Math.PI / n);
}

/**
 * @param {object} input
 * @param {string} input.mode           "rectangle" | "polygon"
 * @param {number} input.sides          side count when mode is polygon
 * @param {number} input.artWidth       artwork width (rectangle)
 * @param {number} input.artHeight      artwork height (rectangle)
 * @param {number} input.artSide        artwork side length (polygon, short point of the rabbet)
 * @param {number} input.clearance      total extra added to the artwork so it drops in
 * @param {number} input.mouldingWidth  face width of the moulding
 * @param {number} input.kerf           blade kerf lost at each cut
 * @param {number} input.wastePct       extra stock for setup and mistakes
 * @param {number} input.stockLength    length of one moulding stick, 0 to skip
 * @param {number} input.rabbetDepth    depth of the rabbet
 * @param {number} input.stackThickness glass + mat + art + backing thickness
 * @returns {object} angles and lengths, or { error }
 */
export function computeFrame({
  mode = "rectangle",
  sides = 4,
  artWidth,
  artHeight,
  artSide,
  clearance = 0,
  mouldingWidth,
  kerf = 0,
  wastePct = 10,
  stockLength = 0,
  rabbetDepth = 0,
  stackThickness = 0,
}) {
  const m = Number(mouldingWidth);
  const clear = Number(clearance);
  const k = Number(kerf);
  const waste = Number(wastePct);
  const stock = Number(stockLength);
  const depth = Number(rabbetDepth);
  const stack = Number(stackThickness);

  if (!SHAPE_MODES.some((entry) => entry.id === mode)) return { error: "Choose a frame shape." };
  if (![m, clear, k, waste, stock, depth, stack].every((v) => Number.isFinite(v))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (!(m > 0)) return { error: "Moulding width must be greater than zero." };
  if (clear < 0) return { error: "Clearance cannot be negative." };
  if (k < 0) return { error: "Blade kerf cannot be negative." };
  if (waste < 0 || waste > 100) return { error: "Waste allowance should be between 0% and 100%." };
  if (stock < 0) return { error: "Stock length cannot be negative." };
  if (depth < 0 || stack < 0) return { error: "Rabbet depth and stack thickness cannot be negative." };

  const n = mode === "rectangle" ? 4 : Math.round(Number(sides));
  if (!Number.isInteger(n) || n < MIN_SIDES || n > MAX_SIDES) {
    return { error: `Side count must be a whole number between ${MIN_SIDES} and ${MAX_SIDES}.` };
  }

  const angle = miterAngle(n);
  const overhang = miterOverhang(m, n);
  const rails = [];

  if (mode === "rectangle") {
    const w = Number(artWidth);
    const h = Number(artHeight);
    if (!Number.isFinite(w) || !Number.isFinite(h)) {
      return { error: "Enter the artwork width and height as numbers." };
    }
    if (w <= 0 || h <= 0) return { error: "Artwork width and height must be greater than zero." };
    const rabbetW = w + clear;
    const rabbetH = h + clear;
    rails.push({ label: "Top and bottom rail", quantity: 2, shortPoint: rabbetW, longPoint: rabbetW + 2 * overhang });
    rails.push({ label: "Left and right stile", quantity: 2, shortPoint: rabbetH, longPoint: rabbetH + 2 * overhang });
  } else {
    const s = Number(artSide);
    if (!Number.isFinite(s)) return { error: "Enter the side length of the opening as a number." };
    if (s <= 0) return { error: "Side length must be greater than zero." };
    const rabbetSide = s + clear;
    rails.push({ label: `All ${n} sides`, quantity: n, shortPoint: rabbetSide, longPoint: rabbetSide + 2 * overhang });
  }

  const pieces = rails.reduce((sum, rail) => sum + rail.quantity, 0);
  const cuts = pieces * 2;
  const railLength = rails.reduce((sum, rail) => sum + rail.longPoint * rail.quantity, 0);
  const kerfLoss = cuts * k;
  const netLength = railLength + kerfLoss;
  const orderLength = netLength * (1 + waste / 100);

  const openingW = mode === "rectangle" ? Number(artWidth) + clear : null;
  const openingH = mode === "rectangle" ? Number(artHeight) + clear : null;
  const openingSide = mode === "polygon" ? Number(artSide) + clear : null;
  const glassUndercut = clear * GLASS_UNDERCUT_FRACTION;

  const outerW = openingW === null ? null : openingW + 2 * m;
  const outerH = openingH === null ? null : openingH + 2 * m;

  const depthWarning =
    depth > 0 && stack > 0 && stack > depth
      ? `The contents are ${round(stack - depth, 3)} thicker than the rabbet — deepen the rabbet or add a backing lip.`
      : "";

  return {
    sides: n,
    mode,
    miterAngle: angle,
    bladeAngleFromEdge: 90 - angle,
    cornerAngle: cornerAngle(n),
    overhangPerEnd: overhang,
    rails,
    pieces,
    cuts,
    railLength,
    kerfLoss,
    netLength,
    orderLength,
    wastePct: waste,
    stockLength: stock,
    sticksNeeded: stock > 0 ? Math.ceil(orderLength / stock) : null,
    rabbetWidth: openingW,
    rabbetHeight: openingH,
    rabbetSide: openingSide,
    glassWidth: openingW === null ? null : openingW - glassUndercut,
    glassHeight: openingH === null ? null : openingH - glassUndercut,
    glassSide: openingSide === null ? null : openingSide - glassUndercut,
    outerWidth: outerW,
    outerHeight: outerH,
    rabbetDepth: depth,
    stackThickness: stack,
    depthWarning,
    degreesLabel: `${round(angle, 2)}°`,
    radiansPerCorner: angle / DEG,
  };
}

function round(value, places) {
  const factor = Math.pow(10, places);
  return Math.round(value * factor) / factor;
}
