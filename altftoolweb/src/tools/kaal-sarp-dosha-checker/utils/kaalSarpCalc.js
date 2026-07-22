import { KSD_TYPES, RASHI_NAMES } from "../constants";

function toRad(deg) { return (deg * Math.PI) / 180; }
function toDeg(rad) { return (rad * 180) / Math.PI; }
function mod(a, b) { return ((a % b) + b) % b; }

// ─── Core astronomical functions ──────────────────────────────

function calcSunLongitude(jd) {
  const T = (jd - 2451545) / 365250;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(toRad(M))
    + (0.019993 - 0.000101 * T) * Math.sin(toRad(2 * M))
    + 0.000289 * Math.sin(toRad(3 * M));
  return mod(L0 + C, 360);
}

function calcMoonLongitude(jd) {
  const T = (jd - 2451545) / 365250;
  const Lp = 218.3165 + 481267.8813 * T;
  const D = 297.8502 + 445267.1114 * T;
  const M = 357.5291 + 35999.0503 * T;
  const Mp = 134.9634 + 477198.8676 * T;
  const F = 93.272 + 483202.0175 * T;
  const Dl = 22640 * Math.sin(toRad(D)) - 4586 * Math.sin(toRad(D - Mp))
    + 2370 * Math.sin(toRad(Mp)) + 769 * Math.sin(toRad(2 * D))
    - 668 * Math.sin(toRad(M)) - 412 * Math.sin(toRad(2 * F));
  return mod(Lp + Dl / 3600, 360);
}

function calcAyanamsha(jd) {
  const T = (jd - 2451545) / 36525;
  return 17.23 + 0.051 * T - 0.0001 * T * T;
}

function toJulian(year, month, day) {
  const y = month <= 2 ? year - 1 : year;
  const m = month <= 2 ? month + 12 : month;
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
}

// ─── Planetary heliocentric calculators ─────────────────────

function calcHelio(jd, elems) {
  const T = (jd - 2451545) / 36525;
  const L = mod(elems.L0 + elems.L1 * T + (elems.L2 || 0) * T * T, 360);
  const M = mod(elems.M0 + elems.M1 * T + (elems.M2 || 0) * T * T, 360);
  const Mr = toRad(M);
  const ec = elems.e0 + elems.e1 * T;
  const C = (elems.c1 + elems.c1t * T) * Math.sin(Mr)
    + (elems.c2 + elems.c2t * T) * Math.sin(2 * Mr)
    + (elems.c3 || 0) * Math.sin(3 * Mr);
  return { lon: mod(L + C, 360), r: elems.a };
}

const ELEMENTS = {
  mercury: {
    L0: 252.251, L1: 149472.675, L2: 0,
    M0: 174.795, M1: 149472.514, M2: 0,
    e0: 0.2056, e1: 0.00002,
    c1: 7.34, c1t: -0.0003, c2: 0.21, c2t: -0.0001, c3: 0.001,
    a: 0.387098,
  },
  venus: {
    L0: 181.980, L1: 58517.816, L2: 0,
    M0: 135.249, M1: 58517.814, M2: 0,
    e0: 0.0068, e1: -0.00004,
    c1: 0.77, c1t: 0.0002, c2: 0.02, c2t: -0.0001, c3: 0,
    a: 0.723336,
  },
  mars: {
    L0: 355.453, L1: 19140.302, L2: 0.000006,
    M0: 19.373, M1: 19139.856, M2: 0.00015,
    e0: 0.0934, e1: 0.00009,
    c1: 1.886, c1t: -0.006, c2: 0.053, c2t: 0.004, c3: 0.006,
    a: 1.523679,
  },
  jupiter: {
    L0: 34.351, L1: 3034.906, L2: 0,
    M0: 19.650, M1: 3034.906, M2: 0,
    e0: 0.0484, e1: -0.00001,
    c1: 5.22, c1t: -0.009, c2: 0.20, c2t: 0.001, c3: 0,
    a: 5.20256,
  },
  saturn: {
    L0: 50.078, L1: 1222.114, L2: 0,
    M0: 316.967, M1: 1222.114, M2: 0,
    e0: 0.0555, e1: -0.00009,
    c1: 6.11, c1t: -0.014, c2: 0.26, c2t: 0.001, c3: 0,
    a: 9.55491,
  },
};

