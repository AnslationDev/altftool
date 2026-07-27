/**
 * Driving in Australia — rules reference and visitor trip check.
 *
 * Road rules in Australia are state and territory law, harmonised through the Australian Road
 * Rules model law, so the core is the same everywhere and only a few figures move at the border.
 *
 * Rule sources encoded below:
 *  - Australian Road Rules r.25: 50 km/h is the default speed limit in a built-up area where no
 *    sign is posted; r.24 sets 100 km/h as the default outside built-up areas (110 km/h in the
 *    Northern Territory).
 *  - The 0.05 g of alcohol per 100 ml of blood limit for fully licensed drivers is uniform across
 *    all states and territories.
 *  - Zero (0.00) applies to learner and provisional licence holders everywhere, and to drivers of
 *    heavy vehicles, public passenger vehicles and dangerous-goods vehicles.
 *  - Slow-down-and-move-over rules past a stationary emergency vehicle with flashing lights now
 *    exist in every state, at 40 km/h where the limit is 80 km/h or lower.
 *  - Seatbelts are compulsory in every seating position, and children under seven need an
 *    approved restraint matched to their age under the national child-restraint rules.
 *  - Overseas licences: a visitor may drive on a valid overseas licence; if it is not in English
 *    an official translation or International Driving Permit must be carried with it. Australia
 *    is a party to the 1949 Geneva Convention on Road Traffic.
 *
 * Blood alcohol estimation uses the Widmark equation (E.M.P. Widmark, 1932) and is an
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

/** An Australian standard drink contains 10 g of pure alcohol (NHMRC definition). */
export const AU_STANDARD_DRINK_G = 10;

/** Full-licence limit, uniform nationwide: 0.05 g per 100 ml of blood. */
export const FULL_LICENCE_BAC_LIMIT_PCT = 0.05;

export const COUNTRY = {
  name: "Australia",
  driveSide: "left",
  steeringWheelSide: "right",
  speedUnit: "km/h",
  minimumDrivingAgeYears: 17,
  typicalRentalMinimumAgeYears: 21,
  drinkingAgeYears: 18,
  emergencyNumbers: [
    ["000", "Police, fire and ambulance — the national emergency number"],
    ["112", "Works from any mobile, including one with no SIM or no local coverage"],
    ["106", "Text-based emergency service for people who are deaf or speech-impaired"],
  ],
  tolls:
    "Toll roads in Sydney, Melbourne and Brisbane are fully electronic with no cash lanes. You need a tag or a visitor pass before you use one; rental firms bill the toll plus a daily administration fee.",
  fuelNote:
    "Unleaded 91, E10, Premium 95 and 98, and diesel, all sold per litre. Outback distances between roadhouses can exceed 200 km, so fill up before you leave a town.",
};

/**
 * States and territories, with the two figures that actually differ: the highest posted limit
 * and the default open-road limit where nothing is signed.
 */
export const STATES = [
  { id: "nsw", label: "New South Wales", maxKmh: 110, defaultRuralKmh: 100, note: "Mobile phone detection cameras operate statewide and are unsigned." },
  { id: "vic", label: "Victoria", maxKmh: 110, defaultRuralKmh: 100, note: "Enforcement tolerance is the tightest in the country, in the order of 3 km/h. Melbourne's CBD also uses hook turns." },
  { id: "qld", label: "Queensland", maxKmh: 110, defaultRuralKmh: 100, note: "110 km/h on the Bruce Highway and major motorways." },
  { id: "sa", label: "South Australia", maxKmh: 110, defaultRuralKmh: 100, note: "110 km/h on the Dukes and Princes highways." },
  { id: "wa", label: "Western Australia", maxKmh: 110, defaultRuralKmh: 100, note: "110 km/h on major highways; road trains up to 53 m long need a long, clear stretch to overtake." },
  { id: "tas", label: "Tasmania", maxKmh: 110, defaultRuralKmh: 100, note: "110 km/h on the Midland Highway; most other rural roads are 80 or 90." },
  { id: "act", label: "Australian Capital Territory", maxKmh: 100, defaultRuralKmh: 100, note: "The ACT has no 110 km/h roads — 100 km/h is the territory maximum." },
  { id: "nt", label: "Northern Territory", maxKmh: 130, defaultRuralKmh: 110, note: "130 km/h on sections of the Stuart, Barkly, Victoria and Arnhem highways — the highest limit in the country. The unsigned open-road default is 110 km/h." },
];

/**
 * Speed limits. `kmh: null` on a row means the figure comes from the selected state.
 * A posted sign always overrides these defaults.
 */
