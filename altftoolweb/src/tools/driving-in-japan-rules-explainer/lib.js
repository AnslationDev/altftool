/**
 * Driving in Japan — rules reference and visitor trip check.
 *
 * Two things make Japan different from every other destination in this family.
 *
 * FIRST, THE PERMIT. Japan is a party to the 1949 Geneva Convention on Road Traffic and NOT to
 * the 1968 Vienna Convention. An International Driving Permit issued under the 1968 convention is
 * worthless here, however official it looks. Drivers from the handful of countries that issue
 * only 1968 permits — Switzerland, Germany, France, Belgium, Monaco, Slovenia and Taiwan — must
 * instead carry an official Japanese translation of their licence issued by JAF or by that
 * country's designated body in Japan. Driving without the right document is unlicensed driving,
 * not a paperwork slip.
 *
 * SECOND, THE ALCOHOL LIMIT AND WHO IT BINDS. The Road Traffic Act sets the drink-driving
 * threshold at 0.15 mg of alcohol per litre of breath, equivalent to roughly 0.03 g per 100 ml of
 * blood — well under half the European limit. Two separate offences exist: 酒気帯び運転, driving
 * with alcohol at or above that threshold, and 酒酔い運転, driving while actually impaired,
 * which can be charged at any concentration. Since the 2007 amendment the liability extends past
 * the driver: supplying the vehicle, supplying the alcohol, or simply riding as a passenger with
 * a driver you know has been drinking are all separate criminal offences.
 *
 * Other rules encoded below:
 *  - Road Traffic Act Enforcement Order art.11: 60 km/h is the general-road default where nothing
 *    is posted; art.27 sets 100 km/h on expressways, with designated sections raised to 120 km/h
 *    and an expressway minimum of 50 km/h.
 *  - Art.33: every vehicle must come to a COMPLETE stop before a railway crossing and check the
 *    line is clear, every time, whether or not a train is signalled.
 *  - Art.75-11: a vehicle stopped on an expressway must display a warning triangle.
 *  - Art.71-3: child restraints are compulsory for children under six, and seatbelts are
 *    compulsory in every seat, rear seats included.
 *  - There is no turn on red in Japan. A red light means stop, unless a separate blue arrow
 *    signal points the way you want to go.
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

/** A Japanese standard drink (1 unit) contains 10 g of pure alcohol. */
export const JP_STANDARD_DRINK_G = 10;

/** The statutory threshold: 0.15 mg of alcohol per litre of breath. */
export const BREATH_LIMIT_MG_PER_L = 0.15;

/** Equivalent blood concentration, g per 100 ml, at the standard 2100:1 blood-breath ratio. */
export const BLOOD_LIMIT_PCT = 0.03;

/** How long an International Driving Permit or translation is valid for in Japan. */
export const PERMIT_VALIDITY_DAYS = 365;

/** Leaving Japan for this long resets the one-year clock on a foreign permit. */
export const RESET_ABSENCE_DAYS = 90;

export const COUNTRY = {
  name: "Japan",
  localName: "日本",
  driveSide: "left",
  steeringWheelSide: "right",
  speedUnit: "km/h",
  minimumDrivingAgeYears: 18,
  typicalRentalMinimumAgeYears: 18,
  drinkingAgeYears: 20,
  emergencyNumbers: [
    ["110", "Police, including for a traffic accident"],
    ["119", "Fire and ambulance"],
    ["0570-00-8139", "JAF roadside assistance for a breakdown (short dial 8139)"],
  ],
  tolls:
    "Expressways are tolled end to end and the charges are substantial — Tokyo to Osaka runs to five figures in yen. Most lanes are ETC-only; ask the rental desk for an ETC card, or buy a regional expressway pass sold only to foreign visitors.",
  fuelNote:
    "レギュラー is regular petrol, ハイオク is high-octane, and 軽油 is DIESEL despite the kanji reading as 'light oil' — the single most expensive misreading a visitor can make at a Japanese pump. Sold per litre, often full-service.",
};

