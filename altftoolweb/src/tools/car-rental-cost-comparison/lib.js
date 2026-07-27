/**
 * Self-drive car rental cost comparison.
 *
 * A rental quote is never one number. For one concrete trip — days on rent and
 * kilometres driven — the landed cost of a package is:
 *
 *   rental charges = daily rate x days
 *                  + insurance / CDW per day x days
 *                  + excess km rate x max(0, km driven - included km)
 *                  + one-off delivery or pickup fee
 *   invoice total  = rental charges x (1 + GST)
 *   fuel           = depends entirely on the fuel policy (see below)
 *   landed cost    = invoice total + fuel
 *
 * GST is applied only to the rental charges. Petrol and diesel are outside GST
 * in India, so pump fuel and pass-through prepaid fuel are added after tax.
 *
 * FUEL POLICIES
 *   self     — "same-to-same" or "full-to-full". You return the tank as you got
 *              it, so you pay the pump for exactly what you burn:
 *                  litres = km / km-per-litre,  cost = litres x pump price
 *   prepaid  — you buy a tank up front at the operator's rate and any fuel left
 *              in it is not refunded. Cost is the whole tank, plus pump price on
 *              anything you burn beyond it:
 *                  cost = tank litres x operator rate
 *                       + max(0, litres used - tank litres) x pump price
 *   included — fuel is bundled into the tariff; the fuel line is zero.
 *
 * The security deposit is never a cost — it is cash blocked on your card and
 * refunded — so it is reported separately and excluded from every total.
 *
 * Marginal cost per extra kilometre is reported too, because that is the number
 * that decides whether an "unlimited km" package is worth its higher day rate.
 */

export const FUEL_POLICIES = [
  { id: "self", label: "Same-to-same (you refuel)" },
  { id: "prepaid", label: "Prepaid tank (no refund)" },
  { id: "included", label: "Fuel included in tariff" },
];

/**
 * Rate most Indian self-drive operators show on the invoice for renting a car
 * without a driver. Operators and contracts differ — always check the quote,
 * which is why this is an editable input rather than a hard-coded constant.
 */
export const DEFAULT_GST_PERCENT = 18;

/** Sanity ceilings so a mistyped field cannot produce a nonsense comparison. */
const MAX_DAYS = 365;
const MAX_KM = 100000;
const MAX_PACKAGES = 4;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const nonNegative = (value) => isNum(value) && value >= 0;

/**
 * @param {object} input
 * @param {number} input.days       days on rent
 * @param {number} input.totalKm    kilometres you expect to drive
 * @param {number} input.fuelPrice  pump price per litre
 * @param {number} input.kmpl       the car's real mileage, km per litre
 * @param {number} input.gstPercent GST applied to the rental charges
 * @param {Array}  input.packages   quotes to compare
 */
