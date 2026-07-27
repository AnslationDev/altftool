/**
 * Surname Change After Marriage Checklist.
 *
 * Changing a surname on account of marriage is a different, lighter process
 * than a general legal name change, and the difference is worth money and
 * weeks of time:
 *
 *  - The marriage certificate is the operative document. Marriages in India
 *    are registered under Section 8 of the Hindu Marriage Act 1955 or under
 *    the Special Marriage Act 1954, and the Supreme Court in Seema v. Ashwani
 *    Kumar (2006) directed that all marriages be compulsorily registered. The
 *    certificate issued on that registration is what Aadhaar, PAN, passport
 *    and banks accept as proof of the change.
 *  - Because a marriage certificate exists, a Gazette notification is
 *    generally NOT required for a plain surname change on marriage. It becomes
 *    the safer route when the given name is also being changed, or when a
 *    surname is being reverted after divorce and the divorce decree alone is
 *    not accepted by an authority. GAZETTE_TRIGGERS below encodes that split.
 *  - Passport re-issue on account of marriage is applied for with the marriage
 *    certificate; where a certificate cannot be produced, Passport Seva's
 *    annexure route asks for a joint photograph and a declaration from both
 *    spouses instead. Both document sets are modelled here.
 *  - UIDAI's update policy allows a name update in Aadhaar only
 *    NAME_UPDATE_LIFETIME_LIMIT times in a lifetime, so the spelling on the
 *    marriage certificate should be checked before anything is filed.
 *  - No Indian law requires a spouse to take the other's surname. Every item
 *    here is optional; the checklist only sequences the work for people who
 *    have decided to do it.
 *
 * Informational only — not legal advice. Requirements vary by state, bank and
 * passport office.
 */

/** UIDAI permits a name update in Aadhaar only twice in a lifetime. */
export const NAME_UPDATE_LIFETIME_LIMIT = 2;

/** Documents that recur across the applications. */
export const DOCUMENTS = {
  marriage: "Marriage certificate (original + copies)",
  affidavit: "Notarised surname-change affidavit",
  jointPhoto: "Joint photograph with the spouse and a joint declaration",
  gazette: "Gazette notification (Part IV)",
  spouseId: "Spouse's ID / passport copy",
  oldId: "Existing ID in the old surname",
  address: "Current address proof",
  photos: "Recent passport-size photographs",
  aadhaarNew: "Aadhaar already updated to the new surname",
  panNew: "PAN already updated to the new surname",
  bankProof: "Bank passbook or statement in the new surname",
  divorce: "Decree of divorce",
};

/** Ordered phases. A phase is locked until the phase before it is complete. */
export const PHASES = [
  { id: "base", label: "1. Get the base document right" },
  { id: "identity", label: "2. Core identity documents" },
  { id: "money", label: "3. Banking and investments" },
  { id: "work", label: "4. Employment and statutory records" },
  { id: "rest", label: "5. Everything else" },
];

/**
 * The situation driving the change. `needsGazette` is true where a marriage
 * certificate on its own is usually not enough.
 */
export const GAZETTE_TRIGGERS = [
  {
    id: "surname-only",
    label: "Taking the spouse's surname, given name unchanged",
    needsGazette: false,
    reason:
      "A marriage certificate is normally accepted on its own for a surname change on marriage, so a Gazette notification is usually unnecessary.",
  },
  {
    id: "hyphenated",
    label: "Adding the spouse's surname to your own (double-barrelled)",
    needsGazette: false,
    reason:
      "Still a surname change flowing from the marriage, so the marriage certificate is usually enough — but write the full new form identically on every application.",
  },
  {
    id: "full-name",
    label: "Changing the given name as well as the surname",
    needsGazette: true,
    reason:
      "The marriage certificate only evidences the surname flowing from the marriage. A change to the given name sits outside it, so take the affidavit, newspaper advertisement and Gazette route.",
  },
  {
    id: "revert",
    label: "Reverting to the maiden surname after divorce",
    needsGazette: true,
    reason:
      "Practice varies: some authorities accept the decree of divorce alone, others insist on a Gazette notification. Publishing in the Gazette avoids being turned away twice.",
  },
];

/**
 * Checklist items. `mode` is how the application is normally made, which is
 * what drives the count of office visits still outstanding.
 */
