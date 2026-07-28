/**
 * Water weight fluctuation explainer — pure calculation module.
 * No React, no DOM, no Date.now().
 *
 * Every coefficient below is either derived from a physical constant or is a
 * typical reported magnitude from the literature; each is commented with its
 * source reasoning so the output can be checked rather than trusted.
 */

/** Molar mass of sodium, g/mol. */
export const SODIUM_MOLAR_MASS = 22.98977;

/** Extracellular fluid is held near 140 mmol of sodium per litre. */
export const ECF_SODIUM_MMOL_PER_L = 140;

/**
 * Water that must accompany one gram of retained sodium to keep extracellular
 * fluid isotonic: (1000 / 22.98977) mmol / 140 mmol per L = 0.311 L.
 */
export const WATER_L_PER_G_SODIUM = 1000 / SODIUM_MOLAR_MASS / ECF_SODIUM_MMOL_PER_L;

/** Table salt is 39.34% sodium by mass (NaCl, 22.99 / 58.44). */
export const SODIUM_FRACTION_OF_SALT = SODIUM_MOLAR_MASS / 58.44;

/** WHO recommends under 2,000 mg of sodium a day for adults. */
export const WHO_SODIUM_LIMIT_MG = 2000;

/** Each gram of stored glycogen holds roughly 3 g of water. */
export const WATER_PER_G_GLYCOGEN = 3;

/** Whole-body glycogen capacity is roughly 15 g per kg of body weight. */
export const GLYCOGEN_CAPACITY_G_PER_KG = 15;

/**
 * Ethanol suppresses vasopressin; the classic figure is about 10 mL of extra
 * urine output per gram of ethanol consumed.
 */
export const DIURESIS_ML_PER_G_ETHANOL = 10;

/** Grams of ethanol in one standard drink. */
export const ETHANOL_G_PER_DRINK = { us: 14, uk: 8 };

/**
 * Typical reported magnitudes (kg) for the non-nutritional drivers. These are
 * representative figures from the exercise-physiology and cycle literature, not
 * precise predictions — the tool presents them as ranges in the notes.
 */
export const TRAINING_SWELLING_KG = 0.5; // unaccustomed or heavy resistance work
export const TRAVEL_OEDEMA_KG = 0.3; // long flight or a full day seated
export const CREATINE_LOADING_KG = 1.0; // 20 g/day loading phase, intracellular water
export const CREATINE_MAINTENANCE_KG = 0.4; // 3-5 g/day maintenance
export const GUT_CONTENT_KG = 0.5; // large food volume still in transit
export const DEHYDRATION_KG = 0.6; // sauna, heat, or a day of under-drinking

/** Menstrual cycle phases and their typical reported fluid shift, in kg. */
export const CYCLE_PHASES = [
  { key: "none", label: "Not applicable / not tracking", kg: 0 },
  { key: "menstrual", label: "Days 1-5 — bleeding (retention clearing)", kg: -0.3 },
  { key: "follicular", label: "Days 6-13 — follicular", kg: 0 },
  { key: "ovulation", label: "Around day 14 — ovulation", kg: 0.2 },
  { key: "midLuteal", label: "Days 15-22 — mid luteal", kg: 0.3 },
  { key: "lateLuteal", label: "Days 23-28 — late luteal / premenstrual", kg: 0.6 },
];

/** Energy in one kilogram of body fat, used for the fat-equivalent check. */
export const KCAL_PER_KG_FAT = 7700;

