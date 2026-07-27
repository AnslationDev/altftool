/**
 * Driving in Thailand — rules reference and visitor trip check.
 *
 * The rule that costs visitors the most money has nothing to do with speed. Thai law requires a
 * licence valid for the CLASS of vehicle you are using, and a car licence does not cover a
 * motorbike. Renting a scooter on a car licence leaves you unlicensed, which voids both the
 * compulsory insurance and almost every travel insurance policy — so a hospital bill after a
 * scooter accident lands on you in full. That check is built into this tool.
 *
 * Rule sources encoded below:
 *  - Land Traffic Act B.E. 2522 and the 2021 ministerial regulation on speed: 80 km/h inside
 *    municipal areas, 90 km/h outside them, and up to 120 km/h for cars on designated four-lane
 *    motorway and highway sections, where a 100 km/h MINIMUM also applies in the right-hand lane.
 *  - Ministerial regulation on alcohol (2017): 50 mg per 100 ml of blood (0.05 %) for ordinary
 *    licence holders, cut to 20 mg per 100 ml (0.02 %) for drivers under 20, for holders of a
 *    temporary or probationary licence, and for anyone driving without a valid licence or while
 *    suspended.
 *  - Helmets are compulsory for BOTH rider and pillion passenger on a motorcycle.
 *  - Seatbelts are compulsory in every seat following the Land Traffic Act amendment that took
 *    effect in September 2022, with an approved restraint for children under six.
 *  - Compulsory third-party insurance (Por Ror Bor) must be current on every registered vehicle
 *    and covers only limited medical costs, so voluntary cover is what actually protects you.
 *  - Thailand is a party to both the 1949 Geneva and the 1968 Vienna conventions on road traffic,
 *    so an International Driving Permit of either type is accepted alongside your home licence.
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

/** Thailand publishes no national standard drink, so the WHO default of 10 g is used. */
export const STANDARD_DRINK_G = 10;

/** 50 mg per 100 ml of blood for an ordinary licence holder. */
export const STANDARD_BAC_LIMIT_PCT = 0.05;

/** 20 mg per 100 ml for under-20s, probationary holders and unlicensed drivers. */
export const REDUCED_BAC_LIMIT_PCT = 0.02;

/** Minimum speed in the right-hand lane of a designated 120 km/h section. */
export const MOTORWAY_MINIMUM_KMH = 100;

export const COUNTRY = {
  name: "Thailand",
  localName: "ประเทศไทย",
  driveSide: "left",
  steeringWheelSide: "right",
  speedUnit: "km/h",
  minimumDrivingAgeYears: 18,
  minimumMotorcycleAgeYears: 15,
  typicalRentalMinimumAgeYears: 21,
  drinkingAgeYears: 20,
  emergencyNumbers: [
    ["191", "Police"],
    ["1669", "Emergency medical services and ambulance"],
    ["1155", "Tourist Police — English-speaking"],
    ["1193", "Highway Police, for motorways and inter-city routes"],
  ],
  tolls:
    "Bangkok's elevated expressways and inter-city motorways 7 and 9 are tolled, with both cash lanes and Easy Pass transponders. Ordinary national highways are free.",
  fuelNote:
    "Gasohol 91, Gasohol 95, E20, E85 and diesel (B7 and B20), sold per litre and pumped by an attendant. Check which grade the rental agreement allows — E85 damages engines not built for it.",
};

/** Speed limits for cars. `minimumKmh` marks a lane where driving too slowly is also an offence. */
export const SPEED_LIMITS = [
  {
    id: "school",
    label: "School and community zones where signed",
    kmh: 30,
    note: "Signed around schools, temples and markets, and enforced by local police rather than cameras.",
  },
  {
    id: "municipal",
    label: "Inside municipal areas, including Bangkok and Pattaya",
    kmh: 80,
    note: "The urban limit under the 2021 ministerial regulation. Many inner-city streets are signed lower.",
  },
  {
    id: "rural",
    label: "Outside municipal areas",
    kmh: 90,
    note: "The default on national highways once you leave a built-up area.",
  },
  {
    id: "motorway",
    label: "Designated four-lane motorway and highway sections",
    kmh: 120,
    minimumKmh: MOTORWAY_MINIMUM_KMH,
    note: `Raised to 120 km/h for cars in 2021 on designated sections, with a ${MOTORWAY_MINIMUM_KMH} km/h MINIMUM in the right-hand lane — driving slowly in it is itself an offence.`,
  },
  {
    id: "expressway",
    label: "Bangkok elevated expressways",
    kmh: 80,
    note: "80 km/h on the tolled urban expressway network, camera-enforced.",
  },
];

