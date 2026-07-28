/**
 * X (formerly Twitter) two-factor authentication setup model.
 *
 * Menu path used throughout: Settings and privacy -> Security and account access
 * -> Security -> Two-factor authentication. X lists exactly three methods there:
 * Text message, Authentication app and Security key.
 *
 * Policy rule encoded below: since 20 March 2023 X has limited text-message 2FA
 * to paid subscribers; accounts without a subscription must use an
 * authentication app or a security key. That is treated as a hard gate, not a
 * warning, because the option is simply not selectable on a free account.
 *
 * Pure module: no React, no DOM, no network, no clock reads.
 */

export const TWO_FACTOR_METHODS = [
  {
    id: "security-key",
    label: "Security key",
    strength: 100,
    phishingResistant: true,
    subscriberOnly: false,
    summary:
      "A FIDO2/WebAuthn key (USB, NFC or platform passkey). The credential is scoped to x.com, so a look-alike login page cannot use it.",
    caveat: "Enrol a second key or keep the backup code — one lost key with no fallback means an account-recovery ticket.",
  },
  {
    id: "authenticator",
    label: "Authentication app",
    strength: 80,
    phishingResistant: false,
    subscriberOnly: false,
    summary:
      "A standard RFC 6238 TOTP app producing a 6-digit code every 30 seconds. Free on every X account and immune to SIM-swap.",
    caveat: "A real-time phishing page can still relay the code inside its 30-second window.",
  },
  {
    id: "sms",
    label: "Text message (SMS)",
    strength: 40,
    phishingResistant: false,
    subscriberOnly: true,
    summary:
      "A code texted to your number. X restricts this method to paid subscribers, and it is the weakest of the three.",
    caveat: "SIM-swap fraud redirects the code to an attacker's SIM without ever touching your phone.",
  },
];

export const SCORE_BANDS = [
  { min: 85, id: "strong", label: "Strong", note: "Phishing-resistant or app-based 2FA with a saved backup code." },
  { min: 65, id: "good", label: "Good", note: "Solid setup — a couple of gaps left to close." },
  { min: 40, id: "partial", label: "Partial", note: "2FA is started but a lockout or fallback risk remains." },
  { min: 0, id: "weak", label: "Weak", note: "The account is still close to password-only." },
];

export const SETUP_STEPS = [
  {
    id: "unique-password",
    title: "Give the account its own password",
    detail:
      "X credential-stuffing waves reuse passwords leaked from other sites. Change it if this password exists anywhere else.",
    where: "Settings and privacy -> Your account -> Change your password",
    minutes: 3,
    weight: 2,
    critical: false,
    appliesTo: ["security-key", "authenticator", "sms"],
  },
  {
    id: "open-security",
    title: "Open Security and account access",
    detail:
      "From the sidebar or the app menu choose Settings and privacy, then Security and account access, then Security.",
    where: "Settings and privacy -> Security and account access -> Security",
    minutes: 1,
    weight: 1,
    critical: false,
    appliesTo: ["security-key", "authenticator", "sms"],
  },
  {
    id: "open-2fa",
    title: "Open Two-factor authentication",
    detail:
      "The screen lists Text message, Authentication app and Security key with a toggle beside each. You can have more than one enabled at a time.",
    where: "Security -> Two-factor authentication",
    minutes: 1,
    weight: 1,
    critical: false,
    appliesTo: ["security-key", "authenticator", "sms"],
  },
  {
    id: "install-app",
    title: "Install a TOTP authenticator app first",
    detail:
      "Have the app ready before you start, because X shows the QR code only once per enrolment. Pick one with an encrypted backup or export.",
    where: "Your phone's app store",
    minutes: 3,
    weight: 2,
    critical: false,
    appliesTo: ["authenticator"],
  },
  {
    id: "link-app",
    title: "Toggle Authentication app and scan the QR code",
    detail:
      "X asks for your password, then shows a QR code plus a text key. Scan it, or use the key if you are setting up on the same device.",
    where: "Two-factor authentication -> Authentication app",
    minutes: 2,
    weight: 3,
    critical: false,
    appliesTo: ["authenticator"],
  },
  {
    id: "register-key",
    title: "Toggle Security key and enrol the key",
    detail:
      "Do this in a desktop browser that supports WebAuthn, then touch the key or approve the passkey when the browser prompts.",
    where: "Two-factor authentication -> Security key",
    minutes: 3,
    weight: 3,
    critical: false,
    appliesTo: ["security-key"],
  },
  {
    id: "add-number",
    title: "Confirm the mobile number",
    detail:
      "Enter a number you control long-term and confirm the texted code. Do not use a temporary or shared work number.",
    where: "Two-factor authentication -> Text message",
    minutes: 2,
    weight: 2,
    critical: false,
    appliesTo: ["sms"],
  },
  {
    id: "confirm-code",
    title: "Enter the code to switch 2FA on",
    detail:
      "Nothing is protected until X accepts one code from the new method and the toggle stays on after you leave the screen.",
    where: "Two-factor authentication -> confirmation prompt",
    minutes: 1,
    weight: 3,
    critical: true,
    appliesTo: ["security-key", "authenticator", "sms"],
  },
  {
    id: "save-backup-code",
    title: "Save the backup code offline",
    detail:
      "X issues a single backup code, which you can regenerate at any time. Store it in a password manager or on paper, never as a screenshot on the same phone.",
    where: "Two-factor authentication -> Backup codes",
    minutes: 2,
    weight: 3,
    critical: true,
    appliesTo: ["security-key", "authenticator", "sms"],
  },
  {
    id: "second-method",
    title: "Enable a second method as a fallback",
    detail:
      "X lets you keep more than one method on. A second security key, or an app alongside a key, avoids a recovery ticket if one device dies.",
    where: "Two-factor authentication -> enable a second toggle",
    minutes: 4,
    weight: 2,
    critical: false,
    appliesTo: ["security-key", "authenticator"],
  },
  {
    id: "remove-sms",
    title: "Turn the text message method off",
    detail:
      "Once the app or key works, switch the SMS toggle off so a SIM-swap can no longer produce a valid code for your account.",
    where: "Two-factor authentication -> Text message -> off",
    minutes: 1,
    weight: 3,
    critical: false,
    appliesTo: ["security-key", "authenticator"],
  },
  {
    id: "password-reset-protect",
    title: "Turn on password reset protect",
    detail:
      "This makes X ask for the email address or phone number on the account before it will send a password reset, which blocks the usual reset-based takeover.",
    where: "Security and account access -> Security -> Additional password protection",
    minutes: 1,
    weight: 2,
    critical: false,
    appliesTo: ["security-key", "authenticator", "sms"],
  },
  {
    id: "review-sessions",
    title: "Log out of sessions you do not recognise",
    detail:
      "Turning 2FA on does not end sessions that already exist. Review every listed device and location, then log out of the rest.",
    where: "Security and account access -> Apps and sessions -> Sessions",
    minutes: 3,
    weight: 2,
    critical: false,
    appliesTo: ["security-key", "authenticator", "sms"],
  },
  {
    id: "revoke-apps",
    title: "Revoke third-party apps you no longer use",
    detail:
      "A connected app holds an OAuth token that keeps working after a password change and is not stopped by 2FA. Revoke anything unfamiliar or dormant.",
    where: "Security and account access -> Apps and sessions -> Connected apps",
    minutes: 3,
    weight: 2,
    critical: false,
    appliesTo: ["security-key", "authenticator", "sms"],
  },
  {
    id: "protect-email",
    title: "Protect the email address on the account",
    detail:
      "Whoever controls the inbox controls the reset link. Make sure that mailbox has its own 2FA and is not one you have abandoned.",
    where: "Settings and privacy -> Your account -> Account information -> Email",
    minutes: 3,
    weight: 2,
    critical: false,
    appliesTo: ["security-key", "authenticator", "sms"],
  },
];

