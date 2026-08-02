/**
 * Driving in Italy — rules reference and visitor trip check.
 *
 * Rule sources encoded below:
 *  - Codice della Strada art. 142: 50 km/h in built-up areas, 90 km/h on strade
 *    extraurbane secondarie, 110 km/h on strade extraurbane principali and
 *    130 km/h on autostrade; the two highest classes drop to 90 and 110 in rain
 *    or snow.
 *  - Codice della Strada art. 117: for the first three years after a category B
 *    licence is issued the holder may not exceed 100 km/h on the autostrada or
 *    90 km/h on strade extraurbane principali.
 *  - Codice della Strada art. 142 comma 3: cars towing a trailer are limited to
 *    70 km/h outside built-up areas and 80 km/h on the autostrada.
 *  - Codice della Strada art. 186: the general blood-alcohol limit is 0.5 g per
 *    litre, with three penalty bands at 0.5-0.8, 0.8-1.5 and above 1.5 g/l.
 *  - Codice della Strada art. 186-bis: zero alcohol for drivers under 21, for
 *    holders of a category B licence issued less than three years ago, and for
 *    professional drivers.
 *  - Codice della Strada art. 152: dipped headlights are compulsory outside
 *    built-up areas at all hours and in every tunnel.
 *  - Codice della Strada art. 162: a reflective vest must be worn whenever you
 *    step onto the carriageway outside a built-up area.
 *  - Legge 29/2019: an anti-abandonment alarm is required in any seat carrying
 *    a child under four.
 *  - Foreign licences: EU/EEA licences are recognised in full; other licences
 *    must be accompanied by a 1949 Geneva or 1968 Vienna International Driving
 *    Permit and stop being valid one year after residence is established.
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

/** 0.5 g/l blood alcohol corresponds to 0.25 mg per litre of breath. */
export const BLOOD_TO_BREATH_MG_PER_L = 0.5;

/** Years after which a category B licence stops counting as neopatentato. */
export const NOVICE_YEARS = 3;

export const COUNTRY = {
  name: "Italy",
  localName: "Italia",
  driveSide: "right",
  steeringWheelSide: "left",
  speedUnit: "km/h",
  minimumDrivingAgeYears: 18,
  typicalRentalMinimumAgeYears: 21,
  emergencyNumbers: [
    ["112", "Single European emergency number, live across Italy"],
    ["113", "Polizia di Stato"],
    ["118", "Ambulance"],
  ],
  tolls:
    "Autostrade are tolled: take a ticket at the barrier and pay on exit by card, cash or Telepass. City centres add camera-enforced ZTL restricted zones.",
  fuelNote:
    "Petrol is benzina, diesel is gasolio. Servito pumps cost noticeably more per litre than fai da te self-service.",
};

export const SPEED_LIMITS = [
  {
    id: "urban",
    label: "Built-up areas (centro abitato)",
    kmh: 50,
    note: "Many historic centres are signed at 30 km/h, and a citta 30 scheme applies city-wide in Bologna.",
  },
  {
    id: "secondary",
    label: "Strade extraurbane secondarie (ordinary country roads)",
    kmh: 90,
    towingKmh: 70,
    note: "The default for the single-carriageway roads that link most towns.",
  },
  {
    id: "principal",
    label: "Strade extraurbane principali (blue-sign dual carriageways)",
    kmh: 110,
    rainKmh: 90,
    noviceKmh: 90,
    towingKmh: 70,
    note: "Drops to 90 km/h in rain or snow, and 90 km/h for the first three years of a licence.",
  },
  {
    id: "autostrada",
    label: "Autostrada (green signs, tolled)",
    kmh: 130,
    rainKmh: 110,
    noviceKmh: 100,
    towingKmh: 80,
    note: "110 km/h in rain or snow, 100 km/h for neopatentati, 80 km/h with a trailer.",
  },
];

export const LICENCE_ORIGINS = [
  {
    id: "eu_eea",
    label: "EU / EEA country",
    needsIdp: false,
    validForDays: null,
    summary: "Recognised in full for as long as it remains valid; no permit or translation needed.",
  },
  {
    id: "idp_country",
    label: "Non-EU country signed up to the 1949 or 1968 driving conventions",
    needsIdp: true,
    validForDays: 365,
    summary:
      "Drive on your national licence plus an International Driving Permit. Once you register as resident it is valid for one year, then you must convert or re-sit the Italian test.",
  },
  {
    id: "non_convention",
    label: "Country with no driving-convention agreement with Italy",
    needsIdp: true,
    validForDays: 365,
    summary:
      "Carry a sworn, legalised Italian translation of the licence. Conversion is usually not available, so a resident has to take the Italian theory and practical exams.",
  },
];

export const EQUIPMENT = [
  ["Warning triangle", "One approved triangle, placed 50 m behind the car on ordinary roads and 100 m on the autostrada."],
  ["Reflective vest", "Must be worn, not just carried, before you step onto the carriageway outside a built-up area."],
  ["Anti-abandonment device", "Legally required in any seat used by a child under four years old."],
  ["Snow chains or winter tyres", "Compulsory 15 November to 15 April on roads carrying the obbligo catene sign."],
  ["Spare glasses", "Required if your licence carries a corrective-lens condition."],
  ["Vehicle documents", "Carta di circolazione, insurance and your licence must be in the car, not in the hotel."],
];

