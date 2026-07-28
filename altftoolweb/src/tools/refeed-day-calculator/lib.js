/**
 * Refeed day calculator — pure calculation module.
 * No React, no DOM, no Date.now().
 */

/** Atwater general factors: kcal per gram of each macronutrient. */
export const KCAL_PER_G_PROTEIN = 4;
export const KCAL_PER_G_CARB = 4;
export const KCAL_PER_G_FAT = 9;

/** Energy density of body tissue used for the weekly-change estimate. */
export const KCAL_PER_KG = 7700;

/** Mifflin-St Jeor activity multipliers. */
export const ACTIVITY_LEVELS = [
  { key: "sedentary", label: "Sedentary — desk job, little exercise", multiplier: 1.2 },
  { key: "light", label: "Lightly active — 1-3 sessions a week", multiplier: 1.375 },
  { key: "moderate", label: "Moderately active — 3-5 sessions a week", multiplier: 1.55 },
  { key: "active", label: "Very active — 6-7 sessions a week", multiplier: 1.725 },
  { key: "athlete", label: "Extra active — physical job or two-a-days", multiplier: 1.9 },
];

/**
 * Refeed intensity presets. A refeed is a planned day at or slightly above
 * maintenance, driven by carbohydrate — distinct from an unstructured cheat
 * day, which has no calorie ceiling.
 */
export const REFEED_LEVELS = [
  { key: "maintenance", label: "At maintenance (100%)", factor: 1.0 },
  { key: "plus10", label: "Maintenance +10%", factor: 1.1 },
  { key: "plus20", label: "Maintenance +20%", factor: 1.2 },
];

/**
 * Protein is held constant on a refeed day. The ISSN position stand puts
 * 1.4-2.0 g/kg/day as the useful range for resistance-trained people, with
 * higher intakes favoured while dieting.
 */
export const PROTEIN_MIN_G_PER_KG = 1.4;
export const PROTEIN_MAX_G_PER_KG = 2.6;

/**
 * Fat is dropped to a floor so the extra calories arrive as carbohydrate.
 * ~0.5 g/kg/day is the commonly used practical minimum that still covers
 * essential fatty acid and fat-soluble vitamin needs.
 */
export const FAT_FLOOR_G_PER_KG = 0.5;
export const FAT_MAX_G_PER_KG = 1.5;

/**
 * Whole-body glycogen storage capacity is roughly 15 g per kg of body weight
 * (about 400-500 g muscle plus ~100 g liver in an average adult).
 */
export const GLYCOGEN_CAPACITY_G_PER_KG = 15;

/** Each gram of stored glycogen holds roughly 3 g of water. */
export const WATER_PER_G_GLYCOGEN = 3;

/**
 * Practical refeed frequency guidance by body-fat percentage. This is a widely
 * used training-community heuristic, not a clinical standard: leaner dieters
 * carry less stored fuel and tend to need refeeds more often.
 */
export const REFEED_FREQUENCY_GUIDE = {
  male: [
    { maxBodyFat: 10, advice: "About twice a week — at this leanness the deficit is hardest to sustain." },
    { maxBodyFat: 15, advice: "About once a week." },
    { maxBodyFat: 20, advice: "Roughly once every 10-14 days." },
    { maxBodyFat: Infinity, advice: "Rarely needed — once every two weeks at most while body fat is above 20%." },
  ],
  female: [
    { maxBodyFat: 18, advice: "About twice a week — at this leanness the deficit is hardest to sustain." },
    { maxBodyFat: 24, advice: "About once a week." },
    { maxBodyFat: 30, advice: "Roughly once every 10-14 days." },
    { maxBodyFat: Infinity, advice: "Rarely needed — once every two weeks at most while body fat is above 30%." },
  ],
};

const DAYS_PER_WEEK = 7;

