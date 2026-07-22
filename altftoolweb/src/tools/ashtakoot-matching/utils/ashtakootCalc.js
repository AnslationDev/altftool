import {
  NAKSHATRA_DATA, RASHI_LIST, YONI_ORDER, PLANET_FRIENDSHIP,
  VASHA_MAP, VASHA_COMPAT, GANA_COMPAT,
} from "../constants";

function toRad(deg) { return (deg * Math.PI) / 180; }
function toDeg(rad) { return (rad * 180) / Math.PI; }
function mod(a, b) { return ((a % b) + b) % b; }

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

function toJulian(year, month, day) {
  const y = month <= 2 ? year - 1 : year;
  const m = month <= 2 ? month + 12 : month;
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
}

function calcAyanamsha(jd) {
  const T = (jd - 2451545) / 36525;
  return 17.23 + 0.051 * T - 0.0001 * T * T;
}

function getPersonData(date, timeStr) {
  const { year, month, day } = date;
  let h = 12, m = 0;
  if (timeStr) {
    const parts = timeStr.split(":");
    h = parseInt(parts[0], 10) || 12;
    m = parseInt(parts[1], 10) || 0;
  }
  const jd = toJulian(year, month, day) + (h - 12 + 5.5) / 24 + m / 1440;
  const ayan = calcAyanamsha(jd);
  const moonLon = calcMoonLongitude(jd);
  const sunLon = calcSunLongitude(jd);
  const nirayanaMoon = mod(moonLon - ayan, 360);
  const nirayanaSun = mod(sunLon - ayan, 360);

  const naksIndex = mod(Math.floor(nirayanaMoon / 13.33333), 27);
  const nakshatra = NAKSHATRA_DATA[naksIndex];
  const nakshatraPada = Math.floor((nirayanaMoon % 13.33333) / 3.33333) + 1;
  const rashiIndex = Math.floor(nirayanaMoon / 30) % 12;
  const rashi = RASHI_LIST[rashiIndex];
  const sunRashiIndex = Math.floor(nirayanaSun / 30) % 12;
  const sunRashi = RASHI_LIST[sunRashiIndex];

  return { nakshatra, nakshatraPada, naksIndex, rashi, rashiIndex, sunRashi };
}

function getVarnaScore(b, g) { return b.nakshatra.varna === g.nakshatra.varna ? 1 : 0; }
function getVashyaScore(b, g) { return VASHA_COMPAT[VASHA_MAP[b.nakshatra.name]]?.[VASHA_MAP[g.nakshatra.name]] || 0; }
function getTaraScore(b, g) {
  const rem = (((g.naksIndex - b.naksIndex + 27) % 27) + 1) % 9;
  return [1, 3, 5, 7, 8].includes(rem) ? 3 : 0;
}
function getYoniScore(b, g) {
  const i1 = YONI_ORDER.indexOf(b.nakshatra.yoni);
  const i2 = YONI_ORDER.indexOf(g.nakshatra.yoni);
  if (i1 < 0 || i2 < 0) return 0;
  let d = Math.abs(i1 - i2);
  if (d > 7) d = 14 - d;
  return d === 0 ? 4 : d <= 2 ? 3 : d <= 4 ? 2 : d <= 6 ? 1 : 0;
}
function getGrahaMaitriScore(b, g) {
  const fp = PLANET_FRIENDSHIP[b.nakshatra.lord];
  if (!fp) return 3;
  if (fp.friend.includes(g.nakshatra.lord)) return 5;
  if (fp.enemy.includes(g.nakshatra.lord)) return 0;
  return 3;
}
function getGanaScore(b, g) { return GANA_COMPAT[b.nakshatra.gana]?.[g.nakshatra.gana] || 0; }
function getBhakootScore(b, g) {
  const c = ((g.rashiIndex - b.rashiIndex + 12) % 12) + 1;
  return [2, 4, 6, 8].includes(c) ? 0 : 7;
}
function getNadiScore(b, g) { return b.nakshatra.nadi === g.nakshatra.nadi ? 0 : 8; }

export function calculateAshtakoot(person1, person2) {
  const b = getPersonData(person1.date, person1.time);
  const g = getPersonData(person2.date, person2.time);

  const kootas = [
    { name: "Varna", score: getVarnaScore(b, g), max: 1 },
    { name: "Vashya", score: getVashyaScore(b, g), max: 2 },
    { name: "Tara", score: getTaraScore(b, g), max: 3 },
    { name: "Yoni", score: getYoniScore(b, g), max: 4 },
    { name: "Graha Maitri", score: getGrahaMaitriScore(b, g), max: 5 },
    { name: "Gana", score: getGanaScore(b, g), max: 6 },
    { name: "Bhakoot", score: getBhakootScore(b, g), max: 7 },
    { name: "Nadi", score: getNadiScore(b, g), max: 8 },
  ];

  const total = kootas.reduce((s, k) => s + k.score, 0);

  return {
    person1: { name: person1.name || "Person 1", nakshatra: b.nakshatra, pada: b.nakshatraPada, rashi: b.rashi, sunRashi: b.sunRashi },
    person2: { name: person2.name || "Person 2", nakshatra: g.nakshatra, pada: g.nakshatraPada, rashi: g.rashi, sunRashi: g.sunRashi },
    kootas,
    totalScore: total,
    totalMax: 36,
    matchPercent: Math.round((total / 36) * 100),
    isCompatible: total >= 18,
    verdict: total >= 30 ? "Excellent" : total >= 24 ? "Very Good" : total >= 18 ? "Good" : "Low",
  };
}
