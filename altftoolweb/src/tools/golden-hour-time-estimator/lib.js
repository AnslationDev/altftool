/**
 * Golden Hour Time Estimator — solar geometry from the NOAA Solar Calculator
 * equations, with no clock reads and no external data.
 *
 * Everything is derived from the date, latitude, longitude and UTC offset the
 * caller passes in. The chain is the standard one:
 *
 *   Julian century  ->  geometric mean longitude and anomaly of the Sun
 *                   ->  equation of centre, apparent longitude
 *                   ->  obliquity of the ecliptic, solar declination
 *                   ->  equation of time
 *                   ->  hour angle for a chosen solar elevation
 *                   ->  local clock time of that elevation
 *
 * Elevation thresholds (the standard photographic definitions, measured as the
 * angle of the Sun's centre above the horizon):
 *
 *   sunrise / sunset      -0.833°  (34' refraction + 16' solar semi-diameter)
 *   golden hour            -4° to +6°
 *   blue hour              -6° to -4°
 *   civil twilight ends    -6°
 *   nautical twilight     -12°
 *   astronomical twilight -18°
 *
 * NOAA states these equations are accurate to about a minute for latitudes
 * between 72°N and 72°S; nearer the poles the Sun can fail to cross a
 * threshold at all, and those events are returned as null rather than a
 * fabricated time.
 */

/** Solar elevation, in degrees, at each event boundary. */
export const ELEVATIONS = {
  goldenHourEnd: 6, // Sun 6° up — golden light is over
  sunriseSunset: -0.833, // refraction (34') + semi-diameter (16')
  goldenHourEdge: -4, // outer edge of golden hour
  blueHourEdge: -6, // civil twilight limit, blue hour ends here
  nautical: -12,
  astronomical: -18,
};

/** Minutes in a day, used to wrap clock arithmetic. */
export const MINUTES_PER_DAY = 1440;

/** Latitude beyond which NOAA's own accuracy note no longer holds. */
export const NOAA_LATITUDE_LIMIT = 72;

const rad = (deg) => (deg * Math.PI) / 180;
const deg = (radians) => (radians * 180) / Math.PI;
const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round = (value, places = 2) => {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

/**
 * Julian Day at 00:00 UTC for a Gregorian calendar date.
 * Check: 2000-01-01 00:00 UTC = 2451544.5.
 */
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

/** Parse "YYYY-MM-DD" into parts, rejecting anything else. */
export function parseISODate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? "").trim());
  if (!match) return { error: "Enter the date as YYYY-MM-DD." };
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return { error: "That month does not exist." };
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > daysInMonth) return { error: `That month has ${daysInMonth} days.` };
  if (year < 1900 || year > 2100) return { error: "Pick a date between 1900 and 2100." };
  return { year, month, day };
}

/**
 * Solar constants for one date, following the NOAA Solar Calculator.
 *
 * @param {number} jdLocalMidnightUT Julian Day of local midnight expressed in UT.
 */
export function solarParameters(jdLocalMidnightUT) {
  const t = (jdLocalMidnightUT - 2451545) / 36525; // Julian centuries since J2000.0
  const meanLong = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360;
  const l0 = meanLong < 0 ? meanLong + 360 : meanLong;
  const m = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const eccentricity = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  const centre =
    Math.sin(rad(m)) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(rad(2 * m)) * (0.019993 - 0.000101 * t) +
    Math.sin(rad(3 * m)) * 0.000289;
  const trueLong = l0 + centre;
  const appLong = trueLong - 0.00569 - 0.00478 * Math.sin(rad(125.04 - 1934.136 * t));
  const meanObliquity = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const obliquity = meanObliquity + 0.00256 * Math.cos(rad(125.04 - 1934.136 * t));
  const declination = deg(Math.asin(Math.sin(rad(obliquity)) * Math.sin(rad(appLong))));
  const varY = Math.tan(rad(obliquity / 2)) ** 2;
  const equationOfTime =
    4 *
    deg(
      varY * Math.sin(2 * rad(l0)) -
        2 * eccentricity * Math.sin(rad(m)) +
        4 * eccentricity * varY * Math.sin(rad(m)) * Math.cos(2 * rad(l0)) -
        0.5 * varY * varY * Math.sin(4 * rad(l0)) -
        1.25 * eccentricity * eccentricity * Math.sin(2 * rad(m)),
    );
  return { t, declination, equationOfTime };
}

