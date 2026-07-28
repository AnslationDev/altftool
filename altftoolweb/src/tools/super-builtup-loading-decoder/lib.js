/**
 * Super Built-Up Loading Decoder — pure arithmetic.
 *
 * Restates two differently-quoted apartment offers on one common carpet-area
 * basis so the price per usable square foot can be compared directly.
 *
 * Legal definition used throughout, quoted verbatim in the UI:
 *   Real Estate (Regulation and Development) Act, 2016 — section 2(k):
 *   "carpet area" means the net usable floor area of an apartment, excluding
 *   the area covered by the external walls, areas under services shafts,
 *   exclusive balcony or verandah area and exclusive open terrace area, but
 *   includes the area covered by the internal partition walls of the apartment.
 *
 * There is NO data source and no rate table here. Every output is arithmetic on
 * the numbers the user typed.
 */

/**
 * Square feet in one square metre.
 * Derived, not looked up: the international foot is defined as exactly 0.3048 m
 * (NIST SP 811, ISO 80000-3), so 1 m^2 = 1 / 0.3048^2 ft^2.
 */
export const SQFT_PER_SQM = 1 / (0.3048 * 0.3048); // 10.763910416709722

/** RERA 2016 s.2(k), as read from the Act's published text. */
export const CARPET_AREA_DEFINITION =
  'RERA 2016 s.2(k): "carpet area" means the net usable floor area of an apartment, excluding the area covered by the external walls, areas under services shafts, exclusive balcony or verandah area and exclusive open terrace area, but includes the area covered by the internal partition walls of the apartment.';

/** Date the section 2(k) wording above was read from the Act. */
export const DEFINITION_READ_ON = "2026-07-28";

/** Accepted area units. */
export const UNITS = ["sqft", "sqm"];

/** Which area the seller's quoted number refers to. */
export const AREA_BASES = ["carpet", "builtup", "super"];

/**
 * Which area the seller's loading percentage is divided by. All three are in
 * live use in Indian listings, and the same flat produces three different
 * headline percentages depending on the denominator:
 *   carpet  -> loading = (super - carpet) / carpet          (the usual quote)
 *   builtup -> loading = (super - builtup) / builtup        (common-area share only)
 *   super   -> loading = (super - carpet) / super           (a.k.a. "efficiency" quote)
 */
export const LOADING_BASES = ["carpet", "builtup", "super"];

/** Sanity ceilings — beyond these the input is not a flat, it is a typo. */
const MAX_AREA_SQFT = 1_000_000; // ~9.3 hectares under one roof
const MAX_PRICE = 1e13; // Rs 1,00,000 crore
const MAX_LOADING_PERCENT = 1000; // 10x carpet is already absurd
const MAX_WALL_PERCENT = 100; // walls + balcony doubling the carpet is absurd

const AREA_BASIS_LABELS = {
  carpet: "Carpet area",
  builtup: "Built-up area",
  super: "Super built-up area",
};

const LOADING_BASIS_LABELS = {
  carpet: "on carpet area",
  builtup: "on built-up area",
  super: "on super built-up area",
};

export function areaBasisLabel(basis) {
  return AREA_BASIS_LABELS[basis] || "Unknown basis";
}

export function loadingBasisLabel(basis) {
  return LOADING_BASIS_LABELS[basis] || "unknown basis";
}

