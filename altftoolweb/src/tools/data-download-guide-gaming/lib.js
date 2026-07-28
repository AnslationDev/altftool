/**
 * Gaming Account Data Export Guide — request planning and post-export audit logic.
 *
 * Pure module: no React, no DOM, no clocks. Every date is passed in as an
 * argument, so the same inputs always produce the same output. Every exported
 * function is total: unusable input returns { error } rather than NaN, an
 * Invalid Date or a silently wrong deadline.
 *
 * Two separate things are modelled and they must not be confused:
 *   1. The platform's OWN self-serve turnaround (observed, not promised).
 *   2. The STATUTORY deadline the platform is bound by once you make a formal
 *      access request under a data-protection law. That is the date you can
 *      escalate on, and it is the one the tool counts down to.
 */

/**
 * Where each platform's export lives, what it contains and how long the
 * self-serve route usually takes.
 *
 * typicalDaysMin / typicalDaysMax describe the observed self-serve turnaround
 * only. They are NOT a legal commitment — the platform makes no promise about
 * them, which is exactly why the statutory deadline below is tracked separately.
 */
export const PLATFORMS = [
  {
    id: "steam",
    name: "Steam (Valve)",
    route:
      "Steam Support > My Account > Data Related to Your Steam Account. Sign in on the web rather than in the desktop client, then pick a category and use the download link it generates.",
    typicalDaysMin: 1,
    typicalDaysMax: 7,
    format: "Per-category HTML and JSON pages generated on demand, downloaded one category at a time.",
    includes: [
      "Account and licence data — every game, DLC and package attached to the account",
      "Purchase and wallet history, including refunds and gift transactions",
      "Steam Community data: friends list, groups, reviews, workshop items, profile comments",
      "Steam chat messages held on Valve's servers",
      "In-game item and inventory records for Valve titles",
      "Support ticket history and sign-in / IP records",
    ],
    gotchas: [
      "The account-data page is per category — people download one file, assume that is everything, and miss the chat and purchase categories entirely.",
      "Purchase history is also readable directly at Store > Account details > View purchase history, which is faster than waiting for the export.",
    ],
  },
  {
    id: "playstation",
    name: "PlayStation (Sony Interactive Entertainment)",
    route:
      "Open the privacy notice linked at the bottom of playstation.com and follow its Your Rights section to Sony Interactive Entertainment's privacy request form. There is no one-click download inside the console UI.",
    typicalDaysMin: 14,
    typicalDaysMax: 30,
    format: "Emailed download link, usually a ZIP of documents and structured files.",
    includes: [
      "PSN account profile, online ID history and sign-in records",
      "Wallet, transaction and subscription history including PlayStation Plus",
      "Trophy data and game-play records tied to the account",
      "Friends list and blocked-player list",
      "Messages and party chat metadata retained by Sony",
      "Moderation and enforcement history against the account",
    ],
    gotchas: [
      "Sony's export is form-based, so it is slow compared with Steam or Xbox — start it first if you are exporting several platforms.",
      "Voice chat is generally not stored, but a reported clip can be retained; the moderation record shows whether that happened.",
    ],
  },
  {
    id: "xbox",
    name: "Xbox (Microsoft account)",
    route:
      "account.microsoft.com/privacy > Download your data. Xbox-specific privacy toggles live separately at account.xbox.com/Settings > Privacy & online safety.",
    typicalDaysMin: 1,
    typicalDaysMax: 30,
    format: "ZIP archives of CSV and JSON, split into several files when the archive is large.",
    includes: [
      "Xbox profile, gamertag history, gamerscore and achievements",
      "Purchase and Game Pass subscription history across Microsoft Store",
      "Friends, followers and blocked accounts",
      "Xbox activity and app-usage history",
      "Search and browsing history tied to the same Microsoft account",
      "Location history if any Microsoft device recorded it",
    ],
    gotchas: [
      "The download covers the whole Microsoft account, so Xbox data arrives mixed with Bing, Edge and Windows records — filter by the Xbox files rather than reading everything.",
      "Large accounts are split across multiple archives and each link expires; download them all in one sitting.",
    ],
  },
  {
    id: "nintendo",
    name: "Nintendo Account",
    route:
      "accounts.nintendo.com for the profile and linked-account view, then use the privacy request route in Nintendo's privacy policy to ask for the full copy.",
    typicalDaysMin: 14,
    typicalDaysMax: 30,
    format: "Emailed files after identity verification against the account email.",
    includes: [
      "Nintendo Account profile, country and linked accounts",
      "eShop purchase and Nintendo Switch Online subscription history",
      "Play activity records where play-activity sharing was enabled",
      "Friends list and parental-control settings",
    ],
    gotchas: [
      "Play-activity records only exist for the period the setting was on, so an empty section is not proof the data was withheld.",
      "Family group members are separate Nintendo Accounts — each person has to request their own copy.",
    ],
  },
  {
    id: "epic",
    name: "Epic Games",
    route:
      "epicgames.com > Account > General (Personal Details) > Request Account Data. The link is emailed to the account address.",
    typicalDaysMin: 1,
    typicalDaysMax: 14,
    format: "ZIP of JSON and CSV files delivered by email link.",
    includes: [
      "Account profile, display-name history and connected platform accounts",
      "Entitlements — every game and item claimed, including free weekly claims",
      "Purchase, refund and V-Bucks transaction history",
      "Friends list and party history",
      "Match and gameplay telemetry for Epic titles",
    ],
    gotchas: [
      "Connected console and Steam identities show up here, which is the fastest way to find out which third-party accounts still have access.",
      "The download link expires; request it when you have time to save the file straight away.",
    ],
  },
  {
    id: "discord",
    name: "Discord",
    route:
      "User Settings > Data & Privacy > Request all of my Data. Choose the categories, then wait for the email.",
    typicalDaysMin: 3,
    typicalDaysMax: 30,
    format: "ZIP of JSON with an index HTML file for messages.",
    includes: [
      "Account profile, connections and payment records",
      "Every direct message and every server message you sent",
      "Servers you belong to and their channel lists",
      "Activity analytics — voice minutes, sessions and client events",
    ],
    gotchas: [
      "Only your own messages are included; what other people sent in a DM is their data, not yours.",
      "Voice-channel content is not recorded, but the analytics file shows when and where you were connected.",
    ],
  },
];

