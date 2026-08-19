/**
 * Creator collaboration brief: deliverables, usage rights, dated timeline and
 * the fee breakdown an Indian creator has to invoice.
 *
 * Statutory figures used here:
 *  - GST on advertising / brand promotion services is 18% (SAC 998365).
 *  - Under CBDT Circular 23/2017, TDS is deducted on the value EXCLUDING GST
 *    when GST is shown separately on the invoice.
 *  - TDS section rates: 194J professional services 10%; 194C contract work 1%
 *    where the payee is an individual or HUF and 2% otherwise; 194R benefits
 *    or perquisites (gifted product, barter) 10%.
 *
 * Uplift percentages are negotiating defaults you set, not statutory rates.
 */

/** GST on advertising and brand promotion services, SAC 998365. */
export const GST_RATE = 0.18;

export const TDS_SECTIONS = [
  {
    id: "194J",
    label: "194J — professional services",
    rate: 0.1,
    note: "Standard for content creation and endorsement fees paid to a professional.",
  },
  {
    id: "194C-individual",
    label: "194C — contract, individual/HUF payee",
    rate: 0.01,
    note: "Used when the engagement is treated as contract work rather than professional services.",
  },
  {
    id: "194C-other",
    label: "194C — contract, company/firm payee",
    rate: 0.02,
    note: "Same section as above, higher rate because the payee is not an individual or HUF.",
  },
  {
    id: "194R",
    label: "194R — benefit or perquisite (barter/gifted)",
    rate: 0.1,
    note: "Applies to the value of free product or trips given in place of cash.",
  },
  {
    id: "none",
    label: "No TDS deducted",
    rate: 0,
    note: "Only when the payer is not required to deduct, for example below the annual threshold.",
  },
];

export function getTdsSection(sectionId) {
  return TDS_SECTIONS.find((section) => section.id === sectionId) || TDS_SECTIONS[0];
}

/**
 * Default negotiating position for paid-media usage: this share of the base fee
 * for each month the brand can run the content as an ad. Editable in the form.
 */
export const DEFAULT_USAGE_UPLIFT_PER_MONTH = 10;

/** Default uplift for granting category exclusivity across the term. */
export const DEFAULT_EXCLUSIVITY_UPLIFT = 25;

/** Default uplift when the brand wants delivery inside the standard lead time. */
export const DEFAULT_RUSH_UPLIFT = 20;

/** Standard lead time from signed brief to going live. */
export const STANDARD_LEAD_DAYS = 14;
export const MIN_LEAD_DAYS = 2;
export const MAX_LEAD_DAYS = 120;

export const MAX_UPLIFT_PERCENT = 300;
export const MAX_USAGE_MONTHS = 36;

export const TERRITORIES = [
  { id: "india", label: "India only" },
  { id: "sa", label: "India + South Asia" },
  { id: "global", label: "Worldwide" },
];

/**
 * Milestones as a share of the lead time before the live date.
 * Planning defaults so a brief always carries real dates.
 */
export const MILESTONE_SHARES = [
  { id: "signed", label: "Brief signed and payment terms agreed", share: 1 },
  { id: "concept", label: "Concept / script due from creator", share: 0.7 },
  { id: "draft", label: "First cut shared with brand", share: 0.4 },
  { id: "approval", label: "Final approval and disclosure check", share: 0.15 },
  { id: "live", label: "Go live", share: 0 },
];

