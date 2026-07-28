/**
 * Diabetic foot self-check logic.
 *
 * Informational only — this module encodes published screening rules, it does
 * not diagnose. Rule sources:
 *  - NICE guideline NG19 "Diabetic foot problems: prevention and management":
 *    risk stratification into low / moderate / high risk and the matching
 *    foot protection service review frequency (annual, 3-6 monthly,
 *    1-2 monthly).
 *  - NICE NG19 also defines an ACTIVE diabetic foot problem (ulceration,
 *    spreading infection, critical limb ischaemia, gangrene, or suspicion of
 *    acute Charcot arthropathy) and says it should be referred to the
 *    multidisciplinary foot care service within ONE WORKING DAY.
 *  - ADA Standards of Medical Care in Diabetes: people with diabetes should
 *    inspect their feet daily and have a comprehensive foot exam at least
 *    once a year.
 */

/** Per-item answer states used by the checklist. */
export const STATUS = {
  UNCHECKED: "",
  OK: "ok",
  PROBLEM: "problem",
};

/** How quickly a positive finding should be acted on. */
export const URGENCY = {
  SAME_DAY: "same-day",
  SOON: "soon",
};

/**
 * The twelve things a daily foot inspection covers.
 * `urgency: "same-day"` items are the NG19 "active diabetic foot problem"
 * signs; everything else is a "book an appointment" finding.
 */
export const CHECK_ITEMS = [
  {
    id: "skin-break",
    label: "Cut, ulcer or any break in the skin",
    hint: "Look at the sole, heel, sides and tops of both feet.",
    urgency: URGENCY.SAME_DAY,
    action: "Any open wound on a diabetic foot is an active foot problem — contact your diabetes or podiatry team today.",
  },
  {
    id: "spreading-redness",
    label: "Redness spreading out from a wound, or a red streak",
    hint: "Compare the same spot on both feet in good light.",
    urgency: URGENCY.SAME_DAY,
    action: "Spreading redness suggests infection. Seek same-day medical review.",
  },
  {
    id: "discharge",
    label: "Pus, weeping fluid or an unusual smell",
    hint: "Check socks and dressings as well as the skin.",
    urgency: URGENCY.SAME_DAY,
    action: "Discharge or odour points to an infected wound — get it seen today.",
  },
  {
    id: "dark-tissue",
    label: "Skin that has turned black, blue or dusky purple",
    hint: "Toes and heels are the usual sites.",
    urgency: URGENCY.SAME_DAY,
    action: "Dark tissue can mean gangrene or critical ischaemia — this is an emergency.",
  },
  {
    id: "hot-swollen",
    label: "One foot hot, swollen and red with no obvious wound",
    hint: "The affected foot often feels warmer than the other one.",
    urgency: URGENCY.SAME_DAY,
    action: "A hot swollen foot without a wound can be acute Charcot arthropathy — keep weight off it and get urgent review.",
  },
  {
    id: "fever",
    label: "Fever, chills or feeling generally unwell with a foot problem",
    hint: "Systemic symptoms alongside a foot wound.",
    urgency: URGENCY.SAME_DAY,
    action: "Systemic symptoms with a foot wound suggest spreading infection — seek urgent care.",
  },
  {
    id: "blister-callus",
    label: "New blister, corn or hard callus",
    hint: "Usually under the ball of the foot, the big toe or the heel.",
    urgency: URGENCY.SOON,
    action: "Do not cut or file it yourself. Book a podiatry appointment and check your footwear.",
  },
  {
    id: "nails",
    label: "Ingrown, thickened or discoloured toenails",
    hint: "Look at the nail edges and the skin either side.",
    urgency: URGENCY.SOON,
    action: "Leave nail surgery and thick nails to a podiatrist; cut nails straight across in the meantime.",
  },
  {
    id: "between-toes",
    label: "Soggy white skin, itching or peeling between the toes",
    hint: "Separate every toe, including the little toes.",
    urgency: URGENCY.SOON,
    action: "Likely athlete's foot, which can let bacteria in. Dry carefully between toes and ask a pharmacist or clinician.",
  },
  {
    id: "dry-cracks",
    label: "Very dry skin or cracked heels",
    hint: "Run a hand around the heel rim.",
    urgency: URGENCY.SOON,
    action: "Moisturise the foot but not between the toes, and mention persistent cracks at your next review.",
  },
  {
    id: "sensation",
    label: "New numbness, tingling, burning or loss of feeling",
    hint: "Note any change since your last check.",
    urgency: URGENCY.SOON,
    action: "A change in sensation should be assessed — protective sensation loss raises your foot risk category.",
  },
  {
    id: "footwear",
    label: "Stones, rough seams or worn lining inside your shoes",
    hint: "Put a hand inside both shoes before every wear.",
    urgency: URGENCY.SOON,
    action: "Replace or repair the footwear; a foreign object can cause an ulcer you will not feel.",
  },
];

/** Risk factors used by the NG19 stratification. */
export const RISK_FACTORS = [
  { id: "neuropathy", label: "Loss of protective sensation (neuropathy)" },
  { id: "ischaemia", label: "Poor circulation / non-critical limb ischaemia" },
  { id: "deformity", label: "Foot deformity (bunion, claw or hammer toe, Charcot change)" },
  { id: "callus", label: "Callus build-up" },
  { id: "previousUlcer", label: "Previous foot ulcer" },
  { id: "previousAmputation", label: "Previous amputation" },
  { id: "renal", label: "On dialysis or other renal replacement therapy" },
];

/**
 * Review frequency per risk band.
 * minDays is used to schedule the next reminder (the cautious end of the
 * published range); maxDays is shown so the range is visible.
 */