/** Speed limits. A posted sign always overrides these statutory defaults. */
export const SPEED_LIMITS = [
  {
    id: "zone30",
    label: "Zone 30 residential streets",
    kmh: 30,
    note: "Marked residential zones around schools and housing, common in every city.",
  },
  {
    id: "urban",
    label: "Urban streets, posted",
    kmh: 40,
    note: "Most city roads are signed 30 to 50 km/h. Japanese urban roads are narrow and often have no kerb separating pedestrians.",
  },
  {
    id: "general",
    label: "General roads where nothing is posted",
    kmh: 60,
    note: "The statutory default under the Road Traffic Act Enforcement Order. It is a ceiling, not a target.",
  },
  {
    id: "expressway_standard",
    label: "Expressways (standard)",
    kmh: 100,
    note: "The default limit on tolled expressways. Some mountain and urban sections are signed 80 km/h.",
  },
  {
    id: "expressway_raised",
    label: "Expressways, designated raised sections",
    kmh: 120,
    note: "Sections of the Shin-Tomei and Tohoku expressways carry 120 km/h — the highest limit in Japan.",
  },
  {
    id: "expressway_minimum",
    label: "Expressway minimum speed",
    kmh: 50,
    note: "Driving below 50 km/h on an expressway is itself an offence, outside of congestion.",
  },
];

/**
 * Licence recognition. `convention` records why the document is or is not accepted, because
 * this is the single most common reason a visitor is turned away at a Japanese rental desk.
 */
export const LICENCE_ORIGINS = [
  {
    id: "geneva_1949",
    label: "Country that issues a 1949 Geneva Convention IDP (UK, USA, Australia, Canada, India and most others)",
    accepted: true,
    document: "1949 Geneva Convention International Driving Permit",
    validityDays: PERMIT_VALIDITY_DAYS,
    summary:
      "Carry the permit together with your home licence and your passport. All three are checked at the rental desk and at a roadside stop.",
  },
  {
    id: "vienna_1968_only",
    label: "Switzerland, Germany, France, Belgium, Monaco, Slovenia or Taiwan",
    accepted: false,
    document: "Official Japanese translation of your licence from JAF or your country's designated body",
    validityDays: PERMIT_VALIDITY_DAYS,
    summary:
      "These countries issue only 1968 Vienna Convention permits, which Japan does not recognise. You need a Japanese translation instead — JAF issues them, and so do the designated embassies and associations for these countries.",
  },
  {
    id: "other_country",
    label: "A country that issues neither — no 1949 permit available",
    accepted: false,
    document: "A Japanese driving licence, obtained by conversion (gaimen kirikae) or by test",
    validityDays: null,
    summary:
      "Without a 1949 Geneva permit or an accepted translation there is no lawful way for a visitor to drive. You would have to convert your licence at a Japanese licence centre, which requires residency.",
  },
  {
    id: "japanese",
    label: "A Japanese driving licence",
    accepted: true,
    document: "Japanese driving licence",
    validityDays: null,
    summary: "Valid until its expiry date, shown on the card in the Japanese calendar.",
  },
];

/** Alcohol liability under the 2007 Road Traffic Act amendment falls on four roles, not one. */
export const ALCOHOL_ROLES = [
  {
    id: "driver_over",
    label: "Driving at or above the threshold (酒気帯び運転)",
    penalty:
      "Up to 3 years imprisonment or a fine of up to 500,000 yen, plus 13 to 25 demerit points — enough for an immediate licence suspension or revocation.",
  },
  {
    id: "driver_drunk",
    label: "Driving while actually impaired (酒酔い運転)",
    penalty:
      "Up to 5 years imprisonment or a fine of up to 1,000,000 yen and 35 demerit points, which revokes the licence outright. It can be charged at any concentration, including below the threshold.",
  },
  {
    id: "vehicle_provider",
    label: "Providing the vehicle to a driver who has been drinking",
    penalty:
      "The same range as the driver's own offence — up to 5 years imprisonment or 1,000,000 yen where the driver was impaired.",
  },
  {
    id: "alcohol_provider",
    label: "Serving the alcohol, or riding as a passenger",
    penalty:
      "Up to 3 years imprisonment or a fine of up to 500,000 yen. Getting into the car knowing the driver has been drinking is itself a criminal offence in Japan.",
  },
];

export const EQUIPMENT = [
  ["Warning triangle", "Legally required whenever you stop on an expressway. Rental cars carry one — find it before you need it."],
  ["Home licence, permit and passport", "All three must be in the car. A permit or translation on its own is not a licence."],
  ["Child restraints", "Compulsory for every child under six years old."],
  ["Seatbelts in every seat", "Including the rear seats, where enforcement on expressways is routine."],
  ["Winter tyres or chains", "Designated chain-obligation sections exist on mountain expressways and national routes during heavy snow, and studless winter tyres are the norm in Hokkaido and the Japan Sea side from December to March."],
  ["Shoshinsha and koreisha marks", "The green-and-yellow beginner mark and the four-leaf elderly-driver mark are displayed by local drivers. Give those cars extra room — cutting in on one is a specific offence."],
];

