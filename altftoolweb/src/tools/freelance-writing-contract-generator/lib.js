/**
 * Freelance Writing Contract Generator.
 *
 * Two things decide whether a content writing engagement goes wrong: the money
 * schedule and who ends up owning the copy. This module prices the engagement
 * from a per-word, per-piece or hourly rate, works out the deposit, kill fee,
 * revision overage, payment due date and statutory late-payment charge, and
 * assembles a contract whose clauses are tied to identifiable rules.
 *
 * Rules the maths and clauses rest on:
 *  - Work made for hire, 17 U.S.C. section 101: a commissioned work is a work
 *    made for hire only if it falls into one of nine listed categories (a
 *    contribution to a collective work, part of an audiovisual work, a
 *    translation, a supplementary work, a compilation, an instructional text,
 *    a test, answer material for a test, or an atlas) AND the parties sign a
 *    written instrument saying so. A standalone article or landing page often
 *    sits outside those categories, so the reliable route to ownership is an
 *    express assignment that takes effect on payment.
 *  - Attribution: the United States gives no general statutory right of
 *    attribution for text — 17 U.S.C. section 106A covers works of visual art
 *    only. In the UK the right to be identified as author under section 77 of
 *    the Copyright, Designs and Patents Act 1988 must be asserted in writing.
 *    In India the author's special rights under section 57 of the Copyright
 *    Act 1957 survive assignment. Byline and ghostwriting terms therefore have
 *    to be written down.
 *  - Late Payment of Commercial Debts (Interest) Act 1998 (UK): statutory
 *    interest runs at the Bank of England base rate plus 8% per year, and
 *    section 5A adds fixed compensation of GBP 40 for a debt under GBP 1,000,
 *    GBP 70 for a debt of GBP 1,000 up to GBP 9,999.99, and GBP 100 for a debt
 *    of GBP 10,000 or more.
 *  - Freelance worker protection statutes: New York City's Freelance Isn't
 *    Free Act and the New York State Act that took effect on 28 August 2024
 *    both require a written contract once the work is worth USD 800 or more,
 *    counting all contracts between the same parties in the preceding 120
 *    days, and require payment by the contract date or within 30 days of
 *    completion. The Illinois Freelance Worker Protection Act, in force from
 *    1 July 2024, uses a USD 500 threshold and the same 30-day default.
 *  - India: tax is deducted at source on fees for professional services under
 *    section 194J of the Income-tax Act 1961 at 10%, once payments of that
 *    kind exceed INR 30,000 in a financial year, and at 20% under section
 *    206AA where no PAN is furnished. GST on such services is charged at 18%
 *    where the writer is registered.
 *
 * Informational template only. It is not legal or tax advice; a contract you
 * intend to rely on should be reviewed by a professional in your jurisdiction.
 */

/** UK statutory interest margin over the Bank of England base rate, section 6 of the 1998 Act. */
export const UK_STATUTORY_MARGIN_PERCENT = 8;
/** Section 5A fixed compensation bands, in pounds, by debt size. */
export const UK_FIXED_COMPENSATION_BANDS = [
  { maxDebtExclusive: 1000, amount: 40 },
  { maxDebtExclusive: 10000, amount: 70 },
  { maxDebtExclusive: Infinity, amount: 100 },
];
/** Section 194J rate for fees for professional services. */
export const INDIA_TDS_194J_PERCENT = 10;
/** Section 206AA rate where the payee has not furnished a PAN. */
export const INDIA_TDS_NO_PAN_PERCENT = 20;
/** Section 194J threshold per financial year, per nature of payment. */
export const INDIA_TDS_194J_THRESHOLD = 30000;
/** GST rate applied to professional writing services. */
export const INDIA_GST_PERCENT = 18;
/** Days in a year used for the daily statutory interest figure. */
const DAYS_PER_YEAR = 365;
const MAX_FIELD = 140;
const MAX_WORDS_PER_PIECE = 200000;
const MAX_PIECES = 500;

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

/** How the engagement is priced. */
export const PRICING_MODELS = [
  { id: "per-word", label: "Per word" },
  { id: "per-piece", label: "Flat fee per piece" },
  { id: "hourly", label: "Hourly" },
];

