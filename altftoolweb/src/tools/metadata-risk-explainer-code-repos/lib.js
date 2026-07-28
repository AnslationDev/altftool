/**
 * Code Repository Metadata Explainer — logic module.
 *
 * Pure parsing + arithmetic. No React, no DOM, no clock reads: every date used
 * comes from the text passed in.
 *
 * Every git commit stores an author name, an author email and a timestamp with
 * the committer's UTC offset. Push a repository in public and that becomes a
 * published log of who you are, where you were and when you were awake.
 */

/* ------------------------------------------------------------------ parsing */

/**
 * ISO-8601 timestamp with an explicit offset, as produced by
 * `git log --date=iso-strict` or `--pretty=%aI` (e.g. 2026-07-27T09:14:03+05:30).
 */
const ISO_RE =
  /(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?\s*(Z|[+-]\d{2}:?\d{2})/;

/**
 * git's default log date format, e.g. "Date:   Mon Jul 27 09:14:03 2026 +0530".
 */
const GIT_DEFAULT_RE =
  /(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s+(\d{2}):(\d{2}):(\d{2})\s+(\d{4})\s+([+-]\d{4})/;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z0-9.-]+/;

/** Mailbox providers that reveal no employer, only that you have an account. */
export const FREE_MAIL_DOMAINS = Object.freeze([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "me.com",
  "protonmail.com",
  "proton.me",
  "gmx.com",
  "mail.com",
  "yandex.com",
  "aol.com",
  "zoho.com",
]);

/** Local hours counted as "late night" for the routine check. */
export const LATE_NIGHT_HOURS = Object.freeze([0, 1, 2, 3, 4, 5]);

/** Length of the sliding window used to measure how concentrated your day is. */
export const ROUTINE_WINDOW_HOURS = 8;

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function normaliseOffset(raw) {
  if (!raw) return null;
  if (raw === "Z") return "+00:00";
  const compact = raw.replace(":", "");
  const sign = compact[0];
  return `${sign}${compact.slice(1, 3)}:${compact.slice(3, 5)}`;
}

/** Day of week for a calendar date, computed without reading the clock. */
export function weekdayIndex(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/**
 * Pull commit timestamps and author emails out of pasted git output.
 * Accepts `--date=iso-strict` / `%aI` lines and git's default log format.
 *
 * @param {string} text
 * @returns {{ commits: Array<object>, skippedLines: number }}
 */
export function parseCommitLog(text) {
  const commits = [];
  let skippedLines = 0;
  if (typeof text !== "string" || text.trim() === "") {
    return { commits, skippedLines };
  }

  const lines = text.split(/\r?\n/);
  let pendingEmail = null;

  lines.forEach((line) => {
    if (line.trim() === "") return;

    const emailMatch = line.match(EMAIL_RE);
    if (emailMatch) pendingEmail = emailMatch[0].toLowerCase();

    let year;
    let month;
    let day;
    let hour;
    let minute;
    let offset;

    const iso = line.match(ISO_RE);
    if (iso) {
      year = Number(iso[1]);
      month = Number(iso[2]);
      day = Number(iso[3]);
      hour = Number(iso[4]);
      minute = Number(iso[5]);
      offset = normaliseOffset(iso[7]);
    } else {
      const legacy = line.match(GIT_DEFAULT_RE);
      if (!legacy) {
        if (!emailMatch) skippedLines += 1;
        return;
      }
      month = MONTHS.indexOf(legacy[1]) + 1;
      day = Number(legacy[2]);
      hour = Number(legacy[3]);
      minute = Number(legacy[4]);
      year = Number(legacy[6]);
      offset = normaliseOffset(legacy[7]);
    }

    if (
      !Number.isFinite(year) ||
      !Number.isFinite(month) ||
      !Number.isFinite(day) ||
      hour > 23 ||
      minute > 59 ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      skippedLines += 1;
      return;
    }

    commits.push({
      year,
      month,
      day,
      hour,
      minute,
      offset,
      weekday: weekdayIndex(year, month, day),
      email: emailMatch ? emailMatch[0].toLowerCase() : pendingEmail,
      date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    });
  });

  return { commits, skippedLines };
}

/* --------------------------------------------------------------- classifiers */

export function classifyEmail(email) {
  if (!email) return null;
  const [local, domain = ""] = email.split("@");
  const isNoreply = email.includes("noreply") || domain.endsWith("users.noreply.github.com");
  const isFreeProvider = FREE_MAIL_DOMAINS.includes(domain);
  const stripped = local.replace(/\d+/g, "");
  const nameLike = /^[a-z]{2,}[._-][a-z]{2,}$/.test(stripped);
  return {
    email,
    domain,
    isNoreply,
    isFreeProvider,
    isCorporateDomain: !isNoreply && !isFreeProvider && domain.includes("."),
    nameLike,
  };
}

/**
 * Largest share of commits that falls inside any ROUTINE_WINDOW_HOURS-long
 * window of the local day, wrapping past midnight. 1.0 means a perfectly
 * predictable working day; 0.33 means the commits are spread right around it.
 */
export function routineConcentration(hourCounts, total) {
  if (!total) return { share: 0, startHour: null };
  let best = 0;
  let bestStart = 0;
  for (let start = 0; start < 24; start += 1) {
    let sum = 0;
    for (let step = 0; step < ROUTINE_WINDOW_HOURS; step += 1) {
      sum += hourCounts[(start + step) % 24];
    }
    if (sum > best) {
      best = sum;
      bestStart = start;
    }
  }
  return { share: best / total, startHour: bestStart, count: best };
}

/* -------------------------------------------------------------------- rubric */

/**
 * Disclosure rubric. These are weightings for a privacy checklist, not a
 * statistical model: the maximum of each component is fixed so the four
 * components add up to exactly 100.
 */
export const RUBRIC = Object.freeze({
  /** Identity, max 30 */
  REAL_EMAIL: 15, // a routable address rather than a platform noreply alias
  NAME_LIKE_LOCAL: 8, // first.last pattern gives your legal name
  CORPORATE_DOMAIN: 7, // a company domain names your employer
  IDENTITY_MAX: 30,
  /** Location, max 20 */
  SINGLE_OFFSET: 15, // one consistent UTC offset pins your region
  MULTIPLE_OFFSETS: 20, // changing offsets publish a travel history
  LOCATION_MAX: 20,
  /** Routine, max 30 — scaled by how concentrated the commit hours are */
  ROUTINE_MAX: 30,
  /** Off-hours, max 20 */
  WEEKEND_POINTS: 10,
  WEEKEND_THRESHOLD: 0.25, // a quarter of commits on Sat/Sun
  LATE_NIGHT_POINTS: 10,
  LATE_NIGHT_THRESHOLD: 0.15, // 15% of commits between 00:00 and 05:59 local
  OFF_HOURS_MAX: 20,
});

export const RISK_BANDS = Object.freeze([
  { id: "low", label: "Low exposure", min: 0, max: 24, advice: "The log says little about who you are or when you work." },
  { id: "moderate", label: "Moderate exposure", min: 25, max: 49, advice: "Your region and rough working hours are readable. Consider a noreply commit address." },
  { id: "high", label: "High exposure", min: 50, max: 74, advice: "Your name, employer or daily routine can be reconstructed from this history." },
  { id: "severe", label: "Severe exposure", min: 75, max: 100, advice: "The log is a schedule: identity, time zone and sleep pattern are all published." },
]);

function bandFor(score) {
  return RISK_BANDS.find((band) => score >= band.min && score <= band.max) || RISK_BANDS[0];
}

/** Advisory checks the log itself cannot answer. */
export const MANUAL_CHECKS = Object.freeze([
  [
    "Branch names",
    "Branches like feature/acme-migration or hotfix/JIRA-4412-payroll publish client names and internal ticket ids to anyone who lists the remote refs.",
  ],
  [
    "Commit messages",
    "Messages quoting internal hostnames, ticket links, customer names or the reason for a rollback stay in history even after the code changes.",
  ],
  [
    "Secrets in history",
    "A key removed in a later commit is still in the earlier one. Rotate the credential first, then rewrite history if you must.",
  ],
  [
    "Tags and release notes",
    "Annotated tags carry a tagger name, email and timestamp of their own, separate from the commits they point at.",
  ],
  [
    "Co-author and merge trailers",
    "Co-authored-by trailers and merge commits publish the addresses of colleagues who never chose to be listed.",
  ],
  [
    "Fork and profile linkage",
    "A public fork ties this history to your profile, its follower graph and every other repository you contribute to.",
  ],
]);

/* ------------------------------------------------------------------- scoring */

/**
 * Analyse pasted git log output.
 *
 * score = identity (max 30) + location (max 20)
 *       + round(30 x concentration of commit hours) + off-hours flags (max 20)
 *
 * @param {{ logText?: string }} input
 * @returns {object|{ error:string }}
 */
export function analyseRepoExposure({ logText = "" } = {}) {
  if (typeof logText !== "string") {
    return { error: "Paste git log output as text." };
  }
  const { commits, skippedLines } = parseCommitLog(logText);
  if (commits.length === 0) {
    return {
      error:
        "No commit timestamps found. Paste output from: git log --date=iso-strict --pretty=\"%aI %ae %s\"",
    };
  }

  const total = commits.length;

  /* identity */
  const emails = Array.from(new Set(commits.map((commit) => commit.email).filter(Boolean)));
  const classified = emails.map(classifyEmail).filter(Boolean);
  let identityPoints = 0;
  const identityReasons = [];
  if (classified.some((entry) => !entry.isNoreply)) {
    identityPoints += RUBRIC.REAL_EMAIL;
    identityReasons.push("A routable email address is attached to every commit.");
  }
  if (classified.some((entry) => entry.nameLike && !entry.isNoreply)) {
    identityPoints += RUBRIC.NAME_LIKE_LOCAL;
    identityReasons.push("The address follows a first.last pattern, so it carries your legal name.");
  }
  if (classified.some((entry) => entry.isCorporateDomain)) {
    identityPoints += RUBRIC.CORPORATE_DOMAIN;
    identityReasons.push("A company domain in the address names your employer.");
  }
  identityPoints = Math.min(identityPoints, RUBRIC.IDENTITY_MAX);

  /* location */
  const offsets = {};
  commits.forEach((commit) => {
    if (!commit.offset) return;
    offsets[commit.offset] = (offsets[commit.offset] || 0) + 1;
  });
  const distinctOffsets = Object.keys(offsets).sort();
  let locationPoints = 0;
  let locationReason = "No UTC offsets were found in the pasted lines.";
  if (distinctOffsets.length === 1) {
    locationPoints = RUBRIC.SINGLE_OFFSET;
    locationReason = `Every commit carries ${distinctOffsets[0]}, which pins you to one band of longitude.`;
  } else if (distinctOffsets.length > 1) {
    locationPoints = RUBRIC.MULTIPLE_OFFSETS;
    locationReason = `${distinctOffsets.length} different UTC offsets appear (${distinctOffsets.join(", ")}), publishing a travel history.`;
  }

  /* routine */
  const hourCounts = new Array(24).fill(0);
  commits.forEach((commit) => {
    hourCounts[commit.hour] += 1;
  });
  const concentration = routineConcentration(hourCounts, total);
  const routinePoints = Math.round(RUBRIC.ROUTINE_MAX * concentration.share);
  const busiestHour = hourCounts.indexOf(Math.max(...hourCounts));

  /* off-hours */
  const weekendCommits = commits.filter(
    (commit) => commit.weekday === 0 || commit.weekday === 6,
  ).length;
  const lateNightCommits = commits.filter((commit) =>
    LATE_NIGHT_HOURS.includes(commit.hour),
  ).length;
  const weekendShare = weekendCommits / total;
  const lateNightShare = lateNightCommits / total;
  let offHoursPoints = 0;
  const offHoursReasons = [];
  if (weekendShare >= RUBRIC.WEEKEND_THRESHOLD) {
    offHoursPoints += RUBRIC.WEEKEND_POINTS;
    offHoursReasons.push(
      `${Math.round(weekendShare * 100)}% of commits land on a Saturday or Sunday.`,
    );
  }
  if (lateNightShare >= RUBRIC.LATE_NIGHT_THRESHOLD) {
    offHoursPoints += RUBRIC.LATE_NIGHT_POINTS;
    offHoursReasons.push(
      `${Math.round(lateNightShare * 100)}% of commits fall between 00:00 and 05:59 local time.`,
    );
  }
  offHoursPoints = Math.min(offHoursPoints, RUBRIC.OFF_HOURS_MAX);

  const score = Math.max(
    0,
    Math.min(100, identityPoints + locationPoints + routinePoints + offHoursPoints),
  );

  const weekdayCounts = new Array(7).fill(0);
  commits.forEach((commit) => {
    weekdayCounts[commit.weekday] += 1;
  });

  return {
    score,
    band: bandFor(score),
    commitCount: total,
    skippedLines,
    emails: classified,
    identityPoints,
    identityReasons,
    locationPoints,
    locationReason,
    distinctOffsets,
    offsetCounts: offsets,
    routinePoints,
    concentrationShare: concentration.share,
    windowStartHour: concentration.startHour,
    windowEndHour:
      concentration.startHour === null
        ? null
        : (concentration.startHour + ROUTINE_WINDOW_HOURS) % 24,
    hourCounts,
    busiestHour,
    weekdayCounts,
    weekdayNames: DAY_NAMES,
    weekendShare,
    lateNightShare,
    offHoursPoints,
    offHoursReasons,
    firstDate: commits[0].date,
    lastDate: commits[commits.length - 1].date,
  };
}
