/**
 * Document backup priority ranker — scoring, tiering and a time-budget plan.
 *
 * The ranking answers one question: if you only get through part of the pile, which
 * documents must be in the scan first? Three factors decide it, and each is anchored to
 * a real replacement process rather than a feeling:
 *
 *  1. REPLACEABILITY — how hard the document is to obtain again. An e-PAN reprint or an
 *     Aadhaar download takes minutes online; a duplicate degree certificate needs an
 *     affidavit, a police report and a university fee; a lost registered sale deed needs
 *     an FIR, a newspaper notice and an indemnity bond before the sub-registrar will
 *     issue a certified copy; original family photographs cannot be reissued at all.
 *  2. URGENCY — how quickly you would need it under pressure. A health insurance policy
 *     number is needed at a hospital admission desk within the hour; a rent agreement is not.
 *  3. DEPENDENCY — how much else is blocked without it. Identity documents and account
 *     recovery material gate the reissue of everything below them, which is why they
 *     outrank documents that are individually harder to replace.
 *
 * Sensitivity is tracked separately because it changes HOW you store a scan (encrypted,
 * never in a plain cloud folder), not whether you should make one. `originalRequired`
 * marks documents where a scan speeds up a claim but cannot substitute for the original
 * in a legal process — for those the physical custody advice matters as much as the scan.
 *
 * The 1-5 factor values and the weights are editorial ratings applied consistently across
 * the catalogue, not measured statistics. They are exported so the ranking is inspectable.
 *
 * Pure module: no React, no DOM, no clocks.
 */

/** Factor weights. Replaceability dominates; dependency breaks ties. */
export const WEIGHT_REPLACEABILITY = 4;
export const WEIGHT_URGENCY = 3;
export const WEIGHT_DEPENDENCY = 2;

/** Factors are rated 1-5, so this is the highest achievable raw score. */
export const MAX_FACTOR = 5;
export const MAX_RAW_SCORE =
  MAX_FACTOR * (WEIGHT_REPLACEABILITY + WEIGHT_URGENCY + WEIGHT_DEPENDENCY);

/** A scan of anything rated 4 or 5 for sensitivity belongs in encrypted storage only. */
export const ENCRYPT_SENSITIVITY_THRESHOLD = 4;

/** Tier cut-offs on the 0-100 normalised score, lower bound inclusive. */
export const TIERS = [
  { id: "t4", min: 0, label: "Tier 4 — when convenient", tone: "muted", window: "Whenever you next tidy up" },
  { id: "t3", min: 35, label: "Tier 3 — this month", tone: "muted", window: "Within a month" },
  { id: "t2", min: 52, label: "Tier 2 — this week", tone: "warning", window: "Within a week" },
  { id: "t1", min: 70, label: "Tier 1 — do today", tone: "danger", window: "Today" },
];

/**
 * Catalogue of household documents.
 *
 *  replaceability 1 = reissued online in minutes  ...  5 = cannot be reissued at all
 *  urgency        1 = never needed at short notice ... 5 = needed within hours
 *  dependency     1 = blocks nothing else          ... 5 = blocks most other reissues
 *  sensitivity    1 = harmless if leaked           ... 5 = enables impersonation or theft
 *  minutes        realistic time to locate, scan and file one copy
 */