/** Currencies the contract can be written in. */
export const CURRENCIES = [
  { code: "USD", locale: "en-US" },
  { code: "GBP", locale: "en-GB" },
  { code: "EUR", locale: "en-IE" },
  { code: "INR", locale: "en-IN" },
  { code: "AUD", locale: "en-AU" },
  { code: "CAD", locale: "en-CA" },
];

/** Facts about the engagement that make particular clauses necessary. */
export const PROFILE_TAGS = [
  { id: "uk", label: "UK contract (statutory late payment applies)" },
  { id: "us-ny", label: "Writer or client in New York" },
  { id: "us-il", label: "Writer or client in Illinois" },
  { id: "india", label: "Writer invoices from India" },
  { id: "ghostwriting", label: "Ghostwriting — no byline for the writer" },
  { id: "ai-restricted", label: "Generative AI drafting is restricted" },
  { id: "exclusive", label: "Client wants exclusive rights and no reuse" },
  { id: "no-pan", label: "Indian writer has not furnished a PAN" },
];

/**
 * Clause library. `always` means every writing contract needs it; `requiredFor`
 * lists profile tags that make an otherwise optional clause necessary.
 */
export const CLAUSES = [
  {
    id: "parties",
    title: "Parties and engagement",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "{{client}} engages {{writer}} as an independent contractor to write {{scopeLine}}. This document sets out what is being written, what it costs, when it is paid and who owns it. It takes effect on {{startLong}}.",
  },
  {
    id: "deliverables",
    title: "Deliverables and word count",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "The writer will deliver {{scopeLine}}, supplied as {{format}}. Word counts are targets with a tolerance of plus or minus 10% unless the brief says otherwise; a piece within that band is delivered in full. A request to change the target after the brief is agreed is a change of scope and is priced separately at the same rate.",
  },
  {
    id: "brief-and-research",
    title: "Brief, research and sources",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "The client supplies the brief, the audience, the target keywords if any, product facts, access to subject-matter experts and any style guide, before the writer starts. The writer researches from primary or reputable sources, keeps a source list and provides it on request. Time spent waiting for a brief, an interview or a review does not extend the writer's fee but does move the delivery date by the same number of working days.",
  },
  {
    id: "ai",
    title: "Generative AI and originality",
    always: false,
    requiredFor: ["ai-restricted"],
    weight: 3,
    body: "The writer will not deliver text generated by a large language model as original work. Generative tools may be used for research, outlining, grammar checks and idea generation, and the writer remains responsible for the accuracy, originality and sourcing of everything delivered. The writer will disclose on request which tools were used and how. The client accepts that in the United States material produced without human authorship is not protectable by copyright, so purely machine-generated text could not be assigned in any event.",
  },
  {
    id: "revisions",
    title: "Revisions",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "{{includedRevisions}} round(s) of revisions per piece are included, where a round means one consolidated set of comments returned within {{feedbackDays}} working days of delivery. Further rounds, and rewrites caused by a change of brief, are charged at {{extraRevisionFeeText}} per round per piece. A revision is a refinement of what was briefed; a new angle, a new audience or a new format is new work.",
  },
  {
    id: "deadlines",
    title: "Deadlines, delay and acceptance",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "The writer delivers by the agreed dates. If the client does not send consolidated feedback within {{feedbackDays}} working days of delivery, the piece is treated as accepted and becomes payable. If the writer will miss a deadline they say so as soon as they know and propose a new date. Persistent late delivery, or a first draft that ignores an agreed brief, entitles the client to terminate under the termination clause.",
  },
  {
    id: "fees",
    title: "Fees and payment schedule",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "The fee for this engagement is {{totalFeeText}} ({{pricingLine}}). A deposit of {{depositText}} ({{depositPercent}}%) is payable before work starts and is non-refundable once the writer has begun. The balance of {{balanceText}} is invoiced on delivery and payable within {{netDays}} days, that is by {{dueLong}} for work delivered on {{deliveryLong}}. Bank charges on the client's side are the client's.",
  },
  {
    id: "late-payment",
    title: "Late payment",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "{{latePaymentBody}}",
  },
  {
    id: "kill-fee",
    title: "Kill fee",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "If the client cancels a commissioned piece after the writer has started but before delivery, a kill fee of {{killFeeText}} ({{killFeePercent}}% of the fee) is payable, and the deposit is credited against it. Cancellation after delivery does not reduce the fee. Where a kill fee is paid, rights in the unused draft stay with the writer unless the parties agree otherwise in writing.",
  },
  {
    id: "copyright",
    title: "Copyright and when it transfers",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "The writer owns copyright in each piece until it is paid for in full. On receipt of full payment the writer assigns to the client all copyright and related rights in the delivered text, worldwide and for the full term of copyright. The parties do not rely on the work made for hire doctrine: under 17 U.S.C. section 101 a commissioned work is a work made for hire only if it falls into one of nine listed categories and the parties sign a written instrument, and ordinary web copy often does not, so this express assignment is what transfers ownership. The writer keeps the underlying research, notes and any pre-existing material, and grants the client a licence to use those where they are embedded in the delivered text.",
  },
  {
    id: "byline",
    title: "Byline and credit",
    always: false,
    requiredFor: [],
    weight: 2,
    body: "The client will publish the piece under the writer's byline as {{bylineName}} and will not materially alter the meaning of the text without the writer's agreement. The writer asserts the right to be identified as author of the work under sections 77 and 78 of the Copyright, Designs and Patents Act 1988 where that Act applies, and reserves the author's special rights under section 57 of the Copyright Act 1957 where Indian law applies. If the client edits the piece substantially, the writer may ask for the byline to be removed.",
  },
  {
    id: "ghostwriting",
    title: "Ghostwriting and no attribution",
    always: false,
    requiredFor: ["ghostwriting"],
    weight: 3,
    body: "The work is ghostwritten. The client may publish it under any name it chooses and the writer will not claim authorship publicly, will not include the text in a public portfolio, and waives any right to be identified as author to the fullest extent permitted by the law that applies. Some jurisdictions do not allow that right to be waived — section 57 of India's Copyright Act 1957 is one — so the writer instead undertakes not to exercise it. The writer may describe the engagement in general terms to prospective clients under a confidentiality agreement.",
  },
  {
    id: "portfolio",
    title: "Portfolio and reuse",
    always: false,
    requiredFor: [],
    weight: 1,
    body: "Once the piece is published the writer may show it in a portfolio and link to it, and may reference the client as a client. The writer will not resell, syndicate or re-publish the delivered text elsewhere.",
  },
  {
    id: "exclusivity",
    title: "Exclusivity",
    always: false,
    requiredFor: ["exclusive"],
    weight: 2,
    body: "The rights assigned are exclusive: the writer will not license, sell or publish the same text, or a substantially similar version of it, to anyone else. This does not stop the writer working for other clients in the same sector, writing on the same subject in their own words, or reusing their own general knowledge and research method.",
  },
  {
    id: "warranties",
    title: "Originality, accuracy and indemnity",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "The writer warrants that the text is their own original work, is not copied from another source, does not infringe anyone's copyright, and does not knowingly contain defamatory statements. Quotations and data are attributed and licensed images are the client's responsibility unless the brief says otherwise. The writer indemnifies the client against a claim arising from a breach of this warranty, capped at the fees paid under this contract, except where the writer acted dishonestly. The client is responsible for legal, regulatory and factual review of claims about its own products before publication.",
  },
  {
    id: "confidentiality",
    title: "Confidentiality",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "Each party keeps the other's non-public information confidential and uses it only for this engagement: unpublished plans, customer data, pricing, drafts and the contents of the brief. This does not apply to information that is already public, becomes public without fault, was already known, or must be disclosed by law. The duty continues for three years after the engagement ends.",
  },
  {
    id: "contractor-status",
    title: "Independent contractor status",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "The writer is an independent contractor, not an employee. They choose their own hours and methods, use their own equipment, may work for others, and are responsible for their own taxes, insurance and any registrations their trade requires. Nothing here creates a partnership, agency or employment relationship, and the writer is not entitled to employee benefits.",
  },
  {
    id: "freelance-laws",
    title: "Freelance worker protection statutes",
    always: false,
    requiredFor: ["us-ny", "us-il"],
    weight: 3,
    body: "This written contract is provided in compliance with the freelance worker protection statutes that apply to it. New York City's Freelance Isn't Free Act and the New York State Act in force from 28 August 2024 require a written contract once the value of the services reaches USD 800, counting all contracts between the same parties in the previous 120 days, and require payment on the contract date or, if none is stated, within 30 days of completion. The Illinois Freelance Worker Protection Act, in force from 1 July 2024, applies from USD 500 with the same 30-day default. Each party keeps a copy of this contract. Retaliation against a freelance worker for asserting these rights is prohibited.",
  },
  {
    id: "india-tax",
    title: "Indian tax: TDS and GST",
    always: false,
    requiredFor: ["india", "no-pan"],
    weight: 3,
    body: "{{indiaTaxBody}}",
  },
  {
    id: "termination",
    title: "Termination",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "Either party may end this contract on {{noticeDays}} days' written notice. On termination the client pays for work delivered and accepted, plus the kill fee for any piece already started, and the writer delivers what is complete. Clauses on copyright, confidentiality, warranties and payment survive termination.",
  },
  {
    id: "governing-law",
    title: "Governing law and whole agreement",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "This contract is governed by the laws of {{jurisdiction}} and the courts of {{jurisdiction}} have jurisdiction. Before starting a claim the parties will try to settle the dispute in a recorded conversation. This is the whole agreement between the parties about this work, replaces earlier discussions, and can be changed only in writing signed by both. If a clause is unenforceable the rest still applies.",
  },
];

