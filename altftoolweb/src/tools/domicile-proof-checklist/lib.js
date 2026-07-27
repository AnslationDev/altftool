/**
 * Document checklist and residence test for an Indian domicile / residence /
 * permanent resident certificate.
 *
 * A domicile certificate is issued by a state or union territory, not the Union, so
 * the qualifying period and the exact form differ from state to state. What does not
 * differ is the structure of the file the revenue authority wants: identity, current
 * address, proof that the address has held for the qualifying period, parentage, and
 * a sworn declaration. That structure is what this module builds.
 *
 * Where a qualifying period is fixed by a notified rule it is given below with its
 * source. Everywhere else the period is left for you to enter from your own state's
 * e-district portal, because inventing a number would be worse than asking for one.
 *
 * Statutory reference points:
 *
 *  - Jammu and Kashmir: the Jammu and Kashmir Grant of Domicile Certificate
 *    (Procedure) Rules, 2020, made under the J&K Civil Services (Decentralisation and
 *    Recruitment) Act as adapted by the Jammu and Kashmir Reorganisation (Adaptation
 *    of State Laws) Order, 2020. A person qualifies on fifteen years of residence in
 *    the union territory, or on having studied for seven years and appeared in the
 *    Class 10 or Class 12 examination in an educational institution in J&K. Children
 *    of central government officers who served in J&K for ten years, and registered
 *    migrants, have their own routes.
 *
 *  - Most states have a Right to Public Services / Right to Service Act that puts a
 *    notified time limit on issue of a domicile certificate and gives an appeal to a
 *    designated officer if that limit is missed. Delhi's version is the Delhi (Right
 *    of Citizen to Time Bound Delivery of Services) Act, 2011.
 *
 *  - Domicile is generally single: a person holds domicile in one state at a time,
 *    and acquiring a new one requires abandoning the old. This is why applying in a
 *    second state after migrating usually fails without surrendering the first.
 *
 * Informational only. It is not legal advice, and no certificate issues without the
 * revenue authority's own enquiry through the Patwari, Village Officer or Tehsildar.
 */

/**
 * States and union territories, with a suggested qualifying period where a notified
 * rule fixes one. `residenceYears: null` means enter the period from your own state's
 * portal — the checklist works either way. Every suggested figure is editable.
 */
export const STATES = [
  {
    id: "jk",
    label: "Jammu and Kashmir",
    residenceYears: 15,
    basis:
      "Fixed by the J&K Grant of Domicile Certificate (Procedure) Rules, 2020, with a separate education route.",
    hasEducationRoute: true,
  },
  {
    id: "maharashtra",
    label: "Maharashtra",
    residenceYears: 15,
    basis: "Commonly applied period for a Maharashtra domicile certificate — confirm on Aaple Sarkar.",
    hasEducationRoute: false,
  },
  {
    id: "haryana",
    label: "Haryana",
    residenceYears: 15,
    basis: "Commonly applied period for a Haryana resident certificate — confirm on Antyodaya Saral.",
    hasEducationRoute: false,
  },
  {
    id: "rajasthan",
    label: "Rajasthan",
    residenceYears: 10,
    basis:
      "Commonly applied where the applicant was not born in the state — confirm on the e-Mitra portal.",
    hasEducationRoute: false,
  },
  {
    id: "delhi",
    label: "Delhi",
    residenceYears: 3,
    basis: "Commonly applied period for the Delhi e-District domicile service — confirm before filing.",
    hasEducationRoute: false,
  },
  { id: "up", label: "Uttar Pradesh", residenceYears: null, basis: "", hasEducationRoute: false },
  { id: "bihar", label: "Bihar", residenceYears: null, basis: "", hasEducationRoute: false },
  { id: "mp", label: "Madhya Pradesh", residenceYears: null, basis: "", hasEducationRoute: false },
  { id: "karnataka", label: "Karnataka", residenceYears: null, basis: "", hasEducationRoute: false },
  { id: "tamilnadu", label: "Tamil Nadu", residenceYears: null, basis: "", hasEducationRoute: false },
  { id: "westbengal", label: "West Bengal", residenceYears: null, basis: "", hasEducationRoute: false },
  { id: "gujarat", label: "Gujarat", residenceYears: null, basis: "", hasEducationRoute: false },
  { id: "kerala", label: "Kerala", residenceYears: null, basis: "", hasEducationRoute: false },
  { id: "punjab", label: "Punjab", residenceYears: null, basis: "", hasEducationRoute: false },
  { id: "telangana", label: "Telangana", residenceYears: null, basis: "", hasEducationRoute: false },
  { id: "odisha", label: "Odisha", residenceYears: null, basis: "", hasEducationRoute: false },
  { id: "assam", label: "Assam", residenceYears: null, basis: "", hasEducationRoute: false },
  { id: "uttarakhand", label: "Uttarakhand", residenceYears: null, basis: "", hasEducationRoute: false },
  { id: "other", label: "Another state or union territory", residenceYears: null, basis: "", hasEducationRoute: false },
];

