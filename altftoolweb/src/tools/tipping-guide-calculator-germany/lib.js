/**
 * Customary tipping in Germany.
 *
 * Trinkgeld in Germany is a modest round-up, not an American-style percentage. Menu and bar prices must be
 * quoted inclusive of VAT and service under the Preisangabenverordnung (the price indication ordinance), and
 * hospitality staff are covered by the statutory Mindestlohn, so nothing is owed. The mechanics matter more
 * than the size: you do not leave money on the table and walk out. You tell the server the figure you want
 * to pay when you hand over cash or the card — 'Machen Sie 40' on a 37.20 bill — and they charge that amount.
 * Saying 'stimmt so' means keep the change.
 *
 * These are social customs, not law. Every figure below is a range that reflects common
 * practice; nothing here is an obligation, and the ranges are editable through the quality
 * selector rather than hard-coded into a single "correct" answer.
 */

export const COUNTRY = "Germany";
export const CURRENCY = "EUR";
export const LOCALE = "de-DE";

/**
 * Whether the customary percentage is worked out on the amount before taxes and any service
 * charge. German menu prices already include VAT and service by law, so the printed total is the base — there is nothing to strip out before working out Trinkgeld.
 */
export const TIP_ON_NET_BILL = false;

/** What is already added to a bill in Germany before you decide on a tip. */
export const SERVICE_CHARGE = {
  "common": false,
  "rate": 0,
  "defaultAddOnPct": 0,
  "note": "German bills carry no service charge and no separate tip line — VAT and service are already inside the menu price. Trinkgeld is a genuine extra, and it is stated out loud rather than left on the table. Cash is still preferred; many smaller Gaststätten are card-shy or cash-only."
};

/** Service levels. The key selects which column of a category's range is used. */
export const QUALITY_LEVELS = [
  { id: "modest", label: "Just round up", key: "low" },
  { id: "standard", label: "As expected (8%)", key: "typical" },
  { id: "generous", label: "Excellent (10%)", key: "high" },
];

/**
 * Tipping ranges by service.
 *  - type "percent"  : low/typical/high are percentages of the bill.
 *  - type "flat"     : low/typical/high are EUR amounts per unit (bag, night, person...).
 *  - type "roundup"  : the bill is rounded up to the next `step`, and the percentage floor
 *                      in low/typical/high is applied on top when it is larger.
 *  - type "none"     : tipping is not customary for this service.
 */
export const CATEGORIES = [
  {
    "id": "restaurant-table",
    "label": "Restaurant, table service",
    "type": "percent",
    "low": 5,
    "typical": 8,
    "high": 10,
    "note": "Round to a comfortable figure in the 5-10% band. Tell the server the total when paying ('Vierzig, bitte') rather than leaving coins behind — in Germany money left on the table can be mistaken for forgotten change."
  },
  {
    "id": "cafe-bakery",
    "label": "Café or bakery",
    "type": "roundup",
    "low": 0,
    "typical": 0,
    "high": 5,
    "step": 1,
    "note": "Round up to the next euro. On a €3.40 coffee, €3.50 or €4 is normal and nothing more is expected."
  },
  {
    "id": "bar-kneipe",
    "label": "Bar or Kneipe",
    "type": "roundup",
    "low": 0,
    "typical": 0,
    "high": 5,
    "step": 1,
    "note": "Round each round up to the next euro, or say 'stimmt so' and leave the change."
  },
  {
    "id": "taxi",
    "label": "Taxi",
    "type": "roundup",
    "low": 0,
    "typical": 5,
    "high": 10,
    "step": 1,
    "note": "Round the fare up to the next euro on a short trip; 5-10% on a long airport run or when the driver handles luggage."
  },
  {
    "id": "hotel-housekeeping",
    "label": "Hotel housekeeping, per night",
    "type": "flat",
    "low": 1,
    "typical": 2,
    "high": 5,
    "unitLabel": "night",
    "note": "Leave €1-2 per night in the room, clearly separated from your own belongings."
  },
  {
    "id": "hotel-porter",
    "label": "Porter, per bag",
    "type": "flat",
    "low": 1,
    "typical": 1,
    "high": 3,
    "unitLabel": "bag",
    "note": "€1 a bag is standard, €2-3 at a five-star hotel."
  },
  {
    "id": "hairdresser",
    "label": "Hairdresser or barber",
    "type": "percent",
    "low": 5,
    "typical": 10,
    "high": 10,
    "note": "Around 10% for the stylist, plus a euro or two for whoever washed your hair."
  },
  {
    "id": "tour-guide",
    "label": "Guided tour, per person",
    "type": "flat",
    "low": 3,
    "typical": 5,
    "high": 10,
    "unitLabel": "person",
    "note": "For a paid guided tour, €5 per person at the end is generous by German standards."
  },
  {
    "id": "free-walking-tour",
    "label": "Free walking tour, per person",
    "type": "flat",
    "low": 5,
    "typical": 10,
    "high": 15,
    "unitLabel": "person",
    "note": "These guides are paid only by tips and often owe the company a fee per head, so treat €10 per person as the ticket price rather than a gratuity."
  },
  {
    "id": "food-delivery",
    "label": "Food delivery",
    "type": "percent",
    "low": 0,
    "typical": 5,
    "high": 10,
    "minTip": 1,
    "note": "€1-2 in cash at the door is the norm; riders rarely see app tips as quickly."
  },
  {
    "id": "toilet-attendant",
    "label": "Public toilet attendant, per visit",
    "type": "flat",
    "low": 0.5,
    "typical": 0.7,
    "high": 1,
    "unitLabel": "visit",
    "note": "Attended toilets in stations, department stores and motorway stops expect 50-70 cents in the saucer. Sanifair facilities on the Autobahn charge a fixed fee and give back a voucher instead."
  }
];

