/**
 * Pest Control Planner — illustrative treatment, interval and cost scenarios
 * for Indian homes.
 *
 * The dated catalogue contains editable-scenario defaults, not provider quotes,
 * prescribed treatment schedules or promised warranties. The UI tells users to
 * replace these assumptions with written local quotes before booking.
 *
 * Statutory / standards references:
 *  - Disinfecting and exterminating services (SAC 998531) attract 18% GST.
 *  - Anti-termite treatment follows IS 6313: Part 2 (pre-construction) and
 *    Part 3 (post-construction chemical barrier by drill-fill-seal).
 *
 * Pure module: no React, no DOM, no clock reads. The starting month is passed in.
 */

/** GST on disinfecting and pest control services, SAC 998531. */
export const GST_RATE = 0.18;

/** Identifies the illustrative baseline; it is not a claim of live market data. */
export const ASSUMPTIONS_BASELINE = "August 2026 demo baseline";

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Illustrative pest catalogue used to compare scenarios.
 * ratePerSqft    demo INR per sq ft assumption
 * minCharge      demo minimum call-out assumption
 * rounds         assumed visits in one complete treatment cycle
 * intervalMonths assumed gap between cycle starts
 * warrantyMonths assumed callback period for comparison only
 */
export const PESTS = [
  {
    id: "cockroach",
    label: "Cockroaches",
    method: "Gel baiting in hinges and crevices, no spraying needed",
    ratePerSqft: 1.2,
    minCharge: 800,
    rounds: 1,
    intervalMonths: 3,
    warrantyMonths: 3,
    prep: "Empty and wipe kitchen cabinets; do not clean the gel dots afterwards.",
  },
  {
    id: "ant",
    label: "Ants",
    method: "Gel bait plus perimeter and entry-point spray",
    ratePerSqft: 1,
    minCharge: 700,
    rounds: 1,
    intervalMonths: 4,
    warrantyMonths: 3,
    prep: "Leave visible trails untouched so the technician can find the nest route.",
  },
  {
    id: "mosquito",
    label: "Mosquitoes",
    method: "Residual spray on resting surfaces plus larvicide in standing water",
    ratePerSqft: 1.3,
    minCharge: 900,
    rounds: 1,
    intervalMonths: 1,
    warrantyMonths: 1,
    prep: "Empty every water container; larvicide only works where you cannot drain.",
  },
  {
    id: "bedbug",
    label: "Bed bugs",
    method: "Two-round contact and residual spray on frames, seams and skirting",
    ratePerSqft: 3.5,
    minCharge: 2500,
    rounds: 2,
    intervalMonths: 6,
    warrantyMonths: 3,
    prep: "Second round falls 12-15 days later to kill newly hatched nymphs; hot-wash all bedding.",
  },
  {
    id: "termite",
    label: "Termites (subterranean)",
    method: "Drill-fill-seal chemical barrier along the plinth, per IS 6313 Part 3",
    ratePerSqft: 6,
    minCharge: 4000,
    rounds: 1,
    intervalMonths: 60,
    warrantyMonths: 60,
    prep: "Move furniture off the walls; 12 mm holes are drilled at floor-wall junctions.",
  },
  {
    id: "rodent",
    label: "Rats and mice",
    method: "Baiting stations, glue boards and entry-point proofing",
    ratePerSqft: 1.5,
    minCharge: 1200,
    rounds: 1,
    intervalMonths: 2,
    warrantyMonths: 1,
    prep: "Seal food, and identify runways before the visit; proofing matters more than bait.",
  },
  {
    id: "woodborer",
    label: "Wood borer / powder post beetle",
    method: "Injection of the exit holes plus surface treatment of joinery",
    ratePerSqft: 4,
    minCharge: 2000,
    rounds: 1,
    intervalMonths: 12,
    warrantyMonths: 12,
    prep: "Clear the affected furniture; fresh powder piles mark active infestation.",
  },
  {
    id: "lizard",
    label: "Lizards",
    method: "Herbal repellent spray on ledges, ducts and window frames",
    ratePerSqft: 0.8,
    minCharge: 700,
    rounds: 1,
    intervalMonths: 4,
    warrantyMonths: 2,
    prep: "Fixing the insect food source matters more than the repellent itself.",
  },
  {
    id: "fly",
    label: "Houseflies",
    method: "Residual spray plus breeding-source treatment near bins and drains",
    ratePerSqft: 0.9,
    minCharge: 700,
    rounds: 1,
    intervalMonths: 3,
    warrantyMonths: 1,
    prep: "Clean bins and drain traps first; flies breed in the source, not the room.",
  },
];

