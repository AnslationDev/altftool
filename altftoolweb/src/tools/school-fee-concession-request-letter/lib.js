/**
 * School fee concession / instalment request letter builder (India).
 *
 * Rules referenced:
 *  - Right of Children to Free and Compulsory Education Act, 2009, s.3(2): no
 *    child shall be liable to pay any kind of fee or charges or expenses which
 *    may prevent them from pursuing and completing elementary education.
 *  - RTE Act, 2009, s.12(1)(c): a private unaided school must admit, in class I,
 *    at least twenty-five per cent of the strength of that class from children
 *    belonging to weaker sections and disadvantaged groups in the neighbourhood
 *    and provide them free and compulsory elementary education till its
 *    completion; s.12(2) provides for reimbursement by the government.
 *  - RTE Act, 2009, s.13(1): no school or person shall, while admitting a child,
 *    collect any capitation fee or subject the child or parents to any screening
 *    procedure.
 *  - Fee regulation itself is state law. Several states have their own Act and a
 *    Fee Regulatory Committee or District Fee Regulation Committee that hears
 *    parent representations. Check the position in your state before treating a
 *    fee as excessive.
 *
 * A concession beyond the RTE entitlement is discretionary — it depends on the
 * school's own policy and, for an aided school, on the education department's
 * rules. Informational only, not legal advice.
 */

/* ------------------------------------------------------------------ dates */

export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

const toISO = (date) => date.toISOString().slice(0, 10);

export function addMonthsISO(isoDate, months) {
  const date = parseISODate(isoDate);
  if (!date || !Number.isFinite(months)) return null;
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + Math.round(months);
  const d = date.getUTCDate();
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return toISO(new Date(Date.UTC(y, m, Math.min(d, lastDay))));
}

