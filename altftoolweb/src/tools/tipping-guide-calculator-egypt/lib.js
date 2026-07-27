/**
 * Egypt tipping (baksheesh) model.
 *
 * Two different rules are at work in Egypt and mixing them up is what makes
 * travellers over- or under-tip:
 *
 *   1. Percentage tipping on a bill. This applies in sit-down restaurants,
 *      cafés and salons. The customary tip is calculated on the food-and-drink
 *      subtotal BEFORE tax and before any service charge, not on the grand
 *      total printed at the bottom of the bill.
 *
 *   2. Fixed baksheesh per unit of service — per bag, per night, per day, per
 *      ride, per favour. These are small cash amounts and there is no
 *      percentage involved at all.
 *
 * The service charge complication: most tourist-facing Egyptian restaurants add
 * a service charge (commonly 12%) and then VAT on top. The service charge is
 * kept by the establishment far more often than it is distributed, which is why
 * a smaller cash tip handed directly to the server remains customary even when
 * the bill already shows one. This module therefore carries two percentage
 * bands per bill-based service — one for a bill with a service charge and one
 * for a bill without.
 *
 * Everything here is a customary range, not a legal rate, and the pound has
 * moved sharply since it was floated in March 2024, so every rate can be scaled
 * by a single adjustment percentage rather than being frozen in the code.
 *
 * Pure functions only: no clock, no network, no DOM.
 */

/** Standard VAT rate in Egypt, applied to restaurant bills. */
export const EGYPT_VAT_PCT = 14;

/** Service charge most tourist restaurants add before VAT. */
export const TYPICAL_SERVICE_CHARGE_PCT = 12;

/**
 * Egyptian pound notes and the 1-pound coin, largest first. Used to work out
 * how many small notes to carry, which matters in Egypt because most baksheesh
 * is handed over in 5, 10 and 20 pound notes and change is rarely offered.
 */
export const EGP_DENOMINATIONS = [200, 100, 50, 20, 10, 5, 1];

/** Notes small enough to be useful as baksheesh. */
export const SMALL_NOTE_CEILING_EGP = 20;

/** Tips at or above this value are rounded to the nearest 5 pounds. */
export const CASH_ROUNDING_THRESHOLD_EGP = 25;

/** Guard rails so a mistyped figure produces a message rather than nonsense. */
export const MAX_TRAVELLERS = 60;
export const MAX_TRIP_DAYS = 365;
export const MAX_BILL_EGP = 5_000_000;
export const MAX_UNITS = 999;
export const MAX_RATE_ADJUST_PCT = 400;
export const MIN_RATE_ADJUST_PCT = -80;

export const GENEROSITY_LEVELS = [
  { id: "low", label: "Modest", note: "The bottom of the customary range." },
  { id: "typical", label: "Customary", note: "What most visitors actually hand over." },
  { id: "high", label: "Generous", note: "The top of the range, or for exceptional service." },
];

/**
 * Bill-based services. `withoutCharge` and `withCharge` hold the customary
 * percentage of the pre-tax subtotal for the modest / customary / generous
 * bands, depending on whether a service charge already appears on the bill.
 */
export const PERCENT_SERVICES = [
  {
    id: "restaurant",
    group: "Eating and drinking",
    label: "Sit-down restaurant bill",
    unitLabel: "food and drink subtotal, EGP",
    withoutCharge: { low: 5, typical: 10, high: 15 },
    withCharge: { low: 3, typical: 5, high: 10 },
    note: "Tip on the subtotal before the 12% service charge and 14% VAT, and hand it to the server rather than leaving it on the card slip.",
  },
  {
    id: "cafe",
    group: "Eating and drinking",
    label: "Café, ahwa or bar tab",
    unitLabel: "tab subtotal, EGP",
    withoutCharge: { low: 5, typical: 10, high: 12 },
    withCharge: { low: 0, typical: 5, high: 8 },
    note: "For a single tea or coffee most people simply round up rather than working out a percentage.",
  },
  {
    id: "spa",
    group: "Eating and drinking",
    label: "Spa, hammam or salon bill",
    unitLabel: "treatment price, EGP",
    withoutCharge: { low: 10, typical: 15, high: 20 },
    withCharge: { low: 5, typical: 10, high: 12 },
    note: "Give it to the therapist directly; reception tills and treatment staff are usually separate.",
  },
];

/**
 * Fixed baksheesh services, in Egyptian pounds per unit. Ranges reflect what is
 * customary at tourist-facing venues in Cairo, Luxor, Aswan and the Red Sea
 * resorts; village and non-tourist prices are lower.
 */
