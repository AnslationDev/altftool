/**
 * India tipping model.
 *
 * The Indian case has one feature no other country's tipping guide has: a
 * consumer-protection rule about service charge. The Central Consumer
 * Protection Authority's guidelines dated 4 July 2022 state that hotels and
 * restaurants shall not add a service charge automatically or by default to the
 * food bill, shall not collect it under any other name, shall not make it a
 * condition of entry or service, and shall not add it to the bill and then levy
 * GST on the total. A tip is what the diner decides to leave afterwards, and it
 * is separate from that charge.
 *
 * The second rule that matters is GST. Standard restaurants are taxed at 5%
 * without input tax credit; restaurants inside a hotel where any room is
 * declared above the specified tariff threshold are taxed at 18%. A tip is
 * customarily worked out on the food-and-drink subtotal before GST, never on
 * the grand total.
 *
 * Everything else in India is fixed cash baksheesh — per bag, per night, per
 * ride, per day — with no percentage involved. Both mechanisms are modelled
 * here, along with a note-denomination plan, because most of these payments are
 * made in cash and exact change is often not available.
 *
 * Pure functions only: no clock, no network, no DOM.
 */

/** GST on standard restaurant supply, without input tax credit. */
export const GST_STANDARD_PCT = 5;

/**
 * GST where the restaurant is located in a hotel with a declared room tariff
 * above the specified threshold. The tariff threshold has been Rs 7,500 per
 * unit per day.
 */
export const GST_PREMIUM_HOTEL_PCT = 18;
export const PREMIUM_HOTEL_TARIFF_INR = 7500;

/** Date of the CCPA guidelines that stopped default service charges. */
export const CCPA_GUIDELINE_DATE = "4 July 2022";

/** National consumer helpline number for a wrongly levied service charge. */
export const CONSUMER_HELPLINE = "1915";

/** Indian notes and coins in circulation, largest first. */
export const INR_DENOMINATIONS = [500, 200, 100, 50, 20, 10, 5, 2, 1];

/** Anything at or below this is a small-change tip needing loose notes. */
export const SMALL_NOTE_CEILING_INR = 50;

/** Tips at or above this value are rounded to the nearest 10 rupees. */
export const CASH_ROUNDING_THRESHOLD_INR = 50;

export const MAX_TRAVELLERS = 60;
export const MAX_TRIP_DAYS = 365;
export const MAX_BILL_INR = 10_000_000;
export const MAX_UNITS = 999;
export const MAX_RATE_ADJUST_PCT = 400;
export const MIN_RATE_ADJUST_PCT = -80;

export const GENEROSITY_LEVELS = [
  { id: "low", label: "Modest", note: "The bottom of what is commonly given." },
  { id: "typical", label: "Customary", note: "What most people in Indian cities actually leave." },
  { id: "high", label: "Generous", note: "Upper end, or for genuinely good service." },
];

export const GST_BANDS = [
  {
    id: "standard",
    label: `Standard restaurant — ${GST_STANDARD_PCT}% GST`,
    pct: GST_STANDARD_PCT,
    note: "Most standalone restaurants, cafés and takeaway counters.",
  },
  {
    id: "premium",
    label: `Restaurant in a hotel above the tariff threshold — ${GST_PREMIUM_HOTEL_PCT}% GST`,
    pct: GST_PREMIUM_HOTEL_PCT,
    note: `Applies where a room in the hotel is declared above Rs ${PREMIUM_HOTEL_TARIFF_INR} per day.`,
  },
];

/**
 * Bill-based services, as a percentage of the pre-GST subtotal. India tips
 * lower than the United States and higher than East Asia; 10% is the common
 * anchor in metro restaurants and many people simply round the bill up.
 */
export const PERCENT_SERVICES = [
  {
    id: "restaurant",
    group: "Eating and drinking",
    label: "Sit-down restaurant bill",
    unitLabel: "food and drink subtotal, before GST",
    low: 5,
    typical: 10,
    high: 15,
    note: "Leave it in cash on the table. If a service charge appears on the bill you may ask for it to be removed, and the tip is a separate decision either way.",
  },
  {
    id: "bar",
    group: "Eating and drinking",
    label: "Bar or pub tab",
    unitLabel: "tab subtotal, before GST",
    low: 5,
    typical: 10,
    high: 12,
    note: "Per-round tipping is unusual; settle it once at the end.",
  },
  {
    id: "salon",
    group: "Eating and drinking",
    label: "Salon or spa bill",
    unitLabel: "treatment price, before GST",
    low: 5,
    typical: 10,
    high: 15,
    note: "Give it to the stylist or therapist directly rather than at the till.",
  },
];

