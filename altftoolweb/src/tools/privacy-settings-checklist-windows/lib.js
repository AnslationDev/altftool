/**
 * Windows 11 Privacy Settings Checklist — exposure scoring logic.
 *
 * Pure module: no React, no DOM, no clocks. Same input, same output. Every
 * exported function is total — unusable input returns { error } rather than a
 * NaN, an Infinity or a misleading score.
 *
 * The model is deliberately not "count the ticked boxes". Each control sits on
 * one exposure AXIS, and a risk profile re-weights those axes, because two
 * people can need opposite things from the same app: someone who has to stay
 * publicly reachable cannot simply hide, and needs the contact and account
 * controls carrying the weight instead.
 */

/** Where the settings live, for the on-page instructions. */
export const PLATFORM = {
  "name": "Windows 11",
  "settingsRoot": "Start > Settings > Privacy & security. Diagnostics, search permissions, activity history and per-app permissions all live under that one heading; disk encryption and sign-in sit under System and Accounts.",
  "note": "Windows resets some of these after a feature update, so this is worth re-running once or twice a year rather than treating as a one-off."
};

/**
 * The checklist.
 *
 * axis     = which kind of exposure the control closes.
 * weight   = share of the 100 base points the control carries, ranked by how
 *            much real exposure it removes.
 * critical = skipping this one leaves an exposure the other controls cannot
 *            compensate for, so it caps the score (CRITICAL_CAP_PERCENT).
 * path     = where the setting sits.
 * risk     = the concrete thing that happens if you leave it as-is.
 */
