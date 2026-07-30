/**
 * Panchang / almanac astronomy.
 *
 * Everything in this file is a pure function of its arguments. There is no React,
 * no DOM, no network, no clock read (`Date`, `Date.now`, `performance.now`) and no
 * randomness. The same (date, latitude, longitude, timezone) always returns exactly
 * the same numbers, on any machine, in any order, forever.
 *
 * Sources actually implemented here
 * --------------------------------
 * - Sunrise / sunset / solar noon: the NOAA solar-position algorithm (the one behind
 *   NOAA GML's Solar Calculator), which is itself Meeus' low-precision solar theory
 *   plus the standard -0.833 degree geometric altitude for the upper limb with mean
 *   refraction. Accurate to well under a minute for latitudes below ~60 degrees.
 * - Solar longitude: Meeus, "Astronomical Algorithms" 2nd ed., chapter 25 (accuracy
 *   about 0.01 degree).
 * - Lunar longitude / latitude / distance: Meeus chapter 47, the ELP-2000/82
 *   truncation printed in tables 47.A and 47.B (accuracy about 10 arcseconds in
 *   longitude, 4 arcseconds in latitude).
 * - Sidereal (nirayana) longitudes: Lahiri / Chitrapaksha ayanamsa, modelled as the
 *   IAU-1976 accumulated general precession in longitude anchored to 23 deg 51' 11"
 *   at J2000.0. Good to roughly one arcminute over 1900-2100, which is ~1/800th of a
 *   nakshatra, so it never moves a nakshatra boundary by more than a few seconds of
 *   clock time. WHICH AYANAMSA YOU USE MATTERS: Raman, Krishnamurti and Fagan-Bradley
 *   sit 0.3 to 0.9 degrees away from Lahiri, which can shift a nakshatra or tithi
 *   boundary by more than an hour. This file is Lahiri and says so on the page.
 * - Tithi / karana from the Moon-Sun elongation, nakshatra from the sidereal lunar
 *   longitude, yoga from the sum of the sidereal solar and lunar longitudes. Ending
 *   times are found by Newton iteration on the actual angle, not assumed durations.
 * - Rahu Kaal, Yamaganda, Gulika, Abhijit, Brahma Muhurta and the Choghadiya are
 *   mechanical divisions of the computed day and night, using the published weekday
 *   part indices.
 *
 * Deliberately NOT implemented (and therefore not displayed anywhere):
 * - Amrit Kaal. It is read off a per-nakshatra "amrita ghati" table that differs
 *   between panchang traditions; there is no single derivation to verify against.
 * - Pratah / Sayan Sandhya. Definitions differ by sampradaya (some use a fixed
 *   muhurta, some a fraction of the day, some the arunodaya).
 * - Festival and vrat lists. These need regional convention rules, not astronomy.
 */

/* ------------------------------------------------------------------ *
 * Angle helpers
 * ------------------------------------------------------------------ */

const DEG = Math.PI / 180;

const sinD = (d) => Math.sin(d * DEG);
const cosD = (d) => Math.cos(d * DEG);
const tanD = (d) => Math.tan(d * DEG);
const asinD = (x) => Math.asin(Math.max(-1, Math.min(1, x))) / DEG;
const acosD = (x) => Math.acos(Math.max(-1, Math.min(1, x))) / DEG;
const atan2D = (y, x) => Math.atan2(y, x) / DEG;

/** Wrap to [0, 360). */
export function norm360(x) {
  const r = x % 360;
  return r < 0 ? r + 360 : r;
}

/** Wrap to (-180, 180]. */
export function norm180(x) {
  const r = norm360(x);
  return r > 180 ? r - 360 : r;
}

/* ------------------------------------------------------------------ *
 * Calendar <-> Julian Day (Meeus ch. 7). Gregorian calendar only.
 * ------------------------------------------------------------------ */

/**
 * Julian Day for a Gregorian civil date at 00:00 UT.
 * `day` may be fractional.
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
  return (
    Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5
  );
}

/** Inverse of {@link julianDay}: JD -> {year, month, day, hours}. */
export function calendarFromJulianDay(jd) {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  const alpha = Math.floor((z - 1867216.25) / 36524.25);
  const a = z + 1 + alpha - Math.floor(alpha / 4);
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const dayWithFraction = b - d - Math.floor(30.6001 * e) + f;
  const day = Math.floor(dayWithFraction);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  return { year, month, day, hours: (dayWithFraction - day) * 24 };
}

/** 0 = Sunday ... 6 = Saturday, for the civil date whose 00:00 UT is `jd`. */
export function weekdayFromJulianDay(jd) {
  return ((Math.floor(jd + 1.5) % 7) + 7) % 7;
}

/** Julian centuries from J2000.0. */
const centuriesFromJ2000 = (jd) => (jd - 2451545) / 36525;

/* ------------------------------------------------------------------ *
 * Delta T (TD - UT)
 * ------------------------------------------------------------------ */

/**
 * Difference between Dynamical Time and Universal Time, in seconds, from the
 * Espenak & Meeus polynomial expressions used by NASA's eclipse site.
 *
 * The Sun and Moon series are functions of TD, but a civil date and a sunrise are
 * in UT. In 2026 the gap is about 70 seconds, which moves a tithi or nakshatra
 * ending time by roughly a minute — small, but free to correct.
 */
export function deltaTSeconds(jd) {
  const { year, month } = calendarFromJulianDay(jd);
  const y = year + (month - 0.5) / 12;

  if (y >= 2005 && y < 2050) {
    const t = y - 2000;
    return 62.92 + 0.32217 * t + 0.005589 * t * t;
  }
  if (y >= 1986 && y < 2005) {
    const t = y - 2000;
    return (
      63.86 +
      0.3345 * t -
      0.060374 * t * t +
      0.0017275 * t ** 3 +
      0.000651814 * t ** 4 +
      0.00002373599 * t ** 5
    );
  }
  if (y >= 1961 && y < 1986) {
    const t = y - 1975;
    return 45.45 + 1.067 * t - (t * t) / 260 - (t * t * t) / 718;
  }
  if (y >= 2050 && y < 2150) {
    const u = (y - 1820) / 100;
    return -20 + 32 * u * u - 0.5628 * (2150 - y);
  }
  const u = (y - 1820) / 100;
  return -20 + 32 * u * u;
}

/** Convert a UT Julian Day to the Dynamical Time argument the series expect. */
export function ephemerisJd(jd) {
  return jd + deltaTSeconds(jd) / 86400;
}

/* ------------------------------------------------------------------ *
 * Nutation and obliquity (Meeus ch. 22, leading terms)
 * ------------------------------------------------------------------ */