/**
 * Fixed cash tips in rupees per unit. These reflect metro and tourist-facing
 * norms; smaller towns run lower.
 */
export const UNIT_SERVICES = [
  {
    id: "porter",
    each: "bag",
    group: "Hotels",
    label: "Hotel bellhop",
    unitLabel: "bags carried",
    low: 20,
    typical: 50,
    high: 100,
    note: "Per bag. A single cabin bag you can wheel yourself does not need one.",
  },
  {
    id: "housekeeping",
    each: "night",
    group: "Hotels",
    label: "Housekeeping",
    unitLabel: "nights",
    low: 50,
    typical: 100,
    high: 200,
    note: "Leave it daily in the room rather than in one lump at checkout.",
  },
  {
    id: "roomService",
    each: "delivery",
    group: "Hotels",
    label: "Room service delivery",
    unitLabel: "deliveries",
    low: 20,
    typical: 50,
    high: 100,
    note: "Even where the room service bill already carries a delivery charge.",
  },
  {
    id: "valet",
    each: "retrieval",
    group: "Hotels",
    label: "Valet parking",
    unitLabel: "car retrievals",
    low: 20,
    typical: 50,
    high: 100,
    note: "On collection rather than on handing the car over.",
  },
  {
    id: "auto",
    each: "ride",
    group: "Getting around",
    label: "Auto-rickshaw",
    unitLabel: "rides",
    low: 0,
    typical: 10,
    high: 20,
    note: "Round the metered fare up to the next Rs 10 rather than adding a percentage. Nothing is expected on a negotiated fare.",
  },
  {
    id: "cab",
    each: "ride",
    group: "Getting around",
    label: "App cab or taxi",
    unitLabel: "rides",
    low: 0,
    typical: 20,
    high: 50,
    note: "Not expected on a fixed app fare, but usual for luggage help or a long wait.",
  },
  {
    id: "driver",
    each: "day",
    group: "Getting around",
    label: "Hired car with driver",
    unitLabel: "days",
    low: 200,
    typical: 300,
    high: 500,
    note: "Per day, paid to the driver directly and separate from the agency's bill.",
  },
  {
    id: "coolie",
    each: "piece",
    group: "Getting around",
    label: "Railway station porter (coolie)",
    unitLabel: "pieces of luggage",
    low: 100,
    typical: 150,
    high: 250,
    note: "Licensed porters have official station rates, but the price is negotiated in practice — agree it on the platform before he lifts anything.",
  },
  {
    id: "guide",
    each: "guiding day",
    group: "Guides and sites",
    label: "Licensed tour guide",
    unitLabel: "guiding days",
    low: 300,
    typical: 500,
    high: 1000,
    note: "Per day for the whole party, on top of the guiding fee.",
  },
  {
    id: "shoeStand",
    each: "visit",
    group: "Guides and sites",
    label: "Temple or mosque shoe stand",
    unitLabel: "visits",
    low: 10,
    typical: 20,
    high: 30,
    note: "Many stands are free; the coin is a courtesy, and a token is usually given for your shoes.",
  },
  {
    id: "boatman",
    each: "trip",
    group: "Guides and sites",
    label: "Boatman — Varanasi, Kerala, Dal Lake",
    unitLabel: "boat trips",
    low: 50,
    typical: 100,
    high: 200,
    note: "Per boat, over and above the agreed hire.",
  },
  {
    id: "delivery",
    each: "delivery",
    group: "Everyday",
    label: "Food delivery rider",
    unitLabel: "deliveries",
    low: 20,
    typical: 30,
    high: 50,
    note: "In-app tipping reaches the rider; more in heavy rain or on a high floor without a lift.",
  },
  {
    id: "grocery",
    each: "delivery",
    group: "Everyday",
    label: "Grocery or quick-commerce delivery",
    unitLabel: "deliveries",
    low: 10,
    typical: 20,
    high: 40,
    note: "Heavier orders and water cans deserve the upper end.",
  },
  {
    id: "barber",
    each: "visit",
    group: "Everyday",
    label: "Barber",
    unitLabel: "visits",
    low: 20,
    typical: 50,
    high: 100,
    note: "Where a percentage would come to less than Rs 20, a round number is more usual.",
  },
  {
    id: "fuel",
    each: "fill",
    group: "Everyday",
    label: "Fuel pump attendant",
    unitLabel: "fills",
    low: 0,
    typical: 10,
    high: 20,
    note: "Entirely optional, and usual only when the windscreen or tyre pressure is checked too.",
  },
  {
    id: "helper",
    each: "helper",
    group: "Everyday",
    label: "Movers, plumbers, electricians on a job",
    unitLabel: "helpers on the job",
    low: 50,
    typical: 100,
    high: 200,
    note: "Per person on the crew at the end of the work, separate from the contractor's invoice.",
  },
];

