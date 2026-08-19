/**
 * Railway Recruitment Board (RRB) application checklist — details, certificates,
 * uploads and the fee-refund arithmetic.
 *
 * Rule sources (Centralised Employment Notices published by the RRBs):
 *
 *  - Examination fee. RRB CENs charge ₹500 to candidates generally, of which ₹400 is
 *    refunded — less bank charges — to anyone who actually appears in the first stage
 *    Computer Based Test. Candidates in the concession bracket pay ₹250, the whole of
 *    which is refunded less bank charges on appearing in CBT-1. The concession bracket
 *    covers SC, ST, ex-servicemen, persons with benchmark disability, all women,
 *    transgender candidates, candidates from notified minority communities, and
 *    candidates of Economically Backward Class. The practical consequence is that a
 *    General or OBC male candidate who sits the exam ends up out of pocket by ₹100,
 *    and everyone in the concession bracket by nothing at all.
 *
 *  - Economically Backward Class for this fee concession means annual family income
 *    below ₹50,000, proved by an income certificate from a competent authority or by
 *    a BPL card. It is a fee rule only and confers no reservation.
 *
 *  - Notified minority communities are those recognised under the National Commission
 *    for Minorities Act, 1992 — Muslims, Christians, Sikhs, Buddhists and Parsis —
 *    with Jains added by notification in January 2014. The claim is made on a
 *    self-declaration on the prescribed format.
 *
 *  - SC and ST candidates are issued free second-class travel authority for the CBT,
 *    which is generated only if the caste certificate is uploaded with the
 *    application.
 *
 *  - Uploads. Recent CENs ask for a recent colour photograph of 35 mm x 45 mm as a
 *    JPEG of 20 to 50 KB, a signature in running hand in black or blue ink on white
 *    paper as a JPEG of 10 to 40 KB, and — where claimed — the SC/ST certificate and
 *    the scribe's photograph as JPEGs of 50 to 100 KB. A signature in capital letters
 *    is treated as invalid and the application is rejected.
 *
 *  - One application per candidate per CEN. Multiple applications against the same CEN
 *    lead to rejection of all of them and to debarment.
 *
 * Fees, dimensions and age bands are re-stated in every CEN and do change. This is
 * informational only; the CEN for your cycle is the authority.
 */

/** Fee charged to candidates outside the concession bracket. */
export const FEE_STANDARD = 500;
/** Portion of the standard fee refunded on appearing in CBT-1, before bank charges. */
export const REFUND_STANDARD = 400;
/** Fee charged to candidates inside the concession bracket. */
export const FEE_CONCESSION = 250;
/** Portion of the concession fee refunded on appearing in CBT-1, before bank charges. */
export const REFUND_CONCESSION = 250;
/** Annual family income below which the Economically Backward Class fee concession applies. */
export const EBC_INCOME_LIMIT = 50000;
/** Upper bound on how many CENs this tool will cost out at once. */
export const MAX_APPLICATIONS = 12;

/** Communities notified as minorities for the fee concession. */
export const MINORITY_COMMUNITIES = [
  "Muslim",
  "Christian",
  "Sikh",
  "Buddhist",
  "Parsi",
  "Jain",
];

export const CATEGORIES = [
  { id: "ur", label: "Unreserved / General" },
  { id: "ews", label: "EWS" },
  { id: "obc", label: "OBC (non-creamy layer)" },
  { id: "sc", label: "Scheduled Caste" },
  { id: "st", label: "Scheduled Tribe" },
];

/** Post groups the RRBs recruit for, with what each one adds to the file. */
export const RRB_EXAMS = [
  {
    id: "group-d",
    label: "Group D / Level 1",
    qualification: "Class 10 pass, or ITI, or National Apprenticeship Certificate",
    extras: ["itiOrNac", "physical"],
    note: "Physical Efficiency Test is a pass-or-fail stage with separate male and female standards.",
  },
  {
    id: "ntpc-graduate",
    label: "NTPC — graduate level",
    qualification: "Degree in any discipline from a recognised university",
    extras: ["degree", "typing"],
    note: "Typing skill test on a computer applies to Junior Clerk and Accounts Clerk posts.",
  },
  {
    id: "ntpc-undergraduate",
    label: "NTPC — undergraduate level",
    qualification: "Class 12 pass in any stream",
    extras: ["class12", "typing"],
    note: "Commercial cum Ticket Clerk and Junior Clerk posts carry a typing test.",
  },
  {
    id: "alp",
    label: "Assistant Loco Pilot",
    qualification: "Class 10 with ITI in a notified trade, or a three-year diploma in engineering",
    extras: ["itiOrNac", "aptitude", "vision"],
    note: "Computer Based Aptitude Test is mandatory and its score carries 30% weight in the merit list.",
  },
  {
    id: "technician",
    label: "Technician",
    qualification: "Class 10 with ITI, or Class 12 with Physics and Maths, depending on the grade",
    extras: ["itiOrNac", "vision"],
    note: "Grade I and Grade III have different qualifications — read the post table before choosing.",
  },
  {
    id: "je",
    label: "Junior Engineer and allied",
    qualification: "Three-year engineering diploma or a degree in the notified branch",
    extras: ["degree"],
    note: "The branch has to match the notified equivalence list exactly; near matches are rejected.",
  },
  {
    id: "paramedical",
    label: "Paramedical categories",
    qualification: "Post-specific medical qualification with council registration",
    extras: ["degree", "councilRegistration"],
    note: "Registration with the relevant council must be live on the closing date.",
  },
];

