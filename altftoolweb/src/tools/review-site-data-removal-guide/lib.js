/**
 * Review Site Personal Data Removal Guide — builds a dated, ordered removal plan.
 *
 * Rules encoded
 * -------------
 * - EEA / UK: Article 17 of the GDPR gives a right to erasure of personal data, and
 *   Article 12(3) requires the controller to tell you what action it took within one
 *   calendar month. Article 17(3)(a) is the reason an opinion in a review is not
 *   automatically erasable: erasure does not apply where processing is necessary for
 *   the exercise of freedom of expression and information.
 * - India: the Information Technology (Intermediary Guidelines and Digital Media Ethics
 *   Code) Rules, 2021 require an intermediary's grievance officer to acknowledge a
 *   complaint within 24 hours and dispose of it within 15 days. For content exposing a
 *   private area, nudity or a sexual act, or for impersonation including morphed images,
 *   the intermediary must act within 24 hours of the complaint. A grievance decision can
 *   then be appealed to a Grievance Appellate Committee within 30 days.
 * - United States: there is no general statutory right to have a third party's review
 *   taken down, and section 230 of the Communications Decency Act means a platform is
 *   generally not liable for, and cannot be compelled to remove, content posted by
 *   someone else. Removal therefore rests on the platform's own policy or a court order.
 * - Search engines separately publish a personal-information removal policy covering
 *   contact details such as a phone number, home address or email address appearing in
 *   results, which is a different route from removing the underlying page.
 *
 * Where no deadline is published, the plan uses a stated 14-day follow-up convention and
 * labels it as a convention rather than a legal limit. All dates take `startedOn` as an
 * argument; the clock is never read inside the maths.
 */

const MS_PER_DAY = 86400000;

/** Non-statutory wait before chasing a step that has no published deadline. */
export const FOLLOW_UP_DAYS = 14;

/** IT Rules 2021: grievance officer must dispose of a complaint within this many days. */
export const INDIA_GRIEVANCE_DAYS = 15;

/** IT Rules 2021: 24-hour route for intimate imagery, morphed images and impersonation. */
export const INDIA_URGENT_DAYS = 1;

/** IT Rules 2021: appeal window to a Grievance Appellate Committee, in days. */
export const INDIA_APPEAL_DAYS = 30;

/** GDPR Article 12(3): one calendar month to respond to a rights request. */
export const GDPR_RESPONSE_MONTHS = 1;

export const TARGETS = [
  { id: "own-review", label: "A review I wrote, with my name or photo on it" },
  { id: "profile", label: "My whole reviewer profile and history" },
  { id: "contact-details", label: "My phone number, address or email published inside a review" },
  { id: "my-photo", label: "A photo of me uploaded by somebody else" },
  { id: "about-me", label: "A review someone else wrote about me by name" },
];

export const PLATFORMS = [
  { id: "maps", label: "Maps or local business listing" },
  { id: "marketplace", label: "Product or marketplace reviews" },
  { id: "employer", label: "Employer and workplace review site" },
  { id: "professional", label: "Doctor, lawyer or tradesperson rating site" },
  { id: "travel", label: "Hotel, restaurant or travel reviews" },
];

export const REGIONS = [
  {
    id: "gdpr",
    label: "EEA or United Kingdom",
    erasure: true,
    escalateTo: "your data protection supervisory authority (the ICO in the UK)",
    responseNote: `Article 12(3) gives the platform ${GDPR_RESPONSE_MONTHS} calendar month to tell you what it has done.`,
  },
  {
    id: "india",
    label: "India",
    erasure: true,
    escalateTo: "the Grievance Appellate Committee, within 30 days of the grievance decision",
    responseNote: `The grievance officer must acknowledge within 24 hours and dispose of the complaint within ${INDIA_GRIEVANCE_DAYS} days.`,
  },
  {
    id: "us",
    label: "United States",
    erasure: false,
    escalateTo: "the platform's own appeal process, or a lawyer if you are considering a court order",
    responseNote:
      "There is no general statutory takedown right for someone else's review; section 230 means removal rests on platform policy or a court order.",
  },
  {
    id: "other",
    label: "Elsewhere / not sure",
    erasure: false,
    escalateTo: "the platform's published appeal process and any local consumer or data regulator",
    responseNote: "No statutory deadline is assumed; the plan uses a follow-up convention instead.",
  },
];