/** How bad the infestation is — multiplies chemical load and labour. */
export const SEVERITY_LEVELS = [
  { id: "mild", label: "Mild — occasional sightings", factor: 0.85 },
  { id: "moderate", label: "Moderate — regular sightings", factor: 1 },
  { id: "severe", label: "Severe — visible nests or daily activity", factor: 1.3 },
];

/** Independent houses need perimeter and external treatment as well. */
export const PROPERTY_TYPES = [
  { id: "apartment", label: "Apartment / flat", factor: 1 },
  { id: "house", label: "Independent house", factor: 1.15 },
];

/** Premium for odourless or herbal chemistry, typically requested with infants or pets. */
export const HERBAL_PREMIUM = 0.2;

/** Discount agencies give per extra pest handled in the same visit. */
export const BUNDLE_DISCOUNT_PER_EXTRA_PEST = 0.08;
/** Cap on that bundling discount. */
export const MAX_BUNDLE_DISCOUNT = 0.25;

export const MIN_AREA_SQFT = 100;
export const MAX_AREA_SQFT = 20000;
/** Length of the plan produced, in months. */
export const PLAN_MONTHS = 12;

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @param {object} input
 * @param {number} input.areaSqft
 * @param {string[]} input.pests        selected pest ids
 * @param {string} input.severity       SEVERITY_LEVELS id
 * @param {string} input.propertyType   PROPERTY_TYPES id
 * @param {boolean} input.herbal        odourless / herbal chemistry
 * @param {boolean} input.includeGst
 * @param {number} input.startMonth     0-11, the month the plan begins
 * @returns {object} plan, or { error }
 */
