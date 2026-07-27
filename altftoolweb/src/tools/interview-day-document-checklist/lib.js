/**
 * Interview and document-verification day: which originals, how many photocopy sets,
 * and what that actually costs in pages, signatures and money.
 *
 * Rule sources:
 *
 *  - Date of birth. For UPSC examinations and most central recruitments, only the
 *    date of birth recorded in the Matriculation or Secondary School Leaving
 *    Certificate is accepted. An affidavit, a horoscope, a birth certificate issued
 *    later or a school transfer certificate is not a substitute, and a request to
 *    change the date afterwards is not entertained.
 *
 *  - Category certificates. For a central government post the SC, ST, OBC-NCL and
 *    EWS certificate has to be in the central format prescribed in the notice. A
 *    certificate in the state's own format is not accepted for a central post. The
 *    OBC non-creamy-layer certificate additionally has to be current — issued and
 *    valid with reference to the closing date fixed in the notice, not merely at some
 *    point in the past.
 *
 *  - Attestation. Self-attestation is the norm across central recruitment following
 *    the government's 2016 move away from attestation by a gazetted officer. Each
 *    photocopy is signed by the candidate on the face of the page. A few state and
 *    defence boards still ask for gazetted attestation, which is why the mode is a
 *    choice here and not an assumption.
 *
 *  - Serving government employees. A candidate already in government service must
 *    produce a No Objection Certificate from the employer at the interview, and
 *    should have informed the employer at the time of applying.
 *
 *  - Number of photocopy sets and passport photographs. This is set by the call
 *    letter for your own board and varies widely — three sets is common at a
 *    Services Selection Board, one self-attested set at a bank or SSC verification.
 *    Both are inputs here rather than invented figures.
 *
 * Informational only. The call letter and the notice for your own recruitment are the
 * authority on formats, validity dates and the number of copies.
 */

/** Seconds it realistically takes to sign one page of a photocopy set. */
export const SECONDS_PER_SIGNATURE = 6;

/** Spare photographs worth carrying beyond what the call letter asks for. */
export const SPARE_PHOTOGRAPHS = 4;

const MAX_SETS = 20;
const MAX_COST_PER_PAGE = 100;

export const INTERVIEW_TYPES = [
  {
    id: "upsc",
    label: "UPSC Personality Test",
    defaultSets: 2,
    defaultPhotos: 6,
    note: "Documents are verified against the Detailed Application Form. Carry the TA form and your journey tickets — the Commission reimburses the journey on the prescribed form.",
  },
  {
    id: "ssb",
    label: "Services Selection Board (Army, Navy, Air Force)",
    defaultSets: 3,
    defaultPhotos: 15,
    note: "An SSB runs five days and the document check happens on day one. Call letters typically ask for several attested sets and a large number of identical photographs.",
  },
  {
    id: "ssc",
    label: "SSC document verification",
    defaultSets: 1,
    defaultPhotos: 4,
    note: "Verification is against what you declared in the online application. Any mismatch in name spelling, category or date of birth is raised here.",
  },
  {
    id: "bank",
    label: "Bank interview (IBPS / SBI)",
    defaultSets: 1,
    defaultPhotos: 4,
    note: "One self-attested set alongside the originals is the usual requirement, plus proof of the qualifying degree as on the cut-off date.",
  },
  {
    id: "statepsc",
    label: "State PSC interview",
    defaultSets: 2,
    defaultPhotos: 6,
    note: "State posts accept the state's own category format, and often require a domicile or nativity certificate that central recruitments do not.",
  },
  {
    id: "psu",
    label: "PSU interview (GATE or campus route)",
    defaultSets: 2,
    defaultPhotos: 6,
    note: "The score card and the semester-wise marksheets are checked together, so carry every semester rather than only the consolidated sheet.",
  },
];

export const CATEGORIES = [
  { id: "general", label: "General / UR" },
  { id: "ews", label: "EWS" },
  { id: "obc", label: "OBC — non-creamy-layer" },
  { id: "scst", label: "SC or ST" },
];

