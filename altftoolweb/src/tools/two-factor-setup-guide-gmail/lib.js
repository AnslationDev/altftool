/**
 * Gmail / Google 2FA Setup Guide — step data and progress scoring.
 *
 * Steps describe the current Google Account flow (myaccount.google.com ->
 * Security -> "How you sign in to Google"). Menu wording differs slightly
 * between Android, iOS and the web, so each step declares which surfaces it
 * applies to. Nothing here talks to Google; it is a checklist you work through
 * in your own account.
 */

/** Google issues a set of ten single-use backup codes when you generate them. */
export const BACKUP_CODE_COUNT = 10;
/** Each Google backup code is eight digits long. */
export const BACKUP_CODE_LENGTH = 8;
/** Google's Advanced Protection Program requires two keys or passkeys enrolled. */
export const ADVANCED_PROTECTION_KEY_COUNT = 2;
/** Google app passwords are 16 characters, generated for legacy clients. */
export const APP_PASSWORD_LENGTH = 16;

export const SURFACES = [
  { id: "web", label: "Web browser (desktop)", note: "myaccount.google.com in any browser." },
  { id: "android", label: "Android", note: "Settings app -> Google -> Manage your Google Account." },
  { id: "ios", label: "iPhone or iPad", note: "Gmail app -> profile picture -> Manage your Google Account." },
];

export const PHASES = [
  { id: "prepare", label: "Before you start" },
  { id: "enable", label: "Turn on 2-Step Verification" },
  { id: "harden", label: "Make it phishing-resistant" },
  { id: "recover", label: "Set up recovery" },
];

/**
 * Weighting for the hardening score. A phishing-resistant second factor and a
 * usable recovery path matter far more than cosmetic settings, so they carry
 * more weight than the merely useful steps.
 */
export const WEIGHTS = { critical: 5, important: 3, useful: 1 };

export const STEPS = [
  {
    id: "recovery-first",
    phase: "prepare",
    weight: "important",
    surfaces: ["web", "android", "ios"],
    title: "Add a recovery phone and recovery email first",
    detail:
      "Open the Security page and check that both a recovery phone number and a recovery email address are present and current. Doing this before you enable 2-Step Verification means a lost phone is an inconvenience rather than a lockout.",
    where: "Google Account -> Security -> How you sign in to Google -> Recovery phone / Recovery email",
  },
  {
    id: "password-check",
    phase: "prepare",
    weight: "important",
    surfaces: ["web", "android", "ios"],
    title: "Change the password if it is reused anywhere else",
    detail:
      "Two-factor authentication protects the login, not the password itself. Run Password Checkup, and replace any Google password you have used on another site with a unique one stored in a password manager.",
    where: "Google Account -> Security -> Password Manager -> Password Checkup",
  },
  {
    id: "device-audit",
    phase: "prepare",
    weight: "useful",
    surfaces: ["web", "android", "ios"],
    title: "Review the devices signed in to the account",
    detail:
      "Sign out anything you no longer recognise or no longer own before you add a second factor, so an unwanted session cannot simply continue.",
    where: "Google Account -> Security -> Your devices -> Manage all devices",
  },
  {
    id: "turn-on-2sv",
    phase: "enable",
    weight: "critical",
    surfaces: ["web", "android", "ios"],
    title: "Turn on 2-Step Verification",
    detail:
      "Open 2-Step Verification and follow the prompts. Google will confirm your password, then set up the first second factor for the account.",
    where: "Google Account -> Security -> How you sign in to Google -> 2-Step Verification",
  },
  {
    id: "authenticator",
    phase: "enable",
    weight: "critical",
    surfaces: ["web", "android", "ios"],
    title: "Add an authenticator app rather than relying on SMS",
    detail:
      "A time-based one-time code from an authenticator app is generated on your device and never travels over the mobile network, so it cannot be intercepted by a SIM-swap or by SS7 interception the way an SMS code can.",
    where: "2-Step Verification -> Authenticator -> Set up authenticator",
  },
  {
    id: "google-prompt",
    phase: "enable",
    weight: "useful",
    surfaces: ["android", "ios"],
    title: "Keep Google prompts on your signed-in phone",
    detail:
      "Google prompts show the device, approximate location and time of the sign-in attempt, which makes an unexpected request easy to spot and decline. They are the default second step on a phone already signed in.",
    where: "2-Step Verification -> Google prompts",
  },
  {
    id: "passkey",
    phase: "harden",
    weight: "critical",
    surfaces: ["web", "android", "ios"],
    title: "Create a passkey on the devices you use most",
    detail:
      "A passkey is bound to the real Google domain, so a lookalike phishing page cannot use it even if you are fooled. It is unlocked by your fingerprint, face or device PIN and replaces both the password and the code.",
    where: "Google Account -> Security -> How you sign in to Google -> Passkeys and security keys",
  },
  {
    id: "security-key",
    phase: "harden",
    weight: "important",
    surfaces: ["web"],
    title: "Register a hardware security key if you hold anything valuable",
    detail:
      `A FIDO2 key is the strongest option available. If you enrol ${ADVANCED_PROTECTION_KEY_COUNT} keys or passkeys you can also join Google's Advanced Protection Program, which is aimed at journalists, campaigners and anyone at elevated risk.`,
    where: "Google Account -> Security -> Passkeys and security keys -> Add security key",
  },
  {
    id: "remove-sms",
    phase: "harden",
    weight: "important",
    surfaces: ["web", "android", "ios"],
    title: "Remove SMS as a second step once a stronger method works",
    detail:
      "Leaving text messages enabled keeps the weakest method available to an attacker who has ported your number. Only remove it after you have tested the authenticator app or passkey and saved backup codes.",
    where: "2-Step Verification -> Voice or text message -> Remove",
  },
  {
    id: "app-passwords",
    phase: "harden",
    weight: "useful",
    surfaces: ["web"],
    title: "Clear out old app passwords",
    detail:
      `App passwords are ${APP_PASSWORD_LENGTH}-character credentials issued to legacy mail clients that cannot prompt for a second step, and they bypass 2-Step Verification entirely. Revoke any you no longer use.`,
    where: "Google Account -> Security -> App passwords",
  },
  {
    id: "backup-codes",
    phase: "recover",
    weight: "critical",
    surfaces: ["web", "android", "ios"],
    title: "Generate and store backup codes",
    detail:
      `Google issues ${BACKUP_CODE_COUNT} single-use codes of ${BACKUP_CODE_LENGTH} digits each. Save them in your password manager or print them and keep the paper somewhere only you can reach — not in the same bag as the phone.`,
    where: "2-Step Verification -> Backup codes -> Get backup codes",
  },
  {
    id: "second-device",
    phase: "recover",
    weight: "important",
    surfaces: ["web", "android", "ios"],
    title: "Enrol a second device or key as a spare",
    detail:
      "A single second factor is a single point of failure. A tablet with the authenticator app, or a second passkey on a home laptop, means a lost phone does not lock you out of your own mail.",
    where: "2-Step Verification -> Authenticator -> Add authenticator app",
  },
  {
    id: "test-recovery",
    phase: "recover",
    weight: "important",
    surfaces: ["web"],
    title: "Test the recovery path in a private window",
    detail:
      "Sign in from a private browsing window and deliberately choose 'Try another way'. Confirming that a backup code actually works is the only way to know your recovery plan is real.",
    where: "accounts.google.com in a private or incognito window",
  },
];

