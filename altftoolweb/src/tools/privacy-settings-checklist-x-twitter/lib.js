/**
 * X (Twitter) Privacy Settings Checklist — exposure scoring logic.
 *
 * Pure module: no React, no DOM, no clocks. Same input, same output. Every
 * exported function is total — unusable input returns { error } rather than
 * NaN, Infinity or a misleading score.
 *
 * The model is deliberately not "count the ticked boxes". Each control sits on
 * one exposure AXIS, and a risk profile re-weights those axes, because
 * an anonymous account and a public commentator need opposite things: one has to be undiscoverable by phone number and email, the other has to stay public and should be graded on DM filtering, data sharing and account security instead.
 */

/** Where the settings live, for the on-page instructions. */
export const PLATFORM = {
  "name": "X (formerly Twitter)",
  "settingsRoot": "X > More > Settings and privacy. Privacy and safety holds discoverability, audience, location, DMs, ads and the Grok setting; Security and account access holds two-factor and connected apps.",
  "note": "X renames and moves settings frequently, and several of these are opt-out switches that were turned on for existing accounts by default."
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
    "id": "discoverability-phone",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Turn off 'let others find you by your phone number'",
    "detail": "This is the setting that links a pseudonymous account to a real identity. Anyone who uploads a contact list containing your number is shown the account, which is how most anonymous accounts are unmasked.",
    "path": "Settings and privacy > Privacy and safety > Discoverability and contacts",
    "risk": "Anyone holding your phone number — including from a leaked list — is handed the account you kept separate.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "discoverability-email",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Turn off 'let others find you by your email address'",
    "detail": "The companion switch on the same screen. If the account uses an address you have ever given to an employer or a shop, this one setting connects the two.",
    "path": "Settings and privacy > Privacy and safety > Discoverability and contacts",
    "risk": "A colleague who has your work email finds the account you never told anyone about.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "contacts-remove",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Remove the contacts already uploaded",
    "detail": "Turning off syncing does not delete the address book already sent. The manage-contacts screen has a separate remove-all action, and it is the only way to clear it.",
    "path": "Settings and privacy > Privacy and safety > Discoverability and contacts > Manage contacts",
    "risk": "Your uploaded address book keeps driving suggestions that point people at your account.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "protected-posts",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Decide whether to protect your posts",
    "detail": "Protecting posts means only approved followers see them and nothing is indexed or quotable by strangers. It is the single largest change available, and it turns off reach entirely.",
    "path": "Settings and privacy > Privacy and safety > Audience, media and tagging > Protect your posts",
    "risk": "Every post is public, permanently searchable, screenshot-able and quotable out of context.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "photo-tagging",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Restrict who can tag you in photos",
    "detail": "Tagging attaches your handle to someone else's image. Limiting it to people you follow, or switching it off, stops strangers linking your account to their picture.",
    "path": "Settings and privacy > Privacy and safety > Audience, media and tagging > Photo tagging",
    "risk": "Strangers tag your handle into images you have nothing to do with, and it reads as association.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "handle-and-name",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Check what your handle and display name give away",
    "detail": "Handles are searchable across other platforms; reusing one links every account you have ever made with it. A previous handle also stays associated in archived pages and screenshots.",
    "path": "Profile > Edit profile > Name, and Settings > Your account > Account information > Username",
    "risk": "A single reused handle ties this account to every other profile you have used it on.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "location-in-posts",
    "group": "What people can see",
    "axis": "Post visibility",
    "title": "Turn off location tagging and remove location from past posts",
    "detail": "Two actions on one screen: stop adding location to new posts, and remove the location information already attached to old ones. The second is a bulk action and is the one people skip.",
    "path": "Settings and privacy > Privacy and safety > Location information",
    "risk": "Years of geotagged posts map your home, workplace and routine to within a street.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "old-post-audit",
    "group": "What people can see",
    "axis": "Post visibility",
    "title": "Audit and delete old posts you would not publish today",
    "detail": "Posts are permanently searchable, and the archive download is the fastest way to review years of them offline before deciding what to remove.",
    "path": "Settings and privacy > Your account > Download an archive of your data, then delete from the app",
    "risk": "A decade-old post, written in a different context, is quoted back at you by someone who searched for it.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "likes-public",
    "group": "What people can see",
    "axis": "Post visibility",
    "title": "Understand what your likes reveal",
    "detail": "Likes have historically been visible on the profile and remain visible to the author of the post. Treat a like as a public statement rather than a private bookmark, and use bookmarks for saving.",
    "path": "Profile > Likes tab, and use Bookmarks for private saving",
    "risk": "A chronological record of everything you approved of is read as a statement of your views.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "reply-controls",
    "group": "What people can see",
    "axis": "Post visibility",
    "title": "Set reply controls before posting something contentious",
    "detail": "Replies can be limited to accounts you follow or only accounts you mention. Setting it before posting is what prevents a pile-on; changing it afterwards leaves the replies already there.",
    "path": "Post composer > the reply-audience control, before posting",
    "risk": "A post travels beyond your followers and the replies become an unmanageable pile-on.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "following-list",
    "group": "What people can see",
    "axis": "Post visibility",
    "title": "Consider what your following list says about you",
    "detail": "Who you follow is public unless the account is protected, and on a pseudonymous account it is often enough to identify you from overlapping local and professional accounts.",
    "path": "Profile > Following (visible unless posts are protected)",
    "risk": "Your following list of local businesses and colleagues identifies you despite an anonymous handle.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "sensitive-media",
    "group": "What people can see",
    "axis": "Post visibility",
    "title": "Set the sensitive-content display settings",
    "detail": "Separate controls govern whether you see sensitive media and whether your own posts are marked as containing it. It changes what appears on your screen in a public place.",
    "path": "Settings and privacy > Privacy and safety > Content you see",
    "risk": "Graphic content auto-loads on your timeline in an office or in front of a child.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "spaces-and-lists",
    "group": "What people can see",
    "axis": "Post visibility",
    "title": "Check Spaces participation and public list membership",
    "detail": "Speaking in a Space shows on your profile while it is live and the recording persists. Anyone can also add you to a public list, and list membership is visible on your profile.",
    "path": "Profile > Lists > Member of, and review Spaces you have joined as a speaker",
    "risk": "You appear on a public list titled something you would not want your name attached to.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "dm-requests",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Restrict who can send you message requests",
    "detail": "The options run from everyone, through verified users, to no one. Closing it to no one removes the single most common route for crypto scams, sextortion and unsolicited images.",
    "path": "Settings and privacy > Privacy and safety > Direct messages",
    "risk": "Anyone on the platform can put an image or a scam in front of you without following you.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "dm-quality-filter",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Turn on the message quality filter",
    "detail": "The filter moves low-quality and likely-spam messages into a separate section rather than your inbox, which is useful if you need requests open for legitimate contact.",
    "path": "Settings and privacy > Privacy and safety > Direct messages > Filter low-quality messages",
    "risk": "Bulk scam messages sit in your main inbox alongside genuine ones.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "dm-read-receipts",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Turn off DM read receipts",
    "detail": "Read receipts tell the sender the exact moment you opened a message. Turning them off is reciprocal — you stop seeing theirs as well.",
    "path": "Settings and privacy > Privacy and safety > Direct messages > Show read receipts",
    "risk": "Someone pressuring you for a reply knows precisely when you read and ignored the message.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "notification-filters",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Set the advanced notification filters",
    "detail": "Advanced filters mute notifications from accounts that do not follow you, are new, have no profile photo or have not confirmed an email or phone. That combination removes most brigading traffic.",
    "path": "Settings and privacy > Notifications > Filters > Advanced filters",
    "risk": "A coordinated pile-on from throwaway accounts floods your notifications and buries real replies.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "mute-block-review",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Review muted and blocked accounts",
    "detail": "Muting is invisible to the other person and does not escalate; blocking is visible and sometimes does. Both lists are exportable and importable, which helps if you move accounts.",
    "path": "Settings and privacy > Privacy and safety > Mute and block",
    "risk": "Someone you meant to block is back on a new handle, or an old block is no longer in place.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "mentions-quotes",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Decide how to handle quote posts and mentions",
    "detail": "You cannot stop being quoted, but you can unmention yourself from a conversation and control who can mention you in future replies. Unmentioning stops the notifications without deleting anything.",
    "path": "The post's three-dot menu > Leave this conversation / Change who can reply",
    "risk": "A quote post drags you into an argument and every reply notifies you for days.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "grok-ai-training",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Turn off the Grok and third-party AI training setting",
    "detail": "A dedicated setting governs whether your posts, interactions and inputs are used to train X's AI models and shared with third-party collaborators. It was switched on for existing accounts by default.",
    "path": "Settings and privacy > Privacy and safety > Grok and third-party collaborators",
    "risk": "Your posts and your conversations with the assistant feed model training under a default you never chose.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "connected-apps",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Revoke connected apps",
    "detail": "Every third-party service you signed into with X holds a live token, and many request posting and DM access. Old analytics, scheduler and follower-tracker apps are the usual offenders.",
    "path": "Settings and privacy > Security and account access > Apps and sessions > Connected apps",
    "risk": "A dormant app can still post, read your DMs and follow accounts on your behalf.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "data-sharing-partners",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Turn off additional data sharing with business partners",
    "detail": "A separate switch from ad personalisation. It governs whether X shares extra information about your activity with commercial partners outside the platform.",
    "path": "Settings and privacy > Privacy and safety > Data sharing and personalisation",
    "risk": "Your activity is passed to partner companies you have no relationship with.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "ad-personalisation",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Turn off personalised ads",
    "detail": "This stops your on- and off-platform activity being used to select ads. Availability of the full opt-out varies by country because of local data-protection law.",
    "path": "Settings and privacy > Privacy and safety > Data sharing and personalisation > Ads preferences",
    "risk": "Your posts, follows and off-platform browsing are turned into an ad-targeting profile.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "location-personalisation",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Turn off personalisation based on places you have been",
    "detail": "Separate from post geotags, this governs whether X uses your current and historical locations to personalise your experience and ads.",
    "path": "Settings and privacy > Privacy and safety > Data sharing and personalisation > Location information",
    "risk": "Where your phone has been shapes your timeline and your ads even when you never tag a post.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "inferred-identity",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Turn off personalisation across your devices",
    "detail": "Inferred identity links the account to other devices X believes are yours, joining a work laptop and a personal phone into one profile.",
    "path": "Settings and privacy > Privacy and safety > Data sharing and personalisation > Inferred identity",
    "risk": "Activity on a work device is joined to your personal account through an inference you never confirmed.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "download-archive",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Download your archive to see what is held",
    "detail": "The archive contains posts, DMs, ad-targeting inferences, the contacts you uploaded and your login IP history. The inference and login files are the ones worth reading.",
    "path": "Settings and privacy > Your account > Download an archive of your data",
    "risk": "You tune settings without ever seeing the inferences, DMs and IP history the account actually holds.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "two-factor",
    "group": "Account security",
    "axis": "Account security",
    "title": "Turn on two-factor authentication",
    "detail": "Use an authenticator app or a security key rather than SMS, which a SIM swap defeats. Save the backup code somewhere off the phone.",
    "path": "Settings and privacy > Security and account access > Security > Two-factor authentication",
    "risk": "A leaked password is enough to take an account that carries your name and your audience.",
    "weight": 7,
    "critical": true
  },
  {
    "id": "sessions-devices",
    "group": "Account security",
    "axis": "Account security",
    "title": "Review active sessions and log out old devices",
    "detail": "The sessions list shows device, browser and rough location. Anything unfamiliar means the credentials leaked, and ending the session is separate from changing the password.",
    "path": "Settings and privacy > Security and account access > Apps and sessions > Sessions",
    "risk": "An intruder keeps a live session reading your DMs after you have changed the password.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "password-reset-protect",
    "group": "Account security",
    "axis": "Account security",
    "title": "Require extra information to reset the password",
    "detail": "With this on, a reset needs the email address or phone number on the account rather than just the handle. It blocks the simplest form of targeted account takeover attempt.",
    "path": "Settings and privacy > Security and account access > Security > Additional password protection",
    "risk": "Someone starts a password reset knowing only your handle.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "account-email-phone",
    "group": "Account security",
    "axis": "Account security",
    "title": "Check the email and phone on the account",
    "detail": "Removing a phone number entirely also removes it as a discoverability vector, but check your two-factor method does not depend on it first.",
    "path": "Settings and privacy > Your account > Account information",
    "risk": "An old work email on the account is both a recovery route for someone else and a link to your real name.",
    "weight": 2,
    "critical": false
  }
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Who can find you",
  "What people can see",
  "Who can reach you",
  "Data and advertising",
  "Account security"
];