function nutationAndObliquity(t) {
  const omega = 125.04452 - 1934.136261 * t + 0.0020708 * t * t + (t * t * t) / 450000;
  const lSun = 280.4665 + 36000.7698 * t;
  const lMoon = 218.3165 + 481267.8813 * t;
  const deltaPsi =
    (-17.2 * sinD(omega) -
      1.32 * sinD(2 * lSun) -
      0.23 * sinD(2 * lMoon) +
      0.21 * sinD(2 * omega)) /
    3600;
  const deltaEps =
    (9.2 * cosD(omega) + 0.57 * cosD(2 * lSun) + 0.1 * cosD(2 * lMoon) - 0.09 * cosD(2 * omega)) /
    3600;
  const eps0 =
    23 +
    26 / 60 +
    21.448 / 3600 -
    (46.815 * t + 0.00059 * t * t - 0.001813 * t * t * t) / 3600;
  return { deltaPsi, obliquity: eps0 + deltaEps, meanObliquity: eps0 };
}

/* ------------------------------------------------------------------ *
 * Sun (Meeus ch. 25 low precision + NOAA equation of time)
 * ------------------------------------------------------------------ */

/**
 * Apparent geocentric position of the Sun.
 * @returns {{apparentLongitude:number, declination:number, rightAscension:number,
 *            equationOfTimeMinutes:number, obliquity:number}}
 */
export function sunPosition(jd) {
  const t = centuriesFromJ2000(jd);
  const l0 = norm360(280.46646 + 36000.76983 * t + 0.0003032 * t * t);
  const m = norm360(357.52911 + 35999.05029 * t - 0.0001537 * t * t);
  const e = 0.016708634 - 0.000042037 * t - 0.0000001267 * t * t;
  const c =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * sinD(m) +
    (0.019993 - 0.000101 * t) * sinD(2 * m) +
    0.000289 * sinD(3 * m);
  const trueLongitude = l0 + c;
  const omega = 125.04 - 1934.136 * t;
  const apparentLongitude = norm360(trueLongitude - 0.00569 - 0.00478 * sinD(omega));

  const { meanObliquity } = nutationAndObliquity(t);
  const obliquity = meanObliquity + 0.00256 * cosD(omega);

  const declination = asinD(sinD(obliquity) * sinD(apparentLongitude));
  const rightAscension = norm360(
    atan2D(cosD(obliquity) * sinD(apparentLongitude), cosD(apparentLongitude)),
  );

  // NOAA equation of time, in minutes.
  const y = tanD(obliquity / 2) ** 2;
  const eot =
    (4 *
      (y * Math.sin(2 * l0 * DEG) -
        2 * e * Math.sin(m * DEG) +
        4 * e * y * Math.sin(m * DEG) * Math.cos(2 * l0 * DEG) -
        0.5 * y * y * Math.sin(4 * l0 * DEG) -
        1.25 * e * e * Math.sin(2 * m * DEG))) /
    DEG;

  return {
    apparentLongitude,
    declination,
    rightAscension,
    equationOfTimeMinutes: eot,
    obliquity,
  };
}

/* ------------------------------------------------------------------ *
 * Moon (Meeus ch. 47, tables 47.A and 47.B)
 * ------------------------------------------------------------------ */

// [D, M, M', F, coefficient of sin for longitude (1e-6 deg), coefficient of cos
//  for distance (1e-3 km)]
const MOON_LON_DIST_TERMS = [
  [0, 0, 1, 0, 6288774, -20905355],
  [2, 0, -1, 0, 1274027, -3699111],
  [2, 0, 0, 0, 658314, -2955968],
  [0, 0, 2, 0, 213618, -569925],
  [0, 1, 0, 0, -185116, 48888],
  [0, 0, 0, 2, -114332, -3149],
  [2, 0, -2, 0, 58793, 246158],
  [2, -1, -1, 0, 57066, -152138],
  [2, 0, 1, 0, 53322, -170733],
  [2, -1, 0, 0, 45758, -204586],
  [0, 1, -1, 0, -40923, -129620],
  [1, 0, 0, 0, -34720, 108743],
  [0, 1, 1, 0, -30383, 104755],
  [2, 0, 0, -2, 15327, 10321],
  [0, 0, 1, 2, -12528, 0],
  [0, 0, 1, -2, 10980, 79661],
  [4, 0, -1, 0, 10675, -34782],
  [0, 0, 3, 0, 10034, -23210],
  [4, 0, -2, 0, 8548, -21636],
  [2, 1, -1, 0, -7888, 24208],
  [2, 1, 0, 0, -6766, 30824],
  [1, 0, -1, 0, -5163, -8379],
  [1, 1, 0, 0, 4987, -16675],
  [2, -1, 1, 0, 4036, -12831],
  [2, 0, 2, 0, 3994, -10445],
  [4, 0, 0, 0, 3861, -11650],
  [2, 0, -3, 0, 3665, 14403],
  [0, 1, -2, 0, -2689, -7003],
  [2, 0, -1, 2, -2602, 0],
  [2, -1, -2, 0, 2390, 10056],
  [1, 0, 1, 0, -2348, 6322],
  [2, -2, 0, 0, 2236, -9884],
  [0, 1, 2, 0, -2120, 5751],
  [0, 2, 0, 0, -2069, 0],
  [2, -2, -1, 0, 2048, -4950],
  [2, 0, 1, -2, -1773, 4130],
  [2, 0, 0, 2, -1595, 0],
  [4, -1, -1, 0, 1215, -3958],
  [0, 0, 2, 2, -1110, 0],
  [3, 0, -1, 0, -892, 3258],
  [2, 1, 1, 0, -810, 2616],
  [4, -1, -2, 0, 759, -1897],
  [0, 2, -1, 0, -713, -2117],
  [2, 2, -1, 0, -700, 2354],
  [2, 1, -2, 0, 691, 0],
  [2, -1, 0, -2, 596, 0],
  [4, 0, 1, 0, 549, -1423],
  [0, 0, 4, 0, 537, -1117],
  [4, -1, 0, 0, 520, -1571],
  [1, 0, -2, 0, -487, -1739],
  [2, 1, 0, -2, -399, 0],
  [0, 0, 2, -2, -381, -4421],
  [1, 1, 1, 0, 351, 0],
  [3, 0, -2, 0, -340, 0],
  [4, 0, -3, 0, 330, 0],
  [2, -1, 2, 0, 327, 0],
  [0, 2, 1, 0, -323, 1165],
  [1, 1, -1, 0, 299, 0],
  [2, 0, 3, 0, 294, 0],
  [2, 0, -1, -2, 0, 8752],
];

