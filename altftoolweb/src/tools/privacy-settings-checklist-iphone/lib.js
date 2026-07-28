/**
 * iPhone Privacy Settings Checklist — exposure scoring logic.
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
  "name": "iPhone",
  "settingsRoot": "Settings > Privacy & Security for tracking, location and per-sensor access; Settings > [your name] for iCloud and sharing; Settings > Face ID & Passcode for what is reachable while locked.",
  "note": "Two of the highest-risk items on an iPhone are not in the Privacy menu at all: Significant Locations is buried four levels deep under Location Services, and lock screen access is under Face ID & Passcode."
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
    "id": "app-tracking-transparency",
    "group": "Tracking and advertising",
    "axis": "Cross-app tracking",
    "title": "Turn off “Allow Apps to Request to Track”",
    "detail": "This master switch denies every app the identifier used to follow you across other companies' apps and websites, and stops the permission prompt appearing at all. It is a single switch that applies retroactively to apps you already granted.",
    "path": "Settings > Privacy & Security > Tracking > Allow Apps to Request to Track",
    "risk": "Apps share a common identifier for you, joining your behaviour across unrelated companies.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "apple-personalised-ads",
    "group": "Tracking and advertising",
    "axis": "Cross-app tracking",
    "title": "Turn off Apple's own personalised ads",
    "detail": "Apple runs its own ad platform in the App Store, News and Stocks, and it is governed by a separate setting from App Tracking Transparency. Turning off tracking for third parties does nothing to this one.",
    "path": "Settings > Privacy & Security > Apple Advertising > Personalised Ads",
    "risk": "Apple builds its own interest segment for you even after you switched off third-party tracking.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "analytics-sharing",
    "group": "Tracking and advertising",
    "axis": "Cross-app tracking",
    "title": "Turn off iPhone analytics and app analytics sharing",
    "detail": "Analytics sharing sends usage and diagnostic data to Apple and, separately, to individual app developers. Both live on the same screen and both are on for many people who tapped through setup quickly.",
    "path": "Settings > Privacy & Security > Analytics & Improvements",
    "risk": "Usage and diagnostic detail about how you use the phone flows to Apple and to app developers.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "safari-tracking",
    "group": "Tracking and advertising",
    "axis": "Cross-app tracking",
    "title": "Turn on Safari's tracking prevention and hide your IP address",
    "detail": "Safari can block cross-site trackers and hide your IP address from known trackers, which removes the two main ways sites follow you between domains. Check it whether or not you use Safari as your default, because in-app web views use it.",
    "path": "Settings > Apps > Safari > Prevent Cross-Site Tracking / Hide IP Address",
    "risk": "Sites follow you across the web by IP address and third-party cookies.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "mail-privacy-protection",
    "group": "Tracking and advertising",
    "axis": "Cross-app tracking",
    "title": "Turn on Mail Privacy Protection",
    "detail": "Tracking pixels in email report when you opened a message, how often, and from which IP address — that is, roughly where you were. Mail Privacy Protection loads remote content through a proxy so the sender learns neither.",
    "path": "Settings > Apps > Mail > Privacy Protection",
    "risk": "Every marketing email reports when you read it and roughly where you were at the time.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "significant-locations",
    "group": "Location",
    "axis": "Location exposure",
    "title": "Turn off Significant Locations and clear the history",
    "detail": "This is the most surprising thing on an iPhone: it keeps a detailed, timestamped log of the places you visit regularly, buried four menu levels deep. It is encrypted and stays on the device, but anyone who knows your passcode can read your movement history from it in under a minute.",
    "path": "Settings > Privacy & Security > Location Services > System Services > Significant Locations",
    "risk": "A dated log of your home, work, clinic and overnight stays is readable by anyone with your passcode.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "precise-location-per-app",
    "group": "Location",
    "axis": "Location exposure",
    "title": "Turn off Precise Location for apps that do not need it",
    "detail": "Precise Location is a per-app switch that downgrades an app to an approximate area of several square kilometres. Weather, news, shopping and social apps all work on approximate; navigation and ride-hailing are the real exceptions.",
    "path": "Settings > Privacy & Security > Location Services > per app > Precise Location",
    "risk": "A shopping or social app receives coordinates accurate enough to identify your front door.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "always-allow-location",
    "group": "Location",
    "axis": "Location exposure",
    "title": "Downgrade every app from Always to While Using",
    "detail": "Always means an app can request your position when it is not open, building a continuous movement trace. iOS periodically reminds you which apps have used background location — those prompts are worth reading rather than dismissing.",
    "path": "Settings > Privacy & Security > Location Services > per app > Always",
    "risk": "An app you rarely open records where you are around the clock.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "system-services-location",
    "group": "Location",
    "axis": "Location exposure",
    "title": "Prune System Services location and turn off the status bar exception",
    "detail": "System Services holds a dozen separate location consumers — location-based Apple ads, suggestions, alerts and iPhone Analytics. Turning on the status bar icon for system services is what makes any of them visible when they run.",
    "path": "Settings > Privacy & Security > Location Services > System Services",
    "risk": "System-level features use your location invisibly, with no icon to show it is happening.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "photo-location-metadata",
    "group": "Location",
    "axis": "Location exposure",
    "title": "Strip location from photos before you share them",
    "detail": "iOS embeds GPS coordinates in photos by default. The share sheet has a per-share Options control where you can turn Location off, which is better than disabling camera location entirely if you still want your own library organised by place.",
    "path": "Share sheet > Options > Location, or Settings > Privacy & Security > Location Services > Camera",
    "risk": "A photo posted online carries the exact coordinates of where it was taken, including your home.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "find-my-sharing",
    "group": "iCloud and sharing",
    "axis": "Cloud & sharing",
    "title": "Audit who you are sharing your location with in Find My",
    "detail": "Location sharing set up for a trip or a relationship persists indefinitely and gives no ongoing reminder. Open the People tab and read the list — this is the single most common way one person keeps track of another entirely legitimately, and then keeps doing it.",
    "path": "Find My app > People tab, and Settings > [your name] > Find My > Share My Location",
    "risk": "Someone you shared your location with years ago still sees exactly where you are.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "icloud-shared-albums",
    "group": "iCloud and sharing",
    "axis": "Cloud & sharing",
    "title": "Review shared albums, shared notes and shared calendars",
    "detail": "Shared albums and calendars keep updating for everyone invited, so a photo added today reaches people you invited years ago. Family Sharing extends this to purchases, subscriptions and location by default.",
    "path": "Photos > Albums > Shared Albums; Calendar > shared calendars; Settings > Family Sharing",
    "risk": "New photos and calendar entries keep flowing to people you forgot were on the invite list.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "advanced-data-protection",
    "group": "iCloud and sharing",
    "axis": "Cloud & sharing",
    "title": "Turn on Advanced Data Protection for iCloud",
    "detail": "Standard iCloud leaves several categories — including iCloud Backup, which contains your Messages — encrypted with keys Apple holds. Advanced Data Protection extends end-to-end encryption to almost all of it, at the cost that losing your recovery key or contact means losing the data permanently. Set up recovery before enabling it.",
    "path": "Settings > [your name] > iCloud > Advanced Data Protection",
    "risk": "Your backup, which includes your message history, is readable by Apple and by anyone who compels Apple.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "icloud-backup-contents",
    "group": "iCloud and sharing",
    "axis": "Cloud & sharing",
    "title": "Check which apps back up to iCloud",
    "detail": "iCloud Backup is per app, and messaging apps that are end-to-end encrypted in transit often keep a plain backup in iCloud. That backup is frequently the weakest link in an otherwise well-protected conversation.",
    "path": "Settings > [your name] > iCloud > Manage Account Storage > Backups",
    "risk": "An encrypted messenger's entire history sits in a cloud backup outside its own protection.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "hide-my-email",
    "group": "iCloud and sharing",
    "axis": "Cloud & sharing",
    "title": "Use Hide My Email and Sign in with Apple for new accounts",
    "detail": "A unique forwarding address per service means a breach or a data sale cannot match you across companies, and you can switch off a leaking address without changing your real one. It is the cheapest privacy win on the platform.",
    "path": "Settings > [your name] > iCloud > Hide My Email",
    "risk": "One email address links every account you own across every breach database.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "airdrop-receiving",
    "group": "iCloud and sharing",
    "axis": "Cloud & sharing",
    "title": "Set AirDrop to Contacts Only",
    "detail": "Everyone-for-ten-minutes is the modern default and it expires on its own, but a phone left on Everyone will accept unsolicited images from anyone in range. On public transport this is the exact mechanism used for indecent-image harassment.",
    "path": "Settings > General > AirDrop",
    "risk": "Anyone within range can push an unsolicited image onto your screen.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "lock-screen-access",
    "group": "Lock screen and physical access",
    "axis": "Physical access",
    "title": "Turn off Control Centre, Wallet and Siri access while locked",
    "detail": "The Face ID & Passcode screen lists everything reachable without unlocking. Control Centre while locked lets someone enable Aeroplane Mode and cut off Find My before you can locate a stolen phone, which is the first thing a thief does.",
    "path": "Settings > Face ID & Passcode > Allow Access When Locked",
    "risk": "A thief switches on Aeroplane Mode from the lock screen and your phone drops off Find My instantly.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "notification-previews",
    "group": "Lock screen and physical access",
    "axis": "Physical access",
    "title": "Set notification previews to When Unlocked",
    "detail": "With previews always on, message text and two-factor codes render on the lock screen. That is enough for someone holding your phone to complete a password reset without ever unlocking it.",
    "path": "Settings > Notifications > Show Previews > When Unlocked",
    "risk": "A two-factor code needed to take over your accounts is readable on the locked screen.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "stolen-device-protection",
    "group": "Lock screen and physical access",
    "axis": "Physical access",
    "title": "Turn on Stolen Device Protection",
    "detail": "This exists specifically because thieves watch you type your passcode before taking the phone. With it on, sensitive changes away from familiar locations require Face ID with no passcode fallback, plus an hour's delay — which is what stops a stolen phone becoming a stolen Apple account.",
    "path": "Settings > Face ID & Passcode > Stolen Device Protection",
    "risk": "Someone who watched you type your passcode changes your Apple Account password and locks you out permanently.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "strong-passcode",
    "group": "Lock screen and physical access",
    "axis": "Physical access",
    "title": "Use a six-digit or alphanumeric passcode, not four digits",
    "detail": "The passcode is what protects device encryption, your keychain and Significant Locations. Four digits is 10,000 combinations and trivially shoulder-surfed; a custom alphanumeric code is a large step up for very little daily cost.",
    "path": "Settings > Face ID & Passcode > Change Passcode > Passcode Options",
    "risk": "A four-digit code seen once over your shoulder opens the phone, the keychain and your location history.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "usb-accessories",
    "group": "Lock screen and physical access",
    "axis": "Physical access",
    "title": "Keep USB Accessories off while locked",
    "detail": "This setting blocks data connections to accessories if the phone has been locked for over an hour, which is the control that frustrates forensic extraction devices. It is on by default and worth confirming rather than assuming.",
    "path": "Settings > Face ID & Passcode > USB Accessories",
    "risk": "A locked phone can be connected to extraction hardware over the data port.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "safety-check",
    "group": "Lock screen and physical access",
    "axis": "Physical access",
    "title": "Run Safety Check if someone may have had access to your phone",
    "detail": "Safety Check reviews everything you share with other people and every app with sensitive access, and its Emergency Reset revokes all of it at once. It was built for people leaving abusive relationships and it is the fastest way to close everything in a single pass.",
    "path": "Settings > Privacy & Security > Safety Check",
    "risk": "Sharing and access set up by someone else, or under pressure, keeps running invisibly.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "two-factor-apple",
    "group": "Account security",
    "axis": "Account security",
    "title": "Confirm two-factor authentication is on for your Apple Account",
    "detail": "The Apple Account is the master key: it reaches your backups, your photos, your Find My and your keychain. Two-factor is standard on newer accounts but not universal on older ones, so confirm rather than assume.",
    "path": "Settings > [your name] > Sign-In & Security > Two-Factor Authentication",
    "risk": "One reused password gives someone your photo library, your messages and the ability to wipe your devices.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "recovery-contact",
    "group": "Account security",
    "axis": "Account security",
    "title": "Set a recovery contact or recovery key",
    "detail": "Lockout is a real risk once you harden an account, and it is permanent — Apple cannot recover an end-to-end encrypted account for you. A recovery contact or a recovery key you have stored offline is what makes the rest of this list safe to do.",
    "path": "Settings > [your name] > Sign-In & Security > Account Recovery",
    "risk": "You harden the account, then lose access to it, and nobody can restore your data.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "trusted-devices",
    "group": "Account security",
    "axis": "Account security",
    "title": "Review the device list on your Apple Account",
    "detail": "Every device signed into your Apple Account can receive two-factor codes and reach iCloud data. Old phones, a partner's iPad and a sold Mac all linger here until they are removed.",
    "path": "Settings > [your name] > scroll to the device list",
    "risk": "A device you no longer own still receives your two-factor codes.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "app-privacy-report",
    "group": "Account security",
    "axis": "Account security",
    "title": "Turn on App Privacy Report and read it once a month",
    "detail": "The report shows which apps actually used your camera, microphone, location and contacts, and which domains they contacted. It is the only way to find out that an app is doing something its description never mentioned.",
    "path": "Settings > Privacy & Security > App Privacy Report",
    "risk": "You have no evidence of what your apps are really doing, only what they claim.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "lockdown-mode",
    "group": "Account security",
    "axis": "Account security",
    "title": "Consider Lockdown Mode if you are a likely target",
    "detail": "Lockdown Mode strips out the attack surface used by mercenary spyware — most message attachment types, some web technologies, incoming FaceTime from strangers, wired connections. It is deliberately restrictive and is aimed at journalists, activists and officials, not at general use.",
    "path": "Settings > Privacy & Security > Lockdown Mode",
    "risk": "A targeted, zero-click exploit reaches attack surface that most people never need enabled.",
    "weight": 2,
    "critical": false
  }
];

/** Reporting order of the on-screen sections. */
export const GROUPS = [
  "Tracking and advertising",
  "Location",
  "iCloud and sharing",
  "Lock screen and physical access",
  "Account security"
];