export const ITEMS = [
  {
    id: "register-marriage",
    label: "Register the marriage and collect the certificate",
    phase: "base",
    mode: "in-person",
    docs: ["photos", "oldId", "address"],
    note: "Filed with the Registrar of Marriages under the Hindu Marriage Act 1955 or the Special Marriage Act 1954. Order at least four extra certified copies now — every later application wants one.",
  },
  {
    id: "check-spelling",
    label: "Check the spelling of the new name on the certificate",
    phase: "base",
    mode: "online",
    docs: ["marriage"],
    note: `Decide the exact spelling and spacing once and use it identically everywhere. Aadhaar allows only ${NAME_UPDATE_LIFETIME_LIMIT} name updates in a lifetime, so a correction later is expensive.`,
  },
  {
    id: "affidavit",
    label: "Swear a surname-change affidavit",
    phase: "base",
    mode: "in-person",
    docs: ["marriage", "oldId"],
    note: "Not always demanded, but cheap and it removes an argument at the counter. States the old name, the new name and that the change is on account of marriage.",
  },
  {
    id: "gazette",
    label: "Publish the Gazette notification",
    phase: "base",
    mode: "in-person",
    docs: ["affidavit", "photos"],
    onlyIfGazette: true,
    note: "Required only where the change goes beyond the surname flowing from the marriage. Newspaper advertisements normally accompany it.",
  },
  {
    id: "aadhaar",
    label: "Aadhaar name update",
    phase: "identity",
    mode: "in-person",
    docs: ["marriage", "oldId"],
    note: "Do this first among the IDs — the rest are verified against it. Update at an enrolment centre with the marriage certificate as proof.",
  },
  {
    id: "pan",
    label: "PAN correction",
    phase: "identity",
    mode: "online",
    docs: ["marriage", "aadhaarNew"],
    note: "Filed as a change request against the existing PAN. Match the Aadhaar spelling exactly or the PAN-Aadhaar linkage flags a mismatch.",
  },
  {
    id: "passport",
    label: "Passport re-issue in the new surname",
    phase: "identity",
    mode: "in-person",
    docs: ["marriage", "spouseId", "aadhaarNew"],
    note: "Applied as a re-issue on account of change of name. Where no marriage certificate can be produced, the annexure route uses a joint photograph and a declaration from both spouses.",
  },
  {
    id: "bank",
    label: "Bank accounts: KYC, signature and cards",
    phase: "money",
    mode: "in-person",
    docs: ["marriage", "aadhaarNew", "panNew"],
    note: "Update the name, refresh the specimen signature if it changes, and reissue the debit card and cheque book. Do every account, including dormant ones.",
  },
  {
    id: "kra",
    label: "Demat, mutual funds and KRA KYC",
    phase: "money",
    mode: "online",
    docs: ["panNew", "bankProof"],
    note: "The KRA record is keyed to PAN and carries bank details, so both must already show the new name.",
  },
  {
    id: "insurance",
    label: "Insurance policies and nominee details",
    phase: "money",
    mode: "online",
    docs: ["marriage", "panNew"],
    note: "Endorse each life and health policy, and use the same visit to update the nominee — this is the record most often left stale for years.",
  },
  {
    id: "small-savings",
    label: "PPF, NPS and small savings accounts",
    phase: "money",
    mode: "in-person",
    docs: ["marriage", "aadhaarNew", "panNew"],
    note: "Post office and bank-held schemes each need their own form; they are not covered by the bank KYC update.",
  },
  {
    id: "employer",
    label: "Employer HR, payroll and email",
    phase: "work",
    mode: "online",
    docs: ["marriage", "aadhaarNew"],
    note: "Payroll, Form 16, insurance endorsement and the work email alias all follow from the HR record.",
  },
  {
    id: "epfo",
    label: "EPFO / UAN member profile",
    phase: "work",
    mode: "online",
    docs: ["aadhaarNew", "panNew"],
    note: "A joint declaration is filed by the employer and validated against Aadhaar, so the employer record has to change first.",
  },
  {
    id: "incometax",
    label: "Income-tax e-filing profile and bank mandate",
    phase: "work",
    mode: "online",
    docs: ["panNew", "bankProof"],
    note: "Follows the PAN database. Re-validate the refund bank account after the bank name change or refunds fail.",
  },
  {
    id: "licence-body",
    label: "Professional registration or licence",
    phase: "work",
    mode: "in-person",
    docs: ["marriage", "gazette"],
    note: "Medical, bar, ICAI, nursing and similar councils each have their own form and often ask for the Gazette copy.",
  },
  {
    id: "dl",
    label: "Driving licence",
    phase: "rest",
    mode: "in-person",
    docs: ["marriage", "aadhaarNew", "address"],
    note: "Applied to the RTO that issued the licence.",
  },
  {
    id: "voter",
    label: "Voter ID (EPIC)",
    phase: "rest",
    mode: "online",
    docs: ["marriage", "aadhaarNew"],
    note: "Correction of entries in the electoral roll with the Electoral Registration Officer.",
  },
  {
    id: "property",
    label: "Property, society share certificate and utilities",
    phase: "rest",
    mode: "in-person",
    docs: ["marriage", "aadhaarNew"],
    note: "Society records, municipal property tax and each utility consumer account.",
  },
  {
    id: "education",
    label: "Degree and school certificates",
    phase: "rest",
    mode: "in-person",
    docs: ["marriage", "gazette"],
    note: "Optional, and many people keep qualifications in the maiden name. If you do change them, expect the longest wait of anything on this list.",
  },
  {
    id: "digital",
    label: "Email, LinkedIn and professional profiles",
    phase: "rest",
    mode: "online",
    docs: [],
    note: "Low stakes but high visibility. Consider keeping the maiden name visible as a former name so old contacts can still find you.",
  },
];

