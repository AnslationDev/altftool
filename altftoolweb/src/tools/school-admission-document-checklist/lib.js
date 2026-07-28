/**
 * School admission document checklist builder (India).
 *
 * Pure module: no React, no DOM, no clock reads. Dates arrive as ISO strings.
 * The document rules below cite the statute or board bye-law they come from.
 */

/**
 * Ministry of Education advisory (February 2022) aligned with NEP 2020: the
 * entry age for Class 1 is six years completed on the school's cut-off date.
 * Every higher class adds one year to that floor.
 */
export const CLASS_ONE_MIN_AGE_YEARS = 6;

/**
 * Most Indian schools use 31 March or 30 April of the admission year as the
 * age reckoning date. 31 March is the more common statutory choice.
 */
export const DEFAULT_CUTOFF_MONTH_DAY = "03-31";

/**
 * Right of Children to Free and Compulsory Education Act, 2009, section 12(1)(c):
 * unaided private schools reserve at least 25% of Class 1 (or pre-primary) seats
 * for children from weaker sections and disadvantaged groups.
 */
export const RTE_QUOTA_PERCENT = 25;

/** RTE Act, 2009, section 15: admission is open for an extended period of six months. */
export const RTE_EXTENDED_ADMISSION_MONTHS = 6;

export const BOARDS = [
  { key: "cbse", label: "CBSE" },
  { key: "cisce", label: "CISCE (ICSE / ISC)" },
  { key: "state", label: "State board" },
  { key: "ib", label: "IB (PYP / MYP / DP)" },
  { key: "cambridge", label: "Cambridge (IGCSE / A Level)" },
];

export const GRADES = [
  { key: "nursery", label: "Nursery / Playgroup", minAgeYears: 3 },
  { key: "lkg", label: "LKG", minAgeYears: 4 },
  { key: "ukg", label: "UKG", minAgeYears: 5 },
  { key: "c1", label: "Class 1", minAgeYears: CLASS_ONE_MIN_AGE_YEARS },
  { key: "c2to5", label: "Classes 2 to 5", minAgeYears: CLASS_ONE_MIN_AGE_YEARS + 1 },
  { key: "c6to8", label: "Classes 6 to 8", minAgeYears: CLASS_ONE_MIN_AGE_YEARS + 5 },
  { key: "c9to10", label: "Classes 9 and 10", minAgeYears: CLASS_ONE_MIN_AGE_YEARS + 8 },
  { key: "c11to12", label: "Classes 11 and 12", minAgeYears: CLASS_ONE_MIN_AGE_YEARS + 10 },
];

export const SCENARIOS = [
  { key: "fresh", label: "Fresh admission (first school)" },
  { key: "local", label: "Transfer within the same city or state" },
  { key: "interstate", label: "Transfer from another state" },
  { key: "boardchange", label: "Changing board (e.g. state board to CBSE)" },
  { key: "abroad", label: "Returning from a school abroad" },
  { key: "rte", label: `RTE ${RTE_QUOTA_PERCENT}% free-seat quota` },
  { key: "gap", label: "Rejoining after a study gap" },
];

export const EXTRA_FLAGS = [
  { key: "reserved", label: "Applying under SC / ST / OBC category" },
  { key: "ews", label: "Applying under EWS or economically weaker section" },
  { key: "disability", label: "Child has a certified disability" },
  { key: "singleParent", label: "Single parent, guardian or adopted child" },
  { key: "defence", label: "Defence, paramilitary or transferable government job quota" },
  { key: "sibling", label: "Sibling already studying in the school" },
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const clean = (value) => String(value ?? "").trim();

/** ISO yyyy-mm-dd -> UTC milliseconds, or null when the string is not a real date. */
export function toUtcMs(iso) {
  const text = clean(iso);
  if (!ISO_DATE.test(text)) return null;
  const [y, m, d] = text.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const ms = Date.UTC(y, m - 1, d);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) {
    return null;
  }
  return ms;
}

