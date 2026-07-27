/**
 * Customary tipping in the UAE.
 *
 * Tipping in the UAE sits between the European and American habits, for one specific reason: the 10% service
 * charge printed on most restaurant and hotel bills usually goes to the venue rather than to the person who
 * served you, so a separate cash tip is still customary on top. Bills in Dubai and Abu Dhabi commonly stack a
 * service charge, a municipality fee (7% in Dubai) and 5% VAT — VAT has been in force across the UAE since
 * 1 January 2018 — which together lift the menu price by roughly a fifth before you tip at all. Dubai hotels
 * also levy a per-room, per-night Tourism Dirham fee, which is a government charge and has nothing to do with
 * service. Cash in dirhams reaches staff most reliably; card tip lines often do not.
 *
 * These are social customs, not law. Every figure below is a range that reflects common
 * practice; nothing here is an obligation, and the ranges are editable through the quality
 * selector rather than hard-coded into a single "correct" answer.
 */

export const COUNTRY = "the UAE";
export const CURRENCY = "AED";
export const LOCALE = "en-AE";

/**
 * Whether the customary percentage is worked out on the amount before taxes and any service
 * charge. UAE restaurant and hotel bills itemise a service charge, a municipality fee and 5% VAT on top of the menu price, so the percentage is worked out on the food and drink before those, not on the grand total.
 */
export const TIP_ON_NET_BILL = true;

/** What is already added to a bill in the UAE before you decide on a tip. */
export const SERVICE_CHARGE = {
  "common": true,
  "rate": 10,
  "defaultAddOnPct": 22,
  "note": "Restaurant and hotel bills in Dubai and Abu Dhabi commonly itemise a 10% service charge, a municipality fee (7% in Dubai) and 5% VAT — together roughly a 22% uplift on the menu price, depending on how the venue stacks them. The service charge normally goes to the venue rather than to your server, which is why a small cash tip is still customary on top."
};

/** Service levels. The key selects which column of a category's range is used. */
export const QUALITY_LEVELS = [
  { id: "modest", label: "Round up only", key: "low" },
  { id: "standard", label: "As expected (10%)", key: "typical" },
  { id: "generous", label: "Excellent (15%)", key: "high" },
];

/**
 * Tipping ranges by service.
 *  - type "percent"  : low/typical/high are percentages of the bill.
 *  - type "flat"     : low/typical/high are AED amounts per unit (bag, night, person...).
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
    "typical": 10,
    "high": 15,
    "serviceChargeCovers": true,
    "topUpPct": 5,
    "note": "10% of the pre-charge amount is the everyday tip. Because the printed 10% service charge usually goes to the venue, leaving 5% in cash on top is normal even when the charge is on the bill."
  },
  {
    "id": "cafe",
    "label": "Café or counter service",
    "type": "roundup",
    "low": 0,
    "typical": 0,
    "high": 10,
    "step": 5,
    "note": "Round the bill up to the next five dirhams and leave the change."
  },
  {
    "id": "taxi",
    "label": "Taxi",
    "type": "roundup",
    "low": 0,
    "typical": 0,
    "high": 10,
    "step": 5,
    "note": "Round the meter up to the next five dirhams. On a 32 dirham fare, handing over 35 and waving off the change is the standard gesture."
  },
  {
    "id": "hotel-housekeeping",
    "label": "Hotel housekeeping, per night",
    "type": "flat",
    "low": 5,
    "typical": 10,
    "high": 20,
    "unitLabel": "night",
    "note": "AED 10 a night left in the room. Leave it daily rather than in one lump, as housekeepers rotate."
  },
  {
    "id": "hotel-porter",
    "label": "Porter or bellhop, per bag",
    "type": "flat",
    "low": 5,
    "typical": 10,
    "high": 20,
    "unitLabel": "bag",
    "note": "AED 5-10 a bag at a mid-range hotel, AED 20 at a luxury one."
  },
  {
    "id": "valet",
    "label": "Valet parking, on retrieval",
    "type": "flat",
    "low": 5,
    "typical": 10,
    "high": 20,
    "unitLabel": "car",
    "note": "Tip when the car is brought back, not when you hand over the keys. Valet parking is near-universal at UAE malls and hotels."
  },
  {
    "id": "petrol-attendant",
    "label": "Petrol pump attendant",
    "type": "flat",
    "low": 0,
    "typical": 5,
    "high": 10,
    "unitLabel": "fill",
    "note": "Fuel is pumped for you across the UAE — self-service is not an option — and a few dirhams is a common courtesy, though many drivers give nothing."
  },
  {
    "id": "food-delivery",
    "label": "Food delivery",
    "type": "flat",
    "low": 5,
    "typical": 10,
    "high": 20,
    "unitLabel": "order",
    "note": "AED 5-10 in cash. Riders work long shifts in extreme summer heat and rarely see app tips promptly."
  },
  {
    "id": "spa-salon",
    "label": "Spa or salon",
    "type": "percent",
    "low": 10,
    "typical": 15,
    "high": 20,
    "serviceChargeCovers": true,
    "topUpPct": 10,
    "note": "Give it in cash directly to the therapist rather than on the card."
  },
  {
    "id": "tour-guide",
    "label": "Tour guide, per person per day",
    "type": "flat",
    "low": 20,
    "typical": 50,
    "high": 100,
    "unitLabel": "person",
    "note": "AED 50 per person for a full-day guided tour."
  },
  {
    "id": "safari-driver",
    "label": "Desert safari or coach driver, per person",
    "type": "flat",
    "low": 20,
    "typical": 50,
    "high": 100,
    "unitLabel": "person",
    "note": "Dune-bashing drivers are tipped separately from the guide, at the end of the trip."
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