/** Licence status decides which alcohol limit applies. */
export const LICENCE_STATUSES = [
  {
    id: "full",
    label: "Full driving licence (yours or a Thai five-year licence)",
    bacLimit: STANDARD_BAC_LIMIT_PCT,
    category: "Ordinary limit",
  },
  {
    id: "probationary",
    label: "Temporary or probationary licence (the Thai two-year licence)",
    bacLimit: REDUCED_BAC_LIMIT_PCT,
    category: "Reduced limit",
  },
  {
    id: "none",
    label: "No valid licence, or suspended",
    bacLimit: REDUCED_BAC_LIMIT_PCT,
    category: "Reduced limit",
  },
];

export const VEHICLE_TYPES = [
  { id: "car", label: "Car or pickup", minimumAge: 18, needsMotorcycleEntitlement: false },
  { id: "motorcycle", label: "Motorbike or scooter", minimumAge: 15, needsMotorcycleEntitlement: true },
];

export const LICENCE_ORIGINS = [
  {
    id: "idp",
    label: "Home licence plus an International Driving Permit (1949 or 1968)",
    accepted: true,
    summary:
      "Thailand is a party to both road traffic conventions, so either type of permit is accepted when carried with the original licence.",
  },
  {
    id: "asean",
    label: "Licence issued by an ASEAN member state",
    accepted: true,
    summary:
      "Recognised under the ASEAN Mutual Recognition Arrangement on driving licences, without a separate permit.",
  },
  {
    id: "thai",
    label: "Thai driving licence",
    accepted: true,
    summary: "Valid until its printed expiry — two years for a first licence, five years on renewal.",
  },
  {
    id: "home_only",
    label: "Home licence only, no International Driving Permit",
    accepted: false,
    summary:
      "Not sufficient. You are treated as unlicensed, which is a fineable offence and, far more expensively, gives your insurer grounds to decline a claim.",
  },
];

export const EQUIPMENT = [
  ["Helmets", "Compulsory for the rider AND the pillion passenger on any motorcycle. Checkpoint fines for a bare-headed passenger are among the most common tickets issued to visitors."],
  ["Seatbelts in every seat", "Compulsory in all seating positions since the September 2022 amendment, with an approved child restraint for children under six."],
  ["Compulsory insurance certificate", "The Por Ror Bor certificate must be current on the vehicle. It covers only limited medical costs — voluntary cover is what actually protects you."],
  ["Licence, permit and passport", "Police checkpoints are routine on tourist routes. Carry the original licence, the International Driving Permit and a copy of your passport."],
  ["Vehicle registration book", "The blue registration book or a certified copy stays with the vehicle; rental firms should provide it."],
  ["No mandatory warning kit", "Thailand does not require a warning triangle, first-aid kit or high-visibility vest in a private car, though a triangle is sensible on highways."],
];

export const KEY_RULES = [
  [
    "A car licence does not cover a scooter",
    "Renting a motorbike on a car-only licence leaves you unlicensed. Compulsory insurance and almost every travel policy exclude an unlicensed rider, and motorcycle injuries are the single largest category of tourist medical claims in Thailand.",
  ],
  [
    "Flashing headlights mean the opposite of Europe",
    "In Thailand an oncoming driver flashing at you is claiming the space — 'I am coming through' — not offering it. Read it as a warning, never as an invitation.",
  ],
  [
    "Turning left on red is not automatic",
    "You may only turn left on a red light where a sign specifically permits it. Elsewhere a red light means stop, whichever way you are going.",
  ],
  [
    "U-turns instead of right turns",
    "On divided highways you generally cannot turn right across the carriageway. You drive past your turning to a U-turn bridge or gap and come back, which is why Thai satnav routes look odd.",
  ],
  [
    "Size sets the pecking order",
    "In practice buses and trucks take the space and expect smaller vehicles to yield, regardless of the formal right of way. Defensive driving matters more here than knowing who is technically right.",
  ],
  [
    "Refusing a breath test counts against you",
    "A refusal is treated as an admission for the purposes of the offence, so there is nothing to gain by declining one.",
  ],
  [
    "Rainy season flooding",
    "From roughly May to October, sudden flooding can put a foot of water across a road in minutes. Rental insurance commonly excludes water damage to the engine.",
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
    minimumKmh: entry.minimumKmh ?? null,
    note: entry.note,
  };
}

/** The full speed table. */
export function speedTable() {
  return SPEED_LIMITS.map((row) => speedLimitFor(row.id));
}

/**
 * Which Thai blood-alcohol limit applies. Age and licence status both pull it down to 0.02 %.
 */
