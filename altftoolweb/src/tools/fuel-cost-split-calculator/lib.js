/**
 * Road-trip cost split.
 *
 * Trip cost is built from three parts:
 *   fuel  = (distance_km / mileage_kmpl) x price_per_litre
 *   plus tolls, plus any other shared cost (parking, ferry, driver allowance)
 *
 * The split rule is person-kilometres: someone who rides 300 km of a 600 km
 * trip carries half the share of someone who rides the whole way. This is the
 * standard proportional allocation
 *   share_i = total_cost x km_i / sum(km)
 * and it degenerates to an equal split when everyone rides the full distance.
 */

/** Money is settled to 2 decimals; residual paise go to the largest share. */
export const MONEY_DECIMALS = 2;

/** Sanity ceiling for a single road trip, km. */
export const MAX_DISTANCE_KM = 20000;

/** Sanity ceiling for vehicle mileage, km per litre. */
export const MAX_KMPL = 200;

/** Most people that can be settled in one trip. */
export const MAX_PEOPLE = 20;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @param {object} input
 * @param {number} input.distanceKm    total trip distance driven, km
 * @param {number} input.mileageKmpl   vehicle mileage, km per litre
 * @param {number} input.fuelPrice     fuel price per litre
 * @param {number} [input.tolls]       total tolls for the trip
 * @param {number} [input.otherCosts]  parking, ferry, permits and similar
 * @param {Array<{name: string, km: number}>} input.people
 *        one row per traveller with the kilometres they were in the vehicle
 * @returns {object} totals and per-person shares, or { error }
 */
export function splitFuelCost({
  distanceKm,
  mileageKmpl,
  fuelPrice,
  tolls = 0,
  otherCosts = 0,
  people = [],
}) {
  if (![distanceKm, mileageKmpl, fuelPrice, tolls, otherCosts].every(isNum)) {
    return { error: "Enter a number in every trip cost field." };
  }
  if (distanceKm <= 0) return { error: "Trip distance must be greater than zero." };
  if (distanceKm > MAX_DISTANCE_KM) {
    return { error: `Trip distance above ${MAX_DISTANCE_KM} km is out of range.` };
  }
  if (mileageKmpl <= 0) return { error: "Mileage must be greater than zero km per litre." };
  if (mileageKmpl > MAX_KMPL) return { error: `Mileage above ${MAX_KMPL} km/l is not realistic.` };
  if (fuelPrice <= 0) return { error: "Fuel price must be greater than zero." };
  if (tolls < 0 || otherCosts < 0) return { error: "Tolls and other costs cannot be negative." };

  if (!Array.isArray(people) || people.length === 0) {
    return { error: "Add at least one traveller to split the cost." };
  }
  if (people.length > MAX_PEOPLE) {
    return { error: `This calculator settles up to ${MAX_PEOPLE} travellers.` };
  }
  if (!people.every((person) => isNum(person.km))) {
    return { error: "Enter the kilometres travelled for every person." };
  }
  if (people.some((person) => person.km < 0)) {
    return { error: "Kilometres travelled cannot be negative." };
  }
  if (people.some((person) => person.km > distanceKm)) {
    return { error: "Nobody can travel more kilometres than the trip itself." };
  }

  const litres = distanceKm / mileageKmpl;
  const fuelCost = litres * fuelPrice;
  const totalCost = fuelCost + tolls + otherCosts;
  const costPerKm = totalCost / distanceKm;

  const totalPersonKm = people.reduce((sum, person) => sum + person.km, 0);
  if (totalPersonKm <= 0) {
    return { error: "At least one person must have travelled some distance." };
  }

  const raw = people.map((person) => ({
    name: person.name,
    km: person.km,
    fraction: person.km / totalPersonKm,
    exact: (totalCost * person.km) / totalPersonKm,
  }));

  const rounded = raw.map((row) => ({ ...row, amount: round2(row.exact) }));
  const roundedTotal = rounded.reduce((sum, row) => sum + row.amount, 0);
  const residual = round2(totalCost - roundedTotal);
  if (residual !== 0) {
    // Push the rounding remainder onto the largest share so the shares add up
    // to the trip total exactly.
    let biggest = 0;
    for (let i = 1; i < rounded.length; i += 1) {
      if (rounded[i].exact > rounded[biggest].exact) biggest = i;
    }
    rounded[biggest] = { ...rounded[biggest], amount: round2(rounded[biggest].amount + residual) };
  }

  const equalShare = totalCost / people.length;

  return {
    litres,
    fuelCost,
    tolls,
    otherCosts,
    totalCost,
    costPerKm,
    totalPersonKm,
    equalShare,
    shares: rounded.map((row) => ({
      name: row.name,
      km: row.km,
      fraction: row.fraction,
      amount: row.amount,
      differenceVsEqual: row.amount - equalShare,
      costPerKm: row.km > 0 ? row.amount / row.km : 0,
    })),
    settledTotal: rounded.reduce((sum, row) => sum + row.amount, 0),
  };
}
