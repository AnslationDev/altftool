/**
 * Company Social Media Policy Generator.
 *
 * The failure mode of a social media policy is not that it says too little —
 * it is that it says too much, and becomes unenforceable. This module assembles
 * a policy from clauses tied to identifiable rules, works out which clauses a
 * given company profile actually needs, and scores what is missing.
 *
 * The rules the clauses rest on:
 *  - National Labor Relations Act, Section 7 (United States): employees have
 *    the right to engage in concerted activity for mutual aid or protection,
 *    which includes discussing pay, hours and working conditions in public.
 *    In Stericycle, Inc. (2023) the NLRB adopted the standard that a facially
 *    neutral work rule is presumptively unlawful where it has a reasonable
 *    tendency to chill employees from exercising Section 7 rights, read from
 *    the perspective of an economically dependent employee. A blanket ban on
 *    discussing the company online is the classic example, which is why the
 *    savings clause is treated as required for US employers.
 *  - FTC Endorsement Guides, 16 CFR Part 255: a material connection between an
 *    endorser and the brand — including employment — must be disclosed clearly
 *    and conspicuously when an employee posts about the employer's products.
 *  - Regulation FD (17 CFR 243) and insider-trading law: for listed companies,
 *    selective disclosure of material non-public information through a social
 *    channel is a securities problem, not a marketing one.
 *  - GDPR (Regulation (EU) 2016/679) and India's Digital Personal Data
 *    Protection Act 2023: posting identifiable personal data of colleagues,
 *    customers or patients without a lawful basis is a data-protection breach.
 *  - Information Technology Act 2000 and the Information Technology
 *    (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 in
 *    India, together with the law of defamation in every jurisdiction.
 *
 * Informational template only. A policy that will be relied on in a
 * disciplinary process should be reviewed by employment counsel in each
 * jurisdiction where staff are employed.
 */

/** Default months between policy reviews. */
export const DEFAULT_REVIEW_MONTHS = 12;
const MAX_REVIEW_MONTHS = 60;
const MAX_FIELD = 120;

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

/** Profile switches that make particular clauses necessary. */
export const PROFILE_TAGS = [
  { id: "us", label: "Employs people in the United States" },
  { id: "eu", label: "Employs people in the EU / UK" },
  { id: "india", label: "Employs people in India" },
  { id: "public", label: "Listed company or preparing to list" },
  { id: "advocacy", label: "Runs an employee advocacy or ambassador programme" },
  { id: "regulated", label: "Regulated sector (finance, health, legal, insurance)" },
];

/**
 * The clauses. `requiredFor` lists profile tags that make a clause necessary;
 * `always: true` means every policy needs it. `weight` is how heavily a gap
 * counts against the coverage score.
 */
