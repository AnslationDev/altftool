/**
 * Bangkok trip budget breakdown, for a traveller paying from India.
 *
 * A foreign trip has two halves that behave differently and must not be added up in one
 * currency by accident:
 *
 *   Booked in India, in rupees   -> return airfare, visa/e-visa fee, travel insurance
 *   Spent in Thailand, in baht   -> room, food, transport, activities, shopping
 *
 * The baht half is converted once, at the rate the traveller actually gets, and then a forex
 * markup is applied because almost nobody converts at the mid-market rate: an Indian debit or
 * credit card abroad typically carries a 3–3.5% cross-currency markup plus GST on that markup,
 * a prepaid forex card is loaded at roughly 1–2% over mid-market, and money-changer cash sits
 * somewhere in between.
 *
 * The arithmetic:
 *
 *   days   = nights + 1                         (a 4-night trip is 5 days on the ground)
 *   rooms  = ceil(travellers / people per room) (half a room cannot be booked)
 *
 *   stay        (THB) = rooms x nights x room rate x season factor
 *   food        (THB) = travellers x days x food per person per day
 *   transport   (THB) = travellers x days x transport per person per day
 *   activities  (THB) = travellers x days x activities per person per day
 *   shopping    (THB) = travellers x shopping per person                (one-off)
 *
 *   on-ground (INR) = on-ground (THB) x rate x (1 + markup%)
 *   flights   (INR) = travellers x return fare
 *   entry     (INR) = travellers x (visa fee + insurance)
 *   total     (INR) = (flights + entry + on-ground) x (1 + contingency%)
 *
 * The season factor is applied to the room rate only. Bangkok hotel rates swing with the cool
 * season and the Songkran/New Year peaks; flight and food prices move far less.
 */

/** Thailand's standard VAT rate, included in the shelf price of goods. */
export const THAILAND_VAT_PERCENT = 7;

/**
 * VAT Refund for Tourists scheme thresholds, in baht. Goods must be bought at a shop displaying
 * the "VAT Refund for Tourists" sign, the purchase must be at least 2,000 baht per shop per day,
 * the trip total claimed must be at least 5,000 baht, and the goods must leave Thailand with you
 * within 60 days. A refund taken in cash at the airport has an administrative fee deducted.
 */
export const VAT_REFUND_MIN_PER_SHOP_THB = 2000;
export const VAT_REFUND_MIN_TOTAL_THB = 5000;
export const VAT_REFUND_CASH_FEE_THB = 100;

/**
 * Starting rates in Thai baht. These are planning reference points for Bangkok in an ordinary
 * (non-peak) week, meant to be overwritten with real quotes. Airfare is a return economy fare
 * from a metro in India, in rupees.
 */
export const TIERS = [
  {
    value: "backpacker",
    label: "Backpacker — hostel or guesthouse, street food, BTS and boats",
    stayPerRoomPerNightThb: 700,
    foodPerPersonPerDayThb: 350,
    transportPerPersonPerDayThb: 120,
    activitiesPerPersonPerDayThb: 200,
    shoppingPerPersonThb: 2000,
    returnFareInr: 16000,
    peoplePerRoom: 2,
  },
  {
    value: "comfort",
    label: "Comfort — 4-star or serviced condo, food courts and restaurants, some Grab",
    stayPerRoomPerNightThb: 2200,
    foodPerPersonPerDayThb: 900,
    transportPerPersonPerDayThb: 300,
    activitiesPerPersonPerDayThb: 700,
    shoppingPerPersonThb: 6000,
    returnFareInr: 24000,
    peoplePerRoom: 2,
  },
  {
    value: "premium",
    label: "Premium — riverside 5-star, restaurants, private car",
    stayPerRoomPerNightThb: 7000,
    foodPerPersonPerDayThb: 2500,
    transportPerPersonPerDayThb: 900,
    activitiesPerPersonPerDayThb: 2000,
    shoppingPerPersonThb: 15000,
    returnFareInr: 40000,
    peoplePerRoom: 2,
  },
];

/**
 * Season factor on the room rate only. Bangkok's cool dry season is the busy one; the green
 * season is the cheapest; Songkran (mid-April) and the New Year week are short surges.
 */
export const SEASONS = [
  { value: "green", label: "Green season (Jun–Oct) — cheapest, wet afternoons", factor: 0.8 },
  { value: "hot", label: "Hot season (Mar–May) — baseline", factor: 1 },
  { value: "cool", label: "Cool season (Nov–Feb) — high season", factor: 1.3 },
  { value: "surge", label: "Songkran or New Year week — surge", factor: 1.5 },
];

