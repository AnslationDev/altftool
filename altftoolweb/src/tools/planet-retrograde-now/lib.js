/**
 * Retrograde motion of the planets, computed — never tabulated.
 *
 * WHAT IS COMPUTED
 * ----------------
 * Apparent geocentric ecliptic longitude lambda(t) of each planet, referred to the
 * true equinox and ecliptic OF DATE (the frame the tropical zodiac is defined in),
 * corrected for light travel time and annual aberration. Source of the ephemeris:
 * the `astronomy-engine` package (v2.x, VSOP87 for Mercury..Neptune; Pluto is a
 * numerically-integrated gravity simulation seeded from a table of barycentric
 * state vectors spanning roughly year 1 to year 4000, not a closed-form series).
 *
 * A planet is *retrograde* when d(lambda)/dt < 0, i.e. its apparent longitude is
 * decreasing as seen from Earth. This is an APPARENT effect of the relative
 * orbital motion of Earth and the planet along the line of sight; no planet ever
 * reverses its actual orbit. Stations (station-retrograde and station-direct) are
 * the instants when d(lambda)/dt = 0. They are found here by bracketing the sign
 * change of a central-difference longitude rate and bisecting.
 *
 * SHADOW ("retroshade") WINDOWS
 * -----------------------------
 * These are purely geometric definitions of the arc the planet covers three times:
 *   pre-retrograde shadow  starts when the planet, still direct, first reaches the
 *                          longitude at which it will later station direct;
 *   post-retrograde shadow ends when the planet, again direct, returns to the
 *                          longitude at which it stationed retrograde.
 * Both instants are solved here as roots of lambda(t) = target longitude.
 *
 * Everything in this file is pure: the observation time is always an argument.
 * No astrological interpretation is produced or implied — only the geometry.
 */

import {
  GeoVector,
  RotateVector,
  Rotation_EQJ_ECT,
  SphereFromVector,
} from "astronomy-engine";

const MS_PER_DAY = 86_400_000;

/** Half-width, in days, of the central difference used to estimate d(lambda)/dt. */
const RATE_HALF_STEP_DAYS = 0.1;

/** Bisection tolerance for stations and shadow crossings: one minute of time. */
const TIME_TOL_DAYS = 1 / 1440;

/** Hard safety cap on bisection iterations (log2(1000 d / 1 min) ~ 21). */
const MAX_BISECTIONS = 60;

/**
 * Validity window enforced here. astronomy-engine's planetary models, including
 * Pluto's gravity simulation, are accurate far outside this window -- the page
 * simply refuses anything outside a comfortably interior, well-tested range
 * rather than returning results near the edge of what has been sanity-checked.
 */
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

/**
 * Mean synodic periods in days (Astronomical Almanac / IAU standard values).
 * Used ONLY to size the search windows — never to predict a date.
 */
const SYNODIC_DAYS = {
  Mercury: 115.88,
  Venus: 583.92,
  Mars: 779.94,
  Jupiter: 398.88,
  Saturn: 378.09,
  Uranus: 369.66,
  Neptune: 367.49,
  Pluto: 366.73,
};

/**
 * Per-planet coarse scan step, in days. Must be comfortably shorter than the
 * planet's retrograde loop so a sign change can never be stepped over:
 * Mercury retrogrades for ~21 d, Venus ~41 d, Mars ~60-80 d, Jupiter ~120 d,
 * Saturn ~140 d, Uranus/Neptune/Pluto ~150-160 d.
 */
const SCAN_STEP_DAYS = {
  Mercury: 0.5,
  Venus: 1,
  Mars: 1.5,
  Jupiter: 3,
  Saturn: 3,
  Uranus: 4,
  Neptune: 4,
  Pluto: 4,
};

/** The eight planets this page covers, inner to outer. Earth is excluded: it is the observer. */
export const PLANETS = [
  { body: "Mercury", label: "Mercury", blurb: "Fastest and most frequent — three or four loops a year." },
  { body: "Venus", label: "Venus", blurb: "Rarest of the inner planets — one loop roughly every 19 months." },
  { body: "Mars", label: "Mars", blurb: "One loop roughly every 26 months, near opposition." },
  { body: "Jupiter", label: "Jupiter", blurb: "About four months of retrograde motion each year." },
  { body: "Saturn", label: "Saturn", blurb: "About four and a half months of retrograde motion each year." },
  { body: "Uranus", label: "Uranus", blurb: "Roughly five months retrograde each year." },
  { body: "Neptune", label: "Neptune", blurb: "Roughly five months retrograde each year." },
  { body: "Pluto", label: "Pluto", blurb: "Roughly five and a half months retrograde each year." },
];

const PLANET_BODIES = new Set(PLANETS.map((p) => p.body));

