/**
 * Driving in the UAE — rules reference and visitor trip check.
 *
 * Two rules matter more than everything else here, and both surprise visitors.
 *
 * ALCOHOL IS ZERO, NOT LOW. There is no permitted blood-alcohol concentration for a driver in the
 * United Arab Emirates. Any detectable alcohol is the offence, so the arithmetic that works in
 * Europe — one drink, wait two hours — has no application. Consequences run to a fine in the tens
 * of thousands of dirhams, imprisonment, vehicle impoundment, licence suspension and, for an
 * expatriate, possible deportation. Your motor insurance is void the moment alcohol is involved,
 * so a collision becomes a personal liability for the whole loss.
 *
 * WHETHER YOUR LICENCE WORKS DEPENDS ON YOUR VISA, NOT YOUR COUNTRY. A tourist from one of the
 * roughly fifty approved countries may drive a rental car on their home licence. Once you hold a
 * UAE residence visa, that stops being true immediately: a resident must hold a UAE licence, and
 * the foreign licence is no longer accepted for any vehicle. People are caught by this in the
 * weeks after their residence visa is stamped.
 *
 * Other rules encoded below:
 *  - Speed limits are 60 to 80 km/h on urban roads, 100 to 120 km/h on highways, and 140 km/h on
 *    designated sections of the Abu Dhabi to Dubai E11 — the highest limit in the country.
 *  - Dubai removed its 20 km/h enforcement buffer in 2018 and cameras trigger at the posted
 *    figure, so the safe assumption anywhere in the UAE is that there is no grace margin.
 *  - The black point system suspends a licence at 24 points accumulated within 12 months.
 *  - Seatbelts have been compulsory in every seat since 1 July 2017; a child under four needs an
 *    approved seat, and a child under ten may not travel in the front.
 *  - Tailgating, rude gestures and road rage are specific offences, prosecutable rather than
 *    merely finable, and an expatriate can be deported for them.
 *
 * The alcohol section of this tool deliberately estimates only how long until you reach ZERO,
 * because zero is the only lawful figure.
 */

/** Exact international mile definition: 1 mile = 1.609344 km. */
export const KMH_PER_MPH = 1.609344;

/** Density of pure ethanol at 20 degrees C, grams per millilitre. */
export const ETHANOL_DENSITY_G_PER_ML = 0.789;

/** Widmark distribution factor r (fraction of body mass acting as body water). */
export const WIDMARK_R = { male: 0.68, female: 0.55, average: 0.615 };

/** Average ethanol elimination rate, percentage points of BAC per hour. */
export const BAC_ELIMINATION_PCT_PER_HOUR = 0.015;

/** No national standard drink is published, so the WHO default of 10 g is used. */
export const STANDARD_DRINK_G = 10;

/** There is no permitted concentration. Zero is the limit. */
export const BAC_LIMIT_PCT = 0;

/** Black points that suspend a licence when accumulated inside 12 months. */
export const BLACK_POINT_SUSPENSION_THRESHOLD = 24;

/** Rolling window over which black points are counted. */
export const BLACK_POINT_WINDOW_MONTHS = 12;

export const COUNTRY = {
  name: "the UAE",
  shortName: "UAE",
  localName: "الإمارات العربية المتحدة",
  driveSide: "right",
  steeringWheelSide: "left",
  speedUnit: "km/h",
  minimumDrivingAgeYears: 18,
  typicalRentalMinimumAgeYears: 21,
  emergencyNumbers: [
    ["999", "Police"],
    ["998", "Ambulance"],
    ["997", "Civil Defence and fire"],
    ["996", "Coastguard"],
  ],
  tolls:
    "Salik gates in Dubai and Darb gates in Abu Dhabi charge automatically as you pass, with no barrier and no way to opt out. Dubai moved to variable peak and off-peak pricing in 2025. Rental firms bill each crossing plus an administration fee.",
  fuelNote:
    "E-Plus 91, Special 95, Super 98 and diesel, sold per litre at prices the Ministry of Energy reviews monthly. Attendants fill the tank for you — self-service is uncommon.",
};