/** How much of the outcome is in your own hands, given what you are removing. */
export const ROUTES = {
  "self-service": {
    label: "Self-service",
    detail: "You posted it, so you can delete it yourself without asking anyone's permission.",
  },
  policy: {
    label: "Platform policy",
    detail:
      "The content breaks a published content policy, which is usually a faster and more reliable route than a legal argument.",
  },
  "legal-right": {
    label: "Data protection right",
    detail:
      "A statutory erasure or objection right applies to the personal data in the content, with a deadline attached.",
  },
  contested: {
    label: "Contested",
    detail:
      "An opinion about you is protected in most jurisdictions. Removal usually needs a policy breach or a court order, and a measured public reply is often the more effective response.",
  },
};

function parseDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const [y, m, d] = value.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return NaN;
  const ts = Date.UTC(y, m - 1, d);
  const back = new Date(ts);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) {
    return NaN;
  }
  return ts;
}

function toIso(ts) {
  return new Date(ts).toISOString().slice(0, 10);
}

function addMonths(ts, months) {
  const d = new Date(ts);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + months;
  const day = d.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Date.UTC(year, month, Math.min(day, lastDay));
}

/** Days in one calendar month starting at ts — used so the timeline stays a single unit. */
function monthLengthDays(ts, months) {
  return Math.round((addMonths(ts, months) - ts) / MS_PER_DAY);
}

/** The route that best describes this combination. */
export function routeFor(target, region) {
  if (target === "own-review" || target === "profile") return "self-service";
  if (target === "contact-details" || target === "my-photo") {
    return region.erasure ? "legal-right" : "policy";
  }
  return region.erasure ? "legal-right" : "contested";
}

/**
 * Build the plan.
 * @param {{target:string, platform:string, region:string, startedOn:string}} input
 */
