/**
 * Driving in Switzerland — rules reference and visitor trip check.
 *
 * Switzerland is the destination in this family where a speeding ticket can become a prison
 * sentence. Under the Via Sicura package in force since 1 January 2013, art. 90 para. 4 of the
 * Strassenverkehrsgesetz (SVG) defines a "Raserdelikt": exceeding the limit by
 *
 *      40 km/h where the limit is 30 km/h
 *      50 km/h where the limit is 50 km/h
 *      60 km/h where the limit is 80 km/h
 *      80 km/h where the limit is 120 km/h
 *
 * is a crime, not an infringement. The minimum sentence is one year of imprisonment, the licence
 * is withdrawn for at least two years, and the vehicle can be confiscated and sold — including a
 * hire car, which then becomes a civil claim against you. This tool computes that threshold for
 * any posted limit you enter.
 *
 * Other rules encoded below:
 *  - Verkehrsregelnverordnung art. 4a: 50 km/h inside built-up areas, 80 km/h outside them,
 *    100 km/h on expressways (green signs) and 120 km/h on motorways (blue signs).
 *  - SVG art. 31 and the 2014 amendment: 0.5 per mille (0.05 %) blood alcohol for ordinary
 *    drivers, cut to 0.1 per mille (0.01 %) — effectively zero — for learner drivers, drivers in
 *    the three-year probationary period, accompanying instructors and professional drivers.
 *  - SVG art. 41: dipped headlights are compulsory day and night, all year, since 1 January 2014.
 *  - VTS art. 90: a warning triangle must be carried and must be reachable from the cabin rather
 *    than stowed in the boot. A first-aid kit and a high-visibility vest are recommended but, for
 *    a car, not legally compulsory in Switzerland.
 *  - The motorway vignette is required on every motorway and expressway; it costs CHF 40 and is
 *    valid from 1 December of the preceding year to 31 January of the following one, giving 14
 *    months of use. An electronic e-vignette has been sold alongside the sticker since 2023.
 *  - SVG art. 57b: radar detectors are banned outright — carrying, installing or using one — and
 *    navigation apps must have live camera alerts switched off.
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

/** A European standard drink contains 10 g of pure alcohol. */
export const STANDARD_DRINK_G = 10;

/** 0.5 per mille for ordinary drivers, 0.1 per mille for the restricted categories. */
export const STANDARD_BAC_LIMIT_PCT = 0.05;
export const RESTRICTED_BAC_LIMIT_PCT = 0.01;

/** Motorway vignette price in Swiss francs, and the fine for using a motorway without one. */
export const VIGNETTE_PRICE_CHF = 40;
export const VIGNETTE_FINE_CHF = 200;

/**
 * Via Sicura Raser thresholds (SVG art. 90 para. 4): the excess above the posted limit at which
 * speeding becomes a crime, keyed to the posted limit itself.
 */
export const RASER_THRESHOLDS = [
  { maxPostedKmh: 30, excessKmh: 40 },
  { maxPostedKmh: 50, excessKmh: 50 },
  { maxPostedKmh: 80, excessKmh: 60 },
  { maxPostedKmh: Infinity, excessKmh: 80 },
];

/** Minimum consequences once the Raser threshold is crossed. */
export const RASER_MIN_PRISON_YEARS = 1;
export const RASER_MIN_LICENCE_WITHDRAWAL_YEARS = 2;

export const COUNTRY = {
  name: "Switzerland",
  localName: "Schweiz / Suisse / Svizzera",
  driveSide: "right",
  steeringWheelSide: "left",
  speedUnit: "km/h",
  minimumDrivingAgeYears: 18,
  typicalRentalMinimumAgeYears: 20,
  emergencyNumbers: [
    ["112", "General emergency number, works across Europe"],
    ["117", "Police"],
    ["118", "Fire"],
    ["144", "Ambulance"],
    ["1414", "Rega air rescue, for mountain and remote incidents"],
  ],
  tolls:
    "There are no per-journey tolls. Instead a single vignette covers the whole motorway and expressway network for a calendar year, sold as a windscreen sticker or as an e-vignette tied to the number plate. Alpine road tunnels are included; the car-carrying rail tunnels are separate and paid per crossing.",
  fuelNote:
    "Bleifrei 95 and 98 unleaded and diesel, sold per litre. Motorway service stations are noticeably dearer than town filling stations, and many rural pumps are card-only overnight.",
};

