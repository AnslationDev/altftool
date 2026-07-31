/**
 * Tie-breaking rules for major Indian competitive examinations.
 *
 * Every rule set below is the order published by the examining body itself, and
 * each is applied strictly in sequence: the first criterion on which the two
 * candidates differ settles the rank, and later criteria are never reached.
 *
 * Sources, and the caveats that go with them:
 *
 *  NEET UG (National Testing Agency). The information bulletin lists the order
 *  as: marks in Biology (Botany + Zoology), then Chemistry, then Physics, then
 *  the lower ratio of incorrect to correct answers across all subjects, then the
 *  same ratio within Biology, Chemistry and Physics in turn. NTA removed the
 *  age criterion and the computerised draw of lots that earlier sat at the end
 *  of this list, so identical candidates now share a rank.
 *
 *  JEE Main (National Testing Agency). The order is: NTA score in Mathematics,
 *  then Physics, then Chemistry, then the lower ratio of wrong to correct
 *  answers, then the older candidate. Candidates still tied are given the same
 *  rank.
 *
 *  UPSC Civil Services. Ties in the final merit are resolved under principles
 *  approved by the Commission, and the criterion applied is seniority in age —
 *  the older candidate is placed higher. Confirm against the Rules notified for
 *  your examination year.
 *
 *  SSC. The Commission's standard tie-break, used across CGL, CHSL and MTS, is:
 *  total marks in the final stage, then marks in the earlier tier, then date of
 *  birth with the older candidate placed higher, then alphabetical order of the
 *  candidate's first name. Two candidates can still share an identical first
 *  name, so this explainer adds each candidate's roll or registration number —
 *  guaranteed unique by the Commission — as a final differentiator after that,
 *  so the tool's own "no shared rank" claim always holds.
 *
 *  IBPS and SBI. The recruitment advertisements provide that candidates with
 *  equal final merit marks are ranked by age in descending order, so the older
 *  candidate is placed higher, and alphabetical order of name is used after
 *  that.
 *
 * Examining bodies revise these lists — NEET's changed twice in three years —
 * so treat this as an explainer and confirm the current order in the bulletin
 * or notice for your examination year.
 */

/**
 * Ratio of incorrect to correct answers, as used by NTA.
 * @returns {number|null} the ratio, 0 when nothing was answered, or null when a
 * candidate has wrong answers but no correct ones (no finite ratio exists; that
 * candidate is treated as having the worse ratio).
 */
export function wrongToCorrectRatio(wrong, correct) {
  if (!Number.isFinite(wrong) || !Number.isFinite(correct)) return null;
  if (wrong < 0 || correct < 0) return null;
  if (correct === 0) return wrong === 0 ? 0 : null;
  return wrong / correct;
}

/**
 * Turn an ISO date (yyyy-mm-dd) into a sortable integer yyyymmdd.
 * @returns {number|null} null when the string is not a valid calendar date.
 */
export function dateOrderKey(iso) {
  if (typeof iso !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day > daysInMonth) return null;
  return year * 10000 + month * 100 + day;
}

/** Comparison kinds a criterion can use. */
const HIGHER_WINS = "higher";
const LOWER_WINS = "lower";
const OLDER_WINS = "older";
const EARLIER_ALPHABET_WINS = "alphabetical";

