/**
 * Leh Ladakh trip budget breakdown.
 *
 * A Ladakh budget breaks the usual "everything is per person per day" pattern in three ways, and
 * every one of them changes the answer:
 *
 * 1. THE VEHICLE IS PER VEHICLE. A Ladakh taxi is hired at a union rate for the car, not per seat,
 *    so the transport line is ceil(travellers / seats) x touring days x day rate. Four people in
 *    one Innova pay a quarter each of what one person pays alone. A rented motorcycle is the same
 *    idea with a seat count of two.
 *
 * 2. ACCLIMATISATION DAYS ARE NOT TOURING DAYS. Leh sits at roughly 3,500 m and the passes above
 *    it — Khardung La and Chang La are both above 5,300 m — are dangerous without at least a day
 *    or two of rest first. Those rest days still cost a room and food, but no vehicle and almost
 *    no activity money, so they are separated out here.
 *
 *      touring days = (nights + 1) - acclimatisation days
 *
 * 3. PERMITS ARE A REAL LINE. Ladakh charges a one-time environmental fee per visitor plus a small
 *    per-person-per-day wildlife/Red Cross levy, and Indian travellers need an Inner Line Permit
 *    for the protected areas — Nubra, Pangong, Tso Moriri, Dah-Hanu and the Changthang. These are
 *    set by the hill council and revised, so they are editable constants here rather than hard
 *    facts.
 *
 * The rest is ordinary:
 *
 *   days   = nights + 1
 *   rooms  = ceil(travellers / people per room)
 *
 *   stay       = rooms x nights x room rate x season factor
 *   food       = travellers x days x food per person per day
 *   vehicle    = vehicles x touring days x vehicle day rate
 *   activities = travellers x touring days x activities per person per day
 *   permits    = travellers x (one-time fee + per-day fee x days)
 *   travel     = travellers x return fare to Leh
 *   gear       = travellers x (gear and medicines + shopping)
 *   contingency = a percentage of everything above
 */

/**
 * Ladakh's visitor levies, in rupees. The Ladakh Autonomous Hill Development Council sets a
 * one-time environmental fee per visitor and a small per-person-per-day Red Cross and wildlife
 * levy, both collected when the Inner Line Permit is issued. The amounts are revised from time to
 * time — check the official Leh permit portal and treat these as starting values.
 */
export const ENVIRONMENT_FEE_PER_PERSON_INR = 400;
export const RED_CROSS_FEE_PER_PERSON_PER_DAY_INR = 20;

/** Altitudes that drive the acclimatisation rule, in metres above sea level. */
export const LEH_ALTITUDE_M = 3500;
export const KHARDUNG_LA_ALTITUDE_M = 5359;
export const MIN_SAFE_ACCLIMATISATION_DAYS = 2;

/**
 * How the group gets around. Ladakh taxis are hired at union rates for the whole vehicle, so the
 * seat count is what decides the cost per head. Day rates are all-in planning figures for a full
 * touring day and should be replaced with a real quote from the taxi union or rental agency.
 */
export const TRANSPORT_MODES = [
  {
    value: "shared",
    label: "Shared taxi or tempo (6 seats)",
    seatsPerVehicle: 6,
    perVehiclePerDayInr: 5000,
  },
  {
    value: "private",
    label: "Private SUV with driver (4 passengers)",
    seatsPerVehicle: 4,
    perVehiclePerDayInr: 6500,
  },
  {
    value: "bike",
    label: "Rented motorcycle, fuel included (2 riders)",
    seatsPerVehicle: 2,
    perVehiclePerDayInr: 2900,
  },
];

/**
 * Starting rates in rupees. Return travel is a return airfare from Delhi to Leh; the road routes
 * from Manali and Srinagar cost less in fares but add two days each way.
 */
export const TIERS = [
  {
    value: "backpacker",
    label: "Backpacker — guesthouse, dhaba food, shared taxis",
    stayPerRoomPerNightInr: 1200,
    foodPerPersonPerDayInr: 600,
    activitiesPerPersonPerDayInr: 300,
    gearPerPersonInr: 1500,
    shoppingPerPersonInr: 2000,
    returnFareInr: 12000,
    peoplePerRoom: 2,
    transport: "shared",
  },
  {
    value: "comfort",
    label: "Comfort — Leh hotel, private SUV, Nubra and Pangong",
    stayPerRoomPerNightInr: 3500,
    foodPerPersonPerDayInr: 1200,
    activitiesPerPersonPerDayInr: 700,
    gearPerPersonInr: 2500,
    shoppingPerPersonInr: 4000,
    returnFareInr: 22000,
    peoplePerRoom: 2,
    transport: "private",
  },
  {
    value: "premium",
    label: "Premium — luxury camps and hotels, dedicated vehicle, guided days",
    stayPerRoomPerNightInr: 9000,
    foodPerPersonPerDayInr: 2500,
    activitiesPerPersonPerDayInr: 1800,
    gearPerPersonInr: 4000,
    shoppingPerPersonInr: 10000,
    returnFareInr: 35000,
    peoplePerRoom: 2,
    transport: "private",
  },
];

