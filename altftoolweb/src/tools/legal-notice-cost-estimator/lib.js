/**
 * Legal notice cost estimator.
 *
 * A legal notice (demand notice / cease-and-desist / statutory notice such as the
 * one under s.138 of the Negotiable Instruments Act, 1881) has no single "price".
 * The cost is the sum of five buckets, and this module models each one explicitly:
 *
 *   1. Professional fee   – advocate / law-firm drafting charge, plus GST if the
 *                           firm raises a forward-charge invoice.
 *   2. Stationery         – non-judicial stamp paper and notarisation.
 *   3. Reproduction       – printing the notice for every addressee plus the
 *                           record copy retained by the sender.
 *   4. Dispatch           – one posting charge per addressee, per the mode chosen.
 *   5. Follow-up          – reminder notices re-dispatched to every addressee.
 *
 * Every rate is an input with an editable default, because postal tariffs, stamp
 * duty on paper and advocate fees are state- and vendor-specific. The one fixed
 * statutory number here is the GST rate.
 */

/**
 * Standard GST rate applied to legal / professional services in India
 * (CGST 9% + SGST 9%, or IGST 18% for inter-state supply).
 * Note: services supplied by an individual advocate or a firm of advocates to a
 * business entity fall under reverse charge (Notification 13/2017-CT(R)), in
 * which case the advocate does not add GST to the bill — hence the toggle.
 */
export const GST_RATE_PERCENT = 18;

/**
 * Dispatch modes. Default costs are typical all-in per-addressee charges in India
 * and are editable in the UI — India Post and courier tariffs change by weight,
 * distance and operator.
 */
export const DISPATCH_MODES = [
  {
    id: "registered-ad",
    label: "Registered Post with A/D",
    defaultCost: 60,
    note: "Preferred for legal notices — the acknowledgement-due card is proof of service.",
  },
  {
    id: "speed-post",
    label: "Speed Post (India Post)",
    defaultCost: 45,
    note: "Trackable; the India Post delivery record is commonly accepted as proof.",
  },
  {
    id: "courier",
    label: "Private courier",
    defaultCost: 150,
    note: "Fast, but courier proof of delivery carries less evidentiary weight than A/D.",
  },
  {
    id: "email",
    label: "Email / WhatsApp only",
    defaultCost: 0,
    note: "No postage cost, but many statutory notices still require physical service.",
  },
];

/** Typical per-page printing + photocopy rate in INR. */
export const DEFAULT_PRINT_RATE_PER_PAGE = 3;

/** Record copy the sender keeps on file, over and above the addressee copies. */
export const RECORD_COPIES = 1;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @param {object} input
 * @param {number} input.draftingFee         Advocate / firm drafting charge (INR).
 * @param {boolean} input.addGst             Add 18% GST on the professional fee.
 * @param {number} input.recipients          Number of addressees the notice goes to.
 * @param {number} input.pages               Pages in the notice.
 * @param {number} input.copiesPerRecipient  Copies posted to each addressee.
 * @param {number} input.printRatePerPage    Printing cost per page (INR).
 * @param {number} input.dispatchCostPerRecipient Postage per addressee (INR).
 * @param {number} input.stampPaperCost      Non-judicial stamp paper (INR).
 * @param {number} input.notarisationFee     Notary / attestation charge (INR).
 * @param {number} input.followUpCount       Reminder notices planned after the first.
 * @param {number} input.followUpDispatchCost Postage per addressee per reminder (INR).
 * @param {number} input.miscCost            Travel, courier pickup, misc (INR).
 * @returns {object} breakdown, or { error } when the input cannot produce a number.
 */