/** Published rule sets, in the order the bodies apply them. */
export const TIE_BREAK_RULES = [
  {
    key: "neet-ug",
    label: "NEET UG",
    authority: "National Testing Agency",
    note: "NTA removed the age criterion and the draw of lots from 2024, so candidates identical on every criterion share a rank.",
    tail: "If the overall ratio is also identical, the bulletin continues with the incorrect-to-correct ratio within Biology, then Chemistry, then Physics.",
    fields: [
      { key: "biology", label: "Biology marks (Botany + Zoology)", kind: "number", step: 1 },
      { key: "chemistry", label: "Chemistry marks", kind: "number", step: 1 },
      { key: "physics", label: "Physics marks", kind: "number", step: 1 },
      { key: "correct", label: "Correct answers, all subjects", kind: "number", step: 1 },
      { key: "wrong", label: "Incorrect answers, all subjects", kind: "number", step: 1 },
      { key: "biologyCorrect", label: "Correct answers in Biology", kind: "number", step: 1 },
      { key: "biologyWrong", label: "Incorrect answers in Biology", kind: "number", step: 1 },
      { key: "chemistryCorrect", label: "Correct answers in Chemistry", kind: "number", step: 1 },
      { key: "chemistryWrong", label: "Incorrect answers in Chemistry", kind: "number", step: 1 },
      { key: "physicsCorrect", label: "Correct answers in Physics", kind: "number", step: 1 },
      { key: "physicsWrong", label: "Incorrect answers in Physics", kind: "number", step: 1 },
    ],
    criteria: [
      { key: "biology", label: "Higher marks in Biology", mode: HIGHER_WINS, field: "biology" },
      { key: "chemistry", label: "Higher marks in Chemistry", mode: HIGHER_WINS, field: "chemistry" },
      { key: "physics", label: "Higher marks in Physics", mode: HIGHER_WINS, field: "physics" },
      {
        key: "ratio",
        label: "Lower ratio of incorrect to correct answers",
        mode: LOWER_WINS,
        derive: (candidate) => wrongToCorrectRatio(candidate.wrong, candidate.correct),
        format: (value) => (value === null ? "no correct answers" : value.toFixed(3)),
      },
      {
        key: "biologyRatio",
        label: "Lower ratio of incorrect to correct answers in Biology",
        mode: LOWER_WINS,
        derive: (candidate) => wrongToCorrectRatio(candidate.biologyWrong, candidate.biologyCorrect),
        format: (value) => (value === null ? "no correct answers" : value.toFixed(3)),
      },
      {
        key: "chemistryRatio",
        label: "Lower ratio of incorrect to correct answers in Chemistry",
        mode: LOWER_WINS,
        derive: (candidate) => wrongToCorrectRatio(candidate.chemistryWrong, candidate.chemistryCorrect),
        format: (value) => (value === null ? "no correct answers" : value.toFixed(3)),
      },
      {
        key: "physicsRatio",
        label: "Lower ratio of incorrect to correct answers in Physics",
        mode: LOWER_WINS,
        derive: (candidate) => wrongToCorrectRatio(candidate.physicsWrong, candidate.physicsCorrect),
        format: (value) => (value === null ? "no correct answers" : value.toFixed(3)),
      },
    ],
    example: {
      a: {
        name: "Candidate A",
        biology: 340,
        chemistry: 160,
        physics: 140,
        correct: 163,
        wrong: 12,
        biologyCorrect: 86,
        biologyWrong: 4,
        chemistryCorrect: 41,
        chemistryWrong: 4,
        physicsCorrect: 36,
        physicsWrong: 4,
      },
      b: {
        name: "Candidate B",
        biology: 336,
        chemistry: 164,
        physics: 140,
        correct: 161,
        wrong: 4,
        biologyCorrect: 85,
        biologyWrong: 4,
        chemistryCorrect: 41,
        chemistryWrong: 0,
        physicsCorrect: 35,
        physicsWrong: 0,
      },
      story:
        "Both score 640. Biology is checked first, so the candidate with 340 in Biology takes the better rank even though the other has the cleaner answer ratio.",
    },
  },
  {
    key: "jee-main",
    label: "JEE Main",
    authority: "National Testing Agency",
    note: "Applied to the NTA score in each subject. Candidates still tied after every criterion are given the same rank.",
    tail: "Candidates identical on all five criteria are allotted the same rank.",
    fields: [
      { key: "maths", label: "NTA score in Mathematics", kind: "number", step: 0.0001 },
      { key: "physics", label: "NTA score in Physics", kind: "number", step: 0.0001 },
      { key: "chemistry", label: "NTA score in Chemistry", kind: "number", step: 0.0001 },
      { key: "correct", label: "Correct answers", kind: "number", step: 1 },
      { key: "wrong", label: "Incorrect answers", kind: "number", step: 1 },
      { key: "dob", label: "Date of birth", kind: "date" },
    ],
    criteria: [
      { key: "maths", label: "Higher NTA score in Mathematics", mode: HIGHER_WINS, field: "maths" },
      { key: "physics", label: "Higher NTA score in Physics", mode: HIGHER_WINS, field: "physics" },
      { key: "chemistry", label: "Higher NTA score in Chemistry", mode: HIGHER_WINS, field: "chemistry" },
      {
        key: "ratio",
        label: "Lower ratio of wrong to correct answers",
        mode: LOWER_WINS,
        derive: (candidate) => wrongToCorrectRatio(candidate.wrong, candidate.correct),
        format: (value) => (value === null ? "no correct answers" : value.toFixed(3)),
      },
      { key: "dob", label: "Older in age", mode: OLDER_WINS, field: "dob" },
    ],
    example: {
      a: { name: "Candidate A", maths: 99.1204, physics: 98.4, chemistry: 97.2, correct: 62, wrong: 8, dob: "2007-03-14" },
      b: { name: "Candidate B", maths: 99.1204, physics: 98.9, chemistry: 96.7, correct: 63, wrong: 7, dob: "2006-11-02" },
      story:
        "Mathematics is identical to four decimal places, so Physics decides it — the higher Physics score wins before the answer ratio or age is ever looked at.",
    },
  },
  {
    key: "upsc-cse",
    label: "UPSC Civil Services",
    authority: "Union Public Service Commission",
    note: "The Commission resolves ties in the final merit under principles it approves; seniority in age is the criterion applied.",
    tail: "Where age is also identical, the Commission's decision on the order is final.",
    fields: [
      { key: "aggregate", label: "Final merit marks (Mains + Personality Test)", kind: "number", step: 1 },
      { key: "dob", label: "Date of birth", kind: "date" },
    ],
    criteria: [
      { key: "aggregate", label: "Higher aggregate marks", mode: HIGHER_WINS, field: "aggregate" },
      { key: "dob", label: "Older in age", mode: OLDER_WINS, field: "dob" },
    ],
    example: {
      a: { name: "Candidate A", aggregate: 1030, dob: "1997-08-21" },
      b: { name: "Candidate B", aggregate: 1030, dob: "1999-02-05" },
      story: "Identical aggregates of 1030, so the candidate born in 1997 is placed higher on age seniority.",
    },
  },
  {
    key: "ssc",
    label: "SSC (CGL, CHSL, MTS)",
    authority: "Staff Selection Commission",
    note: "SSC applies the same sequence across its recruitments: final stage total, then the earlier tier, then age, then name.",
    tail: "Alphabetical order of the first name is SSC's published last resort. Two candidates can still share an identical first name, so this tool adds each candidate's roll or registration number — always unique per candidate — as a final differentiator, so no two candidates can end on the same rank here.",
    fields: [
      { key: "aggregate", label: "Final stage total marks", kind: "number", step: 0.25 },
      { key: "tier1", label: "Marks in the earlier tier", kind: "number", step: 0.25 },
      { key: "dob", label: "Date of birth", kind: "date" },
      { key: "firstName", label: "First name", kind: "text" },
      { key: "rollNumber", label: "Roll / registration number", kind: "text" },
    ],
    criteria: [
      { key: "aggregate", label: "Higher total in the final stage", mode: HIGHER_WINS, field: "aggregate" },
      { key: "tier1", label: "Higher marks in the earlier tier", mode: HIGHER_WINS, field: "tier1" },
      { key: "dob", label: "Older in age", mode: OLDER_WINS, field: "dob" },
      { key: "firstName", label: "Alphabetical order of the first name", mode: EARLIER_ALPHABET_WINS, field: "firstName" },
      {
        key: "rollNumber",
        label: "Roll / registration number (unique per candidate; final differentiator)",
        mode: EARLIER_ALPHABET_WINS,
        field: "rollNumber",
      },
    ],
    example: {
      a: {
        name: "Candidate A",
        aggregate: 372.5,
        tier1: 148.5,
        dob: "1998-06-09",
        firstName: "Anita",
        rollNumber: "3211045820456",
      },
      b: {
        name: "Candidate B",
        aggregate: 372.5,
        tier1: 152.25,
        dob: "1996-01-30",
        firstName: "Bilal",
        rollNumber: "3211045820391",
      },
      story:
        "Equal final totals, so the earlier tier decides: the 152.25 beats the 148.5 and neither age, name nor roll number is reached.",
    },
  },
  {
    key: "ibps-sbi",
    label: "IBPS / SBI recruitment",
    authority: "IBPS and State Bank of India",
    note: "The advertisements rank candidates with equal merit marks by age in descending order, so the older candidate is placed higher.",
    tail: "Alphabetical order of name is used only if merit marks and date of birth are both identical.",
    fields: [
      { key: "merit", label: "Final merit marks", kind: "number", step: 0.01 },
      { key: "dob", label: "Date of birth", kind: "date" },
      { key: "firstName", label: "First name", kind: "text" },
    ],
    criteria: [
      { key: "merit", label: "Higher final merit marks", mode: HIGHER_WINS, field: "merit" },
      { key: "dob", label: "Older in age", mode: OLDER_WINS, field: "dob" },
      { key: "firstName", label: "Alphabetical order of the name", mode: EARLIER_ALPHABET_WINS, field: "firstName" },
    ],
    example: {
      a: { name: "Candidate A", merit: 67.33, dob: "1997-12-11", firstName: "Kavya" },
      b: { name: "Candidate B", merit: 67.33, dob: "2000-04-25", firstName: "Aman" },
      story: "Merit marks match to two decimals, so the 1997 date of birth wins — the alphabetical rule is never reached.",
    },
  },
];

