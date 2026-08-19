/**
 * Snapchat Privacy Settings Checklist — exposure scoring logic.
 *
 * Pure module: no React, no DOM, no clocks. Same input, same output. Every
 * exported function is total — unusable input returns { error } rather than
 * NaN, Infinity or a misleading score.
 *
 * The model is deliberately not "count the ticked boxes". Each control sits on
 * one exposure AXIS, and a risk profile re-weights those axes, because
 * a teenager and a parent auditing the same phone care most about Snap Map and Quick Add, while an adult using it socially is more exposed through Memories, My AI history and connected apps.
 */

/** Where the settings live, for the on-page instructions. */
export const PLATFORM = {
  "name": "Snapchat",
  "settingsRoot": "Snapchat > your profile > the gear icon > Settings. Privacy Controls holds Contact Me, Quick Add, View My Story and the Snap Map sharing setting; Ghost Mode is also reachable from the map itself.",
  "note": "Snaps disappearing from a chat is not the same as nothing being kept — Memories, My AI conversations and account records all persist."
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
    "id": "quick-add",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Turn off 'See Me in Quick Add'",
    "detail": "Quick Add offers your profile to people who share a mutual friend or appear in a synced contact list. It is how most unwanted adult-to-teen contact starts, because it needs no search and no shared information.",
    "path": "Settings > Privacy Controls > See Me in Quick Add",
    "risk": "Strangers with one mutual friend are shown your profile and photo as a suggested person to add.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "phone-lookup",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Stop others finding you by mobile number",
    "detail": "A separate switch on the mobile number screen decides whether someone holding your number can match it to the account. It is what links a Snapchat handle to a real person.",
    "path": "Settings > Mobile Number > Let others find me using my mobile number",
    "risk": "Anyone with your number — from a leaked list or an old group chat — finds the account behind it.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "contact-sync",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Turn off contact syncing and delete the uploaded data",
    "detail": "Syncing sends your phone book to Snapchat to power Quick Add. Stopping the sync and clearing what was already uploaded are two separate actions on the same screen.",
    "path": "Settings > Contacts > Sync Contacts, then Delete All Contact Data",
    "risk": "Your address book keeps generating suggestions that point people at your account.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "public-profile",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Check whether you have a public profile",
    "detail": "A public profile makes your bio, subscriber count, Spotlight posts and public stories visible to anyone, including people you have not added. It can be turned off again from the profile settings.",
    "path": "Profile > the three dots on your public profile > Settings",
    "risk": "Your name, bio and posts are browsable by anyone on Snapchat, not just people you added.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "username-choice",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Check what your username and display name give away",
    "detail": "Usernames are searchable and are frequently reused across platforms, which links accounts together. Snapchat allows the display name to be changed freely even though the username itself is fixed.",
    "path": "Settings > Name and Username",
    "risk": "A username reused from another app ties this account to everything else you have used it on.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "ghost-mode",
    "group": "Snap Map and location",
    "axis": "Location & Snap Map",
    "title": "Turn on Ghost Mode",
    "detail": "Ghost Mode removes you from the Snap Map entirely. It can be set for 3 hours, 24 hours or until you turn it off — choose 'until turned off', because the timed options silently put you back on the map.",
    "path": "Snap Map > the settings icon > Ghost Mode",
    "risk": "Friends and anyone they show their phone to watch your live position update every time you open the app.",
    "weight": 8,
    "critical": true
  },
  {
    "id": "map-audience",
    "group": "Snap Map and location",
    "axis": "Location & Snap Map",
    "title": "If you use the map, share with selected friends only",
    "detail": "The alternative to Ghost Mode is 'Only these friends', a named list rather than everyone you have added. Your Snapchat friends list is almost always wider than the people you want knowing where you are.",
    "path": "Snap Map > settings icon > Who can see my location > Only these friends",
    "risk": "Every person you ever added, including from a school year or an old job, sees your address at night.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "location-permission",
    "group": "Snap Map and location",
    "axis": "Location & Snap Map",
    "title": "Set the operating-system location permission",
    "detail": "The app permission governs what Snapchat can collect regardless of the in-app map setting. Set it to 'while using the app' and turn precise location off unless you need geofilters.",
    "path": "Phone Settings > Apps > Snapchat > Permissions > Location",
    "risk": "Snapchat collects a precise location trace in the background whatever the map setting says.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "geofilter-exposure",
    "group": "Snap Map and location",
    "axis": "Location & Snap Map",
    "title": "Watch what geofilters and stickers reveal",
    "detail": "A location filter, a temperature sticker or a speed overlay on a snap names your exact place and time even with Ghost Mode on. The filter is the leak, not the map.",
    "path": "Check before sending: swipe past location filters when sending from home or school",
    "risk": "A snap sent from home carries a filter naming the neighbourhood to everyone who receives it.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "my-places",
    "group": "Snap Map and location",
    "axis": "Location & Snap Map",
    "title": "Review My Places and saved locations",
    "detail": "Snapchat records places you have visited and favourited on the map. Reviewing and clearing them removes a stored history that outlives any single snap.",
    "path": "Snap Map > your Bitmoji > My Places",
    "risk": "A saved list of the places you go regularly sits on the account, mapping your routine.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "story-audience",
    "group": "Story and saved content",
    "axis": "Story & content",
    "title": "Set 'View My Story' to Friends Only or a custom list",
    "detail": "The default on many accounts is wider than friends. Custom lets you exclude named people permanently, which is the quiet option when you do not want to remove someone.",
    "path": "Settings > Privacy Controls > View My Story",
    "risk": "Stories showing your home, school or workplace go to people you added once and forgot.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "memories-my-eyes-only",
    "group": "Story and saved content",
    "axis": "Story & content",
    "title": "Move sensitive saved snaps into My Eyes Only",
    "detail": "Memories saves snaps to Snapchat's servers, not just your phone, and is where a borrowed or seized device leaks most. My Eyes Only puts a section behind a passcode — and that passcode cannot be recovered, so losing it loses the snaps.",
    "path": "Memories > select snaps > Move to My Eyes Only",
    "risk": "Anyone who picks up your unlocked phone scrolls through years of saved snaps in Memories.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "spotlight-submission",
    "group": "Story and saved content",
    "axis": "Story & content",
    "title": "Be deliberate about Spotlight submissions",
    "detail": "A Spotlight post is public to everyone on Snapchat, can be recommended widely and carries your username. It is a different audience from anything else in the app.",
    "path": "When posting, choose the destination rather than accepting the default",
    "risk": "A snap you meant for friends is published to a public feed with your username attached.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "our-story-submission",
    "group": "Story and saved content",
    "axis": "Story & content",
    "title": "Do not submit snaps to Snap Map or Our Story",
    "detail": "Submitting places the snap on the public map at the location it was taken, visible to anyone browsing that area — including people who do not have you added.",
    "path": "The share sheet when posting a snap: skip Snap Map and Our Story",
    "risk": "Your snap appears publicly on the map pinned to the exact place you took it.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "private-story-audit",
    "group": "Story and saved content",
    "axis": "Story & content",
    "title": "Audit who is on your private stories",
    "detail": "Private story lists are set once and rarely revisited, so they keep including people from an old job or school. The member list is editable at any time.",
    "path": "Profile > Stories > each private story > Edit Story",
    "risk": "A private story you treat as close friends still includes people you stopped speaking to years ago.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "screenshot-reality",
    "group": "Story and saved content",
    "axis": "Story & content",
    "title": "Treat every snap as permanent",
    "detail": "Screenshot alerts are a notification, not a barrier — a second phone photographing the screen leaves no trace at all. Disappearing is a courtesy, not a security property.",
    "path": "No setting; this is a habit rather than a toggle",
    "risk": "A snap you believed was temporary is saved by the recipient and shared onward.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "contact-me",
    "group": "Who can contact you",
    "axis": "Contact & messaging",
    "title": "Set 'Contact Me' to Friends Only",
    "detail": "The default of 'Friends and Contacts' lets anyone in your phone contacts message you even without being added. Friends Only is the setting that actually closes the inbox to strangers.",
    "path": "Settings > Privacy Controls > Contact Me",
    "risk": "Anyone whose number is in your phone, and anyone who guesses your username, can send you snaps and messages.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "my-ai-data",
    "group": "Who can contact you",
    "axis": "Contact & messaging",
    "title": "Clear My AI data and check what it retains",
    "detail": "Conversations with the in-app AI assistant are stored on Snapchat's servers, unlike ordinary snaps, and location may be shared with it if location access is on. There is a specific clear-data action for it.",
    "path": "Settings > Privacy Controls > Clear Data > Clear My AI Data",
    "risk": "Personal questions typed into the assistant are retained on the account indefinitely.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "group-add",
    "group": "Who can contact you",
    "axis": "Contact & messaging",
    "title": "Restrict who can add you to groups",
    "detail": "Being added to a group exposes your username and Bitmoji to every member, including people who could not otherwise contact you. Limiting it to friends closes that side door.",
    "path": "Settings > Privacy Controls > Who can add me to Groups",
    "risk": "A stranger adds you to a group and every member can now message you directly.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "block-review",
    "group": "Who can contact you",
    "axis": "Contact & messaging",
    "title": "Review blocked and removed friends",
    "detail": "Blocking removes them from your friend list and hides your story and map location from them. Removing a friend alone does not, if your settings are wider than friends-only.",
    "path": "Settings > Blocked",
    "risk": "Someone you removed but never blocked still reaches you because your contact setting is wider than friends.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "snap-score-emojis",
    "group": "Who can contact you",
    "axis": "Contact & messaging",
    "title": "Know what your Snap Score and streaks reveal",
    "detail": "Your Snap Score is visible to friends and, with a public profile, more widely. Streak counts show who you talk to daily, which is a relationship map anyone glancing at your screen can read.",
    "path": "Profile > Snap Score (visible to friends by default)",
    "risk": "Anyone looking over your shoulder sees exactly who you message most and how often.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "two-factor",
    "group": "Account security",
    "axis": "Account security",
    "title": "Turn on two-factor authentication",
    "detail": "Use the authenticator-app option rather than SMS, since SMS is defeated by a SIM swap. Save the recovery code somewhere other than the phone running the app.",
    "path": "Settings > Two-Factor Authentication",
    "risk": "A leaked password gives someone your Memories, your saved snaps and your friend list.",
    "weight": 8,
    "critical": true
  },
  {
    "id": "connected-apps",
    "group": "Account security",
    "axis": "Account security",
    "title": "Revoke connected apps and Snap Kit permissions",
    "detail": "Apps you signed into with Snapchat hold live grants, often including your friend list and Bitmoji. Third-party 'who viewed my profile' apps are a well-known credential-harvesting route.",
    "path": "Settings > Connected Apps",
    "risk": "A third-party app keeps live access to your friend list and identity long after you stopped using it.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "session-devices",
    "group": "Account security",
    "axis": "Account security",
    "title": "Review logged-in devices and forget old ones",
    "detail": "The two-factor screen lists devices that no longer need a verification code. Forgetting them forces a fresh check on the next sign-in from those devices.",
    "path": "Settings > Two-Factor Authentication > Forget Devices",
    "risk": "An old or shared device keeps signing in without a second-factor challenge.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "birthday-age",
    "group": "Account security",
    "axis": "Account security",
    "title": "Check the birthday on the account",
    "detail": "The stored birth date determines which teen-account protections apply, and it is also published to friends unless the birthday-party display is turned off.",
    "path": "Settings > Birthday",
    "risk": "An incorrect birth date removes the extra protections a teen account would otherwise get.",
    "weight": 2,
    "critical": false
  }
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Who can find you",
  "Snap Map and location",
  "Story and saved content",
  "Who can contact you",
  "Account security"
];

