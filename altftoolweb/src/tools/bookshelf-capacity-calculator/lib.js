/**
 * Bookshelf capacity and sag.
 *
 * Capacity is simple division: shelf span divided by average spine thickness.
 * Sag uses the standard simply-supported uniformly-loaded beam deflection:
 *
 *   delta = 5 w L^4 / (384 E I)          with I = b t^3 / 12
 *
 * Writing the load as q newtons per square metre of shelf (so w = q b), the
 * shelf depth b cancels and the result depends only on span, thickness and
 * material:
 *
 *   delta = 5 q L^4 / (32 E t^3)
 *
 * Setting delta equal to the allowable sag L / SAG_LIMIT gives the maximum span:
 *
 *   L_max = t * (32 E * 180 / (5 * SAG_LIMIT_RATIO_BASE * q)) ^ (1/3)
 *
 * which for the usual L/180 limit reduces to L_max = t * (32 E / (900 q))^(1/3).
 */

/** Standard gravity, m/s^2. */
export const GRAVITY = 9.80665;

/**
 * Accepted sag limit for shelving in woodworking practice: no more than
 * span / 180. Stiffer work uses span / 360.
 */
export const SAG_LIMIT_RATIO = 180;

/**
 * Long-term (creep-adjusted) bending modulus in pascals. Wood-based panels lose
 * roughly half their short-term stiffness under a permanent load, which is why
 * a particleboard shelf that looks fine on day one bows within a year.
 */
export const SHELF_MATERIALS = [
  { id: "particleboard", label: "Particleboard / MDF", modulusPa: 1.2e9 },
  { id: "plywood", label: "Plywood", modulusPa: 2.5e9 },
  { id: "softwood", label: "Softwood (pine, deodar)", modulusPa: 3.5e9 },
  { id: "hardwood", label: "Hardwood (teak, oak, sheesham)", modulusPa: 5.5e9 },
  { id: "glass", label: "Toughened glass", modulusPa: 70e9 },
  { id: "steel", label: "Steel", modulusPa: 200e9 },
];

/**
 * Average book dimensions and weight by category. Spine thickness sets how many
 * fit; depth and height set whether the shelf is deep and tall enough.
 */
export const BOOK_TYPES = [
  { id: "paperback", label: "Mass-market paperback", spineCm: 2, weightKg: 0.3, depthCm: 20, heightCm: 20 },
  { id: "trade", label: "Trade paperback", spineCm: 2.5, weightKg: 0.45, depthCm: 23, heightCm: 23 },
  { id: "hardback", label: "Hardback novel", spineCm: 3.5, weightKg: 0.7, depthCm: 25, heightCm: 26 },
  { id: "textbook", label: "Textbook / reference", spineCm: 4.5, weightKg: 1.2, depthCm: 30, heightCm: 30 },
  { id: "art", label: "Art / coffee-table book", spineCm: 3, weightKg: 2, depthCm: 35, heightCm: 38 },
  { id: "mixed", label: "Mixed home library", spineCm: 2.6, weightKg: 0.55, depthCm: 25, heightCm: 27 },
];

/** Air gap left at the end of a shelf so books can be pulled out. */
export const END_GAP_CM = 2;

const round = (value, dp) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

export function getMaterial(id) {
  return SHELF_MATERIALS.find((item) => item.id === id) || null;
}

export function getBookType(id) {
  return BOOK_TYPES.find((item) => item.id === id) || null;
}

/** Uniform load in N/m^2 of shelf area from a linear book density. */
export function loadPerAreaNm2(linearDensityKgPerM, shelfDepthCm) {
  if (!(shelfDepthCm > 0)) return null;
  return (linearDensityKgPerM * GRAVITY) / (shelfDepthCm / 100);
}

/** Mid-span deflection in metres: delta = 5 q L^4 / (32 E t^3). */
export function deflectionM({ spanM, thicknessM, modulusPa, loadNm2 }) {
  if (!(spanM > 0) || !(thicknessM > 0) || !(modulusPa > 0)) return null;
  return (5 * loadNm2 * spanM ** 4) / (32 * modulusPa * thicknessM ** 3);
}

/** Longest span that stays inside the sag limit. */
export function maxSpanM({ thicknessM, modulusPa, loadNm2, sagLimit = SAG_LIMIT_RATIO }) {
  if (!(thicknessM > 0) || !(modulusPa > 0) || !(loadNm2 > 0)) return null;
  const cubed = (32 * modulusPa) / (5 * sagLimit * loadNm2);
  return thicknessM * Math.cbrt(cubed);
}

