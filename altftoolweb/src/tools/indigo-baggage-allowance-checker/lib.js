/**
 * IndiGo (6E) baggage allowance checker.
 *
 * IndiGo publishes a *weight* concept allowance on every route it operates: one
 * cabin bag, one small personal article, and a free check-in weight that the sum
 * of all checked pieces must stay under. There is no "per piece" free allowance —
 * two bags of 8 kg each already breach a 15 kg domestic allowance.
 *
 * The rules encoded below are IndiGo's published standard allowances. Fare
 * families, codeshare sectors, infants, defence/medical concessions and
 * promotional bundles can change them, so treat the result as a pre-flight check
 * and confirm on your own booking before you go to the airport.
 *
 * Nothing here talks to the airline; every number comes from the constants in
 * this file and the figures the user types in.
 */

/** Airline / display identity, so the UI never hard-codes a name. */
export const AIRLINE = { name: "IndiGo", code: "6E", country: "India" };

/**
 * Cabin bag: 1 piece, 7 kg, 55 x 35 x 25 cm (IndiGo's published hand baggage size).
 */
export const CABIN_BAG_KG = 7;
export const CABIN_BAG_PIECES = 1;
export const CABIN_DIMS_CM = [55, 35, 25];

/**
 * Personal article carried in addition to the cabin bag (laptop bag / handbag),
 * 3 kg and 40 x 30 x 15 cm on IndiGo.
 */
export const PERSONAL_BAG_KG = 3;
export const PERSONAL_DIMS_CM = [40, 30, 15];

/**
 * Maximum weight of a single checked piece. Airlines cap this for ground-handling
 * safety; IndiGo will not accept one bag heavier than 32 kg — it has to be split.
 */
export const MAX_SINGLE_PIECE_KG = 32;

/**
 * Checked bag size limit, expressed as the sum of length + width + height.
 * IndiGo's published limit is 158 cm total.
 */
export const CHECKED_DIM_RULE = { type: "linear", maxSumCm: 158 };

/** Default excess baggage rate: IndiGo's published domestic airport rate per extra kg. */
export const DEFAULT_EXCESS_RATE_PER_KG = 600;

/** Currency codes the estimate can be shown in, with a locale for grouping. */
export const CURRENCIES = [
  { code: "INR", locale: "en-IN", label: "INR ₹" },
  { code: "USD", locale: "en-US", label: "USD $" },
  { code: "EUR", locale: "en-IE", label: "EUR €" },
  { code: "GBP", locale: "en-GB", label: "GBP £" },
  { code: "AED", locale: "en-AE", label: "AED د.إ" },
  { code: "SGD", locale: "en-SG", label: "SGD $" },
  { code: "THB", locale: "en-TH", label: "THB ฿" },
  { code: "TRY", locale: "tr-TR", label: "TRY ₺" },
];

export const DEFAULT_CURRENCY = "INR";

/**
 * Fare / route options. `checked.type` is "weight" when the free allowance is a
 * single total weight for all pieces, "piece" when it is N bags of X kg each.
 */
export const FARE_OPTIONS = [
  {
    key: "dom-15",
    label: "Domestic — standard fare (15 kg check-in)",
    cabinKg: CABIN_BAG_KG,
    checked: { type: "weight", allowanceKg: 15 },
  },
  {
    key: "dom-hbo",
    label: "Domestic — hand baggage only fare (no free check-in)",
    cabinKg: CABIN_BAG_KG,
    checked: { type: "weight", allowanceKg: 0 },
  },
  {
    key: "intl-20",
    label: "International — 20 kg sector",
    cabinKg: CABIN_BAG_KG,
    checked: { type: "weight", allowanceKg: 20 },
  },
  {
    key: "intl-25",
    label: "International — 25 kg sector",
    cabinKg: CABIN_BAG_KG,
    checked: { type: "weight", allowanceKg: 25 },
  },
  {
    key: "intl-30",
    label: "International — 30 kg sector",
    cabinKg: CABIN_BAG_KG,
    checked: { type: "weight", allowanceKg: 30 },
  },
];

/** Sanity ceilings so a typo cannot produce a meaningless "result". */
const MAX_REASONABLE_KG = 300;
const MAX_REASONABLE_CM = 400;
/** Ground handling / conveyor practicality — more rows than this is not a passenger. */
export const MAX_CHECKED_BAGS = 8;

const r2 = (n) => Math.round(n * 100) / 100;

function toNum(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  const parsed = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
}

function sortDesc(values) {
  return [...values].sort((a, b) => b - a);
}

/**
 * True when a bag of `dims` fits inside `limits` in some orientation. Comparing
 * the sorted triples is exactly that test: the longest side must fit the longest
 * allowed side, and so on.
 */
export function dimsWithin(dims, limits) {
  const d = sortDesc(dims);
  const l = sortDesc(limits);
  return d[0] <= l[0] && d[1] <= l[1] && d[2] <= l[2];
}

export function sumCm(dims) {
  return r2(dims[0] + dims[1] + dims[2]);
}

