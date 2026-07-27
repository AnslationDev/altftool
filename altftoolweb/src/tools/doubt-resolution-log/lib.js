/**
 * Doubt resolution log — pure statistics over a list of logged doubts.
 *
 * The "retest" discipline encoded here comes from the testing effect in
 * cognitive psychology (Roediger & Karpicke, 2006): material is retained far
 * better when actively retrieved than when re-read, so a doubt should only be
 * treated as closed once the learner has re-solved a similar problem without
 * help. The log therefore tracks retesting separately from resolution.
 */

/** Who resolved the doubt — used for the source breakdown. */
export const RESOLVER_OPTIONS = [
  { id: "faculty", label: "Teacher / faculty" },
  { id: "doubt-desk", label: "Coaching doubt desk" },
  { id: "peer", label: "Peer / study group" },
  { id: "self", label: "Self (book / notes)" },
  { id: "online", label: "Online video / forum" },
];

/**
 * A doubt still open after this many days is flagged as stale. One week is
 * the common coaching-cycle length (weekly tests / doubt sessions), so a
 * doubt older than one cycle has already missed its natural resolution slot.
 */
export const STALE_OPEN_DAYS = 7;

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
 * Validate a single doubt entry before it is added to the log.
 * @returns {{ok:true}|{error:string}}
 */
export function validateDoubt({ subject, question, raisedOn, resolvedOn }) {
  if (typeof subject !== "string" || subject.trim() === "") {
    return { error: "Give the doubt a subject." };
  }
  if (typeof question !== "string" || question.trim() === "") {
    return { error: "Describe the doubt in a line." };
  }
  const raised = parseIsoDate(raisedOn);
  if (!raised) return { error: "Enter the date the doubt was raised (yyyy-mm-dd)." };
  if (resolvedOn) {
    const resolved = parseIsoDate(resolvedOn);
    if (!resolved) return { error: "The resolved date is not a valid yyyy-mm-dd date." };
    if (resolved < raised) {
      return { error: "A doubt cannot be resolved before it was raised." };
    }
  }
  return { ok: true };
}

/**
 * Summarise the whole log.
 *
 * @param {object} input
 * @param {Array}  input.entries  [{ id, subject, question, resolvedBy, raisedOn, resolvedOn, retested }]
 * @param {string} input.today    yyyy-mm-dd, injected by the caller (never read inside).
 * @returns {object} stats, or { error } when input is unusable.
 */
export function summarizeDoubts({ entries, today }) {
  if (!Array.isArray(entries)) return { error: "The log must be a list of doubts." };
  const now = parseIsoDate(today);
  if (!now) return { error: "Enter today's date as yyyy-mm-dd." };

  let open = 0;
  let resolved = 0;
  let retested = 0;
  let resolveDaysTotal = 0;
  let resolveDaysCount = 0;
  let oldestOpenDays = 0;
  const staleOpen = [];
  const needRetest = [];
  const bySubject = new Map();
  const byResolver = new Map();

  for (const entry of entries) {
    const raised = parseIsoDate(entry.raisedOn);
    if (!raised) continue; // an unparseable row cannot contribute to date stats
    const resolvedDate = entry.resolvedOn ? parseIsoDate(entry.resolvedOn) : null;
    const isResolved = Boolean(resolvedDate);

    const subjectKey = (entry.subject || "General").trim() || "General";
    const subjectRow = bySubject.get(subjectKey) || {
      subject: subjectKey,
      total: 0,
      open: 0,
      resolved: 0,
      retested: 0,
    };
    subjectRow.total += 1;

    if (isResolved) {
      resolved += 1;
      subjectRow.resolved += 1;
      const days = daysBetween(raised, resolvedDate);
      if (days >= 0) {
        resolveDaysTotal += days;
        resolveDaysCount += 1;
      }
      const resolverKey = entry.resolvedBy || "self";
      byResolver.set(resolverKey, (byResolver.get(resolverKey) || 0) + 1);
      if (entry.retested) {
        retested += 1;
        subjectRow.retested += 1;
      } else {
        needRetest.push(entry);
      }
    } else {
      open += 1;
      subjectRow.open += 1;
      const age = daysBetween(raised, now);
      if (age > oldestOpenDays) oldestOpenDays = age;
      if (age > STALE_OPEN_DAYS) staleOpen.push({ ...entry, ageDays: age });
    }
    bySubject.set(subjectKey, subjectRow);
  }

  const total = open + resolved;
  return {
    total,
    open,
    resolved,
    retested,
    // Share of resolved doubts actually retested — the number that predicts recall.
    retestRatePercent: resolved > 0 ? Math.round((retested / resolved) * 100) : 0,
    resolvedRatePercent: total > 0 ? Math.round((resolved / total) * 100) : 0,
    avgDaysToResolve:
      resolveDaysCount > 0 ? Math.round((resolveDaysTotal / resolveDaysCount) * 10) / 10 : 0,
    oldestOpenDays,
    staleOpen,
    needRetest,
    bySubject: [...bySubject.values()].sort((a, b) => b.total - a.total),
    byResolver: [...byResolver.entries()]
      .map(([id, count]) => ({
        id,
        label: RESOLVER_OPTIONS.find((r) => r.id === id)?.label || id,
        count,
      }))
      .sort((a, b) => b.count - a.count),
  };
}