/** Add whole days to an ISO date. Pure — nothing reads the clock. */
export function addDays(isoDate, days) {
  const match = String(isoDate ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const base = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const shifted = new Date(base + Math.trunc(days) * 86400000);
  if (Number.isNaN(shifted.getTime())) return null;
  const pad = (value) => String(value).padStart(2, "0");
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
}

/**
 * Read deliverable lines: "2 x Instagram Reel | 25000".
 * The quantity prefix and the rate are both optional.
 */
export function parseDeliverables(raw) {
  const lines = String(raw ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const items = [];
  const issues = [];

  lines.forEach((line, index) => {
    const [namePart, ratePart] = line.split("|");
    const nameRaw = String(namePart ?? "").trim();
    if (!nameRaw) {
      issues.push(`Line ${index + 1} has no deliverable name.`);
      return;
    }

    const qtyMatch = nameRaw.match(/^(\d+)\s*[x×]\s*(.+)$/i);
    const quantity = qtyMatch ? Number(qtyMatch[1]) : 1;
    const name = (qtyMatch ? qtyMatch[2] : nameRaw).trim();

    if (!name) {
      issues.push(`Line ${index + 1} has a quantity but no deliverable name.`);
      return;
    }
    if (!(quantity > 0)) {
      issues.push(`Line ${index + 1}: quantity must be at least 1.`);
      return;
    }

    const rateText = String(ratePart ?? "").replace(/[^\d.]/g, "");
    const rate = rateText ? Number(rateText) : 0;
    if (!Number.isFinite(rate) || rate < 0) {
      issues.push(`Line ${index + 1}: "${ratePart.trim()}" is not a usable rate.`);
      return;
    }

    items.push({ name, quantity, rate, lineTotal: quantity * rate });
  });

  return { items, issues };
}

/** Suggested usage uplift percent for a term, at your per-month policy rate. */
export function suggestedUsageUplift(months, perMonthPercent) {
  const m = Number(months);
  const rate = Number(perMonthPercent);
  if (!Number.isFinite(m) || !Number.isFinite(rate) || m <= 0 || rate <= 0) return 0;
  return Math.min(MAX_UPLIFT_PERCENT, m * rate);
}

/**
 * Build the brief.
 * @param {object} input
 */
export function buildCollabBrief(input = {}) {
  const {
    brandName = "",
    campaignName = "",
    creatorName = "",
    objective = "",
    deliverablesRaw = "",
    liveDate,
    leadDays = STANDARD_LEAD_DAYS,
    usageMonths = 0,
    usageUpliftPercent = 0,
    exclusivityPercent = 0,
    rushPercent = 0,
    territoryId = TERRITORIES[0].id,
    paidMedia = false,
    exclusivity = false,
    gstRegistered = true,
    tdsSectionId = TDS_SECTIONS[0].id,
    advancePercent = 50,
    netDays = 30,
  } = input;

  const lead = Number(leadDays);
  const months = Number(usageMonths);
  const usagePct = Number(usageUpliftPercent);
  const exclPct = Number(exclusivityPercent);
  const rushPct = Number(rushPercent);
  const advance = Number(advancePercent);
  const net = Number(netDays);

  if ([lead, months, usagePct, exclPct, rushPct, advance, net].some((v) => !Number.isFinite(v))) {
    return { error: "Enter valid numbers for the lead time, uplifts and payment terms." };
  }
  if (!Number.isInteger(lead) || lead < MIN_LEAD_DAYS || lead > MAX_LEAD_DAYS) {
    return { error: `Lead time must be a whole number of days between ${MIN_LEAD_DAYS} and ${MAX_LEAD_DAYS}.` };
  }
  if (months < 0 || months > MAX_USAGE_MONTHS) {
    return { error: `Usage term must be between 0 and ${MAX_USAGE_MONTHS} months.` };
  }
  if ([usagePct, exclPct, rushPct].some((v) => v < 0 || v > MAX_UPLIFT_PERCENT)) {
    return { error: `Each uplift must be between 0% and ${MAX_UPLIFT_PERCENT}%.` };
  }
  if (advance < 0 || advance > 100) {
    return { error: "Advance must be between 0% and 100% of the fee." };
  }
  if (!Number.isInteger(net) || net < 0 || net > 180) {
    return { error: "Payment terms must be a whole number of days between 0 and 180." };
  }

  const live = addDays(liveDate, 0);
  if (!live) {
    return { error: "Go-live date must be a real date in YYYY-MM-DD form." };
  }

  const { items, issues } = parseDeliverables(deliverablesRaw);
  if (items.length === 0) {
    return {
      error: "Add at least one deliverable, for example \"2 x Instagram Reel | 25000\".",
    };
  }

  const baseFee = items.reduce((sum, item) => sum + item.lineTotal, 0);
  if (baseFee <= 0) {
    return { error: "Add a rate to at least one deliverable so the fee can be calculated." };
  }

  const usageFee = months > 0 ? (baseFee * usagePct) / 100 : 0;
  const exclusivityFee = (baseFee * exclPct) / 100;
  const rushFee = (baseFee * rushPct) / 100;
  const subtotal = baseFee + usageFee + exclusivityFee + rushFee;

  const gst = gstRegistered ? subtotal * GST_RATE : 0;
  const invoiceTotal = subtotal + gst;

  const tdsSection = getTdsSection(tdsSectionId);
  // CBDT Circular 23/2017: TDS is computed on the value excluding GST when GST
  // is shown separately on the invoice.
  const tds = subtotal * tdsSection.rate;
  const netReceivable = invoiceTotal - tds;

  const advanceAmount = (invoiceTotal * advance) / 100;
  const balanceAmount = invoiceTotal - advanceAmount;

  const timeline = MILESTONE_SHARES.map((milestone) => ({
    id: milestone.id,
    label: milestone.label,
    date: addDays(live, -Math.round(lead * milestone.share)),
    daysBefore: Math.round(lead * milestone.share),
  }));

  const paymentDueDate = addDays(live, net);

  const territory = TERRITORIES.find((item) => item.id === territoryId) || TERRITORIES[0];

  const rights = [
    `Organic use on the creator's own channels: perpetual, with the creator retaining the original files.`,
    months > 0
      ? `Brand may repost and, where agreed, run the content as paid media for ${months} month${months === 1 ? "" : "s"} from the go-live date, in ${territory.label}.`
      : `No paid-media or brand-channel usage is included. Any reuse is a separate agreement.`,
    paidMedia && months > 0
      ? "Paid amplification (whitelisting / partnership ads) is included for the term above."
      : months === 0
        ? "Paid amplification is NOT included — no usage term has been granted, so there is no term for the brand to run this as an ad."
        : "Paid amplification is NOT included; the brand may not run this as an ad without a new agreement.",
    exclusivity
      ? `Category exclusivity applies for the usage term: no competing brand in the same category during that period.`
      : "No category exclusivity — the creator may work with other brands, including competitors.",
    "Neither party may edit, re-cut or re-caption the content in a way that changes its meaning without written approval.",
  ];

  const obligations = [
    "The creator discloses the partnership clearly and up front, in line with the ASCI influencer guidelines and the platform's own paid-partnership label.",
    "One round of consolidated brand feedback is included; further rounds are chargeable.",
    "Metrics (reach, views, saves, link clicks) are shared as screenshots within seven days of going live.",
    "The content stays live for the full usage term unless the brand asks for removal in writing.",
  ];

  const warnings = [...issues];
  if (advance === 0) {
    warnings.push("No advance. For a first-time brand, a 50% advance is normal protection.");
  }
  if (net > 45) {
    warnings.push(`${net}-day payment terms are long. 30 days from go-live is the usual ask.`);
  }
  if (months > 0 && usagePct === 0) {
    warnings.push(
      `You are granting ${months} month(s) of usage with no uplift on the fee. Usage is the thing brands most often get for free.`,
    );
  }
  if (months === 0 && usagePct > 0) {
    warnings.push(
      `A ${usagePct}% usage uplift is set but the usage term is 0 months, so it is not being charged. Set a usage term if paid-media or brand-channel usage is actually being granted.`,
    );
  }
  if (exclusivity && exclPct === 0) {
    warnings.push("Category exclusivity has been granted with no uplift — that blocks other income.");
  }
  if (lead < STANDARD_LEAD_DAYS && rushPct === 0) {
    warnings.push(
      `A ${lead}-day turnaround is shorter than the ${STANDARD_LEAD_DAYS}-day standard here, with no rush uplift applied.`,
    );
  }

  return {
    brandName: String(brandName).trim(),
    campaignName: String(campaignName).trim(),
    creatorName: String(creatorName).trim(),
    objective: String(objective).trim(),
    items,
    baseFee,
    usageFee,
    exclusivityFee,
    rushFee,
    subtotal,
    gst,
    gstRate: GST_RATE,
    gstRegistered: Boolean(gstRegistered),
    invoiceTotal,
    tdsSection,
    tds,
    netReceivable,
    advancePercent: advance,
    advanceAmount,
    balanceAmount,
    netDays: net,
    paymentDueDate,
    timeline,
    liveDate: live,
    leadDays: lead,
    usageMonths: months,
    territory,
    rights,
    obligations,
    warnings,
  };
}
