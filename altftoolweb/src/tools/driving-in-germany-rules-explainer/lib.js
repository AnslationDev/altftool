/**
 * Driving in Germany — rules reference and visitor trip check.
 *
 * Rule sources encoded below:
 *  - Straßenverkehrs-Ordnung (StVO) §3: 50 km/h inside built-up areas, 100 km/h
 *    outside them for cars; lower limits where signposted.
 *  - Autobahn-Richtgeschwindigkeits-Verordnung (1978): the 130 km/h figure on
 *    unrestricted Autobahn is an ADVISORY speed, not a limit.
 *  - StVO Anlage 2 / §18: cars towing a trailer are capped at 80 km/h outside
 *    built-up areas, or 100 km/h with a Tempo-100 approval on the combination.
 *  - Straßenverkehrsgesetz (StVG) §24a: 0.5 per mille (0.05 % BAC) / 0.25 mg per
 *    litre of breath is the administrative limit for adult drivers.
 *  - StVG §24c: absolute alcohol ban (0.0) for drivers under 21 and for anyone
 *    inside the two-year probationary period (Probezeit).
 *  - Strafgesetzbuch §316 / case law: from 0.3 per mille driving can be a
 *    criminal offence if impairment is shown; 1.1 per mille is absolute
 *    unfitness to drive.
 *  - Fahrerlaubnis-Verordnung (FeV) §29: foreign licences are recognised for
 *    visitors; a non-EU licence stops being valid six months after the holder
 *    takes up ordinary residence, and it never entitles a driver who is below
 *    the German minimum age for the category.
 *  - StVO §35h / §5 StVG: warning triangle, first-aid kit and high-visibility
 *    vest are required equipment; §2(3a) StVO sets the situational winter tyre
 *    duty; 35. BImSchV governs the Umweltplakette low-emission-zone sticker.
 *
 * Blood alcohol estimation uses the Widmark equation (E.M.P. Widmark, 1932).
 * It is an approximation for planning only.
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

/** 0.5 per mille blood alcohol corresponds to 0.25 mg per litre of breath. */
export const BLOOD_TO_BREATH_MG_PER_L = 0.5;

export const COUNTRY = {
  name: "Germany",
  localName: "Deutschland",
  driveSide: "right",
  steeringWheelSide: "left",
  speedUnit: "km/h",
  minimumDrivingAgeYears: 18,
  typicalRentalMinimumAgeYears: 21,
  emergencyNumbers: [
    ["112", "Ambulance, fire and any life-threatening emergency (EU-wide)"],
    ["110", "Police"],
  ],
  tolls:
    "No toll for cars on the Autobahn. Lorries over 3.5 t pay the LKW-Maut. City centres instead need an Umweltplakette emission sticker.",
  fuelNote:
    "Petrol is Super E10 / Super 95, diesel is Diesel. Most stations are pay-at-kiosk after filling, not pay-at-pump.",
};

/**
 * Speed limits. kmh === null means there is no general numeric limit.
 * towingKmh / rainKmh apply only when the matching condition is selected.
 */
export const SPEED_LIMITS = [
  {
    id: "urban",
    label: "Built-up areas (inside the yellow Ortstafel sign)",
    kmh: 50,
    towingKmh: 50,
    note: "Drops to 30 km/h in the very common Tempo-30-Zone and outside schools.",
  },
  {
    id: "residential",
    label: "Verkehrsberuhigter Bereich (play street)",
    kmh: 7,
    towingKmh: 7,
    note: "Walking pace. Pedestrians and children may use the full width of the road.",
  },
  {
    id: "rural",
    label: "Country roads outside built-up areas (Landstraße)",
    kmh: 100,
    towingKmh: 80,
    note: "80 km/h with a trailer, or 100 km/h if the combination carries a Tempo-100 approval.",
  },
  {
    id: "motorway",
    label: "Autobahn and dual carriageways, unrestricted stretches",
    kmh: null,
    advisoryKmh: 130,
    towingKmh: 80,
    note: "No general limit, but 130 km/h is the advisory speed and above it you can be held partly liable in a crash.",
  },
  {
    id: "motorway_limited",
    label: "Autobahn where a limit is posted",
    kmh: 120,
    towingKmh: 80,
    note: "Roughly a third of the network is permanently signed, plus variable gantry limits for weather and roadworks.",
  },
];

export const LICENCE_ORIGINS = [
  {
    id: "eu_eea",
    label: "EU / EEA country (including Switzerland by agreement)",
    needsIdp: false,
    validForDays: null,
    summary:
      "Fully recognised. You may drive on it for as long as it is valid, and you keep it after moving to Germany.",
  },
  {
    id: "non_eu_latin",
    label: "Non-EU country, licence printed in Latin script",
    needsIdp: true,
    validForDays: 183,
    summary:
      "Valid for visits. Carry a 1949/1968 International Driving Permit or an official German translation alongside it; after six months of residence you must convert or re-test.",
  },
  {
    id: "non_eu_other_script",
    label: "Non-EU country, licence in a non-Latin script",
    needsIdp: true,
    validForDays: 183,
    summary:
      "An International Driving Permit or a certified translation (ADAC, ACE or a sworn translator) is effectively mandatory — police cannot read the original.",
  },
];