// [D, M, M', F, coefficient of sin for latitude (1e-6 deg)]
const MOON_LAT_TERMS = [
  [0, 0, 0, 1, 5128122],
  [0, 0, 1, 1, 280602],
  [0, 0, 1, -1, 277693],
  [2, 0, 0, -1, 173237],
  [2, 0, -1, 1, 55413],
  [2, 0, -1, -1, 46271],
  [2, 0, 0, 1, 32573],
  [0, 0, 2, 1, 17198],
  [2, 0, 1, -1, 9266],
  [0, 0, 2, -1, 8822],
  [2, -1, 0, -1, 8216],
  [2, 0, -2, -1, 4324],
  [2, 0, 1, 1, 4200],
  [2, 1, 0, -1, -3359],
  [2, -1, -1, 1, 2463],
  [2, -1, 0, 1, 2211],
  [2, -1, -1, -1, 2065],
  [0, 1, -1, -1, -1870],
  [4, 0, -1, -1, 1828],
  [0, 1, 0, 1, -1794],
  [0, 0, 0, 3, -1749],
  [0, 1, -1, 1, -1565],
  [1, 0, 0, 1, -1491],
  [0, 1, 1, 1, -1475],
  [0, 1, 1, -1, -1410],
  [0, 1, 0, -1, -1344],
  [1, 0, 0, -1, -1335],
  [0, 0, 3, 1, 1107],
  [4, 0, 0, -1, 1021],
  [4, 0, -1, 1, 833],
  [0, 0, 1, -3, 777],
  [4, 0, -2, 1, 671],
  [2, 0, 0, -3, 607],
  [2, 0, 2, -1, 596],
  [2, -1, 1, -1, 491],
  [2, 0, -2, 1, -451],
  [0, 0, 3, -1, 439],
  [2, 0, 2, 1, 422],
  [2, 0, -3, -1, 421],
  [2, 1, -1, 1, -366],
  [2, 1, 0, 1, -351],
  [4, 0, 0, 1, 331],
  [2, -1, 1, 1, 315],
  [2, -2, 0, -1, 302],
  [0, 0, 1, 3, -283],
  [2, 1, 1, -1, -229],
  [1, 1, 0, -1, 223],
  [1, 1, 0, 1, 223],
  [0, 1, -2, -1, -220],
  [2, 1, -1, -1, -220],
  [1, 0, 1, 1, -185],
  [2, -1, -2, -1, 181],
  [0, 1, 2, 1, -177],
  [4, 0, -2, -1, 176],
  [4, -1, -1, -1, 166],
  [1, 0, 1, -1, -164],
  [4, 0, 1, -1, 132],
  [1, 0, -1, -1, -119],
  [4, -1, 0, -1, 115],
  [2, -2, 0, 1, 107],
];

/**
 * Apparent geocentric position of the Moon.
 * @returns {{longitude:number, latitude:number, distanceKm:number,
 *            declination:number, rightAscension:number, parallax:number}}
 */
export function moonPosition(jd) {
  const t = centuriesFromJ2000(jd);
  const t2 = t * t;
  const t3 = t2 * t;
  const t4 = t3 * t;

  // Meeus 47.1 - 47.6
  const lPrime =
    norm360(218.3164477 + 481267.88123421 * t - 0.0015786 * t2 + t3 / 538841 - t4 / 65194000);
  const d = norm360(297.8501921 + 445267.1114034 * t - 0.0018819 * t2 + t3 / 545868 - t4 / 113065000);
  const m = norm360(357.5291092 + 35999.0502909 * t - 0.0001536 * t2 + t3 / 24490000);
  const mPrime =
    norm360(134.9633964 + 477198.8675055 * t + 0.0087414 * t2 + t3 / 69699 - t4 / 14712000);
  const f = norm360(93.272095 + 483202.0175233 * t - 0.0036539 * t2 - t3 / 3526000 + t4 / 863310000);

  const a1 = norm360(119.75 + 131.849 * t);
  const a2 = norm360(53.09 + 479264.29 * t);
  const a3 = norm360(313.45 + 481266.484 * t);

  // Eccentricity correction for terms involving the Sun's anomaly.
  const ecc = 1 - 0.002516 * t - 0.0000074 * t2;

  let sumL = 0;
  let sumR = 0;
  for (const [cd, cm, cmp, cf, coefL, coefR] of MOON_LON_DIST_TERMS) {
    const arg = cd * d + cm * m + cmp * mPrime + cf * f;
    const eFactor = cm === 0 ? 1 : Math.abs(cm) === 1 ? ecc : ecc * ecc;
    sumL += coefL * eFactor * sinD(arg);
    sumR += coefR * eFactor * cosD(arg);
  }
  let sumB = 0;
  for (const [cd, cm, cmp, cf, coefB] of MOON_LAT_TERMS) {
    const arg = cd * d + cm * m + cmp * mPrime + cf * f;
    const eFactor = cm === 0 ? 1 : Math.abs(cm) === 1 ? ecc : ecc * ecc;
    sumB += coefB * eFactor * sinD(arg);
  }

  // Additive terms (Venus, Jupiter and flattening of the Earth).
  sumL += 3958 * sinD(a1) + 1962 * sinD(lPrime - f) + 318 * sinD(a2);
  sumB +=
    -2235 * sinD(lPrime) +
    382 * sinD(a3) +
    175 * sinD(a1 - f) +
    175 * sinD(a1 + f) +
    127 * sinD(lPrime - mPrime) -
    115 * sinD(lPrime + mPrime);

  const { deltaPsi, obliquity } = nutationAndObliquity(t);
  const longitude = norm360(lPrime + sumL / 1000000 + deltaPsi);
  const latitude = sumB / 1000000;
  const distanceKm = 385000.56 + sumR / 1000;
  const parallax = asinD(6378.14 / distanceKm);

  const rightAscension = norm360(
    atan2D(
      sinD(longitude) * cosD(obliquity) - tanD(latitude) * sinD(obliquity),
      cosD(longitude),
    ),
  );
  const declination = asinD(
    sinD(latitude) * cosD(obliquity) + cosD(latitude) * sinD(obliquity) * sinD(longitude),
  );

  return { longitude, latitude, distanceKm, rightAscension, declination, parallax };
}

/* ------------------------------------------------------------------ *
 * Ayanamsa (Lahiri / Chitrapaksha)
 * ------------------------------------------------------------------ */

/** Lahiri ayanamsa at J2000.0: 23 deg 51' 11". */
const LAHIRI_AT_J2000 = 23 + 51 / 60 + 11 / 3600;

/**
 * Lahiri (Chitrapaksha) ayanamsa in degrees.
 *
 * Modelled as the IAU-1976 accumulated general precession in longitude measured
 * from J2000.0 and anchored to the Lahiri value at that epoch. Agrees with the
 * Indian Astronomical Ephemeris to about an arcminute over 1900-2100.
 */
export function lahiriAyanamsa(jd) {
  const t = centuriesFromJ2000(jd);
  const precessionArcsec = 5029.0966 * t + 1.11113 * t * t - 0.000006 * t * t * t;
  return LAHIRI_AT_J2000 + precessionArcsec / 3600;
}