/** The J&K education route: years of study that substitute for the residence period. */
export const JK_EDUCATION_ROUTE_YEARS = 7;

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Documents the checklist can ask for. `required` is decided per applicant below.
 */
function baseDocuments(profile) {
  const documents = [];

  documents.push({
    id: "application",
    label: "Completed application form from the state e-district portal",
    detail:
      "File online where the state offers it. A portal acknowledgement number is what starts the clock under the state's Right to Service Act.",
    required: true,
  });
  documents.push({
    id: "identity",
    label: "Photo identity — Aadhaar, voter ID, PAN or passport",
    detail: "The name must match every other document exactly, including initials and spellings.",
    required: true,
  });
  documents.push({
    id: "address",
    label: "Current address proof — ration card, electricity or water bill, or property tax receipt",
    detail: "A bill in the applicant's own name carries more weight than one in a parent's name.",
    required: true,
  });
  documents.push({
    id: "duration",
    label: "Proof that the address has held for the qualifying period",
    detail:
      "School leaving or transfer certificate, land records, or an electoral roll extract showing the name at that address in the earliest qualifying year. This is the document applications most often lack.",
    required: true,
  });
  documents.push({
    id: "affidavit",
    label: "Self-declaration or affidavit on non-judicial stamp paper",
    detail:
      "Sworn before a notary or executive magistrate, stating continuous residence and that no domicile certificate is held in another state.",
    required: true,
  });
  documents.push({
    id: "photos",
    label: "Recent passport-size photographs",
    detail: "Usually two, matching the photograph uploaded on the portal.",
    required: true,
  });
  documents.push({
    id: "birth",
    label: "Birth certificate",
    detail: profile.bornInState
      ? "Being born in the state is usually the strongest single proof, so put this at the front of the file."
      : "Establishes age and parentage even where you were born elsewhere.",
    required: Boolean(profile.bornInState),
  });
  documents.push({
    id: "parentDomicile",
    label: "Parent's domicile certificate or residence proof",
    detail:
      "Where the applicant relies on a parent's long residence rather than their own, the parent's certificate is the anchor document.",
    required: Boolean(profile.isMinor) || !profile.bornInState,
  });

  if (profile.ownsPropertyInState) {
    documents.push({
      id: "property",
      label: "Registered sale deed or property tax receipt in the state",
      detail: "Ownership over several years is strong evidence of continuous residence.",
      required: true,
    });
  } else {
    documents.push({
      id: "tenancy",
      label: "Registered rent agreement with the landlord's no-objection letter",
      detail:
        "Unregistered leave-and-licence papers are frequently rejected. Add rent receipts or bank transfers covering the qualifying years.",
      required: true,
    });
  }

  if (profile.isMinor) {
    documents.push({
      id: "guardian",
      label: "Guardian's identity and declaration",
      detail: "A minor's application is signed by a parent or guardian, who must also prove identity.",
      required: true,
    });
    documents.push({
      id: "school",
      label: "School bonafide certificate and last marksheets",
      detail: "School records double as residence-duration proof for a student applicant.",
      required: true,
    });
  }

  if (profile.marriedWomanViaHusband) {
    documents.push({
      id: "marriage",
      label: "Marriage certificate",
      detail:
        "Required where a married woman applies on the strength of her husband's domicile rather than her own residence.",
      required: true,
    });
    documents.push({
      id: "husbandDomicile",
      label: "Husband's domicile certificate",
      detail: "The certificate being relied on must itself be current and from the same state.",
      required: true,
    });
  }

  if (profile.governmentTransfer) {
    documents.push({
      id: "service",
      label: "Service certificate from the employing department",
      detail:
        "Confirms posting in the state and the length of it, which several states accept in place of ordinary residence proof.",
      required: true,
    });
  }

  if (profile.studentApplicant) {
    documents.push({
      id: "institution",
      label: "Bonafide certificate from the school or college",
      detail:
        "Admission and quota claims usually need a certificate issued in the current academic year, not an older one.",
      required: true,
    });
  }

  documents.push({
    id: "fee",
    label: "Application fee or court fee stamp receipt",
    detail: "Small, but an application without it is returned unprocessed.",
    required: true,
  });
  documents.push({
    id: "surrender",
    label: "Proof of surrendering any earlier domicile from another state",
    detail:
      "Domicile is single. If you have held a certificate elsewhere, expect to be asked to surrender it before a fresh one issues.",
    required: false,
  });

  return documents;
}

