/**
 * Sweetener swap maths.
 *
 * `sweetness` is relative sweetening power PER GRAM with sucrose = 1, the
 * standard basis used in food-science tables. `kcalPerGram` is the metabolisable
 * energy per gram. `gi` is the published glycaemic index (glucose = 100);
 * null where no reliable single value exists.
 *
 * `adiMgPerKg` is the JECFA Acceptable Daily Intake in mg per kg of body weight
 * per day. `adiFactor` converts a gram of the product as sold into the
 * regulated substance the ADI is written against — it is 1 for everything
 * except steviol glycosides, whose ADI of 4 mg/kg is expressed as STEVIOL
 * equivalents (steviol MW 318.5 / rebaudioside A MW 967 = 0.33).
 *
 * Browning: only true carbonyl sugars caramelise and take part in the
 * Maillard reaction, which is why every sugar alcohol below is marked as
 * non-browning.
 */

export const SWEETENERS = [
  {
    id: "sucrose",
    name: "Table sugar (sucrose)",
    group: "Sugars",
    sweetness: 1,
    kcalPerGram: 3.87,
    gi: 65,
    adiMgPerKg: null,
    adiFactor: 1,
    heatStable: true,
    browns: true,
    bulk: true,
    form: "Granular",
    note: "The reference point. Provides bulk, structure, browning and moisture retention as well as sweetness.",
  },
  {
    id: "brown-sugar",
    name: "Brown sugar",
    group: "Sugars",
    sweetness: 1,
    kcalPerGram: 3.8,
    gi: 64,
    adiMgPerKg: null,
    adiFactor: 1,
    heatStable: true,
    browns: true,
    bulk: true,
    form: "Granular",
    note: "Sucrose with a little molasses. Nutritionally near-identical to white sugar; the molasses adds moisture and flavour.",
  },
  {
    id: "jaggery",
    name: "Jaggery (gur)",
    group: "Sugars",
    sweetness: 1,
    kcalPerGram: 3.83,
    gi: null,
    adiMgPerKg: null,
    adiFactor: 1,
    heatStable: true,
    browns: true,
    bulk: true,
    form: "Solid block or granular",
    note: "Unrefined cane sugar. Trace minerals are present but the sugar load is essentially the same as white sugar; published GI figures vary widely by batch.",
  },
  {
    id: "coconut-sugar",
    name: "Coconut sugar",
    group: "Sugars",
    sweetness: 1,
    kcalPerGram: 3.75,
    gi: 54,
    adiMgPerKg: null,
    adiFactor: 1,
    heatStable: true,
    browns: true,
    bulk: true,
    form: "Granular",
    note: "Swaps one-for-one with sugar. The low GI figure comes from a single small study and should be treated as indicative only.",
  },
  {
    id: "honey",
    name: "Honey",
    group: "Syrups",
    sweetness: 1,
    kcalPerGram: 3.04,
    gi: 58,
    adiMgPerKg: null,
    adiFactor: 1,
    heatStable: true,
    browns: true,
    bulk: true,
    form: "Liquid",
    note: "About as sweet as sugar by weight and sweeter spoon-for-spoon because it is denser. Roughly 17% water, so cut other liquid when baking. Never give honey to infants under 12 months.",
  },
  {
    id: "maple-syrup",
    name: "Maple syrup",
    group: "Syrups",
    sweetness: 0.7,
    kcalPerGram: 2.6,
    gi: 54,
    adiMgPerKg: null,
    adiFactor: 1,
    heatStable: true,
    browns: true,
    bulk: true,
    form: "Liquid",
    note: "About two-thirds sugar and one-third water, so it is less sweet per gram than sugar and adds liquid to a batter.",
  },
  {
    id: "agave",
    name: "Agave syrup",
    group: "Syrups",
    sweetness: 1.2,
    kcalPerGram: 3.1,
    gi: 15,
    adiMgPerKg: null,
    adiFactor: 1,
    heatStable: true,
    browns: true,
    bulk: true,
    form: "Liquid",
    note: "Low GI only because most of its sugar is fructose, which bypasses the glucose response but is handled by the liver. Browns faster than sugar.",
  },
  {
    id: "stevia",
    name: "Stevia (steviol glycosides)",
    group: "High-intensity",
    sweetness: 250,
    kcalPerGram: 0,
    gi: 0,
    adiMgPerKg: 4,
    adiFactor: 0.33,
    heatStable: true,
    browns: false,
    bulk: false,
    form: "Powder or liquid drops",
    note: "Heat stable to normal baking temperatures. Can leave a liquorice-like aftertaste at high doses. Tabletop packets are bulked out with erythritol or maltodextrin, so measure by sugar equivalence, not by weight of packet.",
  },
  {
    id: "monk-fruit",
    name: "Monk fruit (mogroside V)",
    group: "High-intensity",
    sweetness: 175,
    kcalPerGram: 0,
    gi: 0,
    adiMgPerKg: null,
    adiFactor: 1,
    heatStable: true,
    browns: false,
    bulk: false,
    form: "Powder or liquid drops",
    note: "No numerical ADI has been set. Usually sold blended with erythritol so it can be spooned like sugar.",
  },
  {
    id: "sucralose",
    name: "Sucralose",
    group: "High-intensity",
    sweetness: 600,
    kcalPerGram: 0,
    gi: 0,
    adiMgPerKg: 15,
    adiFactor: 1,
    heatStable: true,
    browns: false,
    bulk: false,
    form: "Powder, tablets or liquid",
    note: "Holds its sweetness through baking but contributes no bulk, so cakes made with it alone come out flat and pale.",
  },
  {
    id: "aspartame",
    name: "Aspartame",
    group: "High-intensity",
    sweetness: 200,
    kcalPerGram: 4,
    gi: 0,
    adiMgPerKg: 40,
    adiFactor: 1,
    heatStable: false,
    browns: false,
    bulk: false,
    form: "Powder or tablets",
    note: "Breaks down with prolonged heat, so it is for cold and table use rather than baking. It is a source of phenylalanine and must be avoided by people with phenylketonuria.",
  },
  {
    id: "acesulfame-k",
    name: "Acesulfame potassium",
    group: "High-intensity",
    sweetness: 200,
    kcalPerGram: 0,
    gi: 0,
    adiMgPerKg: 15,
    adiFactor: 1,
    heatStable: true,
    browns: false,
    bulk: false,
    form: "Powder",
    note: "Heat stable and usually blended with aspartame or sucralose to mask a slightly bitter finish.",
  },
  {
    id: "saccharin",
    name: "Saccharin",
    group: "High-intensity",
    sweetness: 300,
    kcalPerGram: 0,
    gi: 0,
    adiMgPerKg: 5,
    adiFactor: 1,
    heatStable: true,
    browns: false,
    bulk: false,
    form: "Tablets or powder",
    note: "The oldest artificial sweetener and still heat stable, but it turns metallic-bitter at higher concentrations.",
  },
  {
    id: "erythritol",
    name: "Erythritol",
    group: "Sugar alcohols",
    sweetness: 0.7,
    kcalPerGram: 0.2,
    gi: 0,
    adiMgPerKg: null,
    adiFactor: 1,
    heatStable: true,
    browns: false,
    bulk: true,
    form: "Granular",
    note: "Mostly absorbed and excreted unchanged, so it is the best tolerated polyol, but it gives a cooling mouthfeel and does not brown or caramelise.",
  },
  {
    id: "xylitol",
    name: "Xylitol",
    group: "Sugar alcohols",
    sweetness: 1,
    kcalPerGram: 2.4,
    gi: 13,
    adiMgPerKg: null,
    adiFactor: 1,
    heatStable: true,
    browns: false,
    bulk: true,
    form: "Granular",
    note: "Swaps one-for-one with sugar by weight and is used in dental products for its anti-caries effect. Extremely toxic to dogs even in small amounts.",
  },
  {
    id: "sorbitol",
    name: "Sorbitol",
    group: "Sugar alcohols",
    sweetness: 0.6,
    kcalPerGram: 2.6,
    gi: 9,
    adiMgPerKg: null,
    adiFactor: 1,
    heatStable: true,
    browns: false,
    bulk: true,
    form: "Granular or syrup",
    note: "Humectant as well as sweetener, common in sugar-free sweets. The most likely of the polyols to cause bloating and loose stools.",
  },
  {
    id: "allulose",
    name: "Allulose",
    group: "Rare sugars",
    sweetness: 0.7,
    kcalPerGram: 0.4,
    gi: 0,
    adiMgPerKg: null,
    adiFactor: 1,
    heatStable: true,
    browns: true,
    bulk: true,
    form: "Granular or syrup",
    note: "A rare sugar that behaves like sugar in the pan — it browns and caramelises, in fact faster than sucrose. Authorised in the United States; not authorised as a novel food in the EU or UK.",
  },
];

