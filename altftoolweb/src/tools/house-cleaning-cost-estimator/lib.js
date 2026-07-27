/**
 * House Cleaning Cost Estimator — pricing model for the Indian market.
 *
 * Structure mirrors how agencies actually quote:
 *   base = carpet area x per-sq-ft rate for the service type x city tier factor
 *   add-ons are priced per unit at a national reference rate, also tier-adjusted
 *   a minimum visit charge floors small jobs
 *   recurring contracts get the usual retention discount
 *   GST is added last
 *
 * Statutory rule: general cleaning services (SAC 998533) are taxed at 18% GST.
 * Providers below the GST registration threshold may quote without it, so the
 * tax line is a toggle.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** GST on general cleaning / housekeeping services, SAC 998533. */
export const GST_RATE = 0.18;

/**
 * Per-sq-ft reference rates in INR at the tier-1 non-metro baseline.
 * Ranges observed across Indian home-services platforms and local agencies.
 */
export const SERVICE_TYPES = [
  { id: "regular", label: "Regular / weekly upkeep clean", perSqft: 4, note: "Surfaces, floors, bathrooms, kitchen wipe-down" },
  { id: "deep-empty", label: "Deep clean, empty or unfurnished home", perSqft: 9, note: "Full deep clean with nothing to move" },
  { id: "deep-furnished", label: "Deep clean, furnished home", perSqft: 13, note: "Inside cabinets, appliances, grout, fans, glass" },
  { id: "move", label: "Move-in / move-out clean", perSqft: 16, note: "Handover-standard clean including inside all storage" },
  { id: "post-build", label: "Post-construction / post-renovation", perSqft: 22, note: "Cement haze, paint spots, debris dust removal" },
];

/** City tier factors relative to a tier-1 non-metro baseline of 1.00. */
export const CITY_TIERS = [
  { id: "metro", label: "Metro (Mumbai, Delhi NCR, Bengaluru)", factor: 1.15 },
  { id: "tier1", label: "Tier 1 (Pune, Hyderabad, Chennai, Kolkata)", factor: 1 },
  { id: "tier2", label: "Tier 2 (Jaipur, Kochi, Indore, Lucknow)", factor: 0.85 },
  { id: "tier3", label: "Tier 3 / small town", factor: 0.72 },
];

/** Per-unit add-on rates in INR at the tier-1 baseline. */
export const ADDONS = [
  { id: "sofaSeat", label: "Sofa shampoo", unit: "seat", rate: 300, max: 20 },
  { id: "mattress", label: "Mattress deep clean", unit: "mattress", rate: 400, max: 12 },
  { id: "carpet", label: "Carpet / rug shampoo", unit: "sq ft", rate: 15, max: 2000 },
  { id: "descale", label: "Hard-water descaling", unit: "bathroom", rate: 450, max: 10 },
  { id: "chimney", label: "Kitchen chimney degrease", unit: "chimney", rate: 600, max: 5 },
  { id: "fridge", label: "Refrigerator cleaned inside", unit: "fridge", rate: 300, max: 5 },
  { id: "glass", label: "Balcony / exterior glass", unit: "balcony", rate: 350, max: 10 },
  { id: "tank", label: "Water tank cleaning", unit: "tank", rate: 1200, max: 5 },
];

/**
 * Visit frequency, visits per year, and the contract discount agencies typically
 * offer for committing to that frequency.
 */
export const FREQUENCIES = [
  { id: "oneoff", label: "One-off visit", visitsPerYear: 1, discount: 0 },
  { id: "quarterly", label: "Quarterly", visitsPerYear: 4, discount: 0 },
  { id: "monthly", label: "Monthly", visitsPerYear: 12, discount: 0.05 },
  { id: "fortnightly", label: "Fortnightly", visitsPerYear: 26, discount: 0.1 },
  { id: "weekly", label: "Weekly", visitsPerYear: 52, discount: 0.15 },
];

/** Minimum call-out charge in INR at the tier-1 baseline. */
export const MIN_VISIT_CHARGE = 999;

