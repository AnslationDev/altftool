/**
 * Facebook (Meta Accounts Center) two-factor authentication setup model.
 *
 * Navigation paths follow Meta's Accounts Center layout, where two-factor
 * authentication for a Facebook profile lives under
 * Settings -> Accounts Center -> Password and security -> Two-factor authentication.
 * Meta offers three second factors there: security key, authentication app
 * (TOTP) and text message (SMS).
 *
 * No network, no DOM, no React. Pure data + pure functions.
 */

/**
 * Relative strength of each second factor, 0-100.
 *  - Security keys / passkeys implement FIDO2/WebAuthn, which binds the
 *    credential to the site origin, so a phishing proxy cannot replay it.
 *  - TOTP apps follow RFC 6238: a 6-digit code derived from a shared secret
 *    and a 30-second time step. Phishable in real time, but immune to SIM swap.
 *  - SMS codes travel over the phone network and are the only factor that a
 *    SIM-swap or SS7 interception attack can take without touching your devices.
 */
export const TWO_FACTOR_METHODS = [
  {
    id: "security-key",
    label: "Security key or passkey",
    strength: 100,
    phishingResistant: true,
    summary:
      "FIDO2/WebAuthn hardware key or a device passkey. The credential is bound to facebook.com, so a fake login page cannot use it.",
    caveat: "Register a second key or keep recovery codes — a lost key with no backup locks you out.",
  },
  {
    id: "authenticator",
    label: "Authentication app (TOTP)",
    strength: 80,
    phishingResistant: false,
    summary:
      "Any RFC 6238 app (Google Authenticator, Aegis, 1Password, Authy) generating a 6-digit code every 30 seconds. Works offline and cannot be SIM-swapped.",
    caveat: "A convincing fake login page can still relay a code within its 30-second window.",
  },
  {
    id: "sms",
    label: "Text message (SMS)",
    strength: 40,
    phishingResistant: false,
    summary:
      "A code texted to your number. Better than no second factor, but the weakest of the three.",
    caveat: "SIM-swap fraud and SS7 interception both defeat SMS codes without ever touching your phone.",
  },
];

/** Bands used to describe the final readiness score. */
export const SCORE_BANDS = [
  { min: 85, id: "strong", label: "Strong", note: "Phishing-resistant or app-based 2FA with recovery in place." },
  { min: 65, id: "good", label: "Good", note: "Solid setup — finish the remaining steps to close the gaps." },
  { min: 40, id: "partial", label: "Partial", note: "Protection started but a lockout or fallback risk remains." },
  { min: 0, id: "weak", label: "Weak", note: "Your account is still close to password-only." },
];

/**
 * Setup checklist. `appliesTo` is the list of method ids a step is shown for.
 * `weight` reflects how much the step contributes to real account safety.
 * `critical` steps cap the score until they are done.
 */
export const SETUP_STEPS = [
  {
    id: "unique-password",
    title: "Set a unique password first",
    detail:
      "Two-factor authentication protects a reused password, it does not fix one. Change it if the same password exists on any other site.",
    where: "Accounts Center -> Password and security -> Change password",
    minutes: 3,
    weight: 2,
    critical: false,
    appliesTo: ["security-key", "authenticator", "sms"],
  },
  {
    id: "open-accounts-center",
    title: "Open Accounts Center",
    detail:
      "On the app: Menu -> Settings & privacy -> Settings -> Accounts Center. On the web: your profile menu -> Settings & privacy -> Settings -> Accounts Center.",
    where: "Settings & privacy -> Settings -> Accounts Center",
    minutes: 1,
    weight: 1,
    critical: false,
    appliesTo: ["security-key", "authenticator", "sms"],
  },
  {
    id: "open-2fa",
    title: "Open Two-factor authentication and pick the profile",
    detail:
      "Choose Password and security, then Two-factor authentication, then select the Facebook profile you want to protect. Accounts Center manages each linked profile separately.",
    where: "Accounts Center -> Password and security -> Two-factor authentication",
    minutes: 1,
    weight: 1,
    critical: false,
    appliesTo: ["security-key", "authenticator", "sms"],
  },
  {
    id: "install-app",
    title: "Install a TOTP authenticator app",
    detail:
      "Install the app before you start the flow. Prefer one with an encrypted export or backup so a lost phone is not a lost account.",
    where: "Your phone's app store",
    minutes: 3,
    weight: 2,
    critical: false,
    appliesTo: ["authenticator"],
  },
  {
    id: "scan-qr",
    title: "Choose Authentication app and scan the QR code",
    detail:
      "Facebook shows a QR code and a text setup key. Scan it, or copy the key manually if you are setting up on the same device you are reading on.",
    where: "Two-factor authentication -> Authentication app",
    minutes: 2,
    weight: 3,
    critical: false,
    appliesTo: ["authenticator"],
  },
  {
    id: "register-key",
    title: "Register your security key or passkey",
    detail:
      "Choose Security key, then follow the browser prompt to touch the key or approve the passkey. Register it on a browser you normally use.",
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
      "Enter the number, receive the code and confirm it. Use a number you control long-term, not a temporary or work SIM.",
    where: "Two-factor authentication -> Text message (SMS)",
    minutes: 2,
    weight: 2,
    critical: false,
    appliesTo: ["sms"],
  },
  {
    id: "verify-code",
    title: "Enter the verification code to switch 2FA on",
    detail:
      "Nothing is active until Facebook accepts one code from the new factor. Confirm the screen now says two-factor authentication is on.",
    where: "Two-factor authentication -> confirmation screen",
    minutes: 1,
    weight: 3,
    critical: true,
    appliesTo: ["security-key", "authenticator", "sms"],
  },
  {
    id: "save-recovery",
    title: "Save recovery codes offline",
    detail:
      "Meta issues a set of one-time recovery codes. Store them in a password manager or on paper away from the phone — never as a screenshot in your camera roll.",
    where: "Two-factor authentication -> Additional methods -> Recovery codes",
    minutes: 3,
    weight: 3,
    critical: true,
    appliesTo: ["security-key", "authenticator", "sms"],
  },
  {
    id: "second-factor",
    title: "Add a backup second factor",
    detail:
      "Register a second security key, or add the TOTP secret to a second trusted device, so one lost phone does not end in an identity-document appeal.",
    where: "Two-factor authentication -> add another method",
    minutes: 4,
    weight: 2,
    critical: false,
    appliesTo: ["security-key", "authenticator"],
  },
  {
    id: "remove-sms",
    title: "Turn off SMS as a fallback",
    detail:
      "Once the app or key works, remove the phone number as a 2FA method. A fallback that attackers can trigger is a fallback that attackers will use.",
    where: "Two-factor authentication -> Text message -> turn off",
    minutes: 1,
    weight: 3,
    critical: false,
    appliesTo: ["security-key", "authenticator"],
  },
  {
    id: "review-sessions",
    title: "Review where you're logged in",
    detail:
      "2FA does not end sessions that already exist. Log out of every device you do not recognise, then check Recent emails for messages you did not trigger.",
    where: "Accounts Center -> Password and security -> Where you're logged in",
    minutes: 3,
    weight: 2,
    critical: false,
    appliesTo: ["security-key", "authenticator", "sms"],
  },
  {
    id: "trusted-contacts",
    title: "Check the login-alert and email settings",
    detail:
      "Turn on login alerts and make sure the recovery email on the account is one you still control and that itself has 2FA.",
    where: "Accounts Center -> Password and security -> Login alerts",
    minutes: 2,
    weight: 2,
    critical: false,
    appliesTo: ["security-key", "authenticator", "sms"],
  },
];