/**
 * Tropical zodiac signs: the twelve equal 30 degree divisions of ecliptic longitude
 * counted from the March equinox point (longitude 0). This is a naming convention
 * for a coordinate, nothing more.
 */
export const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

function norm360(deg) {
  const x = deg % 360;
  return x < 0 ? x + 360 : x;
}

/** Signed difference a - b wrapped into (-180, +180]. */
function angleDelta(a, b) {
  let d = (a - b) % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

function addDays(date, days) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

function toDate(value) {
  if (value instanceof Date) {
    // An Invalid Date is still an object, so it must be checked explicitly --
    // otherwise it slips past the `if (!now)` guard in getRetrogradeState()
    // as a truthy value, and its NaN internal time later fails the year-range
    // guard silently (any comparison against NaN is false), reaching
    // astronomy-engine and throwing a raw string instead of returning the
    // documented { error } shape.
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Apparent geocentric ecliptic longitude in degrees [0, 360), referred to the
 * true ecliptic and equinox of date, with light-time and aberration applied.
 */
export function apparentLongitude(body, date) {
  const vec = GeoVector(body, date, true);
  const ecl = RotateVector(Rotation_EQJ_ECT(date), vec);
  return norm360(SphereFromVector(ecl).lon);
}

/**
 * d(lambda)/dt in degrees per day, by symmetric central difference over
 * +/- RATE_HALF_STEP_DAYS. Negative means retrograde.
 */
export function longitudeRate(body, date, halfStepDays = RATE_HALF_STEP_DAYS) {
  const before = apparentLongitude(body, addDays(date, -halfStepDays));
  const after = apparentLongitude(body, addDays(date, halfStepDays));
  return angleDelta(after, before) / (2 * halfStepDays);
}

/** Bisect a rate sign change bracketed by [tA, tB] down to TIME_TOL_DAYS. */
function bisectRateZero(body, tA, tB, rateA) {
  let lo = tA;
  let hi = tB;
  let loRate = rateA;
  for (let i = 0; i < MAX_BISECTIONS; i += 1) {
    if (Math.abs(hi.getTime() - lo.getTime()) / MS_PER_DAY <= TIME_TOL_DAYS) break;
    const mid = new Date((lo.getTime() + hi.getTime()) / 2);
    const midRate = longitudeRate(body, mid);
    if (midRate === 0) return mid;
    if (Math.sign(midRate) === Math.sign(loRate)) {
      lo = mid;
      loRate = midRate;
    } else {
      hi = mid;
    }
  }
  return new Date((lo.getTime() + hi.getTime()) / 2);
}

/**
 * Step from `start` in `direction` (+1 future, -1 past) until d(lambda)/dt flips
 * sign, then bisect. Returns a Date, or null if no station inside maxDays.
 */
function findNextStation(body, start, direction, maxDays, startRate = null) {
  const step = SCAN_STEP_DAYS[body] ?? 1;
  let tPrev = start;
  let ratePrev = startRate === null ? longitudeRate(body, tPrev) : startRate;
  let walked = 0;
  while (walked < maxDays) {
    const advance = Math.min(step, maxDays - walked);
    const tNext = addDays(tPrev, direction * advance);
    const rateNext = longitudeRate(body, tNext);
    walked += advance;
    if (Math.sign(rateNext) !== Math.sign(ratePrev) && rateNext !== 0) {
      return direction > 0
        ? bisectRateZero(body, tPrev, tNext, ratePrev)
        : bisectRateZero(body, tNext, tPrev, rateNext);
    }
    tPrev = tNext;
    ratePrev = rateNext;
  }
  return null;
}

/**
 * Step from `start` in `direction` until lambda(t) crosses `targetLon`, then
 * bisect. Used for the two shadow boundaries, where the planet is moving direct
 * and lambda is monotonic, so the crossing is unique inside the window.
 */
function findLongitudeCrossing(body, start, direction, targetLon, maxDays) {
  const step = SCAN_STEP_DAYS[body] ?? 1;
  let tPrev = start;
  let fPrev = angleDelta(apparentLongitude(body, tPrev), targetLon);
  let walked = 0;
  while (walked < maxDays) {
    const advance = Math.min(step, maxDays - walked);
    const tNext = addDays(tPrev, direction * advance);
    const fNext = angleDelta(apparentLongitude(body, tNext), targetLon);
    walked += advance;
    if (fNext === 0) return tNext;
    if (Math.sign(fNext) !== Math.sign(fPrev)) {
      let lo = direction > 0 ? tPrev : tNext;
      let hi = direction > 0 ? tNext : tPrev;
      let loF = direction > 0 ? fPrev : fNext;
      for (let i = 0; i < MAX_BISECTIONS; i += 1) {
        if (Math.abs(hi.getTime() - lo.getTime()) / MS_PER_DAY <= TIME_TOL_DAYS) break;
        const mid = new Date((lo.getTime() + hi.getTime()) / 2);
        const midF = angleDelta(apparentLongitude(body, mid), targetLon);
        if (midF === 0) return mid;
        if (Math.sign(midF) === Math.sign(loF)) {
          lo = mid;
          loF = midF;
        } else {
          hi = mid;
        }
      }
      return new Date((lo.getTime() + hi.getTime()) / 2);
    }
    tPrev = tNext;
    fPrev = fNext;
  }
  return null;
}

/** Ecliptic longitude expressed as sign + degrees/minutes within that sign. */
export function toSignPosition(longitude) {
  const lon = norm360(longitude);
  const index = Math.floor(lon / 30) % 12;
  const withinSign = lon - index * 30;
  const degrees = Math.floor(withinSign);
  const minutes = Math.floor((withinSign - degrees) * 60);
  return {
    sign: SIGNS[index],
    degrees,
    minutes,
    withinSign,
    label: `${degrees}° ${String(minutes).padStart(2, "0")}′ ${SIGNS[index]}`,
  };
}

function iso(date) {
  return date ? date.toISOString() : null;
}

function daysBetween(a, b) {
  return (b.getTime() - a.getTime()) / MS_PER_DAY;
}

/**
 * Build one complete retrograde cycle given its station-retrograde instant:
 * the station-direct instant, both longitudes, the retrograde arc, and the two
 * shadow boundaries.
 */
function buildCycle(body, stationRetro) {
  const synodic = SYNODIC_DAYS[body] ?? 400;
  const stationDirect = findNextStation(body, addDays(stationRetro, 1), +1, synodic);
  if (!stationDirect) return null;

  const retroLon = apparentLongitude(body, stationRetro);
  const directLon = apparentLongitude(body, stationDirect);
  // Retrograde arc: how far back in longitude the planet appears to travel.
  const arcDegrees = Math.abs(angleDelta(retroLon, directLon));
  const retrogradeDays = daysBetween(stationRetro, stationDirect);

  // The shadow arc is covered at direct speed, so allow generously more time
  // than the retrograde leg itself before giving up.
  const shadowWindow = Math.max(synodic, retrogradeDays * 4);
  const preShadowStart = findLongitudeCrossing(body, stationRetro, -1, directLon, shadowWindow);
  const postShadowEnd = findLongitudeCrossing(body, stationDirect, +1, retroLon, shadowWindow);

  return {
    stationRetrograde: iso(stationRetro),
    stationRetrogradeLongitude: retroLon,
    stationRetrogradePosition: toSignPosition(retroLon),
    stationDirect: iso(stationDirect),
    stationDirectLongitude: directLon,
    stationDirectPosition: toSignPosition(directLon),
    retrogradeDays,
    arcDegrees,
    preShadowStart: iso(preShadowStart),
    postShadowEnd: iso(postShadowEnd),
    preShadowDays: preShadowStart ? daysBetween(preShadowStart, stationRetro) : null,
    postShadowDays: postShadowEnd ? daysBetween(stationDirect, postShadowEnd) : null,
  };
}

/**
 * Lay a cycle out as a proportional bar: pre-shadow, retrograde, post-shadow,
 * plus where `at` falls along it. Percentages live here rather than in the view
 * so the view does no arithmetic.
 *
 * @returns {object|null} segment percentages summing to 100, or null if the
 *   cycle is missing either shadow boundary.
 */
export function cycleTimeline(cycle, at) {
  if (!cycle?.preShadowStart || !cycle?.postShadowEnd) return null;
  const start = new Date(cycle.preShadowStart).getTime();
  const end = new Date(cycle.postShadowEnd).getTime();
  const sr = new Date(cycle.stationRetrograde).getTime();
  const sd = new Date(cycle.stationDirect).getTime();
  const span = end - start;
  if (!(span > 0)) return null;
  const now = toDate(at);
  const rawMarker = now ? ((now.getTime() - start) / span) * 100 : null;
  return {
    prePercent: ((sr - start) / span) * 100,
    retroPercent: ((sd - sr) / span) * 100,
    postPercent: ((end - sd) / span) * 100,
    markerPercent: rawMarker === null ? null : Math.min(100, Math.max(0, rawMarker)),
    markerInsideSpan: rawMarker !== null && rawMarker >= 0 && rawMarker <= 100,
    totalDays: span / MS_PER_DAY,
  };
}

/**
 * Full retrograde state of one planet at one instant.
 *
 * @param {string} body    One of PLANETS[].body.
 * @param {Date|string} at The observation instant (UTC). Always supplied by the caller.
 * @returns {object} state, or { error } explaining why nothing could be computed.
 */
export function getRetrogradeState(body, at) {
  if (!PLANET_BODIES.has(body)) {
    return { error: `"${String(body)}" is not one of the eight planets this page computes.` };
  }
  const now = toDate(at);
  if (!now) {
    return { error: "That date could not be read. Use a real calendar date." };
  }
  const year = now.getUTCFullYear();
  if (year < MIN_YEAR || year > MAX_YEAR) {
    return {
      error: `Dates are limited to ${MIN_YEAR}-${MAX_YEAR} to stay inside a comfortably interior, well-tested range for every planet, Pluto included.`,
    };
  }

  const longitude = apparentLongitude(body, now);
  const rate = longitudeRate(body, now);
  const isRetrograde = rate < 0;
  const synodic = SYNODIC_DAYS[body] ?? 400;
  // A full cycle plus a margin: enough to reach the next station of either kind.
  const forwardWindow = synodic * 1.4;
  const backWindow = synodic * 1.4;

  let currentCycle = null;
  let nextCycle = null;

  if (isRetrograde) {
    // Scan from `now` itself, seeded with the rate already measured there, so a
    // date landing within hours of a station still resolves to its own cycle.
    const stationRetro = findNextStation(body, now, -1, backWindow, rate);
    currentCycle = stationRetro ? buildCycle(body, stationRetro) : null;
    if (!currentCycle) {
      return {
        error: `The stations bracketing this retrograde could not be located within ${Math.round(backWindow)} days of the date given.`,
      };
    }
  } else {
    const stationRetro = findNextStation(body, now, +1, forwardWindow, rate);
    nextCycle = stationRetro ? buildCycle(body, stationRetro) : null;
    if (!nextCycle) {
      return {
        error: `No station-retrograde was found within ${Math.round(forwardWindow)} days after the date given.`,
      };
    }
    // The retrograde just finished may still have its post-shadow running.
    const prevStationDirect = findNextStation(body, now, -1, backWindow, rate);
    if (prevStationDirect) {
      const prevStationRetro = findNextStation(body, addDays(prevStationDirect, -1), -1, backWindow);
      if (prevStationRetro) currentCycle = buildCycle(body, prevStationRetro);
    }
  }

  // Which of the four geometric phases the instant falls in.
  let phase = "direct";
  let phaseEndsAt = null;
  if (isRetrograde) {
    phase = "retrograde";
    phaseEndsAt = currentCycle.stationDirect;
  } else if (currentCycle?.postShadowEnd && now < new Date(currentCycle.postShadowEnd)) {
    phase = "post-shadow";
    phaseEndsAt = currentCycle.postShadowEnd;
  } else if (nextCycle?.preShadowStart && now >= new Date(nextCycle.preShadowStart)) {
    phase = "pre-shadow";
    phaseEndsAt = nextCycle.stationRetrograde;
  }

  // During an actual retrograde OR its still-running post-retrograde shadow,
  // the relevant cycle is the one that just happened (currentCycle) -- using
  // nextCycle there would show a future cycle's station dates under a phase
  // pill that says the current cycle's post-shadow is active. Only once the
  // instant has moved into "pre-shadow" or plain "direct" does nextCycle
  // become the relevant cycle.
  const upcoming = isRetrograde || phase === "post-shadow" ? currentCycle : nextCycle;

  return {
    body,
    at: iso(now),
    longitude,
    position: toSignPosition(longitude),
    dailyMotion: rate,
    isRetrograde,
    phase,
    phaseEndsAt,
    daysToPhaseEnd: phaseEndsAt ? daysBetween(now, new Date(phaseEndsAt)) : null,
    currentCycle,
    nextCycle,
    cycle: upcoming,
    daysUntilStationRetrograde: isRetrograde
      ? null
      : daysBetween(now, new Date(nextCycle.stationRetrograde)),
    daysUntilStationDirect: isRetrograde
      ? daysBetween(now, new Date(currentCycle.stationDirect))
      : null,
  };
}

/**
 * All eight planets at one instant.
 *
 * @param {Date|string} at Observation instant (UTC).
 * @returns {{ at: string, planets: object[] }|{ error: string }}
 */
export function getAllRetrogradeStates(at) {
  const now = toDate(at);
  if (!now) return { error: "That date could not be read. Use a real calendar date." };
  const year = now.getUTCFullYear();
  if (year < MIN_YEAR || year > MAX_YEAR) {
    return {
      error: `Dates are limited to ${MIN_YEAR}-${MAX_YEAR} to stay inside a comfortably interior, well-tested range for every planet, Pluto included.`,
    };
  }
  const planets = PLANETS.map((p) => ({
    ...p,
    ...getRetrogradeState(p.body, now),
  }));
  return {
    at: iso(now),
    retrogradeCount: planets.filter((p) => p.isRetrograde).length,
    planets,
  };
}
