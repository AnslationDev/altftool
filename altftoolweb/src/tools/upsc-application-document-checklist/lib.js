/**
 * UPSC online application document checklist.
 *
 * The items encode what the Union Public Service Commission's One-Time
 * Registration (OTR) portal and recent Civil Services Examination notifications
 * actually ask for. Where a specification changes from notification to
 * notification (photo size bands, exact fee channels) the item says so and
 * points the candidate at the current notice instead of freezing a figure that
 * may go stale.
 *
 * Key statutory/notification facts encoded:
 *  - Application fee is Rs 100 for the Civil Services (Preliminary)
 *    examination; female, SC, ST and persons-with-benchmark-disability
 *    candidates pay no fee at all (CSE notification, Fee section).
 *  - Recent CSE notifications require the uploaded photograph to be taken
 *    within the last 10 days and to carry the candidate's name and the date the
 *    photo was taken.
 *  - OBC candidates must hold a non-creamy-layer certificate in the central
 *    government format; EWS candidates need the income & asset certificate for
 *    the relevant financial year; PwBD claims need a benchmark (40%+)
 *    disability certificate.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Candidate categories the UPSC form distinguishes for documents and fee. */
export const CATEGORIES = [
  { id: "general", label: "General / Unreserved" },
  { id: "ews", label: "EWS" },
  { id: "obc", label: "OBC (non-creamy layer)" },
  { id: "sc", label: "Scheduled Caste" },
  { id: "st", label: "Scheduled Tribe" },
];

/**
 * Fee rule from the CSE notification: Rs 100, with female, SC, ST and PwBD
 * candidates exempt.
 */
export const APPLICATION_FEE = 100;
export const FEE_EXEMPT_GROUNDS = ["female", "sc", "st", "pwbd"];

/** Human-readable label shown for each FEE_EXEMPT_GROUNDS entry. */
const FEE_EXEMPT_GROUND_LABELS = {
  female: "Woman candidate",
  sc: "Scheduled Caste",
  st: "Scheduled Tribe",
  pwbd: "Person with benchmark disability",
};

/** Whether a candidate profile satisfies a given FEE_EXEMPT_GROUNDS entry. */
function meetsFeeExemptGround(profile, ground) {
  if (ground === "female") return Boolean(profile.female);
  if (ground === "pwbd") return Boolean(profile.pwbd);
  return profile.category === ground;
}

/**
 * Checklist sections. Every item:
 *  { id, label, detail, required, when }
 * `when` (optional) narrows applicability:
 *  { categories: [...ids] } and/or { flags: [...profile boolean keys] } — the
 * item applies when the profile category is listed OR any listed flag is true.
 */
export const SECTIONS = [
  {
    id: "otr",
    title: "One-Time Registration (OTR)",
    items: [
      {
        id: "otr-mobile-email",
        label: "Active mobile number and personal email",
        detail:
          "Both are verified by OTP during OTR and used for every admit card and correspondence; they cannot be casually changed later.",
        required: true,
      },
      {
        id: "otr-profile",
        label: "OTR profile completed and reviewed",
        detail:
          "Name, date of birth, gender, parents' names and minority status exactly as in your matriculation certificate — OTR data flows into every UPSC form you ever file.",
        required: true,
      },
    ],
  },
  {
    id: "identity",
    title: "Identity and personal records",
    items: [
      {
        id: "photo-id",
        label: "Photo identity card (Aadhaar, Voter ID, PAN, passport or driving licence)",
        detail:
          "Its number is entered in the form, a scan is uploaded, and the same card must be carried to every stage of the examination.",
        required: true,
      },
      {
        id: "matric-cert",
        label: "Matriculation (Class 10) certificate",
        detail:
          "UPSC accepts only the matriculation certificate as proof of name and date of birth; keep it at hand so entries match it letter for letter.",
        required: true,
      },
      {
        id: "degree-details",
        label: "Degree / final-year details",
        detail:
          "University, subject and year of the qualifying degree (or proof of appearing in the final year) as asked in the educational-qualification block.",
        required: true,
      },
    ],
  },
  {
    id: "uploads",
    title: "Scans to upload",
    items: [
      {
        id: "upload-photo",
        label: "Fresh photograph meeting the notification's rule",
        detail:
          "Recent CSE notifications require a colour photo taken within the last 10 days of uploading, with your name and the date of the photograph printed on it. Format and size band are given in the notification — check before scanning.",
        required: true,
      },
      {
        id: "upload-signature",
        label: "Scanned signature",
        detail:
          "Signature in black or dark ink on white paper, scanned to the format and size band the notification specifies.",
        required: true,
      },
      {
        id: "upload-id-scan",
        label: "Scan of the photo ID card",
        detail: "A clear scan of the same identity card whose number you entered in the form.",
        required: true,
      },
    ],
  },
  {
    id: "claims",
    title: "Category and relaxation certificates",
    items: [
      {
        id: "cert-obc",
        label: "OBC non-creamy-layer certificate (central government format)",
        detail:
          "Must be in the format prescribed for posts under the Government of India and current as per the notification's rules on validity.",
        required: true,
        when: { categories: ["obc"] },
      },
      {
        id: "cert-ews",
        label: "EWS income and asset certificate",
        detail:
          "Issued for the financial year the notification names, in the prescribed central format, by an authorised issuing authority.",
        required: true,
        when: { categories: ["ews"] },
      },
      {
        id: "cert-caste",
        label: "SC / ST caste certificate",
        detail: "In the central government format, from the district authority empowered to issue it.",
        required: true,
        when: { categories: ["sc", "st"] },
      },
      {
        id: "cert-pwbd",
        label: "Benchmark disability (PwBD) certificate",
        detail:
          "Certificate of 40% or more disability in the form prescribed under the Rights of Persons with Disabilities Act, 2016 — also the basis for scribe or compensatory-time claims.",
        required: true,
        when: { flags: ["pwbd"] },
      },
      {
        id: "cert-esm",
        label: "Ex-serviceman / service documents for age relaxation",
        detail:
          "Discharge certificate or serving-status certificate that supports the age-relaxation claim ticked in the form.",
        required: true,
        when: { flags: ["exServiceman"] },
      },
    ],
  },
  {
    id: "choices",
    title: "Choices and fee",
    items: [
      {
        id: "choice-centre",
        label: "Examination centre preferences decided",
        detail:
          "Centres fill on a first-apply-first-allotted basis in many cycles — decide your ordered preferences before opening the form.",
        required: true,
      },
      {
        id: "choice-optional",
        label: "Optional subject and exam-medium decision",
        detail:
          "The application asks for choices (optional subject for the Mains, language medium) that are hard or impossible to change later — settle them first.",
        required: true,
      },
      {
        id: "fee-ready",
        label: "Fee payment ready — Rs 100, or exemption confirmed",
        detail:
          "Rs 100 for the Civil Services (Preliminary) examination, payable online or by SBI cash challan. Female, SC, ST and PwBD candidates pay no fee.",
        required: true,
      },
      {
        id: "final-review",
        label: "Printout / PDF of the submitted application saved",
        detail:
          "Save the completed application and fee receipt; UPSC's correction window is short and the printout is your record of what was claimed.",
        required: false,
      },
    ],
  },
];

