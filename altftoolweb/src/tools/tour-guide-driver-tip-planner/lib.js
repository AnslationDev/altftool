/**
 * Budgeting tips for guides, drivers, porters and camp crew across a multi-day tour.
 *
 * Tour tipping is not a percentage of anything — it is a per-person-per-day or per-group-per-day
 * rate paid in cash at the end, and the rate depends on the role and the style of trip. The
 * defaults below are the ranges tour operators publish in their own pre-departure notes, stated
 * in US dollars because that is the currency almost all of that guidance is written in. They are
 * starting points, not obligations, and every rate here is editable.
 *
 * The arithmetic is deliberately simple and explicit:
 *
 *     amount = rate x units x (per-person role ? travellers : 1)
 *
 * where "units" is normally the number of days the person is with you, but can be a count of
 * transfers, hotel changes or bags for the roles that are paid per event instead.
 */

/** How a role's rate is multiplied up. */
export const BASIS = {
  PER_PERSON_PER_DAY: "per-person-per-day",
  PER_GROUP_PER_DAY: "per-group-per-day",
  PER_PERSON_PER_UNIT: "per-person-per-unit",
  PER_GROUP_PER_UNIT: "per-group-per-unit",
};

const PER_PERSON_BASES = new Set([BASIS.PER_PERSON_PER_DAY, BASIS.PER_PERSON_PER_UNIT]);
const PER_DAY_BASES = new Set([BASIS.PER_PERSON_PER_DAY, BASIS.PER_GROUP_PER_DAY]);

/** True when the role's rate is charged once per traveller rather than once per group. */
export function isPerPerson(basis) {
  return PER_PERSON_BASES.has(basis);
}

/** True when the role's units default to the number of tour days. */
export function isPerDay(basis) {
  return PER_DAY_BASES.has(basis);
}

export const QUALITY_LEVELS = [
  { id: "modest", label: "Modest", key: "low" },
  { id: "standard", label: "Standard", key: "typical" },
  { id: "generous", label: "Generous", key: "high" },
];

/**
 * Currencies offered for display. The default rates are US dollar guidance; switching the
 * currency changes the formatting only, so edit the rates if your operator quotes locally.
 */
export const CURRENCIES = [
  { code: "USD", locale: "en-US", label: "US dollar" },
  { code: "EUR", locale: "de-DE", label: "Euro" },
  { code: "GBP", locale: "en-GB", label: "Pound sterling" },
  { code: "INR", locale: "en-IN", label: "Indian rupee" },
  { code: "AED", locale: "en-AE", label: "UAE dirham" },
  { code: "ZAR", locale: "en-ZA", label: "South African rand" },
  { code: "TZS", locale: "sw-TZ", label: "Tanzanian shilling" },
  { code: "NPR", locale: "ne-NP", label: "Nepalese rupee" },
];

/**
 * Tour styles and the roles that get tipped on each. Rates are the low / typical / high of the
 * ranges tour operators publish, in US dollars.
 */