export const CHECKLIST = [
  {
    "id": "advertising-id",
    "group": "Identifiers and telemetry",
    "axis": "Tracking identifiers",
    "title": "Turn off the advertising ID",
    "detail": "Windows gives every user account a per-device advertising identifier that apps read to link your behaviour across unrelated programs. Switching it off resets the identifier and stops apps requesting it.",
    "path": "Settings > Privacy & security > General > Let apps show me personalised ads using my advertising ID",
    "risk": "Unrelated apps share one identifier for you, building a cross-app profile of what you do on this PC.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "diagnostic-data-required",
    "group": "Identifiers and telemetry",
    "axis": "Tracking identifiers",
    "title": "Set diagnostic data to Required only",
    "detail": "Optional diagnostic data includes the websites you browse, how you use apps and features, and enhanced error reports that can contain fragments of what you were working on. Required-only keeps the security and reliability minimum and drops the rest.",
    "path": "Settings > Privacy & security > Diagnostics & feedback > Send optional diagnostic data",
    "risk": "Browsing activity and app usage detail leave the machine as routine telemetry.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "tailored-experiences",
    "group": "Identifiers and telemetry",
    "axis": "Tracking identifiers",
    "title": "Turn off tailored experiences",
    "detail": "Tailored experiences lets Microsoft use your diagnostic data to target tips, ads and recommendations inside the operating system itself. It is the switch behind personalised suggestions appearing in Start and Settings.",
    "path": "Settings > Privacy & security > Diagnostics & feedback > Tailored experiences",
    "risk": "Your usage data is fed back as targeted promotions inside Windows itself.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "inking-typing-personalisation",
    "group": "Identifiers and telemetry",
    "axis": "Tracking identifiers",
    "title": "Turn off inking and typing personalisation",
    "detail": "This builds a custom dictionary from what you type and handwrite to improve suggestions. That dictionary is derived from your actual documents and messages, so it can absorb names, addresses and passwords typed into the wrong field.",
    "path": "Settings > Privacy & security > Inking & typing personalisation",
    "risk": "A personal dictionary built from your own typing accumulates names, addresses and stray secrets.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "feedback-frequency",
    "group": "Identifiers and telemetry",
    "axis": "Tracking identifiers",
    "title": "Set feedback frequency to Never",
    "detail": "Feedback prompts collect free-text answers alongside a diagnostic snapshot. Setting frequency to Never stops the prompts and the attached snapshot.",
    "path": "Settings > Privacy & security > Diagnostics & feedback > Feedback frequency",
    "risk": "Prompted feedback sends a diagnostic snapshot of the machine along with your answer.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "delete-diagnostic-data",
    "group": "Identifiers and telemetry",
    "axis": "Tracking identifiers",
    "title": "Delete the diagnostic data already collected",
    "detail": "Turning telemetry down stops new collection but leaves everything gathered until now. The Delete button on the same screen clears the diagnostic data associated with this device.",
    "path": "Settings > Privacy & security > Diagnostics & feedback > Delete diagnostic data",
    "risk": "Years of telemetry from before you changed the setting stays associated with the device.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "recall-snapshots",
    "group": "Local recording and history",
    "axis": "Local recording",
    "title": "Turn off Recall, or confirm it was never enabled",
    "detail": "Recall periodically screenshots everything on screen and indexes it so you can search your own past activity. Even stored encrypted and locally, it is the single largest concentration of sensitive data on the machine — every message, document and banking page you looked at, in one searchable index. It is opt-in and only present on qualifying Copilot+ hardware.",
    "path": "Settings > Privacy & security > Recall & snapshots",
    "risk": "One index holds screenshots of every private message, medical result and bank page you have viewed.",
    "weight": 7,
    "critical": true
  },
  {
    "id": "recall-exclusions",
    "group": "Local recording and history",
    "axis": "Local recording",
    "title": "If you keep Recall, exclude sensitive apps and sites and cap the storage",
    "detail": "Recall lets you exclude specific apps and websites and limit how much history it keeps. Filtering out your password manager, banking sites and messaging apps removes the worst of the exposure while keeping the feature usable.",
    "path": "Settings > Privacy & security > Recall & snapshots > Filter apps and websites / Storage",
    "risk": "Your password manager and banking sessions are captured in the snapshot index alongside everything else.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "activity-history",
    "group": "Local recording and history",
    "axis": "Local recording",
    "title": "Turn off activity history and clear what is stored",
    "detail": "Activity history records the apps and files you use so they can resurface in Start and the task switcher. Turning it off and clearing the existing record removes that trail.",
    "path": "Settings > Privacy & security > Activity history",
    "risk": "A list of every app and document you opened is available to anyone who sits at the machine.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "recommended-files",
    "group": "Local recording and history",
    "axis": "Local recording",
    "title": "Turn off recently opened items in Start and File Explorer",
    "detail": "Recommended files and recent items put document names on the Start menu and in Explorer's home view. Filenames alone routinely disclose a medical condition, a legal matter or an employer to anyone glancing at the screen.",
    "path": "Settings > Personalisation > Start > Show recently opened items, and File Explorer > Options > Privacy",
    "risk": "A filename on the Start menu tells a colleague or a family member something you never said out loud.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "clipboard-history-sync",
    "group": "Local recording and history",
    "axis": "Local recording",
    "title": "Turn off clipboard history and cross-device clipboard sync",
    "detail": "Clipboard history keeps the last several items you copied, and syncing sends them to the cloud so they appear on your other devices. Copied passwords and one-time codes end up in both.",
    "path": "Settings > System > Clipboard",
    "risk": "A password you copied is retrievable from clipboard history and mirrored to your other devices.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "timeline-notifications",
    "group": "Local recording and history",
    "axis": "Local recording",
    "title": "Hide notification content on the lock screen",
    "detail": "By default the lock screen shows notification text, so messages, two-factor codes and email subject lines are readable without unlocking the machine at all.",
    "path": "Settings > System > Notifications > Show notifications on the lock screen",
    "risk": "Two-factor codes and message previews are readable on a locked screen by anyone walking past.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "search-cloud-content",
    "group": "Search and cloud sync",
    "axis": "Cloud exposure",
    "title": "Turn off cloud content search and web results in Windows Search",
    "detail": "By default the Start menu search box sends what you type to Microsoft to return web and cloud results. Every filename fragment and half-typed thought becomes a search query leaving the machine.",
    "path": "Settings > Privacy & security > Search permissions > Cloud content search / Show search highlights",
    "risk": "Everything you type into Start, including local filenames, is transmitted as a web search.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "search-history-device",
    "group": "Search and cloud sync",
    "axis": "Cloud exposure",
    "title": "Turn off search history on this device and clear it",
    "detail": "Windows keeps a local record of your searches to speed up repeat queries. Clearing it removes the trail of what you have looked for on this machine.",
    "path": "Settings > Privacy & security > Search permissions > Search history on this device",
    "risk": "A record of everything you searched for on this PC sits in your profile.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "local-account",
    "group": "Search and cloud sync",
    "axis": "Cloud exposure",
    "title": "Consider a local account instead of a Microsoft account",
    "detail": "A Microsoft account ties the machine to an online identity and enables settings sync by default. A local account keeps the machine standalone — at the cost of losing sync, Store purchases tied to the account, and the automatic BitLocker key escrow that saves people from losing their data.",
    "path": "Settings > Accounts > Your info > Sign in with a local account instead",
    "risk": "Machine-level activity and settings are tied to an online identity that spans all your devices.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "settings-sync",
    "group": "Search and cloud sync",
    "axis": "Cloud exposure",
    "title": "Turn off Windows backup and settings sync you do not want",
    "detail": "Sync copies preferences, some credentials and app lists to the cloud and pushes them onto every machine you sign into. On a shared or work-adjacent PC that spreads your configuration further than you intended.",
    "path": "Settings > Accounts > Windows backup > Remember my preferences",
    "risk": "Settings and saved credentials propagate onto every other PC you sign into.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "onedrive-folder-backup",
    "group": "Search and cloud sync",
    "axis": "Cloud exposure",
    "title": "Check whether OneDrive folder backup silently moved your files",
    "detail": "Windows setup often enables OneDrive backup for Desktop, Documents and Pictures without a clear prompt, so files you believe are local are actually in the cloud and synced everywhere you sign in.",
    "path": "OneDrive icon > Settings > Sync and backup > Manage backup",
    "risk": "Documents you assumed were only on this disk are in the cloud and on every device you sign into.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "location-service",
    "group": "App and device permissions",
    "axis": "Sensor & app access",
    "title": "Turn off the location service, or restrict it per app",
    "detail": "Windows resolves your position from nearby Wi-Fi networks and IP address, not only GPS, so a desktop PC with no GPS still reports a usable location. Clear the location history on the same page.",
    "path": "Settings > Privacy & security > Location",
    "risk": "Your address is derivable by any app with location access, even on a desktop with no GPS hardware.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "camera-mic-permissions",
    "group": "App and device permissions",
    "axis": "Sensor & app access",
    "title": "Audit which apps can use the camera and microphone",
    "detail": "Both pages list every app that has requested access and show recent activity. Revoking the ones that have no business with a camera or a microphone is quick and has an immediately visible effect.",
    "path": "Settings > Privacy & security > Camera / Microphone",
    "risk": "An app with no need for either keeps standing permission to record you.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "voice-activation",
    "group": "App and device permissions",
    "axis": "Sensor & app access",
    "title": "Turn off voice activation and online speech recognition",
    "detail": "Voice activation keeps the microphone listening for a wake word, and online speech recognition sends your audio to Microsoft for processing rather than handling it on the device.",
    "path": "Settings > Privacy & security > Voice activation / Speech",
    "risk": "The microphone stays live for a wake word and your speech is processed off the device.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "file-system-access",
    "group": "App and device permissions",
    "axis": "Sensor & app access",
    "title": "Review broad file-system access grants",
    "detail": "The file-system page lists apps granted access to all your files rather than just the folders you pick. That grant is far wider than most apps need and is rarely revisited after install.",
    "path": "Settings > Privacy & security > File system",
    "risk": "An app you installed for one job can read every document on the machine.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "background-apps",
    "group": "App and device permissions",
    "axis": "Sensor & app access",
    "title": "Stop apps running in the background unnecessarily",
    "detail": "Background apps keep network connections open and keep collecting when you are not using them. Restricting them cuts both the data flow and the battery drain.",
    "path": "Settings > Apps > Installed apps > per app > Advanced options > Background apps permissions",
    "risk": "Apps you are not using keep talking to their servers all day.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "find-my-device",
    "group": "App and device permissions",
    "axis": "Sensor & app access",
    "title": "Decide deliberately about Find my device",
    "detail": "Find my device periodically reports the machine's location to your Microsoft account. It is genuinely useful on a laptop that might be stolen and pointless on a desktop that never moves — the point is to choose rather than inherit the default.",
    "path": "Settings > Privacy & security > Find my device",
    "risk": "A machine that never moves reports its location to the cloud on a schedule for no benefit.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "device-encryption",
    "group": "Account and device security",
    "axis": "Device security",
    "title": "Confirm device encryption or BitLocker is actually on",
    "detail": "Without full-disk encryption, every privacy setting above is irrelevant to anyone who has the machine for ten minutes — the disk can simply be read in another computer. Check the status rather than assuming, because it is not enabled on every configuration.",
    "path": "Settings > Privacy & security > Device encryption, or Control Panel > BitLocker Drive Encryption",
    "risk": "Anyone who takes the laptop pulls the drive and reads every file without needing your password.",
    "weight": 7,
    "critical": true
  },
  {
    "id": "bitlocker-key-backup",
    "group": "Account and device security",
    "axis": "Device security",
    "title": "Save the BitLocker recovery key somewhere you can actually reach",
    "detail": "Encryption without a recoverable key is how people lose everything after a firmware update triggers a recovery prompt. Store the key in your password manager or on paper, and know whether a copy is escrowed to your Microsoft account.",
    "path": "Control Panel > BitLocker Drive Encryption > Back up your recovery key",
    "risk": "A routine firmware update asks for a key you do not have, and the data is gone permanently.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "windows-hello-lock",
    "group": "Account and device security",
    "axis": "Device security",
    "title": "Set Windows Hello and a short automatic lock",
    "detail": "Encryption only protects a powered-off or locked machine. A short screen-lock timeout with Hello or a PIN is what covers the far more common case of walking away from a running desktop.",
    "path": "Settings > Accounts > Sign-in options, and Settings > System > Power > Screen and sleep",
    "risk": "An unlocked, unattended machine gives away everything encryption was meant to protect.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "windows-update",
    "group": "Account and device security",
    "axis": "Device security",
    "title": "Keep Windows Update current and check it after every feature update",
    "detail": "Unpatched machines are the ones that get compromised, and feature updates sometimes reset privacy toggles back to their defaults. Updating and then re-checking this list is the whole habit.",
    "path": "Settings > Windows Update",
    "risk": "A known, already-patched vulnerability is exploited, or an update quietly re-enables telemetry.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "guest-and-admin",
    "group": "Account and device security",
    "axis": "Device security",
    "title": "Use a standard account for daily work and separate accounts per person",
    "detail": "Running as administrator all day means any program you launch inherits full control of the machine. A separate standard account for everyday use, and a distinct Windows account for each person sharing the PC, keeps files and histories apart.",
    "path": "Settings > Accounts > Other users",
    "risk": "Anything you run has full administrative control, and everyone sharing the PC reads everyone else's files.",
    "weight": 2,
    "critical": false
  }
];