/** Look up a rule set by key. */
export function getRuleSet(key) {
  return TIE_BREAK_RULES.find((rule) => rule.key === key) ?? null;
}

function valueFor(criterion, candidate) {
  if (typeof criterion.derive === "function") return criterion.derive(candidate);
  return candidate[criterion.field];
}

/**
 * Compare one criterion.
 * @returns {{ winner: "A"|"B"|null, reason: string|null }} winner is null when
 * the criterion cannot separate the two candidates.
 */
function compareCriterion(criterion, a, b) {
  const aValue = valueFor(criterion, a);
  const bValue = valueFor(criterion, b);

  if (criterion.mode === HIGHER_WINS || criterion.mode === LOWER_WINS) {
    const aNull = aValue === null || aValue === undefined || !Number.isFinite(Number(aValue));
    const bNull = bValue === null || bValue === undefined || !Number.isFinite(Number(bValue));
    // A null ratio means "wrong answers but no correct ones" — the worst case.
    if (aNull && bNull) return { winner: null, aValue, bValue };
    if (aNull) return { winner: "B", aValue, bValue };
    if (bNull) return { winner: "A", aValue, bValue };
    const aNum = Number(aValue);
    const bNum = Number(bValue);
    if (aNum === bNum) return { winner: null, aValue, bValue };
    const aWins = criterion.mode === HIGHER_WINS ? aNum > bNum : aNum < bNum;
    return { winner: aWins ? "A" : "B", aValue, bValue };
  }

  if (criterion.mode === OLDER_WINS) {
    const aKey = dateOrderKey(aValue);
    const bKey = dateOrderKey(bValue);
    if (aKey === null && bKey === null) return { winner: null, aValue, bValue };
    if (aKey === null) return { winner: "B", aValue, bValue };
    if (bKey === null) return { winner: "A", aValue, bValue };
    if (aKey === bKey) return { winner: null, aValue, bValue };
    // Older means the earlier date of birth.
    return { winner: aKey < bKey ? "A" : "B", aValue, bValue };
  }

  if (criterion.mode === EARLIER_ALPHABET_WINS) {
    const aName = String(aValue ?? "").trim().toLocaleUpperCase("en-IN");
    const bName = String(bValue ?? "").trim().toLocaleUpperCase("en-IN");
    if (aName === "" && bName === "") return { winner: null, aValue, bValue };
    if (aName === "") return { winner: "B", aValue, bValue };
    if (bName === "") return { winner: "A", aValue, bValue };
    if (aName === bName) return { winner: null, aValue, bValue };
    return { winner: aName < bName ? "A" : "B", aValue, bValue };
  }

  return { winner: null, aValue, bValue };
}