export const EQUIPMENT = [
  ["Warning triangle", "One reflective triangle, required in every vehicle."],
  ["First-aid kit", "Must meet DIN 13164 and be in date; roadside checks do look at the expiry."],
  ["High-visibility vest", "At least one, stored inside the cabin — not in the boot."],
  ["Umweltplakette", "Green emission sticker for the low-emission zones in Berlin, Munich, Stuttgart and 50+ other cities."],
  ["Winter tyres", "Situational duty: M+S or alpine-symbol tyres whenever there is ice, snow or slush."],
  ["Spare glasses", "Required if your licence records a corrective-lens condition."],
];

export const KEY_RULES = [
  [
    "Rechts vor rechts",
    "At an unmarked junction, traffic coming from your right has priority. This catches almost every first-time visitor in residential streets.",
  ],
  [
    "Rettungsgasse",
    "The moment traffic slows on a multi-lane road you must form an emergency corridor: far-left lane moves left, everyone else moves right. Failing to is a €200-320 fine and a driving ban.",
  ],
  [
    "No undertaking",
    "Passing on the right is prohibited above 60 km/h outside built-up areas. Move back to the right-hand lane as soon as you have overtaken.",
  ],
  [
    "Hand-held phones",
    "Any handling of a phone while the engine runs costs €100 and one point in Flensburg; hands-free is fine.",
  ],
  [
    "Child restraints",
    "Children under 12 years old AND under 150 cm need an approved child seat or booster.",
  ],
  [
    "Radar detectors",
    "Owning, carrying or using a speed-camera detector is banned, and apps with live camera alerts must be switched off.",
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

/**
 * Effective speed limit for one road class under the selected conditions.
 * Returns kmh === null when the road has no general numeric limit.
 */
export function speedLimitFor(roadId, conditions = {}) {
  const entry = SPEED_LIMITS.find((row) => row.id === roadId);
  if (!entry) return { error: "Unknown road type." };
  const candidates = [];
  if (conditions.towingTrailer && entry.towingKmh != null) candidates.push(entry.towingKmh);
  if (conditions.rain && entry.rainKmh != null) candidates.push(entry.rainKmh);
  if (candidates.length === 0 && entry.kmh == null) {
    return {
      id: entry.id,
      label: entry.label,
      kmh: null,
      mph: null,
      advisoryKmh: entry.advisoryKmh ?? null,
      advisoryMph: entry.advisoryKmh ? round(entry.advisoryKmh / KMH_PER_MPH, 0) : null,
      note: entry.note,
    };
  }
  if (entry.kmh != null) candidates.push(entry.kmh);
  const kmh = Math.min(...candidates);
  return {
    id: entry.id,
    label: entry.label,
    kmh,
    mph: round(kmh / KMH_PER_MPH, 0),
    advisoryKmh: entry.advisoryKmh ?? null,
    advisoryMph: entry.advisoryKmh ? round(entry.advisoryKmh / KMH_PER_MPH, 0) : null,
    note: entry.note,
  };
}

/** The full speed table under one set of conditions. */
export function speedTable(conditions = {}) {
  return SPEED_LIMITS.map((row) => speedLimitFor(row.id, conditions));
}

/**
 * Which German blood-alcohol limit applies to this driver.
 * StVG §24c overrides §24a for under-21s and probationary licence holders.
 */
export function alcoholLimitFor({ ageYears, licenceHeldYears } = {}) {
  const age = toNumber(ageYears);
  const held = toNumber(licenceHeldYears);
  if (Number.isNaN(age) || Number.isNaN(held)) {
    return { error: "Enter your age and how long you have held your licence." };
  }
  if (age < 0 || held < 0) return { error: "Age and licence years cannot be negative." };
  if (held > age) return { error: "You cannot have held a licence for longer than you have been alive." };

  if (age < 21 || held < 2) {
    return {
      limitBacPercent: 0,
      breathMgPerL: 0,
      category: "Absolute alcohol ban",
      reason:
        age < 21
          ? "Drivers under 21 may not have any alcohol in their blood (StVG §24c)."
          : "The two-year Probezeit carries a total alcohol ban (StVG §24c).",
      penalty: "€250 fine, one point in Flensburg and an extended probation period with a mandatory seminar.",
    };
  }
  return {
    limitBacPercent: 0.05,
    breathMgPerL: 0.25,
    category: "Standard adult limit",
    reason: "0.5 per mille under StVG §24a applies to fully licensed drivers aged 21 and over.",
    penalty:
      "First offence at 0.5 per mille: €500, two points and a one-month driving ban. From 0.3 per mille you can already be prosecuted if your driving is impaired.",
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
      `You must be at least ${COUNTRY.minimumDrivingAgeYears} to drive a car in Germany. A foreign licence held below the German minimum age does not entitle you to drive here (FeV §29).`,
    );
  } else if (age < COUNTRY.typicalRentalMinimumAgeYears) {
    warnings.push(
      `You can drive legally, but most German rental desks set a minimum age of ${COUNTRY.typicalRentalMinimumAgeYears} and add a young-driver surcharge below 25.`,
    );
  }

  if (origin.needsIdp) {
    warnings.push("Carry an International Driving Permit or certified German translation with your national licence.");
  }
  if (origin.validForDays != null && days > origin.validForDays) {
    warnings.push(
      `A stay of ${days} days exceeds the ${origin.validForDays}-day (six-month) recognition window for a non-EU licence once you are ordinarily resident. Plan an Umschreibung at the local Führerscheinstelle.`,
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
    speeds: speedTable({ towingTrailer: Boolean(input.towingTrailer), rain: Boolean(input.rain) }),
    equipment: EQUIPMENT,
    keyRules: KEY_RULES,
  };
}