/** Reporting order of the on-screen sections. */
export const GROUPS = [
  "Identifiers and telemetry",
  "Local recording and history",
  "Search and cloud sync",
  "App and device permissions",
  "Account and device security"
];

/** Exposure axes, in reporting order. */
export const AXES = [
  "Tracking identifiers",
  "Local recording",
  "Cloud exposure",
  "Sensor & app access",
  "Device security"
];

/**
 * Risk profiles. Multipliers scale the weight of every control on an axis
 * before scoring, so the same checklist grades differently for someone hiding
 * from strangers and someone who has to stay publicly reachable.
 * A multiplier of 1 leaves the base ranking untouched.
 */
export const PROFILES = [
  {
    "id": "personal",
    "name": "Personal laptop",
    "description": "A machine only you use, carried around. Encryption and stopping data leaving the device carry the weight.",
    "multipliers": {
      "Tracking identifiers": 1.2,
      "Local recording": 1.1,
      "Cloud exposure": 1.1,
      "Sensor & app access": 1,
      "Device security": 1.4
    }
  },
  {
    "id": "shared",
    "name": "Shared or family PC",
    "description": "Other people sit at this machine. Local recording — history, Recall, clipboard, filenames on screen — matters most.",
    "multipliers": {
      "Tracking identifiers": 0.9,
      "Local recording": 1.7,
      "Cloud exposure": 1.1,
      "Sensor & app access": 1,
      "Device security": 1.3
    }
  },
  {
    "id": "sensitive-work",
    "name": "Handling confidential work",
    "description": "Client files, legal or medical material. Anything that copies content off the machine or records the screen is weighted up hard.",
    "multipliers": {
      "Tracking identifiers": 1.3,
      "Local recording": 1.6,
      "Cloud exposure": 1.5,
      "Sensor & app access": 1.1,
      "Device security": 1.5
    }
  },
  {
    "id": "minimal-telemetry",
    "name": "Minimising what leaves the machine",
    "description": "You want the PC as quiet as possible on the network. Telemetry, search and cloud sync dominate the score.",
    "multipliers": {
      "Tracking identifiers": 1.7,
      "Local recording": 1,
      "Cloud exposure": 1.6,
      "Sensor & app access": 1.2,
      "Device security": 0.9
    }
  },
  {
    "id": "balanced",
    "name": "Balanced (no re-weighting)",
    "description": "Every setting counts at its base weight, with no profile emphasis applied.",
    "multipliers": {
      "Tracking identifiers": 1,
      "Local recording": 1,
      "Cloud exposure": 1,
      "Sensor & app access": 1,
      "Device security": 1
    }
  }
];

