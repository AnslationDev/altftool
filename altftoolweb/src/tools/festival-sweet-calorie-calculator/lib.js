/**
 * Indian festival sweet (mithai) calorie and added-sugar reference.
 *
 * Values are for a TYPICAL sweet-shop piece. Mithai is made to no fixed recipe,
 * so ghee content, syrup soak time and piece size all move the number; treat
 * every total as an estimate with a plus or minus 20% band.
 *
 * The sugar figures are free sugars: sugar and jaggery added during cooking plus
 * the syrup a piece is soaked in. WHO free-sugar guidance (Guideline: Sugars
 * intake for adults and children, 2015) is to keep free sugars below 10% of
 * total energy, and below 5% for further benefit. At 4 kcal per gram of sugar
 * that is 50 g and 25 g per day on a 2,000 kcal diet.
 */

export const KCAL_PER_G_SUGAR = 4;

/** One level teaspoon of granulated sugar weighs about 4 grams. */
export const TEASPOON_SUGAR_GRAMS = 4;

/** WHO free-sugar ceilings, as a fraction of total daily energy. */
export const WHO_SUGAR_LIMIT_STRONG = 0.1;
export const WHO_SUGAR_LIMIT_CONDITIONAL = 0.05;

/** Uncertainty band applied to every total. */
export const ESTIMATE_BAND = 0.2;

export const DEFAULT_DAILY_KCAL = 2000;
export const MIN_DAILY_KCAL = 800;
export const MAX_DAILY_KCAL = 6000;
export const MAX_PIECES = 30;

/**
 * id, name, group, piece description, weight in grams, energy, free sugar and fat.
 */
