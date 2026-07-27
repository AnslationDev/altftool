/**
 * Sunset viewpoint timing planner.
 *
 * Two well-defined pieces of published work do all the work here.
 *
 * SOLAR GEOMETRY — the NOAA Solar Calculator equations (the same set NOAA
 * publishes in its solar position spreadsheet, after Jean Meeus, "Astronomical
 * Algorithms"). From latitude, longitude, date and UTC offset the code derives
 * the sun's declination and the equation of time, then solves the hour angle
 *
 *     cos(H) = cos(zenith) / (cos(lat) cos(decl)) - tan(lat) tan(decl)
 *
 * for whatever solar elevation is wanted. Sunset uses a zenith of 90.833
 * degrees, which is the standard allowance for atmospheric refraction plus the
 * apparent radius of the solar disc. Golden hour is conventionally taken as the
 * sun between +6 and -4 degrees elevation, blue hour from -4 to -6, and civil
 * twilight ends at -6. When the hour angle has no solution the sun does not
 * reach that elevation at all that day — midnight sun or polar night — and the
 * result says so instead of returning a number.
 *
 * WALKING TIME — Naismith's rule, published by William W. Naismith in 1892:
 * allow one hour for every 3 miles (5 km) forward, plus one hour for every
 * 2,000 feet (600 m) of ascent. Langmuir's correction for descent is applied
 * on top: subtract 10 minutes per 300 m of descent on moderate slopes of 5 to
 * 12 degrees, and add 10 minutes per 300 m on slopes steeper than 12 degrees,
 * where the going becomes awkward rather than fast.
 *
 * Everything is pure. The date is an argument, never the system clock.
 */

/** Naismith 1892: 5 km per hour on the flat. */
export const NAISMITH_FLAT_KM_PER_HOUR = 5;

/** Naismith 1892: one extra hour per 600 m of ascent. */
export const NAISMITH_ASCENT_M_PER_HOUR = 600;

/** Langmuir: 10 minutes per 300 m of descent, sign depending on the slope. */
export const LANGMUIR_DESCENT_STEP_M = 300;
export const LANGMUIR_DESCENT_MINUTES = 10;

/** Zenith angle for sunset: refraction plus the solar disc's apparent radius. */
export const SUNSET_ZENITH_DEG = 90.833;

/** Golden hour runs from this elevation down to GOLDEN_HOUR_END_ELEV_DEG. */
export const GOLDEN_HOUR_START_ELEV_DEG = 6;
export const GOLDEN_HOUR_END_ELEV_DEG = -4;

/** Blue hour ends where civil twilight ends. */
export const BLUE_HOUR_END_ELEV_DEG = -6;

export const FITNESS_LEVELS = [
  { id: "fast", label: "Fit and moving quickly", factor: 0.8, note: "Regular hill walker, light pack, no stops." },
  { id: "normal", label: "Average pace", factor: 1, note: "Naismith's own assumption: steady walking, brief stops." },
  { id: "relaxed", label: "Unhurried or carrying camera gear", factor: 1.25, note: "Photo stops, a heavy pack, or mixed abilities in the group." },
  { id: "slow", label: "Children, heavy load or rough ground", factor: 1.6, note: "Naismith badly understates this case — treat it as a floor." },
];

export const DESCENT_SLOPES = [
  { id: "none", label: "No real descent on the way up", perStep: 0 },
  { id: "moderate", label: "Moderate descent, 5–12°", perStep: -LANGMUIR_DESCENT_MINUTES },
  { id: "steep", label: "Steep descent, over 12°", perStep: LANGMUIR_DESCENT_MINUTES },
];

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Julian Day at 00:00 UT for a Gregorian calendar date. */
export function julianDay(year, month, day) {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
}

/**
 * Sun declination (degrees) and the equation of time (minutes) for a Julian
 * century, following the NOAA solar calculator equations.
 */