const round = (value, places = 2) => {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/** Convert grams of table salt to milligrams of sodium. */
export function saltGramsToSodiumMg(saltGrams) {
  const grams = Number(saltGrams);
  if (!Number.isFinite(grams) || grams < 0) return 0;
  return round(grams * 1000 * SODIUM_FRACTION_OF_SALT, 0);
}

export function cyclePhase(key) {
  return CYCLE_PHASES.find((phase) => phase.key === key) || CYCLE_PHASES[0];
}

/**
 * Estimate the water-weight component of an overnight scale change.
 *
 * @returns {object} breakdown, or { error } when the inputs are unusable.
 */
export function explainFluctuation(input) {
  const {
    bodyWeightKg,
    sodiumMg,
    usualSodiumMg,
    carbG,
    usualCarbG,
    drinks = 0,
    drinkStandard = "us",
    hardTraining = false,
    longTravel = false,
    creatine = "none",
    largeFoodVolume = false,
    underHydrated = false,
    cycleKey = "none",
    scaleChangeKg = null,
  } = input || {};

  const numeric = { bodyWeightKg, sodiumMg, usualSodiumMg, carbG, usualCarbG, drinks };
  for (const [name, value] of Object.entries(numeric)) {
    if (!Number.isFinite(Number(value))) return { error: `Enter a valid number for ${name}.` };
  }

  const weight = Number(bodyWeightKg);
  const sodium = Number(sodiumMg);
  const usualSodium = Number(usualSodiumMg);
  const carbs = Number(carbG);
  const usualCarbs = Number(usualCarbG);
  const drinkCount = Number(drinks);

  if (weight < 30 || weight > 400) return { error: "Body weight must be between 30 kg and 400 kg." };
  if (sodium < 0 || sodium > 20000) return { error: "Sodium must be between 0 and 20,000 mg." };
  if (usualSodium < 0 || usualSodium > 20000) return { error: "Usual sodium must be between 0 and 20,000 mg." };
  if (carbs < 0 || carbs > 1500) return { error: "Carbohydrate must be between 0 and 1,500 g." };
  if (usualCarbs < 0 || usualCarbs > 1500) return { error: "Usual carbohydrate must be between 0 and 1,500 g." };
  if (drinkCount < 0 || drinkCount > 30) return { error: "Alcoholic drinks must be between 0 and 30." };

  const drivers = [];

  // 1. Sodium. Extra sodium above your normal intake must be carried in
  // isotonic fluid until the kidneys clear it, usually over 1-2 days.
  const extraSodiumG = (sodium - usualSodium) / 1000;
  const sodiumKg = extraSodiumG * WATER_L_PER_G_SODIUM;
  if (Math.abs(sodiumKg) >= 0.01) {
    drivers.push({
      key: "sodium",
      label: "Sodium",
      kg: round(sodiumKg),
      detail: `${extraSodiumG >= 0 ? "+" : ""}${round(extraSodiumG * 1000, 0)} mg sodium vs usual, carried in ${round(Math.abs(sodiumKg), 2)} L of isotonic fluid.`,
      clearsIn: "1-2 days",
    });
  }

  // 2. Glycogen. Extra carbohydrate stored as glycogen brings ~3 g water per
  // gram, capped by total storage capacity.
  const glycogenCapacityG = GLYCOGEN_CAPACITY_G_PER_KG * weight;
  const extraCarbG = carbs - usualCarbs;
  const storedG = Math.max(-glycogenCapacityG, Math.min(extraCarbG, glycogenCapacityG));
  const glycogenKg = (storedG * (1 + WATER_PER_G_GLYCOGEN)) / 1000;
  if (Math.abs(glycogenKg) >= 0.01) {
    drivers.push({
      key: "glycogen",
      label: "Glycogen + bound water",
      kg: round(glycogenKg),
      detail: `${extraCarbG >= 0 ? "+" : ""}${round(extraCarbG, 0)} g carbohydrate vs usual, each gram stored with about ${WATER_PER_G_GLYCOGEN} g of water.`,
      clearsIn: "2-4 days",
    });
  }

  // 3. Alcohol. Ethanol blocks vasopressin, so the morning after usually shows
  // a net fluid loss rather than a gain.
  const ethanolG = drinkCount * (ETHANOL_G_PER_DRINK[drinkStandard] || ETHANOL_G_PER_DRINK.us);
  const alcoholKg = -(ethanolG * DIURESIS_ML_PER_G_ETHANOL) / 1000;
  if (Math.abs(alcoholKg) >= 0.01) {
    drivers.push({
      key: "alcohol",
      label: "Alcohol diuresis",
      kg: round(alcoholKg),
      detail: `${round(drinkCount, 1)} standard drink(s) = ${round(ethanolG, 0)} g ethanol, roughly ${DIURESIS_ML_PER_G_ETHANOL} mL of extra urine per gram.`,
      clearsIn: "Rebounds within 1-2 days",
    });
  }

  // 4-8. Typical reported magnitudes.
  if (hardTraining) {
    drivers.push({
      key: "training",
      label: "Training inflammation",
      kg: TRAINING_SWELLING_KG,
      detail: "Unaccustomed or heavy resistance work draws fluid into the worked muscle.",
      clearsIn: "3-5 days",
    });
  }
  if (longTravel) {
    drivers.push({
      key: "travel",
      label: "Travel / prolonged sitting",
      kg: TRAVEL_OEDEMA_KG,
      detail: "Dependent oedema from hours seated with low cabin pressure or no leg movement.",
      clearsIn: "1-2 days",
    });
  }
  if (creatine === "loading" || creatine === "maintenance") {
    const kg = creatine === "loading" ? CREATINE_LOADING_KG : CREATINE_MAINTENANCE_KG;
    drivers.push({
      key: "creatine",
      label: `Creatine (${creatine})`,
      kg,
      detail: "Creatine is stored inside muscle cells and pulls water in with it.",
      clearsIn: "Persists while supplementing",
    });
  }
  if (largeFoodVolume) {
    drivers.push({
      key: "gut",
      label: "Food still in transit",
      kg: GUT_CONTENT_KG,
      detail: "Undigested food and fibre sitting in the gut weighs on the scale without being body mass.",
      clearsIn: "1-2 days",
    });
  }
  if (underHydrated) {
    drivers.push({
      key: "dehydration",
      label: "Under-hydration / heat loss",
      kg: -DEHYDRATION_KG,
      detail: "Sweat, sauna or a low-fluid day shows as a fall that reverses as soon as you rehydrate.",
      clearsIn: "Same day",
    });
  }

  const phase = cyclePhase(cycleKey);
  if (phase.kg !== 0) {
    drivers.push({
      key: "cycle",
      label: `Menstrual cycle — ${phase.label.split(" — ")[1] || phase.label}`,
      kg: phase.kg,
      detail: "Progesterone and oestrogen shift sodium and fluid handling across the cycle.",
      clearsIn: "Resolves with the next phase",
    });
  }

  const netKg = round(drivers.reduce((sum, d) => sum + d.kg, 0));
  const gains = drivers.filter((d) => d.kg > 0);
  const losses = drivers.filter((d) => d.kg < 0);
  const biggest = drivers.reduce(
    (top, d) => (top === null || Math.abs(d.kg) > Math.abs(top.kg) ? d : top),
    null,
  );

  const fatEquivalentKcal = round(Math.abs(netKg) * KCAL_PER_KG_FAT, 0);

  let reconciliation = null;
  if (scaleChangeKg !== null && scaleChangeKg !== "" && Number.isFinite(Number(scaleChangeKg))) {
    const observed = Number(scaleChangeKg);
    const unexplained = round(observed - netKg);
    reconciliation = {
      observedKg: round(observed),
      explainedKg: netKg,
      unexplainedKg: unexplained,
      unexplainedKcal: round(Math.abs(unexplained) * KCAL_PER_KG_FAT, 0),
    };
  }

  const notes = [];
  if (Math.abs(netKg) > 0) {
    notes.push(
      `A ${Math.abs(netKg)} kg change in body fat would need a ${fatEquivalentKcal.toLocaleString("en-IN")} kcal energy imbalance — which is why an overnight swing is almost never fat.`,
    );
  } else {
    notes.push(
      `Nothing you logged shifts fluid today. For reference, one kilogram of body fat is about ${KCAL_PER_KG_FAT.toLocaleString("en-IN")} kcal, so overnight swings are fluid, not fat.`,
    );
  }
  if (sodium > WHO_SODIUM_LIMIT_MG) {
    notes.push(
      `Sodium intake of ${round(sodium, 0)} mg is above the WHO adult guideline of ${WHO_SODIUM_LIMIT_MG} mg per day.`,
    );
  }
  if (drinkCount > 0) {
    notes.push("Alcohol usually shows a lower scale the next morning, then a rebound as fluid is replaced — the dip is not fat loss.");
  }
  if (biggest) {
    notes.push(`Largest single driver here: ${biggest.label} at ${biggest.kg > 0 ? "+" : ""}${biggest.kg} kg.`);
  }
  notes.push("Weigh at the same time each morning after using the bathroom and use a 7-day rolling average, not single readings.");

  return {
    drivers,
    netKg,
    gainKg: round(gains.reduce((s, d) => s + d.kg, 0)),
    lossKg: round(losses.reduce((s, d) => s + d.kg, 0)),
    netPercentOfBodyWeight: weight > 0 ? round((netKg / weight) * 100, 2) : 0,
    biggest,
    fatEquivalentKcal,
    glycogenCapacityG: round(glycogenCapacityG, 0),
    reconciliation,
    notes,
  };
}
