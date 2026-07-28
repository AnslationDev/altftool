/**
 * TikTok Privacy Settings Checklist — exposure scoring logic.
 *
 * Pure module: no React, no DOM, no clocks. Same input, same output. Every
 * exported function is total — unusable input returns { error } rather than
 * NaN, Infinity or a misleading score.
 *
 * The model is deliberately not "count the ticked boxes". Each control sits on
 * one exposure AXIS, and a risk profile re-weights those axes, because
 * a private personal account is protected mostly by account visibility, while a creator who must stay public is protected by content permissions, comment filtering and DM controls instead.
 */

/** Where the settings live, for the on-page instructions. */
export const PLATFORM = {
  "name": "TikTok",
  "settingsRoot": "TikTok > Profile > the three lines > Settings and privacy. Privacy holds account visibility and the per-feature permissions, Ads holds personalisation, and Security and permissions holds two-step verification and connected apps.",
  "note": "TikTok's per-feature permissions — duet, stitch, downloads, comments — are set once for the account and can also be overridden on individual videos."
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
    "id": "private-account",
    "group": "Account visibility",
    "axis": "Account visibility",
    "title": "Switch the account to private",
    "detail": "A private account means only approved followers see your videos, and it also disables duet and stitch on them entirely. Accounts registered as 13 to 15 are set to private by default; older accounts are not.",
    "path": "Settings and privacy > Privacy > Private account",
    "risk": "Every video is public, downloadable and eligible for the For You feed of people you have never met.",
    "weight": 7,
    "critical": true
  },
  {
    "id": "suggest-account",
    "group": "Account visibility",
    "axis": "Account visibility",
    "title": "Turn off every 'suggest your account to others' option",
    "detail": "Four separate switches decide whether you are suggested to your phone contacts, your Facebook friends, people who open your profile link and people with mutual connections. All four have to be turned off individually.",
    "path": "Settings and privacy > Privacy > Suggest your account to others",
    "risk": "Your account is recommended to colleagues, family and anyone with your number, even on a private account.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "sync-contacts",
    "group": "Account visibility",
    "axis": "Account visibility",
    "title": "Turn off contact and Facebook syncing, then delete what was uploaded",
    "detail": "Syncing sends your address book and Facebook friend graph to TikTok. The toggle stops future syncing; removing what was already uploaded is a separate action on the same screen.",
    "path": "Settings and privacy > Privacy > Sync contacts and Facebook friends",
    "risk": "Your address book keeps generating suggestions that point people at an account you kept separate.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "liked-videos",
    "group": "Account visibility",
    "axis": "Account visibility",
    "title": "Set liked videos to 'Only me'",
    "detail": "The liked-videos tab on your profile is a chronological record of everything you approved of, and on many accounts it is visible to followers or to everyone.",
    "path": "Settings and privacy > Privacy > Liked videos",
    "risk": "Anyone who opens your profile reads a full list of what you have liked, in order.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "following-follower-lists",
    "group": "Account visibility",
    "axis": "Account visibility",
    "title": "Hide your following and follower lists",
    "detail": "Both lists have their own visibility setting. Who you follow is often enough to identify you from overlapping local, school and workplace accounts.",
    "path": "Settings and privacy > Privacy > Following list / Followers list",
    "risk": "Your following list identifies your school, workplace and city despite an anonymous username.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "profile-views",
    "group": "Account visibility",
    "axis": "Account visibility",
    "title": "Decide about profile view history",
    "detail": "Profile views is reciprocal: turning it on lets you see who viewed your profile and lets them see when you viewed theirs. Off in both directions is the private option.",
    "path": "Settings and privacy > Privacy > Profile views",
    "risk": "The person whose profile you checked is told you looked at it.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "video-view-history",
    "group": "Account visibility",
    "axis": "Account visibility",
    "title": "Turn off video watch history sharing",
    "detail": "The equivalent setting for videos tells creators you follow that you watched theirs. It is separate from profile views and is on by default for many accounts.",
    "path": "Settings and privacy > Privacy > Video views",
    "risk": "Creators you follow are shown that you watched their video, and when.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "download-permissions",
    "group": "What people can do with your videos",
    "axis": "Content permissions",
    "title": "Turn off video downloads",
    "detail": "Downloads let anyone save your video with the watermark to their camera roll and re-upload it anywhere. Switching it off is the single most effective control against reposting, though screen recording remains possible.",
    "path": "Settings and privacy > Privacy > Downloads",
    "risk": "Your video is saved and re-uploaded on other platforms, often with the watermark cropped off.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "duet-permissions",
    "group": "What people can do with your videos",
    "axis": "Content permissions",
    "title": "Restrict who can duet with your videos",
    "detail": "A duet places their video side by side with yours and publishes it to their audience. Restricting it to friends or nobody stops your face being used as the setup for someone else's joke.",
    "path": "Settings and privacy > Privacy > Duet",
    "risk": "Your video is rebroadcast beside a stranger's commentary to an audience you never chose.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "stitch-permissions",
    "group": "What people can do with your videos",
    "axis": "Content permissions",
    "title": "Restrict who can stitch your videos",
    "detail": "A stitch takes a clip from your video into theirs, which makes it easy to quote you out of context. Like duet, it can be set for the account and overridden per video.",
    "path": "Settings and privacy > Privacy > Stitch",
    "risk": "A five-second clip of you is lifted into someone else's video with a meaning you did not intend.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "comment-permissions",
    "group": "What people can do with your videos",
    "axis": "Content permissions",
    "title": "Limit who can comment",
    "detail": "Comments can be limited to friends or turned off entirely, for the account or for one video. Narrowing it removes most drive-by abuse and nearly all bot spam.",
    "path": "Settings and privacy > Privacy > Comments",
    "risk": "Strangers and bots post abuse and scam links under a video showing your face.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "comment-filters",
    "group": "What people can do with your videos",
    "axis": "Content permissions",
    "title": "Set comment keyword filters and review before posting",
    "detail": "You can filter specific keywords, filter spam and offensive comments automatically, or hold all comments for your approval. Add your real name, school and city if you are being targeted.",
    "path": "Settings and privacy > Privacy > Comments > Filter keywords / Filter all comments",
    "risk": "Doxxing attempts appear publicly under your video before you see them.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "story-and-repost",
    "group": "What people can do with your videos",
    "axis": "Content permissions",
    "title": "Check story audience and who sees your reposts",
    "detail": "Stories and reposts have their own audience settings, separate from your videos. Reposting pushes a video to your followers' feeds with your name attached to it.",
    "path": "Settings and privacy > Privacy > Story / Reposts",
    "risk": "A repost puts your name on someone else's content in front of everyone who follows you.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "per-video-override",
    "group": "What people can do with your videos",
    "axis": "Content permissions",
    "title": "Use the per-video privacy settings when posting",
    "detail": "The posting screen repeats the audience, comment, duet and stitch options for that single video. It is the right place to make one video more restricted without changing the account default.",
    "path": "The posting screen, before you tap Post",
    "risk": "A video that needed tighter settings goes out under whatever the account default happened to be.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "direct-messages",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Restrict who can send you direct messages",
    "detail": "Set it to friends or no one. Direct messaging is disabled entirely for accounts registered as under 16, but adult accounts default to a much wider setting.",
    "path": "Settings and privacy > Privacy > Direct messages",
    "risk": "Strangers open a chat directly, which is the entry point for most grooming and sextortion approaches.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "mentions-tags",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Restrict who can mention and tag you",
    "detail": "A mention links your profile from someone else's video or comment and notifies you. Restricting it to friends stops bait tags from scam and engagement-farming accounts.",
    "path": "Settings and privacy > Privacy > Mentions and tags",
    "risk": "Scam accounts tag you into giveaway videos so their viewers see your profile as an endorsement.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "family-pairing",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Set up Family Pairing or Restricted Mode where relevant",
    "detail": "Family Pairing links a parent's account to a teen's to control screen time, direct messages and content filtering. Restricted Mode is a separate, weaker filter that applies to the feed.",
    "path": "Settings and privacy > Family Pairing, and Content preferences > Restricted Mode",
    "risk": "A young account keeps adult-account defaults for messaging and content because nothing was linked.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "live-permissions",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Check your LIVE settings before going live",
    "detail": "Going live streams your surroundings in real time with comments and gifts attached, and the comment audience is set separately from your video comments.",
    "path": "The LIVE setup screen > settings, before starting",
    "risk": "A live stream shows your home interior and a live comment section to an unfiltered audience.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "blocked-accounts",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Review blocked accounts",
    "detail": "Blocking removes them from your followers and hides your content from that account. The list is worth reviewing periodically since determined accounts return on new handles.",
    "path": "Settings and privacy > Privacy > Blocked accounts",
    "risk": "Someone you blocked has returned under a new username and is watching again.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "ad-personalisation",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Turn off personalised ads",
    "detail": "This stops your in-app activity being used to select ads. You still see ads, chosen by context rather than by a profile built from what you watch.",
    "path": "Settings and privacy > Ads > Personalised ads",
    "risk": "What you watch, including sensitive topics, is converted into an advertising profile.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "off-tiktok-activity",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Turn off ads based on data received from partners",
    "detail": "A separate control from personalised ads: it governs the data other apps and websites send TikTok about you. Availability and wording differ by country because of local law.",
    "path": "Settings and privacy > Ads > Ads based on data received from partners",
    "risk": "Sites you visited outside TikTok keep feeding your ad profile even after you turn personalisation off.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "connected-apps",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Revoke connected apps and login permissions",
    "detail": "Third-party services you signed into with TikTok, and apps you granted access to, hold live tokens. Analytics and follower-tracking tools are the usual offenders.",
    "path": "Settings and privacy > Security and permissions > Manage app permissions",
    "risk": "A follower-tracking app you tried once still reads your account and can act on your behalf.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "personalisation-data",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Review the personalisation and data settings",
    "detail": "Separate from ads, this governs how your activity shapes the For You feed and what is used for recommendations. Clearing the watch history resets a feed that has drifted.",
    "path": "Settings and privacy > Content preferences / Personalisation and data",
    "risk": "The feed keeps serving a topic you watched once, in front of whoever can see your screen.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "location-permission",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Set the operating-system location permission",
    "detail": "TikTok can infer approximate location from the network connection regardless, but denying the precise-location permission removes the accurate signal and any background collection.",
    "path": "Phone Settings > Apps > TikTok > Permissions > Location",
    "risk": "Precise location is collected in the background and used for recommendations and ad targeting.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "download-your-data",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Download your TikTok data",
    "detail": "The export includes your profile, video and comment history, direct messages, login history and the ad-interest categories inferred about you. The inferred-interest file is usually the surprise.",
    "path": "Settings and privacy > Account > Download your data",
    "risk": "You change settings without ever seeing the interest categories and login history the account holds.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "two-step-verification",
    "group": "Account security",
    "axis": "Account security",
    "title": "Turn on two-step verification",
    "detail": "Use the authenticator-app option where offered rather than SMS, which a SIM swap defeats. A hijacked account with an audience is immediately used for crypto and giveaway scams.",
    "path": "Settings and privacy > Security and permissions > 2-step verification",
    "risk": "The account is taken over and used to run scams against your followers under your name.",
    "weight": 8,
    "critical": true
  },
  {
    "id": "manage-devices",
    "group": "Account security",
    "axis": "Account security",
    "title": "Review logged-in devices and remove old ones",
    "detail": "The device list shows each session with a location and date. An unfamiliar entry means the credentials leaked, and removing the device ends that session.",
    "path": "Settings and privacy > Security and permissions > Manage devices",
    "risk": "An intruder keeps a live session on the account after you change the password.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "security-alerts",
    "group": "Account security",
    "axis": "Account security",
    "title": "Check the security alerts log",
    "detail": "TikTok records suspicious login attempts and account changes in one place. Reviewing it after any odd notification is faster than trying to reconstruct events later.",
    "path": "Settings and privacy > Security and permissions > Security alerts",
    "risk": "An attempted takeover goes unnoticed because the warning arrived as one notification among many.",
    "weight": 2,
    "critical": false
  }
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Account visibility",
  "What people can do with your videos",
  "Who can reach you",
  "Data and advertising",
  "Account security"
];