export function compareRentals({ days, totalKm, fuelPrice, kmpl, gstPercent, packages = [] }) {
  if (![days, totalKm, fuelPrice, kmpl, gstPercent].every(isNum))
    return { error: "Enter a valid number for days, kilometres, fuel price, mileage and GST." };
  if (days <= 0) return { error: "Days on rent must be at least one." };
  if (days > MAX_DAYS) return { error: `Enter ${MAX_DAYS} days or fewer.` };
  if (totalKm < 0) return { error: "Kilometres driven cannot be negative." };
  if (totalKm > MAX_KM) return { error: `Enter ${MAX_KM.toLocaleString("en-IN")} km or fewer.` };
  if (fuelPrice < 0) return { error: "Fuel price cannot be negative." };
  if (kmpl <= 0) return { error: "Enter the car's mileage in km per litre — it cannot be zero." };
  if (gstPercent < 0 || gstPercent > 100) return { error: "GST must be between 0 and 100 percent." };
  if (packages.length === 0) return { error: "Add at least one rental quote to compare." };
  if (packages.length > MAX_PACKAGES)
    return { error: `Compare ${MAX_PACKAGES} quotes at a time or fewer.` };

  const gst = gstPercent / 100;
  const litresUsed = totalKm / kmpl;

  const rows = [];
  for (const pkg of packages) {
    const {
      id,
      name,
      dailyRate,
      unlimitedKm = false,
      includedKmPerDay = 0,
      excessKmRate = 0,
      insurancePerDay = 0,
      deliveryFee = 0,
      deposit = 0,
      fuelPolicy = "self",
      prepaidTankLitres = 0,
      prepaidRatePerL = 0,
    } = pkg;

    const money = [
      dailyRate,
      includedKmPerDay,
      excessKmRate,
      insurancePerDay,
      deliveryFee,
      deposit,
      prepaidTankLitres,
      prepaidRatePerL,
    ];
    if (!money.every(nonNegative))
      return { error: `Check "${name || id}" — every rate must be a number that is zero or more.` };
    if (!FUEL_POLICIES.some((policy) => policy.id === fuelPolicy))
      return { error: `Check "${name || id}" — pick a fuel policy.` };
    if (fuelPolicy === "prepaid" && prepaidTankLitres <= 0)
      return { error: `Check "${name || id}" — a prepaid package needs a tank size in litres.` };

    const baseCharge = dailyRate * days;
    const insuranceCharge = insurancePerDay * days;
    const includedKm = unlimitedKm ? Infinity : includedKmPerDay * days;
    const excessKm = unlimitedKm ? 0 : Math.max(0, totalKm - includedKm);
    const excessCharge = excessKm * excessKmRate;
    const rentalCharges = baseCharge + insuranceCharge + excessCharge + deliveryFee;
    const gstAmount = rentalCharges * gst;
    const invoiceTotal = rentalCharges + gstAmount;

    let fuelCost = 0;
    let fuelNote = "";
    if (fuelPolicy === "self") {
      fuelCost = litresUsed * fuelPrice;
      fuelNote = `${litresUsed.toFixed(1)} L at the pump`;
    } else if (fuelPolicy === "prepaid") {
      const overrunLitres = Math.max(0, litresUsed - prepaidTankLitres);
      fuelCost = prepaidTankLitres * prepaidRatePerL + overrunLitres * fuelPrice;
      const wasted = Math.max(0, prepaidTankLitres - litresUsed);
      fuelNote =
        wasted > 0
          ? `${wasted.toFixed(1)} L of the prepaid tank goes unused and unrefunded`
          : `${overrunLitres.toFixed(1)} L bought at the pump beyond the prepaid tank`;
    } else {
      fuelNote = "Fuel bundled into the tariff";
    }

    const landedCost = invoiceTotal + fuelCost;

    // What the next kilometre actually costs once the allowance is gone.
    const fuelPerKm = fuelPolicy === "included" ? 0 : fuelPrice / kmpl;
    const excessPerKm = unlimitedKm ? 0 : excessKmRate * (1 + gst);
    const marginalCostPerKm =
      (unlimitedKm || totalKm < includedKm ? 0 : excessPerKm) + fuelPerKm;

    rows.push({
      id,
      name: name || id,
      days,
      baseCharge,
      insuranceCharge,
      includedKm: unlimitedKm ? null : includedKm,
      excessKm,
      excessCharge,
      deliveryFee,
      rentalCharges,
      gstAmount,
      invoiceTotal,
      fuelPolicy,
      fuelCost,
      fuelNote,
      landedCost,
      deposit,
      costPerDay: landedCost / days,
      costPerKm: totalKm > 0 ? landedCost / totalKm : null,
      marginalCostPerKm,
      unlimitedKm,
    });
  }

  const ranked = [...rows].sort((a, b) => a.landedCost - b.landedCost);
  const cheapest = ranked[0];
  const dearest = ranked[ranked.length - 1];
  const spread = dearest.landedCost - cheapest.landedCost;

  const withRank = rows.map((row) => ({
    ...row,
    rank: ranked.findIndex((entry) => entry.id === row.id) + 1,
    extraOverCheapest: row.landedCost - cheapest.landedCost,
  }));

  const notes = [];
  if (ranked.length > 1) {
    notes.push(
      `"${cheapest.name}" lands ${Math.round(spread).toLocaleString("en-IN")} rupees cheaper than "${dearest.name}" for ${days} day(s) and ${Math.round(totalKm).toLocaleString("en-IN")} km.`,
    );
  }
  const capped = withRank.filter((row) => row.excessKm > 0);
  if (capped.length > 0) {
    notes.push(
      `${capped.map((row) => `"${row.name}"`).join(", ")} run past the included kilometres — that excess is where a cheap headline rate usually disappears.`,
    );
  }
  const prepaid = withRank.filter((row) => row.fuelPolicy === "prepaid");
  if (prepaid.length > 0) {
    notes.push(
      "A prepaid tank is only worth taking if you will genuinely return the car near empty; unused litres are not refunded.",
    );
  }
  const maxDeposit = Math.max(...withRank.map((row) => row.deposit));
  if (maxDeposit > 0) {
    notes.push(
      `Up to ${Math.round(maxDeposit).toLocaleString("en-IN")} rupees is blocked as a deposit. It is refundable, so it is not counted in any total above — but it does have to be free on your card.`,
    );
  }

  return {
    rows: withRank,
    ranked,
    cheapestId: cheapest.id,
    cheapestName: cheapest.name,
    cheapestCost: cheapest.landedCost,
    spread,
    litresUsed,
    notes,
  };
}
