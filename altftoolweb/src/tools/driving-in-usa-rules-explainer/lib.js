/**
 * Driving in the USA — rules reference and visitor trip check.
 *
 * The single most important structural fact: traffic law in the United States is STATE law, not
 * federal law. There is no national speed limit (the federal 55 mph cap was repealed in 1995 by
 * the National Highway System Designation Act) and no national licence. What is uniform comes
 * from conditions attached to federal highway funding:
 *
 *  - 0.08 % blood alcohol as the per se limit for adult drivers — adopted by every state under
 *    the incentive in 23 U.S.C. 163. Utah is the sole exception at 0.05 %, in force since
 *    30 December 2018 (Utah Code 41-6a-502).
 *  - Zero-tolerance laws for drivers under 21 in all 50 states and DC, required by 23 U.S.C. 161.
 *    The threshold is set between 0.00 % and 0.02 % depending on the state.
 *  - 0.04 % for drivers of commercial motor vehicles, set federally by 49 CFR 383.51.
 *  - A minimum drinking age of 21 nationwide, from the National Minimum Drinking Age Act 1984.
 *  - "Move over" laws for stopped emergency vehicles now exist in all 50 states.
 *
 * Everything else — posted speeds, right turn on red, rental age, licence recognition for
 * residents — is decided state by state, which is why this tool takes the state as an input.
 *
 * Licensing for visitors: the United States is a party to the 1949 Geneva Convention on Road
 * Traffic, not the 1968 Vienna Convention. A valid foreign licence is accepted from a visitor;
 * an International Driving Permit is a translation of that licence, never a substitute for it.
 *
 * The blood alcohol estimate uses the Widmark equation (E.M.P. Widmark, 1932) and is an
 * approximation for planning only.
 */

/** Exact international mile definition: 1 mile = 1.609344 km. */
export const KMH_PER_MPH = 1.609344;

/** Density of pure ethanol at 20 degrees C, grams per millilitre. */
export const ETHANOL_DENSITY_G_PER_ML = 0.789;

/** Widmark distribution factor r (fraction of body mass acting as body water). */
export const WIDMARK_R = { male: 0.68, female: 0.55, average: 0.615 };

/** Average ethanol elimination rate, percentage points of BAC per hour. */
export const BAC_ELIMINATION_PCT_PER_HOUR = 0.015;

/** A US standard drink contains 14 g of pure alcohol (NIAAA definition). */
export const US_STANDARD_DRINK_G = 14;

/** Federal per se limit for commercial motor vehicle drivers, 49 CFR 383.51. */
export const COMMERCIAL_BAC_LIMIT_PCT = 0.04;

/** The per se limit adopted by 49 states and DC. */
export const STANDARD_BAC_LIMIT_PCT = 0.08;

/** Zero-tolerance limits for under-21 drivers run from 0.00 % to 0.02 % by state. */
export const UNDER_21_BAC_CEILING_PCT = 0.02;

export const COUNTRY = {
  name: "the USA",
  shortName: "USA",
  driveSide: "right",
  steeringWheelSide: "left",
  speedUnit: "mph",
  minimumDrivingAgeYears: 16,
  typicalRentalMinimumAgeYears: 21,
  drinkingAgeYears: 21,
  emergencyNumbers: [["911", "Police, fire and ambulance — one number nationwide"]],
  tolls:
    "Tolling is regional and increasingly cashless: E-ZPass in the north-east and midwest, SunPass in Florida, FasTrak in California. Rental firms add a daily administration fee on top of the toll itself.",
  fuelNote:
    "Gasoline is sold by the US gallon (3.785 litres) and graded by AKI, so 87 'regular' is roughly 91 RON in European terms. New Jersey still forbids customers from pumping their own fuel.",
};

/**
 * Selected states with the two figures that actually differ for a visitor: the highest posted
 * speed limit found in the state, and the adult per se blood-alcohol limit.
 * `towingMph` is set only where the state caps a vehicle towing a trailer below the general limit.
 * `maxMph` is the typical rural-interstate ceiling, used for the speed table and the headline
 * "highest speed limit" figure. `notableMaxMph` is set only where a single road (e.g. a toll
 * road) posts something higher than the general state maximum — it must never be surfaced as the
 * unqualified headline number, only alongside the explanation in `note`.
 */
