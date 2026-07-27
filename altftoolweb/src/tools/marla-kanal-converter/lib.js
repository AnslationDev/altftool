/**
 * Marla, kanal and the rest of the Punjab revenue ladder.
 *
 * The revenue (traditional) ladder is built on the acre and is exact:
 *   1 sarsai   = 30.25 sq ft            (1/9 marla)
 *   1 marla    = 9 sarsai = 30.25 sq yd = 272.25 sq ft   (1/160 acre)
 *   1 kanal    = 20 marla = 605 sq yd   = 5,445 sq ft    (1/8 acre)
 *   1 killa    = 8 kanal  = 1 acre      = 43,560 sq ft
 *   1 murabba  = 25 killa = 25 acres
 *
 * Many post-independence housing societies instead lay out plots on a "new" marla of
 * 25 sq yd = 225 sq ft, with 20 of them to a kanal (4,500 sq ft). Both conventions are
 * offered below because a plot sold as "5 marla" can be either 1,361 sq ft or 1,125 sq ft
 * depending on which one the layout used - always check the site plan.
 *
 * 1 ft = 0.3048 m by definition, so 1 sq ft = 0.09290304 sq m exactly.
 */

export const M_PER_FT = 0.3048;
export const SQM_PER_SQFT = M_PER_FT * M_PER_FT; // 0.09290304
export const SQFT_PER_ACRE = 43560;

/** Traditional revenue marla: 30.25 sq yd, one 160th of an acre. */
export const SQFT_PER_MARLA_REVENUE = SQFT_PER_ACRE / 160; // 272.25
/** Society marla used in many modern layouts: 25 sq yd. */
export const SQFT_PER_MARLA_SOCIETY = 25 * 9; // 225

export const MARLA_PER_KANAL = 20;
export const SARSAI_PER_MARLA = 9;

export const MARLA_STANDARDS = [
  {
    id: "revenue",
    label: "Revenue marla — 272.25 sq ft (30.25 sq yd)",
    note: "The traditional Punjab, Haryana and Himachal revenue unit: 160 marla to an acre.",
    sqftPerMarla: SQFT_PER_MARLA_REVENUE,
  },
  {
    id: "society",
    label: "Society marla — 225 sq ft (25 sq yd)",
    note: "Used in many planned housing societies, where a 5 marla plot is 1,125 sq ft.",
    sqftPerMarla: SQFT_PER_MARLA_SOCIETY,
  },
];

/** Sanity bound: about 100 sq km. */
export const MAX_SQFT = 1.1e9;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/** The unit table depends on which marla the layout uses, so it is built per call. */
export function buildUnits(standardId = "revenue") {
  const standard = MARLA_STANDARDS.find((s) => s.id === standardId);
  if (!standard) return null;
  const marla = standard.sqftPerMarla;
  return [
    { id: "sarsai", label: `Sarsai (1/9 marla)`, short: "sarsai", sqft: marla / SARSAI_PER_MARLA },
    { id: "marla", label: `Marla (${marla} sq ft)`, short: "marla", sqft: marla },
    { id: "kanal", label: `Kanal (20 marla)`, short: "kanal", sqft: marla * MARLA_PER_KANAL },
    { id: "sqft", label: "Square feet", short: "sq ft", sqft: 1 },
    { id: "sqyd", label: "Square yards (gaj)", short: "sq yd", sqft: 9 },
    { id: "sqm", label: "Square metres", short: "sq m", sqft: 1 / SQM_PER_SQFT },
    { id: "killa", label: "Killa / acre", short: "acre", sqft: SQFT_PER_ACRE },
    { id: "murabba", label: "Murabba (25 killa)", short: "murabba", sqft: SQFT_PER_ACRE * 25 },
    { id: "hectare", label: "Hectare", short: "ha", sqft: 10000 / SQM_PER_SQFT },
  ];
}

/**
 * @param {object} input
 * @param {number} input.value
 * @param {string} input.unit          id from buildUnits()
 * @param {string} [input.standardId]  "revenue" or "society"
 * @param {number} [input.rate]        price per unit of rateUnit
 * @param {string} [input.rateUnit]    id from buildUnits()
 * @returns {{error:string}|object}
 */
export function convertMarla({ value, unit = "marla", standardId = "revenue", rate = 0, rateUnit = "marla" }) {
  const units = buildUnits(standardId);
  if (!units) return { error: "Pick a valid marla standard." };
  const source = units.find((u) => u.id === unit);
  if (!source) return { error: "Pick a valid unit." };
  if (!isNum(value)) return { error: "Enter a number to convert." };
  if (value <= 0) return { error: "Area must be greater than zero." };

  const sqft = value * source.sqft;
  if (!isNum(sqft) || sqft > MAX_SQFT) {
    return { error: "That area is larger than any plot - check the number and the unit." };
  }

  const areas = {};
  units.forEach((u) => {
    areas[u.id] = sqft / u.sqft;
  });

  // Written the way a deal is spoken: whole kanal plus the leftover marla and sarsai.
  const totalMarla = areas.marla;
  const kanalPart = Math.floor(totalMarla / MARLA_PER_KANAL);
  const marlaPart = Math.floor(totalMarla - kanalPart * MARLA_PER_KANAL);
  const sarsaiPart = (totalMarla - kanalPart * MARLA_PER_KANAL - marlaPart) * SARSAI_PER_MARLA;

  let pricing = null;
  if (isNum(rate) && rate > 0) {
    const ru = units.find((u) => u.id === rateUnit);
    if (!ru) return { error: "Pick a valid unit for the rate." };
    const total = areas[ru.id] * rate;
    const perUnit = {};
    units.forEach((u) => {
      perUnit[u.id] = total / areas[u.id];
    });
    pricing = { total, perUnit, rateUnit: ru.id };
  } else if (isNum(rate) && rate < 0) {
    return { error: "Rate cannot be negative." };
  }

  return {
    sqft,
    units,
    areas,
    spoken: { kanal: kanalPart, marla: marlaPart, sarsai: sarsaiPart },
    standard: MARLA_STANDARDS.find((s) => s.id === standardId),
    pricing,
  };
}

/**
 * The same plot count under the other marla convention, so a buyer can see the gap.
 * @returns {{error:string}|{sqftRevenue:number,sqftSociety:number,differenceSqft:number}}
 */
export function compareStandards(marlaCount) {
  if (!isNum(marlaCount) || marlaCount <= 0) return { error: "Enter a marla count greater than zero." };
  const sqftRevenue = marlaCount * SQFT_PER_MARLA_REVENUE;
  const sqftSociety = marlaCount * SQFT_PER_MARLA_SOCIETY;
  return { sqftRevenue, sqftSociety, differenceSqft: sqftRevenue - sqftSociety };
}