// ─── Geocentric conversion ──────────────────────────────────

function helioToGeo(helioLon, helioR, earthHelioLon) {
  const eRad = toRad(earthHelioLon);
  const pRad = toRad(helioLon);
  const x = helioR * Math.cos(pRad) - Math.cos(eRad);
  const y = helioR * Math.sin(pRad) - Math.sin(eRad);
  return mod(toDeg(Math.atan2(y, x)), 360);
}

// ─── Public calculation function ─────────────────────────────

export function checkKaalSarp(date, timeStr) {
  const { year, month, day } = date;
  let h = 12, m = 0;
  if (timeStr) {
    const parts = timeStr.split(":");
    h = parseInt(parts[0], 10) || 12;
    m = parseInt(parts[1], 10) || 0;
  }
  const jd = toJulian(year, month, day) + (h - 12 + 5.5) / 24 + m / 1440;
  const ayan = calcAyanamsha(jd);
  const earthHelio = calcSunLongitude(jd) + 180;

  // Compute all planetary positions
  const planets = {};

  // Sun (already geocentric)
  planets.sun = mod(calcSunLongitude(jd) - ayan, 360);
  // Moon
  planets.moon = mod(calcMoonLongitude(jd) - ayan, 360);
  // Mars
  const hMars = calcHelio(jd, ELEMENTS.mars);
  planets.mars = mod(helioToGeo(hMars.lon, hMars.r, earthHelio) - ayan, 360);
  // Mercury
  const hMer = calcHelio(jd, ELEMENTS.mercury);
  planets.mercury = mod(helioToGeo(hMer.lon, hMer.r, earthHelio) - ayan, 360);
  // Venus
  const hVen = calcHelio(jd, ELEMENTS.venus);
  planets.venus = mod(helioToGeo(hVen.lon, hVen.r, earthHelio) - ayan, 360);
  // Jupiter
  const hJup = calcHelio(jd, ELEMENTS.jupiter);
  planets.jupiter = mod(helioToGeo(hJup.lon, hJup.r, earthHelio) - ayan, 360);
  // Saturn
  const hSat = calcHelio(jd, ELEMENTS.saturn);
  planets.saturn = mod(helioToGeo(hSat.lon, hSat.r, earthHelio) - ayan, 360);
  // Rahu
  const T = (jd - 2451545) / 36525;
  planets.rahu = mod(125.044 - 1934.136 * T - ayan, 360);
  // Ketu
  planets.ketu = mod(planets.rahu + 180, 360);

  // Check Kaal Sarp condition: all 7 planets between Rahu and Ketu
  const rahu = planets.rahu;
  // The "between" arc: from Rahu to Ketu (clockwise, increasing longitude)
  // Since Ketu = Rahu + 180, the arc is [rahu, rahu + 180)
  const planetKeys = ["sun", "moon", "mars", "mercury", "venus", "jupiter", "saturn"];
  const allInArc = planetKeys.every(key => {
    const offset = mod(planets[key] - rahu, 360);
    return offset >= 0 && offset < 180;
  });

  const hasDosha = allInArc;

  // Determine type based on Rahu's rashi
  const rahuRashiIndex = Math.floor(planets.rahu / 30) % 12;
  const ksdType = hasDosha ? KSD_TYPES[rahuRashiIndex] : null;

  // Build detailed planet data
  const planetDetails = {};
  for (const key of [...planetKeys, "rahu", "ketu"]) {
    const lon = planets[key];
    const rashiIndex = Math.floor(lon / 30) % 12;
    const deg = (lon % 30).toFixed(2);
    const offset = mod(lon - rahu, 360);
    planetDetails[key] = {
      longitude: lon.toFixed(2),
      rashi: RASHI_NAMES[rashiIndex],
      rashiIndex,
      degrees: deg,
      betweenRahuKetu: offset >= 0 && offset < 180,
      offsetFromRahu: offset.toFixed(2),
    };
  }

  return {
    hasDosha,
    type: ksdType,
    planetDetails,
    rahuRashiIndex,
    date,
  };
}