export const STATES = [
  { id: "typical", label: "Not sure / typical state", maxMph: 70, bacPct: 0.08, towingMph: null, note: "Most states top out between 65 and 75 mph on rural interstates." },
  { id: "arizona", label: "Arizona", maxMph: 75, bacPct: 0.08, towingMph: null, note: "75 mph on rural interstates." },
  { id: "california", label: "California", maxMph: 70, bacPct: 0.08, towingMph: 55, note: "Any vehicle towing a trailer is capped at 55 mph statewide, on every road." },
  { id: "colorado", label: "Colorado", maxMph: 75, bacPct: 0.08, towingMph: null, note: "75 mph on rural interstates; mountain passes are signed far lower." },
  { id: "florida", label: "Florida", maxMph: 70, bacPct: 0.08, towingMph: null, note: "70 mph on rural interstates and the Turnpike." },
  { id: "hawaii", label: "Hawaii", maxMph: 60, bacPct: 0.08, towingMph: null, note: "60 mph is the highest limit anywhere in the state." },
  { id: "idaho", label: "Idaho", maxMph: 80, bacPct: 0.08, towingMph: null, note: "80 mph on designated rural interstate sections." },
  { id: "montana", label: "Montana", maxMph: 80, bacPct: 0.08, towingMph: null, note: "80 mph by day on rural interstates." },
  { id: "nevada", label: "Nevada", maxMph: 80, bacPct: 0.08, towingMph: null, note: "80 mph on parts of I-80 and US 93." },
  { id: "new-york", label: "New York", maxMph: 65, bacPct: 0.08, towingMph: null, note: "65 mph maximum, and New York City bans right turn on red citywide." },
  { id: "south-dakota", label: "South Dakota", maxMph: 80, bacPct: 0.08, towingMph: null, note: "80 mph on rural interstates." },
  { id: "texas", label: "Texas", maxMph: 80, bacPct: 0.08, towingMph: null, notableMaxMph: 85, note: "80 mph on most rural interstates. The SH-130 toll road near Austin posts 85 mph — the highest speed limit in the country — but that is one specific toll road, not the state's general maximum." },
  { id: "utah", label: "Utah", maxMph: 80, bacPct: 0.05, towingMph: null, note: "The only state with a 0.05 % blood-alcohol limit, in force since 30 December 2018." },
  { id: "washington", label: "Washington", maxMph: 70, bacPct: 0.08, towingMph: null, note: "70 mph on rural interstates, 60 mph for trucks." },
  { id: "wyoming", label: "Wyoming", maxMph: 80, bacPct: 0.08, towingMph: null, note: "80 mph on rural interstates; wind closures are frequent in winter." },
  { id: "dc", label: "Washington, DC", maxMph: 55, bacPct: 0.08, towingMph: null, note: "55 mph maximum, heavy automated enforcement, and radar detectors are illegal." },
];

/**
 * Generic road classes. `mph: null` on the interstate row means the figure comes from the
 * selected state's maximum. These are the common statutory defaults where no sign is posted —
 * a posted sign always overrides them.
 */
export const SPEED_LIMITS = [
  {
    id: "school",
    label: "School zone when children are present",
    mph: 20,
    note: "15 to 25 mph depending on the state, and enforced with no tolerance at all.",
  },
  {
    id: "residential",
    label: "Residential and business districts",
    mph: 25,
    note: "The statutory default in most states when nothing is posted.",
  },
  {
    id: "urban_arterial",
    label: "Urban arterial roads",
    mph: 35,
    note: "Typically 30 to 45 mph, always signed.",
  },
  {
    id: "rural_two_lane",
    label: "Undivided rural highways",
    mph: 55,
    note: "The common default outside built-up areas on two-lane roads.",
  },
  {
    id: "divided_highway",
    label: "Divided highways and expressways",
    mph: 65,
    note: "Usually 55 to 70 mph, signed at every change.",
  },
  {
    id: "urban_interstate",
    label: "Urban interstate",
    mph: 60,
    note: "Lower than the rural limit through metropolitan areas, often 55 to 65 mph.",
  },
  {
    id: "rural_interstate",
    label: "Rural interstate — state maximum",
    mph: null,
    note: "The highest posted limit in the state you selected.",
  },
];

