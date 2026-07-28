/**
 * Reddit Privacy Settings Checklist — exposure scoring logic.
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
  "name": "Reddit",
  "settingsRoot": "reddit.com > your avatar > Settings, then the Account, Profile, Privacy and Safety, and Notifications tabs. The mobile apps expose a smaller subset, so do the audit on the web.",
  "note": "Reddit's biggest privacy risk is not a toggle at all: your username is permanent, your comment history is public by default, and third parties archive it, so what you have already posted matters more than what you switch off today."
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
    "id": "unique-username",
    "group": "Identity linkage",
    "axis": "Identity linkage",
    "title": "Use a username you have never used anywhere else",
    "detail": "Reddit usernames cannot be changed after the account is created, so a reused handle is a permanent join key between this account and every other site you used it on. Free tools search dozens of platforms for one handle in seconds. If yours is reused, the fix is a new account, not a setting.",
    "path": "Settings > Account (the username field is read-only; a new handle means a new account)",
    "risk": "One search on your handle links your Reddit history to your GitHub, Steam, forum posts and old blog.",
    "weight": 7,
    "critical": true
  },
  {
    "id": "search-engine-indexing",
    "group": "Identity linkage",
    "axis": "Identity linkage",
    "title": "Turn off “Show up in search results”",
    "detail": "This controls whether search engines are asked to index your profile page. It stops a name-and-handle search surfacing your Reddit profile directly, though it does not remove pages already indexed or the many mirror sites that republish Reddit content.",
    "path": "Settings > Privacy and Safety > Show up in search results",
    "risk": "Your profile and recent comments appear in a plain web search for your handle.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "social-links",
    "group": "Identity linkage",
    "axis": "Identity linkage",
    "title": "Remove social links from your profile",
    "detail": "Reddit lets you pin links to other platforms on your profile. Each one is an explicit, self-declared connection between this pseudonym and a named account — the exact link everything else on this list is trying to avoid.",
    "path": "Settings > Profile > Social links",
    "risk": "You have published the mapping from your Reddit handle to your real-name accounts yourself.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "profile-bio-detail",
    "group": "Identity linkage",
    "axis": "Identity linkage",
    "title": "Strip identifying detail from the display name and About text",
    "detail": "Display names and bios accumulate a city, a job title, an age or a partner's name. Any two of those plus your comment history is usually enough to narrow you to one person in a mid-sized town.",
    "path": "Settings > Profile > Display name and About",
    "risk": "Your city and job title sit next to a comment history that names your employer's problems.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "connected-accounts",
    "group": "Identity linkage",
    "axis": "Identity linkage",
    "title": "Disconnect Google or Apple sign-in if the account should stay separate",
    "detail": "Signing in with Google or Apple ties the Reddit account to an identity provider that holds your real name. It is convenient, and it is one more record connecting the two. A password plus 2FA keeps the account standalone.",
    "path": "Settings > Account > Connected accounts",
    "risk": "A pseudonymous account is bound to a Google identity that carries your legal name.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "avatar-reuse",
    "group": "Identity linkage",
    "axis": "Identity linkage",
    "title": "Do not reuse a photo or avatar from another account",
    "detail": "A reverse image search matches an avatar across sites even when the handle differs, and image files can carry their own metadata. Use the generated Reddit avatar or an image that exists nowhere else.",
    "path": "Settings > Profile > Avatar",
    "risk": "A reverse image search on your avatar links this account to a profile carrying your real name.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "history-audit",
    "group": "What your history reveals",
    "axis": "History exposure",
    "title": "Read back through your own comment history for location and workplace tells",
    "detail": "This is the most valuable item on the list and the one people skip. Comments accumulate a home city, a commute, an employer, a car, a school run and a partner's job — each harmless alone, jointly identifying. Sort your profile by oldest and read what you actually wrote.",
    "path": "Your profile > Comments > sort by New/Top, and read from the oldest page forward",
    "risk": "Scattered replies over years combine into your street, your employer and your working hours.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "active-communities",
    "group": "What your history reveals",
    "axis": "History exposure",
    "title": "Turn off “Show which communities I'm active in on my profile”",
    "detail": "The active-communities panel hands a visitor your subreddit map in one glance: your city, your employer's subreddit, your medical conditions, your politics. Turning it off removes the summary, though the individual posts remain public.",
    "path": "Settings > Privacy and Safety > Show which communities I'm active in",
    "risk": "Your city, health conditions and politics are readable from a single panel on your profile.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "public-votes",
    "group": "What your history reveals",
    "axis": "History exposure",
    "title": "Keep your upvote and downvote history private",
    "detail": "Reddit can display the posts you have upvoted or downvoted on your profile. Votes are a much larger and less guarded dataset than comments — most people vote hundreds of times for every comment they write, and never expect it to be readable.",
    "path": "Settings > Privacy and Safety > Make my upvotes public / Make my downvotes public",
    "risk": "Thousands of votes you cast without thinking become a public map of your interests and opinions.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "deleted-not-gone",
    "group": "What your history reveals",
    "axis": "History exposure",
    "title": "Overwrite before you delete, and accept that archives keep copies",
    "detail": "Deleting a comment removes it from Reddit's front end; third-party archives and mirror sites that copied it earlier keep the original text indefinitely. Editing the text to something neutral first, then deleting, at least means the most recent copy some scrapers hold is harmless.",
    "path": "Comment > Edit, save, then Delete — in that order",
    "risk": "A comment you deleted is still readable in full on mirror sites and in bulk archives.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "timing-pattern",
    "group": "What your history reveals",
    "axis": "History exposure",
    "title": "Break up a fixed posting schedule",
    "detail": "Timestamps are metadata you cannot switch off. A year of posts clusters into a waking window that gives away your time zone to within an hour or two, and gaps that match a working day. It also correlates two accounts that never post at the same time.",
    "path": "Behavioural — vary when you post, and avoid posting only from a work network",
    "risk": "Your time zone, working hours and holidays are derivable from timestamps alone.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "active-status",
    "group": "What your history reveals",
    "axis": "History exposure",
    "title": "Turn off the online and active status",
    "detail": "Showing that you are currently online tells anyone watching your profile when you are at a keyboard, which is both a routine leak and an invitation for someone waiting to start a chat the moment you appear.",
    "path": "Settings > Privacy and Safety > Show that you're active on Reddit",
    "risk": "Someone who wants to reach you knows the exact moment you are online.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "public-custom-feeds",
    "group": "What your history reveals",
    "axis": "History exposure",
    "title": "Check whether your custom feeds are public",
    "detail": "Custom feeds are curated lists of subreddits and can be made public, at which point they appear on your profile. A public feed is the same subreddit map as the active-communities panel, assembled deliberately by you.",
    "path": "Custom feed > Edit > visibility",
    "risk": "A feed you built for yourself publishes exactly which communities you follow.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "chat-requests",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Restrict who can send you chat requests",
    "detail": "Chat is the main harassment and scam channel on Reddit, and the account-age option is the useful middle setting: it blocks brand-new throwaways made specifically to message you while leaving established users through.",
    "path": "Settings > Privacy and Safety > Who can send you chat requests",
    "risk": "Throwaway accounts created minutes ago can open a chat window with you.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "private-messages",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Restrict who can send you private messages",
    "detail": "Private messages are a separate system from chat with its own setting, so restricting one leaves the other wide open. Both need changing.",
    "path": "Settings > Privacy and Safety > Who can send you private messages",
    "risk": "You lock down chat, and the identical abuse arrives through the older private-message system instead.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "followers",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Turn off “Allow people to follow you”",
    "detail": "Followers get a feed of everything you post across every subreddit, which is a far more efficient way to monitor an account than checking a profile. Turning it off does not hide old posts but removes the subscription.",
    "path": "Settings > Privacy and Safety > Allow people to follow you",
    "risk": "Someone monitoring you gets a push notification for every comment you make anywhere.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "block-list",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Use the block list, and know what a block does",
    "detail": "Blocking on Reddit hides that user from you and stops them replying to you or messaging you, but it does not hide your public posts from them — logging out or opening a second account still shows everything. Treat it as noise removal, not concealment.",
    "path": "User profile > the three-dot menu > Block account, or Settings > Safety > Blocked accounts",
    "risk": "You assume a block hides your posts from someone, and it does not.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "ads-activity",
    "group": "Ads and tracking",
    "axis": "Ads & tracking",
    "title": "Turn off ad personalisation based on your Reddit activity",
    "detail": "This stops the subreddits you read being used to target ads at you. It governs how the data is used for targeting, not whether it is collected, which is a distinction worth keeping straight.",
    "path": "Settings > Privacy and Safety > Personalize ads based on your activity on Reddit",
    "risk": "The communities you read — including health, addiction or identity subreddits — drive the ads you are shown.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "ads-partners",
    "group": "Ads and tracking",
    "axis": "Ads & tracking",
    "title": "Turn off ads based on information from third parties",
    "detail": "This is the toggle for data flowing in from outside Reddit — advertising partners and data brokers matching you to an off-platform profile. It is the widest of the ad settings and the one most people never open.",
    "path": "Settings > Privacy and Safety > Personalize ads based on information from our partners",
    "risk": "Off-Reddit browsing and purchase history is matched to your pseudonymous account.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "ads-location",
    "group": "Ads and tracking",
    "axis": "Ads & tracking",
    "title": "Turn off location-based recommendations and ads",
    "detail": "Reddit infers a general location from your IP address and uses it for recommendations and targeting. Switching it off stops the inference driving what you are shown; it does not stop your IP address being received, which is unavoidable.",
    "path": "Settings > Privacy and Safety > Personalize recommendations and ads based on your general location",
    "risk": "Local subreddits and local ads are pushed at you, quietly confirming roughly where you live.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "app-location-permission",
    "group": "Ads and tracking",
    "axis": "Ads & tracking",
    "title": "Deny the Reddit app precise location and background access",
    "detail": "The operating system permission is a stronger control than any in-app toggle, because it cuts off the data at the source. Reddit does not need precise GPS to show you a feed; set it to Never, or at most Approximate and While Using.",
    "path": "iOS Settings > Reddit > Location, or Android Settings > Apps > Reddit > Permissions > Location",
    "risk": "A social app that has no need for GPS receives your exact coordinates in the background.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "outbound-clicks",
    "group": "Ads and tracking",
    "axis": "Ads & tracking",
    "title": "Turn off outbound click logging",
    "detail": "With this on, Reddit records which external links you follow, building a browsing profile that extends past Reddit itself. Turning it off removes that log.",
    "path": "Settings > Privacy and Safety > Allow Reddit to log my outbound clicks",
    "risk": "Every off-site link you open from Reddit is recorded against your account.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "sensitive-ad-categories",
    "group": "Ads and tracking",
    "axis": "Ads & tracking",
    "title": "Opt out of sensitive advertising categories",
    "detail": "Reddit lets you exclude specific ad categories such as alcohol, gambling, dating, pregnancy and weight loss. This matters when a shared screen is involved: an ad category is a public statement about you to anyone standing behind you.",
    "path": "Settings > Privacy and Safety > Sensitive advertising categories",
    "risk": "A pregnancy, dating or gambling ad appears on your screen in front of the wrong person.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "two-factor",
    "group": "Account security",
    "axis": "Account security",
    "title": "Turn on two-factor authentication",
    "detail": "An authenticator app, not SMS. A Reddit account with years of history is a rich target: taking it over exposes every private message and lets someone post as you to communities that trust you.",
    "path": "Settings > Account > Two-factor authentication",
    "risk": "A credential-stuffing attack from an unrelated breach opens your entire message history.",
    "weight": 7,
    "critical": true
  },
  {
    "id": "third-party-apps",
    "group": "Account security",
    "axis": "Account security",
    "title": "Revoke third-party app authorisations you no longer use",
    "detail": "Every app you granted access to still holds a token with whatever scopes it asked for, including reading your private messages in some cases. Old clients, bots and analytics sites accumulate here and nothing ever prompts you to review them.",
    "path": "Settings > Safety and Privacy > Manage third-party app authorization",
    "risk": "A Reddit client you tried once in 2019 still has live read access to your account.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "email-separation",
    "group": "Account security",
    "axis": "Account security",
    "title": "Use an email address that is not tied to your real name",
    "detail": "The address on the account is a lookup key: it links to breach databases, to other services, and often to your name in its local part. An alias that exists only for this account breaks that link and makes password resets safe to receive.",
    "path": "Settings > Account > Email address",
    "risk": "firstname.lastname@ on a pseudonymous account undoes every other item on this list.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "password-unique",
    "group": "Account security",
    "axis": "Account security",
    "title": "Use a password used nowhere else",
    "detail": "Reused passwords are how most social accounts are actually lost — not by being guessed, but by being looked up in a dump from an unrelated site. A password manager and a long random string end that class of attack.",
    "path": "Settings > Account > Change password",
    "risk": "An old breach elsewhere hands someone the password to this account too.",
    "weight": 3,
    "critical": false
  }
];

/** Reporting order of the on-screen sections. */
export const GROUPS = [
  "Identity linkage",
  "What your history reveals",
  "Who can reach you",
  "Ads and tracking",
  "Account security"
];

