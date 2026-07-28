/**
 * Freelancer / contractor NDA generator — pure document assembly.
 * No React, no DOM, no Date.now(): all dates are arguments.
 *
 * Produces a template. Not legal advice, and not reviewed for any particular
 * jurisdiction or engagement.
 */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MS_PER_DAY = 86400000;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const JURISDICTIONS = [
  {
    key: "india",
    label: "India",
    law: "the laws of India, including the Indian Contract Act, 1872",
    courts: "the courts at {city}, India",
    defaultCity: "Bengaluru",
    dataRegime: "the Digital Personal Data Protection Act, 2023",
    stampDuty: true,
  },
  {
    key: "england",
    label: "England and Wales",
    law: "the laws of England and Wales",
    courts: "the courts of England and Wales sitting in {city}",
    defaultCity: "London",
    dataRegime: "the UK GDPR and the Data Protection Act 2018",
    stampDuty: false,
  },
  {
    key: "eu",
    label: "European Union",
    law: "the laws of {city}",
    courts: "the courts of {city}",
    defaultCity: "Ireland",
    dataRegime: "Regulation (EU) 2016/679 (GDPR)",
    stampDuty: false,
  },
  {
    key: "delaware",
    label: "Delaware, USA",
    law: "the laws of the State of Delaware, without regard to its conflict of laws principles",
    courts: "the state and federal courts located in the State of Delaware",
    defaultCity: "Wilmington",
    dataRegime: "applicable state and federal privacy law",
    stampDuty: false,
  },
  {
    key: "california",
    label: "California, USA",
    law: "the laws of the State of California, without regard to its conflict of laws principles",
    courts: "the state and federal courts located in San Francisco County, California",
    defaultCity: "San Francisco",
    dataRegime: "the California Consumer Privacy Act as amended",
    stampDuty: false,
  },
];

/** How the freelancer may show the work publicly. */
export const PORTFOLIO_OPTIONS = [
  {
    key: "none",
    label: "No portfolio use at all",
    clause:
      "The Contractor shall not display, describe or reference the Deliverables, the Project or the Client's name in any portfolio, case study, social media post, award submission or marketing material.",
  },
  {
    key: "approval",
    label: "Allowed with prior written approval",
    clause:
      "The Contractor may display the Deliverables and name the Client in a portfolio or case study only with the Client's prior written approval of the specific content, which the Client shall not unreasonably withhold. Confidential Information must never be shown, and any approval may be withdrawn on written request.",
  },
  {
    key: "afterLaunch",
    label: "Allowed after public launch",
    clause:
      "Once the Deliverables have been publicly released by the Client, the Contractor may display those publicly released elements and name the Client in a portfolio or case study. Unreleased work, internal metrics, source code and any other Confidential Information may not be shown.",
  },
];

/**
 * Contractual breach-notification deadline. GDPR Article 33 obliges a
 * controller to notify the supervisory authority within 72 hours, so a
 * processor deadline is normally set well inside that.
 */
export const BREACH_NOTICE_HOUR_OPTIONS = [12, 24, 48];
export const GDPR_CONTROLLER_DEADLINE_HOURS = 72;

/** Bounds accepted by the generator. */
export const MIN_SURVIVAL_YEARS = 1;
export const MAX_SURVIVAL_YEARS = 10;
export const MIN_DELETION_DAYS = 1;
export const MAX_DELETION_DAYS = 90;
export const MAX_PROJECT_DAYS = 1095; // three years — beyond this it is not a short project

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

