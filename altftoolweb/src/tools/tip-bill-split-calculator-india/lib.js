/**
 * Indian restaurant bill: GST, service charge, tip and the split.
 *
 * ORDER OF CALCULATION — this is what makes the total come out right:
 *
 *   1. Food and beverage subtotal
 *   2. + service charge, a percentage of the subtotal (voluntary, see below)
 *   3. = taxable value. Under section 15 of the CGST Act, 2017 the value of a
 *        supply includes any amount the supplier is liable to charge, so a
 *        service charge that appears on the bill is part of the value that GST
 *        is levied on. GST is therefore charged on subtotal + service charge.
 *   4. + GST at the applicable rate
 *   5. + tip, which is a voluntary payment directly to staff, outside the
 *        contract of supply, and carries no GST.
 *
 * GST RATES ON RESTAURANT SERVICE (Notification 11/2017-Central Tax (Rate), as
 * amended by Notification 46/2017):
 *   5%  — standalone restaurants, without input tax credit. The common case.
 *   18% — restaurants in hotels where the declared tariff of any unit of
 *         accommodation is above Rs 7,500 per day, with input tax credit.
 * Alcohol is outside GST and attracts state VAT/excise at rates that vary by
 * state, so a bar bill is entered separately here.
 *
 * SERVICE CHARGE: the Central Consumer Protection Authority's guidelines dated
 * 4 July 2022 state that no hotel or restaurant shall add a service charge
 * automatically or by default, and that it cannot be collected by any other
 * name. It is voluntary — the default here is 0 and it can be removed from a
 * bill on request.
 *
 * All functions are pure and total.
 */

/** GST rates applicable to restaurant service. */
export const GST_RESTAURANT_STANDALONE_PCT = 5;
export const GST_RESTAURANT_IN_HOTEL_PCT = 18;

/** Declared room tariff above which the 18% restaurant rate applies. */
export const HOTEL_TARIFF_THRESHOLD_INR = 7500;

export const GST_OPTIONS = [
  {
    id: "standalone",
    ratePct: GST_RESTAURANT_STANDALONE_PCT,
    label: "5% — standalone restaurant",
    hint: "The usual rate. No input tax credit to the restaurant.",
  },
  {
    id: "hotel",
    ratePct: GST_RESTAURANT_IN_HOTEL_PCT,
    label: "18% — restaurant inside a premium hotel",
    hint: `Applies where the declared room tariff exceeds Rs ${HOTEL_TARIFF_THRESHOLD_INR} a day.`,
  },
  { id: "none", ratePct: 0, label: "No GST on the bill", hint: "Unregistered or composition dealer." },
];

/** Customary tip percentages in Indian restaurants, on the pre-tax food value. */
export const TIP_PRESETS = [0, 5, 10, 15];

/** Rounding options for the per-head amount, so nobody hunts for coins. */
export const ROUNDING_OPTIONS = [0, 1, 5, 10];

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

/**
 * Build the bill total from its parts.
 *
 * @param {object} args
 * @param {number} args.foodSubtotal      food and non-alcoholic beverages, pre-tax
 * @param {number} args.alcoholSubtotal   alcohol, which is outside GST
 * @param {number} args.alcoholTaxPct     state VAT / excise on alcohol
 * @param {number} args.serviceChargePct  percentage of the food subtotal, voluntary
 * @param {number} args.gstRatePct        5, 18 or 0
 * @param {number} args.tipPct            tip percentage
 * @param {boolean} args.tipOnPreTax      tip the food value (true) or the taxed total
 * @returns {object} the costed bill, or { error }
 */
