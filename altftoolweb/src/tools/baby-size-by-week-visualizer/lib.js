/**
 * Estimated fetal size by gestational week.
 *
 * Two different measurements are used in pregnancy, and mixing them is the main
 * reason published "baby length" tables disagree with each other:
 *   - Crown-rump length (CRL), head to bottom, is what scans measure up to about
 *     week 14 and what dating tables quote through the first half of pregnancy.
 *   - Crown-heel length (CHL), head to heel, is what "how long is my baby"
 *     answers mean from roughly week 20 onwards, once the legs are extended
 *     enough to include.
 * This module reports CRL up to week 19 and CHL from week 20, and always says
 * which one it is using.
 *
 * Figures are approximate 50th-centile averages built by linear interpolation
 * between the anchor weeks below, then rounded. They are population averages,
 * not targets: a healthy baby can sit well above or below them, and only your
 * own scan biometry says anything about your pregnancy.
 */

export const MIN_WEEK = 8;
export const MAX_WEEK = 40;

/** Week at which this module switches from crown-rump to crown-heel length. */
export const CROWN_HEEL_FROM_WEEK = 20;

export const GRAMS_PER_OUNCE = 28.349523125;
export const OUNCES_PER_POUND = 16;
export const CM_PER_INCH = 2.54;

/** Crown-rump length anchors (cm) from standard first- and second-trimester dating tables. */
export const CRL_ANCHORS = [
  [8, 1.6],
  [10, 3.1],
  [12, 5.4],
  [14, 8.7],
  [16, 11.6],
  [18, 14.2],
  [19, 15.3],
];

/** Crown-heel length anchors (cm). Growth slows through the third trimester, which the spacing reflects. */
export const CHL_ANCHORS = [
  [20, 25.5],
  [24, 30.0],
  [28, 37.5],
  [32, 42.5],
  [36, 47.5],
  [40, 51.0],
];

/** Estimated fetal weight anchors (grams), 50th centile. 500 g near week 23 and ~3.4 kg at term are the familiar landmarks. */
export const WEIGHT_ANCHORS = [
  [8, 1],
  [10, 4],
  [12, 14],
  [14, 43],
  [16, 100],
  [18, 190],
  [20, 300],
  [22, 430],
  [24, 600],
  [26, 760],
  [28, 1000],
  [30, 1320],
  [32, 1700],
  [34, 2150],
  [36, 2600],
  [38, 3100],
  [40, 3400],
];

/** Familiar-object comparison per week. Size, not shape - a 30-week baby is not cabbage-shaped. */
export const COMPARISONS = {
  8: ["Raspberry", "about the size of a raspberry"],
  9: ["Green olive", "roughly an olive"],
  10: ["Kumquat", "about a kumquat"],
  11: ["Fig", "roughly a fig"],
  12: ["Lime", "about a lime"],
  13: ["Lemon", "roughly a small lemon"],
  14: ["Peach", "about a peach"],
  15: ["Apple", "roughly an apple"],
  16: ["Avocado", "about an avocado"],
  17: ["Pomegranate", "roughly a pomegranate"],
  18: ["Bell pepper", "about a bell pepper"],
  19: ["Mango", "roughly a mango"],
  20: ["Banana", "about a banana, head to heel"],
  21: ["Carrot", "roughly a large carrot"],
  22: ["Papaya", "about a small papaya"],
  23: ["Grapefruit", "roughly a large grapefruit"],
  24: ["Corn cob", "about an ear of corn"],
  25: ["Cauliflower", "roughly a cauliflower"],
  26: ["Lettuce head", "about a head of lettuce"],
  27: ["Cabbage", "roughly a cabbage"],
  28: ["Aubergine", "about a large aubergine"],
  29: ["Butternut squash", "roughly a butternut squash"],
  30: ["Coconut", "about a coconut"],
  31: ["Bottle gourd", "roughly a bottle gourd"],
  32: ["Jicama", "about a large squash"],
  33: ["Pineapple", "roughly a pineapple"],
  34: ["Cantaloupe", "about a cantaloupe melon"],
  35: ["Honeydew melon", "roughly a honeydew melon"],
  36: ["Romaine lettuce", "about a head of romaine"],
  37: ["Winter melon", "roughly a winter melon"],
  38: ["Leek bunch", "about a bunch of leeks in length"],
  39: ["Mini watermelon", "roughly a mini watermelon"],
  40: ["Small pumpkin", "about a small pumpkin"],
};

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Linear interpolation across an anchor list of [x, y] pairs, clamped at both ends. */
export function interpolate(anchors, x) {
  if (!Array.isArray(anchors) || anchors.length === 0) return null;
  if (x <= anchors[0][0]) return anchors[0][1];
  const last = anchors[anchors.length - 1];
  if (x >= last[0]) return last[1];
  for (let i = 1; i < anchors.length; i += 1) {
    const [x1, y1] = anchors[i];
    if (x <= x1) {
      const [x0, y0] = anchors[i - 1];
      const span = x1 - x0;
      if (span === 0) return y1;
      return y0 + ((x - x0) / span) * (y1 - y0);
    }
  }
  return last[1];
}