/**
 * Hour angle, in degrees, at which the Sun reaches `elevation` on this date.
 * Returns null when the Sun never reaches that elevation (polar day or night).
 */
export function hourAngleForElevation(latitude, declination, elevation) {
  const zenith = 90 - elevation;
  const cosH =
    Math.cos(rad(zenith)) / (Math.cos(rad(latitude)) * Math.cos(rad(declination))) -
    Math.tan(rad(latitude)) * Math.tan(rad(declination));
  if (cosH > 1 || cosH < -1) return null;
  return deg(Math.acos(cosH));
}

/** Minutes past local midnight -> "HH:MM". */
export function formatTime(minutes) {
  if (!isNum(minutes)) return "—";
  const wrapped = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / 60);
  const mins = Math.floor(wrapped % 60);
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/** Minutes -> "1 h 24 min". */
export function formatDuration(minutes) {
  if (!isNum(minutes) || minutes < 0) return "—";
  const total = Math.round(minutes);
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours === 0) return `${mins} min`;
  return `${hours} h ${String(mins).padStart(2, "0")} min`;
}

/**
 * Sun elevation and azimuth at a given local clock time.
 *
 * @param {{ dateISO: string, latitude: number, longitude: number,
 *           utcOffsetHours: number, minutesOfDay: number }} input
 */
export function solarPosition({ dateISO, latitude, longitude, utcOffsetHours, minutesOfDay } = {}) {
  const parts = parseISODate(dateISO);
  if (parts.error) return { error: parts.error };
  if (!isNum(latitude) || latitude < -90 || latitude > 90) return { error: "Latitude must be between -90 and 90." };
  if (!isNum(longitude) || longitude < -180 || longitude > 180) return { error: "Longitude must be between -180 and 180." };
  if (!isNum(utcOffsetHours) || utcOffsetHours < -12 || utcOffsetHours > 14) {
    return { error: "The UTC offset must be between -12 and +14 hours." };
  }
  if (!isNum(minutesOfDay) || minutesOfDay < 0 || minutesOfDay >= MINUTES_PER_DAY) {
    return { error: "The time must be between 00:00 and 23:59." };
  }

  const jd = julianDay(parts.year, parts.month, parts.day) - utcOffsetHours / 24;
  const { declination, equationOfTime } = solarParameters(jd + minutesOfDay / MINUTES_PER_DAY);

  let trueSolarTime = (minutesOfDay + equationOfTime + 4 * longitude - 60 * utcOffsetHours) % MINUTES_PER_DAY;
  if (trueSolarTime < 0) trueSolarTime += MINUTES_PER_DAY;
  const hourAngle = trueSolarTime / 4 < 0 ? trueSolarTime / 4 + 180 : trueSolarTime / 4 - 180;

  const zenith = deg(
    Math.acos(
      Math.sin(rad(latitude)) * Math.sin(rad(declination)) +
        Math.cos(rad(latitude)) * Math.cos(rad(declination)) * Math.cos(rad(hourAngle)),
    ),
  );
  const elevationRaw = 90 - zenith;

  // Atmospheric refraction, NOAA piecewise approximation, in degrees.
  let refraction = 0;
  if (elevationRaw <= 85) {
    const te = Math.tan(rad(elevationRaw));
    if (elevationRaw > 5) refraction = 58.1 / te - 0.07 / te ** 3 + 0.000086 / te ** 5;
    else if (elevationRaw > -0.575)
      refraction = 1735 + elevationRaw * (-518.2 + elevationRaw * (103.4 + elevationRaw * (-12.79 + elevationRaw * 0.711)));
    else refraction = -20.772 / te;
    refraction /= 3600;
  }

  let azimuth;
  const cosAz =
    (Math.sin(rad(latitude)) * Math.cos(rad(zenith)) - Math.sin(rad(declination))) /
    (Math.cos(rad(latitude)) * Math.sin(rad(zenith)));
  const clamped = Math.min(1, Math.max(-1, cosAz));
  if (hourAngle > 0) azimuth = (deg(Math.acos(clamped)) + 180) % 360;
  else azimuth = (540 - deg(Math.acos(clamped))) % 360;

  return {
    elevation: round(elevationRaw + refraction, 2),
    elevationGeometric: round(elevationRaw, 2),
    azimuth: round(azimuth, 2),
    declination: round(declination, 3),
    equationOfTimeMinutes: round(equationOfTime, 2),
    hourAngle: round(hourAngle, 2),
  };
}

