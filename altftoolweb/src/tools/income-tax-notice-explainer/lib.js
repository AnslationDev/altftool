/**
 * Reference data for the notices and intimations issued under the Income-tax Act, 1961 (India),
 * together with a pure helper that turns a notice date and a reply window into a deadline.
 *
 * Nothing here is legal advice. Statutory reply periods are cited section by section; where the
 * Act leaves the period to the officer ("as specified in the notice") that is stated explicitly
 * instead of inventing a number.
 */

/** Reply windows that the Act itself fixes. */
export const STATUTORY_DAYS = {
  /** Section 139(9): 15 days from intimation of the defect, extendable by the officer. */
  DEFECTIVE_RETURN: 15,
  /** Proviso to section 143(1)(a): 30 days to respond to a proposed adjustment. */
  PROPOSED_ADJUSTMENT: 30,
  /** Section 220(1): tax demanded under a notice of demand is payable within 30 days of service. */
  DEMAND: 30,
  /** Section 148A: the show-cause opportunity must be not less than 7 days. */
  SHOW_CAUSE_MIN: 7,
  /** Section 148A: and not more than 30 days, extendable on application. */
  SHOW_CAUSE_MAX: 30,
};

export const NOTICES = [
  {
    id: "139-9",
    section: "139(9)",
    title: "Defective return",
    severity: "action-needed",
    meaning:
      "The return was filed but the department treats it as incomplete — for example the tax payable shown was not paid, a required schedule or audit report is missing, or the gross receipts reported do not tie up with the profit and loss account.",
    trigger: "Missing, inconsistent or unpaid items detected when the return is checked for completeness.",
    responseDays: STATUTORY_DAYS.DEFECTIVE_RETURN,
    responseBasis: "Statutory: 15 days from intimation, extendable if you apply to the assessing officer.",
    ifIgnored:
      "The return is treated as never having been furnished, which can pull in a section 234F fee, loss of carry-forward of losses and a best-judgement assessment.",
    steps: [
      "Open e-Filing portal → Pending Actions → e-Proceedings and read the exact defect code quoted.",
      "Prepare a corrected return in the same ITR form, fixing only the flagged defect.",
      "Upload it as a response to the 139(9) notice — not as a fresh original return.",
      "If you disagree that a defect exists, submit a written disagreement with supporting figures within the same window.",
    ],
  },
  {
    id: "143-1",
    section: "143(1)",
    title: "Intimation after processing",
    severity: "informational",
    meaning:
      "This is the automated processing result from CPC, showing your figures beside the department's figures. It becomes a demand notice if extra tax is due and a refund order if tax is due back to you.",
    trigger:
      "Every processed return gets one. It must be sent within nine months from the end of the financial year in which the return was furnished.",
    responseDays: STATUTORY_DAYS.DEMAND,
    responseBasis:
      "No reply is needed when the two columns match. If a demand is raised, section 220(1) gives 30 days to pay or to respond on the portal.",
    ifIgnored:
      "An unchallenged demand attracts interest under section 220(2) at 1% per month and can be adjusted against future refunds under section 245.",
    steps: [
      "Compare the 'as provided by taxpayer' and 'as computed under 143(1)' columns line by line.",
      "If they match and there is no demand, simply file the intimation with your records.",
      "If the difference is a data error, file a rectification request under section 154.",
      "If you accept the demand, pay it as 'Regular assessment tax (400)' and record the challan on the portal.",
    ],
  },
  {
    id: "143-1-a",
    section: "143(1)(a)",
    title: "Proposed adjustment before processing",
    severity: "action-needed",
    meaning:
      "CPC intends to adjust your return for an arithmetical error, an internally inconsistent entry, a disallowed claim or a mismatch with Form 26AS / AIS, and is giving you a chance to object first.",
    trigger: "A mismatch found by the automated system before the return is finally processed.",
    responseDays: STATUTORY_DAYS.PROPOSED_ADJUSTMENT,
    responseBasis: "Statutory: the first proviso to section 143(1)(a) gives 30 days.",
    ifIgnored: "The adjustment is made anyway after 30 days and flows into the 143(1) intimation as a demand.",
    steps: [
      "Identify which of your entries the system compared against which third-party figure.",
      "Agree or disagree line by line in the portal response screen, attaching proof for each disagreement.",
      "If the third-party data itself is wrong, ask the deductor to revise the TDS return before replying.",
    ],
  },
  {
    id: "142-1",
    section: "142(1)",
    title: "Inquiry before assessment",
    severity: "action-needed",
    meaning:
      "The officer is either asking you to file a return you have not filed, or calling for accounts, documents or specific information needed to make an assessment.",
    trigger: "Non-filing despite apparent taxable income, or an assessment already under way that needs records.",
    responseDays: null,
    responseBasis: "As specified in the notice — the Act leaves the period to the officer.",
    ifIgnored:
      "Best-judgement assessment under section 144, penalty of Rs 10,000 per default under section 272A(1)(d), and possible prosecution under section 276D.",
    steps: [
      "Note the exact documents and years listed in the annexure to the notice.",
      "Reply through e-Proceedings with a covering index; upload documents in the order asked for.",
      "Ask for an adjournment in writing before the date if the records will take longer.",
    ],
  },
  {
    id: "143-2",
    section: "143(2)",
    title: "Scrutiny assessment",
    severity: "serious",
    meaning:
      "Your return has been selected for detailed scrutiny — either limited scrutiny on specific issues or complete scrutiny of the whole return.",
    trigger:
      "Risk-based selection by CASS or a manual selection under the CBDT's published criteria. The notice must be served within three months from the end of the financial year in which the return was furnished.",
    responseDays: null,
    responseBasis: "As specified in the notice; questionnaires under section 142(1) usually follow.",
    ifIgnored: "Assessment proceeds ex parte under section 144 on the officer's own estimate of your income.",
    steps: [
      "Check the notice is within the three-month limitation period — a late 143(2) is invalid.",
      "Read whether it is limited or complete scrutiny; a limited scrutiny cannot be widened without approval.",
      "Assemble bank statements, ledgers and proof for the specific claims that will be tested.",
      "Consider engaging a chartered accountant or advocate before the first hearing date.",
    ],
  },
  {
    id: "148a",
    section: "148A",
    title: "Show-cause before reassessment",
    severity: "serious",
    meaning:
      "The officer has information suggesting income escaped assessment and must give you a chance to explain before issuing a reassessment notice under section 148.",
    trigger: "Information flagged under the risk management strategy, an audit objection, or a survey or search finding.",
    responseDays: STATUTORY_DAYS.SHOW_CAUSE_MAX,
    responseBasis:
      "Statutory: not less than 7 days and not more than 30 days, extendable on your application.",
    ifIgnored: "The officer passes an order on the material available and proceeds to issue the section 148 notice.",
    steps: [
      "Ask for the underlying information and the approval on record if it was not annexed.",
      "Reply on the merits: show the income was already offered, or is exempt, or belongs to another year.",
      "Raise limitation as a ground if the year is beyond the permitted reassessment window.",
    ],
  },
  {
    id: "148",
    section: "148",
    title: "Income escaping assessment",
    severity: "serious",
    meaning:
      "A reassessment has been opened for an earlier year and you are being asked to file a return of income for that year.",
    trigger:
      "An order under section 148A(3) holding that it is a fit case. Reassessment for a year is time-barred beyond the outer limit in section 149, which is longer where the escaped income crosses Rs 50 lakh.",
    responseDays: null,
    responseBasis: "File the return within the period specified in the notice.",
    ifIgnored:
      "Best-judgement reassessment, interest under sections 234A and 234B, and penalty for under-reporting under section 270A.",
    steps: [
      "File the return for the notified year even if you dispute the reassessment, to preserve your position.",
      "Ask in writing for the reasons recorded and the section 148A(3) order.",
      "Check the limitation period in section 149 against the year being reopened.",
      "Take professional help — reassessment outcomes are frequently litigated on limitation and jurisdiction.",
    ],
  },
  {
    id: "245",
    section: "245",
    title: "Refund adjusted against old demand",
    severity: "action-needed",
    meaning:
      "A refund due to you is proposed to be set off against an outstanding demand from an earlier year. The set-off cannot happen until you have been given an opportunity to respond.",
    trigger: "Any unpaid demand sitting on the portal, including demands you may already have paid but never got closed.",
    responseDays: 30,
    responseBasis: "The intimation states the window, commonly 30 days on the e-filing portal.",
    ifIgnored: "The refund is adjusted automatically and recovering it later needs a rectification or appeal.",
    steps: [
      "Open Pending Actions → Response to Outstanding Demand and check every listed year.",
      "If the demand is already paid, upload the challan details and mark 'demand paid'.",
      "If it is wrong, select 'disagree' and give the reason — rectification filed, appeal pending, or stay granted.",
    ],
  },
  {
    id: "156",
    section: "156",
    title: "Notice of demand",
    severity: "action-needed",
    meaning: "A formal demand for tax, interest, penalty or fine determined under any order.",
    trigger: "Any assessment, rectification, penalty or appellate order that leaves an amount payable.",
    responseDays: STATUTORY_DAYS.DEMAND,
    responseBasis: "Statutory: section 220(1) makes the amount payable within 30 days of service.",
    ifIgnored:
      "You become an assessee in default under section 220(4): interest at 1% per month under section 220(2) plus recovery action.",
    steps: [
      "Pay within 30 days, or file an appeal and apply for a stay of demand before the 30 days run out.",
      "Quote the demand identification number on the challan so the demand is closed on the portal.",
    ],
  },
  {
    id: "133-6",
    section: "133(6)",
    title: "Call for information",
    severity: "informational",
    meaning:
      "The officer is asking you — or a bank, employer or counterparty — for information or statements relevant to a proceeding or an inquiry.",
    trigger: "Verification of a high-value transaction reported in the AIS, or a third-party inquiry that names you.",
    responseDays: null,
    responseBasis: "As specified in the notice.",
    ifIgnored: "Penalty of Rs 10,000 for each default under section 272A(2)(c).",
    steps: [
      "Answer only what is asked, in writing, with documentary support.",
      "Reconcile the transaction against your Annual Information Statement before replying.",
    ],
  },
  {
    id: "131-1a",
    section: "131(1A)",
    title: "Summons by the investigation wing",
    severity: "serious",
    meaning:
      "The authorised officer is exercising civil-court powers to summon you, examine you on oath and require production of books of account.",
    trigger: "A survey, search or an investigation into suspected concealment.",
    responseDays: null,
    responseBasis: "Attend on the date and time specified in the summons.",
    ifIgnored: "Penalty under section 272A(1)(c) and the proceedings continue on adverse inference.",
    steps: [
      "Attend in person unless the summons permits an authorised representative.",
      "Carry identity proof and the specific records listed.",
      "Engage counsel before a statement on oath is recorded — it is used as evidence.",
    ],
  },
];