export const TOUR_STYLES = [
  {
    id: "escorted-coach",
    label: "Escorted coach tour",
    note: "A tour director travels with the group for the whole trip, with a coach driver and local guides who join for a city or a site.",
    roles: [
      {
        id: "tour-director",
        label: "Tour director / tour manager",
        basis: BASIS.PER_PERSON_PER_DAY,
        low: 5,
        typical: 8,
        high: 12,
        unitLabel: "day",
      },
      {
        id: "coach-driver",
        label: "Coach driver",
        basis: BASIS.PER_PERSON_PER_DAY,
        low: 3,
        typical: 5,
        high: 8,
        unitLabel: "day",
      },
      {
        id: "local-guide",
        label: "Local guide (only on the days one joins)",
        basis: BASIS.PER_PERSON_PER_UNIT,
        low: 2,
        typical: 3,
        high: 5,
        unitLabel: "guided day",
        defaultUnits: 3,
      },
      {
        id: "hotel-porter",
        label: "Hotel porter, per bag moved",
        basis: BASIS.PER_PERSON_PER_UNIT,
        low: 1,
        typical: 2,
        high: 3,
        unitLabel: "bag movement",
        defaultUnits: 4,
      },
    ],
  },
  {
    id: "private-guide-driver",
    label: "Private guide and driver",
    note: "A car or minivan booked for your party alone. Rates are per group per day, because the crew serves only you however many of you there are.",
    roles: [
      {
        id: "private-guide",
        label: "Private guide",
        basis: BASIS.PER_GROUP_PER_DAY,
        low: 20,
        typical: 30,
        high: 50,
        unitLabel: "day",
      },
      {
        id: "private-driver",
        label: "Private driver",
        basis: BASIS.PER_GROUP_PER_DAY,
        low: 10,
        typical: 20,
        high: 30,
        unitLabel: "day",
      },
      {
        id: "site-guide",
        label: "Site or monument guide",
        basis: BASIS.PER_GROUP_PER_UNIT,
        low: 5,
        typical: 10,
        high: 20,
        unitLabel: "site",
        defaultUnits: 3,
      },
      {
        id: "hotel-porter",
        label: "Hotel porter, per bag moved",
        basis: BASIS.PER_PERSON_PER_UNIT,
        low: 1,
        typical: 2,
        high: 3,
        unitLabel: "bag movement",
        defaultUnits: 4,
      },
    ],
  },
  {
    id: "trekking-crew",
    label: "Trekking crew",
    note: "Kilimanjaro and Himalayan style trekking, where the crew far outnumbers the clients. Guide, cook and assistant rates are per group per day; porters are per porter per day.",
    roles: [
      {
        id: "lead-guide",
        label: "Lead guide",
        basis: BASIS.PER_GROUP_PER_DAY,
        low: 20,
        typical: 25,
        high: 35,
        unitLabel: "day",
      },
      {
        id: "assistant-guide",
        label: "Assistant guide (each)",
        basis: BASIS.PER_GROUP_PER_DAY,
        low: 15,
        typical: 18,
        high: 25,
        unitLabel: "day",
      },
      {
        id: "cook",
        label: "Cook",
        basis: BASIS.PER_GROUP_PER_DAY,
        low: 12,
        typical: 15,
        high: 20,
        unitLabel: "day",
      },
      {
        id: "porters",
        label: "Porters (rate x porters x days)",
        basis: BASIS.PER_GROUP_PER_UNIT,
        low: 8,
        typical: 10,
        high: 12,
        unitLabel: "porter-day",
        defaultUnits: 21,
      },
    ],
  },
  {
    id: "safari",
    label: "Safari and lodge",
    note: "A driver-guide plus, on many camps, a tracker and a communal staff box that the whole lodge team shares.",
    roles: [
      {
        id: "safari-guide",
        label: "Driver-guide",
        basis: BASIS.PER_PERSON_PER_DAY,
        low: 10,
        typical: 15,
        high: 25,
        unitLabel: "day",
      },
      {
        id: "tracker",
        label: "Tracker or spotter",
        basis: BASIS.PER_PERSON_PER_DAY,
        low: 5,
        typical: 8,
        high: 10,
        unitLabel: "day",
      },
      {
        id: "camp-staff",
        label: "Communal camp staff box",
        basis: BASIS.PER_PERSON_PER_DAY,
        low: 5,
        typical: 10,
        high: 15,
        unitLabel: "day",
      },
      {
        id: "transfer-driver",
        label: "Airstrip or transfer driver",
        basis: BASIS.PER_GROUP_PER_UNIT,
        low: 5,
        typical: 10,
        high: 20,
        unitLabel: "transfer",
        defaultUnits: 2,
      },
    ],
  },
  {
    id: "day-tours",
    label: "Day tours and transfers",
    note: "Independent travel with a different guide each day rather than one crew for the trip.",
    roles: [
      {
        id: "walking-guide",
        label: "Walking or day-tour guide",
        basis: BASIS.PER_PERSON_PER_UNIT,
        low: 5,
        typical: 10,
        high: 20,
        unitLabel: "tour",
        defaultUnits: 4,
      },
      {
        id: "transfer-driver",
        label: "Airport or intercity transfer driver",
        basis: BASIS.PER_GROUP_PER_UNIT,
        low: 5,
        typical: 10,
        high: 20,
        unitLabel: "transfer",
        defaultUnits: 4,
      },
      {
        id: "boat-crew",
        label: "Boat or activity crew",
        basis: BASIS.PER_PERSON_PER_UNIT,
        low: 5,
        typical: 10,
        high: 15,
        unitLabel: "activity",
        defaultUnits: 2,
      },
      {
        id: "hotel-porter",
        label: "Hotel porter, per bag moved",
        basis: BASIS.PER_PERSON_PER_UNIT,
        low: 1,
        typical: 2,
        high: 3,
        unitLabel: "bag movement",
        defaultUnits: 4,
      },
    ],
  },
];

