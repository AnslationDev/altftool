/**
 * British Airways (BA) baggage allowance checker.
 *
 * British Airways is a *piece* airline everywhere: the free checked allowance is
 * a number of bags, each with its own weight ceiling, not one pooled weight. Two
 * 12 kg bags are therefore two pieces against a 1-bag allowance even though they
 * weigh less together than a single 23 kg case that would be free.
 *
 * Two separate things can go wrong with a checked bag and they are charged
 * differently:
 *   • an extra piece  — more bags than the fare includes;
 *   • a heavy bag     — a piece over its 23 kg or 32 kg weight ceiling. Nothing
 *     over 32 kg is accepted at all, whatever you pay.
 * Size is policed as a per-side rule of 90 × 75 × 43 cm, measured with wheels and
 * handles included.
 *
 * Hand baggage is generous by comparison and identical on every fare, including
 * hand-baggage-only Basic tickets: one cabin bag up to 56 × 45 × 25 cm plus one
 * handbag or laptop bag up to 40 × 30 × 15 cm, each up to 23 kg, with the caveat
 * that you must be able to lift your own bag into the locker.
 *
 * Everything here is computed from these constants and the traveller's own
 * figures; nothing is fetched from the airline.
 */

/** Airline identity, so the UI never hard-codes a name. */
export const AIRLINE = { name: "British Airways", code: "BA", country: "United Kingdom" };

/** Cabin bag: 56 × 45 × 25 cm, up to 23 kg — the same on every BA fare. */
export const CABIN_BAG_KG = 23;
export const CABIN_DIM_RULE = { type: "each", maxEachCm: [56, 45, 25] };

/** Handbag or laptop bag: 40 × 30 × 15 cm, also up to 23 kg. */
export const PERSONAL_BAG_KG = 23;
export const PERSONAL_DIM_RULE = { type: "each", maxEachCm: [40, 30, 15] };

/** Checked piece size, measured including wheels and handles. */
export const CHECKED_DIM_RULE = { type: "each", maxEachCm: [90, 75, 43] };

/** No published cap on the size of all checked pieces added together. */
export const COMBINED_CHECKED_DIM_LIMIT_CM = null;

/** Standard checked piece weight in economy cabins. */
export const STANDARD_PIECE_KG = 23;

/** Premium cabin piece weight, and the absolute manual-handling ceiling. */
export const MAX_SINGLE_PIECE_KG = 32;

/**
 * Piece charges, not per-kilogram rates, are how BA prices excess, so no default
 * per-kilo figure ships here. The extra-bag and heavy-bag fees are inputs because
 * they vary by route band and are cheaper bought online before you reach the airport.
 */
export const DEFAULT_EXCESS_RATE_PER_KG = 0;

/** Currencies the estimate can be shown in, with a locale for digit grouping. */
export const CURRENCIES = [
  { code: "GBP", locale: "en-GB", label: "GBP £" },
  { code: "EUR", locale: "en-IE", label: "EUR €" },
  { code: "USD", locale: "en-US", label: "USD $" },
  { code: "INR", locale: "en-IN", label: "INR ₹" },
  { code: "AED", locale: "en-AE", label: "AED د.إ" },
  { code: "AUD", locale: "en-AU", label: "AUD $" },
  { code: "ZAR", locale: "en-ZA", label: "ZAR R" },
];

export const DEFAULT_CURRENCY = "GBP";

const CABIN = { pieces: 1, kg: CABIN_BAG_KG, combinedKg: null, dimRule: CABIN_DIM_RULE };
const PERSONAL = { kg: PERSONAL_BAG_KG, dimRule: PERSONAL_DIM_RULE };