/** How the common second factors compare, for the explainer table. */
export const METHOD_COMPARISON = [
  {
    method: "Passkey or hardware security key",
    strength: "Strongest",
    phishingResistant: true,
    note: "Cryptographically bound to google.com, so a fake sign-in page cannot replay it.",
  },
  {
    method: "Google prompt on a signed-in phone",
    strength: "Strong",
    phishingResistant: false,
    note: "Shows device and location, but a convincing attacker can still push a prompt you approve by reflex.",
  },
  {
    method: "Authenticator app code (TOTP)",
    strength: "Strong",
    phishingResistant: false,
    note: "Generated offline on your device; safe from SIM-swap but can be typed into a phishing page.",
  },
  {
    method: "Backup codes",
    strength: "Adequate",
    phishingResistant: false,
    note: `${BACKUP_CODE_COUNT} single-use codes; a fallback rather than a daily method.`,
  },
  {
    method: "SMS or voice code",
    strength: "Weakest",
    phishingResistant: false,
    note: "Vulnerable to SIM-swap and number porting; better than nothing, worse than everything above.",
  },
];

/** Steps that apply to a chosen surface and phase. */
export function filterSteps({ surface = "web", phase = "all" } = {}) {
  if (!SURFACES.some((entry) => entry.id === surface)) {
    return { error: "Choose a device: web, Android, or iPhone/iPad.", items: [] };
  }
  if (phase !== "all" && !PHASES.some((entry) => entry.id === phase)) {
    return { error: "Unknown stage selected.", items: [] };
  }
  const items = STEPS.filter((step) => {
    if (!step.surfaces.includes(surface)) return false;
    if (phase !== "all" && step.phase !== phase) return false;
    return true;
  });
  return { items };
}

/**
 * Weighted completion for the steps that apply to a surface.
 * `completed` is any iterable of step ids. Unknown ids are ignored rather than
 * counted, so a stale saved list can never push the score above 100.
 */
export function computeProgress({ completed = [], surface = "web" } = {}) {
  if (!SURFACES.some((entry) => entry.id === surface)) {
    return { error: "Choose a device: web, Android, or iPhone/iPad." };
  }
  const applicable = STEPS.filter((step) => step.surfaces.includes(surface));
  if (applicable.length === 0) {
    return { error: "No steps apply to that device." };
  }

  const doneSet = new Set(
    Array.from(completed ?? []).filter((id) => applicable.some((step) => step.id === id)),
  );

  const weightOf = (step) => WEIGHTS[step.weight] ?? WEIGHTS.useful;
  const totalWeight = applicable.reduce((sum, step) => sum + weightOf(step), 0);
  const doneWeight = applicable
    .filter((step) => doneSet.has(step.id))
    .reduce((sum, step) => sum + weightOf(step), 0);

  const criticalSteps = applicable.filter((step) => step.weight === "critical");
  const criticalDone = criticalSteps.filter((step) => doneSet.has(step.id));
  const remaining = applicable.filter((step) => !doneSet.has(step.id));

  return {
    total: applicable.length,
    done: doneSet.size,
    remaining: remaining.length,
    percent: totalWeight > 0 ? (doneWeight / totalWeight) * 100 : 0,
    criticalTotal: criticalSteps.length,
    criticalDone: criticalDone.length,
    // The next thing worth doing: highest weight first, then original order.
    nextStep:
      remaining
        .slice()
        .sort((a, b) => weightOf(b) - weightOf(a) || STEPS.indexOf(a) - STEPS.indexOf(b))[0] || null,
    level:
      totalWeight > 0 && doneWeight === totalWeight
        ? "Fully hardened"
        : criticalDone.length === criticalSteps.length && criticalSteps.length > 0
          ? "Well protected"
          : doneSet.size > 0
            ? "Partly protected"
            : "Not protected yet",
  };
}
