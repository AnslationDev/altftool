/**
 * Disposable email policy explainer.
 *
 * Decides whether a throwaway address is safe for a given signup by scoring the
 * lockout risk, then checks whether the address type can even hold the mail long
 * enough. Pure functions: no network, no storage, no lookups.
 */

/**
 * The four kinds of address people mean by "throwaway", with the properties
 * that actually decide whether one works.
 *
 * retentionHours = how long the service keeps a delivered message.
 *   null means "as long as your own mailbox keeps it", i.e. indefinitely.
 * publiclyReadable = anyone who knows or guesses the address reads the inbox
 *   without a password. True for the open 10-minute-mail style services.
 */
export const ADDRESS_TYPES = [
  {
    id: "publicThrowaway",
    label: "Open public inbox (10-minute mail style)",
    retentionHours: 1,
    publiclyReadable: true,
    canReply: false,
    revocable: false,
    survivesRecovery: false,
    oftenBlocked: true,
    free: true,
    summary:
      "No sign-up, no password. The inbox is addressable by anyone who types the same address, so treat every message in it as public.",
  },
  {
    id: "privateThrowaway",
    label: "Account-backed temporary inbox",
    retentionHours: 24,
    publiclyReadable: false,
    canReply: true,
    revocable: true,
    survivesRecovery: false,
    oftenBlocked: true,
    free: true,
    summary:
      "Behind a login, so nobody else can read it, but the address is still on the disposable-domain blocklists many signup forms check.",
  },
  {
    id: "forwardingAlias",
    label: "Forwarding alias that you can switch off",
    retentionHours: null,
    publiclyReadable: false,
    canReply: true,
    revocable: true,
    survivesRecovery: true,
    oftenBlocked: false,
    free: true,
    summary:
      "A unique address per service that forwards into your real mailbox and can be disabled the day it leaks. Keeps mail forever because your own mailbox holds it.",
  },
  {
    id: "realAddress",
    label: "Your ordinary mailbox",
    retentionHours: null,
    publiclyReadable: false,
    canReply: true,
    revocable: false,
    survivesRecovery: true,
    oftenBlocked: false,
    free: true,
    summary:
      "Maximum reliability, zero compartmentalisation. Everything that touches it is linked to everything else that touches it.",
  },
];

/**
 * Lockout drivers. Weights total 100 so a signup that ticks everything scores
 * exactly 100. This is a comparison aid, not a probability.
 */
export const LOCKOUT_FACTORS = [
  {
    id: "needsRecovery",
    label: "This email is the only way to reset the password",
    weight: 30,
    consequence:
      "Lose the address and the account is gone. Password reset links go to an inbox that no longer exists, and support cannot verify you.",
  },
  {
    id: "needsOtp",
    label: "Login codes or magic links arrive by email",
    weight: 25,
    consequence:
      "Every future sign-in depends on the address staying alive, so a throwaway turns into a permanent dependency the moment you use it.",
  },
  {
    id: "hasPayment",
    label: "Money changes hands — card, subscription or payout",
    weight: 20,
    consequence:
      "Refunds, chargebacks and fraud alerts are sent by email. Without them you lose the paper trail exactly when you need it.",
  },
  {
    id: "needsReceipts",
    label: "I will need the receipt, invoice, warranty or ticket later",
    weight: 15,
    consequence:
      "Order confirmations and warranty registrations are usually only ever sent once, to the address on file.",
  },
  {
    id: "longTerm",
    label: "I expect to still use this account in a year",
    weight: 10,
    consequence:
      "Disposable inboxes recycle addresses. Someone else can end up owning the address your account trusts.",
  },
];

/** Verdict bands on the 0-100 lockout score. min is an inclusive lower bound. */
export const VERDICTS = [
  {
    min: 60,
    id: "real",
    label: "Use a stable address you control",
    recommended: "realAddress",
    reason:
      "Too much depends on receiving mail at this address later. Compartmentalise with a forwarding alias if you want, but never with an inbox that expires.",
  },
  {
    min: 25,
    id: "alias",
    label: "Use a forwarding alias, not a throwaway",
    recommended: "forwardingAlias",
    reason:
      "You need the mail to keep arriving, but you also want to be able to cut the address off after a leak. A revocable alias does both.",
  },
  {
    min: 0,
    id: "disposable",
    label: "A disposable address is fine",
    recommended: "publicThrowaway",
    reason:
      "Nothing here has to reach you after the first message, so an inbox that expires costs you nothing.",
  },
];

/**
 * Common signup situations, each preset with the factors it normally carries.
 * "custom" leaves every switch to you.
 */
export const PURPOSES = [
  {
    id: "download",
    label: "One-off file or PDF download",
    factors: {},
    note: "The classic legitimate case: you want the file, not the relationship.",
  },
  {
    id: "newsletter",
    label: "Newsletter or content subscription",
    factors: { longTerm: true },
    note: "A throwaway works, but you lose the unsubscribe link along with the inbox — an alias you can switch off is cleaner.",
  },
  {
    id: "forum",
    label: "Forum or community account",
    factors: { needsRecovery: true, longTerm: true },
    note: "Reputation accrues to the account, and email is usually the only reset path.",
  },
  {
    id: "trial",
    label: "Free trial without a card",
    factors: { needsRecovery: true },
    note: "Note that recycling throwaways to farm repeated trials breaches most terms of service.",
  },
  {
    id: "shopping",
    label: "Online shopping or marketplace order",
    factors: { hasPayment: true, needsReceipts: true, needsRecovery: true, longTerm: true },
    note: "Delivery updates, returns and warranty claims all route through the address on the order.",
  },
  {
    id: "saas",
    label: "Work tool or SaaS account",
    factors: { needsRecovery: true, needsOtp: true, longTerm: true, hasPayment: true },
    note: "Magic-link sign-in makes the address a permanent authentication factor.",
  },
  {
    id: "financial",
    label: "Bank, insurance, tax or government service",
    factors: {
      needsRecovery: true,
      needsOtp: true,
      hasPayment: true,
      needsReceipts: true,
      longTerm: true,
    },
    note: "Regulated services must be able to reach you, and many verify the address before opening the account at all.",
  },
  {
    id: "jobs",
    label: "Job application or recruiter",
    factors: { needsRecovery: true, needsReceipts: true, longTerm: true },
    note: "A disposable domain on a CV also reads badly to the human at the other end.",
  },
  { id: "custom", label: "Something else — set the switches myself", factors: {}, note: "" },
];

