/**
 * One-way (unilateral) NDA generator — pure document assembly.
 * No React, no DOM, no Date.now(): the effective date is always an argument.
 *
 * This produces a template. It is not legal advice and has not been reviewed
 * for any particular jurisdiction or transaction.
 */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Governing law presets. Each names the statute or body of law most commonly
 * cited for that jurisdiction plus the usual forum wording.
 */
export const JURISDICTIONS = [
  {
    key: "india",
    label: "India",
    law: "the laws of India, including the Indian Contract Act, 1872",
    courts: "the courts at {city}, India",
    defaultCity: "Bengaluru",
    stampDuty: true,
    dtsa: false,
  },
  {
    key: "england",
    label: "England and Wales",
    law: "the laws of England and Wales",
    courts: "the courts of England and Wales sitting in {city}",
    defaultCity: "London",
    stampDuty: false,
    dtsa: false,
  },
  {
    key: "singapore",
    label: "Singapore",
    law: "the laws of Singapore",
    courts: "the courts of Singapore",
    defaultCity: "Singapore",
    stampDuty: false,
    dtsa: false,
  },
  {
    key: "delaware",
    label: "Delaware, USA",
    law: "the laws of the State of Delaware, without regard to its conflict of laws principles",
    courts: "the state and federal courts located in the State of Delaware",
    defaultCity: "Wilmington",
    stampDuty: false,
    dtsa: true,
  },
  {
    key: "newyork",
    label: "New York, USA",
    law: "the laws of the State of New York, without regard to its conflict of laws principles",
    courts: "the state and federal courts located in New York County, New York",
    defaultCity: "New York",
    stampDuty: false,
    dtsa: true,
  },
  {
    key: "california",
    label: "California, USA",
    law: "the laws of the State of California, without regard to its conflict of laws principles",
    courts: "the state and federal courts located in San Francisco County, California",
    defaultCity: "San Francisco",
    stampDuty: false,
    dtsa: true,
  },
];

/** Entity descriptions offered for each party. */
export const ENTITY_TYPES = [
  "a private limited company",
  "a limited liability partnership",
  "a corporation",
  "a limited liability company",
  "a partnership firm",
  "a sole proprietorship",
  "an individual",
];

/** Sensible defaults, and the outer bounds the generator will accept. */
export const MIN_TERM_YEARS = 1;
export const MAX_TERM_YEARS = 20;
export const DEFAULT_TERM_YEARS = 2;
export const DEFAULT_CONFIDENTIALITY_YEARS = 3;
export const MIN_NOTICE_DAYS = 0;
export const MAX_NOTICE_DAYS = 180;

/** Non-solicitation windows that stay within commonly enforceable ranges. */
export const NON_SOLICIT_MONTH_OPTIONS = [6, 12, 18, 24];

export function parseIsoDate(value) {
  const match = DATE_RE.exec(String(value || "").trim());
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return ms;
}

/** Add whole years to an ISO date, clamping 29 February to 28 February. */
export function addYearsIso(dateString, years) {
  const ms = parseIsoDate(dateString);
  if (ms === null) return null;
  const date = new Date(ms);
  const targetYear = date.getUTCFullYear() + Math.trunc(years);
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, month + 1, 0)).getUTCDate();
  const safeDay = Math.min(day, lastDayOfTargetMonth);
  return new Date(Date.UTC(targetYear, month, safeDay)).toISOString().slice(0, 10);
}