export const LICENCE_ORIGINS = [
  {
    id: "foreign_english",
    label: "Foreign licence printed in English",
    needsIdp: false,
    residentGraceDays: 60,
    summary:
      "Accepted for visitors in every state. Carry your passport with it, because rental desks match the two documents.",
  },
  {
    id: "foreign_other_language",
    label: "Foreign licence not in English",
    needsIdp: true,
    residentGraceDays: 60,
    summary:
      "Carry an International Driving Permit issued under the 1949 Geneva Convention alongside the original. The permit is a translation, never a licence on its own.",
  },
  {
    id: "canadian_mexican",
    label: "Canadian or Mexican licence",
    needsIdp: false,
    residentGraceDays: 60,
    summary:
      "Recognised for visitors without an International Driving Permit under long-standing reciprocal arrangements.",
  },
  {
    id: "us_state",
    label: "A licence from another US state",
    needsIdp: false,
    residentGraceDays: 30,
    summary:
      "Valid nationwide while you remain a resident of the issuing state. Move states and you must transfer it, usually within 30 days.",
  },
];

export const EQUIPMENT = [
  ["No mandatory kit", "Unlike most of Europe, no state requires a warning triangle, first-aid kit or high-visibility vest in a private car."],
  ["Proof of insurance", "Must be carried in the vehicle in nearly every state; a rental agreement doubles as this."],
  ["Registration document", "Kept in the glovebox of the rental — police expect it on request."],
  ["Child restraints", "Required in every state, with the age, height and weight thresholds set state by state. Rear-facing seats for infants are universal."],
  ["Radar detectors", "Legal for private cars in every state except Virginia and Washington DC, and banned in all commercial vehicles federally."],
  ["Winter equipment", "Chains can be legally required on signed mountain routes in California, Colorado and Washington during storms."],
];

export const KEY_RULES = [
  [
    "Right turn on red",
    "Legal in all 50 states after a complete stop and yielding, unless a sign says otherwise. New York City is the big exception: it is banned citywide.",
  ],
  [
    "Four-way stops",
    "Every driver stops. Whoever arrived first goes first; if two arrive together, the vehicle on the right has priority.",
  ],
  [
    "School buses",
    "When a school bus shows flashing red lights and extends its stop arm, traffic in BOTH directions must stop and stay stopped until it retracts. Divided-highway exceptions vary by state and the fines are severe.",
  ],
  [
    "Move over",
    "All 50 states require you to change lanes away from a stopped emergency or service vehicle, or slow substantially if you cannot.",
  ],
  [
    "Open containers",
    "An open alcohol container anywhere in the passenger compartment is an offence in most states, even for a sober passenger. Put it in the boot.",
  ],
  [
    "Undertaking is normal",
    "Passing on the right is legal on multi-lane roads and universally practised, so check both mirrors before changing lanes.",
  ],
  [
    "Turning left on a green ball",
    "A round green light permits a left turn only after yielding to oncoming traffic. A green arrow is the protected turn.",
  ],
];

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return NaN;
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

const round = (value, dp = 2) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

/** Convert a speed between mph and km/h. Returns both values. */
export function convertSpeed(value, fromUnit = "mph") {
  const speed = toNumber(value);
  if (Number.isNaN(speed)) return { error: "Enter a numeric speed." };
  if (speed < 0) return { error: "Speed cannot be negative." };
  if (speed > 1000) return { error: "Enter a speed under 1000." };
  const mph = fromUnit === "kmh" ? speed / KMH_PER_MPH : speed;
  return { mph: round(mph, 1), kmh: round(mph * KMH_PER_MPH, 1) };
}

/** Effective limit for one road class in one state under the selected conditions. */
export function speedLimitFor(roadId, stateId = "typical", conditions = {}) {
  const entry = SPEED_LIMITS.find((row) => row.id === roadId);
  if (!entry) return { error: "Unknown road type." };
  const state = STATES.find((row) => row.id === stateId) ?? STATES[0];

  const base = entry.mph == null ? state.maxMph : entry.mph;
  const candidates = [base];
  if (conditions.towingTrailer && state.towingMph != null) candidates.push(state.towingMph);
  const mph = Math.min(...candidates);

  return {
    id: entry.id,
    label: entry.label,
    mph,
    kmh: round(mph * KMH_PER_MPH, 0),
    note: entry.id === "rural_interstate" ? state.note : entry.note,
  };
}

