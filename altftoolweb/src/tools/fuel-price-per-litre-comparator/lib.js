/**
 * Fuel price comparison across units and currencies.
 *
 * Pump prices are quoted per litre in most of the world, per US gallon in the United
 * States, and per imperial gallon in a handful of Caribbean markets. To compare them
 * you have to normalise twice — once for volume, once for currency:
 *
 *     price per litre (home currency) = quoted price
 *                                     / litres in the quoted volume unit
 *                                     x home currency units per 1 unit of the quoted currency
 *
 * The exchange rate is entered by hand. This tool has no live rate feed, so use the
 * rate your card actually gives you (the interbank rate plus the card's markup), not
 * the headline mid-market rate.
 */

/** US liquid gallon = 231 cubic inches with 1 inch = 2.54 cm exactly. */
export const LITRES_PER_US_GALLON = 3.785411784;

/** Imperial gallon, fixed at 4.54609 litres by the UK Weights and Measures Act 1985. */
export const LITRES_PER_IMPERIAL_GALLON = 4.54609;

export const VOLUME_UNITS = [
  { key: "litre", label: "per litre", litres: 1 },
  { key: "usgal", label: "per US gallon", litres: LITRES_PER_US_GALLON },
  { key: "impgal", label: "per imperial gallon", litres: LITRES_PER_IMPERIAL_GALLON },
];

/** Guard against a mistyped exchange rate producing a nonsense ranking. */
export const MAX_EXCHANGE_RATE = 100000;

export function litresIn(unitKey) {
  const unit = VOLUME_UNITS.find((entry) => entry.key === unitKey);
  return unit ? unit.litres : NaN;
}

/**
 * Normalise one quoted price to a price per litre in the home currency.
 *
 * @param {object} input
 * @param {number} input.price     the number on the pump sign
 * @param {string} input.volumeUnit "litre" | "usgal" | "impgal"
 * @param {number} input.rateToHome home-currency units per 1 unit of the quoted currency
 * @returns {{error:string}|{perLitreLocal:number,perLitreHome:number,litresPerUnit:number}}
 */
export function toPricePerLitre({ price, volumeUnit = "litre", rateToHome = 1 }) {
  const amount = Number(price);
  const rate = Number(rateToHome);
  const litres = litresIn(volumeUnit);

  if (!Number.isFinite(amount)) return { error: "Enter each pump price as a number." };
  if (amount <= 0) return { error: "A pump price must be greater than zero." };
  if (!Number.isFinite(litres)) return { error: "Pick the volume unit the price is quoted in." };
  if (!Number.isFinite(rate) || rate <= 0) return { error: "The exchange rate must be greater than zero." };
  if (rate > MAX_EXCHANGE_RATE) return { error: `An exchange rate above ${MAX_EXCHANGE_RATE} is probably a typo.` };

  const perLitreLocal = amount / litres;
  return { perLitreLocal, perLitreHome: perLitreLocal * rate, litresPerUnit: litres };
}

/**
 * Rank several quoted prices once they are all in the same currency per litre.
 *
 * @param {Array<{label:string,price:number,volumeUnit:string,rateToHome:number,currency?:string}>} entries
 * @returns {{error:string}|{rows:object[],cheapest:object,dearest:object,spreadPerLitre:number,spreadPct:number}}
 */
export function compareFuelPrices(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { error: "Add at least one pump price to compare." };
  }

  const rows = [];
  for (const entry of entries) {
    const converted = toPricePerLitre(entry);
    if (converted.error) return { error: `${entry.label || "One station"}: ${converted.error}` };
    rows.push({
      label: entry.label || "Station",
      currency: entry.currency || "",
      price: Number(entry.price),
      volumeUnit: entry.volumeUnit,
      rateToHome: Number(entry.rateToHome),
      perLitreLocal: converted.perLitreLocal,
      perLitreHome: converted.perLitreHome,
    });
  }

  const sorted = [...rows].sort((a, b) => a.perLitreHome - b.perLitreHome);
  const cheapest = sorted[0];
  const dearest = sorted[sorted.length - 1];
  const spreadPerLitre = dearest.perLitreHome - cheapest.perLitreHome;
  const spreadPct = cheapest.perLitreHome > 0 ? (spreadPerLitre / cheapest.perLitreHome) * 100 : 0;

  const ranked = sorted.map((row, index) => ({
    ...row,
    rank: index + 1,
    premiumOverCheapest: row.perLitreHome - cheapest.perLitreHome,
    premiumPct: cheapest.perLitreHome > 0 ? ((row.perLitreHome / cheapest.perLitreHome) - 1) * 100 : 0,
  }));

  return { rows: ranked, cheapest, dearest, spreadPerLitre, spreadPct };
}

/**
 * What a fill or a leg of the trip costs at a given price per litre.
 *
 * @returns {{error:string}|{litres:number,tankCost:number,tripCost:number,costPer100Km:number}}
 */
export function fillAndTripCost({ perLitreHome, tankLitres, kmpl, distanceKm }) {
  const price = Number(perLitreHome);
  const tank = Number(tankLitres);
  const economy = Number(kmpl);
  const distance = Number(distanceKm);

  if (!Number.isFinite(price) || price <= 0) return { error: "Price per litre must be greater than zero." };
  if (!Number.isFinite(tank) || tank <= 0) return { error: "Enter how many litres you plan to put in." };
  if (!Number.isFinite(economy) || economy <= 0) return { error: "Fuel economy in km/l must be greater than zero." };
  if (!Number.isFinite(distance) || distance < 0) return { error: "Trip distance cannot be negative." };

  const litresForTrip = distance / economy;
  return {
    litres: tank,
    tankCost: tank * price,
    rangeFromTankKm: tank * economy,
    litresForTrip,
    tripCost: litresForTrip * price,
    costPer100Km: (100 / economy) * price,
  };
}
