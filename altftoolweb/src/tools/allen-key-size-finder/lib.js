/**
 * Hex (Allen) key sizing and metric/imperial cross-matching.
 *
 * A hex key is specified by its width across flats. Metric keys are named in
 * millimetres and imperial keys in inch fractions, and several pairs land so
 * close together that they are genuinely interchangeable while others are
 * close enough to look right and round the socket instead.
 *
 * The distinction is the clearance between key and socket, taken as a
 * percentage of the socket size:
 *
 *   key larger than socket        it will not enter at all
 *   gap up to 1% of the socket    effectively the same size
 *   gap 1% to 3%                  it will turn, but ease off on torque
 *   gap over 3%                   the flats no longer bear properly and the
 *                                 corners of the socket deform
 *
 * The 3% figure comes from how hex drive works: torque is carried on six
 * flats, and once the key can rotate measurably inside the socket, contact
 * concentrates on the corners, which are the part with no material behind
 * them. This is why 6 mm in a 1/4 inch socket (5.5% clearance) destroys the
 * fastener while 5/16 inch in an 8 mm socket (0.8%) is a non-event.
 *
 * Key sizes for fasteners follow the published standards: ISO 4762 socket
 * head cap screws, ISO 7380 button head, ISO 10642 countersunk, ISO 4026
 * socket set screws, and ASME B18.3 for the imperial series.
 */

export const MM_PER_INCH = 25.4;

/** Clearance thresholds as a percentage of the socket size. */
export const FIT_INTERCHANGEABLE_PCT = 1;
export const FIT_CAREFUL_PCT = 3;

/** Metric hex keys, width across flats in mm, as sold in sets. */
export const METRIC_KEYS_MM = [
  0.7, 0.9, 1.3, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 14, 17, 19,
];

/** Imperial hex keys as fractions of an inch; millimetres are derived. */
export const INCH_KEY_FRACTIONS = [
  [1, 32],
  [1, 16],
  [5, 64],
  [3, 32],
  [7, 64],
  [1, 8],
  [9, 64],
  [5, 32],
  [3, 16],
  [7, 32],
  [1, 4],
  [5, 16],
  [3, 8],
  [7, 16],
  [1, 2],
  [9, 16],
  [5, 8],
  [11, 16],
  [3, 4],
  [13, 16],
];

/** Imperial keys with their exact millimetre equivalent. */
export const INCH_KEYS = INCH_KEY_FRACTIONS.map(([numerator, denominator]) => ({
  label: `${numerator}/${denominator}"`,
  inches: numerator / denominator,
  mm: (numerator / denominator) * MM_PER_INCH,
}));

/** Metric keys as objects, for symmetry with INCH_KEYS. */
export const METRIC_KEYS = METRIC_KEYS_MM.map((mm) => ({
  label: `${mm} mm`,
  mm,
  inches: mm / MM_PER_INCH,
}));

