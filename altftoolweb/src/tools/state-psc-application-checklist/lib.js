/**
 * State Public Service Commission application checklist and deadline tracker.
 *
 * Rules encoded here, and where they come from:
 *
 *  - Domicile and reservation. State PSCs reserve seats for the SC, ST, OBC and
 *    equivalent classes OF THAT STATE. A candidate holding a category certificate
 *    from another state is admitted to the examination but is treated as unreserved,
 *    pays the unreserved fee and gets no age relaxation. This follows from Articles
 *    15(4) and 16(4) being exercised by each state for its own lists, and from
 *    Marri Chandra Shekhar Rao v. Dean, Seth G.S. Medical College (1990), which held
 *    that a Scheduled Caste notified for one state cannot claim that status in
 *    another. Every state notification restates it.
 *
 *  - Two different last dates. Most state commissions publish a last date for the fee
 *    to be deposited that falls BEFORE the last date for submitting the form. Money
 *    deposited after the fee date does not attach to the application, and the form
 *    cannot then be submitted at all. This tool treats the fee date as the binding one
 *    and warns when the two are entered the wrong way round.
 *
 *  - The correction window is a separate, later window. It usually allows edits to
 *    limited fields on payment of a correction charge, and it never reopens closed
 *    applications.
 *
 *  - Language requirement. Several commissions attach a compulsory regional-language
 *    paper or an eligibility test in the state language — Tamil for TNPSC, Kannada for
 *    KPSC, Marathi for MPSC, Hindi for the northern commissions. It is qualifying, and
 *    its marks are usually excluded from the merit list.
 *
 *  - Certificates must be valid ON the closing date, not on the date of interview.
 *    A non-creamy-layer OBC certificate issued for an earlier financial year is the
 *    single most common rejection at document verification.
 *
 * Age bands, fees and dates differ for every commission and every cycle, so this tool
 * takes them as inputs rather than asserting them. Informational only.
 */

/** Days-left threshold at which a stage is flagged as closing. */
export const URGENT_DAYS = 3;

const DAY_MS = 86400000;

function isLeap(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year, month) {
  const table = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month === 2 && isLeap(year) ? 29 : table[month - 1];
}

/** Strict YYYY-MM-DD parse; null for anything that is not a real calendar date. */
export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (y < 1900 || y > 2200 || m < 1 || m > 12) return null;
  if (d < 1 || d > daysInMonth(y, m)) return null;
  return { y, m, d };
}

function toUTC({ y, m, d }) {
  return Date.UTC(y, m - 1, d);
}

/** Whole days from one ISO date to another; positive when `toISO` is later. */
export function diffDays(fromISO, toISO) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISO);
  if (!from || !to) return null;
  return Math.round((toUTC(to) - toUTC(from)) / DAY_MS);
}