export function solarParameters(julianCentury) {
  const t = julianCentury;
  const meanLong = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360;
  const l0 = meanLong < 0 ? meanLong + 360 : meanLong;
  const meanAnom = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const eccent = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  const centre =
    Math.sin(RAD * meanAnom) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(RAD * 2 * meanAnom) * (0.019993 - 0.000101 * t) +
    Math.sin(RAD * 3 * meanAnom) * 0.000289;
  const trueLong = l0 + centre;
  const appLong = trueLong - 0.00569 - 0.00478 * Math.sin(RAD * (125.04 - 1934.136 * t));
  const meanObliq = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const obliqCorr = meanObliq + 0.00256 * Math.cos(RAD * (125.04 - 1934.136 * t));
  const declination = DEG * Math.asin(Math.sin(RAD * obliqCorr) * Math.sin(RAD * appLong));

  const y = Math.tan(RAD * (obliqCorr / 2)) ** 2;
  const eqTime =
    4 *
    DEG *
    (y * Math.sin(2 * RAD * l0) -
      2 * eccent * Math.sin(RAD * meanAnom) +
      4 * eccent * y * Math.sin(RAD * meanAnom) * Math.cos(2 * RAD * l0) -
      0.5 * y * y * Math.sin(4 * RAD * l0) -
      1.25 * eccent * eccent * Math.sin(2 * RAD * meanAnom));

  return { declination, eqTime };
}

/**
 * Local clock minutes (from midnight) at which the sun crosses a given
 * elevation on its way down. Returns null when the sun never reaches it.
 */
function afternoonCrossing({ latitude, declination, solarNoonMinutes, zenithDeg }) {
  const cosH =
    Math.cos(RAD * zenithDeg) / (Math.cos(RAD * latitude) * Math.cos(RAD * declination)) -
    Math.tan(RAD * latitude) * Math.tan(RAD * declination);
  if (cosH > 1 || cosH < -1) return null;
  const hourAngle = DEG * Math.acos(cosH);
  return solarNoonMinutes + 4 * hourAngle;
}

/**
 * Solar events for a place and date.
 * @returns {{solarNoon:number, sunset:number|null, goldenStart:number|null,
 *   goldenEnd:number|null, blueEnd:number|null, declination:number,
 *   eqTime:number, polar:string|null}}
 */
export function solarEvents({ latitude, longitude, dateISO, utcOffsetHours }) {
  const [year, month, day] = dateISO.split("-").map(Number);
  const jdMidnight = julianDay(year, month, day) - utcOffsetHours / 24;
  const jc = (jdMidnight - 2451545) / 36525;
  const { declination, eqTime } = solarParameters(jc);

  const solarNoon = 720 - 4 * longitude - eqTime + utcOffsetHours * 60;

  const at = (zenith) => afternoonCrossing({ latitude, declination, solarNoonMinutes: solarNoon, zenithDeg: zenith });

  const sunset = at(SUNSET_ZENITH_DEG);
  const goldenStart = at(90 - GOLDEN_HOUR_START_ELEV_DEG);
  const goldenEnd = at(90 - GOLDEN_HOUR_END_ELEV_DEG);
  const blueEnd = at(90 - BLUE_HOUR_END_ELEV_DEG);

  let polar = null;
  if (sunset === null) {
    // No sunset: either the sun stays up all day or never rises.
    polar = declination * latitude > 0 ? "midnight-sun" : "polar-night";
  }

  return { solarNoon, sunset, goldenStart, goldenEnd, blueEnd, declination, eqTime, polar };
}

/**
 * Naismith's rule with a fitness factor and Langmuir's descent correction.
 * @returns {{minutes:number, flatMinutes:number, ascentMinutes:number, descentMinutes:number}}
 */
export function naismithMinutes({ distanceKm, ascentM, descentM, descentSlope, fitnessFactor }) {
  const flatMinutes = (distanceKm / NAISMITH_FLAT_KM_PER_HOUR) * 60;
  const ascentMinutes = (ascentM / NAISMITH_ASCENT_M_PER_HOUR) * 60;
  const slope = DESCENT_SLOPES.find((item) => item.id === descentSlope) || DESCENT_SLOPES[0];
  const descentMinutes = (descentM / LANGMUIR_DESCENT_STEP_M) * slope.perStep;
  const base = flatMinutes + ascentMinutes + descentMinutes;
  return {
    flatMinutes,
    ascentMinutes,
    descentMinutes,
    minutes: Math.max(0, base * fitnessFactor),
  };
}

