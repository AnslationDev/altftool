/**
 * Pre-matric scholarship eligibility rules — centrally sponsored schemes, India.
 *
 * Encoded from the published scheme guidelines (as revised for 2022-23 onwards,
 * when the Centre restricted pre-matric coverage to classes 9 and 10):
 *
 *  - Pre-Matric Scholarship for SC Students (Dept. of Social Justice &
 *    Empowerment): classes 9-10, parental/family income up to Rs 2.5 lakh a year.
 *  - Pre-Matric Scholarship for ST Students (Ministry of Tribal Affairs):
 *    classes 9-10, parental income up to Rs 2.5 lakh a year.
 *  - Pre-Matric Scholarship for OBC/EBC/DNT Students (PM-YASASVI umbrella,
 *    DoSJE): classes 9-10, parental income up to Rs 2.5 lakh a year.
 *  - Pre-Matric Scholarship for Minority Students (Ministry of Minority
 *    Affairs, via NSP): classes 9-10, family income up to Rs 1 lakh a year,
 *    minimum 50% marks in the previous final examination (relaxed for class 9
 *    entry-level per guidelines; the 50% condition is applied here whenever a
 *    previous percentage is supplied). Minorities: Muslim, Christian, Sikh,
 *    Buddhist, Jain, Parsi.
 *  - Pre-Matric Scholarship for Children of Parents engaged in "unclean" and
 *    hazardous occupations (now a component of the SC scheme): classes 1-10,
 *    NO income ceiling; parent must be a manual scavenger, tanner, flayer,
 *    waste picker or engaged in a similarly notified hazardous occupation.
 *
 * States run additional schemes with their own limits; this tool covers the
 * central schemes only.
 */

/** Class window for the main pre-matric schemes (post-2022-23 revision). */
export const MAIN_SCHEME_MIN_CLASS = 9;
export const MAIN_SCHEME_MAX_CLASS = 10;

/** Class window for the hazardous-occupations component. */
export const HAZARDOUS_MIN_CLASS = 1;
export const HAZARDOUS_MAX_CLASS = 10;

/** Annual family income ceilings (Rs), from the scheme guidelines. */
export const INCOME_CEILING_SC = 250000;
export const INCOME_CEILING_ST = 250000;
export const INCOME_CEILING_OBC_EBC_DNT = 250000;
export const INCOME_CEILING_MINORITY = 100000;

/** Minimum previous-exam percentage for the minority scheme. */
export const MINORITY_MIN_PREV_PERCENT = 50;

export const CATEGORY_OPTIONS = [
  { id: "sc", label: "Scheduled Caste (SC)" },
  { id: "st", label: "Scheduled Tribe (ST)" },
  { id: "obc", label: "Other Backward Class (OBC)" },
  { id: "ebc", label: "Economically Backward Class (EBC)" },
  { id: "dnt", label: "De-notified / Nomadic Tribe (DNT)" },
  { id: "minority", label: "Minority (Muslim, Christian, Sikh, Buddhist, Jain, Parsi)" },
  { id: "general", label: "General / none of these" },
];

const fmtInr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

/**
 * Check central pre-matric scholarship eligibility.
 *
 * @param {object} input
 * @param {number} input.studentClass       Class currently studying in (1-10).
 * @param {string} input.category           One of CATEGORY_OPTIONS ids.
 * @param {number} input.familyIncome       Annual family/parental income, Rs.
 * @param {number|null} [input.prevPercent] Previous final-exam percentage (minority scheme).
 * @param {boolean} [input.hazardousOccupation] Parent in a notified hazardous occupation.
 * @returns {object} { schemes: [...], eligibleCount } or { error }.
 */
