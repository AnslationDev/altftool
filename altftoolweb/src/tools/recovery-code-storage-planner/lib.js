/**
 * Recovery Code Storage Planner — resilience rules for 2FA backup codes.
 *
 * Pure module: no React, no DOM, no clock reads.
 *
 * The plan is graded against the 3-2-1 backup rule, the long-standing data-protection
 * convention of keeping three copies of the data on two different kinds of media with
 * one copy off-site. Two authentication-specific rules are layered on top:
 *
 *  - A backup code kept on the same device that runs your authenticator app is not a
 *    backup. Losing or having that one device stolen takes the factor and its fallback
 *    at the same time, which is exactly the failure the codes exist to cover.
 *  - Storing the codes only inside the password manager whose own account they unlock
 *    is a circular dependency: locked out of the manager, you cannot reach the codes
 *    that would let you back into the manager.
 *
 * Durability is an ordinal 1-5 rank for how well a copy survives fire, water, loss and
 * a decade of time. It is a ranking device, not a measured failure rate.
 */

/** 3-2-1 backup rule: three copies of the data. */
export const MIN_COPIES = 3;
/** 3-2-1 backup rule: on at least two different kinds of media. */
export const MIN_MEDIA_TYPES = 2;
/** 3-2-1 backup rule: at least one copy stored away from your home. */
export const MIN_OFFSITE = 1;
/** At least one copy should survive a house fire or ten years in a drawer. */
export const MIN_DURABILITY_FOR_ARCHIVE = 4;
/** Re-print codes at least this often; issuers invalidate old sets when you re-generate. */
export const REVIEW_INTERVAL_MONTHS = 12;
/** Sanity ceiling on the number of accounts you are planning for. */
export const MAX_ACCOUNTS = 200;

export const MEDIA_TYPES = {
  physical: "Paper or metal",
  "local-digital": "Local encrypted digital",
  "cloud-digital": "Cloud or synced digital",
};

/**
 * Places people actually put recovery codes.
 * sameDevice: true means it lives on the phone that runs the authenticator app.
 * circular:   true means it is only reachable once you are already signed in there.
 */
export const STORAGE_LOCATIONS = [
  {
    id: "paper-fire-safe",
    label: "Printed and locked in a home fire safe",
    media: "physical",
    offline: true,
    encrypted: false,
    offsite: false,
    sameDevice: false,
    circular: false,
    durability: 4,
    note: "Survives a house fire and needs no battery, software or password.",
    watch: "Anyone with physical access to the safe has plaintext codes — keep the safe locked.",
  },
  {
    id: "paper-drawer",
    label: "Printed and filed in a desk drawer or folder",
    media: "physical",
    offline: true,
    encrypted: false,
    offsite: false,
    sameDevice: false,
    circular: false,
    durability: 2,
    note: "Better than nothing and instantly available.",
    watch: "Lost to fire, flood, a house move or a tidy-up. Do not let this be your only copy.",
  },
  {
    id: "metal-plate",
    label: "Stamped or engraved on a metal backup plate",
    media: "physical",
    offline: true,
    encrypted: false,
    offsite: false,
    sameDevice: false,
    circular: false,
    durability: 5,
    note: "The most durable option — used for crypto seed phrases for the same reason.",
    watch: "Slow to update, so reserve it for accounts whose codes you rarely re-generate.",
  },
  {
    id: "relative-sealed",
    label: "Sealed envelope with a trusted relative or friend",
    media: "physical",
    offline: true,
    encrypted: false,
    offsite: true,
    sameDevice: false,
    circular: false,
    durability: 3,
    note: "Gives you the off-site copy without paying for anything.",
    watch: "The codes are plaintext in someone else's home; only do this with real trust.",
  },
  {
    id: "safe-deposit-box",
    label: "Bank safe deposit box or an office safe",
    media: "physical",
    offline: true,
    encrypted: false,
    offsite: true,
    sameDevice: false,
    circular: false,
    durability: 5,
    note: "Off-site and durable at the same time — one entry can satisfy two rules.",
    watch: "You can only reach it in business hours, so never make it the only copy.",
  },
  {
    id: "encrypted-usb",
    label: "Encrypted USB stick or SD card kept at home",
    media: "local-digital",
    offline: true,
    encrypted: true,
    offsite: false,
    sameDevice: false,
    circular: false,
    durability: 3,
    note: "Encrypted at rest and never touches a network.",
    watch: "Flash memory left unpowered for years can lose data — refresh it when you review.",
  },
  {
    id: "password-manager",
    label: "Notes field of your password manager entry",
    media: "cloud-digital",
    offline: false,
    encrypted: true,
    offsite: true,
    sameDevice: false,
    circular: true,
    durability: 4,
    note: "The most convenient option and correctly encrypted — good as one copy of three.",
    watch: "Circular for the manager's own account: locked out there, you cannot reach the codes.",
  },
  {
    id: "encrypted-archive-cloud",
    label: "Encrypted archive uploaded to a cloud drive",
    media: "cloud-digital",
    offline: false,
    encrypted: true,
    offsite: true,
    sameDevice: false,
    circular: false,
    durability: 4,
    note: "Off-site, versioned and cheap, as long as the archive itself is encrypted.",
    watch: "Only counts as encrypted if you encrypted the file yourself before uploading it.",
  },
  {
    id: "phone-screenshot",
    label: "Screenshot in the phone gallery",
    media: "cloud-digital",
    offline: false,
    encrypted: false,
    offsite: false,
    sameDevice: true,
    circular: false,
    durability: 2,
    note: "Fast, and the reason so many people think they have a backup.",
    watch: "Same device as the authenticator, auto-synced to a cloud album, and readable by any app with photo access.",
  },
  {
    id: "plain-notes-app",
    label: "Plain note in a synced notes app",
    media: "cloud-digital",
    offline: false,
    encrypted: false,
    offsite: false,
    sameDevice: true,
    circular: false,
    durability: 2,
    note: "Searchable and always to hand.",
    watch: "Unencrypted, synced everywhere, and usually open on the same phone as your authenticator.",
  },
  {
    id: "email-to-self",
    label: "Emailed to yourself",
    media: "cloud-digital",
    offline: false,
    encrypted: false,
    offsite: true,
    sameDevice: false,
    circular: true,
    durability: 3,
    note: "Survives losing every device you own.",
    watch: "Circular for your email account itself, and anyone who reads your mailbox reads the codes.",
  },
];