/**
 * Every sun event for one day at one place.
 *
 * @param {{ dateISO: string, latitude: number, longitude: number, utcOffsetHours: number }} input
 * @returns {object} event times in minutes past local midnight, or { error }
 */
export function sunTimes({ dateISO, latitude, longitude, utcOffsetHours } = {}) {
  const parts = parseISODate(dateISO);
  if (parts.error) return { error: parts.error };
  if (!isNum(latitude) || latitude < -90 || latitude > 90) return { error: "Latitude must be between -90 and 90." };
  if (!isNum(longitude) || longitude < -180 || longitude > 180) return { error: "Longitude must be between -180 and 180." };
  if (!isNum(utcOffsetHours) || utcOffsetHours < -12 || utcOffsetHours > 14) {
    return { error: "The UTC offset must be between -12 and +14 hours." };
  }

  const jd = julianDay(parts.year, parts.month, parts.day) - utcOffsetHours / 24;
  const { declination, equationOfTime } = solarParameters(jd);
  const solarNoon = 720 - 4 * longitude - equationOfTime + 60 * utcOffsetHours;

  const at = (elevation, side) => {
    const ha = hourAngleForElevation(latitude, declination, elevation);
    if (ha === null) return null;
    return solarNoon + (side === "rise" ? -4 * ha : 4 * ha);
  };

  const sunrise = at(ELEVATIONS.sunriseSunset, "rise");
  const sunset = at(ELEVATIONS.sunriseSunset, "set");
  const morningGoldenStart = at(ELEVATIONS.goldenHourEdge, "rise");
  const morningGoldenEnd = at(ELEVATIONS.goldenHourEnd, "rise");
  const eveningGoldenStart = at(ELEVATIONS.goldenHourEnd, "set");
  const eveningGoldenEnd = at(ELEVATIONS.goldenHourEdge, "set");
  const dawnCivil = at(ELEVATIONS.blueHourEdge, "rise");
  const duskCivil = at(ELEVATIONS.blueHourEdge, "set");
  const dawnNautical = at(ELEVATIONS.nautical, "rise");
  const duskNautical = at(ELEVATIONS.nautical, "set");
  const dawnAstronomical = at(ELEVATIONS.astronomical, "rise");
  const duskAstronomical = at(ELEVATIONS.astronomical, "set");

  const span = (start, end) => (isNum(start) && isNum(end) ? round(end - start, 1) : null);

  const polar =
    sunrise === null
      ? hourAngleForElevation(latitude, declination, 0) === null && declination * latitude > 0
        ? "The Sun stays above the horizon all day here on this date (midnight sun)."
        : "The Sun does not rise here on this date (polar night)."
      : null;

  return {
    dateISO,
    latitude,
    longitude,
    utcOffsetHours,
    declination: round(declination, 3),
    equationOfTimeMinutes: round(equationOfTime, 2),
    solarNoon: round(solarNoon, 1),
    sunrise: sunrise === null ? null : round(sunrise, 1),
    sunset: sunset === null ? null : round(sunset, 1),
    morningBlueStart: dawnCivil === null ? null : round(dawnCivil, 1),
    morningBlueEnd: morningGoldenStart === null ? null : round(morningGoldenStart, 1),
    morningGoldenStart: morningGoldenStart === null ? null : round(morningGoldenStart, 1),
    morningGoldenEnd: morningGoldenEnd === null ? null : round(morningGoldenEnd, 1),
    eveningGoldenStart: eveningGoldenStart === null ? null : round(eveningGoldenStart, 1),
    eveningGoldenEnd: eveningGoldenEnd === null ? null : round(eveningGoldenEnd, 1),
    eveningBlueStart: eveningGoldenEnd === null ? null : round(eveningGoldenEnd, 1),
    eveningBlueEnd: duskCivil === null ? null : round(duskCivil, 1),
    civilDawn: dawnCivil === null ? null : round(dawnCivil, 1),
    civilDusk: duskCivil === null ? null : round(duskCivil, 1),
    nauticalDawn: dawnNautical === null ? null : round(dawnNautical, 1),
    nauticalDusk: duskNautical === null ? null : round(duskNautical, 1),
    astronomicalDawn: dawnAstronomical === null ? null : round(dawnAstronomical, 1),
    astronomicalDusk: duskAstronomical === null ? null : round(duskAstronomical, 1),
    dayLengthMinutes: span(sunrise, sunset),
    morningGoldenMinutes: span(morningGoldenStart, morningGoldenEnd),
    eveningGoldenMinutes: span(eveningGoldenStart, eveningGoldenEnd),
    morningBlueMinutes: span(dawnCivil, morningGoldenStart),
    eveningBlueMinutes: span(eveningGoldenEnd, duskCivil),
    polarNote: polar,
    accuracyNote:
      Math.abs(latitude) > NOAA_LATITUDE_LIMIT
        ? `Above ${NOAA_LATITUDE_LIMIT}° latitude these equations lose accuracy; treat the times as approximate.`
        : null,
  };
}