/** Fare options, named by the checked allowance so you can match your ticket. */
export const FARE_OPTIONS = [
  {
    key: "wt-1x23",
    label: "Euro Traveller / World Traveller — 1 × 23 kg",
    cabin: CABIN,
    personal: PERSONAL,
    checked: { type: "piece", pieces: 1, perPieceKg: STANDARD_PIECE_KG },
  },
  {
    key: "basic-0",
    label: "Basic hand baggage only — no free checked bag",
    cabin: CABIN,
    personal: PERSONAL,
    checked: { type: "piece", pieces: 0, perPieceKg: STANDARD_PIECE_KG },
  },
  {
    key: "wtp-2x23",
    label: "World Traveller Plus — 2 × 23 kg",
    cabin: CABIN,
    personal: PERSONAL,
    checked: { type: "piece", pieces: 2, perPieceKg: STANDARD_PIECE_KG },
  },
  {
    key: "club-2x32",
    label: "Club Europe / Club World — 2 × 32 kg",
    cabin: CABIN,
    personal: PERSONAL,
    checked: { type: "piece", pieces: 2, perPieceKg: MAX_SINGLE_PIECE_KG },
  },
  {
    key: "first-3x32",
    label: "First — 3 × 32 kg",
    cabin: CABIN,
    personal: PERSONAL,
    checked: { type: "piece", pieces: 3, perPieceKg: MAX_SINGLE_PIECE_KG },
  },
  {
    key: "infant-1x23",
    label: "Infant without a seat — 1 × 23 kg",
    cabin: CABIN,
    personal: PERSONAL,
    checked: { type: "piece", pieces: 1, perPieceKg: STANDARD_PIECE_KG },
  },
];

/** First-paint values for the UI, so a real verdict is on screen before any typing. */
export const DEFAULTS = {
  fareKey: "wt-1x23",
  carryCabinBag: true,
  cabinKg: "8",
  cabinDims: ["56", "45", "25"],
  carryPersonal: true,
  personalKg: "3",
  personalDims: ["40", "30", "15"],
  bags: [{ weightKg: "23", dims: ["75", "50", "30"] }],
  rate: "0",
  pieceFee: "0",
  heavyFee: "0",
  currency: DEFAULT_CURRENCY,
};

/* ------------------------------------------------------------------ engine */

/** Sanity ceilings so a typo cannot produce a meaningless "result". */
const MAX_REASONABLE_KG = 300;
const MAX_REASONABLE_CM = 400;

/** Ground handling / conveyor practicality — more rows than this is not a passenger. */
export const MAX_CHECKED_BAGS = 8;

const r2 = (n) => Math.round(n * 100) / 100;

