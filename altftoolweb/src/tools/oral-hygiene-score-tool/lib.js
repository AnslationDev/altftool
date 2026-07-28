/**
 * Oral hygiene habit scoring.
 *
 * This is an informational habit checklist, not a clinical index (it is NOT the
 * Simplified Oral Hygiene Index OHI-S, which requires a dentist to score plaque
 * and calculus on six tooth surfaces). Weights below are assigned to habits that
 * mainstream dental guidance identifies as the strongest modifiable drivers of
 * caries and gum disease:
 *
 *  - Brush twice a day for two minutes with fluoride toothpaste
 *    (American Dental Association; UK "Delivering Better Oral Health" toolkit).
 *  - Fluoride toothpaste at 1000-1500 ppm fluoride is the single best evidenced
 *    home measure against caries (Cochrane review of fluoride toothpastes).
 *  - Clean between the teeth daily with floss or an interdental brush
 *    (ADA / European Federation of Periodontology).
 *  - Replace a manual brush or brush head every 3-4 months, or sooner if the
 *    bristles splay (ADA).
 *  - Limit the FREQUENCY of free-sugar intakes, not just the total amount; WHO
 *    recommends free sugars stay under 10% of energy intake, and each separate
 *    sugar exposure restarts an acid attack on enamel.
 *  - Tobacco in any form is a major independent risk factor for periodontitis
 *    and oral cancer (WHO).
 *  - Attend a dental check-up on the recall interval your dentist sets; NICE
 *    guidance puts adult recall between 3 and 24 months, and 6-12 months is the
 *    usual band for low-to-moderate risk adults.
 *  - Gums that bleed on brushing are the classic early sign of gingivitis.
 */

/** Maximum achievable score. */
export const MAX_SCORE = 100;

/** Points available per habit. Sum is exactly MAX_SCORE. */
export const WEIGHTS = Object.freeze({
  brushingsPerDay: 18,
  brushingMinutes: 12,
  fluorideToothpaste: 12,
  interdentalDaysPerWeek: 15,
  brushAgeMonths: 8,
  sugarIntakesPerDay: 13,
  tobacco: 10,
  lastDentalVisitMonths: 8,
  gumBleeding: 4,
});

/** ADA target: brush twice daily. */
export const TARGET_BRUSHINGS_PER_DAY = 2;
/** ADA target: two minutes per brushing session. */
export const TARGET_BRUSHING_MINUTES = 2;
/** ADA: replace a brush or brush head every 3-4 months. */
export const BRUSH_REPLACE_MONTHS = 3;
/** Usual low-risk adult dental recall band (NICE: 3-24 months overall). */
export const ROUTINE_CHECKUP_MONTHS = 12;

/** Allowed tobacco answers. */
export const TOBACCO_OPTIONS = Object.freeze(["none", "occasional", "daily"]);
/** Allowed gum-bleeding answers. */
export const BLEEDING_OPTIONS = Object.freeze(["never", "sometimes", "often"]);

/** Score bands. `min` is inclusive. */
export const BANDS = Object.freeze([
  { min: 85, label: "Excellent", note: "Your routine already covers the core evidence-based habits." },
  { min: 70, label: "Good", note: "Solid routine with one or two gaps worth closing." },
  { min: 55, label: "Fair", note: "The basics are there but several high-impact habits are missing." },
  { min: 40, label: "Needs work", note: "Multiple core habits are missing; small fixes will move this fast." },
  { min: 0, label: "High risk", note: "Most protective habits are absent. Book a dental check-up." },
]);

