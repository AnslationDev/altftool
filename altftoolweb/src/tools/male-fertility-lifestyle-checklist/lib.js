/**
 * Male fertility lifestyle checklist.
 *
 * Scores habits with published links to semen quality. It does not measure
 * fertility — only a semen analysis interpreted by a clinician does that.
 * Dates are passed in so the module stays pure.
 */

/** Heller & Clermont: one full cycle of human spermatogenesis takes about 74 days. */
export const SPERMATOGENESIS_DAYS = 74;

/** Epididymal transit and maturation adds roughly a further 2 weeks. */
export const EPIDIDYMAL_TRANSIT_DAYS = 14;

/** So a habit change shows up in a semen analysis about 88 days later. */
export const REVIEW_AFTER_DAYS = SPERMATOGENESIS_DAYS + EPIDIDYMAL_TRANSIT_DAYS;

/**
 * WHO laboratory manual, 6th edition (2021), lower reference limits — the
 * 5th centile of men whose partners conceived within 12 months.
 * Below a limit does not mean infertile; it means below the reference range.
 */
export const WHO_2021_REFERENCE_LIMITS = [
  { name: "Semen volume", value: "1.4 mL" },
  { name: "Sperm concentration", value: "16 million per mL" },
  { name: "Total sperm number", value: "39 million per ejaculate" },
  { name: "Total motility", value: "42%" },
  { name: "Progressive motility", value: "30%" },
  { name: "Normal forms (morphology)", value: "4%" },
  { name: "Vitality", value: "54% live" },
];

/** WHO advises 2 to 7 days of abstinence before a semen analysis. */
export const ABSTINENCE_MIN_DAYS = 2;
export const ABSTINENCE_MAX_DAYS = 7;

export const ANSWER_SCORES = { yes: 1, partly: 0.5, no: 0 };

export const ANSWER_OPTIONS = [
  { value: "yes", label: "Yes, consistently" },
  { value: "partly", label: "Some of the time" },
  { value: "no", label: "No / rarely" },
];

/**
 * weight 3 = strong, repeatedly replicated association with semen parameters
 * weight 2 = consistent evidence, moderate effect
 * weight 1 = plausible and widely advised, weaker direct evidence
 */
export const HABITS = [
  {
    id: "laptop",
    category: "Heat",
    weight: 1,
    label: "I do not rest a laptop directly on my lap for long periods",
    detail:
      "The testes work best about 2 °C below core body temperature; a laptop on the lap raises scrotal temperature measurably within an hour.",
    action: "Use a desk or a lap tray rather than resting the machine on your thighs.",
  },
  {
    id: "hot-tubs",
    category: "Heat",
    weight: 2,
    label: "I avoid regular hot tubs, saunas and very hot baths",
    detail: "Repeated wet heat exposure is associated with reduced sperm concentration and motility.",
    action: "Studies show recovery over 3 to 6 months once the heat exposure stops.",
  },
  {
    id: "occupational-heat",
    category: "Heat",
    weight: 2,
    label: "My work does not involve long hours of heat or unbroken sitting",
    detail: "Furnace work, long-haul driving and prolonged sitting all raise scrotal temperature.",
    action: "Break up long driving or seated shifts with a short walk every hour or two.",
  },
  {
    id: "smoking",
    category: "Substances",
    weight: 3,
    label: "I do not smoke or vape nicotine",
    detail:
      "Meta-analyses consistently link smoking with lower sperm count, motility and normal morphology, with a dose response.",
    action: "Quitting improves parameters over roughly one spermatogenic cycle.",
  },
  {
    id: "alcohol",
    category: "Substances",
    weight: 2,
    label: "I keep alcohol low and occasional",
    detail: "Heavy or daily intake is associated with lower semen volume and abnormal morphology.",
    action: "Under 14 UK units a week, spread over 3 or more days, is the usual guidance.",
  },
  {
    id: "cannabis",
    category: "Substances",
    weight: 2,
    label: "I do not use cannabis or other recreational drugs",
    detail: "Regular cannabis use is associated with lower sperm concentration and altered motility.",
    action: "Effects appear reversible after several months of abstinence.",
  },
  {
    id: "anabolics",
    category: "Substances",
    weight: 3,
    label: "I am not using anabolic steroids or testosterone",
    detail:
      "Exogenous testosterone suppresses the pituitary signals that drive sperm production and commonly causes azoospermia.",
    action: "Never stop or start these alone — ask a fertility specialist to manage it.",
    clinical: true,
  },
  {
    id: "bmi",
    category: "Body and sleep",
    weight: 3,
    label: "My weight is in a healthy range for my height",
    detail: "Obesity is associated with lower sperm concentration, total count and testosterone.",
    action: "A waist under half your height is a simple everyday check.",
  },
  {
    id: "sleep",
    category: "Body and sleep",
    weight: 2,
    label: "I sleep 7 to 9 hours on most nights",
    detail: "Both short and very long sleep have been associated with reduced semen quality in cohort studies.",
    action: "Aim for a consistent 7-hour sleep opportunity rather than catching up at weekends.",
  },
  {
    id: "exercise",
    category: "Body and sleep",
    weight: 2,
    label: "I am physically active most weeks",
    detail: "Moderate regular activity is associated with better semen parameters than a sedentary pattern.",
    action: "150 minutes of moderate activity a week is the usual adult target.",
  },
  {
    id: "cycling",
    category: "Body and sleep",
    weight: 1,
    label: "I do not spend very long hours on a bike saddle",
    detail: "Very high-volume cycling has been linked with perineal pressure and heat effects in some studies.",
    action: "A cut-out saddle and regular standing breaks reduce perineal pressure.",
  },
  {
    id: "antioxidants",
    category: "Nutrition",
    weight: 1,
    label: "I eat plenty of vegetables, fruit and oily fish",
    detail: "Diets higher in antioxidants and omega-3 are associated with better semen parameters.",
    action: "Whole foods first — supplement trials in men with normal diets are inconsistent.",
  },
  {
    id: "micronutrients",
    category: "Nutrition",
    weight: 1,
    label: "My diet covers zinc, selenium and folate",
    detail: "Deficiency of these is linked with poorer semen quality; excess brings no extra benefit.",
    action: "Shellfish, nuts, eggs, legumes and leafy greens cover all three.",
  },
  {
    id: "ejaculation-frequency",
    category: "Timing",
    weight: 2,
    label: "We do not save up long gaps between ejaculations",
    detail:
      "Long abstinence raises volume but lowers motility and DNA integrity; every 2 to 3 days suits most couples trying to conceive.",
    action: `Before a semen analysis, WHO asks for ${ABSTINENCE_MIN_DAYS} to ${ABSTINENCE_MAX_DAYS} days of abstinence.`,
  },
  {
    id: "fertile-window",
    category: "Timing",
    weight: 2,
    label: "We have sex through the fertile window, not just on one day",
    detail: "The fertile window is roughly the five days before ovulation plus the day of ovulation.",
    action: "Every one to two days across that window beats trying to time a single day.",
  },
  {
    id: "medication-review",
    category: "Medical",
    weight: 2,
    label: "My medicines have been reviewed for fertility effects",
    detail:
      "Finasteride, sulfasalazine, some antipsychotics, chemotherapy and exogenous testosterone can all reduce sperm production.",
    action: "Take a full medicines list to your GP rather than stopping anything yourself.",
    clinical: true,
  },
  {
    id: "sti",
    category: "Medical",
    weight: 1,
    label: "I have had a sexual health check if there is any risk",
    detail: "Untreated chlamydia and other infections can scar the reproductive tract.",
    action: "Testing is quick, free in many countries and treatable when positive.",
    clinical: true,
  },
  {
    id: "varicocele",
    category: "Medical",
    weight: 1,
    label: "I have had any scrotal lump, ache or swelling examined",
    detail: "Varicocele is found in a substantial minority of men with abnormal semen analyses and is treatable.",
    action: "Any new lump needs same-week medical assessment, fertility aside.",
    clinical: true,
  },
  {
    id: "toxins",
    category: "Medical",
    weight: 2,
    label: "I am not routinely exposed to pesticides, solvents or heavy metals",
    detail: "Occupational exposure to organophosphates, glycol ethers and lead is linked with reduced semen quality.",
    action: "Use the supplied protective equipment and ask about workplace exposure monitoring.",
  },
];

