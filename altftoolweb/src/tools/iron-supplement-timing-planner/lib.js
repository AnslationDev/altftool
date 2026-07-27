/**
 * Oral iron timing maths.
 *
 * Non-haem iron from a tablet is absorbed in the duodenum and its uptake is
 * strongly affected by what else is in the gut. The separations below are the
 * ones on iron product labelling and in the absorption literature:
 *
 *  - Empty stomach is best: 1 hour before food or 2 hours after a meal
 *    (standard ferrous sulfate labelling). Taking iron with food cuts
 *    absorption but is often necessary when nausea is the alternative.
 *  - Tea and coffee polyphenols bind iron in the gut lumen; a cup of tea with
 *    a meal has been shown to cut non-haem iron absorption by roughly 60%
 *    (Disler PB et al., Gut 1975; Hurrell RF et al., Br J Nutr 1999).
 *    Leave at least 1 hour either side, 2 hours if you can.
 *  - Calcium is the one inhibitor that blocks both haem and non-haem iron;
 *    separate iron from dairy and calcium supplements by 2 hours
 *    (Hallberg L et al., Am J Clin Nutr 1991).
 *  - Antacids and proton-pump inhibitors raise gastric pH, and ferrous iron
 *    needs acid to stay soluble. The labelled rule is iron 2 hours before, or
 *    4 hours after, an antacid.
 *  - Levothyroxine and iron each block the other: 4 hours apart.
 *  - Vitamin C (ascorbic acid) taken at the same time reduces ferric iron and
 *    can several-fold increase absorption, so it is an enhancer, not a clash.
 *  - Alternate-day single doses give a higher fraction absorbed than daily or
 *    twice-daily doses, because a dose raises hepcidin for about 24 hours
 *    (Stoffel NU et al., Lancet Haematology 2017;4:e524 and Blood 2020).
 *
 * Elemental iron percentages are fixed by the chemistry of each salt and are
 * printed on every pack: ferrous sulfate (dried/heptahydrate) about 20%,
 * ferrous fumarate 33%, ferrous gluconate 12%, ferrous ascorbate about 16%.
 *
 * All clock times are minutes since midnight, so the maths stays pure.
 */

export const MINUTES_PER_DAY = 1440;

/** Elemental iron delivered by each common salt, as a fraction of tablet weight. */
export const IRON_SALTS = {
  sulfate: { key: "sulfate", label: "Ferrous sulfate", elementalFraction: 0.2, typicalTabletMg: 325 },
  fumarate: { key: "fumarate", label: "Ferrous fumarate", elementalFraction: 0.33, typicalTabletMg: 200 },
  gluconate: { key: "gluconate", label: "Ferrous gluconate", elementalFraction: 0.12, typicalTabletMg: 300 },
  ascorbate: { key: "ascorbate", label: "Ferrous ascorbate", elementalFraction: 0.16, typicalTabletMg: 100 },
  elemental: { key: "elemental", label: "Pack states elemental iron", elementalFraction: 1, typicalTabletMg: 65 },
};

/**
 * Adult elemental-iron treatment band for iron deficiency anaemia. Older
 * regimens used 150-200 mg/day in divided doses; current guidance favours
 * 60-120 mg once daily or on alternate days because absorption is better and
 * side effects are fewer (BSG/BSH iron deficiency guidance; WHO).
 */
export const ELEMENTAL_DAILY = { low: 60, high: 120, legacyHigh: 200 };

/** Sanity limits so a typo cannot produce a plausible-looking answer. */
export const LIMITS = { tabletMg: { min: 5, max: 2000 }, tabletsPerDose: { min: 0.5, max: 4 } };

/**
 * Items to keep away from the tablet.
 * `gapAfterDose`  - minutes required when the item comes AFTER the tablet.
 * `gapBeforeDose` - minutes required when the item comes BEFORE the tablet.
 */
export const IRON_INTERACTIONS = [
  {
    key: "meal",
    label: "Main meal",
    gapAfterDose: 60,
    gapBeforeDose: 120,
    kind: "blocker",
    why: "Iron absorbs best on an empty stomach — 1 hour before food, or 2 hours after a meal.",
  },
  {
    key: "tea",
    label: "Tea or coffee",
    gapAfterDose: 60,
    gapBeforeDose: 60,
    kind: "blocker",
    why: "Tannins and polyphenols bind iron in the gut; tea with a meal can cut absorption by about 60%.",
  },
  {
    key: "dairy",
    label: "Milk, dairy or calcium tablet",
    gapAfterDose: 120,
    gapBeforeDose: 120,
    kind: "blocker",
    why: "Calcium is the only inhibitor that blocks both haem and non-haem iron.",
  },
  {
    key: "antacid",
    label: "Antacid or PPI",
    gapAfterDose: 120,
    gapBeforeDose: 240,
    kind: "blocker",
    why: "Ferrous iron needs stomach acid to stay soluble: iron 2 hours before, or 4 hours after, an antacid.",
  },
  {
    key: "levothyroxine",
    label: "Levothyroxine",
    gapAfterDose: 240,
    gapBeforeDose: 240,
    kind: "blocker",
    why: "Iron and levothyroxine each block the other; 4 hours apart is the labelled separation.",
  },
  {
    key: "vitaminC",
    label: "Vitamin C source",
    gapAfterDose: 0,
    gapBeforeDose: 0,
    kind: "enhancer",
    maxUsefulGap: 30,
    why: "Ascorbic acid taken with the tablet keeps iron soluble and can multiply absorption.",
  },
];

