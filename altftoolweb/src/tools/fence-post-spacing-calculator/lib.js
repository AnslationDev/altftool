/**
 * Fence post spacing, hole sizing and concrete quantity.
 *
 * Spacing: a run is divided into whole sections no longer than the maximum
 * span, then the spacing is evened out over them:
 *     sections = ceil(run length / maximum spacing)
 *     spacing  = run length / sections
 *     posts    = sections + 1        (a straight run needs a post at each end)
 *
 * Burial depth follows the standard carpentry rule of burying one third of the
 * post's above-ground height, subject to a 24 inch minimum. That rule is what
 * makes an 8 ft post the right buy for a 6 ft fence: 72 in above ground needs
 * 24 in buried.
 *
 * Hole diameter follows the equally standard rule of three times the post's
 * width, which leaves enough annulus for the concrete to develop strength.
 *
 * Concrete per hole is the annulus between hole and post, over the buried
 * depth only — the gravel drainage bed underneath the post is not concreted:
 *     volume = (hole area - post area) x burial depth
 */

/** 1 cubic foot = 1,728 cubic inches = 28.3168 litres. */
export const CUBIC_INCHES_PER_CUBIC_FOOT = 1728;
export const LITRES_PER_CUBIC_FOOT = 28.3168;
/** 1 foot = 12 inches = 0.3048 m. */
export const INCHES_PER_FOOT = 12;
export const M_PER_FT = 0.3048;
export const CM_PER_INCH = 2.54;
/** 1 cubic yard = 27 cubic feet. */
export const CUBIC_FEET_PER_YARD = 27;

/** Minimum burial for a fence post, regardless of how short the fence is. */
export const MIN_BURIAL_INCHES = 24;
/** Bury one third of the above-ground height. */
export const BURIAL_FRACTION = 1 / 3;
/** Hole diameter = three times the post width. */
export const HOLE_DIAMETER_MULTIPLE = 3;
/** Gravel drainage bed under the post. */
export const DEFAULT_GRAVEL_INCHES = 6;

/**
 * Nominal timber is smaller than its name: a "4x4" is actually 3.5 inches.
 * Widths below are the real dressed sizes.
 */
export const POST_SIZES = {
  wood4x4: { key: "wood4x4", label: '4×4 timber (3.5" actual)', widthIn: 3.5, shape: "square" },
  wood6x6: { key: "wood6x6", label: '6×6 timber (5.5" actual)', widthIn: 5.5, shape: "square" },
  round4: { key: "round4", label: '4" round post', widthIn: 4, shape: "round" },
  round6: { key: "round6", label: '6" round post', widthIn: 6, shape: "round" },
  chainLink: {
    key: "chainLink",
    label: 'Chain-link line post (2 3/8" OD)',
    widthIn: 2.375,
    shape: "round",
  },
  steel: { key: "steel", label: '3" square steel post', widthIn: 3, shape: "square" },
};

/**
 * Yields of premixed concrete bags as published by the manufacturers.
 * An 80 lb bag makes 0.60 cubic feet; a 25 kg bag makes about 12.5 litres.
 */
export const BAG_SIZES = {
  lb80: { key: "lb80", label: "80 lb bag", cubicFeet: 0.6 },
  lb60: { key: "lb60", label: "60 lb bag", cubicFeet: 0.45 },
  lb50: { key: "lb50", label: "50 lb bag", cubicFeet: 0.375 },
  lb40: { key: "lb40", label: "40 lb bag", cubicFeet: 0.3 },
  kg25: { key: "kg25", label: "25 kg bag", cubicFeet: 0.0125 / 0.0283168 },
};

/** Typical maximum spans, in feet, by fence type. */
export const MAX_SPACING_PRESETS = {
  wood: { key: "wood", label: "Wood privacy / picket", feet: 8 },
  vinyl: { key: "vinyl", label: "Vinyl panel", feet: 6 },
  chainLink: { key: "chainLink", label: "Chain link", feet: 10 },
  ranch: { key: "ranch", label: "Ranch rail / post-and-rail", feet: 8 },
  wire: { key: "wire", label: "Wire / field fencing", feet: 12 },
};

const round = (value, decimals = 0) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/** Cross-sectional area of a post, in square inches. */
export function postArea(widthIn, shape) {
  if (!(widthIn > 0)) return 0;
  return shape === "round" ? Math.PI * (widthIn / 2) ** 2 : widthIn ** 2;
}

/**
 * Plan a fence run.
 *
 * @param {object} input
 * @param {number|string} input.runLength     total length of the fence run
 * @param {"ft"|"m"} input.unit               unit for the run and fence height
 * @param {number|string} input.maxSpacing    maximum span between posts, in the same unit
 * @param {number|string} input.fenceHeight   above-ground post height
 * @param {string} input.postSize             key of POST_SIZES
 * @param {number|string} [input.holeDiameterIn] override for hole diameter, inches
 * @param {number|string} input.gravelIn      gravel bed depth in inches
 * @param {string} input.bagSize              key of BAG_SIZES
 * @param {boolean} input.closedLoop          true if the fence returns to its start
 * @returns {object} fence result, or { error } for invalid input
 */