const CLAUSE_BY_ID = new Map(CLAUSES.map((clause) => [clause.id, clause]));

function clean(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

/**
 * Parse yyyy-mm-dd into a UTC-midnight timestamp, or null when invalid.
 * @param {string} iso
 * @returns {number|null}
 */
export function parseIsoDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return stamp;
}

function formatStamp(stamp) {
  const date = new Date(stamp);
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * Add whole days to a UTC-midnight timestamp.
 * @param {number} stamp
 * @param {number} days
 * @returns {number}
 */
export function addDays(stamp, days) {
  return stamp + days * 86400000;
}

/**
 * Section 5A fixed compensation for a late commercial debt, in pounds.
 * @param {number} debt Amount owed.
 * @returns {number}
 */
export function ukFixedCompensation(debt) {
  if (!(debt > 0)) return 0;
  const band = UK_FIXED_COMPENSATION_BANDS.find((entry) => debt < entry.maxDebtExclusive);
  return band ? band.amount : 100;
}

function currencyFormatter(code) {
  const entry = CURRENCIES.find((item) => item.code === code) ?? CURRENCIES[0];
  return new Intl.NumberFormat(entry.locale, {
    style: "currency",
    currency: entry.code,
    maximumFractionDigits: 2,
  });
}

/**
 * Price the engagement.
 *
 * per-word:  fee = wordsPerPiece x pieces x ratePerWord
 * per-piece: fee = flatPerPiece x pieces
 * hourly:    fee = hours x hourlyRate
 *
 * @param {object} input
 * @returns {{totalFee:number, totalWords:number, perPieceFee:number, pricingLine:string}|{error:string}}
 */
export function priceEngagement({
  pricingModel,
  wordsPerPiece = 0,
  pieces = 1,
  ratePerWord = 0,
  flatPerPiece = 0,
  hours = 0,
  hourlyRate = 0,
  currency = "USD",
}) {
  const money = currencyFormatter(currency);
  const count = Number(pieces);
  if (!Number.isFinite(count) || !Number.isInteger(count) || count < 1 || count > MAX_PIECES) {
    return { error: `The number of pieces must be a whole number between 1 and ${MAX_PIECES}.` };
  }

  if (pricingModel === "per-word") {
    const words = Number(wordsPerPiece);
    const rate = Number(ratePerWord);
    if (!Number.isFinite(words) || words <= 0 || words > MAX_WORDS_PER_PIECE) {
      return { error: `Words per piece must be between 1 and ${MAX_WORDS_PER_PIECE}.` };
    }
    if (!Number.isFinite(rate) || rate <= 0) {
      return { error: "The per-word rate must be greater than zero." };
    }
    const perPieceFee = words * rate;
    return {
      totalFee: perPieceFee * count,
      totalWords: words * count,
      perPieceFee,
      pricingLine: `${count} piece(s) of about ${words} words at ${money.format(rate)} per word`,
    };
  }

  if (pricingModel === "per-piece") {
    const flat = Number(flatPerPiece);
    const words = Number(wordsPerPiece);
    if (!Number.isFinite(flat) || flat <= 0) {
      return { error: "The flat fee per piece must be greater than zero." };
    }
    if (!Number.isFinite(words) || words < 0 || words > MAX_WORDS_PER_PIECE) {
      return { error: `Words per piece must be between 0 and ${MAX_WORDS_PER_PIECE}.` };
    }
    return {
      totalFee: flat * count,
      totalWords: words * count,
      perPieceFee: flat,
      pricingLine: `${count} piece(s) of about ${words} words at a flat ${money.format(flat)} each`,
    };
  }

  if (pricingModel === "hourly") {
    const hrs = Number(hours);
    const rate = Number(hourlyRate);
    if (!Number.isFinite(hrs) || hrs <= 0 || hrs > 10000) {
      return { error: "Estimated hours must be between 1 and 10000." };
    }
    if (!Number.isFinite(rate) || rate <= 0) {
      return { error: "The hourly rate must be greater than zero." };
    }
    const words = Number(wordsPerPiece);
    return {
      totalFee: hrs * rate,
      totalWords: Number.isFinite(words) && words > 0 ? words * count : 0,
      perPieceFee: (hrs * rate) / count,
      pricingLine: `${hrs} estimated hours at ${money.format(rate)} per hour across ${count} piece(s)`,
    };
  }

  return { error: "Choose a pricing model: per word, flat fee per piece, or hourly." };
}

/**
 * Clauses this engagement needs.
 * @param {string[]} profileTags Ids from PROFILE_TAGS.
 * @returns {object[]}
 */
export function requiredClauses(profileTags = []) {
  const tags = new Set(profileTags);
  return CLAUSES.filter(
    (clause) => clause.always || clause.requiredFor.some((tag) => tags.has(tag)),
  );
}

/**
 * Price the engagement, work out the payment dates and statutory charges, and
 * assemble the contract.
 *
 * deposit  = totalFee x depositPercent / 100
 * balance  = totalFee - deposit
 * killFee  = totalFee x killFeePercent / 100
 * dueDate  = deliveryDate + netDays
 * UK daily statutory interest = balance x (baseRate + 8) / 100 / 365
 * India TDS = totalFee x rate / 100, charged only once fees of this kind pass
 *             INR 30,000 in the financial year
 * India GST = totalFee x 18 / 100, added to the invoice rather than deducted
 *
 * @returns {{contract:string, totalFee:number, deposit:number, balance:number, killFee:number,
 *            totalWords:number, effectiveRatePerWord:number, dueLong:string, dailyLateInterest:number,
 *            fixedCompensation:number, tdsAmount:number, gstAmount:number, invoiceTotal:number,
 *            netToWriter:number, coveragePercent:number, missing:object[], warnings:string[],
 *            wordCount:number, currency:string}|{error:string}}
 */
export function buildWritingContract({
  clientName,
  writerName,
  projectName,
  jurisdiction,
  format = "Google Docs",
  bylineName = "",
  currency = "USD",
  pricingModel = "per-word",
  wordsPerPiece = 1200,
  pieces = 4,
  ratePerWord = 0.35,
  flatPerPiece = 0,
  hours = 0,
  hourlyRate = 0,
  depositPercent = 30,
  killFeePercent = 50,
  includedRevisions = 2,
  extraRevisionFee = 60,
  feedbackDays = 5,
  netDays = 14,
  noticeDays = 14,
  startDate,
  deliveryDate,
  ukBaseRatePercent = 4,
  indiaGstRegistered = false,
  indiaTdsApplies = true,
  profileTags = [],
  includedIds = [],
}) {
  if (!Array.isArray(profileTags) || !Array.isArray(includedIds)) {
    return { error: "Profile and clause selections must be given as lists." };
  }
  const unknown = includedIds.find((id) => !CLAUSE_BY_ID.has(id));
  if (unknown) return { error: `Unknown clause: ${unknown}.` };

  const client = clean(clientName);
  const writer = clean(writerName);
  const project = clean(projectName);
  const law = clean(jurisdiction);
  const deliveryFormat = clean(format) || "an editable document";
  if (!client) return { error: "Enter the client's name." };
  if (!writer) return { error: "Enter the writer's name." };
  if (!project) return { error: "Enter what is being written — the project or content type." };
  if (!law) return { error: "Enter the governing law — a country or a state." };
  if ([client, writer, project, law].some((value) => value.length > MAX_FIELD)) {
    return { error: `Keep each name under ${MAX_FIELD} characters.` };
  }

  const start = parseIsoDate(startDate);
  if (start === null) return { error: "Enter a valid start date." };
  const delivery = parseIsoDate(deliveryDate);
  if (delivery === null) return { error: "Enter a valid final delivery date." };
  if (delivery < start) return { error: "Delivery cannot fall before the start date." };

  const pricing = priceEngagement({
    pricingModel,
    wordsPerPiece,
    pieces,
    ratePerWord,
    flatPerPiece,
    hours,
    hourlyRate,
    currency,
  });
  if (pricing.error) return { error: pricing.error };

  const deposit0 = Number(depositPercent);
  if (!Number.isFinite(deposit0) || deposit0 < 0 || deposit0 > 100) {
    return { error: "The deposit must be between 0% and 100% of the fee." };
  }
  const kill0 = Number(killFeePercent);
  if (!Number.isFinite(kill0) || kill0 < 0 || kill0 > 100) {
    return { error: "The kill fee must be between 0% and 100% of the fee." };
  }
  const revisions = Number(includedRevisions);
  if (!Number.isFinite(revisions) || !Number.isInteger(revisions) || revisions < 0 || revisions > 20) {
    return { error: "Included revision rounds must be a whole number between 0 and 20." };
  }
  const extraFee = Number(extraRevisionFee);
  if (!Number.isFinite(extraFee) || extraFee < 0) {
    return { error: "The extra revision fee cannot be negative." };
  }
  const feedback = Number(feedbackDays);
  if (!Number.isFinite(feedback) || !Number.isInteger(feedback) || feedback < 1 || feedback > 60) {
    return { error: "The feedback window must be a whole number of working days between 1 and 60." };
  }
  const net = Number(netDays);
  if (!Number.isFinite(net) || !Number.isInteger(net) || net < 0 || net > 180) {
    return { error: "Payment terms must be a whole number of days between 0 and 180." };
  }
  const notice = Number(noticeDays);
  if (!Number.isFinite(notice) || !Number.isInteger(notice) || notice < 0 || notice > 180) {
    return { error: "The notice period must be a whole number of days between 0 and 180." };
  }
  const baseRate = Number(ukBaseRatePercent);
  if (!Number.isFinite(baseRate) || baseRate < 0 || baseRate > 30) {
    return { error: "The Bank of England base rate must be between 0% and 30%." };
  }

  const included = CLAUSES.filter((clause) => includedIds.includes(clause.id));
  if (included.length === 0) {
    return { error: "Include at least one clause — an empty contract is worse than none." };
  }

  const tags = new Set(profileTags);
  const money = currencyFormatter(currency);

  const totalFee = pricing.totalFee;
  const deposit = (totalFee * deposit0) / 100;
  const balance = totalFee - deposit;
  const killFee = (totalFee * kill0) / 100;
  const due = addDays(delivery, net);
  const effectiveRatePerWord = pricing.totalWords > 0 ? totalFee / pricing.totalWords : 0;

  const statutoryRate = baseRate + UK_STATUTORY_MARGIN_PERCENT;
  const dailyLateInterest = tags.has("uk")
    ? (balance * statutoryRate) / 100 / DAYS_PER_YEAR
    : 0;
  const fixedCompensation = tags.has("uk") ? ukFixedCompensation(balance) : 0;

  const tdsRate = tags.has("no-pan") ? INDIA_TDS_NO_PAN_PERCENT : INDIA_TDS_194J_PERCENT;
  const tdsDue = tags.has("india") && indiaTdsApplies && totalFee > INDIA_TDS_194J_THRESHOLD;
  const tdsAmount = tdsDue ? (totalFee * tdsRate) / 100 : 0;
  const gstAmount =
    tags.has("india") && indiaGstRegistered ? (totalFee * INDIA_GST_PERCENT) / 100 : 0;
  const invoiceTotal = totalFee + gstAmount;
  const netToWriter = invoiceTotal - tdsAmount;

  const latePaymentBody = tags.has("uk")
    ? `An invoice unpaid after ${net} days carries statutory interest under the Late Payment of Commercial Debts (Interest) Act 1998, at the Bank of England base rate plus ${UK_STATUTORY_MARGIN_PERCENT} percentage points — ${statutoryRate.toFixed(2)}% a year at a base rate of ${baseRate.toFixed(2)}% — which on the balance of ${money.format(balance)} is about ${money.format(dailyLateInterest)} a day. Section 5A of that Act also entitles the writer to fixed compensation of ${money.format(fixedCompensation)} for a debt of this size, plus the reasonable cost of recovering it. The writer may pause work on unpaid invoices.`
    : `An invoice unpaid after ${net} days carries interest at 1.5% a month on the outstanding amount, or the highest rate the law allows if that is lower, running from the due date until payment. The writer may pause work while an invoice is overdue and may withhold the assignment of copyright until the invoice is settled.`;

  const indiaTaxParts = [];
  if (tags.has("india")) {
    indiaTaxParts.push(
      `Fees are quoted exclusive of tax. Tax is deducted at source on fees for professional services under section 194J of the Income-tax Act 1961 at ${INDIA_TDS_194J_PERCENT}%, once payments of that kind to the same payee exceed INR ${INDIA_TDS_194J_THRESHOLD.toLocaleString("en-IN")} in a financial year.`,
    );
    if (tags.has("no-pan")) {
      indiaTaxParts.push(
        `Because the writer has not furnished a PAN, section 206AA requires deduction at the higher rate of ${INDIA_TDS_NO_PAN_PERCENT}%. Furnishing a PAN brings the rate back to ${INDIA_TDS_194J_PERCENT}%.`,
      );
    }
    indiaTaxParts.push(
      tdsDue
        ? `On this engagement that is ${money.format(tdsAmount)} deducted from ${money.format(totalFee)}.`
        : `On this engagement the fee does not cross that threshold on its own, so no deduction is shown here; the client must still aggregate payments across the financial year.`,
    );
    indiaTaxParts.push(
      indiaGstRegistered
        ? `The writer is registered for GST and will charge GST at ${INDIA_GST_PERCENT}%, that is ${money.format(gstAmount)}, on top of the fee. The client pays ${money.format(invoiceTotal)} gross, deducts TDS on the fee and remits it.`
        : `The writer is not registered for GST and will not charge it. Registration becomes compulsory once aggregate turnover passes INR 20 lakh in a financial year, or INR 10 lakh in the special category states.`,
    );
    indiaTaxParts.push(
      "The client will issue Form 16A for tax deducted. This is a summary of how the parties expect the rules to apply, not tax advice — check the position with a chartered accountant.",
    );
  }

  const scopeLine =
    pricingModel === "hourly"
      ? `${project} on an hourly basis`
      : `${pieces} piece(s) of ${project}${pricing.totalWords > 0 ? `, about ${Math.round(pricing.totalWords / Math.max(1, Number(pieces)))} words each` : ""}`;

  const values = {
    client,
    writer,
    project,
    jurisdiction: law,
    format: deliveryFormat,
    bylineName: clean(bylineName) || writer,
    scopeLine,
    pricingLine: pricing.pricingLine,
    startLong: formatStamp(start),
    deliveryLong: formatStamp(delivery),
    dueLong: formatStamp(due),
    totalFeeText: money.format(totalFee),
    depositText: money.format(deposit),
    depositPercent: String(deposit0),
    balanceText: money.format(balance),
    killFeeText: money.format(killFee),
    killFeePercent: String(kill0),
    includedRevisions: String(revisions),
    extraRevisionFeeText: money.format(extraFee),
    feedbackDays: String(feedback),
    netDays: String(net),
    noticeDays: String(notice),
    latePaymentBody,
    indiaTaxBody: indiaTaxParts.join(" "),
  };

  const fill = (text) =>
    Object.keys(values).reduce((acc, key) => acc.split(`{{${key}}}`).join(values[key]), text);

  const required = requiredClauses(profileTags);
  const totalWeight = required.reduce((sum, clause) => sum + clause.weight, 0);
  const coveredWeight = required
    .filter((clause) => includedIds.includes(clause.id))
    .reduce((sum, clause) => sum + clause.weight, 0);
  const coveragePercent = totalWeight === 0 ? 100 : Math.round((coveredWeight / totalWeight) * 100);

  const missing = required
    .filter((clause) => !includedIds.includes(clause.id))
    .map((clause) => ({
      id: clause.id,
      title: clause.title,
      why: clause.always
        ? "Every writing contract needs this clause."
        : `Needed because: ${clause.requiredFor
            .filter((tag) => profileTags.includes(tag))
            .map((tag) => PROFILE_TAGS.find((entry) => entry.id === tag)?.label ?? tag)
            .join("; ")}.`,
    }));

  const warnings = [];
  if (includedIds.includes("byline") && includedIds.includes("ghostwriting")) {
    warnings.push(
      "The byline clause and the ghostwriting clause contradict each other. Keep one.",
    );
  }
  if (tags.has("ghostwriting") && includedIds.includes("portfolio")) {
    warnings.push(
      "A ghostwriting engagement and a portfolio clause conflict — the writer cannot both stay anonymous and publish the work as their own.",
    );
  }
  if (!includedIds.includes("copyright")) {
    warnings.push(
      "Without the copyright clause the writer keeps ownership by default, and the client only has an implied licence to use the text for the purpose it was commissioned for.",
    );
  }
  if ((tags.has("us-ny") || tags.has("us-il")) && net > 30) {
    warnings.push(
      `Payment terms of ${net} days sit outside the 30-day default in the New York and Illinois freelance worker statutes. A longer term is only safe where the contract states the date and the freelancer agreed to it.`,
    );
  }
  if (deposit0 === 0) {
    warnings.push(
      "No deposit means the writer carries the whole risk of the engagement. A deposit of 25% to 50% is the usual protection on a first project.",
    );
  }
  if (kill0 === 0) {
    warnings.push(
      "A zero kill fee means the client can cancel a half-written piece for nothing. Trade practice is 25% to 50% of the fee.",
    );
  }

  const lines = [
    `FREELANCE WRITING AGREEMENT — ${project.toUpperCase()}`,
    `Between ${client} (the Client) and ${writer} (the Writer).`,
    `Starts ${formatStamp(start)}. Final delivery ${formatStamp(delivery)}. Fee ${money.format(totalFee)}, balance due ${formatStamp(due)}.`,
    "",
  ];
  included.forEach((clause, index) => {
    lines.push(`${index + 1}. ${clause.title.toUpperCase()}`);
    lines.push(fill(clause.body));
    lines.push("");
  });
  lines.push(`Signed for ${client}: ______________________  Date: __________`);
  lines.push(`Signed by ${writer}: ______________________  Date: __________`);

  const contract = lines.join("\n");

  return {
    contract,
    totalFee,
    deposit,
    balance,
    killFee,
    totalWords: pricing.totalWords,
    effectiveRatePerWord,
    dueLong: formatStamp(due),
    dailyLateInterest,
    fixedCompensation,
    statutoryRate: tags.has("uk") ? statutoryRate : 0,
    tdsAmount,
    gstAmount,
    invoiceTotal,
    netToWriter,
    coveragePercent,
    missing,
    warnings,
    wordCount: contract.split(/\s+/).filter(Boolean).length,
    currency,
  };
}