/* ------------------------------------------------------------------ *
 * Sidereal time
 * ------------------------------------------------------------------ */

/** Apparent Greenwich sidereal time in degrees (Meeus 12.4 + nutation). */
export function greenwichSiderealTime(jd) {
  const t = centuriesFromJ2000(jd);
  const theta0 =
    280.46061837 +
    360.98564736629 * (jd - 2451545) +
    0.000387933 * t * t -
    (t * t * t) / 38710000;
  const { deltaPsi, obliquity } = nutationAndObliquity(t);
  return norm360(theta0 + deltaPsi * cosD(obliquity));
}

/* ------------------------------------------------------------------ *
 * Sunrise / sunset / solar noon (NOAA)
 * ------------------------------------------------------------------ */

/**
 * Geometric altitude of the Sun's centre at apparent sunrise/sunset: -50 arcminutes,
 * i.e. 34' of mean refraction at the horizon plus the 16' solar semidiameter. This
 * is the same convention Indian panchangs use (first gleam of the upper limb).
 *
 * Sunrise here follows NOAA exactly and feeds the solar series the UT argument with
 * no Delta T correction, as NOAA's published algorithm does. The Sun moves about one
 * degree a day, so the 70-second gap shifts sunrise by under a quarter of a second.
 * The Moon moves thirteen times faster, which is why the panchanga side of this file
 * does apply Delta T.
 */
export const SUNRISE_ALTITUDE_DEG = -0.833;

/** Julian Day for a given local clock time on the civil date whose 00:00 UT JD is jd0. */
const jdAtLocalHours = (jd0, localHours, tzHours) => jd0 + (localHours - tzHours) / 24;

/**
 * Sunrise, solar noon (transit) and sunset for one civil date at one place.
 *
 * Solar noon is found first by iteration; the hour angle of the horizon is then
 * evaluated once, at transit, and applied symmetrically. That makes solar noon sit
 * EXACTLY midway between sunrise and sunset by construction, and costs at most about
 * 15 seconds against an asymmetric solution (the declination drift across half a day).
 *
 * @returns {{sunriseHours:number|null, sunsetHours:number|null, solarNoonHours:number,
 *            dayLengthHours:number|null, declination:number,
 *            equationOfTimeMinutes:number, circumpolar:'up'|'down'|null}}
 *          Hours are local clock hours measured from local midnight of that date.
 */
export function solarEvents({ jd0, latitude, longitude, tzHours }) {
  // Transit: solar noon = 12h - (longitude / 15) - EoT + timezone. Iterate because
  // the equation of time is itself evaluated at transit.
  let noon = 12;
  let sun = sunPosition(jdAtLocalHours(jd0, noon, tzHours));
  for (let i = 0; i < 3; i += 1) {
    noon = 12 - longitude / 15 - sun.equationOfTimeMinutes / 60 + tzHours;
    sun = sunPosition(jdAtLocalHours(jd0, noon, tzHours));
  }
  noon = 12 - longitude / 15 - sun.equationOfTimeMinutes / 60 + tzHours;

  const cosH =
    (sinD(SUNRISE_ALTITUDE_DEG) - sinD(latitude) * sinD(sun.declination)) /
    (cosD(latitude) * cosD(sun.declination));

  if (cosH > 1 || cosH < -1) {
    return {
      sunriseHours: null,
      sunsetHours: null,
      solarNoonHours: noon,
      dayLengthHours: cosH > 1 ? 0 : 24,
      declination: sun.declination,
      equationOfTimeMinutes: sun.equationOfTimeMinutes,
      circumpolar: cosH > 1 ? 'down' : 'up',
    };
  }

  const hourAngle = acosD(cosH); // degrees
  const halfDay = hourAngle / 15; // hours
  return {
    sunriseHours: noon - halfDay,
    sunsetHours: noon + halfDay,
    solarNoonHours: noon,
    dayLengthHours: 2 * halfDay,
    declination: sun.declination,
    equationOfTimeMinutes: sun.equationOfTimeMinutes,
    circumpolar: null,
  };
}

/* ------------------------------------------------------------------ *
 * Moonrise / moonset
 * ------------------------------------------------------------------ */

/** Topocentric altitude of a body with the given equatorial coordinates. */
function altitudeOf(jd, ra, dec, latitude, longitude) {
  const localHourAngle = greenwichSiderealTime(jd) + longitude - ra;
  return asinD(
    sinD(latitude) * sinD(dec) + cosD(latitude) * cosD(dec) * cosD(localHourAngle),
  );
}

/**
 * Moonrise and moonset for one civil date at one place.
 *
 * Scans the local day in 10-minute steps for sign changes of (altitude - h0), then
 * bisects each crossing to about one second. h0 = 0.7275*parallax - 34' (Meeus
 * ch. 15), which is the standard allowance for lunar semidiameter, horizontal
 * parallax and mean refraction.
 *
 * The Moon rises roughly 50 minutes later each day, so on about one day a month
 * there is genuinely no moonrise (or no moonset) inside the local day. That returns
 * null and the UI says so rather than inventing a time.
 */
export function moonEvents({ jd0, latitude, longitude, tzHours }) {
  const altitudeAt = (localHours) => {
    const jd = jdAtLocalHours(jd0, localHours, tzHours);
    // Position from the TD argument, hour angle from the UT sidereal time.
    const moon = moonPosition(ephemerisJd(jd));
    const h0 = 0.7275 * moon.parallax - 0.5667;
    return altitudeOf(jd, moon.rightAscension, moon.declination, latitude, longitude) - h0;
  };

  const refine = (lo, hi) => {
    let a = lo;
    let b = hi;
    let fa = altitudeAt(a);
    for (let i = 0; i < 40; i += 1) {
      const mid = (a + b) / 2;
      const fm = altitudeAt(mid);
      if (fa * fm <= 0) {
        b = mid;
      } else {
        a = mid;
        fa = fm;
      }
      if (b - a < 1 / 3600) break;
    }
    return (a + b) / 2;
  };

  const step = 1 / 6; // 10 minutes
  let riseHours = null;
  let setHours = null;
  let prevT = 0;
  let prevAlt = altitudeAt(0);

  for (let t = step; t <= 24 + 1e-9; t += step) {
    const alt = altitudeAt(t);
    if (prevAlt < 0 && alt >= 0 && riseHours === null) {
      riseHours = refine(prevT, t);
    } else if (prevAlt >= 0 && alt < 0 && setHours === null) {
      setHours = refine(prevT, t);
    }
    prevT = t;
    prevAlt = alt;
  }

  return { moonriseHours: riseHours, moonsetHours: setHours };
}

/* ------------------------------------------------------------------ *
 * Panchanga angles
 * ------------------------------------------------------------------ */

export const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami',
  'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi',
];

export const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
  'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra',
  'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha',
  'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