export function planFence({
  runLength = 100,
  unit = "ft",
  maxSpacing = 8,
  fenceHeight = 6,
  postSize = "wood4x4",
  holeDiameterIn,
  gravelIn = DEFAULT_GRAVEL_INCHES,
  bagSize = "lb80",
  closedLoop = false,
}) {
  const post = POST_SIZES[postSize];
  if (!post) return { error: "Choose one of the listed post sizes." };

  const bag = BAG_SIZES[bagSize];
  if (!bag) return { error: "Choose one of the listed concrete bag sizes." };

  if (unit !== "ft" && unit !== "m") return { error: "Unit must be feet or metres." };

  const run = toNumber(runLength);
  const span = toNumber(maxSpacing);
  const height = toNumber(fenceHeight);
  const gravel = toNumber(gravelIn);

  if ([run, span, height, gravel].some((v) => Number.isNaN(v))) {
    return { error: "Enter valid numbers for run, spacing, height and gravel depth." };
  }
  if (run <= 0) return { error: "Fence run must be greater than zero." };
  if (span <= 0) return { error: "Maximum post spacing must be greater than zero." };
  if (span > run) {
    return { error: "Maximum spacing is longer than the whole run — reduce the spacing." };
  }
  if (height <= 0) return { error: "Fence height must be greater than zero." };
  if (gravel < 0) return { error: "Gravel bed depth cannot be negative." };

  const toFt = unit === "m" ? 1 / M_PER_FT : 1;
  const runFt = run * toFt;
  const spanFt = span * toFt;
  const heightFt = height * toFt;

  if (runFt > 50000) return { error: "Runs over 50,000 ft need a fencing contractor's take-off." };
  if (heightFt > 20) return { error: "Above 20 ft this is a structural wall, not a fence." };

  const sections = Math.ceil(runFt / spanFt);
  const posts = closedLoop ? sections : sections + 1;
  const spacingFt = runFt / sections;

  const heightIn = heightFt * INCHES_PER_FOOT;
  const burialIn = Math.max(heightIn * BURIAL_FRACTION, MIN_BURIAL_INCHES);
  const holeDepthIn = burialIn + gravel;
  const postLengthIn = heightIn + burialIn;

  const autoHoleDiaIn = post.widthIn * HOLE_DIAMETER_MULTIPLE;
  const holeDiaRaw = holeDiameterIn === undefined || holeDiameterIn === "" ? autoHoleDiaIn : toNumber(holeDiameterIn);
  if (Number.isNaN(holeDiaRaw)) return { error: "Enter the hole diameter as a number." };
  if (holeDiaRaw <= post.widthIn) {
    return { error: "Hole diameter must be larger than the post — aim for three times its width." };
  }
  if (holeDiaRaw > 48) return { error: "A hole wider than 48 inches is a footing, not a post hole." };

  const holeAreaIn2 = Math.PI * (holeDiaRaw / 2) ** 2;
  const postAreaIn2 = postArea(post.widthIn, post.shape);
  const annulusIn2 = holeAreaIn2 - postAreaIn2;

  const concretePerHoleIn3 = annulusIn2 * burialIn;
  const concretePerHoleFt3 = concretePerHoleIn3 / CUBIC_INCHES_PER_CUBIC_FOOT;
  const totalConcreteFt3 = concretePerHoleFt3 * posts;

  const bagsPerHole = concretePerHoleFt3 / bag.cubicFeet;
  const totalBags = Math.ceil(totalConcreteFt3 / bag.cubicFeet);

  const gravelPerHoleFt3 = (holeAreaIn2 * gravel) / CUBIC_INCHES_PER_CUBIC_FOOT;
  const totalGravelFt3 = gravelPerHoleFt3 * posts;

  return {
    postLabel: post.label,
    bagLabel: bag.label,
    sections,
    posts,
    spacingFt: round(spacingFt, 2),
    spacingIn: round(spacingFt * INCHES_PER_FOOT, 1),
    spacingM: round(spacingFt * M_PER_FT, 2),
    runFt: round(runFt, 2),
    burialIn: round(burialIn, 1),
    burialCm: round(burialIn * CM_PER_INCH, 1),
    holeDepthIn: round(holeDepthIn, 1),
    holeDepthCm: round(holeDepthIn * CM_PER_INCH, 1),
    postLengthIn: round(postLengthIn, 1),
    postLengthFt: round(postLengthIn / INCHES_PER_FOOT, 2),
    holeDiameterIn: round(holeDiaRaw, 2),
    holeDiameterCm: round(holeDiaRaw * CM_PER_INCH, 1),
    autoHoleDiaIn: round(autoHoleDiaIn, 2),
    concretePerHoleFt3: round(concretePerHoleFt3, 3),
    concretePerHoleL: round(concretePerHoleFt3 * LITRES_PER_CUBIC_FOOT, 1),
    totalConcreteFt3: round(totalConcreteFt3, 2),
    totalConcreteYd3: round(totalConcreteFt3 / CUBIC_FEET_PER_YARD, 3),
    totalConcreteM3: round((totalConcreteFt3 * LITRES_PER_CUBIC_FOOT) / 1000, 3),
    bagsPerHole: round(bagsPerHole, 2),
    totalBags,
    gravelPerHoleFt3: round(gravelPerHoleFt3, 3),
    totalGravelFt3: round(totalGravelFt3, 2),
    totalPostLengthFt: round((postLengthIn / INCHES_PER_FOOT) * posts, 1),
  };
}
