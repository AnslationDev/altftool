/**
 * Android Privacy Settings Checklist — exposure scoring logic.
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
  "name": "Android",
  "settingsRoot": "Settings > Security and privacy (called Privacy on some versions), plus Settings > Location, Settings > Apps, and the Google section under Settings > Google > Manage your Google Account > Data & privacy.",
  "note": "Android settings are split between the operating system and your Google account, and manufacturers rename the menus — Samsung, Pixel, Xiaomi and OnePlus all label these differently, so follow the description rather than hunting for an exact label."
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
    "id": "delete-advertising-id",
    "group": "Advertising and account data",
    "axis": "Tracking identifiers",
    "title": "Delete the advertising ID rather than only resetting it",
    "detail": "Android now lets you delete the advertising ID outright, not just reset it. Deleting returns a string of zeros to every app that asks, which is a much stronger control than a reset — a reset simply issues a fresh identifier that starts profiling you again.",
    "path": "Settings > Security and privacy > More privacy settings > Ads > Delete advertising ID",
    "risk": "Every app on the phone shares one identifier for you, joining your behaviour across all of them.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "web-app-activity",
    "group": "Advertising and account data",
    "axis": "Tracking identifiers",
    "title": "Turn off or auto-delete Web & App Activity",
    "detail": "This is the largest single store of data Google holds about you: searches, apps opened, and — if the sub-option is on — Chrome history and in-app activity. If you will not switch it off, set auto-delete to the shortest available period so it stops accumulating indefinitely.",
    "path": "Settings > Google > Manage your Google Account > Data & privacy > Web & App Activity",
    "risk": "Every search, app launch and page you visit accumulates in one account-level history.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "location-history",
    "group": "Advertising and account data",
    "axis": "Location exposure",
    "title": "Turn off Location History / Timeline and delete what exists",
    "detail": "Timeline reconstructs everywhere you have been, when, and how you travelled. Newer Android versions keep it on the device rather than the account, which helps, but it remains the most sensitive record your phone builds — turning it off and deleting the existing history are two separate actions.",
    "path": "Settings > Location > Location services > Google Location History / Timeline",
    "risk": "A map of your home, workplace, clinic visits and overnight stays, going back years.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "ad-personalisation",
    "group": "Advertising and account data",
    "axis": "Tracking identifiers",
    "title": "Turn off ad personalisation in your Google account",
    "detail": "Separate from the device advertising ID, this governs whether Google builds and uses an interest profile for you across its services. The same page lists the interests it has inferred, which is worth reading once.",
    "path": "Settings > Google > Manage your Google Account > Data & privacy > My Ad Centre",
    "risk": "An inferred profile of your age, income bracket, health interests and relationship status drives what you are shown.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "usage-diagnostics",
    "group": "Advertising and account data",
    "axis": "Tracking identifiers",
    "title": "Turn off usage and diagnostics reporting",
    "detail": "This sends device and app usage telemetry to Google continuously. Manufacturers add their own equivalent — Samsung's customisation service, Xiaomi's user experience programme — and each has to be switched off separately.",
    "path": "Settings > Google > Usage & diagnostics, and your manufacturer's equivalent",
    "risk": "Continuous telemetry about how you use the device flows to both Google and your handset maker.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "manufacturer-account",
    "group": "Advertising and account data",
    "axis": "Tracking identifiers",
    "title": "Audit the manufacturer account and its ad settings",
    "detail": "A Samsung, Xiaomi or Honor account runs a second, parallel data pipeline with its own advertising, personalisation and cloud backup settings that the Google ones do not cover. Many people never open it.",
    "path": "Settings > Accounts > your manufacturer account > Privacy / Customisation service",
    "risk": "A second vendor profile of you exists that none of your Google privacy changes touched.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "precise-location-per-app",
    "group": "Location",
    "axis": "Location exposure",
    "title": "Give apps approximate location instead of precise",
    "detail": "Android lets you downgrade any app to approximate location, which is accurate to roughly a neighbourhood rather than a doorstep. Weather, news, shopping and most social apps work perfectly on approximate; almost nothing except navigation genuinely needs precise.",
    "path": "Settings > Location > App location permissions > per app > Use precise location",
    "risk": "A shopping or news app receives your exact coordinates, accurate enough to identify your front door.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "background-location",
    "group": "Location",
    "axis": "Location exposure",
    "title": "Remove all-the-time location from every app that does not need it",
    "detail": "The gap between While using and Allow all the time is enormous: all-the-time access means an app builds a continuous movement trace whether you have opened it or not. Very few apps have a legitimate case for it.",
    "path": "Settings > Location > App location permissions > per app > Allow all the time",
    "risk": "An app you open twice a month records where you are every few minutes, permanently.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "wifi-bluetooth-scanning",
    "group": "Location",
    "axis": "Location exposure",
    "title": "Turn off Wi-Fi and Bluetooth scanning",
    "detail": "These two switches let apps and services scan for nearby networks and devices to improve location accuracy even when Wi-Fi and Bluetooth are switched off. They are buried and on by default, and they are how a phone with location disabled still gets positioned.",
    "path": "Settings > Location > Location services > Wi-Fi scanning / Bluetooth scanning",
    "risk": "Your position is still derived from surrounding networks after you thought you turned location off.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "emergency-location",
    "group": "Location",
    "axis": "Location exposure",
    "title": "Understand what emergency location sharing does",
    "detail": "Emergency Location Service sends your position to emergency responders when you dial an emergency number, regardless of your location settings. This is a feature worth keeping — the point is knowing it exists rather than being surprised by it.",
    "path": "Settings > Location > Location services > Emergency Location Service",
    "risk": "Not a leak, but a genuine exception to your location settings that you should know about.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "location-quick-toggle",
    "group": "Location",
    "axis": "Location exposure",
    "title": "Keep the location quick-settings tile to hand",
    "detail": "The most reliable location control is the master switch, used deliberately when you go somewhere you would rather not have logged. Putting the tile in the quick-settings panel makes that a one-swipe action.",
    "path": "Swipe down twice > pencil icon > drag the Location tile into the visible set",
    "risk": "Turning location off is buried enough that you never do it when it would actually matter.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "permission-manager-sweep",
    "group": "App permissions",
    "axis": "App permissions",
    "title": "Sweep the Permission Manager category by category",
    "detail": "The Permission Manager groups apps by what they can reach rather than listing permissions per app, which makes outliers obvious: read the camera, microphone, contacts, SMS, call log and files lists and revoke anything that has no business being there.",
    "path": "Settings > Security and privacy > Privacy > Permission manager",
    "risk": "A game or a torch app holds standing access to your contacts, messages and microphone.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "unused-app-permissions",
    "group": "App permissions",
    "axis": "App permissions",
    "title": "Turn on automatic permission removal for unused apps",
    "detail": "Android can revoke permissions, stop notifications and clear temporary files for apps you have not opened in a few months. It handles the long tail of forgotten apps without you having to remember them.",
    "path": "Settings > Apps > per app > Unused app settings, or App info > Pause app activity if unused",
    "risk": "Apps you stopped using years ago keep every permission you granted them on day one.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "camera-mic-toggles",
    "group": "App permissions",
    "axis": "App permissions",
    "title": "Add the camera and microphone kill switches to quick settings",
    "detail": "Android's system-wide camera and microphone toggles cut hardware access for every app at once, overriding individual permissions. Combined with the green indicator dot that shows when either is active, this is the strongest control on the phone.",
    "path": "Quick settings > edit > add Camera access and Mic access tiles",
    "risk": "You have no fast way to guarantee nothing is recording during a sensitive conversation.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "accessibility-abuse",
    "group": "App permissions",
    "axis": "App permissions",
    "title": "Check which apps hold Accessibility and Device Admin access",
    "detail": "Accessibility service access lets an app read everything on screen and act on your behalf, which is why it is the permission that banking malware and stalkerware both target. Unless an app exists to provide accessibility, it should not be on this list.",
    "path": "Settings > Accessibility > Installed apps, and Settings > Security > Device admin apps",
    "risk": "An app can read every screen you open, including banking sessions and messages, and tap on your behalf.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "notification-access",
    "group": "App permissions",
    "axis": "App permissions",
    "title": "Review notification access and usage-data access",
    "detail": "Notification access lets an app read the content of every notification, including two-factor codes and message previews. Usage access reveals which apps you open and for how long. Both are separate from normal permissions and easy to miss.",
    "path": "Settings > Notifications > Device & app notifications, and Settings > Apps > Special app access",
    "risk": "An app reads your incoming two-factor codes and message previews as they arrive.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "install-unknown-apps",
    "group": "App permissions",
    "axis": "App permissions",
    "title": "Restrict install-unknown-apps and keep Play Protect on",
    "detail": "Sideloading permission is granted per source and is usually left on for a browser or a messaging app long after the one APK it was needed for. Play Protect scanning is the baseline check on what is already installed.",
    "path": "Settings > Apps > Special app access > Install unknown apps, and Play Store > Play Protect",
    "risk": "A link in a message can install an app because you granted the browser permission months ago.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "nearby-share-visibility",
    "group": "Sharing and connectivity",
    "axis": "Wireless exposure",
    "title": "Set Quick Share / Nearby Share visibility to Contacts or Hidden",
    "detail": "Left visible to everyone, your device name appears to any nearby phone and anyone in range can send you a file. On public transport and at events this is the route used for unsolicited images, and the device name often contains your real name.",
    "path": "Settings > Google > Devices & sharing > Quick Share / Nearby Share > Device visibility",
    "risk": "Strangers on a train see your device name and can push unsolicited images at you.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "device-name",
    "group": "Sharing and connectivity",
    "axis": "Wireless exposure",
    "title": "Rename the device so it does not carry your real name",
    "detail": "The default device name is usually your first name and handset model, and it is broadcast over Bluetooth, Wi-Fi Direct, hotspot and casting. Changing it to something neutral stops your name appearing on every device list in range.",
    "path": "Settings > About phone > Device name, and Settings > Connections > Bluetooth > Device name",
    "risk": "Your first name and phone model are visible to every Bluetooth device in the room.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "wifi-auto-connect",
    "group": "Sharing and connectivity",
    "axis": "Wireless exposure",
    "title": "Turn off auto-connect to open networks and forget old ones",
    "detail": "A phone that automatically joins open Wi-Fi will join an attacker's network with a familiar name. Removing saved networks you no longer use also stops the phone probing for them, which is one way a device is tracked between locations.",
    "path": "Settings > Network & internet > Internet > Network preferences > Connect to open networks / Saved networks",
    "risk": "Your phone joins a spoofed hotspot automatically, or advertises the networks you have visited.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "private-dns",
    "group": "Sharing and connectivity",
    "axis": "Wireless exposure",
    "title": "Turn on Private DNS",
    "detail": "Private DNS encrypts your domain lookups so the network you are on — a café, a hotel, your mobile operator — cannot read or trivially alter which sites you visit. It applies system-wide rather than per browser.",
    "path": "Settings > Network & internet > Private DNS",
    "risk": "Whoever runs the network you are on sees every domain you look up.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "backup-encryption",
    "group": "Sharing and connectivity",
    "axis": "Wireless exposure",
    "title": "Check what Google backup is uploading, and whether it is end-to-end encrypted",
    "detail": "Android backup can include app data, SMS, call history, Wi-Fi passwords and device settings. Backups are protected with your device screen lock, so a weak PIN weakens the backup too — and the manufacturer's separate cloud backup has its own settings again.",
    "path": "Settings > Google > Backup, and your manufacturer's cloud backup settings",
    "risk": "Your messages, call log and saved Wi-Fi passwords sit in a cloud backup protected by a four-digit PIN.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "screen-lock-strength",
    "group": "Device and lock screen security",
    "axis": "Device security",
    "title": "Use a long PIN or passphrase, not a pattern",
    "detail": "Patterns are guessable from the smudge on the screen and from a single glance over your shoulder, and the realistic pattern space is far smaller than it looks. A six-digit-plus PIN or an alphanumeric passphrase is the base that disk encryption and backup protection both rest on.",
    "path": "Settings > Security and privacy > Screen lock",
    "risk": "Someone who watched you unlock once, or looked at the smudges, is into the phone and its backups.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "lock-screen-notifications",
    "group": "Device and lock screen security",
    "axis": "Device security",
    "title": "Hide sensitive notification content on the lock screen",
    "detail": "By default message text and two-factor codes render on the lock screen, so they are readable without unlocking the phone at all — including by someone who has taken it and cannot get past the PIN.",
    "path": "Settings > Notifications > Notifications on lock screen > Hide sensitive content",
    "risk": "A two-factor code needed to take over your accounts is readable on a locked phone.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "lock-screen-controls",
    "group": "Device and lock screen security",
    "axis": "Device security",
    "title": "Restrict what the assistant and quick settings can do while locked",
    "detail": "A locked phone will often still answer the voice assistant, read messages aloud, or let quick settings be pulled down and toggled. Each of those is a way around the lock screen for someone holding your phone.",
    "path": "Settings > Security and privacy > More security settings > Lock screen, and Assistant > Lock screen responses",
    "risk": "Someone holding your locked phone asks the assistant to read your messages out loud.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "find-my-device",
    "group": "Device and lock screen security",
    "axis": "Device security",
    "title": "Turn on Find My Device and confirm remote wipe works",
    "detail": "This is the control that turns a lost phone into an inconvenience rather than a breach. Confirm it is enabled and that you know how to reach it from another device before you need it.",
    "path": "Settings > Google > All services > Find My Device",
    "risk": "A lost or stolen phone cannot be located, locked or wiped remotely.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "security-updates",
    "group": "Device and lock screen security",
    "axis": "Device security",
    "title": "Check the security patch date and the support window",
    "detail": "Look at the actual security patch level, not the Android version. A handset past its support window stops receiving patches entirely, and no privacy setting compensates for unpatched vulnerabilities — that is the point at which replacement is the security measure.",
    "path": "Settings > About phone > Android version > Android security update",
    "risk": "The phone is months or years behind on patches and cannot be fixed by any setting.",
    "weight": 4,
    "critical": false
  }
];

/** Reporting order of the on-screen sections. */
export const GROUPS = [
  "Advertising and account data",
  "Location",
  "App permissions",
  "Sharing and connectivity",
  "Device and lock screen security"
];