export const UNIT_SERVICES = [
  {
    id: "porter",
    each: "bag",
    group: "Hotels",
    label: "Hotel porter",
    unitLabel: "bags carried",
    low: 20,
    typical: 30,
    high: 50,
    note: "Per bag, not per trolley load.",
  },
  {
    id: "housekeeping",
    each: "night",
    group: "Hotels",
    label: "Housekeeping",
    unitLabel: "nights",
    low: 20,
    typical: 50,
    high: 80,
    note: "Leave it daily rather than in one lump at checkout — the room is rarely cleaned by the same person all week.",
  },
  {
    id: "doorman",
    each: "taxi hailed",
    group: "Hotels",
    label: "Doorman hailing a taxi",
    unitLabel: "taxis hailed",
    low: 10,
    typical: 20,
    high: 30,
    note: "Only if he actually negotiated the fare or found the car.",
  },
  {
    id: "taxi",
    each: "ride",
    group: "Getting around",
    label: "Street or metered taxi",
    unitLabel: "rides",
    low: 5,
    typical: 10,
    high: 20,
    note: "Round the fare up rather than adding a percentage. Agree the price before you get in if there is no meter.",
  },
  {
    id: "rideshare",
    each: "ride",
    group: "Getting around",
    label: "Uber or Careem ride",
    unitLabel: "rides",
    low: 0,
    typical: 10,
    high: 20,
    note: "Not expected — the fare is fixed in the app — but cash is welcome for luggage or a long wait.",
  },
  {
    id: "driver",
    each: "day",
    group: "Getting around",
    label: "Private car and driver",
    unitLabel: "days",
    low: 100,
    typical: 200,
    high: 300,
    note: "Per day for the driver, separate from anything paid to the agency.",
  },
  {
    id: "coachDriver",
    each: "day",
    group: "Getting around",
    label: "Coach or minibus driver on a group tour",
    unitLabel: "days",
    low: 50,
    typical: 100,
    high: 150,
    note: "Usually collected as a group kitty at the end of the tour.",
  },
  {
    id: "guide",
    each: "guiding day",
    group: "Guides and sites",
    label: "Licensed Egyptologist guide",
    unitLabel: "guiding days",
    low: 200,
    typical: 400,
    high: 700,
    note: "Per day for the whole party. Roughly the equivalent of USD 5 to USD 10 per person per day for a small group.",
  },
  {
    id: "siteBaksheesh",
    each: "favour",
    group: "Guides and sites",
    label: "Site favour — unlocking a tomb, pointing out a carving",
    unitLabel: "favours",
    low: 10,
    typical: 20,
    high: 50,
    note: "Optional. Photography inside tombs usually needs a separately purchased permit, not baksheesh.",
  },
  {
    id: "camel",
    each: "ride",
    group: "Guides and sites",
    label: "Camel or horse handler",
    unitLabel: "rides",
    low: 20,
    typical: 50,
    high: 100,
    note: "On top of the agreed ride price, which should be settled before you mount.",
  },
  {
    id: "felucca",
    each: "sail",
    group: "Boats and excursions",
    label: "Felucca captain",
    unitLabel: "sails",
    low: 50,
    typical: 100,
    high: 200,
    note: "Per boat for a short sail, more for a half day with tea and food.",
  },
  {
    id: "cruiseCrew",
    each: "person per night",
    group: "Boats and excursions",
    label: "Nile cruise crew pool",
    unitLabel: "person-nights",
    low: 100,
    typical: 150,
    high: 250,
    note: "Per person per night into the shared box at reception; the guide and driver are tipped separately.",
  },
  {
    id: "balloon",
    each: "person per flight",
    group: "Boats and excursions",
    label: "Balloon ground crew at Luxor",
    unitLabel: "person-flights",
    low: 50,
    typical: 100,
    high: 200,
    note: "Split between the pilot and the chase crew who pack the envelope.",
  },
  {
    id: "diveCrew",
    each: "person per day",
    group: "Boats and excursions",
    label: "Dive or snorkel boat crew",
    unitLabel: "person-days",
    low: 100,
    typical: 150,
    high: 250,
    note: "One pot shared by the skipper, the guides and the galley.",
  },
  {
    id: "restroom",
    each: "visit",
    group: "Small courtesies",
    label: "Restroom attendant",
    unitLabel: "visits",
    low: 5,
    typical: 5,
    high: 10,
    note: "Paper is often handed over by the attendant, so carry 5 pound notes.",
  },
  {
    id: "shoeAttendant",
    each: "visit",
    group: "Small courtesies",
    label: "Mosque shoe attendant",
    unitLabel: "visits",
    low: 5,
    typical: 10,
    high: 20,
    note: "There is no admission charge at most working mosques; this is the customary courtesy instead.",
  },
  {
    id: "delivery",
    each: "delivery",
    group: "Small courtesies",
    label: "Food delivery rider",
    unitLabel: "deliveries",
    low: 10,
    typical: 20,
    high: 30,
    note: "More in bad weather or up several flights of stairs.",
  },
];

