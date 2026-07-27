/**
 * Mileage reimbursement: distance x rate, with an optional second-tier rate.
 *
 * The arithmetic is deliberately plain — total distance times the applicable rate, plus
 * out-of-pocket extras — because the only thing that varies between countries is the
 * rate and whether a threshold applies:
 *
 *  - UNITED KINGDOM. HMRC's Approved Mileage Allowance Payments are 45p per mile for the
 *    first 10,000 business miles in the tax year and 25p per mile after that, for cars
 *    and vans; 24p per mile for motorcycles and 20p per mile for bicycles, with no
 *    threshold. A further 5p per mile per passenger may be paid for colleagues making the
 *    same business journey. Payments up to these rates are free of tax and National
 *    Insurance; anything above is taxable. The threshold runs across the whole tax year,
 *    which is why miles already claimed are an input here.
 *  - UNITED STATES. The IRS publishes an optional standard mileage rate each year — for
 *    2025 it was 70 cents per mile for business use, 21 cents for medical or qualifying
 *    moving use, and 14 cents for charitable use, the last being fixed by statute. Check
 *    the notice for the year you are claiming; the business rate changes annually.
 *  - INDIA. There is no statutory per-kilometre reimbursement rate; employers set their
 *    own, commonly ₹8 to ₹15 per kilometre for a self-owned car. What the Income-tax
 *    Rules do fix is the perquisite value where the employer provides the car —
 *    Rule 3(2) values it at ₹1,800 a month for an engine up to 1.6 litres and ₹2,400 a
 *    month above that, plus ₹900 a month where a driver is provided.
 *
 * All rate figures are treated as inputs, so nothing here depends on a rate staying current.
 */

export const UNITS = {
  km: { key: "km", label: "Kilometres", short: "km" },
  mile: { key: "mile", label: "Miles", short: "mi" },
};

/** HMRC AMAP threshold — first 10,000 business miles of the tax year. */
export const HMRC_TIER_LIMIT_MILES = 10000;

/**
 * Published or commonly used rates. `tierLimit` of 0 means a single flat rate.
 * These are starting points you can edit, not a guarantee of the current year's figure.
 */
