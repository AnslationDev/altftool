import {
  westernZodiac,
  chineseZodiac,
  birthstones,
  birthFlowers,
  seasons,
  luckyNumbers,
  luckyColors,
} from "../constants/data";

// The 12-animal Chinese zodiac cycle, in the same order as the `chineseZodiac`
// lookup table in constants/data.js. 1924 is a Rat year, so any birth year's
// position in the cycle can be derived with modular arithmetic. This is used
// as a fallback for years outside the table's explicit 1924-2043 range (the
// tool accepts any birth year back to 1900) so every valid input resolves to
// a real animal instead of "Unknown".
const CHINESE_ZODIAC_CYCLE = [
  "Rat",
  "Ox",
  "Tiger",
  "Rabbit",
  "Dragon",
  "Snake",
  "Horse",
  "Goat",
  "Monkey",
  "Rooster",
  "Dog",
  "Pig",
];

export function calculateAge(birthDate) {
  const now = new Date();
  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  let days = now.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

export function calculateTotalTime(birthDate) {
  const now = new Date();
  const diffMs = now - birthDate;

  return {
    totalDays: Math.floor(diffMs / (1000 * 60 * 60 * 24)),
    totalWeeks: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7)),
    totalMonths: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44)),
    totalHours: Math.floor(diffMs / (1000 * 60 * 60)),
    totalMinutes: Math.floor(diffMs / (1000 * 60)),
    totalSeconds: Math.floor(diffMs / 1000),
  };
}

export function calculateLifeStats(birthDate) {
  const now = new Date();
  const diffMs = now - birthDate;
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return {
    heartbeats: totalDays * 24 * 60 * 72,
    breaths: totalDays * 24 * 60 * 16,
    sleepHours: Math.floor(totalDays * 8),
    sleepDays: Math.floor((totalDays * 8) / 24),
  };
}

export function calculateNextBirthday(birthDate) {
  const now = new Date();
  // Compare calendar dates (not exact instants) so that on the birthday
  // itself - when thisYearBirthday's midnight is technically earlier than
  // "now" for the rest of the day - the birthday isn't wrongly rolled to
  // next year. This mirrors calculatePreviousBirthday's date-based logic.
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisYearBirthday = new Date(
    now.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );

  const nextBirthday =
    thisYearBirthday < todayMidnight
      ? new Date(now.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate())
      : thisYearBirthday;

  // When today is the birthday, nextBirthday is today's midnight, which is
  // already in the past relative to "now" - clamp so the countdown reads
  // 0d 0h 0m 0s instead of a negative duration.
  const diff = Math.max(0, nextBirthday - now);

  return {
    date: nextBirthday,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function calculatePreviousBirthday(birthDate) {
  const now = new Date();
  const thisYearBirthday = new Date(
    now.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );

  const previousBirthday =
    thisYearBirthday > now
      ? new Date(now.getFullYear() - 1, birthDate.getMonth(), birthDate.getDate())
      : thisYearBirthday;

  const diff = now - previousBirthday;

  return {
    date: previousBirthday,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function getWeekday(birthDate) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[birthDate.getDay()];
}

export function getWesternZodiac(birthDate) {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  const mmdd = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  for (const z of westernZodiac) {
    if (
      (z.start <= z.end && mmdd >= z.start && mmdd <= z.end) ||
      (z.start > z.end && (mmdd >= z.start || mmdd <= z.end))
    ) {
      return z;
    }
  }
  return westernZodiac[0];
}

export function getChineseZodiac(year) {
  const matched = chineseZodiac.find((z) => z.years.includes(year));
  if (matched) return matched.animal;
  // Fall back to the 12-year cycle for any year outside the table's
  // explicit 1924-2043 range (e.g. 1900-1923, which validateBirthDate
  // otherwise accepts) instead of reporting "Unknown".
  const index = (((year - 1924) % 12) + 12) % 12;
  return CHINESE_ZODIAC_CYCLE[index];
}

export function getBirthstone(month) {
  return birthstones[month] || birthstones[1];
}

export function getBirthFlower(month) {
  return birthFlowers[month] || birthFlowers[1];
}

export function getSeason(month) {
  for (const [name, data] of Object.entries(seasons)) {
    if (data.months.includes(month)) {
      return { name, emoji: data.emoji };
    }
  }
  return { name: "Unknown", emoji: "Unknown" };
}

export function getGeneration(year) {
  if (year >= 2026) return { name: "Generation Beta", range: "2026-2039" };
  if (year >= 2013) return { name: "Generation Alpha", range: "2013-2025" };
  if (year >= 1997) return { name: "Generation Z", range: "1997-2012" };
  if (year >= 1981) return { name: "Millennials", range: "1981-1996" };
  if (year >= 1965) return { name: "Generation X", range: "1965-1980" };
  if (year >= 1946) return { name: "Baby Boomers", range: "1946-1964" };
  if (year >= 1928) return { name: "Silent Generation", range: "1928-1945" };
  // validateBirthDate accepts any year back to 1900, so the fallback band
  // must actually contain every year it can be shown for.
  return { name: "Greatest Generation", range: "1900-1927" };
}

export function getLuckyNumbers(month) {
  return luckyNumbers[month] || [1, 2, 3, 4, 5, 6];
}

export function getLuckyColors(zodiacSign) {
  return luckyColors[zodiacSign] || ["Blue", "Green", "Gold"];
}

export function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// The native <input type="date"> gives back a bare "YYYY-MM-DD" string.
// `new Date("YYYY-MM-DD")` parses that as UTC midnight, but every insight
// calculation in this file reads the date back with local-time getters
// (getFullYear/getMonth/getDate/getDay). For anyone in a negative UTC-offset
// timezone (all of the Americas), that mismatch silently shifts the
// effective calendar date back by one day. Parsing the components directly
// into local time keeps the date the user actually picked.
export function parseBirthDateLocal(dateString) {
  if (!dateString) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) return new Date(dateString);
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function validateBirthDate(dateString) {
  if (!dateString) return "Please select your date of birth.";

  const date = parseBirthDateLocal(dateString);
  const today = new Date();

  if (!date || isNaN(date.getTime())) return "Invalid date entered.";
  if (date >= today) return "Date of birth must be in the past.";
  if (date.getFullYear() < 1900) return "Please enter a valid year after 1900.";

  return "";
}

export function calculateAllInsights(birthDate) {
  const month = birthDate.getMonth() + 1;
  const year = birthDate.getFullYear();
  const zodiac = getWesternZodiac(birthDate);

  return {
    westernZodiac: zodiac,
    chineseZodiac: getChineseZodiac(year),
    birthstone: getBirthstone(month),
    birthFlower: getBirthFlower(month),
    element: zodiac.element,
    season: getSeason(month - 1),
    generation: getGeneration(year),
    luckyNumbers: getLuckyNumbers(month),
    luckyColors: getLuckyColors(zodiac.sign),
  };
}