/** Documents everybody carries, with the number of A4 sides each one runs to. */
function baseDocuments(type) {
  const docs = [
    {
      id: "callLetter",
      label: "Interview call letter or admit card",
      pages: 1,
      original: true,
      copy: true,
      detail: "Print two. One is surrendered at the desk and you keep the second for your own record.",
    },
    {
      id: "photoId",
      label: "Photo identity — Aadhaar, passport, voter ID or driving licence",
      pages: 1,
      original: true,
      copy: true,
      detail: "The name on it must match the application exactly, including initials and their order.",
    },
    {
      id: "matric",
      label: "Class 10 / Matriculation certificate",
      pages: 1,
      original: true,
      copy: true,
      detail:
        "This is the date-of-birth document. For central recruitments only the date recorded here is accepted — a birth certificate or affidavit will not do.",
    },
    {
      id: "twelfth",
      label: "Class 12 marksheet and certificate",
      pages: 2,
      original: true,
      copy: true,
      detail: "Both the marksheet and the pass certificate, since the two carry different details.",
    },
    {
      id: "degreeMarks",
      label: "Degree marksheets, every semester or year",
      pages: 8,
      original: true,
      copy: true,
      detail:
        "Carry all of them, not only the consolidated sheet. Panels routinely ask for a specific semester and a missing one stalls the file.",
    },
    {
      id: "degreeCert",
      label: "Degree certificate, or the provisional certificate",
      pages: 1,
      original: true,
      copy: true,
      detail:
        "Where the convocation has not happened, the provisional certificate plus the result declaration is accepted, provided the result was declared before the cut-off date in the notice.",
    },
    {
      id: "photos",
      label: "Passport photographs, identical to the one in the application",
      pages: 0,
      original: true,
      copy: false,
      detail:
        "Fresh prints of the same image. A different photograph, or a much older one, triggers a verification query at the desk.",
    },
  ];

  if (type.id === "upsc" || type.id === "statepsc") {
    docs.push({
      id: "daf",
      label: "Printed Detailed Application Form with the declaration signed",
      pages: 6,
      original: true,
      copy: true,
      detail:
        "The panel reads from this. Know every hobby, posting preference and service preference you entered, because those are the questions.",
    });
    docs.push({
      id: "taForm",
      label: "Travelling allowance form and your journey tickets",
      pages: 2,
      original: true,
      copy: false,
      detail:
        "Reimbursement is claimed on the prescribed form against the actual ticket or PNR. Keep the return leg receipt too.",
    });
  }

  if (type.id === "ssb") {
    docs.push({
      id: "ssbSet",
      label: "Attested photocopy sets as specified in the call letter",
      pages: 0,
      original: false,
      copy: false,
      detail:
        "Count the sets the call letter names and prepare them in advance. Photocopy shops near a selection centre are overwhelmed on reporting day.",
    });
    docs.push({
      id: "ndaId",
      label: "Original identity proof issued by the school or college",
      pages: 1,
      original: true,
      copy: true,
      detail: "Required in addition to the government ID for candidates applying straight from school or college.",
    });
  }

  if (type.id === "psu" || type.id === "ssc" || type.id === "bank") {
    docs.push({
      id: "scoreCard",
      label: "Score card or result printout for the qualifying stage",
      pages: 1,
      original: true,
      copy: true,
      detail: "Download a fresh copy — the portal often reissues these with a later date and a fresh barcode.",
    });
  }

  return docs;
}

/**
 * Build the document list for an interview and a candidate profile.
 *
 * @param {object} input
 * @param {string} input.typeId
 * @param {string} input.categoryId
 * @param {object} [input.profile]
 * @returns {object} { type, category, documents } or { error }.
 */
export function buildInterviewDocuments({ typeId = "upsc", categoryId = "general", profile = {} } = {}) {
  const type = INTERVIEW_TYPES.find((entry) => entry.id === typeId);
  if (!type) return { error: "Choose the kind of interview or verification you are attending." };

  const category = CATEGORIES.find((entry) => entry.id === categoryId);
  if (!category) return { error: "Choose the category you applied under." };

  const documents = baseDocuments(type);

  if (categoryId === "scst") {
    documents.push({
      id: "caste",
      label: "SC or ST certificate in the prescribed format",
      pages: 1,
      original: true,
      copy: true,
      detail:
        "For a central post the certificate has to be in the central format printed in the notice, issued by a competent authority named there. A state-format certificate is not accepted.",
    });
  }
  if (categoryId === "obc") {
    documents.push({
      id: "obc",
      label: "OBC non-creamy-layer certificate, current as on the closing date",
      pages: 1,
      original: true,
      copy: true,
      detail:
        "Two things are checked: the central format, and that the non-creamy-layer status is valid with reference to the closing date in the notice. An old certificate is the single commonest reason an OBC claim is rejected at verification.",
    });
  }
  if (categoryId === "ews") {
    documents.push({
      id: "ews",
      label: "EWS income and asset certificate in the prescribed format",
      pages: 1,
      original: true,
      copy: true,
      detail:
        "Issued on the income and assets of the preceding financial year, in the format annexed to the notice, by an authority listed there.",
    });
  }

  if (profile.pwbd) {
    documents.push({
      id: "pwbd",
      label: "Disability certificate, and the scribe sanction if one was granted",
      pages: 2,
      original: true,
      copy: true,
      detail:
        "The certificate has to be in the format prescribed under the Rights of Persons with Disabilities Act and issued by the notified medical authority.",
    });
  }
  if (profile.exServiceman) {
    documents.push({
      id: "esm",
      label: "Discharge book and ex-serviceman certificate",
      pages: 3,
      original: true,
      copy: true,
      detail: "The discharge particulars page and the service certificate are both checked.",
    });
  }
  if (profile.inGovtService) {
    documents.push({
      id: "noc",
      label: "No Objection Certificate from your present employer",
      pages: 1,
      original: true,
      copy: true,
      detail:
        "A candidate already in government service must produce this at the interview, and should have informed the employer when applying. Without it the candidature is held up.",
    });
  }
  if (profile.nameChanged) {
    documents.push({
      id: "nameChange",
      label: "Gazette notification or marriage certificate for the change of name",
      pages: 2,
      original: true,
      copy: true,
      detail:
        "Any difference between the name on the Class 10 certificate and the name in the application has to be bridged by a document, not an explanation.",
    });
  }
  if (profile.gapYears) {
    documents.push({
      id: "gapAffidavit",
      label: "Affidavit or explanation covering the gap years",
      pages: 1,
      original: true,
      copy: true,
      detail:
        "Boards ask what you did between two qualifications. A signed statement, with any employment or coaching proof, settles it in one sentence.",
    });
  }
  if (profile.experience) {
    documents.push({
      id: "experience",
      label: "Experience certificates and the latest salary slips",
      pages: 4,
      original: true,
      copy: true,
      detail: "On the employer's letterhead, with the exact dates of joining and relieving.",
    });
  }

  return { type, category, documents };
}

