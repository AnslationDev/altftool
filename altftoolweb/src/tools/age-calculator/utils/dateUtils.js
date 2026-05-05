// utils/dateUtils.js


export const formatDate = (date) => {
  if (!date) return "";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Calculate exact age (years, months, days)
export const calculateExactAge = (birth) => {
  const now = new Date();

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

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
};

// Calculate total minutes & seconds lived
export const calculateTotalTime = (birth) => {
  const now = new Date();
  const diffMs = now - birth;

  return {
    minutes: Math.floor(diffMs / (1000 * 60)),
    seconds: Math.floor(diffMs / 1000),
  };
};

// Calculate next birthday countdown
export const calculateNextBirthday = (birth) => {
  const now = new Date();

  const thisYearBirthday = new Date(
    now.getFullYear(),
    birth.getMonth(),
    birth.getDate()
  );

  const nextBirthday =
    thisYearBirthday < now
      ? new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate())
      : thisYearBirthday;

  const diff = nextBirthday - now;

  return {
    date: nextBirthday,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};


// Combine all calculations (single source of truth)
export const calculateAgeData = (birth) => {
  const age = calculateExactAge(birth);
  const totalTime = calculateTotalTime(birth);
  const nextBirthday = calculateNextBirthday(birth);

  return {
    age,
    totalMinutes: totalTime.minutes,
    totalSeconds: totalTime.seconds,
    nextBirthday,
  };
};