export const MAX_SCORE = HABITS.reduce((total, habit) => total + habit.weight, 0);

export const CATEGORY_ORDER = ["Heat", "Substances", "Body and sleep", "Nutrition", "Timing", "Medical"];

export const SCORE_BANDS = [
  { min: 80, label: "Strong foundation", note: "Most modifiable factors are already covered." },
  { min: 60, label: "Good, with gaps", note: "A few habits left; the ranked list below is where to start." },
  { min: 40, label: "Several gaps", note: "Heat, smoking and weight usually give the biggest return." },
  { min: 0, label: "Lots of headroom", note: "Begin with the heaviest items — they carry the strongest evidence." },
];

const MS_PER_DAY = 86400000;

export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const ms = Date.UTC(year, month - 1, day);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== year || back.getUTCMonth() !== month - 1 || back.getUTCDate() !== day) {
    return null;
  }
  return ms;
}

export function toISODate(ms) {
  return Number.isFinite(ms) ? new Date(ms).toISOString().slice(0, 10) : "";
}

export function bandForPercent(percent) {
  return SCORE_BANDS.find((band) => percent >= band.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
}

export function emptyAnswers() {
  return HABITS.reduce((acc, habit) => {
    acc[habit.id] = "no";
    return acc;
  }, {});
}

/**
 * @param {object} input
 * @param {object} input.answers  map of habit id -> "yes" | "partly" | "no"
 * @param {string} input.todayISO today's date as YYYY-MM-DD, supplied by the caller
 */
export function scoreFertilityChecklist({ answers, todayISO } = {}) {
  if (!answers || typeof answers !== "object") {
    return { error: "Answer the checklist to see a score." };
  }
  const today = parseISODate(todayISO);
  if (today === null) {
    return { error: "Today's date must be a valid YYYY-MM-DD date." };
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
      });
      if (habit.clinical) {
        clinicalFlags.push({ id: habit.id, label: habit.label, action: habit.action });
      }
    }
  }

  gaps.sort((a, b) => b.lost - a.lost || b.weight - a.weight);

  const percent = (score / MAX_SCORE) * 100;
  const band = bandForPercent(percent);
  const reviewMs = today + REVIEW_AFTER_DAYS * MS_PER_DAY;

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
    reviewDateISO: toISODate(reviewMs),
    reviewAfterDays: REVIEW_AFTER_DAYS,
  };
}