/** Exposure axes, in reporting order. */
export const AXES = [
  "Discoverability",
  "Location & Snap Map",
  "Story & content",
  "Contact & messaging",
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
    "id": "teen",
    "name": "Teen account or a parent checking one",
    "description": "Quick Add, Snap Map and who can make contact dominate; those are the routes strangers actually use.",
    "multipliers": {
      "Discoverability": 1.7,
      "Location & Snap Map": 1.8,
      "Story & content": 1.2,
      "Contact & messaging": 1.6,
      "Account security": 0.9
    }
  },
  {
    "id": "adult-social",
    "name": "Adult using it socially",
    "description": "Friends are already added, so saved content, My AI history and account access carry more of the score.",
    "multipliers": {
      "Discoverability": 1,
      "Location & Snap Map": 1.2,
      "Story & content": 1.4,
      "Contact & messaging": 1,
      "Account security": 1.4
    }
  },
  {
    "id": "safety",
    "name": "Hiding from someone specific",
    "description": "Location is the whole problem: Ghost Mode, geofilters and story audience are weighted up hard.",
    "multipliers": {
      "Discoverability": 1.6,
      "Location & Snap Map": 2,
      "Story & content": 1.4,
      "Contact & messaging": 1.5,
      "Account security": 1.2
    }
  },
  {
    "id": "creator",
    "name": "Public profile or creator",
    "description": "You are meant to be findable, so contact filtering, saved content and account security carry the weight.",
    "multipliers": {
      "Discoverability": 0.5,
      "Location & Snap Map": 1.2,
      "Story & content": 1.2,
      "Contact & messaging": 1.4,
      "Account security": 1.7
    }
  },
  {
    "id": "balanced",
    "name": "Balanced (no re-weighting)",
    "description": "Every setting counts at its base weight, with no profile emphasis applied.",
    "multipliers": {
      "Discoverability": 1,
      "Location & Snap Map": 1,
      "Story & content": 1,
      "Contact & messaging": 1,
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
    "hint": "You are off the map, out of Quick Add and reachable only by friends."
  },
  {
    "id": "strong",
    "min": 70,
    "label": "Well protected",
    "hint": "The map and discovery are handled. Finish the saved-content checks."
  },
  {
    "id": "partial",
    "min": 40,
    "label": "Partly protected",
    "hint": "Some controls are set, but you are still being suggested or located."
  },
  {
    "id": "open",
    "min": 0,
    "label": "Wide open",
    "hint": "Your live location is on a map and strangers are being offered your profile."
  }
];

const byId = new Map(CHECKLIST.map((item) => [item.id, item]));
const profileById = new Map(PROFILES.map((item) => [item.id, item]));

/** Ids pre-ticked at first paint, because most accounts already have them. */
export const DEFAULT_DONE = [
  "two-factor"
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

  // The static BANDS[].hint for "open"/"partial" names specific controls (Snap Map,
  // Quick Add) that may already be closed even while the overall percent is low because
  // other, unrelated controls are open. Below "strong" (70), swap in the actual worst
  // axis instead of asserting a fixed claim that can be false for the current answers.
  const bandHint =
    (band.id === "open" || band.id === "partial") && worstAxis && worstAxis.total > 0
      ? `Your biggest exposure right now: ${worstAxis.name} (${worstAxis.exposure}% still open).`
      : band.hint;

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
    bandHint,
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
