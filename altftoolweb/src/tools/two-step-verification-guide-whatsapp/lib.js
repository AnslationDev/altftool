/**
 * WhatsApp Two-Step Verification Guide — local account-hardening checklist.
 *
 * Pure browser logic only. The tool never contacts WhatsApp, Meta, a phone
 * carrier or any external service.
 */

export const CHECKLIST = [
  {
    id: "sim-account-secure",
    group: "SIM and device",
    title: "Add carrier account protection before changing WhatsApp settings",
    detail:
      "Ask your mobile carrier for a port-out PIN, SIM-swap lock or account password where available. WhatsApp still begins with phone-number control.",
    where: "Carrier app/support -> SIM-swap or port-out protection",
    weight: 10,
    critical: true,
  },
  {
    id: "two-step-pin",
    group: "Two-step verification",
    title: "Enable the WhatsApp two-step verification PIN",
    detail:
      "Set a memorable but non-obvious 6-digit PIN. This PIN is requested when the number is registered again, which slows SIM-swap takeovers.",
    where: "WhatsApp -> Settings -> Account -> Two-step verification",
    weight: 15,
    critical: true,
  },
  {
    id: "recovery-email",
    group: "Recovery",
    title: "Add a recovery email that only you control",
    detail:
      "Without a recovery email, a forgotten PIN can lock you out. Use an email account that already has strong two-factor authentication.",
    where: "Two-step verification -> Add email address",
    weight: 14,
    critical: true,
  },
  {
    id: "email-hardened",
    group: "Recovery",
    title: "Harden the recovery email itself",
    detail:
      "Your WhatsApp recovery email is now part of account recovery. Give it a unique password, authenticator app or passkey, and backup codes.",
    where: "Email account security settings",
    weight: 8,
    critical: true,
  },
  {
    id: "passkey",
    group: "Two-step verification",
    title: "Create a WhatsApp passkey if your device supports it",
    detail:
      "A passkey uses your device unlock and can reduce dependence on typed OTPs during account verification.",
    where: "WhatsApp -> Settings -> Account -> Passkeys",
    weight: 8,
    critical: false,
  },
  {
    id: "linked-devices",
    group: "Sessions",
    title: "Review linked devices and log out anything old",
    detail:
      "WhatsApp Web/Desktop sessions can keep receiving messages. Remove office PCs, shared browsers and old laptops.",
    where: "WhatsApp -> Linked devices",
    weight: 8,
    critical: false,
  },
  {
    id: "security-notifications",
    group: "Monitoring",
    title: "Turn on security notifications",
    detail:
      "Security notifications alert you when a contact's encryption security code changes, which can reveal re-registration or device changes.",
    where: "WhatsApp -> Settings -> Account -> Security notifications",
    weight: 7,
    critical: false,
  },
  {
    id: "encrypted-backup",
    group: "Backups",
    title: "Use end-to-end encrypted chat backups",
    detail:
      "Cloud backups can be the weakest copy of your messages. Set a backup password or key and keep it somewhere safe.",
    where: "WhatsApp -> Settings -> Chats -> Chat backup -> End-to-end encrypted backup",
    weight: 8,
    critical: false,
  },
  {
    id: "app-lock",
    group: "SIM and device",
    title: "Enable app lock on shared or high-risk phones",
    detail:
      "Face, fingerprint or device-code lock prevents someone holding your unlocked phone from opening chats immediately.",
    where: "WhatsApp -> Settings -> Privacy -> App lock",
    weight: 6,
    critical: false,
  },
  {
    id: "profile-privacy",
    group: "Privacy",
    title: "Limit profile photo, status and last-seen visibility",
    detail:
      "Reducing public profile signals makes impersonation and targeted social engineering harder.",
    where: "WhatsApp -> Settings -> Privacy",
    weight: 5,
    critical: false,
  },
  {
    id: "group-privacy",
    group: "Privacy",
    title: "Restrict who can add you to groups",
    detail:
      "Scam groups often begin with unsolicited adds. Restrict group invites to contacts or a smaller allow-list.",
    where: "WhatsApp -> Settings -> Privacy -> Groups",
    weight: 4,
    critical: false,
  },
  {
    id: "recovery-drill",
    group: "Recovery",
    title: "Write down your recovery plan before travel or phone repair",
    detail:
      "Know where the recovery email, SIM account PIN, encrypted-backup password and passkey-capable device are before the phone is lost.",
    where: "Personal password manager or offline note",
    weight: 7,
    critical: false,
  },
];

export const GROUPS = [
  "Two-step verification",
  "Recovery",
  "SIM and device",
  "Sessions",
  "Backups",
  "Monitoring",
  "Privacy",
];

export const DEFAULT_DONE = [];
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);
export const CRITICAL_CAP_PERCENT = 69;

export const BANDS = [
  { min: 90, label: "Hardened", hint: "Strong setup for high-value personal or business WhatsApp use." },
  { min: 70, label: "Well protected", hint: "Good setup. Close remaining device, backup or privacy gaps." },
  { min: 40, label: "Partly protected", hint: "Better than default, but registration or recovery gaps remain." },
  { min: 0, label: "At risk", hint: "A SIM swap, stolen phone or weak recovery email can still hurt you." },
];

const byId = new Map(CHECKLIST.map((item) => [item.id, item]));

export function scoreChecklist(doneIds = []) {
  if (!Array.isArray(doneIds)) {
    return { error: "Completed items must be a list." };
  }

  const done = new Set(doneIds.filter((id) => byId.has(id)));
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
  const band = BANDS.find((entry) => percent >= entry.min) || BANDS[BANDS.length - 1];

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
