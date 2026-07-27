/**
 * Caste certificate applications in India: which bars apply before the paperwork
 * matters, and what the file has to contain.
 *
 * Rule sources:
 *
 *  - Constitution (Scheduled Castes) Order, 1950, paragraph 3: no person who
 *    professes a religion different from the Hindu, the Sikh or the Buddhist religion
 *    shall be deemed to be a member of a Scheduled Caste. Sikhs were brought in by
 *    amendment in 1956 and Buddhists by the Constitution (Scheduled Castes) Order
 *    (Amendment) Act, 1990. The Constitution (Scheduled Tribes) Order, 1950 contains
 *    no equivalent religion condition, so tribal status does not depend on religion.
 *
 *  - Articles 341(2) and 342(2) of the Constitution: only Parliament may include a
 *    caste or tribe in, or exclude one from, the Presidential Lists. State of
 *    Maharashtra v. Milind (2001) confirmed that no court or authority can read an
 *    entry into those lists.
 *
 *  - Marri Chandra Shekhar Rao v. Dean, Seth G.S. Medical College (1990) and Action
 *    Committee on Issue of Caste Certificate to SCs and STs in the State of
 *    Maharashtra v. Union of India (1994): Scheduled Caste and Scheduled Tribe status
 *    is specific to the state or area for which the caste or tribe is notified. A
 *    person notified in one state cannot claim that status on migrating to another.
 *
 *  - Sunita Singh v. State of Uttar Pradesh (2018): caste is determined by birth and
 *    is not acquired by marriage, so a woman retains her father's caste. The
 *    certificate is issued on the father's caste, not the husband's.
 *
 *  - Kumari Madhuri Patil v. Additional Commissioner, Tribal Development (1994) laid
 *    down the procedure for issuing and scrutinising caste certificates, including
 *    the Vigilance Cell enquiry and the Scrutiny Committee, which several states
 *    still follow.
 *
 *  - OBC creamy layer: DoPT OM No. 36012/22/93-Estt.(SCT) dated 8 September 1993 with
 *    the ceiling raised to ₹8,00,000 gross annual income by OM No. 36033/1/2013-
 *    Estt.(Res.) dated 13 September 2017, tested over three consecutive years. Income
 *    from salary and from agricultural land is excluded from that computation under
 *    the DoPT clarification of 14 October 2004. For a central government post the
 *    certificate must be in the prescribed central format; a state-format OBC
 *    certificate does not serve.
 *
 * Informational only. This is not legal advice, and no certificate issues without the
 * revenue authority's own enquiry.
 */

/** Religions that satisfy paragraph 3 of the Constitution (Scheduled Castes) Order, 1950. */
export const SC_ELIGIBLE_RELIGIONS = ["hindu", "sikh", "buddhist"];

/** OBC creamy layer begins at this gross annual income from the counted sources. */
export const CREAMY_LAYER_LIMIT = 800000;

/** Consecutive years over which the creamy layer income test runs. */
export const CREAMY_LAYER_TEST_YEARS = 3;

export const CATEGORIES = [
  {
    id: "sc",
    label: "Scheduled Caste (SC)",
    religionBar: true,
    incomeTest: false,
    list: "Constitution (Scheduled Castes) Order, 1950",
  },
  {
    id: "st",
    label: "Scheduled Tribe (ST)",
    religionBar: false,
    incomeTest: false,
    list: "Constitution (Scheduled Tribes) Order, 1950",
  },
  {
    id: "obcCentral",
    label: "OBC non-creamy-layer, central format",
    religionBar: false,
    incomeTest: true,
    list: "Central List of Other Backward Classes maintained under the NCBC",
  },
  {
    id: "obcState",
    label: "OBC, state list",
    religionBar: false,
    incomeTest: true,
    list: "The state's own list of Other Backward Classes",
  },
];

export const RELIGIONS = [
  { id: "hindu", label: "Hindu" },
  { id: "sikh", label: "Sikh" },
  { id: "buddhist", label: "Buddhist" },
  { id: "christian", label: "Christian" },
  { id: "muslim", label: "Muslim" },
  { id: "jain", label: "Jain" },
  { id: "parsi", label: "Parsi" },
  { id: "other", label: "Another religion" },
];

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * The OBC creamy layer income test.
 *
 * @param {number} countedIncome  Gross annual income EXCLUDING salary and agricultural income.
 * @param {boolean} sustainedThreeYears True if that level held for three consecutive years.
 * @returns {{ countedIncome:number, limit:number, inCreamyLayer:boolean, headroom:number, note:string }}
 */
