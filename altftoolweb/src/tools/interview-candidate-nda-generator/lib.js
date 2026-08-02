/**
 * Interview candidate NDA generator — pure document assembly.
 * No React, no DOM, no Date.now(): the interview date is always an argument.
 *
 * Produces a short template aimed at hiring processes. Not legal advice.
 */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MS_PER_DAY = 86400000;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Average adult silent reading speed for prose is roughly 200-250 words per
 * minute; legal text is slower, so the conservative end is used here.
 */
export const READING_WORDS_PER_MINUTE = 200;

/** A candidate NDA that runs long stops being read. */
export const RECOMMENDED_MAX_WORDS = 900;

export const JURISDICTIONS = [
  {
    key: "india",
    label: "India",
    law: "the laws of India, including the Indian Contract Act, 1872",
    courts: "the courts at {city}, India",
    defaultCity: "Bengaluru",
    cityMatters: true,
    dtsa: false,
    noncompeteNote:
      "Section 27 of the Indian Contract Act, 1872 makes agreements in restraint of trade void, so a candidate NDA must not operate as a non-compete.",
  },
  {
    key: "england",
    label: "England and Wales",
    law: "the laws of England and Wales",
    courts: "the courts of England and Wales sitting in {city}",
    defaultCity: "London",
    cityMatters: true,
    dtsa: false,
    noncompeteNote:
      "Restraints of trade are enforceable in England and Wales only so far as they protect a legitimate interest and go no further than reasonably necessary.",
  },
  {
    key: "delaware",
    label: "Delaware, USA",
    law: "the laws of the State of Delaware, without regard to its conflict of laws principles",
    courts: "the state and federal courts located in {city}, Delaware",
    defaultCity: "Wilmington",
    cityMatters: true,
    dtsa: true,
    noncompeteNote: "US state law on restrictive covenants varies widely; several states restrict or ban them outright.",
  },
  {
    key: "california",
    label: "California, USA",
    law: "the laws of the State of California, without regard to its conflict of laws principles",
    courts: "the state and federal courts located in {city} County, California",
    defaultCity: "San Francisco",
    cityMatters: true,
    dtsa: true,
    noncompeteNote:
      "California Business and Professions Code section 16600 voids non-compete agreements, and sections 16600.1 and 16600.5 restrict even offering one to an employee or applicant.",
  },
  {
    key: "singapore",
    label: "Singapore",
    law: "the laws of Singapore",
    courts: "the courts of Singapore",
    defaultCity: "Singapore",
    cityMatters: false,
    dtsa: false,
    noncompeteNote: "Singapore courts enforce restrictive covenants only where they protect a legitimate proprietary interest and are reasonable.",
  },
];

/** What a candidate might realistically be shown during a hiring process. */
export const MATERIAL_OPTIONS = [
  { id: "codebase", label: "Source code or a private repository" },
  { id: "architecture", label: "System architecture or infrastructure diagrams" },
  { id: "roadmap", label: "Product roadmap or unreleased features" },
  { id: "designs", label: "Unreleased designs, prototypes or brand work" },
  { id: "metrics", label: "Revenue, usage or growth metrics" },
  { id: "customers", label: "Customer names, contracts or account data" },
  { id: "personalData", label: "Real user or employee personal data" },
  { id: "internalTools", label: "Internal tools, dashboards or admin systems" },
  { id: "strategy", label: "Strategy, funding or hiring plans" },
  { id: "compensation", label: "Salary bands or compensation structures" },
];

export const MIN_TERM_YEARS = 1;
export const MAX_TERM_YEARS = 5;
export const MIN_DELETION_DAYS = 1;
export const MAX_DELETION_DAYS = 60;

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

export function addDaysIso(dateString, days) {
  const ms = parseIsoDate(dateString);
  if (ms === null) return null;
  return new Date(ms + Math.round(days) * MS_PER_DAY).toISOString().slice(0, 10);
}

