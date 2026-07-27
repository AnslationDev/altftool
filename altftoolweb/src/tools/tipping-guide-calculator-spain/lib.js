/**
 * Customary tipping in Spain.
 *
 * The Spanish propina is small, optional and often skipped entirely by locals. Prices on the menu include
 * IVA and service, hospitality staff are on a salary set by the hostelería collective agreement, and there is
 * no cultural expectation of a percentage. What Spaniards actually do is leave the coins: a euro or two after
 * a menú del día, five per cent after a proper dinner, nothing at all after a coffee at the bar. Two things
 * confuse visitors. A 'cubierto' line on the bill is a bread and cover charge that goes to the restaurant, not
 * a tip. And prices differ by where you stand: barra (at the bar) is cheapest, mesa (table) more, terraza
 * (outside) most — that surcharge is not a service charge either.
 *
 * These are social customs, not law. Every figure below is a range that reflects common
 * practice; nothing here is an obligation, and the ranges are editable through the quality
 * selector rather than hard-coded into a single "correct" answer.
 */

export const COUNTRY = "Spain";
export const CURRENCY = "EUR";
export const LOCALE = "es-ES";

/**
 * Whether the customary percentage is worked out on the amount before taxes and any service
 * charge. Spanish menu prices already include IVA, and service charges are rare, so the printed total is the base for the small propina locals leave.
 */
export const TIP_ON_NET_BILL = false;

/** What is already added to a bill in Spain before you decide on a tip. */
export const SERVICE_CHARGE = {
  "common": false,
  "rate": 0,
  "defaultAddOnPct": 0,
  "note": "Spanish bills almost never carry a service charge, and IVA is already inside the menu price. A 'cubierto' or bread line is a charge for bread and covers, not a gratuity, and the higher terraza price for sitting outside is a price difference rather than service. Cash coins are the usual way to leave a propina — card terminals rarely offer a tip prompt."
};

/** Service levels. The key selects which column of a category's range is used. */
export const QUALITY_LEVELS = [
  { id: "modest", label: "Just the coins", key: "low" },
  { id: "standard", label: "As expected (5%)", key: "typical" },
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
    "label": "Restaurant, sit-down dinner",
    "type": "percent",
    "low": 0,
    "typical": 5,
    "high": 10,
    "note": "5% is generous in a neighbourhood restaurant and 10% is reserved for a special meal with attentive service. Leaving nothing after an ordinary lunch is completely normal and not read as a complaint."
  },
  {
    "id": "menu-del-dia",
    "label": "Menú del día",
    "type": "roundup",
    "low": 0,
    "typical": 0,
    "high": 5,
    "step": 1,
    "note": "Round the bill up to the next euro, or leave the coins from your change. On a €14 weekday menu, one euro is plenty."
  },
  {
    "id": "tapas-bar",
    "label": "Tapas bar or drinks",
    "type": "roundup",
    "low": 0,
    "typical": 0,
    "high": 5,
    "step": 1,
    "note": "Leave the small change on the bar. Nothing at all is normal, especially at the barra where prices are already lower."
  },
  {
    "id": "cafe",
    "label": "Café, per visit",
    "type": "flat",
    "low": 0,
    "typical": 0.2,
    "high": 1,
    "unitLabel": "visit",
    "note": "Twenty cents to a euro left in the saucer. Most Spaniards leave nothing for a takeaway coffee."
  },
  {
    "id": "taxi",
    "label": "Taxi",
    "type": "roundup",
    "low": 0,
    "typical": 0,
    "high": 5,
    "step": 1,
    "note": "Round the meter up to the next euro. Airport journeys in Madrid and Barcelona are on a fixed tariff, and no tip is expected on top."
  },
  {
    "id": "hotel-housekeeping",
    "label": "Hotel housekeeping, per night",
    "type": "flat",
    "low": 1,
    "typical": 1,
    "high": 3,
    "unitLabel": "night",
    "note": "€1 a night in the room, more at a five-star hotel. Not universal, but always welcome."
  },
  {
    "id": "hotel-porter",
    "label": "Porter, per bag",
    "type": "flat",
    "low": 1,
    "typical": 1,
    "high": 2,
    "unitLabel": "bag",
    "note": "One euro a bag covers it outside luxury hotels."
  },
  {
    "id": "tour-guide",
    "label": "Guided tour, per person",
    "type": "flat",
    "low": 3,
    "typical": 5,
    "high": 10,
    "unitLabel": "person",
    "note": "€5 per person at the end of a half-day paid tour is generous by Spanish standards."
  },
  {
    "id": "free-walking-tour",
    "label": "Free walking tour, per person",
    "type": "flat",
    "low": 5,
    "typical": 10,
    "high": 15,
    "unitLabel": "person",
    "note": "The guide is paid only from tips and usually owes the operator a fee for every person on the walk, so €10 per person is the real ticket price."
  },
  {
    "id": "hairdresser",
    "label": "Hairdresser or barber",
    "type": "percent",
    "low": 0,
    "typical": 5,
    "high": 10,
    "note": "Rounding up is normal; a percentage is not expected."
  },
  {
    "id": "food-delivery",
    "label": "Food delivery",
    "type": "flat",
    "low": 1,
    "typical": 2,
    "high": 3,
    "unitLabel": "order",
    "note": "A euro or two in coins at the door."
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
