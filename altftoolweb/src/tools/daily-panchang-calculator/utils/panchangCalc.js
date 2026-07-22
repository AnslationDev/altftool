import {
  NAKSHATRA_LIST, TITHI_LIST, YOGA_LIST, KARANA_LIST,
  RASHI_LIST, MONTH_NAMES, MUHURTA_TIMINGS,
} from "../constants";

function toRad(deg) { return (deg * Math.PI) / 180; }
function toDeg(rad) { return (rad * 180) / Math.PI; }
function frac(x) { return x - Math.floor(x); }
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

function fromJulian(jd) {
  const j = jd + 0.5;
  const z = Math.floor(j);
  let f = frac(j);
  let a, b, c, d, e, month, day, year;
  if (z < 2299161) a = z;
  else {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  b = a + 1524;
  c = Math.floor((b - 122.1) / 365.25);
  d = Math.floor(365.25 * c);
  e = Math.floor((b - d) / 30.6001);
  day = b - d - Math.floor(30.6001 * e) + f;
  month = e <= 13 ? e - 1 : e - 13;
  year = month <= 2 ? c - 4715 : c - 4716;
  return { year: Math.floor(year), month: Math.floor(month), day: Math.floor(day) };
}

function calcSunrise(jd, lat, lon) {
  const T = (jd - 2451545) / 36525;
  const theta0 = 280.46061837 + 360.98564736629 * (jd - 2451545);
  const sunLon = calcSunLongitude(jd);
  const alpha = toDeg(Math.atan2(Math.cos(toRad(23.439 - 0.00000036 * T)) * Math.sin(toRad(sunLon)), Math.cos(toRad(sunLon))));
  const delta = toDeg(Math.asin(Math.sin(toRad(23.439 - 0.00000036 * T)) * Math.sin(toRad(sunLon))));
  const cosH = (Math.sin(toRad(-0.833)) - Math.sin(toRad(lat)) * Math.sin(toRad(delta))) / (Math.cos(toRad(lat)) * Math.cos(toRad(delta)));
  const H = toDeg(Math.acos(Math.max(-1, Math.min(1, cosH))));
  const transit = (sunLon - alpha - lon) / 360;
  const sunrise = jd + transit - H / 360 + 0.5;
  return sunrise;
}

function calcSunset(jd, lat, lon) {
  const T = (jd - 2451545) / 36525;
  const sunLon = calcSunLongitude(jd);
  const alpha = toDeg(Math.atan2(Math.cos(toRad(23.439 - 0.00000036 * T)) * Math.sin(toRad(sunLon)), Math.cos(toRad(sunLon))));
  const delta = toDeg(Math.asin(Math.sin(toRad(23.439 - 0.00000036 * T)) * Math.sin(toRad(sunLon))));
  const cosH = (Math.sin(toRad(-0.833)) - Math.sin(toRad(lat)) * Math.sin(toRad(delta))) / (Math.cos(toRad(lat)) * Math.cos(toRad(delta)));
  const H = toDeg(Math.acos(Math.max(-1, Math.min(1, cosH))));
  const transit = (sunLon - alpha - lon) / 360;
  const sunset = jd + transit + H / 360 + 0.5;
  return sunset;
}

function jdToTime(jd) {
  const d = frac(jd + 0.5);
  const hours = d * 24;
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const s = Math.floor(((hours - h) * 60 - m) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function calcAyanamsha(jd) {
  const T = (jd - 2451545) / 36525;
  return 17.23 + 0.051 * T - 0.0001 * T * T;
}

export function calculatePanchang(date, lat = 28.6139, lon = 77.209) {
  const { year, month, day } = date;
  const jd = toJulian(year, month, day);

  const sunLon = calcSunLongitude(jd);
  const moonLon = calcMoonLongitude(jd);
  const ayan = calcAyanamsha(jd);
  const nirayanaSun = mod(sunLon - ayan, 360);
  const nirayanaMoon = mod(moonLon - ayan, 360);

  // Tithi
  const ti = nirayanaMoon - nirayanaSun;
  const tithiIndex = Math.floor(ti / 12);
  const tithiNum = mod(tithiIndex, 30);
  const tithiName = TITHI_LIST[tithiNum];
  const tithiPaksha = tithiNum < 15 ? "Shukla (Waxing)" : "Krishna (Waning)";
  const tithiRemaining = ((ti / 12) - tithiIndex) * 100;

  // Nakshatra
  const nakshatraIndex = Math.floor(nirayanaMoon / 13.33333);
  const naksIndex = mod(nakshatraIndex, 27);
  const nakshatra = NAKSHATRA_LIST[naksIndex];
  const nakshatraPada = Math.floor((nirayanaMoon % 13.33333) / 3.33333) + 1;

  // Yoga
  const yogaVal = mod(sunLon + moonLon, 360);
  const yogaIndex = Math.floor(yogaVal / 13.33333) % 27;
  const yogaName = YOGA_LIST[yogaIndex];

  // Karana
  const karanaIndex = mod(Math.floor(ti / 6), 11);
  const karana = KARANA_LIST[karanaIndex];

  // Rashi (Moon sign)
  const rashiIndex = Math.floor(nirayanaMoon / 30) % 12;
  const moonRashi = RASHI_LIST[rashiIndex];
  const sunRashiIndex = Math.floor(nirayanaSun / 30) % 12;
  const sunRashi = RASHI_LIST[sunRashiIndex];

  // Vaar (weekday)
  const weekday = Math.floor(jd + 1.5) % 7;

  // Hindu month (approximate)
  const solarMonthIndex = Math.floor(nirayanaSun / 30) % 12;
  const hinduMonth = MONTH_NAMES[(solarMonthIndex + 1) % 12];

  // Hindu year (approximate Saka calendar)
  const sakaYear = year - 78;

  // Sunrise / Sunset
  const sunriseJD = calcSunrise(jd, lat, lon);
  const sunsetJD = calcSunset(jd, lat, lon);
  const sunriseTime = jdToTime(sunriseJD);
  const sunsetTime = jdToTime(sunsetJD);

  // Abhijit Muhurta
  const dayLength = sunsetJD - sunriseJD;
  const noonJD = sunriseJD + dayLength / 2;
  const abhijitStart = noonJD - dayLength / 16;
  const abhijitEnd = noonJD + dayLength / 16;

  // Updated Muhurta timings based on actual sunrise/sunset
  const srH = parseFloat(sunriseTime.split(":")[0]) + parseFloat(sunriseTime.split(":")[1]) / 60;
  const ssH = parseFloat(sunsetTime.split(":")[0]) + parseFloat(sunsetTime.split(":")[1]) / 60;
  const dayH = ssH - srH;
  const eighth = dayH / 8;

  const muhurtaTimings = [
    { name: "Brahma Muhurta", start: `${Math.floor(srH - 1.6)}:${String(Math.round((srH - 1.6) % 1 * 60)).padStart(2, "0")}`, end: sunriseTime, description: "Best for meditation, study, spiritual practice" },
    { name: "Abhijit Muhurta", start: `${Math.floor(srH + 4.5 * eighth)}:${String(Math.round((srH + 4.5 * eighth) % 1 * 60)).padStart(2, "0")}`, end: `${Math.floor(srH + 5.5 * eighth)}:${String(Math.round((srH + 5.5 * eighth) % 1 * 60)).padStart(2, "0")}`, description: "Best for new beginnings, important tasks" },
    { name: "Rahu Kaal", start: `${Math.floor(srH + 2 * eighth)}:${String(Math.round((srH + 2 * eighth) % 1 * 60)).padStart(2, "0")}`, end: `${Math.floor(srH + 3 * eighth)}:${String(Math.round((srH + 3 * eighth) % 1 * 60)).padStart(2, "0")}`, description: "Avoid important activities. Not auspicious" },
    { name: "Yamaganda", start: `${Math.floor(srH + 4 * eighth)}:${String(Math.round((srH + 4 * eighth) % 1 * 60)).padStart(2, "0")}`, end: `${Math.floor(srH + 5 * eighth)}:${String(Math.round((srH + 5 * eighth) % 1 * 60)).padStart(2, "0")}`, description: "Avoid travel and important tasks" },
    { name: "Gulik Kaal", start: `${Math.floor(srH + 6 * eighth)}:${String(Math.round((srH + 6 * eighth) % 1 * 60)).padStart(2, "0")}`, end: `${Math.floor(srH + 7 * eighth)}:${String(Math.round((srH + 7 * eighth) % 1 * 60)).padStart(2, "0")}`, description: "Avoid crucial decisions. Medium impact" },
  ];

  return {
    date: { year, month, day },
    weekday,
    sunrise: sunriseTime,
    sunset: sunsetTime,
    tithi: { name: tithiName, num: tithiNum + 1, paksha: tithiPaksha, remaining: tithiRemaining.toFixed(1) },
    nakshatra: { name: nakshatra.name, pada: nakshatraPada, deity: nakshatra.deity, gana: nakshatra.gana },
    yoga: { name: yogaName, meaning: YOGA_LIST[yogaIndex] ? "" : "" },
    karana: { name: karana.name, type: karana.type },
    moonRashi: { name: moonRashi.name, english: moonRashi.english, lord: moonRashi.lord, element: moonRashi.element },
    sunRashi: { name: sunRashi.name, english: sunRashi.english },
    hinduMonth,
    sakaYear,
    muhurtaTimings,
  };
}

export function getDatePresets() {
  const today = new Date();
  const presets = [];

  for (let i = -7; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const label = i === 0 ? "Today" : i === -1 ? "Yesterday" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    presets.push({ year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), label });
  }
  return presets;
}

export function getWeekdayName(weekday) {
  const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const hindi = ["Ravivar", "Somavar", "Mangalvar", "Budhvar", "Guruvár", "Shukravar", "Shanivar"];
  return { english: names[weekday], hindi: hindi[weekday] };
}