export const VERDICTS = [
  { id: "fragile", label: "Fragile", max: 39, advice: "One bad day — a lost phone or a house move — locks you out." },
  { id: "partial", label: "Partial", max: 69, advice: "Workable, but there is a single failure that takes everything." },
  { id: "solid", label: "Solid", max: 89, advice: "Covers device loss, theft and most household disasters." },
  { id: "resilient", label: "Resilient", max: 100, advice: "Meets 3-2-1 with no single-device or circular dependency." },
];

/** Rule weights. Higher weight = a bigger contribution to the score. */
const RULE_WEIGHTS = {
  copies: 3,
  media: 2,
  offsite: 3,
  "same-device": 3,
  circular: 2,
  encrypted: 1,
  durable: 2,
};

const TOTAL_WEIGHT = Object.values(RULE_WEIGHTS).reduce((sum, value) => sum + value, 0);

function verdictFor(percent) {
  return VERDICTS.find((band) => percent <= band.max) || VERDICTS[VERDICTS.length - 1];
}

/**
 * Grade a recovery-code storage plan.
 *
 * @param {object} input
 * @param {string[]} input.selectedIds   ids from STORAGE_LOCATIONS you intend to use
 * @param {number}   input.accountCount  how many accounts you hold recovery codes for
 * @param {boolean}  input.protectsPasswordManager true if one of those accounts is the password manager itself
 * @param {boolean}  input.protectsEmail true if one of those accounts is your primary email
 * @returns {object} graded plan, or { error }
 */