export function buildRemovalPlan({ target, platform, region, startedOn } = {}) {
  const tgt = TARGETS.find((option) => option.id === target);
  if (!tgt) return { error: "Choose what you are trying to remove." };

  const plat = PLATFORMS.find((option) => option.id === platform);
  if (!plat) return { error: "Choose the kind of review site." };

  const reg = REGIONS.find((option) => option.id === region);
  if (!reg) return { error: "Choose where you live." };

  const start = parseDate(startedOn);
  if (Number.isNaN(start)) return { error: "Enter a valid start date." };

  const grievanceDays = reg.id === "india" ? INDIA_GRIEVANCE_DAYS : FOLLOW_UP_DAYS;
  const grievanceBasis =
    reg.id === "india"
      ? `${INDIA_GRIEVANCE_DAYS} days under the IT Rules, 2021`
      : `${FOLLOW_UP_DAYS} days by convention — no published deadline`;
  // The erasure step addresses the platform's privacy contact separately from the
  // grievance officer, so outside the GDPR's Article 12(3) deadline it does not have
  // its own published statutory deadline — reuse the same follow-up convention as the
  // "cache" and "search-pii" steps rather than re-citing the grievance officer's IT
  // Rules, 2021 15-day SLA for this differently-addressed action.
  const erasureDays = reg.id === "gdpr" ? monthLengthDays(start, GDPR_RESPONSE_MONTHS) : FOLLOW_UP_DAYS;
  const erasureBasis =
    reg.id === "gdpr"
      ? "one calendar month under Article 12(3) of the GDPR"
      : `${FOLLOW_UP_DAYS} days by convention — no separate deadline published`;

  const steps = [];

  steps.push({
    id: "evidence",
    title: "Capture the evidence before you do anything else",
    detail:
      "Save the review URL, a full-page screenshot with the date visible, the reviewer's display name and the exact text. Content that is edited or deleted mid-process becomes very hard to reference later.",
    owner: "You",
    days: 0,
    basis: "Same day",
  });

  if (tgt.id === "own-review" || tgt.id === "profile") {
    steps.push({
      id: "self-delete",
      title:
        tgt.id === "profile"
          ? "Delete your contributions, then the reviewer profile itself"
          : "Delete the review from your own contributions",
      detail:
        "Photos attached to a review are usually stored separately from the text — delete them as their own items or they survive the review.",
      owner: "You",
      days: 0,
      basis: "Immediate",
    });
    steps.push({
      id: "identity",
      title: "Remove the display name and profile photo",
      detail:
        "Where a platform will not let you delete history, changing the display name to initials and removing the photo cuts the link to you.",
      owner: "You",
      days: 0,
      basis: "Immediate",
    });
    steps.push({
      id: "cache",
      title: "Ask the search engine to refresh its cached copy",
      detail:
        "Deleting the page does not clear the search result. Use the search engine's outdated-content removal tool once the live page no longer shows your name.",
      owner: "Search engine",
      days: FOLLOW_UP_DAYS,
      basis: `${FOLLOW_UP_DAYS} days by convention — no published deadline`,
    });
  } else {
    if (tgt.id === "about-me") {
      steps.push({
        id: "reply",
        title: "Consider a short, factual public reply first",
        detail:
          "A calm reply usually does more for readers than a removal fight, and it does not stop you pursuing removal in parallel.",
        owner: "You",
        days: 0,
        basis: "Same day",
      });
    }

    if (reg.id === "india" && (tgt.id === "my-photo" || tgt.id === "contact-details")) {
      steps.push({
        id: "urgent",
        title: "Use the 24-hour route if the image is intimate, morphed or impersonates you",
        detail:
          "The IT Rules, 2021 require an intermediary to act within 24 hours of a complaint about content exposing a private area, nudity or a sexual act, or about impersonation including morphed images. Say so explicitly in the complaint.",
        owner: "Platform",
        days: INDIA_URGENT_DAYS,
        basis: "24 hours under Rule 3(2)(b) of the IT Rules, 2021",
      });
    }

    steps.push({
      id: "report",
      title: "Report it to the platform under the closest published policy",
      detail:
        tgt.id === "contact-details"
          ? "Personal contact details in user content breach almost every major platform's policy — cite the personal-information or doxxing policy by name rather than arguing it is unfair."
          : tgt.id === "my-photo"
            ? "Cite the policy on images of identifiable people posted without consent, and say clearly that you are the person in the photograph."
            : "Pick the policy the content actually breaks — personal information, impersonation, harassment or conflict of interest — rather than reporting it as simply untrue.",
      owner: "Platform",
      days: grievanceDays,
      basis: grievanceBasis,
    });

    if (tgt.id === "contact-details") {
      steps.push({
        id: "search-pii",
        title: "Separately ask the search engine to remove the result",
        detail:
          "Major search engines publish a personal-information removal policy covering a phone number, home address or email address appearing in results. This works even while the underlying page stays up.",
        owner: "Search engine",
        days: FOLLOW_UP_DAYS,
        basis: `${FOLLOW_UP_DAYS} days by convention — no published deadline`,
      });
    }

    if (reg.erasure) {
      steps.push({
        id: "erasure",
        title: "Send a written erasure request to the platform's privacy contact",
        detail:
          tgt.id === "about-me"
            ? "Ask for erasure of the personal data identifying you rather than the whole opinion — a platform can refuse where processing is necessary for freedom of expression, but names, contact details and photographs are a narrower ask."
            : "Address it to the data protection officer or privacy team, not the general support queue, and reference the URLs you captured in step one.",
        owner: "Platform",
        days: erasureDays,
        basis: erasureBasis,
      });
    }

    steps.push({
      id: "escalate",
      title: `Escalate to ${reg.escalateTo}`,
      detail: reg.responseNote,
      owner: "Regulator or appeal body",
      days: reg.id === "india" ? INDIA_APPEAL_DAYS : FOLLOW_UP_DAYS,
      basis:
        reg.id === "india"
          ? `Appeal within ${INDIA_APPEAL_DAYS} days of the grievance decision`
          : `${FOLLOW_UP_DAYS} days by convention`,
    });
  }

  let cursor = start;
  const dated = steps.map((step) => {
    const startsOn = toIso(cursor);
    cursor += step.days * MS_PER_DAY;
    return { ...step, startsOn, dueOn: toIso(cursor) };
  });

  const totalDays = Math.round((cursor - start) / MS_PER_DAY);
  const routeId = routeFor(tgt.id, reg);

  return {
    target: tgt.id,
    targetLabel: tgt.label,
    platform: plat.id,
    platformLabel: plat.label,
    region: reg.id,
    regionLabel: reg.label,
    route: routeId,
    routeLabel: ROUTES[routeId].label,
    routeDetail: ROUTES[routeId].detail,
    steps: dated,
    stepCount: dated.length,
    startedOn: toIso(start),
    totalDays,
    completeBy: toIso(cursor),
    ownActions: dated.filter((step) => step.owner === "You").length,
    escalateTo: reg.escalateTo,
    responseNote: reg.responseNote,
  };
}