/** Hours in a day, used to convert the "how long do I need this" input. */
export const HOURS_PER_DAY = 24;

/** Longest access window this tool will reason about, in days (about ten years). */
export const MAX_ACCESS_DAYS = 3650;

export function verdictForScore(score) {
  return VERDICTS.find((band) => score >= band.min) || VERDICTS[VERDICTS.length - 1];
}

export function addressTypeById(id) {
  return ADDRESS_TYPES.find((type) => type.id === id) || ADDRESS_TYPES[ADDRESS_TYPES.length - 1];
}

/**
 * Can this address type still hold a message you need after `days`?
 * null retention means the mail lands in a mailbox you keep, so always yes.
 */
export function holdsLongEnough(type, days) {
  if (type.retentionHours === null) return true;
  const needHours = Math.max(0, Number(days) || 0) * HOURS_PER_DAY;
  return type.retentionHours >= needHours;
}

/** "1 hour", "24 hours", or the indefinite case. */
export function describeRetention(type) {
  if (type.retentionHours === null) return "As long as you keep it";
  if (type.retentionHours === 1) return "About 1 hour";
  return `About ${type.retentionHours} hours`;
}

/**
 * Score a signup and produce the verdict.
 *
 * @param {{purpose:string, factors:Record<string,boolean>, accessDays:number|string, formRejectsDisposable:boolean}} input
 */
export function evaluateDisposableUse(input = {}) {
  const rawDays = Number(input.accessDays);
  if (input.accessDays !== "" && input.accessDays !== undefined && !Number.isFinite(rawDays)) {
    return { error: "Enter how many days you need to receive mail as a number." };
  }
  const accessDays = Math.floor(Number.isFinite(rawDays) ? rawDays : 0);
  if (accessDays < 0) {
    return { error: "Days cannot be negative — use 0 if you only need the very first message." };
  }
  if (accessDays > MAX_ACCESS_DAYS) {
    return {
      error: `Anything past ${MAX_ACCESS_DAYS} days is simply "permanent" — use a stable address you control.`,
    };
  }

  const purpose = PURPOSES.find((item) => item.id === input.purpose) || PURPOSES[PURPOSES.length - 1];
  const factors = input.factors || {};

  const active = LOCKOUT_FACTORS.filter((factor) => Boolean(factors[factor.id]));
  const lockoutScore = Math.min(100, active.reduce((sum, factor) => sum + factor.weight, 0));
  const verdict = verdictForScore(lockoutScore);

  const formRejectsDisposable = Boolean(input.formRejectsDisposable);

  const types = ADDRESS_TYPES.map((type) => {
    const blockers = [];
    if (!holdsLongEnough(type, accessDays)) {
      blockers.push(
        `Keeps mail for ${describeRetention(type).toLowerCase()}, but you said you need it for ${accessDays} day${accessDays === 1 ? "" : "s"}.`,
      );
    }
    if (formRejectsDisposable && type.oftenBlocked) {
      blockers.push("This signup form rejects disposable domains, so the address will not be accepted.");
    }
    if (lockoutScore >= 25 && !type.survivesRecovery) {
      blockers.push("Cannot serve as a recovery address, and this signup depends on one.");
    }
    if (type.publiclyReadable && (factors.needsOtp || factors.needsRecovery || factors.hasPayment)) {
      blockers.push(
        "The inbox has no password, so a login code, reset link or payment notice sitting in it is readable by anyone.",
      );
    }
    return { ...type, blockers, workable: blockers.length === 0, retentionLabel: describeRetention(type) };
  });

  const workable = types.filter((type) => type.workable);
  // Prefer the verdict's pick when it survives the blockers, otherwise the most
  // disposable option that still works, otherwise fall back to a real mailbox.
  const preferred = workable.find((type) => type.id === verdict.recommended);
  const recommended = preferred || workable[0] || addressTypeById("realAddress");

  return {
    purpose,
    accessDays,
    lockoutScore,
    verdict,
    activeFactors: active,
    types,
    recommended,
    workableCount: workable.length,
    formRejectsDisposable,
  };
}

/** Plain-text summary of a decision. */
export function formatDecision(result) {
  if (!result || result.error) return "";
  const lines = [
    "Disposable email — decision",
    `Signing up for: ${result.purpose.label}`,
    `Need to receive mail for: ${result.accessDays} day(s)`,
    `Lockout risk: ${result.lockoutScore}/100`,
    `Verdict: ${result.verdict.label}`,
    `Recommended: ${result.recommended.label}`,
    "",
    "Why:",
    result.verdict.reason,
  ];
  if (result.activeFactors.length > 0) {
    lines.push("", "What raises the risk:");
    result.activeFactors.forEach((factor) => {
      lines.push(`- ${factor.label} (+${factor.weight}): ${factor.consequence}`);
    });
  }
  return lines.join("\n");
}