const CRITICAL_SCORE_CAP = 60;
const COVERAGE_WEIGHT = 0.6;
const METHOD_WEIGHT = 0.4;

export function getMethod(methodId) {
  return TWO_FACTOR_METHODS.find((method) => method.id === methodId) || null;
}

export function buildChecklist(methodId) {
  if (!getMethod(methodId)) return [];
  return SETUP_STEPS.filter((step) => step.appliesTo.includes(methodId));
}

function bandFor(score) {
  return SCORE_BANDS.find((band) => score >= band.min) || SCORE_BANDS[SCORE_BANDS.length - 1];
}

/**
 * @param {{methodId:string, completedIds?:string[], hasSubscription?:boolean}} input
 * @returns {{error:string}|object}
 */
export function assessSetup({ methodId, completedIds = [], hasSubscription = false } = {}) {
  const method = getMethod(methodId);
  if (!method) {
    return { error: "Pick one of the three methods X offers: security key, authentication app or text message." };
  }
  if (!Array.isArray(completedIds)) {
    return { error: "Completed steps must be provided as a list of step ids." };
  }
  if (method.subscriberOnly && !hasSubscription) {
    return {
      error:
        "X limits text-message 2FA to paid subscribers. On a free account choose the authentication app or a security key instead.",
    };
  }

  const steps = buildChecklist(methodId);
  const doneSet = new Set(completedIds);
  const applicableDone = steps.filter((step) => doneSet.has(step.id));

  const totalWeight = steps.reduce((sum, step) => sum + step.weight, 0);
  const doneWeight = applicableDone.reduce((sum, step) => sum + step.weight, 0);
  const coverage = totalWeight > 0 ? (doneWeight / totalWeight) * 100 : 0;

  let score = coverage * COVERAGE_WEIGHT + method.strength * METHOD_WEIGHT;

  const remaining = steps.filter((step) => !doneSet.has(step.id));
  const missingCritical = remaining.filter((step) => step.critical);
  if (missingCritical.length > 0) score = Math.min(score, CRITICAL_SCORE_CAP);
  score = Math.max(0, Math.min(100, Math.round(score)));

  const warnings = [];
  if (missingCritical.length > 0) {
    warnings.push(
      `Score stays capped at ${CRITICAL_SCORE_CAP} until you finish: ${missingCritical
        .map((step) => step.title.toLowerCase())
        .join(", ")}.`
    );
  }
  if (methodId === "sms") {
    warnings.push(
      "Text message is the weakest method on X. Your account is only as strong as your mobile carrier's resistance to a SIM-swap request."
    );
  }
  if (methodId !== "sms" && !doneSet.has("remove-sms")) {
    warnings.push(
      "Leaving the text message toggle on keeps the weakest factor live, whatever else you have enabled."
    );
  }
  if (!doneSet.has("save-backup-code")) {
    warnings.push(
      "X issues one backup code. Without it saved, losing the phone or key means an account-recovery request with no guaranteed timeline."
    );
  }
  if (!doneSet.has("revoke-apps")) {
    warnings.push(
      "Connected third-party apps hold OAuth tokens that survive both a password change and a new 2FA method — review that list."
    );
  }

  const minutesLeft = remaining.reduce((sum, step) => sum + step.minutes, 0);

  return {
    method,
    score,
    band: bandFor(score),
    coverage: Math.round(coverage),
    done: applicableDone.length,
    total: steps.length,
    minutesLeft,
    remaining,
    warnings,
  };
}

export function estimateTotalMinutes(methodId) {
  return buildChecklist(methodId).reduce((sum, step) => sum + step.minutes, 0);
}