export const CLAUSES = [
  {
    id: "purpose",
    title: "Purpose and who this applies to",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "This policy applies to everyone working for {{company}} — employees, contractors and interns — whenever they post about the company, its people, its customers or its work. It applies to public posts and to posts in groups and channels that are not genuinely private. It does not apply to purely personal posts that make no reference to {{company}} or its business.",
  },
  {
    id: "personal-official",
    title: "Personal accounts versus official accounts",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "Official {{company}} accounts are operated only by people the company has authorised in writing. On a personal account you speak for yourself. If your account identifies you as working at {{company}}, add a line to your bio making clear that your views are your own, and do not present a personal post as an official company statement.",
  },
  {
    id: "section7",
    title: "Your rights are not restricted by this policy",
    always: false,
    requiredFor: ["us"],
    weight: 3,
    body: "Nothing in this policy restricts, and nothing in it should be read as restricting, the right of employees to communicate about pay, hours, benefits, safety and other terms and conditions of employment, or to act together for mutual aid or protection. In the United States those rights are protected by Section 7 of the National Labor Relations Act, and they apply whether or not employees are represented by a union. Where any part of this policy conflicts with that right, the right prevails.",
  },
  {
    id: "disclosure",
    title: "Disclose that you work here",
    // Unlike the clauses above, this one is genuinely conditional: the FTC's
    // jurisdiction is US-specific, and an advocacy/ambassador programme is
    // the scenario where employees systematically post about the employer's
    // products at scale. `always: true` here would make `requiredFor`
    // permanently unreachable (see requiredClauses()) and defeat the
    // "advocacy" profile checkbox entirely.
    always: false,
    requiredFor: ["advocacy", "us"],
    weight: 3,
    body: "If you post about {{company}}'s products, services, customers or competitors, say that you work for {{company}}. Put the disclosure in the post itself — an unambiguous phrase such as \"I work at {{company}}\" or a clear #employee tag near the start — not in a bio or a linked page. The FTC's Endorsement Guides at 16 CFR Part 255 treat employment as a material connection that must be disclosed clearly and conspicuously, and the disclosure must travel with the post if it is shared or embedded. This applies equally to reviews, ratings and comments.",
  },
  {
    id: "confidentiality",
    title: "Confidential information stays off social media",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "Do not post confidential or commercially sensitive information: unreleased products and features, roadmaps, pricing not yet public, security details, contract terms, customer lists, internal metrics, or anything covered by an NDA. Photographs taken inside the office count — check whiteboards, screens and passes before posting. If you are unsure whether something is public, treat it as confidential and ask first.",
  },
  {
    id: "mnpi",
    title: "Material non-public information and quiet periods",
    always: false,
    requiredFor: ["public"],
    weight: 3,
    body: "{{company}} is subject to securities rules on selective disclosure. Never post about results, forecasts, mergers, acquisitions, large contracts or anything else that could be material to an investor before it has been announced through the company's official channels. Regulation FD treats a selective disclosure through a social channel as a disclosure. During a quiet period, do not discuss company performance at all, including in replies and reposts.",
  },
  {
    id: "personal-data",
    title: "Other people's personal data",
    always: false,
    requiredFor: ["eu", "india"],
    weight: 3,
    body: "Do not post identifiable information about colleagues, customers or members of the public without their consent — names, images, voices, health details, addresses or anything that identifies them indirectly. Processing personal data requires a lawful basis under the GDPR, and under India's Digital Personal Data Protection Act 2023 personal data may be processed only for a lawful purpose with consent or another permitted ground. Remove and report any post that exposes someone's data by accident.",
  },
  {
    id: "customers",
    title: "Talking about customers and partners",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "Never name a customer or partner in a post without their written permission, and never discuss the details of work done for them. Complaints about {{company}} that appear publicly should be passed to the team that owns the relationship rather than answered ad hoc from a personal account.",
  },
  {
    id: "respect",
    title: "Harassment, discrimination and respect",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "Harassment, discriminatory abuse, threats and bullying directed at colleagues, customers or anyone else are prohibited whether they occur at work or on a personal account, and the company's anti-harassment policy applies in full. Disagreeing publicly and in good faith with a decision is not harassment; targeting an individual is.",
  },
  {
    id: "authorised",
    title: "Who may speak for the company",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "Press enquiries, regulatory questions, legal threats and anything involving an incident go to {{spokesperson}}. Do not respond on the company's behalf, and do not confirm or deny an incident, even in a reply. Forwarding the question is always the right answer.",
  },
  {
    id: "india-law",
    title: "Indian law obligations",
    always: false,
    requiredFor: ["india"],
    weight: 2,
    body: "Posts must comply with the Information Technology Act 2000 and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and must not be obscene, defamatory, or an infringement of another person's privacy or intellectual property. Content that is unlawful under Indian law does not become acceptable because it was posted from a personal account.",
  },
  {
    id: "regulated",
    title: "Regulated communications and record-keeping",
    always: false,
    requiredFor: ["regulated"],
    weight: 3,
    body: "Because {{company}} operates in a regulated sector, any post that could be read as advice, a recommendation, a performance claim or a solicitation must be pre-approved by the compliance team, and approved posts must be retained in the company's records along with any edits. Do not give individual advice in replies or direct messages.",
  },
  {
    id: "accuracy",
    title: "Accuracy, AI-generated content and corrections",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "Check claims before posting, and do not present AI-generated text, images or video as authentic material without saying so. If you get something wrong, correct it visibly rather than deleting quietly — an edited or replied-to correction preserves the record and reads better than a disappearance.",
  },
  {
    id: "incident",
    title: "When a post goes wrong",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "Tell {{spokesperson}} as soon as you realise a post has created a problem, before deleting anything. Screenshot the post and the responses first, since deletion often accelerates the spread. The company's first concern is fixing the problem, not finding fault.",
  },
  {
    id: "monitoring",
    title: "What the company does and does not monitor",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "{{company}} monitors public mentions of its own brand for support and reputation purposes. It does not require access to personal accounts, does not ask for passwords, and does not monitor private messages. Where a public post is reviewed in a disciplinary context, the employee will be told and shown the material.",
  },
  {
    id: "enforcement",
    title: "How this policy is applied",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "Breaches are handled under the normal disciplinary procedure and proportionately: most issues are resolved with a conversation. Serious cases — disclosing confidential information, harassment, or knowingly posting false statements about the company or its people — may lead to dismissal. Questions about this policy go to {{spokesperson}} before posting, not after.",
  },
];