export function formatLongDate(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/* --------------------------------------------------------------- constants */

/** RTE Act, 2009, s.12(1)(c) — reserved share of class I in a private unaided school. */
export const RTE_RESERVED_SHARE_PERCENT = 25;
/** Sanity bounds so a typo cannot produce an absurd figure. */
export const MAX_FEE_COMPONENT = 10_000_000;
export const MAX_CONCESSION_PERCENT = 100;
export const MIN_INSTALMENTS = 1;
export const MAX_INSTALMENTS = 24;
export const MAX_INTERVAL_MONTHS = 12;

export const CONCESSION_MODES = {
  PERCENT: "percent",
  AMOUNT: "amount",
};

export const CONCESSION_GROUNDS = [
  {
    id: "job-loss",
    label: "Loss of employment",
    line: "I lost my employment and the family is running on savings while I look for work",
    proof: "Relieving letter or termination letter, and the last three salary slips",
  },
  {
    id: "medical",
    label: "Medical emergency in the family",
    line: "a medical emergency in the family has taken up the money set aside for the year's fees",
    proof: "Hospital bills, discharge summary and, where applicable, the insurance rejection letter",
  },
  {
    id: "death",
    label: "Death of the earning member",
    line: "the earning member of our family passed away and our income has stopped",
    proof: "Death certificate and proof of the household's present income",
  },
  {
    id: "single-parent",
    label: "Single parent household",
    line: "I am raising the family on a single income",
    proof: "Income certificate and, where applicable, the decree of divorce or the death certificate",
  },
  {
    id: "business-loss",
    label: "Business loss or closure",
    line: "my business has suffered sustained losses and the income it used to give has fallen away",
    proof: "Income tax returns for the last two years and the current bank statement",
  },
  {
    id: "sibling",
    label: "More than one child in the school",
    line: "more than one of my children study in this school and the combined fee is beyond what I can meet",
    proof: "Fee receipts for each child and their admission numbers",
  },
  {
    id: "merit",
    label: "Academic merit",
    line: "my child has consistently been among the top performers of the class",
    proof: "Report cards for the last two academic years",
  },
  {
    id: "sports",
    label: "Sports or co-curricular achievement",
    line: "my child represents the school in competitive events and the training cost is already substantial",
    proof: "Certificates of participation and the coach's or department's recommendation",
  },
  {
    id: "rte-category",
    label: "RTE reserved category",
    line: "my child belongs to the weaker section and disadvantaged group category covered by the Right to Education Act",
    proof: "Income certificate, caste certificate where applicable, and the neighbourhood residence proof",
    rte: true,
  },
  {
    id: "disaster",
    label: "Flood, fire or other disaster",
    line: "our home and belongings were damaged in a disaster and rebuilding has taken every rupee we had",
    proof: "Panchayat or municipal damage assessment, and photographs",
  },
  {
    id: "transfer",
    label: "Transfer with a fall in allowances",
    line: "I have been transferred and the loss of allowances has cut our monthly income sharply",
    proof: "Transfer order and the revised salary statement",
  },
  {
    id: "other",
    label: "Other ground",
    line: "of the circumstances set out below",
    proof: "Any document that supports the circumstances described",
  },
];

export function groundById(id) {
  return CONCESSION_GROUNDS.find((item) => item.id === id) || CONCESSION_GROUNDS[CONCESSION_GROUNDS.length - 1];
}

/** Grounds that are an achievement, not a hardship — the letter's opening sentence must not frame these as "a difficulty". */
export const ACHIEVEMENT_GROUND_IDS = new Set(["merit", "sports"]);

export const REQUEST_KINDS = {
  CONCESSION: "concession",
  INSTALMENTS: "instalments",
  BOTH: "both",
};

/* ------------------------------------------------------------- formatting */

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

export function formatINR(value) {
  return INR.format(Number.isFinite(Number(value)) ? Number(value) : 0);
}

export function formatPercent(value) {
  return `${PCT.format(Number.isFinite(Number(value)) ? Number(value) : 0)}%`;
}

export function plural(count, word) {
  const n = Math.abs(Math.round(Number(count) || 0));
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/* --------------------------------------------------------------- fee maths */

const FEE_KEYS = ["tuition", "transport", "activity", "exam", "other"];

export const FEE_LABELS = {
  tuition: "Tuition fee",
  transport: "Transport fee",
  activity: "Activity and lab fee",
  exam: "Examination fee",
  other: "Other charges",
};

/** Add up the annual fee components, rejecting negative or absurd figures. */
export function computeFeeTotal(components) {
  const parts = {};
  for (const key of FEE_KEYS) {
    const value = Number(components?.[key] ?? 0);
    if (!Number.isFinite(value) || value < 0) {
      return { error: `${FEE_LABELS[key]} must be zero or a positive number.` };
    }
    if (value > MAX_FEE_COMPONENT) {
      return { error: `${FEE_LABELS[key]} is outside the range this tool handles.` };
    }
    parts[key] = value;
  }
  const total = FEE_KEYS.reduce((sum, key) => sum + parts[key], 0);
  if (total <= 0) return { error: "Enter at least one fee component greater than zero." };
  return { parts, total };
}

/**
 * Work out the concession and what is left to pay.
 * Concession applies to the total annual fee; arrears are added afterwards
 * because a school will normally not waive a sum already billed and overdue.
 */
export function computeConcession({ total, mode, concessionPercent, concessionAmount, arrears }) {
  const feeTotal = Number(total);
  if (!Number.isFinite(feeTotal) || feeTotal <= 0) return { error: "The annual fee total must be greater than zero." };

  const due = Number(arrears);
  if (!Number.isFinite(due) || due < 0) return { error: "Arrears cannot be negative." };

  let amount;
  let percent;
  if (mode === CONCESSION_MODES.AMOUNT) {
    amount = Number(concessionAmount);
    if (!Number.isFinite(amount) || amount < 0) return { error: "The concession asked for cannot be negative." };
    if (amount > feeTotal) return { error: "The concession asked for is more than the whole year's fee." };
    percent = (amount / feeTotal) * 100;
  } else {
    percent = Number(concessionPercent);
    if (!Number.isFinite(percent) || percent < 0 || percent > MAX_CONCESSION_PERCENT) {
      return { error: `The concession must be between 0% and ${MAX_CONCESSION_PERCENT}%.` };
    }
    amount = (feeTotal * percent) / 100;
  }

  const netFee = feeTotal - amount;
  // Round to whole rupees here so every downstream consumer (the header
  // total, the letter text and the instalment split) works from the same
  // integer base and can never disagree after display rounding.
  const payable = Math.round(netFee + due);

  return { concessionAmount: amount, concessionPercent: percent, netFee, arrears: due, payable };
}

/**
 * Split an amount into equal instalments rounded to whole rupees, with the
 * final instalment absorbing the rounding difference so the rows always add
 * back to the exact payable amount.
 */
export function buildInstalmentPlan({ payable, instalments, firstDueISO, intervalMonths }) {
  const amount = Number(payable);
  if (!Number.isFinite(amount) || amount <= 0) return { error: "There is nothing left to pay after the concession." };

  const count = Number(instalments);
  if (!Number.isFinite(count) || count < MIN_INSTALMENTS || count > MAX_INSTALMENTS || Math.round(count) !== count) {
    return { error: `The number of instalments must be a whole number between ${MIN_INSTALMENTS} and ${MAX_INSTALMENTS}.` };
  }

  const gap = Number(intervalMonths);
  if (!Number.isFinite(gap) || gap < 1 || gap > MAX_INTERVAL_MONTHS || Math.round(gap) !== gap) {
    return { error: `The gap between instalments must be a whole number of months between 1 and ${MAX_INTERVAL_MONTHS}.` };
  }

  if (!parseISODate(firstDueISO)) return { error: "Enter a valid date for the first instalment." };

  const each = Math.round(amount / count);
  const rows = [];
  let allocated = 0;
  for (let index = 0; index < count; index += 1) {
    const isLast = index === count - 1;
    const value = isLast ? Math.round((amount - allocated) * 100) / 100 : each;
    allocated += value;
    rows.push({
      number: index + 1,
      dueISO: addMonthsISO(firstDueISO, gap * index),
      amount: value,
    });
  }

  return { rows, perInstalment: each, lastInstalment: rows[rows.length - 1].amount, total: amount };
}

/**
 * Fee as a share of declared annual household income — the single figure that
 * makes an affordability case concrete.
 */
export function computeAffordability({ payable, monthlyIncome }) {
  const blank =
    monthlyIncome === undefined ||
    monthlyIncome === null ||
    (typeof monthlyIncome === "string" && monthlyIncome.trim() === "");
  if (blank) return { annualIncome: 0, feeShare: null };

  const income = Number(monthlyIncome);
  if (!Number.isFinite(income)) {
    return { error: "Monthly household income must be a valid number." };
  }
  if (income < 0) return { error: "Monthly household income cannot be negative." };
  if (income === 0) return { annualIncome: 0, feeShare: null };
  const annualIncome = income * 12;
  const amount = Number(payable);
  if (!Number.isFinite(amount) || amount < 0) return { error: "The payable amount is not a valid number." };
  return { annualIncome, feeShare: (amount / annualIncome) * 100 };
}

/* ------------------------------------------------------------------ letter */

const clean = (value) => (typeof value === "string" ? value.trim() : "");
const or = (value, fallback) => clean(value) || fallback;

/** Roman-numeral class labels mapped to their numeric level, I-XII. */
const ROMAN_CLASS_LEVELS = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
  IX: 9,
  X: 10,
  XI: 11,
  XII: 12,
};

/**
 * Best-effort numeric class level from a free-text class label ("VIII", "8",
 * "Class 8", "8th"). Returns null when the label can't be confidently parsed
 * (e.g. "Nursery", "LKG") so callers can fall back to their default.
 */
function normaliseClassLabel(className) {
  return clean(className)
    .toUpperCase()
    .replace(/^CLASS(?:\s+|[-:/]\s*)/, "")
    .trim();
}

function parseClassLevel(className) {
  const raw = normaliseClassLabel(className);
  if (!raw) return null;

  const roman = /^(XII|XI|X|IX|VIII|VII|VI|V|IV|III|II|I)(?=$|[\s./_-])/.exec(raw)?.[1];
  if (roman && Object.prototype.hasOwnProperty.call(ROMAN_CLASS_LEVELS, roman)) {
    return ROMAN_CLASS_LEVELS[roman];
  }

  const numeric = /^(\d{1,2})(?:ST|ND|RD|TH)?(?=$|[\s./_-])/.exec(raw)?.[1];
  const level = Number(numeric);
  return Number.isFinite(level) && level > 0 ? level : null;
}

export function classifyRteClass(className) {
  const raw = normaliseClassLabel(className);
  if (/^(?:PRE[-\s]?PRIMARY|NURSERY|LKG|UKG|KG(?:[-\s]?[12])?|KINDERGARTEN(?:[-\s]?[12])?)(?:$|[\s./_-])/.test(raw)) {
    return "pre-primary";
  }
  const level = parseClassLevel(className);
  if (level === null) return "unknown";
  return level <= 8 ? "elementary" : "post-elementary";
}

function rteParagraphForClass(className, displayClass) {
  const category = classifyRteClass(className);
  if (category === "elementary") {
    return `My child belongs to a weaker section or disadvantaged group. Section 12(1)(c) of the Right of Children to Free and Compulsory Education Act, 2009 requires specified schools to admit at least ${RTE_RESERVED_SHARE_PERCENT} per cent of their class I intake from those groups and provide the children admitted under that provision free and compulsory elementary education till completion. Section 3(2) protects a covered child from fees or charges that may prevent completion of elementary education. I request that the school verify my child's eligibility and admission status under the applicable RTE and State rules and, if covered, apply those protections.`;
  }
  if (category === "pre-primary") {
    return `My child belongs to a weaker section or disadvantaged group. The proviso to section 12(1) of the Right of Children to Free and Compulsory Education Act, 2009 applies the entry-level provisions to pre-school admission where the school imparts pre-school education. I request that the school verify whether this provision and the applicable State rules cover my child's admission and, if so, apply the corresponding protections.`;
  }
  if (category === "post-elementary") {
    return `My child belongs to a weaker section or disadvantaged group. As ${displayClass} is beyond elementary education, which the Right of Children to Free and Compulsory Education Act, 2009 defines as Class I to Class VIII, this request does not claim an RTE fee entitlement for the current class. I ask that the school consider our circumstances under its own concession policy and any applicable State rules.`;
  }
  return `My child belongs to a weaker section or disadvantaged group. Because the class or entry level is not clear, I ask that the school verify whether section 12(1)(c) of the Right of Children to Free and Compulsory Education Act, 2009 and the applicable State rules cover this admission. If they do not, please consider our circumstances under the school's own concession policy.`;
}

export function buildFeeConcessionLetter({
  parentName,
  studentName,
  admissionNumber,
  className,
  section,
  academicYear,
  schoolName,
  schoolAddress,
  addressee,
  letterDateISO,
  requestKind,
  groundId,
  groundDetail,
  occupation,
  siblingDetail,
  fee,
  concession,
  plan,
  affordability,
  phone,
  email,
  assessment,
}) {
  if (affordability?.error) return { error: affordability.error };
  // Preserve the legacy alias for direct callers while the page uses
  // `affordability` consistently.
  if (assessment?.error) return { error: assessment.error };
  if (fee?.error) return { error: fee.error };
  if (concession?.error) return { error: concession.error };
  if (requestKind !== REQUEST_KINDS.CONCESSION && plan?.error) return { error: plan.error };

  const ground = groundById(groundId);
  const detail = clean(groundDetail);
  if (ground.id === "other" && !detail) {
    return { error: 'Describe the circumstances for "Other ground" before generating the letter.' };
  }

  const parent = or(parentName, "[Your name]");
  const student = or(studentName, "[Student's name]");
  const cls = or(className, "[Class]");
  const sec = clean(section);
  const school = or(schoolName, "[Name of the school]");
  const to = or(addressee, "The Principal");
  const admission = or(admissionNumber, "[Admission number]");
  const year = or(academicYear, "[Academic year]");
  const groundText = ground.id === "other" && detail ? detail : ground.line;
  const openingSentence = ACHIEVEMENT_GROUND_IDS.has(ground.id)
    ? "I am writing to request your consideration for a fee concession in recognition of my child's achievement."
    : "I am writing to place before you a difficulty I would not raise if there were another way.";

  const feeLines = [
    "The fee for the year, as billed:",
    ...Object.keys(FEE_LABELS)
      .filter((key) => fee.parts[key] > 0)
      .map((key) => `  ${FEE_LABELS[key]}: ${formatINR(fee.parts[key])}`),
    `  Total for the year: ${formatINR(fee.total)}`,
    concession.arrears > 0 ? `  Arrears already outstanding: ${formatINR(concession.arrears)}` : "",
  ].filter(Boolean);

  const askConcession =
    requestKind !== REQUEST_KINDS.INSTALMENTS
      ? `I request a concession of ${formatPercent(concession.concessionPercent)} of the annual fee, that is ${formatINR(concession.concessionAmount)}, which would bring the fee for the year to ${formatINR(concession.netFee)}.`
      : "";

  const askInstalments =
    requestKind !== REQUEST_KINDS.CONCESSION && plan && !plan.error
      ? [
          `I request permission to pay ${formatINR(concession.payable)} in ${plural(plan.rows.length, "instalment")} on the dates below, and I undertake to keep to them:`,
          ...plan.rows.map((row) => `  ${row.number}. ${formatLongDate(row.dueISO)} — ${formatINR(row.amount)}`),
        ]
      : [];

  const affordabilityLine =
    affordability && !affordability.error && affordability.feeShare !== null
      ? `Our declared household income is about ${formatINR(affordability.annualIncome)} a year, so the amount now payable is ${formatPercent(affordability.feeShare)} of it.`
      : "";

  const rteLine = ground.rte ? rteParagraphForClass(className, `Class ${cls}`) : "";

  const subject = `Request for ${requestKind === REQUEST_KINDS.INSTALMENTS ? "permission to pay the fee in instalments" : requestKind === REQUEST_KINDS.CONCESSION ? "fee concession" : "fee concession and payment in instalments"} — ${student}, Class ${cls}${sec ? `-${sec}` : ""} (Admission No. ${admission})`;

  const body = [
    formatLongDate(letterDateISO) || "[Date]",
    "",
    "To,",
    `${to},`,
    school,
    clean(schoolAddress),
    "",
    `Subject: ${subject}`,
    "",
    "Respected Sir / Madam,",
    "",
    `I am ${parent}, parent of ${student}, a student of Class ${cls}${sec ? `-${sec}` : ""}, bearing Admission No. ${admission}, for the academic year ${year}.`,
    "",
    `${openingSentence} ${groundText.charAt(0).toUpperCase()}${groundText.slice(1)}.`,
    detail && ground.id !== "other" ? detail : "",
    clean(occupation) ? `I work as ${clean(occupation)}.` : "",
    clean(siblingDetail) ? clean(siblingDetail) : "",
    "",
    ...feeLines,
    "",
    affordabilityLine,
    "",
    askConcession,
    "",
    ...askInstalments,
    "",
    rteLine,
    "",
    `I am enclosing supporting documents: ${ground.proof.toLowerCase()}. I am willing to produce anything further the school needs, and to meet you in person at your convenience.`,
    "",
    `${student} is happy at this school and I do not want the year interrupted. Whatever relief the school can extend will be used only to keep ${student.split(/\s+/)[0]}'s education going, and I will resume the full fee as soon as our circumstances allow.`,
    "",
    "Thank you for considering this request.",
    "",
    "Yours faithfully,",
    "",
    parent,
    `Parent of ${student}, Class ${cls}${sec ? `-${sec}` : ""}, Admission No. ${admission}`,
    clean(phone) ? `Phone: ${clean(phone)}` : "Phone: [your phone number]",
    clean(email) ? `Email: ${clean(email)}` : "Email: [your email address]",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { subject, body, wordCount: body.split(/\s+/).filter(Boolean).length, ground };
}