/**
 * Run a rule set against two candidates.
 *
 * @param {object} input
 * @param {string} input.examKey   key from TIE_BREAK_RULES
 * @param {object} input.candidateA field values for the first candidate
 * @param {object} input.candidateB field values for the second candidate
 * @returns {object} { rule, steps, winner, decidedBy } or { error }
 */
export function resolveTie({ examKey, candidateA, candidateB } = {}) {
  const rule = getRuleSet(examKey);
  if (!rule) return { error: "Pick one of the listed examinations." };
  if (!candidateA || typeof candidateA !== "object" || !candidateB || typeof candidateB !== "object") {
    return { error: "Enter details for both candidates." };
  }

  for (const field of rule.fields) {
    for (const [side, candidate] of [
      ["Candidate A", candidateA],
      ["Candidate B", candidateB],
    ]) {
      const raw = candidate[field.key];
      if (field.kind === "number") {
        if (typeof raw !== "number" || !Number.isFinite(raw)) {
          return { error: `${side}: enter a number for "${field.label}".` };
        }
        if (raw < 0) return { error: `${side}: "${field.label}" cannot be negative.` };
      }
      if (field.kind === "date" && dateOrderKey(raw) === null) {
        return { error: `${side}: enter a valid date of birth as yyyy-mm-dd.` };
      }
      if (field.kind === "text" && String(raw ?? "").trim() === "") {
        return { error: `${side}: enter a value for "${field.label}".` };
      }
    }
  }

  const steps = [];
  let winner = null;
  let decidedBy = null;

  for (const criterion of rule.criteria) {
    const outcome = compareCriterion(criterion, candidateA, candidateB);
    const format = criterion.format ?? ((value) => (value === null || value === undefined ? "—" : String(value)));
    const step = {
      key: criterion.key,
      label: criterion.label,
      aDisplay: format(outcome.aValue),
      bDisplay: format(outcome.bValue),
      aValue: outcome.aValue,
      bValue: outcome.bValue,
      decided: outcome.winner !== null,
      winner: outcome.winner,
      reached: winner === null,
    };
    steps.push(step);
    if (winner === null && outcome.winner !== null) {
      winner = outcome.winner;
      decidedBy = criterion.label;
    }
  }

  return {
    rule,
    steps,
    winner,
    decidedBy,
    tied: winner === null,
    criteriaUsed: winner === null ? rule.criteria.length : steps.findIndex((step) => step.decided) + 1,
  };
}
