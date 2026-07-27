/**
 * Driving in Vietnam - rules reference and visitor check.
 *
 * Sources encoded below:
 *
 *  - Law on Road Traffic Order and Safety No. 36/2024/QH15, in force from
 *    1 January 2025, which replaced the Law on Road Traffic 2008. Article 9(2)
 *    prohibits operating a vehicle with ANY concentration of alcohol in the
 *    blood or breath - Vietnam has no permitted allowance at all.
 *  - Circular 31/2019/TT-BGTVT sets the default speed limits:
 *      Art. 6  built-up areas: 60 km/h where the road has a central median or
 *              two or more lanes in each direction, otherwise 50 km/h.
 *      Art. 7  outside built-up areas, by vehicle class, split between roads
 *              with a median or multiple lanes and ordinary two-way roads.
 *      Art. 8  mopeds of 50 cm3 or less and electric bikes: 40 km/h maximum.
 *      Art. 9  expressways: the signed limit, never above 120 km/h, with a
 *              signed minimum speed as well.
 *  - Decree 168/2024/ND-CP, in force from 1 January 2025, sets the fines and
 *    licence suspensions for the three alcohol bands. Fine amounts are revised
 *    from time to time; the band thresholds are the stable part.
 *  - Law 36/2024/QH15 Art. 58 introduced a 12-point driving licence from
 *    1 January 2025. Points are restored after 12 clear months; a licence that
 *    reaches zero cannot be used until the holder re-sits the knowledge test,
 *    which is only allowed after six months.
 *  - Law 36/2024/QH15 Art. 10(3): from 1 January 2026 a child under 10 years
 *    old and under 1.35 m tall may not travel in the same row as the driver and
 *    must use an approved child restraint.
 *  - International permits: Vietnam acceded to the 1968 Vienna Convention on
 *    Road Traffic, in force for Vietnam since August 2015, and is NOT a party
 *    to the 1949 Geneva Convention. Only a 1968 Vienna IDP is recognised.
 *    Separately, the 1985 ASEAN Agreement on the Recognition of Domestic
 *    Driving Licences Issued by ASEAN Countries covers licences from fellow
 *    ASEAN member states.
 *  - Foreign residents may exchange a valid foreign licence for a Vietnamese
 *    one, without a driving test, where the residence permit or visa runs for
 *    three months or more (the exchange procedure formerly in Circular
 *    12/2017/TT-BGTVT, now carried into the 2024 framework).
 *
 * Informational only, not legal advice. Fines, forms and thresholds change -
 * confirm with the Department of Transport or your embassy before you drive.
 */

/** Exact international mile: 1 mile = 1.609344 km. */
export const KMH_PER_MPH = 1.609344;

/** Circular 31/2019/TT-BGTVT Art. 9: an expressway may never be signed above this. */
export const EXPRESSWAY_MAX_KMH = 120;

/** Law 36/2024/QH15 Art. 58: points on a driving licence, per 12-month cycle. */
export const LICENCE_POINTS = 12;

/** Months a zero-point licence is out of use before the holder may re-test. */
export const ZERO_POINT_LOCKOUT_MONTHS = 6;

/** Minimum residence permit length that unlocks exchange for a Vietnamese licence. */
export const EXCHANGE_MIN_RESIDENCE_MONTHS = 3;

/** Height and age below which a child restraint becomes compulsory from 1 Jan 2026. */
export const CHILD_RESTRAINT_MAX_AGE = 10;
export const CHILD_RESTRAINT_MAX_HEIGHT_M = 1.35;

export const COUNTRY = {
  name: "Vietnam",
  localName: "Viet Nam",
  driveSide: "right",
  steeringWheelSide: "left",
  speedUnit: "km/h",
  /** Law 36/2024/QH15: class B (car) and class A1 (motorcycle) both start at 18. */
  minimumCarAgeYears: 18,
  /** Mopeds of 50 cm3 or less need no licence but the rider must be 16. */
  minimumMopedAgeYears: 16,
  typicalRentalMinimumAgeYears: 21,
  emergencyNumbers: [
    ["113", "Police"],
    ["114", "Fire and rescue"],
    ["115", "Ambulance"],
  ],
  fuelNote:
    "Petrol is xang - E5 RON 92 and RON 95 are the common grades. Diesel is dau DO. Attendants serve every pump; watch the display reset to zero before filling.",
  tollNote:
    "Expressways and many bridges are tolled, increasingly by the ETC electronic sticker rather than cash. Rental cars normally carry a tag already.",
};

