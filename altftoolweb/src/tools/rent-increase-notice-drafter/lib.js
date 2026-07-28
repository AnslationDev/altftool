/**
 * Rent revision (rent increase) notice drafter — India.
 *
 * Rules referenced:
 *  - Model Tenancy Act, 2021, s.9: the landlord may increase the rent in
 *    accordance with the terms of the tenancy agreement only after giving the
 *    tenant notice in writing three months before the revised rent becomes due.
 *    The Act is a model law — it binds you only where your state or union
 *    territory has enacted its own version of it.
 *  - Transfer of Property Act, 1882, s.106: where an agreement is silent, an
 *    ordinary lease is month to month and terminable by fifteen days' written
 *    notice; a landlord who cannot revise rent under the agreement generally
 *    has to terminate and offer a fresh tenancy on new terms.
 *  - Maharashtra Rent Control Act, 1999, s.11(1): for premises governed by that
 *    Act, the landlord may increase the rent by four per cent per year of the
 *    standard rent.
 *  - Delhi Rent Control Act, 1958, s.6A: the standard rent may be increased by
 *    ten per cent every three years.
 *
 * The two state caps above are included as worked comparisons. They apply only
 * to premises actually governed by those Acts — most new market-rate tenancies
 * in those states are outside them. This is an informational drafting aid, not
 * legal advice.
 */

/* ------------------------------------------------------------------ dates */

const MS_PER_DAY = 86_400_000;
/** Average calendar year including leap years, used for annualising a rise. */
export const DAYS_PER_YEAR = 365.25;

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

export function daysBetweenISO(fromISO, toISODate) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISODate);
  if (!from || !to) return null;
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
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