export const KEY_RULES = [
  [
    "No turning on red",
    "A red light means stop, full stop. Unlike the United States there is no turn on red anywhere in Japan unless a separate blue arrow signal points your way.",
  ],
  [
    "Complete stop at every railway crossing",
    "You must stop before the crossing, lower a window and check the line is clear — every crossing, every time, even with the barriers up and no train signalled.",
  ],
  [
    "Pedestrians have absolute priority",
    "At an unsignalled zebra crossing you must stop if anyone is waiting. Enforcement of this has been stepped up sharply and it is one of the most common tickets issued to visitors.",
  ],
  [
    "Drinking is a group offence",
    "Passengers, the person who lent the car and the person who poured the drink can all be prosecuted alongside the driver. This is why Japanese groups use a designated driver or a daiko service without discussion.",
  ],
  [
    "Roads are narrower than they look",
    "Ordinary residential streets carry two-way traffic at a width most visitors would call one lane, frequently with no pavement. Kei cars exist for a reason.",
  ],
  [
    "Parking must be paid for and proved",
    "Street parking is largely prohibited, coin lots are everywhere, and enforcement is contracted to private wardens who ticket within minutes.",
  ],
  [
    "Mobile phones",
    "Handling a phone while driving carries a fine in the tens of thousands of yen and three demerit points; causing danger by doing so is a criminal offence with up to a year's imprisonment.",
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
 * Japan's drink-driving threshold. It is the same for every driver regardless of age or
 * experience, so this function mainly explains what the number means and who else is liable.
 */
export function alcoholLimitFor({ ageYears } = {}) {
  const age = toNumber(ageYears);
  if (Number.isNaN(age)) return { error: "Enter your age." };
  if (age < 0 || age > 120) return { error: "Enter an age between 0 and 120." };

  const notes = [];
  if (age < COUNTRY.drinkingAgeYears) {
    notes.push(
      `The legal drinking age in Japan is ${COUNTRY.drinkingAgeYears}, so drinking at all is an offence for you before that birthday.`,
    );
  }

  return {
    limitBacPercent: BLOOD_LIMIT_PCT,
    breathMgPerL: BREATH_LIMIT_MG_PER_L,
    category: "One threshold for every driver",
    reason: `The Road Traffic Act sets the threshold at ${BREATH_LIMIT_MG_PER_L} mg of alcohol per litre of breath, about ${BLOOD_LIMIT_PCT} g per 100 ml of blood. There is no higher allowance for an experienced driver and no lower one for a new driver — it is the same figure for everyone.`,
    penalty: ALCOHOL_ROLES[0].penalty,
    roles: ALCOHOL_ROLES,
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
    standardDrinks: round(gramsAlcohol / JP_STANDARD_DRINK_G, 1),
    peakBacPercent: round(peakBacPercent, 4),
    bacPercent: round(bacPercent, 4),
    // 0.03 g/100 ml of blood corresponds to 0.15 mg/l of breath, a ratio of 5 mg/l per percent.
    breathMgPerL: round((bacPercent / BLOOD_LIMIT_PCT) * BREATH_LIMIT_MG_PER_L, 3),
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

/** Paperwork check for a visitor's licence — the part that most often goes wrong in Japan. */
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
      `You must be at least ${COUNTRY.minimumDrivingAgeYears} to drive a car in Japan, and a foreign licence held below that age does not entitle you to drive here.`,
    );
  }

  if (origin.id === "other_country") {
    blockers.push(
      "Your country issues neither a 1949 Geneva permit nor a translation Japan accepts, so there is no lawful way to drive here as a visitor.",
    );
  }

  if (origin.id === "vienna_1968_only") {
    warnings.push(
      "A 1968 Vienna Convention International Driving Permit is NOT valid in Japan. Arrange the official Japanese translation before you fly — rental desks refuse the Vienna permit outright.",
    );
  }

  if (origin.validityDays != null && days > origin.validityDays) {
    warnings.push(
      `A ${origin.document} is good for ${origin.validityDays} days in Japan. A stay of ${days} days runs past that, and leaving the country for less than ${RESET_ABSENCE_DAYS} consecutive days does not restart the clock.`,
    );
  }

  if (age >= COUNTRY.minimumDrivingAgeYears && age < 21) {
    warnings.push(
      "Japanese rental companies commonly require the licence to have been held for at least a year, and some set their own minimum age above the legal 18.",
    );
  }

  return {
    origin,
    document: origin.document,
    accepted: origin.accepted,
    validityDays: origin.validityDays,
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
