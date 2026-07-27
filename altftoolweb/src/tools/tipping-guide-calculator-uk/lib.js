/**
 * Customary tipping in the UK.
 *
 * British tipping is far more restrained than American tipping, because hospitality staff are paid at least the
 * statutory National Minimum Wage or National Living Wage — there is no tip credit and no sub-minimum tipped
 * wage. The tip is genuinely a bonus. The complication is the discretionary service charge, commonly 12.5%,
 * which many restaurants add automatically: it is discretionary, you may ask for it to be removed, and if you
 * leave it on then no further tip is expected. Since the Employment (Allocation of Tips) Act 2023 came into
 * force on 1 October 2024, employers must pass on 100% of tips and service charges to workers without
 * deductions, so leaving it on the card is now as good as cash.
 *
 * These are social customs, not law. Every figure below is a range that reflects common
 * practice; nothing here is an obligation, and the ranges are editable through the quality
 * selector rather than hard-coded into a single "correct" answer.
 */

export const COUNTRY = "the UK";
export const CURRENCY = "GBP";
export const LOCALE = "en-GB";

/**
 * Whether the customary percentage is worked out on the amount before taxes and any service
 * charge. In the UK the percentage is worked out on the food and drink before any discretionary service charge is added, so a 12.5% service charge and a 10% tip are never stacked on top of each other.
 */
export const TIP_ON_NET_BILL = true;

/** What is already added to a bill in the UK before you decide on a tip. */
export const SERVICE_CHARGE = {
  "common": true,
  "rate": 12.5,
  "defaultAddOnPct": 12.5,
  "note": "A discretionary service charge of 12.5% is normal in London restaurants and increasingly common elsewhere. It is discretionary — you may ask for it to be taken off — and when it stays on the bill, no further tip is expected. Since 1 October 2024 employers must pass 100% of it to staff."
};

/** Service levels. The key selects which column of a category's range is used. */
export const QUALITY_LEVELS = [
  { id: "modest", label: "Nothing extra", key: "low" },
  { id: "standard", label: "As expected (10%)", key: "typical" },
  { id: "generous", label: "Excellent (12.5%)", key: "high" },
];

/**
 * Tipping ranges by service.
 *  - type "percent"  : low/typical/high are percentages of the bill.
 *  - type "flat"     : low/typical/high are GBP amounts per unit (bag, night, person...).
 *  - type "roundup"  : the bill is rounded up to the next `step`, and the percentage floor
 *                      in low/typical/high is applied on top when it is larger.
 *  - type "none"     : tipping is not customary for this service.
 */
export const CATEGORIES = [
  {
    "id": "restaurant-table",
    "label": "Restaurant, table service",
    "type": "percent",
    "low": 0,
    "typical": 10,
    "high": 12.5,
    "serviceChargeCovers": true,
    "topUpPct": 0,
    "note": "10% is the normal tip and 12.5% is generous. Check the bill first — if a discretionary service charge is already on it, adding a second tip is doubling up."
  },
  {
    "id": "pub-bar",
    "label": "Pub, drinks at the bar",
    "type": "none",
    "low": 0,
    "typical": 0,
    "high": 0,
    "note": "No tipping for drinks bought at the bar. The British custom is to offer the bartender a drink instead — 'and one for yourself' — which is added to your round at roughly the price of a half."
  },
  {
    "id": "pub-food",
    "label": "Pub or restaurant, food brought to the table",
    "type": "percent",
    "low": 0,
    "typical": 10,
    "high": 10,
    "serviceChargeCovers": true,
    "topUpPct": 0,
    "note": "Once someone carries food to your table it becomes table service, and 10% applies."
  },
  {
    "id": "cafe-counter",
    "label": "Café or takeaway counter",
    "type": "none",
    "low": 0,
    "typical": 0,
    "high": 0,
    "note": "Not expected. The jar by the till takes spare change if you feel like it; the card terminal prompt is safe to decline."
  },
  {
    "id": "taxi",
    "label": "Black cab or private hire",
    "type": "roundup",
    "low": 0,
    "typical": 5,
    "high": 10,
    "step": 1,
    "note": "Round the fare up to the next pound. On a long airport run, 10% is generous; drivers do not expect a percentage on a short hop."
  },
  {
    "id": "food-delivery",
    "label": "Food delivery",
    "type": "percent",
    "low": 0,
    "typical": 10,
    "high": 10,
    "minTip": 1,
    "note": "£1 to £2 in cash, or about 10% through the app. Riders are usually paid per drop, so it makes a real difference in bad weather."
  },
  {
    "id": "hotel-housekeeping",
    "label": "Hotel housekeeping, per night",
    "type": "flat",
    "low": 1,
    "typical": 2,
    "high": 5,
    "unitLabel": "night",
    "note": "Entirely optional in the UK and far from universal, but £2 a night left in the room is welcomed."
  },
  {
    "id": "hotel-porter",
    "label": "Porter, per bag",
    "type": "flat",
    "low": 1,
    "typical": 2,
    "high": 5,
    "unitLabel": "bag",
    "note": "£1 to £2 a bag at a mid-range hotel, more at a luxury one."
  },
  {
    "id": "hairdresser",
    "label": "Hairdresser or barber",
    "type": "percent",
    "low": 0,
    "typical": 10,
    "high": 15,
    "note": "10% for the stylist, plus a pound or two for whoever washed your hair. Salon owners are often not tipped at all."
  },
  {
    "id": "tour-guide",
    "label": "Tour guide, per person per day",
    "type": "flat",
    "low": 5,
    "typical": 10,
    "high": 20,
    "unitLabel": "person",
    "note": "Free walking tours are tip-only — the guide pays a per-head fee to the company — so £10 per person is the realistic fare rather than a bonus."
  },
  {
    "id": "coach-driver",
    "label": "Coach driver, per person",
    "type": "flat",
    "low": 2,
    "typical": 5,
    "high": 10,
    "unitLabel": "person",
    "note": "Handed over at the end of a day trip, separate from the guide."
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