export function buildBill({
  foodSubtotal,
  alcoholSubtotal = 0,
  alcoholTaxPct = 0,
  serviceChargePct = 0,
  gstRatePct = GST_RESTAURANT_STANDALONE_PCT,
  tipPct = 0,
  tipOnPreTax = true,
}) {
  const numeric = {
    foodSubtotal,
    alcoholSubtotal,
    alcoholTaxPct,
    serviceChargePct,
    gstRatePct,
    tipPct,
  };
  for (const [key, value] of Object.entries(numeric)) {
    if (!isNum(value)) return { error: `Enter a valid number for ${key}.` };
    if (value < 0) return { error: "Amounts and rates cannot be negative." };
  }
  if (foodSubtotal + alcoholSubtotal <= 0) {
    return { error: "Enter a bill amount greater than zero." };
  }
  if (gstRatePct > 100 || alcoholTaxPct > 100) return { error: "Tax rates must be 100% or less." };
  if (serviceChargePct > 100) return { error: "Service charge cannot exceed 100% of the bill." };
  if (tipPct > 100) return { error: "A tip of more than 100% of the bill is almost certainly a typo." };

  const serviceCharge = round2((foodSubtotal * serviceChargePct) / 100);
  const gstTaxableValue = round2(foodSubtotal + serviceCharge);
  const gst = round2((gstTaxableValue * gstRatePct) / 100);
  const alcoholTax = round2((alcoholSubtotal * alcoholTaxPct) / 100);

  const preTip = round2(gstTaxableValue + gst + alcoholSubtotal + alcoholTax);
  const tipBase = tipOnPreTax ? round2(foodSubtotal + alcoholSubtotal) : preTip;
  const tip = round2((tipBase * tipPct) / 100);
  const grandTotal = round2(preTip + tip);

  return {
    foodSubtotal: round2(foodSubtotal),
    alcoholSubtotal: round2(alcoholSubtotal),
    serviceCharge,
    serviceChargePct,
    gstTaxableValue,
    gstRatePct,
    gst,
    cgst: round2(gst / 2),
    sgst: round2(gst / 2),
    alcoholTax,
    alcoholTaxPct,
    tipBase,
    tipPct,
    tip,
    preTip,
    grandTotal,
    // What every rupee of food actually costs once everything is added.
    effectiveUpliftPct:
      foodSubtotal + alcoholSubtotal > 0
        ? round2(((grandTotal - foodSubtotal - alcoholSubtotal) / (foodSubtotal + alcoholSubtotal)) * 100)
        : 0,
  };
}

/**
 * Equal split, optionally rounded up to the nearest rupee/5/10 per head.
 * The surplus created by rounding up is reported, not hidden.
 */
export function splitEqually({ grandTotal, people, roundTo = 0 }) {
  if (!isNum(grandTotal) || grandTotal < 0) return { error: "The bill total is not a valid amount." };
  if (!isNum(people)) return { error: "Enter how many people are splitting the bill." };
  if (!Number.isInteger(people) || people < 1) {
    return { error: "The number of people must be a whole number of at least 1." };
  }
  if (!isNum(roundTo) || roundTo < 0) return { error: "Rounding step must be zero or more." };

  const exact = round2(grandTotal / people);
  const perPerson = roundTo > 0 ? Math.ceil(exact / roundTo) * roundTo : exact;
  const collected = round2(perPerson * people);

  return {
    people,
    exactPerPerson: exact,
    perPerson: round2(perPerson),
    collected,
    surplus: round2(collected - grandTotal),
  };
}

/**
 * Split by what each person ordered. Service charge, GST and the tip are
 * apportioned in the same ratio as each person's share of the food bill, which
 * is how a per-item split has to work: the tax was levied on the whole value.
 * The last diner absorbs any rounding residue so the parts always re-add.
 */
export function splitByShares({ bill, shares = [], roundTo = 0 }) {
  if (!bill || bill.error) return { error: "Fix the bill inputs first." };
  if (!Array.isArray(shares) || shares.length === 0) {
    return { error: "Add at least one diner." };
  }
  if (!isNum(roundTo) || roundTo < 0) return { error: "Rounding step must be zero or more." };

  const parsed = [];
  for (const [index, person] of shares.entries()) {
    if (!isNum(person?.amount)) return { error: "Every diner needs a numeric order amount." };
    if (person.amount < 0) return { error: "An order amount cannot be negative." };
    parsed.push({
      id: person.id ?? `person-${index}`,
      name: person.name || `Diner ${index + 1}`,
      amount: round2(person.amount),
    });
  }

  const orderedTotal = round2(parsed.reduce((sum, person) => sum + person.amount, 0));
  if (orderedTotal <= 0) return { error: "The individual orders add up to zero." };

  const billedSubtotal = round2(bill.foodSubtotal + bill.alcoholSubtotal);
  const mismatch = round2(orderedTotal - billedSubtotal);

  let allocated = 0;
  const rows = parsed.map((person, index) => {
    const ratio = person.amount / orderedTotal;
    const last = index === parsed.length - 1;
    // Without rounding the last diner absorbs the residue so the parts re-add
    // exactly. With rounding every diner is rounded up independently, which
    // keeps each share proportional and can never hand anyone a negative bill.
    const raw =
      roundTo === 0 && last
        ? round2(bill.grandTotal - allocated)
        : round2(bill.grandTotal * ratio);
    const pays = roundTo > 0 ? Math.ceil(raw / roundTo) * roundTo : raw;
    allocated = round2(allocated + pays);
    return {
      ...person,
      sharePct: round2(ratio * 100),
      extras: round2(pays - person.amount),
      pays: round2(pays),
    };
  });

  const collected = round2(rows.reduce((sum, row) => sum + row.pays, 0));

  return {
    rows,
    orderedTotal,
    billedSubtotal,
    mismatch,
    collected,
    surplus: round2(collected - bill.grandTotal),
  };
}
