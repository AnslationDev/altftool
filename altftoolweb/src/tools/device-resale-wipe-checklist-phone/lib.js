/**
 * Old phone resale wipe checklist, with ordering enforced.
 *
 * Wiping a phone before selling it is not a single action, and the damage
 * almost always comes from doing the right steps in the wrong order. This
 * module models the steps as a dependency graph, so ticking one whose
 * prerequisite is still outstanding produces an explicit warning describing
 * what that mistake costs.
 *
 * The ordering rules that matter, from Apple and Google documentation:
 *  - iPhone: Settings → General → Transfer or Reset iPhone → Erase All Content
 *    and Settings signs the device out of your Apple Account and clears
 *    Activation Lock as part of the erase. Erasing any other way — recovery
 *    mode, a restore from a computer, a lost-device wipe by someone else —
 *    leaves Activation Lock in place and the buyer receives an unusable phone.
 *  - iPhone: unpair a paired Apple Watch before erasing the phone, because the
 *    unpair process backs up the watch and clears its own activation lock.
 *  - iPhone: turn iMessage off, or deregister the number afterwards, or texts
 *    from other iPhone users keep routing to a device you no longer own.
 *  - Android: remove the Google account before the factory reset. Factory
 *    Reset Protection ties the wiped device to the last account signed in, so
 *    resetting first means the new owner is asked for your credentials at
 *    setup. Samsung and some other manufacturers add a second account lock of
 *    their own that has to be removed separately.
 *  - Both platforms encrypt storage by default — iOS through the Secure
 *    Enclave, Android through file-based encryption, mandatory since Android
 *    10. A factory reset discards the encryption keys, so the data is
 *    cryptographically destroyed. Filling the phone with junk files first is
 *    advice left over from unencrypted Android 5 and earlier and does nothing
 *    useful today.
 *  - Two-factor seeds are the most commonly destroyed thing in this process.
 *    An authenticator app that does not sync loses every code the moment the
 *    phone is wiped, and some accounts are then unrecoverable without a
 *    support process.
 *
 * Informational only. Financing, insurance and carrier terms are yours to
 * check before you sell anything.
 */

export const PLATFORMS = [
  { id: "ios", label: "iPhone" },
  { id: "android", label: "Android" },
];

export const PLATFORM_IDS = PLATFORMS.map((item) => item.id);

export const PHASES = [
  { id: "prepare", order: 1, title: "1. Before you touch anything", tone: "primary" },
  { id: "migrate", order: 2, title: "2. Move what cannot be re-created", tone: "primary" },
  { id: "detach", order: 3, title: "3. Detach the device from your accounts", tone: "warning" },
  { id: "erase", order: 4, title: "4. Erase — the point of no return", tone: "danger" },
  { id: "verify", order: 5, title: "5. Prove the wipe worked", tone: "success" },
  { id: "handover", order: 6, title: "6. Handover", tone: "success" },
];

/**
 * Steps.
 *  requires  – step ids that must be done first
 *  when      – option key that switches the step on
 *  platform  – null for both, or "ios" / "android"
 *  critical  – getting this wrong costs data or bricks the phone for the buyer
 */