export function getFare(key) {
  return FARE_OPTIONS.find((fare) => fare.key === key) || null;
}

export function getCurrency(code) {
  return CURRENCIES.find((entry) => entry.code === code) || CURRENCIES[0];
}

function readDims(raw, label) {
  if (!Array.isArray(raw) || raw.length !== 3) {
    return { error: `Enter length, width and height for the ${label}.` };
  }
  const dims = raw.map(toNum);
  if (dims.some((value) => Number.isNaN(value))) {
    return { error: `${label} dimensions must be numbers in centimetres.` };
  }
  if (dims.some((value) => value <= 0)) {
    return { error: `${label} dimensions must be greater than zero.` };
  }
  if (dims.some((value) => value > MAX_REASONABLE_CM)) {
    return { error: `${label} dimensions above ${MAX_REASONABLE_CM} cm are not a bag — check the units.` };
  }
  return { dims: dims.map(r2) };
}

/**
 * Check one passenger's bags against the selected allowance.
 *
 * @returns {{error:string}|object} verdicts for cabin, personal and checked bags.
 */
export function checkBaggage({
  fareKey = FARE_OPTIONS[0].key,
  cabinBagKg = CABIN_BAG_KG,
  cabinDimsCm = CABIN_DIMS_CM,
  carryPersonalItem = true,
  personalBagKg = PERSONAL_BAG_KG,
  personalDimsCm = PERSONAL_DIMS_CM,
  checkedBags = [],
  excessRatePerKg = DEFAULT_EXCESS_RATE_PER_KG,
  extraPieceFee = 0,
  overweightPieceFee = 0,
} = {}) {
  const fare = getFare(fareKey);
  if (!fare) return { error: "Choose a fare or route from the list." };

  const cabinKg = toNum(cabinBagKg);
  if (Number.isNaN(cabinKg)) return { error: "Cabin bag weight must be a number in kilograms." };
  if (cabinKg < 0) return { error: "Cabin bag weight cannot be negative." };
  if (cabinKg > MAX_REASONABLE_KG) return { error: "Cabin bag weight looks wrong — enter kilograms, not grams." };

  const cabinDimsRead = readDims(cabinDimsCm, "cabin bag");
  if (cabinDimsRead.error) return { error: cabinDimsRead.error };

  let personal = null;
  if (carryPersonalItem) {
    const personalKg = toNum(personalBagKg);
    if (Number.isNaN(personalKg)) return { error: "Personal item weight must be a number in kilograms." };
    if (personalKg < 0) return { error: "Personal item weight cannot be negative." };
    if (personalKg > MAX_REASONABLE_KG) return { error: "Personal item weight looks wrong — enter kilograms." };
    const personalDimsRead = readDims(personalDimsCm, "personal item");
    if (personalDimsRead.error) return { error: personalDimsRead.error };

    const dimsOk = dimsWithin(personalDimsRead.dims, PERSONAL_DIMS_CM);
    const weightOk = personalKg <= PERSONAL_BAG_KG;
    personal = {
      weightKg: r2(personalKg),
      dimsCm: personalDimsRead.dims,
      limitKg: PERSONAL_BAG_KG,
      limitsCm: PERSONAL_DIMS_CM,
      overKg: r2(Math.max(0, personalKg - PERSONAL_BAG_KG)),
      weightOk,
      dimsOk,
      ok: weightOk && dimsOk,
    };
  }

  const cabinDimsOk = dimsWithin(cabinDimsRead.dims, CABIN_DIMS_CM);
  const cabinWeightOk = cabinKg <= fare.cabinKg;
  const cabin = {
    weightKg: r2(cabinKg),
    dimsCm: cabinDimsRead.dims,
    limitKg: fare.cabinKg,
    pieces: CABIN_BAG_PIECES,
    limitsCm: CABIN_DIMS_CM,
    overKg: r2(Math.max(0, cabinKg - fare.cabinKg)),
    weightOk: cabinWeightOk,
    dimsOk: cabinDimsOk,
    ok: cabinWeightOk && cabinDimsOk,
  };

  if (!Array.isArray(checkedBags)) return { error: "Checked bags must be a list." };
  if (checkedBags.length > MAX_CHECKED_BAGS) {
    return { error: `Check up to ${MAX_CHECKED_BAGS} checked bags at a time.` };
  }

  const bags = [];
  for (let index = 0; index < checkedBags.length; index += 1) {
    const raw = checkedBags[index] || {};
    const label = `checked bag ${index + 1}`;
    const weightKg = toNum(raw.weightKg);
    if (Number.isNaN(weightKg)) return { error: `Weight of ${label} must be a number in kilograms.` };
    if (weightKg < 0) return { error: `Weight of ${label} cannot be negative.` };
    if (weightKg > MAX_REASONABLE_KG) return { error: `Weight of ${label} looks wrong — enter kilograms.` };
    const dimsRead = readDims(raw.dimsCm, label);
    if (dimsRead.error) return { error: dimsRead.error };

    const total = sumCm(dimsRead.dims);
    const dimsOk =
      CHECKED_DIM_RULE.type === "linear"
        ? total <= CHECKED_DIM_RULE.maxSumCm
        : dimsWithin(dimsRead.dims, CHECKED_DIM_RULE.maxEachCm);
    const overSinglePieceLimit = weightKg > MAX_SINGLE_PIECE_KG;

    bags.push({
      index: index + 1,
      weightKg: r2(weightKg),
      dimsCm: dimsRead.dims,
      sumCm: total,
      dimsOk,
      overSinglePieceLimit,
      perPieceOverKg: 0,
      ok: dimsOk && !overSinglePieceLimit,
    });
  }

  const rate = Math.max(0, toNum(excessRatePerKg) || 0);
  const pieceFee = Math.max(0, toNum(extraPieceFee) || 0);
  const heavyFee = Math.max(0, toNum(overweightPieceFee) || 0);

  const pieceCount = bags.length;
  const totalCheckedKg = r2(bags.reduce((sum, bag) => sum + bag.weightKg, 0));

  let excessKg = 0;
  let extraPieces = 0;
  let overweightPieces = 0;
  let allowanceText = "";

  if (fare.checked.type === "weight") {
    const allowance = fare.checked.allowanceKg;
    excessKg = r2(Math.max(0, totalCheckedKg - allowance));
    allowanceText =
      allowance > 0
        ? `${allowance} kg total across all checked pieces`
        : "No free checked baggage on this fare";
  } else {
    const { pieces, perPieceKg } = fare.checked;
    extraPieces = Math.max(0, pieceCount - pieces);
    let over = 0;
    for (const bag of bags) {
      const bagOver = Math.max(0, bag.weightKg - perPieceKg);
      bag.perPieceOverKg = r2(bagOver);
      if (bagOver > 0) overweightPieces += 1;
      over += bagOver;
    }
    excessKg = r2(over);
    allowanceText = `${pieces} × ${perPieceKg} kg`;
  }

  let estimatedFee = null;
  if (fare.checked.type === "weight") {
    if (excessKg <= 0) estimatedFee = 0;
    else if (rate > 0) estimatedFee = r2(excessKg * rate);
  } else if (extraPieces === 0 && overweightPieces === 0) {
    estimatedFee = 0;
  } else if (pieceFee > 0 || heavyFee > 0) {
    estimatedFee = r2(extraPieces * pieceFee + overweightPieces * heavyFee);
  }

  const oversizeBags = bags.filter((bag) => !bag.dimsOk).map((bag) => bag.index);
  const overLimitBags = bags.filter((bag) => bag.overSinglePieceLimit).map((bag) => bag.index);

  const issues = [];
  if (!cabin.weightOk) issues.push(`Cabin bag is ${cabin.overKg} kg over the ${cabin.limitKg} kg limit.`);
  if (!cabin.dimsOk) {
    issues.push(`Cabin bag is bigger than ${CABIN_DIMS_CM.join(" × ")} cm.`);
  }
  if (personal && !personal.weightOk) {
    issues.push(`Personal item is ${personal.overKg} kg over the ${PERSONAL_BAG_KG} kg limit.`);
  }
  if (personal && !personal.dimsOk) {
    issues.push(`Personal item is bigger than ${PERSONAL_DIMS_CM.join(" × ")} cm.`);
  }
  if (excessKg > 0) {
    issues.push(
      fare.checked.type === "weight"
        ? `Checked baggage is ${excessKg} kg over the free allowance.`
        : `${overweightPieces} checked bag(s) exceed ${fare.checked.perPieceKg} kg, by ${excessKg} kg in total.`,
    );
  }
  if (extraPieces > 0) issues.push(`${extraPieces} checked piece(s) beyond the free piece allowance.`);
  for (const index of overLimitBags) {
    issues.push(`Checked bag ${index} is over ${MAX_SINGLE_PIECE_KG} kg and must be repacked into two bags.`);
  }
  for (const index of oversizeBags) {
    issues.push(
      CHECKED_DIM_RULE.type === "linear"
        ? `Checked bag ${index} exceeds ${CHECKED_DIM_RULE.maxSumCm} cm (length + width + height).`
        : `Checked bag ${index} exceeds ${CHECKED_DIM_RULE.maxEachCm.join(" × ")} cm.`,
    );
  }

  return {
    airline: AIRLINE,
    fare: { key: fare.key, label: fare.label },
    cabin,
    personal,
    checked: {
      type: fare.checked.type,
      allowanceKg: fare.checked.type === "weight" ? fare.checked.allowanceKg : null,
      pieces: fare.checked.type === "piece" ? fare.checked.pieces : null,
      perPieceKg: fare.checked.type === "piece" ? fare.checked.perPieceKg : null,
      allowanceText,
      bags,
      pieceCount,
      totalKg: totalCheckedKg,
      excessKg,
      extraPieces,
      overweightPieces,
      oversizeBags,
      overLimitBags,
      estimatedFee,
      rateUsed: rate,
    },
    ok: issues.length === 0,
    issues,
  };
}