/**
 * Statutory response deadlines for a formal access request.
 *
 * responseDays / responseMonths is the primary deadline, extensionDays /
 * extensionMonths the maximum lawful extension. Where a regime measures in
 * calendar months the month field is used, because "one month" is not 30 days.
 */
export const REGIMES = [
  {
    id: "gdpr",
    name: "EU / EEA — GDPR",
    responseMonths: 1,
    extensionMonths: 2,
    basis:
      "GDPR Article 12(3): respond without undue delay and in any event within one month, extendable by two further months for complex or numerous requests, with the reason given inside the first month.",
    escalation:
      "Complain to your national data protection authority, or sue in your own member state's courts (Articles 77 and 79).",
  },
  {
    id: "uk-gdpr",
    name: "United Kingdom — UK GDPR",
    responseMonths: 1,
    extensionMonths: 2,
    basis:
      "UK GDPR Article 12(3) with the Data Protection Act 2018: one calendar month, extendable by two months for complex requests.",
    escalation: "Complain to the Information Commissioner's Office once the deadline passes.",
  },
  {
    id: "ccpa",
    name: "California — CCPA / CPRA",
    responseDays: 45,
    extensionDays: 45,
    basis:
      "CCPA as amended by the CPRA: acknowledge within 10 business days and respond within 45 calendar days, extendable once by a further 45 days with notice, so 90 days at the outside.",
    escalation:
      "Complain to the California Privacy Protection Agency or the California Attorney General.",
  },
  {
    id: "lgpd",
    name: "Brazil — LGPD",
    responseDays: 15,
    extensionDays: 0,
    basis:
      "LGPD Article 19: a simplified response immediately, or a complete declaration of the data held within 15 days of the request.",
    escalation: "Complain to the ANPD, the national data protection authority.",
  },
  {
    id: "other",
    name: "Elsewhere — no fixed statutory clock",
    responseDays: 0,
    extensionDays: 0,
    basis:
      "Your country may have no access right, or one without a fixed deadline. India's DPDP Act 2023 grants an access right in Section 11 but the timelines sit in rules rather than the Act itself, so the platform's own turnaround is what you can realistically hold it to.",
    escalation:
      "Chase through the platform's support channel and cite its published privacy policy commitments; check your national regulator for the current timeline.",
  },
];