export const YOGA_NAMES = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma',
  'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha',
  'Shukla', 'Brahma', 'Indra', 'Vaidhriti',
];

/** The seven repeating (chara) karanas, in order. */
const MOVABLE_KARANAS = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti'];

export const RASHI_NAMES = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
];

export const MASA_NAMES = [
  'Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada',
  'Ashwina', 'Kartika', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna',
];

/** Ritu follows the lunar month in pairs, starting from Chaitra. */
export const RITU_NAMES = ['Vasanta', 'Grishma', 'Varsha', 'Sharad', 'Hemanta', 'Shishira'];

export const VAARA_NAMES = [
  'Ravivara', 'Somavara', 'Mangalavara', 'Budhavara', 'Guruvara', 'Shukravara', 'Shanivara',
];

export const WEEKDAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

/** The 60-year Jovian (Samvatsara) cycle, in order, starting from Prabhava. */
export const SAMVATSARA_NAMES = [
  'Prabhava', 'Vibhava', 'Shukla', 'Pramoda', 'Prajapati', 'Angirasa', 'Shrimukha',
  'Bhava', 'Yuva', 'Dhata', 'Ishvara', 'Bahudhanya', 'Pramathi', 'Vikrama', 'Vrisha',
  'Chitrabhanu', 'Svabhanu', 'Tarana', 'Parthiva', 'Vyaya', 'Sarvajit', 'Sarvadhari',
  'Virodhi', 'Vikrita', 'Khara', 'Nandana', 'Vijaya', 'Jaya', 'Manmatha', 'Durmukha',
  'Hevilambi', 'Vilambi', 'Vikari', 'Sharvari', 'Plava', 'Shubhakrit', 'Shobhakrit',
  'Krodhi', 'Vishvavasu', 'Parabhava', 'Plavanga', 'Kilaka', 'Saumya', 'Sadharana',
  'Virodhikrit', 'Paridhavi', 'Pramadi', 'Ananda', 'Rakshasa', 'Nala', 'Pingala',
  'Kalayukta', 'Siddharthi', 'Raudra', 'Durmati', 'Dundubhi', 'Rudhirodgari',
  'Raktakshi', 'Krodhana', 'Akshaya',
];

/**
 * Sun, Moon and elongation angles at one instant.
 * @param jd Universal Time Julian Day; converted to TD internally.
 */
export function panchangaAngles(jd) {
  const jde = ephemerisJd(jd);
  const sun = sunPosition(jde);
  const moon = moonPosition(jde);
  const ayanamsa = lahiriAyanamsa(jde);
  return {
    ayanamsa,
    sunTropical: sun.apparentLongitude,
    moonTropical: moon.longitude,
    sunSidereal: norm360(sun.apparentLongitude - ayanamsa),
    moonSidereal: norm360(moon.longitude - ayanamsa),
    elongation: norm360(moon.longitude - sun.apparentLongitude),
    moonLatitude: moon.latitude,
    moonDistanceKm: moon.distanceKm,
  };
}

/**
 * Newton iteration for the instant at which `angleFn(jd)` equals `targetDeg`.
 * The derivative is measured numerically, so the same routine works for the
 * elongation (about 12.19 deg/day), the sidereal Moon (about 13.18 deg/day) and
 * the yoga sum (about 14.16 deg/day).
 */
export function findAngleCrossing(angleFn, targetDeg, jdGuess) {
  let jd = jdGuess;
  for (let i = 0; i < 20; i += 1) {
    const diff = norm180(targetDeg - angleFn(jd));
    if (Math.abs(diff) < 1e-7) break;
    const h = 0.02;
    const rate = norm180(angleFn(jd + h) - angleFn(jd - h)) / (2 * h);
    if (!Number.isFinite(rate) || Math.abs(rate) < 1e-6) break;
    const delta = diff / rate;
    jd += Math.max(-5, Math.min(5, delta));
    if (Math.abs(delta) < 1e-9) break;
  }
  return jd;
}

const elongationAt = (jd) => panchangaAngles(jd).elongation;
const moonSiderealAt = (jd) => panchangaAngles(jd).moonSidereal;
const yogaSumAt = (jd) => {
  const a = panchangaAngles(jd);
  return norm360(a.moonSidereal + a.sunSidereal);
};

/**
 * Tithi, karana, nakshatra, yoga and their ending instants, evaluated at `jd`.
 */
export function panchangaAt(jd) {
  const angles = panchangaAngles(jd);

  const tithiIndex = Math.floor(angles.elongation / 12) + 1; // 1..30
  const tithiEndJd = findAngleCrossing(elongationAt, (tithiIndex * 12) % 360, jd + 0.5);

  const karanaIndex = Math.floor(angles.elongation / 6) + 1; // 1..60
  const karanaEndJd = findAngleCrossing(elongationAt, (karanaIndex * 6) % 360, jd + 0.25);

  const nakshatraSpan = 360 / 27;
  const nakshatraIndex = Math.floor(angles.moonSidereal / nakshatraSpan) + 1; // 1..27
  const nakshatraEndJd = findAngleCrossing(
    moonSiderealAt,
    (nakshatraIndex * nakshatraSpan) % 360,
    jd + 0.5,
  );
  const withinNakshatra = angles.moonSidereal - (nakshatraIndex - 1) * nakshatraSpan;
  const pada = Math.floor(withinNakshatra / (nakshatraSpan / 4)) + 1;

  const yogaSum = norm360(angles.moonSidereal + angles.sunSidereal);
  const yogaIndex = Math.floor(yogaSum / nakshatraSpan) + 1; // 1..27
  const yogaEndJd = findAngleCrossing(yogaSumAt, (yogaIndex * nakshatraSpan) % 360, jd + 0.5);

  const paksha = tithiIndex <= 15 ? 'Shukla' : 'Krishna';
  const tithiName =
    tithiIndex === 15 ? 'Purnima' : tithiIndex === 30 ? 'Amavasya' : TITHI_NAMES[(tithiIndex - 1) % 15];

  let karanaName;
  if (karanaIndex === 1) karanaName = 'Kimstughna';
  else if (karanaIndex === 58) karanaName = 'Shakuni';
  else if (karanaIndex === 59) karanaName = 'Chatushpada';
  else if (karanaIndex === 60) karanaName = 'Naga';
  else karanaName = MOVABLE_KARANAS[(karanaIndex - 2) % 7];

  // Illuminated fraction of the lunar disc. The phase angle is 180 deg minus the
  // geocentric elongation to within a few tenths of a degree, which is why this is
  // labelled approximate in the UI.
  const illumination = (1 - cosD(angles.elongation)) / 2;

  return {
    ...angles,
    tithiIndex,
    tithiName,
    paksha,
    tithiEndJd,
    karanaIndex,
    karanaName,
    karanaEndJd,
    nakshatraIndex,
    nakshatraName: NAKSHATRA_NAMES[nakshatraIndex - 1],
    nakshatraPada: pada,
    nakshatraEndJd,
    yogaIndex,
    yogaName: YOGA_NAMES[yogaIndex - 1],
    yogaEndJd,
    illumination,
    sunRashi: RASHI_NAMES[Math.floor(angles.sunSidereal / 30)],
    moonRashi: RASHI_NAMES[Math.floor(angles.moonSidereal / 30)],
  };
}

