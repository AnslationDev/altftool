/**
 * Possession certificate / handover request helpers for Indian real estate.
 *
 * Pure module: no React, no DOM, no Date.now(). Every date is supplied by the
 * caller as an ISO "YYYY-MM-DD" string.
 *
 * Statutory anchors — Real Estate (Regulation and Development) Act, 2016:
 *  - s.11(4)(b): the promoter must obtain the completion certificate or the
 *    occupancy certificate, or both, from the competent authority.
 *  - s.17(1): the promoter must execute a registered conveyance deed and hand
 *    over physical possession within three months of receiving the occupancy
 *    certificate (or the period fixed by the state's local law).
 *  - s.17(2): the promoter must hand over the necessary documents and plans,
 *    including common areas, to the association of allottees within thirty days
 *    of obtaining the completion certificate.
 *  - s.14(3): any structural defect or defect in workmanship notified within
 *    five years of possession must be rectified within thirty days.
 *  - s.18(1): where possession is not given by the date in the agreement, the
 *    allottee may withdraw with a refund plus interest, or stay and be paid
 *    interest for every month of delay until handover.
 *  - Real Estate (General) Rules, 2016, r.15: the prescribed rate of interest
 *    is the State Bank of India highest Marginal Cost of Lending Rate + 2%.
 */

/** RERA s.17(1) — possession within three months of the occupancy certificate. */
export const POSSESSION_WINDOW_MONTHS_AFTER_OC = 3;

/** RERA s.17(2) — documents to the allottees' association within thirty days. */
export const DOCUMENT_HANDOVER_DAYS_AFTER_CC = 30;

/** RERA s.14(3) — five-year defect liability from the date of possession. */
export const DEFECT_LIABILITY_YEARS = 5;

/** RERA s.14(3) — the promoter must rectify a notified defect in thirty days. */
export const DEFECT_RECTIFICATION_DAYS = 30;

/** General Rules 2016, r.15 — SBI highest MCLR plus this spread. */
export const RERA_INTEREST_SPREAD_OVER_MCLR = 2;

/** A reasonable reply window to put in the letter before escalating. */
export const DEFAULT_REPLY_DAYS = 15;

export const MS_PER_DAY = 86400000;