function bandFor(score) {
  for (const band of BANDS) {
    if (score >= band.min) return band;
  }
  return BANDS[BANDS.length - 1];
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

/** Brushings per day: 0 = none, 1 = half credit, 2 or more = full. */
function scoreBrushings(perDay) {
  const max = WEIGHTS.brushingsPerDay;
  if (perDay <= 0) return { earned: 0, max, tip: "Brush at least twice a day — morning and last thing at night." };
  if (perDay < TARGET_BRUSHINGS_PER_DAY) {
    return { earned: 8, max, tip: "Add a second brushing at night; overnight saliva flow drops and plaque acid lingers." };
  }
  return { earned: max, max, tip: "" };
}

/** Session length against the two-minute target. */
function scoreMinutes(minutes) {
  const max = WEIGHTS.brushingMinutes;
  if (minutes <= 0) return { earned: 0, max, tip: "Time your brushing — aim for a full two minutes." };
  if (minutes < 1) return { earned: 3, max, tip: "Under a minute is not long enough; work up to two minutes." };
  if (minutes < TARGET_BRUSHING_MINUTES) {
    return { earned: 6, max, tip: "You are close — use a timer or a two-minute song to reach the full two minutes." };
  }
  return { earned: max, max, tip: "" };
}

function scoreFluoride(usesFluoride) {
  const max = WEIGHTS.fluorideToothpaste;
  if (usesFluoride) return { earned: max, max, tip: "" };
  return {
    earned: 0,
    max,
    tip: "Switch to a toothpaste listing 1000-1500 ppm fluoride — the best-evidenced way to cut decay at home.",
  };
}

/** Interdental cleaning days per week, daily is the target. */
function scoreInterdental(days) {
  const max = WEIGHTS.interdentalDaysPerWeek;
  if (days <= 0) return { earned: 0, max, tip: "Start cleaning between the teeth — a brush cannot reach roughly a third of each tooth surface." };
  if (days <= 2) return { earned: 4, max, tip: "Move interdental cleaning from occasional to most days of the week." };
  if (days <= 4) return { earned: 8, max, tip: "Push interdental cleaning to daily; every skipped day lets plaque mature between the teeth." };
  if (days <= 6) return { earned: 12, max, tip: "Almost daily — close the last day or two for the full benefit." };
  return { earned: max, max, tip: "" };
}

/** Age of the current brush or brush head. */
function scoreBrushAge(months) {
  const max = WEIGHTS.brushAgeMonths;
  if (months <= BRUSH_REPLACE_MONTHS) return { earned: max, max, tip: "" };
  if (months <= 4) return { earned: 5, max, tip: "You are at the outer edge of the 3-4 month replacement window." };
  if (months <= 6) return { earned: 2, max, tip: "Replace your brush or brush head — splayed bristles clean far less plaque." };
  return { earned: 0, max, tip: "Your brush is well past its life; replace it now and every 3-4 months after." };
}

/** Separate free-sugar intakes per day (snacks and sweet drinks, not total grams). */
function scoreSugar(intakes) {
  const max = WEIGHTS.sugarIntakesPerDay;
  if (intakes <= 0) return { earned: max, max, tip: "" };
  if (intakes <= 1) return { earned: 10, max, tip: "One sugar hit a day is manageable — keep it with a meal rather than alone." };
  if (intakes <= 2) return { earned: 7, max, tip: "Group sugary items into mealtimes so enamel gets fewer separate acid attacks." };
  if (intakes <= 3) return { earned: 4, max, tip: "Three separate sugar exposures a day keeps the mouth acidic for hours; cut to one." };
  return { earned: 0, max, tip: "Frequent sipping and snacking on sugar is the strongest driver of new decay — reduce the number of exposures first." };
}

function scoreTobacco(status) {
  const max = WEIGHTS.tobacco;
  if (status === "none") return { earned: max, max, tip: "" };
  if (status === "occasional") {
    return { earned: 4, max, tip: "Even occasional smoking or chewing tobacco raises gum disease risk and masks bleeding." };
  }
  return { earned: 0, max, tip: "Daily tobacco is a leading risk factor for periodontitis and oral cancer; ask about cessation support." };
}

function scoreCheckup(months) {
  const max = WEIGHTS.lastDentalVisitMonths;
  if (months <= 6) return { earned: max, max, tip: "" };
  if (months <= ROUTINE_CHECKUP_MONTHS) return { earned: 6, max, tip: "" };
  if (months <= 24) return { earned: 3, max, tip: "It has been over a year — book a check-up and ask what recall interval suits your risk." };
  return { earned: 0, max, tip: "More than two years without a check-up; early decay and gum disease are usually painless." };
}

function scoreBleeding(status) {
  const max = WEIGHTS.gumBleeding;
  if (status === "never") return { earned: max, max, tip: "" };
  if (status === "sometimes") {
    return { earned: 2, max, tip: "Occasional bleeding usually means plaque is sitting at the gum line — clean there gently but thoroughly." };
  }
  return { earned: 0, max, tip: "Gums that bleed most times you clean are a sign of gingivitis; have a dentist or hygienist look." };
}

/**
 * Score an oral hygiene routine.
 *
 * @param {object} answers
 * @param {number} answers.brushingsPerDay        Times brushed per day (0-6).
 * @param {number} answers.brushingMinutes        Minutes per brushing session (0-10).
 * @param {boolean} answers.fluorideToothpaste    Uses fluoride toothpaste.
 * @param {number} answers.interdentalDaysPerWeek Days per week flossing / interdental brushing (0-7).
 * @param {number} answers.brushAgeMonths         Age of current brush or head, months (0-36).
 * @param {number} answers.sugarIntakesPerDay     Separate sugary food or drink occasions per day (0-20).
 * @param {string} answers.tobacco                "none" | "occasional" | "daily".
 * @param {number} answers.lastDentalVisitMonths  Months since last dental visit (0-240).
 * @param {string} answers.gumBleeding            "never" | "sometimes" | "often".
 * @returns {{score:number,band:string,bandNote:string,items:Array,tips:string[],pointsLost:number}|{error:string}}
 */
export function scoreOralHygiene(answers) {
  const a = answers || {};
  const numeric = {
    brushingsPerDay: a.brushingsPerDay,
    brushingMinutes: a.brushingMinutes,
    interdentalDaysPerWeek: a.interdentalDaysPerWeek,
    brushAgeMonths: a.brushAgeMonths,
    sugarIntakesPerDay: a.sugarIntakesPerDay,
    lastDentalVisitMonths: a.lastDentalVisitMonths,
  };

  for (const [key, value] of Object.entries(numeric)) {
    if (!isFiniteNumber(value)) return { error: `Enter a number for ${key.replace(/([A-Z])/g, " $1").toLowerCase()}.` };
    if (value < 0) return { error: "None of these answers can be negative." };
  }
  if (numeric.brushingsPerDay > 6) return { error: "Brushing more than 6 times a day is not a realistic answer." };
  if (numeric.brushingMinutes > 10) return { error: "Enter brushing time in minutes (10 minutes or less)." };
  if (numeric.interdentalDaysPerWeek > 7) return { error: "A week has 7 days — enter 0 to 7." };
  if (numeric.brushAgeMonths > 36) return { error: "Enter brush age in months (36 or less)." };
  if (numeric.sugarIntakesPerDay > 20) return { error: "Enter sugary occasions per day (20 or less)." };
  if (numeric.lastDentalVisitMonths > 240) return { error: "Enter months since your last dental visit (240 or less)." };
  if (!TOBACCO_OPTIONS.includes(a.tobacco)) return { error: "Choose a tobacco option: none, occasional or daily." };
  if (!BLEEDING_OPTIONS.includes(a.gumBleeding)) return { error: "Choose how often your gums bleed: never, sometimes or often." };

  const items = [
    { key: "brushingsPerDay", label: "Brushing frequency", ...scoreBrushings(numeric.brushingsPerDay) },
    { key: "brushingMinutes", label: "Brushing time per session", ...scoreMinutes(numeric.brushingMinutes) },
    { key: "fluorideToothpaste", label: "Fluoride toothpaste", ...scoreFluoride(Boolean(a.fluorideToothpaste)) },
    { key: "interdentalDaysPerWeek", label: "Cleaning between teeth", ...scoreInterdental(numeric.interdentalDaysPerWeek) },
    { key: "brushAgeMonths", label: "Brush / head freshness", ...scoreBrushAge(numeric.brushAgeMonths) },
    { key: "sugarIntakesPerDay", label: "Sugar exposures per day", ...scoreSugar(numeric.sugarIntakesPerDay) },
    { key: "tobacco", label: "Tobacco use", ...scoreTobacco(a.tobacco) },
    { key: "lastDentalVisitMonths", label: "Dental check-up recency", ...scoreCheckup(numeric.lastDentalVisitMonths) },
    { key: "gumBleeding", label: "Bleeding gums", ...scoreBleeding(a.gumBleeding) },
  ];

  const score = items.reduce((sum, item) => sum + item.earned, 0);
  const band = bandFor(score);
  const tips = items
    .filter((item) => item.tip)
    .sort((x, y) => y.max - y.earned - (x.max - x.earned))
    .map((item) => item.tip);

  return {
    score,
    band: band.label,
    bandNote: band.note,
    items,
    tips,
    pointsLost: MAX_SCORE - score,
  };
}
