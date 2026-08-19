/**
 * Volunteer agreement builder for Indian nonprofits.
 *
 * Pure module: totals the time commitment and the reimbursement budget, flags
 * when a "stipend" starts to look like wages, and renders the agreement text.
 * No React, no DOM, no clock reads.
 */

/**
 * Sexual Harassment of Women at Workplace (Prevention, Prohibition and
 * Redressal) Act, 2013, section 2(f): the definition of "employee" expressly
 * includes a person engaged on a VOLUNTARY basis, whether for remuneration or
 * not. Volunteers are therefore covered by the Internal Committee.
 */
export const POSH_COVERS_VOLUNTEERS = true;

/**
 * Protection of Children from Sexual Offences Act, 2012, section 19 places a
 * mandatory duty to report on anyone who apprehends that an offence has been
 * committed, and section 21 punishes failure to report with imprisonment up to
 * six months, or up to one year for a person in charge of an institution.
 */
export const POCSO_REPORTING_DUTY = "Sections 19 and 21, POCSO Act, 2012";

/**
 * Child Labour (Prohibition and Regulation) Amendment Act, 2016: no child below
 * 14 may be engaged in any occupation, and an adolescent aged 14 to 18 may not
 * be engaged in a hazardous occupation. A volunteer below 18 needs written
 * parental consent and age-appropriate duties.
 */
export const MINOR_AGE_THRESHOLD = 18;

/**
 * A volunteer arrangement stays outside employment only while the organisation
 * reimburses ACTUAL out-of-pocket expenses. A fixed payment that exceeds the
 * expenses actually incurred starts to look like wages, and with it come
 * employment-law and tax consequences.
 */
export const STIPEND_WAGE_RISK_RULE =
  "reimbursement should not exceed the expenses actually incurred";

/** Weeks-to-months conversion used for the stipend total: 52 weeks = 12 months. */
export const MONTHS_PER_WEEK = 12 / 52;

