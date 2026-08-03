/**
 * Calcium and vitamin D targets for women and girls — pure logic, no DOM.
 *
 * All reference values are the Institute of Medicine / National Academies
 * Dietary Reference Intakes for calcium and vitamin D (2011 report), which set
 * both the Recommended Dietary Allowance and the Tolerable Upper Intake Level
 * for each band.
 */

/** 1 microgram of vitamin D equals 40 International Units, by definition. */
export const IU_PER_MCG = 40;

/**
 * Calcium bands for females (IOM 2011). Pregnancy and lactation do not raise
 * the calcium requirement — absorption efficiency rises instead — so a
 * pregnant 30-year-old sits on the same 1000 mg as a non-pregnant one.
 */
export const CALCIUM_BANDS = [
  { minAge: 9, maxAge: 18, rda: 1300, ul: 3000, label: "9-18 years" },
  { minAge: 19, maxAge: 50, rda: 1000, ul: 2500, label: "19-50 years" },
  { minAge: 51, maxAge: 70, rda: 1200, ul: 2000, label: "51-70 years" },
  { minAge: 71, maxAge: 120, rda: 1200, ul: 2000, label: "71 years and over" },
];

/**
 * Vitamin D bands (IOM 2011). 600 IU up to age 70, 800 IU from 71, with a
 * tolerable upper intake level of 4000 IU from age 9 upward.
 */
export const VITAMIN_D_BANDS = [
  { minAge: 9, maxAge: 70, iu: 600, ul: 4000, label: "9-70 years" },
  { minAge: 71, maxAge: 120, iu: 800, ul: 4000, label: "71 years and over" },
];

/**
 * Calcium absorption falls off sharply once a single dose passes roughly
 * 500 mg, which is why supplement and meal guidance is to split the day's
 * calcium rather than take it all at once.
 */
export const SINGLE_DOSE_LIMIT_MG = 500;

/**
 * Oxalate-bound calcium (cooked spinach and similar high-oxalate greens) is
 * only around 5% bioavailable, versus roughly 30-35% for dairy (Weaver &
 * Plawecki 1994; Weaver & Heaney, "Calcium," in Modern Nutrition in Health
 * and Disease). Foods flagged `poorlyAbsorbed` use this factor so the target
 * math agrees with the tool's own "oxalate blocks much of it" caveat instead
 * of counting their full nominal mg as absorbed.
 */
export const POORLY_ABSORBED_ABSORPTION_FACTOR = 0.05;

export const AGE_MIN = 9;
export const AGE_MAX = 100;
export const MAX_SERVINGS_PER_FOOD = 20;

export const LIFE_STAGES = {
  GENERAL: "general",
  PREGNANT: "pregnant",
  BREASTFEEDING: "breastfeeding",
  POSTMENOPAUSAL: "postmenopausal",
};

/**
 * Calcium per typical serving, rounded from published food composition tables.
 * Fortified products depend entirely on the label, and calcium-set tofu varies
 * with the setting agent, so both are marked as label-dependent.
 */
export const CALCIUM_FOODS = [
  { id: "milk", name: "Milk", serving: "1 cup / 240 mL", mg: 300, group: "Dairy" },
  { id: "curd", name: "Curd or plain yoghurt", serving: "1 cup / 240 g", mg: 300, group: "Dairy" },
  { id: "paneer", name: "Paneer", serving: "100 g", mg: 208, group: "Dairy" },
  { id: "cheese", name: "Hard cheese", serving: "30 g", mg: 200, group: "Dairy" },
  { id: "fortifiedMilk", name: "Fortified soy or almond milk", serving: "1 cup / 240 mL", mg: 300, group: "Fortified", labelDependent: true },
  { id: "tofu", name: "Calcium-set tofu", serving: "100 g", mg: 350, group: "Plant", labelDependent: true },
  { id: "ragi", name: "Ragi (finger millet) flour", serving: "50 g", mg: 172, group: "Plant" },
  { id: "sesame", name: "Sesame seeds (til)", serving: "2 tbsp / 18 g", mg: 175, group: "Plant" },
  { id: "almonds", name: "Almonds", serving: "30 g", mg: 76, group: "Plant" },
  { id: "greens", name: "Cooked kale or mustard greens", serving: "100 g", mg: 150, group: "Plant" },
  { id: "spinach", name: "Cooked spinach", serving: "100 g", mg: 136, group: "Plant", poorlyAbsorbed: true },
  { id: "sardines", name: "Sardines with bones", serving: "100 g", mg: 380, group: "Fish" },
];

