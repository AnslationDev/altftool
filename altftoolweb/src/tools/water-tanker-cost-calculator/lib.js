/**
 * Private water tanker spend for a household.
 *
 * The arithmetic is a shortfall balance, not a tariff table:
 *   deficit per day   = total demand - what the piped supply and any borewell give
 *   deficit per month = deficit per day x days in the billing month
 *   tankers per month = ceil(monthly deficit / usable litres per tanker)
 *   monthly spend     = tankers x (tanker price + delivery/tip charge)
 *
 * Tankers are billed whole, never by the litre, so the ceiling is what actually
 * lands on the bill and any surplus in the last load is paid for regardless.
 *
 * Cost per kilolitre is quoted alongside the per-litre figure because municipal
 * water tariffs in India are published per kilolitre (1 kL = 1,000 L), which is
 * the only way to compare tanker water with the piped rate on the same basis.
 *
 * Demand reference: IS 1172:1993 sets a minimum of 135 litres per capita per day
 * for a residence with a full flushing system.
 */

/** 1 kilolitre = 1,000 litres, by definition. */
export const LITRES_PER_KILOLITRE = 1000;

/** IS 1172:1993 minimum domestic demand, litres per capita per day. */
export const IS1172_LPCD = 135;

/** Tanker sizes commonly offered by private suppliers in Indian cities, litres. */
export const TANKER_SIZES_L = [
  { id: "mini", label: "Mini tanker", litres: 2000 },
  { id: "small", label: "Small tanker", litres: 3000 },
  { id: "standard", label: "Standard tanker", litres: 5000 },
  { id: "large", label: "Large tanker", litres: 6000 },
  { id: "trailer", label: "Trailer tanker", litres: 10000 },
  { id: "bulk", label: "Bulk tanker", litres: 12000 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @param {object} input
 * @param {number} input.dailyDemandLitres   total household demand per day
 * @param {number} input.pipedLitresPerDay   litres the mains/borewell supplies per day
 * @param {number} input.tankerCapacityL     litres actually delivered per tanker
 * @param {number} input.tankerPrice         price charged per tanker
 * @param {number} input.deliveryCharge      tip / hose / pumping charge per tanker
 * @param {number} input.daysInMonth         billing days in the month
 * @param {number} input.pipedRatePerKl      municipal tariff per kilolitre, for comparison
 */
export function computeTankerCost({
  dailyDemandLitres,
  pipedLitresPerDay,
  tankerCapacityL,
  tankerPrice,
  deliveryCharge = 0,
  daysInMonth = 30,
  pipedRatePerKl = 0,
}) {
  const values = [
    dailyDemandLitres,
    pipedLitresPerDay,
    tankerCapacityL,
    tankerPrice,
    deliveryCharge,
    daysInMonth,
    pipedRatePerKl,
  ];
  if (!values.every(isNum)) return { error: "Enter a valid number in every field." };
  if (dailyDemandLitres <= 0) return { error: "Daily water demand must be greater than zero." };
  if (dailyDemandLitres > 1_000_000) return { error: "Enter a daily demand of 1,000,000 litres or less." };
  if (pipedLitresPerDay < 0) return { error: "Piped supply cannot be negative." };
  if (tankerCapacityL <= 0) return { error: "Tanker capacity must be greater than zero." };
  if (tankerPrice < 0 || deliveryCharge < 0) return { error: "Charges cannot be negative." };
  if (daysInMonth < 1 || daysInMonth > 31) return { error: "Days in the month must be between 1 and 31." };
  if (pipedRatePerKl < 0) return { error: "The piped water rate cannot be negative." };

  const costPerTanker = tankerPrice + deliveryCharge;
  const tankerCostPerLitre = costPerTanker / tankerCapacityL;
  const tankerCostPerKl = tankerCostPerLitre * LITRES_PER_KILOLITRE;

  const dailyDeficit = Math.max(0, dailyDemandLitres - pipedLitresPerDay);
  const monthlyDemand = dailyDemandLitres * daysInMonth;
  const monthlyPiped = Math.min(pipedLitresPerDay, dailyDemandLitres) * daysInMonth;
  const monthlyDeficit = dailyDeficit * daysInMonth;

  const tankersPerMonth = Math.ceil(monthlyDeficit / tankerCapacityL);
  const litresDelivered = tankersPerMonth * tankerCapacityL;
  const surplusLitres = litresDelivered - monthlyDeficit;

  const monthlyCost = tankersPerMonth * costPerTanker;
  const annualCost = monthlyCost * (365 / daysInMonth);

  const pipedMonthlyCost = (monthlyPiped / LITRES_PER_KILOLITRE) * pipedRatePerKl;
  const totalMonthlyWaterCost = monthlyCost + pipedMonthlyCost;
  const blendedCostPerKl =
    monthlyDemand > 0 ? (totalMonthlyWaterCost / monthlyDemand) * LITRES_PER_KILOLITRE : 0;

  const tankerShareOfSupply = monthlyDemand > 0 ? (monthlyDeficit / monthlyDemand) * 100 : 0;
  const daysPerTanker = dailyDeficit > 0 ? tankerCapacityL / dailyDeficit : Infinity;

  const notes = [];
  if (tankersPerMonth === 0) {
    notes.push("Your piped supply already covers demand — no tanker is needed at these figures.");
  } else if (surplusLitres > 0) {
    notes.push(
      `The last tanker leaves ${Math.round(surplusLitres)} L spare, which you pay for either way — make sure your storage can hold it.`,
    );
  }
  if (pipedRatePerKl > 0 && tankerCostPerKl > pipedRatePerKl) {
    const multiple = tankerCostPerKl / pipedRatePerKl;
    notes.push(
      `Tanker water costs about ${multiple.toFixed(1)}x the piped rate you entered per kilolitre.`,
    );
  }

  return {
    costPerTanker,
    tankerCostPerLitre,
    tankerCostPerKl,
    dailyDeficit,
    monthlyDemand,
    monthlyPiped,
    monthlyDeficit,
    tankersPerMonth,
    litresDelivered,
    surplusLitres,
    monthlyCost,
    annualCost,
    pipedMonthlyCost,
    totalMonthlyWaterCost,
    blendedCostPerKl,
    tankerShareOfSupply,
    daysPerTanker: Number.isFinite(daysPerTanker) ? daysPerTanker : null,
    notes,
  };
}