export function alcoholLimitFor({ ageYears, licenceStatus = "full" } = {}) {
  const age = toNumber(ageYears);
  if (Number.isNaN(age)) return { error: "Enter your age." };
  if (age < 0 || age > 120) return { error: "Enter an age between 0 and 120." };

  const status = LICENCE_STATUSES.find((row) => row.id === licenceStatus) ?? LICENCE_STATUSES[0];
  const underTwenty = age < 20;
  const limitBacPercent = underTwenty ? REDUCED_BAC_LIMIT_PCT : status.bacLimit;

  let reason;
  if (underTwenty) {
    reason = `Drivers under 20 are held to ${REDUCED_BAC_LIMIT_PCT} % (20 mg per 100 ml of blood) under the 2017 ministerial regulation, whatever licence they hold.`;
  } else if (status.bacLimit === REDUCED_BAC_LIMIT_PCT) {
    reason = `Holders of a temporary or probationary licence, and anyone driving without a valid licence, are held to ${REDUCED_BAC_LIMIT_PCT} % rather than the ordinary ${STANDARD_BAC_LIMIT_PCT} %.`;
  } else {
    reason = `${STANDARD_BAC_LIMIT_PCT} % (50 mg per 100 ml of blood) is the limit for an ordinary licence holder aged 20 or over.`;
  }

  const notes = [];
  if (age < COUNTRY.drinkingAgeYears) {
    notes.push(
      `The legal drinking age in Thailand is ${COUNTRY.drinkingAgeYears}, so buying alcohol at all is an offence for you before that birthday.`,
    );
  }

  return {
    limitBacPercent,
    limitMgPer100Ml: round(limitBacPercent * 1000, 0),
    category: underTwenty ? "Reduced limit (under 20)" : status.category,
    licenceStatus: status.label,
    reason,
    penalty:
      "A first drink-driving offence carries up to a year's imprisonment, a fine of 10,000 to 20,000 baht, and a licence suspension of at least six months. Refusing a breath test is treated as an admission of guilt.",
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
    standardDrinks: round(gramsAlcohol / STANDARD_DRINK_G, 1),
    peakBacPercent: round(peakBacPercent, 4),
    bacPercent: round(bacPercent, 4),
    mgPer100Ml: round(bacPercent * 1000, 1),
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

/**
 * Paperwork check for a visitor. The vehicle class matters as much as the document here,
 * because a car licence carries no motorcycle entitlement.
 */
export function permitCheck({
  licenceOrigin,
  vehicleType = "car",
  motorcycleEntitlement = false,
  ageYears,
  stayDays,
} = {}) {
  const origin = LICENCE_ORIGINS.find((row) => row.id === licenceOrigin) ?? LICENCE_ORIGINS[0];
  const vehicle = VEHICLE_TYPES.find((row) => row.id === vehicleType) ?? VEHICLE_TYPES[0];
  const age = toNumber(ageYears);
  const days = toNumber(stayDays);
  if (Number.isNaN(age) || Number.isNaN(days)) return { error: "Enter your age and the length of your stay." };
  if (age < 0 || days < 0) return { error: "Age and stay length cannot be negative." };
  if (days > 3650) return { error: "Enter a stay of 3650 days (10 years) or fewer." };

  const blockers = [];
  const warnings = [];

  if (age < vehicle.minimumAge) {
    blockers.push(
      `The minimum age for a ${vehicle.label.toLowerCase()} in Thailand is ${vehicle.minimumAge}, and a foreign licence held below that age does not entitle you to drive here.`,
    );
  }

  if (!origin.accepted) {
    blockers.push(
      "A home licence alone is not accepted. Without an International Driving Permit you are unlicensed in Thailand — a fineable offence, and grounds for your insurer to decline a claim.",
    );
  }

  if (vehicle.needsMotorcycleEntitlement && !motorcycleEntitlement) {
    blockers.push(
      "Your licence has no motorcycle entitlement, so you may not ride a scooter here. Compulsory insurance and virtually every travel policy exclude an unlicensed rider, which means a hospital bill after a crash falls on you in full.",
    );
  }

  if (origin.accepted && days > 365) {
    warnings.push(
      `A stay of ${days} days is long enough that Thai authorities expect a resident to hold a Thai licence. Converting is straightforward on a long-stay visa and removes any argument at a checkpoint.`,
    );
  }

  if (age >= vehicle.minimumAge && age < COUNTRY.typicalRentalMinimumAgeYears) {
    warnings.push(
      `Car rental companies commonly set their own minimum at ${COUNTRY.typicalRentalMinimumAgeYears} and add a young-driver surcharge below 25, even where the law allows you to drive.`,
    );
  }

  if (vehicle.id === "motorcycle") {
    warnings.push(
      "Helmets are compulsory for the rider and the pillion passenger, and checkpoint stops on tourist routes are routine.",
    );
  }

  return {
    origin,
    vehicle,
    accepted: origin.accepted,
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
    speeds: speedTable(),
    equipment: EQUIPMENT,
    keyRules: KEY_RULES,
  };
}
