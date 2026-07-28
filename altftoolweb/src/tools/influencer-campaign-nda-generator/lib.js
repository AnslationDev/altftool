/**
 * Influencer Campaign NDA Generator.
 *
 * A creator NDA has two jobs that pull against each other: keep an unreleased
 * product secret until the embargo lifts, and stay inside the rules that
 * protect a creator's ability to disclose the commercial relationship and to
 * say what they honestly think. An NDA that fails the second job is not
 * "stronger" — parts of it are void, and the brand carries the regulatory risk.
 *
 * Rules the clauses rest on:
 *  - Defend Trade Secrets Act, 18 U.S.C. section 1833(b): a notice of immunity
 *    for confidential disclosure to a government official or an attorney solely
 *    to report a suspected violation of law must appear in any contract
 *    governing the use of a trade secret that is entered into with an employee,
 *    which the statute defines to include a contractor or consultant. Without
 *    the notice the owner cannot recover exemplary damages or attorney fees
 *    under 18 U.S.C. section 1836 in an action against that person.
 *  - FTC Endorsement Guides, 16 CFR Part 255: a material connection between a
 *    creator and a brand — payment, free product, or any other incentive — must
 *    be disclosed clearly and conspicuously. A confidentiality term cannot be
 *    used to suppress that disclosure.
 *  - Consumer Review Fairness Act of 2016, 15 U.S.C. section 45b: a term in a
 *    form contract is void if it restricts an individual's ability to review
 *    goods or services they received, or imposes a penalty for doing so. This
 *    bites hardest where product is gifted rather than lent.
 *  - EU Unfair Commercial Practices Directive 2005/29/EC: failing to identify
 *    the commercial intent of a post is a misleading omission, so the same
 *    disclosure carve-out is needed for EU and UK creators.
 *  - GDPR, Regulation (EU) 2016/679, and India's Digital Personal Data
 *    Protection Act 2023: campaign material that identifies people needs a
 *    lawful basis, so the NDA should not be the only document that touches it.
 *  - California Civil Code section 1670.11 and Code of Civil Procedure section
 *    1001 (the "Silenced No More" amendments): a term that stops someone
 *    testifying about, or disclosing, unlawful acts in the workplace is void
 *    as against public policy.
 *
 * Informational template only, not legal advice. Have counsel in the creator's
 * jurisdiction review anything you intend to enforce.
 */

/** Default confidentiality tail in years, measured from the effective date. */
export const DEFAULT_CONFIDENTIALITY_YEARS = 3;
/** Trade-secret protection is not time-limited the way ordinary confidences are. */
export const MAX_CONFIDENTIALITY_YEARS = 10;
const MIN_CONFIDENTIALITY_YEARS = 1;
const MAX_FIELD = 140;
const MS_PER_DAY = 86400000;

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

/** Campaign facts that make particular clauses necessary. */
export const PROFILE_TAGS = [
  { id: "us", label: "Creator is based in the United States" },
  { id: "eu", label: "Creator is based in the EU or UK" },
  { id: "india", label: "Creator is based in India" },
  { id: "gifted", label: "Creator keeps the product (gifted or seeded)" },
  { id: "paid", label: "Creator is paid a fee for the campaign" },
  { id: "agency", label: "A manager, agency or editor is involved" },
  { id: "prototype", label: "Pre-production hardware or prototype is shipped" },
  { id: "personal-data", label: "Creator will handle customer or staff personal data" },
];

/**
 * Clause library. `always` means every campaign NDA needs it; `requiredFor`
 * lists profile tags that make an otherwise optional clause necessary.
 * `weight` is how heavily a gap counts against the coverage score.
 */
