/**
 * Driving in Spain — rules reference and visitor trip check.
 *
 * Rule sources encoded below:
 *  - Real Decreto 970/2020, in force since 11 May 2021, sets the urban ladder:
 *    20 km/h where the carriageway and pavement share one platform, 30 km/h on
 *    streets with a single lane in each direction, 50 km/h where there are two
 *    or more lanes in each direction.
 *  - Reglamento General de Circulación art. 48: 120 km/h on autopistas and
 *    autovías, 90 km/h for cars on ordinary carreteras convencionales.
 *  - Reglamento General de Circulación art. 48: a car towing a trailer is
 *    capped at 90 km/h on motorways and 70 km/h on conventional roads.
 *  - Reglamento General de Circulación art. 20 and Ley sobre Tráfico art. 14:
 *    0.5 g per litre of blood / 0.25 mg per litre of breath in general, and
 *    0.3 g/l / 0.15 mg/l for drivers whose licence is under two years old and
 *    for professional drivers.
 *  - Código Penal art. 379.2: above 0.60 mg per litre of breath drink-driving is
 *    a criminal offence, not an administrative one.
 *  - Since 1 January 2026 the connected V-16 beacon replaces the warning
 *    triangle as the breakdown signal for vehicles registered in Spain.
 *  - Children shorter than 135 cm must use an approved restraint and must
 *    travel in the rear seats.
 *
 * Blood alcohol estimation uses the Widmark equation (E.M.P. Widmark, 1932).
 */

/** Exact international mile definition: 1 mile = 1.609344 km. */
export const KMH_PER_MPH = 1.609344;

/** Density of pure ethanol at 20 degrees C, grams per millilitre. */
export const ETHANOL_DENSITY_G_PER_ML = 0.789;

/** Widmark distribution factor r (fraction of body mass acting as body water). */
export const WIDMARK_R = { male: 0.68, female: 0.55, average: 0.615 };

/** Average ethanol elimination rate, percentage points of BAC per hour. */
export const BAC_ELIMINATION_PCT_PER_HOUR = 0.015;

/** Grams of ethanol in one European standard drink. */
export const STANDARD_DRINK_G = 10;

/** Spanish conversion: 0.5 g/l of blood equals 0.25 mg/l of breath. */
export const BLOOD_TO_BREATH_MG_PER_L = 0.5;

/** Years for which a Spanish licence holder counts as a conductor novel. */
export const NOVICE_YEARS = 2;

/** Breath reading above which drink-driving becomes a criminal offence. */
export const CRIMINAL_BREATH_MG_PER_L = 0.6;

export const COUNTRY = {
  name: "Spain",
  localName: "España",
  driveSide: "right",
  steeringWheelSide: "left",
  speedUnit: "km/h",
  minimumDrivingAgeYears: 18,
  typicalRentalMinimumAgeYears: 21,
  emergencyNumbers: [
    ["112", "Single European emergency number"],
    ["062", "Guardia Civil de Tráfico"],
    ["091", "Policía Nacional"],
  ],
  tolls:
    "Most AP motorways were made toll-free between 2018 and 2021, but tolls remain on parts of the AP-7 in Catalonia, the AP-8 and AP-68, and on several tunnels.",
  fuelNote:
    "Petrol is gasolina 95 or 98, diesel is gasóleo A. Many rural stations close at lunchtime and on Sundays.",
};

export const SPEED_LIMITS = [
  {
    id: "urban_shared",
    label: "City streets where road and pavement share one platform",
    kmh: 20,
    note: "The plataforma única streets common in old quarters — pedestrians have priority.",
  },
  {
    id: "urban_single",
    label: "City streets with one lane in each direction",
    kmh: 30,
    note: "Since May 2021 this is the default for the large majority of Spanish urban roads.",
  },
  {
    id: "urban_multi",
    label: "City roads with two or more lanes in each direction",
    kmh: 50,
    note: "Only the big multi-lane avenues keep the old 50 km/h default.",
  },
  {
    id: "conventional",
    label: "Carretera convencional (ordinary road outside town)",
    kmh: 90,
    towingKmh: 70,
    note: "90 km/h for cars regardless of the hard shoulder; 80 km/h for vans and 70 km/h with a trailer.",
  },
  {
    id: "autovia",
    label: "Autovía and autopista (blue-sign motorway)",
    kmh: 120,
    towingKmh: 90,
    note: "Minimum speed is 60 km/h, and the left lane is for overtaking only.",
  },
];