/** Sugar alcohols cause osmotic symptoms above roughly this daily intake. */
export const POLYOL_GI_UPSET_GRAMS = 20;
export const POLYOL_LAXATIVE_GRAMS = 50;

/** WHO free-sugar guidance, used as context for the calorie comparison. */
export const WHO_FREE_SUGAR_STRONG_PCT = 10;
export const WHO_FREE_SUGAR_CONDITIONAL_PCT = 5;
export const KCAL_PER_GRAM_FREE_SUGAR = 4;

const round = (value, dp = 1) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

export function getSweetener(id) {
  return SWEETENERS.find((item) => item.id === id) || null;
}

/**
 * Free-sugar allowance in grams from a daily calorie intake.
 * WHO strong recommendation: below 10% of total energy; conditional: below 5%.
 */
export function freeSugarAllowance(dailyKcal) {
  const kcal = Number(dailyKcal);
  if (!Number.isFinite(kcal) || kcal <= 0) return null;
  return {
    strongGrams: round((kcal * (WHO_FREE_SUGAR_STRONG_PCT / 100)) / KCAL_PER_GRAM_FREE_SUGAR),
    conditionalGrams: round(
      (kcal * (WHO_FREE_SUGAR_CONDITIONAL_PCT / 100)) / KCAL_PER_GRAM_FREE_SUGAR,
    ),
  };
}

