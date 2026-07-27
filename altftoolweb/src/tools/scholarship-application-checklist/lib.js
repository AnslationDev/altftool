/**
 * Scholarship application checklist — National Scholarships Portal and state portals.
 *
 * Rule sources (scheme guidelines published by the administering ministries, and the
 * standing operating rules of the National Scholarships Portal):
 *
 *  - One scholarship only. A student who is eligible for more than one scheme may hold
 *    only one at a time. NSP enforces this, and drawing two is treated as a recovery
 *    case.
 *
 *  - Payment is by Direct Benefit Transfer through PFMS into an Aadhaar-seeded bank
 *    account in the STUDENT'S own name. A parent's account, or an account where the
 *    Aadhaar seeding is with the bank but not with NPCI, is the single commonest reason
 *    a sanctioned scholarship never arrives.
 *
 *  - The application is not complete when the student submits it. It goes to the
 *    Institute Nodal Officer for verification and then to the state or ministry level,
 *    and each level has its own last date, usually a few weeks after the student's.
 *
 *  - Income is family income — both parents together, from all sources — certified by a
 *    competent revenue authority such as a Tehsildar. A self-declaration or an
 *    employer's letter is not accepted for the central schemes.
 *
 *  - Income ceilings, from the scheme guidelines:
 *      Post-Matric and Pre-Matric Scholarship for SC students: ₹2,50,000 a year.
 *      Post-Matric and Pre-Matric Scholarship for OBC students: ₹2,50,000 a year.
 *      PM-YASASVI for OBC, EBC and DNT students: ₹2,50,000 a year.
 *      National Means-cum-Merit Scholarship: ₹3,50,000 a year.
 *      Central Sector Scheme of Scholarship for College and University Students:
 *        ₹4,50,000 a year.
 *      AICTE Pragati (girl students) and Saksham (students with disability):
 *        ₹8,00,000 a year.
 *
 *  - The Central Sector Scheme is awarded to students in the top 20 percentile of
 *    successful candidates in their own class 12 board and stream, and pays ₹12,000 a
 *    year for the first three years of a degree and ₹20,000 a year in the fourth and
 *    fifth years of a professional course.
 *
 *  - Post-matric rates differ for hostellers and day scholars, so the institute has to
 *    certify which one you are.
 *
 * Guidelines are revised from time to time. This is informational only — read the
 * current guideline PDF for the scheme and year you are applying under.
 */

/** Upper bound on the income this tool will accept, to keep the arithmetic sane. */
export const MAX_INCOME = 100000000;

export const SCHEMES = [
  {
    id: "sc-post-matric",
    label: "Post-Matric Scholarship for SC students",
    level: "Class 11 onwards, including degree and postgraduate courses",
    incomeCeiling: 250000,
    benefit: "Course fees plus a monthly maintenance allowance, at rates that differ for hostellers and day scholars",
    community: ["sc"],
    extras: ["casteCert", "feeReceipt", "hostelStatus", "prevMarksheet"],
  },
  {
    id: "sc-pre-matric",
    label: "Pre-Matric Scholarship for SC students",
    level: "Classes 9 and 10",
    incomeCeiling: 250000,
    benefit: "A fixed monthly stipend for ten months plus an annual books and ad-hoc grant",
    community: ["sc"],
    extras: ["casteCert", "hostelStatus", "prevMarksheet"],
  },
  {
    id: "obc-post-matric",
    label: "Post-Matric Scholarship for OBC students",
    level: "Class 11 onwards",
    incomeCeiling: 250000,
    benefit: "Course fees and maintenance allowance at the notified rates",
    community: ["obc"],
    extras: ["casteCert", "feeReceipt", "hostelStatus", "prevMarksheet"],
  },
  {
    id: "yasasvi",
    label: "PM-YASASVI for OBC, EBC and DNT students",
    level: "School and higher education streams under the scheme",
    incomeCeiling: 250000,
    benefit: "Scholarship at the rates notified for the component you apply under",
    community: ["obc", "ebc", "dnt"],
    extras: ["casteCert", "prevMarksheet"],
  },
  {
    id: "nmmss",
    label: "National Means-cum-Merit Scholarship (NMMSS)",
    level: "Classes 9 to 12, after clearing the class 8 selection test",
    incomeCeiling: 350000,
    benefit: "An annual scholarship paid for four years, conditional on continuing in a government or aided school",
    community: [],
    extras: ["selectionTestResult", "prevMarksheet", "govtSchoolProof"],
  },
  {
    id: "csss",
    label: "Central Sector Scheme for College and University Students",
    level: "First year of a degree course, straight after class 12",
    incomeCeiling: 450000,
    benefit: "₹12,000 a year for the first three years and ₹20,000 a year in the fourth and fifth years of a professional course",
    community: [],
    extras: ["boardResult", "percentileProof", "feeReceipt"],
  },
  {
    id: "pragati-saksham",
    label: "AICTE Pragati / Saksham",
    level: "AICTE-approved degree or diploma in a technical course",
    incomeCeiling: 800000,
    benefit: "An annual amount towards fees and a contingency allowance, for the sanctioned duration",
    community: [],
    extras: ["aicteInstituteProof", "prevMarksheet", "feeReceipt"],
  },
  {
    id: "state",
    label: "A state scholarship portal scheme",
    level: "As notified by the state department",
    incomeCeiling: 250000,
    benefit: "As notified — most states mirror the central post-matric structure",
    community: [],
    extras: ["domicile", "feeReceipt", "prevMarksheet"],
  },
];

