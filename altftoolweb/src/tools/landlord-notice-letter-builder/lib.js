/**
 * Landlord notice letter builder — vacating notice and repair request (India).
 *
 * Rules referenced:
 *  - Transfer of Property Act, 1882, s.106: in the absence of a contract, local
 *    law or usage to the contrary, a lease of immovable property for
 *    agricultural or manufacturing purposes is deemed to be year to year,
 *    terminable by six months' notice; every other lease is deemed to be month
 *    to month, terminable by fifteen days' notice. The notice must be in
 *    writing, signed by or on behalf of the person giving it, and the period
 *    runs from the date of receipt of the notice.
 *  - Transfer of Property Act, 1882, s.108(f) and (m): the lessor must, on the
 *    lessee's notice, repair a defect in the property within a reasonable time,
 *    failing which the lessee may make the repair and deduct the cost, with
 *    interest, from the rent; the lessee must keep the property in the state in
 *    which it was given, fair wear and tear excepted.
 *  - Model Tenancy Act, 2021 (a model law — it binds you only if your state or
 *    union territory has enacted its own version of it):
 *      s.11(2)  security deposit is capped at two months' rent for premises let
 *               for residential purpose and six months' rent for non-residential
 *               purpose;
 *      s.21(1)  a tenant who does not vacate on expiry or termination is liable
 *               to pay compensation of double the monthly rent for the first two
 *               months and four times the monthly rent thereafter;
 *      Schedule I allocates repairs between landlord and tenant, and where the
 *               landlord refuses to make the repairs that are their
 *               responsibility, the tenant may carry them out and deduct the
 *               cost from the rent in the manner the enacted law allows.
 *
 * Rent control legislation in your state may override all of the above. This is
 * an informational drafting aid, not legal advice.
 */

/* ------------------------------------------------------------------ dates */

const MS_PER_DAY = 86_400_000;

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