/** Largest sanity bound so a typo cannot produce an absurd "recommended" tip. */
export const MAX_BILL = 1000000;
export const MAX_PARTY_SIZE = 200;
export const MAX_UNITS = 500;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function findCategory(id) {
  return CATEGORIES.find((category) => category.id === id) ?? null;
}

/** True when the tip is worked out from a bill amount rather than a count of bags or nights. */
export function isBillBased(category) {
  return category?.type === "percent" || category?.type === "roundup";
}

/** Round to whole currency minor units so a tip is never 12.333333. */
function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Work out a tip.
 *
 * @param {object} input
 * @param {string} input.categoryId        one of CATEGORIES[].id
 * @param {string} [input.quality]         one of QUALITY_LEVELS[].id
 * @param {number} [input.billAmount]      bill as printed, including any taxes and service charge
 * @param {number} [input.units]           bags, nights, people or drinks for flat-rate services
 * @param {number} [input.partySize]       people splitting the total
 * @param {number} [input.addOnPct]        percent of the printed bill that is tax + service charge
 * @param {boolean} [input.serviceChargeOnBill] a service charge is already on the bill
 * @returns {{error:string}|object}
 */
export function computeTip({
  categoryId,
  quality = "standard",
  billAmount = 0,
  units = 1,
  partySize = 1,
  addOnPct = 0,
  serviceChargeOnBill = false,
}) {
  const category = findCategory(categoryId);
  if (!category) return { error: "Pick a service from the list." };

  const level = QUALITY_LEVELS.find((item) => item.id === quality);
  if (!level) return { error: "Pick how the service went." };

  if (!isNum(partySize) || partySize < 1 || partySize > MAX_PARTY_SIZE) {
    return { error: `Party size must be between 1 and ${MAX_PARTY_SIZE} people.` };
  }
  if (!isNum(addOnPct) || addOnPct < 0 || addOnPct > 60) {
    return { error: "Taxes and service charge already on the bill must be between 0% and 60%." };
  }

  const billBased = isBillBased(category);

  if (billBased) {
    if (!isNum(billAmount) || billAmount < 0) return { error: "Enter a bill amount of zero or more." };
    if (billAmount > MAX_BILL) return { error: "That bill amount is larger than this planner handles." };
  } else if (category.type === "flat") {
    if (!isNum(units) || units < 0) return { error: `Enter how many ${category.unitLabel ? category.unitLabel + "s" : "items"} there are.` };
    if (units > MAX_UNITS) return { error: "That is more items than this planner handles." };
  }

  const netBill = billBased ? billAmount / (1 + addOnPct / 100) : 0;
  const percentBase = TIP_ON_NET_BILL ? netBill : billAmount;

  let tip = 0;
  const notes = [];
  let rateUsed = category[level.key];

  if (serviceChargeOnBill && category.serviceChargeCovers) {
    rateUsed = category.topUpPct ?? 0;
    notes.push(
      rateUsed > 0
        ? `A service charge is already on the bill, so only a ${rateUsed}% top-up is customary here.`
        : "A service charge is already on the bill — no further tip is expected.",
    );
  }

  if (category.type === "percent") {
    tip = (percentBase * rateUsed) / 100;
    if (tip > 0 && isNum(category.minTip) && tip < category.minTip) {
      tip = category.minTip;
      notes.push(`Rounded up to the customary floor of ${category.minTip} ${CURRENCY}.`);
    }
  } else if (category.type === "roundup") {
    // "Round up to the next unit": apply the percentage floor first, then round the TOTAL
    // the customer hands over up to the next step, and the tip is whatever that costs.
    const step = isNum(category.step) && category.step > 0 ? category.step : 1;
    const percentTip = (percentBase * rateUsed) / 100;
    const target = Math.ceil((billAmount + percentTip) / step) * step;
    tip = target - billAmount;
  } else if (category.type === "flat") {
    tip = rateUsed * units;
  } else {
    // type "none": tipping is not customary. The category note explains why.
    tip = 0;
  }

  tip = roundMoney(Math.max(0, tip));

  const total = billBased ? roundMoney(billAmount + tip) : tip;
  const perPerson = roundMoney(total / partySize);
  const tipPerPerson = roundMoney(tip / partySize);
  const effectiveRate = billBased && billAmount > 0 ? (tip / billAmount) * 100 : null;

  const range = ["low", "typical", "high"].map((key) => {
    const value = category[key];
    if (category.type === "percent") {
      const raw = (percentBase * value) / 100;
      if (raw > 0 && isNum(category.minTip) && raw < category.minTip) return roundMoney(category.minTip);
      return roundMoney(raw);
    }
    if (category.type === "flat") return roundMoney(value * units);
    if (category.type === "roundup") {
      const step = isNum(category.step) && category.step > 0 ? category.step : 1;
      const percentTip = (percentBase * value) / 100;
      return roundMoney(Math.ceil((billAmount + percentTip) / step) * step - billAmount);
    }
    return 0;
  });

  return {
    category,
    quality: level,
    billBased,
    billAmount: billBased ? roundMoney(billAmount) : 0,
    netBill: billBased ? roundMoney(netBill) : 0,
    addOnAmount: billBased ? roundMoney(billAmount - netBill) : 0,
    units: category.type === "flat" ? units : 1,
    rateUsed,
    tip,
    total,
    perPerson,
    tipPerPerson,
    partySize,
    effectiveRate,
    range: { low: range[0], typical: range[1], high: range[2] },
    notes: notes.filter(Boolean),
  };
}