export const SERVICE_GROUPS = [
  "Eating and drinking",
  "Hotels",
  "Getting around",
  "Guides and sites",
  "Boats and excursions",
  "Small courtesies",
];

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const isCount = (v) => isNum(v) && v >= 0 && Number.isInteger(v);

/** Round to whole pounds, or to the nearest 5 once the amount is cash-sized. */
export function roundCashEgp(value) {
  if (!isNum(value) || value <= 0) return 0;
  if (value < CASH_ROUNDING_THRESHOLD_EGP) return Math.round(value);
  return Math.round(value / 5) * 5;
}

/**
 * Greedy breakdown of an amount into Egyptian notes, largest first.
 *
 * @param {number} amountEgp whole pounds
 * @returns {Array<{denomination:number,count:number}>}
 */
export function noteBreakdown(amountEgp) {
  if (!isNum(amountEgp) || amountEgp <= 0) return [];
  let remaining = Math.round(amountEgp);
  const out = [];
  for (const denomination of EGP_DENOMINATIONS) {
    const count = Math.floor(remaining / denomination);
    if (count > 0) {
      out.push({ denomination, count });
      remaining -= count * denomination;
    }
  }
  return out;
}

/**
 * What a restaurant bill actually comes to once the service charge and VAT are
 * added, so the tip can be seen against the real damage.
 *
 * VAT in Egypt is charged on the subtotal plus the service charge.
 */
export function grossRestaurantBill(subtotalEgp, serviceChargePct = TYPICAL_SERVICE_CHARGE_PCT) {
  if (!isNum(subtotalEgp) || subtotalEgp < 0) {
    return { error: "Enter the bill subtotal as a number of zero or more." };
  }
  if (!isNum(serviceChargePct) || serviceChargePct < 0 || serviceChargePct > 100) {
    return { error: "The service charge must be between 0% and 100%." };
  }
  const serviceCharge = (subtotalEgp * serviceChargePct) / 100;
  const vat = ((subtotalEgp + serviceCharge) * EGYPT_VAT_PCT) / 100;
  return {
    subtotal: Math.round(subtotalEgp),
    serviceCharge: Math.round(serviceCharge),
    vat: Math.round(vat),
    total: Math.round(subtotalEgp + serviceCharge + vat),
  };
}

/** Scale a base rate by the inflation adjustment and round it back to cash. */
function adjust(rate, adjustPct) {
  return roundCashEgp((rate * (100 + adjustPct)) / 100);
}

/**
 * Build the full tipping plan.
 *
 * @param {object} input
 * @param {string} input.generosity "low" | "typical" | "high"
 * @param {boolean} input.serviceChargeOnBill whether bills already show a service charge
 * @param {number} input.travellers people sharing the cost, >= 1
 * @param {number} input.tripDays length of the trip in days, >= 1
 * @param {number} input.rateAdjustPct percentage applied to every fixed rate
 * @param {object} input.entries map of service id -> amount (EGP) or unit count
 * @param {number} input.egpPerHomeUnit pounds per 1 unit of the home currency, 0 to skip
 * @returns {object} the plan, or { error }
 */