/** Exposure axes, in reporting order. */
export const AXES = [
  "Identity linkage",
  "History exposure",
  "Contact & messaging",
  "Ads & tracking",
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
    "id": "pseudonymous",
    "name": "Pseudonymous main account",
    "description": "A long-running account you post from freely and do not want traced back to your name. Identity linkage and history carry the weight.",
    "multipliers": {
      "Identity linkage": 1.5,
      "History exposure": 1.3,
      "Contact & messaging": 1,
      "Ads & tracking": 0.8,
      "Account security": 1
    }
  },
  {
    "id": "throwaway",
    "name": "Throwaway or second account",
    "description": "A single-purpose account that must never be connected to your main one. Everything that could correlate the two is weighted up hard.",
    "multipliers": {
      "Identity linkage": 1.7,
      "History exposure": 1.4,
      "Contact & messaging": 0.9,
      "Ads & tracking": 0.7,
      "Account security": 0.9
    }
  },
  {
    "id": "public",
    "name": "Posting under your real name",
    "description": "You are not trying to hide, so hiding scores for little. What you have already published, who can reach you, and account security do the work.",
    "multipliers": {
      "Identity linkage": 0.5,
      "History exposure": 1.2,
      "Contact & messaging": 1.3,
      "Ads & tracking": 1,
      "Account security": 1.5
    }
  },
  {
    "id": "moderator",
    "name": "Subreddit moderator",
    "description": "A visible target for coordinated harassment. Message controls and account security matter most, because losing the account costs a community too.",
    "multipliers": {
      "Identity linkage": 1.2,
      "History exposure": 1,
      "Contact & messaging": 1.5,
      "Ads & tracking": 0.8,
      "Account security": 1.5
    }
  },
  {
    "id": "balanced",
    "name": "Balanced (no re-weighting)",
    "description": "Every setting counts at its base weight, with no profile emphasis applied.",
    "multipliers": {
      "Identity linkage": 1,
      "History exposure": 1,
      "Contact & messaging": 1,
      "Ads & tracking": 1,
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
    "label": "Hard to link",
    "hint": "Nothing on the account points at another identity you own."
  },
  {
    "id": "strong",
    "min": 70,
    "label": "Well separated",
    "hint": "Solid. Close the last few gaps when you have a spare minute."
  },
  {
    "id": "partial",
    "min": 40,
    "label": "Partly separated",
    "hint": "The toggles are done, the history and the handle are not."
  },
  {
    "id": "open",
    "min": 0,
    "label": "Easily linked",
    "hint": "Your handle, your subreddit map and your comments join up in one search."
  }
];

const byId = new Map(CHECKLIST.map((item) => [item.id, item]));
const profileById = new Map(PROFILES.map((item) => [item.id, item]));

/** Ids pre-ticked at first paint. */
export const DEFAULT_DONE = [
  "public-votes",
  "password-unique"
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