export const RATE_PRESETS = [
  {
    key: "hmrc-car",
    label: "UK · HMRC car or van (45p / 25p)",
    currency: "GBP",
    unit: "mile",
    tier1Rate: 0.45,
    tierLimit: HMRC_TIER_LIMIT_MILES,
    tier2Rate: 0.25,
    passengerRate: 0.05,
    note: "Approved Mileage Allowance Payments: 45p for the first 10,000 business miles in the tax year, 25p thereafter, plus 5p per passenger.",
  },
  {
    key: "hmrc-motorcycle",
    label: "UK · HMRC motorcycle (24p)",
    currency: "GBP",
    unit: "mile",
    tier1Rate: 0.24,
    tierLimit: 0,
    tier2Rate: 0.24,
    passengerRate: 0,
    note: "Flat 24p per mile with no annual threshold.",
  },
  {
    key: "hmrc-bicycle",
    label: "UK · HMRC bicycle (20p)",
    currency: "GBP",
    unit: "mile",
    tier1Rate: 0.2,
    tierLimit: 0,
    tier2Rate: 0.2,
    passengerRate: 0,
    note: "Flat 20p per mile with no annual threshold.",
  },
  {
    key: "irs-business",
    label: "US · IRS business, 2025 (70¢)",
    currency: "USD",
    unit: "mile",
    tier1Rate: 0.7,
    tierLimit: 0,
    tier2Rate: 0.7,
    passengerRate: 0,
    note: "IRS optional standard mileage rate for business use in 2025. The rate is reset each year — check the current notice.",
  },
  {
    key: "irs-medical",
    label: "US · IRS medical or moving, 2025 (21¢)",
    currency: "USD",
    unit: "mile",
    tier1Rate: 0.21,
    tierLimit: 0,
    tier2Rate: 0.21,
    passengerRate: 0,
    note: "Medical and qualifying armed-forces moving use, 2025.",
  },
  {
    key: "irs-charity",
    label: "US · IRS charitable (14¢)",
    currency: "USD",
    unit: "mile",
    tier1Rate: 0.14,
    tierLimit: 0,
    tier2Rate: 0.14,
    passengerRate: 0,
    note: "Fixed at 14 cents per mile by statute, so it does not change with the annual notice.",
  },
  {
    key: "india-car",
    label: "India · typical employer car rate (₹12/km)",
    currency: "INR",
    unit: "km",
    tier1Rate: 12,
    tierLimit: 0,
    tier2Rate: 12,
    passengerRate: 0,
    note: "No statutory rate exists in India; ₹8 to ₹15 per kilometre is the usual employer band. Use your own policy figure.",
  },
  {
    key: "india-two-wheeler",
    label: "India · typical two-wheeler rate (₹4/km)",
    currency: "INR",
    unit: "km",
    tier1Rate: 4,
    tierLimit: 0,
    tier2Rate: 4,
    passengerRate: 0,
    note: "Employer policy figure, commonly ₹3 to ₹5 per kilometre.",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * Total a mileage claim.
 *
 * @param {object} input
 * @param {number} input.distancePerTrip   One-way distance of a single journey.
 * @param {number} [input.trips]           How many journeys are being claimed.
 * @param {boolean} [input.roundTrip]      Double each journey for the return leg.
 * @param {number} input.tier1Rate         Rate per unit up to the threshold.
 * @param {number} [input.tierLimit]       Distance threshold; 0 means one flat rate.
 * @param {number} [input.tier2Rate]       Rate per unit beyond the threshold.
 * @param {number} [input.priorDistance]   Distance already claimed this year, against the threshold.
 * @param {number} [input.passengers]      Colleagues carried on the same business journey.
 * @param {number} [input.passengerRate]   Rate per passenger per unit.
 * @param {number} [input.tolls]           Tolls actually paid.
 * @param {number} [input.parking]         Parking actually paid.
 * @param {number} [input.fuelPrice]       Price per litre or gallon, for the running-cost comparison.
 * @param {number} [input.fuelEfficiency]  Distance covered per litre or gallon.
 * @returns {object} the claim, or { error }.
 */
export function computeMileage({
  distancePerTrip,
  trips = 1,
  roundTrip = false,
  tier1Rate,
  tierLimit = 0,
  tier2Rate,
  priorDistance = 0,
  passengers = 0,
  passengerRate = 0,
  tolls = 0,
  parking = 0,
  fuelPrice = 0,
  fuelEfficiency = 0,
} = {}) {
  if (!isNum(distancePerTrip)) return { error: "Enter the distance as a number." };
  if (distancePerTrip < 0) return { error: "Distance cannot be negative." };
  if (distancePerTrip > 100000) return { error: "Enter a distance of 100,000 per trip or less." };
  if (!isNum(trips) || trips < 1) return { error: "Claim at least one trip." };
  if (trips > 1000) return { error: "Enter 1,000 trips or fewer." };
  if (!isNum(tier1Rate) || tier1Rate < 0) return { error: "Enter a rate per unit of zero or more." };
  if (!isNum(tierLimit) || tierLimit < 0) return { error: "The threshold distance cannot be negative." };
  if (!isNum(priorDistance) || priorDistance < 0) {
    return { error: "Distance already claimed cannot be negative." };
  }
  if (!isNum(passengers) || passengers < 0) return { error: "Passenger count cannot be negative." };
  if (!isNum(tolls) || tolls < 0 || !isNum(parking) || parking < 0) {
    return { error: "Tolls and parking cannot be negative." };
  }

  const secondRate = isNum(tier2Rate) && tier2Rate >= 0 ? tier2Rate : tier1Rate;
  const legs = roundTrip ? 2 : 1;
  const totalDistance = round2(distancePerTrip * legs * Math.floor(trips));

  // Split the distance across the threshold, allowing for distance already claimed this year.
  let tier1Distance = totalDistance;
  let tier2Distance = 0;
  if (tierLimit > 0) {
    const headroom = Math.max(0, tierLimit - priorDistance);
    tier1Distance = round2(Math.min(totalDistance, headroom));
    tier2Distance = round2(totalDistance - tier1Distance);
  }

  const tier1Amount = round2(tier1Distance * tier1Rate);
  const tier2Amount = round2(tier2Distance * secondRate);
  const mileageAmount = round2(tier1Amount + tier2Amount);

  const passengerCount = Math.floor(passengers);
  const perPassenger = isNum(passengerRate) && passengerRate > 0 ? passengerRate : 0;
  const passengerAmount = round2(totalDistance * passengerCount * perPassenger);

  const extras = round2(tolls + parking);
  const total = round2(mileageAmount + passengerAmount + extras);

  // Running-cost comparison: what the fuel alone cost, and what is left to cover
  // wear, tyres, servicing, insurance and depreciation.
  let fuelCost = null;
  let marginOverFuel = null;
  let fuelUsed = null;
  if (isNum(fuelPrice) && fuelPrice > 0 && isNum(fuelEfficiency) && fuelEfficiency > 0) {
    fuelUsed = round2(totalDistance / fuelEfficiency);
    fuelCost = round2(fuelUsed * fuelPrice);
    marginOverFuel = round2(mileageAmount - fuelCost);
  }

  return {
    totalDistance,
    legs,
    trips: Math.floor(trips),
    tier1Distance,
    tier2Distance,
    tier1Amount,
    tier2Amount,
    mileageAmount,
    passengerAmount,
    passengerCount,
    tolls: round2(tolls),
    parking: round2(parking),
    extras,
    total,
    /** Blended payout per unit of distance, extras included. */
    effectiveRate: totalDistance > 0 ? round2(total / totalDistance) : 0,
    /** Distance left before the higher rate drops to the lower one. */
    thresholdHeadroom: tierLimit > 0 ? round2(Math.max(0, tierLimit - priorDistance - totalDistance)) : null,
    crossedThreshold: tier2Distance > 0,
    fuelUsed,
    fuelCost,
    marginOverFuel,
  };
}