export const FESTIVAL_SWEETS = [
  { id: "besan-laddoo", name: "Besan laddoo", group: "Laddoo", piece: "1 laddoo", grams: 40, kcal: 185, sugar: 18, fat: 10 },
  { id: "motichoor-laddoo", name: "Motichoor laddoo", group: "Laddoo", piece: "1 laddoo", grams: 45, kcal: 195, sugar: 22, fat: 10 },
  { id: "boondi-laddoo", name: "Boondi laddoo", group: "Laddoo", piece: "1 laddoo", grams: 40, kcal: 175, sugar: 20, fat: 8 },
  { id: "rava-laddoo", name: "Rava laddoo", group: "Laddoo", piece: "1 laddoo", grams: 35, kcal: 150, sugar: 15, fat: 7 },
  { id: "coconut-laddoo", name: "Coconut laddoo", group: "Laddoo", piece: "1 laddoo", grams: 30, kcal: 130, sugar: 13, fat: 7 },
  { id: "til-laddoo", name: "Til laddoo", group: "Laddoo", piece: "1 laddoo", grams: 25, kcal: 115, sugar: 11, fat: 6 },
  { id: "dry-fruit-laddoo", name: "Dry fruit laddoo", group: "Laddoo", piece: "1 laddoo", grams: 35, kcal: 155, sugar: 12, fat: 9 },

  { id: "kaju-katli", name: "Kaju katli", group: "Barfi and katli", piece: "1 slice", grams: 15, kcal: 65, sugar: 7, fat: 3 },
  { id: "kaju-roll", name: "Kaju roll", group: "Barfi and katli", piece: "1 roll", grams: 20, kcal: 85, sugar: 9, fat: 4 },
  { id: "besan-barfi", name: "Besan barfi", group: "Barfi and katli", piece: "1 piece", grams: 30, kcal: 145, sugar: 14, fat: 8 },
  { id: "khoya-barfi", name: "Milk / khoya barfi", group: "Barfi and katli", piece: "1 piece", grams: 30, kcal: 125, sugar: 12, fat: 6 },
  { id: "pista-barfi", name: "Pista barfi", group: "Barfi and katli", piece: "1 piece", grams: 25, kcal: 110, sugar: 10, fat: 6 },
  { id: "anjeer-barfi", name: "Anjeer barfi", group: "Barfi and katli", piece: "1 piece", grams: 25, kcal: 95, sugar: 12, fat: 4 },
  { id: "kalakand", name: "Kalakand", group: "Barfi and katli", piece: "1 piece", grams: 35, kcal: 135, sugar: 12, fat: 7 },
  { id: "mysore-pak", name: "Mysore pak", group: "Barfi and katli", piece: "1 piece", grams: 30, kcal: 175, sugar: 14, fat: 12 },
  { id: "soan-papdi", name: "Soan papdi", group: "Barfi and katli", piece: "1 cube", grams: 25, kcal: 120, sugar: 13, fat: 6 },

  { id: "gulab-jamun", name: "Gulab jamun", group: "Syrup sweets", piece: "1 piece with syrup", grams: 40, kcal: 150, sugar: 20, fat: 6 },
  { id: "rasgulla", name: "Rasgulla", group: "Syrup sweets", piece: "1 piece with syrup", grams: 50, kcal: 106, sugar: 20, fat: 1 },
  { id: "rasmalai", name: "Rasmalai", group: "Syrup sweets", piece: "1 piece with rabri", grams: 60, kcal: 185, sugar: 18, fat: 9 },
  { id: "jalebi", name: "Jalebi", group: "Syrup sweets", piece: "1 coil", grams: 25, kcal: 100, sugar: 17, fat: 3 },
  { id: "imarti", name: "Imarti", group: "Syrup sweets", piece: "1 piece", grams: 30, kcal: 120, sugar: 19, fat: 4 },
  { id: "balushahi", name: "Balushahi", group: "Syrup sweets", piece: "1 piece", grams: 40, kcal: 180, sugar: 16, fat: 10 },
  { id: "malpua", name: "Malpua", group: "Syrup sweets", piece: "1 piece", grams: 50, kcal: 200, sugar: 20, fat: 9 },
  { id: "ghevar", name: "Ghevar", group: "Syrup sweets", piece: "1 piece", grams: 60, kcal: 280, sugar: 25, fat: 15 },
  { id: "petha", name: "Petha", group: "Syrup sweets", piece: "1 piece", grams: 40, kcal: 110, sugar: 26, fat: 0 },

  { id: "gajar-halwa", name: "Gajar halwa", group: "Halwa and katori", piece: "1 katori (100 g)", grams: 100, kcal: 250, sugar: 22, fat: 14 },
  { id: "sooji-halwa", name: "Sooji halwa", group: "Halwa and katori", piece: "1 katori (100 g)", grams: 100, kcal: 300, sugar: 22, fat: 16 },
  { id: "moong-dal-halwa", name: "Moong dal halwa", group: "Halwa and katori", piece: "1 katori (100 g)", grams: 100, kcal: 350, sugar: 25, fat: 22 },
  { id: "kheer", name: "Kheer / payasam", group: "Halwa and katori", piece: "1 katori (150 g)", grams: 150, kcal: 250, sugar: 25, fat: 9 },
  { id: "shrikhand", name: "Shrikhand", group: "Halwa and katori", piece: "1 katori (100 g)", grams: 100, kcal: 240, sugar: 25, fat: 10 },

  { id: "peda", name: "Peda", group: "Milk sweets", piece: "1 piece", grams: 25, kcal: 100, sugar: 10, fat: 5 },
  { id: "sandesh", name: "Sandesh", group: "Milk sweets", piece: "1 piece", grams: 35, kcal: 105, sugar: 9, fat: 4 },
  { id: "steamed-modak", name: "Steamed modak", group: "Milk sweets", piece: "1 modak", grams: 40, kcal: 110, sugar: 10, fat: 4 },
  { id: "fried-modak", name: "Fried modak", group: "Milk sweets", piece: "1 modak", grams: 40, kcal: 165, sugar: 11, fat: 9 },
  { id: "chikki", name: "Peanut chikki", group: "Milk sweets", piece: "1 piece", grams: 25, kcal: 120, sugar: 13, fat: 6 },
];

const toFinite = (value) => {
  const num = typeof value === "number" ? value : Number(String(value ?? "").trim());
  return Number.isFinite(num) ? num : NaN;
};