export const LICENCE_ORIGINS = [
  {
    id: "eu_eea",
    label: "EU / EEA country",
    needsIdp: false,
    validForDays: null,
    summary: "Recognised in full. Residents only need to register the licence with the DGT, not swap it.",
  },
  {
    id: "idp_country",
    label: "Non-EU country signed up to the 1949 or 1968 driving conventions",
    needsIdp: true,
    validForDays: 183,
    summary:
      "Drive on your national licence plus an International Driving Permit. Six months after you become resident the foreign licence stops being valid in Spain.",
  },
  {
    id: "convertible",
    label: "Country with a licence-exchange treaty with Spain",
    needsIdp: true,
    validForDays: 183,
    summary:
      "Carry an International Driving Permit as a visitor. As a resident you can exchange for a Spanish permiso de conducción without re-testing, within the first six months.",
  },
];

export const EQUIPMENT = [
  ["V-16 connected beacon", "Since 1 January 2026 the geolocated V-16 light is the legal breakdown signal for Spanish-registered vehicles; warning triangles no longer count."],
  ["Reflective vest", "Must be inside the cabin and worn before you step out on the hard shoulder."],
  ["Spare glasses", "Required if your licence carries a corrective-lens condition."],
  ["Child restraint", "Children under 135 cm need an approved seat or booster and must sit in the rear."],
  ["Documents", "Licence, permiso de circulación, ficha técnica and proof of insurance travel with the car."],
  ["Winter equipment", "Chains or winter tyres where the Guardia Civil signs a road as restricted in snow."],
];