/**
 * Turn the document list into a photocopy plan: pages, sets, signatures and cost.
 *
 * @param {object} input
 * @param {Array<object>} input.documents
 * @param {number} input.sets              Photocopy sets the call letter asks for.
 * @param {number} input.costPerPage       Local photocopy rate in rupees.
 * @param {number} input.photographs       Photographs the call letter asks for.
 * @param {boolean} [input.selfAttested]   True for self-attestation, false for gazetted.
 * @returns {object} plan, or { error }.
 */
export function computeCopyPlan({
  documents = [],
  sets = 2,
  costPerPage = 2,
  photographs = 6,
  selfAttested = true,
} = {}) {
  const list = Array.isArray(documents) ? documents : [];
  const setCount = Number(sets);
  const rate = Number(costPerPage);
  const photoCount = Number(photographs);

  if (![setCount, rate, photoCount].every((value) => Number.isFinite(value))) {
    return { error: "Enter the number of sets, the photocopy rate and the photograph count as numbers." };
  }
  if (setCount < 0 || rate < 0 || photoCount < 0) {
    return { error: "None of these can be negative." };
  }
  if (setCount > MAX_SETS) {
    return { error: `No call letter asks for more than ${MAX_SETS} photocopy sets. Check the figure.` };
  }
  if (rate > MAX_COST_PER_PAGE) {
    return { error: `A photocopy rate above ${MAX_COST_PER_PAGE} rupees a page is not realistic.` };
  }
  if (photoCount > 100) {
    return { error: "More than 100 photographs is beyond anything a board asks for." };
  }

  const wholeSets = Math.floor(setCount);
  const copyDocs = list.filter((doc) => doc.copy && doc.pages > 0);
  const pagesPerSet = copyDocs.reduce((sum, doc) => sum + doc.pages, 0);
  const totalPages = pagesPerSet * wholeSets;
  const cost = Math.round(totalPages * rate * 100) / 100;
  const signatures = selfAttested ? totalPages : 0;
  const signingSeconds = signatures * SECONDS_PER_SIGNATURE;
  const originals = list.filter((doc) => doc.original).length;

  return {
    documentCount: list.length,
    originals,
    copyDocumentCount: copyDocs.length,
    pagesPerSet,
    sets: wholeSets,
    totalPages,
    costPerPage: rate,
    cost,
    selfAttested,
    signatures,
    signingMinutes: Math.ceil(signingSeconds / 60),
    photographs: Math.floor(photoCount),
    photographsToCarry: Math.floor(photoCount) + SPARE_PHOTOGRAPHS,
    attestationNote: selfAttested
      ? `Sign every one of the ${totalPages} pages yourself on the face of the page, with the date. Self-attestation is the norm across central recruitment.`
      : `Gazetted attestation means all ${totalPages} pages have to be signed and stamped by the attesting officer. Book that appointment days ahead, not the night before.`,
  };
}

/**
 * Readiness across every document on the list.
 *
 * @param {Array<{id:string}>} documents
 * @param {Array<string>} readyIds
 * @returns {{ ready:number, total:number, percent:number, missing:Array, complete:boolean }}
 */
export function computeDocumentReadiness(documents, readyIds) {
  const list = Array.isArray(documents) ? documents : [];
  const held = Array.isArray(readyIds) ? readyIds : [];
  const missing = list.filter((doc) => !held.includes(doc.id));
  const total = list.length;
  const have = total - missing.length;
  return {
    ready: have,
    total,
    percent: total === 0 ? 0 : Math.round((have / total) * 100),
    missing,
    complete: total > 0 && missing.length === 0,
  };
}

export default buildInterviewDocuments;
