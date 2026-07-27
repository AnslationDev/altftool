/**
 * Girl Child Scholarship Finder — a rules-driven filter over major Indian
 * scholarship / incentive schemes that are specifically for girl students.
 *
 * Every scheme entry cites its administering body. Amounts and ceilings are the
 * widely published scheme figures; where a figure is revised periodically the
 * text describes the rule instead of pinning a stale number. Always confirm the
 * current year's guidelines on the National Scholarship Portal (NSP) or the
 * scheme's own portal before applying.
 */

/** Study-level codes used across the scheme table. */
export const LEVELS = [
  { id: "primary", label: "Primary / upper primary (Class 1-8)" },
  { id: "secondary", label: "Secondary (Class 9-10)" },
  { id: "senior-secondary", label: "Senior secondary (Class 11-12)" },
  { id: "undergraduate", label: "Undergraduate (degree / diploma)" },
  { id: "postgraduate", label: "Postgraduate" },
  { id: "technical", label: "Technical / professional (AICTE courses)" },
];

/** Community codes. "any" on a scheme means no community restriction. */
export const COMMUNITIES = [
  { id: "general", label: "General / unreserved" },
  { id: "sc", label: "Scheduled Caste (SC)" },
  { id: "st", label: "Scheduled Tribe (ST)" },
  { id: "obc", label: "Other Backward Class (OBC)" },
  { id: "minority", label: "Notified minority community" },
];

/** States with girl-specific state schemes included in this table. */
export const STATES = [
  { id: "any", label: "Any state / all-India" },
  { id: "wb", label: "West Bengal" },
  { id: "bihar", label: "Bihar" },
];

/**
 * Scheme table.
 * incomeCeiling: annual family income ceiling in INR, or null when the scheme
 * has no published income bar. communities: null means open to all communities.
 * state: null means an all-India / central scheme.
 */
export const SCHEMES = [
  {
    id: "nsigse",
    name: "National Scheme of Incentive to Girls for Secondary Education (NSIGSE)",
    provider: "Ministry of Education, Government of India",
    levels: ["secondary"],
    // NSIGSE guidelines: Rs 3,000 deposited as a fixed deposit in the girl's
    // name on enrolment in Class IX; withdrawable with interest at age 18
    // after passing Class X.
    amount: "Rs 3,000 one-time fixed deposit, withdrawable at 18 after Class 10",
    incomeCeiling: null,
    communities: ["sc", "st"],
    singleGirlChildOnly: false,
    state: null,
    notes:
      "For SC/ST girls (and girls passing Class 8 from Kasturba Gandhi Balika Vidyalayas) who enrol in Class 9; girl must be unmarried and below 16 at enrolment.",
  },
  {
    id: "bhmns",
    name: "Begum Hazrat Mahal National Scholarship",
    provider: "Maulana Azad Education Foundation, Ministry of Minority Affairs",
    levels: ["secondary", "senior-secondary"],
    // Published scheme rates: Rs 5,000 per annum for Classes 9-10 and
    // Rs 6,000 per annum for Classes 11-12.
    amount: "Rs 5,000/yr (Class 9-10); Rs 6,000/yr (Class 11-12)",
    // Scheme guideline: total annual income of parents/guardian not to exceed
    // Rs 2,00,000.
    incomeCeiling: 200000,
    communities: ["minority"],
    singleGirlChildOnly: false,
    state: null,
    notes:
      "For meritorious girls of the six notified minority communities; requires at least 50% marks in the previous class.",
  },
  {
    id: "cbse-sgc",
    name: "CBSE Merit Scholarship for Single Girl Child",
    provider: "Central Board of Secondary Education",
    levels: ["senior-secondary"],
    // CBSE scheme rate: Rs 500 per month for up to two years in Classes 11-12.
    amount: "Rs 500 per month for Classes 11-12 (up to 2 years)",
    incomeCeiling: null,
    communities: null,
    singleGirlChildOnly: true,
    state: null,
    notes:
      "For single girl children who scored 60%+ in CBSE Class 10 and whose Class 10 tuition fee did not exceed Rs 1,500 per month.",
  },
  {
    id: "pragati",
    name: "AICTE Pragati Scholarship for Girls",
    provider: "All India Council for Technical Education (AICTE)",
    levels: ["technical", "undergraduate"],
    // AICTE Pragati guidelines: Rs 50,000 per annum for every year of the
    // approved degree/diploma course; up to two girls per family.
    amount: "Rs 50,000 per year of the AICTE-approved course",
    // Pragati eligibility: annual family income not more than Rs 8,00,000.
    incomeCeiling: 800000,
    communities: null,
    singleGirlChildOnly: false,
    state: null,
    notes:
      "For girls admitted to AICTE-approved degree or diploma technical courses; maximum two girl children per family.",
  },
  {
    id: "ugc-sgc-pg",
    name: "Post Graduate Indira Gandhi Scholarship for Single Girl Child",
    provider: "University Grants Commission (UGC)",
    levels: ["postgraduate"],
    // UGC scheme rate: Rs 36,200 per annum for the two-year non-professional
    // PG programme.
    amount: "Rs 36,200 per year for 2 years of PG study",
    incomeCeiling: null,
    communities: null,
    singleGirlChildOnly: true,
    state: null,
    notes:
      "For a single girl child (no brother; twin/fraternal sisters allowed) up to age 30 at admission to a full-time non-professional PG course.",
  },
  {
    id: "bsy",
    name: "Balika Samridhi Yojana",
    provider: "Ministry of Women and Child Development",
    levels: ["primary", "secondary"],
    // BSY guidelines: Rs 500 post-birth grant, then annual scholarships that
    // step from Rs 300 (Class 1-3) up to Rs 1,000 (Class 10).
    amount: "Rs 500 at birth plus Rs 300-Rs 1,000 per year from Class 1 to 10",
    incomeCeiling: null,
    communities: null,
    singleGirlChildOnly: false,
    state: null,
    notes:
      "For girls born on or after 15 Aug 1997 in families below the poverty line (BPL); covers up to two girls per family. BPL status replaces an income-figure test.",
  },
  {
    id: "kanyashree",
    name: "Kanyashree Prakalpa (K1 and K2)",
    provider: "Government of West Bengal",
    levels: ["secondary", "senior-secondary", "undergraduate"],
    // Kanyashree rates: K1 annual grant Rs 1,000 for unmarried girls aged
    // 13-18 in education; K2 one-time grant Rs 25,000 at age 18.
    amount: "Rs 1,000/yr (age 13-18, K1); Rs 25,000 one-time at 18 (K2)",
    // Historical scheme ceiling Rs 1,20,000; the state has relaxed it in
    // later years, so treat it as indicative and check the current notification.
    incomeCeiling: 120000,
    communities: null,
    singleGirlChildOnly: false,
    state: "wb",
    notes:
      "West Bengal scheme for unmarried girls in education; the income ceiling has been relaxed by later notifications — verify the current rule on the Kanyashree portal.",
  },
  {
    id: "mkuy",
    name: "Mukhyamantri Kanya Utthan Yojana",
    provider: "Government of Bihar",
    levels: ["undergraduate"],
    amount: "One-time grant on passing graduation (Rs 50,000 under revised rates)",
    incomeCeiling: null,
    communities: null,
    singleGirlChildOnly: false,
    state: "bihar",
    notes:
      "Bihar scheme paying a one-time amount to girls on passing graduation; also gives staged payments at earlier milestones. Confirm the current rate on the state portal.",
  },
];