export function checkPreMatricEligibility({
  studentClass,
  category,
  familyIncome,
  prevPercent = null,
  hazardousOccupation = false,
}) {
  const klass = Number(studentClass);
  const income = Number(familyIncome);

  if (!Number.isInteger(klass) || klass < 1 || klass > 12) {
    return { error: "Enter the class as a whole number between 1 and 12." };
  }
  if (!CATEGORY_OPTIONS.some((c) => c.id === category)) {
    return { error: "Choose the student's category." };
  }
  if (!Number.isFinite(income) || income < 0) {
    return { error: "Enter the annual family income as a non-negative number." };
  }
  let prev = null;
  if (prevPercent !== null && prevPercent !== undefined && String(prevPercent).trim() !== "") {
    prev = Number(prevPercent);
    if (!Number.isFinite(prev) || prev < 0 || prev > 100) {
      return { error: "Previous exam percentage must be between 0 and 100." };
    }
  }

  const inMainWindow = klass >= MAIN_SCHEME_MIN_CLASS && klass <= MAIN_SCHEME_MAX_CLASS;
  const classReason = inMainWindow
    ? null
    : `only classes ${MAIN_SCHEME_MIN_CLASS}-${MAIN_SCHEME_MAX_CLASS} are covered (student is in class ${klass})`;

  const schemes = [];

  const pushMainScheme = ({ id, name, ministry, categoryOk, categoryReason, ceiling }) => {
    const reasons = [];
    if (!categoryOk) reasons.push(categoryReason);
    if (classReason) reasons.push(classReason);
    if (income > ceiling) {
      reasons.push(`family income ${fmtInr(income)} exceeds the ${fmtInr(ceiling)} ceiling`);
    }
    schemes.push({
      id,
      name,
      ministry,
      eligible: reasons.length === 0,
      reasons,
      criteria: `Classes ${MAIN_SCHEME_MIN_CLASS}-${MAIN_SCHEME_MAX_CLASS}, income up to ${fmtInr(ceiling)}/year`,
    });
  };

  pushMainScheme({
    id: "sc-pre-matric",
    name: "Pre-Matric Scholarship for SC Students",
    ministry: "Dept. of Social Justice & Empowerment",
    categoryOk: category === "sc",
    categoryReason: "the student must belong to a Scheduled Caste",
    ceiling: INCOME_CEILING_SC,
  });

  pushMainScheme({
    id: "st-pre-matric",
    name: "Pre-Matric Scholarship for ST Students",
    ministry: "Ministry of Tribal Affairs",
    categoryOk: category === "st",
    categoryReason: "the student must belong to a Scheduled Tribe",
    ceiling: INCOME_CEILING_ST,
  });

  pushMainScheme({
    id: "obc-pre-matric",
    name: "Pre-Matric Scholarship for OBC/EBC/DNT Students (PM-YASASVI)",
    ministry: "Dept. of Social Justice & Empowerment",
    categoryOk: category === "obc" || category === "ebc" || category === "dnt",
    categoryReason: "the student must belong to OBC, EBC or DNT",
    ceiling: INCOME_CEILING_OBC_EBC_DNT,
  });

  // Minority scheme: adds the 50% previous-marks condition.
  {
    const reasons = [];
    if (category !== "minority") {
      reasons.push("the student must belong to a notified minority community");
    }
    if (classReason) reasons.push(classReason);
    if (income > INCOME_CEILING_MINORITY) {
      reasons.push(
        `family income ${fmtInr(income)} exceeds the ${fmtInr(INCOME_CEILING_MINORITY)} ceiling`,
      );
    }
    if (prev !== null && prev < MINORITY_MIN_PREV_PERCENT) {
      reasons.push(
        `previous exam percentage ${prev}% is below the ${MINORITY_MIN_PREV_PERCENT}% minimum`,
      );
    }
    schemes.push({
      id: "minority-pre-matric",
      name: "Pre-Matric Scholarship for Minority Students",
      ministry: "Ministry of Minority Affairs",
      eligible: reasons.length === 0,
      reasons,
      criteria: `Classes ${MAIN_SCHEME_MIN_CLASS}-${MAIN_SCHEME_MAX_CLASS}, income up to ${fmtInr(INCOME_CEILING_MINORITY)}/year, ${MINORITY_MIN_PREV_PERCENT}%+ in previous exam`,
    });
  }

  // Hazardous-occupations component: classes 1-10, no income ceiling.
  {
    const reasons = [];
    if (!hazardousOccupation) {
      reasons.push(
        "a parent must be engaged in a notified hazardous occupation (manual scavenging, tanning, flaying, waste picking)",
      );
    }
    if (klass < HAZARDOUS_MIN_CLASS || klass > HAZARDOUS_MAX_CLASS) {
      reasons.push(
        `only classes ${HAZARDOUS_MIN_CLASS}-${HAZARDOUS_MAX_CLASS} are covered (student is in class ${klass})`,
      );
    }
    schemes.push({
      id: "hazardous-pre-matric",
      name: "Pre-Matric Scholarship for Children of Parents in Hazardous Occupations",
      ministry: "Dept. of Social Justice & Empowerment (SC scheme component)",
      eligible: reasons.length === 0,
      reasons,
      criteria: `Classes ${HAZARDOUS_MIN_CLASS}-${HAZARDOUS_MAX_CLASS}, no income ceiling`,
    });
  }

  return {
    schemes,
    eligibleCount: schemes.filter((s) => s.eligible).length,
    studentClass: klass,
    familyIncome: income,
  };
}