/**
 * Build the checklist and test the residence period.
 *
 * @param {object} input
 * @param {string} input.stateId          One of the STATES ids.
 * @param {number} input.residenceYears   Qualifying period demanded by the state.
 * @param {number} input.yearsResided     Years the applicant has actually resided there.
 * @param {object} [input.profile]        Applicant circumstances.
 * @returns {object} result object, or { error } for input that cannot be used.
 */
export function buildDomicileChecklist({
  stateId = "delhi",
  residenceYears,
  yearsResided = 0,
  profile = {},
} = {}) {
  const state = STATES.find((entry) => entry.id === stateId);
  if (!state) return { error: "Choose a state or union territory from the list." };

  const required =
    residenceYears === undefined || residenceYears === null || residenceYears === ""
      ? state.residenceYears
      : Number(residenceYears);
  const resided = Number(yearsResided);

  if (required !== null && !Number.isFinite(required)) {
    return { error: "Enter the qualifying period in years, or leave it blank if you do not know it." };
  }
  if (!Number.isFinite(resided)) {
    return { error: "Enter how many years you have lived in the state as a number." };
  }
  if (resided < 0) return { error: "Years of residence cannot be negative." };
  if (resided > 120) return { error: "Enter a realistic number of years of residence." };
  if (required !== null && (required < 0 || required > 60)) {
    return { error: "A qualifying period should be between 0 and 60 years." };
  }

  const usedEducationRoute = Boolean(
    state.hasEducationRoute && profile.studiedSevenYearsAndSatBoardExam,
  );

  let meetsResidence;
  let residenceNote;
  if (usedEducationRoute) {
    meetsResidence = true;
    residenceNote = `Qualified through the education route — ${JK_EDUCATION_ROUTE_YEARS} years of study in the union territory and a Class 10 or 12 board examination taken there.`;
  } else if (required === null) {
    meetsResidence = null;
    residenceNote =
      "No qualifying period entered. Take it from your state's e-district portal and enter it above — the rest of the checklist still applies.";
  } else if (resided >= required) {
    meetsResidence = true;
    residenceNote = `${resided} years of residence meets the ${required}-year period.`;
  } else {
    meetsResidence = false;
    residenceNote = `${resided} years of residence falls short of the ${required}-year period.`;
  }

  const shortfallYears =
    meetsResidence === false && required !== null ? round2(required - resided) : 0;

  const documents = baseDocuments({
    bornInState: Boolean(profile.bornInState),
    isMinor: Boolean(profile.isMinor),
    marriedWomanViaHusband: Boolean(profile.marriedWomanViaHusband),
    ownsPropertyInState: Boolean(profile.ownsPropertyInState),
    governmentTransfer: Boolean(profile.governmentTransfer),
    studentApplicant: Boolean(profile.studentApplicant),
  });

  const requiredDocuments = documents.filter((doc) => doc.required);
  const optionalDocuments = documents.filter((doc) => !doc.required);

  const alternateRoutes = state.hasEducationRoute
    ? [
        `${JK_EDUCATION_ROUTE_YEARS} years of study in the union territory plus a Class 10 or Class 12 examination taken there`,
        "Children of central government officers who served in the union territory for ten years",
        "Persons registered as migrants with the Relief and Rehabilitation Commissioner",
      ]
    : [];

  let verdict;
  if (meetsResidence === true) {
    verdict = `Residence test met — assemble the ${requiredDocuments.length} required documents.`;
  } else if (meetsResidence === false) {
    verdict = `Residence test not met yet — ${shortfallYears} more year(s) needed on these figures.`;
  } else {
    verdict = `Qualifying period not set — ${requiredDocuments.length} documents are needed either way.`;
  }

  return {
    state,
    requiredYears: required,
    yearsResided: round2(resided),
    meetsResidence,
    residenceNote,
    shortfallYears,
    usedEducationRoute,
    documents,
    requiredDocuments,
    optionalDocuments,
    alternateRoutes,
    verdict,
  };
}

/**
 * How ready the file is, measured against the required documents only.
 *
 * @param {Array<{id:string,label:string,required:boolean}>} documents
 * @param {Array<string>} haveIds  Ids of documents already in hand.
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

export default buildDomicileChecklist;
