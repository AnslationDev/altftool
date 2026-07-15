import {
  westernZodiac,
  chineseZodiac,
  birthstones,
  birthFlowers,
  seasons,
  generationNames,
  luckyNumbers,
  luckyColors,
} from "../constants/data";

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
  const thisYearBirthday = new Date(
    now.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );

  const nextBirthday =
    thisYearBirthday < now
      ? new Date(now.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate())
      : thisYearBirthday;

  const diff = nextBirthday - now;

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
  return matched ? matched.animal : "Unknown";
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
  return { name: "Silent Generation", range: "1928-1945" };
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

export function formatDateShort(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function validateBirthDate(dateString) {
  if (!dateString) return "Please select your date of birth.";

  const date = new Date(dateString);
  const today = new Date();

  if (isNaN(date.getTime())) return "Invalid date entered.";
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