export function testCreamyLayer(countedIncome, sustainedThreeYears) {
  const income = Number(countedIncome) || 0;
  // The OM words the bar as income "of ₹8 lakh or above", so the limit itself fails.
  const overLimit = income >= CREAMY_LAYER_LIMIT;
  const inCreamyLayer = overLimit && Boolean(sustainedThreeYears);
  return {
    countedIncome: round2(income),
    limit: CREAMY_LAYER_LIMIT,
    inCreamyLayer,
    overLimit,
    headroom: round2(CREAMY_LAYER_LIMIT - income),
    note: inCreamyLayer
      ? `Counted income of ${round2(income)} is at or above ${CREAMY_LAYER_LIMIT} and has held for ${CREAMY_LAYER_TEST_YEARS} consecutive years, which places the family in the creamy layer.`
      : overLimit
        ? `Counted income is at or above ${CREAMY_LAYER_LIMIT} but the test needs that level for ${CREAMY_LAYER_TEST_YEARS} consecutive years. Confirm the earlier two years before assuming non-creamy-layer status.`
        : `Counted income of ${round2(income)} is below the ${CREAMY_LAYER_LIMIT} ceiling. Remember salary and agricultural income are left out of this figure.`,
  };
}

function buildDocuments(category, profile) {
  const documents = [
    {
      id: "application",
      label: "Application in the prescribed form from the state e-district portal",
      detail:
        "Use the central format where the certificate is for a central government post — a state-format OBC certificate will not be accepted there.",
      required: true,
    },
    {
      id: "identity",
      label: "Applicant's photo identity and passport photographs",
      detail: "Aadhaar, voter ID or passport, with the name spelled exactly as in the other papers.",
      required: true,
    },
    {
      id: "fatherCaste",
      label: "Father's caste certificate, or that of a paternal blood relative",
      detail:
        "This is the anchor document. Caste passes through the father's line, so an uncle's or grandfather's certificate serves where the father has none.",
      required: true,
    },
    {
      id: "schoolRecord",
      label: "School admission register extract or transfer certificate showing caste",
      detail:
        "Where no relative holds a certificate, the caste entry in the father's or grandfather's school record is the usual substitute proof.",
      required: true,
    },
    {
      id: "residence",
      label: "Proof of residence in the state, and of the family's residence before the notification date",
      detail:
        "Caste and tribe entries are notified for a named state or area, so the enquiry looks at where the family was living when the entry was made.",
      required: true,
    },
    {
      id: "landRecord",
      label: "Revenue or land records naming the family",
      detail:
        "Khatauni, 7/12 extract or a similar record supports both the residence and the family lineage.",
      required: false,
    },
    {
      id: "affidavit",
      label: "Self-declaration or affidavit on non-judicial stamp paper",
      detail:
        "Sworn before a notary or executive magistrate, stating the caste, the father's caste and that no such certificate is held elsewhere.",
      required: true,
    },
    {
      id: "enquiry",
      label: "Local enquiry support — witness statements or a Patwari, VAO or ward member report",
      detail:
        "Several states route the file through a Vigilance Cell and Scrutiny Committee following the procedure laid down in 1994.",
      required: true,
    },
    {
      id: "fee",
      label: "Application fee or court fee stamp receipt",
      detail: "Small, but an application without it is returned unprocessed.",
      required: true,
    },
  ];

  if (category.incomeTest) {
    documents.push({
      id: "incomeProof",
      label: `Parents' income proof for ${CREAMY_LAYER_TEST_YEARS} consecutive financial years`,
      detail:
        "Income tax returns, Form 16 or a salary certificate. The creamy layer test looks at the parents' income, not the candidate's own or their spouse's.",
      required: true,
    });
    documents.push({
      id: "creamyDeclaration",
      label: "Declaration that the family is not in the creamy layer",
      detail:
        "The prescribed declaration also covers the non-income routes into the creamy layer — constitutional posts, Group A and Group B service, armed forces rank and professional standing.",
      required: true,
    });
  }

  if (profile.marriedWoman) {
    documents.push({
      id: "marriage",
      label: "Marriage certificate, with the father's caste certificate",
      detail:
        "A woman keeps the caste she was born into. The certificate issues on the father's caste; the marriage certificate only explains the change of surname or address.",
      required: true,
    });
  }

  if (profile.interCasteParents) {
    documents.push({
      id: "bothParents",
      label: "Caste certificates of both parents",
      detail:
        "Where the parents married across categories, the authority examines which parent's community the child was actually brought up in before deciding.",
      required: true,
    });
  }

  if (profile.migratedFromAnotherState) {
    documents.push({
      id: "originState",
      label: "Caste certificate from the state of origin",
      detail:
        "Keep it for the record, but note that SC and ST status does not travel between states — the entry has to exist for the state where you now apply.",
      required: true,
    });
  }

  if (profile.isMinor) {
    documents.push({
      id: "guardian",
      label: "Guardian's identity and signed application",
      detail: "A minor's application is made and signed by a parent or guardian.",
      required: true,
    });
  }

  return documents;
}

/**
 * Build the checklist and run the eligibility bars.
 *
 * @param {object} input
 * @param {string} input.categoryId  One of the CATEGORIES ids.
 * @param {string} input.religionId  One of the RELIGIONS ids.
 * @param {object} [input.profile]   Applicant circumstances.
 * @param {number} [input.countedIncome] Gross annual income excluding salary and agriculture.
 * @param {boolean} [input.sustainedThreeYears]
 * @returns {object} result object, or { error } for input that cannot be used.
 */