export const SEVERITY_LABELS = {
  informational: "Informational",
  "action-needed": "Reply required",
  serious: "Serious — get help",
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Parse an ISO yyyy-mm-dd string into a UTC-midnight Date, or null when invalid. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function toIso(date) {
  return date.toISOString().slice(0, 10);
}

/** Look up a notice entry by its id. Returns undefined when the id is unknown. */
export function getNotice(id) {
  return NOTICES.find((notice) => notice.id === id);
}

/** Free-text search over section number, title and meaning. */
export function searchNotices(query) {
  const term = String(query ?? "").trim().toLowerCase();
  if (!term) return NOTICES;
  return NOTICES.filter((notice) =>
    `${notice.section} ${notice.title} ${notice.meaning}`.toLowerCase().includes(term),
  );
}

/**
 * Turn a notice date and a reply window into a deadline and a countdown.
 * `today` is an argument so the function stays pure and testable.
 *
 * @param {{ noticeDate: string, responseDays: number, today: string }} input
 * @returns {object} deadline details, or { error } when the input is unusable.
 */
export function computeResponseWindow({ noticeDate, responseDays, today }) {
  const issued = parseIsoDate(noticeDate);
  const now = parseIsoDate(today);
  const days = Number(responseDays);

  if (!issued) return { error: "Enter the date printed on the notice in yyyy-mm-dd form." };
  if (!now) return { error: "Enter today's date in yyyy-mm-dd form." };
  if (!Number.isFinite(days) || days <= 0) {
    return { error: "The reply window must be at least one day." };
  }
  if (days > 365) return { error: "A reply window longer than a year is not realistic — check the notice." };

  const deadline = new Date(issued.getTime() + Math.round(days) * MS_PER_DAY);
  const daysRemaining = Math.round((deadline.getTime() - now.getTime()) / MS_PER_DAY);

  let status = "open";
  if (daysRemaining < 0) status = "overdue";
  else if (daysRemaining === 0) status = "due-today";
  else if (daysRemaining <= 3) status = "urgent";

  return {
    noticeDate: toIso(issued),
    deadline: toIso(deadline),
    responseDays: Math.round(days),
    daysRemaining,
    daysElapsed: Math.round((now.getTime() - issued.getTime()) / MS_PER_DAY),
    status,
  };
}
