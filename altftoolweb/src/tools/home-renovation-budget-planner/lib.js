/**
 * Home renovation budget, built room by room.
 *
 * Renovation is quoted per square foot of the area actually being worked on, and the rate
 * differs sharply by room — a kitchen or bathroom costs multiples of a bedroom because of
 * plumbing, waterproofing, counters and cabinetry. So the base is:
 *
 *     roomCost = area * ratePerSqft * qualityMultiplier
 *
 * The quality multiplier scales the rate you enter rather than substituting an invented
 * price, so the figures stay yours. Standard = 1.0 by definition.
 *
 * On top of the works:
 *
 *     subtotal      = Σ roomCost + fixed extras (appliances, furniture, permits)
 *     fees          = subtotal * professionalFeesPct        (architect / designer)
 *     contingency   = (subtotal + fees) * contingencyPct    (a construction convention:
 *                                                            10-15% of project cost)
 *     taxableValue  = subtotal + fees + contingency
 *     gst           = taxableValue * gstRatePct
 *     grandTotal    = taxableValue + gst
 *
 * GST: a renovation carried out by a registered contractor is a works contract, taxed as a
 * composite supply of services at 18%. If you buy materials yourself and pay only labour,
 * the tax sits inside each material's own rate instead, so the toggle should be turned off
 * and the material rates entered GST-inclusive. Confirm the treatment with your contractor
 * or a tax professional — GST rates are notified and do change.
 *
 * Funding: existing savings compound to the start date and the shortfall is converted to a
 * monthly contribution with the ordinary-annuity payment C = gap * i / ((1+i)^n - 1).
 */

/** Multipliers on the per-square-foot rate you enter. Standard is the reference point. */
export const QUALITY_TIERS = [
  { id: "basic", label: "Basic — repaint, repair, minimal replacement", multiplier: 0.75 },
  { id: "standard", label: "Standard — new finishes, mid-range fittings", multiplier: 1 },
  { id: "premium", label: "Premium — custom joinery, branded fittings", multiplier: 1.4 },
  { id: "luxury", label: "Luxury — imported materials, bespoke design", multiplier: 2 },
];

/** GST on a composite supply of works contract services for a renovation. */
export const WORKS_CONTRACT_GST_RATE = 18;
/** Contingency convention in construction budgeting: 10-15% of project cost. */
export const TYPICAL_CONTINGENCY_PCT = 10;

export const MAX_ROOMS = 30;
export const MAX_AREA_SQFT = 20000;
export const MAX_FEES_PCT = 25;
export const MAX_CONTINGENCY_PCT = 50;
export const MAX_MONTHS = 60;
export const MAX_RATE_PCT = 20;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

const round0 = (value) => Math.round(value);
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @param {object} input
 * @param {Array} input.rooms [{ id, name, area, ratePerSqft }]
 * @param {string} [input.qualityTier] One of QUALITY_TIERS ids.
 * @param {number|string} [input.extras] Appliances, furniture, permits — a flat amount.
 * @param {number|string} [input.professionalFeesPct] Architect or designer fee, % of project cost
 *   (room works plus the flat extras amount — see `subtotal` above).
 * @param {number|string} [input.contingencyPct] Buffer, % of works plus fees.
 * @param {boolean} [input.applyGst] Whether the job is a registered works contract.
 * @param {number|string} [input.gstRatePct] GST rate to apply when it is.
 * @param {number|string} [input.monthsToStart] Months before work begins.
 * @param {number|string} [input.existingSavings] Amount already set aside.
 * @param {number|string} [input.savingsReturn] Return on those savings, % per year.
 */
