/**
 * Google Account Privacy Checklist — exposure scoring logic.
 *
 * Pure module: no React, no DOM, no clocks. Same input, same output. Every
 * exported function is total — unusable input returns { error } rather than
 * NaN, Infinity or a misleading score.
 *
 * The model is deliberately not "count the ticked boxes". Each control sits on
 * one exposure AXIS, and a risk profile re-weights those axes, because
 * a parent tightening a family account and a journalist reducing what can be subpoenaed need opposite orderings: one cares most about what others can see, the other about what is retained at all.
 */

/** Where the settings live, for the on-page instructions. */
export const PLATFORM = {
  "name": "Google",
  "settingsRoot": "myaccount.google.com is the hub. Activity controls live under Data and privacy, retention under myactivity.google.com, ads under My Ad Center, and device and app access under Security.",
  "note": "Google keeps its privacy controls on four separate pages — Data and privacy, My Activity, My Ad Center and Security — so a setting missing from one is usually on another."
};

/**
 * The checklist.
 *
 * axis     = which kind of exposure the control closes.
 * weight   = share of the 100 base points the control carries, ranked by how
 *            much real exposure it removes.
 * critical = skipping this one leaves an exposure the other controls cannot
 *            compensate for, so it caps the score (CRITICAL_CAP_PERCENT).
 * path     = where the setting sits in the app.
 * risk     = the concrete thing that happens if you leave it as-is.
 */