export const DOCUMENTS = [
  {
    id: "password-recovery",
    label: "Account recovery kit — 2FA backup codes, recovery email and phone list",
    group: "Keys to everything else",
    replaceability: 5,
    urgency: 5,
    dependency: 5,
    sensitivity: 5,
    minutes: 15,
    originalRequired: false,
    note: "Lose these and every other online reissue route closes behind you. Store offline, never in the same account they unlock.",
  },
  {
    id: "will",
    label: "Will, nomination forms and succession papers",
    group: "Legal and property",
    replaceability: 5,
    urgency: 3,
    dependency: 4,
    sensitivity: 5,
    minutes: 10,
    originalRequired: true,
    note: "Probate normally needs the original. A scan proves the will existed and records its terms, but keep the signed original safe and tell the executor where it is.",
  },
  {
    id: "medical-records",
    label: "Medical records — discharge summaries, scans, chronic-condition history",
    group: "Health",
    replaceability: 4,
    urgency: 5,
    dependency: 3,
    sensitivity: 5,
    minutes: 25,
    originalRequired: false,
    note: "Hospitals are not obliged to keep outpatient records indefinitely, so old reports often cannot be retrieved at all.",
  },
  {
    id: "property-deed",
    label: "Registered sale deed, allotment letter and property tax receipts",
    group: "Legal and property",
    replaceability: 4,
    urgency: 3,
    dependency: 5,
    sensitivity: 5,
    minutes: 20,
    originalRequired: true,
    note: "A certified copy is obtainable from the sub-registrar, but only after an FIR, a newspaper notice and an indemnity bond.",
  },
  {
    id: "passport",
    label: "Passport and visa pages",
    group: "Identity",
    replaceability: 3,
    urgency: 5,
    dependency: 4,
    sensitivity: 5,
    minutes: 5,
    originalRequired: true,
    note: "A scan of the data page is what an embassy asks for first when you report a lost passport abroad.",
  },
  {
    id: "insurance",
    label: "Health and life insurance policies with policy numbers and nominees",
    group: "Money",
    replaceability: 2,
    urgency: 5,
    dependency: 5,
    sensitivity: 4,
    minutes: 10,
    originalRequired: false,
    note: "The number, insurer and TPA helpline are what a cashless admission desk needs, often within the first hour.",
  },
  {
    id: "bank-accounts",
    label: "Account, demat and locker list with nominee details",
    group: "Money",
    replaceability: 2,
    urgency: 4,
    dependency: 5,
    sensitivity: 5,
    minutes: 10,
    originalRequired: false,
    note: "Unclaimed deposits usually stay unclaimed because nobody in the family knew the account existed.",
  },
  {
    id: "degree",
    label: "Degree certificates, marksheets and transcripts",
    group: "Education and work",
    replaceability: 4,
    urgency: 2,
    dependency: 3,
    sensitivity: 2,
    minutes: 15,
    originalRequired: true,
    note: "A university duplicate needs an affidavit and a police report, and can take months during admission season.",
  },
  {
    id: "employment",
    label: "Offer, relieving and experience letters, Form 16, UAN records",
    group: "Education and work",
    replaceability: 4,
    urgency: 2,
    dependency: 3,
    sensitivity: 3,
    minutes: 10,
    originalRequired: false,
    note: "If the employer has shut down or been acquired, these cannot be reissued by anyone.",
  },
  {
    id: "share-certificates",
    label: "Physical share certificates and old paper investments",
    group: "Money",
    replaceability: 5,
    urgency: 1,
    dependency: 2,
    sensitivity: 4,
    minutes: 10,
    originalRequired: true,
    note: "Duplicate issue needs an FIR, a public notice, an indemnity and often a surety — it is one of the slowest processes there is.",
  },
  {
    id: "caste-domicile",
    label: "Caste, domicile, income and EWS certificates",
    group: "Identity",
    replaceability: 3,
    urgency: 3,
    dependency: 3,
    sensitivity: 3,
    minutes: 5,
    originalRequired: false,
    note: "Reissue means a fresh application with supporting proofs, which is painful in the middle of an admission deadline.",
  },
  {
    id: "pension",
    label: "Pension PPO, EPF and NPS records",
    group: "Money",
    replaceability: 3,
    urgency: 3,
    dependency: 3,
    sensitivity: 4,
    minutes: 8,
    originalRequired: false,
    note: "The PPO number is the single key a family needs to claim a pension after a death.",
  },
  {
    id: "birth-certificate",
    label: "Birth certificates",
    group: "Identity",
    replaceability: 3,
    urgency: 2,
    dependency: 4,
    sensitivity: 3,
    minutes: 3,
    originalRequired: false,
    note: "Needed for passports, school admission and many pension claims; older records may require a manual register search.",
  },
  {
    id: "aadhaar",
    label: "Aadhaar",
    group: "Identity",
    replaceability: 1,
    urgency: 4,
    dependency: 5,
    sensitivity: 5,
    minutes: 2,
    originalRequired: false,
    note: "Re-downloadable in minutes if your registered mobile still works — which is exactly why the recovery kit above outranks it.",
  },
  {
    id: "pan",
    label: "PAN card",
    group: "Identity",
    replaceability: 1,
    urgency: 4,
    dependency: 5,
    sensitivity: 4,
    minutes: 2,
    originalRequired: false,
    note: "An e-PAN reprint is a small online fee, but the number itself gates banking, tax and investment work.",
  },
  {
    id: "marriage-certificate",
    label: "Marriage certificate",
    group: "Legal and property",
    replaceability: 3,
    urgency: 2,
    dependency: 3,
    sensitivity: 3,
    minutes: 3,
    originalRequired: false,
    note: "Needed for spouse visas, name changes and many insurance and pension claims.",
  },
  {
    id: "photos",
    label: "Irreplaceable family photographs and video",
    group: "Personal",
    replaceability: 5,
    urgency: 1,
    dependency: 1,
    sensitivity: 3,
    minutes: 45,
    originalRequired: false,
    note: "Nothing can reissue these, but nobody needs them at 2am — which is why they rank high without being Tier 1.",
  },
  {
    id: "vehicle",
    label: "Vehicle RC, insurance and PUC",
    group: "Other",
    replaceability: 2,
    urgency: 3,
    dependency: 2,
    sensitivity: 2,
    minutes: 5,
    originalRequired: false,
    note: "A duplicate RC is a standard RTO application; the insurance certificate matters more, and after an accident you need it fast.",
  },
  {
    id: "itr",
    label: "Income tax returns and acknowledgements",
    group: "Money",
    replaceability: 1,
    urgency: 3,
    dependency: 4,
    sensitivity: 4,
    minutes: 8,
    originalRequired: false,
    note: "Downloadable from the e-filing portal for recent years, and routinely demanded as income proof for loans and visas.",
  },
  {
    id: "rent-agreement",
    label: "Rent agreement or lease",
    group: "Other",
    replaceability: 2,
    urgency: 2,
    dependency: 2,
    sensitivity: 2,
    minutes: 5,
    originalRequired: false,
    note: "The landlord holds a counterpart, so a replacement is usually a phone call — but it doubles as address proof.",
  },
];

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Normalised 0-100 priority score for one catalogue entry. */
export function scoreDocument(doc) {
  const raw =
    doc.replaceability * WEIGHT_REPLACEABILITY +
    doc.urgency * WEIGHT_URGENCY +
    doc.dependency * WEIGHT_DEPENDENCY;
  return Math.round((raw / MAX_RAW_SCORE) * 100);
}

