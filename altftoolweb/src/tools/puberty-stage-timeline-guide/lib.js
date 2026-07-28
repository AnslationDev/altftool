/**
 * Puberty stage timeline — informational reference data and timing checks.
 *
 * Stage descriptions follow the Tanner (sexual maturity rating) scale, originally
 * published by Marshall & Tanner (Arch Dis Child, 1969 girls / 1970 boys).
 * Age ranges are the widely quoted "typical" 3rd-97th centile windows used in
 * paediatric texts (Nelson Textbook of Pediatrics; AAP / Pediatric Endocrine
 * Society guidance). Everything here is population reference information, not a
 * diagnosis — individual children vary widely.
 */

/** Age (years) before which the first pubertal sign is conventionally called precocious. */
export const PRECOCIOUS_AGE = {
  // Classic thresholds: breast development before 8 in girls, testicular
  // enlargement before 9 in boys (Pediatric Endocrine Society, 1999 and later).
  female: 8,
  male: 9,
};

/** Age (years) by which absence of the first sign is conventionally called delayed. */
export const DELAYED_AGE = {
  // No breast development by 13 in girls; no testicular enlargement by 14 in boys.
  female: 13,
  male: 14,
};

/** Girls: menarche is called primary amenorrhoea if absent by this age. */
export const NO_MENARCHE_BY_AGE = 15;

/**
 * Typical gap in years between the first sign (thelarche) and menarche.
 * Median is about 2.3 years; most girls fall in a 2-3 year window, and a gap
 * longer than 3 years is a conventional reason to seek review.
 */
export const THELARCHE_TO_MENARCHE = { min: 2, median: 2.3, max: 3 };

/** Tanner stages for girls (breast development is the defining axis). */
export const TANNER_GIRLS = [
  {
    stage: 1,
    title: "Stage 1 — prepubertal",
    detail: "No breast tissue beyond the raised nipple; no pubic hair. Growth continues at the steady childhood rate.",
    fromAge: 0,
    toAge: 10,
  },
  {
    stage: 2,
    title: "Stage 2 — breast bud",
    detail: "Breast bud appears under the areola, often tender and sometimes one side first. Sparse, lightly pigmented pubic hair may begin.",
    fromAge: 8,
    toAge: 13,
  },
  {
    stage: 3,
    title: "Stage 3 — breast and areola enlarge",
    detail: "Breast tissue extends beyond the areola with no separate contour. Pubic hair darkens and coarsens. Height velocity is at or near its peak.",
    fromAge: 10,
    toAge: 14,
  },
  {
    stage: 4,
    title: "Stage 4 — secondary mound",
    detail: "Areola and nipple form a distinct mound above the breast. Adult-type pubic hair not yet on the thighs. Menarche most often falls in this stage.",
    fromAge: 11,
    toAge: 15,
  },
  {
    stage: 5,
    title: "Stage 5 — adult",
    detail: "Adult breast contour with the areola back in the breast line, adult pubic hair pattern. Growth is nearly finished.",
    fromAge: 12,
    toAge: 18,
  },
];

/** Tanner stages for boys (genital development is the defining axis). */
export const TANNER_BOYS = [
  {
    stage: 1,
    title: "Stage 1 — prepubertal",
    detail: "Testicular volume under 4 mL, childhood penis size, no pubic hair. Steady childhood growth rate.",
    fromAge: 0,
    toAge: 11,
  },
  {
    stage: 2,
    title: "Stage 2 — testicular enlargement",
    detail: "Testes reach 4 mL or more and the scrotal skin reddens and thins. This is the true first sign of puberty in boys, and it is easy to miss.",
    fromAge: 9,
    toAge: 14,
  },
  {
    stage: 3,
    title: "Stage 3 — penile lengthening",
    detail: "Penis lengthens, testes keep growing, pubic hair darkens and curls. Voice starts to change and the growth spurt begins.",
    fromAge: 10.5,
    toAge: 15,
  },
  {
    stage: 4,
    title: "Stage 4 — penile width and glans",
    detail: "Penis widens and the glans develops, scrotum darkens. Peak height velocity usually falls here, along with the clearest voice break.",
    fromAge: 11.5,
    toAge: 16,
  },
  {
    stage: 5,
    title: "Stage 5 — adult",
    detail: "Adult genital size and pubic hair spreading to the inner thighs. Facial hair and adult body shape continue to fill out after growth stops.",
    fromAge: 13,
    toAge: 17,
  },
];