export const CHECKLIST = [
  {
    "id": "web-app-activity",
    "group": "Activity controls",
    "axis": "Activity & history",
    "title": "Review or pause Web & App Activity",
    "detail": "This is the master switch for search queries, Maps searches, Assistant requests and app usage. Pausing it stops new records; it does not delete what is already stored, which is a separate action.",
    "path": "myaccount.google.com > Data and privacy > Web & App Activity",
    "risk": "Every search you have ever run is stored against your name, searchable by you and disclosable on a lawful request.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "auto-delete",
    "group": "Activity controls",
    "axis": "Activity & history",
    "title": "Set auto-delete to the shortest option",
    "detail": "Auto-delete offers 3, 18 or 36 months. Three months is the shortest available and applies rolling deletion from then on. New accounts default to 18 months, but long-standing accounts often still have it switched off entirely.",
    "path": "myaccount.google.com > Data and privacy > Web & App Activity > Auto-delete",
    "risk": "Activity accumulates indefinitely because an account created years ago never got the newer default.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "include-audio",
    "group": "Activity controls",
    "axis": "Activity & history",
    "title": "Turn off the audio and video recordings sub-setting",
    "detail": "A sub-toggle inside Web & App Activity decides whether the actual audio of your Assistant requests is kept, not just the transcript. It is separate from the main switch and is the most sensitive item on this page.",
    "path": "myaccount.google.com > Data and privacy > Web & App Activity > Include audio and video activity",
    "risk": "Recordings of your voice, including anything picked up by a mistaken wake word, are stored on your account.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "include-chrome",
    "group": "Activity controls",
    "axis": "Activity & history",
    "title": "Turn off the Chrome history sub-setting",
    "detail": "A second sub-toggle folds your Chrome browsing and activity from sites and apps that use Google services into the same record. Switching it off narrows Web & App Activity to Google's own products.",
    "path": "myaccount.google.com > Data and privacy > Web & App Activity > Include Chrome history",
    "risk": "Every site you visit in Chrome, not just Google searches, is added to your account activity record.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "youtube-history",
    "group": "Activity controls",
    "axis": "Activity & history",
    "title": "Set YouTube search and watch history retention",
    "detail": "YouTube History is a separate control with its own 3, 18 or 36-month auto-delete. Pausing it stops recommendations improving, so auto-delete at three months is usually the better trade.",
    "path": "myaccount.google.com > Data and privacy > YouTube History",
    "risk": "A complete record of what you watch, including health, political and religious content, is kept indefinitely.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "gemini-activity",
    "group": "Activity controls",
    "axis": "Activity & history",
    "title": "Check Gemini Apps Activity and its retention",
    "detail": "AI assistant conversations are stored under their own activity setting, and human reviewers may read a sample of them. Google's own guidance is not to enter anything confidential; turning the setting off still leaves conversations retained for a short period for safety review.",
    "path": "myactivity.google.com/product/gemini",
    "risk": "Work documents, medical questions or personal details pasted into an AI chat are retained and may be read by a reviewer.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "delete-past-activity",
    "group": "Activity controls",
    "axis": "Activity & history",
    "title": "Delete the activity already stored",
    "detail": "Pausing a control only stops new records. Use Delete activity by > All time on My Activity to clear the backlog, which for a decade-old account is by far the larger volume.",
    "path": "myactivity.google.com > Delete activity by > All time",
    "risk": "You pause everything and assume you are done, while ten years of stored history stays exactly where it was.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "location-history",
    "group": "Location and devices",
    "axis": "Location & devices",
    "title": "Review Timeline (Location History) and its retention",
    "detail": "Location History was renamed Timeline and moved to on-device storage, with auto-delete defaulting to three months for migrated accounts. Check which it is on your account, because accounts that never completed the migration may still hold years of cloud-stored routes.",
    "path": "myaccount.google.com > Data and privacy > Location History / Timeline",
    "risk": "A minute-by-minute map of everywhere you have been for years sits on your account, exportable in one click.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "device-list",
    "group": "Location and devices",
    "axis": "Location & devices",
    "title": "Review signed-in devices and sign out the ones you do not recognise",
    "detail": "The device list shows every phone, tablet and browser session with the account signed in, including devices you sold. Signing one out revokes its access immediately.",
    "path": "myaccount.google.com > Security > Your devices",
    "risk": "A phone you sold or an old work laptop still holds a signed-in session with access to your mail and files.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "location-permission-os",
    "group": "Location and devices",
    "axis": "Location & devices",
    "title": "Set the operating-system location permission for Google apps",
    "detail": "The account-level setting and the phone permission are different things. Set Google, Maps and Chrome to 'while using the app' and switch precise location to approximate where you do not need turn-by-turn directions.",
    "path": "Phone Settings > Apps > Google / Maps > Permissions > Location",
    "risk": "Apps collect a continuous background location trace regardless of what the account-level setting says.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "find-my-device",
    "group": "Location and devices",
    "axis": "Location & devices",
    "title": "Decide how your device participates in the Find My Device network",
    "detail": "The network uses nearby Android devices to locate lost items, which means your phone reports on other people's trackers and theirs on yours. There are options for participation with and without network aggregation.",
    "path": "Phone Settings > Google > All services > Find My Device",
    "risk": "Your device contributes to and is visible within a crowd-sourced location network you never chose to join.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "my-ad-center",
    "group": "Ads and personalisation",
    "axis": "Ads & personalisation",
    "title": "Turn off personalised ads in My Ad Center",
    "detail": "One switch stops Google using your activity to pick ads across Search, YouTube and its partner network. You still see ads, but they are chosen by context rather than by a profile built from your history.",
    "path": "myadcenter.google.com",
    "risk": "Your searches, videos and routes are converted into an advertising profile that follows you across the web.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "sensitive-ad-categories",
    "group": "Ads and personalisation",
    "axis": "Ads & personalisation",
    "title": "Restrict sensitive ad categories",
    "detail": "My Ad Center lets you see fewer ads about alcohol, gambling, pregnancy and parenting, dating and weight loss. This works separately from personalisation and changes what appears on a shared screen.",
    "path": "myadcenter.google.com > Sensitive categories",
    "risk": "Ads about pregnancy, addiction or debt appear on your screen in front of family or colleagues.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "partner-ad-data",
    "group": "Ads and personalisation",
    "axis": "Ads & personalisation",
    "title": "Review which data sources feed your ads",
    "detail": "My Ad Center lists the activity types and linked services used to personalise ads and lets you switch them off one at a time, which is finer-grained than the master toggle.",
    "path": "myadcenter.google.com > Customise ads > Your data",
    "risk": "One Google product you barely use keeps supplying the signal that drives the ads you find intrusive.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "search-personalisation",
    "group": "Ads and personalisation",
    "axis": "Ads & personalisation",
    "title": "Check search personalisation and linked results",
    "detail": "Search results can be personalised from your history and from your own Gmail, Photos and Drive content. Turning personal results off keeps your private files out of what appears on the results page.",
    "path": "Google Search > Settings > Personal results",
    "risk": "A flight confirmation or a private document surfaces in your search results while you are screen-sharing.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "contact-discoverability",
    "group": "What others can see",
    "axis": "Sharing & visibility",
    "title": "Restrict who can find you by phone number and email",
    "detail": "Two separate settings decide whether someone who already has your number or address can match it to your Google profile, name and photo. Set both to a narrower audience than Anyone.",
    "path": "myaccount.google.com > People and sharing > Contact info you've saved / How people find you",
    "risk": "Anyone with your number from a leaked list can put a name and a face to it in seconds.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "drive-link-sharing",
    "group": "What others can see",
    "axis": "Sharing & visibility",
    "title": "Audit Drive files shared with 'Anyone with the link'",
    "detail": "Link-shared files stay open forever and are routinely indexed once the link is pasted anywhere public. Filter Drive by shared items and change the ones that no longer need to be open.",
    "path": "drive.google.com > Shared with me / My Drive > filter by sharing > Anyone with the link",
    "risk": "A spreadsheet of client details or a tax document sits at a public URL that anyone who finds it can open.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "about-me-visibility",
    "group": "What others can see",
    "axis": "Sharing & visibility",
    "title": "Set the audience for each profile field",
    "detail": "Name, photo, birthday, gender, phone and email each carry their own visibility setting. Birthday plus full name is a common building block for identity verification questions.",
    "path": "myaccount.google.com > Personal info > choose what others see",
    "risk": "Your date of birth and photo are visible to anyone who lands on your Google profile.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "photos-shared-links",
    "group": "What others can see",
    "axis": "Sharing & visibility",
    "title": "Expire old Google Photos shared links and albums",
    "detail": "A shared album link works for anyone who has it, indefinitely, and keeps working after you delete the message you sent it in. The sharing page lists every link you have created.",
    "path": "photos.google.com > Sharing > review each shared album and link",
    "risk": "A holiday album link shared in a group chat years ago is still live and still shows your children.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "maps-contributions",
    "group": "What others can see",
    "axis": "Sharing & visibility",
    "title": "Check your public Maps contributions",
    "detail": "Reviews and photos you post on Maps appear on a public profile under your name and photo, and a run of local reviews maps your neighbourhood precisely.",
    "path": "Google Maps > your profile > Contributions",
    "risk": "Reviews of your gym, your doctor and your local shop, all under your real name, place you on a map.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "youtube-public-lists",
    "group": "What others can see",
    "axis": "Sharing & visibility",
    "title": "Make YouTube subscriptions, playlists and likes private",
    "detail": "Subscriptions and playlists default to public on many accounts and appear on your channel page even if you have never uploaded a video.",
    "path": "youtube.com > Settings > Privacy",
    "risk": "Anyone who finds your channel reads what you subscribe to and what you have saved.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "two-step-verification",
    "group": "Account security",
    "axis": "Account security",
    "title": "Turn on 2-Step Verification and add a passkey",
    "detail": "A passkey or a hardware security key resists phishing in a way SMS codes do not, because the credential is bound to the site. Keep backup codes somewhere offline.",
    "path": "myaccount.google.com > Security > 2-Step Verification",
    "risk": "A single phished password gives someone your mail, which is the reset route into every other account you own.",
    "weight": 7,
    "critical": true
  },
  {
    "id": "third-party-access",
    "group": "Account security",
    "axis": "Account security",
    "title": "Revoke third-party apps connected to the account",
    "detail": "This page lists everything you ever signed into with Google, and what each one can read. Grants that include Gmail or Drive access are the ones to remove first.",
    "path": "myaccount.google.com > Security > Your connections to third-party apps and services",
    "risk": "A defunct app still holds read access to your entire mailbox or Drive.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "recovery-info",
    "group": "Account security",
    "axis": "Account security",
    "title": "Check the recovery phone and email are current",
    "detail": "Recovery details are how you get back in and, if they are stale, how someone else might. Remove an old work address or a number you no longer control.",
    "path": "myaccount.google.com > Security > Ways we can verify it's you",
    "risk": "Recovery routes point at an address or number someone else now controls.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "app-passwords",
    "group": "Account security",
    "axis": "Account security",
    "title": "Remove old app passwords",
    "detail": "App passwords bypass two-step verification entirely and were commonly created for old mail clients and printers. Each one is a standing credential that survives a password change.",
    "path": "myaccount.google.com > Security > App passwords",
    "risk": "A years-old app password still lets a device into your mailbox without any second factor.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "security-checkup",
    "group": "Account security",
    "axis": "Account security",
    "title": "Run the Security Checkup",
    "detail": "Google's own guided review lists recent sign-ins, connected devices, third-party access and saved passwords found in known breaches, in one pass.",
    "path": "myaccount.google.com/security-checkup",
    "risk": "A reused password already exposed in a breach stays in use because nothing flagged it.",
    "weight": 2,
    "critical": false
  }
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Activity controls",
  "Location and devices",
  "Ads and personalisation",
  "What others can see",
  "Account security"
];