export function addYearsIso(dateString, years) {
  const ms = parseIsoDate(dateString);
  if (ms === null) return null;
  const date = new Date(ms);
  const targetYear = date.getUTCFullYear() + Math.trunc(years);
  const month = date.getUTCMonth();
  const lastDay = new Date(Date.UTC(targetYear, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(targetYear, month, Math.min(date.getUTCDate(), lastDay))).toISOString().slice(0, 10);
}

export function formatLongDate(dateString) {
  const ms = parseIsoDate(dateString);
  if (ms === null) return "";
  const date = new Date(ms);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function findJurisdiction(key) {
  return JURISDICTIONS.find((j) => j.key === key) || JURISDICTIONS[0];
}

/** Words per the reading-speed constant, rounded up to whole minutes. */
export function readingMinutes(wordCount) {
  if (!Number.isFinite(wordCount) || wordCount <= 0) return 0;
  return Math.max(1, Math.ceil(wordCount / READING_WORDS_PER_MINUTE));
}

const clean = (value) => String(value ?? "").trim();

/**
 * Build an interview candidate NDA.
 * @returns {object} draft, or { error }.
 */
export function buildCandidateNda(input) {
  const {
    companyName,
    companyAddress = "",
    candidateName,
    roleTitle,
    interviewDate,
    materials = [],
    termYears = 2,
    deletionDays = 14,
    jurisdictionKey = "india",
    city = "",
    includeTakeHome = true,
    takeHomeHours = 4,
    includeDtsaNotice = false,
  } = input || {};

  const company = clean(companyName);
  const candidate = clean(candidateName);
  const role = clean(roleTitle);

  if (!company) return { error: "Enter the company name." };
  if (!candidate) return { error: "Enter the candidate's name." };
  if (company.toLowerCase() === candidate.toLowerCase()) {
    return { error: "The company and the candidate must be different parties." };
  }
  if (!role) return { error: "Enter the role the candidate is interviewing for." };
  if (parseIsoDate(interviewDate) === null) return { error: "Enter a valid interview date as YYYY-MM-DD." };

  if (!Array.isArray(materials)) return { error: "Materials must be provided as a list." };
  const validIds = new Set(MATERIAL_OPTIONS.map((m) => m.id));
  const chosen = MATERIAL_OPTIONS.filter((m) => materials.includes(m.id) && validIds.has(m.id));
  if (chosen.length === 0) {
    return { error: "Tick at least one thing the candidate will actually be shown — an NDA with no defined scope is hard to enforce and hard to sign." };
  }

  const term = Number(termYears);
  const deletion = Number(deletionDays);
  const hours = Number(takeHomeHours);

  if (!Number.isInteger(term) || term < MIN_TERM_YEARS || term > MAX_TERM_YEARS) {
    return {
      error: `The term must be a whole number of years between ${MIN_TERM_YEARS} and ${MAX_TERM_YEARS} for a hiring-process NDA.`,
    };
  }
  if (!Number.isInteger(deletion) || deletion < MIN_DELETION_DAYS || deletion > MAX_DELETION_DAYS) {
    return {
      error: `The deletion deadline must be a whole number of days between ${MIN_DELETION_DAYS} and ${MAX_DELETION_DAYS}.`,
    };
  }
  if (includeTakeHome && (!Number.isFinite(hours) || hours < 1 || hours > 40)) {
    return { error: "The take-home time limit must be between 1 and 40 hours." };
  }

  const jurisdiction = findJurisdiction(jurisdictionKey);
  const forumCity = clean(city) || jurisdiction.defaultCity;
  const courts = jurisdiction.courts.replace("{city}", forumCity);
  const termEnd = addYearsIso(interviewDate, Math.trunc(term));
  const deletionDeadline = addDaysIso(interviewDate, deletion);

  const materialList = chosen.map((m, index) => `(${String.fromCharCode(97 + index)}) ${m.label.toLowerCase()}`).join(";\n");

  const sections = [];
  const push = (heading, body) => sections.push({ heading, body });

  push(
    "Parties and Purpose",
    `This Candidate Confidentiality Agreement (the "Agreement") is made on ${formatLongDate(interviewDate)} between ${company}${clean(companyAddress) ? `, of ${clean(companyAddress)}` : ""} (the "Company") and ${candidate} (the "Candidate").\n\nThe Candidate is taking part in the Company's hiring process for the role of ${role} (the "Process"). During the Process the Candidate may be shown non-public information about the Company. This Agreement covers only that information. It is not an offer of employment and it does not restrict where the Candidate may work.`,
  );

  push(
    "1. What is Confidential",
    `"Confidential Information" means non-public information the Candidate is shown, told or given access to during the Process, including:\n\n${materialList}.\n\nIt also includes the content of any technical exercise, interview question or assessment, and any credentials or access given for the Process.`,
  );

  push(
    "2. What is Not Confidential",
    `Confidential Information does not include anything that: (a) the Candidate already knew without a duty of confidence; (b) is public, or becomes public other than through the Candidate's breach; (c) the Candidate lawfully learns from someone free to share it; or (d) the Candidate independently works out without using Confidential Information.\n\nGeneral skills, knowledge and industry experience the Candidate gains or already has are not Confidential Information.`,
  );

  push(
    "3. What the Candidate Agrees To",
    `The Candidate shall:\n\n(a) keep Confidential Information private and use it only to take part in the Process;\n(b) not take screenshots, screen recordings, photographs or copies of internal systems, code or documents unless the Company gives written permission;\n(c) not post interview questions, exercises or system details to public repositories, forums, social media or interview-question sites;\n(d) not share Confidential Information with a current or future employer; and\n(e) tell the Company promptly if Confidential Information is disclosed or lost by accident.`,
  );

  let clauseNumber = 4;

  if (includeTakeHome) {
    push(
      `${clauseNumber}. Take-Home Exercise`,
      `Any take-home exercise is expected to take no more than ${hours} hour(s). The Candidate owns the work they produce for it. The Company may use that work only to evaluate the Candidate, and shall not use it in a product, internal system or client deliverable, or share it outside the hiring panel, without a separate written agreement and appropriate payment.\n\nThe Candidate shall not publish the exercise, the brief, or their solution while it remains part of the Company's hiring process, and shall delete any Company data supplied with the exercise once the Process ends.`,
    );
    clauseNumber += 1;
  }

  push(
    `${clauseNumber}. No Offer, No Employment, No Restraint`,
    `Nothing in this Agreement: (a) obliges the Company to make an offer or the Candidate to accept one; (b) creates an employment, worker, agency or contractor relationship; (c) entitles either party to payment; or (d) restricts the Candidate from applying to, interviewing with, or working for any other organisation, including a competitor. This Agreement is not a non-compete and must not be read as one.`,
  );
  clauseNumber += 1;

  push(
    `${clauseNumber}. Protected Disclosures`,
    `Nothing in this Agreement prevents the Candidate from: reporting a suspected breach of law to a regulator, law enforcement or other competent authority; taking legal advice; discussing their own pay, treatment or working conditions where the law protects that discussion; making a disclosure required by law or a court; or responding truthfully to a lawful request from an authority.`,
  );
  clauseNumber += 1;

  if (includeDtsaNotice) {
    push(
      `${clauseNumber}. Trade Secret Immunity Notice`,
      `Notice under the Defend Trade Secrets Act of 2016, 18 U.S.C. § 1833(b): an individual shall not be held criminally or civilly liable under any federal or state trade secret law for disclosing a trade secret that is made in confidence to a government official, directly or indirectly, or to an attorney, solely for the purpose of reporting or investigating a suspected violation of law, or that is made in a document filed under seal in a lawsuit or other proceeding.`,
    );
    clauseNumber += 1;
  }

  push(
    `${clauseNumber}. Deleting Materials`,
    `Within ${deletion} day(s) of the Process ending, however it ends, the Candidate shall delete or return all Confidential Information and any Company materials, files, credentials or datasets in their possession, and shall confirm on request that this has been done. The Candidate may keep their own take-home submission and their own notes about their own performance.`,
  );
  clauseNumber += 1;

  push(
    `${clauseNumber}. How Long This Lasts`,
    `This Agreement takes effect on ${formatLongDate(interviewDate)} and the confidentiality obligations continue for ${term} year(s), until ${formatLongDate(termEnd)}. Information that is a trade secret stays protected for as long as it remains a trade secret under applicable law. If the Candidate is later employed or engaged by the Company, the confidentiality terms of that engagement replace this Agreement from the date it starts.`,
  );
  clauseNumber += 1;

  push(
    `${clauseNumber}. Governing Law`,
    `This Agreement is governed by ${jurisdiction.law}, and the parties submit to the exclusive jurisdiction of ${courts}.`,
  );
  clauseNumber += 1;

  push(
    `${clauseNumber}. General`,
    `This is the entire agreement between the parties about confidentiality in the Process. Any change must be in writing and signed by both. If a provision is unenforceable, the rest still applies. This Agreement may be signed electronically and in counterparts.`,
  );

  push(
    "Signatures",
    `For ${company}\n\nName: ____________________\nTitle: ____________________\nDate: ____________________\n\n\nCandidate\n\n${candidate}\n\nSignature: ____________________\nDate: ____________________`,
  );

  const title = "CANDIDATE CONFIDENTIALITY AGREEMENT";
  const plainText = [title, "", ...sections.map((s) => `${s.heading}\n\n${s.body}`)].join("\n\n");
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const minutes = readingMinutes(wordCount);

  const warnings = [];
  if (wordCount > RECOMMENDED_MAX_WORDS) {
    warnings.push(
      `At ${wordCount} words this runs past the ${RECOMMENDED_MAX_WORDS}-word mark where candidate NDAs start getting signed unread. Consider trimming the scope.`,
    );
  }
  if (materials.includes("personalData")) {
    warnings.push(
      "Showing a candidate real user or employee personal data is a data protection risk in its own right. Anonymised or synthetic data is almost always the better option, and an NDA does not cure an unlawful disclosure.",
    );
  }
  if (materials.includes("customers")) {
    warnings.push(
      "Customer contracts often contain their own confidentiality terms that restrict who may see them. Check before showing them in an interview.",
    );
  }
  if (includeTakeHome && hours > 8) {
    warnings.push(
      `A ${hours}-hour take-home exercise is long enough that many candidates will decline, and long unpaid exercises attract criticism and, in some jurisdictions, scrutiny over whether the work is really unpaid labour.`,
    );
  }
  if (includeDtsaNotice && !jurisdiction.dtsa) {
    warnings.push(
      "The Defend Trade Secrets Act immunity notice is a United States provision. It is harmless elsewhere but adds nothing outside US law.",
    );
  }
  if (!includeDtsaNotice && jurisdiction.dtsa) {
    warnings.push(
      "For US-governed hiring processes, adding the 18 U.S.C. § 1833(b) immunity notice preserves the right to exemplary damages and attorney fees in a later trade secret action.",
    );
  }
  warnings.push(jurisdiction.noncompeteNote);

  return {
    title,
    sections,
    plainText,
    wordCount,
    readingMinutes: minutes,
    clauseCount: sections.length,
    materials: chosen,
    materialCount: chosen.length,
    interviewDateLong: formatLongDate(interviewDate),
    termEnd,
    termEndLong: formatLongDate(termEnd),
    deletionDeadline,
    deletionDeadlineLong: formatLongDate(deletionDeadline),
    jurisdiction: { ...jurisdiction, courts, city: forumCity },
    warnings,
  };
}
