/**
 * Instagram 2FA Setup Guide — local checklist data and scoring.
 *
 * This module is deliberately pure: it does not call Instagram, Meta or any
 * external API. It scores the user's own checklist state in the browser.
 */

export const CHECKLIST = [
  {
    id: "unique-password",
    group: "Sign in",
    title: "Use a password that is unique to Instagram",
    detail:
      "Open Accounts Center or Instagram settings and replace any reused password with a long one stored in a password manager.",
    where: "Settings and privacy -> Accounts Center -> Password and security -> Change password",
    weight: 10,
    critical: true,
  },
  {
    id: "current-email-phone",
    group: "Recovery",
    title: "Confirm email and phone recovery details are yours",
    detail:
      "A takeover often starts by changing recovery details. Make sure the listed email and phone are current before enabling stronger login controls.",
    where: "Accounts Center -> Personal details -> Contact info",
    weight: 8,
    critical: true,
  },
  {
    id: "authenticator-app",
    group: "Two-factor authentication",
    title: "Turn on two-factor authentication with an authenticator app",
    detail:
      "Use an authenticator app instead of relying only on SMS. App codes are safer against SIM-swap attacks and work even when mobile signal is poor.",
    where: "Accounts Center -> Password and security -> Two-factor authentication",
    weight: 14,
    critical: true,
  },
  {
    id: "backup-codes",
    group: "Recovery",
    title: "Save backup codes outside Instagram",
    detail:
      "Backup codes are single-use recovery keys. Save them in a password manager or print them; do not keep the only copy in Instagram DMs or screenshots.",
    where: "Two-factor authentication -> Additional methods -> Backup codes",
    weight: 10,
    critical: true,
  },
  {
    id: "remove-sms",
    group: "Two-factor authentication",
    title: "Remove SMS once app 2FA and backup codes work",
    detail:
      "SMS is better than no second factor, but it is weaker than app codes or passkeys because phone numbers can be ported.",
    where: "Two-factor authentication -> Text message",
    weight: 8,
    critical: false,
  },
  {
    id: "login-alerts",
    group: "Monitoring",
    title: "Keep login alerts enabled",
    detail:
      "Login alerts make a new-device sign-in visible quickly, so you can reset the password and end sessions before the account is abused.",
    where: "Accounts Center -> Password and security -> Login alerts",
    weight: 7,
    critical: false,
  },
  {
    id: "active-sessions",
    group: "Devices",
    title: "Review where you are logged in and sign out old sessions",
    detail:
      "Remove phones, browsers, emulators and tablets you do not recognise or no longer own.",
    where: "Accounts Center -> Password and security -> Where you're logged in",
    weight: 8,
    critical: false,
  },
  {
    id: "connected-apps",
    group: "Apps and data",
    title: "Remove connected apps and websites you do not use",
    detail:
      "Giveaways, analytics panels and old social tools can keep broad account access long after you stop using them.",
    where: "Settings and privacy -> Website permissions -> Apps and websites",
    weight: 7,
    critical: false,
  },
  {
    id: "passkey",
    group: "Two-factor authentication",
    title: "Add a passkey when the option is available",
    detail:
      "A passkey is bound to the genuine sign-in domain and unlocked by your device, so it is much harder to phish than a typed code.",
    where: "Accounts Center -> Password and security -> Passkeys",
    weight: 6,
    critical: false,
  },
  {
    id: "linked-accounts",
    group: "Apps and data",
    title: "Check linked Facebook, Threads and business accounts",
    detail:
      "A weak linked Meta account can become an alternate path into Instagram. Harden or unlink anything you do not actively use.",
    where: "Accounts Center -> Accounts / Connected experiences",
    weight: 7,
    critical: false,
  },
  {
    id: "account-status",
    group: "Monitoring",
    title: "Check Account Status for warnings you did not cause",
    detail:
      "Unexpected content removals, login restrictions or policy warnings may indicate someone else used the account.",
    where: "Settings and privacy -> Account Status",
    weight: 5,
    critical: false,
  },
  {
    id: "profile-privacy",
    group: "Privacy",
    title: "Limit personal contact data and impersonation clues",
    detail:
      "Remove public email, phone, exact location and recovery clues from bio, highlights and pinned posts if they are not needed.",
    where: "Edit profile / Settings and privacy -> Messages and story replies",
    weight: 5,
    critical: false,
  },
  {
    id: "phishing-dm-habit",
    group: "Privacy",
    title: "Treat copyright, badge and giveaway DMs as phishing until verified",
    detail:
      "Instagram recovery scams often ask you to paste a code, screenshot a reset link or log in through a lookalike page.",
    where: "In-app messages, email and browser links",
    weight: 5,
    critical: false,
  },
];

export const GROUPS = [
  "Sign in",
  "Two-factor authentication",
  "Recovery",
  "Devices",
  "Apps and data",
  "Monitoring",
  "Privacy",
];

export const DEFAULT_DONE = ["unique-password", "current-email-phone"];
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);
export const CRITICAL_CAP_PERCENT = 69;

export const BANDS = [
  { min: 90, label: "Hardened", hint: "Strong enough for creator, business and recovery accounts." },
  { min: 70, label: "Well protected", hint: "Good baseline. Close the last weak recovery and session gaps." },
  { min: 40, label: "Partly protected", hint: "A phishing DM or SIM swap could still create trouble." },
  { min: 0, label: "At risk", hint: "A leaked password may be enough to take over the account." },
];

const byId = new Map(CHECKLIST.map((item) => [item.id, item]));

function normalise(doneIds) {
  const done = new Set();
  for (const raw of doneIds || []) {
    if (typeof raw === "string" && byId.has(raw)) done.add(raw);
  }
  return done;
}

export function bandFor(percent) {
  const value = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
  return BANDS.find((band) => value >= band.min) || BANDS[BANDS.length - 1];
}

export function scoreChecklist(doneIds = []) {
  if (!Array.isArray(doneIds)) {
    return { error: "Completed items must be a list." };
  }
  if (TOTAL_WEIGHT <= 0) {
    return { error: "Checklist is not ready." };
  }

  const done = normalise(doneIds);
  let points = 0;
  const remaining = [];
  const missingCritical = [];

  for (const item of CHECKLIST) {
    if (done.has(item.id)) {
      points += item.weight;
    } else {
      remaining.push(item);
      if (item.critical) missingCritical.push(item);
    }
  }

  const rawPercent = Math.round((points / TOTAL_WEIGHT) * 100);
  const capped = missingCritical.length > 0 && rawPercent > CRITICAL_CAP_PERCENT;
  const percent = capped ? CRITICAL_CAP_PERCENT : rawPercent;
  const band = bandFor(percent);

  return {
    points,
    maxPoints: TOTAL_WEIGHT,
    percent,
    capped,
    bandLabel: band.label,
    bandHint: band.hint,
    completed: done.size,
    total: CHECKLIST.length,
    remaining,
    missingCritical,
    nextActions: remaining.slice().sort((a, b) => b.weight - a.weight).slice(0, 3),
  };
}