/** Vitamin D is scarce in food; these are the few meaningful dietary sources. */
export const VITAMIN_D_NOTES = [
  "Sunlight on bare skin is the main source for most people — how much you make depends on latitude, season, skin tone, sunscreen and how covered up you are.",
  "Oily fish (salmon, mackerel, sardines) is the strongest food source; egg yolk and fortified milk or cereal contribute smaller amounts.",
  "Vegetarian diets get very little vitamin D from food, so a supplement is the practical route if sun exposure is limited.",
  "Vitamin D matters for calcium because without it the gut absorbs only a fraction of the calcium you eat.",
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

function bandFor(bands, age) {
  return bands.find((band) => age >= band.minAge && age <= band.maxAge) || null;
}

/**
 * Calcium and vitamin D targets plus a tally of the day's intake.
 *
 * @param {object} input
 * @param {number} input.age years
 * @param {string} input.lifeStage one of LIFE_STAGES
 * @param {Record<string, number>} input.servings food id -> servings eaten today
 * @returns {{error:string}|object}
 */
export function calculateCalciumPlan({ age, lifeStage = LIFE_STAGES.GENERAL, servings = {} } = {}) {
  if (!isNum(age)) return { error: "Enter your age in years." };
  if (age < AGE_MIN || age > AGE_MAX) {
    return { error: `This calculator covers ages ${AGE_MIN} to ${AGE_MAX}.` };
  }
  if (!Object.values(LIFE_STAGES).includes(lifeStage)) {
    return { error: "Choose a life stage." };
  }

  const calciumBand = bandFor(CALCIUM_BANDS, age);
  const vitaminDBand = bandFor(VITAMIN_D_BANDS, age);
  if (!calciumBand || !vitaminDBand) {
    return { error: "No reference intake is published for that age." };
  }

  const breakdown = [];
  let intakeMg = 0;
  for (const food of CALCIUM_FOODS) {
    const raw = servings[food.id];
    const count = raw === undefined || raw === null || raw === "" ? 0 : Number(raw);
    if (!isNum(count)) return { error: `Servings of ${food.name} must be a number.` };
    if (count < 0) return { error: "Servings cannot be negative." };
    if (count > MAX_SERVINGS_PER_FOOD) {
      return { error: `More than ${MAX_SERVINGS_PER_FOOD} servings of ${food.name} in one day is outside this estimate.` };
    }
    if (count > 0) {
      const listedMg = count * food.mg;
      // Poorly-absorbed foods count toward the target at their effective
      // (absorbed) mg, not their listed mg — see POORLY_ABSORBED_ABSORPTION_FACTOR.
      const mg = food.poorlyAbsorbed ? Math.round(listedMg * POORLY_ABSORBED_ABSORPTION_FACTOR) : listedMg;
      intakeMg += mg;
      breakdown.push({
        id: food.id,
        name: food.name,
        serving: food.serving,
        count,
        mg,
        listedMg,
        poorlyAbsorbed: Boolean(food.poorlyAbsorbed),
      });
    }
  }

  const target = calciumBand.rda;
  // Round once and derive every other figure from that same rounded value so
  // meetsTarget can never disagree with the gap/percent shown next to it.
  const roundedIntake = Math.round(intakeMg);
  const gapMg = Math.max(0, target - roundedIntake);
  const overMg = Math.max(0, roundedIntake - target);
  const percentOfTarget = target > 0 ? Math.round((roundedIntake / target) * 100) : 0;

  // How many separate sittings the day's calcium should ideally be spread over.
  const suggestedSittings = Math.max(1, Math.ceil(target / SINGLE_DOSE_LIMIT_MG));

  return {
    age,
    lifeStage,
    calciumBandLabel: calciumBand.label,
    calciumTargetMg: target,
    calciumUpperLimitMg: calciumBand.ul,
    vitaminDBandLabel: vitaminDBand.label,
    vitaminDTargetIu: vitaminDBand.iu,
    vitaminDTargetMcg: Math.round((vitaminDBand.iu / IU_PER_MCG) * 10) / 10,
    vitaminDUpperLimitIu: vitaminDBand.ul,
    vitaminDUpperLimitMcg: Math.round(vitaminDBand.ul / IU_PER_MCG),
    intakeMg: roundedIntake,
    breakdown,
    gapMg,
    overMg,
    percentOfTarget,
    meetsTarget: roundedIntake >= target,
    exceedsUpperLimit: roundedIntake > calciumBand.ul,
    suggestedSittings,
    singleDoseLimitMg: SINGLE_DOSE_LIMIT_MG,
    lifeStageNote: lifeStageNoteFor(lifeStage),
  };
}

function lifeStageNoteFor(lifeStage) {
  if (lifeStage === LIFE_STAGES.PREGNANT || lifeStage === LIFE_STAGES.BREASTFEEDING) {
    return "Pregnancy and breastfeeding do not raise the calcium requirement in the dietary reference intakes — the gut simply absorbs more of what you eat — so the target stays the same as it is for your age band.";
  }
  if (lifeStage === LIFE_STAGES.POSTMENOPAUSAL) {
    return "The dietary reference intakes set calcium and vitamin D targets by age, not by menopausal status, so this figure matches the general target for your age band. Bone loss does speed up around menopause, which is one reason the target already steps up to 1200 mg at age 51.";
  }
  return "";
}

/**
 * Which foods would close a shortfall, cheapest-in-servings first.
 * Returns [] when there is no gap.
 */
export function suggestTopUps(gapMg, foods = CALCIUM_FOODS) {
  if (!isNum(gapMg) || gapMg <= 0) return [];
  return foods
    .filter((food) => food.mg > 0)
    .map((food) => {
      // Rank poorly-absorbed foods (e.g. spinach) by the calcium they
      // actually deliver toward the target, not their listed mg — otherwise
      // the tool would recommend a food it knows is a bad top-up choice.
      const effectiveMg = food.poorlyAbsorbed ? food.mg * POORLY_ABSORBED_ABSORPTION_FACTOR : food.mg;
      return {
        id: food.id,
        name: food.name,
        serving: food.serving,
        mg: food.mg,
        servingsNeeded: Math.ceil(gapMg / effectiveMg),
      };
    })
    // Fewest servings first; where several tie, prefer the smallest portion
    // that still closes the gap rather than the biggest hit of calcium.
    .sort((a, b) => a.servingsNeeded - b.servingsNeeded || a.mg - b.mg)
    .slice(0, 4);
}
