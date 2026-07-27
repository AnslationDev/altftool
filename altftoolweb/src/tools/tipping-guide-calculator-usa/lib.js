/**
 * Customary tipping in the USA.
 *
 * Tipping in the United States is not a bonus, it is most of the take-home pay. Under section 3(m) of the
 * Fair Labor Standards Act an employer may take a tip credit and pay a tipped employee a cash wage as low
 * as $2.13 an hour, provided tips bring the worker up to the federal minimum wage of $7.25 an hour. Many
 * states set higher floors, and a handful require full minimum wage before tips, but in most of the country
 * the restaurant tip is the wage. That is why US ranges are far higher than European ones.
 *
 * These are social customs, not law. Every figure below is a range that reflects common
 * practice; nothing here is an obligation, and the ranges are editable through the quality
 * selector rather than hard-coded into a single "correct" answer.
 */

export const COUNTRY = "the USA";
export const CURRENCY = "USD";
export const LOCALE = "en-US";

/**
 * Whether the customary percentage is worked out on the amount before taxes and any service
 * charge. In the US the long-standing convention is to tip on the pre-tax subtotal, because sales tax varies from 0% in Delaware to over 9% combined in parts of Louisiana and Tennessee and has nothing to do with service.
 */
export const TIP_ON_NET_BILL = true;

/** What is already added to a bill in the USA before you decide on a tip. */
export const SERVICE_CHARGE = {
  "common": false,
  "rate": 0,
  "defaultAddOnPct": 8,
  "note": "Most US bills carry no service charge, but many restaurants add an automatic gratuity of 18-20% for parties of six or more, and some cities now add a surcharge for healthcare or kitchen pay. Read the bill before adding anything: if an automatic gratuity is already there, the tip line is optional."
};

/** Service levels. The key selects which column of a category's range is used. */
export const QUALITY_LEVELS = [
  { id: "modest", label: "Below par (15%)", key: "low" },
  { id: "standard", label: "As expected (18%)", key: "typical" },
  { id: "generous", label: "Excellent (20%)", key: "high" },
];

/**
 * Tipping ranges by service.
 *  - type "percent"  : low/typical/high are percentages of the bill.
 *  - type "flat"     : low/typical/high are USD amounts per unit (bag, night, person...).
 *  - type "roundup"  : the bill is rounded up to the next `step`, and the percentage floor
 *                      in low/typical/high is applied on top when it is larger.
 *  - type "none"     : tipping is not customary for this service.
 */
export const CATEGORIES = [
  {
    "id": "restaurant-table",
    "label": "Restaurant, table service",
    "type": "percent",
    "low": 15,
    "typical": 18,
    "high": 20,
    "serviceChargeCovers": true,
    "topUpPct": 0,
    "note": "15% is the floor for acceptable service, 18% is the everyday norm and 20% is standard in big cities. Work it out on the subtotal before sales tax."
  },
  {
    "id": "restaurant-counter",
    "label": "Counter service and coffee",
    "type": "percent",
    "low": 0,
    "typical": 10,
    "high": 15,
    "note": "Optional. The card terminal will suggest 15-25% for handing you a coffee; dropping change in the jar or skipping it entirely is normal and not rude."
  },
  {
    "id": "bar-drink",
    "label": "Bar, per drink",
    "type": "flat",
    "low": 1,
    "typical": 2,
    "high": 3,
    "unitLabel": "drink",
    "note": "$1 for a beer or a pour of wine, $2 for a cocktail that took work. If you run a tab, 18-20% of the tab is the alternative."
  },
  {
    "id": "food-delivery",
    "label": "Food delivery",
    "type": "percent",
    "low": 10,
    "typical": 15,
    "high": 20,
    "minTip": 5,
    "note": "Never tip less than about $5 on a delivery, however small the order — the driver's pay depends on it and platforms show the tip before the driver accepts."
  },
  {
    "id": "taxi-rideshare",
    "label": "Taxi or rideshare",
    "type": "percent",
    "low": 10,
    "typical": 15,
    "high": 20,
    "note": "Round the total up to the next dollar, and add a couple of dollars if the driver handled luggage."
  },
  {
    "id": "hotel-housekeeping",
    "label": "Hotel housekeeping, per night",
    "type": "flat",
    "low": 2,
    "typical": 3,
    "high": 5,
    "unitLabel": "night",
    "note": "Leave it daily in an envelope or with a note rather than in one lump at the end — housekeepers rotate rooms and the person on your last day may not be the one who cleaned all week."
  },
  {
    "id": "hotel-porter",
    "label": "Bellhop or porter, per bag",
    "type": "flat",
    "low": 1,
    "typical": 2,
    "high": 5,
    "unitLabel": "bag",
    "note": "$2 a bag is the working rate, with a minimum of about $5 however light you travel."
  },
  {
    "id": "valet",
    "label": "Valet parking, on retrieval",
    "type": "flat",
    "low": 2,
    "typical": 5,
    "high": 10,
    "unitLabel": "car",
    "note": "Tip when the car comes back, not when you hand it over."
  },
  {
    "id": "hair-spa",
    "label": "Hair salon, barber or spa",
    "type": "percent",
    "low": 15,
    "typical": 18,
    "high": 20,
    "note": "Tip each person who worked on you; at a salon that can mean splitting between the stylist and the assistant who washed."
  },
  {
    "id": "tour-guide",
    "label": "Tour guide, per person per half day",
    "type": "flat",
    "low": 5,
    "typical": 10,
    "high": 20,
    "unitLabel": "person",
    "note": "For a priced tour, 15-20% of the ticket price is the alternative benchmark. Free walking tours are tip-only, so treat $10-20 per person as the fare."
  },
  {
    "id": "coach-driver",
    "label": "Coach or shuttle driver, per person",
    "type": "flat",
    "low": 2,
    "typical": 5,
    "high": 10,
    "unitLabel": "person",
    "note": "Given at the end of the day, separately from the guide's tip."
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