export const SERVICE_GROUPS = [
  "Eating and drinking",
  "Hotels",
  "Getting around",
  "Guides and sites",
  "Everyday",
];

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const isCount = (v) => isNum(v) && v >= 0 && Number.isInteger(v);

/** Round to whole rupees, or to the nearest 10 once the amount is cash-sized. */
export function roundCashInr(value) {
  if (!isNum(value) || value <= 0) return 0;
  if (value < CASH_ROUNDING_THRESHOLD_INR) return Math.round(value);
  return Math.round(value / 10) * 10;
}

/**
 * Greedy breakdown of an amount into Indian notes and coins, largest first.
 */
export function noteBreakdown(amountInr) {
  if (!isNum(amountInr) || amountInr <= 0) return [];
  let remaining = Math.round(amountInr);
  const out = [];
  for (const denomination of INR_DENOMINATIONS) {
    const count = Math.floor(remaining / denomination);
    if (count > 0) {
      out.push({ denomination, count });
      remaining -= count * denomination;
    }
  }
  return out;
}

/**
 * What a restaurant bill comes to with GST, and what it would wrongly come to
 * if a service charge were added and taxed — the pattern the CCPA guidelines
 * of 4 July 2022 prohibit.
 *
 * @param {number} subtotalInr food and drink before tax
 * @param {string} gstBandId "standard" or "premium"
 * @param {number} serviceChargePct a charge the restaurant has added, if any
 */
export function restaurantBill(subtotalInr, gstBandId = "standard", serviceChargePct = 0) {
  const band = GST_BANDS.find((entry) => entry.id === gstBandId);
  if (!band) return { error: "Choose a GST band for the restaurant." };
  if (!isNum(subtotalInr) || subtotalInr < 0) {
    return { error: "Enter the bill subtotal as a number of zero or more." };
  }
  if (!isNum(serviceChargePct) || serviceChargePct < 0 || serviceChargePct > 100) {
    return { error: "The service charge must be between 0% and 100%." };
  }
  const serviceCharge = Math.round((subtotalInr * serviceChargePct) / 100);
  const gstOnFood = Math.round((subtotalInr * band.pct) / 100);
  // What the restaurant would charge if it taxed the service charge too — the
  // combination the guidelines specifically call out.
  const gstIfChargeTaxed = Math.round(((subtotalInr + serviceCharge) * band.pct) / 100);
  return {
    subtotal: Math.round(subtotalInr),
    gstPct: band.pct,
    gstOnFood,
    serviceCharge,
    payableWithoutServiceCharge: Math.round(subtotalInr) + gstOnFood,
    billedWithServiceCharge: Math.round(subtotalInr) + serviceCharge + gstIfChargeTaxed,
    overchargeIfNotRemoved: serviceCharge + gstIfChargeTaxed - gstOnFood,
    serviceChargeIsOptional: true,
  };
}

/** Scale a base rate by the adjustment percentage and round it back to cash. */
function adjust(rate, adjustPct) {
  return roundCashInr((rate * (100 + adjustPct)) / 100);
}

/**
 * Build the full tipping plan for a trip or a month in India.
 *
 * @returns {object} the plan, or { error }
 */