/** "2026-08-01" -> "1 August 2026". */
export function formatLongDate(dateString) {
  const ms = parseIsoDate(dateString);
  if (ms === null) return "";
  const date = new Date(ms);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function findJurisdiction(key) {
  return JURISDICTIONS.find((j) => j.key === key) || JURISDICTIONS[0];
}

const clean = (value) => String(value ?? "").trim();

/**
 * Build a one-way NDA.
 * @returns {object} { title, sections, plainText, ... } or { error }.
 */
export function buildOneWayNda(input) {
  const {
    disclosingName,
    disclosingEntity = "a private limited company",
    disclosingAddress = "",
    receivingName,
    receivingEntity = "a private limited company",
    receivingAddress = "",
    effectiveDate,
    purpose,
    termYears = DEFAULT_TERM_YEARS,
    confidentialityYears = DEFAULT_CONFIDENTIALITY_YEARS,
    jurisdictionKey = "india",
    city = "",
    tradeSecretsIndefinite = true,
    includeResiduals = false,
    includeNonSolicit = false,
    nonSolicitMonths = 12,
    includeDtsaNotice = false,
    returnNoticeDays = 30,
  } = input || {};

  const discloser = clean(disclosingName);
  const receiver = clean(receivingName);
  const purposeText = clean(purpose);

  if (!discloser) return { error: "Enter the name of the disclosing party." };
  if (!receiver) return { error: "Enter the name of the receiving party." };
  if (discloser.toLowerCase() === receiver.toLowerCase()) {
    return { error: "The disclosing and receiving parties must be different." };
  }
  if (!purposeText) return { error: "Describe the purpose the information will be used for." };
  if (purposeText.length < 10) return { error: "The purpose is too vague — describe it in at least ten characters." };
  if (parseIsoDate(effectiveDate) === null) return { error: "Enter a valid effective date as YYYY-MM-DD." };

  const term = Number(termYears);
  const confidentiality = Number(confidentialityYears);
  const notice = Number(returnNoticeDays);
  const solicitMonths = Number(nonSolicitMonths);

  if (!Number.isFinite(term) || term < MIN_TERM_YEARS || term > MAX_TERM_YEARS) {
    return { error: `The term must be between ${MIN_TERM_YEARS} and ${MAX_TERM_YEARS} years.` };
  }
  if (!Number.isFinite(confidentiality) || confidentiality < MIN_TERM_YEARS || confidentiality > MAX_TERM_YEARS) {
    return { error: `The confidentiality period must be between ${MIN_TERM_YEARS} and ${MAX_TERM_YEARS} years.` };
  }
  if (!Number.isFinite(notice) || notice < MIN_NOTICE_DAYS || notice > MAX_NOTICE_DAYS) {
    return { error: `The return deadline must be between ${MIN_NOTICE_DAYS} and ${MAX_NOTICE_DAYS} days.` };
  }
  if (includeNonSolicit && !NON_SOLICIT_MONTH_OPTIONS.includes(solicitMonths)) {
    return { error: `Choose a non-solicitation period of ${NON_SOLICIT_MONTH_OPTIONS.join(", ")} months.` };
  }

  const jurisdiction = findJurisdiction(jurisdictionKey);
  const forumCity = clean(city) || jurisdiction.defaultCity;
  const courts = jurisdiction.courts.replace("{city}", forumCity);

  const effectiveLong = formatLongDate(effectiveDate);
  const termEndDate = addYearsIso(effectiveDate, Math.trunc(term));
  const confidentialityEndDate = addYearsIso(effectiveDate, Math.trunc(confidentiality));

  const discloserBlock = [
    discloser,
    disclosingEntity ? `, ${disclosingEntity}` : "",
    disclosingAddress ? `, having its principal address at ${clean(disclosingAddress)}` : "",
  ].join("");
  const receiverBlock = [
    receiver,
    receivingEntity ? `, ${receivingEntity}` : "",
    receivingAddress ? `, having its principal address at ${clean(receivingAddress)}` : "",
  ].join("");

  const sections = [];
  const push = (heading, body) => sections.push({ heading, body });

  push(
    "Parties and Effective Date",
    `This One-Way Non-Disclosure Agreement (the "Agreement") is made on ${effectiveLong} (the "Effective Date") between:\n\n(1) ${discloserBlock} (the "Disclosing Party"); and\n\n(2) ${receiverBlock} (the "Receiving Party").\n\nThe Disclosing Party and the Receiving Party are each a "Party" and together the "Parties". Only the Disclosing Party is expected to disclose confidential information under this Agreement.`,
  );

  push(
    "1. Purpose",
    `The Disclosing Party wishes to disclose certain confidential information to the Receiving Party solely for the following purpose (the "Purpose"): ${purposeText}.\n\nThe Receiving Party shall not use Confidential Information for any other purpose, including for its own commercial benefit or that of any third party.`,
  );

  push(
    "2. Confidential Information",
    `"Confidential Information" means all information disclosed by or on behalf of the Disclosing Party to the Receiving Party, before or after the Effective Date, in any form — written, oral, visual, electronic or by inspection of premises, systems or samples — that is either marked or identified as confidential, or that a reasonable person would understand to be confidential given its nature or the circumstances of disclosure.\n\nWithout limitation, Confidential Information includes business plans, financial data, pricing, customer and supplier lists, product roadmaps, designs, source code, algorithms, technical specifications, research, know-how, trade secrets, personnel information and the existence and content of discussions between the Parties.`,
  );

  push(
    "3. Exclusions",
    `Confidential Information does not include information that the Receiving Party can show by contemporaneous written record:\n\n(a) was already lawfully in its possession without a duty of confidence before disclosure by the Disclosing Party;\n(b) is or becomes publicly available other than through a breach of this Agreement;\n(c) is lawfully received from a third party that is free to disclose it; or\n(d) is independently developed by the Receiving Party without any use of or reference to the Confidential Information.`,
  );

  push(
    "4. Obligations of the Receiving Party",
    `The Receiving Party shall:\n\n(a) keep the Confidential Information strictly confidential;\n(b) use it only for the Purpose;\n(c) apply at least the same degree of care it applies to its own confidential information, and in no event less than a reasonable degree of care;\n(d) not copy or reproduce the Confidential Information except as reasonably necessary for the Purpose; and\n(e) notify the Disclosing Party promptly in writing on becoming aware of any unauthorised use or disclosure, and cooperate in limiting the consequences.`,
  );

  push(
    "5. Permitted Disclosures",
    `The Receiving Party may disclose Confidential Information to its directors, officers, employees and professional advisers who need to know it for the Purpose (each a "Representative"), provided each Representative is bound by confidentiality obligations no less protective than those in this Agreement. The Receiving Party remains responsible for any breach by its Representatives.\n\nIf the Receiving Party is required by law, regulation or a court or regulatory authority to disclose Confidential Information, it may do so, provided that (to the extent legally permitted) it gives the Disclosing Party prompt written notice and reasonable assistance to seek protective treatment, and discloses only the portion legally required.`,
  );

  let clauseNumber = 6;
  if (includeResiduals) {
    push(
      `${clauseNumber}. Residual Knowledge`,
      `Nothing in this Agreement restricts the Receiving Party from using general skills, knowledge, ideas, concepts and techniques retained in the unaided memory of its personnel who have had access to Confidential Information, provided that this clause does not grant any licence under the Disclosing Party's patents, copyrights or trade secrets and does not permit disclosure of Confidential Information itself.`,
    );
    clauseNumber += 1;
  }

  push(
    `${clauseNumber}. Term and Survival`,
    `This Agreement takes effect on the Effective Date and continues for ${term} year(s), expiring on ${formatLongDate(termEndDate)}, unless terminated earlier by either Party on written notice.\n\nThe confidentiality obligations in this Agreement survive expiry or termination and continue for ${confidentiality} year(s) from the Effective Date, that is until ${formatLongDate(confidentialityEndDate)}.${
      tradeSecretsIndefinite
        ? " Information that constitutes a trade secret remains protected for as long as it qualifies as a trade secret under applicable law, notwithstanding the period stated above."
        : ""
    }`,
  );
  clauseNumber += 1;

  push(
    `${clauseNumber}. Return or Destruction`,
    `On written request from the Disclosing Party, and in any event within ${notice} day(s) of expiry or termination of this Agreement, the Receiving Party shall return or securely destroy all Confidential Information in its possession or control, together with all copies, notes and derivative materials, and shall confirm in writing that it has done so.\n\nThe Receiving Party may retain one copy to the extent required by law or its bona fide internal record-retention or backup policies, which copy remains subject to this Agreement for as long as it is retained.`,
  );
  clauseNumber += 1;

  push(
    `${clauseNumber}. No Licence and No Warranty`,
    `All Confidential Information remains the property of the Disclosing Party. Nothing in this Agreement grants the Receiving Party any licence or right in any patent, copyright, trade mark, design, trade secret or other intellectual property, whether by implication, estoppel or otherwise.\n\nThe Confidential Information is provided "as is". The Disclosing Party makes no representation or warranty as to its accuracy or completeness, and has no liability arising from the Receiving Party's use of it, save in respect of fraud.`,
  );
  clauseNumber += 1;

  push(
    `${clauseNumber}. No Obligation to Proceed`,
    `Nothing in this Agreement obliges either Party to disclose any particular information, to enter into any further agreement, or to proceed with any transaction. Neither Party is restricted from pursuing similar opportunities with third parties, provided it does so without use or disclosure of the Confidential Information.`,
  );
  clauseNumber += 1;

  if (includeNonSolicit) {
    push(
      `${clauseNumber}. Non-Solicitation`,
      `For ${solicitMonths} month(s) from the Effective Date, the Receiving Party shall not directly solicit for employment any employee of the Disclosing Party with whom it had contact in connection with the Purpose. This does not restrict general recruitment advertising not targeted at such employees, or the hiring of any person who responds to it or who approaches the Receiving Party on their own initiative.`,
    );
    clauseNumber += 1;
  }

  push(
    `${clauseNumber}. Remedies`,
    `The Receiving Party acknowledges that damages alone may not be an adequate remedy for breach of this Agreement, and that the Disclosing Party is entitled to seek injunctive or other equitable relief in addition to any other remedy available to it, without the need to post security where the applicable law permits.`,
  );
  clauseNumber += 1;

  if (includeDtsaNotice) {
    push(
      `${clauseNumber}. Trade Secret Immunity Notice`,
      `Notice under the Defend Trade Secrets Act of 2016, 18 U.S.C. § 1833(b): an individual shall not be held criminally or civilly liable under any federal or state trade secret law for the disclosure of a trade secret that (a) is made in confidence to a federal, state or local government official, directly or indirectly, or to an attorney, solely for the purpose of reporting or investigating a suspected violation of law; or (b) is made in a complaint or other document filed under seal in a lawsuit or other proceeding. An individual who files a lawsuit for retaliation for reporting a suspected violation of law may disclose the trade secret to their attorney and use it in the court proceeding, if the individual files any document containing the trade secret under seal and does not disclose it except pursuant to court order.`,
    );
    clauseNumber += 1;
  }

  push(
    `${clauseNumber}. Governing Law and Jurisdiction`,
    `This Agreement and any dispute arising out of or in connection with it are governed by ${jurisdiction.law}. The Parties submit to the exclusive jurisdiction of ${courts}.`,
  );
  clauseNumber += 1;

  push(
    `${clauseNumber}. Notices`,
    `Notices under this Agreement must be in writing and sent to the address set out above, or to any other address a Party notifies in writing. Notice by email is effective if the recipient acknowledges receipt other than by an automated reply.`,
  );
  clauseNumber += 1;

  push(
    `${clauseNumber}. General`,
    `(a) Entire agreement. This Agreement is the entire agreement between the Parties on its subject matter and supersedes all prior discussions and understandings.\n(b) Amendment. Any variation must be in writing and signed by both Parties.\n(c) Assignment. Neither Party may assign this Agreement without the other's prior written consent, except to a successor of all or substantially all of its business.\n(d) Severability. If any provision is held unenforceable, the remainder continues in force and the provision is to be modified to the minimum extent necessary to make it enforceable.\n(e) Waiver. A failure or delay in exercising a right is not a waiver of it.\n(f) No partnership. Nothing in this Agreement creates a partnership, agency or employment relationship.\n(g) Counterparts. This Agreement may be signed in counterparts, including by electronic signature, each of which is an original.`,
  );

  push(
    "Signatures",
    `Signed for and on behalf of the Disclosing Party\n\n${discloser}\n\nName: ____________________\nTitle: ____________________\nDate: ____________________\n\n\nSigned for and on behalf of the Receiving Party\n\n${receiver}\n\nName: ____________________\nTitle: ____________________\nDate: ____________________`,
  );

  const title = `ONE-WAY NON-DISCLOSURE AGREEMENT`;
  const plainText = [title, "", ...sections.map((s) => `${s.heading}\n\n${s.body}`)].join("\n\n");
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  const warnings = [];
  if (confidentiality < term) {
    warnings.push(
      "The confidentiality period is shorter than the term of the agreement, so protection would lapse while the agreement is still running. Most drafts set survival at or above the term.",
    );
  }
  if (jurisdiction.stampDuty) {
    warnings.push(
      "In India, agreements are subject to stamp duty under the Indian Stamp Act, 1899 as adapted by the relevant state Act. Check the rate and stamp before signing.",
    );
  }
  if (includeNonSolicit && jurisdiction.key === "california") {
    warnings.push(
      "California restricts post-employment restraints under Business and Professions Code section 16600. Have a Californian lawyer review the non-solicitation clause before use.",
    );
  }
  if (includeDtsaNotice && !jurisdiction.dtsa) {
    warnings.push(
      "The Defend Trade Secrets Act immunity notice is a United States provision. It is harmless elsewhere but adds nothing outside US law.",
    );
  }
  if (!includeDtsaNotice && jurisdiction.dtsa) {
    warnings.push(
      "For US-governed agreements with individuals, adding the 18 U.S.C. § 1833(b) immunity notice preserves the right to exemplary damages and attorney fees in a trade secret action.",
    );
  }

  return {
    title,
    sections,
    plainText,
    wordCount,
    clauseCount: sections.length,
    effectiveDate,
    effectiveDateLong: effectiveLong,
    termEndDate,
    termEndDateLong: formatLongDate(termEndDate),
    confidentialityEndDate,
    confidentialityEndDateLong: formatLongDate(confidentialityEndDate),
    jurisdiction: { ...jurisdiction, courts, city: forumCity },
    warnings,
  };
}
