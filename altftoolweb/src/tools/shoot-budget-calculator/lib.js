/**
 * Shoot Budget Calculator — line-item production budget maths.
 *
 * Model follows the structure of a standard AICP-style bid form: direct costs
 * are grouped into crew, equipment, location, travel & living, and post, then a
 * contingency percentage is applied to the direct-cost subtotal, and tax is
 * applied last on the contingency-inclusive figure.
 *
 * Pure module — no React, no DOM, no clocks.
 */

/**
 * Contingency line on a production bid. 10% of the direct-cost subtotal is the
 * long-standing default carried on AICP/AICE bid forms; some clients cap it at
 * 5% and documentary/uncontrolled shoots often carry 15%.
 */
export const DEFAULT_CONTINGENCY_PCT = 10;

/**
 * India GST on production and post-production services (SAC heading 9986 /
 * 998611-998612, "motion picture, videotape and television programme production
 * services") is 18%. Enter 0 if you are not registered or are billing overseas.
 */
export const GST_RATE_INDIA_SERVICES = 18;

/** Upper sanity bounds so a typo cannot produce a nonsense budget. */
export const MAX_SHOOT_DAYS = 365;
export const MAX_CONTINGENCY_PCT = 100;
export const MAX_TAX_PCT = 50;
export const MAX_CREW_PER_ROLE = 500;

/**
 * Form defaults only — indicative day rates for a small commercial crew in
 * metro India (INR per person per day). Every rate is editable in the UI.
 */