export const CLAUSES = [
  {
    key: "nonEmployment",
    label: "Not a contract of employment",
    required: true,
    text: "This is a voluntary arrangement and not a contract of employment, apprenticeship or service. No wages, salary or other remuneration is payable, no employer-employee relationship arises, and nothing in this agreement is intended to be legally enforceable as an employment contract. Either side may end the arrangement as set out below.",
  },
  {
    key: "duties",
    label: "Role and duties",
    required: true,
    text: "The volunteer will carry out the role described in the schedule above, under the supervision of the named coordinator, and will follow the organisation's policies, safeguarding rules and reasonable instructions while doing so.",
  },
  {
    key: "reimbursement",
    label: "Out-of-pocket reimbursement",
    required: true,
    text: "The organisation will reimburse pre-approved out-of-pocket expenses actually incurred, against receipts, at the rates set out in the schedule. No payment beyond actual expenses is made, so that the arrangement is not treated as paid employment.",
  },
  {
    key: "confidentiality",
    label: "Confidentiality",
    required: true,
    text: "The volunteer will keep confidential all information about beneficiaries, donors, staff, finances and internal operations learned during the placement, and will not disclose or use it for any purpose other than the role, during the placement or after it ends.",
  },
  {
    key: "dataProtection",
    label: "Personal data handling (DPDP Act, 2023)",
    required: false,
    text: "Where the role involves personal data, the volunteer will access only the data needed for the task, will not copy it to personal devices or accounts, and will follow the organisation's data protection procedures under the Digital Personal Data Protection Act, 2023. Any suspected data breach must be reported to the coordinator the same day.",
  },
  {
    key: "safeguarding",
    label: "Child protection and safeguarding",
    required: false,
    text: "The volunteer confirms that they have not been convicted of, or are not under investigation for, any offence involving a child or a vulnerable adult, agrees to a background check, and will never be alone and unsupervised with a child. The volunteer acknowledges the mandatory duty to report any apprehended offence against a child under Sections 19 and 21 of the POCSO Act, 2012.",
  },
  {
    key: "posh",
    label: "Prevention of sexual harassment",
    required: false,
    text: "The organisation's policy on the prevention of sexual harassment applies to the volunteer, who is an 'employee' for the purposes of Section 2(f) of the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013. Complaints may be made to the Internal Committee, whose contact details have been shared with the volunteer.",
  },
  {
    key: "health",
    label: "Health, safety and insurance",
    required: false,
    text: "The volunteer will follow all health and safety instructions and report accidents, near misses and hazards immediately. The volunteer is not covered by the organisation's employee benefits; any accident cover arranged for volunteers is stated in the schedule and is the limit of the organisation's cover.",
  },
  {
    key: "ip",
    label: "Work product and intellectual property",
    required: false,
    text: "Any material the volunteer creates specifically for the organisation in the course of the role - photographs, written content, designs, code or data - is assigned to the organisation for its charitable purposes, with the volunteer credited where practicable.",
  },
  {
    key: "media",
    label: "Photographs and publicity",
    required: false,
    text: "The volunteer consents to the organisation using photographs and recordings of them taken during the placement in reports, newsletters and social media, and may withdraw that consent in writing at any time for future use.",
  },
  {
    key: "conflict",
    label: "Conflict of interest",
    required: false,
    text: "The volunteer will disclose any personal, financial or family interest that could conflict with the organisation's work, including any position held in an organisation that competes for the same grants or beneficiaries.",
  },
  {
    key: "expenses",
    label: "No authority to bind the organisation",
    required: false,
    text: "The volunteer has no authority to enter into contracts, accept donations in the organisation's name, make public statements on its behalf, or commit it to any expenditure, unless the coordinator authorises it in writing for a specific occasion.",
  },
  {
    key: "termination",
    label: "Ending the placement",
    required: true,
    text: "Either side may end the placement by giving the notice stated in the schedule, and the organisation may end it immediately for a serious breach of policy, safeguarding rules or confidentiality. On ending, the volunteer will return all identity cards, equipment, keys and records.",
  },
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86400000;

const clean = (value) => String(value ?? "").trim();
const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

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

const toIso = (ms) => new Date(ms).toISOString().slice(0, 10);

/** Add whole calendar days to an ISO date. */
export function addDays(iso, days) {
  const ms = toUtcMs(iso);
  const n = Number(days);
  if (ms === null || !Number.isFinite(n)) return null;
  return toIso(ms + Math.round(n) * MS_PER_DAY);
}

/** yyyy-mm-dd -> "01 February 2026". */
export function formatLongDate(iso) {
  const ms = toUtcMs(iso);
  if (ms === null) return "";
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const d = new Date(ms);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const money = (value) =>
  `INR ${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/**
 * Time commitment and reimbursement budget for the placement.
 *
 * totalHours   = hoursPerWeek x weeks
 * endDate      = startDate + weeks x 7 days
 * travelTotal  = kmPerWeek x ratePerKm x weeks
 * mealTotal    = mealRatePerDay x daysPerWeek x weeks
 * stipendTotal = monthlyStipend x (weeks x 12 / 52)
 *
 * @returns {object|{error: string}}
 */
export function computeCommitment({
  startDate,
  weeks = 26,
  hoursPerWeek = 6,
  daysPerWeek = 2,
  kmPerWeek = 0,
  ratePerKm = 0,
  mealRatePerDay = 0,
  monthlyStipend = 0,
  noticeDays = 14,
} = {}) {
  if (toUtcMs(startDate) === null) {
    return { error: "Enter a valid start date in yyyy-mm-dd format." };
  }

  const numbers = {
    weeks: Number(String(weeks ?? "").trim()),
    hoursPerWeek: Number(String(hoursPerWeek ?? "").trim()),
    daysPerWeek: Number(String(daysPerWeek ?? "").trim()),
    kmPerWeek: Number(String(kmPerWeek ?? 0).trim() || 0),
    ratePerKm: Number(String(ratePerKm ?? 0).trim() || 0),
    mealRatePerDay: Number(String(mealRatePerDay ?? 0).trim() || 0),
    monthlyStipend: Number(String(monthlyStipend ?? 0).trim() || 0),
    noticeDays: Number(String(noticeDays ?? 0).trim() || 0),
  };

  for (const [key, value] of Object.entries(numbers)) {
    if (!Number.isFinite(value)) return { error: `Enter a number for ${key}.` };
    if (value < 0) return { error: "None of the figures can be negative." };
  }
  if (numbers.weeks < 1 || numbers.weeks > 520) {
    return { error: "The placement length should be between 1 and 520 weeks." };
  }
  if (numbers.hoursPerWeek <= 0 || numbers.hoursPerWeek > 168) {
    return { error: "Hours per week should be between 1 and 168." };
  }
  if (numbers.daysPerWeek <= 0 || numbers.daysPerWeek > 7) {
    return { error: "Days per week should be between 1 and 7." };
  }
  if (numbers.noticeDays > 180) {
    return { error: "The notice period should be 180 days or fewer." };
  }

  const totalHours = round2(numbers.hoursPerWeek * numbers.weeks);
  const totalSessions = Math.round(numbers.daysPerWeek * numbers.weeks);
  const endDate = addDays(startDate, numbers.weeks * 7);
  const months = round2(numbers.weeks * MONTHS_PER_WEEK);

  const travelTotal = round2(numbers.kmPerWeek * numbers.ratePerKm * numbers.weeks);
  const mealTotal = round2(numbers.mealRatePerDay * numbers.daysPerWeek * numbers.weeks);
  const expenseTotal = round2(travelTotal + mealTotal);
  const stipendTotal = round2(numbers.monthlyStipend * months);

  const stipendExceedsExpenses = numbers.monthlyStipend > 0 && stipendTotal > expenseTotal;

  return {
    startDate: clean(startDate),
    endDate,
    weeks: numbers.weeks,
    months,
    hoursPerWeek: numbers.hoursPerWeek,
    daysPerWeek: numbers.daysPerWeek,
    totalHours,
    totalSessions,
    noticeDays: Math.round(numbers.noticeDays),
    travelTotal,
    mealTotal,
    expenseTotal,
    monthlyStipend: round2(numbers.monthlyStipend),
    stipendTotal,
    stipendExceedsExpenses,
    hourlyEquivalent: totalHours > 0 ? round2((stipendTotal + expenseTotal) / totalHours) : 0,
    warning: stipendExceedsExpenses
      ? `A fixed payment of ${money(stipendTotal)} over the placement is more than the ${money(expenseTotal)} of expenses budgeted. Because ${STIPEND_WAGE_RISK_RULE}, the excess can be read as wages and bring employment and tax consequences. Either cut the fixed payment or reimburse against receipts instead.`
      : "",
  };
}

/**
 * Build the volunteer agreement text.
 *
 * @returns {{agreement: string, commitment: object}|{error: string}}
 */
export function buildVolunteerAgreement({
  organisationName,
  organisationAddress = "",
  coordinatorName = "",
  coordinatorContact = "",
  volunteerName,
  volunteerAddress = "",
  volunteerPhone = "",
  volunteerEmail = "",
  volunteerIsMinor = false,
  guardianName = "",
  roleTitle = "Volunteer",
  roleSummary = "",
  location = "",
  agreementDate,
  startDate,
  weeks = 26,
  hoursPerWeek = 6,
  daysPerWeek = 2,
  kmPerWeek = 0,
  ratePerKm = 0,
  mealRatePerDay = 0,
  monthlyStipend = 0,
  noticeDays = 14,
  insuranceNote = "",
  selectedClauses = CLAUSES.filter((clause) => clause.required).map((clause) => clause.key),
  governingCity = "",
} = {}) {
  const org = clean(organisationName);
  const volunteer = clean(volunteerName);
  if (!org) return { error: "Enter the organisation's name." };
  if (!volunteer) return { error: "Enter the volunteer's name." };
  if (toUtcMs(agreementDate) === null) {
    return { error: "Enter a valid agreement date in yyyy-mm-dd format." };
  }
  if (volunteerIsMinor && !clean(guardianName)) {
    return {
      error: `A volunteer under ${MINOR_AGE_THRESHOLD} needs a parent or guardian to countersign — enter the guardian's name.`,
    };
  }

  const commitment = computeCommitment({
    startDate,
    weeks,
    hoursPerWeek,
    daysPerWeek,
    kmPerWeek,
    ratePerKm,
    mealRatePerDay,
    monthlyStipend,
    noticeDays,
  });
  if (commitment.error) return { error: commitment.error };

  const chosen = new Set(
    Array.isArray(selectedClauses) ? selectedClauses : [],
  );
  const clauses = CLAUSES.filter((clause) => clause.required || chosen.has(clause.key));
  const safeguardingIncluded = chosen.has("safeguarding");

  const scheduleLines = [
    `Role: ${clean(roleTitle) || "Volunteer"}`,
    clean(roleSummary) && `Duties: ${clean(roleSummary)}`,
    clean(location) && `Location: ${clean(location)}`,
    `Start date: ${formatLongDate(commitment.startDate)}`,
    `Expected end date: ${formatLongDate(commitment.endDate)} (${commitment.weeks} weeks)`,
    `Commitment: ${commitment.hoursPerWeek} hours a week over about ${commitment.daysPerWeek} day(s) a week — roughly ${commitment.totalHours} hours in all`,
    clean(coordinatorName) && `Coordinator: ${clean(coordinatorName)}${coordinatorContact ? ` (${clean(coordinatorContact)})` : ""}`,
    commitment.travelTotal > 0 &&
      `Travel reimbursement: ${money(commitment.travelTotal)} budgeted over the placement, against receipts`,
    commitment.mealTotal > 0 &&
      `Meal or refreshment reimbursement: ${money(commitment.mealTotal)} budgeted over the placement, against receipts`,
    commitment.monthlyStipend > 0 &&
      `Fixed monthly payment: ${money(commitment.monthlyStipend)} (${money(commitment.stipendTotal)} over the placement)`,
    `Notice to end the placement: ${commitment.noticeDays} days`,
    clean(insuranceNote) && `Insurance: ${clean(insuranceNote)}`,
  ].filter(Boolean);

  const agreement = [
    "VOLUNTEER AGREEMENT",
    "",
    `This agreement is made on ${formatLongDate(agreementDate)} between:`,
    "",
    `(1) ${org}${clean(organisationAddress) ? `, of ${clean(organisationAddress)}` : ""} ("the organisation"); and`,
    `(2) ${volunteer}${clean(volunteerAddress) ? `, of ${clean(volunteerAddress)}` : ""} ("the volunteer")${
      volunteerIsMinor ? `, represented by ${clean(guardianName)} as parent / guardian` : ""
    }.`,
    ...(volunteerPhone || volunteerEmail
      ? [
          "",
          `Volunteer contact: ${[volunteerPhone && clean(volunteerPhone), volunteerEmail && clean(volunteerEmail)].filter(Boolean).join(" | ")}`,
        ]
      : []),
    "",
    "SCHEDULE",
    ...scheduleLines.map((line) => `  ${line}`),
    "",
    "TERMS",
    ...clauses.flatMap((clause, index) => [`${index + 1}. ${clause.label}`, `   ${clause.text}`, ""]),
    ...(volunteerIsMinor
      ? [
          `${clauses.length + 1}. Parental consent`,
          `   The volunteer is under ${MINOR_AGE_THRESHOLD}. The parent or guardian named above consents to the placement, confirms the duties are age-appropriate and non-hazardous, and will be contacted in any emergency.`,
          "",
        ]
      : []),
    ...(clean(governingCity)
      ? [
          `${clauses.length + (volunteerIsMinor ? 2 : 1)}. Understanding between the parties`,
          `   This agreement records the understanding between the parties in good faith and is not intended to create a legally binding contract, except for the confidentiality${safeguardingIncluded ? " and safeguarding" : ""} obligations. Any dispute will be discussed first with the coordinator, and the courts at ${clean(governingCity)} will have jurisdiction over anything that remains.`,
          "",
        ]
      : []),
    "Signed for the organisation:",
    "",
    "",
    `${clean(coordinatorName) || "____________________"}`,
    `For ${org}`,
    "",
    "Signed by the volunteer:",
    "",
    "",
    volunteer,
    ...(volunteerIsMinor
      ? ["", "Countersigned by the parent / guardian:", "", "", clean(guardianName)]
      : []),
  ]
    .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
    .join("\n");

  return { agreement, commitment, clauseCount: clauses.length };
}