/* ------------------------------------------------------------------ *
 * Lunar month, samvatsara, ayana
 * ------------------------------------------------------------------ */

const SYNODIC_MONTH = 29.530588853;

/** Instant of the New Moon at or immediately before `jd`. */
export function previousNewMoon(jd) {
  const elongation = elongationAt(jd);
  let guess = jd - elongation / 12.19;
  let result = findAngleCrossing(elongationAt, 0, guess);
  let safety = 0;
  while (result > jd + 1e-6 && safety < 4) {
    guess = result - SYNODIC_MONTH;
    result = findAngleCrossing(elongationAt, 0, guess);
    safety += 1;
  }
  return result;
}

/**
 * Amanta lunar month (the scheme used across most of India), the ritu, the Shaka
 * and Vikram years, and the 60-year samvatsara.
 *
 * The month is named from the solar rashi occupied by the Sun at the New Moon that
 * opened it: New Moon in Meena opens Chaitra, in Mesha opens Vaishakha, and so on.
 * A month during which the Sun makes no sankranti at all (same rashi at both the
 * opening and the closing New Moon) is an Adhika (intercalary) month.
 */
export function lunarCalendar(jd) {
  const startNewMoon = previousNewMoon(jd);
  const nextNewMoon = findAngleCrossing(elongationAt, 0, startNewMoon + SYNODIC_MONTH);

  const rashiAtStart = Math.floor(panchangaAngles(startNewMoon).sunSidereal / 30);
  const rashiAtEnd = Math.floor(panchangaAngles(nextNewMoon).sunSidereal / 30);
  const isAdhika = rashiAtStart === rashiAtEnd;

  const masaIndex = (rashiAtStart + 1) % 12;
  const masaName = MASA_NAMES[masaIndex];
  const ritu = RITU_NAMES[Math.floor(masaIndex / 2)];

  // Walk back to the Chaitra that opened this lunar year. Chaitra always begins
  // between mid-March and mid-April, so an approximate walk-back of whole synodic
  // months still lands unambiguously inside the right Gregorian year.
  const chaitraStart = startNewMoon - masaIndex * SYNODIC_MONTH;
  const shakaYear = calendarFromJulianDay(chaitraStart).year - 78;
  const vikramYear = shakaYear + 135;

  // Shaka 1947 (2025-26) is Vishvavasu, the 39th name, which fixes the offset.
  const samvatsaraIndex = (((shakaYear + 11) % 60) + 60) % 60;

  return {
    masaIndex,
    masaName,
    isAdhikaMasa: isAdhika,
    masaLabel: isAdhika ? `Adhika ${masaName}` : masaName,
    ritu,
    shakaYear,
    vikramYear,
    samvatsara: SAMVATSARA_NAMES[samvatsaraIndex],
    monthStartJd: startNewMoon,
    monthEndJd: nextNewMoon,
  };
}

/** Uttarayana while the sidereal Sun runs from Makara through Mithuna. */
export function ayanaFromSiderealSun(sunSidereal) {
  return sunSidereal >= 270 || sunSidereal < 90 ? 'Uttarayana' : 'Dakshinayana';
}

/* ------------------------------------------------------------------ *
 * Day divisions: Rahu Kaal, Yamaganda, Gulika, Abhijit, Choghadiya
 * ------------------------------------------------------------------ */

/**
 * Which of the eight equal parts of the daylight period each kaal occupies,
 * 1-indexed, by weekday (0 = Sunday).
 *
 * Rahu Kaal:  Sun 8, Mon 2, Tue 7, Wed 5, Thu 6, Fri 4, Sat 3
 * Yamaganda:  Sun 5, Mon 4, Tue 3, Wed 2, Thu 1, Fri 7, Sat 6
 * Gulika:     Sun 7, Mon 6, Tue 5, Wed 4, Thu 3, Fri 2, Sat 1
 */
export const RAHU_KAAL_PART = [8, 2, 7, 5, 6, 4, 3];
export const YAMAGANDA_PART = [5, 4, 3, 2, 1, 7, 6];
export const GULIKA_PART = [7, 6, 5, 4, 3, 2, 1];

/**
 * The seven Choghadiya, in the reverse-Chaldean planetary order they cycle through
 * (Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars). Each weekday's daylight starts
 * with the Choghadiya of that day's ruling planet, so the whole table is derived
 * rather than tabulated.
 */
const CHOGHADIYA_CYCLE = [
  { name: 'Udveg', lord: 'Sun', quality: 'inauspicious' },
  { name: 'Chal', lord: 'Venus', quality: 'neutral' },
  { name: 'Labh', lord: 'Mercury', quality: 'auspicious' },
  { name: 'Amrit', lord: 'Moon', quality: 'auspicious' },
  { name: 'Kaal', lord: 'Saturn', quality: 'inauspicious' },
  { name: 'Shubh', lord: 'Jupiter', quality: 'auspicious' },
  { name: 'Rog', lord: 'Mars', quality: 'inauspicious' },
];

/** Index into CHOGHADIYA_CYCLE that opens the daylight period, by weekday. */
const CHOGHADIYA_DAY_START = [0, 3, 6, 2, 5, 1, 4]; // Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn

/** Split [start, end] into `count` equal parts and return part `index` (1-based). */
function equalPart(start, end, count, index) {
  const width = (end - start) / count;
  return { start: start + (index - 1) * width, end: start + index * width };
}

/**
 * Every mechanically derived period of the day, computed from the sunrise and sunset
 * this file already produced. Nothing here is a constant time of day.
 */
export function dayDivisions({ sunriseHours, sunsetHours, previousSunsetHours, weekday }) {
  if (sunriseHours === null || sunsetHours === null) return null;

  const rahu = equalPart(sunriseHours, sunsetHours, 8, RAHU_KAAL_PART[weekday]);
  const yamaganda = equalPart(sunriseHours, sunsetHours, 8, YAMAGANDA_PART[weekday]);
  const gulika = equalPart(sunriseHours, sunsetHours, 8, GULIKA_PART[weekday]);

  // Abhijit is the 8th of the 15 equal muhurtas of daylight, so it straddles solar noon.
  const abhijit = equalPart(sunriseHours, sunsetHours, 15, 8);

  // Night runs from the previous sunset to this sunrise; Brahma Muhurta is the 14th
  // of its 15 muhurtas, i.e. the second-last before sunrise.
  let brahmaMuhurta = null;
  if (typeof previousSunsetHours === 'number') {
    const nightStart = previousSunsetHours - 24; // previous evening, in this day's hours
    brahmaMuhurta = equalPart(nightStart, sunriseHours, 15, 14);
  }

  const start = CHOGHADIYA_DAY_START[weekday];
  const choghadiya = [];
  for (let i = 0; i < 8; i += 1) {
    const slot = CHOGHADIYA_CYCLE[(start + i) % 7];
    const { start: s, end: e } = equalPart(sunriseHours, sunsetHours, 8, i + 1);
    choghadiya.push({ ...slot, start: s, end: e });
  }

  return { rahu, yamaganda, gulika, abhijit, brahmaMuhurta, choghadiya };
}

