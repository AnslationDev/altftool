/**
 * Name Change Record Update Tracker.
 *
 * Changing a legal name in India is not a flat checklist — the records form a
 * dependency graph, and updating one out of order gets the application
 * rejected. This module models that graph and reports, for any set of already
 * updated records, what is ready now, what is blocked and by what.
 *
 * The dependencies encoded below come from the documentary requirements the
 * issuing authorities themselves publish:
 *  - Affidavit -> newspaper advertisements -> Gazette notification is the
 *    standard sequence for a legal name change in India. The Department of
 *    Publication publishes a change-of-name notification in Part IV of the
 *    Gazette of India on the strength of a sworn deed/affidavit, and the
 *    accepted practice (also required by Passport Seva for a name change) is
 *    an advertisement in two newspapers, one in English and one in the
 *    regional language, before or alongside it.
 *  - Aadhaar is the base identity document almost every other authority
 *    verifies against, so it is updated first among the IDs. UIDAI's update
 *    policy permits a name update in Aadhaar only TWICE in a lifetime
 *    (NAME_UPDATE_LIFETIME_LIMIT below), which is why the tool warns before
 *    a name is changed casually.
 *  - PAN follows Aadhaar because PAN and Aadhaar must be linked and the names
 *    on the two are matched during linkage and e-verification.
 *  - EPFO's member profile change and NPS/KRA-KYC updates are validated
 *    against Aadhaar and PAN, so they sit downstream of both.
 *  - Bank KYC uses Aadhaar and PAN as officially valid documents, and demat,
 *    mutual fund and insurance records in turn follow the bank record.
 *
 * All of this is informational. Requirements differ by state, by bank and by
 * issuing office; confirm each one with the authority concerned.
 */

/** UIDAI permits a name update in Aadhaar only twice in a lifetime. */
export const NAME_UPDATE_LIFETIME_LIMIT = 2;
/** Newspaper advertisements normally required: one English, one regional. */
export const NEWSPAPER_ADS_REQUIRED = 2;

/**
 * Groups of records. `optional: false` groups always apply; the others are
 * switched on only if the person actually holds those records.
 */
export const GROUPS = [
  { id: "legal", label: "Legal basis for the change", optional: false },
  { id: "identity", label: "Core identity documents", optional: false },
  { id: "money", label: "Banking and investments", optional: true },
  { id: "work", label: "Tax and employment", optional: true },
  { id: "home", label: "Property and utilities", optional: true },
  { id: "edu", label: "Education certificates", optional: true },
];

/**
 * The records themselves. `requires` lists record ids that must be updated
 * first; `why` explains the dependency or the document to carry.
 */
