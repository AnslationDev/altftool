/**
 * Location Scout Notes Builder — solar geometry and a scouting scorecard.
 *
 * The sun maths follows the NOAA solar position algorithm (the same equations
 * behind the NOAA Solar Calculator spreadsheet). Everything is pure: the date,
 * time and UTC offset are always arguments.
 */

const DEG = Math.PI / 180;
const toRad = (degrees) => degrees * DEG;
const toDeg = (radians) => radians / DEG;

/** Minutes in a day. */
export const MINUTES_PER_DAY = 1440;

/**
 * Solar elevation angles that define the light windows photographers use.
 * -0.833 deg is the standard sunrise/sunset elevation: it accounts for
 * atmospheric refraction plus the sun's apparent radius.
 */
export const SUN_EVENTS = {
  sunrise: -0.833,
  goldenHour: 6,
  civilTwilight: -6,
};

export const LIMITS = {
  minLatitude: -90,
  maxLatitude: 90,
  minLongitude: -180,
  maxLongitude: 180,
  minUtcOffsetMinutes: -840, // UTC-14:00
  maxUtcOffsetMinutes: 840, // UTC+14:00
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse "YYYY-MM-DD"; returns null when it is not a real calendar date. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day, stamp };
}

/** True for a value that was never actually typed — must be checked before Number(), since Number("") is 0. */
const isBlank = (value) => value === "" || value === null || typeof value === "undefined";

/** Convert a UTC offset in hours (for example -4.5) to whole minutes. */
export function utcOffsetMinutesFromHours(hours) {
  if (isBlank(hours)) return NaN;
  const value = Number(hours);
  if (!Number.isFinite(value)) return NaN;
  return Math.round(value * 60);
}