/**
 * Vehicle classes as Circular 31/2019/TT-BGTVT divides them.
 * `expresswayBanned` marks the classes that may not use a cao toc at all.
 */
export const VEHICLE_TYPES = [
  {
    id: "car",
    label: "Car up to 9 seats, or truck up to 3.5 tonnes",
    ruralDividedKmh: 90,
    ruralSingleKmh: 80,
  },
  {
    id: "heavy",
    label: "Bus over 9 seats, or truck over 3.5 tonnes",
    ruralDividedKmh: 80,
    ruralSingleKmh: 70,
  },
  {
    id: "artic",
    label: "Tractor unit with trailer, mixer, or specialised vehicle",
    ruralDividedKmh: 70,
    ruralSingleKmh: 60,
  },
  {
    id: "motorcycle",
    label: "Motorcycle over 50 cm3",
    ruralDividedKmh: 70,
    ruralSingleKmh: 60,
    expresswayBanned: true,
  },
  {
    id: "moped",
    label: "Moped 50 cm3 or under, or electric bike",
    ruralDividedKmh: 40,
    ruralSingleKmh: 40,
    /** Circular 31/2019 Art. 8 caps this class at 40 km/h on every road. */
    absoluteCapKmh: 40,
    expresswayBanned: true,
  },
];

export const ROAD_CLASSES = [
  {
    id: "urban-divided",
    label: "Built-up area, road with a median or 2+ lanes each way",
    baseKmh: 60,
    source: "Circular 31/2019/TT-BGTVT Art. 6",
    note: "The 60 km/h default applies to every motor vehicle class alike inside a built-up area.",
  },
  {
    id: "urban-single",
    label: "Built-up area, ordinary two-way road",
    baseKmh: 50,
    source: "Circular 31/2019/TT-BGTVT Art. 6",
    note: "This is the limit on most town and city streets, including the narrow ones where traffic feels slower anyway.",
  },
  {
    id: "rural-divided",
    label: "Outside built-up areas, road with a median or 2+ lanes each way",
    perVehicle: "ruralDividedKmh",
    source: "Circular 31/2019/TT-BGTVT Art. 7",
    note: "The limit steps down with vehicle weight, from 90 km/h for a car to 70 km/h for an articulated truck.",
  },
  {
    id: "rural-single",
    label: "Outside built-up areas, ordinary two-way road",
    perVehicle: "ruralSingleKmh",
    source: "Circular 31/2019/TT-BGTVT Art. 7",
    note: "Most inter-provincial highways, including much of the old QL1A, fall in this class.",
  },
  {
    id: "expressway",
    label: "Expressway (duong cao toc)",
    baseKmh: EXPRESSWAY_MAX_KMH,
    signed: true,
    source: "Circular 31/2019/TT-BGTVT Art. 9",
    note: "The real limit is whatever the gantry shows - often 80, 90, 100 or 120 km/h - and a minimum speed is signed too. Motorcycles and mopeds are banned.",
  },
];

/**
 * Decree 168/2024/ND-CP alcohol bands. Thresholds are given both ways because
 * Vietnamese roadside testing is by breath and the statute quotes blood.
 * `maxBreathMgPerL` is the top of the band, in milligrams per litre of breath.
 */