export const COMMUNITIES = [
  { id: "general", label: "General" },
  { id: "ews", label: "EWS" },
  { id: "obc", label: "OBC" },
  { id: "ebc", label: "EBC" },
  { id: "dnt", label: "Denotified / Nomadic Tribe" },
  { id: "sc", label: "Scheduled Caste" },
  { id: "st", label: "Scheduled Tribe" },
];

const DOCUMENT_LIBRARY = {
  aadhaar: {
    label: "Aadhaar number, or the Aadhaar Enrolment ID where Aadhaar is not yet issued",
    group: "Identity",
    detail: "NSP verifies the name and date of birth against Aadhaar, so any mismatch has to be corrected first.",
  },
  bankAccount: {
    label: "Bank account in the student's own name, Aadhaar-seeded and DBT-enabled",
    group: "Payment",
    detail:
      "Seeding with the bank is not enough — the account has to be mapped to Aadhaar at NPCI, which is what DBT payments look up.",
  },
  incomeCert: {
    label: "Family income certificate from a competent revenue authority",
    group: "Income",
    detail: "Issued by a Tehsildar or equivalent for the current year. Employer letters and self-declarations are refused.",
  },
  prevMarksheet: {
    label: "Marksheet of the last examination passed",
    group: "Academics",
    detail: "For a renewal this must show promotion to the next class or year.",
  },
  bonafide: {
    label: "Bonafide student certificate from the institution",
    group: "Institution",
    detail: "Needed in particular where the student is studying outside their home state.",
  },
  feeReceipt: {
    label: "Fee receipt for the current year, showing tuition and other heads separately",
    group: "Institution",
    detail: "Post-matric reimbursement is calculated head by head, so a lump-sum receipt causes queries.",
  },
  hostelStatus: {
    label: "Institute certificate of hosteller or day-scholar status",
    group: "Institution",
    detail: "The maintenance allowance differs for the two, so the institute has to state which you are.",
  },
  casteCert: {
    label: "Caste or community certificate in the prescribed format",
    group: "Category",
    detail: "Issued by the competent authority of the state where the family is notified.",
  },
  disabilityCert: {
    label: "Disability certificate showing 40% or more benchmark disability",
    group: "Category",
    detail: "Needed for Saksham and for any disability component of a state scheme.",
  },
  domicile: {
    label: "Domicile or residence certificate for the state",
    group: "Category",
    detail: "State portals almost always restrict their schemes to domiciled students.",
  },
  selectionTestResult: {
    label: "NMMS selection test result showing qualification",
    group: "Academics",
    detail: "The state conducts the test in class 8; the scholarship depends on it and on continuing in a government or aided school.",
  },
  govtSchoolProof: {
    label: "Proof that the school is a government, local body or government-aided school",
    group: "Institution",
    detail: "NMMSS is withdrawn if the student moves to a private unaided school.",
  },
  boardResult: {
    label: "Class 12 board marksheet",
    group: "Academics",
    detail: "The percentile is worked out board by board and stream by stream, from the successful candidates only.",
  },
  percentileProof: {
    label: "Confirmation that you fall in the top 20 percentile of your board and stream",
    group: "Academics",
    detail: "The board publishes the cut-off mark; being above your board's cut-off is what qualifies you, not a raw percentage.",
  },
  aicteInstituteProof: {
    label: "Proof that the institution and course are AICTE-approved",
    group: "Institution",
    detail: "Approval has to be live for the year of admission, not merely at some point in the past.",
  },
  selfDeclaration: {
    label: "Self-declaration that no other scholarship is being drawn",
    group: "Declarations",
    detail: "A student may hold only one scholarship at a time; drawing two becomes a recovery case.",
  },
};

const round0 = (value) => Math.round(value);

const INR_FORMAT = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
/** Format a rupee figure for the plain-language messages this module returns. */
const inr = (value) => INR_FORMAT.format(Number.isFinite(value) ? value : 0);

/**
 * Test family income against a scheme's ceiling.
 *
 * @param {number} familyIncome  Annual family income in rupees.
 * @param {number} ceiling       The scheme's ceiling in rupees.
 * @returns {{income:number, ceiling:number, headroom:number, within:boolean, over:number}|{error:string}}
 */