/** The full speed table for one state under one set of conditions. */
export function speedTable(stateId = "typical", conditions = {}) {
  return SPEED_LIMITS.map((row) => speedLimitFor(row.id, stateId, conditions));
}

/**
 * Which US blood-alcohol limit applies to this driver.
 * Federal commercial rules and state zero-tolerance rules both override the adult per se limit.
 */
export function alcoholLimitFor({ ageYears, stateId = "typical", commercialVehicle = false } = {}) {
  const age = toNumber(ageYears);
  if (Number.isNaN(age)) return { error: "Enter your age." };
  if (age < 0 || age > 120) return { error: "Enter an age between 0 and 120." };
  const state = STATES.find((row) => row.id === stateId) ?? STATES[0];

  if (age < COUNTRY.drinkingAgeYears) {
    return {
      limitBacPercent: 0,
      category: "Zero tolerance (under 21)",
      state: state.label,
      reason: `Every state and DC operates a zero-tolerance law for drivers under ${COUNTRY.drinkingAgeYears}, required by 23 U.S.C. 161. The threshold is between 0.00 % and ${UNDER_21_BAC_CEILING_PCT} % depending on the state, so treat it as zero.`,
      penalty:
        "Licence suspension on the spot in most states, plus a separate charge for possessing alcohol under 21. A visitor's driving privileges in that state are revoked even though the licence itself is foreign.",
    };
  }

  if (commercialVehicle) {
    return {
      limitBacPercent: COMMERCIAL_BAC_LIMIT_PCT,
      category: "Commercial driver",
      state: state.label,
      reason: `49 CFR 383.51 sets ${COMMERCIAL_BAC_LIMIT_PCT} % for anyone driving a commercial motor vehicle, half the limit for a private car.`,
      penalty: "Disqualification from commercial driving for at least a year on a first offence, and 24 hours out of service immediately.",
    };
  }

  return {
    limitBacPercent: state.bacPct,
    category: state.bacPct < STANDARD_BAC_LIMIT_PCT ? "Stricter state limit" : "Standard adult limit",
    state: state.label,
    reason:
      state.bacPct < STANDARD_BAC_LIMIT_PCT
        ? `${state.label} sets ${state.bacPct} %, the lowest adult limit in the country.`
        : `${state.label} applies the ${STANDARD_BAC_LIMIT_PCT} % per se limit adopted by every state except Utah.`,
    penalty:
      "A first DUI typically means arrest, a night in custody, a court appearance, fines running into four figures and loss of driving privileges in that state. You can also be charged below the limit if your driving is impaired.",
  };
}

/**
 * Widmark blood-alcohol estimate. Pure — pass the elapsed time in, never read a clock.
 */
export function estimateBac({
  drinks,
  drinkVolumeMl,
  abvPercent,
  bodyWeightKg,
  sex = "average",
  hoursSinceFirstDrink,
} = {}) {
  const n = toNumber(drinks);
  const volume = toNumber(drinkVolumeMl);
  const abv = toNumber(abvPercent);
  const weight = toNumber(bodyWeightKg);
  const hours = toNumber(hoursSinceFirstDrink);

  if ([n, volume, abv, weight, hours].some(Number.isNaN)) {
    return { error: "Enter numbers for drinks, drink size, strength, body weight and hours." };
  }
  if (n < 0 || volume < 0 || abv < 0 || hours < 0) return { error: "Values cannot be negative." };
  if (abv > 100) return { error: "Alcohol strength cannot exceed 100% ABV." };
  if (volume > 2000) return { error: "Enter a drink size of 2000 ml or fewer." };
  if (weight < 30) return { error: "Enter a body weight of at least 30 kg." };
  if (weight > 400) return { error: "Enter a body weight below 400 kg." };
  if (n > 100) return { error: "Enter 100 drinks or fewer." };
  if (hours > 72) return { error: "Enter 72 hours or fewer." };

  const r = WIDMARK_R[sex] ?? WIDMARK_R.average;
  const gramsAlcohol = n * volume * (abv / 100) * ETHANOL_DENSITY_G_PER_ML;
  const bodyWaterGrams = weight * 1000 * r;
  const peakBacPercent = (gramsAlcohol / bodyWaterGrams) * 100;
  const bacPercent = Math.max(0, peakBacPercent - BAC_ELIMINATION_PCT_PER_HOUR * hours);

  return {
    gramsAlcohol: round(gramsAlcohol, 1),
    standardDrinks: round(gramsAlcohol / US_STANDARD_DRINK_G, 1),
    peakBacPercent: round(peakBacPercent, 4),
    bacPercent: round(bacPercent, 4),
    hoursToZero: round(bacPercent / BAC_ELIMINATION_PCT_PER_HOUR, 1),
  };
}

