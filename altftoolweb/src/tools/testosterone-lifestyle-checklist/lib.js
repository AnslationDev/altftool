/**
 * Testosterone-relevant lifestyle habit checklist.
 *
 * This scores HABITS, not hormones. Nothing here measures or diagnoses
 * testosterone status — only a blood test ordered by a clinician does that.
 * Each item is a habit with published links to androgen status, weighted 1-3
 * by how consistent that evidence is.
 */

/** Answer values and the fraction of an item's weight each one earns. */
export const ANSWER_SCORES = {
  yes: 1,
  partly: 0.5,
  no: 0,
};

export const ANSWER_OPTIONS = [
  { value: "yes", label: "Yes, consistently" },
  { value: "partly", label: "Some of the time" },
  { value: "no", label: "No / rarely" },
];

/**
 * weight 3 = the association is strong and repeatedly replicated
 * weight 2 = consistent observational evidence, smaller or mixed trials
 * weight 1 = plausible and generally recommended, weaker direct evidence
 */
export const HABITS = [
  {
    id: "sleep-duration",
    category: "Sleep",
    weight: 3,
    label: "I sleep 7 to 9 hours on most nights",
    detail:
      "One week restricted to 5 hours a night cut daytime testosterone by roughly 10-15% in healthy young men (Leproult & Van Cauter, JAMA 2011).",
    action: "Protect a 7-hour sleep opportunity before adding anything else.",
  },
  {
    id: "sleep-regularity",
    category: "Sleep",
    weight: 1,
    label: "My sleep and wake times are roughly the same each day",
    detail: "Most of the daily testosterone rise happens during sleep, so irregular timing fragments it.",
    action: "Anchor your wake time first; bedtime tends to follow.",
  },
  {
    id: "sleep-apnoea",
    category: "Sleep",
    weight: 2,
    label: "I do not snore heavily or stop breathing in my sleep",
    detail: "Untreated obstructive sleep apnoea is repeatedly associated with lower testosterone.",
    action: "Loud snoring plus daytime sleepiness is worth a sleep-study referral.",
    clinical: true,
  },
  {
    id: "waist",
    category: "Body composition",
    weight: 3,
    label: "My waist is under half my height",
    detail:
      "Excess adiposity is the strongest modifiable correlate of low testosterone; aromatase in fat tissue converts testosterone to oestradiol.",
    action: "Even 5-10% weight loss measurably raises total testosterone in men with obesity.",
  },
  {
    id: "weight-stability",
    category: "Body composition",
    weight: 1,
    label: "My weight has been stable or falling over the last year",
    detail: "Rapid weight gain tracks with falling androgen levels in longitudinal cohorts.",
    action: "Weigh weekly rather than daily and watch the trend line.",
  },
  {
    id: "resistance-training",
    category: "Training",
    weight: 3,
    label: "I do resistance training at least 2 days a week",
    detail:
      "WHO and most national guidelines recommend muscle-strengthening on 2 or more days a week; it preserves lean mass, which tracks with androgen status.",
    action: "Two full-body sessions a week beats five inconsistent ones.",
  },
  {
    id: "cardio",
    category: "Training",
    weight: 2,
    label: "I get at least 150 minutes of moderate activity a week",
    detail: "The WHO adult target; activity improves insulin sensitivity, which is tied to androgen status.",
    action: "Five brisk 30-minute walks meets the whole target.",
  },
  {
    id: "recovery",
    category: "Training",
    weight: 1,
    label: "I am not training through constant fatigue or soreness",
    detail: "Sustained high training loads without recovery suppress the hypothalamic-pituitary-gonadal axis.",
    action: "Schedule a lighter week every fourth week.",
  },
  {
    id: "dietary-fat",
    category: "Nutrition",
    weight: 2,
    label: "Fat makes up a reasonable share of my diet, not near-zero",
    detail:
      "Very-low-fat diets, roughly under 20% of energy, are associated with modestly lower testosterone in intervention reviews.",
    action: "Include olive oil, eggs, oily fish or nuts rather than stripping fat out.",
  },
  {
    id: "protein",
    category: "Nutrition",
    weight: 1,
    label: "I eat enough protein to support the training I do",
    detail: "Adequate protein supports the lean mass that correlates with androgen status.",
    action: "Roughly 1.2-1.6 g per kg of body weight a day suits most people who lift.",
  },
  {
    id: "vitamin-d",
    category: "Nutrition",
    weight: 2,
    label: "I get regular daylight or have my vitamin D checked",
    detail:
      "Low vitamin D status is consistently associated with lower testosterone, though supplementation trials in replete men are mixed.",
    action: "Ask for a 25(OH)D test rather than guessing at a dose.",
  },
  {
    id: "micronutrients",
    category: "Nutrition",
    weight: 1,
    label: "My diet covers zinc and magnesium",
    detail: "Deficiency of either is linked to lower testosterone; supplementing beyond adequacy is not.",
    action: "Shellfish, meat, legumes, nuts and wholegrains cover both.",
  },
  {
    id: "alcohol",
    category: "Substances",
    weight: 2,
    label: "I keep alcohol to a low, occasional amount",
    detail: "Heavy chronic intake suppresses testicular steroidogenesis and raises aromatisation.",
    action: "UK guidance is under 14 units a week spread over 3 or more days.",
  },
  {
    id: "smoking",
    category: "Substances",
    weight: 1,
    label: "I do not smoke or vape nicotine",
    detail: "Smoking damages vascular and sperm parameters that sit alongside androgen health.",
    action: "Cessation support roughly triples quit success versus willpower alone.",
  },
  {
    id: "no-anabolics",
    category: "Substances",
    weight: 3,
    label: "I am not using anabolic steroids or unprescribed testosterone",
    detail:
      "Exogenous androgens shut down the body's own production through negative feedback, and recovery can take many months.",
    action: "Stopping without medical supervision can leave you hypogonadal — get supervised.",
    clinical: true,
  },
  {
    id: "medication-review",
    category: "Substances",
    weight: 2,
    label: "I am not on long-term opioids or other androgen-lowering medicines unreviewed",
    detail:
      "Opioid-induced androgen deficiency is well described; some antifungals and glucocorticoids also lower testosterone.",
    action: "Take your full medicines list to a review rather than stopping anything yourself.",
    clinical: true,
  },
  {
    id: "stress",
    category: "Stress",
    weight: 2,
    label: "I have a way of unwinding that actually works for me",
    detail: "Sustained cortisol elevation suppresses the hypothalamic-pituitary-gonadal axis.",
    action: "Consistency matters more than the method — walking, breathing work or therapy all count.",
  },
];