/**
 * Completed age between two dates, in whole years and months.
 * Returns null when either date is invalid or the reference date is earlier.
 */
export function ageOn(dobIso, referenceIso) {
  const dob = toUtcMs(dobIso);
  const ref = toUtcMs(referenceIso);
  if (dob === null || ref === null || ref < dob) return null;

  const a = new Date(dob);
  const b = new Date(ref);
  let years = b.getUTCFullYear() - a.getUTCFullYear();
  let months = b.getUTCMonth() - a.getUTCMonth();
  let days = b.getUTCDate() - a.getUTCDate();

  if (days < 0) {
    months -= 1;
    // days in the month preceding the reference date
    const prevMonthDays = new Date(
      Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), 0),
    ).getUTCDate();
    days += prevMonthDays;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days, totalMonths: years * 12 + months };
}

/**
 * Check the child's age against the entry floor for the chosen class.
 *
 * @returns {{status: "eligible"|"under"|"older", ageText: string, ...}|{error: string}}
 */
export function checkAgeEligibility({ dob, cutoffDate, gradeKey } = {}) {
  const grade = GRADES.find((item) => item.key === gradeKey);
  if (!grade) return { error: "Pick a class from the list." };
  if (toUtcMs(dob) === null) return { error: "Enter the child's date of birth as yyyy-mm-dd." };
  if (toUtcMs(cutoffDate) === null) {
    return { error: "Enter the school's age cut-off date as yyyy-mm-dd." };
  }

  const age = ageOn(dob, cutoffDate);
  if (!age) {
    return { error: "The cut-off date must fall on or after the child's date of birth." };
  }

  const requiredMonths = grade.minAgeYears * 12;
  const shortfallMonths = Math.max(0, requiredMonths - age.totalMonths);
  // Schools normally treat a child more than two years above the floor as an
  // over-age case needing age-appropriate placement under RTE section 4.
  const overBy = age.totalMonths - (requiredMonths + 24);

  let status = "eligible";
  if (shortfallMonths > 0) status = "under";
  else if (overBy > 0) status = "older";

  return {
    gradeLabel: grade.label,
    minAgeYears: grade.minAgeYears,
    years: age.years,
    months: age.months,
    totalMonths: age.totalMonths,
    shortfallMonths,
    status,
    ageText: `${age.years} years ${age.months} months`,
    message:
      status === "eligible"
        ? `Meets the ${grade.minAgeYears}-year entry floor for ${grade.label} on the cut-off date.`
        : status === "under"
          ? `Short by ${shortfallMonths} month${shortfallMonths === 1 ? "" : "s"} of the ${grade.minAgeYears}-year floor for ${grade.label}. Ask the school whether it applies a relaxation, or apply for the class below.`
          : `Above the usual band for ${grade.label}. Section 4 of the RTE Act, 2009 allows admission to an age-appropriate class with special training to catch up.`,
  };
}

const doc = (label, note = "", required = true) => ({ label, note, required });

const CORE_DOCS = [
  doc(
    "Birth certificate issued by the municipal authority",
    "Issued under the Registration of Births and Deaths Act, 1969. Section 14(2) of the RTE Act, 2009 says no child may be denied admission for want of age proof.",
  ),
  doc("Four to six recent passport-size photographs of the child"),
  doc(
    "Address proof of the parent or guardian",
    "Aadhaar, passport, voter ID, ration card, registered rent agreement or a recent utility bill.",
  ),
  doc("Photo identity proof of both parents or the legal guardian"),
  doc(
    "Immunisation or vaccination record",
    "Many states insist on the MCP card for pre-primary and Class 1 entry.",
    false,
  ),
  doc(
    "Aadhaar of the child, if available",
    "Useful for board registration and scholarship portals, but a school cannot refuse admission solely because Aadhaar is not produced.",
    false,
  ),
];