/**
 * Season factor on the room rate only. Ladakh's tourist season is short: the Manali and Srinagar
 * highways are normally open from about late May to October, while Leh airport works year-round.
 * Winter rates collapse because most guesthouses shut, not because it is a bargain.
 */
export const SEASONS = [
  { value: "winter", label: "Winter (Nov–Mar) — roads shut, most stays closed", factor: 0.7 },
  { value: "edge", label: "Season edges (May, Oct)", factor: 0.85 },
  { value: "shoulder", label: "Shoulder (late May, Sep) — baseline", factor: 1 },
  { value: "peak", label: "Peak (Jun–Aug) — busiest", factor: 1.35 },
];

export const DEFAULT_CONTINGENCY_PCT = 12;

const MAX_TRAVELLERS = 40;
const MAX_NIGHTS = 60;
const MAX_PEOPLE_PER_ROOM = 6;
const MAX_SEATS_PER_VEHICLE = 12;
const MAX_MONEY = 100000000; // 10 crore
const MAX_CONTINGENCY_PCT = 100;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function tierByValue(value) {
  return TIERS.find((tier) => tier.value === value) ?? TIERS[1];
}

export function seasonByValue(value) {
  return SEASONS.find((season) => season.value === value) ?? SEASONS[2];
}

export function transportByValue(value) {
  return TRANSPORT_MODES.find((mode) => mode.value === value) ?? TRANSPORT_MODES[1];
}

/**
 * Ladakh permit and levy cost for one group.
 *
 * @returns {{oneTimeInr:number, perDayInr:number, totalInr:number}}
 */
export function permitCost({ travellers, days, environmentFeeInr, redCrossFeePerDayInr }) {
  const oneTimeInr = travellers * environmentFeeInr;
  const perDayInr = travellers * days * redCrossFeePerDayInr;
  return { oneTimeInr, perDayInr, totalInr: oneTimeInr + perDayInr };
}

/**
 * @returns {{error:string}|object} the full budget in rupees
 */