export function buildTipPlan({
  generosity = "typical",
  gstBandId = "standard",
  serviceChargePct = 0,
  travellers = 1,
  tripDays = 1,
  rateAdjustPct = 0,
  entries = {},
  inrPerHomeUnit = 0,
} = {}) {
  const level = GENEROSITY_LEVELS.find((entry) => entry.id === generosity);
  if (!level) return { error: "Choose a modest, customary or generous level." };
  const band = GST_BANDS.find((entry) => entry.id === gstBandId);
  if (!band) return { error: "Choose a GST band for the restaurant." };

  if (!isCount(travellers) || travellers < 1) {
    return { error: "Enter at least one traveller as a whole number." };
  }
  if (travellers > MAX_TRAVELLERS) return { error: `Enter ${MAX_TRAVELLERS} travellers or fewer.` };
  if (!isCount(tripDays) || tripDays < 1) {
    return { error: "Enter the trip length as a whole number of days, at least one." };
  }
  if (tripDays > MAX_TRIP_DAYS) return { error: `Enter ${MAX_TRIP_DAYS} days or fewer.` };
  if (!isNum(serviceChargePct) || serviceChargePct < 0 || serviceChargePct > 100) {
    return { error: "The service charge must be between 0% and 100%." };
  }
  if (
    !isNum(rateAdjustPct) ||
    rateAdjustPct < MIN_RATE_ADJUST_PCT ||
    rateAdjustPct > MAX_RATE_ADJUST_PCT
  ) {
    return {
      error: `The rate adjustment must be between ${MIN_RATE_ADJUST_PCT}% and ${MAX_RATE_ADJUST_PCT}%.`,
    };
  }
  if (!isNum(inrPerHomeUnit) || inrPerHomeUnit < 0) {
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
    if (bill > MAX_BILL_INR) {
      return { error: `${service.label} looks mistyped — keep it under Rs ${MAX_BILL_INR}.` };
    }
    if (bill === 0) continue;

    const pct = service[level.id];
    const tip = roundCashInr((bill * pct) / 100);
    percentTotal += tip;
    lines.push({
      id: service.id,
      group: service.group,
      label: service.label,
      basis: `${pct}% of Rs ${Math.round(bill)}`,
      rateLabel: `${pct}% of the pre-GST subtotal`,
      quantity: Math.round(bill),
      tipInr: tip,
      note: service.note,
      kind: "percent",
    });
  }

  for (const service of UNIT_SERVICES) {
    const raw = entries[service.id];
    const units = raw === undefined || raw === null || raw === "" ? 0 : Number(raw);
    if (!isCount(units)) {
      return {
        error: `Enter a whole number of ${service.unitLabel} for ${service.label.toLowerCase()}.`,
      };
    }
    if (units > MAX_UNITS) {
      return { error: `${service.label}: enter ${MAX_UNITS} ${service.unitLabel} or fewer.` };
    }
    if (units === 0) continue;

    const rate = adjust(service[level.id], rateAdjustPct);
    const tip = rate * units;
    unitTotal += tip;
    if (rate > 0 && rate <= SMALL_NOTE_CEILING_INR) smallNoteTotal += tip;
    lines.push({
      id: service.id,
      group: service.group,
      label: service.label,
      basis: `${units} x Rs ${rate}`,
      rateLabel: `Rs ${rate} per ${service.each}`,
      quantity: units,
      tipInr: tip,
      note: service.note,
      kind: "unit",
    });
  }

  const totalInr = percentTotal + unitTotal;
  const perTravellerInr = Math.round(totalInr / travellers);
  const perDayInr = Math.round(totalInr / tripDays);
  const homeTotal = inrPerHomeUnit > 0 ? Math.round((totalInr / inrPerHomeUnit) * 100) / 100 : null;
  const homePerTraveller =
    inrPerHomeUnit > 0 ? Math.round((perTravellerInr / inrPerHomeUnit) * 100) / 100 : null;

  const byGroup = SERVICE_GROUPS.map((group) => {
    const groupLines = lines.filter((line) => line.group === group);
    return {
      group,
      lines: groupLines,
      totalInr: groupLines.reduce((sum, line) => sum + line.tipInr, 0),
    };
  }).filter((entry) => entry.lines.length > 0);

  const restaurantSubtotal = Number(entries.restaurant) || 0;
  const billCheck =
    restaurantSubtotal > 0 ? restaurantBill(restaurantSubtotal, band.id, serviceChargePct) : null;

  const warnings = [];
  if (totalInr === 0) {
    warnings.push(
      "Nothing is filled in yet. Add a restaurant subtotal or a count of bags, nights, rides or guiding days.",
    );
  }
  if (serviceChargePct > 0 && billCheck && !billCheck.error) {
    warnings.push(
      `A ${serviceChargePct}% service charge plus GST on it adds about Rs ${billCheck.overchargeIfNotRemoved} to this bill. Under the CCPA guidelines of ${CCPA_GUIDELINE_DATE} it cannot be added by default, and you can ask for it to be removed before paying.`,
    );
  }
  if (smallNoteTotal > 0) {
    warnings.push(
      `About Rs ${smallNoteTotal} of this is small change of Rs ${SMALL_NOTE_CEILING_INR} or less per payment. Keep Rs 10, 20 and 50 notes aside — auto drivers and attendants rarely have change.`,
    );
  }
  if (rateAdjustPct !== 0) {
    warnings.push(
      `Every fixed rate has been scaled by ${rateAdjustPct > 0 ? "+" : ""}${rateAdjustPct}% from the built-in range.`,
    );
  }

  return {
    generosity: level.id,
    generosityLabel: level.label,
    gstBandId: band.id,
    gstPct: band.pct,
    serviceChargePct,
    travellers,
    tripDays,
    rateAdjustPct,
    lines,
    byGroup,
    billCheck,
    percentTotalInr: percentTotal,
    unitTotalInr: unitTotal,
    smallNoteTotalInr: smallNoteTotal,
    totalInr,
    perTravellerInr,
    perDayInr,
    homeTotal,
    homePerTraveller,
    dailyNotes: noteBreakdown(perDayInr),
    warnings,
  };
}