const GRADE_DOCS = {
  nursery: [doc("Parent interaction or orientation form issued by the school", "", false)],
  lkg: [doc("Pre-school progress card, if the child attended a playgroup", "", false)],
  ukg: [doc("LKG progress card from the previous school", "", false)],
  c1: [
    doc("Pre-primary report card or completion certificate, if the child attended one", "", false),
    doc("Transfer certificate from the pre-school, where the school issues one", "", false),
  ],
  c2to5: [
    doc("Transfer certificate (TC) from the previous school, in original"),
    doc("Report card of the last completed academic year"),
  ],
  c6to8: [
    doc("Transfer certificate (TC) from the previous school, in original"),
    doc("Report cards of the last two academic years"),
  ],
  c9to10: [
    doc("Transfer certificate (TC) from the previous school, in original"),
    doc("Class 8 (or last completed class) report card and promotion certificate"),
    doc(
      "Board registration form for Class 9",
      "CBSE and CISCE register candidates in Class 9; the school files it with the child's exact name and date of birth as in the birth certificate.",
    ),
  ],
  c11to12: [
    doc("Class 10 marksheet and pass certificate, original plus photocopies"),
    doc("Transfer certificate (TC) from the school where Class 10 was completed"),
    doc(
      "Migration certificate from the previous board",
      "Required whenever the candidate moves from one board to another for Classes 11 and 12.",
    ),
    doc("Stream and subject preference form signed by the parent", "", false),
  ],
};

const BOARD_DOCS = {
  cbse: [
    doc(
      "TC countersigned by the district education officer when the child comes from another state or another board",
      "CBSE Examination Bye-laws require counter-signature on the transfer certificate for admission to Classes 9 to 12 in such cases.",
    ),
  ],
  cisce: [
    doc(
      "CISCE registration form completed by the school for Class 9 or Class 11 entry",
      "The council registers candidates two years before the ICSE or ISC examination.",
    ),
  ],
  state: [
    doc(
      "Transfer certificate in the state board format, carrying the school and district codes",
      "Several states also require the student's SATS / UDISE+ / APAAR identification number to be quoted.",
    ),
  ],
  ib: [
    doc("School reports for the last two years, in English or with a certified translation"),
    doc(
      "Predicted grades or interim reports if joining the MYP or DP part-way through the cycle",
      "",
      false,
    ),
  ],
  cambridge: [
    doc("School reports for the last two years, in English or with a certified translation"),
    doc("Statement of entry or previous Cambridge statement of results, if any", "", false),
  ],
};

const SCENARIO_DOCS = {
  fresh: [],
  local: [doc("Fee clearance or no-dues letter from the previous school", "", false)],
  interstate: [
    doc(
      "TC countersigned by the education officer of the district the child is leaving",
      "Standard requirement when the previous school is outside the state of the new school.",
    ),
    doc("Proof of the parent's relocation, such as a transfer order or new rent agreement", "", false),
  ],
  boardchange: [
    doc("Migration certificate from the board being left"),
    doc("Syllabus bridging or subject equivalence letter from the new school", "", false),
  ],
  abroad: [
    doc("Attested transcripts or report cards for the last three academic years"),
    doc(
      "Equivalence certificate from the Association of Indian Universities or the concerned board",
      "Usually asked for when a child joins Class 11 or 12 after schooling abroad.",
    ),
    doc("Passport and the valid visa or OCI page of the child"),
    doc("Bonafide or leaving letter from the overseas school"),
  ],
  rte: [
    doc(
      "Income certificate issued by the competent revenue authority",
      `Establishes eligibility for the ${RTE_QUOTA_PERCENT}% reserved seats under section 12(1)(c) of the RTE Act, 2009.`,
    ),
    doc("Caste or category certificate, where the claim is on that ground", "", false),
    doc(
      "Residence proof placing the child in the school's neighbourhood",
      "The RTE neighbourhood norm is defined by each state's RTE rules.",
    ),
    doc("State RTE portal application acknowledgement or lottery allotment letter"),
  ],
  gap: [
    doc(
      "Gap declaration affidavit on stamp paper, signed by the parent or guardian",
      "States the period of the gap and the reason for it.",
    ),
    doc("Medical certificate, if the gap was on health grounds", "", false),
    doc("Last school leaving certificate covering the year before the gap"),
  ],
};