/**
 * How the baht are paid for. The markup is the all-in cost over the mid-market rate, including
 * GST on the bank's cross-currency fee where it applies.
 */
export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash changed in Bangkok (money changer)", markupPercent: 1 },
  { value: "forexcard", label: "Prepaid forex card loaded in India", markupPercent: 2 },
  { value: "card", label: "Indian debit or credit card abroad", markupPercent: 3.5 },
];

/** Rupees per 1 Thai baht. A floating rate — replace it with the rate you are quoted. */
export const DEFAULT_INR_PER_THB = 2.55;

/**
 * Thailand has waived the tourist visa fee for Indian passport holders in recent periods and has
 * also charged for a visa on arrival in others, so this defaults to zero and stays editable.
 */
export const DEFAULT_VISA_FEE_INR = 0;
export const DEFAULT_INSURANCE_INR = 800;
export const DEFAULT_CONTINGENCY_PCT = 10;

const MAX_TRAVELLERS = 40;
const MAX_NIGHTS = 90;
const MAX_PEOPLE_PER_ROOM = 6;
const MAX_LOCAL_AMOUNT = 100000000; // 100 million baht is not a holiday line item
const MAX_INR_AMOUNT = 100000000; // 10 crore
const MAX_CONTINGENCY_PCT = 100;
const MAX_MARKUP_PCT = 30;
const MIN_FX_RATE = 0.0001;
const MAX_FX_RATE = 10000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function tierByValue(value) {
  return TIERS.find((tier) => tier.value === value) ?? TIERS[1];
}

export function seasonByValue(value) {
  return SEASONS.find((season) => season.value === value) ?? SEASONS[1];
}

export function paymentByValue(value) {
  return PAYMENT_METHODS.find((method) => method.value === value) ?? PAYMENT_METHODS[1];
}

/**
 * Baht value of the VAT already inside an eligible shopping spend, less the cash refund fee.
 * VAT is included in the shelf price, so the tax inside a 10,000 baht bill is 10,000 x 7/107.
 *
 * @returns {{eligible:boolean, grossThb:number, netThb:number, reason:string}}
 */
export function vatRefundOnShopping(shoppingThbPerPerson) {
  if (!isNum(shoppingThbPerPerson) || shoppingThbPerPerson <= 0) {
    return { eligible: false, grossThb: 0, netThb: 0, reason: "No shopping budgeted." };
  }
  const grossThb = (shoppingThbPerPerson * THAILAND_VAT_PERCENT) / (100 + THAILAND_VAT_PERCENT);
  if (shoppingThbPerPerson < VAT_REFUND_MIN_TOTAL_THB) {
    return {
      eligible: false,
      grossThb,
      netThb: 0,
      reason: `Below the ${VAT_REFUND_MIN_TOTAL_THB} baht trip minimum for a tourist VAT refund.`,
    };
  }
  const netThb = Math.max(0, grossThb - VAT_REFUND_CASH_FEE_THB);
  return {
    eligible: true,
    grossThb,
    netThb,
    reason: `Claimable if each shop's bill is at least ${VAT_REFUND_MIN_PER_SHOP_THB} baht and you file the P.P.10 form at the airport.`,
  };
}

/**
 * @returns {{error:string}|object} the full budget, in baht and in rupees
 */
