/**
 * Customary tipping in Singapore.
 *
 * Singapore is one of the few places where the honest answer is: do not tip. Full-service restaurants and
 * hotels quote prices '++', meaning a 10% service charge and 9% GST are added at the till — GST rose from 8%
 * to 9% on 1 January 2024, and the service charge is compounded before GST, so a nett price is 1.10 x 1.09 =
 * about 19.9% above the menu figure. That service charge is the tip, and it is already on the bill. Hawker
 * centres and food courts charge the price on the sign with nothing added and nothing expected. Tipping is
 * explicitly not permitted at Changi Airport, and taxi drivers work to a metered fare with no gratuity built
 * into the culture. The exceptions are narrow: private tour guides and porters at luxury hotels.
 *
 * These are social customs, not law. Every figure below is a range that reflects common
 * practice; nothing here is an obligation, and the ranges are editable through the quality
 * selector rather than hard-coded into a single "correct" answer.
 */

export const COUNTRY = "Singapore";
export const CURRENCY = "SGD";
export const LOCALE = "en-SG";

/**
 * Whether the customary percentage is worked out on the amount before taxes and any service
 * charge. Singapore restaurant menus quote prices '++', meaning a 10% service charge and then 9% GST are added at the till, so any amount you choose to add is worked out on the menu price before those.
 */
export const TIP_ON_NET_BILL = true;

/** What is already added to a bill in Singapore before you decide on a tip. */
export const SERVICE_CHARGE = {
  "common": true,
  "rate": 10,
  "defaultAddOnPct": 19.9,
  "note": "Prices quoted '++' at restaurants and hotels mean a 10% service charge is added, then 9% GST on top of that — a combined uplift of about 19.9% on the menu price. GST rose to 9% on 1 January 2024. The service charge is the gratuity, so nothing further is expected. Prices marked 'nett' already include both."
};

/** Service levels. The key selects which column of a category's range is used. */
export const QUALITY_LEVELS = [
  { id: "modest", label: "Nothing (the norm)", key: "low" },
  { id: "standard", label: "Round up", key: "typical" },
  { id: "generous", label: "Exceptional service", key: "high" },
];

/**
 * Tipping ranges by service.
 *  - type "percent"  : low/typical/high are percentages of the bill.
 *  - type "flat"     : low/typical/high are SGD amounts per unit (bag, night, person...).
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
    "typical": 0,
    "high": 5,
    "serviceChargeCovers": true,
    "topUpPct": 0,
    "note": "Nothing is expected. The 10% service charge on the bill is the gratuity. Rounding the total up, or leaving up to 5% after genuinely exceptional service, is the most anyone does."
  },
  {
    "id": "hawker-centre",
    "label": "Hawker centre or food court",
    "type": "none",
    "low": 0,
    "typical": 0,
    "high": 0,
    "note": "Never. The price on the sign is the price, there is no service charge and no GST is added at most stalls. Returning your own tray is the expected courtesy instead."
  },
  {
    "id": "cafe-counter",
    "label": "Café or takeaway counter",
    "type": "none",
    "low": 0,
    "typical": 0,
    "high": 0,
    "note": "Not customary. Tip jars are rare and the card terminal will not prompt you."
  },
  {
    "id": "taxi",
    "label": "Taxi or private hire",
    "type": "none",
    "low": 0,
    "typical": 0,
    "high": 0,
    "note": "Not expected. Metered fares already carry surcharges for peak hours, airport pickups and CBD entry, and drivers frequently round the fare down rather than up."
  },
  {
    "id": "hotel-porter",
    "label": "Porter at a luxury hotel, per bag",
    "type": "flat",
    "low": 0,
    "typical": 2,
    "high": 5,
    "unitLabel": "bag",
    "note": "One of the few genuine exceptions. SGD 2-5 a bag at a five-star hotel is appreciated but not expected."
  },
  {
    "id": "hotel-housekeeping",
    "label": "Hotel housekeeping, per night",
    "type": "flat",
    "low": 0,
    "typical": 2,
    "high": 5,
    "unitLabel": "night",
    "note": "Not customary and frequently declined. If you want to leave something, SGD 2-5 per night in the room is the range."
  },
  {
    "id": "hotel-concierge",
    "label": "Concierge, for a special request",
    "type": "flat",
    "low": 0,
    "typical": 10,
    "high": 20,
    "unitLabel": "request",
    "note": "Only when they have secured something genuinely difficult, such as a table at a fully booked restaurant."
  },
  {
    "id": "private-tour-guide",
    "label": "Private tour guide, per person per day",
    "type": "flat",
    "low": 10,
    "typical": 20,
    "high": 50,
    "unitLabel": "person",
    "note": "The clearest exception to the no-tipping norm, largely because the clientele is international. Licensed guides on a group tour expect less."
  },
  {
    "id": "spa-massage",
    "label": "Spa or massage",
    "type": "percent",
    "low": 0,
    "typical": 0,
    "high": 10,
    "serviceChargeCovers": true,
    "topUpPct": 0,
    "note": "A 10% service charge is normally on the bill already. Anything extra goes directly to the therapist in cash."
  },
  {
    "id": "food-delivery",
    "label": "Food delivery",
    "type": "flat",
    "low": 0,
    "typical": 2,
    "high": 5,
    "unitLabel": "order",
    "note": "Optional. The apps offer a tip field; a couple of dollars in heavy rain is a kind gesture rather than an expectation."
  },
  {
    "id": "changi-airport",
    "label": "Changi Airport staff",
    "type": "none",
    "low": 0,
    "typical": 0,
    "high": 0,
    "note": "Tipping is not permitted at Changi Airport. Staff will decline it, and offering can put them in an awkward position."
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