export const ALCOHOL_BANDS = [
  {
    id: "band-1",
    maxBreathMgPerL: 0.25,
    maxBloodMgPer100Ml: 50,
    label: "Band 1 - up to 0.25 mg/L breath (50 mg/100 mL blood)",
    car: { fineVndFrom: 6_000_000, fineVndTo: 8_000_000, suspensionMonthsFrom: 10, suspensionMonthsTo: 12 },
    motorcycle: { fineVndFrom: 2_000_000, fineVndTo: 3_000_000, suspensionMonthsFrom: 10, suspensionMonthsTo: 12 },
  },
  {
    id: "band-2",
    maxBreathMgPerL: 0.4,
    maxBloodMgPer100Ml: 80,
    label: "Band 2 - over 0.25 up to 0.4 mg/L breath (50-80 mg/100 mL blood)",
    car: { fineVndFrom: 18_000_000, fineVndTo: 20_000_000, suspensionMonthsFrom: 16, suspensionMonthsTo: 18 },
    motorcycle: { fineVndFrom: 6_000_000, fineVndTo: 8_000_000, suspensionMonthsFrom: 16, suspensionMonthsTo: 18 },
  },
  {
    id: "band-3",
    maxBreathMgPerL: Infinity,
    maxBloodMgPer100Ml: Infinity,
    label: "Band 3 - over 0.4 mg/L breath (over 80 mg/100 mL blood)",
    car: { fineVndFrom: 30_000_000, fineVndTo: 40_000_000, suspensionMonthsFrom: 22, suspensionMonthsTo: 24 },
    motorcycle: { fineVndFrom: 8_000_000, fineVndTo: 10_000_000, suspensionMonthsFrom: 22, suspensionMonthsTo: 24 },
  },
];

/**
 * How Vietnam treats a foreign licence.
 *  "domestic"   - a Vietnamese licence, nothing else needed
 *  "vienna"     - issuing state is a 1968 Vienna party, so its IDP is recognised
 *  "asean"      - covered by the 1985 ASEAN domestic-licence agreement
 *  "geneva"     - issuing state is only a 1949 Geneva party, so its IDP is NOT
 *                 recognised in Vietnam
 *  "none"       - neither convention, no recognised permit exists
 */
export const LICENCE_ORIGINS = [
  {
    id: "vietnam",
    label: "Vietnam - I hold a Vietnamese licence",
    rule: "domestic",
    note: "Nothing extra to carry. Class B covers cars, A1 covers motorcycles up to 125 cm3 and class A covers larger ones under the 2024 law.",
  },
  {
    id: "vienna-1968",
    label: "A 1968 Vienna Convention state (UK, Germany, France, Italy, Russia, South Korea, Brazil and most of Europe)",
    rule: "vienna",
    note: "Vietnam is a 1968 Vienna party, so an IDP issued under that convention is recognised alongside the national licence it translates.",
  },
  {
    id: "asean",
    label: "An ASEAN member state (Thailand, Malaysia, Singapore, Indonesia, Philippines, Cambodia, Laos, Myanmar, Brunei)",
    rule: "asean",
    note: "The 1985 ASEAN Agreement on the Recognition of Domestic Driving Licences covers licences issued by fellow member states for the same vehicle class.",
  },
  {
    id: "geneva-1949",
    label: "A 1949 Geneva-only state (United States, Japan, Australia, Canada, New Zealand, India, Ireland)",
    rule: "geneva",
    note: "Vietnam never joined the 1949 Geneva Convention, so a Geneva IDP has no standing here however official it looks.",
  },
  {
    id: "no-convention",
    label: "A state in neither road-traffic convention",
    rule: "none",
    note: "No internationally recognised permit exists for such a licence, so the only lawful route is a Vietnamese licence.",
  },
];

export const IDP_HELD_OPTIONS = [
  { id: "none", label: "No international permit" },
  { id: "vienna-1968", label: "1968 Vienna Convention IDP" },
  { id: "geneva-1949", label: "1949 Geneva Convention IDP" },
  { id: "vietnamese-licence", label: "A Vietnamese driving licence" },
];

export const KEY_RULES = [
  [
    "No alcohol at all",
    "Article 9(2) of Law 36/2024/QH15 bans driving with any measurable alcohol in blood or breath. There is no social allowance, roadside breath checks are routine and common on weekend evenings, and the lowest band already costs a car driver millions of dong plus a suspension.",
  ],
  [
    "Helmets on two wheels",
    "Rider and every passenger must wear a fastened helmet on a motorcycle, moped or electric bike. The chin strap has to be done up - an unbuckled helmet is treated as no helmet.",
  ],
  [
    "Right turn on red is not automatic",
    "You may only turn right against a red light where a supplementary sign or a green arrow allows it. Assume you must stop.",
  ],
  [
    "Twelve licence points",
    "From 1 January 2025 each licence carries 12 points a year. Serious offences strip several at once; a licence at zero cannot be used until the holder re-sits the knowledge test, which is only permitted after six months.",
  ],
  [
    "Compulsory third-party insurance",
    "A certificate of compulsory civil-liability motor insurance must be in the vehicle along with the registration and your licence. Police ask for all three at checkpoints.",
  ],
  [
    "Child restraints from 2026",
    "From 1 January 2026 a child under 10 and under 1.35 m may not sit in the same row as the driver and must be in an approved restraint - a change most rental fleets are still catching up with.",
  ],
  [
    "Motorbikes dominate the flow",
    "Traffic merges rather than takes turns. Move predictably at a steady speed, signal early, and let the shoal flow around you instead of braking hard for a gap.",
  ],
];

