import {
  MANGALIK_HOUSES, HOUSE_NAMES, HOUSE_SEVERITY, RASHI_LIST,
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
  const x = 1.523679 * Math.cos(marsRad) - Math.cos(earthRad);
  const y = 1.523679 * Math.sin(marsRad) - Math.sin(earthRad);
  return mod(toDeg(Math.atan2(y, x)), 360);
}

export function checkManglik(date, timeStr) {
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
  const marsLon = calcMarsLongitude(jd);
  const nirayanaMoon = mod(moonLon - ayan, 360);
  const nirayanaMars = mod(marsLon - ayan, 360);

  const moonRashiIndex = Math.floor(nirayanaMoon / 30) % 12;
  const marsRashiIndex = Math.floor(nirayanaMars / 30) % 12;
  const moonRashi = RASHI_LIST[moonRashiIndex];
  const marsRashi = RASHI_LIST[marsRashiIndex];
  const marsDegrees = nirayanaMars % 30;

  const moonDegrees = nirayanaMoon % 30;
  const nakshatraIndex = Math.floor(nirayanaMoon / 13.33333);
  const naksName = ["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishtha","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"][mod(Math.floor(nakshatraIndex), 27)];

  const houseOffset = ((marsRashiIndex - moonRashiIndex + 12) % 12);
  const affectedHouses = [];
  let maxSeverity = "None";

  if (MANGALIK_HOUSES.includes(houseOffset)) {
    const sev = HOUSE_SEVERITY[houseOffset] || "Moderate";
    affectedHouses.push({ house: houseOffset, name: HOUSE_NAMES[houseOffset], severity: sev });
    const order = { "Critical": 4, "Very High": 3, "High": 2, "Moderate": 1, "None": 0 };
    maxSeverity = order[sev] > order[maxSeverity] ? sev : maxSeverity;
  }

  // Also check 7th from Moon (opposite house)
  const oppOffset = (houseOffset + 6) % 12;
  if (MANGALIK_HOUSES.includes(oppOffset) && oppOffset !== houseOffset) {
    const sev = HOUSE_SEVERITY[oppOffset] || "Moderate";
    affectedHouses.push({ house: oppOffset, name: HOUSE_NAMES[oppOffset], severity: sev });
    const order = { "Critical": 4, "Very High": 3, "High": 2, "Moderate": 1, "None": 0 };
    maxSeverity = order[sev] > order[maxSeverity] ? sev : maxSeverity;
  }

  const hasDosha = affectedHouses.length > 0;

  return {
    hasDosha,
    severity: hasDosha ? maxSeverity : "None",
    affectedHouses,
    moon: {
      rashi: moonRashi,
      degrees: moonDegrees.toFixed(2),
      nakshatra: naksName,
    },
    mars: {
      rashi: marsRashi,
      degrees: marsDegrees.toFixed(2),
      houseFromMoon: houseOffset + 1,
    },
    date,
  };
}