export function buildTipPlan({
  generosity = "typical",
  serviceChargeOnBill = true,
  travellers = 1,
  tripDays = 1,
  rateAdjustPct = 0,
  entries = {},
  egpPerHomeUnit = 0,
} = {}) {
  const level = GENEROSITY_LEVELS.find((entry) => entry.id === generosity);
  if (!level) return { error: "Choose a modest, customary or generous level." };

  if (!isCount(travellers) || travellers < 1) {
    return { error: "Enter at least one traveller as a whole number." };
  }
  if (travellers > MAX_TRAVELLERS) {
    return { error: `Enter ${MAX_TRAVELLERS} travellers or fewer.` };
  }
  if (!isCount(tripDays) || tripDays < 1) {
    return { error: "Enter the trip length as a whole number of days, at least one." };
  }
  if (tripDays > MAX_TRIP_DAYS) {
    return { error: `Enter ${MAX_TRIP_DAYS} days or fewer.` };
  }
  if (!isNum(rateAdjustPct) || rateAdjustPct < MIN_RATE_ADJUST_PCT || rateAdjustPct > MAX_RATE_ADJUST_PCT) {
    return {
      error: `The rate adjustment must be between ${MIN_RATE_ADJUST_PCT}% and ${MAX_RATE_ADJUST_PCT}%.`,
    };
  }
  if (!isNum(egpPerHomeUnit) || egpPerHomeUnit < 0) {
    return { error: "The exchange rate must be a number of zero or more." };
  }

  const lines = [];
  let percentTotal = 0;
  let unitTotal = 0;
  let smallNoteTotal = 0;

  for (const service of PERCENT_SERVICES) {
    const raw = entries[service.id];
    const bill = raw === undefined || raw === null || raw === "" ? 0 : Number(raw);
    if (!isNum(bill) || bill < 0) {
      return { error: `Enter a valid amount of zero or more for ${service.label.toLowerCase()}.` };
    }
    if (bill > MAX_BILL_EGP) {
      return { error: `${service.label} looks mistyped — keep it under ${MAX_BILL_EGP} EGP.` };
    }
    if (bill === 0) continue;

    const band = serviceChargeOnBill ? service.withCharge : service.withoutCharge;
    const pct = band[level.id];
    const tip = roundCashEgp((bill * pct) / 100);
    percentTotal += tip;
    lines.push({
      id: service.id,
      group: service.group,
      label: service.label,
      basis: `${pct}% of ${Math.round(bill)} EGP`,
      rateLabel: `${pct}% of the pre-tax subtotal`,
      quantity: Math.round(bill),
      tipEgp: tip,
      note: service.note,
      kind: "percent",
    });
  }

  for (const service of UNIT_SERVICES) {
    const raw = entries[service.id];
    const units = raw === undefined || raw === null || raw === "" ? 0 : Number(raw);
    if (!isCount(units)) {
      return { error: `Enter a whole number of ${service.unitLabel} for ${service.label.toLowerCase()}.` };
    }
    if (units > MAX_UNITS) {
      return { error: `${service.label}: enter ${MAX_UNITS} ${service.unitLabel} or fewer.` };
    }
    if (units === 0) continue;

    const rate = adjust(service[level.id], rateAdjustPct);
    const tip = rate * units;
    unitTotal += tip;
    if (rate > 0 && rate <= SMALL_NOTE_CEILING_EGP) smallNoteTotal += tip;
    lines.push({
      id: service.id,
      group: service.group,
      label: service.label,
      basis: `${units} x ${rate} EGP`,
      rateLabel: `${rate} EGP per ${service.each}`,
      quantity: units,
      tipEgp: tip,
      note: service.note,
      kind: "unit",
    });
  }

  const totalEgp = percentTotal + unitTotal;
  const perTravellerEgp = Math.round(totalEgp / travellers);
  const perDayEgp = Math.round(totalEgp / tripDays);
  const homeTotal = egpPerHomeUnit > 0 ? Math.round((totalEgp / egpPerHomeUnit) * 100) / 100 : null;
  const homePerTraveller =
    egpPerHomeUnit > 0 ? Math.round((perTravellerEgp / egpPerHomeUnit) * 100) / 100 : null;

  const byGroup = SERVICE_GROUPS.map((group) => {
    const groupLines = lines.filter((line) => line.group === group);
    return {
      group,
      lines: groupLines,
      totalEgp: groupLines.reduce((sum, line) => sum + line.tipEgp, 0),
    };
  }).filter((entry) => entry.lines.length > 0);

  const warnings = [];
  if (totalEgp === 0) {
    warnings.push(
      "Nothing is filled in yet. Add a restaurant bill or a count of bags, nights, rides or guiding days.",
    );
  }
  if (serviceChargeOnBill && percentTotal > 0) {
    warnings.push(
      `The bill already carries a service charge of around ${TYPICAL_SERVICE_CHARGE_PCT}%, so the cash percentages above are reduced. That charge usually stays with the establishment.`,
    );
  }
  if (smallNoteTotal > 0) {
    warnings.push(
      `About ${smallNoteTotal} EGP of this is small baksheesh in notes of ${SMALL_NOTE_CEILING_EGP} EGP or less. Break large notes at the hotel before you set out — change is rarely offered.`,
    );
  }
  if (rateAdjustPct !== 0) {
    warnings.push(
      `Every fixed rate has been scaled by ${rateAdjustPct > 0 ? "+" : ""}${rateAdjustPct}% from the customary range built in.`,
    );
  }

  return {
    generosity: level.id,
    generosityLabel: level.label,
    serviceChargeOnBill,
    travellers,
    tripDays,
    rateAdjustPct,
    lines,
    byGroup,
    percentTotalEgp: percentTotal,
    unitTotalEgp: unitTotal,
    smallNoteTotalEgp: smallNoteTotal,
    totalEgp,
    perTravellerEgp,
    perDayEgp,
    homeTotal,
    homePerTraveller,
    dailyNotes: noteBreakdown(perDayEgp),
    warnings,
  };
}