/** Post-export audit. Weights are a risk ranking; they sum to 100. */
export const AUDIT_CHECKLIST = [
  {
    id: "linked-accounts",
    group: "Access and identity",
    title: "List every linked and connected account",
    detail:
      "The export names each third-party identity attached to the account — console, storefront, social login, Twitch or Discord link. Anything you do not recognise, or no longer use, is a live route into the account.",
    weight: 12,
    critical: true,
  },
  {
    id: "session-ip",
    group: "Access and identity",
    title: "Scan the sign-in and IP records for sessions that are not yours",
    detail:
      "Sign-in history with IP and rough location is the single most useful file in a gaming export. A sign-in from a country you have never played from means the credentials leaked, and the date tells you what else to check.",
    weight: 12,
    critical: true,
  },
  {
    id: "email-changes",
    group: "Access and identity",
    title: "Check the email, gamertag and display-name change history",
    detail:
      "An attacker's first move is usually changing the recovery address. A change you did not make, even one that was reverted, means the account was compromised at that date.",
    weight: 10,
    critical: true,
  },
  {
    id: "purchases",
    group: "Money",
    title: "Reconcile purchase, refund and wallet history against your bank",
    detail:
      "Match the export line by line against card and wallet statements. Small in-game currency purchases are the usual test transaction before a larger fraud, and they are easy to miss on a statement.",
    weight: 11,
    critical: true,
  },
  {
    id: "subscriptions",
    group: "Money",
    title: "Find subscriptions and auto-renewals you forgot about",
    detail:
      "Game Pass, PlayStation Plus, Nintendo Switch Online and season passes renew silently. The export shows the start date and renewal cadence for each, which is what you need to cancel the ones you no longer play.",
    weight: 7,
    critical: false,
  },
  {
    id: "payment-methods",
    group: "Money",
    title: "Remove stored payment methods you no longer use",
    detail:
      "Stored cards in the export that you have since replaced are still authorising charges if the network updated them automatically. Delete them from the account rather than relying on the card expiring.",
    weight: 7,
    critical: false,
  },
  {
    id: "friends-list",
    group: "Social exposure",
    title: "Prune the friends list against who is actually in it",
    detail:
      "Exports usually include friends added years ago from public lobbies. On most platforms friends can see your online status, current game and sometimes your real name, so an unpruned list is a standing privacy leak.",
    weight: 8,
    critical: false,
  },
  {
    id: "chat-review",
    group: "Social exposure",
    title: "Read the retained chat logs before deciding what to delete",
    detail:
      "Text chat is retained far longer than most players expect and is what gets quoted back in a moderation dispute or a doxxing attempt. Search the logs for your own address, school, workplace and phone number.",
    weight: 8,
    critical: false,
  },
  {
    id: "real-name",
    group: "Social exposure",
    title: "Check whether your real name or age is exposed on the profile",
    detail:
      "Real-name fields, birthdays and region show up in the profile section of the export. If they are set to public, they are visible to anyone who lands on your profile from a match.",
    weight: 6,
    critical: false,
  },
  {
    id: "telemetry",
    group: "Data footprint",
    title: "See how much play and device telemetry is held",
    detail:
      "Session times, hardware surveys and per-match telemetry show the volume of behavioural data attached to the account. That is the section to challenge if you want the footprint reduced.",
    weight: 5,
    critical: false,
  },
  {
    id: "moderation",
    group: "Data footprint",
    title: "Read the moderation and enforcement record",
    detail:
      "Warnings, reports made against you and reports you filed are usually included. Knowing what is on the record matters before you appeal a ban, because appeals are decided against exactly this file.",
    weight: 5,
    critical: false,
  },
  {
    id: "store-export",
    group: "Data footprint",
    title: "Store the export somewhere encrypted, then delete the email link",
    detail:
      "The archive contains your address, purchase records and private messages in plain files. Keeping it in a downloads folder or leaving the link live in your inbox is a bigger risk than the data being on the platform.",
    weight: 9,
    critical: true,
  },
];