const VALID_CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));

/** Does one checklist item apply to this candidate profile? */
export function itemApplies(item, profile = {}) {
  if (!item || !item.when) return true;
  const { categories, flags } = item.when;
  const categoryHit =
    Array.isArray(categories) && categories.includes(profile.category || "general");
  const flagHit = Array.isArray(flags) && flags.some((flag) => Boolean(profile[flag]));
  return Boolean(categoryHit || flagHit);
}

/**
 * The sections/items applicable to a profile.
 *
 * @param {object} profile { category, pwbd, exServiceman, female }
 * @returns {Array<{id,title,items:Array}>}
 */
export function applicableSections(profile = {}) {
  return SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => itemApplies(item, profile)),
  })).filter((section) => section.items.length > 0);
}

/** Whether the profile pays the Rs 100 fee, per the CSE notification's exemptions. */
export function feeForProfile(profile = {}) {
  // FEE_EXEMPT_GROUNDS is the source of truth for which grounds waive the
  // fee — iterate over it instead of re-listing the same four conditions, so
  // the exported constant can't silently drift from the actual behavior.
  const grounds = FEE_EXEMPT_GROUNDS.filter((ground) => meetsFeeExemptGround(profile, ground)).map(
    (ground) => FEE_EXEMPT_GROUND_LABELS[ground],
  );
  const exempt = grounds.length > 0;
  return { fee: exempt ? 0 : APPLICATION_FEE, exempt, grounds };
}

/**
 * Progress across the applicable checklist.
 *
 * @param {object} input
 * @param {object} [input.profile]
 * @param {Array<string>} input.checkedIds Ids the candidate has ticked.
 * @returns {object} progress figures, or { error } on bad input.
 */
export function computeProgress({ profile = {}, checkedIds = [] } = {}) {
  if (!Array.isArray(checkedIds)) {
    return { error: "Checked items must be a list of item ids." };
  }
  const category = profile.category || "general";
  if (!VALID_CATEGORY_IDS.has(category)) {
    return { error: "Choose one of the listed candidate categories." };
  }

  const checked = new Set(checkedIds);
  const sections = applicableSections({ ...profile, category });
  const items = sections.flatMap((section) => section.items);

  const total = items.length;
  const done = items.filter((item) => checked.has(item.id)).length;
  const requiredItems = items.filter((item) => item.required);
  const requiredDone = requiredItems.filter((item) => checked.has(item.id)).length;
  const remainingRequired = requiredItems
    .filter((item) => !checked.has(item.id))
    .map((item) => item.label);

  return {
    total,
    done,
    // Guard: total is never 0 with this data set, but stay total-function safe.
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    requiredTotal: requiredItems.length,
    requiredDone,
    remainingRequired,
    ready: requiredItems.length > 0 && remainingRequired.length === 0,
  };
}
