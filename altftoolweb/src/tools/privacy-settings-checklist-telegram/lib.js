/**
 * Telegram Privacy Settings Checklist — exposure scoring logic.
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
  "name": "Telegram",
  "settingsRoot": "Telegram app > Settings > Privacy and Security. On desktop the same menu sits under the hamburger icon > Settings > Privacy and Security.",
  "note": "Telegram splits privacy across three places: Privacy and Security for who-can-see settings, Data and Storage for contact syncing, and Devices for active logins."
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
    "id": "phone-number-nobody",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Set “Who can see my phone number” to Nobody",
    "detail": "Telegram is one of the few messengers where your real mobile number can be visible inside the app. Setting this to Nobody means the number is hidden even from people who already have you in a shared group.",
    "path": "Settings > Privacy and Security > Phone Number > Who can see my phone number",
    "risk": "Anyone in a group you post in can read your mobile number and run it through a people-search or WhatsApp lookup.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "find-by-number",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Set “Who can find me by my number” to My Contacts",
    "detail": "This is the setting that decides whether a stranger who already knows your number can pull up your Telegram profile, photo and username. It is separate from the visibility setting above and has to be changed on its own.",
    "path": "Settings > Privacy and Security > Phone Number > Who can find me by my number",
    "risk": "Someone with your number — a recruiter, a debt collector, an ex — can open your profile and photo without ever messaging you.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "contact-sync-off",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Turn off contact sync and delete contacts already uploaded",
    "detail": "Syncing uploads your phone book to Telegram's servers, which is how a pseudonymous account gets surfaced to a colleague. Turning the toggle off does not remove what was already uploaded — the delete action is a separate button on the same screen.",
    "path": "Settings > Privacy and Security > Data Settings > Sync Contacts / Delete Synced Contacts",
    "risk": "An account you kept away from your real name is still matched to everyone who saved your number.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "username-audit",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Decide whether to keep a public @username",
    "detail": "A public username creates a permanent t.me link that anyone can search for and that search engines index when it is posted anywhere. Removing it means people can only reach you through your number or an invite, which is the point if you are trying to be hard to find.",
    "path": "Settings > tap your name > Username",
    "risk": "Your handle is searchable, guessable from other sites where you reused it, and indexed as a t.me page.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "public-group-exposure",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Check which public groups and channels you are visible in",
    "detail": "Public group membership is not private. Anyone can open the member list of a public group and see who is in it, and message archives of public groups are widely scraped and mirrored outside Telegram.",
    "path": "Chats list > review every public group and channel you have joined",
    "risk": "Your interests, politics or location are inferable from group membership by anyone who opens the member list.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "last-seen",
    "group": "What people can see",
    "axis": "Profile visibility",
    "title": "Restrict Last Seen and Online",
    "detail": "Last Seen is a behavioural log: with regular checking, someone can infer your sleep hours, working pattern and time zone. Telegram also applies a fairness rule — hide yours and you stop seeing other people's exact timestamps too.",
    "path": "Settings > Privacy and Security > Last Seen & Online",
    "risk": "Your daily routine and time zone are readable by anyone who checks the chat header a few times.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "profile-photos",
    "group": "What people can see",
    "axis": "Profile visibility",
    "title": "Restrict who can see your profile photo",
    "detail": "The profile photo is the single most reusable identifier on the account — a reverse image search links it to every other site where the same picture appears. You can also set a separate public photo shown to everyone outside your contacts.",
    "path": "Settings > Privacy and Security > Profile Photos",
    "risk": "A reverse image search on your avatar ties this account to your LinkedIn, dating profile or old forum posts.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "bio-privacy",
    "group": "What people can see",
    "axis": "Profile visibility",
    "title": "Restrict your Bio, and remove identifying detail from it",
    "detail": "Bios routinely carry an employer, a city, another handle or a personal site. Restricting the audience helps, but removing the detail is what actually reduces what a stranger can pivot from.",
    "path": "Settings > Privacy and Security > Bio",
    "risk": "Your employer, city or a second handle is handed to anyone who opens the profile.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "dob-privacy",
    "group": "What people can see",
    "axis": "Profile visibility",
    "title": "Restrict your Date of Birth",
    "detail": "Date of birth is a knowledge-based-authentication answer at banks and telecoms and a key field for matching you across leaked databases. Telegram shows it on the profile once you add it, so it needs its own audience setting.",
    "path": "Settings > Privacy and Security > Date of Birth",
    "risk": "A full date of birth plus your name is often enough to pass a phone-support identity check somewhere else.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "forwarded-messages",
    "group": "What people can see",
    "axis": "Profile visibility",
    "title": "Stop forwarded messages linking back to your account",
    "detail": "By default a forwarded message keeps a tappable link to your profile, so it travels into groups you never joined and stays there. Set to Nobody, your name still appears but without the link.",
    "path": "Settings > Privacy and Security > Forwarded Messages",
    "risk": "Something you wrote in a private chat lands in a large public group with a working link straight to your profile.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "stories-audience",
    "group": "What people can see",
    "axis": "Profile visibility",
    "title": "Set the story audience and the hide-from list",
    "detail": "Telegram stories default to your contacts, which is a much wider audience than most people picture. A Close Friends list, or a per-story audience, is what makes the audience genuinely small.",
    "path": "Story composer > audience selector, or Settings > Privacy and Security > Stories",
    "risk": "A story showing your home, car or child reaches every contact you have ever saved.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "story-repost",
    "group": "What people can see",
    "axis": "Profile visibility",
    "title": "Turn off story sharing and reposting",
    "detail": "Allowing sharing lets a viewer repost your story outside your chosen audience, which quietly defeats the audience setting. It does not stop screenshots — nothing does — but it removes the one-tap route.",
    "path": "Settings > Privacy and Security > Stories > Allow sharing",
    "risk": "A story limited to close friends is reposted onward by one of them in a single tap.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "groups-add",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Set “Groups & Channels” to My Contacts",
    "detail": "Left open, anyone who has your number can drag you into a group without asking, which is the main delivery route for crypto and investment spam on Telegram. Add exceptions for the specific people who genuinely need to add you.",
    "path": "Settings > Privacy and Security > Groups & Channels > Who can add me",
    "risk": "You are dumped into scam groups where hundreds of strangers can see your profile and message you.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "p2p-calls",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Set peer-to-peer calls to Nobody so calls do not leak your IP",
    "detail": "In peer-to-peer mode a Telegram call connects your device directly to the other person's, which exposes your IP address to them and so an approximate location and your ISP. Setting P2P to Nobody routes every call through Telegram's servers instead, at a small latency cost.",
    "path": "Settings > Privacy and Security > Calls > Peer-to-peer",
    "risk": "Whoever you accept a call from can read your IP address and derive your city and internet provider.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "calls-who",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Restrict who can call you",
    "detail": "A ringing call is the most intrusive notification the app has and the standard opener for voice-based social engineering. Limiting it to contacts removes cold calls entirely.",
    "path": "Settings > Privacy and Security > Calls > Who can call me",
    "risk": "Strangers can make your phone ring at any hour, and a ringing call is a common opener for a scam script.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "incoming-messages",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Limit who can send you messages",
    "detail": "Telegram lets you restrict incoming direct messages to contacts, or require a small paid charge from non-contacts. Either setting removes the bulk of unsolicited first contact.",
    "path": "Settings > Privacy and Security > Messages",
    "risk": "Anyone who finds your username can open a direct chat, including automated spam and grooming accounts.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "voice-messages",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Restrict who can send you voice and video messages",
    "detail": "Voice and round video messages autoplay and are harder to ignore than text, so they are used deliberately for harassment. Restricting them is a Telegram Premium control.",
    "path": "Settings > Privacy and Security > Voice Messages",
    "risk": "Unwanted voice or video notes arrive from strangers and play in your notification shade.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "blocked-users",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Review the blocked list",
    "detail": "The blocked list is worth a read because blocks made from a device you no longer use still apply, and an account you blocked years ago may now be reachable under a new username you have not blocked.",
    "path": "Settings > Privacy and Security > Blocked Users",
    "risk": "Someone you blocked returns under a second account and the old block does nothing.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "secret-chats",
    "group": "Messages and retention",
    "axis": "Message retention",
    "title": "Use Secret Chats for anything that must be end-to-end encrypted",
    "detail": "This is the most misunderstood fact about Telegram: ordinary cloud chats and all group chats are encrypted in transit and on disk, but Telegram holds the keys, so they are not end-to-end encrypted. Only a Secret Chat is, and it is device-to-device, one-to-one and started manually.",
    "path": "Contact profile > the three-dot menu > Start Secret Chat",
    "risk": "Sensitive conversation sits on Telegram's servers in a form Telegram can read and can be compelled to hand over.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "auto-delete",
    "group": "Messages and retention",
    "axis": "Message retention",
    "title": "Set a default auto-delete timer for new chats",
    "detail": "Auto-delete removes messages from both sides after a set period, so the exposure from a future device seizure or account compromise is bounded by the timer rather than by however long you have used the app.",
    "path": "Settings > Privacy and Security > Auto-Delete Messages",
    "risk": "Years of chat history sits in the cloud, restorable on any new device that logs in.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "passcode-lock",
    "group": "Messages and retention",
    "axis": "Message retention",
    "title": "Turn on the local passcode lock and hide message text in notifications",
    "detail": "The passcode locks the app itself, separately from the phone's unlock, and lets you set an auto-lock delay. Turning off message previews stops the content of a chat appearing on the lock screen where anyone nearby can read it.",
    "path": "Settings > Privacy and Security > Passcode Lock, and Settings > Notifications > Message Preview",
    "risk": "Anyone who picks up your unlocked phone — or just glances at the lock screen — reads your messages.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "link-previews",
    "group": "Messages and retention",
    "axis": "Message retention",
    "title": "Turn off link previews inside secret chats",
    "detail": "To build a preview, Telegram's servers fetch the link, which means a URL you were sent in an otherwise end-to-end chat is visited by a Telegram server. Turning previews off in secret chats keeps that fetch from happening.",
    "path": "Secret chat > the three-dot menu > Disable link previews",
    "risk": "A link meant to stay inside an end-to-end chat is fetched by a third-party server, revealing that you received it.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "two-step",
    "group": "Account security",
    "axis": "Account security",
    "title": "Turn on Two-Step Verification (a cloud password)",
    "detail": "Without it, the only thing standing between an attacker and your entire cloud history is an SMS code — and SMS falls to SIM swaps and to any operator able to read the message. The cloud password is asked for on every new login in addition to the code.",
    "path": "Settings > Privacy and Security > Two-Step Verification",
    "risk": "A SIM swap or an intercepted SMS hands over the account and every cloud chat stored in it.",
    "weight": 7,
    "critical": true
  },
  {
    "id": "active-sessions",
    "group": "Account security",
    "axis": "Account security",
    "title": "Terminate old sessions and set an auto-terminate period",
    "detail": "Every device that has ever logged in keeps a live session with full access to your cloud history until it is terminated. Set the automatic termination period to the shortest option you can live with so forgotten logins expire on their own.",
    "path": "Settings > Devices > Active Sessions / Automatically terminate old sessions",
    "risk": "An old laptop, a borrowed tablet or a web login you forgot still reads every message you send today.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "login-email",
    "group": "Account security",
    "axis": "Account security",
    "title": "Add a login email so a SIM swap alone cannot take the account",
    "detail": "Telegram can send the login code to a verified email address instead of by SMS. That breaks the single point of failure where control of the phone number equals control of the account.",
    "path": "Settings > Privacy and Security > Login Email",
    "risk": "Whoever controls your phone number controls your Telegram account, full stop.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "delete-if-away",
    "group": "Account security",
    "axis": "Account security",
    "title": "Shorten “Delete my account if away for”",
    "detail": "This is the dead-man switch for an account you stop using. On the shortest setting, an abandoned account and its cloud history are removed automatically instead of sitting online indefinitely.",
    "path": "Settings > Privacy and Security > Delete my account > If away for",
    "risk": "An account you stopped using stays live for a year or more with all its history intact.",
    "weight": 3,
    "critical": false
  }
];

/** Reporting order of the on-screen sections. */
export const GROUPS = [
  "Who can find you",
  "What people can see",
  "Who can reach you",
  "Messages and retention",
  "Account security"
];