const CLAUSE_BY_ID = new Map(CLAUSES.map((clause) => [clause.id, clause]));

function clean(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

/**
 * Parse yyyy-mm-dd into a UTC-midnight timestamp, or null.
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
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return stamp;
}

function formatStamp(stamp) {
  const date = new Date(stamp);
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * Add whole calendar months, clamping to the end of the target month.
 * @param {number} stamp
 * @param {number} months
 * @returns {number}
 */
export function addMonths(stamp, months) {
  const date = new Date(stamp);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const lastDayOfTarget = new Date(Date.UTC(year, month + months + 1, 0)).getUTCDate();
  return Date.UTC(year, month + months, Math.min(day, lastDayOfTarget));
}

/**
 * Which clauses this profile needs.
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
 * Assemble the policy and score its coverage.
 *
 * Coverage = weight of required clauses included / total weight of required
 * clauses, as a whole percentage. Optional clauses that are included do not
 * inflate the score.
 *
 * @param {object} input
 * @param {string} input.companyName
 * @param {string} input.spokesperson   Who owns escalations (team or role).
 * @param {string} input.effectiveDate  yyyy-mm-dd.
 * @param {number} input.reviewMonths   Months until the next review.
 * @param {string[]} input.profileTags  Ids from PROFILE_TAGS.
 * @param {string[]} input.includedIds  Clause ids to include.
 * @returns {{policy:string, coveragePercent:number, missing:object[], included:object[],
 *            optionalIncluded:object[], reviewByLong:string, wordCount:number}|{error:string}}
 */
export function buildSocialMediaPolicy({
  companyName,
  spokesperson,
  effectiveDate,
  reviewMonths = DEFAULT_REVIEW_MONTHS,
  profileTags = [],
  includedIds = [],
}) {
  if (!Array.isArray(profileTags) || !Array.isArray(includedIds)) {
    return { error: "Profile and clause selections must be given as lists." };
  }
  const unknown = includedIds.find((id) => !CLAUSE_BY_ID.has(id));
  if (unknown) return { error: `Unknown clause: ${unknown}.` };

  const company = clean(companyName);
  const owner = clean(spokesperson);
  if (!company) return { error: "Enter the company name the policy is written for." };
  if (!owner) return { error: "Enter who owns escalations — a team or a role, not a personal name." };
  if (company.length > MAX_FIELD || owner.length > MAX_FIELD) {
    return { error: `Keep the company and escalation owner fields under ${MAX_FIELD} characters.` };
  }

  const effective = parseIsoDate(effectiveDate);
  if (effective === null) return { error: "Enter a valid effective date." };

  const months = Number(reviewMonths);
  if (!Number.isFinite(months) || !Number.isInteger(months) || months < 1 || months > MAX_REVIEW_MONTHS) {
    return { error: `The review interval must be a whole number of months between 1 and ${MAX_REVIEW_MONTHS}.` };
  }

  const required = requiredClauses(profileTags);
  const requiredIds = new Set(required.map((clause) => clause.id));
  const included = CLAUSES.filter((clause) => includedIds.includes(clause.id));
  if (included.length === 0) {
    return { error: "Include at least one clause — an empty policy is worse than none." };
  }

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
        ? "Every social media policy needs this clause."
        : `Needed because of: ${clause.requiredFor
            .filter((tag) => profileTags.includes(tag))
            .map((tag) => PROFILE_TAGS.find((p) => p.id === tag)?.label ?? tag)
            .join("; ")}.`,
    }));

  const optionalIncluded = included.filter((clause) => !requiredIds.has(clause.id));

  const fill = (text) => text.split("{{company}}").join(company).split("{{spokesperson}}").join(owner);

  const reviewStamp = addMonths(effective, months);

  const lines = [
    `${company} — Social Media Policy`,
    `Effective ${formatStamp(effective)}. Next review due ${formatStamp(reviewStamp)}.`,
    "",
  ];
  included.forEach((clause, index) => {
    lines.push(`${index + 1}. ${clause.title}`);
    lines.push(fill(clause.body));
    lines.push("");
  });
  lines.push(
    `Questions about anything in this policy go to ${owner} before you post. This policy will be reviewed by ${formatStamp(reviewStamp)}.`,
  );

  const policy = lines.join("\n");
  const wordCount = policy.split(/\s+/).filter(Boolean).length;

  return {
    policy,
    coveragePercent,
    missing,
    included: included.map((clause) => ({ id: clause.id, title: clause.title })),
    optionalIncluded: optionalIncluded.map((clause) => ({ id: clause.id, title: clause.title })),
    reviewByLong: formatStamp(reviewStamp),
    wordCount,
  };
}