/** Hours until an estimated BAC falls to the applicable legal limit. */
export function hoursUntilLegal(bacPercent, limitBacPercent) {
  const bac = toNumber(bacPercent);
  const limit = toNumber(limitBacPercent);
  if (Number.isNaN(bac) || Number.isNaN(limit)) return { error: "Need a BAC estimate and a limit." };
  if (bac <= limit) return { hours: 0, alreadyUnder: true };
  return {
    hours: round((bac - limit) / BAC_ELIMINATION_PCT_PER_HOUR, 1),
    alreadyUnder: false,
  };
}

/** Paperwork check for a visitor's licence. */
export function permitCheck({ licenceOrigin, ageYears, stayDays } = {}) {
  const origin = LICENCE_ORIGINS.find((row) => row.id === licenceOrigin) ?? LICENCE_ORIGINS[0];
  const age = toNumber(ageYears);
  const days = toNumber(stayDays);
  if (Number.isNaN(age) || Number.isNaN(days)) return { error: "Enter your age and the length of your stay." };
  if (age < 0 || days < 0) return { error: "Age and stay length cannot be negative." };
  if (days > 3650) return { error: "Enter a stay of 3650 days (10 years) or fewer." };

  const blockers = [];
  const warnings = [];

  if (age < COUNTRY.minimumDrivingAgeYears) {
    blockers.push(
      `The minimum driving age is ${COUNTRY.minimumDrivingAgeYears} in most states, and a foreign licence held below that age does not entitle you to drive.`,
    );
  } else if (age < COUNTRY.typicalRentalMinimumAgeYears) {
    warnings.push(
      `You may be old enough to drive, but rental companies set their own floor at ${COUNTRY.typicalRentalMinimumAgeYears}. New York and Michigan are the exceptions: state law obliges rental firms to serve drivers from 18, at a surcharge.`,
    );
  } else if (age < 25) {
    warnings.push("Expect a young-driver surcharge from every rental company until you turn 25.");
  }

  if (origin.needsIdp) {
    warnings.push(
      "Carry an International Driving Permit issued under the 1949 Geneva Convention with your national licence — it is a translation and is worthless on its own.",
    );
  }
  if (days > origin.residentGraceDays) {
    warnings.push(
      `A stay of ${days} days can make you a resident for licensing purposes. Most states require a resident to obtain a state licence within ${origin.residentGraceDays} to 90 days, and a visitor licence stops covering you at that point.`,
    );
  }

  return {
    origin,
    needsIdp: origin.needsIdp,
    residentGraceDays: origin.residentGraceDays,
    canDrive: blockers.length === 0,
    blockers,
    warnings,
  };
}

/** Everything the UI needs in one pure call. */
export function assessTrip(input = {}) {
  const alcohol = alcoholLimitFor(input);
  if (alcohol.error) return { error: alcohol.error };
  const permit = permitCheck(input);
  if (permit.error) return { error: permit.error };
  const state = STATES.find((row) => row.id === input.stateId) ?? STATES[0];

  return {
    country: COUNTRY,
    state,
    alcohol,
    permit,
    speeds: speedTable(state.id, { towingTrailer: Boolean(input.towingTrailer) }),
    equipment: EQUIPMENT,
    keyRules: KEY_RULES,
  };
}
