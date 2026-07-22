import {
  NAKSHATRA_DATA, RASHI_LIST, YONI_ORDER, PLANET_FRIENDSHIP,
  VASHA_MAP, VASHA_COMPAT, GANA_COMPAT, MANGALIK_HOUSES,
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

function calcMarsLongitude(jd) {
  const T = (jd - 2451545) / 36525;
  const L0 = 355.453 + 19140.302 * T + 0.000006 * T * T;
  const M = 19.373 + 19139.856 * T + 0.00015 * T * T;
  const C = (1.886 - 0.006 * T) * Math.sin(toRad(M))
    + (0.053 + 0.004 * T) * Math.sin(toRad(2 * M))
    + 0.006 * Math.sin(toRad(3 * M));
  const helio = mod(L0 + C, 360);
  const earthLon = calcSunLongitude(jd) + 180;
  const earthRad = toRad(earthLon);
  const marsRad = toRad(helio);
  const RM = 1.523679;
  const x = RM * Math.cos(marsRad) - Math.cos(earthRad);
  const y = RM * Math.sin(marsRad) - Math.sin(earthRad);
  return mod(toDeg(Math.atan2(y, x)), 360);
}

export function getPersonData(date, timeStr, lat, lon) {
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
  const marsLon = calcMarsLongitude(jd);
  const nirayanaMoon = mod(moonLon - ayan, 360);
  const nirayanaSun = mod(sunLon - ayan, 360);
  const nirayanaMars = mod(marsLon - ayan, 360);

  const nakshatraIndex = Math.floor(nirayanaMoon / 13.33333);
  const naksIndex = mod(nakshatraIndex, 27);
  const nakshatra = NAKSHATRA_DATA[naksIndex];
  const nakshatraPada = Math.floor((nirayanaMoon % 13.33333) / 3.33333) + 1;

  const rashiIndex = Math.floor(nirayanaMoon / 30) % 12;
  const rashi = RASHI_LIST[rashiIndex];
  const sunRashiIndex = Math.floor(nirayanaSun / 30) % 12;
  const sunRashi = RASHI_LIST[sunRashiIndex];

  const marsRashiIndex = Math.floor(nirayanaMars / 30) % 12;

  return {
    nakshatra,
    nakshatraPada,
    naksIndex,
    rashi,
    rashiIndex,
    sunRashi,
    nirayanaMars,
    marsRashiIndex,
  };
}

function getVarnaScore(boy, girl) {
  return boy.nakshatra.varna === girl.nakshatra.varna ? 1 : 0;
}

function getVashyaScore(boy, girl) {
  const bv = VASHA_MAP[boy.nakshatra.name];
  const gv = VASHA_MAP[girl.nakshatra.name];
  return (VASHA_COMPAT[bv] && VASHA_COMPAT[bv][gv]) || 0;
}

function getTaraScore(boy, girl) {
  const count = ((girl.naksIndex - boy.naksIndex + 27) % 27) + 1;
  const rem = count % 9;
  return [1, 3, 5, 7, 8].includes(rem) ? 3 : 0;
}

function getYoniScore(boy, girl) {
  const bi = YONI_ORDER.indexOf(boy.nakshatra.yoni);
  const gi = YONI_ORDER.indexOf(girl.nakshatra.yoni);
  if (bi === -1 || gi === -1) return 0;
  let dist = Math.abs(bi - gi);
  if (dist > 7) dist = 14 - dist;
  if (dist === 0) return 4;
  if (dist <= 2) return 3;
  if (dist <= 4) return 2;
  if (dist <= 6) return 1;
  return 0;
}

function getGrahaMaitriScore(boy, girl) {
  const bLord = boy.nakshatra.lord;
  const gLord = girl.nakshatra.lord;
  const fp = PLANET_FRIENDSHIP[bLord];
  if (!fp) return 3;
  if (fp.friend.includes(gLord)) return 5;
  if (fp.enemy.includes(gLord)) return 0;
  return 3;
}

function getGanaScore(boy, girl) {
  const bg = boy.nakshatra.gana;
  const gg = girl.nakshatra.gana;
  return (GANA_COMPAT[bg] && GANA_COMPAT[bg][gg]) || 0;
}

function getBhakootScore(boy, girl) {
  const count = ((girl.rashiIndex - boy.rashiIndex + 12) % 12) + 1;
  return [2, 4, 6, 8].includes(count) ? 0 : 7;
}

function getNadiScore(boy, girl) {
  return boy.nakshatra.nadi === girl.nakshatra.nadi ? 0 : 8;
}

function calcManglikDosha(person) {
  const marsHouse = Math.floor(person.nirayanaMars / 30) % 12;
  const moonHouse = person.rashiIndex;
  const houseOffset = ((marsHouse - moonHouse + 12) % 12);
  if (MANGALIK_HOUSES.includes(houseOffset)) return { hasDosha: true, severity: "high" };
  return { hasDosha: false, severity: "none" };
}

export function calculateKundliMatch(person1, person2) {
  const p1 = getPersonData(person1.date, person1.time, person1.lat, person1.lon);
  const p2 = getPersonData(person2.date, person2.time, person2.lat, person2.lon);

  const boy = { ...p1 };
  const girl = { ...p2 };

  const varna = { score: getVarnaScore(boy, girl), max: 1, name: "Varna", desc: "Caste compatibility" };
  const vashya = { score: getVashyaScore(boy, girl), max: 2, name: "Vashya", desc: "Control compatibility" };
  const tara = { score: getTaraScore(boy, girl), max: 3, name: "Tara", desc: "Birth star compatibility" };
  const yoni = { score: getYoniScore(boy, girl), max: 4, name: "Yoni", desc: "Sexual compatibility" };
  const grahaMaitri = { score: getGrahaMaitriScore(boy, girl), max: 5, name: "Graha Maitri", desc: "Planetary friendship" };
  const gana = { score: getGanaScore(boy, girl), max: 6, name: "Gana", desc: "Temperament compatibility" };
  const bhakoot = { score: getBhakootScore(boy, girl), max: 7, name: "Bhakoot", desc: "Rashi compatibility" };
  const nadi = { score: getNadiScore(boy, girl), max: 8, name: "Nadi", desc: "Health compatibility" };

  const totalScore = varna.score + vashya.score + tara.score + yoni.score + grahaMaitri.score + gana.score + bhakoot.score + nadi.score;
  const totalMax = 36;

  const manglik1 = calcManglikDosha(boy);
  const manglik2 = calcManglikDosha(girl);

  return {
    person1: {
      name: person1.name || "Person 1",
      nakshatra: boy.nakshatra,
      pada: boy.nakshatraPada,
      rashi: boy.rashi,
      sunRashi: boy.sunRashi,
      manglik: manglik1,
    },
    person2: {
      name: person2.name || "Person 2",
      nakshatra: girl.nakshatra,
      pada: girl.nakshatraPada,
      rashi: girl.rashi,
      sunRashi: girl.sunRashi,
      manglik: manglik2,
    },
    kootas: [varna, vashya, tara, yoni, grahaMaitri, gana, bhakoot, nadi],
    totalScore,
    totalMax,
    matchPercent: Math.round((totalScore / totalMax) * 100),
    isCompatible: totalScore >= 18,
    manglikMatch: manglik1.hasDosha && manglik2.hasDosha ? "both" : manglik1.hasDosha ? "boy" : manglik2.hasDosha ? "girl" : "none",
  };
}