export function buildBangkokBudget({
  travellers,
  nights,
  peoplePerRoom,
  stayPerRoomPerNightThb,
  foodPerPersonPerDayThb,
  transportPerPersonPerDayThb,
  activitiesPerPersonPerDayThb,
  shoppingPerPersonThb,
  returnFareInr,
  visaFeeInr = DEFAULT_VISA_FEE_INR,
  insuranceInr = DEFAULT_INSURANCE_INR,
  inrPerThb = DEFAULT_INR_PER_THB,
  markupPercent = 2,
  contingencyPct = DEFAULT_CONTINGENCY_PCT,
  seasonFactor = 1,
  claimVatRefund = true,
  budgetCapInr = 0,
}) {
  const everything = [
    travellers,
    nights,
    peoplePerRoom,
    stayPerRoomPerNightThb,
    foodPerPersonPerDayThb,
    transportPerPersonPerDayThb,
    activitiesPerPersonPerDayThb,
    shoppingPerPersonThb,
    returnFareInr,
    visaFeeInr,
    insuranceInr,
    inrPerThb,
    markupPercent,
    contingencyPct,
    seasonFactor,
    budgetCapInr,
  ];
  if (!everything.every(isNum)) return { error: "Enter a number in every field." };

  if (!Number.isInteger(travellers) || travellers < 1 || travellers > MAX_TRAVELLERS) {
    return { error: `Travellers must be a whole number from 1 to ${MAX_TRAVELLERS}.` };
  }
  if (!Number.isInteger(nights) || nights < 0 || nights > MAX_NIGHTS) {
    return { error: `Nights must be a whole number from 0 to ${MAX_NIGHTS}.` };
  }
  if (!Number.isInteger(peoplePerRoom) || peoplePerRoom < 1 || peoplePerRoom > MAX_PEOPLE_PER_ROOM) {
    return { error: `People per room must be a whole number from 1 to ${MAX_PEOPLE_PER_ROOM}.` };
  }

  const bahtFields = [
    stayPerRoomPerNightThb,
    foodPerPersonPerDayThb,
    transportPerPersonPerDayThb,
    activitiesPerPersonPerDayThb,
    shoppingPerPersonThb,
  ];
  const rupeeFields = [returnFareInr, visaFeeInr, insuranceInr, budgetCapInr];
  if ([...bahtFields, ...rupeeFields].some((value) => value < 0)) {
    return { error: "Costs cannot be negative." };
  }
  if (bahtFields.some((value) => value > MAX_LOCAL_AMOUNT)) {
    return { error: "One of the baht amounts is unrealistically large — check the figures." };
  }
  if (rupeeFields.some((value) => value > MAX_INR_AMOUNT)) {
    return { error: "One of the rupee amounts is unrealistically large — check the figures." };
  }
  if (inrPerThb < MIN_FX_RATE || inrPerThb > MAX_FX_RATE) {
    return { error: "The exchange rate must be a positive number of rupees per baht." };
  }
  if (markupPercent < 0 || markupPercent > MAX_MARKUP_PCT) {
    return { error: `Forex markup must be between 0% and ${MAX_MARKUP_PCT}%.` };
  }
  if (contingencyPct < 0 || contingencyPct > MAX_CONTINGENCY_PCT) {
    return { error: `Contingency must be between 0% and ${MAX_CONTINGENCY_PCT}%.` };
  }
  if (seasonFactor <= 0 || seasonFactor > 10) {
    return { error: "Season factor must be greater than 0 and at most 10." };
  }

  const days = nights + 1;
  const rooms = Math.ceil(travellers / peoplePerRoom);
  const seasonalRoomRateThb = stayPerRoomPerNightThb * seasonFactor;

  const stayThb = rooms * nights * seasonalRoomRateThb;
  const foodThb = travellers * days * foodPerPersonPerDayThb;
  const transportThb = travellers * days * transportPerPersonPerDayThb;
  const activitiesThb = travellers * days * activitiesPerPersonPerDayThb;
  const shoppingThb = travellers * shoppingPerPersonThb;
  const onGroundThb = stayThb + foodThb + transportThb + activitiesThb + shoppingThb;

  const markupFactor = 1 + markupPercent / 100;
  const effectiveRate = inrPerThb * markupFactor;
  const onGroundInrAtMid = onGroundThb * inrPerThb;
  const forexMarkupInr = onGroundInrAtMid * (markupPercent / 100);
  const onGroundInr = onGroundInrAtMid + forexMarkupInr;

  const flightsInr = travellers * returnFareInr;
  const entryInr = travellers * (visaFeeInr + insuranceInr);

  const subtotalInr = flightsInr + entryInr + onGroundInr;
  const contingencyInr = (subtotalInr * contingencyPct) / 100;
  const totalInr = subtotalInr + contingencyInr;

  const refund = vatRefundOnShopping(shoppingPerPersonThb);
  const refundThb = claimVatRefund && refund.eligible ? refund.netThb * travellers : 0;
  const refundInr = refundThb * inrPerThb;
  const totalAfterRefundInr = totalInr - refundInr;

  const lines = [
    {
      key: "flights",
      label: "Return flights",
      thb: 0,
      inr: flightsInr,
      note: `${travellers} x return fare, booked in rupees`,
    },
    {
      key: "entry",
      label: "Visa and insurance",
      thb: 0,
      inr: entryInr,
      note: "one-off, per person",
    },
    {
      key: "stay",
      label: "Stay",
      thb: stayThb,
      inr: stayThb * effectiveRate,
      note: `${rooms} room(s) x ${nights} night(s)`,
    },
    {
      key: "food",
      label: "Food and drink",
      thb: foodThb,
      inr: foodThb * effectiveRate,
      note: `${travellers} x ${days} day(s)`,
    },
    {
      key: "transport",
      label: "Local transport",
      thb: transportThb,
      inr: transportThb * effectiveRate,
      note: `BTS, MRT, boats and Grab — ${travellers} x ${days} day(s)`,
    },
    {
      key: "activities",
      label: "Activities and entry tickets",
      thb: activitiesThb,
      inr: activitiesThb * effectiveRate,
      note: `${travellers} x ${days} day(s)`,
    },
    {
      key: "shopping",
      label: "Shopping",
      thb: shoppingThb,
      inr: shoppingThb * effectiveRate,
      note: "one-off, per person",
    },
    {
      key: "contingency",
      label: `Contingency (${contingencyPct}%)`,
      thb: 0,
      inr: contingencyInr,
      note: "buffer on everything above",
    },
  ].map((line) => ({
    ...line,
    perPersonInr: line.inr / travellers,
    share: totalInr > 0 ? (line.inr / totalInr) * 100 : 0,
  }));

  const perPersonInr = totalInr / travellers;
  const perPersonPerDayInr = perPersonInr / days;
  const dailyOnGroundThb =
    travellers *
    (foodPerPersonPerDayThb + transportPerPersonPerDayThb + activitiesPerPersonPerDayThb);
  const nightlyRoomThb = rooms * seasonalRoomRateThb;
  const costOfOneMoreNightInr =
    (dailyOnGroundThb + nightlyRoomThb) * effectiveRate * (1 + contingencyPct / 100);
  const fixedInr = flightsInr + entryInr;

  // total(n) = (fixed + onGroundRate x [daily x (n+1) + room x n]) x (1 + c)
  // Solve total(n) <= cap for the largest whole n.
  let nightsAffordable = null;
  let budgetGapInr = null;
  if (budgetCapInr > 0) {
    budgetGapInr = budgetCapInr - totalInr;
    const oneOffOnGroundInr = shoppingThb * effectiveRate;
    const perNightInr = (dailyOnGroundThb + nightlyRoomThb) * effectiveRate;
    const capBeforeBuffer = budgetCapInr / (1 + contingencyPct / 100);
    const headroom =
      capBeforeBuffer - fixedInr - oneOffOnGroundInr - dailyOnGroundThb * effectiveRate;
    nightsAffordable = perNightInr > 0 ? Math.max(0, Math.floor(headroom / perNightInr)) : null;
    if (headroom < 0) nightsAffordable = 0;
  }

  const notes = [];
  if (nights === 0) {
    notes.push("Zero nights is a layover day trip: no room cost, and daily spends count for one day.");
  }
  if (travellers % peoplePerRoom !== 0) {
    notes.push(
      `${travellers} travellers at ${peoplePerRoom} per room needs ${rooms} rooms, so one room is not full and the stay line costs more per head than the shared rate suggests.`,
    );
  }
  if (markupPercent >= 3) {
    notes.push(
      `A ${markupPercent}% markup adds about ₹${Math.round(forexMarkupInr)} to this trip. Loading a forex card before you fly, or changing cash at a Bangkok money changer rather than at the airport, usually costs 1–2% instead.`,
    );
  }
  if (claimVatRefund && refund.eligible) {
    notes.push(
      `Shopping of ${Math.round(shoppingPerPersonThb)} baht a head clears the ${VAT_REFUND_MIN_TOTAL_THB} baht VAT refund threshold — about ${Math.round(refundThb)} baht back for the group after the cash refund fee. ${refund.reason}`,
    );
  } else if (shoppingPerPersonThb > 0 && !refund.eligible) {
    notes.push(`No VAT refund assumed. ${refund.reason}`);
  }
  if (seasonFactor > 1) {
    notes.push(
      `Season factor ${seasonFactor}x puts the room at about ${Math.round(seasonalRoomRateThb)} baht a night.`,
    );
  }
  if (budgetCapInr > 0 && budgetGapInr !== null && budgetGapInr < 0) {
    notes.push(
      `The plan is over the cap. ${nightsAffordable} night(s) at the same daily spends brings it back inside.`,
    );
  }

  return {
    travellers,
    nights,
    days,
    rooms,
    seasonFactor,
    seasonalRoomRateThb,
    inrPerThb,
    markupPercent,
    effectiveRate,
    lines,
    stayThb,
    foodThb,
    transportThb,
    activitiesThb,
    shoppingThb,
    onGroundThb,
    onGroundInr,
    forexMarkupInr,
    flightsInr,
    entryInr,
    subtotalInr,
    contingencyInr,
    totalInr,
    perPersonInr,
    perPersonPerDayInr,
    fixedInr,
    costOfOneMoreNightInr,
    onGroundThbPerPerson: onGroundThb / travellers,
    vatRefund: { ...refund, appliedThb: refundThb, appliedInr: refundInr },
    totalAfterRefundInr,
    budgetCapInr,
    budgetGapInr,
    nightsAffordable,
    notes,
  };
}
