/**
 * NTA JEE (Main) online application document checklist.
 *
 * Items encode what the National Testing Agency's JEE (Main) information
 * bulletin and application portal (jeemain.nta.nic.in) ask for. Facts encoded
 * from recent bulletins:
 *
 *  - Fee per paper (B.E./B.Tech OR B.Arch OR B.Planning), exam centres in
 *    India, recent sessions: Rs 1,000 for General male, Rs 900 for
 *    General-EWS / OBC-NCL male, Rs 800 for female candidates of those
 *    categories, and Rs 500 for SC, ST, PwD and third-gender candidates.
 *  - Uploads: recent passport-style colour photograph and signature as JPG
 *    within the size band the current bulletin prints, plus PDFs of the PwD
 *    certificate where claimed. EWS and OBC-NCL certificates must be issued
 *    for the financial year the bulletin names (certificates issued on or
 *    after 1 April of that year).
 *  - The form asks for up to 4 exam-city choices, the paper(s), and one of the
 *    13 question-paper mediums.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Categories the JEE Main form distinguishes for certificates and fee. */
export const CATEGORIES = [
  { id: "general", label: "General / Unreserved" },
  { id: "ews", label: "General-EWS" },
  { id: "obc", label: "OBC (non-creamy layer, central list)" },
  { id: "sc", label: "Scheduled Caste" },
  { id: "st", label: "Scheduled Tribe" },
];

export const GENDERS = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "third", label: "Third gender" },
];

/**
 * Fee per paper, centres in India, in rupees — recent JEE (Main) bulletins.
 * Structure: slab -> { male, female, third }.
 */
export const FEES = {
  general: { male: 1000, female: 800, third: 500 },
  middle: { male: 900, female: 800, third: 500 }, // General-EWS / OBC-NCL
  concession: { male: 500, female: 500, third: 500 }, // SC / ST / PwD
};

/** Maximum exam-city choices the form accepts (recent bulletins). */
export const MAX_CITY_CHOICES = 4;
/** Question-paper mediums offered (English, Hindi and 11 regional languages). */
export const MEDIUM_COUNT = 13;

/**
 * Checklist sections. Item shape: { id, label, detail, required, when? }.
 * `when` narrows applicability: { categories: [...] } and/or { flags: [...] } —
 * the item applies when the category matches OR any listed flag is true.
 */
export const SECTIONS = [
  {
    id: "registration",
    title: "Before registration",
    items: [
      {
        id: "reg-contact",
        label: "Active mobile number and email",
        detail:
          "OTP-verified at registration and used for the admit card, city intimation and result for every session you sit.",
        required: true,
      },
      {
        id: "reg-identity",
        label: "Identity number — Aadhaar preferred, APAAR ID if you have one",
        detail:
          "The form asks for an identity type and number; matching it with school records avoids exam-day verification friction.",
        required: true,
      },
      {
        id: "reg-class10",
        label: "Class 10 certificate for name, date of birth and parents' names",
        detail:
          "Entries must match the Class 10 record exactly — it is the reference document at counselling and admission.",
        required: true,
      },
      {
        id: "reg-class12",
        label: "Class 12 details — board, roll number, year of passing or appearing",
        detail:
          "The qualifying-examination block asks for the board, roll number and status (passed or appearing).",
        required: true,
      },
    ],
  },
  {
    id: "uploads",
    title: "Scans to upload",
    items: [
      {
        id: "up-photo",
        label: "Recent passport-style colour photograph (JPG, per the bulletin's size band)",
        detail:
          "About 80% face visible, ears showing, no cap or coloured glasses; NTA prints the exact KB band in each bulletin — scan to that, not to an old year's figure.",
        required: true,
      },
      {
        id: "up-signature",
        label: "Signature scan (JPG, per the bulletin's size band)",
        detail: "Full signature in black or blue ink on white paper; initials or block capitals get rejected.",
        required: true,
      },
      {
        id: "up-pwd",
        label: "PwD certificate PDF (NTA-prescribed format)",
        detail:
          "Needed for the PwD fee slab, relaxed eligibility and scribe or compensatory-time claims.",
        required: true,
        when: { flags: ["pwd"] },
      },
    ],
  },
  {
    id: "certificates",
    title: "Category certificates",
    items: [
      {
        id: "cert-obc",
        label: "OBC non-creamy-layer certificate (central list)",
        detail:
          "Must be issued on or after 1 April of the financial year the bulletin names; an older certificate moves the claim to General at counselling.",
        required: true,
        when: { categories: ["obc"] },
      },
      {
        id: "cert-ews",
        label: "EWS income and asset certificate",
        detail:
          "Central government format, issued for the financial year the bulletin specifies — the certificate date is checked at JoSAA/CSAB verification.",
        required: true,
        when: { categories: ["ews"] },
      },
      {
        id: "cert-caste",
        label: "SC / ST caste certificate",
        detail: "Issued by the competent district authority in the prescribed format.",
        required: true,
        when: { categories: ["sc", "st"] },
      },
    ],
  },
  {
    id: "choices",
    title: "Choices and fee",
    items: [
      {
        id: "choice-paper",
        label: "Paper(s) decided — B.E./B.Tech, B.Arch and/or B.Planning",
        detail: "The fee is charged per paper combination, so decide before payment, not after.",
        required: true,
      },
      {
        id: "choice-cities",
        label: `Up to ${MAX_CITY_CHOICES} exam-city preferences ranked`,
        detail:
          "Cities fill up; ranking four realistic choices avoids being bumped to a far centre.",
        required: true,
      },
      {
        id: "choice-medium",
        label: "Question-paper medium chosen",
        detail:
          `JEE Main is offered in ${MEDIUM_COUNT} languages (English, Hindi and 11 regional); regional mediums are tied to centres in the matching states.`,
        required: true,
      },
      {
        id: "fee-ready",
        label: "Fee payment ready for your slab",
        detail:
          "Recent sessions, per paper, India centres: Rs 1,000 General male, Rs 900 EWS/OBC-NCL male, Rs 800 female (Gen/EWS/OBC), Rs 500 SC/ST/PwD/third gender. Online payment only.",
        required: true,
      },
      {
        id: "confirmation",
        label: "Confirmation page and fee receipt saved",
        detail: "Keep the confirmation PDF for every session you register in.",
        required: false,
      },
    ],
  },
];