/** Display order of the audit groups. */
export const AUDIT_GROUPS = ["Access and identity", "Money", "Social exposure", "Data footprint"];

/** Sum of all audit weights. The checklist is authored so that this equals 100. */
export const AUDIT_TOTAL_WEIGHT = AUDIT_CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** A missing critical audit step caps the readiness score here. */
export const CRITICAL_CAP_PERCENT = 69;

/** Read top-down: the first band whose `min` the score reaches wins. */
export const BANDS = [
  { id: "complete", min: 90, label: "Audit complete", hint: "You know what the platform holds and what it exposes." },
  { id: "good", min: 70, label: "Mostly reviewed", hint: "The money and identity checks are done — finish the exposure pass." },
  { id: "started", min: 40, label: "Partly reviewed", hint: "You have the file but have not yet acted on the risky sections." },
  { id: "unreviewed", min: 0, label: "Not reviewed", hint: "An unopened export tells you nothing. Start with the sign-in records." },
];

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86400000;

const platformById = new Map(PLATFORMS.map((item) => [item.id, item]));
const regimeById = new Map(REGIMES.map((item) => [item.id, item]));
const auditById = new Map(AUDIT_CHECKLIST.map((item) => [item.id, item]));

/** Parse a YYYY-MM-DD string into a UTC timestamp, or NaN if it is not a real date. */
export function parseIsoDate(value) {
  if (typeof value !== "string") return Number.NaN;
  const match = ISO_DATE.exec(value.trim());
  if (!match) return Number.NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return Number.NaN;
  const stamp = Date.UTC(year, month - 1, day);
  const back = new Date(stamp);
  // Rejects 2025-02-30 and friends, which Date.UTC would silently roll forward.
  if (back.getUTCFullYear() !== year || back.getUTCMonth() !== month - 1 || back.getUTCDate() !== day) {
    return Number.NaN;
  }
  return stamp;
}

/** Format a UTC timestamp back to YYYY-MM-DD. */
export function toIsoDate(stamp) {
  if (!Number.isFinite(stamp)) return "";
  return new Date(stamp).toISOString().slice(0, 10);
}

/** Add whole days to a UTC timestamp. */
export function addDays(stamp, days) {
  if (!Number.isFinite(stamp) || !Number.isFinite(days)) return Number.NaN;
  return stamp + Math.round(days) * MS_PER_DAY;
}

/**
 * Add calendar months, clamping to the last day when the target month is
 * shorter. 31 January plus one month is 28 (or 29) February, which is how a
 * "one month" statutory deadline is counted.
 */
export function addMonths(stamp, months) {
  if (!Number.isFinite(stamp) || !Number.isFinite(months)) return Number.NaN;
  const date = new Date(stamp);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const targetMonth = month + Math.round(months);
  const lastDay = new Date(Date.UTC(year, targetMonth + 1, 0)).getUTCDate();
  return Date.UTC(year, targetMonth, Math.min(day, lastDay));
}

/** Whole days between two UTC timestamps, b minus a. */
export function daysBetween(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return Number.NaN;
  return Math.round((b - a) / MS_PER_DAY);
}

/**
 * Build the request plan for one platform under one legal regime.
 *
 * @param {object} input
 * @param {string} input.platformId  id from PLATFORMS.
 * @param {string} input.regimeId    id from REGIMES.
 * @param {string} input.requestedOn date the request was sent, YYYY-MM-DD.
 * @param {string} [input.today]     date to measure "days left" from, YYYY-MM-DD.
 *                                   Passed in rather than read from a clock so
 *                                   the function stays pure.
 * @returns {object} the plan, or { error } for unusable input.
 */