export const CREW_ROLE_PRESETS = [
  { id: "director", label: "Director", count: 1, dayRate: 15000 },
  { id: "dop", label: "DOP / camera", count: 1, dayRate: 12000 },
  { id: "sound", label: "Sound recordist", count: 1, dayRate: 6000 },
  { id: "gaffer", label: "Gaffer / lighting", count: 2, dayRate: 5000 },
  { id: "assistant", label: "Production assistant", count: 1, dayRate: 3000 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Compute a full shoot budget.
 *
 * @param {object} input
 * @param {number} input.shootDays          Billable days on set.
 * @param {Array<{id?:string,label?:string,count:number,dayRate:number}>} input.crew
 * @param {number} input.gearDailyRate      Rental cost per gear day.
 * @param {number} input.gearDays           Gear rental days (prep/wrap included).
 * @param {number} input.locationPerDay     Location / studio fee per shoot day.
 * @param {number} input.travelPerPerson    Round-trip travel per crew member.
 * @param {number} input.lodgingPerNight    Lodging per crew member per night.
 * @param {number} input.nights             Lodging nights.
 * @param {number} input.mealsPerPersonDay  Meals per crew member per shoot day.
 * @param {number} input.postHours          Editing / grade / mix hours.
 * @param {number} input.postHourlyRate     Post rate per hour.
 * @param {number} input.miscFlat           Insurance, permits, contingency-free extras.
 * @param {number} input.contingencyPct     Contingency as % of direct subtotal.
 * @param {number} input.taxPct             Sales tax / GST as % of pre-tax total.
 * @param {number} [input.deliverableMinutes] Finished runtime, for cost per minute.
 * @returns {object} budget breakdown, or { error } when the input is unusable.
 */
export function computeShootBudget({
  shootDays,
  crew = [],
  gearDailyRate,
  gearDays,
  locationPerDay,
  travelPerPerson,
  lodgingPerNight,
  nights,
  mealsPerPersonDay,
  postHours,
  postHourlyRate,
  miscFlat,
  contingencyPct,
  taxPct,
  deliverableMinutes = 0,
} = {}) {
  const scalars = {
    shootDays,
    gearDailyRate,
    gearDays,
    locationPerDay,
    travelPerPerson,
    lodgingPerNight,
    nights,
    mealsPerPersonDay,
    postHours,
    postHourlyRate,
    miscFlat,
    contingencyPct,
    taxPct,
    deliverableMinutes,
  };
  for (const [key, value] of Object.entries(scalars)) {
    if (!isNum(value)) return { error: `Enter a valid number for ${labelFor(key)}.` };
  }

  if (!Array.isArray(crew)) return { error: "Crew list is missing." };
  for (const member of crew) {
    if (!isNum(member?.count) || !isNum(member?.dayRate)) {
      return { error: "Every crew row needs a head count and a day rate." };
    }
    if (member.count < 0 || member.dayRate < 0) {
      return { error: "Crew counts and day rates cannot be negative." };
    }
    if (member.count > MAX_CREW_PER_ROLE) {
      return { error: `A single role cannot have more than ${MAX_CREW_PER_ROLE} people.` };
    }
  }

  if (shootDays <= 0) return { error: "Shoot days must be greater than zero." };
  if (shootDays > MAX_SHOOT_DAYS) {
    return { error: `Shoot days must be ${MAX_SHOOT_DAYS} or fewer.` };
  }
  if (gearDays < 0 || nights < 0 || postHours < 0 || deliverableMinutes < 0) {
    return { error: "Days, nights, hours and runtime cannot be negative." };
  }
  const nonNegative = [
    gearDailyRate,
    locationPerDay,
    travelPerPerson,
    lodgingPerNight,
    mealsPerPersonDay,
    postHourlyRate,
    miscFlat,
  ];
  if (nonNegative.some((value) => value < 0)) {
    return { error: "Rates and fees cannot be negative." };
  }
  if (contingencyPct < 0 || contingencyPct > MAX_CONTINGENCY_PCT) {
    return { error: `Contingency must be between 0% and ${MAX_CONTINGENCY_PCT}%.` };
  }
  if (taxPct < 0 || taxPct > MAX_TAX_PCT) {
    return { error: `Tax must be between 0% and ${MAX_TAX_PCT}%.` };
  }

  const crewRows = crew.map((member) => ({
    id: member.id ?? member.label ?? "role",
    label: member.label ?? "Crew",
    count: member.count,
    dayRate: member.dayRate,
    amount: member.count * member.dayRate * shootDays,
  }));

  const headcount = crewRows.reduce((sum, row) => sum + row.count, 0);
  const crewCost = crewRows.reduce((sum, row) => sum + row.amount, 0);
  const gearCost = gearDailyRate * gearDays;
  const locationCost = locationPerDay * shootDays;
  const travelCost = travelPerPerson * headcount;
  const lodgingCost = lodgingPerNight * nights * headcount;
  const mealsCost = mealsPerPersonDay * shootDays * headcount;
  const postCost = postHours * postHourlyRate;

  const lines = [
    { key: "crew", label: "Crew", amount: crewCost },
    { key: "gear", label: "Equipment rental", amount: gearCost },
    { key: "location", label: "Location / studio", amount: locationCost },
    { key: "travel", label: "Travel", amount: travelCost },
    { key: "lodging", label: "Lodging", amount: lodgingCost },
    { key: "meals", label: "Meals / craft", amount: mealsCost },
    { key: "post", label: "Post-production", amount: postCost },
    { key: "misc", label: "Insurance, permits & misc", amount: miscFlat },
  ];

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const contingency = (subtotal * contingencyPct) / 100;
  const preTax = subtotal + contingency;
  const tax = (preTax * taxPct) / 100;
  const total = preTax + tax;

  return {
    lines,
    crewRows,
    headcount,
    subtotal,
    contingency,
    preTax,
    tax,
    total,
    costPerShootDay: total / shootDays,
    costPerCrewDay: headcount > 0 ? total / (headcount * shootDays) : null,
    costPerFinishedMinute: deliverableMinutes > 0 ? total / deliverableMinutes : null,
    shares: lines.map((line) => ({
      key: line.key,
      label: line.label,
      share: subtotal > 0 ? (line.amount / subtotal) * 100 : 0,
    })),
  };
}

const FIELD_LABELS = {
  shootDays: "shoot days",
  gearDailyRate: "gear day rate",
  gearDays: "gear days",
  locationPerDay: "location fee per day",
  travelPerPerson: "travel per person",
  lodgingPerNight: "lodging per night",
  nights: "lodging nights",
  mealsPerPersonDay: "meals per person per day",
  postHours: "post hours",
  postHourlyRate: "post hourly rate",
  miscFlat: "misc costs",
  contingencyPct: "contingency %",
  taxPct: "tax %",
  deliverableMinutes: "finished runtime",
};

function labelFor(key) {
  return FIELD_LABELS[key] ?? key;
}