/** Scanned uploads the online form takes. */
export const UPLOAD_SPECS = [
  {
    id: "photo",
    label: "Recent colour photograph",
    size: "35 mm x 45 mm",
    fileSize: "20 - 50 KB",
    format: "JPEG",
    detail:
      "Front-facing, plain light background, no cap or dark glasses, taken within the window the CEN states. The same photograph has to be carried to every stage.",
    always: true,
  },
  {
    id: "signature",
    label: "Signature",
    size: "Running hand on white paper",
    fileSize: "10 - 40 KB",
    format: "JPEG",
    detail:
      "Black or blue ink, signed by the candidate. A signature in block capitals is treated as invalid and the application is rejected outright.",
    always: true,
  },
  {
    id: "casteCert",
    label: "SC / ST certificate",
    size: "Full page scan",
    fileSize: "50 - 100 KB",
    format: "JPEG",
    detail:
      "Needed to generate the free second-class travel authority for the CBT. Without the upload no pass is issued.",
    always: false,
    when: (input) => input.categoryId === "sc" || input.categoryId === "st",
  },
  {
    id: "scribePhoto",
    label: "Scribe's photograph and details",
    size: "35 mm x 45 mm",
    fileSize: "50 - 100 KB",
    format: "JPEG",
    detail:
      "Only where a scribe is requested. The scribe's own identity proof is verified at the centre.",
    always: false,
    when: (input) => Boolean(input.pwbd) && Boolean(input.needsScribe),
  },
];

/** Details the online form asks for, grouped as the portal groups them. */
export const FORM_FIELDS = [
  { id: "aadhaar", label: "Aadhaar number, with the mobile linked to it reachable", group: "Registration" },
  { id: "mobile", label: "Mobile number and email you will hold for at least a year", group: "Registration" },
  { id: "name", label: "Name spelled exactly as on the Class 10 certificate", group: "Personal" },
  { id: "dob", label: "Date of birth as on the Class 10 certificate", group: "Personal" },
  { id: "parents", label: "Father's and mother's names", group: "Personal" },
  { id: "community", label: "Community, and the certificate number behind it", group: "Personal" },
  { id: "qualification", label: "Qualification, board or university, year and percentage", group: "Academics" },
  { id: "postPreference", label: "Post preferences in order — this order is binding", group: "Preferences" },
  { id: "rrbChoice", label: "The single RRB you are applying to", group: "Preferences" },
  { id: "examCentre", label: "Exam-centre preferences for the CBT", group: "Preferences" },
  { id: "bankAccount", label: "Bank account and IFSC for the fee refund", group: "Payment" },
];

/** Certificates to have scanned and to hand, keyed to what the post or claim needs. */
const DOCUMENT_LIBRARY = {
  class10: { label: "Class 10 certificate — the date-of-birth proof", required: true },
  class12: { label: "Class 12 marksheet and certificate", required: true },
  degree: { label: "Degree or diploma certificate with all marksheets", required: true },
  itiOrNac: {
    label: "ITI certificate in a notified trade, or the National Apprenticeship Certificate",
    required: true,
  },
  councilRegistration: { label: "Live council registration certificate", required: true },
  aptitude: {
    label: "Note that the Aptitude Test score carries 30% weight for loco pilot merit",
    required: false,
  },
  vision: {
    label: "Check the A1 or A2 medical vision standard before applying — it disqualifies many candidates",
    required: false,
  },
  physical: {
    label: "Prepare for the Physical Efficiency Test — it is qualifying and cannot be relaxed",
    required: false,
  },
  typing: { label: "Typing practice on a computer for the skill test", required: false },
  bankProof: { label: "Bank passbook or cancelled cheque for the refund account", required: true },
  photoId: { label: "Photo ID — Aadhaar preferred, since the portal verifies against it", required: true },
};

const round0 = (value) => Math.round(value);

/**
 * Whether the candidate falls in the reduced-fee bracket.
 *
 * @returns {{concession:boolean, reasons:string[]}}
 */
export function feeConcession({
  categoryId = "ur",
  female = false,
  transgender = false,
  pwbd = false,
  exServiceman = false,
  minority = false,
  ebc = false,
} = {}) {
  const reasons = [];
  if (categoryId === "sc") reasons.push("Scheduled Caste");
  if (categoryId === "st") reasons.push("Scheduled Tribe");
  if (female) reasons.push("Woman candidate");
  if (transgender) reasons.push("Transgender candidate");
  if (pwbd) reasons.push("Person with benchmark disability");
  if (exServiceman) reasons.push("Ex-serviceman");
  if (minority) reasons.push("Notified minority community");
  if (ebc) reasons.push(`Economically Backward Class — family income below ${EBC_INCOME_LIMIT}`);
  return { concession: reasons.length > 0, reasons };
}