/** Duration in minutes as "1 h 20 min". */
export function formatDuration(totalMinutes) {
  const value = Number(totalMinutes);
  if (!Number.isFinite(value) || value < 0) return "0 min";
  const rounded = Math.round(value);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

/** Parse "HH:MM" into minutes since midnight; NaN when malformed. */
export function parseClock(value) {
  if (typeof value !== "string" || !/^\d{1,2}:\d{2}$/.test(value)) return NaN;
  const [hours, minutes] = value.split(":").map(Number);
  if (hours > 23 || minutes > 59) return NaN;
  return hours * 60 + minutes;
}

/** Format minutes since midnight as "HH:MM", wrapping across midnight. */
export function formatClock(totalMinutes) {
  const value = Number(totalMinutes);
  if (!Number.isFinite(value)) return "--:--";
  const wrapped = ((Math.round(value) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
}

/** Julian day number at 00:00 UTC for a Gregorian calendar date. */
export function julianDay({ year, month, day }) {
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
 * Solar declination and the equation of time for a Julian century.
 * Returns declination in degrees and the equation of time in minutes.
 */
export function solarParameters(julianCentury) {
  const t = julianCentury;
  const meanLongitude = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360;
  const l0 = meanLongitude < 0 ? meanLongitude + 360 : meanLongitude;
  const meanAnomaly = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const eccentricity = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);

  const centre =
    Math.sin(toRad(meanAnomaly)) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(toRad(2 * meanAnomaly)) * (0.019993 - 0.000101 * t) +
    Math.sin(toRad(3 * meanAnomaly)) * 0.000289;

  const trueLongitude = l0 + centre;
  const apparentLongitude =
    trueLongitude - 0.00569 - 0.00478 * Math.sin(toRad(125.04 - 1934.136 * t));

  const meanObliquity =
    23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const obliquity = meanObliquity + 0.00256 * Math.cos(toRad(125.04 - 1934.136 * t));

  const declination = toDeg(
    Math.asin(Math.sin(toRad(obliquity)) * Math.sin(toRad(apparentLongitude))),
  );

  const y = Math.tan(toRad(obliquity / 2)) ** 2;
  const equationOfTime =
    4 *
    toDeg(
      y * Math.sin(2 * toRad(l0)) -
        2 * eccentricity * Math.sin(toRad(meanAnomaly)) +
        4 * eccentricity * y * Math.sin(toRad(meanAnomaly)) * Math.cos(2 * toRad(l0)) -
        0.5 * y * y * Math.sin(4 * toRad(l0)) -
        1.25 * eccentricity * eccentricity * Math.sin(2 * toRad(meanAnomaly)),
    );

  return { declination, equationOfTime, obliquity, eccentricity };
}

/**
 * Hour angle in degrees at which the sun sits at a given elevation.
 * cos(H) = (sin(elevation) - sin(lat) sin(dec)) / (cos(lat) cos(dec))
 * Returns null when the sun never reaches that elevation on the day.
 */
export function hourAngleForElevation(elevationDeg, latitude, declination) {
  const numerator =
    Math.sin(toRad(elevationDeg)) - Math.sin(toRad(latitude)) * Math.sin(toRad(declination));
  const denominator = Math.cos(toRad(latitude)) * Math.cos(toRad(declination));
  if (!(Math.abs(denominator) > 0)) return null;
  const cosH = numerator / denominator;
  if (cosH > 1 || cosH < -1) return null;
  return toDeg(Math.acos(cosH));
}

/**
 * Sun position (elevation and azimuth) at a specific moment.
 * `minutesLocal` is clock time at the location; `utcOffsetMinutes` converts it
 * back to UTC before the astronomy runs.
 */
export function sunPosition({ date, minutesLocal, latitude, longitude, utcOffsetMinutes }) {
  const minutesUtc = minutesLocal - utcOffsetMinutes;
  const jd = julianDay(date) + minutesUtc / MINUTES_PER_DAY;
  const t = (jd - 2451545) / 36525;
  const { declination, equationOfTime } = solarParameters(t);

  // True solar time in minutes, then the hour angle either side of local noon.
  const trueSolarTime = (minutesUtc + equationOfTime + 4 * longitude + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hourAngle = trueSolarTime / 4 - 180;

  const zenith = toDeg(
    Math.acos(
      Math.min(
        1,
        Math.max(
          -1,
          Math.sin(toRad(latitude)) * Math.sin(toRad(declination)) +
            Math.cos(toRad(latitude)) * Math.cos(toRad(declination)) * Math.cos(toRad(hourAngle)),
        ),
      ),
    ),
  );
  const elevation = 90 - zenith;

  let azimuth;
  const cosZenith = Math.cos(toRad(zenith));
  const denominator = Math.cos(toRad(latitude)) * Math.sin(toRad(zenith));
  if (Math.abs(denominator) < 1e-9) {
    azimuth = hourAngle > 0 ? 180 : 0;
  } else {
    const cosAz = (Math.sin(toRad(latitude)) * cosZenith - Math.sin(toRad(declination))) / denominator;
    azimuth = toDeg(Math.acos(Math.min(1, Math.max(-1, cosAz))));
    // NOAA convention: afternoon (positive hour angle) mirrors the morning arc.
    azimuth = hourAngle > 0 ? (azimuth + 180) % 360 : (540 - azimuth) % 360;
  }

  return { elevation, azimuth, declination, equationOfTime };
}

/** Sixteen-point compass name for an azimuth in degrees. */
export function compassPoint(azimuth) {
  const points = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
  ];
  const value = Number(azimuth);
  if (!Number.isFinite(value)) return "—";
  const index = Math.round((((value % 360) + 360) % 360) / 22.5) % 16;
  return points[index];
}

/**
 * Sunrise, sunset, solar noon, golden hour and civil twilight for one day.
 * All times are returned as local clock minutes.
 */
export function sunTimes({ dateIso, latitude, longitude, utcOffsetMinutes }) {
  const date = parseIsoDate(dateIso);
  if (!date) return { error: "Enter the shoot date as YYYY-MM-DD." };

  // Check for a cleared field before Number() converts "" to 0 and hides it.
  if (isBlank(latitude) || isBlank(longitude) || isBlank(utcOffsetMinutes)) {
    return { error: "Enter valid numbers for latitude, longitude and UTC offset." };
  }

  const lat = Number(latitude);
  const lon = Number(longitude);
  const offset = Number(utcOffsetMinutes);

  if (![lat, lon, offset].every(Number.isFinite)) {
    return { error: "Enter valid numbers for latitude, longitude and UTC offset." };
  }
  if (lat < LIMITS.minLatitude || lat > LIMITS.maxLatitude) {
    return { error: "Latitude must be between -90 and 90." };
  }
  if (lon < LIMITS.minLongitude || lon > LIMITS.maxLongitude) {
    return { error: "Longitude must be between -180 and 180." };
  }
  if (offset < LIMITS.minUtcOffsetMinutes || offset > LIMITS.maxUtcOffsetMinutes) {
    return { error: "UTC offset must be between -14:00 and +14:00." };
  }

  // Evaluate the sun's parameters at local solar noon for the day.
  const jdNoon = julianDay(date) + 0.5;
  const t = (jdNoon - 2451545) / 36525;
  const { declination, equationOfTime } = solarParameters(t);

  const solarNoonUtc = 720 - 4 * lon - equationOfTime;
  const solarNoonLocal = solarNoonUtc + offset;

  const build = (elevationDeg) => {
    const ha = hourAngleForElevation(elevationDeg, lat, declination);
    if (ha === null) return null;
    return { rise: solarNoonLocal - 4 * ha, set: solarNoonLocal + 4 * ha };
  };

  const day = build(SUN_EVENTS.sunrise);
  const golden = build(SUN_EVENTS.goldenHour);
  const civil = build(SUN_EVENTS.civilTwilight);

  const noonPosition = sunPosition({
    date,
    minutesLocal: solarNoonLocal,
    latitude: lat,
    longitude: lon,
    utcOffsetMinutes: offset,
  });

  return {
    date,
    declination,
    equationOfTime,
    solarNoon: solarNoonLocal,
    noonElevation: noonPosition.elevation,
    sunrise: day ? day.rise : null,
    sunset: day ? day.set : null,
    dayLengthMinutes: day ? day.set - day.rise : declination * lat > 0 ? MINUTES_PER_DAY : 0,
    polarDay: !day && declination * lat > 0,
    polarNight: !day && declination * lat <= 0,
    goldenMorning: day && golden ? { start: day.rise, end: golden.rise } : null,
    goldenEvening: day && golden ? { start: golden.set, end: day.set } : null,
    blueMorning: day && civil ? { start: civil.rise, end: day.rise } : null,
    blueEvening: day && civil ? { start: day.set, end: civil.set } : null,
  };
}

/** Scouting criteria. Weights reflect how often each one kills a location. */
export const SCOUT_CRITERIA = [
  { id: "noise", label: "Quiet enough to record dialogue", weight: 5, hint: "Traffic, aircraft path, air conditioning, playground, refrigeration hum." },
  { id: "power", label: "Mains power within reach", weight: 3, hint: "How many sockets, on what circuit, and how far the cable run is." },
  { id: "permission", label: "Permission is straightforward", weight: 5, hint: "Who signs, how long it takes, and whether a fee or insurance is required." },
  { id: "light", label: "Light is usable and controllable", weight: 4, hint: "Window direction, mixed colour temperature, overheads you can switch off." },
  { id: "access", label: "Load-in and parking work", weight: 3, hint: "Distance from vehicle, lifts, stairs, and any loading time limit." },
  { id: "space", label: "Enough space for the setup", weight: 3, hint: "Subject-to-background distance, ceiling height, room for stands." },
  { id: "backup", label: "There is a wet-weather or fallback option", weight: 2, hint: "A covered alternative within a few minutes' walk." },
  { id: "connectivity", label: "Signal and connectivity", weight: 1, hint: "Phone signal for the team, and internet if you need to upload or stream." },
];

/** Maximum rating on each criterion. */
export const MAX_RATING = 5;

/**
 * Weighted score for a location.
 * score = sum(rating x weight) / (max rating x sum of weights) x 100
 */
export function scoreLocation(ratings = {}) {
  let weighted = 0;
  let weightTotal = 0;
  const rows = SCOUT_CRITERIA.map((criterion) => {
    const raw = Number(ratings[criterion.id]);
    const rating = Number.isFinite(raw) ? Math.min(MAX_RATING, Math.max(0, raw)) : 0;
    weighted += rating * criterion.weight;
    weightTotal += criterion.weight;
    return { ...criterion, rating, contribution: rating * criterion.weight };
  });

  const max = MAX_RATING * weightTotal;
  const percent = max > 0 ? (weighted / max) * 100 : 0;

  let grade;
  if (percent >= 85) grade = "Book it";
  else if (percent >= 70) grade = "Workable with fixes";
  else if (percent >= 50) grade = "Risky — scout an alternative";
  else grade = "Walk away";

  const weakest = rows
    .filter((row) => row.rating <= 2)
    .sort((a, b) => b.weight - a.weight || a.rating - b.rating);

  return { rows, weighted, maxScore: max, percent, grade, weakest };
}

/**
 * One complete location note: sun windows for the date plus the scorecard.
 */
export function buildLocationNote({
  name,
  dateIso,
  latitude,
  longitude,
  utcOffsetMinutes,
  shootTime,
  ratings,
} = {}) {
  const times = sunTimes({ dateIso, latitude, longitude, utcOffsetMinutes });
  if (times.error) return times;

  const minutesLocal = parseClock(shootTime);
  if (!Number.isFinite(minutesLocal)) {
    return { error: "Shoot time must be in 24-hour HH:MM form." };
  }

  const position = sunPosition({
    date: times.date,
    minutesLocal,
    latitude: Number(latitude),
    longitude: Number(longitude),
    utcOffsetMinutes: Number(utcOffsetMinutes),
  });

  const score = scoreLocation(ratings);

  return {
    name: String(name || "Untitled location").trim() || "Untitled location",
    times,
    shootTimeMinutes: minutesLocal,
    sunElevation: position.elevation,
    sunAzimuth: position.azimuth,
    sunCompass: compassPoint(position.azimuth),
    sunIsUp: position.elevation > SUN_EVENTS.sunrise,
    inGoldenHour:
      position.elevation > SUN_EVENTS.sunrise && position.elevation <= SUN_EVENTS.goldenHour,
    score,
  };
}