/**
 * Filter the scheme table for one student's profile.
 *
 * @param {object} input
 * @param {string} input.level             One of LEVELS ids.
 * @param {number|null} input.annualIncome Annual family income in INR; null/"" = not stated.
 * @param {string} input.community         One of COMMUNITIES ids.
 * @param {boolean} input.singleGirlChild  True when the student is a single girl child.
 * @param {string} input.state             One of STATES ids ("any" = no state scheme match wanted).
 * @returns {{eligible: object[], ineligible: {scheme: object, reasons: string[]}[]}|{error: string}}
 */
export function filterSchemes({ level, annualIncome, community, singleGirlChild, state }) {
  if (!LEVELS.some((l) => l.id === level)) {
    return { error: "Choose the study level you are looking for." };
  }
  if (!COMMUNITIES.some((c) => c.id === community)) {
    return { error: "Choose the community category that applies." };
  }
  if (!STATES.some((s) => s.id === state)) {
    return { error: "Choose your state." };
  }

  let income = null;
  if (annualIncome !== null && annualIncome !== undefined && annualIncome !== "") {
    income = Number(annualIncome);
    if (!Number.isFinite(income)) {
      return { error: "Enter the annual family income as a number, or leave it blank." };
    }
    if (income < 0) {
      return { error: "Annual family income cannot be negative." };
    }
  }

  const eligible = [];
  const ineligible = [];

  for (const scheme of SCHEMES) {
    const reasons = [];

    if (!scheme.levels.includes(level)) {
      reasons.push("Not offered at the selected study level.");
    }
    if (scheme.communities && !scheme.communities.includes(community)) {
      const wanted = scheme.communities.map((c) => c.toUpperCase()).join(" / ");
      reasons.push(`Restricted to ${wanted} students.`);
    }
    if (scheme.singleGirlChildOnly && !singleGirlChild) {
      reasons.push("Only for a single girl child of her parents.");
    }
    if (scheme.state && scheme.state !== state) {
      const stateLabel = STATES.find((s) => s.id === scheme.state)?.label ?? scheme.state;
      reasons.push(`State scheme — only for students in ${stateLabel}.`);
    }
    if (scheme.incomeCeiling !== null && income !== null && income > scheme.incomeCeiling) {
      reasons.push(
        `Family income exceeds the scheme ceiling of Rs ${scheme.incomeCeiling.toLocaleString("en-IN")}.`,
      );
    }

    if (reasons.length === 0) {
      eligible.push(scheme);
    } else {
      ineligible.push({ scheme, reasons });
    }
  }

  return { eligible, ineligible };
}