/**
 * Fee payable, refund on appearing in CBT-1, and what it really costs.
 *
 * @param {object} input
 * @param {number} [input.applications] How many CENs the same profile is applying to.
 * @param {boolean} [input.appearsInCbt1] Whether the candidate actually sits the first CBT.
 * @returns {object} fee breakdown, or { error }.
 */
export function computeRrbFee(input = {}) {
  const { applications = 1, appearsInCbt1 = true } = input;
  const count = Number(applications);
  if (!Number.isFinite(count)) return { error: "Enter how many applications as a whole number." };
  if (count < 1) return { error: "You need at least one application to work out a fee." };
  if (count > MAX_APPLICATIONS) {
    return { error: `This tool costs out up to ${MAX_APPLICATIONS} applications at a time.` };
  }
  const whole = Math.floor(count);

  const { concession, reasons } = feeConcession(input);
  const feeEach = concession ? FEE_CONCESSION : FEE_STANDARD;
  const refundEach = appearsInCbt1 ? (concession ? REFUND_CONCESSION : REFUND_STANDARD) : 0;
  const netEach = feeEach - refundEach;

  return {
    concession,
    reasons,
    applications: whole,
    feeEach: round0(feeEach),
    refundEach: round0(refundEach),
    netEach: round0(netEach),
    feeTotal: round0(feeEach * whole),
    refundTotal: round0(refundEach * whole),
    netTotal: round0(netEach * whole),
    appearsInCbt1: Boolean(appearsInCbt1),
  };
}

/**
 * The whole application file for one RRB post group.
 *
 * @returns {object} checklist result, or { error }.
 */
export function buildRrbChecklist(input = {}) {
  const exam = RRB_EXAMS.find((entry) => entry.id === (input.examId || "group-d"));
  if (!exam) return { error: "Pick one of the RRB post groups." };

  const category = CATEGORIES.find((entry) => entry.id === (input.categoryId || "ur"));
  if (!category) return { error: "Pick the community you will claim on the form." };

  const fee = computeRrbFee(input);
  if (fee.error) return { error: fee.error };

  const docIds = ["class10", "photoId", "bankProof", ...exam.extras];
  const documents = [];
  const seen = new Set();
  docIds.forEach((id) => {
    const entry = DOCUMENT_LIBRARY[id];
    if (!entry || seen.has(id)) return;
    seen.add(id);
    documents.push({ id, ...entry });
  });

  if (category.id !== "ur") {
    documents.push({
      id: `categoryCert-${category.id}`,
      label: `${category.label} certificate in the format the CEN prescribes`,
      required: true,
    });
  }
  if (input.ebc) {
    documents.push({
      id: "ebcProof",
      label: `Income certificate showing family income below ${EBC_INCOME_LIMIT} a year, or a BPL card`,
      required: true,
    });
  }
  if (input.minority) {
    documents.push({
      id: "minorityDeclaration",
      label: "Self-declaration of belonging to a notified minority community, in the prescribed format",
      required: true,
    });
  }
  if (input.pwbd) {
    documents.push({
      id: "pwbdCert",
      label: "Disability certificate showing 40% or more benchmark disability",
      required: true,
    });
  }
  if (input.exServiceman) {
    documents.push({
      id: "esmDischarge",
      label: "Discharge certificate, or the serving certificate where still in service",
      required: true,
    });
  }

  const uploads = UPLOAD_SPECS.filter((spec) => spec.always || (spec.when && spec.when(input)));

  const checklist = [
    ...FORM_FIELDS.map((field) => ({ ...field, kind: "field", required: true })),
    ...uploads.map((spec) => ({
      id: `upload-${spec.id}`,
      label: `${spec.label} — ${spec.format}, ${spec.fileSize}`,
      group: "Uploads",
      kind: "upload",
      required: true,
    })),
    ...documents.map((doc) => ({ ...doc, group: "Certificates", kind: "document" })),
  ];

  const warnings = [
    "One application per candidate per CEN. Two applications against the same CEN get both rejected and the candidate debarred.",
    exam.note,
  ];
  if (category.id === "sc" || category.id === "st") {
    warnings.push(
      "Upload the caste certificate or the free travel authority for the CBT will not be generated.",
    );
  }

  return {
    exam,
    category,
    fee,
    documents,
    uploads,
    fields: FORM_FIELDS,
    checklist,
    warnings,
  };
}

/**
 * Progress against required items only.
 *
 * @param {Array<{id:string,required:boolean}>} items
 * @param {Array<string>} doneIds
 */
export function computeChecklistProgress(items, doneIds) {
  const list = Array.isArray(items) ? items : [];
  const done = Array.isArray(doneIds) ? doneIds : [];
  const required = list.filter((item) => item.required !== false);
  const missing = required.filter((item) => !done.includes(item.id));
  const total = required.length;
  const held = total - missing.length;
  return {
    done: held,
    total,
    percent: total === 0 ? 0 : Math.round((held / total) * 100),
    missing,
    ready: total > 0 && missing.length === 0,
  };
}

export default buildRrbChecklist;