export function planPestControl({
  areaSqft,
  pests = [],
  severity = "moderate",
  propertyType = "apartment",
  herbal = false,
  includeGst = true,
  startMonth = 0,
} = {}) {
  if (!isFiniteNumber(areaSqft)) return { error: "Enter the carpet area in square feet." };
  if (areaSqft < MIN_AREA_SQFT) return { error: `Carpet area should be at least ${MIN_AREA_SQFT} sq ft.` };
  if (areaSqft > MAX_AREA_SQFT) {
    return { error: `Above ${MAX_AREA_SQFT} sq ft this needs a surveyed commercial contract.` };
  }

  const severityLevel = SEVERITY_LEVELS.find((entry) => entry.id === severity);
  if (!severityLevel) return { error: "Choose how bad the infestation is." };

  const property = PROPERTY_TYPES.find((entry) => entry.id === propertyType);
  if (!property) return { error: "Choose whether this is a flat or an independent house." };

  if (!Number.isInteger(startMonth) || startMonth < 0 || startMonth > 11) {
    return { error: "Start month must be a calendar month." };
  }
  if (!Array.isArray(pests)) return { error: "Selected pests must be a list." };

  const chosen = PESTS.filter((pest) => pests.includes(pest.id));
  if (chosen.length === 0) return { error: "Select at least one pest to plan for." };

  const bundleDiscount = Math.min(
    MAX_BUNDLE_DISCOUNT,
    BUNDLE_DISCOUNT_PER_EXTRA_PEST * (chosen.length - 1),
  );
  const chemistryFactor = herbal ? 1 + HERBAL_PREMIUM : 1;
  const loadFactor = severityLevel.factor * property.factor * chemistryFactor;
  // Applied only to the per-row *display* price so the on-screen "per
  // treatment" figure matches every other GST-inclusive number on the page
  // (headline totals, calendar). `perTreatment` itself stays pre-tax
  // because it also feeds costInPlan/annualisedCost, which apply GST at the
  // aggregate level via gstOn() below — taxing it here too would double it.
  const gstMultiplier = includeGst ? 1 + GST_RATE : 1;

  const rows = chosen.map((pest) => {
    const rated = areaSqft * pest.ratePerSqft * pest.rounds * loadFactor;
    // The minimum call-out is a floor on what the customer is actually
    // charged, so it must be applied AFTER the bundle discount, not before —
    // otherwise a discounted price can land below the pest's own stated
    // minimum while still being labelled as having that minimum "applied".
    const discounted = rated * (1 - bundleDiscount);
    const perTreatment = Math.max(discounted, pest.minCharge);

    const dueMonths = [];
    for (let offset = 0; offset < PLAN_MONTHS; offset += 1) {
      if (offset % pest.intervalMonths === 0) {
        dueMonths.push((startMonth + offset) % 12);
      }
    }

    const treatmentsPerYear = PLAN_MONTHS / pest.intervalMonths;

    return {
      id: pest.id,
      label: pest.label,
      method: pest.method,
      prep: pest.prep,
      rounds: pest.rounds,
      intervalMonths: pest.intervalMonths,
      warrantyMonths: pest.warrantyMonths,
      minCharge: pest.minCharge,
      minChargeWithTax: round2(pest.minCharge * gstMultiplier),
      minimumApplied: perTreatment > discounted,
      perTreatment: round2(perTreatment),
      perTreatmentWithTax: round2(perTreatment * gstMultiplier),
      treatmentsPerYear: round2(treatmentsPerYear),
      annualisedCost: round2(perTreatment * treatmentsPerYear),
      // Physical technician visits, not treatment cycles: a multi-round
      // pest (bed bugs today) needs `pest.rounds` separate site visits for
      // every cycle in `dueMonths`, even though it is billed and scheduled
      // as one cycle.
      visitsInPlan: dueMonths.length * pest.rounds,
      costInPlan: round2(perTreatment * dueMonths.length),
      dueMonths,
    };
  });

  const firstVisitBeforeTax = rows.reduce((sum, row) => sum + row.perTreatment, 0);
  const planBeforeTax = rows.reduce((sum, row) => sum + row.costInPlan, 0);
  const annualisedBeforeTax = rows.reduce((sum, row) => sum + row.annualisedCost, 0);

  const gstOn = (value) => (includeGst ? value * GST_RATE : 0);

  const calendar = [];
  for (let offset = 0; offset < PLAN_MONTHS; offset += 1) {
    const monthIndex = (startMonth + offset) % 12;
    const due = rows.filter((row) => row.dueMonths.includes(monthIndex) && offset % row.intervalMonths === 0);
    const cost = due.reduce((sum, row) => sum + row.perTreatment, 0);
    calendar.push({
      offset,
      monthIndex,
      month: MONTHS[monthIndex],
      pests: due.map((row) => row.label),
      treatments: due.map((row) => ({
        id: row.id,
        label: row.label,
        visits: row.rounds,
      })),
      visits: due.reduce((sum, row) => sum + row.rounds, 0),
      costBeforeTax: round2(cost),
      costWithTax: round2(cost + gstOn(cost)),
    });
  }

  const busiest = calendar.reduce(
    (best, entry) => (entry.costBeforeTax > (best?.costBeforeTax ?? -1) ? entry : best),
    null,
  );

  return {
    rows,
    calendar,
    busiestMonth: busiest,
    bundleDiscount,
    loadFactor: round2(loadFactor),
    severityLabel: severityLevel.label,
    propertyLabel: property.label,
    firstVisitBeforeTax: round2(firstVisitBeforeTax),
    firstVisitTotal: round2(firstVisitBeforeTax + gstOn(firstVisitBeforeTax)),
    planBeforeTax: round2(planBeforeTax),
    planGst: round2(gstOn(planBeforeTax)),
    planTotal: round2(planBeforeTax + gstOn(planBeforeTax)),
    annualisedTotal: round2(annualisedBeforeTax + gstOn(annualisedBeforeTax)),
    monthlyEquivalent: round2((annualisedBeforeTax + gstOn(annualisedBeforeTax)) / 12),
    visitsInPlan: rows.reduce((sum, row) => sum + row.visitsInPlan, 0),
    gstRate: includeGst ? GST_RATE : 0,
    assumptionsBaseline: ASSUMPTIONS_BASELINE,
  };
}