/** Sum of the base control weights. Authored to equal 100. */
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/**
 * One open critical control caps the score here. Rationale: cosmetic settings
 * must never let the score read as safe while a wide-open exposure remains.
 */
export const CRITICAL_CAP_PERCENT = 69;

/** Read top-down: the first band whose `min` the score reaches wins. */
export const BANDS = [
  {
    "id": "locked",
    "min": 90,
    "label": "Quiet machine",
    "hint": "Little leaves the PC, and what is on the disk is unreadable without your credentials."
  },
  {
    "id": "strong",
    "min": 70,
    "label": "Well configured",
    "hint": "Solid. Close the last few gaps when you have a spare minute."
  },
  {
    "id": "partial",
    "min": 40,
    "label": "Partly configured",
    "hint": "The obvious toggles are done; the recording and encryption side is not."
  },
  {
    "id": "open",
    "min": 0,
    "label": "Default Windows",
    "hint": "Telemetry, search queries and activity history are all flowing on their defaults."
  }
];

const byId = new Map(CHECKLIST.map((item) => [item.id, item]));
const profileById = new Map(PROFILES.map((item) => [item.id, item]));

/** Ids pre-ticked at first paint. */
export const DEFAULT_DONE = [
  "windows-update",
  "windows-hello-lock"
];