export function planRecoveryStorage({
  selectedIds,
  accountCount,
  protectsPasswordManager = false,
  protectsEmail = false,
} = {}) {
  if (!Array.isArray(selectedIds)) {
    return { error: "Choose the places you plan to keep your recovery codes." };
  }
  const accounts = Number(accountCount);
  if (!Number.isFinite(accounts)) {
    return { error: "Enter the number of accounts as a number." };
  }
  if (accounts < 1) {
    return { error: "Plan for at least one account." };
  }
  if (accounts > MAX_ACCOUNTS) {
    return { error: `Plan for ${MAX_ACCOUNTS} accounts or fewer — check for a typo.` };
  }

  const wanted = new Set(selectedIds);
  const chosen = STORAGE_LOCATIONS.filter((location) => wanted.has(location.id));

  const copies = chosen.length;
  const mediaSet = new Set(chosen.map((location) => location.media));
  const offsiteCount = chosen.filter((location) => location.offsite).length;
  const encryptedCount = chosen.filter((location) => location.encrypted).length;
  const sameDevice = chosen.filter((location) => location.sameDevice);
  const independent = chosen.filter((location) => !location.sameDevice && !location.circular);
  const bestDurability = chosen.reduce((max, location) => Math.max(max, location.durability), 0);

  const circularRisk =
    (protectsPasswordManager || protectsEmail) && independent.length === 0 && copies > 0;

  const checks = [
    {
      id: "copies",
      label: `At least ${MIN_COPIES} separate copies`,
      ok: copies >= MIN_COPIES,
      detail:
        copies >= MIN_COPIES
          ? `${copies} copies planned.`
          : `Only ${copies} ${copies === 1 ? "copy" : "copies"}. The 3-2-1 rule asks for ${MIN_COPIES}.`,
    },
    {
      id: "media",
      label: `At least ${MIN_MEDIA_TYPES} kinds of media`,
      ok: mediaSet.size >= MIN_MEDIA_TYPES,
      detail:
        mediaSet.size >= MIN_MEDIA_TYPES
          ? `Using ${[...mediaSet].map((key) => MEDIA_TYPES[key]).join(" and ")}.`
          : "All your copies share one medium, so one kind of accident destroys all of them.",
    },
    {
      id: "offsite",
      label: "At least one copy off-site",
      ok: offsiteCount >= MIN_OFFSITE,
      detail:
        offsiteCount >= MIN_OFFSITE
          ? `${offsiteCount} off-site ${offsiteCount === 1 ? "copy" : "copies"}.`
          : "Everything is in one building. A fire, flood or burglary ends the plan.",
    },
    {
      id: "same-device",
      label: "No copy on the authenticator device",
      ok: copies > 0 && sameDevice.length === 0,
      detail:
        copies === 0
          ? "No copy planned at all — losing the authenticator device locks you out permanently."
          : sameDevice.length === 0
            ? "No copy shares a device with your authenticator app."
            : `${sameDevice.map((location) => location.label).join("; ")} sits on the same phone as your second factor.`,
    },
    {
      id: "circular",
      label: "No circular dependency",
      ok: copies > 0 && !circularRisk,
      detail:
        copies === 0
          ? "Nothing is stored anywhere, so there is nothing to fall back to."
          : circularRisk
            ? "Every copy is behind an account these codes are meant to recover. Add one offline copy."
            : "At least one copy is reachable without signing in anywhere first.",
    },
    {
      id: "encrypted",
      label: "At least one encrypted digital copy",
      ok: encryptedCount >= 1,
      detail:
        encryptedCount >= 1
          ? `${encryptedCount} encrypted ${encryptedCount === 1 ? "copy" : "copies"}.`
          : "No encrypted copy, so any copy that is found is immediately usable.",
    },
    {
      id: "durable",
      label: "One copy built to last",
      ok: bestDurability >= MIN_DURABILITY_FOR_ARCHIVE,
      detail:
        bestDurability >= MIN_DURABILITY_FOR_ARCHIVE
          ? "One copy is rated to survive fire, water and a decade of storage."
          : "Nothing here is rated to survive a fire or ten years untouched.",
    },
  ];

  const earned = checks.reduce((sum, check) => sum + (check.ok ? RULE_WEIGHTS[check.id] : 0), 0);
  const scorePercent = Math.round((earned / TOTAL_WEIGHT) * 100);
  const verdict = verdictFor(scorePercent);

  const failed = checks.filter((check) => !check.ok);

  const suggestions = STORAGE_LOCATIONS.filter((location) => !wanted.has(location.id))
    .map((location) => {
      let gain = 0;
      if (copies < MIN_COPIES) gain += RULE_WEIGHTS.copies;
      if (!mediaSet.has(location.media) && mediaSet.size < MIN_MEDIA_TYPES) gain += RULE_WEIGHTS.media;
      if (location.offsite && offsiteCount < MIN_OFFSITE) gain += RULE_WEIGHTS.offsite;
      if (location.encrypted && encryptedCount < 1) gain += RULE_WEIGHTS.encrypted;
      if (location.durability >= MIN_DURABILITY_FOR_ARCHIVE && bestDurability < MIN_DURABILITY_FOR_ARCHIVE) {
        gain += RULE_WEIGHTS.durable;
      }
      if (location.sameDevice) gain -= RULE_WEIGHTS["same-device"];
      if (location.circular && circularRisk) gain -= RULE_WEIGHTS.circular;
      return { ...location, gain };
    })
    .filter((location) => location.gain > 0)
    .sort((a, b) => b.gain - a.gain || b.durability - a.durability)
    .slice(0, 3);

  return {
    copies,
    mediaCount: mediaSet.size,
    mediaLabels: [...mediaSet].map((key) => MEDIA_TYPES[key]),
    offsiteCount,
    encryptedCount,
    bestDurability,
    scorePercent,
    verdictId: verdict.id,
    verdictLabel: verdict.label,
    verdictAdvice: verdict.advice,
    checks,
    failedCount: failed.length,
    suggestions,
    chosen,
    codeSetsToMaintain: Math.round(accounts) * copies,
    reviewIntervalMonths: REVIEW_INTERVAL_MONTHS,
  };
}