/** Parse a user-typed number, tolerating commas and spaces. */
function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[,\s_]/g, "").replace(/^\+/, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export function sqftFrom(value, unit) {
  return unit === "sqm" ? value * SQFT_PER_SQM : value;
}

export function sqmFrom(valueSqft) {
  return valueSqft / SQFT_PER_SQM;
}

/**
 * Restate one project on a carpet-area basis.
 *
 * Model — three areas linked by two ratios:
 *   builtUp = carpet * (1 + wallFactor)      wallFactor = walls + balcony premium
 *   super   = carpet / builtUp / super, per the chosen loading denominator
 *
 * @returns {{error: string} | object}
 */
export function analyseProject(input) {
  const {
    label = "Project",
    quotedArea,
    areaBasis = "super",
    unit = "sqft",
    loadingPercent,
    loadingBasis = "carpet",
    wallFactorPercent = 10,
    totalPrice,
  } = input || {};

  if (!UNITS.includes(unit)) {
    return { error: `${label}: unit must be sqft or sqm.` };
  }
  if (!AREA_BASES.includes(areaBasis)) {
    return { error: `${label}: area basis must be carpet, built-up or super built-up.` };
  }
  if (!LOADING_BASES.includes(loadingBasis)) {
    return { error: `${label}: loading basis must be carpet, built-up or super built-up.` };
  }

  const area = toNumber(quotedArea);
  if (area === null) return { error: `${label}: enter the quoted area as a number.` };
  if (area <= 0) return { error: `${label}: quoted area must be greater than zero.` };

  const quotedSqft = sqftFrom(area, unit);
  if (quotedSqft > MAX_AREA_SQFT) {
    return { error: `${label}: quoted area is larger than 10,00,000 sq ft — check the figure.` };
  }

  const price = toNumber(totalPrice);
  if (price === null) return { error: `${label}: enter the total price as a number.` };
  if (price <= 0) return { error: `${label}: total price must be greater than zero.` };
  if (price > MAX_PRICE) {
    return { error: `${label}: total price is above Rs 1,00,000 crore — check the figure.` };
  }

  const loadingPct = toNumber(loadingPercent);
  if (loadingPct === null) return { error: `${label}: enter the loading as a number.` };
  if (loadingPct < 0) return { error: `${label}: loading cannot be negative.` };
  if (loadingPct > MAX_LOADING_PERCENT) {
    return { error: `${label}: loading above ${MAX_LOADING_PERCENT}% is not a real quote.` };
  }

  const wallPct = toNumber(wallFactorPercent);
  if (wallPct === null) return { error: `${label}: enter the wall and balcony premium as a number.` };
  if (wallPct < 0) return { error: `${label}: wall and balcony premium cannot be negative.` };
  if (wallPct > MAX_WALL_PERCENT) {
    return { error: `${label}: a wall and balcony premium above ${MAX_WALL_PERCENT}% is not plausible.` };
  }

  const L = loadingPct / 100;
  const W = wallPct / 100;

  if (loadingBasis === "super" && L >= 1) {
    return {
      error: `${label}: loading measured on super built-up must be under 100% — at 100% no carpet area is left.`,
    };
  }

  // Step 1 — resolve carpet area.
  let carpet;
  let superArea = null;
  if (areaBasis === "carpet") {
    carpet = quotedSqft;
  } else if (areaBasis === "builtup") {
    carpet = quotedSqft / (1 + W);
  } else {
    superArea = quotedSqft;
    if (loadingBasis === "carpet") {
      carpet = superArea / (1 + L);
    } else if (loadingBasis === "builtup") {
      carpet = superArea / (1 + L) / (1 + W);
    } else {
      carpet = superArea * (1 - L);
    }
  }

  // Step 2 — built-up follows from carpet.
  const builtUp = carpet * (1 + W);

  // Step 3 — super built-up, if it was not the quoted figure.
  if (superArea === null) {
    if (loadingBasis === "carpet") superArea = carpet * (1 + L);
    else if (loadingBasis === "builtup") superArea = builtUp * (1 + L);
    else superArea = carpet / (1 - L);
  }

  if (!(carpet > 0) || !Number.isFinite(carpet) || !Number.isFinite(superArea)) {
    return { error: `${label}: those inputs leave no usable carpet area to price.` };
  }

  // The same deal expressed on each of the three denominators.
  const impliedLoading = {
    onCarpet: ((superArea - carpet) / carpet) * 100,
    onBuiltUp: ((superArea - builtUp) / builtUp) * 100,
    onSuper: ((superArea - carpet) / superArea) * 100,
  };

  const quotedRatePerSqft = price / quotedSqft;
  const carpetRatePerSqft = price / carpet;
  const superRatePerSqft = price / superArea;
  const builtUpRatePerSqft = price / builtUp;

  const warnings = [];
  if (superArea < builtUp) {
    warnings.push(
      `Inconsistent: the super built-up area works out to ${superArea.toFixed(0)} sq ft, smaller than the built-up area of ${builtUp.toFixed(0)} sq ft. A ${loadingPct}% loading ${loadingBasisLabel(loadingBasis)} cannot coexist with a ${wallPct}% wall and balcony premium.`,
    );
  }
  if (loadingPct === 0) {
    warnings.push("Loading is 0%, so carpet and super built-up are being treated as the same area.");
  }

  return {
    label,
    unit,
    areaBasis,
    loadingBasis,
    loadingPercentEntered: loadingPct,
    wallFactorPercent: wallPct,
    price,
    areas: {
      carpetSqft: carpet,
      builtUpSqft: builtUp,
      superSqft: superArea,
      quotedSqft,
      carpetSqm: sqmFrom(carpet),
      builtUpSqm: sqmFrom(builtUp),
      superSqm: sqmFrom(superArea),
    },
    rates: {
      quotedRatePerSqft,
      carpetRatePerSqft,
      builtUpRatePerSqft,
      superRatePerSqft,
      carpetRatePerSqm: price / sqmFrom(carpet),
      // What the headline rate hides: every rupee per quoted foot costs this
      // much more once only the usable floor is counted.
      hiddenPremiumPerSqft: carpetRatePerSqft - quotedRatePerSqft,
      hiddenPremiumPercent: ((carpetRatePerSqft - quotedRatePerSqft) / quotedRatePerSqft) * 100,
    },
    impliedLoading,
    unusableSqft: superArea - carpet,
    unusableShareOfSuperPercent: ((superArea - carpet) / superArea) * 100,
    warnings,
  };
}

/**
 * Compare two analysed projects on price per square foot of carpet.
 * "A is N% cheaper than B" is measured against B: N = (rateB - rateA) / rateB.
 */
export function compareProjects(inputA, inputB) {
  const a = analyseProject({ label: "Project A", ...(inputA || {}) });
  if (a.error) return { error: a.error };
  const b = analyseProject({ label: "Project B", ...(inputB || {}) });
  if (b.error) return { error: b.error };

  const rateA = a.rates.carpetRatePerSqft;
  const rateB = b.rates.carpetRatePerSqft;

  let cheaper = null;
  let percentCheaper = 0;
  if (rateA < rateB) {
    cheaper = "A";
    percentCheaper = ((rateB - rateA) / rateB) * 100;
  } else if (rateB < rateA) {
    cheaper = "B";
    percentCheaper = ((rateA - rateB) / rateA) * 100;
  }

  return {
    a,
    b,
    cheaper,
    percentCheaper,
    rateGapPerSqft: Math.abs(rateA - rateB),
    // Carpet area the dearer project's money would buy at the cheaper rate.
    carpetGapSqft: a.areas.carpetSqft - b.areas.carpetSqft,
    loadingGapPoints: a.impliedLoading.onCarpet - b.impliedLoading.onCarpet,
  };
}

/**
 * One sentence naming which convention a raw percentage implies, and what the
 * same flat's loading would read as on the other two denominators.
 */
export function describeLoadingConvention(project) {
  if (!project || project.error) return "";
  const { onCarpet, onBuiltUp, onSuper } = project.impliedLoading;
  const entered = project.loadingPercentEntered;
  const others = [
    project.loadingBasis === "carpet" ? null : `${onCarpet.toFixed(2)}% on carpet`,
    project.loadingBasis === "builtup" ? null : `${onBuiltUp.toFixed(2)}% on built-up`,
    project.loadingBasis === "super" ? null : `${onSuper.toFixed(2)}% on super built-up`,
  ].filter(Boolean);
  return `Entered as ${entered.toFixed(2)}% ${loadingBasisLabel(project.loadingBasis)}. The identical flat would be quoted as ${others.join(" or ")}.`;
}