/** Exposure axes, in reporting order. */
export const AXES = [
  "Discoverability",
  "Profile visibility",
  "Contact & messaging",
  "Message retention",
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
    "name": "Private personal account",
    "description": "Friends and family only. Being hard to find and hard to add to a group matters more than being reachable.",
    "multipliers": {
      "Discoverability": 1.4,
      "Profile visibility": 1.2,
      "Contact & messaging": 1.2,
      "Message retention": 0.9,
      "Account security": 1
    }
  },
  {
    "id": "channel-admin",
    "name": "Channel or community admin",
    "description": "You have to stay publicly reachable, so the weight moves to call and message controls, retention and account security instead of hiding.",
    "multipliers": {
      "Discoverability": 0.5,
      "Profile visibility": 1,
      "Contact & messaging": 1.4,
      "Message retention": 1.2,
      "Account security": 1.5
    }
  },
  {
    "id": "journalist",
    "name": "Journalist or source contact",
    "description": "What survives on a server or a seized device is the real risk, so retention, encryption and session hygiene dominate.",
    "multipliers": {
      "Discoverability": 1.1,
      "Profile visibility": 0.9,
      "Contact & messaging": 1.1,
      "Message retention": 1.6,
      "Account security": 1.5
    }
  },
  {
    "id": "safety",
    "name": "Leaving an unsafe situation",
    "description": "Anything that reveals where you are or lets someone reach you is weighted up hard. Number visibility, group adds and IP leaks come first.",
    "multipliers": {
      "Discoverability": 1.6,
      "Profile visibility": 1.4,
      "Contact & messaging": 1.5,
      "Message retention": 1.1,
      "Account security": 1.4
    }
  },
  {
    "id": "balanced",
    "name": "Balanced (no re-weighting)",
    "description": "Every setting counts at its base weight, with no profile emphasis applied.",
    "multipliers": {
      "Discoverability": 1,
      "Profile visibility": 1,
      "Contact & messaging": 1,
      "Message retention": 1,
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
    "hint": "A stranger with your number learns almost nothing and cannot reach you."
  },
  {
    "id": "strong",
    "min": 70,
    "label": "Well protected",
    "hint": "Solid. Close the last few gaps when you have a spare minute."
  },
  {
    "id": "partial",
    "min": 40,
    "label": "Partly protected",
    "hint": "The obvious settings are done, the quiet leaks are not."
  },
  {
    "id": "open",
    "min": 0,
    "label": "Wide open",
    "hint": "Your number, your routine and your inbox are open to anyone who finds you."
  }
];

const byId = new Map(CHECKLIST.map((item) => [item.id, item]));
const profileById = new Map(PROFILES.map((item) => [item.id, item]));

/** Ids pre-ticked at first paint. */
export const DEFAULT_DONE = [
  "last-seen",
  "blocked-users"
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