export const STEPS = [
  {
    id: "backup",
    phase: "prepare",
    title: "Take a full backup and check it restored somewhere",
    how: "iPhone: iCloud Backup, or a computer backup with Encrypt local backup ticked. Android: Settings → System → Backup, then confirm the backup timestamp.",
    why: "An encrypted iPhone backup is the only kind that carries saved passwords, Health data and Wi-Fi networks across. An unverified backup is a guess.",
    critical: true,
  },
  {
    id: "finance-check",
    phase: "prepare",
    title: "Check the phone is fully paid off and not carrier-locked",
    how: "Check the financing balance with the carrier or retailer, and request a network unlock if the phone is locked to a network.",
    why: "A device still on a payment plan can be barred from networks after sale, and a locked handset is worth noticeably less than an unlocked one.",
  },
  {
    id: "record-imei",
    phase: "prepare",
    title: "Record the IMEI and serial number",
    how: "Settings → General → About, or dial *#06#. Save it somewhere outside the phone.",
    why: "You need it to remove the device from insurance, to prove ownership, and to report it if the sale goes wrong.",
  },
  {
    id: "twofa",
    phase: "migrate",
    title: "Move every two-factor authenticator seed to the new phone",
    how: "Use the authenticator app's export or transfer feature, or re-enrol each account on the new device and confirm a code works before continuing.",
    why: "This is the single most common irreversible mistake. Seeds held only in a non-syncing authenticator app are destroyed by the wipe, and some accounts cannot be recovered without a lengthy support process.",
    critical: true,
    requires: ["backup"],
  },
  {
    id: "passkeys",
    phase: "migrate",
    title: "Check passkeys and password manager access from the new phone",
    how: "Sign in to your password manager on the new device and open one account that uses a passkey.",
    why: "A device-bound passkey that exists only on the old phone disappears with it. Verify before erasing, not after.",
    critical: true,
    requires: ["backup"],
  },
  {
    id: "wallet",
    phase: "migrate",
    title: "Move payment cards, transit passes and car keys",
    how: "Remove cards from the wallet app and re-add them on the new phone. Transfer transit passes through the wallet app rather than deleting them.",
    why: "Some transit passes hold a stored balance in the phone's secure element. Erasing the device without transferring them loses the balance.",
  },
  {
    id: "esim",
    phase: "migrate",
    title: "Transfer the eSIM to the new phone",
    how: "Use the carrier's eSIM transfer flow, or ask for a re-issue. When erasing an iPhone, choose the option that keeps the eSIM if you have not moved it yet.",
    why: "Deleting an eSIM you have not transferred means a carrier re-issue, which can take days and sometimes a shop visit.",
    when: "hasEsim",
    critical: true,
    requires: ["backup"],
  },
  {
    id: "sdcard",
    phase: "migrate",
    title: "Copy anything you need off the memory card, then remove it",
    how: "Copy the contents to a computer, then take the card out of the tray.",
    why: "A factory reset does not necessarily erase removable storage, and cards are routinely sold inside phones by accident.",
    when: "hasSdCard",
    platform: "android",
    critical: true,
  },
  {
    id: "watch",
    phase: "migrate",
    title: "Unpair the Apple Watch before you erase the phone",
    how: "Watch app → All Watches → the info button → Unpair Apple Watch.",
    why: "Unpairing backs the watch up and clears its own activation lock. Erasing the phone first leaves the watch stranded and harder to re-pair.",
    when: "hasWatch",
    platform: "ios",
    critical: true,
    requires: ["backup"],
  },
  {
    id: "imessage",
    phase: "detach",
    title: "Turn iMessage and FaceTime off",
    how: "Settings → Messages → iMessage off, and Settings → FaceTime → off.",
    why: "Otherwise texts sent to your number by other iPhone users keep being routed to iMessage and never arrive on the new phone. If you have already sold it, deregister the number on Apple's deregistration page.",
    platform: "ios",
    critical: true,
    requires: ["twofa"],
  },
  {
    id: "mdm",
    phase: "detach",
    title: "Remove any work profile, MDM enrolment or supervision profile",
    how: "iPhone: Settings → General → VPN & Device Management. Android: Settings → Accounts → Work profile → remove.",
    why: "A supervised or enrolled device re-applies its restrictions after a reset, so the buyer gets a phone that is still managed by your employer.",
    when: "hasWorkProfile",
    critical: true,
    requires: ["backup"],
  },
  {
    id: "manufacturer-account",
    phase: "detach",
    title: "Remove the manufacturer account as well as the Google account",
    how: "Settings → Accounts → the Samsung, Xiaomi or other manufacturer account → Remove account.",
    why: "Several manufacturers add a reactivation lock of their own on top of Google's Factory Reset Protection, and it survives a reset independently.",
    platform: "android",
    critical: true,
    requires: ["twofa"],
  },
  {
    id: "google-account",
    phase: "detach",
    title: "Remove the Google account from the phone",
    how: "Settings → Passwords & accounts → Google → Remove account.",
    why: "Factory Reset Protection binds a wiped phone to the last Google account that was signed in. Removing the account first is what makes the reset clean; skipping it means the buyer is asked for your password at setup.",
    platform: "android",
    critical: true,
    requires: ["twofa", "passkeys"],
  },
  {
    id: "find-my-off",
    phase: "detach",
    title: "Confirm the device will leave Find My when it is erased",
    how: "iPhone: erasing through Transfer or Reset iPhone signs you out and clears Activation Lock. Android: Find Hub releases the device once the Google account is removed.",
    why: "Activation Lock and Factory Reset Protection are the same problem under different names: a wiped phone that still belongs to your account is unusable to the buyer.",
    critical: true,
    requires: ["twofa"],
  },
  {
    id: "sim",
    phase: "detach",
    title: "Take the physical SIM out",
    how: "Eject the tray and keep the card.",
    why: "A SIM left in a sold phone hands over your number, and with it every SMS-based recovery code you have.",
    critical: true,
  },
  {
    id: "erase-ios",
    phase: "erase",
    title: "Erase All Content and Settings from within Settings",
    how: "Settings → General → Transfer or Reset iPhone → Erase All Content and Settings.",
    why: "Only this route signs out of your Apple Account and clears Activation Lock as part of the erase. A recovery-mode restore leaves the lock in place. The erase discards the encryption keys, so the data is cryptographically destroyed — there is no need to overwrite anything.",
    platform: "ios",
    critical: true,
    requires: ["backup", "twofa", "passkeys", "sim", "find-my-off"],
  },
  {
    id: "erase-android",
    phase: "erase",
    title: "Factory reset from Settings, after the accounts are gone",
    how: "Settings → System → Reset options → Erase all data (factory reset).",
    why: "Android storage is encrypted by default since Android 10, so the reset destroys the keys and the data with them. Filling the phone with junk files first is advice from the unencrypted Android 5 era and achieves nothing.",
    platform: "android",
    critical: true,
    requires: ["backup", "twofa", "passkeys", "sim", "google-account"],
  },
  {
    id: "boot-check",
    phase: "verify",
    title: "Boot the phone and walk to the first setup screen",
    how: "Power on and step through setup until it asks about Wi-Fi or a language.",
    why: "If setup asks for the previous owner's Apple Account or Google account, the lock is still on and the wipe is not finished. This is the only way to know before the buyer finds out.",
    critical: true,
    requires: ["erase-ios", "erase-android"],
    requiresAny: true,
  },
  {
    id: "account-device-list",
    phase: "verify",
    title: "Confirm the phone has disappeared from your account's device list",
    how: "Check the devices section of your Apple Account or Google Account in a browser and remove the entry if it is still listed.",
    why: "A device still listed can still receive account notifications and sometimes two-factor prompts.",
    critical: true,
    requires: ["boot-check"],
  },
  {
    id: "insurance",
    phase: "handover",
    title: "Cancel insurance and remove the device from any protection plan",
    how: "Contact the insurer or plan provider with the IMEI you recorded earlier.",
    why: "You are otherwise paying to insure a phone somebody else is using.",
    requires: ["record-imei"],
  },
  {
    id: "physical-check",
    phase: "handover",
    title: "Check the tray, the slot and the case",
    how: "Open the SIM tray, check the memory card slot, and empty any pocket in the case.",
    why: "Cards and SIMs get sold inside phones constantly, and neither is covered by any software wipe.",
    critical: true,
    requires: ["boot-check"],
  },
  {
    id: "receipt",
    phase: "handover",
    title: "Keep a record of the sale with the IMEI",
    how: "Note the date, the buyer and the IMEI, and keep it.",
    why: "If the handset is later reported lost or used for something you did not do, this is what shows when it left your hands.",
    requires: ["record-imei"],
  },
];