/** Exposure axes, in reporting order. */
export const AXES = [
  "Cross-app tracking",
  "Location exposure",
  "Cloud & sharing",
  "Physical access",
  "Account security"
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
    "name": "Everyday personal iPhone",
    "description": "A balanced pass over a phone you use for everything. Tracking and location carry slightly more weight.",
    "multipliers": {
      "Cross-app tracking": 1.2,
      "Location exposure": 1.2,
      "Cloud & sharing": 1.1,
      "Physical access": 1,
      "Account security": 1.1
    }
  },
  {
    "id": "safety",
    "name": "Worried someone close has access",
    "description": "Weighted hardest towards Find My sharing, Significant Locations, lock screen leaks and Safety Check — the routes someone who knows your passcode actually uses.",
    "multipliers": {
      "Cross-app tracking": 0.6,
      "Location exposure": 1.7,
      "Cloud & sharing": 1.6,
      "Physical access": 1.6,
      "Account security": 1.3
    }
  },
  {
    "id": "theft",
    "name": "Protecting against phone theft",
    "description": "Stolen Device Protection, lock screen access and the passcode dominate. Ad tracking barely matters when the phone is in someone else's hand.",
    "multipliers": {
      "Cross-app tracking": 0.5,
      "Location exposure": 0.9,
      "Cloud & sharing": 1.1,
      "Physical access": 1.8,
      "Account security": 1.5
    }
  },
  {
    "id": "high-risk",
    "name": "Journalist, activist or likely target",
    "description": "End-to-end encryption, attack surface and account security lead. Assumes a capable adversary rather than an advertiser.",
    "multipliers": {
      "Cross-app tracking": 0.9,
      "Location exposure": 1.4,
      "Cloud & sharing": 1.6,
      "Physical access": 1.4,
      "Account security": 1.6
    }
  },
  {
    "id": "balanced",
    "name": "Balanced (no re-weighting)",
    "description": "Every setting counts at its base weight, with no profile emphasis applied.",
    "multipliers": {
      "Cross-app tracking": 1,
      "Location exposure": 1,
      "Cloud & sharing": 1,
      "Physical access": 1,
      "Account security": 1
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
    "hint": "Little leaves the phone, and little is reachable by someone holding it."
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
    "hint": "The Privacy menu is done; the buried location and lock screen settings are not."
  },
  {
    "id": "open",
    "min": 0,
    "label": "Factory defaults",
    "hint": "Significant Locations, precise location and lock screen previews are all still running."
  }
];

const byId = new Map(CHECKLIST.map((item) => [item.id, item]));
const profileById = new Map(PROFILES.map((item) => [item.id, item]));

/** Ids pre-ticked at first paint. */
export const DEFAULT_DONE = [
  "usb-accessories",
  "two-factor-apple"
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