/** Milestone windows, in years. `median` is the population 50th centile age. */
export const MILESTONES_GIRLS = [
  { key: "thelarche", name: "Breast budding (first sign)", fromAge: 8, toAge: 13, median: 10.5 },
  { key: "pubarche", name: "Pubic hair appears", fromAge: 8.5, toAge: 13.5, median: 11 },
  { key: "growth-spurt", name: "Peak height velocity (~8-9 cm/yr)", fromAge: 10, toAge: 13, median: 11.5 },
  { key: "menarche", name: "First period (menarche)", fromAge: 10, toAge: 15, median: 12.5 },
  { key: "adult-stage", name: "Adult Tanner stage 5 reached", fromAge: 12, toAge: 18, median: 15 },
];

export const MILESTONES_BOYS = [
  { key: "testicular", name: "Testicular enlargement to 4 mL (first sign)", fromAge: 9, toAge: 14, median: 11.5 },
  { key: "pubarche", name: "Pubic hair appears", fromAge: 10, toAge: 15, median: 12 },
  { key: "penile", name: "Penile growth begins", fromAge: 10.5, toAge: 14.5, median: 12.5 },
  { key: "voice", name: "Voice deepens and breaks", fromAge: 12.5, toAge: 15.5, median: 13.5 },
  { key: "growth-spurt", name: "Peak height velocity (~9-10 cm/yr)", fromAge: 12, toAge: 16, median: 13.5 },
  { key: "facial-hair", name: "Facial hair on upper lip", fromAge: 13, toAge: 17, median: 15 },
  { key: "adult-stage", name: "Adult Tanner stage 5 reached", fromAge: 13, toAge: 17, median: 15 },
];

/** Typical further height gained after menarche, in centimetres. */
export const POST_MENARCHE_GROWTH_CM = { min: 5, max: 7.5 };

const SEXES = ["female", "male"];
const MAX_AGE = 25;