export const RECORDS = [
  {
    id: "affidavit",
    label: "Name change affidavit (notarised)",
    group: "legal",
    requires: [],
    why: "Sworn before a notary or oath commissioner stating the old name, the new name and the reason. Everything else is built on this.",
  },
  {
    id: "newspaper",
    label: `Newspaper advertisements (${NEWSPAPER_ADS_REQUIRED}: English + regional)`,
    group: "legal",
    requires: ["affidavit"],
    why: "Published on the strength of the affidavit. Keep the original cuttings with the date and masthead visible — Passport Seva and several boards ask for them.",
  },
  {
    id: "gazette",
    label: "Gazette notification (Part IV)",
    group: "legal",
    requires: ["affidavit", "newspaper"],
    why: "The Department of Publication notifies the change in Part IV of the Gazette of India. This is the document most authorities treat as conclusive proof.",
  },
  {
    id: "aadhaar",
    label: "Aadhaar",
    group: "identity",
    requires: ["gazette"],
    why: `Update first among the IDs — almost every other authority verifies against it. UIDAI allows a name update only ${NAME_UPDATE_LIFETIME_LIMIT} times in a lifetime, so get it right.`,
  },
  {
    id: "pan",
    label: "PAN card",
    group: "identity",
    requires: ["aadhaar"],
    why: "Filed as a PAN correction request. Do it after Aadhaar so the two names match — mismatched names break PAN-Aadhaar linkage and e-verification.",
  },
  {
    id: "passport",
    label: "Passport (re-issue)",
    group: "identity",
    requires: ["gazette", "aadhaar"],
    why: "Re-issue application with the Gazette notification and the newspaper cuttings. The passport with the new name then unlocks visas and foreign records.",
  },
  {
    id: "dl",
    label: "Driving licence",
    group: "identity",
    requires: ["aadhaar", "gazette"],
    why: "Applied to the RTO that issued the licence, with the Gazette notification and updated address proof.",
  },
  {
    id: "voter",
    label: "Voter ID (EPIC)",
    group: "identity",
    requires: ["aadhaar"],
    why: "Correction of entries in the electoral roll, filed with the Electoral Registration Officer.",
  },
  {
    id: "bank",
    label: "Bank accounts (KYC re-verification)",
    group: "money",
    requires: ["aadhaar", "pan"],
    why: "Banks re-run KYC against Aadhaar and PAN. Update every account, and get the cheque book, debit card and nominee records reissued.",
  },
  {
    id: "demat",
    label: "Demat, mutual funds and KRA KYC",
    group: "money",
    requires: ["pan", "bank"],
    why: "The KRA KYC record is keyed to PAN and carries the bank details, so it follows both.",
  },
  {
    id: "insurance",
    label: "Life and health insurance policies",
    group: "money",
    requires: ["pan", "bank"],
    why: "Endorsement on each policy, plus nominee details. A mismatch here is what delays a claim years later.",
  },
  {
    id: "nps",
    label: "NPS / PRAN record",
    group: "money",
    requires: ["pan", "aadhaar"],
    why: "Filed through the point-of-presence or the nodal office; validated against PAN and Aadhaar.",
  },
  {
    id: "employer",
    label: "Employer HR and payroll records",
    group: "work",
    requires: ["gazette", "aadhaar"],
    why: "HR needs the Gazette copy on file before it can change payroll, Form 16 and the email address.",
  },
  {
    id: "epfo",
    label: "EPFO / UAN member profile",
    group: "work",
    requires: ["aadhaar", "pan", "employer"],
    why: "The joint declaration is filed by the employer and validated against Aadhaar, so the employer record must change first.",
  },
  {
    id: "incometax",
    label: "Income-tax e-filing profile",
    group: "work",
    requires: ["pan"],
    why: "The e-filing profile reflects the PAN database, so it follows the PAN correction automatically once that is processed.",
  },
  {
    id: "gst",
    label: "GST registration (if registered)",
    group: "work",
    requires: ["pan"],
    why: "Amendment of core registration fields; the legal name must match the PAN database.",
  },
  {
    id: "property",
    label: "Property records and society share certificate",
    group: "home",
    requires: ["gazette", "aadhaar"],
    why: "Society share certificate, municipal property tax record and, where applicable, the registered document — the last one may need a registered deed of declaration.",
  },
  {
    id: "utilities",
    label: "Electricity, gas, water and broadband",
    group: "home",
    requires: ["aadhaar"],
    why: "Name change on each consumer account, normally with Aadhaar and the last paid bill.",
  },
  {
    id: "education",
    label: "School, board and university certificates",
    group: "edu",
    requires: ["gazette", "newspaper"],
    why: "Boards and universities have their own windows and formats, and several require the newspaper cuttings in addition to the Gazette. Start early — this is the slowest one.",
  },
];

const RECORD_BY_ID = new Map(RECORDS.map((r) => [r.id, r]));

/**
 * Which records apply for the selected optional groups.
 * @param {string[]} activeOptionalGroups Ids of optional groups that apply.
 * @returns {object[]}
 */
export function applicableRecords(activeOptionalGroups = []) {
  const active = new Set(activeOptionalGroups);
  return RECORDS.filter((record) => {
    const group = GROUPS.find((g) => g.id === record.group);
    if (!group) return false;
    return !group.optional || active.has(group.id);
  });
}