export function addDaysISO(isoDate, days) {
  const date = parseISODate(isoDate);
  if (!date || !Number.isFinite(days)) return null;
  return toISO(new Date(date.getTime() + Math.round(days) * MS_PER_DAY));
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

/* --------------------------------------------------------------- constants */

/** TPA, 1882 s.106 — statutory fallback notice for a month-to-month lease. */
export const TPA_MONTHLY_NOTICE_DAYS = 15;
/** TPA, 1882 s.106 — fallback for an agricultural or manufacturing lease. */
export const TPA_YEARLY_NOTICE_MONTHS = 6;
/** Model Tenancy Act, 2021 s.11(2) — deposit cap, residential premises. */
export const MTA_RESIDENTIAL_DEPOSIT_MONTHS = 2;
/** Model Tenancy Act, 2021 s.11(2) — deposit cap, non-residential premises. */
export const MTA_NON_RESIDENTIAL_DEPOSIT_MONTHS = 6;
/** Model Tenancy Act, 2021 s.21(1) — first two months of unlawful occupation. */
export const MTA_OVERSTAY_FIRST_MULTIPLIER = 2;
export const MTA_OVERSTAY_FIRST_MONTHS = 2;
/** Model Tenancy Act, 2021 s.21(1) — from the third month onwards. */
export const MTA_OVERSTAY_LATER_MULTIPLIER = 4;
/** Rent agreements almost always pro-rate a part month on a 30-day basis. */
export const PRORATA_DAYS_PER_MONTH = 30;
/** Sanity bounds so a typo cannot produce an absurd result. */
export const MAX_MONTHLY_RENT = 100_000_000;
export const MAX_NOTICE_DAYS = 365;

export const LETTER_MODES = {
  VACATE: "vacate",
  REPAIR: "repair",
};

export const PROPERTY_USES = [
  { id: "residential", label: "Residential", depositMonths: MTA_RESIDENTIAL_DEPOSIT_MONTHS },
  { id: "non-residential", label: "Shop, office or other non-residential", depositMonths: MTA_NON_RESIDENTIAL_DEPOSIT_MONTHS },
];

export function propertyUseById(id) {
  return PROPERTY_USES.find((item) => item.id === id) || PROPERTY_USES[0];
}

export const VACATE_REASONS = [
  { id: "job-relocation", label: "Job relocation", line: "I have been transferred to another city by my employer" },
  { id: "own-house", label: "Moving into my own house", line: "I am moving into a house of my own" },
  { id: "rent-increase", label: "Rent revision I cannot meet", line: "the revised rent is beyond what I can commit to" },
  { id: "bigger-place", label: "Need a larger or smaller home", line: "my family's requirement has changed and I need a different size of home" },
  { id: "repairs-unresolved", label: "Repairs left unattended", line: "the maintenance issues I reported have remained unattended" },
  { id: "personal", label: "Personal reasons", line: "of personal circumstances" },
  { id: "lease-end", label: "Lease is simply ending", line: "the term of the tenancy is ending and I do not wish to renew" },
  { id: "other", label: "Other reason", line: "of the reason set out below" },
];

export function vacateReasonById(id) {
  return VACATE_REASONS.find((item) => item.id === id) || VACATE_REASONS[VACATE_REASONS.length - 1];
}

export const REPAIR_ITEMS = [
  { id: "seepage", label: "Water seepage or damp walls", landlordDuty: true },
  { id: "plumbing", label: "Leaking pipes, taps or drainage blockage", landlordDuty: true },
  { id: "electrical", label: "Faulty wiring, tripping MCB or dead sockets", landlordDuty: true },
  { id: "structural", label: "Cracks, loose plaster or a sagging ceiling", landlordDuty: true },
  { id: "waterproofing", label: "Terrace or bathroom waterproofing", landlordDuty: true },
  { id: "doors-windows", label: "Broken doors, windows or grills", landlordDuty: true },
  { id: "geyser", label: "Geyser, chimney or fixed appliance provided with the flat", landlordDuty: true },
  { id: "pest", label: "Pest or termite infestation in the structure", landlordDuty: true },
  { id: "bulbs", label: "Bulbs, tubelights and switch plates", landlordDuty: false },
  { id: "cleaning", label: "Routine cleaning and drain clearing", landlordDuty: false },
];

export function repairItemsByIds(ids = []) {
  return REPAIR_ITEMS.filter((item) => ids.includes(item.id));
}

/* ------------------------------------------------------------- formatting */

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(value) {
  return INR.format(Number.isFinite(Number(value)) ? Number(value) : 0);
}

export function plural(count, word) {
  const n = Math.abs(Math.round(Number(count) || 0));
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/* ---------------------------------------------------- vacate assessment */

/**
 * Work out whether the notice you are giving is long enough, what a short
 * notice would cost in lieu, and what should come back from the deposit.
 * Pure: every date and amount is an argument.
 */
export function assessVacateNotice({
  noticeDateISO,
  intendedVacateISO,
  noticePeriodDays,
  monthlyRent,
  securityDeposit,
  damageDeductions,
  propertyUseId,
}) {
  if (!parseISODate(noticeDateISO)) return { error: "Enter a valid date for the notice." };
  if (!parseISODate(intendedVacateISO)) return { error: "Enter a valid date on which you intend to vacate." };

  const rent = Number(monthlyRent);
  if (!Number.isFinite(rent) || rent <= 0) return { error: "Monthly rent must be greater than zero." };
  if (rent > MAX_MONTHLY_RENT) return { error: "That monthly rent is outside the range this tool handles." };

  const deposit = Number(securityDeposit);
  if (!Number.isFinite(deposit) || deposit < 0) return { error: "The security deposit cannot be negative." };

  const deductions = Number(damageDeductions);
  if (!Number.isFinite(deductions) || deductions < 0) return { error: "Agreed deductions cannot be negative." };

  const noticeDays = Number(noticePeriodDays);
  if (!Number.isFinite(noticeDays) || noticeDays < 0 || noticeDays > MAX_NOTICE_DAYS) {
    return { error: `The notice period must be between 0 and ${MAX_NOTICE_DAYS} days.` };
  }

  const noticeGivenDays = daysBetweenISO(noticeDateISO, intendedVacateISO);
  if (noticeGivenDays < 0) {
    return { error: "The date you intend to vacate is before the date of this notice." };
  }

  const requiredDays = Math.round(noticeDays);
  const earliestVacateISO = addDaysISO(noticeDateISO, requiredDays);
  const shortfallDays = Math.max(0, requiredDays - noticeGivenDays);

  const dailyRent = rent / PRORATA_DAYS_PER_MONTH;
  const shortfallRent = shortfallDays * dailyRent;
  const expectedRefund = deposit - deductions - shortfallRent;

  const use = propertyUseById(propertyUseId);
  const depositCap = rent * use.depositMonths;
  const depositOverCap = Math.max(0, deposit - depositCap);

  const overstayFirstMonthly = rent * MTA_OVERSTAY_FIRST_MULTIPLIER;
  const overstayLaterMonthly = rent * MTA_OVERSTAY_LATER_MULTIPLIER;

  return {
    noticeGivenDays,
    requiredDays,
    earliestVacateISO,
    shortfallDays,
    noticeIsSufficient: shortfallDays === 0,
    dailyRent,
    shortfallRent,
    deposit,
    deductions,
    expectedRefund,
    refundIsNegative: expectedRefund < 0,
    depositCap,
    depositOverCap,
    depositMonths: use.depositMonths,
    depositMonthsHeld: deposit / rent,
    statutoryFallbackDays: TPA_MONTHLY_NOTICE_DAYS,
    belowStatutoryFallback: requiredDays < TPA_MONTHLY_NOTICE_DAYS,
    overstayFirstMonthly,
    overstayLaterMonthly,
    propertyUse: use,
  };
}

/* ---------------------------------------------------- repair assessment */

/**
 * Work out how long a reported defect has been pending and when the reasonable
 * time you are allowing runs out.
 */
export function assessRepairRequest({ reportedDateISO, letterDateISO, allowedDays, monthlyRent }) {
  if (!parseISODate(letterDateISO)) return { error: "Enter a valid date for the letter." };
  if (!parseISODate(reportedDateISO)) return { error: "Enter a valid date on which you first reported the problem." };

  const rent = Number(monthlyRent);
  if (!Number.isFinite(rent) || rent <= 0) return { error: "Monthly rent must be greater than zero." };
  if (rent > MAX_MONTHLY_RENT) return { error: "That monthly rent is outside the range this tool handles." };

  const allowed = Number(allowedDays);
  if (!Number.isFinite(allowed) || allowed < 1 || allowed > MAX_NOTICE_DAYS) {
    return { error: `The time you allow for the repair must be between 1 and ${MAX_NOTICE_DAYS} days.` };
  }

  const pendingDays = daysBetweenISO(reportedDateISO, letterDateISO);
  if (pendingDays < 0) {
    return { error: "You cannot report a problem on a date after the letter." };
  }

  const deadlineISO = addDaysISO(letterDateISO, Math.round(allowed));
  const reminderCountEstimate = Math.floor(pendingDays / 15);

  let tone = "polite";
  if (pendingDays > 30) tone = "firm";
  if (pendingDays > 60) tone = "final";

  return {
    pendingDays,
    allowedDays: Math.round(allowed),
    deadlineISO,
    tone,
    reminderCountEstimate,
    dailyRent: rent / PRORATA_DAYS_PER_MONTH,
  };
}

/* ------------------------------------------------------------------ letter */

const clean = (value) => (typeof value === "string" ? value.trim() : "");
const or = (value, fallback) => clean(value) || fallback;

export function buildVacateNotice({
  tenantName,
  landlordName,
  landlordAddress,
  premisesAddress,
  agreementDateISO,
  noticeDateISO,
  intendedVacateISO,
  reasonId,
  reasonDetail,
  refundAccountDetails,
  handoverTimeNote,
  phone,
  email,
  assessment,
}) {
  if (!assessment || assessment.error) {
    return { error: assessment?.error || "Fix the dates and amounts before drafting the notice." };
  }

  const tenant = or(tenantName, "[Your full name]");
  const landlord = or(landlordName, "[Landlord's name]");
  const premises = or(premisesAddress, "[Address of the rented premises]");
  const reason = vacateReasonById(reasonId);
  const detail = clean(reasonDetail);
  const reasonText = reason.id === "other" && detail ? detail : reason.line;

  const noticeLine = assessment.noticeIsSufficient
    ? `This notice gives you ${plural(assessment.noticeGivenDays, "day")}, which meets the ${plural(assessment.requiredDays, "day")} notice period agreed between us.`
    : `This notice gives you ${plural(assessment.noticeGivenDays, "day")} against the agreed notice period of ${plural(assessment.requiredDays, "day")}. I acknowledge the shortfall of ${plural(assessment.shortfallDays, "day")} and am willing to pay rent in lieu for that period, worked out at ${formatINR(assessment.dailyRent)} per day, that is ${formatINR(assessment.shortfallRent)}, which may be adjusted against the security deposit.`;

  const depositLine = assessment.refundIsNegative
    ? `Against the security deposit of ${formatINR(assessment.deposit)} I have accounted for agreed deductions of ${formatINR(assessment.deductions)} and rent in lieu of short notice of ${formatINR(assessment.shortfallRent)}. On that basis ${formatINR(Math.abs(assessment.expectedRefund))} would be payable by me to you, which I will settle at handover.`
    : `Against the security deposit of ${formatINR(assessment.deposit)}, after agreed deductions of ${formatINR(assessment.deductions)}${assessment.shortfallRent > 0 ? ` and rent in lieu of short notice of ${formatINR(assessment.shortfallRent)}` : ""}, I request refund of ${formatINR(assessment.expectedRefund)} at the time of handing over vacant possession.`;

  const capLine =
    assessment.depositOverCap > 0
      ? `You may wish to note that the Model Tenancy Act, 2021 caps the security deposit for ${assessment.propertyUse.label.toLowerCase()} premises at ${assessment.depositMonths} months' rent, that is ${formatINR(assessment.depositCap)}; the deposit held is ${formatINR(assessment.deposit)}. That cap binds only where the state has enacted the Act.`
      : "";

  const subject = `Notice to vacate — ${premises} — with effect from ${formatLongDate(intendedVacateISO)}`;

  const body = [
    formatLongDate(noticeDateISO),
    "",
    "To,",
    `${landlord},`,
    clean(landlordAddress),
    "",
    `Subject: ${subject}`,
    "",
    "Dear Sir / Madam,",
    "",
    `I am ${tenant}, the tenant of the premises at ${premises}${parseISODate(agreementDateISO) ? `, under the leave and licence / rent agreement dated ${formatLongDate(agreementDateISO)}` : ""}.`,
    "",
    `This is written notice that I intend to vacate the premises and hand over vacant possession on ${formatLongDate(intendedVacateISO)}, as ${reasonText}.`,
    detail && reason.id !== "other" ? detail : "",
    "",
    noticeLine,
    "",
    depositLine,
    capLine,
    "",
    "I will pay the rent, electricity, water and maintenance charges up to the date of handover and will produce the paid receipts. The premises will be handed over in the same condition in which they were given to me, fair wear and tear excepted, with all keys, and I request a joint inspection on the day of handover so that any deduction can be agreed on the spot rather than afterwards.",
    "",
    clean(refundAccountDetails)
      ? `Please refund the balance deposit by bank transfer to: ${clean(refundAccountDetails)}.`
      : "Please let me know how you would like to refund the balance deposit; a bank transfer on the day of handover is simplest for both of us.",
    "",
    clean(handoverTimeNote) || "I am available for the handover at any time convenient to you on the date above; please confirm a time.",
    "",
    "Kindly acknowledge receipt of this notice in writing, as the notice period runs from the date you receive it.",
    "",
    "Thank you for the tenancy.",
    "",
    "Yours faithfully,",
    "",
    tenant,
    `Tenant, ${premises}`,
    clean(phone) ? `Phone: ${clean(phone)}` : "Phone: [your phone number]",
    clean(email) ? `Email: ${clean(email)}` : "Email: [your email address]",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { subject, body, wordCount: body.split(/\s+/).filter(Boolean).length };
}

export function buildRepairRequest({
  tenantName,
  landlordName,
  landlordAddress,
  premisesAddress,
  agreementDateISO,
  reportedDateISO,
  letterDateISO,
  repairIds = [],
  repairDetail,
  phone,
  email,
  assessment,
}) {
  if (!assessment || assessment.error) {
    return { error: assessment?.error || "Fix the dates and amounts before drafting the letter." };
  }

  const tenant = or(tenantName, "[Your full name]");
  const landlord = or(landlordName, "[Landlord's name]");
  const premises = or(premisesAddress, "[Address of the rented premises]");

  const chosen = repairItemsByIds(repairIds);
  const items = chosen.length > 0 ? chosen : [REPAIR_ITEMS[0]];
  const landlordItems = items.filter((item) => item.landlordDuty);
  const tenantItems = items.filter((item) => !item.landlordDuty);

  const opening = {
    polite: `I first reported this on ${formatLongDate(reportedDateISO)}, ${plural(assessment.pendingDays, "day")} ago, and am putting the request in writing so that we both have a record of it.`,
    firm: `I first reported this on ${formatLongDate(reportedDateISO)}. It has now been pending ${plural(assessment.pendingDays, "day")} despite my follow-ups, and I am putting the request in writing.`,
    final: `I first reported this on ${formatLongDate(reportedDateISO)} — ${plural(assessment.pendingDays, "day")} ago. Despite repeated follow-ups nothing has been done, and this letter is a final written request before I exercise the remedy available to me in law.`,
  }[assessment.tone];

  const statutory = [
    "Under section 108(f) of the Transfer of Property Act, 1882, when the lessee gives notice of a defect in the property that the lessor is bound to repair, the lessor must make the repair within a reasonable time; if the lessor fails to do so, the lessee may make the repair and deduct the cost, with interest, from the rent or otherwise recover it.",
    "Where your state has enacted a tenancy law based on the Model Tenancy Act, 2021, Schedule I to that Act allocates structural and major repairs to the landlord and day-to-day minor repairs to the tenant, and it sets out how a tenant may get the landlord's repairs done and adjust the cost against rent. Please check the position under the law in force in our state.",
  ];

  const subject = `Request for repairs at ${premises} — pending since ${formatLongDate(reportedDateISO)}`;

  const body = [
    formatLongDate(letterDateISO),
    "",
    "To,",
    `${landlord},`,
    clean(landlordAddress),
    "",
    `Subject: ${subject}`,
    "",
    "Dear Sir / Madam,",
    "",
    `I am ${tenant}, the tenant of the premises at ${premises}${parseISODate(agreementDateISO) ? `, under the leave and licence / rent agreement dated ${formatLongDate(agreementDateISO)}` : ""}.`,
    "",
    opening,
    "",
    "Repairs required:",
    ...landlordItems.map((item, index) => `${index + 1}. ${item.label}`),
    clean(repairDetail) ? `\n${clean(repairDetail)}` : "",
    tenantItems.length > 0
      ? `\nI am attending to the following myself, as they are ordinarily the tenant's responsibility: ${tenantItems.map((item) => item.label.toLowerCase()).join("; ")}.`
      : "",
    "",
    ...statutory,
    "",
    `I request you to have the work completed by ${formatLongDate(assessment.deadlineISO)}, which allows ${plural(assessment.allowedDays, "day")} from the date of this letter. I am happy to give access to a plumber, electrician or contractor of your choice on any day, at a time you fix.`,
    "",
    assessment.tone === "final"
      ? "If the work is not taken up by that date, I will arrange the repairs myself, keep the invoices, and adjust the cost against the rent to the extent the law in force permits, after informing you of the amount."
      : "If it is more convenient, I can arrange the work and share the quotation with you for approval before it starts.",
    "",
    "I have taken photographs of the affected areas and can send them on request. Please acknowledge this letter and confirm the date on which the work will begin.",
    "",
    "Thank you.",
    "",
    "Yours faithfully,",
    "",
    tenant,
    `Tenant, ${premises}`,
    clean(phone) ? `Phone: ${clean(phone)}` : "Phone: [your phone number]",
    clean(email) ? `Email: ${clean(email)}` : "Email: [your email address]",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { subject, body, wordCount: body.split(/\s+/).filter(Boolean).length, landlordItems, tenantItems };
}