/** Documents a promoter should hand over with possession. */
export const HANDOVER_DOCUMENTS = [
  { id: "oc", label: "Occupancy Certificate (OC) from the competent authority", statutory: true },
  { id: "cc", label: "Completion Certificate (CC) for the building/tower", statutory: true },
  { id: "possession-letter", label: "Possession letter / possession-cum-handover certificate", statutory: true },
  { id: "conveyance", label: "Registered sale deed or conveyance deed for the apartment", statutory: true },
  { id: "sanctioned-plan", label: "Sanctioned building plan and approved floor plan of the unit", statutory: true },
  { id: "structural", label: "Structural stability certificate from the project structural engineer", statutory: false },
  { id: "fire-noc", label: "Fire safety NOC from the state fire services department", statutory: false },
  { id: "lift-licence", label: "Lift licence / lift inspector certificate", statutory: false },
  { id: "pollution-noc", label: "Pollution control board consent to operate for STP and DG sets", statutory: false },
  { id: "water-electricity", label: "Permanent water and electricity connection papers and meter details", statutory: false },
  { id: "khata", label: "Khata / property card / mutation entry in the buyer's name", statutory: false },
  { id: "tax-receipts", label: "Latest property tax paid receipts for the unit", statutory: false },
  { id: "parking", label: "Car parking allotment letter with the bay number", statutory: false },
  { id: "no-dues", label: "No-dues certificate confirming full payment of consideration", statutory: false },
  { id: "warranties", label: "Warranty cards and AMC papers for lifts, DG sets, pumps and fire equipment", statutory: false },
  { id: "maintenance", label: "Maintenance account statement and corpus fund handover statement", statutory: false },
  { id: "society", label: "Share certificate / association membership papers where formed", statutory: false },
  { id: "as-built", label: "As-built drawings for plumbing, electrical and firefighting layouts", statutory: false },
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseIsoDate(iso) {
  if (typeof iso !== "string" || !ISO_DATE.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const ms = Date.UTC(y, m - 1, d);
  const date = new Date(ms);
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return null;
  }
  return { y, m, d, ms };
}

export function addDays(iso, days) {
  const parsed = parseIsoDate(iso);
  if (!parsed || !Number.isFinite(days)) return null;
  const next = new Date(parsed.ms + Math.trunc(days) * MS_PER_DAY);
  return next.toISOString().slice(0, 10);
}

export function addMonths(iso, months) {
  const parsed = parseIsoDate(iso);
  if (!parsed || !Number.isFinite(months)) return null;
  const total = parsed.y * 12 + (parsed.m - 1) + Math.trunc(months);
  const year = Math.floor(total / 12);
  const month = total - year * 12;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = Math.min(parsed.d, lastDay);
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Whole days from `fromIso` to `toIso`. Negative when `toIso` is earlier. */
export function diffDays(fromIso, toIso) {
  const a = parseIsoDate(fromIso);
  const b = parseIsoDate(toIso);
  if (!a || !b) return null;
  return Math.round((b.ms - a.ms) / MS_PER_DAY);
}

export function formatLongDate(iso) {
  const parsed = parseIsoDate(iso);
  if (!parsed) return "";
  return `${parsed.d} ${MONTH_NAMES[parsed.m - 1]} ${parsed.y}`;
}

/**
 * Delay interest an allottee may claim under RERA s.18(1) read with r.15:
 * simple interest at (SBI highest MCLR + 2%) per annum on the amount already
 * paid, for the number of days possession is late.
 */
export function computeDelayInterest({ amountPaid, mclrPercent, delayDays }) {
  const paid = Number(amountPaid);
  const mclr = Number(mclrPercent);
  const days = Math.trunc(Number(delayDays));
  if (!Number.isFinite(paid) || paid < 0) return { error: "Enter a valid amount paid to the builder." };
  if (!Number.isFinite(mclr) || mclr < 0 || mclr > 30) {
    return { error: "Enter the SBI MCLR as a percentage between 0 and 30." };
  }
  if (!Number.isFinite(days) || days <= 0) {
    return { rate: mclr + RERA_INTEREST_SPREAD_OVER_MCLR, delayDays: 0, interest: 0, perMonth: 0 };
  }
  const rate = mclr + RERA_INTEREST_SPREAD_OVER_MCLR;
  const interest = (paid * rate * days) / (100 * 365);
  const perMonth = (paid * rate) / (100 * 12);
  return {
    rate,
    delayDays: days,
    interest: Math.round(interest),
    perMonth: Math.round(perMonth),
  };
}

/**
 * Work out every statutory date that matters for a handover request.
 * @returns {object} timeline, or { error }
 */
export function computePossessionTimeline({
  agreementPossessionDate,
  ocDate,
  ccDate,
  referenceDate,
  replyDays = DEFAULT_REPLY_DAYS,
}) {
  const today = parseIsoDate(referenceDate);
  if (!today) return { error: "Enter a valid letter date (YYYY-MM-DD)." };
  const reply = Math.trunc(Number(replyDays));
  if (!Number.isFinite(reply) || reply < 1 || reply > 90) {
    return { error: "Reply window must be between 1 and 90 days." };
  }

  const agreed = agreementPossessionDate ? parseIsoDate(agreementPossessionDate) : null;
  if (agreementPossessionDate && !agreed) {
    return { error: "Enter a valid agreed possession date (YYYY-MM-DD)." };
  }
  const oc = ocDate ? parseIsoDate(ocDate) : null;
  if (ocDate && !oc) return { error: "Enter a valid occupancy certificate date (YYYY-MM-DD)." };
  const cc = ccDate ? parseIsoDate(ccDate) : null;
  if (ccDate && !cc) return { error: "Enter a valid completion certificate date (YYYY-MM-DD)." };

  const delayDays = agreed ? Math.max(0, diffDays(agreementPossessionDate, referenceDate)) : 0;
  const delayMonths = Math.floor(delayDays / 30);
  const possessionDueByOc = oc ? addMonths(ocDate, POSSESSION_WINDOW_MONTHS_AFTER_OC) : null;
  const documentsDueByCc = cc ? addDays(ccDate, DOCUMENT_HANDOVER_DAYS_AFTER_CC) : null;
  const replyBy = addDays(referenceDate, reply);

  return {
    delayDays,
    delayMonths,
    isDelayed: delayDays > 0,
    possessionDueByOc,
    possessionOverdueByOc:
      possessionDueByOc !== null && diffDays(possessionDueByOc, referenceDate) > 0,
    documentsDueByCc,
    documentsOverdueByCc:
      documentsDueByCc !== null && diffDays(documentsDueByCc, referenceDate) > 0,
    replyBy,
    replyDays: reply,
    defectLiabilityNote: `${DEFECT_LIABILITY_YEARS} years from the date possession is actually handed over`,
  };
}

const bullet = (text) => `  - ${text}`;

/**
 * Compose the possession / handover request letter.
 * @returns {{ text: string } | { error: string }}
 */
export function buildPossessionRequestLetter({
  buyerName,
  buyerAddress,
  buyerPhone,
  buyerEmail,
  builderName,
  builderAddress,
  projectName,
  unitNumber,
  reraNumber,
  bookingDate,
  agreementPossessionDate,
  ocDate,
  ccDate,
  referenceDate,
  replyDays = DEFAULT_REPLY_DAYS,
  documents,
  timeline,
  interest,
  amountPaid,
  currencyFormatter,
}) {
  const buyer = String(buyerName || "").trim();
  if (!buyer) return { error: "Enter the buyer's name." };
  const builder = String(builderName || "").trim();
  if (!builder) return { error: "Enter the builder or promoter's name." };
  const project = String(projectName || "").trim();
  if (!project) return { error: "Enter the project name." };
  const unit = String(unitNumber || "").trim();
  if (!unit) return { error: "Enter the apartment or unit number." };
  if (!timeline || timeline.error) {
    return { error: timeline && timeline.error ? timeline.error : "Fix the dates first." };
  }
  const wanted = Array.isArray(documents) ? documents.filter(Boolean) : [];
  if (wanted.length === 0) return { error: "Select at least one document to ask for." };

  const fmt =
    typeof currencyFormatter === "function"
      ? currencyFormatter
      : (value) => `INR ${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;

  const lines = [];
  lines.push(buyer);
  if (buyerAddress) lines.push(String(buyerAddress).trim());
  if (buyerPhone) lines.push(`Phone: ${String(buyerPhone).trim()}`);
  if (buyerEmail) lines.push(`Email: ${String(buyerEmail).trim()}`);
  lines.push("");
  lines.push(`Date: ${formatLongDate(referenceDate)}`);
  lines.push("");
  lines.push("To,");
  lines.push(`The Authorised Signatory`);
  lines.push(builder);
  if (builderAddress) lines.push(String(builderAddress).trim());
  lines.push("");
  lines.push(
    `Subject: Request for handover of possession, possession certificate and project documents for Unit ${unit}, ${project}${
      reraNumber ? ` (RERA Registration No. ${String(reraNumber).trim()})` : ""
    }`,
  );
  lines.push("");
  lines.push("Dear Sir/Madam,");
  lines.push("");

  const openParts = [
    `I am the allottee of Unit ${unit} in your project ${project}`,
  ];
  if (bookingDate && parseIsoDate(bookingDate)) {
    openParts.push(`booked on ${formatLongDate(bookingDate)}`);
  }
  lines.push(`1. ${openParts.join(", ")}. I have paid the consideration due under the agreement to date${
    Number(amountPaid) > 0 ? `, amounting to ${fmt(amountPaid)}` : ""
  }.`);
  lines.push("");

  if (agreementPossessionDate && parseIsoDate(agreementPossessionDate)) {
    if (timeline.isDelayed) {
      lines.push(
        `2. The agreement for sale records ${formatLongDate(
          agreementPossessionDate,
        )} as the date for handing over possession. Possession has still not been handed over, a delay of ${
          timeline.delayDays
        } days (about ${timeline.delayMonths} month${timeline.delayMonths === 1 ? "" : "s"}) as on the date of this letter.`,
      );
    } else {
      lines.push(
        `2. The agreement for sale records ${formatLongDate(
          agreementPossessionDate,
        )} as the date for handing over possession, and I am writing in advance so that the handover formalities can be completed on time.`,
      );
    }
    lines.push("");
  }

  let clauseNo = agreementPossessionDate && parseIsoDate(agreementPossessionDate) ? 3 : 2;

  if (ocDate && parseIsoDate(ocDate)) {
    lines.push(
      `${clauseNo}. The occupancy certificate for the building is dated ${formatLongDate(
        ocDate,
      )}. Under section 17(1) of the Real Estate (Regulation and Development) Act, 2016, the promoter is required to execute a registered conveyance deed and hand over physical possession within three months of the occupancy certificate, that is by ${formatLongDate(
        timeline.possessionDueByOc,
      )}.`,
    );
    lines.push("");
    clauseNo += 1;
  }

  if (ccDate && parseIsoDate(ccDate)) {
    lines.push(
      `${clauseNo}. The completion certificate is dated ${formatLongDate(
        ccDate,
      )}. Section 17(2) of the Act requires the promoter to hand over the necessary documents and plans, including those for the common areas, within thirty days of the completion certificate, that is by ${formatLongDate(
        timeline.documentsDueByCc,
      )}.`,
    );
    lines.push("");
    clauseNo += 1;
  }

  lines.push(`${clauseNo}. I therefore request you to hand over the following on or before ${formatLongDate(
    timeline.replyBy,
  )}:`);
  lines.push(...wanted.map((doc) => bullet(doc)));
  lines.push("");
  clauseNo += 1;

  lines.push(
    `${clauseNo}. Please also confirm a date and time for the joint physical inspection of the unit, so that any snags can be listed and signed by both sides before I take possession. Under section 14(3) of the Act, any structural defect or defect in workmanship notified within five years of possession must be rectified by the promoter within thirty days, at no cost to me.`,
  );
  lines.push("");
  clauseNo += 1;

  if (interest && !interest.error && interest.interest > 0) {
    lines.push(
      `${clauseNo}. Without prejudice to my right to possession, section 18(1) of the Act entitles me to interest for every month of delay until possession is handed over. At the prescribed rate of ${interest.rate}% per annum (State Bank of India highest Marginal Cost of Lending Rate plus 2%, as prescribed by rule 15 of the Real Estate (General) Rules, 2016) on ${fmt(
        amountPaid,
      )} already paid, the interest for ${interest.delayDays} days of delay works out to approximately ${fmt(
        interest.interest,
      )}, and continues to accrue at about ${fmt(interest.perMonth)} per month. I reserve my right to claim this amount.`,
    );
    lines.push("");
    clauseNo += 1;
  }

  lines.push(
    `${clauseNo}. Kindly treat this as a formal request. If I do not receive a written response within ${timeline.replyDays} days of the date of this letter, I will be constrained to file a complaint before the Real Estate Regulatory Authority having jurisdiction over the project, and to pursue such other remedies as are available to me in law.`,
  );
  lines.push("");
  lines.push("A copy of my allotment letter, agreement for sale and payment receipts is enclosed for reference.");
  lines.push("");
  lines.push("Yours faithfully,");
  lines.push("");
  lines.push("");
  lines.push(buyer);
  lines.push(`Allottee, Unit ${unit}, ${project}`);
  lines.push("");
  lines.push("Enclosures: allotment letter, agreement for sale, payment receipts, previous correspondence.");
  lines.push("");
  lines.push(
    "This letter is an informational template and not legal advice. Have an advocate review it before you send it if the matter is contested.",
  );

  return { text: lines.join("\n") };
}