/** First band whose minimum the percent reaches. Percent is clamped to 0..100. */
export function bandFor(percent) {
  const value = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
  return BANDS.find((band) => value >= band.min) || BANDS[BANDS.length - 1];
}

/** Effective weight of one control under one profile. Never negative. */
export function effectiveWeight(item, profile) {
  const multiplier = profile && profile.multipliers ? profile.multipliers[item.axis] : 1;
  const factor = Number.isFinite(multiplier) && multiplier >= 0 ? multiplier : 1;
  return item.weight * factor;
}

/**
 * Score a set of completed control ids under a risk profile.
 *
 * Unknown ids and duplicates are ignored so a stale saved list can never
 * inflate the score. An unknown profile falls back to the first profile rather
 * than failing, because a missing profile is a UI bug, not bad user input.
 *
 * @param {string[]} doneIds ids from CHECKLIST already applied.
 * @param {string} [profileId] id from PROFILES.
 * @returns {object} score summary, or { error } for unusable input.
 */
export function scoreChecklist(doneIds, profileId) {
  if (!Array.isArray(doneIds)) {
    return { error: "Completed settings must be provided as a list." };
  }
  if (!(TOTAL_WEIGHT > 0)) {
    return { error: "This checklist has no weighted settings to score." };
  }

  const profile = profileById.get(profileId) || PROFILES[0];

  const done = new Set();
  for (const raw of doneIds) {
    if (typeof raw === "string" && byId.has(raw)) done.add(raw);
  }

  let earned = 0;
  let available = 0;
  const remaining = [];
  const missingCritical = [];

  for (const item of CHECKLIST) {
    const weight = effectiveWeight(item, profile);
    available += weight;
    if (done.has(item.id)) {
      earned += weight;
    } else {
      remaining.push(item);
      if (item.critical) missingCritical.push(item);
    }
  }

  if (!(available > 0)) {
    return { error: "This risk profile removes every setting from the score." };
  }

  const rawPercent = Math.round((earned / available) * 100);
  const capped = missingCritical.length > 0 && rawPercent > CRITICAL_CAP_PERCENT;
  const percent = capped ? CRITICAL_CAP_PERCENT : rawPercent;
  const band = bandFor(percent);

  // Exposure per axis: the share of that axis's weight still left open.
  const axes = AXES.map((name) => {
    const items = CHECKLIST.filter((item) => item.axis === name);
    let axisTotal = 0;
    let axisOpen = 0;
    let openCount = 0;
    for (const item of items) {
      const weight = effectiveWeight(item, profile);
      axisTotal += weight;
      if (!done.has(item.id)) {
        axisOpen += weight;
        openCount += 1;
      }
    }
    const exposure = axisTotal > 0 ? Math.round((axisOpen / axisTotal) * 100) : 0;
    const emphasis =
      profile.multipliers && Number.isFinite(profile.multipliers[name])
        ? profile.multipliers[name]
        : 1;
    return {
      name,
      exposure,
      closed: 100 - exposure,
      open: openCount,
      total: items.length,
      emphasis,
    };
  });

  const groups = GROUPS.map((name) => {
    const items = CHECKLIST.filter((item) => item.group === name);
    const doneCount = items.filter((item) => done.has(item.id)).length;
    return {
      name,
      done: doneCount,
      total: items.length,
      percent: items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0,
    };
  });

  // Highest-impact unfinished controls first; criticals always outrank the rest.
  const nextActions = remaining
    .slice()
    .sort(
      (a, b) =>
        Number(b.critical) - Number(a.critical) ||
        effectiveWeight(b, profile) - effectiveWeight(a, profile)
    )
    .slice(0, 3);

  const worstAxis = axes.reduce(
    (worst, axis) => (worst === null || axis.exposure > worst.exposure ? axis : worst),
    null
  );

  return {
    profile,
    earned: Math.round(earned * 100) / 100,
    available: Math.round(available * 100) / 100,
    rawPercent,
    percent,
    capped,
    completed: done.size,
    total: CHECKLIST.length,
    band: band.id,
    bandLabel: band.label,
    bandHint: band.hint,
    remaining,
    missingCritical,
    axes,
    groups,
    nextActions,
    worstAxis,
  };
}