export const KEY_RULES = [
  [
    "1.5 metres past a cyclist",
    "You must leave at least 1.5 m when overtaking a bike, and you may cross a solid line to do it. Passing too close costs €200 and 6 points.",
  ],
  [
    "Phones",
    "Simply holding a phone is an offence: €200 and 6 points, doubled to a heavier sanction if it causes an incident.",
  ],
  [
    "Pay early, pay half",
    "Traffic fines carry a 50% discount if you pay within 20 days, and non-resident drivers are routinely asked to pay at the roadside.",
  ],
  [
    "Radar warnings",
    "Devices that jam or detect speed cameras are banned; navigation apps that merely show fixed camera locations are allowed.",
  ],
  [
    "Low-emission zones",
    "Every Spanish city over 50,000 people is required to run a Zona de Bajas Emisiones. Madrid Central and Barcelona ZBE read plates automatically, and foreign plates must be pre-registered.",
  ],
  [
    "Hard-shoulder rules",
    "Stopping on the arcén is only for emergencies, and you must leave the vehicle from the passenger side and stand behind the barrier.",
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
  const kmh = fromUnit === "mph" ? speed * KMH_PER_MPH : speed;
  return { kmh: round(kmh, 1), mph: round(kmh / KMH_PER_MPH, 1) };
}

/** Effective speed limit for one road class under the selected conditions. */
export function speedLimitFor(roadId, conditions = {}) {
  const entry = SPEED_LIMITS.find((row) => row.id === roadId);
  if (!entry) return { error: "Unknown road type." };
  const candidates = [entry.kmh];
  if (conditions.towingTrailer && entry.towingKmh != null) candidates.push(entry.towingKmh);
  const kmh = Math.min(...candidates.filter((value) => value != null));
  return {
    id: entry.id,
    label: entry.label,
    kmh,
    mph: round(kmh / KMH_PER_MPH, 0),
    note: entry.note,
  };
}

/** The full speed table under one set of conditions. */
export function speedTable(conditions = {}) {
  return SPEED_LIMITS.map((row) => speedLimitFor(row.id, conditions));
}

/** Which Spanish blood-alcohol limit applies to this driver. */
export function alcoholLimitFor({ licenceHeldYears, professionalDriver, ageYears } = {}) {
  const age = toNumber(ageYears);
  const held = toNumber(licenceHeldYears);
  if (Number.isNaN(age) || Number.isNaN(held)) {
    return { error: "Enter your age and how long you have held your licence." };
  }
  if (age < 0 || held < 0) return { error: "Age and licence years cannot be negative." };
  if (held > age) return { error: "You cannot have held a licence for longer than you have been alive." };

  if (held < NOVICE_YEARS || professionalDriver) {
    return {
      limitBacPercent: 0.03,
      breathMgPerL: 0.15,
      category: "Reduced limit for novel and professional drivers",
      reason: professionalDriver
        ? "Professional drivers are held to 0.3 g per litre of blood, not 0.5."
        : `A licence under ${NOVICE_YEARS} years old makes you a conductor novel, limited to 0.3 g per litre.`,
      penalty:
        "Exceeding 0.15 mg/l of breath in this group is €500 and 4 points; from 0.30 mg/l it is €1,000 and 6 points.",
    };
  }
  return {
    limitBacPercent: 0.05,
    breathMgPerL: 0.25,
    category: "Standard limit",
    reason: "0.5 g per litre of blood applies to drivers who have held a licence for two years or more.",
    penalty:
      "0.25-0.50 mg/l of breath: €500 and 4 points. Above 0.50 mg/l: €1,000 and 6 points. Above 0.60 mg/l it becomes a criminal offence with up to 6 months' prison and a 1-4 year driving ban.",
  };
}

/** Widmark blood-alcohol estimate. Pure — pass the elapsed time in. */
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
  const breathMgPerL = round(bacPercent * 10 * BLOOD_TO_BREATH_MG_PER_L, 3);

  return {
    gramsAlcohol: round(gramsAlcohol, 1),
    standardDrinks: round(gramsAlcohol / STANDARD_DRINK_G, 1),
    peakBacPercent: round(peakBacPercent, 4),
    bacPercent: round(bacPercent, 4),
    gramsPerLitre: round(bacPercent * 10, 3),
    breathMgPerL,
    criminalRange: breathMgPerL > CRIMINAL_BREATH_MG_PER_L,
    hoursToZero: round(bacPercent / BAC_ELIMINATION_PCT_PER_HOUR, 1),
  };
}

/** Hours until an estimated BAC falls to the applicable legal limit. */
export function hoursUntilLegal(bacPercent, limitBacPercent) {
  const bac = toNumber(bacPercent);
  const limit = toNumber(limitBacPercent);
  if (Number.isNaN(bac) || Number.isNaN(limit)) return { error: "Need a BAC estimate and a limit." };
  if (bac <= limit) return { hours: 0, alreadyUnder: true };
  return { hours: round((bac - limit) / BAC_ELIMINATION_PCT_PER_HOUR, 1), alreadyUnder: false };
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
    blockers.push(`You must be at least ${COUNTRY.minimumDrivingAgeYears} to drive a car in Spain.`);
  } else if (age < COUNTRY.typicalRentalMinimumAgeYears) {
    warnings.push(
      `Legal to drive, but Spanish rental desks generally start at ${COUNTRY.typicalRentalMinimumAgeYears} and add a young-driver supplement below 25.`,
    );
  }

  if (origin.needsIdp) {
    warnings.push("Carry an International Driving Permit alongside your national licence.");
  }
  if (origin.validForDays != null && days > origin.validForDays) {
    warnings.push(
      `A stay of ${days} days passes the ${origin.validForDays}-day (six-month) window after which a non-EU licence stops being valid for residents. Arrange an exchange or the Spanish test at the Jefatura de Tráfico.`,
    );
  }

  return {
    origin,
    needsIdp: origin.needsIdp,
    recognitionDays: origin.validForDays,
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

  return {
    country: COUNTRY,
    alcohol,
    permit,
    novice: toNumber(input.licenceHeldYears) < NOVICE_YEARS,
    speeds: speedTable({ towingTrailer: Boolean(input.towingTrailer) }),
    equipment: EQUIPMENT,
    keyRules: KEY_RULES,
  };
}