export function buildLadakhBudget({
  travellers,
  nights,
  acclimatisationDays,
  peoplePerRoom,
  seatsPerVehicle,
  stayPerRoomPerNightInr,
  foodPerPersonPerDayInr,
  vehiclePerDayInr,
  activitiesPerPersonPerDayInr,
  gearPerPersonInr,
  shoppingPerPersonInr,
  returnFareInr,
  environmentFeeInr = ENVIRONMENT_FEE_PER_PERSON_INR,
  redCrossFeePerDayInr = RED_CROSS_FEE_PER_PERSON_PER_DAY_INR,
  contingencyPct = DEFAULT_CONTINGENCY_PCT,
  seasonFactor = 1,
  budgetCapInr = 0,
}) {
  const everything = [
    travellers,
    nights,
    acclimatisationDays,
    peoplePerRoom,
    seatsPerVehicle,
    stayPerRoomPerNightInr,
    foodPerPersonPerDayInr,
    vehiclePerDayInr,
    activitiesPerPersonPerDayInr,
    gearPerPersonInr,
    shoppingPerPersonInr,
    returnFareInr,
    environmentFeeInr,
    redCrossFeePerDayInr,
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
  const days = nights + 1;
  if (!Number.isInteger(acclimatisationDays) || acclimatisationDays < 0 || acclimatisationDays > days) {
    return { error: `Acclimatisation days must be a whole number from 0 to ${days}.` };
  }
  if (!Number.isInteger(peoplePerRoom) || peoplePerRoom < 1 || peoplePerRoom > MAX_PEOPLE_PER_ROOM) {
    return { error: `People per room must be a whole number from 1 to ${MAX_PEOPLE_PER_ROOM}.` };
  }
  if (
    !Number.isInteger(seatsPerVehicle) ||
    seatsPerVehicle < 1 ||
    seatsPerVehicle > MAX_SEATS_PER_VEHICLE
  ) {
    return { error: `Seats per vehicle must be a whole number from 1 to ${MAX_SEATS_PER_VEHICLE}.` };
  }

  const costFields = [
    stayPerRoomPerNightInr,
    foodPerPersonPerDayInr,
    vehiclePerDayInr,
    activitiesPerPersonPerDayInr,
    gearPerPersonInr,
    shoppingPerPersonInr,
    returnFareInr,
    environmentFeeInr,
    redCrossFeePerDayInr,
    budgetCapInr,
  ];
  if (costFields.some((value) => value < 0)) {
    return { error: "Costs cannot be negative." };
  }
  if (costFields.some((value) => value > MAX_MONEY)) {
    return { error: "One of the amounts is unrealistically large — check the figures." };
  }
  if (contingencyPct < 0 || contingencyPct > MAX_CONTINGENCY_PCT) {
    return { error: `Contingency must be between 0% and ${MAX_CONTINGENCY_PCT}%.` };
  }
  if (seasonFactor <= 0 || seasonFactor > 10) {
    return { error: "Season factor must be greater than 0 and at most 10." };
  }

  const touringDays = days - acclimatisationDays;
  const rooms = Math.ceil(travellers / peoplePerRoom);
  const vehicles = Math.ceil(travellers / seatsPerVehicle);
  const seasonalRoomRate = stayPerRoomPerNightInr * seasonFactor;

  const stay = rooms * nights * seasonalRoomRate;
  const food = travellers * days * foodPerPersonPerDayInr;
  const vehicle = vehicles * touringDays * vehiclePerDayInr;
  const activities = travellers * touringDays * activitiesPerPersonPerDayInr;
  const permits = permitCost({ travellers, days, environmentFeeInr, redCrossFeePerDayInr });
  const travel = travellers * returnFareInr;
  const gear = travellers * (gearPerPersonInr + shoppingPerPersonInr);

  const subtotal = travel + stay + food + vehicle + activities + permits.totalInr + gear;
  const contingency = (subtotal * contingencyPct) / 100;
  const total = subtotal + contingency;

  const lines = [
    {
      key: "travel",
      label: "Return travel to Leh",
      amount: travel,
      note: `${travellers} x return fare`,
    },
    { key: "stay", label: "Stay", amount: stay, note: `${rooms} room(s) x ${nights} night(s)` },
    { key: "food", label: "Food and drink", amount: food, note: `${travellers} x ${days} day(s)` },
    {
      key: "vehicle",
      label: "Taxi or bike",
      amount: vehicle,
      note: `${vehicles} vehicle(s) x ${touringDays} touring day(s) — charged per vehicle`,
    },
    {
      key: "activities",
      label: "Monasteries, activities and entry",
      amount: activities,
      note: `${travellers} x ${touringDays} touring day(s)`,
    },
    {
      key: "permits",
      label: "Permits and levies",
      amount: permits.totalInr,
      note: `environmental fee plus ${days} day(s) of the per-day levy`,
    },
    {
      key: "gear",
      label: "Gear, medicines and shopping",
      amount: gear,
      note: "one-off, per person",
    },
    {
      key: "contingency",
      label: `Contingency (${contingencyPct}%)`,
      amount: contingency,
      note: "buffer on everything above",
    },
  ].map((line) => ({
    ...line,
    perPerson: line.amount / travellers,
    share: total > 0 ? (line.amount / total) * 100 : 0,
  }));

  const perPerson = total / travellers;
  const perPersonPerDay = perPerson / days;
  const vehicleCostPerHeadPerDay = touringDays > 0 ? vehicle / travellers / touringDays : 0;

  // A rest day costs a room, food and the daily levy; a touring day adds the vehicle and the
  // activity money on top.
  const restDayCost =
    (rooms * seasonalRoomRate +
      travellers * foodPerPersonPerDayInr +
      travellers * redCrossFeePerDayInr) *
    (1 + contingencyPct / 100);
  const touringDayCost =
    restDayCost +
    (vehicles * vehiclePerDayInr + travellers * activitiesPerPersonPerDayInr) *
      (1 + contingencyPct / 100);

  const fixed = travel + gear + permits.oneTimeInr;

  // Holding the acclimatisation days at `a`, the total for n nights is
  //
  //   total(n) = (fixed + B x (n + 1) + C x (n + 1 - a) + R x n) x (1 + c)
  //
  // where B is the everyday cost (food and the daily levy), C the touring-day extra (vehicle and
  // activities) and R the nightly room cost. Solving total(n) <= cap for the largest whole n:
  //
  //   n <= (cap / (1 + c) - fixed - B - C x (1 - a)) / (B + C + R)
  //
  // If that lands below a - 1 there are no touring days left at all, so the same solve is redone
  // with C dropped and the answer capped at a - 1.
  let nightsAffordable = null;
  let budgetGap = null;
  let capIsFeasible = null;
  if (budgetCapInr > 0) {
    budgetGap = budgetCapInr - total;
    const everydayCost = travellers * (foodPerPersonPerDayInr + redCrossFeePerDayInr);
    const touringExtra = vehicles * vehiclePerDayInr + travellers * activitiesPerPersonPerDayInr;
    const nightly = rooms * seasonalRoomRate;
    const capBeforeBuffer = budgetCapInr / (1 + contingencyPct / 100);

    const perNightTouring = everydayCost + touringExtra + nightly;
    const headroomTouring =
      capBeforeBuffer - fixed - everydayCost - touringExtra * (1 - acclimatisationDays);
    let solved =
      perNightTouring > 0 ? Math.floor(headroomTouring / perNightTouring) : null;

    if (solved !== null && solved + 1 < acclimatisationDays) {
      const perNightRest = everydayCost + nightly;
      const headroomRest = capBeforeBuffer - fixed - everydayCost;
      const restOnly = perNightRest > 0 ? Math.floor(headroomRest / perNightRest) : 0;
      solved = Math.min(restOnly, acclimatisationDays - 1);
    }
    nightsAffordable = solved === null ? null : Math.max(0, solved);

    if (nightsAffordable !== null) {
      const n = nightsAffordable;
      const modelledTotal =
        (fixed +
          everydayCost * (n + 1) +
          touringExtra * Math.max(0, n + 1 - acclimatisationDays) +
          nightly * n) *
        (1 + contingencyPct / 100);
      capIsFeasible = modelledTotal <= budgetCapInr;
    }
  }

  const notes = [];
  if (nights === 0) {
    notes.push("Zero nights means a single day on the ground — not enough to acclimatise, and no room cost.");
  }
  if (acclimatisationDays < MIN_SAFE_ACCLIMATISATION_DAYS && days > 1) {
    notes.push(
      `Only ${acclimatisationDays} acclimatisation day(s) budgeted. Leh is at about ${LEH_ALTITUDE_M} m and Khardung La is above ${KHARDUNG_LA_ALTITUDE_M} m; the usual advice is at least ${MIN_SAFE_ACCLIMATISATION_DAYS} full days resting in Leh before crossing a high pass. This is general information, not medical advice — talk to a doctor about altitude sickness before you go.`,
    );
  }
  if (touringDays === 0 && days > 0) {
    notes.push("Every day is a rest day, so no vehicle or activity cost is counted at all.");
  }
  if (travellers % seatsPerVehicle !== 0 && travellers > seatsPerVehicle) {
    notes.push(
      `${travellers} travellers in ${seatsPerVehicle}-seat vehicles needs ${vehicles} vehicles, so the last one runs part empty and the per-head vehicle cost rises.`,
    );
  }
  if (travellers === 1 && seatsPerVehicle > 1) {
    notes.push(
      "Travelling alone means paying the whole vehicle rate yourself. Joining a shared taxi from Leh market, which is how most solo travellers do Nubra and Pangong, divides that figure by the number of seats filled.",
    );
  }
  if (travellers % peoplePerRoom !== 0) {
    notes.push(
      `${travellers} travellers at ${peoplePerRoom} per room needs ${rooms} rooms, so one room is not full and the stay line costs more per head than the shared rate suggests.`,
    );
  }
  if (seasonFactor < 1) {
    notes.push(
      "Off-season rates are low because most of Ladakh closes: the Manali and Srinagar highways are normally shut, and many guesthouses and restaurants do not open. Flying in is the only reliable way.",
    );
  }
  if (budgetCapInr > 0 && budgetGap !== null && budgetGap < 0) {
    if (capIsFeasible) {
      notes.push(
        `The plan is over the cap. ${nightsAffordable} night(s) at the same daily spends brings it back inside.`,
      );
    } else {
      notes.push(
        `No length of trip fits this cap: the fixed costs alone — return travel, gear and the one-time permit fee — come to ₹${Math.round(fixed)} before a single night is booked.`,
      );
    }
  }

  return {
    travellers,
    nights,
    days,
    acclimatisationDays,
    touringDays,
    rooms,
    vehicles,
    seasonFactor,
    seasonalRoomRate,
    lines,
    stay,
    food,
    vehicle,
    activities,
    permits,
    travel,
    gear,
    subtotal,
    contingency,
    total,
    perPerson,
    perPersonPerDay,
    vehicleCostPerHeadPerDay,
    restDayCost,
    touringDayCost,
    fixed,
    budgetCapInr,
    budgetGap,
    nightsAffordable,
    capIsFeasible,
    notes,
  };
}