/** Speed limits. A posted sign always overrides these statutory defaults. */
export const SPEED_LIMITS = [
  {
    id: "encounter",
    label: "Begegnungszone (encounter zone)",
    kmh: 20,
    note: "Pedestrians have priority over vehicles and may use the whole width of the street.",
  },
  {
    id: "zone30",
    label: "Tempo-30-Zone",
    kmh: 30,
    note: "Very widespread in residential quarters. Priority from the right applies throughout unless signed otherwise.",
  },
  {
    id: "urban",
    label: "Inside built-up areas",
    kmh: 50,
    note: "The default from the town-name sign onward, with no further signing needed.",
  },
  {
    id: "rural",
    label: "Outside built-up areas",
    kmh: 80,
    note: "The default on ordinary roads once you leave a village. Mountain passes are frequently signed lower.",
  },
  {
    id: "expressway",
    label: "Expressways (Autostrasse, green signs)",
    kmh: 100,
    note: "Dual carriageways signed green. They still require the vignette.",
  },
  {
    id: "motorway",
    label: "Motorways (Autobahn, blue signs)",
    kmh: 120,
    note: "The national maximum. Blue signs mark the motorway network; green marks expressways.",
  },
];

/** Which alcohol limit applies depends on the licence category, not on age. */
export const DRIVER_CATEGORIES = [
  {
    id: "ordinary",
    label: "Ordinary licence, held more than three years",
    bacLimit: STANDARD_BAC_LIMIT_PCT,
    category: "Standard limit",
    reason: "0.5 per mille is the limit for a driver on a full licence outside the probationary period.",
  },
  {
    id: "probationary",
    label: "Probationary licence (first three years)",
    bacLimit: RESTRICTED_BAC_LIMIT_PCT,
    category: "Effectively zero",
    reason:
      "Drivers inside the three-year Führerausweis auf Probe are held to 0.1 per mille, which the law describes as an alcohol ban rather than a limit.",
  },
  {
    id: "learner",
    label: "Learner driver or accompanying instructor",
    bacLimit: RESTRICTED_BAC_LIMIT_PCT,
    category: "Effectively zero",
    reason:
      "Learner drivers and the qualified person supervising them are both held to 0.1 per mille.",
  },
  {
    id: "professional",
    label: "Professional driver (coach, lorry, taxi)",
    bacLimit: RESTRICTED_BAC_LIMIT_PCT,
    category: "Effectively zero",
    reason: "Professional drivers carrying passengers or goods are held to 0.1 per mille on duty.",
  },
];

export const LICENCE_ORIGINS = [
  {
    id: "eu_efta",
    label: "EU or EFTA country",
    needsIdp: false,
    residentGraceDays: 365,
    summary:
      "Fully recognised. After 12 months of residence you must exchange it for a Swiss licence, which is a formality for EU and EFTA holders.",
  },
  {
    id: "latin_script",
    label: "Non-EU country, licence in a Latin script",
    needsIdp: false,
    residentGraceDays: 365,
    summary:
      "Accepted for visitors. An International Driving Permit is not compulsory but removes any argument at a roadside check.",
  },
  {
    id: "non_latin_script",
    label: "Non-EU country, licence in a non-Latin script",
    needsIdp: true,
    residentGraceDays: 365,
    summary:
      "Carry a 1949 Geneva Convention International Driving Permit or a certified translation with the original — police cannot read the licence otherwise.",
  },
  {
    id: "swiss",
    label: "Swiss licence",
    needsIdp: false,
    residentGraceDays: null,
    summary: "Valid until its printed expiry date.",
  },
];

export const EQUIPMENT = [
  ["Warning triangle", "Compulsory, and it must be reachable from inside the cabin rather than buried in the boot."],
  ["Motorway vignette", `CHF ${VIGNETTE_PRICE_CHF} for the year, required on every motorway and expressway. Driving on one without it costs the CHF ${VIGNETTE_FINE_CHF} fine plus the price of the vignette.`],
  ["Dipped headlights", "On at all times, day and night, all year round. A separate fine applies for driving without them."],
  ["First-aid kit and hi-vis vest", "Strongly recommended and required in neighbouring countries, though for a car they are not legally compulsory in Switzerland itself."],
  ["Snow chains", "Not universally required, but a chain-obligation sign makes them compulsory on that stretch, and you are liable if unsuitable tyres block a mountain road."],
  ["No radar detector", "Carrying, fitting or using one is an offence in its own right, and live speed-camera alerts in navigation apps must be switched off."],
];