export const DOSE_FREQUENCIES = {
  daily: { key: "daily", label: "Once daily", dosesPerWeek: 7 },
  alternate: { key: "alternate", label: "Alternate days", dosesPerWeek: 3.5 },
  twiceDaily: { key: "twiceDaily", label: "Twice daily", dosesPerWeek: 14 },
};

const round = (value, dp = 0) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

/** Circular forward distance from `from` to `to`, minutes 0-1439. */
export function forwardGap(from, to) {
  return (((to - from) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

/** Parse "HH:MM" into minutes since midnight, or null. */
export function parseClockTime(text) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(text ?? "").trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Render minutes-since-midnight as "8:30 AM". */
export function formatClockTime(minutes) {
  if (!Number.isFinite(minutes)) return "—";
  const wrapped = ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours24 = Math.floor(wrapped / 60);
  const mins = wrapped % 60;
  const suffix = hours24 < 12 ? "AM" : "PM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(mins).padStart(2, "0")} ${suffix}`;
}

/** "2 h 30 min" style label. */
export function formatGap(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) return "—";
  const safe = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${mins} min`;
}

/** Elemental iron in one dose, milligrams. */
export function elementalIronMg({ saltKey, tabletMg, tabletsPerDose }) {
  const salt = IRON_SALTS[saltKey];
  if (!salt) return null;
  if (!Number.isFinite(tabletMg) || !Number.isFinite(tabletsPerDose)) return null;
  if (tabletMg <= 0 || tabletsPerDose <= 0) return null;
  return tabletMg * salt.elementalFraction * tabletsPerDose;
}

/**
 * Check an iron routine.
 *
 * @param {object} input
 * @param {number} input.doseMinutes  When the tablet is taken.
 * @param {Object<string, number>} input.itemMinutes  Clock time per interaction key.
 * @param {string} input.saltKey
 * @param {number} input.tabletMg
 * @param {number} input.tabletsPerDose
 * @param {"daily"|"alternate"|"twiceDaily"} input.frequency
 * @returns {object} plan, or { error }.
 */
export function planIronTiming({
  doseMinutes,
  itemMinutes = {},
  saltKey = "sulfate",
  tabletMg,
  tabletsPerDose = 1,
  frequency = "daily",
}) {
  if (typeof doseMinutes !== "number" || !Number.isFinite(doseMinutes)) {
    return { error: "Enter the time you take the iron tablet." };
  }
  if (doseMinutes < 0 || doseMinutes >= MINUTES_PER_DAY) {
    return { error: "The tablet time must be a valid time of day." };
  }
  const salt = IRON_SALTS[saltKey];
  if (!salt) return { error: "Choose which iron salt is on the pack." };
  if (!Number.isFinite(tabletMg) || tabletMg < LIMITS.tabletMg.min || tabletMg > LIMITS.tabletMg.max) {
    return {
      error: `Tablet strength must be between ${LIMITS.tabletMg.min} mg and ${LIMITS.tabletMg.max} mg.`,
    };
  }
  if (
    !Number.isFinite(tabletsPerDose) ||
    tabletsPerDose < LIMITS.tabletsPerDose.min ||
    tabletsPerDose > LIMITS.tabletsPerDose.max
  ) {
    return {
      error: `Tablets per dose must be between ${LIMITS.tabletsPerDose.min} and ${LIMITS.tabletsPerDose.max}.`,
    };
  }
  const freq = DOSE_FREQUENCIES[frequency];
  if (!freq) return { error: "Choose how often the dose is taken." };

  const checks = [];
  for (const item of IRON_INTERACTIONS) {
    const at = itemMinutes[item.key];
    if (typeof at !== "number" || !Number.isFinite(at)) continue;
    if (at < 0 || at >= MINUTES_PER_DAY) {
      return { error: `The time entered for ${item.label.toLowerCase()} is not a valid time of day.` };
    }

    const forward = forwardGap(doseMinutes, at);
    const itemIsAfter = forward <= 720;
    const gap = itemIsAfter ? forward : MINUTES_PER_DAY - forward;
    const required = itemIsAfter ? item.gapAfterDose : item.gapBeforeDose;

    if (item.kind === "enhancer") {
      const ok = gap <= item.maxUsefulGap;
      checks.push({
        key: item.key,
        label: item.label,
        kind: "enhancer",
        why: item.why,
        itemMinutes: at,
        itemLabel: formatClockTime(at),
        requiredGap: item.maxUsefulGap,
        actualGap: gap,
        direction: itemIsAfter ? "after" : "before",
        ok,
        shortfall: 0,
        suggestion: ok
          ? null
          : `Move it next to the tablet — within ${formatGap(item.maxUsefulGap)} of ${formatClockTime(doseMinutes)} — so the vitamin C is in the gut at the same time.`,
      });
      continue;
    }

    const ok = gap >= required;
    checks.push({
      key: item.key,
      label: item.label,
      kind: "blocker",
      why: item.why,
      itemMinutes: at,
      itemLabel: formatClockTime(at),
      requiredGap: required,
      actualGap: gap,
      direction: itemIsAfter ? "after" : "before",
      ok,
      shortfall: Math.max(0, required - gap),
      suggestion: ok
        ? null
        : itemIsAfter
          ? `Push it to ${formatClockTime(doseMinutes + item.gapAfterDose)} or later, or take the tablet by ${formatClockTime(at - item.gapAfterDose)}.`
          : `Bring it forward to ${formatClockTime(doseMinutes - item.gapBeforeDose)} or earlier, or take the tablet at ${formatClockTime(at + item.gapBeforeDose)} or later.`,
    });
  }

  const blockers = checks.filter((check) => check.kind === "blocker");
  const failures = blockers.filter((check) => !check.ok);

  const perDoseElemental = elementalIronMg({ saltKey, tabletMg, tabletsPerDose });
  if (perDoseElemental === null || !(perDoseElemental > 0)) {
    return { error: "Could not work out the elemental iron for that tablet." };
  }
  const dosesPerDay = frequency === "twiceDaily" ? 2 : frequency === "alternate" ? 0.5 : 1;
  const elementalPerDay = perDoseElemental * dosesPerDay;
  const elementalPerWeek = perDoseElemental * freq.dosesPerWeek;

  // Suggested slot: 1 hour before the main meal, when one has been entered.
  const mealMinutes = itemMinutes.meal;
  const suggestedDoseMinutes = Number.isFinite(mealMinutes)
    ? ((mealMinutes - 60) % MINUTES_PER_DAY + MINUTES_PER_DAY) % MINUTES_PER_DAY
    : null;

  const notes = [];
  if (frequency === "twiceDaily") {
    notes.push(
      "A dose raises hepcidin for about 24 hours, so a second dose the same day is absorbed poorly. Once daily or alternate days usually delivers more iron overall.",
    );
  }
  if (frequency === "daily") {
    notes.push(
      "Alternate-day dosing gives a higher absorbed fraction per tablet and is often better tolerated — worth raising with your doctor.",
    );
  }
  if (elementalPerDay > ELEMENTAL_DAILY.legacyHigh) {
    notes.push(
      `That is ${round(elementalPerDay)} mg of elemental iron a day, above the ${ELEMENTAL_DAILY.legacyHigh} mg upper end of usual oral treatment. Confirm the dose with your prescriber.`,
    );
  } else if (elementalPerDay > ELEMENTAL_DAILY.high) {
    notes.push(
      `${round(elementalPerDay)} mg of elemental iron a day is above the ${ELEMENTAL_DAILY.low}-${ELEMENTAL_DAILY.high} mg band current guidance favours; extra iron beyond this is mostly not absorbed.`,
    );
  }
  if (!Number.isFinite(itemMinutes.vitaminC)) {
    notes.push("Adding a vitamin C source with the tablet — citrus, amla or a 100 mg tablet — raises absorption.");
  }

  return {
    salt,
    frequency: freq,
    doseMinutes,
    doseLabel: formatClockTime(doseMinutes),
    tabletMg: round(tabletMg),
    tabletsPerDose,
    perDoseElemental: round(perDoseElemental, 1),
    elementalPerDay: round(elementalPerDay, 1),
    elementalPerWeek: round(elementalPerWeek),
    checks,
    blockerCount: blockers.length,
    clearCount: blockers.length - failures.length,
    failures,
    allClear: failures.length === 0,
    worstShortfall: failures.reduce((max, check) => Math.max(max, check.shortfall), 0),
    suggestedDoseMinutes,
    suggestedDoseLabel: suggestedDoseMinutes === null ? null : formatClockTime(suggestedDoseMinutes),
    notes,
  };
}