/** Score at or below which a setup with an unfinished critical step is capped. */
const CRITICAL_SCORE_CAP = 60;
/** Share of the score that comes from finishing steps vs. choosing a strong factor. */
const COVERAGE_WEIGHT = 0.6;
const METHOD_WEIGHT = 0.4;

export function getMethod(methodId) {
  return TWO_FACTOR_METHODS.find((method) => method.id === methodId) || null;
}

/** Steps that apply to the chosen method, in order. */
export function buildChecklist(methodId) {
  if (!getMethod(methodId)) return [];
  return SETUP_STEPS.filter((step) => step.appliesTo.includes(methodId));
}

function bandFor(score) {
  return SCORE_BANDS.find((band) => score >= band.min) || SCORE_BANDS[SCORE_BANDS.length - 1];
}

/**
 * Assess a setup.
 * @param {{ methodId: string, completedIds?: string[] }} input
 * @returns {{error:string}|{score:number,band:object,coverage:number,done:number,total:number,minutesLeft:number,remaining:object[],warnings:string[],method:object}}
 */
export function assessSetup({ methodId, completedIds = [] } = {}) {
  const method = getMethod(methodId);
  if (!method) {
    return { error: "Choose one of the three Facebook second factors: security key, authentication app or SMS." };
  }
  if (!Array.isArray(completedIds)) {
    return { error: "Completed steps must be provided as a list of step ids." };
  }

  const steps = buildChecklist(methodId);
  const doneSet = new Set(completedIds);
  const applicableDone = steps.filter((step) => doneSet.has(step.id));

  const totalWeight = steps.reduce((sum, step) => sum + step.weight, 0);
  const doneWeight = applicableDone.reduce((sum, step) => sum + step.weight, 0);
  // totalWeight is never 0 because every method has at least three shared steps,
  // but guard anyway so the function can never divide by zero.
  const coverage = totalWeight > 0 ? (doneWeight / totalWeight) * 100 : 0;

  let score = coverage * COVERAGE_WEIGHT + method.strength * METHOD_WEIGHT;

  const remaining = steps.filter((step) => !doneSet.has(step.id));
  const missingCritical = remaining.filter((step) => step.critical);
  if (missingCritical.length > 0) score = Math.min(score, CRITICAL_SCORE_CAP);

  score = Math.max(0, Math.min(100, Math.round(score)));

  const warnings = [];
  if (missingCritical.length > 0) {
    warnings.push(
      `Score is capped at ${CRITICAL_SCORE_CAP} until you finish: ${missingCritical
        .map((step) => step.title.toLowerCase())
        .join(", ")}.`
    );
  }
  if (methodId === "sms") {
    warnings.push(
      "SMS is the weakest option Facebook offers — a SIM-swap moves your number to an attacker's SIM and the codes follow it. Switch to an authentication app or security key when you can."
    );
  }
  if (methodId !== "sms" && !doneSet.has("remove-sms")) {
    warnings.push(
      "Leaving SMS switched on as a backup keeps the weakest factor available to an attacker, whatever else you have enabled."
    );
  }
  if (!doneSet.has("save-recovery")) {
    warnings.push(
      "Without saved recovery codes, a lost or wiped phone means an identity-document appeal to Meta, which can take days."
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

/** Total minutes for a full clean setup with the given method. */
export function estimateTotalMinutes(methodId) {
  return buildChecklist(methodId).reduce((sum, step) => sum + step.minutes, 0);
}