/** Speed limits. A posted sign, and the variable gantry signs, always override these. */
export const SPEED_LIMITS = [
  {
    id: "residential",
    label: "Residential streets and community roads",
    kmh: 40,
    note: "Signed 25 to 40 km/h inside gated communities, with speed humps and camera enforcement.",
  },
  {
    id: "urban",
    label: "Urban roads",
    kmh: 60,
    note: "The common limit on city streets in Dubai, Abu Dhabi and Sharjah.",
  },
  {
    id: "arterial",
    label: "Main city arterial roads",
    kmh: 80,
    note: "Roads such as Al Khail and Emirates Road within the urban stretch.",
  },
  {
    id: "highway",
    label: "Inter-city highways",
    kmh: 120,
    note: "Sheikh Zayed Road and most inter-emirate routes, signed 100 or 120 km/h.",
  },
  {
    id: "e11_max",
    label: "Designated sections of the E11 (Abu Dhabi to Dubai)",
    kmh: 140,
    note: "The highest posted limit in the country, on designated stretches only. It reverts to 120 km/h without much warning.",
  },
];

/**
 * Whether a foreign licence is accepted depends on visa status first and country second.
 */
export const RESIDENCY_STATUSES = [
  { id: "tourist", label: "Visitor or tourist (no UAE residence visa)" },
  { id: "resident", label: "UAE residence visa holder" },
];

export const LICENCE_ORIGINS = [
  {
    id: "approved",
    label: "Approved country (UK, EU, USA, Canada, Australia, NZ, Japan, South Korea, Singapore, China, South Africa, GCC and others)",
    touristAccepted: true,
    needsIdp: false,
    summary:
      "As a visitor you may drive a rental car on this licence. The approved list runs to roughly fifty countries and is revised, so confirm yours with the rental company before you travel.",
  },
  {
    id: "other",
    label: "A country not on the approved list",
    touristAccepted: true,
    needsIdp: true,
    summary:
      "You need an International Driving Permit carried with the original licence. Without it a rental company cannot legally hand you the keys.",
  },
  {
    id: "uae",
    label: "A UAE driving licence",
    touristAccepted: true,
    needsIdp: false,
    summary: "Valid throughout the UAE until its printed expiry date.",
  },
];

export const EQUIPMENT = [
  ["Seatbelts in every seat", "Compulsory for driver and every passenger since 1 July 2017, with a fine and black points for each unbelted occupant."],
  ["Child seats", "An approved child seat is required for a child under four, and a child under ten may not travel in the front seat."],
  ["Licence, permit and passport copy", "Police stops are quick and document checks are routine. Rental firms expect the licence, the permit if needed, and a passport or Emirates ID."],
  ["Warning triangle and spare wheel", "Checked at the annual roadworthiness test and expected in every vehicle. A rental will have them — find them before you need them."],
  ["No alcohol in the car through Sharjah", "Sharjah is dry. Carrying alcohol through the emirate is an offence even if you bought it lawfully in Dubai, and the E311 and E611 both cross it."],
  ["Fog kit is your headlights", "Winter fog closes roads with almost no warning. Variable gantry signs drop the limit sharply and hazard lights while moving are prohibited."],
];