export const MIN_AREA_SQFT = 100;
export const MAX_AREA_SQFT = 20000;

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @param {object} input
 * @param {number} input.areaSqft
 * @param {string} input.serviceType  SERVICE_TYPES id
 * @param {string} input.cityTier     CITY_TIERS id
 * @param {Record<string, number>} input.addons  quantities keyed by addon id
 * @param {string} input.frequency    FREQUENCIES id
 * @param {boolean} input.includeGst
 * @returns {object} quote, or { error }
 */
export function estimateCleaningCost({
  areaSqft,
  serviceType = "deep-furnished",
  cityTier = "tier1",
  addons = {},
  frequency = "oneoff",
  includeGst = true,
} = {}) {
  if (!isFiniteNumber(areaSqft)) return { error: "Enter the carpet area in square feet." };
  if (areaSqft < MIN_AREA_SQFT) return { error: `Carpet area should be at least ${MIN_AREA_SQFT} sq ft.` };
  if (areaSqft > MAX_AREA_SQFT) {
    return { error: `Above ${MAX_AREA_SQFT} sq ft, ask for a surveyed commercial quote instead.` };
  }

  const service = SERVICE_TYPES.find((entry) => entry.id === serviceType);
  if (!service) return { error: "Choose the type of cleaning you need." };

  const tier = CITY_TIERS.find((entry) => entry.id === cityTier);
  if (!tier) return { error: "Choose your city tier." };

  const freq = FREQUENCIES.find((entry) => entry.id === frequency);
  if (!freq) return { error: "Choose how often the clean should happen." };

  const addonRows = [];
  let addonBase = 0;
  for (const addon of ADDONS) {
    const raw = addons[addon.id];
    const qty = raw === undefined || raw === null || raw === "" ? 0 : Number(raw);
    if (!isFiniteNumber(qty)) return { error: `Enter a quantity for "${addon.label}", or leave it blank.` };
    if (qty < 0) return { error: "Add-on quantities cannot be negative." };
    if (qty > addon.max) {
      return { error: `"${addon.label}" is capped at ${addon.max} ${addon.unit}s in this estimate.` };
    }
    if (qty > 0) {
      const amount = qty * addon.rate * tier.factor;
      addonBase += amount;
      addonRows.push({
        id: addon.id,
        label: addon.label,
        unit: addon.unit,
        qty,
        unitRate: round2(addon.rate * tier.factor),
        amount: round2(amount),
      });
    }
  }

  const areaCharge = areaSqft * service.perSqft * tier.factor;
  const minCharge = MIN_VISIT_CHARGE * tier.factor;
  const beforeMinimum = areaCharge + addonBase;
  const subtotal = Math.max(beforeMinimum, minCharge);
  const minimumApplied = subtotal > beforeMinimum;

  const discountAmount = subtotal * freq.discount;
  const afterDiscount = subtotal - discountAmount;
  const gstAmount = includeGst ? afterDiscount * GST_RATE : 0;
  const totalPerVisit = afterDiscount + gstAmount;

  return {
    serviceLabel: service.label,
    tierLabel: tier.label,
    frequencyLabel: freq.label,
    perSqftRate: round2(service.perSqft * tier.factor),
    areaCharge: round2(areaCharge),
    addonCharge: round2(addonBase),
    addonRows,
    minCharge: round2(minCharge),
    minimumApplied,
    subtotal: round2(subtotal),
    discountRate: freq.discount,
    discountAmount: round2(discountAmount),
    taxableAmount: round2(afterDiscount),
    gstRate: includeGst ? GST_RATE : 0,
    gstAmount: round2(gstAmount),
    totalPerVisit: round2(totalPerVisit),
    effectivePerSqft: round2(totalPerVisit / areaSqft),
    visitsPerYear: freq.visitsPerYear,
    totalPerYear: round2(totalPerVisit * freq.visitsPerYear),
    monthlyEquivalent: round2((totalPerVisit * freq.visitsPerYear) / 12),
  };
}

/** Build the same quote for every service type, for a side-by-side comparison. */
export function compareServiceTypes(input) {
  return SERVICE_TYPES.map((service) => {
    const quote = estimateCleaningCost({ ...input, serviceType: service.id });
    return {
      id: service.id,
      label: service.label,
      note: service.note,
      error: quote.error ?? null,
      totalPerVisit: quote.error ? null : quote.totalPerVisit,
      perSqftRate: quote.error ? null : quote.perSqftRate,
    };
  });
}