/**
 * Sun elevation sampled across the day, for drawing the sun path.
 *
 * @param {{ dateISO, latitude, longitude, utcOffsetHours, stepMinutes? }} input
 * @returns {Array<{ minutes: number, elevation: number, azimuth: number }>|{error:string}}
 */
export function sunPath({ dateISO, latitude, longitude, utcOffsetHours, stepMinutes = 15 } = {}) {
  if (!isNum(stepMinutes) || stepMinutes < 1 || stepMinutes > 120) {
    return { error: "The sampling step must be between 1 and 120 minutes." };
  }
  const points = [];
  for (let minutes = 0; minutes < MINUTES_PER_DAY; minutes += stepMinutes) {
    const position = solarPosition({ dateISO, latitude, longitude, utcOffsetHours, minutesOfDay: minutes });
    if (position.error) return { error: position.error };
    points.push({ minutes, elevation: position.elevation, azimuth: position.azimuth });
  }
  return points;
}

/** A few well-known shooting locations, with their standard UTC offsets. */
export const PRESET_PLACES = [
  { id: "delhi", label: "New Delhi, India", latitude: 28.6139, longitude: 77.209, utcOffsetHours: 5.5 },
  { id: "mumbai", label: "Mumbai, India", latitude: 19.076, longitude: 72.8777, utcOffsetHours: 5.5 },
  { id: "bengaluru", label: "Bengaluru, India", latitude: 12.9716, longitude: 77.5946, utcOffsetHours: 5.5 },
  { id: "london", label: "London, UK", latitude: 51.5074, longitude: -0.1278, utcOffsetHours: 0 },
  { id: "newyork", label: "New York, USA", latitude: 40.7128, longitude: -74.006, utcOffsetHours: -5 },
  { id: "sydney", label: "Sydney, Australia", latitude: -33.8688, longitude: 151.2093, utcOffsetHours: 10 },
  { id: "reykjavik", label: "Reykjavik, Iceland", latitude: 64.1466, longitude: -21.9426, utcOffsetHours: 0 },
];