/** Exposure axes, in reporting order. */
export const AXES = [
  "Activity & history",
  "Location & devices",
  "Ads & personalisation",
  "Sharing & visibility",
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
    "name": "Everyday personal account",
    "description": "Normal use. Retention and ad profiling are the main concerns.",
    "multipliers": {
      "Activity & history": 1.3,
      "Location & devices": 1.2,
      "Ads & personalisation": 1.1,
      "Sharing & visibility": 1,
      "Account security": 1.1
    }
  },
  {
    "id": "minimal-retention",
    "name": "Keep as little as possible",
    "description": "Retention first: history, recordings and location records outrank what other people can see.",
    "multipliers": {
      "Activity & history": 1.8,
      "Location & devices": 1.6,
      "Ads & personalisation": 1.1,
      "Sharing & visibility": 0.7,
      "Account security": 1
    }
  },
  {
    "id": "shared-screen",
    "name": "Shared device or family account",
    "description": "Someone else uses this screen. Ads, personal results and public profile fields carry the weight.",
    "multipliers": {
      "Activity & history": 1.1,
      "Location & devices": 0.9,
      "Ads & personalisation": 1.6,
      "Sharing & visibility": 1.5,
      "Account security": 1.1
    }
  },
  {
    "id": "work",
    "name": "Account holding work or client data",
    "description": "Link sharing, connected apps and device access dominate, because that is how work data leaks.",
    "multipliers": {
      "Activity & history": 0.9,
      "Location & devices": 1.1,
      "Ads & personalisation": 0.6,
      "Sharing & visibility": 1.6,
      "Account security": 1.7
    }
  },
  {
    "id": "safety",
    "name": "Leaving an unsafe situation",
    "description": "Location records, device sessions and discoverability outrank everything. Ad settings matter least.",
    "multipliers": {
      "Activity & history": 1.2,
      "Location & devices": 1.8,
      "Ads & personalisation": 0.5,
      "Sharing & visibility": 1.5,
      "Account security": 1.7
    }
  },
  {
    "id": "balanced",
    "name": "Balanced (no re-weighting)",
    "description": "Every setting counts at its base weight, with no profile emphasis applied.",
    "multipliers": {
      "Activity & history": 1,
      "Location & devices": 1,
      "Ads & personalisation": 1,
      "Sharing & visibility": 1,
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
    "hint": "Little is retained, nothing is shared and no stale app has access."
  },
  {
    "id": "strong",
    "min": 70,
    "label": "Well protected",
    "hint": "Retention and ads are handled. Finish the sharing and device checks."
  },
  {
    "id": "partial",
    "min": 40,
    "label": "Partly protected",
    "hint": "You paused some history but old records and shared links are still there."
  },
  {
    "id": "open",
    "min": 0,
    "label": "Wide open",
    "hint": "Years of searches, routes and watch history are stored and feeding ads."
  }
];

const byId = new Map(CHECKLIST.map((item) => [item.id, item]));
const profileById = new Map(PROFILES.map((item) => [item.id, item]));

/** Ids pre-ticked at first paint, because most accounts already have them. */
export const DEFAULT_DONE = [
  "security-checkup",
  "recovery-info"
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
