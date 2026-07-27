/**
 * Legal document version log builder.
 *
 * Version numbers follow the MAJOR.MINOR draft convention used in most law-firm
 * and in-house document-management practice:
 *
 *   - Everything before signature sits in major series 0 - 0.1, 0.2, 0.3 ...
 *   - A "revision" increments the minor number:            0.2 -> 0.3
 *   - A "circulated" version closes the round and starts
 *     the next major series:                               0.3 -> 1.0
 *   - An "execution" version takes the next major number
 *     and is flagged final:                                1.2 -> 2.0 (final)
 *
 * Elapsed time is measured in whole calendar days at UTC midnight so a local
 * timezone or daylight-saving shift can never move a gap by a day:
 *
 *   gapDays = (thisVersionDate - previousVersionDate) / 86,400,000
 */

/** Milliseconds in one calendar day. */
export const MS_PER_DAY = 86400000;

/** A draft with no activity for this long is flagged as stale. */
export const STALE_DAYS = 30;

/** Longest span the log will accept between the first and last entry. */
export const MAX_SPAN_DAYS = 3650;

/** Hard cap on entries so a paste accident cannot lock the page up. */
export const MAX_ENTRIES = 60;

/**
 * How each change type moves the version number.
 *  - minor: adds 1 to the minor number, major unchanged.
 *  - major: adds 1 to the major number and resets the minor to 0.
 */
export const CHANGE_TYPES = [
  {
    id: "revision",
    label: "Revision",
    bump: "minor",
    hint: "Internal edit or mark-up that stays inside the current round.",
  },
  {
    id: "circulated",
    label: "Circulated",
    bump: "major",
    hint: "Sent to the client or counterparty - closes the round.",
  },
  {
    id: "execution",
    label: "Execution version",
    bump: "major",
    final: true,
    hint: "The version taken to signature. No further minor numbers.",
  },
];

const TYPE_BY_ID = new Map(CHANGE_TYPES.map((t) => [t.id, t]));

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse "YYYY-MM-DD" into a UTC-midnight timestamp, or null if not a real date. */
export function parseIsoDate(value) {
  const raw = String(value ?? "").trim();
  if (!ISO_DATE.test(raw)) return null;
  const year = Number(raw.slice(0, 4));
  const month = Number(raw.slice(5, 7));
  const day = Number(raw.slice(8, 10));
  const ts = Date.UTC(year, month - 1, day);
  const back = new Date(ts);
  if (
    back.getUTCFullYear() !== year ||
    back.getUTCMonth() !== month - 1 ||
    back.getUTCDate() !== day
  ) {
    return null;
  }
  return ts;
}

/** Add whole days to an ISO date, returning a new ISO date string. */
export function addDays(iso, days) {
  const ts = parseIsoDate(iso);
  const n = Number(days);
  if (ts === null || !Number.isFinite(n)) return null;
  return new Date(ts + Math.round(n) * MS_PER_DAY).toISOString().slice(0, 10);
}

/**
 * Apply one bump to a { major, minor } pair.
 * The first entry of a log is always 0.1, never 0.0.
 */
export function bumpVersion(current, bump) {
  const major = Number(current?.major);
  const minor = Number(current?.minor);
  if (!Number.isFinite(major) || !Number.isFinite(minor)) return { major: 0, minor: 1 };
  if (bump === "major") return { major: major + 1, minor: 0 };
  return { major, minor: minor + 1 };
}

/** "0.3", "1.0" - the printed form of a version pair. */
export function formatVersion({ major, minor }) {
  return `${major}.${minor}`;
}

/**
 * Build the version log.
 *
 * @param {object} input
 * @param {string} input.title              Document name shown in the export.
 * @param {string} input.today              Reference date for staleness, "YYYY-MM-DD".
 * @param {Array}  input.entries            [{ id, date, author, reviewer, type, summary }]
 * @returns {object} { rows, ... , exportText } or { error }.
 */