/**
 * Convert an amount of one sweetener into the equally sweet amount of another.
 *
 * equivalent grams = source grams x (source sweetness / target sweetness)
 *
 * @param {object} input
 * @param {string} input.sourceId
 * @param {string} input.targetId
 * @param {number} input.sourceGrams
 * @param {number} input.bodyWeightKg  used for the ADI check
 * @returns {object} comparison, or { error }
 */
export function computeSwap({ sourceId, targetId, sourceGrams, bodyWeightKg } = {}) {
  const source = getSweetener(sourceId);
  const target = getSweetener(targetId);
  if (!source) return { error: "Pick a sweetener you are replacing." };
  if (!target) return { error: "Pick a sweetener to replace it with." };

  const grams = Number(sourceGrams);
  if (!Number.isFinite(grams)) return { error: "Enter the amount in grams as a number." };
  if (grams <= 0) return { error: "Enter an amount greater than zero grams." };
  if (grams > 100000) return { error: "Enter an amount under 100,000 g (100 kg)." };

  const weight = Number(bodyWeightKg);
  if (!Number.isFinite(weight) || weight <= 0 || weight > 400) {
    return { error: "Enter a body weight between 1 and 400 kg for the daily-limit check." };
  }

  const targetGrams = grams * (source.sweetness / target.sweetness);
  const sourceKcal = grams * source.kcalPerGram;
  const targetKcal = targetGrams * target.kcalPerGram;
  const kcalSaved = sourceKcal - targetKcal;
  const kcalSavedPct = sourceKcal > 0 ? (kcalSaved / sourceKcal) * 100 : 0;

  let adi = null;
  if (target.adiMgPerKg !== null) {
    const limitGrams = (target.adiMgPerKg * weight) / 1000 / target.adiFactor;
    adi = {
      mgPerKg: target.adiMgPerKg,
      basis: target.adiFactor === 1 ? "of the sweetener itself" : "expressed as steviol equivalents",
      limitGrams: round(limitGrams, 3),
      usedPct: limitGrams > 0 ? round((targetGrams / limitGrams) * 100, 1) : 0,
      exceeded: limitGrams > 0 && targetGrams > limitGrams,
    };
  }

  const warnings = [];
  if (!target.heatStable) {
    warnings.push(`${target.name} is not heat stable — use it in cold dishes or add it after cooking.`);
  }
  if (source.browns && !target.browns) {
    warnings.push(
      `${target.name} does not caramelise or brown, so bakes will stay paler and softer than with ${source.name.toLowerCase()}.`,
    );
  }
  if (source.bulk && !target.bulk) {
    warnings.push(
      `You are replacing ${round(grams)} g of bulk with only ${round(targetGrams, 3)} g. Add a bulking agent such as erythritol, yoghurt or extra flour or the recipe will lose structure.`,
    );
  }
  if (target.group === "Sugar alcohols" && targetGrams > POLYOL_GI_UPSET_GRAMS) {
    warnings.push(
      `${round(targetGrams)} g of a sugar alcohol in a day commonly causes bloating; above about ${POLYOL_LAXATIVE_GRAMS} g the laxative effect is likely.`,
    );
  }
  if (target.id === "xylitol") {
    warnings.push("Xylitol is severely toxic to dogs — keep anything made with it away from pets.");
  }
  if (target.id === "aspartame") {
    warnings.push("Aspartame is a source of phenylalanine and must be avoided in phenylketonuria.");
  }
  if (target.id === "honey") {
    warnings.push("Honey must never be given to babies under 12 months because of infant botulism risk.");
  }
  if (adi && adi.exceeded) {
    warnings.push(
      `That amount is above the Acceptable Daily Intake of ${target.adiMgPerKg} mg/kg body weight for a ${round(weight)} kg adult.`,
    );
  }

  return {
    source,
    target,
    sourceGrams: round(grams, 2),
    targetGrams: round(targetGrams, targetGrams < 1 ? 3 : 1),
    targetGramsExact: targetGrams,
    sourceKcal: Math.round(sourceKcal),
    targetKcal: Math.round(targetKcal),
    kcalSaved: Math.round(kcalSaved),
    kcalSavedPct: round(kcalSavedPct),
    ratioLabel:
      target.sweetness >= source.sweetness
        ? `1 g of ${target.name.toLowerCase()} replaces ${round(target.sweetness / source.sweetness, 1)} g of ${source.name.toLowerCase()}`
        : `${round(source.sweetness / target.sweetness, 2)} g of ${target.name.toLowerCase()} replaces 1 g of ${source.name.toLowerCase()}`,
    adi,
    warnings,
  };
}

/**
 * Same source amount compared against every sweetener in the table.
 * Returns rows sorted by calories, lowest first.
 */
export function compareAllSweeteners({ sourceId, sourceGrams, bodyWeightKg } = {}) {
  const probe = computeSwap({ sourceId, targetId: sourceId, sourceGrams, bodyWeightKg });
  if (probe.error) return { error: probe.error };

  const rows = SWEETENERS.map((item) => {
    const swap = computeSwap({ sourceId, targetId: item.id, sourceGrams, bodyWeightKg });
    return {
      id: item.id,
      name: item.name,
      group: item.group,
      grams: swap.targetGrams,
      kcal: swap.targetKcal,
      gi: item.gi,
      bakes: item.heatStable,
      browns: item.browns,
      bulk: item.bulk,
    };
  }).sort((a, b) => a.kcal - b.kcal || a.name.localeCompare(b.name));

  return { rows, baselineKcal: probe.sourceKcal };
}