/**
 * The shortest route from the current state to a target score.
 *
 * Greedy by effective weight, except that every open critical control is forced
 * in first whenever the target sits above CRITICAL_CAP_PERCENT — without them
 * the cap makes the target unreachable however many other boxes are ticked.
 *
 * @param {string[]} doneIds completed control ids.
 * @param {number} targetPercent desired score, 0-100.
 * @param {string} [profileId] id from PROFILES.
 */
export function planToTarget(doneIds, targetPercent, profileId) {
  const current = scoreChecklist(doneIds, profileId);
  if (current.error) return current;

  const target = Number(targetPercent);
  if (!Number.isFinite(target)) {
    return { error: "Enter a target score as a number between 0 and 100." };
  }
  if (target < 0 || target > 100) {
    return { error: "A target score has to be between 0 and 100." };
  }
  if (current.percent >= target) {
    return { reached: true, steps: [], projectedPercent: current.percent };
  }

  const profile = current.profile;
  const picked = [];
  const pickedIds = new Set();
  const base = doneIds.filter((id) => typeof id === "string");

  if (target > CRITICAL_CAP_PERCENT) {
    for (const item of current.missingCritical) {
      picked.push(item);
      pickedIds.add(item.id);
    }
  }

  const pool = current.remaining
    .filter((item) => !pickedIds.has(item.id))
    .slice()
    .sort((a, b) => effectiveWeight(b, profile) - effectiveWeight(a, profile));

  for (const item of pool) {
    const soFar = scoreChecklist([...base, ...picked.map((entry) => entry.id)], profileId);
    if (soFar.percent >= target) break;
    picked.push(item);
    pickedIds.add(item.id);
  }

  const projected = scoreChecklist([...base, ...picked.map((item) => item.id)], profileId);

  return {
    reached: projected.percent >= target,
    steps: picked,
    projectedPercent: projected.percent,
  };
}