/** Look up one sweet by id. */
export function findSweet(id) {
  return FESTIVAL_SWEETS.find((sweet) => sweet.id === id);
}

/** Distinct group names in list order. */
export function sweetGroups() {
  const seen = [];
  FESTIVAL_SWEETS.forEach((sweet) => {
    if (!seen.includes(sweet.group)) seen.push(sweet.group);
  });
  return seen;
}

/** Free-sugar ceilings in grams for a given daily energy intake. */
export function sugarLimits(dailyKcal) {
  return {
    strongGrams: (dailyKcal * WHO_SUGAR_LIMIT_STRONG) / KCAL_PER_G_SUGAR,
    conditionalGrams: (dailyKcal * WHO_SUGAR_LIMIT_CONDITIONAL) / KCAL_PER_G_SUGAR,
  };
}

/**
 * Total a selection of sweets and compare the sugar against WHO guidance.
 *
 * @param {object} input
 * @param {Array<{id: string, pieces: number|string}>} input.selections chosen sweets
 * @param {number|string} input.dailyKcal daily energy intake
 * @returns {object} totals, or { error } when the input is unusable
 */
export function summariseSweets({ selections = [], dailyKcal }) {
  const daily = toFinite(dailyKcal);

  if (Number.isNaN(daily)) {
    return { error: "Enter a number for your daily calorie intake." };
  }
  if (daily < MIN_DAILY_KCAL || daily > MAX_DAILY_KCAL) {
    return { error: `Daily calorie intake must be between ${MIN_DAILY_KCAL} and ${MAX_DAILY_KCAL} kcal.` };
  }
  if (!Array.isArray(selections)) {
    return { error: "Could not read the selected sweets." };
  }

  const lines = [];
  let kcal = 0;
  let sugar = 0;
  let fat = 0;
  let grams = 0;
  let pieces = 0;

  for (const selection of selections) {
    const count = toFinite(selection?.pieces);
    if (Number.isNaN(count)) return { error: "Piece counts must be numbers." };
    if (count < 0 || count > MAX_PIECES) {
      return { error: `Piece count for each sweet must be between 0 and ${MAX_PIECES}.` };
    }
    if (count === 0) continue;
    const sweet = findSweet(selection?.id);
    if (!sweet) return { error: "One of the selected sweets is not in the list." };
    const line = {
      id: sweet.id,
      name: sweet.name,
      piece: sweet.piece,
      pieces: count,
      kcal: sweet.kcal * count,
      sugar: sweet.sugar * count,
      fat: sweet.fat * count,
      grams: sweet.grams * count,
      teaspoons: (sweet.sugar * count) / TEASPOON_SUGAR_GRAMS,
    };
    lines.push(line);
    kcal += line.kcal;
    sugar += line.sugar;
    fat += line.fat;
    grams += line.grams;
    pieces += count;
  }

  const limits = sugarLimits(daily);
  const sugarKcal = sugar * KCAL_PER_G_SUGAR;

  return {
    empty: lines.length === 0,
    lines,
    pieces,
    kcal,
    kcalLow: kcal * (1 - ESTIMATE_BAND),
    kcalHigh: kcal * (1 + ESTIMATE_BAND),
    sugar,
    sugarTeaspoons: sugar / TEASPOON_SUGAR_GRAMS,
    sugarKcal,
    sugarShareOfSweetPct: kcal > 0 ? (sugarKcal / kcal) * 100 : 0,
    fat,
    grams,
    dailyKcal: daily,
    shareOfDayPct: (kcal / daily) * 100,
    limitStrongGrams: limits.strongGrams,
    limitConditionalGrams: limits.conditionalGrams,
    pctOfStrongLimit: (sugar / limits.strongGrams) * 100,
    pctOfConditionalLimit: (sugar / limits.conditionalGrams) * 100,
    overStrongLimit: sugar > limits.strongGrams,
    overConditionalLimit: sugar > limits.conditionalGrams,
  };
}