/**
 * @param {object} input
 * @param {number} input.spanCm        clear span between supports
 * @param {number} input.shelfDepthCm  front-to-back depth of the shelf board
 * @param {number} input.shelfCount    number of shelves in the unit
 * @param {number} input.thicknessMm   shelf board thickness
 * @param {string} input.materialId
 * @param {string} input.bookTypeId
 * @param {number} input.sagLimit      allowable span / sag ratio
 */
export function computeShelfCapacity({
  spanCm,
  shelfDepthCm,
  shelfCount,
  thicknessMm,
  materialId,
  bookTypeId,
  sagLimit = SAG_LIMIT_RATIO,
}) {
  const span = Number(spanCm);
  const depth = Number(shelfDepthCm);
  const shelves = Number(shelfCount);
  const thickness = Number(thicknessMm);
  const limit = Number(sagLimit);

  const material = getMaterial(materialId);
  const book = getBookType(bookTypeId);

  if (!material) return { error: "Choose a shelf material." };
  if (!book) return { error: "Choose a book type." };
  if (![span, depth, shelves, thickness, limit].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for span, depth, shelf count and board thickness." };
  }
  if (span <= 0 || span > 400) return { error: "Shelf span must be between 1 cm and 400 cm." };
  if (depth <= 0 || depth > 100) return { error: "Shelf depth must be between 1 cm and 100 cm." };
  if (!Number.isInteger(shelves) || shelves < 1 || shelves > 30) {
    return { error: "Shelf count must be a whole number between 1 and 30." };
  }
  if (thickness < 3 || thickness > 100) {
    return { error: "Board thickness should be between 3 mm and 100 mm." };
  }
  if (limit < 60 || limit > 1000) {
    return { error: "The sag limit ratio should be between 60 and 1000." };
  }

  const usableSpanCm = Math.max(0, span - END_GAP_CM);
  const booksPerShelf = Math.floor(usableSpanCm / book.spineCm);
  const totalBooks = booksPerShelf * shelves;
  const loadPerShelfKg = booksPerShelf * book.weightKg;
  const totalLoadKg = loadPerShelfKg * shelves;
  const linearDensityKgPerM = book.weightKg / (book.spineCm / 100);

  const q = loadPerAreaNm2(linearDensityKgPerM, depth);
  const spanM = span / 100;
  const thicknessM = thickness / 1000;

  const sagM = deflectionM({ spanM, thicknessM, modulusPa: material.modulusPa, loadNm2: q });
  const safeSpanM = maxSpanM({ thicknessM, modulusPa: material.modulusPa, loadNm2: q, sagLimit: limit });

  const sagMm = sagM === null ? null : round(sagM * 1000, 2);
  const sagRatio = sagM && sagM > 0 ? Math.round(spanM / sagM) : null;
  const maxSpanCm = safeSpanM === null ? null : round(safeSpanM * 100, 1);

  let verdict;
  if (maxSpanCm === null) verdict = "unknown";
  else if (span <= maxSpanCm) verdict = "within-limit";
  else if (span <= maxSpanCm * 1.15) verdict = "marginal";
  else verdict = "over-span";

  const notes = [];
  if (depth < book.depthCm) {
    notes.push(
      `${book.label} volumes are about ${book.depthCm} cm front to back, so they will overhang this ${round(depth, 0)} cm shelf by roughly ${round(book.depthCm - depth, 0)} cm.`,
    );
  }
  if (verdict === "over-span") {
    notes.push(
      `Add a centre support or move to a thicker board: at ${round(span, 0)} cm this shelf sags about ${sagMm} mm, past the span/${limit} limit.`,
    );
  }
  if (material.id === "glass") {
    notes.push("Glass shelf spans must also satisfy the glass supplier's own load table — glass fails suddenly rather than bending visibly.");
  }

  return {
    materialLabel: material.label,
    bookLabel: book.label,
    spineCm: book.spineCm,
    bookWeightKg: book.weightKg,
    usableSpanCm: round(usableSpanCm, 1),
    booksPerShelf,
    totalBooks,
    loadPerShelfKg: round(loadPerShelfKg, 1),
    totalLoadKg: round(totalLoadKg, 1),
    linearDensityKgPerM: round(linearDensityKgPerM, 1),
    loadNm2: q === null ? null : round(q, 1),
    sagMm,
    sagRatio,
    maxSpanCm,
    verdict,
    recommendedDepthCm: book.depthCm,
    recommendedClearHeightCm: book.heightCm,
    shelfCount: shelves,
    notes,
  };
}