/** Minutes from midnight to "HH:MM", marking a roll into the next or previous day. */
export function formatClock(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) return "—";
  const rounded = Math.round(totalMinutes);
  const dayOffset = Math.floor(rounded / 1440);
  const inDay = ((rounded % 1440) + 1440) % 1440;
  const hh = String(Math.floor(inDay / 60)).padStart(2, "0");
  const mm = String(inDay % 60).padStart(2, "0");
  const suffix = dayOffset > 0 ? " (+1d)" : dayOffset < 0 ? " (−1d)" : "";
  return `${hh}:${mm}${suffix}`;
}

export function formatMinutes(value) {
  if (!Number.isFinite(value) || value < 0) return "—";
  const minutes = Math.round(value);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${rest} min`;
}

/**
 * @param {object} input
 * @param {number} input.latitude       decimal degrees, north positive
 * @param {number} input.longitude      decimal degrees, east positive
 * @param {string} input.dateISO        YYYY-MM-DD
 * @param {number} input.utcOffsetHours e.g. 5.5 for India
 * @param {number} input.driveMinutes   door to trailhead or car park
 * @param {number} input.distanceKm     one-way walking distance
 * @param {number} input.ascentM        one-way ascent
 * @param {number} input.descentM       one-way descent on the way up
 * @param {string} input.descentSlope   a DESCENT_SLOPES id
 * @param {string} input.fitness        a FITNESS_LEVELS id
 * @param {number} input.setupMinutes   settling in, tripod, finding the spot
 * @param {string} input.target         "golden" or "sunset"
 */
export function planSunsetTrip(input) {
  const {
    latitude,
    longitude,
    dateISO,
    utcOffsetHours,
    driveMinutes,
    distanceKm,
    ascentM,
    descentM,
    descentSlope = "none",
    fitness = "normal",
    setupMinutes,
    target = "golden",
  } = input || {};

  const lat = Number(latitude);
  const lon = Number(longitude);
  const tz = Number(utcOffsetHours);
  const drive = Number(driveMinutes);
  const distance = Number(distanceKm);
  const ascent = Number(ascentM);
  const descent = Number(descentM);
  const setup = Number(setupMinutes);

  if (![lat, lon, tz, drive, distance, ascent, descent, setup].every(Number.isFinite)) {
    return { error: "Enter a number in every field." };
  }
  if (lat < -90 || lat > 90) return { error: "Latitude must be between −90 and 90 degrees." };
  if (lon < -180 || lon > 180) return { error: "Longitude must be between −180 and 180 degrees." };
  if (tz < -12 || tz > 14) return { error: "The UTC offset must be between −12 and +14 hours." };
  if (typeof dateISO !== "string" || !ISO_DATE.test(dateISO)) {
    return { error: "Enter the date as YYYY-MM-DD." };
  }
  const [year, month, day] = dateISO.split("-").map(Number);
  if (year < 1900 || year > 2200 || month < 1 || month > 12 || day < 1 || day > 31) {
    return { error: "That date is not valid — use a real calendar date between 1900 and 2200." };
  }
  if (drive < 0 || drive > 1440) return { error: "Driving time must be between 0 and 1440 minutes." };
  if (distance < 0 || distance > 100) return { error: "Walking distance must be between 0 and 100 km." };
  if (ascent < 0 || ascent > 9000) return { error: "Ascent must be between 0 and 9000 m." };
  if (descent < 0 || descent > 9000) return { error: "Descent must be between 0 and 9000 m." };
  if (setup < 0 || setup > 480) return { error: "Setting-up time must be between 0 and 480 minutes." };

  const level = FITNESS_LEVELS.find((item) => item.id === fitness);
  if (!level) return { error: "Pick a walking pace." };
  if (!DESCENT_SLOPES.some((item) => item.id === descentSlope)) {
    return { error: "Pick the descent type." };
  }

  const sun = solarEvents({ latitude: lat, longitude: lon, dateISO, utcOffsetHours: tz });

  if (sun.polar) {
    return {
      error:
        sun.polar === "midnight-sun"
          ? "At this latitude and date the sun never sets — there is no sunset to arrive before. Pick another date or a lower latitude."
          : "At this latitude and date the sun never rises. There is no golden hour to plan for.",
    };
  }

  const walk = naismithMinutes({
    distanceKm: distance,
    ascentM: ascent,
    descentM: descent,
    descentSlope,
    fitnessFactor: level.factor,
  });

  const targetTime = target === "sunset" ? sun.sunset : sun.goldenStart ?? sun.sunset;
  const targetLabel = target === "sunset" ? "sunset" : "the start of golden hour";

  const arriveBy = targetTime - setup;
  const startWalking = arriveBy - walk.minutes;
  const leaveHome = startWalking - drive;

  const goldenLengthMin =
    sun.goldenStart !== null && sun.goldenEnd !== null ? sun.goldenEnd - sun.goldenStart : null;
  const blueLengthMin = sun.goldenEnd !== null && sun.blueEnd !== null ? sun.blueEnd - sun.goldenEnd : null;

  const timeline = [
    { id: "leave", label: "Leave home", at: leaveHome },
    { id: "trailhead", label: "Start walking", at: startWalking },
    { id: "arrive", label: "At the viewpoint", at: arriveBy },
    { id: "golden", label: "Golden hour begins (sun at +6°)", at: sun.goldenStart },
    { id: "sunset", label: "Sunset", at: sun.sunset },
    { id: "goldenEnd", label: "Golden hour ends (sun at −4°)", at: sun.goldenEnd },
    { id: "blueEnd", label: "Civil twilight ends (sun at −6°) — take a torch", at: sun.blueEnd },
  ].filter((step) => Number.isFinite(step.at));

  const notes = [];
  if (sun.blueEnd !== null && sun.sunset !== null) {
    notes.push(
      `You have about ${formatMinutes(sun.blueEnd - sun.sunset)} of usable light after sunset before civil twilight ends. Below that you are walking down by torchlight.`,
    );
  }
  if (walk.minutes > 0 && ascent / Math.max(distance, 0.001) > 150) {
    notes.push("This is steep ground — over 150 m of ascent per kilometre. Naismith understates steep, rough terrain, so treat the walking time as a minimum.");
  }
  if (leaveHome < 0) {
    notes.push("The departure lands before midnight on the day before. Check you have read the date correctly.");
  }
  if (level.id === "fast") {
    notes.push("A pace faster than Naismith's leaves no margin. If anything goes wrong you will be descending in the dark.");
  }
  const descentAfterDarkRisk = sun.blueEnd !== null && walk.minutes > sun.blueEnd - (sun.goldenEnd ?? sun.sunset);
  if (descentAfterDarkRisk) {
    notes.push("The walk back is longer than the light that remains after golden hour. Plan for a head torch and a route you can follow in the dark.");
  }

  return {
    sun,
    walk,
    level,
    targetLabel,
    targetTime,
    arriveBy,
    startWalking,
    leaveHome,
    goldenLengthMin,
    blueLengthMin,
    totalOutboundMin: drive + walk.minutes + setup,
    timeline,
    notes,
  };
}

/** Clipboard summary. */
export function formatSunsetPlanText(plan, place) {
  if (!plan || plan.error) return "";
  const lines = [
    `Sunset viewpoint plan${place ? ` — ${place}` : ""}`,
    `Leave home at ${formatClock(plan.leaveHome)} to reach the viewpoint ${formatMinutes(plan.targetTime - plan.arriveBy)} before ${plan.targetLabel}.`,
    `Walking time (Naismith, ${plan.level.label.toLowerCase()}): ${formatMinutes(plan.walk.minutes)}`,
    "",
    "Timeline:",
  ];
  plan.timeline.forEach((step) => lines.push(`  ${formatClock(step.at)}  ${step.label}`));
  if (plan.goldenLengthMin !== null) {
    lines.push("", `Golden hour lasts ${formatMinutes(plan.goldenLengthMin)}.`);
  }
  return lines.join("\n");
}
