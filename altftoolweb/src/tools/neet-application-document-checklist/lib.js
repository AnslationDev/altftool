/**
 * NEET (UG) online application document checklist.
 *
 * Items encode what the National Testing Agency's NEET (UG) information
 * bulletin and registration portal (neet.nta.nic.in) ask for. Facts encoded
 * from recent bulletins:
 *
 *  - Uploads: passport-size photograph (white background, JPG, 10 KB - 200 KB),
 *    postcard-size 4"x6" photograph (JPG, 10 KB - 200 KB), signature (JPG,
 *    4 KB - 30 KB), category certificate and Class 10 certificate as PDFs.
 *    NTA has kept these bands stable for several cycles but prints the
 *    authoritative band in each year's bulletin.
 *  - Application fee (recent cycles, centres in India): Rs 1,700 for General,
 *    Rs 1,600 for General-EWS and OBC-NCL, Rs 1,000 for SC, ST, PwBD and
 *    third-gender candidates.
 *  - OBC-NCL and EWS certificates must be in the central government format and
 *    current for the financial year the bulletin names.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Categories the NEET form distinguishes for certificates and fee. */
export const CATEGORIES = [
  { id: "general", label: "General / Unreserved" },
  { id: "ews", label: "General-EWS" },
  { id: "obc", label: "OBC (non-creamy layer, central list)" },
  { id: "sc", label: "Scheduled Caste" },
  { id: "st", label: "Scheduled Tribe" },
];

/** Fee slabs from recent NEET (UG) bulletins, exam centres in India, in rupees. */
export const FEES = {
  general: 1700, // General category
  ews: 1600, // General-EWS
  obc: 1600, // OBC-NCL
  concession: 1000, // SC / ST / PwBD / third gender
};

/**
 * Checklist sections. Item shape:
 *  { id, label, detail, required, when? }
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
          "Both are OTP-verified at registration and used for the admit card, city intimation and result — they should belong to the candidate or a parent.",
        required: true,
      },
      {
        id: "reg-identity",
        label: "Identity number (Aadhaar preferred) and APAAR ID if you have one",
        detail:
          "The form asks for an identity type and number; NTA encourages Aadhaar because it speeds up exam-day verification.",
        required: true,
      },
      {
        id: "reg-class10",
        label: "Class 10 certificate for name, date of birth and parents' names",
        detail:
          "Personal details must match the Class 10 record letter for letter — mismatches are the single biggest cause of correction-window panic.",
        required: true,
      },
    ],
  },
  {
    id: "uploads",
    title: "Scans and photos to upload",
    items: [
      {
        id: "up-passport-photo",
        label: "Passport-size photograph — white background, JPG 10 KB to 200 KB",
        detail:
          "Recent bulletins ask for a photo with 80% face visible, ears showing, without cap or coloured glasses. The same photo is used on the admit card and at counselling, so keep spare prints.",
        required: true,
      },
      {
        id: "up-postcard-photo",
        label: "Postcard-size (4\" x 6\") photograph — JPG 10 KB to 200 KB",
        detail:
          "A larger print of the same photograph, scanned separately; it is pasted on the proforma carried to the examination centre.",
        required: true,
      },
      {
        id: "up-signature",
        label: "Signature — black ink on white paper, JPG 4 KB to 30 KB",
        detail: "Full signature, not initials or capital letters; illegible signatures get rejected.",
        required: true,
      },
      {
        id: "up-thumb",
        label: "Thumb / finger impression images if the current bulletin asks for them",
        detail:
          "Several recent cycles required a left-hand thumb impression (blue ink on white paper, JPG); check the upload list in this year's bulletin.",
        required: false,
      },
    ],
  },
  {
    id: "certificates",
    title: "Category and claim certificates",
    items: [
      {
        id: "cert-obc",
        label: "OBC non-creamy-layer certificate (central list, prescribed format)",
        detail:
          "Must show a caste on the central OBC list and be valid for the financial year the bulletin names; state-list OBC does not count for the all-India quota.",
        required: true,
        when: { categories: ["obc"] },
      },
      {
        id: "cert-ews",
        label: "EWS income and asset certificate",
        detail:
          "In the central government format, issued for the financial year the bulletin specifies.",
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
      {
        id: "cert-pwbd",
        label: "PwBD certificate (40% or more benchmark disability)",
        detail:
          "Needed for the PwBD quota and for scribe or compensatory-time claims; certificates from designated centres carry the most weight at counselling.",
        required: true,
        when: { flags: ["pwbd"] },
      },
      {
        id: "cert-citizenship",
        label: "Citizenship / embassy certificate for NRI, OCI or foreign candidates",
        detail: "NRI, OCI and foreign nationals upload the citizenship or embassy document the bulletin lists.",
        required: true,
        when: { flags: ["nriOci"] },
      },
    ],
  },
  {
    id: "choices",
    title: "Choices and fee",
    items: [
      {
        id: "choice-cities",
        label: "Exam city preferences decided",
        detail:
          "The form asks for ordered city choices; candidates opting for centres outside India pay a higher fee and have fewer cities.",
        required: true,
      },
      {
        id: "choice-medium",
        label: "Question-paper medium chosen",
        detail:
          "NEET is offered in English, Hindi and several regional languages; the medium is locked to the city choice and cannot be changed later.",
        required: true,
      },
      {
        id: "fee-ready",
        label: "Fee payment ready for your category",
        detail:
          "Recent bulletins: Rs 1,700 (General), Rs 1,600 (General-EWS / OBC-NCL), Rs 1,000 (SC / ST / PwBD / third gender) for centres in India, payable online only.",
        required: true,
      },
      {
        id: "confirmation",
        label: "Confirmation page and fee receipt saved",
        detail: "Download and keep the confirmation page PDF; it is your proof if the payment status disputes later.",
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

/** Sections filtered to a candidate profile { category, pwbd, nriOci }. */
export function applicableSections(profile = {}) {
  return SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => itemApplies(item, profile)),
  })).filter((section) => section.items.length > 0);
}

/**
 * Fee for a profile per the recent-bulletin slabs (centres in India).
 * SC/ST/PwBD take the concession slab; EWS and OBC-NCL the middle slab.
 */
export function feeForProfile(profile = {}) {
  const category = profile.category || "general";
  if (!VALID_CATEGORY_IDS.has(category)) {
    return { error: "Choose one of the listed candidate categories." };
  }
  if (profile.pwbd || category === "sc" || category === "st") {
    return { fee: FEES.concession, band: "SC / ST / PwBD slab" };
  }
  if (category === "ews" || category === "obc") {
    return { fee: FEES.ews, band: "General-EWS / OBC-NCL slab" };
  }
  return { fee: FEES.general, band: "General slab" };
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