export const MAX_DAYS = 365;
export const MAX_TRAVELLERS = 100;
export const MAX_UNITS = 2000;
export const MAX_RATE = 100000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;

export function findStyle(id) {
  return TOUR_STYLES.find((style) => style.id === id) ?? null;
}

/**
 * Build the editable role rows for a style at a given service level and trip length.
 * Pure: it reads only its arguments.
 */
export function defaultRolesFor(styleId, quality, days) {
  const style = findStyle(styleId);
  if (!style) return [];
  const level = QUALITY_LEVELS.find((item) => item.id === quality) ?? QUALITY_LEVELS[1];
  const dayCount = isNum(days) && days > 0 ? Math.round(days) : 1;
  return style.roles.map((role) => ({
    id: role.id,
    label: role.label,
    basis: role.basis,
    unitLabel: role.unitLabel,
    rate: role[level.key],
    units: isPerDay(role.basis) ? dayCount : role.defaultUnits ?? 1,
    include: true,
  }));
}

/**
 * Total the tips for a trip.
 *
 * @param {object} input
 * @param {number} input.days        length of the tour in days
 * @param {number} input.travellers  people in your party
 * @param {Array<{id:string,label:string,basis:string,rate:number,units:number,include?:boolean,unitLabel?:string}>} input.roles
 * @returns {{error:string}|object}
 */
export function computeTourTips({ days, travellers, roles }) {
  if (!isNum(days) || days <= 0) return { error: "Tour length must be at least one day." };
  if (days > MAX_DAYS) return { error: `Tour length must be ${MAX_DAYS} days or fewer.` };
  if (!isNum(travellers) || travellers < 1) return { error: "There must be at least one traveller." };
  if (travellers > MAX_TRAVELLERS) {
    return { error: `This planner handles up to ${MAX_TRAVELLERS} travellers.` };
  }
  if (!Array.isArray(roles) || roles.length === 0) {
    return { error: "Add at least one role to tip." };
  }

  const rows = [];
  let total = 0;

  for (const role of roles) {
    if (role?.include === false) continue;
    const rate = Number(role?.rate);
    const units = Number(role?.units);

    if (!isNum(rate) || rate < 0) {
      return { error: `The rate for "${role?.label || "a role"}" must be zero or more.` };
    }
    if (rate > MAX_RATE) {
      return { error: `The rate for "${role?.label || "a role"}" is larger than this planner handles.` };
    }
    if (!isNum(units) || units < 0) {
      return { error: `The number of ${role?.unitLabel || "unit"}s for "${role?.label || "a role"}" must be zero or more.` };
    }
    if (units > MAX_UNITS) {
      return { error: `The number of ${role?.unitLabel || "unit"}s for "${role?.label || "a role"}" is too large.` };
    }

    const people = isPerPerson(role.basis) ? travellers : 1;
    const amount = round2(rate * units * people);
    total += amount;
    rows.push({
      id: role.id,
      label: role.label,
      basis: role.basis,
      unitLabel: role.unitLabel,
      rate,
      units,
      people,
      amount,
      perTraveller: round2(amount / travellers),
    });
  }

  if (rows.length === 0) return { error: "Every role is switched off — turn at least one back on." };

  total = round2(total);
  const perTraveller = round2(total / travellers);
  const perDay = round2(total / days);
  const perTravellerPerDay = round2(total / travellers / days);

  rows.sort((a, b) => b.amount - a.amount);
  const withShare = rows.map((row) => ({
    ...row,
    share: total > 0 ? (row.amount / total) * 100 : 0,
  }));

  return {
    days,
    travellers,
    rows: withShare,
    total,
    perTraveller,
    perDay,
    perTravellerPerDay,
    largest: withShare[0] ?? null,
  };
}

/**
 * Suggested cash denominations to carry: tips are handed over in local cash, so the plan is
 * only useful if you know roughly how many notes to draw out. Splits the total into whole
 * notes of the given denomination plus a remainder.
 */
export function cashPlan(total, denomination) {
  if (!isNum(total) || total <= 0) return { error: "Nothing to withdraw." };
  if (!isNum(denomination) || denomination <= 0) return { error: "Note size must be greater than zero." };
  const notes = Math.ceil(total / denomination);
  return {
    notes,
    denomination,
    withdraw: round2(notes * denomination),
    spare: round2(notes * denomination - total),
  };
}