export const KEY_RULES = [
  [
    "Zero alcohol means zero",
    "There is no permitted concentration for a driver. One drink is the offence, and insurance is void the moment alcohol is involved, so a collision becomes your personal liability in full.",
  ],
  [
    "No enforcement buffer",
    "Dubai removed the 20 km/h grace margin in 2018 and cameras trigger at the posted figure. Assume a zero buffer everywhere in the country.",
  ],
  [
    "Flashing headlights from behind",
    "It is a demand to move right immediately, not a greeting. The left lane is treated as an overtaking lane and lingering in it draws both aggression and a ticket.",
  ],
  [
    "Tailgating is a named offence",
    "Following too closely carries a substantial fine and black points in its own right, and it is one of the offences most often caught on camera.",
  ],
  [
    "Road rage is criminal, not just rude",
    "An obscene gesture or an aggressive confrontation can be prosecuted, and an expatriate convicted of it can be deported. Dashcam footage submitted through the police app is routinely acted on.",
  ],
  [
    "Fines follow the number plate",
    "Speed and camera fines attach to the vehicle, so a rental company will charge them to your card weeks after you fly home, usually with a handling fee on top.",
  ],
  [
    "Black points stack toward suspension",
    "Twenty-four points inside twelve months suspends the licence, and serious offences also allow the vehicle to be impounded on the spot.",
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
 * How close an accumulated black point total is to suspension.
 * @returns {{error:string}|{points:number, remaining:number, suspended:boolean, percentOfThreshold:number, message:string}}
 */
export function blackPointStatus(points, threshold = BLACK_POINT_SUSPENSION_THRESHOLD) {
  const value = toNumber(points);
  const limit = toNumber(threshold);
  if (Number.isNaN(value) || Number.isNaN(limit)) return { error: "Enter a number of black points." };
  if (value < 0) return { error: "Black points cannot be negative." };
  if (!(limit > 0)) return { error: "The suspension threshold must be greater than zero." };
  if (value > 500) return { error: "Enter a black point total of 500 or fewer." };

  const suspended = value >= limit;
  const remaining = Math.max(0, limit - value);
  return {
    points: value,
    threshold: limit,
    remaining,
    suspended,
    percentOfThreshold: round((value / limit) * 100, 1),
    message: suspended
      ? `${value} points reaches the ${limit}-point threshold, so the licence is suspended.`
      : `${remaining} more point${remaining === 1 ? "" : "s"} inside the ${BLACK_POINT_WINDOW_MONTHS}-month window would suspend the licence.`,
  };
}

/** The UAE alcohol rule, stated plainly, because there is no threshold to compute against. */
export function alcoholLimitFor() {
  return {
    limitBacPercent: BAC_LIMIT_PCT,
    category: "Zero tolerance",
    reason:
      "There is no permitted blood-alcohol concentration for a driver in the UAE. Any detectable alcohol is the offence, whatever your age, licence type or experience.",
    penalty:
      "Fines in the tens of thousands of dirhams, imprisonment, vehicle impoundment and licence suspension, with deportation possible for an expatriate. Motor insurance is void where alcohol is involved, so the entire cost of a collision falls on you.",
  };
}

/**
 * Widmark blood-alcohol estimate. Pure — pass the elapsed time in, never read a clock.
 * In the UAE the useful output is hoursToZero, because zero is the legal figure.
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
    hoursToZero: round(bacPercent / BAC_ELIMINATION_PCT_PER_HOUR, 1),
    overLimit: bacPercent > BAC_LIMIT_PCT,
  };
}

/** Hours until an estimated BAC falls to the applicable legal limit — which here is zero. */
export function hoursUntilLegal(bacPercent, limitBacPercent = BAC_LIMIT_PCT) {
  const bac = toNumber(bacPercent);
  const limit = toNumber(limitBacPercent);
  if (Number.isNaN(bac) || Number.isNaN(limit)) return { error: "Need a BAC estimate and a limit." };
  if (bac <= limit) return { hours: 0, alreadyUnder: true };
  return {
    hours: round((bac - limit) / BAC_ELIMINATION_PCT_PER_HOUR, 1),
    alreadyUnder: false,
  };
}

/** Paperwork check — visa status decides this before the country of issue does. */
export function permitCheck({ licenceOrigin, residencyStatus = "tourist", ageYears } = {}) {
  const origin = LICENCE_ORIGINS.find((row) => row.id === licenceOrigin) ?? LICENCE_ORIGINS[0];
  const residency = RESIDENCY_STATUSES.find((row) => row.id === residencyStatus) ?? RESIDENCY_STATUSES[0];
  const age = toNumber(ageYears);
  if (Number.isNaN(age)) return { error: "Enter your age." };
  if (age < 0 || age > 120) return { error: "Enter an age between 0 and 120." };

  const blockers = [];
  const warnings = [];

  if (age < COUNTRY.minimumDrivingAgeYears) {
    blockers.push(
      `The minimum driving age in the UAE is ${COUNTRY.minimumDrivingAgeYears}, and a foreign licence held below that age does not entitle you to drive here.`,
    );
  }

  const isResident = residency.id === "resident";
  const usingForeignLicence = origin.id !== "uae";

  if (isResident && usingForeignLicence) {
    blockers.push(
      "Once you hold a UAE residence visa your foreign licence stops being accepted, whatever country issued it. A resident must obtain a UAE driving licence — by transfer if your country qualifies, or by test if it does not.",
    );
  }

  if (!isResident && origin.needsIdp) {
    warnings.push(
      "Your licence is not on the approved list, so carry an International Driving Permit with the original. A rental company cannot hand over keys without it.",
    );
  }

  if (!isResident && origin.id === "approved") {
    warnings.push(
      "The approved-country list is revised periodically. Confirm with your rental company that your country is still on it before you fly.",
    );
  }

  if (age >= COUNTRY.minimumDrivingAgeYears && age < COUNTRY.typicalRentalMinimumAgeYears) {
    warnings.push(
      `Rental companies in the UAE generally set their own minimum at ${COUNTRY.typicalRentalMinimumAgeYears}, and premium and sports categories often require 25.`,
    );
  }

  return {
    origin,
    residency,
    canDrive: blockers.length === 0,
    needsIdp: !isResident && origin.needsIdp,
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
    alcohol: alcoholLimitFor(),
    permit,
    speeds: speedTable(),
    equipment: EQUIPMENT,
    keyRules: KEY_RULES,
  };
}