function statusFor(ageYears, fromAge, toAge) {
  if (ageYears < fromAge) return "upcoming";
  if (ageYears > toAge) return "usually-past";
  return "in-window";
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

/**
 * Build the informational timeline for one child.
 *
 * @param {object} input
 * @param {"female"|"male"} input.sex
 * @param {number} input.ageYears current age in years
 * @param {number|null} [input.firstSignAgeYears] age the first pubertal sign was
 *   noticed, or null/undefined if puberty has not visibly started
 * @param {number|null} [input.menarcheAgeYears] girls only: age at first period
 * @returns {object} timeline, or { error } for invalid input
 */
export function assessPubertyTimeline({
  sex,
  ageYears,
  firstSignAgeYears = null,
  menarcheAgeYears = null,
} = {}) {
  if (!SEXES.includes(sex)) {
    return { error: "Choose whether the reference chart should be for a girl or a boy." };
  }

  const age = Number(ageYears);
  if (!Number.isFinite(age)) return { error: "Enter the child's current age in years." };
  if (age < 0) return { error: "Age cannot be negative." };
  if (age > MAX_AGE) {
    return { error: `This chart covers ages 0 to ${MAX_AGE}; puberty is complete well before that.` };
  }

  const hasFirstSign = firstSignAgeYears !== null && firstSignAgeYears !== undefined && firstSignAgeYears !== "";
  let firstSign = null;
  if (hasFirstSign) {
    firstSign = Number(firstSignAgeYears);
    if (!Number.isFinite(firstSign)) return { error: "Enter the age of the first sign as a number, or leave it blank." };
    if (firstSign < 0) return { error: "The age of the first sign cannot be negative." };
    if (firstSign > age) return { error: "The first sign cannot have appeared after the child's current age." };
  }

  const hasMenarche = menarcheAgeYears !== null && menarcheAgeYears !== undefined && menarcheAgeYears !== "";
  let menarche = null;
  if (hasMenarche) {
    if (sex !== "female") return { error: "A menarche age only applies to the girls' chart." };
    menarche = Number(menarcheAgeYears);
    if (!Number.isFinite(menarche)) return { error: "Enter the age at first period as a number, or leave it blank." };
    if (menarche < 0) return { error: "The age at first period cannot be negative." };
    if (menarche > age) return { error: "The first period cannot be later than the child's current age." };
    if (firstSign !== null && menarche < firstSign) {
      return { error: "The first period cannot come before the first pubertal sign." };
    }
  }

  const stages = sex === "female" ? TANNER_GIRLS : TANNER_BOYS;
  const milestoneTable = sex === "female" ? MILESTONES_GIRLS : MILESTONES_BOYS;
  const earlyAge = PRECOCIOUS_AGE[sex];
  const lateAge = DELAYED_AGE[sex];

  const milestones = milestoneTable.map((item) => ({
    ...item,
    status: statusFor(age, item.fromAge, item.toAge),
    yearsToMedian: round1(item.median - age),
  }));

  const currentStages = stages.filter((item) => age >= item.fromAge && age <= item.toAge);

  let timing;
  if (firstSign === null) {
    if (age >= lateAge) {
      timing = {
        code: "late",
        label: "Later than the usual window",
        note: `No first pubertal sign by age ${round1(age)} sits outside the usual range — ${sex === "female" ? "breast budding" : "testicular enlargement"} has normally begun by ${lateAge}. This is common and often simply constitutional delay, but it is a reason to book a paediatric review.`,
      };
    } else if (age >= milestoneTable[0].fromAge) {
      timing = {
        code: "not-started",
        label: "Not started yet, still inside the usual window",
        note: `The first sign typically appears between ${milestoneTable[0].fromAge} and ${milestoneTable[0].toAge}, median about ${milestoneTable[0].median}. There is no cause for concern until ${lateAge}.`,
      };
    } else {
      timing = {
        code: "before-window",
        label: "Prepubertal — before the usual window",
        note: `At ${round1(age)} the child is younger than the typical start of puberty (${milestoneTable[0].fromAge} onwards).`,
      };
    }
  } else if (firstSign < earlyAge) {
    timing = {
      code: "early",
      label: "Earlier than the usual window",
      note: `A first sign at ${round1(firstSign)} is before the conventional threshold of ${earlyAge} for ${sex === "female" ? "girls" : "boys"}, which is described as precocious puberty. Worth an unhurried paediatric or endocrine assessment.`,
    };
  } else {
    timing = {
      code: "typical",
      label: "Within the usual window",
      note: `A first sign at ${round1(firstSign)} falls inside the typical ${milestoneTable[0].fromAge}-${milestoneTable[0].toAge} range (median about ${milestoneTable[0].median}).`,
    };
  }

  const estimates = [];
  if (sex === "female") {
    if (menarche !== null) {
      estimates.push({
        label: "Height still expected after menarche",
        value: `about ${POST_MENARCHE_GROWTH_CM.min}-${POST_MENARCHE_GROWTH_CM.max} cm`,
      });
      if (firstSign !== null) {
        estimates.push({
          label: "Gap from first sign to menarche",
          value: `${round1(menarche - firstSign)} years (typical ${THELARCHE_TO_MENARCHE.min}-${THELARCHE_TO_MENARCHE.max})`,
        });
      }
    } else if (firstSign !== null) {
      estimates.push({
        label: "Expected menarche window",
        value: `age ${round1(firstSign + THELARCHE_TO_MENARCHE.min)} to ${round1(firstSign + THELARCHE_TO_MENARCHE.max)}`,
      });
      if (age > firstSign + THELARCHE_TO_MENARCHE.max || age >= NO_MENARCHE_BY_AGE) {
        estimates.push({
          label: "Review flag",
          value: `No period more than ${THELARCHE_TO_MENARCHE.max} years after the first sign, or none by age ${NO_MENARCHE_BY_AGE}, is worth discussing with a doctor.`,
        });
      }
    } else if (age >= NO_MENARCHE_BY_AGE) {
      estimates.push({
        label: "Review flag",
        value: `No period by age ${NO_MENARCHE_BY_AGE} is defined as primary amenorrhoea and should be reviewed.`,
      });
    }
  } else if (firstSign !== null) {
    estimates.push({
      label: "Expected peak growth spurt",
      value: `roughly ${round1(firstSign + 2)} years of age, about 2 years after the first sign`,
    });
  }

  return {
    sex,
    ageYears: round1(age),
    firstSignAgeYears: firstSign === null ? null : round1(firstSign),
    menarcheAgeYears: menarche === null ? null : round1(menarche),
    earlyAge,
    lateAge,
    timing,
    stages,
    currentStages,
    milestones,
    estimates,
  };
}