export const CLAUSES = [
  {
    id: "parties",
    title: "Parties and purpose",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "This agreement is made between {{brand}} (the Disclosing Party) and {{creator}} (the Receiving Party) for the purpose of evaluating and producing content about {{product}} before it is announced. It covers everything shared for that purpose, in any form, from the effective date onward.",
  },
  {
    id: "definition",
    title: "What counts as confidential information",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "Confidential Information means anything {{brand}} shares about {{product}} that is not already public: the product itself, its name, appearance, specifications, pricing, packaging, firmware, launch date, marketing plans, briefs, scripts, asset files, sales forecasts and the existence of this collaboration. It includes information shared verbally, on a call, in a group chat, or by being shown the product in person.",
  },
  {
    id: "exclusions",
    title: "What is not confidential",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "Nothing is confidential if it is already public through no fault of the Receiving Party, becomes public later through no fault of the Receiving Party, was already known to the Receiving Party without a duty of confidence, is independently developed without using the Confidential Information, or is rightfully obtained from a third party who is free to share it. These are the standard exclusions and they apply automatically — the Receiving Party does not have to ask.",
  },
  {
    id: "obligations",
    title: "How the information must be handled",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "The Receiving Party will use the Confidential Information only to plan, shoot and publish the agreed content, will keep it at least as carefully as their own confidential material, and will not post, stream, describe, tease, or hint at it before the embargo lifts. Unreleased product must not appear in the background of unrelated posts, in stories, in behind-the-scenes footage, or in a live stream. Draft content about {{product}} must not be shared publicly or with third parties before approval.",
  },
  {
    id: "embargo",
    title: "Embargo and release timing",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "The embargo lifts on {{launchLong}}, which is {{embargoDays}} days after the effective date of this agreement. Nothing about {{product}} may be published before that moment. If {{brand}} moves the date it will confirm the change in writing; a rumour, a leak elsewhere, or another creator posting early does not lift the embargo.",
  },
  {
    id: "term",
    title: "How long the duty lasts",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "The duty of confidence runs until {{confidentialityEndLong}} for ordinary Confidential Information. Information that qualifies as a trade secret stays protected for as long as it remains a trade secret. Once {{product}} is publicly launched, the parts of the Confidential Information that {{brand}} itself makes public stop being confidential.",
  },
  {
    id: "disclosure-carveout",
    title: "This agreement never blocks required advertising disclosure",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "Nothing in this agreement prevents, and nothing in it may be read as preventing, the Receiving Party from disclosing that this is a paid or incentivised collaboration. The FTC's Endorsement Guides at 16 CFR Part 255 require a material connection — payment, free product or any other incentive — to be disclosed clearly and conspicuously in the post itself, and the EU Unfair Commercial Practices Directive treats hiding commercial intent as a misleading omission. Where the confidentiality terms and the disclosure obligation appear to conflict, the disclosure obligation wins.",
  },
  {
    id: "honest-review",
    title: "Honest opinion is not restricted",
    always: false,
    requiredFor: ["gifted", "us"],
    weight: 3,
    body: "This agreement does not require a positive review and does not restrict the Receiving Party from stating an honest opinion of {{product}} once the embargo has lifted. Under the Consumer Review Fairness Act of 2016, 15 U.S.C. section 45b, a term in a form contract that restricts a person's ability to review goods or services they have received, or that penalises them for doing so, is void. {{brand}} may ask for accuracy corrections; it may not require approval of the opinion.",
  },
  {
    id: "dtsa",
    title: "Trade secret immunity notice",
    always: false,
    requiredFor: ["us"],
    weight: 3,
    body: "Notice under 18 U.S.C. section 1833(b): an individual is not criminally or civilly liable under any federal or state trade secret law for disclosing a trade secret in confidence to a federal, state or local government official, or to an attorney, solely for the purpose of reporting or investigating a suspected violation of law, or in a complaint or other document filed under seal in a lawsuit or other proceeding. An individual who sues for retaliation for reporting a suspected violation of law may disclose the trade secret to their attorney and use it in the proceeding, provided any document containing it is filed under seal and it is not disclosed except by court order.",
  },
  {
    id: "unlawful-conduct",
    title: "Nothing here silences a report of unlawful conduct",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "Nothing in this agreement prevents the Receiving Party from reporting a suspected criminal offence, a safety defect, harassment, discrimination or any other unlawful act to a regulator, a law-enforcement body or a lawyer, or from responding truthfully to a lawful request from a court or regulator. California Civil Code section 1670.11 and Code of Civil Procedure section 1001 make terms that purport to do so void, and this clause is included regardless of governing law.",
  },
  {
    id: "agency",
    title: "Managers, agencies and editors",
    always: false,
    requiredFor: ["agency"],
    weight: 3,
    body: "The Receiving Party may share Confidential Information with a manager, agent, editor or crew member only where that person needs it to deliver the content, has been told it is confidential, and is bound by obligations at least as strict as these. The Receiving Party remains responsible for what those people do with it. Send {{brand}} the list of people who will see {{product}} before the shoot.",
  },
  {
    id: "hardware",
    title: "Prototype hardware, security and return",
    always: false,
    requiredFor: ["prototype"],
    weight: 3,
    body: "Pre-production units stay the property of {{brand}}. Do not open, disassemble, benchmark against competitors, install unofficial firmware on, or lend the unit to anyone. Keep it out of sight of housemates, guests and delivery couriers, and store it locked when not in use. Return the unit and its packaging within {{returnDays}} days of the embargo lifting or on written request, whichever comes first, and confirm return in writing.",
  },
  {
    id: "return",
    title: "Return or destruction of material",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "On written request, or within {{returnDays}} days of the campaign ending, the Receiving Party will return or permanently delete briefs, asset files, unreleased artwork, pricing sheets and any copies, including cloud backups and phone camera rolls, and will confirm this in writing. Published content is not affected, and the Receiving Party may keep one copy where a law or platform record-keeping rule requires it.",
  },
  {
    id: "personal-data",
    title: "Personal data in campaign material",
    always: false,
    requiredFor: ["personal-data", "eu", "india"],
    weight: 2,
    body: "If campaign material contains personal data — customer names, staff faces, voices, contact details or usage records — the Receiving Party will use it only for this campaign, will not copy it elsewhere, and will delete it at the end. Processing personal data requires a lawful basis under the GDPR, and under India's Digital Personal Data Protection Act 2023 personal data may be processed only for a lawful purpose on consent or another permitted ground. An NDA is not a lawful basis on its own; a separate data agreement may be needed.",
  },
  {
    id: "consideration",
    title: "Consideration",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "In exchange for these obligations the Receiving Party receives {{consideration}}. Both parties agree this is good and sufficient consideration for the agreement.",
  },
  {
    id: "remedies",
    title: "What happens if the embargo breaks",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "A leak cannot be undone with money alone, so {{brand}} may seek an injunction or other equitable relief in addition to any other remedy, without having to post a bond where the law allows. An accidental disclosure must be reported to {{brand}} immediately, before deleting anything, so the response can be coordinated.",
  },
  {
    id: "no-licence",
    title: "No licence, no obligation to proceed",
    always: true,
    requiredFor: [],
    weight: 1,
    body: "Nothing here transfers ownership of, or grants a licence to, {{brand}}'s trademarks, designs or other intellectual property beyond what the campaign brief allows, and nothing obliges either party to enter the campaign, to publish, or to pay anything not agreed separately in writing.",
  },
  {
    id: "governing-law",
    title: "Governing law and signatures",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "This agreement is governed by the laws of {{jurisdiction}} and the courts of {{jurisdiction}} have jurisdiction over disputes about it. It is the entire agreement about confidentiality for this campaign and can only be changed in writing signed by both parties. If any clause is unenforceable the rest still applies.",
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
 * Add whole calendar years, clamping 29 February to 28 February.
 * @param {number} stamp UTC-midnight timestamp.
 * @param {number} years
 * @returns {number}
 */
export function addYears(stamp, years) {
  const date = new Date(stamp);
  const year = date.getUTCFullYear() + years;
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Date.UTC(year, month, Math.min(day, lastDay));
}

/**
 * Whole days between two UTC-midnight timestamps.
 * @param {number} from
 * @param {number} to
 * @returns {number}
 */
export function daysBetween(from, to) {
  return Math.round((to - from) / MS_PER_DAY);
}

/**
 * Clauses this campaign profile needs.
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
 * Assemble the NDA and score its coverage.
 *
 * Coverage = weight of required clauses included / total weight of required
 * clauses, as a whole percentage. Optional extras do not inflate the score.
 *
 * @param {object} input
 * @param {string} input.brandName
 * @param {string} input.creatorName
 * @param {string} input.productName
 * @param {string} input.jurisdiction
 * @param {string} input.effectiveDate yyyy-mm-dd
 * @param {string} input.launchDate    yyyy-mm-dd, when the embargo lifts
 * @param {number} input.confidentialityYears
 * @param {number} input.returnDays
 * @param {string[]} input.profileTags Ids from PROFILE_TAGS
 * @param {string[]} input.includedIds Clause ids to include
 * @returns {{agreement:string, coveragePercent:number, missing:object[], warnings:string[],
 *            embargoDays:number, launchLong:string, confidentialityEndLong:string,
 *            wordCount:number, included:object[]}|{error:string}}
 */
export function buildCampaignNda({
  brandName,
  creatorName,
  productName,
  jurisdiction,
  effectiveDate,
  launchDate,
  confidentialityYears = DEFAULT_CONFIDENTIALITY_YEARS,
  returnDays = 14,
  profileTags = [],
  includedIds = [],
}) {
  if (!Array.isArray(profileTags) || !Array.isArray(includedIds)) {
    return { error: "Profile and clause selections must be given as lists." };
  }
  const unknown = includedIds.find((id) => !CLAUSE_BY_ID.has(id));
  if (unknown) return { error: `Unknown clause: ${unknown}.` };

  const brand = clean(brandName);
  const creator = clean(creatorName);
  const product = clean(productName);
  const law = clean(jurisdiction);
  if (!brand) return { error: "Enter the brand or company name." };
  if (!creator) return { error: "Enter the creator's name or handle." };
  if (!product) return { error: "Enter the product or campaign codename." };
  if (!law) return { error: "Enter the governing law — a country or a state." };
  if ([brand, creator, product, law].some((value) => value.length > MAX_FIELD)) {
    return { error: `Keep each name under ${MAX_FIELD} characters.` };
  }

  const effective = parseIsoDate(effectiveDate);
  if (effective === null) return { error: "Enter a valid effective date." };
  const launch = parseIsoDate(launchDate);
  if (launch === null) return { error: "Enter a valid embargo lift or launch date." };
  if (launch < effective) {
    return { error: "The embargo cannot lift before the agreement starts." };
  }

  const years = Number(confidentialityYears);
  if (
    !Number.isFinite(years) ||
    !Number.isInteger(years) ||
    years < MIN_CONFIDENTIALITY_YEARS ||
    years > MAX_CONFIDENTIALITY_YEARS
  ) {
    return {
      error: `The confidentiality term must be a whole number of years between ${MIN_CONFIDENTIALITY_YEARS} and ${MAX_CONFIDENTIALITY_YEARS}.`,
    };
  }

  const returnWindow = Number(returnDays);
  if (
    !Number.isFinite(returnWindow) ||
    !Number.isInteger(returnWindow) ||
    returnWindow < 1 ||
    returnWindow > 180
  ) {
    return { error: "The return window must be a whole number of days between 1 and 180." };
  }

  const included = CLAUSES.filter((clause) => includedIds.includes(clause.id));
  if (included.length === 0) {
    return { error: "Include at least one clause — an empty NDA is worse than none." };
  }

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
        ? "Every campaign NDA needs this clause."
        : `Needed because: ${clause.requiredFor
            .filter((tag) => profileTags.includes(tag))
            .map((tag) => PROFILE_TAGS.find((entry) => entry.id === tag)?.label ?? tag)
            .join("; ")}.`,
    }));

  const tags = new Set(profileTags);
  const warnings = [];
  if (!tags.has("paid") && !tags.has("gifted")) {
    warnings.push(
      "The creator is neither paid nor given product, so there may be no consideration for the promise of secrecy. Name what they receive — early access, exclusivity or a nominal fee — in the consideration clause.",
    );
  }
  if (tags.has("us") && !includedIds.includes("dtsa")) {
    warnings.push(
      "Without the 18 U.S.C. section 1833(b) immunity notice you cannot recover exemplary damages or attorney fees under the Defend Trade Secrets Act against this creator.",
    );
  }
  if (tags.has("gifted") && !includedIds.includes("honest-review")) {
    warnings.push(
      "Product the creator keeps makes them a consumer of it. A term restricting their honest review is void under the Consumer Review Fairness Act, 15 U.S.C. section 45b.",
    );
  }
  if (daysBetween(effective, launch) === 0) {
    warnings.push(
      "The embargo lifts on the effective date, so there is no confidential window. Check the launch date.",
    );
  }

  const consideration = tags.has("paid")
    ? tags.has("gifted")
      ? "the agreed campaign fee and the product supplied for the campaign, which they may keep"
      : "the agreed campaign fee and early access to the product"
    : tags.has("gifted")
      ? "the product supplied for the campaign, which they may keep, and early access ahead of the public"
      : "early access to the product and the opportunity to publish first";

  const embargoDays = daysBetween(effective, launch);
  const confidentialityEnd = addYears(effective, years);

  const values = {
    brand,
    creator,
    product,
    jurisdiction: law,
    launchLong: formatStamp(launch),
    embargoDays: String(embargoDays),
    confidentialityEndLong: formatStamp(confidentialityEnd),
    returnDays: String(returnWindow),
    consideration,
  };

  const fill = (text) =>
    Object.keys(values).reduce(
      (acc, key) => acc.split(`{{${key}}}`).join(values[key]),
      text,
    );

  const lines = [
    `MUTUAL CAMPAIGN NON-DISCLOSURE AGREEMENT — ${product}`,
    `Between ${brand} and ${creator}.`,
    `Effective ${formatStamp(effective)}. Embargo lifts ${formatStamp(launch)}. Confidentiality runs to ${formatStamp(confidentialityEnd)}.`,
    "",
  ];
  included.forEach((clause, index) => {
    lines.push(`${index + 1}. ${clause.title.toUpperCase()}`);
    lines.push(fill(clause.body));
    lines.push("");
  });
  lines.push("Signed for the brand: ______________________  Date: __________");
  lines.push(`Name and role at ${brand}: ______________________`);
  lines.push("");
  lines.push("Signed by the creator: ______________________  Date: __________");
  lines.push(`Name: ${creator}`);

  const agreement = lines.join("\n");

  return {
    agreement,
    coveragePercent,
    missing,
    warnings,
    embargoDays,
    launchLong: formatStamp(launch),
    confidentialityEndLong: formatStamp(confidentialityEnd),
    wordCount: agreement.split(/\s+/).filter(Boolean).length,
    included: included.map((clause) => ({ id: clause.id, title: clause.title })),
  };
}