/** Exposure axes, in reporting order. */
export const AXES = [
  "Tracking identifiers",
  "Location exposure",
  "App permissions",
  "Wireless exposure",
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
    "name": "Everyday personal phone",
    "description": "A balanced pass over a phone you use for everything. Location and permissions carry a little extra weight.",
    "multipliers": {
      "Tracking identifiers": 1.1,
      "Location exposure": 1.2,
      "App permissions": 1.2,
      "Wireless exposure": 1,
      "Device security": 1.1
    }
  },
  {
    "id": "minimal-google",
    "name": "Minimising what Google collects",
    "description": "The account-level history and the advertising identifiers dominate the score; lock screen details matter less.",
    "multipliers": {
      "Tracking identifiers": 1.8,
      "Location exposure": 1.5,
      "App permissions": 1.1,
      "Wireless exposure": 0.9,
      "Device security": 0.8
    }
  },
  {
    "id": "safety",
    "name": "Worried about being tracked by someone you know",
    "description": "Weighted hardest towards location, accessibility and admin access, lock screen leaks and backups — the routes stalkerware and shared accounts actually use.",
    "multipliers": {
      "Location exposure": 1.7,
      "Tracking identifiers": 0.8,
      "App permissions": 1.6,
      "Wireless exposure": 1.1,
      "Device security": 1.6
    }
  },
  {
    "id": "travel",
    "name": "Travelling or crossing borders",
    "description": "What a phone broadcasts and what is readable if it is taken from you come first. Wireless exposure and device security lead.",
    "multipliers": {
      "Tracking identifiers": 1,
      "Location exposure": 1.2,
      "App permissions": 1.1,
      "Wireless exposure": 1.6,
      "Device security": 1.6
    }
  },
  {
    "id": "balanced",
    "name": "Balanced (no re-weighting)",
    "description": "Every setting counts at its base weight, with no profile emphasis applied.",
    "multipliers": {
      "Tracking identifiers": 1,
      "Location exposure": 1,
      "App permissions": 1,
      "Wireless exposure": 1,
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
    "label": "Locked down",
    "hint": "The phone gives away little to apps, to nearby devices or to anyone holding it."
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
    "hint": "The visible switches are done; the buried scanning and permission grants are not."
  },
  {
    "id": "open",
    "min": 0,
    "label": "Factory defaults",
    "hint": "Precise location, a shared ad ID and years of account history are all running."
  }
];

const byId = new Map(CHECKLIST.map((item) => [item.id, item]));
const profileById = new Map(PROFILES.map((item) => [item.id, item]));

/** Ids pre-ticked at first paint. */
export const DEFAULT_DONE = [
  "find-my-device",
  "emergency-location"
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