export const EQUIPMENT = [
  ["Driving licence", "The original national licence, plus a valid 1968 Vienna IDP if you rely on one. A permit is never valid on its own."],
  ["Vehicle registration", "The dang ky xe certificate, or the rental company's certified copy with its authorisation letter."],
  ["Compulsory insurance", "The civil-liability certificate. Rental cars carry one; a borrowed bike may not."],
  ["Helmet", "Fastened, for every person on a two-wheeler, including children."],
  ["Passport or a copy", "Carry a copy and keep the original where you are staying unless a hotel is holding it."],
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

/** Convert a speed between km/h and mph. Returns both figures. */
export function convertSpeed(value, fromUnit = "kmh") {
  const speed = toNumber(value);
  if (Number.isNaN(speed)) return { error: "Enter a numeric speed." };
  if (speed < 0) return { error: "Speed cannot be negative." };
  if (speed > 1000) return { error: "Enter a speed of 1000 or less." };
  const kmh = fromUnit === "mph" ? speed * KMH_PER_MPH : speed;
  return { kmh: round(kmh, 1), mph: round(kmh / KMH_PER_MPH, 1) };
}

/**
 * Default speed limit for one road class and vehicle class.
 * Returns { kmh, mph, ... } or { error }.
 */
export function speedLimitFor(roadId, vehicleId) {
  const road = ROAD_CLASSES.find((row) => row.id === roadId);
  if (!road) return { error: "Choose a road type." };
  const vehicle = VEHICLE_TYPES.find((row) => row.id === vehicleId);
  if (!vehicle) return { error: "Choose a vehicle type." };

  if (road.id === "expressway" && vehicle.expresswayBanned) {
    return {
      roadId: road.id,
      roadLabel: road.label,
      vehicleId: vehicle.id,
      vehicleLabel: vehicle.label,
      banned: true,
      kmh: null,
      mph: null,
      signed: false,
      source: road.source,
      note: "Motorcycles, mopeds and electric bikes may not use an expressway in Vietnam at all.",
    };
  }

  const base = road.perVehicle ? vehicle[road.perVehicle] : road.baseKmh;
  const cap = vehicle.absoluteCapKmh ?? Infinity;
  const kmh = Math.min(base, cap);

  return {
    roadId: road.id,
    roadLabel: road.label,
    vehicleId: vehicle.id,
    vehicleLabel: vehicle.label,
    banned: false,
    kmh,
    mph: Math.round(kmh / KMH_PER_MPH),
    /** True when the number is a statutory ceiling and the sign may show less. */
    signed: Boolean(road.signed),
    cappedByVehicleClass: kmh < base,
    source: road.source,
    note: road.note,
  };
}

/** The whole speed table for one vehicle class. */
export function speedTable(vehicleId) {
  return ROAD_CLASSES.map((road) => speedLimitFor(road.id, vehicleId));
}

/**
 * Which Decree 168/2024/ND-CP band a breath reading falls in.
 * Any reading above zero is an offence - Vietnam permits no allowance.
 *
 * @param {object} input
 * @param {number} input.breathMgPerL   milligrams of alcohol per litre of breath
 * @param {string} input.vehicleType    "car" or "motorcycle"
 */
export function alcoholBandFor({ breathMgPerL, vehicleType = "car" } = {}) {
  const reading = toNumber(breathMgPerL);
  if (Number.isNaN(reading)) return { error: "Enter a breath reading in mg per litre, or 0." };
  if (reading < 0) return { error: "A breath reading cannot be negative." };
  if (reading > 5) return { error: "Enter a breath reading of 5 mg/L or less." };

  const penaltyKey = vehicleType === "motorcycle" ? "motorcycle" : "car";

  if (reading === 0) {
    return {
      legal: true,
      bandId: null,
      bandLabel: "No alcohol detected",
      breathMgPerL: round(reading, 3),
      bloodMgPer100Ml: round(reading * 200, 1),
      vehicleType: penaltyKey,
      summary:
        "Zero is the only lawful reading in Vietnam. Article 9(2) of Law 36/2024/QH15 bans driving with any concentration of alcohol in blood or breath.",
    };
  }

  const band = ALCOHOL_BANDS.find((row) => reading <= row.maxBreathMgPerL) ?? ALCOHOL_BANDS[ALCOHOL_BANDS.length - 1];
  const penalty = band[penaltyKey];

  return {
    legal: false,
    bandId: band.id,
    bandLabel: band.label,
    breathMgPerL: round(reading, 3),
    /**
     * Vietnamese law states the blood figure in mg per 100 mL and the breath
     * figure in mg per litre, and the two scales in the statute line up at a
     * ratio of 200 (0.25 mg/L breath = 50 mg/100 mL blood).
     */
    bloodMgPer100Ml: round(reading * 200, 1),
    vehicleType: penaltyKey,
    fineVndFrom: penalty.fineVndFrom,
    fineVndTo: penalty.fineVndTo,
    suspensionMonthsFrom: penalty.suspensionMonthsFrom,
    suspensionMonthsTo: penalty.suspensionMonthsTo,
    summary:
      "Any reading above zero is an offence. Decree 168/2024/ND-CP sets the fine and the licence suspension by band; the vehicle is also normally impounded at the roadside.",
  };
}

/**
 * Can this traveller legally drive in Vietnam?
 *
 * @param {object} input
 * @param {string} input.licenceOrigin  id from LICENCE_ORIGINS
 * @param {string} input.idpHeld        id from IDP_HELD_OPTIONS
 * @param {number} input.ageYears       age in whole years
 * @param {number} input.stayDays       length of stay in days
 * @param {string} input.vehicleId      id from VEHICLE_TYPES
 */
export function licenceCheck({ licenceOrigin, idpHeld, ageYears, stayDays, vehicleId = "car" } = {}) {
  const origin = LICENCE_ORIGINS.find((row) => row.id === licenceOrigin);
  if (!origin) return { error: "Choose where your driving licence was issued." };
  const permit = IDP_HELD_OPTIONS.find((row) => row.id === idpHeld);
  if (!permit) return { error: "Choose which permit you already hold." };
  const vehicle = VEHICLE_TYPES.find((row) => row.id === vehicleId);
  if (!vehicle) return { error: "Choose a vehicle type." };

  const age = toNumber(ageYears);
  if (Number.isNaN(age)) return { error: "Enter your age in whole years." };
  if (age < 10 || age > 110) return { error: "Enter an age between 10 and 110 years." };

  const days = toNumber(stayDays);
  if (Number.isNaN(days)) return { error: "Enter how many days you will be in Vietnam." };
  if (days < 0) return { error: "A stay cannot be a negative number of days." };
  if (days > 3650) return { error: "Enter a stay of 3650 days (ten years) or fewer." };

  const isMoped = vehicle.id === "moped";
  const requiredAge = isMoped ? COUNTRY.minimumMopedAgeYears : COUNTRY.minimumCarAgeYears;

  const blockers = [];
  const warnings = [];

  if (age < requiredAge) {
    blockers.push(
      isMoped
        ? `A moped of 50 cm3 or less needs no licence in Vietnam, but the rider must be at least ${COUNTRY.minimumMopedAgeYears}.`
        : `Vietnamese class B and class A1 licences both start at ${COUNTRY.minimumCarAgeYears}, and a foreign licence does not lower that age.`,
    );
  }

  let verdict;
  let reason;

  if (origin.rule === "domestic" || permit.id === "vietnamese-licence") {
    verdict = "ok";
    reason =
      "A Vietnamese licence for the right class is all you need. Carry it with the vehicle registration and the compulsory insurance certificate.";
  } else if (isMoped) {
    verdict = "ok";
    reason =
      "A moped of 50 cm3 or under, and an electric bike, need no driving licence in Vietnam, so the international-permit question does not arise. The 40 km/h cap and the helmet rule still do.";
  } else if (origin.rule === "asean") {
    verdict = "ok";
    reason =
      "The 1985 ASEAN Agreement on the Recognition of Domestic Driving Licences means Vietnam accepts a licence issued by another ASEAN member state for the equivalent vehicle class, without any international permit.";
  } else if (origin.rule === "vienna") {
    if (permit.id === "vienna-1968") {
      verdict = "ok";
      reason =
        "Vietnam is a party to the 1968 Vienna Convention, so your 1968 IDP is recognised. It only works alongside the original national licence it translates - carry both.";
    } else {
      verdict = "idp-needed";
      reason =
        "Your licence comes from a 1968 Vienna Convention state, so a 1968 IDP would make it valid here - but you have to obtain that permit at home before you travel. It cannot be issued to you inside Vietnam.";
    }
  } else if (origin.rule === "geneva") {
    verdict = permit.id === "geneva-1949" ? "not-valid" : "not-valid";
    reason =
      permit.id === "geneva-1949"
        ? "A 1949 Geneva permit is not recognised in Vietnam. Vietnam joined only the 1968 Vienna Convention, so the Geneva booklet - the one AAA, JAF, the Australian motoring clubs and Indian RTOs issue - has no legal standing here, whatever a hire desk may accept."
        : "Your licence was issued by a state that belongs only to the 1949 Geneva Convention, which Vietnam never joined. No permit issued at home will make that licence valid here.";
  } else {
    verdict = "not-valid";
    reason =
      "Your issuing state belongs to neither road-traffic convention, so no internationally recognised permit exists for your licence.";
  }

  const canExchange = days >= EXCHANGE_MIN_RESIDENCE_MONTHS * 30;
  if (verdict === "not-valid" || verdict === "idp-needed") {
    if (canExchange) {
      warnings.push(
        `You are staying long enough to exchange the foreign licence for a Vietnamese one: the procedure is open to holders of a visa or residence card valid for ${EXCHANGE_MIN_RESIDENCE_MONTHS} months or more, needs a notarised Vietnamese translation of the licence and a health check, and does not involve a driving test.`,
      );
    } else {
      warnings.push(
        `On a stay of ${Math.round(days)} days you cannot exchange for a Vietnamese licence either - that route needs a visa or residence card valid for at least ${EXCHANGE_MIN_RESIDENCE_MONTHS} months. Use taxis, ride-hailing or a driver instead.`,
      );
    }
    warnings.push(
      "Driving without a licence Vietnam recognises normally voids the vehicle insurance, which matters far more than the fine if someone is hurt.",
    );
  }

  if (verdict === "ok" && permit.id === "vienna-1968") {
    warnings.push(
      "A 1968 Vienna IDP runs for up to three years from issue, or until the national licence expires, whichever comes first. Check the expiry covers the whole trip - it cannot be renewed from abroad.",
    );
  }
  if (age < COUNTRY.typicalRentalMinimumAgeYears && !isMoped) {
    warnings.push(
      `Most Vietnamese car-hire desks will not release a vehicle below ${COUNTRY.typicalRentalMinimumAgeYears}. That is company policy rather than law.`,
    );
  }
  if (vehicle.id === "motorcycle") {
    warnings.push(
      "A class A1 or A entitlement is needed for a motorcycle over 50 cm3. A licence that only covers cars does not let you ride the 150 cm3 bike a rental shop hands over.",
    );
  }

  return {
    verdict,
    reason,
    origin,
    permit,
    vehicle,
    canDrive: verdict === "ok" && blockers.length === 0,
    minimumAge: requiredAge,
    stayDays: Math.round(days),
    canExchange,
    blockers,
    warnings,
  };
}

/** Everything the interface needs, in one pure call. */
export function assessTrip(input = {}) {
  const licence = licenceCheck(input);
  if (licence.error) return { error: licence.error };

  const alcohol = alcoholBandFor({
    breathMgPerL: input.breathMgPerL,
    vehicleType: input.vehicleId === "motorcycle" || input.vehicleId === "moped" ? "motorcycle" : "car",
  });
  if (alcohol.error) return { error: alcohol.error };

  const limit = speedLimitFor(input.roadId, input.vehicleId);
  if (limit.error) return { error: limit.error };

  return {
    country: COUNTRY,
    licence,
    alcohol,
    limit,
    speeds: speedTable(input.vehicleId),
    keyRules: KEY_RULES,
    equipment: EQUIPMENT,
  };
}