/** Exposure axes, in reporting order. */
export const AXES = [
  "Account visibility",
  "Content permissions",
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
    "id": "private-personal",
    "name": "Private personal account",
    "description": "You watch more than you post. Account visibility and suggestion settings dominate the score.",
    "multipliers": {
      "Account visibility": 1.7,
      "Content permissions": 1,
      "Contact & messaging": 1.2,
      "Data & ads": 1,
      "Account security": 1
    }
  },
  {
    "id": "creator",
    "name": "Creator with a public account",
    "description": "Reach is the point, so download, duet, stitch and comment controls carry the weight instead of hiding.",
    "multipliers": {
      "Account visibility": 0.5,
      "Content permissions": 1.8,
      "Contact & messaging": 1.3,
      "Data & ads": 1.1,
      "Account security": 1.6
    }
  },
  {
    "id": "teen",
    "name": "Teen account or a parent checking one",
    "description": "Who can find and message the account comes first, with Family Pairing and DM restrictions weighted up.",
    "multipliers": {
      "Account visibility": 1.6,
      "Content permissions": 1.2,
      "Contact & messaging": 1.8,
      "Data & ads": 0.8,
      "Account security": 1
    }
  },
  {
    "id": "data-minimal",
    "name": "Reducing what TikTok collects",
    "description": "Ad personalisation, partner data, connected apps and location permissions outrank appearance settings.",
    "multipliers": {
      "Account visibility": 0.9,
      "Content permissions": 0.7,
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
      "Account visibility": 1,
      "Content permissions": 1,
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
    "hint": "Nothing is public, nothing is reusable and nobody is being suggested your profile."
  },
  {
    "id": "strong",
    "min": 70,
    "label": "Well protected",
    "hint": "Visibility and reuse are handled. Finish the ads and security checks."
  },
  {
    "id": "partial",
    "min": 40,
    "label": "Partly protected",
    "hint": "The account is tidier but your videos are still downloadable or remixable."
  },
  {
    "id": "open",
    "min": 0,
    "label": "Wide open",
    "hint": "Anyone can find you, download your videos and put them in their own."
  }
];

const byId = new Map(CHECKLIST.map((item) => [item.id, item]));
const profileById = new Map(PROFILES.map((item) => [item.id, item]));

/** Ids pre-ticked at first paint, because most accounts already have them. */
export const DEFAULT_DONE = [
  "two-step-verification"
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