export function computeVersionLog({ title = "", today, entries = [] }) {
  const todayTs = parseIsoDate(today);
  if (todayTs === null) {
    return { error: "Enter today's date as a real calendar date (YYYY-MM-DD)." };
  }
  if (!Array.isArray(entries)) {
    return { error: "The version list is not readable." };
  }

  const kept = [];
  for (const entry of entries) {
    const date = String(entry?.date ?? "").trim();
    const summary = String(entry?.summary ?? "").trim();
    const author = String(entry?.author ?? "").trim();
    if (date === "" && summary === "" && author === "") continue;

    const ts = parseIsoDate(date);
    if (ts === null) {
      return { error: `Every version needs a valid date (YYYY-MM-DD)${summary ? ` - check "${summary}"` : ""}.` };
    }
    if (summary === "") {
      return { error: `Describe what changed in the version dated ${date}.` };
    }
    const type = TYPE_BY_ID.get(String(entry?.type ?? "revision"));
    if (!type) {
      return { error: `"${entry?.type}" is not a recognised change type.` };
    }
    kept.push({
      id: entry?.id ?? `${date}-${summary}`,
      ts,
      date,
      author,
      reviewer: String(entry?.reviewer ?? "").trim(),
      type,
      summary,
    });
  }

  if (kept.length === 0) {
    return { error: "Add at least one version to build the log." };
  }
  if (kept.length > MAX_ENTRIES) {
    return { error: `A log is limited to ${MAX_ENTRIES} versions.` };
  }

  // Stable sort into date order - a version log always reads oldest first.
  kept.sort((a, b) => a.ts - b.ts);

  const span = (kept[kept.length - 1].ts - kept[0].ts) / MS_PER_DAY;
  if (span > MAX_SPAN_DAYS) {
    return { error: `The first and last version are more than ${MAX_SPAN_DAYS} days apart - check the years.` };
  }

  let version = { major: 0, minor: 0 };
  let previousTs = null;
  let longestGap = null;
  let gapTotal = 0;
  let gapCount = 0;
  const contributors = new Map();
  const rows = [];

  for (const entry of kept) {
    version =
      rows.length === 0 ? { major: 0, minor: 1 } : bumpVersion(version, entry.type.bump);

    const gapDays = previousTs === null ? null : Math.round((entry.ts - previousTs) / MS_PER_DAY);
    if (gapDays !== null) {
      gapTotal += gapDays;
      gapCount += 1;
      if (longestGap === null || gapDays > longestGap.gapDays) {
        longestGap = { gapDays, version: formatVersion(version), summary: entry.summary };
      }
    }

    if (entry.author) {
      contributors.set(entry.author, (contributors.get(entry.author) ?? 0) + 1);
    }

    rows.push({
      id: entry.id,
      version: formatVersion(version),
      major: version.major,
      minor: version.minor,
      date: entry.date,
      author: entry.author,
      reviewer: entry.reviewer,
      typeId: entry.type.id,
      typeLabel: entry.type.label,
      final: Boolean(entry.type.final),
      summary: entry.summary,
      gapDays,
      daysFromStart: Math.round((entry.ts - kept[0].ts) / MS_PER_DAY),
      daysAgo: Math.round((todayTs - entry.ts) / MS_PER_DAY),
    });

    previousTs = entry.ts;
  }

  const last = rows[rows.length - 1];
  const rounds = rows.filter((r) => r.typeId !== "revision").length;
  const executed = rows.some((r) => r.final);

  const header = title.trim() === "" ? "Version log" : `Version log - ${title.trim()}`;
  const exportText = [
    header,
    `Prepared ${today} | ${rows.length} versions | current ${last.version}${last.final ? " (execution version)" : ""}`,
    "",
    "Version | Date | Author | Reviewer | Change",
    ...rows.map((r) =>
      [r.version, r.date, r.author || "-", r.reviewer || "-", `${r.typeLabel}: ${r.summary}`].join(
        " | ",
      ),
    ),
  ].join("\n");

  return {
    rows,
    title: title.trim(),
    currentVersion: last.version,
    currentIsFinal: last.final,
    versionCount: rows.length,
    revisionCount: rows.filter((r) => r.typeId === "revision").length,
    roundCount: rounds,
    executed,
    spanDays: Math.round(span),
    averageGapDays: gapCount > 0 ? gapTotal / gapCount : null,
    longestGap,
    daysSinceLastVersion: last.daysAgo,
    stale: last.daysAgo > STALE_DAYS,
    contributors: [...contributors.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    exportText,
  };
}