export function planRenovationBudget({
  rooms = [],
  qualityTier = "standard",
  extras = 0,
  professionalFeesPct = 0,
  contingencyPct = TYPICAL_CONTINGENCY_PCT,
  applyGst = true,
  gstRatePct = WORKS_CONTRACT_GST_RATE,
  monthsToStart = 6,
  existingSavings = 0,
  savingsReturn = 0,
} = {}) {
  if (!Array.isArray(rooms)) return { error: "Room list is missing." };
  if (rooms.length === 0) return { error: "Add at least one room to budget." };
  if (rooms.length > MAX_ROOMS) return { error: `Budget up to ${MAX_ROOMS} rooms at a time.` };

  const tier = QUALITY_TIERS.find((entry) => entry.id === qualityTier);
  if (!tier) return { error: "Choose a finish quality." };

  const extraAmount = toNumber(extras);
  const feesPct = toNumber(professionalFeesPct);
  const bufferPct = toNumber(contingencyPct);
  const gstPct = toNumber(gstRatePct);
  const months = toNumber(monthsToStart);
  const existing = toNumber(existingSavings);
  const returnPct = toNumber(savingsReturn);

  const scalars = [extraAmount, feesPct, bufferPct, gstPct, months, existing, returnPct];
  if (scalars.some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers for extras, fees, contingency, GST and funding." };
  }
  if (scalars.some((value) => value < 0)) {
    return { error: "Amounts, rates and months cannot be negative." };
  }
  if (feesPct > MAX_FEES_PCT) return { error: `Professional fees above ${MAX_FEES_PCT}% are unusual.` };
  if (bufferPct > MAX_CONTINGENCY_PCT) {
    return { error: `A contingency above ${MAX_CONTINGENCY_PCT}% means the scope is not defined yet.` };
  }
  if (gstPct > 50) return { error: "Enter a GST rate of 50% or less." };
  if (!(months >= 1) || months > MAX_MONTHS) {
    return { error: `Months before the work starts should be between 1 and ${MAX_MONTHS}.` };
  }
  if (returnPct > MAX_RATE_PCT) {
    return { error: `An assumed return above ${MAX_RATE_PCT}% a year is not realistic here.` };
  }

  const roomRows = [];
  let totalArea = 0;
  for (const room of rooms) {
    const area = toNumber(room?.area);
    const rate = toNumber(room?.ratePerSqft);
    if (Number.isNaN(area) || Number.isNaN(rate)) {
      return { error: `Enter a valid area and rate for "${room?.name || "each room"}".` };
    }
    if (area < 0 || rate < 0) return { error: "Areas and rates cannot be negative." };
    if (area > MAX_AREA_SQFT) return { error: `Room area should be ${MAX_AREA_SQFT} sq ft or less.` };

    // The UI and exports use whole currency units. Round each room once here,
    // then build the entire ledger from those visible values so every subtotal
    // can be checked by hand without hidden fractional carry.
    const cost = round0(area * rate * tier.multiplier);
    totalArea += area;
    roomRows.push({
      id: room?.id,
      name: room?.name?.trim() || "Untitled room",
      area: round2(area),
      ratePerSqft: round2(rate),
      effectiveRate: round2(rate * tier.multiplier),
      cost,
    });
  }

  const worksTotal = roomRows.reduce((sum, row) => sum + row.cost, 0);
  const extrasDisplay = round0(extraAmount);
  const subtotal = worksTotal + extrasDisplay;
  if (!(subtotal > 0)) {
    return { error: "Every room costs zero — enter an area and a rate per square foot." };
  }

  const fees = round0((subtotal * feesPct) / 100);
  const contingency = round0(((subtotal + fees) * bufferPct) / 100);
  const taxableValue = subtotal + fees + contingency;
  const gst = applyGst ? round0((taxableValue * gstPct) / 100) : 0;
  const grandTotal = taxableValue + gst;

  const wholeMonths = Math.round(months);
  const i = returnPct / 100 / 12;
  const growthFactor = Math.pow(1 + i, wholeMonths);
  const existingFuture = round0(existing * growthFactor);
  const gap = Math.max(0, grandTotal - existingFuture);
  let monthlySaving = 0;
  if (gap > 0) {
    monthlySaving = i <= 0 ? gap / wholeMonths : (gap * i) / (growthFactor - 1);
    if (!Number.isFinite(monthlySaving)) monthlySaving = 0;
  }

  return {
    tierId: tier.id,
    tierLabel: tier.label,
    tierMultiplier: tier.multiplier,
    totalArea: round2(totalArea),
    rooms: roomRows
      .map((row) => ({
        ...row,
        cost: row.cost,
        sharePct: worksTotal > 0 ? round2((row.cost / worksTotal) * 100) : 0,
      }))
      .sort((a, b) => b.cost - a.cost),
    worksTotal,
    extras: extrasDisplay,
    subtotal,
    fees,
    contingency,
    taxableValue,
    gst,
    gstApplied: Boolean(applyGst),
    gstRatePct: round2(gstPct),
    grandTotal,
    costPerSqft: totalArea > 0 ? round0(grandTotal / totalArea) : null,
    monthsToStart: wholeMonths,
    existingFuture,
    gap,
    monthlySaving: round0(monthlySaving),
    fullyFunded: gap <= 0,
  };
}