export function formatMonthYear(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

/* --------------------------------------------------------------- constants */

/** Model Tenancy Act, 2021, s.9 — written notice before the revised rent is due. */
export const MTA_REVISION_NOTICE_MONTHS = 3;
/** Maharashtra Rent Control Act, 1999, s.11(1) — 4% a year of standard rent. */
export const MAHARASHTRA_ANNUAL_CAP_PERCENT = 4;
/** Delhi Rent Control Act, 1958, s.6A — 10% every three years. */
export const DELHI_CAP_PERCENT = 10;
export const DELHI_CAP_PERIOD_YEARS = 3;
/** Sanity bounds so a typo cannot produce an absurd notice. */
export const MAX_MONTHLY_RENT = 100_000_000;
export const MIN_INCREASE_PERCENT = -99;
export const MAX_INCREASE_PERCENT = 500;
export const MAX_DEPOSIT_MONTHS = 12;

export const REVISION_MODES = {
  PERCENT: "percent",
  AMOUNT: "amount",
};

export const REVISION_GROUNDS = [
  {
    id: "agreement-clause",
    label: "Escalation clause in the agreement",
    line: "the rent escalation clause in our tenancy agreement falls due on renewal",
  },
  {
    id: "market",
    label: "Market rent in the locality",
    line: "the prevailing rent for comparable units in this locality has risen since the rent was last fixed",
  },
  {
    id: "costs",
    label: "Higher property tax, maintenance or society charges",
    line: "property tax, society maintenance and repair costs on the premises have risen since the rent was last fixed",
  },
  {
    id: "improvements",
    label: "Improvements made to the property",
    line: "improvements have been carried out to the premises at my cost",
  },
  {
    id: "renewal",
    label: "Renewal of the tenancy for a fresh term",
    line: "the tenancy is being renewed for a fresh term on revised terms",
  },
  {
    id: "other",
    label: "Other ground",
    line: "of the ground set out below",
  },
];

export function groundById(id) {
  return REVISION_GROUNDS.find((item) => item.id === id) || REVISION_GROUNDS[REVISION_GROUNDS.length - 1];
}

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

/* --------------------------------------------------------------- assessment */

/**
 * Work out the revised rent, what the rise costs the tenant over a year, how it
 * annualises since the last revision, whether the notice period is long enough,
 * and how it compares with two statutory rent caps.
 * Pure: every date and amount is an argument.
 */
export function assessRentRevision({
  currentRent,
  mode,
  increasePercent,
  newRentInput,
  noticeDateISO,
  effectiveDateISO,
  lastRevisionDateISO,
  depositMonths,
  currentDeposit,
}) {
  const rent = Number(currentRent);
  if (!Number.isFinite(rent) || rent <= 0) return { error: "The current monthly rent must be greater than zero." };
  if (rent > MAX_MONTHLY_RENT) return { error: "That monthly rent is outside the range this tool handles." };

  if (!parseISODate(noticeDateISO)) return { error: "Enter a valid date for the notice." };
  if (!parseISODate(effectiveDateISO)) return { error: "Enter a valid date from which the revised rent applies." };

  const noticeDaysGiven = daysBetweenISO(noticeDateISO, effectiveDateISO);
  if (noticeDaysGiven < 0) {
    return { error: "The revised rent cannot take effect before the date of the notice." };
  }

  let newRent;
  let pct;
  if (mode === REVISION_MODES.AMOUNT) {
    newRent = Number(newRentInput);
    if (!Number.isFinite(newRent) || newRent <= 0) return { error: "The revised monthly rent must be greater than zero." };
    if (newRent > MAX_MONTHLY_RENT) return { error: "That revised rent is outside the range this tool handles." };
    pct = ((newRent - rent) / rent) * 100;
  } else {
    pct = Number(increasePercent);
    if (!Number.isFinite(pct) || pct <= MIN_INCREASE_PERCENT || pct > MAX_INCREASE_PERCENT) {
      return { error: `The revision must be between ${MIN_INCREASE_PERCENT}% and ${MAX_INCREASE_PERCENT}%.` };
    }
    newRent = rent * (1 + pct / 100);
  }

  const increaseAmount = newRent - rent;
  const annualExtra = increaseAmount * 12;

  // Annualised rate of increase since the rent was last fixed.
  let yearsSinceRevision = null;
  let annualisedPercent = null;
  if (parseISODate(lastRevisionDateISO)) {
    const gapDays = daysBetweenISO(lastRevisionDateISO, effectiveDateISO);
    if (gapDays < 0) {
      return { error: "The last revision date is after the date the new rent takes effect." };
    }
    yearsSinceRevision = gapDays / DAYS_PER_YEAR;
    if (yearsSinceRevision > 0 && newRent > 0) {
      annualisedPercent = (Math.pow(newRent / rent, 1 / yearsSinceRevision) - 1) * 100;
      if (!Number.isFinite(annualisedPercent)) annualisedPercent = null;
    }
  }

  // Notice-period check against the Model Tenancy Act.
  const mtaDueISO = addMonthsISO(noticeDateISO, MTA_REVISION_NOTICE_MONTHS);
  const mtaShortfallDays = Math.max(0, daysBetweenISO(effectiveDateISO, mtaDueISO));
  const mtaCompliant = mtaShortfallDays === 0;

  // Deposit top-up, where the deposit is a stated number of months' rent.
  const months = Number(depositMonths);
  if (!Number.isFinite(months) || months < 0 || months > MAX_DEPOSIT_MONTHS) {
    return { error: `The deposit must be between 0 and ${MAX_DEPOSIT_MONTHS} months of rent.` };
  }
  const heldDeposit = Number(currentDeposit);
  if (!Number.isFinite(heldDeposit) || heldDeposit < 0) {
    return { error: "The deposit currently held cannot be negative." };
  }
  const newDepositRequired = newRent * months;
  const depositTopUp = Math.max(0, newDepositRequired - heldDeposit);

  // Statutory cap comparisons, only meaningful when the last revision is known.
  let maharashtraCapRent = null;
  let delhiCapRent = null;
  if (yearsSinceRevision !== null) {
    maharashtraCapRent = rent * Math.pow(1 + MAHARASHTRA_ANNUAL_CAP_PERCENT / 100, yearsSinceRevision);
    const completedBlocks = Math.floor(yearsSinceRevision / DELHI_CAP_PERIOD_YEARS);
    delhiCapRent = rent * Math.pow(1 + DELHI_CAP_PERCENT / 100, completedBlocks);
  }

  return {
    currentRent: rent,
    newRent,
    increaseAmount,
    increasePercent: pct,
    annualExtra,
    yearsSinceRevision,
    annualisedPercent,
    noticeDaysGiven,
    mtaDueISO,
    mtaShortfallDays,
    mtaCompliant,
    depositMonths: months,
    heldDeposit,
    newDepositRequired,
    depositTopUp,
    maharashtraCapRent,
    delhiCapRent,
    overMaharashtraCap: maharashtraCapRent !== null && newRent > maharashtraCapRent,
    overDelhiCap: delhiCapRent !== null && newRent > delhiCapRent,
    isReduction: increaseAmount < 0,
  };
}

/* ------------------------------------------------------------------ notice */

const clean = (value) => (typeof value === "string" ? value.trim() : "");
const or = (value, fallback) => clean(value) || fallback;

export function buildRentRevisionNotice({
  landlordName,
  landlordAddress,
  tenantName,
  tenantAddress,
  premisesAddress,
  agreementDateISO,
  noticeDateISO,
  effectiveDateISO,
  groundId,
  groundDetail,
  paymentDueDay,
  paymentMethod,
  requireDepositTopUp,
  phone,
  email,
  assessment,
}) {
  if (!assessment || assessment.error) {
    return { error: assessment?.error || "Fix the amounts and dates before drafting the notice." };
  }

  const landlord = or(landlordName, "[Landlord's name]");
  const tenant = or(tenantName, "[Tenant's name]");
  const premises = or(premisesAddress, "[Address of the rented premises]");
  const ground = groundById(groundId);
  const detail = clean(groundDetail);
  const groundText = ground.id === "other" && detail ? detail : ground.line;

  const dueDay = Number(paymentDueDay);
  const dueDayText = Number.isFinite(dueDay) && dueDay >= 1 && dueDay <= 28 ? `${Math.round(dueDay)}` : "5";

  const headlineLine = assessment.isReduction
    ? `the monthly rent will be reduced from ${formatINR(assessment.currentRent)} to ${formatINR(assessment.newRent)}, a reduction of ${formatINR(Math.abs(assessment.increaseAmount))} (${formatPercent(Math.abs(assessment.increasePercent))}), with effect from ${formatLongDate(effectiveDateISO)}.`
    : `the monthly rent will be revised from ${formatINR(assessment.currentRent)} to ${formatINR(assessment.newRent)}, an increase of ${formatINR(assessment.increaseAmount)} (${formatPercent(assessment.increasePercent)}), with effect from ${formatLongDate(effectiveDateISO)}.`;

  const noticeLine = assessment.mtaCompliant
    ? `This notice gives you ${plural(assessment.noticeDaysGiven, "day")} before the revised rent falls due, which meets the three months' written notice that section 9 of the Model Tenancy Act, 2021 requires where that Act is in force.`
    : `This notice gives you ${plural(assessment.noticeDaysGiven, "day")} before the revised rent falls due. Where a state has enacted a tenancy law based on the Model Tenancy Act, 2021, section 9 of that Act asks for three months' written notice, which would put the effective date at ${formatLongDate(assessment.mtaDueISO)}. If you would prefer that date, please tell me and I will move the revision accordingly.`;

  const annualisedLine =
    assessment.annualisedPercent !== null
      ? `The rent was last fixed ${assessment.yearsSinceRevision.toFixed(1)} years ago, so the revision works out to about ${formatPercent(assessment.annualisedPercent)} a year over that period.`
      : "";

  const depositLine =
    requireDepositTopUp && assessment.depositTopUp > 0
      ? `The security deposit under our agreement is ${plural(assessment.depositMonths, "month")}' rent. At the revised rent that comes to ${formatINR(assessment.newDepositRequired)} against the ${formatINR(assessment.heldDeposit)} currently held, so a top-up of ${formatINR(assessment.depositTopUp)} would be due on the effective date. If you would rather leave the deposit unchanged, I am content to do that — please let me know.`
      : `The security deposit of ${formatINR(assessment.heldDeposit)} already held will remain unchanged; no top-up is being asked for.`;

  const subject = assessment.isReduction
    ? `Notice of rent revision — ${premises} — reduced rent from ${formatLongDate(effectiveDateISO)}`
    : `Notice of rent revision — ${premises} — revised rent from ${formatLongDate(effectiveDateISO)}`;

  const body = [
    formatLongDate(noticeDateISO),
    "",
    "To,",
    `${tenant},`,
    clean(tenantAddress) || premises,
    "",
    `Subject: ${subject}`,
    "",
    "Dear " + tenant.split(/\s+/)[0] + ",",
    "",
    `I am the landlord of the premises at ${premises}, of which you are the tenant${parseISODate(agreementDateISO) ? ` under the leave and licence / rent agreement dated ${formatLongDate(agreementDateISO)}` : ""}.`,
    "",
    `This is written notice that ${headlineLine}`,
    "",
    `The revision is being made because ${groundText}.`,
    detail && ground.id !== "other" ? detail : "",
    annualisedLine,
    "",
    noticeLine,
    "",
    "Summary of the revision:",
    `  Present monthly rent: ${formatINR(assessment.currentRent)}`,
    `  Revised monthly rent: ${formatINR(assessment.newRent)}`,
    `  Change: ${formatINR(assessment.increaseAmount)} (${formatPercent(assessment.increasePercent)})`,
    `  Effective from: ${formatLongDate(effectiveDateISO)}`,
    `  First revised rent payable for: ${formatMonthYear(effectiveDateISO)}`,
    `  Change in your annual outgo: ${formatINR(assessment.annualExtra)}`,
    "",
    depositLine,
    "",
    `Please continue to pay the rent by the ${dueDayText}th of each month, ${or(paymentMethod, "by bank transfer to the account already on record")}. All other terms of the tenancy agreement remain unchanged.`,
    "",
    assessment.isReduction
      ? "Nothing else about the tenancy changes, and no fresh agreement is needed unless you would like one recording the reduced rent."
      : "If you would like to discuss the revision, or need the effective date moved, please write to me before the effective date so that we can settle it in good time. I value you as a tenant and would rather agree the figure than impose it.",
    "",
    "Kindly acknowledge receipt of this notice in writing.",
    "",
    "Thank you.",
    "",
    "Yours sincerely,",
    "",
    landlord,
    `Landlord, ${premises}`,
    clean(landlordAddress) ? `Address: ${clean(landlordAddress)}` : "",
    clean(phone) ? `Phone: ${clean(phone)}` : "Phone: [your phone number]",
    clean(email) ? `Email: ${clean(email)}` : "Email: [your email address]",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { subject, body, wordCount: body.split(/\s+/).filter(Boolean).length };
}