/** Exposure axes, in reporting order. */
export const AXES = [
  "Discoverability",
  "Post visibility",
  "Contact & messaging",
  "Data & ads",
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
    "id": "anonymous",
    "name": "Pseudonymous account",
    "description": "Nothing may link the account to your identity. Discoverability by phone and email dominates the score.",
    "multipliers": {
      "Discoverability": 2,
      "Post visibility": 1.3,
      "Contact & messaging": 0.9,
      "Data & ads": 1,
      "Account security": 1.2
    }
  },
  {
    "id": "public-voice",
    "name": "Public account with an audience",
    "description": "Reach is the point, so DM filtering, notification filters, data sharing and account security carry the weight.",
    "multipliers": {
      "Discoverability": 0.5,
      "Post visibility": 0.9,
      "Contact & messaging": 1.6,
      "Data & ads": 1.3,
      "Account security": 1.7
    }
  },
  {
    "id": "harassment",
    "name": "Being harassed or brigaded",
    "description": "Reply controls, notification filters, DM restrictions and location removal are weighted up hard.",
    "multipliers": {
      "Discoverability": 1.5,
      "Post visibility": 1.5,
      "Contact & messaging": 1.8,
      "Data & ads": 0.5,
      "Account security": 1.4
    }
  },
  {
    "id": "data-minimal",
    "name": "Reducing what X keeps and shares",
    "description": "AI training, partner sharing, ad personalisation and connected apps outrank appearance settings.",
    "multipliers": {
      "Discoverability": 0.9,
      "Post visibility": 0.8,
      "Contact & messaging": 0.7,
      "Data & ads": 2,
      "Account security": 1.1
    }
  },
  {
    "id": "balanced",
    "name": "Balanced (no re-weighting)",
    "description": "Every setting counts at its base weight, with no profile emphasis applied.",
    "multipliers": {
      "Discoverability": 1,
      "Post visibility": 1,
      "Contact & messaging": 1,
      "Data & ads": 1,
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
    "hint": "You are not findable by contact details and nothing leaks your location."
  },
  {
    "id": "strong",
    "min": 70,
    "label": "Well protected",
    "hint": "The main leaks are closed. Finish the data-sharing settings."
  },
  {
    "id": "partial",
    "min": 40,
    "label": "Partly protected",
    "hint": "Some controls are set, but you are still findable or still sharing."
  },
  {
    "id": "open",
    "min": 0,
    "label": "Wide open",
    "hint": "Anyone with your phone number can find the account, and it shares everything."
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