export const OPTION_KEYS = ["hasEsim", "hasSdCard", "hasWatch", "hasWorkProfile"];

export const OPTION_LABELS = {
  hasEsim: "The phone has an eSIM I still need",
  hasSdCard: "There is a memory card in it",
  hasWatch: "An Apple Watch is paired to it",
  hasWorkProfile: "It has a work profile, MDM enrolment or supervision",
};

/**
 * Build an ordered wipe plan and check the order the user is working in.
 *
 * @param {object} input
 * @param {string} input.platform  One of PLATFORM_IDS.
 * @param {object} input.options   Booleans keyed by OPTION_KEYS.
 * @param {string[]} input.done    Completed step ids.
 * @returns {object} plan, or { error }.
 */
export function buildWipePlan({ platform, options = {}, done = [] } = {}) {
  const platformInfo = PLATFORMS.find((item) => item.id === platform);
  if (!platformInfo) return { error: "Choose whether this is an iPhone or an Android phone." };

  const doneSet = new Set(Array.isArray(done) ? done.filter((id) => typeof id === "string") : []);

  const applicable = STEPS.filter((step) => {
    if (step.platform && step.platform !== platform) return false;
    if (step.when && !options[step.when]) return false;
    return true;
  });

  const applicableIds = new Set(applicable.map((step) => step.id));

  const steps = applicable.map((step) => {
    // A dependency that does not apply to this platform is dropped, not failed.
    const deps = (step.requires ?? []).filter((id) => applicableIds.has(id));
    const metAny = deps.length === 0 || deps.some((id) => doneSet.has(id));
    const metAll = deps.every((id) => doneSet.has(id));
    const satisfied = step.requiresAny ? metAny : metAll;
    const missing = deps.filter((id) => !doneSet.has(id));
    return {
      ...step,
      requiresResolved: deps,
      done: doneSet.has(step.id),
      blocked: !satisfied,
      missing,
      phaseOrder: PHASES.find((phase) => phase.id === step.phase).order,
    };
  });

  const byId = new Map(steps.map((step) => [step.id, step]));

  const violations = steps
    .filter((step) => step.done && step.blocked)
    .map((step) => ({
      id: step.id,
      title: step.title,
      missing: step.missing.map((id) => byId.get(id)?.title ?? id),
      consequence: consequenceFor(step.id, platform),
    }));

  const groups = PHASES.map((phase) => {
    const items = steps
      .filter((step) => step.phase === phase.id)
      .sort((a, b) => Number(b.critical ?? false) - Number(a.critical ?? false));
    return {
      ...phase,
      items,
      doneCount: items.filter((step) => step.done).length,
    };
  }).filter((phase) => phase.items.length > 0);

  const total = steps.length;
  const doneCount = steps.filter((step) => step.done).length;
  const criticalOutstanding = steps.filter((step) => step.critical && !step.done).length;

  const nextStep =
    steps
      .filter((step) => !step.done && !step.blocked)
      .sort((a, b) => {
        if (a.phaseOrder !== b.phaseOrder) return a.phaseOrder - b.phaseOrder;
        return Number(b.critical ?? false) - Number(a.critical ?? false);
      })[0] ?? null;

  const eraseStep = steps.find((step) => step.phase === "erase");
  const erased = Boolean(eraseStep?.done);

  return {
    platform: platformInfo,
    groups,
    steps,
    total,
    doneCount,
    // total is never zero: several steps apply to both platforms unconditionally.
    percentDone: Math.round((doneCount / total) * 100),
    criticalOutstanding,
    violations,
    nextStep,
    erased,
    safeToSell: doneCount === total && violations.length === 0,
  };
}