const ITEM_BY_ID = new Map(ITEMS.map((item) => [item.id, item]));

/**
 * Items that apply for a given situation — the Gazette step drops out when the
 * change is a plain surname change on marriage.
 * @param {string} triggerId One of GAZETTE_TRIGGERS ids.
 * @returns {object[]}
 */
export function applicableItems(triggerId) {
  const trigger = GAZETTE_TRIGGERS.find((t) => t.id === triggerId);
  if (!trigger) return [];
  return ITEMS.filter((item) => (item.onlyIfGazette ? trigger.needsGazette : true));
}

/**
 * Build the checklist view.
 *
 * @param {object} input
 * @param {string} input.triggerId  One of GAZETTE_TRIGGERS ids.
 * @param {string[]} input.doneIds  Completed item ids.
 * @param {boolean} [input.skipPhaseLocks] Show every phase unlocked.
 * @returns {{phases:object[], overallPercent:number, doneCount:number, total:number,
 *            currentPhaseLabel:string, inPersonRemaining:number, onlineRemaining:number,
 *            documentsToCarry:{label:string, usedBy:number}[], gazetteNeeded:boolean,
 *            gazetteReason:string}|{error:string}}
 */
export function buildSurnameChecklist({ triggerId, doneIds = [], skipPhaseLocks = false }) {
  const trigger = GAZETTE_TRIGGERS.find((t) => t.id === triggerId);
  if (!trigger) return { error: "Choose which kind of name change applies to you." };
  if (!Array.isArray(doneIds)) return { error: "Completed items must be given as a list of ids." };
  const unknown = doneIds.find((id) => !ITEM_BY_ID.has(id));
  if (unknown) return { error: `Unknown checklist item: ${unknown}.` };

  const scope = applicableItems(triggerId);
  const inScope = new Set(scope.map((item) => item.id));
  const done = new Set(doneIds.filter((id) => inScope.has(id)));

  const total = scope.length;
  const doneCount = done.size;
  const overallPercent = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  let previousComplete = true;
  const phases = PHASES.map((phase) => {
    const items = scope
      .filter((item) => item.phase === phase.id)
      .map((item) => ({
        id: item.id,
        label: item.label,
        mode: item.mode,
        note: item.note,
        docs: item.docs.map((key) => DOCUMENTS[key]).filter(Boolean),
        done: done.has(item.id),
      }));
    const phaseDone = items.filter((item) => item.done).length;
    const percent = items.length === 0 ? 100 : Math.round((phaseDone / items.length) * 100);
    const locked = skipPhaseLocks ? false : !previousComplete;
    const complete = items.length > 0 && phaseDone === items.length;
    previousComplete = previousComplete && complete;
    return {
      id: phase.id,
      label: phase.label,
      items,
      doneCount: phaseDone,
      total: items.length,
      percent,
      locked,
      complete,
    };
  });

  const currentPhase = phases.find((phase) => !phase.complete);
  const outstanding = scope.filter((item) => !done.has(item.id));
  const inPersonRemaining = outstanding.filter((item) => item.mode === "in-person").length;
  const onlineRemaining = outstanding.filter((item) => item.mode === "online").length;

  const docCounts = new Map();
  outstanding.forEach((item) => {
    item.docs.forEach((key) => {
      const label = DOCUMENTS[key];
      if (!label) return;
      docCounts.set(label, (docCounts.get(label) || 0) + 1);
    });
  });
  const documentsToCarry = [...docCounts.entries()]
    .map(([label, usedBy]) => ({ label, usedBy }))
    .sort((a, b) => (b.usedBy === a.usedBy ? a.label.localeCompare(b.label) : b.usedBy - a.usedBy));

  return {
    phases,
    overallPercent,
    doneCount,
    total,
    currentPhaseLabel: currentPhase ? currentPhase.label : "All phases complete",
    inPersonRemaining,
    onlineRemaining,
    documentsToCarry,
    gazetteNeeded: trigger.needsGazette,
    gazetteReason: trigger.reason,
  };
}