export const KEY_RULES = [
  [
    "ZTL zones",
    "Zona a Traffico Limitato entrances are camera-controlled in almost every historic centre. Each pass is a separate fine of roughly €80-120 plus the rental company's admin charge, and tourists routinely collect several in one afternoon.",
  ],
  [
    "Headlights outside town",
    "Dipped beams must be on day and night on every road outside a built-up area, and in every tunnel regardless of location.",
  ],
  [
    "Hand-held phones",
    "Banned outright. Under the December 2024 reform of the Codice della Strada the fine starts at €250 and the licence can be suspended for 7 to 15 days on a first offence.",
  ],
  [
    "Child restraints",
    "Children under 150 cm must use an approved seat or booster, and rear-facing seats cannot go in front of an active airbag.",
  ],
  [
    "Priority and roundabouts",
    "On unsignposted junctions traffic from the right has priority. Most roundabouts give way to traffic already circulating, but check the sign because a few older ones do not.",
  ],
  [
    "Autovelox and tutor",
    "Fixed autovelox cameras must be signposted in advance, and the tutor system on the autostrada measures your average speed between two gantries, so slowing for the camera does not help.",
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
  if (conditions.rain && entry.rainKmh != null) candidates.push(entry.rainKmh);
  if (conditions.novice && entry.noviceKmh != null) candidates.push(entry.noviceKmh);
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

/** Which Italian blood-alcohol limit applies to this driver. */
export function alcoholLimitFor({ ageYears, licenceHeldYears, professionalDriver } = {}) {
  const age = toNumber(ageYears);
  const held = toNumber(licenceHeldYears);
  if (Number.isNaN(age) || Number.isNaN(held)) {
    return { error: "Enter your age and how long you have held your licence." };
  }
  if (age < 0 || held < 0) return { error: "Age and licence years cannot be negative." };
  if (held > age) return { error: "You cannot have held a licence for longer than you have been alive." };

  if (age < 21 || held < NOVICE_YEARS || professionalDriver) {
    return {
      limitBacPercent: 0,
      breathMgPerL: 0,
      category: "Zero-alcohol group (art. 186-bis)",
      reason:
        age < 21
          ? "Drivers under 21 must have no alcohol at all in their blood."
          : professionalDriver
            ? "Professional drivers must have no alcohol at all in their blood."
            : `A licence held for less than ${NOVICE_YEARS} years makes you a neopatentato, with a zero limit.`,
      penalty:
        "Any positive reading in this group is fined from €168, and the ordinary art. 186 penalties are increased by a third on top.",
    };
  }
  return {
    limitBacPercent: 0.05,
    breathMgPerL: 0.25,
    category: "Standard limit (art. 186)",
    reason: "0.5 g per litre applies to drivers aged 21 and over who have held a licence for three years or more.",
    penalty:
      "0.5-0.8 g/l: €543-2,170 and 3-6 months' suspension. 0.8-1.5 g/l becomes a crime. Above 1.5 g/l brings up to a year's arrest, 1-2 years' suspension and confiscation of the car.",
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

  return {
    gramsAlcohol: round(gramsAlcohol, 1),
    standardDrinks: round(gramsAlcohol / STANDARD_DRINK_G, 1),
    peakBacPercent: round(peakBacPercent, 4),
    bacPercent: round(bacPercent, 4),
    gramsPerLitre: round(bacPercent * 10, 3),
    breathMgPerL: round(bacPercent * 10 * BLOOD_TO_BREATH_MG_PER_L, 3),
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
    blockers.push(
      `You must be at least ${COUNTRY.minimumDrivingAgeYears} to drive a car in Italy, whatever your own country allows.`,
    );
  } else if (age < COUNTRY.typicalRentalMinimumAgeYears) {
    warnings.push(
      `Legal to drive, but Italian rental desks normally start at ${COUNTRY.typicalRentalMinimumAgeYears} and charge a giovane conducente surcharge below 25.`,
    );
  }

  if (origin.needsIdp) {
    warnings.push("Carry an International Driving Permit or a sworn Italian translation with your national licence.");
  }
  if (origin.validForDays != null && days > origin.validForDays) {
    warnings.push(
      `A stay of ${days} days is longer than the ${origin.validForDays}-day recognition window once you are resident in Italy. Plan a conversione di patente at the Motorizzazione Civile.`,
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
  const permit = permitCheck(input);

  const held = toNumber(input.licenceHeldYears);
  const novice = Number.isFinite(held) ? held < NOVICE_YEARS : false;

  return {
    country: COUNTRY,
    alcohol,
    permit,
    novice,
    speeds: speedTable({
      towingTrailer: Boolean(input.towingTrailer),
      rain: Boolean(input.rain),
      novice,
    }),
    equipment: EQUIPMENT,
    keyRules: KEY_RULES,
    error: alcohol.error || permit.error || null,
  };
}