export function buildExportPlan({ platformId, regimeId, requestedOn, today } = {}) {
  const platform = platformById.get(platformId);
  if (!platform) return { error: "Choose one of the supported gaming platforms." };

  const regime = regimeById.get(regimeId);
  if (!regime) return { error: "Choose where you are making the request from." };

  const start = parseIsoDate(requestedOn);
  if (!Number.isFinite(start)) {
    return { error: "Enter the request date as a real calendar date (YYYY-MM-DD)." };
  }

  const now = today === undefined || today === null || today === "" ? start : parseIsoDate(today);
  if (!Number.isFinite(now)) {
    return { error: "Enter today's date as a real calendar date (YYYY-MM-DD)." };
  }
  if (now < start) {
    return { error: "The request date cannot be in the future relative to today's date." };
  }

  const selfServeFrom = addDays(start, platform.typicalDaysMin);
  const selfServeBy = addDays(start, platform.typicalDaysMax);

  const hasStatutoryClock = Boolean(regime.responseMonths) || Boolean(regime.responseDays);
  const statutoryDeadline = regime.responseMonths
    ? addMonths(start, regime.responseMonths)
    : regime.responseDays
      ? addDays(start, regime.responseDays)
      : Number.NaN;
  const extendedDeadline = regime.extensionMonths
    ? addMonths(statutoryDeadline, regime.extensionMonths)
    : regime.extensionDays
      ? addDays(statutoryDeadline, regime.extensionDays)
      : statutoryDeadline;

  const daysElapsed = daysBetween(start, now);
  const daysLeft = hasStatutoryClock ? daysBetween(now, statutoryDeadline) : Number.NaN;

  let status = "no-clock";
  if (hasStatutoryClock) {
    if (daysLeft > 7) status = "waiting";
    else if (daysLeft >= 0) status = "due-soon";
    else if (now <= extendedDeadline) status = "overdue";
    else status = "escalate";
  }

  return {
    platform,
    regime,
    requestedOn: toIsoDate(start),
    today: toIsoDate(now),
    daysElapsed,
    selfServeFrom: toIsoDate(selfServeFrom),
    selfServeBy: toIsoDate(selfServeBy),
    selfServeOverdue: now > selfServeBy,
    hasStatutoryClock,
    statutoryDeadline: hasStatutoryClock ? toIsoDate(statutoryDeadline) : "",
    extendedDeadline: hasStatutoryClock ? toIsoDate(extendedDeadline) : "",
    daysLeft,
    status,
  };
}

/** First band whose minimum the percent reaches. Percent is clamped to 0..100. */
export function bandFor(percent) {
  const value = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
  return BANDS.find((band) => value >= band.min) || BANDS[BANDS.length - 1];
}

/**
 * Score the post-export audit. Unknown ids and duplicates are ignored so a
 * stale saved list can never inflate the score.
 *
 * @param {string[]} doneIds ids from AUDIT_CHECKLIST already reviewed.
 */
export function scoreAudit(doneIds) {
  if (!Array.isArray(doneIds)) {
    return { error: "Reviewed steps must be provided as a list." };
  }
  if (!(AUDIT_TOTAL_WEIGHT > 0)) {
    return { error: "This audit has no weighted steps to score." };
  }

  const done = new Set();
  for (const raw of doneIds) {
    if (typeof raw === "string" && auditById.has(raw)) done.add(raw);
  }

  let points = 0;
  const missingCritical = [];
  const remaining = [];

  for (const item of AUDIT_CHECKLIST) {
    if (done.has(item.id)) {
      points += item.weight;
    } else {
      remaining.push(item);
      if (item.critical) missingCritical.push(item);
    }
  }

  const rawPercent = Math.round((points / AUDIT_TOTAL_WEIGHT) * 100);
  const capped = missingCritical.length > 0 && rawPercent > CRITICAL_CAP_PERCENT;
  const percent = capped ? CRITICAL_CAP_PERCENT : rawPercent;
  const band = bandFor(percent);

  const groups = AUDIT_GROUPS.map((name) => {
    const items = AUDIT_CHECKLIST.filter((item) => item.group === name);
    const doneCount = items.filter((item) => done.has(item.id)).length;
    return {
      name,
      done: doneCount,
      total: items.length,
      percent: items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0,
    };
  });

  const nextActions = remaining
    .slice()
    .sort((a, b) => Number(b.critical) - Number(a.critical) || b.weight - a.weight)
    .slice(0, 3);

  return {
    points,
    maxPoints: AUDIT_TOTAL_WEIGHT,
    rawPercent,
    percent,
    capped,
    completed: done.size,
    total: AUDIT_CHECKLIST.length,
    band: band.id,
    bandLabel: band.label,
    bandHint: band.hint,
    missingCritical,
    remaining,
    groups,
    nextActions,
  };
}