/** Grams -> { pounds, ounces } with the 16 oz carry handled. */
export function gramsToPoundsOunces(grams) {
  if (!isFiniteNumber(grams) || grams < 0) return { pounds: 0, ounces: 0 };
  const totalOunces = grams / GRAMS_PER_OUNCE;
  let pounds = Math.floor(totalOunces / OUNCES_PER_POUND);
  let ounces = Math.round(totalOunces - pounds * OUNCES_PER_POUND);
  if (ounces === OUNCES_PER_POUND) {
    pounds += 1;
    ounces = 0;
  }
  return { pounds, ounces };
}

export function formatWeight(grams) {
  if (!isFiniteNumber(grams)) return "—";
  const { pounds, ounces } = gramsToPoundsOunces(grams);
  const metric = grams >= 1000 ? `${(grams / 1000).toFixed(2)} kg` : `${Math.round(grams)} g`;
  return `${metric} (${pounds} lb ${ounces} oz)`;
}

export function formatLength(cm) {
  if (!isFiniteNumber(cm)) return "—";
  return `${cm.toFixed(1)} cm (${(cm / CM_PER_INCH).toFixed(1)} in)`;
}

/**
 * @param {number} week completed gestational weeks, 8-40
 */
export function fetalSizeForWeek(week) {
  if (!isFiniteNumber(week)) {
    return { error: "Enter a gestational week as a number." };
  }
  const w = Math.round(week);
  if (w < MIN_WEEK) {
    return {
      error: `Size estimates start at week ${MIN_WEEK}; before that the embryo is only a few millimetres long.`,
    };
  }
  if (w > MAX_WEEK) {
    return {
      error: `Size estimates stop at week ${MAX_WEEK}, the end of the average 40-week gestation.`,
    };
  }

  const usesCrownHeel = w >= CROWN_HEEL_FROM_WEEK;
  const rawLength = usesCrownHeel ? interpolate(CHL_ANCHORS, w) : interpolate(CRL_ANCHORS, w);
  // Tenths of a centimetre while the baby is tiny, half centimetres later where
  // the underlying averages are not precise enough to justify more.
  const lengthCm = rawLength < 10 ? Math.round(rawLength * 10) / 10 : Math.round(rawLength * 2) / 2;
  const rawWeight = interpolate(WEIGHT_ANCHORS, w);
  const weightGrams = rawWeight < 100 ? Math.round(rawWeight) : Math.round(rawWeight / 10) * 10;

  const previous =
    w > MIN_WEEK ? Math.round(interpolate(WEIGHT_ANCHORS, w - 1) / 10) * 10 : null;
  const weeklyGainGrams = previous === null ? null : Math.max(0, weightGrams - previous);

  const [comparisonName, comparisonPhrase] = COMPARISONS[w] ?? ["—", ""];

  return {
    week: w,
    lengthCm,
    lengthInches: lengthCm / CM_PER_INCH,
    lengthType: usesCrownHeel ? "crown-heel" : "crown-rump",
    lengthTypeLabel: usesCrownHeel ? "head to heel" : "head to bottom",
    weightGrams,
    weightKg: weightGrams / 1000,
    ...gramsToPoundsOunces(weightGrams),
    weeklyGainGrams,
    comparisonName,
    comparisonPhrase,
    percentOfTermWeight: (weightGrams / interpolate(WEIGHT_ANCHORS, MAX_WEEK)) * 100,
    percentOfTermLength: (lengthCm / interpolate(CHL_ANCHORS, MAX_WEEK)) * 100,
  };
}

/** Rows for a table, inclusive of both ends. */
export function fetalSizeSeries(fromWeek = MIN_WEEK, toWeek = MAX_WEEK) {
  if (!isFiniteNumber(fromWeek) || !isFiniteNumber(toWeek)) return [];
  const start = Math.max(MIN_WEEK, Math.round(Math.min(fromWeek, toWeek)));
  const end = Math.min(MAX_WEEK, Math.round(Math.max(fromWeek, toWeek)));
  const rows = [];
  for (let w = start; w <= end; w += 1) {
    const row = fetalSizeForWeek(w);
    if (!row.error) rows.push(row);
  }
  return rows;
}