/* ------------------------------------------------------------------ *
 * Built-in place list (replaces the old Nominatim geocoding call)
 * ------------------------------------------------------------------ */

/**
 * Coordinates are the standard city-centre positions; the timezone offset is India
 * Standard Time (+5:30) throughout, which has no daylight saving. Anywhere not on
 * this list can be entered by hand as latitude / longitude / UTC offset.
 */
export const CITIES = [
  { name: 'New Delhi', latitude: 28.6139, longitude: 77.209, tzHours: 5.5 },
  { name: 'Mumbai', latitude: 19.076, longitude: 72.8777, tzHours: 5.5 },
  { name: 'Kolkata', latitude: 22.5726, longitude: 88.3639, tzHours: 5.5 },
  { name: 'Chennai', latitude: 13.0827, longitude: 80.2707, tzHours: 5.5 },
  { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, tzHours: 5.5 },
  { name: 'Hyderabad', latitude: 17.385, longitude: 78.4867, tzHours: 5.5 },
  { name: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714, tzHours: 5.5 },
  { name: 'Pune', latitude: 18.5204, longitude: 73.8567, tzHours: 5.5 },
  { name: 'Jaipur', latitude: 26.9124, longitude: 75.7873, tzHours: 5.5 },
  { name: 'Lucknow', latitude: 26.8467, longitude: 80.9462, tzHours: 5.5 },
  { name: 'Kanpur', latitude: 26.4499, longitude: 80.3319, tzHours: 5.5 },
  { name: 'Nagpur', latitude: 21.1458, longitude: 79.0882, tzHours: 5.5 },
  { name: 'Indore', latitude: 22.7196, longitude: 75.8577, tzHours: 5.5 },
  { name: 'Bhopal', latitude: 23.2599, longitude: 77.4126, tzHours: 5.5 },
  { name: 'Patna', latitude: 25.5941, longitude: 85.1376, tzHours: 5.5 },
  { name: 'Varanasi', latitude: 25.3176, longitude: 82.9739, tzHours: 5.5 },
  { name: 'Prayagraj', latitude: 25.4358, longitude: 81.8463, tzHours: 5.5 },
  { name: 'Haridwar', latitude: 29.9457, longitude: 78.1642, tzHours: 5.5 },
  { name: 'Rishikesh', latitude: 30.0869, longitude: 78.2676, tzHours: 5.5 },
  { name: 'Amritsar', latitude: 31.634, longitude: 74.8723, tzHours: 5.5 },
  { name: 'Chandigarh', latitude: 30.7333, longitude: 76.7794, tzHours: 5.5 },
  { name: 'Ludhiana', latitude: 30.901, longitude: 75.8573, tzHours: 5.5 },
  { name: 'Dehradun', latitude: 30.3165, longitude: 78.0322, tzHours: 5.5 },
  { name: 'Shimla', latitude: 31.1048, longitude: 77.1734, tzHours: 5.5 },
  { name: 'Srinagar', latitude: 34.0837, longitude: 74.7973, tzHours: 5.5 },
  { name: 'Jammu', latitude: 32.7266, longitude: 74.857, tzHours: 5.5 },
  { name: 'Surat', latitude: 21.1702, longitude: 72.8311, tzHours: 5.5 },
  { name: 'Vadodara', latitude: 22.3072, longitude: 73.1812, tzHours: 5.5 },
  { name: 'Rajkot', latitude: 22.3039, longitude: 70.8022, tzHours: 5.5 },
  { name: 'Nashik', latitude: 19.9975, longitude: 73.7898, tzHours: 5.5 },
  { name: 'Aurangabad', latitude: 19.8762, longitude: 75.3433, tzHours: 5.5 },
  { name: 'Kolhapur', latitude: 16.705, longitude: 74.2433, tzHours: 5.5 },
  { name: 'Panaji', latitude: 15.4909, longitude: 73.8278, tzHours: 5.5 },
  { name: 'Mangaluru', latitude: 12.9141, longitude: 74.856, tzHours: 5.5 },
  { name: 'Mysuru', latitude: 12.2958, longitude: 76.6394, tzHours: 5.5 },
  { name: 'Coimbatore', latitude: 11.0168, longitude: 76.9558, tzHours: 5.5 },
  { name: 'Madurai', latitude: 9.9252, longitude: 78.1198, tzHours: 5.5 },
  { name: 'Tirupati', latitude: 13.6288, longitude: 79.4192, tzHours: 5.5 },
  { name: 'Visakhapatnam', latitude: 17.6868, longitude: 83.2185, tzHours: 5.5 },
  { name: 'Vijayawada', latitude: 16.5062, longitude: 80.648, tzHours: 5.5 },
  { name: 'Thiruvananthapuram', latitude: 8.5241, longitude: 76.9366, tzHours: 5.5 },
  { name: 'Kochi', latitude: 9.9312, longitude: 76.2673, tzHours: 5.5 },
  { name: 'Bhubaneswar', latitude: 20.2961, longitude: 85.8245, tzHours: 5.5 },
  { name: 'Puri', latitude: 19.8135, longitude: 85.8312, tzHours: 5.5 },
  { name: 'Guwahati', latitude: 26.1445, longitude: 91.7362, tzHours: 5.5 },
  { name: 'Ranchi', latitude: 23.3441, longitude: 85.3096, tzHours: 5.5 },
  { name: 'Raipur', latitude: 21.2514, longitude: 81.6296, tzHours: 5.5 },
  { name: 'Jodhpur', latitude: 26.2389, longitude: 73.0243, tzHours: 5.5 },
  { name: 'Udaipur', latitude: 24.5854, longitude: 73.7125, tzHours: 5.5 },
  { name: 'Ujjain', latitude: 23.1765, longitude: 75.7885, tzHours: 5.5 },
  { name: 'Mathura', latitude: 27.4924, longitude: 77.6737, tzHours: 5.5 },
  { name: 'Ayodhya', latitude: 26.7922, longitude: 82.1998, tzHours: 5.5 },
  { name: 'Gaya', latitude: 24.7955, longitude: 84.9994, tzHours: 5.5 },
  { name: 'Siliguri', latitude: 26.7271, longitude: 88.3953, tzHours: 5.5 },
];