export function estimateNoticeCost({
  draftingFee = 0,
  addGst = false,
  recipients = 1,
  pages = 1,
  copiesPerRecipient = 1,
  printRatePerPage = DEFAULT_PRINT_RATE_PER_PAGE,
  dispatchCostPerRecipient = 0,
  stampPaperCost = 0,
  notarisationFee = 0,
  followUpCount = 0,
  followUpDispatchCost = 0,
  miscCost = 0,
} = {}) {
  const numeric = {
    draftingFee,
    recipients,
    pages,
    copiesPerRecipient,
    printRatePerPage,
    dispatchCostPerRecipient,
    stampPaperCost,
    notarisationFee,
    followUpCount,
    followUpDispatchCost,
    miscCost,
  };

  for (const key of Object.keys(numeric)) {
    if (!isNum(numeric[key])) {
      return { error: "Enter a valid number in every field." };
    }
    if (numeric[key] < 0) {
      return { error: "Costs and counts cannot be negative." };
    }
  }

  if (recipients < 1) return { error: "There must be at least one addressee." };
  if (recipients > 500) return { error: "Enter 500 addressees or fewer." };
  if (pages < 1) return { error: "A notice has at least one page." };
  if (pages > 500) return { error: "Enter 500 pages or fewer." };
  if (copiesPerRecipient < 1) return { error: "Post at least one copy to each addressee." };
  if (followUpCount > 20) return { error: "Enter 20 reminder notices or fewer." };

  const wholeRecipients = Math.floor(recipients);
  const wholePages = Math.floor(pages);
  const wholeCopies = Math.floor(copiesPerRecipient);
  const wholeFollowUps = Math.floor(followUpCount);

  const gstAmount = addGst ? (draftingFee * GST_RATE_PERCENT) / 100 : 0;
  const professionalTotal = draftingFee + gstAmount;

  const totalCopies = wholeRecipients * wholeCopies + RECORD_COPIES;
  const totalPages = totalCopies * wholePages;
  const printingTotal = totalPages * printRatePerPage;

  const stationeryTotal = stampPaperCost + notarisationFee;
  const dispatchTotal = wholeRecipients * dispatchCostPerRecipient;
  const followUpTotal = wholeFollowUps * wholeRecipients * followUpDispatchCost;

  const total =
    professionalTotal +
    printingTotal +
    stationeryTotal +
    dispatchTotal +
    followUpTotal +
    miscCost;

  const lines = [
    { label: "Drafting / professional fee", amount: round2(draftingFee) },
    { label: `GST on professional fee (${GST_RATE_PERCENT}%)`, amount: round2(gstAmount) },
    { label: "Stamp paper", amount: round2(stampPaperCost) },
    { label: "Notarisation / attestation", amount: round2(notarisationFee) },
    { label: `Printing (${totalCopies} copies x ${wholePages} pages)`, amount: round2(printingTotal) },
    { label: `Dispatch (${wholeRecipients} addressee${wholeRecipients === 1 ? "" : "s"})`, amount: round2(dispatchTotal) },
    { label: `Follow-up reminders (${wholeFollowUps})`, amount: round2(followUpTotal) },
    { label: "Travel / miscellaneous", amount: round2(miscCost) },
  ].filter((line) => line.amount > 0);

  return {
    total: round2(total),
    professionalTotal: round2(professionalTotal),
    gstAmount: round2(gstAmount),
    stationeryTotal: round2(stationeryTotal),
    printingTotal: round2(printingTotal),
    dispatchTotal: round2(dispatchTotal),
    followUpTotal: round2(followUpTotal),
    miscCost: round2(miscCost),
    totalCopies,
    totalPages,
    perRecipient: round2(total / wholeRecipients),
    professionalShare: total > 0 ? round2((professionalTotal / total) * 100) : 0,
    recipients: wholeRecipients,
    lines,
  };
}

/**
 * Cost of the same notice sent by each dispatch mode, so the user can see what
 * switching from courier to registered post does to the bill.
 * @returns {Array<{id:string,label:string,cost:number,total:number}>|{error:string}}
 */
export function compareDispatchModes(input = {}) {
  const rows = [];
  for (const mode of DISPATCH_MODES) {
    const result = estimateNoticeCost({
      ...input,
      dispatchCostPerRecipient: mode.defaultCost,
      followUpDispatchCost: mode.defaultCost,
    });
    if (result.error) return result;
    rows.push({
      id: mode.id,
      label: mode.label,
      cost: mode.defaultCost,
      total: result.total,
      note: mode.note,
    });
  }
  return rows;
}