const round = (value, places = 1) => {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

export function mifflinStJeorBmr({ sex, weightKg, heightCm, age }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "female" ? base - 161 : base + 5;
}

export function activityMultiplier(key) {
  const level = ACTIVITY_LEVELS.find((l) => l.key === key);
  return level ? level.multiplier : ACTIVITY_LEVELS[2].multiplier;
}

export function refeedFactor(key) {
  const level = REFEED_LEVELS.find((l) => l.key === key);
  return level ? level.factor : 1;
}

export function refeedFrequencyAdvice(sex, bodyFatPercent) {
  if (!Number.isFinite(bodyFatPercent) || bodyFatPercent <= 0) return null;
  const table = REFEED_FREQUENCY_GUIDE[sex === "female" ? "female" : "male"];
  const row = table.find((r) => bodyFatPercent < r.maxBodyFat);
  return row ? row.advice : table[table.length - 1].advice;
}

/**
 * Split a calorie target into macros with protein and fat fixed and
 * carbohydrate taking the remainder.
 */
export function macroSplit({ kcal, weightKg, proteinGPerKg, fatGPerKg }) {
  const proteinG = weightKg * proteinGPerKg;
  const fatG = weightKg * fatGPerKg;
  const proteinKcal = proteinG * KCAL_PER_G_PROTEIN;
  const fatKcal = fatG * KCAL_PER_G_FAT;
  const carbKcal = kcal - proteinKcal - fatKcal;
  return {
    proteinG: round(proteinG),
    fatG: round(fatG),
    proteinKcal: round(proteinKcal),
    fatKcal: round(fatKcal),
    carbKcal: round(carbKcal),
    carbG: round(carbKcal / KCAL_PER_G_CARB),
    carbGPerKg: weightKg > 0 ? round(carbKcal / KCAL_PER_G_CARB / weightKg, 2) : 0,
    fitsBudget: carbKcal >= 0,
  };
}

/**
 * Full refeed plan.
 * @returns {object} plan, or { error } when the inputs cannot produce one.
 */
export function planRefeedDay(input) {
  const {
    sex = "male",
    age,
    heightCm,
    weightKg,
    activityKey = "moderate",
    dietDayKcal,
    refeedKey = "maintenance",
    refeedDaysPerWeek = 1,
    proteinGPerKg = 2,
    fatGPerKg = 0.6,
    bodyFatPercent = 0,
  } = input || {};

  const required = { age, heightCm, weightKg, dietDayKcal, proteinGPerKg, fatGPerKg, refeedDaysPerWeek };
  for (const [name, value] of Object.entries(required)) {
    if (!Number.isFinite(Number(value))) return { error: `Enter a valid number for ${name}.` };
  }

  const a = Number(age);
  const h = Number(heightCm);
  const w = Number(weightKg);
  const diet = Number(dietDayKcal);
  const protPerKg = Number(proteinGPerKg);
  const fatPerKg = Number(fatGPerKg);
  const refeedDays = Number(refeedDaysPerWeek);
  const bodyFat = Number(bodyFatPercent);

  if (a < 15 || a > 100) return { error: "Age must be between 15 and 100 for the Mifflin-St Jeor equation." };
  if (h < 100 || h > 250) return { error: "Height must be between 100 cm and 250 cm." };
  if (w < 30 || w > 400) return { error: "Body weight must be between 30 kg and 400 kg." };
  if (diet < 800 || diet > 6000) return { error: "Diet-day calories must be between 800 and 6,000 kcal." };
  if (protPerKg < 0.5 || protPerKg > 4) return { error: "Protein must be between 0.5 and 4 g per kg of body weight." };
  if (fatPerKg < 0.2 || fatPerKg > 3) return { error: "Fat must be between 0.2 and 3 g per kg of body weight." };
  if (!Number.isInteger(refeedDays) || refeedDays < 1 || refeedDays > 3) {
    return { error: "Choose 1, 2 or 3 refeed days per week." };
  }
  if (bodyFat < 0 || bodyFat > 70) return { error: "Body fat percentage must be between 0 and 70." };

  const normalisedSex = sex === "female" ? "female" : "male";
  const bmr = mifflinStJeorBmr({ sex: normalisedSex, weightKg: w, heightCm: h, age: a });
  const maintenance = bmr * activityMultiplier(activityKey);
  const factor = refeedFactor(refeedKey);
  const refeedKcal = maintenance * factor;

  if (diet >= maintenance) {
    return {
      error: `Your diet-day intake of ${Math.round(diet)} kcal is already at or above maintenance (${Math.round(maintenance)} kcal). A refeed only makes sense from inside a deficit.`,
    };
  }

  const refeedMacros = macroSplit({ kcal: refeedKcal, weightKg: w, proteinGPerKg: protPerKg, fatGPerKg: fatPerKg });
  const dietMacros = macroSplit({ kcal: diet, weightKg: w, proteinGPerKg: protPerKg, fatGPerKg: fatPerKg });

  if (!dietMacros.fitsBudget) {
    return {
      error: `Protein and fat alone come to ${Math.round(dietMacros.proteinKcal + dietMacros.fatKcal)} kcal, more than your ${Math.round(diet)} kcal diet day. Lower the protein or fat target.`,
    };
  }
  if (!refeedMacros.fitsBudget) {
    return {
      error: `Protein and fat alone exceed the ${Math.round(refeedKcal)} kcal refeed target. Lower the protein or fat target.`,
    };
  }

  const extraKcal = refeedKcal - diet;
  const extraCarbG = refeedMacros.carbG - dietMacros.carbG;

  // Upper-bound temporary scale rise: assume every extra gram of carbohydrate
  // is stored as glycogen (capped by storage capacity) and each gram of
  // glycogen holds ~3 g of water.
  const glycogenCapacityG = GLYCOGEN_CAPACITY_G_PER_KG * w;
  const storedG = Math.max(0, Math.min(extraCarbG, glycogenCapacityG));
  const waterWeightKg = round((storedG * (1 + WATER_PER_G_GLYCOGEN)) / 1000, 2);

  const dietDays = DAYS_PER_WEEK - refeedDays;
  const weeklyMaintenance = maintenance * DAYS_PER_WEEK;
  const weeklyWithRefeed = dietDays * diet + refeedDays * refeedKcal;
  const weeklyWithoutRefeed = DAYS_PER_WEEK * diet;
  const deficitWithRefeed = weeklyMaintenance - weeklyWithRefeed;
  const deficitWithoutRefeed = weeklyMaintenance - weeklyWithoutRefeed;

  const notes = [];
  if (protPerKg < PROTEIN_MIN_G_PER_KG) {
    notes.push(
      `Protein at ${protPerKg} g/kg is below the ${PROTEIN_MIN_G_PER_KG} g/kg lower end of the ISSN range — protein matters more, not less, while dieting.`,
    );
  }
  if (protPerKg > PROTEIN_MAX_G_PER_KG) {
    notes.push(`Protein above ${PROTEIN_MAX_G_PER_KG} g/kg leaves less room for the carbohydrate that a refeed is built around.`);
  }
  if (fatPerKg < FAT_FLOOR_G_PER_KG) {
    notes.push(`Fat below ${FAT_FLOOR_G_PER_KG} g/kg on a regular basis risks essential fatty acid and fat-soluble vitamin intake.`);
  }
  if (deficitWithRefeed <= 0) {
    notes.push("With this refeed pattern the week is no longer in a deficit — fat loss would stall.");
  }
  const frequency = refeedFrequencyAdvice(normalisedSex, bodyFat);
  if (frequency) notes.push(`Typical frequency at ${bodyFat}% body fat: ${frequency}`);

  return {
    bmr: round(bmr, 0),
    maintenance: round(maintenance, 0),
    refeedKcal: round(refeedKcal, 0),
    refeedFactorPercent: round(factor * 100, 0),
    dietDayKcal: round(diet, 0),
    extraKcal: round(extraKcal, 0),
    refeed: refeedMacros,
    dietDay: dietMacros,
    extraCarbG: round(extraCarbG),
    glycogenCapacityG: round(glycogenCapacityG, 0),
    waterWeightKg,
    weekly: {
      dietDays,
      refeedDays,
      maintenance: round(weeklyMaintenance, 0),
      withRefeed: round(weeklyWithRefeed, 0),
      withoutRefeed: round(weeklyWithoutRefeed, 0),
      deficitWithRefeed: round(deficitWithRefeed, 0),
      deficitWithoutRefeed: round(deficitWithoutRefeed, 0),
      changeWithRefeedKg: round(-deficitWithRefeed / KCAL_PER_KG, 3),
      changeWithoutRefeedKg: round(-deficitWithoutRefeed / KCAL_PER_KG, 3),
      costKg: round(deficitWithoutRefeed / KCAL_PER_KG - deficitWithRefeed / KCAL_PER_KG, 3),
    },
    frequency,
    notes,
  };
}