/* ------------------------------------------------------------------ *
 * Formatting (pure)
 * ------------------------------------------------------------------ */

/**
 * Format local hours-from-midnight as "hh:mm AM/PM". Values outside [0, 24) are
 * wrapped and annotated, so a tithi that ends after midnight reads "05:12 AM (+1)".
 */
export function formatClock(hours) {
  if (hours === null || hours === undefined || !Number.isFinite(hours)) return null;
  let dayShift = 0;
  let h = hours;
  while (h < 0) {
    h += 24;
    dayShift -= 1;
  }
  while (h >= 24) {
    h -= 24;
    dayShift += 1;
  }
  let totalMinutes = Math.round(h * 60);
  if (totalMinutes >= 1440) {
    totalMinutes -= 1440;
    dayShift += 1;
  }
  const hh = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;
  const suffix = hh < 12 ? 'AM' : 'PM';
  const display = hh % 12 === 0 ? 12 : hh % 12;
  const shift = dayShift === 0 ? '' : dayShift > 0 ? ` (+${dayShift})` : ` (${dayShift})`;
  return `${String(display).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${suffix}${shift}`;
}

/** Format a duration in hours as "13h 02m". */
export function formatDuration(hours) {
  if (!Number.isFinite(hours)) return null;
  const totalMinutes = Math.round(hours * 60);
  return `${Math.floor(totalMinutes / 60)}h ${String(totalMinutes % 60).padStart(2, '0')}m`;
}

/** Format a [start, end] pair of local hours as a range. */
export function formatRange(range) {
  if (!range) return null;
  return `${formatClock(range.start)} to ${formatClock(range.end)}`;
}

/* ------------------------------------------------------------------ *
 * Top-level entry point
 * ------------------------------------------------------------------ */

const isFiniteNumber = (v) => typeof v === 'number' && Number.isFinite(v);

/**
 * Complete panchang for one civil date at one place.
 *
 * Panchanga elements (tithi, nakshatra, yoga, karana) are reported for the instant
 * of local sunrise, which is the convention every printed panchang uses, together
 * with the instant each of them ends.
 *
 * @param {{year:number, month:number, day:number, latitude:number, longitude:number,
 *          tzHours:number}} input  month is 1-12.
 * @returns {{error:string}|object}
 */
export function computePanchang({ year, month, day, latitude, longitude, tzHours }) {
  if (!Number.isInteger(year) || year < 1700 || year > 2200) {
    return { error: 'Enter a date between the years 1700 and 2200.' };
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return { error: 'Enter a valid date.' };
  }
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    return { error: 'Enter a valid date.' };
  }
  if (!isFiniteNumber(latitude) || latitude < -90 || latitude > 90) {
    return { error: 'Latitude must be a number between -90 and 90.' };
  }
  if (!isFiniteNumber(longitude) || longitude < -180 || longitude > 180) {
    return { error: 'Longitude must be a number between -180 and 180.' };
  }
  if (!isFiniteNumber(tzHours) || tzHours < -12 || tzHours > 14) {
    return { error: 'The UTC offset must be between -12 and +14 hours.' };
  }

  const jd0 = julianDay(year, month, day);
  // Reject dates that do not exist (e.g. 31 February rolls forward).
  const roundTrip = calendarFromJulianDay(jd0);
  if (roundTrip.year !== year || roundTrip.month !== month || roundTrip.day !== day) {
    return { error: 'That date does not exist.' };
  }

  const weekday = weekdayFromJulianDay(jd0);
  const sun = solarEvents({ jd0, latitude, longitude, tzHours });
  const previousSun = solarEvents({ jd0: jd0 - 1, latitude, longitude, tzHours });
  const moon = moonEvents({ jd0, latitude, longitude, tzHours });

  // Reference instant: local sunrise where the Sun rises, local solar noon where it
  // does not (inside a polar day or night the panchanga still has to be reported
  // against something, and transit is the least arbitrary choice).
  const referenceHours = sun.sunriseHours === null ? sun.solarNoonHours : sun.sunriseHours;
  const referenceJd = jdAtLocalHours(jd0, referenceHours, tzHours);

  const panchanga = panchangaAt(referenceJd);
  const calendar = lunarCalendar(referenceJd);
  const divisions = dayDivisions({
    sunriseHours: sun.sunriseHours,
    sunsetHours: sun.sunsetHours,
    previousSunsetHours: previousSun.sunsetHours,
    weekday,
  });

  /** Convert an absolute JD back to local hours measured from this date's midnight. */
  const toLocalHours = (jd) => (jd - jd0) * 24 + tzHours;

  return {
    error: null,
    input: { year, month, day, latitude, longitude, tzHours },
    jd0,
    weekday,
    weekdayName: WEEKDAY_NAMES[weekday],
    vaara: VAARA_NAMES[weekday],

    sunriseHours: sun.sunriseHours,
    sunsetHours: sun.sunsetHours,
    solarNoonHours: sun.solarNoonHours,
    dayLengthHours: sun.dayLengthHours,
    nightLengthHours: sun.dayLengthHours === null ? null : 24 - sun.dayLengthHours,
    solarDeclination: sun.declination,
    equationOfTimeMinutes: sun.equationOfTimeMinutes,
    circumpolar: sun.circumpolar,

    moonriseHours: moon.moonriseHours,
    moonsetHours: moon.moonsetHours,

    referenceHours,
    panchanga: {
      tithiIndex: panchanga.tithiIndex,
      tithiName: panchanga.tithiName,
      paksha: panchanga.paksha,
      tithiEndHours: toLocalHours(panchanga.tithiEndJd),
      nakshatraIndex: panchanga.nakshatraIndex,
      nakshatraName: panchanga.nakshatraName,
      nakshatraPada: panchanga.nakshatraPada,
      nakshatraEndHours: toLocalHours(panchanga.nakshatraEndJd),
      yogaIndex: panchanga.yogaIndex,
      yogaName: panchanga.yogaName,
      yogaEndHours: toLocalHours(panchanga.yogaEndJd),
      karanaIndex: panchanga.karanaIndex,
      karanaName: panchanga.karanaName,
      karanaEndHours: toLocalHours(panchanga.karanaEndJd),
      sunRashi: panchanga.sunRashi,
      moonRashi: panchanga.moonRashi,
      illumination: panchanga.illumination,
      ayanamsa: panchanga.ayanamsa,
      sunSidereal: panchanga.sunSidereal,
      moonSidereal: panchanga.moonSidereal,
      moonDistanceKm: panchanga.moonDistanceKm,
    },

    calendar: {
      ...calendar,
      ayana: ayanaFromSiderealSun(panchanga.sunSidereal),
    },

    divisions,
  };
}

export default computePanchang;