function toNum(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  const text = String(value ?? "").replace(/,/g, "").trim();
  // An empty field is missing input, not zero — Number("") would silently give 0
  // and make an unanswered question look like a real "within allowance" verdict.
  if (text === "") return NaN;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function sortDesc(values) {
  return [...values].sort((a, b) => b - a);
}

/**
 * True when a bag of `dims` fits inside `limits` in some orientation. Comparing the
 * sorted triples is exactly that test: the longest side must fit the longest allowed
 * side, the middle side the middle one, the shortest the shortest.
 */
export function dimsWithin(dims, limits) {
  const d = sortDesc(dims);
  const l = sortDesc(limits);
  return d[0] <= l[0] && d[1] <= l[1] && d[2] <= l[2];
}

/** Linear dimension: the length + width + height figure printed on counter signs. */
export function sumCm(dims) {
  return r2(dims[0] + dims[1] + dims[2]);
}

/**
 * A size rule is one of three shapes:
 *   "linear" — a single length + width + height ceiling;
 *   "each"   — a per-side triple, testable in any orientation;
 *   "both"   — a per-side triple AND a linear ceiling, both of which must hold.
 *              Some airlines publish both, and the linear figure is often the
 *              binding one: a bag at the full per-side limit can still exceed it.
 */
export function dimRuleOk(dims, rule) {
  if (!rule) return true;
  if (rule.type === "linear") return sumCm(dims) <= rule.maxSumCm;
  if (rule.type === "both") return dimsWithin(dims, rule.maxEachCm) && sumCm(dims) <= rule.maxSumCm;
  return dimsWithin(dims, rule.maxEachCm);
}

export function describeDimRule(rule) {
  if (!rule) return "no published size limit";
  if (rule.type === "linear") return `${rule.maxSumCm} cm of length + width + height`;
  if (rule.type === "both") {
    return `${rule.maxEachCm.join(" × ")} cm and ${rule.maxSumCm} cm of length + width + height`;
  }
  return `${rule.maxEachCm.join(" × ")} cm`;
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

function readWeight(raw, label) {
  const kg = toNum(raw);
  if (Number.isNaN(kg)) return { error: `${label} weight must be a number in kilograms.` };
  if (kg < 0) return { error: `${label} weight cannot be negative.` };
  if (kg > MAX_REASONABLE_KG) return { error: `${label} weight looks wrong — enter kilograms, not grams.` };
  return { kg: r2(kg) };
}

/**
 * Check one passenger's bags against the selected fare's published allowance.
 *
 * Pure: the same inputs always give the same object back. Nothing is fetched and no
 * clock is read. Invalid input returns { error } rather than a misleading number.
 *
 * @returns {{error:string}|object}
 */
export function checkBaggage({
  fareKey = FARE_OPTIONS[0].key,
  carryCabinBag = true,
  cabinBagKg = 0,
  cabinDimsCm = [10, 10, 10],
  carryPersonalItem = true,
  personalBagKg = 0,
  personalDimsCm = [10, 10, 10],
  checkedBags = [],
  excessRatePerKg = DEFAULT_EXCESS_RATE_PER_KG,
  extraPieceFee = 0,
  overweightPieceFee = 0,
} = {}) {
  const fare = getFare(fareKey);
  if (!fare) return { error: "Choose a fare or route from the list." };

  const issues = [];

  /* --------------------------------------------------------------- cabin bag */
  let cabin = null;
  if (carryCabinBag) {
    const read = readWeight(cabinBagKg, "Cabin bag");
    if (read.error) return { error: read.error };
    const dimsRead = readDims(cabinDimsCm, "cabin bag");
    if (dimsRead.error) return { error: dimsRead.error };

    const rule = fare.cabin ? fare.cabin.dimRule : CABIN_DIM_RULE;
    const dimsOk = dimRuleOk(dimsRead.dims, rule);
    // When the airline publishes one combined cabin weight, the per-piece figure
    // is not a limit on its own, so no per-piece weight verdict is produced.
    const perPieceLimit = fare.cabin && fare.cabin.combinedKg == null ? fare.cabin.kg : null;
    cabin = {
      allowed: Boolean(fare.cabin),
      weightKg: read.kg,
      dimsCm: dimsRead.dims,
      sumCm: sumCm(dimsRead.dims),
      limitKg: perPieceLimit,
      dimRule: rule,
      overKg: perPieceLimit == null ? 0 : r2(Math.max(0, read.kg - perPieceLimit)),
      weightOk: perPieceLimit == null ? true : read.kg <= perPieceLimit,
      dimsOk,
      ok: false,
    };
    cabin.ok = cabin.allowed && cabin.weightOk && cabin.dimsOk;
  }

  /* ----------------------------------------------------------- personal item */
  let personal = null;
  if (carryPersonalItem) {
    const read = readWeight(personalBagKg, "Personal item");
    if (read.error) return { error: read.error };
    const dimsRead = readDims(personalDimsCm, "personal item");
    if (dimsRead.error) return { error: dimsRead.error };

    const spec = fare.personal;
    const rule = spec ? spec.dimRule : PERSONAL_DIM_RULE;
    const combined = fare.cabin ? fare.cabin.combinedKg ?? null : null;
    const limitKg = spec && spec.kg != null && combined == null ? spec.kg : null;
    const dimsOk = dimRuleOk(dimsRead.dims, rule);
    personal = {
      allowed: Boolean(spec),
      weightKg: read.kg,
      dimsCm: dimsRead.dims,
      sumCm: sumCm(dimsRead.dims),
      limitKg,
      dimRule: rule,
      overKg: limitKg == null ? 0 : r2(Math.max(0, read.kg - limitKg)),
      weightOk: limitKg == null ? true : read.kg <= limitKg,
      dimsOk,
      ok: false,
    };
    personal.ok = personal.allowed && personal.weightOk && personal.dimsOk;
  }

  /* ------------------------- combined cabin weight, where the airline publishes one */
  const combinedLimitKg = fare.cabin ? fare.cabin.combinedKg ?? null : null;
  const combinedCabinKg = r2((cabin ? cabin.weightKg : 0) + (personal ? personal.weightKg : 0));
  const combinedCabinOk = combinedLimitKg == null ? true : combinedCabinKg <= combinedLimitKg;

  /* ------------------------------------------------------------ checked bags */
  if (!Array.isArray(checkedBags)) return { error: "Checked bags must be a list." };
  if (checkedBags.length > MAX_CHECKED_BAGS) {
    return { error: `Check up to ${MAX_CHECKED_BAGS} checked bags at a time.` };
  }

  const checkedRule = fare.checkedDimRule || CHECKED_DIM_RULE;
  const bags = [];
  for (let index = 0; index < checkedBags.length; index += 1) {
    const raw = checkedBags[index] || {};
    const read = readWeight(raw.weightKg, `Checked bag ${index + 1}`);
    if (read.error) return { error: read.error };
    const dimsRead = readDims(raw.dimsCm, `checked bag ${index + 1}`);
    if (dimsRead.error) return { error: dimsRead.error };

    const dimsOk = dimRuleOk(dimsRead.dims, checkedRule);
    const overSinglePieceLimit = read.kg > MAX_SINGLE_PIECE_KG;
    bags.push({
      index: index + 1,
      weightKg: read.kg,
      dimsCm: dimsRead.dims,
      sumCm: sumCm(dimsRead.dims),
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
  const combinedCheckedSumCm = r2(bags.reduce((sum, bag) => sum + bag.sumCm, 0));

  let excessKg = 0;
  let extraPieces = 0;
  let overweightPieces = 0;
  let allowanceText = "";

  if (fare.checked.type === "weight") {
    const allowance = fare.checked.allowanceKg;
    excessKg = r2(Math.max(0, totalCheckedKg - allowance));
    // Some fares cap the number of checked pieces as well as their total weight —
    // a bought-bag airline lets you carry the bags you paid for and no more.
    const maxPieces = fare.checked.maxPieces ?? null;
    if (maxPieces != null) extraPieces = Math.max(0, pieceCount - maxPieces);
    if (allowance <= 0) {
      allowanceText = "No free checked baggage on this fare";
    } else if (maxPieces != null) {
      allowanceText = `${allowance} kg across up to ${maxPieces} checked bag${maxPieces === 1 ? "" : "s"}`;
    } else {
      allowanceText = `${allowance} kg total across all checked pieces`;
    }
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
    allowanceText = pieces > 0 ? `${pieces} × ${perPieceKg} kg` : "No free checked baggage on this fare";
  }

  /* ---------------------------------------------------------------- estimate */
  let estimatedFee = null;
  if (fare.checked.type === "weight") {
    // Only quote a figure when every component that is actually owed has a price.
    const needRate = excessKg > 0;
    const needPieceFee = extraPieces > 0;
    if ((!needRate || rate > 0) && (!needPieceFee || pieceFee > 0)) {
      estimatedFee = r2(excessKg * rate + extraPieces * pieceFee);
    }
  } else if (extraPieces === 0 && overweightPieces === 0) {
    estimatedFee = 0;
  } else if (pieceFee > 0 || heavyFee > 0) {
    estimatedFee = r2(extraPieces * pieceFee + overweightPieces * heavyFee);
  }

  /* ------------------------------------------------------------------ issues */
  const oversizeBags = bags.filter((bag) => !bag.dimsOk).map((bag) => bag.index);
  const overLimitBags = bags.filter((bag) => bag.overSinglePieceLimit).map((bag) => bag.index);

  if (cabin && !cabin.allowed) {
    issues.push("This fare does not include a full-size cabin bag — only the small under-seat item.");
  }
  if (cabin && cabin.allowed && !cabin.weightOk) {
    issues.push(`Cabin bag is ${cabin.overKg} kg over the ${cabin.limitKg} kg limit.`);
  }
  if (cabin && !cabin.dimsOk) {
    issues.push(`Cabin bag is bigger than ${describeDimRule(cabin.dimRule)}.`);
  }
  if (personal && !personal.allowed) {
    issues.push("This fare allows one cabin piece only; a second cabin item is not part of the allowance.");
  }
  if (personal && personal.allowed && !personal.weightOk) {
    issues.push(`Personal item is ${personal.overKg} kg over the ${personal.limitKg} kg limit.`);
  }
  if (personal && !personal.dimsOk) {
    issues.push(`Personal item is bigger than ${describeDimRule(personal.dimRule)}.`);
  }
  if (!combinedCabinOk) {
    issues.push(
      `Cabin pieces weigh ${combinedCabinKg} kg together, over the ${combinedLimitKg} kg combined cabin limit.`,
    );
  }
  if (excessKg > 0) {
    issues.push(
      fare.checked.type === "weight"
        ? `Checked baggage is ${excessKg} kg over the free allowance.`
        : `${overweightPieces} checked bag(s) exceed ${fare.checked.perPieceKg} kg, by ${excessKg} kg in total.`,
    );
  }
  if (extraPieces > 0) {
    issues.push(
      fare.checked.type === "weight"
        ? `${extraPieces} checked bag(s) more than this fare covers — an extra bag has to be bought.`
        : `${extraPieces} checked piece(s) beyond the free piece allowance.`,
    );
  }
  for (const index of overLimitBags) {
    issues.push(`Checked bag ${index} is over ${MAX_SINGLE_PIECE_KG} kg and must be repacked into two bags.`);
  }
  for (const index of oversizeBags) {
    issues.push(`Checked bag ${index} exceeds ${describeDimRule(checkedRule)}.`);
  }

  let combinedCheckedOk = true;
  if (COMBINED_CHECKED_DIM_LIMIT_CM != null && pieceCount > 0) {
    combinedCheckedOk = combinedCheckedSumCm <= COMBINED_CHECKED_DIM_LIMIT_CM;
    if (!combinedCheckedOk) {
      issues.push(
        `All checked pieces together measure ${combinedCheckedSumCm} cm, over the ${COMBINED_CHECKED_DIM_LIMIT_CM} cm combined size limit.`,
      );
    }
  }

  return {
    airline: AIRLINE,
    fare: { key: fare.key, label: fare.label },
    cabin,
    personal,
    combinedCabin: { limitKg: combinedLimitKg, weightKg: combinedCabinKg, ok: combinedCabinOk },
    checked: {
      type: fare.checked.type,
      allowanceKg: fare.checked.type === "weight" ? fare.checked.allowanceKg : null,
      pieces: fare.checked.type === "piece" ? fare.checked.pieces : null,
      perPieceKg: fare.checked.type === "piece" ? fare.checked.perPieceKg : null,
      maxPieces: fare.checked.type === "weight" ? fare.checked.maxPieces ?? null : null,
      allowanceText,
      dimRule: checkedRule,
      bags,
      pieceCount,
      totalKg: totalCheckedKg,
      combinedSumCm: combinedCheckedSumCm,
      combinedLimitCm: COMBINED_CHECKED_DIM_LIMIT_CM,
      combinedOk: combinedCheckedOk,
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