export function daysBetween(startDate, endDate) {
  const a = parseIsoDate(startDate);
  const b = parseIsoDate(endDate);
  if (a === null || b === null) return null;
  return Math.round((b - a) / MS_PER_DAY);
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

export function findPortfolioOption(key) {
  return PORTFOLIO_OPTIONS.find((p) => p.key === key) || PORTFOLIO_OPTIONS[1];
}

const clean = (value) => String(value ?? "").trim();

/**
 * Build a freelancer NDA.
 * @returns {object} draft, or { error }.
 */
export function buildFreelancerNda(input) {
  const {
    clientName,
    clientAddress = "",
    contractorName,
    contractorAddress = "",
    projectName,
    projectScope,
    startDate,
    endDate,
    survivalYears = 3,
    deletionDays = 14,
    jurisdictionKey = "india",
    city = "",
    portfolioKey = "approval",
    assignIp = true,
    allowSubcontractors = false,
    handlesPersonalData = true,
    breachNoticeHours = 24,
    includeNonSolicit = false,
    nonSolicitMonths = 12,
  } = input || {};

  const client = clean(clientName);
  const contractor = clean(contractorName);
  const project = clean(projectName);
  const scope = clean(projectScope);

  if (!client) return { error: "Enter the client's name." };
  if (!contractor) return { error: "Enter the freelancer or contractor's name." };
  if (client.toLowerCase() === contractor.toLowerCase()) {
    return { error: "The client and the contractor must be different parties." };
  }
  if (!project) return { error: "Give the project a name." };
  if (scope.length < 10) return { error: "Describe the project scope in at least ten characters." };
  if (parseIsoDate(startDate) === null) return { error: "Enter a valid project start date as YYYY-MM-DD." };
  if (parseIsoDate(endDate) === null) return { error: "Enter a valid expected end date as YYYY-MM-DD." };

  const projectDays = daysBetween(startDate, endDate);
  if (projectDays === null || projectDays < 0) {
    return { error: "The end date must be on or after the start date." };
  }
  if (projectDays > MAX_PROJECT_DAYS) {
    return { error: `A project running longer than ${MAX_PROJECT_DAYS} days is not a short engagement — use a full services agreement instead.` };
  }

  const survival = Number(survivalYears);
  const deletion = Number(deletionDays);
  const breachHours = Number(breachNoticeHours);
  const solicitMonths = Number(nonSolicitMonths);

  if (!Number.isFinite(survival) || survival < MIN_SURVIVAL_YEARS || survival > MAX_SURVIVAL_YEARS) {
    return { error: `The confidentiality period must be between ${MIN_SURVIVAL_YEARS} and ${MAX_SURVIVAL_YEARS} years.` };
  }
  if (!Number.isFinite(deletion) || deletion < MIN_DELETION_DAYS || deletion > MAX_DELETION_DAYS) {
    return { error: `The deletion deadline must be between ${MIN_DELETION_DAYS} and ${MAX_DELETION_DAYS} days.` };
  }
  if (handlesPersonalData && !BREACH_NOTICE_HOUR_OPTIONS.includes(breachHours)) {
    return { error: `Choose a breach notification deadline of ${BREACH_NOTICE_HOUR_OPTIONS.join(", ")} hours.` };
  }
  if (includeNonSolicit && !NON_SOLICIT_MONTH_OPTIONS.includes(solicitMonths)) {
    return { error: `Choose a non-solicitation period of ${NON_SOLICIT_MONTH_OPTIONS.join(", ")} months.` };
  }

  const jurisdiction = findJurisdiction(jurisdictionKey);
  const forumCity = clean(city) || jurisdiction.defaultCity;
  const courts = jurisdiction.courts.replace("{city}", forumCity);
  const law = jurisdiction.law.replace("{city}", forumCity);
  const portfolio = findPortfolioOption(portfolioKey);

  const deletionDeadline = addDaysIso(endDate, deletion);
  const survivalEnd = addYearsIso(endDate, Math.trunc(survival));

  const sections = [];
  const push = (heading, body) => sections.push({ heading, body });

  push(
    "Parties and Engagement",
    `This Confidentiality and Deliverables Agreement (the "Agreement") is made on ${formatLongDate(startDate)} between:\n\n(1) ${client}${clientAddress ? `, of ${clean(clientAddress)}` : ""} (the "Client"); and\n\n(2) ${contractor}${contractorAddress ? `, of ${clean(contractorAddress)}` : ""} (the "Contractor").\n\nThe Client is engaging the Contractor as an independent contractor on the project known as "${project}" (the "Project"), expected to run from ${formatLongDate(startDate)} to ${formatLongDate(endDate)} (${projectDays} day(s)).`,
  );

  push(
    "1. Scope of the Project",
    `The Project comprises: ${scope}.\n\nThe Contractor will receive Confidential Information and will create Deliverables solely in connection with the Project, and for no other purpose.`,
  );

  push(
    "2. Confidential Information",
    `"Confidential Information" means any non-public information the Contractor receives, accesses or observes in connection with the Project, in any form, including: product plans and roadmaps, unreleased designs and copy, source code and repositories, credentials and API keys, infrastructure and system architecture, analytics and revenue figures, pricing, customer and user data, supplier terms, internal communications, and the terms and existence of this engagement.\n\nAccess credentials are Confidential Information in every case and must never be shared, stored in plain text, or reused outside systems approved by the Client.`,
  );

  push(
    "3. Exclusions",
    `Confidential Information does not include information that the Contractor can show by written record: (a) was already lawfully known to the Contractor without a duty of confidence; (b) is or becomes public other than through breach of this Agreement; (c) is lawfully received from a third party free to disclose it; or (d) is independently developed without use of the Confidential Information.\n\nNothing in this Agreement prevents disclosure required by law or by a court or regulator, provided the Contractor gives the Client prompt written notice where legally permitted and discloses only what is required.`,
  );

  push(
    "4. Handling and Security",
    `The Contractor shall:\n\n(a) use Confidential Information only to perform the Project;\n(b) keep it on devices protected by full-disk encryption, a screen lock and up-to-date security patches;\n(c) enable multi-factor authentication on every account used for the Project, and store credentials in a password manager rather than in files, notes or chat history;\n(d) not upload Confidential Information to personal cloud storage, personal email, or any third-party service — including artificial intelligence or code-assistance services that retain or train on submitted content — unless the Client has approved that service in writing;\n(e) not work on Confidential Information on shared, public or unmanaged computers; and\n(f) notify the Client in writing without delay on discovering any actual or suspected loss, unauthorised access or disclosure.`,
  );

  push(
    "5. Deliverables",
    `"Deliverables" means all work product created by the Contractor for the Project, including designs, code, copy, data, documentation, drafts, working files and source files, whether or not delivered to the Client.\n\nThe Deliverables and any drafts or working files are treated as Confidential Information of the Client until the Client publicly releases them. The Contractor shall not reuse the Deliverables, or any distinctive part of them, for another client or for the Contractor's own products.`,
  );

  let clauseNumber = 6;
  if (assignIp) {
    push(
      `${clauseNumber}. Ownership of the Deliverables`,
      `On creation, and to the extent permitted by law, all right, title and interest in the Deliverables — including copyright, design rights, database rights and any other intellectual property — vests in the Client. To the extent any right does not vest automatically, the Contractor assigns it to the Client with full title guarantee, and shall sign any document reasonably required to give effect to or record that assignment.\n\nThe Contractor retains ownership of any pre-existing tools, libraries, frameworks and components created before or outside the Project ("Contractor Background IP"), and grants the Client a perpetual, worldwide, irrevocable, royalty-free, sub-licensable licence to use, modify and distribute Contractor Background IP to the extent it is embedded in the Deliverables.\n\nThe Contractor waives, to the extent permitted by applicable law, any moral rights in the Deliverables.`,
    );
    clauseNumber += 1;

    push(
      `${clauseNumber}. Third-Party and Open-Source Materials`,
      `The Contractor shall not incorporate any third-party or open-source material into the Deliverables without first disclosing it to the Client in writing, together with its licence. The Contractor shall not incorporate any material under a licence that would require the Client to disclose, license or make freely available any of its own source code, without the Client's prior written consent.\n\nThe Contractor warrants that the Deliverables are the Contractor's original work except for materials disclosed under this clause, and that they do not knowingly infringe the rights of any third party.`,
    );
    clauseNumber += 1;
  }

  push(
    `${clauseNumber}. Portfolio and Publicity`,
    portfolio.clause,
  );
  clauseNumber += 1;

  if (allowSubcontractors) {
    push(
      `${clauseNumber}. Subcontractors`,
      `The Contractor may engage a subcontractor to assist on the Project only with the Client's prior written consent. Before any Confidential Information is shared, the Contractor shall put the subcontractor under written confidentiality and intellectual property obligations at least as protective as those in this Agreement, and shall procure any assignment needed for clause obligations above to be met. The Contractor remains fully responsible to the Client for the acts and omissions of every subcontractor.`,
    );
    clauseNumber += 1;
  } else {
    push(
      `${clauseNumber}. No Subcontracting`,
      `The Contractor shall perform the Project personally and shall not subcontract, delegate or share any part of it, or any Confidential Information, without the Client's prior written consent.`,
    );
    clauseNumber += 1;
  }

  if (handlesPersonalData) {
    push(
      `${clauseNumber}. Personal Data`,
      `Where the Contractor processes personal data on the Client's behalf, the Contractor acts only on the Client's documented instructions and shall: process no more personal data than the Project requires; apply appropriate technical and organisational security measures; keep it separate from the Contractor's own records; not transfer it outside the agreed territory without the Client's written consent; and delete or return it in accordance with the deletion clause below.\n\nThe Contractor shall notify the Client of any personal data breach within ${breachHours} hour(s) of becoming aware of it, with enough detail for the Client to meet its own notification duties under ${jurisdiction.dataRegime}. A separate data processing agreement may be required in addition to this Agreement.`,
    );
    clauseNumber += 1;
  }

  push(
    `${clauseNumber}. Return and Deletion`,
    `Within ${deletion} day(s) of the end of the Project — that is by ${formatLongDate(deletionDeadline)} on the expected timeline — the Contractor shall deliver to the Client all Deliverables including editable source files, return or securely delete all Confidential Information, remove it from every device, repository, cloud account and backup within the Contractor's control, revoke or hand back all credentials, and confirm in writing that this has been done.\n\nThe Contractor may retain one archival copy only where required by law, which remains subject to this Agreement while retained.`,
  );
  clauseNumber += 1;

  push(
    `${clauseNumber}. Term and Survival`,
    `This Agreement takes effect on ${formatLongDate(startDate)} and applies to all Confidential Information disclosed before, during or after the Project. The confidentiality obligations continue for ${survival} year(s) after the end of the Project, that is until ${formatLongDate(survivalEnd)} on the expected timeline. Obligations relating to ownership of the Deliverables, and to information that is a trade secret, continue for as long as the law allows.`,
  );
  clauseNumber += 1;

  push(
    `${clauseNumber}. Independent Contractor`,
    `The Contractor is an independent contractor and not an employee, worker, partner or agent of the Client. The Contractor is responsible for their own taxes, social contributions, insurance and equipment. Nothing in this Agreement creates an exclusive relationship, and the Contractor may work for others provided doing so does not breach the confidentiality obligations here.`,
  );
  clauseNumber += 1;

  if (includeNonSolicit) {
    push(
      `${clauseNumber}. Non-Solicitation`,
      `For ${solicitMonths} month(s) after the end of the Project, the Contractor shall not knowingly solicit business from any customer of the Client that the Contractor first learned of through Confidential Information, in relation to services substantially similar to the Project. This clause does not restrict the Contractor from working in the same field, from responding to approaches not induced by the Contractor, or from serving clients the Contractor already had.`,
    );
    clauseNumber += 1;
  }

  push(
    `${clauseNumber}. Remedies`,
    `The Contractor acknowledges that damages alone may not adequately remedy a breach of this Agreement and that the Client may seek injunctive or other equitable relief in addition to any other remedy. Nothing in this clause limits the Contractor's right to be paid for work properly performed; the Client's payment obligations are not conditional on this Agreement.`,
  );
  clauseNumber += 1;

  push(
    `${clauseNumber}. Governing Law and Jurisdiction`,
    `This Agreement and any dispute arising out of or in connection with it are governed by ${law}, and the Parties submit to the exclusive jurisdiction of ${courts}.`,
  );
  clauseNumber += 1;

  push(
    `${clauseNumber}. General`,
    `(a) This Agreement is the entire agreement on its subject matter and supersedes prior discussions, but does not replace any separate statement of work or services agreement between the Parties, which governs scope, fees and timelines.\n(b) Any variation must be in writing and signed by both Parties.\n(c) If any provision is unenforceable, the rest continues in force.\n(d) A failure to enforce a right is not a waiver of it.\n(e) Neither Party may assign this Agreement without the other's written consent, except to a successor of its business.\n(f) This Agreement may be signed in counterparts, including electronically.`,
  );

  push(
    "Signatures",
    `Client\n\n${client}\n\nName: ____________________\nTitle: ____________________\nDate: ____________________\n\n\nContractor\n\n${contractor}\n\nName: ____________________\nDate: ____________________`,
  );

  const title = "FREELANCER CONFIDENTIALITY AND DELIVERABLES AGREEMENT";
  const plainText = [title, "", ...sections.map((s) => `${s.heading}\n\n${s.body}`)].join("\n\n");
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  const warnings = [];
  if (!assignIp) {
    warnings.push(
      "Intellectual property assignment is switched off, so copyright in the deliverables stays with the contractor by default in most jurisdictions. The client would only get whatever licence is agreed elsewhere.",
    );
  }
  if (handlesPersonalData) {
    warnings.push(
      `Under GDPR-style regimes the controller must notify the supervisory authority within ${GDPR_CONTROLLER_DEADLINE_HOURS} hours of becoming aware of a personal data breach, so a ${breachHours}-hour processor deadline leaves the client ${GDPR_CONTROLLER_DEADLINE_HOURS - breachHours} hours to act. A separate data processing agreement is usually required as well.`,
    );
  }
  if (portfolio.key === "none") {
    warnings.push(
      "A blanket portfolio ban is a real cost to a freelancer and is often negotiated. Consider allowing use after public launch instead.",
    );
  }
  if (jurisdiction.stampDuty) {
    warnings.push(
      "In India, agreements attract stamp duty under the Indian Stamp Act, 1899 as adapted by the relevant state Act. Check the applicable rate before signing.",
    );
  }
  if (projectDays === 0) {
    warnings.push("Start and end dates are the same day. Check the expected timeline is right.");
  }

  return {
    title,
    sections,
    plainText,
    wordCount,
    clauseCount: sections.length,
    projectDays,
    deletionDeadline,
    deletionDeadlineLong: formatLongDate(deletionDeadline),
    survivalEnd,
    survivalEndLong: formatLongDate(survivalEnd),
    startDateLong: formatLongDate(startDate),
    endDateLong: formatLongDate(endDate),
    jurisdiction: { ...jurisdiction, law, courts, city: forumCity },
    portfolio,
    warnings,
  };
}