const FLAG_DOCS = {
  reserved: [doc("Caste certificate issued by the competent authority, in the child's name")],
  ews: [doc("EWS income and asset certificate valid for the current financial year")],
  disability: [
    doc(
      "Disability certificate or UDID card",
      "Issued under the Rights of Persons with Disabilities Act, 2016; also used to claim exam concessions later.",
    ),
  ],
  singleParent: [
    doc("Custody order, guardianship deed or adoption deed, as applicable"),
    doc("Affidavit naming the person authorised to sign school records", "", false),
  ],
  defence: [doc("Service certificate or posting order of the serving parent")],
  sibling: [doc("Sibling's admission number and current class, on the school's sibling form", "", false)],
};

/**
 * Assemble the checklist.
 *
 * @returns {{sections: Array, totals: object, ageCheck: object|null}|{error: string}}
 */
export function buildChecklist({
  boardKey = "cbse",
  gradeKey = "c1",
  scenarioKey = "fresh",
  flags = [],
  dob = "",
  cutoffDate = "",
} = {}) {
  const board = BOARDS.find((item) => item.key === boardKey);
  const grade = GRADES.find((item) => item.key === gradeKey);
  const scenario = SCENARIOS.find((item) => item.key === scenarioKey);

  if (!board) return { error: "Pick a board from the list." };
  if (!grade) return { error: "Pick a class from the list." };
  if (!scenario) return { error: "Pick an admission scenario from the list." };

  const activeFlags = (Array.isArray(flags) ? flags : []).filter((key) =>
    EXTRA_FLAGS.some((item) => item.key === key),
  );

  const sections = [
    { title: "Always required", items: CORE_DOCS },
    { title: `For ${grade.label}`, items: GRADE_DOCS[grade.key] || [] },
    { title: `${board.label} requirements`, items: BOARD_DOCS[board.key] || [] },
    { title: scenario.label, items: SCENARIO_DOCS[scenario.key] || [] },
    {
      title: "Category and quota papers",
      items: activeFlags.flatMap((key) => FLAG_DOCS[key] || []),
    },
  ].filter((section) => section.items.length > 0);

  const allItems = sections.flatMap((section) => section.items);
  const mandatory = allItems.filter((item) => item.required).length;

  let ageCheck = null;
  if (clean(dob) && clean(cutoffDate)) {
    const result = checkAgeEligibility({ dob, cutoffDate, gradeKey });
    if (result.error) return { error: result.error };
    ageCheck = result;
  }

  return {
    board: board.label,
    grade: grade.label,
    scenario: scenario.label,
    sections,
    totals: {
      total: allItems.length,
      mandatory,
      optional: allItems.length - mandatory,
      sections: sections.length,
    },
    ageCheck,
  };
}

/** Render the checklist as plain text for copying or printing. */
export function checklistToText(result) {
  if (!result || result.error) return "";
  const lines = [
    "School Admission Document Checklist",
    `Board: ${result.board} | Class: ${result.grade} | Scenario: ${result.scenario}`,
  ];
  if (result.ageCheck) {
    lines.push(`Age on cut-off date: ${result.ageCheck.ageText} — ${result.ageCheck.message}`);
  }
  lines.push("");
  for (const section of result.sections) {
    lines.push(`${section.title}`);
    for (const item of section.items) {
      lines.push(`  [ ] ${item.label}${item.required ? "" : " (if applicable)"}`);
      if (item.note) lines.push(`      ${item.note}`);
    }
    lines.push("");
  }
  lines.push(
    `${result.totals.mandatory} mandatory and ${result.totals.optional} conditional documents.`,
  );
  return lines.join("\n");
}