export function buildCasteCertificateChecklist({
  categoryId = "sc",
  religionId = "hindu",
  profile = {},
  countedIncome = 0,
  sustainedThreeYears = true,
} = {}) {
  const category = CATEGORIES.find((entry) => entry.id === categoryId);
  if (!category) return { error: "Choose SC, ST or one of the OBC options." };

  const religion = RELIGIONS.find((entry) => entry.id === religionId);
  if (!religion) return { error: "Choose the religion the applicant professes." };

  const income = Number(countedIncome);
  if (!Number.isFinite(income)) {
    return { error: "Enter the annual income as a number, or 0 if there is none." };
  }
  if (income < 0) return { error: "Income cannot be negative." };
  if (income > 1e11) return { error: "That income figure is outside the range of this checklist." };

  const blockers = [];
  const notes = [];

  if (category.religionBar && !SC_ELIGIBLE_RELIGIONS.includes(religionId)) {
    blockers.push({
      id: "religion",
      title: "Religion bar under the Scheduled Castes Order",
      detail: `Paragraph 3 of the Constitution (Scheduled Castes) Order, 1950 limits Scheduled Caste status to persons professing the Hindu, Sikh or Buddhist religion. A ${religion.label} applicant cannot be issued a Scheduled Caste certificate on that entry.`,
    });
  }

  if (categoryId === "st") {
    notes.push({
      id: "stReligion",
      title: "No religion condition for Scheduled Tribes",
      detail:
        "The Scheduled Tribes Order carries no equivalent of paragraph 3, so tribal status does not depend on the religion professed.",
    });
  }

  if (profile.migratedFromAnotherState && (categoryId === "sc" || categoryId === "st")) {
    blockers.push({
      id: "migration",
      title: "Status does not transfer between states",
      detail:
        "Scheduled Caste and Scheduled Tribe entries are notified for a named state or area. Following Marri Chandra Shekhar Rao (1990) and the Action Committee case (1994), a person notified in one state cannot claim that status in another. Check whether your caste appears in the list for the state where you now live.",
    });
  }

  if (profile.claimingHusbandsCaste) {
    blockers.push({
      id: "husbandCaste",
      title: "Caste is not acquired by marriage",
      detail:
        "Following Sunita Singh v. State of Uttar Pradesh (2018), a woman retains the caste she was born into. A certificate cannot be issued on the husband's caste — apply on your father's.",
    });
  }

  if (profile.casteNotInStateList) {
    blockers.push({
      id: "notListed",
      title: "The caste is not in the notified list for this state",
      detail:
        "Only Parliament can add to or remove from the Presidential Lists under Articles 341(2) and 342(2). No authority or court can read an entry in, as State of Maharashtra v. Milind (2001) confirmed.",
    });
  }

  const creamyLayer = category.incomeTest
    ? testCreamyLayer(income, sustainedThreeYears)
    : null;

  if (creamyLayer && creamyLayer.inCreamyLayer) {
    blockers.push({
      id: "creamyLayer",
      title: "Family falls in the creamy layer",
      detail: creamyLayer.note,
    });
  }

  if (category.incomeTest) {
    notes.push({
      id: "incomeExclusions",
      title: "Salary and agricultural income are left out",
      detail:
        "The creamy layer income figure excludes income from salaries and from agricultural land, so it is often far lower than what the family actually earns.",
    });
    notes.push({
      id: "otherRoutes",
      title: "Income is only one of six routes into the creamy layer",
      detail:
        "Constitutional posts, Group A and Group B service, armed forces rank, professional standing and property holding each have their own test, quite apart from income.",
    });
  }

  const documents = buildDocuments(category, {
    marriedWoman: Boolean(profile.marriedWoman),
    interCasteParents: Boolean(profile.interCasteParents),
    migratedFromAnotherState: Boolean(profile.migratedFromAnotherState),
    isMinor: Boolean(profile.isMinor),
  });

  const requiredDocuments = documents.filter((doc) => doc.required);
  const optionalDocuments = documents.filter((doc) => !doc.required);

  const eligible = blockers.length === 0;
  const verdict = eligible
    ? `No bar found on these answers — assemble the ${requiredDocuments.length} required documents.`
    : `${blockers.length} bar(s) apply. Resolve these before filing, because the paperwork will not overcome them.`;

  return {
    category,
    religion,
    blockers,
    notes,
    creamyLayer,
    documents,
    requiredDocuments,
    optionalDocuments,
    eligible,
    verdict,
  };
}

/**
 * How ready the file is, measured against the required documents only.
 *
 * @param {Array<{id:string,required:boolean}>} documents
 * @param {Array<string>} haveIds
 * @returns {{ have:number, total:number, percent:number, missing:Array, ready:boolean }}
 */
export function computeReadiness(documents, haveIds) {
  const list = Array.isArray(documents) ? documents : [];
  const have = Array.isArray(haveIds) ? haveIds : [];
  const requiredDocs = list.filter((doc) => doc.required);
  const missing = requiredDocs.filter((doc) => !have.includes(doc.id));
  const total = requiredDocs.length;
  const held = total - missing.length;
  return {
    have: held,
    total,
    percent: total === 0 ? 0 : Math.round((held / total) * 100),
    missing,
    ready: total > 0 && missing.length === 0,
  };
}

export default buildCasteCertificateChecklist;
