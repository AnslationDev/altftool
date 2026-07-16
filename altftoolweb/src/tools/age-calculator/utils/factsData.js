// Static lookup tables + resolvers for the "Fun Facts About Your Birth Date"
// section. Pure functions — no dependency on the current date.

const ZODIAC = [
  { sign: "Capricorn", from: [12, 22], to: [1, 19], color: "Blue" },
  { sign: "Aquarius", from: [1, 20], to: [2, 18], color: "Turquoise" },
  { sign: "Pisces", from: [2, 19], to: [3, 20], color: "Sea Green" },
  { sign: "Aries", from: [3, 21], to: [4, 19], color: "Red" },
  { sign: "Taurus", from: [4, 20], to: [5, 20], color: "Green" },
  { sign: "Gemini", from: [5, 21], to: [6, 20], color: "Yellow" },
  { sign: "Cancer", from: [6, 21], to: [7, 22], color: "Silver" },
  { sign: "Leo", from: [7, 23], to: [8, 22], color: "Gold" },
  { sign: "Virgo", from: [8, 23], to: [9, 22], color: "Navy" },
  { sign: "Libra", from: [9, 23], to: [10, 22], color: "Pink" },
  { sign: "Scorpio", from: [10, 23], to: [11, 21], color: "Maroon" },
  { sign: "Sagittarius", from: [11, 22], to: [12, 21], color: "Purple" },
];

const CHINESE = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];

const BIRTHSTONES = ["Garnet", "Amethyst", "Aquamarine", "Diamond", "Emerald", "Pearl", "Ruby", "Peridot", "Sapphire", "Opal", "Topaz", "Turquoise"];

const BIRTH_FLOWERS = ["Carnation", "Violet", "Daffodil", "Daisy", "Lily of the Valley", "Rose", "Larkspur", "Gladiolus", "Aster", "Marigold", "Chrysanthemum", "Narcissus"];

const GENERATIONS = [
  { name: "The Greatest Generation", from: 1901, to: 1927 },
  { name: "Silent Generation", from: 1928, to: 1945 },
  { name: "Baby Boomer", from: 1946, to: 1964 },
  { name: "Gen X", from: 1965, to: 1980 },
  { name: "Millennial", from: 1981, to: 1996 },
  { name: "Gen Z", from: 1997, to: 2012 },
  { name: "Gen Alpha", from: 2013, to: 2024 },
  { name: "Gen Beta", from: 2025, to: 2039 },
];

export function getZodiac(month, day) {
  // month is 1-based here
  const match = ZODIAC.find((z) => {
    const [fm, fd] = z.from;
    const [tm, td] = z.to;
    if (fm === month && day >= fd) return true;
    if (tm === month && day <= td) return true;
    return false;
  });
  return match || ZODIAC[0];
}

export function getChineseZodiac(year) {
  // 1900 was the year of the Rat; align the 12-year cycle to it.
  const index = ((year - 1900) % 12 + 12) % 12;
  return CHINESE[index];
}

export function getGeneration(year) {
  const match = GENERATIONS.find((g) => year >= g.from && year <= g.to);
  return match ? match.name : year < 1901 ? "Historic" : "Future Generation";
}

export function getBirthstone(month) {
  return BIRTHSTONES[month - 1] || "—";
}

export function getBirthFlower(month) {
  return BIRTH_FLOWERS[month - 1] || "—";
}

/**
 * Everything the Fun Facts grid needs, from a birth Date.
 * @param {Date} birth
 */
export function getBirthFacts(birth) {
  const month = birth.getMonth() + 1;
  const day = birth.getDate();
  const year = birth.getFullYear();
  const zodiac = getZodiac(month, day);
  return {
    zodiacSign: zodiac.sign,
    luckyColor: zodiac.color,
    chineseZodiac: getChineseZodiac(year),
    generation: getGeneration(year),
    birthstone: getBirthstone(month),
    birthFlower: getBirthFlower(month),
  };
}