/** What specifically goes wrong when a step is done out of order. */
function consequenceFor(stepId, platform) {
  switch (stepId) {
    case "erase-ios":
      return "Erasing before signing out leaves Activation Lock on the device. The buyer cannot get past the setup screen without your Apple Account password, and you cannot clear it remotely once the phone is in someone else's hands and offline.";
    case "erase-android":
      return "Resetting before removing the Google account leaves Factory Reset Protection active. Setup on the wiped phone will demand the account that was last signed in, which is yours.";
    case "google-account":
      return "Removing the account before your authenticator seeds and passkeys are working on the new phone can lock you out of the very account you need to prove ownership.";
    case "twofa":
    case "passkeys":
      return "There is nothing to restore from if the backup was never verified. Confirm the backup exists before you move the things that only exist on this phone.";
    case "boot-check":
      return "There is nothing to verify until the erase has actually run.";
    case "account-device-list":
      return "Check the account device list after you have confirmed the phone boots to a clean setup screen, not before.";
    case "imessage":
      return platform === "ios"
        ? "Leaving iMessage on means texts from other iPhone users vanish into a device you no longer own. Deregister the number on Apple's deregistration page if the phone has already gone."
        : "";
    case "watch":
      return "Erasing the phone with a watch still paired leaves the watch with its own activation lock and no clean unpair path.";
    case "esim":
      return "Erasing without transferring the eSIM means asking the carrier to re-issue it, which is not always same-day.";
    default:
      return "This step depends on an earlier one that is not finished yet.";
  }
}

/** Plain-text export for the copy button. */
export function formatWipePlan(plan) {
  if (!plan || plan.error) return "";
  const lines = [
    `Phone resale wipe checklist — ${plan.platform.label}`,
    `${plan.doneCount}/${plan.total} steps done · ${plan.criticalOutstanding} critical step(s) outstanding`,
    "",
  ];
  for (const group of plan.groups) {
    lines.push(group.title.toUpperCase());
    for (const step of group.items) {
      lines.push(`  [${step.done ? "x" : " "}] ${step.title}`);
      lines.push(`      ${step.how}`);
    }
    lines.push("");
  }
  if (plan.violations.length > 0) {
    lines.push(
      "OUT OF ORDER:",
      ...plan.violations.map(
        (item) => `  ! ${item.title} — missing first: ${item.missing.join("; ")}. ${item.consequence}`,
      ),
    );
  }
  return lines.join("\n").trim();
}