function tierFor(score) {
  let match = TIERS[0];
  for (const tier of TIERS) if (score >= tier.min) match = tier;
  return match;
}

const cleanIds = (value) =>
  Array.isArray(value) ? Array.from(new Set(value.map((entry) => String(entry)))) : null;

/**
 * Rank the documents a household holds and fit the unprotected ones into a time budget.
 *
 * @param {object} input
 * @param {string[]} input.selectedIds  Documents this household actually has.
 * @param {string[]} input.backedUpIds  Documents already scanned and backed up.
 * @param {number}   input.minutesAvailable  Minutes you can spend in this session.
 * @returns {object} ranking, or { error } when the input cannot be used.
 */
export function rankDocuments({ selectedIds, backedUpIds, minutesAvailable }) {
  const selected = cleanIds(selectedIds);
  const backedUp = cleanIds(backedUpIds);

  if (!selected) return { error: "Documents must be supplied as a list." };
  if (!backedUp) return { error: "Already-backed-up documents must be supplied as a list." };
  if (!isFiniteNumber(minutesAvailable)) {
    return { error: "Enter the number of minutes you can spend as a plain number." };
  }
  if (minutesAvailable < 0) return { error: "Time available cannot be negative." };

  const known = new Map(DOCUMENTS.map((doc) => [doc.id, doc]));
  if (selected.some((id) => !known.has(id))) {
    return { error: "One of the selected documents is not in the catalogue." };
  }
  if (backedUp.some((id) => !selected.includes(id))) {
    return { error: "A document can only be marked as backed up if you hold it." };
  }
  if (selected.length === 0) {
    return { error: "Tick at least one document you hold." };
  }

  const backedUpSet = new Set(backedUp);

  const ranked = DOCUMENTS.filter((doc) => selected.includes(doc.id))
    .map((doc) => {
      const score = scoreDocument(doc);
      const tier = tierFor(score);
      return {
        id: doc.id,
        label: doc.label,
        group: doc.group,
        note: doc.note,
        score,
        tier,
        minutes: doc.minutes,
        replaceability: doc.replaceability,
        urgency: doc.urgency,
        dependency: doc.dependency,
        sensitivity: doc.sensitivity,
        needsEncryption: doc.sensitivity >= ENCRYPT_SENSITIVITY_THRESHOLD,
        originalRequired: doc.originalRequired,
        done: backedUpSet.has(doc.id),
      };
    })
    .sort((a, b) => b.score - a.score || a.minutes - b.minutes || a.label.localeCompare(b.label));

  ranked.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  const outstanding = ranked.filter((entry) => !entry.done);
  const outstandingWeight = outstanding.reduce((sum, entry) => sum + entry.score, 0);
  const outstandingMinutes = outstanding.reduce((sum, entry) => sum + entry.minutes, 0);

  // Fill the session in strict priority order — the highest-priority document is never skipped
  // just because a cheaper one would fit.
  const plan = [];
  let minutesUsed = 0;
  for (const entry of outstanding) {
    if (minutesUsed + entry.minutes > minutesAvailable) break;
    plan.push(entry);
    minutesUsed += entry.minutes;
  }

  const plannedWeight = plan.reduce((sum, entry) => sum + entry.score, 0);
  const coveragePercent =
    outstandingWeight > 0 ? Math.round((plannedWeight / outstandingWeight) * 100) : 100;

  const tierCounts = TIERS.map((tier) => ({
    id: tier.id,
    label: tier.label,
    window: tier.window,
    tone: tier.tone,
    total: ranked.filter((entry) => entry.tier.id === tier.id).length,
    outstanding: outstanding.filter((entry) => entry.tier.id === tier.id).length,
  })).reverse();

  const tier1Outstanding = outstanding.filter((entry) => entry.tier.id === "t1");
  const encryptionNeeded = outstanding.filter((entry) => entry.needsEncryption);
  const originalsToSecure = ranked.filter((entry) => entry.originalRequired);

  let verdict;
  if (outstanding.length === 0) {
    verdict =
      "Everything you hold is already backed up. Re-check the copies once a year and refresh anything that has been renewed or reissued since.";
  } else if (tier1Outstanding.length > 0 && plan.length === 0) {
    verdict = `Not even one document fits in ${minutesAvailable} minutes. Give yourself ${outstanding[0].minutes} minutes and start with "${outstanding[0].label}".`;
  } else if (tier1Outstanding.length > 0) {
    verdict = `Start with the ${tier1Outstanding.length} Tier 1 document(s) still missing — they are the ones that either cannot be replaced or are needed within hours.`;
  } else {
    verdict =
      "No Tier 1 gaps left. Work down the list below in order, and keep the encrypted set separate from the ordinary one.";
  }

  return {
    ranked,
    outstanding,
    plan,
    minutesUsed,
    minutesAvailable,
    outstandingMinutes,
    outstandingCount: outstanding.length,
    totalCount: ranked.length,
    doneCount: ranked.length - outstanding.length,
    coveragePercent,
    tierCounts,
    tier1Outstanding: tier1Outstanding.map((entry) => ({ id: entry.id, label: entry.label })),
    encryptionCount: encryptionNeeded.length,
    originalsToSecure: originalsToSecure.map((entry) => ({ id: entry.id, label: entry.label })),
    verdict,
  };
}