export const MAX_SCORE = HABITS.reduce((total, habit) => total + habit.weight, 0);

/** Score bands. Percentages are of the total available habit weight. */
export const SCORE_BANDS = [
  {
    min: 80,
    label: "Strong foundation",
    note: "Most of the modifiable habits are already in place; further gains are likely to be small.",
  },
  {
    min: 60,
    label: "Good, with gaps",
    note: "The basics are mostly covered — the listed gaps are where the remaining headroom is.",
  },
  {
    min: 40,
    label: "Several gaps",
    note: "Fixing the two or three heaviest items below usually matters more than any supplement.",
  },
  {
    min: 0,
    label: "Lots of headroom",
    note: "Start with sleep and waist size; they carry the most consistent evidence of the list.",
  },
];

const CATEGORY_ORDER = ["Sleep", "Body composition", "Training", "Nutrition", "Substances", "Stress"];

export function bandForPercent(percent) {
  return SCORE_BANDS.find((band) => percent >= band.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
}

/** A blank answer sheet with every habit set to "no". */
export function emptyAnswers() {
  return HABITS.reduce((acc, habit) => {
    acc[habit.id] = "no";
    return acc;
  }, {});
}

/**
 * @param {object} answers map of habit id -> "yes" | "partly" | "no"
 */
export function scoreChecklist(answers) {
  if (!answers || typeof answers !== "object") {
    return { error: "Answer the checklist to see a score." };
  }

  let score = 0;
  const gaps = [];
  const clinicalFlags = [];
  const byCategory = CATEGORY_ORDER.map((name) => ({ name, score: 0, max: 0 }));

  for (const habit of HABITS) {
    const answer = answers[habit.id] ?? "no";
    if (!Object.prototype.hasOwnProperty.call(ANSWER_SCORES, answer)) {
      return { error: `"${answer}" is not a valid answer for "${habit.label}".` };
    }
    const earned = habit.weight * ANSWER_SCORES[answer];
    score += earned;

    const bucket = byCategory.find((entry) => entry.name === habit.category);
    if (bucket) {
      bucket.score += earned;
      bucket.max += habit.weight;
    }

    if (answer !== "yes") {
      gaps.push({
        id: habit.id,
        label: habit.label,
        action: habit.action,
        weight: habit.weight,
        lost: habit.weight - earned,
        answer,
      });
      if (habit.clinical) {
        clinicalFlags.push({ id: habit.id, label: habit.label, action: habit.action });
      }
    }
  }

  gaps.sort((a, b) => b.lost - a.lost || b.weight - a.weight);

  const percent = (score / MAX_SCORE) * 100;
  const band = bandForPercent(percent);

  return {
    score,
    maxScore: MAX_SCORE,
    percent,
    bandLabel: band.label,
    bandNote: band.note,
    gaps,
    topGaps: gaps.slice(0, 3),
    clinicalFlags,
    byCategory: byCategory.map((entry) => ({
      ...entry,
      percent: entry.max > 0 ? (entry.score / entry.max) * 100 : 0,
    })),
  };
}