export const KEY_RULES = [
  [
    "Speeding can be a crime, not a fine",
    "Cross the Via Sicura threshold and you face at least a year's imprisonment, a two-year licence withdrawal and confiscation of the vehicle — a hire car included, which then becomes a civil claim against you.",
  ],
  [
    "Fines scale with income",
    "Serious traffic offences are punished with day-fines calculated from your income and assets, which is why Swiss speeding penalties occasionally make international news.",
  ],
  [
    "Uphill traffic has priority",
    "On a narrow mountain road the vehicle travelling uphill goes first, and the one coming down reverses to a passing place. A postal bus sounding its three-tone horn has absolute priority on signed mountain post roads.",
  ],
  [
    "Priority from the right",
    "At an unmarked junction, traffic coming from your right goes first — the same rule as Germany and France, and just as easy to forget in a Tempo-30 quarter.",
  ],
  [
    "Parking is colour-coded",
    "White bays are paid, blue bays are free for a limited time with a parking disc displayed on the dashboard, and yellow markings are private.",
  ],
  [
    "Signs change language by canton",
    "Directions appear in German, French, Italian or Romansh depending on where you are, and the language can switch mid-journey.",
  ],
  [
    "Tunnels have their own rules",
    "Dipped headlights on, keep the distance the roadside markers indicate, and never reverse or turn around. The Gotthard road tunnel imposes a queuing system in peak periods.",
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

/** One road class with both units. */
export function speedLimitFor(roadId) {
  const entry = SPEED_LIMITS.find((row) => row.id === roadId);
  if (!entry) return { error: "Unknown road type." };
  return {
    id: entry.id,
    label: entry.label,
    kmh: entry.kmh,
    mph: round(entry.kmh / KMH_PER_MPH, 0),
    note: entry.note,
  };
}

/** The full speed table. */
export function speedTable() {
  return SPEED_LIMITS.map((row) => speedLimitFor(row.id));
}

/**
 * The excess above a posted limit at which speeding becomes a Raserdelikt.
 * @returns {{error:string}|{postedKmh:number, excessKmh:number, raserAtKmh:number}}
 */
export function raserThreshold(postedKmh) {
  const posted = toNumber(postedKmh);
  if (Number.isNaN(posted)) return { error: "Enter the posted speed limit." };
  if (posted <= 0) return { error: "The posted limit must be greater than zero." };
  if (posted > 200) return { error: "Enter a posted limit of 200 km/h or lower." };
  const band = RASER_THRESHOLDS.find((row) => posted <= row.maxPostedKmh);
  return {
    postedKmh: posted,
    excessKmh: band.excessKmh,
    raserAtKmh: posted + band.excessKmh,
  };
}

/**
 * Classify a recorded speed against a posted limit under Swiss law.
 * @returns {{error:string}|object}
 */
export function speedOffenceCheck({ postedKmh, drivenKmh } = {}) {
  const threshold = raserThreshold(postedKmh);
  if (threshold.error) return { error: threshold.error };
  const driven = toNumber(drivenKmh);
  if (Number.isNaN(driven)) return { error: "Enter the speed you were driving." };
  if (driven < 0) return { error: "Speed cannot be negative." };
  if (driven > 500) return { error: "Enter a driven speed of 500 km/h or lower." };

  const excessKmh = round(driven - threshold.postedKmh, 1);
  const isRaser = driven >= threshold.raserAtKmh;
  const withinLimit = excessKmh <= 0;
  const marginToRaser = round(threshold.raserAtKmh - driven, 1);

  let classification;
  let consequence;
  if (withinLimit) {
    classification = "Within the posted limit";
    consequence = "No offence on these figures. Swiss cameras deduct a small measurement tolerance before a ticket is issued.";
  } else if (isRaser) {
    classification = "Raserdelikt — a crime, not an infringement";
    consequence = `At least ${RASER_MIN_PRISON_YEARS} year of imprisonment, licence withdrawal for at least ${RASER_MIN_LICENCE_WITHDRAWAL_YEARS} years, and confiscation of the vehicle. If it is a hire car, the rental company's loss becomes a civil claim against you.`;
  } else {
    classification = "Speeding offence";
    consequence = `A small excess is settled by fixed penalty. As it grows the case moves to the cantonal authority and then to court, where fines are calculated from your income and the licence is withdrawn for a period. You are ${marginToRaser} km/h below the Raser threshold on these figures.`;
  }

  return {
    postedKmh: threshold.postedKmh,
    drivenKmh: driven,
    excessKmh: withinLimit ? 0 : excessKmh,
    raserExcessKmh: threshold.excessKmh,
    raserAtKmh: threshold.raserAtKmh,
    marginToRaser: Math.max(0, marginToRaser),
    isRaser,
    withinLimit,
    classification,
    consequence,
  };
}

/**
 * Total cost of using a Swiss motorway without a vignette.
 * @returns {{error:string}|{vignetteCost:number, fine:number, total:number, message:string}}
 */
export function vignetteCost({ hasVignette = true, price = VIGNETTE_PRICE_CHF, fine = VIGNETTE_FINE_CHF } = {}) {
  const p = toNumber(price);
  const f = toNumber(fine);
  if (Number.isNaN(p) || Number.isNaN(f)) return { error: "Enter the vignette price and the fine." };
  if (p < 0 || f < 0) return { error: "Amounts cannot be negative." };
  if (p > 10000 || f > 100000) return { error: "Those amounts look far too high." };

  if (hasVignette) {
    return {
      vignetteCost: p,
      fine: 0,
      total: p,
      message: `One vignette at CHF ${p} covers the whole motorway and expressway network for the year, however many kilometres you drive.`,
    };
  }
  return {
    vignetteCost: p,
    fine: f,
    total: round(p + f, 2),
    message: `Using a motorway without a vignette costs the CHF ${f} fine plus the CHF ${p} vignette you still have to buy — CHF ${round(p + f, 2)} in total, and it is checked at the border.`,
  };
}

/** Which Swiss blood-alcohol limit applies to this driver. */
export function alcoholLimitFor({ driverCategory = "ordinary" } = {}) {
  const entry = DRIVER_CATEGORIES.find((row) => row.id === driverCategory) ?? DRIVER_CATEGORIES[0];
  return {
    limitBacPercent: entry.bacLimit,
    perMille: round(entry.bacLimit * 10, 2),
    category: entry.category,
    driverCategory: entry.label,
    reason: entry.reason,
    penalty:
      "From 0.5 per mille the licence is withdrawn for at least three months and a fine follows; from 0.8 per mille the offence is treated as serious, with a criminal record and a longer withdrawal. Anyone in the 0.1 per mille categories is treated as over the limit from the first drink.",
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
    standardDrinks: round(gramsAlcohol / STANDARD_DRINK_G, 1),
    peakBacPercent: round(peakBacPercent, 4),
    bacPercent: round(bacPercent, 4),
    perMille: round(bacPercent * 10, 3),
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
  if (age > 120) return { error: "Enter an age between 0 and 120." };
  if (days > 3650) return { error: "Enter a stay of 3650 days (10 years) or fewer." };

  const blockers = [];
  const warnings = [];

  if (age < COUNTRY.minimumDrivingAgeYears) {
    blockers.push(
      `You must be at least ${COUNTRY.minimumDrivingAgeYears} to drive a car in Switzerland, and a foreign licence held below that age does not entitle you to drive here.`,
    );
  } else if (age < 25) {
    warnings.push(
      `Swiss rental companies set their own minimum around ${COUNTRY.typicalRentalMinimumAgeYears} and add a young-driver surcharge below 25.`,
    );
  }

  if (origin.needsIdp) {
    warnings.push(
      "Carry a 1949 Geneva Convention International Driving Permit or a certified translation with the original licence.",
    );
  }

  if (origin.residentGraceDays != null && days > origin.residentGraceDays) {
    warnings.push(
      `A stay of ${days} days passes the ${origin.residentGraceDays}-day window. Once you are resident for twelve months the foreign licence must be exchanged for a Swiss one at the cantonal road traffic office.`,
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
  const permit = permitCheck(input);
  if (permit.error) return { error: permit.error };

  return {
    country: COUNTRY,
    alcohol: alcoholLimitFor(input),
    permit,
    speeds: speedTable(),
    equipment: EQUIPMENT,
    keyRules: KEY_RULES,
  };
}