/** ISO date n days after the given ISO date. Returns "" for an unparseable input. */
export function addDays(isoDate, days) {
  const parts = parseISODate(isoDate);
  const n = Number(days);
  if (!parts || !Number.isFinite(n)) return "";
  const shifted = new Date(toUTC(parts) + Math.trunc(n) * DAY_MS);
  const y = shifted.getUTCFullYear();
  const m = shifted.getUTCMonth() + 1;
  const d = shifted.getUTCDate();
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Commissions covered, with the requirement that trips people up at each one. */
export const COMMISSIONS = [
  {
    id: "uppsc",
    label: "UPPSC — Uttar Pradesh",
    language: "Hindi, as a compulsory qualifying paper in the mains",
    notes: [
      "One Time Registration is mandatory and the OTR number carries into every later UPPSC form.",
      "The uploaded photograph must carry the candidate's name and the date it was taken, and must be no more than three months old.",
      "Reservation and fee concession are for candidates of Uttar Pradesh only; candidates of other states apply as unreserved.",
    ],
  },
  {
    id: "bpsc",
    label: "BPSC — Bihar",
    language: "Hindi, as a compulsory qualifying paper",
    notes: [
      "One-time registration on the BPSC portal precedes every application.",
      "The reduced fee for SC, ST and women applies to candidates domiciled in Bihar only.",
      "Preference order for services is binding once submitted and is not reopened later.",
    ],
  },
  {
    id: "mppsc",
    label: "MPPSC — Madhya Pradesh",
    language: "Hindi, in the general studies and essay papers",
    notes: [
      "The lower fee and the reservation both depend on being a native of Madhya Pradesh.",
      "Candidates from outside the state are treated as unreserved whatever certificate they hold.",
      "MPPSC charges a portal fee per application over and above the examination fee.",
    ],
  },
  {
    id: "rpsc",
    label: "RPSC — Rajasthan",
    language: "Hindi and, in some papers, Rajasthani general knowledge",
    notes: [
      "A One Time Registration number from the SSO portal is required before the form opens.",
      "Rajasthan recognises MBC and EWS alongside SC, ST and OBC, each with its own certificate format.",
      "The widow and divorcee categories carry their own fee and age concessions for state candidates.",
    ],
  },
  {
    id: "tnpsc",
    label: "TNPSC — Tamil Nadu",
    language: "A Tamil eligibility test applies to candidates who did not study Tamil",
    notes: [
      "One Time Registration is valid for five years and is charged separately from the exam fee.",
      "Tamil Nadu's classification adds MBC, DNC and BC (Muslim) to the usual list.",
      "Communal rotation means the seat you are considered against depends on the category declared in the form.",
    ],
  },
  {
    id: "mpsc",
    label: "MPSC — Maharashtra",
    language: "Marathi, both as a paper and as a knowledge requirement",
    notes: [
      "The non-creamy-layer certificate must be valid on the closing date, not merely applied for.",
      "Caste validity certificate from the Scrutiny Committee is called for at appointment, and takes months.",
      "Maharashtra's SEBC and EWS claims each need their own certificate in the state format.",
    ],
  },
  {
    id: "kpsc",
    label: "KPSC — Karnataka",
    language: "Kannada language test for candidates who did not study in Kannada",
    notes: [
      "Rural, Kannada-medium and Hyderabad-Karnataka (Article 371J) claims each need a separate certificate.",
      "Category 2A, 2B, 3A and 3B are Karnataka's own classification and do not map onto central OBC.",
      "The Article 371J local-cadre certificate has to name the eligible district.",
    ],
  },
  {
    id: "wbpsc",
    label: "WBPSC — West Bengal",
    language: "Bengali or Nepali, as the compulsory language paper",
    notes: [
      "Reservation follows the West Bengal lists, which include OBC-A and OBC-B.",
      "The domicile certificate is checked at personality test stage for state-quota claims.",
      "Fee concession is limited to SC, ST and PwD candidates of West Bengal.",
    ],
  },
  {
    id: "other",
    label: "Another state commission",
    language: "Check whether a regional language paper is compulsory and qualifying",
    notes: [
      "Reservation and fee concession almost always require domicile in that state.",
      "Read the fee last date and the submission last date separately — they usually differ.",
    ],
  },
];

export const CATEGORIES = [
  { id: "ur", label: "Unreserved / General" },
  { id: "ews", label: "EWS" },
  { id: "obc", label: "OBC / BC of the state" },
  { id: "sc", label: "Scheduled Caste" },
  { id: "st", label: "Scheduled Tribe" },
  { id: "pwd", label: "Person with disability" },
];

/** The dated stages of a state PSC cycle, in the order they occur. */
export const STAGES = [
  {
    id: "notification",
    label: "Notification and registration opens",
    detail: "Read the whole advertisement now — the post table and the equivalence list matter most.",
  },
  {
    id: "feeLast",
    label: "Last date to deposit the fee",
    detail: "This is the real deadline. Money paid after it does not attach to the application.",
    binding: true,
  },
  {
    id: "submitLast",
    label: "Last date to submit the form",
    detail: "Submission is only possible if the fee was paid inside the fee window.",
    binding: true,
  },
  {
    id: "correctionStart",
    label: "Correction window opens",
    detail: "Limited fields only, usually on payment of a correction charge.",
  },
  {
    id: "correctionEnd",
    label: "Correction window closes",
    detail: "Nothing is editable after this, and a closed application is never reopened.",
    binding: true,
  },
  {
    id: "examDate",
    label: "Preliminary exam",
    detail: "Admit cards usually appear one to two weeks before this date.",
  },
];

/**
 * Turn a set of dates into a timeline with days remaining and ordering warnings.
 *
 * @param {object} input
 * @param {string} input.today  Today's date as YYYY-MM-DD, supplied by the caller.
 * @param {object} input.dates  Map of stage id to YYYY-MM-DD.
 * @returns {object} timeline, or { error }.
 */
export function buildTimeline({ today = "", dates = {} } = {}) {
  if (!parseISODate(today)) {
    return { error: "Enter today's date as a real calendar date." };
  }

  const stages = [];
  for (const stage of STAGES) {
    const value = dates[stage.id];
    if (!value) {
      stages.push({ ...stage, date: "", daysLeft: null, status: "unset" });
      continue;
    }
    if (!parseISODate(value)) {
      return { error: `The date entered for "${stage.label}" is not a real calendar date.` };
    }
    const daysLeft = diffDays(today, value);
    let status = "open";
    if (daysLeft < 0) status = "passed";
    else if (daysLeft <= URGENT_DAYS) status = "urgent";
    stages.push({ ...stage, date: value, daysLeft, status });
  }

  const warnings = [];
  const at = (id) => stages.find((stage) => stage.id === id);
  const fee = at("feeLast");
  const submit = at("submitLast");
  const corrStart = at("correctionStart");
  const corrEnd = at("correctionEnd");
  const exam = at("examDate");

  if (fee.date && submit.date && diffDays(fee.date, submit.date) < 0) {
    warnings.push(
      "The fee last date falls after the submission last date. Commissions publish it the other way round — re-check the advertisement.",
    );
  }
  if (corrStart.date && submit.date && diffDays(submit.date, corrStart.date) < 0) {
    warnings.push("The correction window is shown as opening before submissions close.");
  }
  if (corrStart.date && corrEnd.date && diffDays(corrStart.date, corrEnd.date) < 0) {
    warnings.push("The correction window closes before it opens.");
  }
  if (exam.date && submit.date && diffDays(submit.date, exam.date) < 0) {
    warnings.push("The exam date falls before applications close.");
  }

  const upcoming = stages
    .filter((stage) => stage.date && stage.daysLeft !== null && stage.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);
  const next = upcoming.length > 0 ? upcoming[0] : null;

  const missedBinding = stages.filter(
    (stage) => stage.binding && stage.status === "passed",
  );

  return {
    stages,
    next,
    daysToNext: next ? next.daysLeft : null,
    warnings,
    missedBinding,
    allPassed: next === null && stages.some((stage) => stage.date),
  };
}

const BASE_ITEMS = [
  { id: "otr", label: "One Time Registration number and password for the commission's portal", group: "Before you start" },
  { id: "advert", label: "The advertisement PDF read end to end, including the post table", group: "Before you start" },
  { id: "photo", label: "Photograph and signature scanned to the sizes the portal states", group: "Uploads" },
  { id: "signature", label: "Signature in running hand on white paper, not in capitals", group: "Uploads" },
  { id: "class10", label: "Class 10 certificate as date-of-birth proof", group: "Certificates" },
  { id: "degree", label: "Degree certificate and all marksheets", group: "Certificates" },
  { id: "photoId", label: "Photo identity document matching the name on the form", group: "Certificates" },
  { id: "prefs", label: "Service and post preferences decided — the order binds you", group: "Form entries" },
  { id: "centre", label: "Exam centre preference chosen", group: "Form entries" },
  { id: "fee", label: "Fee paid, with the transaction reference saved", group: "Payment" },
  { id: "printout", label: "Final printout of the submitted form saved as a PDF", group: "After submitting" },
];

/**
 * The full checklist for one commission, one category and one domicile position.
 *
 * @returns {object} result, or { error }.
 */
export function buildStatePscChecklist({
  commissionId = "uppsc",
  categoryId = "ur",
  homeState = true,
  claimsEws = false,
  needsScribe = false,
  today = "",
  dates = {},
} = {}) {
  const commission = COMMISSIONS.find((entry) => entry.id === commissionId);
  if (!commission) return { error: "Pick the commission you are applying to." };

  const category = CATEGORIES.find((entry) => entry.id === categoryId);
  if (!category) return { error: "Pick the category you will claim." };

  const timeline = buildTimeline({ today, dates });
  if (timeline.error) return { error: timeline.error };

  const items = BASE_ITEMS.map((item) => ({ ...item, required: true }));
  const alerts = [];

  const reservedCategory = ["obc", "sc", "st"].includes(category.id);
  if (reservedCategory && homeState) {
    items.push({
      id: `categoryCert-${category.id}`,
      label: `${category.label} certificate in this state's own format, valid on the closing date`,
      group: "Certificates",
      required: true,
    });
    if (category.id === "obc") {
      items.push({
        id: "nclCert",
        label: "Non-creamy-layer certificate for the current financial year",
        group: "Certificates",
        required: true,
      });
    }
    items.push({
      id: "domicile",
      label: "Domicile or residence certificate for this state",
      group: "Certificates",
      required: true,
    });
  }

  if (reservedCategory && !homeState) {
    alerts.push(
      `Your ${category.label} certificate is from another state, so it does not carry here. You may sit the examination, but you are counted as unreserved, pay the unreserved fee and get no age relaxation.`,
    );
  }

  if (claimsEws || category.id === "ews") {
    items.push({
      id: "ewsCert",
      label: "EWS income and asset certificate for the current financial year",
      group: "Certificates",
      required: true,
    });
  }

  if (category.id === "pwd") {
    items.push({
      id: "pwdCert",
      label: "Disability certificate showing 40% or more benchmark disability",
      group: "Certificates",
      required: true,
    });
  }
  if (needsScribe) {
    items.push({
      id: "scribe",
      label: "Scribe request filed with the commission inside its own deadline",
      group: "Form entries",
      required: true,
    });
  }

  items.push({
    id: `language-${commission.id}`,
    label: `Language requirement checked: ${commission.language}`,
    group: "Before you start",
    required: true,
  });

  if (timeline.missedBinding.length > 0) {
    alerts.push(
      `${timeline.missedBinding.map((stage) => stage.label).join("; ")} — this date has already passed on the calendar you entered.`,
    );
  }

  return {
    commission,
    category,
    homeState,
    timeline,
    items,
    alerts: alerts.concat(timeline.warnings),
    notes: commission.notes,
  };
}

/**
 * Progress against required items only.
 *
 * @param {Array<{id:string,required:boolean}>} items
 * @param {Array<string>} doneIds
 */
export function computeChecklistProgress(items, doneIds) {
  const list = Array.isArray(items) ? items : [];
  const done = Array.isArray(doneIds) ? doneIds : [];
  const required = list.filter((item) => item.required !== false);
  const missing = required.filter((item) => !done.includes(item.id));
  const total = required.length;
  const held = total - missing.length;
  return {
    done: held,
    total,
    percent: total === 0 ? 0 : Math.round((held / total) * 100),
    missing,
    ready: total > 0 && missing.length === 0,
  };
}

export default buildStatePscChecklist;