export const SPEED_LIMITS = [
  {
    id: "shared_zone",
    label: "Shared zone (pedestrians have priority)",
    kmh: 10,
    note: "Marked with a shared-zone sign. Pedestrians may use the whole road and you must give way to them.",
  },
  {
    id: "school",
    label: "School zone during posted hours",
    kmh: 40,
    note: "Typically 40 km/h on school days between roughly 8-9:30 am and 2:30-4 pm. The times are on the sign and are enforced hard.",
  },
  {
    id: "urban",
    label: "Built-up areas where nothing is signed",
    kmh: 50,
    note: "The national default inside a built-up area. Many inner-city streets are signed 40 or 30.",
  },
  {
    id: "urban_arterial",
    label: "Urban arterial roads",
    kmh: 70,
    note: "Usually 60 to 80 km/h, always signed.",
  },
  {
    id: "rural_default",
    label: "Outside built-up areas where nothing is signed",
    kmh: null,
    fromState: "defaultRuralKmh",
    note: "The statutory default once you leave a built-up area with no sign posted.",
  },
  {
    id: "highway",
    label: "Highways and freeways — state maximum",
    kmh: null,
    fromState: "maxKmh",
    note: "The highest posted limit in the state or territory you selected.",
  },
];

export const LICENCE_CLASSES = [
  {
    id: "full",
    label: "Full (unrestricted) licence",
    bacLimit: FULL_LICENCE_BAC_LIMIT_PCT,
    category: "Full licence limit",
    reason: "0.05 g per 100 ml of blood applies to fully licensed drivers in every state and territory.",
    penalty:
      "A low-range first offence usually means an on-the-spot fine and an immediate suspension; mid and high range go to court, with licence disqualification and, at the top of the scale, an alcohol interlock condition.",
  },
  {
    id: "provisional",
    label: "Provisional or probationary (P plates)",
    bacLimit: 0,
    category: "Zero alcohol",
    reason: "Provisional and probationary licence holders must have zero alcohol in their blood in every state and territory.",
    penalty: "Immediate suspension, a fine and demerit points that a P-plater has very few of to spare.",
  },
  {
    id: "learner",
    label: "Learner (L plates)",
    bacLimit: 0,
    category: "Zero alcohol",
    reason: "Learner drivers must have zero alcohol in their blood, and the supervising driver is separately bound by their own limit.",
    penalty: "Immediate suspension and a fine, plus a restart of the supervised-hours requirement in some states.",
  },
  {
    id: "commercial",
    label: "Heavy vehicle, taxi, rideshare or dangerous goods",
    bacLimit: 0,
    category: "Zero alcohol",
    reason: "Drivers of heavy vehicles, public passenger vehicles and dangerous-goods vehicles must have zero alcohol in their blood.",
    penalty: "Immediate suspension, loss of the accreditation to drive commercially and a court appearance.",
  },
];

export const LICENCE_ORIGINS = [
  {
    id: "english",
    label: "Overseas licence printed in English",
    needsTranslation: false,
    residentGraceDays: 90,
    summary:
      "Valid for a visitor for as long as it remains current. Carry it with your passport whenever you drive.",
  },
  {
    id: "non_english",
    label: "Overseas licence not in English",
    needsTranslation: true,
    residentGraceDays: 90,
    summary:
      "Must be carried with an official English translation or an International Driving Permit. Police cannot accept the original alone.",
  },
  {
    id: "nz",
    label: "New Zealand licence",
    needsTranslation: false,
    residentGraceDays: 90,
    summary:
      "Recognised for visitors, and convertible without a driving test once you become a resident.",
  },
];

export const EQUIPMENT = [
  ["No mandatory kit", "Unlike Europe, no state requires a warning triangle, first-aid kit or high-visibility vest in a private car."],
  ["Seatbelts in every seat", "Compulsory for driver and every passenger, in every seating position, with the fine and demerit points falling on the driver for anyone under 16."],
  ["Child restraints", "Under 6 months rear-facing; 6 months to 4 years rear or forward facing with an inbuilt harness; 4 to 7 years forward-facing or an approved booster. Children under 4 may not travel in the front row of a vehicle with two or more rows."],
  ["Spare water in the outback", "Not a legal requirement but a practical one — breakdowns on remote highways can mean hours before another vehicle passes."],
  ["Sand flag and UHF radio", "Required on some outback and mining-access tracks; check the road authority's conditions before you leave the bitumen."],
  ["Snow chains", "Can be legally required on the alpine roads in NSW and Victoria during the declared snow season."],
];