const VALID_CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));
const VALID_GENDER_IDS = new Set(GENDERS.map((g) => g.id));

/** Does one checklist item apply to this candidate profile? */
export function itemApplies(item, profile = {}) {
  if (!item || !item.when) return true;
  const { categories, flags } = item.when;
  const categoryHit =
    Array.isArray(categories) && categories.includes(profile.category || "general");
  const flagHit = Array.isArray(flags) && flags.some((flag) => Boolean(profile[flag]));
  return Boolean(categoryHit || flagHit);
}

/** Sections filtered to a candidate profile { category, gender, pwd }. */
export function applicableSections(profile = {}) {
  return SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => itemApplies(item, profile)),
  })).filter((section) => section.items.length > 0);
}

/**
 * Fee per paper for a profile, per the recent-bulletin slabs (India centres).
 *
 * @param {object} profile { category, gender, pwd }
 * @returns {{ fee:number, band:string } | { error:string }}
 */
export function feeForProfile(profile = {}) {
  const category = profile.category || "general";
  const gender = profile.gender || "male";
  if (!VALID_CATEGORY_IDS.has(category)) {
    return { error: "Choose one of the listed candidate categories." };
  }
  if (!VALID_GENDER_IDS.has(gender)) {
    return { error: "Choose one of the listed gender options." };
  }
  if (profile.pwd || category === "sc" || category === "st" || gender === "third") {
    return { fee: FEES.concession[gender], band: "SC / ST / PwD / third-gender slab" };
  }
  if (category === "ews" || category === "obc") {
    return { fee: FEES.middle[gender], band: "General-EWS / OBC-NCL slab" };
  }
  return { fee: FEES.general[gender], band: "General slab" };
}

/**
 * Progress across the applicable checklist.
 *
 * @param {object} input
 * @param {object} [input.profile]
 * @param {Array<string>} input.checkedIds
 * @returns {object} progress figures, or { error }.
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
  const items = applicableSections({ ...profile, category }).flatMap((s) => s.items);

  const total = items.length;
  const done = items.filter((item) => checked.has(item.id)).length;
  const requiredItems = items.filter((item) => item.required);
  const remainingRequired = requiredItems
    .filter((item) => !checked.has(item.id))
    .map((item) => item.label);

  return {
    total,
    done,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    requiredTotal: requiredItems.length,
    requiredDone: requiredItems.length - remainingRequired.length,
    remainingRequired,
    ready: requiredItems.length > 0 && remainingRequired.length === 0,
  };
}