/**
 * Build the tracker view.
 *
 * Sequencing uses the classic longest-path-from-a-source rule on the
 * dependency graph: a record's step number is 1 when it has no outstanding
 * prerequisite in scope, and otherwise one more than the highest step number
 * of its prerequisites. `unlocks` is the count of records that depend on it
 * directly or transitively, which is what makes a record worth doing first.
 *
 * @param {object} input
 * @param {string[]} input.doneIds                 Record ids already updated.
 * @param {string[]} input.activeOptionalGroups    Optional group ids in scope.
 * @returns {{items:object[], total:number, doneCount:number, remaining:number,
 *            progressPercent:number, readyNow:object[], blocked:object[],
 *            steps:number, nextActions:string[]}|{error:string}}
 */
export function trackNameChange({ doneIds = [], activeOptionalGroups = [] }) {
  if (!Array.isArray(doneIds) || !Array.isArray(activeOptionalGroups)) {
    return { error: "Selections must be lists of record ids." };
  }
  const scope = applicableRecords(activeOptionalGroups);
  if (scope.length === 0) {
    return { error: "No records in scope — the legal and identity groups should always apply." };
  }
  const inScope = new Set(scope.map((r) => r.id));
  const done = new Set(doneIds.filter((id) => inScope.has(id)));

  const unknown = doneIds.filter((id) => !RECORD_BY_ID.has(id));
  if (unknown.length > 0) {
    return { error: `Unknown record: ${unknown[0]}.` };
  }

  // Step number via longest path over outstanding prerequisites, with cycle
  // detection so a bad edit to RECORDS can never hang the page.
  const stepCache = new Map();
  const visiting = new Set();
  let cycle = null;

  const stepOf = (id) => {
    if (stepCache.has(id)) return stepCache.get(id);
    if (visiting.has(id)) {
      cycle = id;
      return 1;
    }
    visiting.add(id);
    const record = RECORD_BY_ID.get(id);
    const prereqs = record.requires.filter((dep) => inScope.has(dep) && !done.has(dep));
    const step = prereqs.length === 0 ? 1 : 1 + Math.max(...prereqs.map(stepOf));
    visiting.delete(id);
    stepCache.set(id, step);
    return step;
  };

  const items = scope.map((record) => {
    const isDone = done.has(record.id);
    const outstanding = record.requires.filter((dep) => inScope.has(dep) && !done.has(dep));
    return {
      id: record.id,
      label: record.label,
      group: record.group,
      why: record.why,
      done: isDone,
      step: isDone ? 0 : stepOf(record.id),
      status: isDone ? "done" : outstanding.length === 0 ? "ready" : "blocked",
      blockedBy: outstanding.map((dep) => RECORD_BY_ID.get(dep).label),
    };
  });

  if (cycle) {
    return { error: "The record list has a circular dependency and cannot be sequenced." };
  }

  // unlocks = transitive dependents still outstanding.
  const dependents = new Map(scope.map((r) => [r.id, []]));
  scope.forEach((record) => {
    record.requires.forEach((dep) => {
      if (dependents.has(dep)) dependents.get(dep).push(record.id);
    });
  });
  const unlocksOf = (id) => {
    const seen = new Set();
    const stack = [...dependents.get(id)];
    while (stack.length > 0) {
      const next = stack.pop();
      if (seen.has(next) || done.has(next)) continue;
      seen.add(next);
      stack.push(...(dependents.get(next) || []));
    }
    return seen.size;
  };
  items.forEach((item) => {
    item.unlocks = item.done ? 0 : unlocksOf(item.id);
  });

  items.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.step !== b.step) return a.step - b.step;
    if (a.unlocks !== b.unlocks) return b.unlocks - a.unlocks;
    return a.label.localeCompare(b.label);
  });

  const total = scope.length;
  const doneCount = done.size;
  const remaining = total - doneCount;
  const progressPercent = Math.round((doneCount / total) * 100);
  const readyNow = items.filter((i) => i.status === "ready");
  const blocked = items.filter((i) => i.status === "blocked");
  const steps = items.reduce((max, i) => Math.max(max, i.step), 0);

  const nextActions = readyNow
    .slice()
    .sort((a, b) => b.unlocks - a.unlocks)
    .slice(0, 3)
    .map((i) => i.label);

  return {
    items,
    total,
    doneCount,
    remaining,
    progressPercent,
    readyNow,
    blocked,
    steps,
    nextActions,
  };
}
