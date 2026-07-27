/**
 * Joining formalities checklist for a new (typically government) job.
 *
 * The phases and items mirror standard appointment-letter annexures:
 * pre-joining medical examination, police/character verification and
 * attestation forms, exit formalities from a current employer, and the
 * day-one document kit. `leadDays` is a planning estimate of how long the
 * item usually takes end-to-end (e.g. police verification routinely runs
 * for weeks), used to flag items that must start NOW relative to the
 * joining date.
 */

/** Phases of the joining process, in order. */
export const PHASES = [
  { id: "medical", label: "Medical examination" },
  { id: "verification", label: "Police / character verification" },
  { id: "paperwork", label: "Attestation & paperwork" },
  { id: "exit", label: "Current employer exit" },
  { id: "day-one", label: "Day-one kit" },
];

/**
 * Checklist items. `leadDays` = typical end-to-end time to obtain the item,
 * a planning default drawn from how these processes commonly run — the
 * appointment letter's own instructions always override.
 */
export const CHECKLIST_ITEMS = [
  {
    id: "medical-exam",
    phase: "medical",
    label: "Medical fitness examination at the designated hospital",
    critical: true,
    conditional: false,
    leadDays: 14,
    note: "Board-specified hospital or civil surgeon; slots and reports take time.",
  },
  {
    id: "medical-history",
    phase: "medical",
    label: "Past medical records / spectacles prescription (if any)",
    critical: false,
    conditional: true,
    leadDays: 3,
    note: "Needed where standards mention vision or prior conditions.",
  },
  {
    id: "attestation-form",
    phase: "verification",
    label: "Attestation form for police verification, filled and signed",
    critical: true,
    conditional: false,
    leadDays: 7,
    note: "Addresses for the past years must match your documents exactly.",
  },
  {
    id: "police-verification",
    phase: "verification",
    label: "Police verification initiated at local police station",
    critical: true,
    conditional: false,
    leadDays: 30,
    note: "Routinely the slowest formality — start it as soon as the form arrives.",
  },
  {
    id: "character-certs",
    phase: "verification",
    label: "Character certificates from two gazetted officers / responsible persons",
    critical: false,
    conditional: true,
    leadDays: 7,
    note: "Some appointment letters ask for them alongside the attestation form.",
  },
  {
    id: "orig-docs",
    phase: "paperwork",
    label: "All original certificates re-verified (education, category, ID)",
    critical: true,
    conditional: false,
    leadDays: 7,
    note: "The joining office repeats DV against originals.",
  },
  {
    id: "surety-bond",
    phase: "paperwork",
    label: "Service bond / agreement on stamp paper (where prescribed)",
    critical: false,
    conditional: true,
    leadDays: 5,
    note: "Bond value and stamp-paper denomination come from the appointment letter.",
  },
  {
    id: "photos-joining",
    phase: "paperwork",
    label: "Passport photographs for service book and ID card",
    critical: true,
    conditional: false,
    leadDays: 2,
    note: "Carry 8-10; service book, ID and forms all consume them.",
  },
  {
    id: "bank-account",
    phase: "paperwork",
    label: "Salary bank account details / cancelled cheque",
    critical: false,
    conditional: false,
    leadDays: 3,
    note: "Some departments require a specific bank; check the joining instructions.",
  },
  {
    id: "resignation",
    phase: "exit",
    label: "Resignation submitted per notice period at current employer",
    critical: true,
    conditional: true,
    leadDays: 30,
    note: "Notice periods of 30-90 days must be counted back from the joining date.",
  },
  {
    id: "relieving-letter",
    phase: "exit",
    label: "Relieving letter / NOC from current employer",
    critical: true,
    conditional: true,
    leadDays: 7,
    note: "Government joiners already in service must produce it at joining.",
  },
  {
    id: "joining-report",
    phase: "day-one",
    label: "Joining report typed and signed, with appointment letter copies",
    critical: true,
    conditional: false,
    leadDays: 1,
    note: "The document that formally records your date of joining.",
  },
  {
    id: "travel-stay",
    phase: "day-one",
    label: "Travel and stay arranged for the posting location",
    critical: false,
    conditional: false,
    leadDays: 7,
    note: "Out-of-state postings need this planned, not improvised.",
  },
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Parse an ISO yyyy-mm-dd string into a UTC-midnight Date, or null when invalid. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Whole days between two UTC-midnight dates. */
export function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/**
 * Summarise joining readiness.
 *
 * @param {object} input
 * @param {Array}  input.items       [{ id, phase, label, critical, applicable, done, leadDays }]
 * @param {string} input.joiningDate yyyy-mm-dd ("" when not yet fixed).
 * @param {string} input.today       yyyy-mm-dd, injected by the caller.
 * @returns {object} summary, or { error }.
 */
export function summarizeJoining({ items, joiningDate, today }) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "The checklist needs at least one item." };
  }
  const now = parseIsoDate(today);
  if (!now) return { error: "Enter today's date as yyyy-mm-dd." };

  let joining = null;
  if (typeof joiningDate === "string" && joiningDate.trim() !== "") {
    joining = parseIsoDate(joiningDate);
    if (!joining) return { error: "Enter the joining date as yyyy-mm-dd, or leave it blank." };
  }
  const daysLeft = joining ? daysBetween(now, joining) : null;

  let applicable = 0;
  let done = 0;
  const pendingCritical = [];
  const startNow = [];
  const phaseMap = new Map(PHASES.map((p) => [p.id, { ...p, total: 0, done: 0 }]));

  for (const item of items) {
    if (!item.applicable) continue;
    applicable += 1;
    const phaseRow = phaseMap.get(item.phase);
    if (phaseRow) phaseRow.total += 1;
    if (item.done) {
      done += 1;
      if (phaseRow) phaseRow.done += 1;
    } else {
      if (item.critical) pendingCritical.push(item);
      // Item must start now when its typical lead time exceeds the days left.
      if (daysLeft !== null && daysLeft >= 0 && Number(item.leadDays) >= daysLeft) {
        startNow.push({ ...item, daysLeft });
      }
    }
  }

  if (applicable === 0) {
    return { error: "Mark at least one formality as applicable to you." };
  }

  const completionPercent = Math.round((done / applicable) * 100);

  let verdict;
  if (completionPercent === 100) {
    verdict = "Every applicable formality is done — you are joining-ready.";
  } else if (startNow.length > 0) {
    verdict =
      "Some pending items typically take longer than the time you have left — start them today.";
  } else if (pendingCritical.length > 0) {
    verdict = "Critical formalities are pending; begin with police verification and medicals.";
  } else {
    verdict = "Only routine items remain.";
  }

  return {
    applicable,
    done,
    completionPercent,
    pendingCritical,
    startNow,
    daysLeft,
    joiningDateSet: joining !== null,
    joiningPassed: joining !== null && daysLeft < 0,
    phases: [...phaseMap.values()].filter((p) => p.total > 0),
    verdict,
  };
}