export const KEY_RULES = [
  [
    "No turning on a red light",
    "Unlike the United States, you may not turn on red anywhere in Australia unless a specific sign at that intersection permits it after stopping.",
  ],
  [
    "Roundabouts",
    "Give way to any vehicle already in the roundabout — that is, to your right. Signal left as you leave, every time.",
  ],
  [
    "Hook turns in Melbourne",
    "In the Melbourne CBD, marked intersections require you to turn RIGHT from the LEFT lane, waiting in front of the traffic until the cross-street light goes green. Trams have priority.",
  ],
  [
    "Slow down and move over",
    "Past a stationary emergency vehicle with flashing lights you must slow to 40 km/h where the limit is 80 km/h or lower, and move over if it is safe.",
  ],
  [
    "Mobile phones",
    "Touching a phone while driving is an offence, and NSW, Victoria and Queensland run automated detection cameras that photograph you doing it. Fines run into the hundreds with demerit points attached.",
  ],
  [
    "Wildlife at dawn and dusk",
    "Kangaroos, wombats and livestock are the leading single-vehicle hazard on rural roads. Avoid driving between dusk and dawn outside towns; most rental insurance excludes animal strikes at night.",
  ],
  [
    "Road trains",
    "Up to 53 m long in WA, SA, Queensland and the NT. Overtaking one needs about a kilometre of clear road, and they cannot brake for you.",
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

/** Convert a speed between km/h and mph. Returns both values. */
export function convertSpeed(value, fromUnit = "kmh") {
  const speed = toNumber(value);
  if (Number.isNaN(speed)) return { error: "Enter a numeric speed." };
  if (speed < 0) return { error: "Speed cannot be negative." };
  if (speed > 1000) return { error: "Enter a speed under 1000." };
  const kmh = fromUnit === "mph" ? speed * KMH_PER_MPH : speed;
  return { kmh: round(kmh, 1), mph: round(kmh / KMH_PER_MPH, 1) };
}

/** Effective limit for one road class in one state or territory. */
export function speedLimitFor(roadId, stateId = "nsw") {
  const entry = SPEED_LIMITS.find((row) => row.id === roadId);
  if (!entry) return { error: "Unknown road type." };
  const state = STATES.find((row) => row.id === stateId) ?? STATES[0];
  const kmh = entry.kmh == null ? state[entry.fromState] : entry.kmh;
  return {
    id: entry.id,
    label: entry.label,
    kmh,
    mph: round(kmh / KMH_PER_MPH, 0),
    note: entry.id === "highway" ? state.note : entry.note,
  };
}

/** The full speed table for one state or territory. */
export function speedTable(stateId = "nsw") {
  return SPEED_LIMITS.map((row) => speedLimitFor(row.id, stateId));
}

/**
 * Which Australian blood-alcohol limit applies to this driver.
 * The licence class decides it; age matters only for the legal drinking age.
 */
export function alcoholLimitFor({ licenceClass = "full", ageYears } = {}) {
  const entry = LICENCE_CLASSES.find((row) => row.id === licenceClass) ?? LICENCE_CLASSES[0];
  const age = toNumber(ageYears);
  if (Number.isNaN(age)) return { error: "Enter your age." };
  if (age < 0 || age > 120) return { error: "Enter an age between 0 and 120." };

  const notes = [];
  if (age < COUNTRY.drinkingAgeYears) {
    notes.push(
      `You are under ${COUNTRY.drinkingAgeYears}, the legal drinking age in every state and territory, so buying or being supplied alcohol is itself an offence.`,
    );
  }

  return {
    limitBacPercent: entry.bacLimit,
    category: entry.category,
    licenceClass: entry.label,
    reason: entry.reason,
    penalty: entry.penalty,
    notes,
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
    standardDrinks: round(gramsAlcohol / AU_STANDARD_DRINK_G, 1),
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
      `The minimum age for a full licence in Australia is ${COUNTRY.minimumDrivingAgeYears} to 18 depending on the state, and an overseas licence held below the local minimum does not entitle you to drive here.`,
    );
  } else if (age < COUNTRY.typicalRentalMinimumAgeYears) {
    warnings.push(
      `You may be old enough to drive, but rental companies set their own floor at about ${COUNTRY.typicalRentalMinimumAgeYears} and charge a young-driver surcharge below 25.`,
    );
  } else if (age < 25) {
    warnings.push("Expect a young-driver surcharge and a higher insurance excess until you turn 25.");
  }

  if (origin.needsTranslation) {
    warnings.push(
      "Carry an official English translation or an International Driving Permit with your licence — the original alone is not accepted at a roadside stop or a rental desk.",
    );
  }
  if (days > origin.residentGraceDays) {
    warnings.push(
      `A stay of ${days} days can make you a resident for licensing purposes. Most states give a new permanent resident about ${origin.residentGraceDays} days to convert to a local licence.`,
    );
  }

  return {
    origin,
    needsTranslation: origin.needsTranslation,
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
    speeds: speedTable(state.id),
    equipment: EQUIPMENT,
    keyRules: KEY_RULES,
  };
}