export const REVIEW_INTERVALS = {
  low: { minDays: 365, maxDays: 365, label: "Once a year" },
  moderate: { minDays: 90, maxDays: 180, label: "Every 3 to 6 months" },
  high: { minDays: 30, maxDays: 60, label: "Every 1 to 2 months" },
  active: { minDays: 1, maxDays: 1, label: "Within one working day" },
};

export const RISK_LABELS = {
  low: "Low risk",
  moderate: "Moderate risk",
  high: "High risk",
  active: "Active foot problem",
};

export const RISK_NOTES = {
  low: "No risk factors beyond callus alone. Keep checking daily and attend your annual foot review.",
  moderate: "One risk factor present. NICE NG19 places this in the foot protection service pathway.",
  high: "A previous ulcer or amputation, renal replacement therapy, or two risk factors together.",
  active: "One or more findings today match an active diabetic foot problem and need urgent assessment.",
};

/** Zones offered for free-text notes on the foot map. */
export const FOOT_ZONES = [
  { id: "left-top", label: "Left foot — top and toes" },
  { id: "left-sole", label: "Left foot — sole and heel" },
  { id: "right-top", label: "Right foot — top and toes" },
  { id: "right-sole", label: "Right foot — sole and heel" },
];

const MS_PER_DAY = 86400000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse a YYYY-MM-DD string into a UTC timestamp, or NaN if invalid. */
function parseIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value.trim())) return NaN;
  const [y, m, d] = value.trim().split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return NaN;
  const ts = Date.UTC(y, m - 1, d);
  const back = new Date(ts);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) {
    return NaN;
  }
  return ts;
}

/** Add whole days to a YYYY-MM-DD string and return a YYYY-MM-DD string. */
export function addDays(isoDate, days) {
  const ts = parseIsoDate(isoDate);
  if (!Number.isFinite(ts) || !Number.isFinite(days)) return "";
  return new Date(ts + Math.round(days) * MS_PER_DAY).toISOString().slice(0, 10);
}

/**
 * NICE NG19 risk stratification.
 * high  : previous ulceration, previous amputation, renal replacement therapy,
 *         or any two of {neuropathy, ischaemia, callus, deformity} where at
 *         least one is neuropathy or ischaemia.
 * moderate: exactly one of deformity, neuropathy or non-critical ischaemia.
 * low   : none of the above (callus on its own stays low risk).
 */
export function classifyFootRisk(factors = {}) {
  const f = {
    neuropathy: Boolean(factors.neuropathy),
    ischaemia: Boolean(factors.ischaemia),
    deformity: Boolean(factors.deformity),
    callus: Boolean(factors.callus),
    previousUlcer: Boolean(factors.previousUlcer),
    previousAmputation: Boolean(factors.previousAmputation),
    renal: Boolean(factors.renal),
  };

  const high =
    f.previousUlcer ||
    f.previousAmputation ||
    f.renal ||
    (f.neuropathy && f.ischaemia) ||
    (f.neuropathy && (f.callus || f.deformity)) ||
    (f.ischaemia && (f.callus || f.deformity));

  if (high) return "high";
  if (f.neuropathy || f.ischaemia || f.deformity) return "moderate";
  return "low";
}

/**
 * Score one daily check.
 *
 * @param {object} input
 * @param {Record<string,string>} input.statuses  item id -> STATUS value
 * @param {Record<string,boolean>} input.riskFactors
 * @param {string} input.checkDate  YYYY-MM-DD, the day the check was done
 * @returns {object} result, or { error } for invalid input
 */
export function assessFootCheck({ statuses = {}, riskFactors = {}, checkDate } = {}) {
  const ts = parseIsoDate(checkDate);
  if (!Number.isFinite(ts)) {
    return { error: "Enter the check date as a real calendar date (YYYY-MM-DD)." };
  }
  if (statuses === null || typeof statuses !== "object") {
    return { error: "Checklist answers must be supplied as an object of item answers." };
  }

  const total = CHECK_ITEMS.length;
  const problems = [];
  let inspected = 0;

  for (const item of CHECK_ITEMS) {
    const value = statuses[item.id];
    if (value === STATUS.OK || value === STATUS.PROBLEM) inspected += 1;
    if (value === STATUS.PROBLEM) problems.push(item);
  }

  const urgentFindings = problems.filter((item) => item.urgency === URGENCY.SAME_DAY);
  const routineFindings = problems.filter((item) => item.urgency === URGENCY.SOON);

  const baseRisk = classifyFootRisk(riskFactors);
  const riskLevel = urgentFindings.length > 0 ? "active" : baseRisk;
  const interval = REVIEW_INTERVALS[riskLevel];

  const completion = total > 0 ? (inspected / total) * 100 : 0;

  return {
    checkDate: new Date(ts).toISOString().slice(0, 10),
    totalItems: total,
    inspected,
    skipped: total - inspected,
    completion: Math.round(completion),
    problems,
    urgentFindings,
    routineFindings,
    baseRisk,
    baseRiskLabel: RISK_LABELS[baseRisk],
    riskLevel,
    riskLabel: RISK_LABELS[riskLevel],
    riskNote: RISK_NOTES[riskLevel],
    reviewLabel: interval.label,
    reviewMinDays: interval.minDays,
    reviewMaxDays: interval.maxDays,
    nextReviewDate: addDays(new Date(ts).toISOString().slice(0, 10), interval.minDays),
    nextDailyCheckDate: addDays(new Date(ts).toISOString().slice(0, 10), 1),
  };
}