/** Hex key across flats by screw, from the published fastener standards. */
export const SCREW_KEY_TABLES = {
  "iso-4762": {
    label: "Socket head cap screw (ISO 4762 / DIN 912)",
    sizes: [
      ["M3", 2.5],
      ["M4", 3],
      ["M5", 4],
      ["M6", 5],
      ["M8", 6],
      ["M10", 8],
      ["M12", 10],
      ["M14", 12],
      ["M16", 14],
      ["M20", 17],
      ["M24", 19],
    ],
    unit: "mm",
  },
  "iso-7380": {
    label: "Button head screw (ISO 7380)",
    sizes: [
      ["M3", 2],
      ["M4", 2.5],
      ["M5", 3],
      ["M6", 4],
      ["M8", 5],
      ["M10", 6],
      ["M12", 8],
      ["M16", 10],
    ],
    unit: "mm",
  },
  "iso-10642": {
    label: "Countersunk socket screw (ISO 10642)",
    sizes: [
      ["M3", 2],
      ["M4", 2.5],
      ["M5", 3],
      ["M6", 4],
      ["M8", 5],
      ["M10", 6],
      ["M12", 8],
      ["M16", 10],
    ],
    unit: "mm",
  },
  "iso-4026": {
    label: "Socket set screw / grub screw (ISO 4026)",
    sizes: [
      ["M3", 1.5],
      ["M4", 2],
      ["M5", 2.5],
      ["M6", 3],
      ["M8", 4],
      ["M10", 5],
      ["M12", 6],
      ["M16", 8],
    ],
    unit: "mm",
  },
  "asme-b18-3": {
    label: "Socket head cap screw, imperial (ASME B18.3)",
    sizes: [
      ["#4", "3/32"],
      ["#6", "7/64"],
      ["#8", "9/64"],
      ["#10", "5/32"],
      ['1/4"', "3/16"],
      ['5/16"', "1/4"],
      ['3/8"', "5/16"],
      ['1/2"', "3/8"],
      ['5/8"', "1/2"],
      ['3/4"', "5/8"],
    ],
    unit: "in",
  },
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

const MAX_SIZE_MM = 60;

/**
 * How a key of one size behaves in a socket of another.
 *
 * @param {number} keyMm    Key width across flats, mm.
 * @param {number} socketMm Socket width across flats, mm.
 */
export function fitBetween(keyMm, socketMm) {
  if (!isNum(keyMm) || !isNum(socketMm)) {
    return { error: "Both sizes must be numbers." };
  }
  if (keyMm <= 0 || socketMm <= 0) {
    return { error: "Sizes must be greater than zero." };
  }
  const gapMm = socketMm - keyMm;
  const gapPct = (gapMm / socketMm) * 100;

  if (gapMm < 0) {
    return {
      gapMm,
      gapPct,
      rating: "too-big",
      label: "Will not enter",
      advice: `The key is ${Math.abs(gapMm).toFixed(3)} mm wider than the socket. Forcing it splits the fastener head or wedges the key.`,
    };
  }
  if (gapMm === 0) {
    return { gapMm, gapPct, rating: "exact", label: "Exact match", advice: "Identical width across flats." };
  }
  if (gapPct <= FIT_INTERCHANGEABLE_PCT) {
    return {
      gapMm,
      gapPct,
      rating: "interchangeable",
      label: "Interchangeable",
      advice: `Only ${gapMm.toFixed(3)} mm of slack, ${gapPct.toFixed(2)}% of the socket. In practice these are the same size.`,
    };
  }
  if (gapPct <= FIT_CAREFUL_PCT) {
    return {
      gapMm,
      gapPct,
      rating: "careful",
      label: "Turns, but ease off",
      advice: `${gapMm.toFixed(2)} mm of slack, ${gapPct.toFixed(1)}% of the socket. It will undo a lightly torqued screw, but do not lean on it.`,
    };
  }
  return {
    gapMm,
    gapPct,
    rating: "rounds",
    label: "Will round the socket",
    advice: `${gapMm.toFixed(2)} mm of slack, ${gapPct.toFixed(1)}% of the socket. Load lands on the corners rather than the flats and the socket deforms.`,
  };
}

/** Nearest key in a list to a target size in mm. */
export function nearestKey(targetMm, keys) {
  if (!isNum(targetMm) || targetMm <= 0 || !Array.isArray(keys) || keys.length === 0) return null;
  let best = keys[0];
  for (const key of keys) {
    if (Math.abs(key.mm - targetMm) < Math.abs(best.mm - targetMm)) best = key;
  }
  return best;
}

/**
 * Cross-match a size you have against the other measurement system.
 *
 * @param {object} input
 * @param {"metric"|"inch"} input.system  Which system the size is given in.
 * @param {number} input.sizeMm           Size across flats in mm (convert inches first).
 */
export function matchHexKey({ system = "metric", sizeMm } = {}) {
  if (system !== "metric" && system !== "inch") {
    return { error: "Choose metric or imperial." };
  }
  if (!isNum(sizeMm)) {
    return { error: "Enter the size across flats as a number." };
  }
  if (sizeMm <= 0) {
    return { error: "Size must be greater than zero." };
  }
  if (sizeMm > MAX_SIZE_MM) {
    return { error: `Hex keys above ${MAX_SIZE_MM} mm across flats are outside the standard range.` };
  }

  const ownList = system === "metric" ? METRIC_KEYS : INCH_KEYS;
  const otherList = system === "metric" ? INCH_KEYS : METRIC_KEYS;

  const own = nearestKey(sizeMm, ownList);
  const counterpart = nearestKey(sizeMm, otherList);

  // Two directions matter and they are not the same question.
  const counterpartInYourSocket = fitBetween(counterpart.mm, sizeMm);
  const yourKeyInCounterpartSocket = fitBetween(sizeMm, counterpart.mm);

  // The safe substitute is the largest key from the other system that still
  // enters the socket, which is not always the nearest one.
  const entering = otherList.filter((key) => key.mm <= sizeMm);
  const largestThatFits = entering.length > 0 ? entering[entering.length - 1] : null;
  const bestSubstitute = largestThatFits ? fitBetween(largestThatFits.mm, sizeMm) : null;

  const differenceMm = counterpart.mm - sizeMm;

  let verdict;
  if (counterpartInYourSocket.rating === "exact" || counterpartInYourSocket.rating === "interchangeable") {
    verdict = `${counterpart.label} and ${own.label} differ by ${Math.abs(differenceMm).toFixed(3)} mm. Treat them as the same size.`;
  } else if (counterpartInYourSocket.rating === "too-big") {
    verdict = `${counterpart.label} is ${Math.abs(differenceMm).toFixed(2)} mm too wide to enter a ${sizeMm} mm socket. ${
      largestThatFits
        ? `The largest that goes in is ${largestThatFits.label}, and ${bestSubstitute.label.toLowerCase()}.`
        : "Nothing in the other system is small enough."
    }`;
  } else {
    verdict = `${counterpart.label} in a ${sizeMm} mm socket leaves ${counterpartInYourSocket.gapMm.toFixed(2)} mm of slack — ${counterpartInYourSocket.label.toLowerCase()}.`;
  }

  return {
    system,
    sizeMm,
    sizeInches: sizeMm / MM_PER_INCH,
    own,
    counterpart,
    differenceMm,
    counterpartInYourSocket,
    yourKeyInCounterpartSocket,
    largestThatFits,
    bestSubstitute,
    verdict,
  };
}

/** Key size for a given screw from one of the fastener standards. */
export function keyForScrew({ standard = "iso-4762", size } = {}) {
  const table = SCREW_KEY_TABLES[standard];
  if (!table) return { error: "Choose a fastener standard." };
  const row = table.sizes.find(([label]) => label === size);
  if (!row) return { error: `${size} is not listed in ${table.label}.` };
  const [label, key] = row;
  if (table.unit === "mm") {
    return { standard: table.label, screw: label, keyLabel: `${key} mm`, keyMm: key };
  }
  const [numerator, denominator] = String(key).split("/").map(Number);
  const mm = (numerator / denominator) * MM_PER_INCH;
  return { standard: table.label, screw: label, keyLabel: `${key}"`, keyMm: mm };
}

/**
 * Every metric/imperial pair whose clearance is small enough to matter, with
 * the fit rating for each direction. Built once from the two lists.
 */
export function buildCrossReference(maxGapPct = 8) {
  const rows = [];
  for (const metric of METRIC_KEYS) {
    const counterpart = nearestKey(metric.mm, INCH_KEYS);
    const gapPct = (Math.abs(counterpart.mm - metric.mm) / metric.mm) * 100;
    if (gapPct > maxGapPct) continue;
    rows.push({
      metric: metric.label,
      metricMm: metric.mm,
      inch: counterpart.label,
      inchMm: counterpart.mm,
      differenceMm: counterpart.mm - metric.mm,
      inchInMetricSocket: fitBetween(counterpart.mm, metric.mm),
      metricInInchSocket: fitBetween(metric.mm, counterpart.mm),
    });
  }
  return rows;
}