export function testIncomeCeiling(familyIncome, ceiling) {
  const income = Number(familyIncome);
  const limit = Number(ceiling);
  if (!Number.isFinite(income)) {
    return { error: "Enter the annual family income as a number." };
  }
  if (income < 0) return { error: "Family income cannot be negative." };
  if (income > MAX_INCOME) {
    return { error: "That income is outside the range this checklist handles." };
  }
  if (!Number.isFinite(limit) || limit <= 0) {
    return { error: "The scheme has no usable income ceiling." };
  }
  // Guidelines word the bar as income "not exceeding" the ceiling, so the ceiling itself passes.
  const within = income <= limit;
  return {
    income: round0(income),
    ceiling: round0(limit),
    headroom: round0(limit - income),
    over: within ? 0 : round0(income - limit),
    within,
  };
}

/**
 * Build the scholarship application file.
 *
 * @param {object} input
 * @returns {object} result, or { error }.
 */
export function buildScholarshipChecklist({
  schemeId = "csss",
  familyIncome = 0,
  communityId = "general",
  renewal = false,
  studyingOutsideState = false,
  hasDisability = false,
  holdsAnotherScholarship = false,
} = {}) {
  const scheme = SCHEMES.find((entry) => entry.id === schemeId);
  if (!scheme) return { error: "Pick one of the listed scholarship schemes." };

  const community = COMMUNITIES.find((entry) => entry.id === communityId);
  if (!community) return { error: "Pick the community recorded on your certificate." };

  const incomeTest = testIncomeCeiling(familyIncome, scheme.incomeCeiling);
  if (incomeTest.error) return { error: incomeTest.error };

  const blockers = [];
  if (!incomeTest.within) {
    blockers.push({
      id: "income",
      title: "Family income is above the ceiling",
      detail: `${scheme.label} sets a family income ceiling of ${inr(scheme.incomeCeiling)} a year. Your figure is over it by ${inr(incomeTest.over)}, so the application will be rejected at verification even if the portal accepts it.`,
    });
  }
  if (scheme.community.length > 0 && !scheme.community.includes(communityId)) {
    blockers.push({
      id: "community",
      title: "The scheme is restricted to other communities",
      detail: `${scheme.label} is open to ${scheme.community
        .map((id) => (COMMUNITIES.find((entry) => entry.id === id) || {}).label || id)
        .join(", ")} candidates. Look for the scheme that matches your own certificate instead.`,
    });
  }
  if (holdsAnotherScholarship) {
    blockers.push({
      id: "duplicate",
      title: "Another scholarship is already being drawn",
      detail:
        "A student may hold only one scholarship at a time. Surrender the existing one before applying, or the second becomes a recovery case against you.",
    });
  }

  const docIds = ["aadhaar", "bankAccount", "incomeCert", ...scheme.extras, "selfDeclaration"];
  if (studyingOutsideState || !docIds.includes("bonafide")) docIds.push("bonafide");
  if (hasDisability) docIds.push("disabilityCert");
  if (renewal && !docIds.includes("prevMarksheet")) docIds.push("prevMarksheet");
  if (["sc", "st", "obc", "ebc", "dnt"].includes(communityId) && !docIds.includes("casteCert")) {
    docIds.push("casteCert");
  }

  const seen = new Set();
  const documents = [];
  docIds.forEach((id) => {
    const entry = DOCUMENT_LIBRARY[id];
    if (!entry || seen.has(id)) return;
    seen.add(id);
    documents.push({ id, required: true, ...entry });
  });

  const notes = [
    "Submitting the form is only the first step — the Institute Nodal Officer and then the state or ministry have to verify it, each inside their own later deadline.",
    "Payment reaches an Aadhaar-seeded, DBT-enabled account in the student's own name. Seeding at the bank is not the same as mapping at NPCI, which is what the payment looks up.",
  ];
  if (renewal) {
    notes.push(
      "A renewal needs the previous year's result showing promotion, and it lapses if you repeat a year or change to a course the scheme does not cover.",
    );
  }
  if (scheme.id === "csss") {
    notes.push(
      "The top 20 percentile is calculated on the successful candidates of your own board and stream, so the qualifying mark differs from board to board.",
    );
  }

  const eligible = blockers.length === 0;

  return {
    scheme,
    community,
    incomeTest,
    documents,
    blockers,
    notes,
    eligible,
    verdict: eligible
      ? `No bar found — assemble the ${documents.length} documents below and submit before the student-level last date.`
      : `${blockers.length} bar(s) apply. Clear these first; documents will not overcome them.`,
  };
}

/**
 * Progress against the document list.
 *
 * @param {Array<{id:string,required:boolean}>} documents
 * @param {Array<string>} haveIds
 */
export function computeReadiness(documents, haveIds) {
  const list = Array.isArray(documents) ? documents : [];
  const have = Array.isArray(haveIds) ? haveIds : [];
  const required = list.filter((doc) => doc.required !== false);
  const missing = required.filter((doc) => !have.includes(doc.id));
  const total = required.length;
  const held = total - missing.length;
  return {
    have: held,
    total,
    percent: total === 0 ? 0 : Math.round((held / total) * 100),
    missing,
    ready: total > 0 && missing.length === 0,
  };
}

export default buildScholarshipChecklist;
