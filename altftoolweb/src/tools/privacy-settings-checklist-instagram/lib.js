/**
 * Instagram Privacy Settings Checklist — exposure scoring logic.
 *
 * Pure module: no React, no DOM, no clocks. Same input, same output. Every
 * exported function is total — unusable input returns { error } rather than
 * NaN, Infinity or a misleading score.
 *
 * The model is deliberately not "count the ticked boxes". Each control sits on
 * one exposure AXIS, and a risk profile re-weights those axes, because
 * a public creator and someone leaving an abusive relationship need opposite things from the same app: one has to stay findable and needs message and account controls instead, the other needs discoverability shut off entirely.
 */

/** Where the settings live, for the on-page instructions. */
export const PLATFORM = {
  "name": "Instagram",
  "settingsRoot": "Instagram app > profile > the three-line menu > Settings and privacy. Password, two-factor and ad settings now live one level deeper, inside Accounts Centre.",
  "note": "Instagram splits its controls between Settings and privacy and the Meta Accounts Centre, so a setting you cannot find in one is usually in the other."
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
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Switch the account to private",
    "detail": "A private account means only approved followers see posts, reels, stories and your following list. Everything else on this list is a partial fix by comparison, because a public profile is readable by anyone with the link.",
    "path": "Settings and privacy > Account privacy > Private account",
    "risk": "Every post, reel and follower list is readable by anyone, including people you have blocked using a second account.",
    "weight": 7,
    "critical": true
  },
  {
    "id": "contact-sync-off",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Turn off contact syncing and delete contacts already uploaded",
    "detail": "Syncing hands Meta your whole phone book, which is how a pseudonymous account gets suggested to a colleague or an ex. Turning the toggle off does not delete what was already uploaded — use the separate delete option.",
    "path": "Settings and privacy > Accounts Centre > Your information and permissions > Upload contacts",
    "risk": "A private account you never linked to your real name still gets suggested to everyone who has your number saved.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "professional-contact-info",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Hide the contact details on a professional account",
    "detail": "Business and creator accounts show an email, phone number and sometimes a street address behind the contact button, publicly, with no follow required. If the account is personal, switching back to a personal account removes them.",
    "path": "Edit profile > Contact options, or Settings and privacy > Account type and tools",
    "risk": "Your personal phone number and home address are one tap away for every visitor, including bots that scrape them.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "similar-suggestions",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Stop your account being suggested alongside similar accounts",
    "detail": "Instagram recommends your profile to people viewing accounts like yours. Switching it off narrows how often strangers are pushed towards you without searching for you.",
    "path": "Settings and privacy > Account privacy > Similar account suggestions",
    "risk": "Strangers with no connection to you are shown your profile in the suggested-accounts carousel.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "accounts-centre-linking",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Review what is linked in Accounts Centre",
    "detail": "Accounts Centre ties Instagram, Facebook and Threads profiles together for logins, stories and audiences. Unlinking separates the identities so a Facebook contact is not automatically pointed at an Instagram you keep separate.",
    "path": "Settings and privacy > Accounts Centre > Profiles / Connected experiences",
    "risk": "Cross-posting and shared friend suggestions leak one identity into the other without you posting anything.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "search-engine-exposure",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Decide whether the profile should be findable by search engines",
    "detail": "A public Instagram profile, its bio and its posts can be indexed and cached by search engines and reposted on scraper sites. Going private is what removes it; deleting a single post afterwards does not remove copies already made.",
    "path": "Settings and privacy > Account privacy (privacy governs indexing)",
    "risk": "Your bio and photos surface on a search for your name, on sites you have no control over.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "story-close-friends",
    "group": "What people can see",
    "axis": "Content visibility",
    "title": "Build a Close Friends list and use it for personal stories",
    "detail": "Close Friends is the only story audience that is genuinely small. Anything posted to the main story goes to every follower, and on a public account to anyone at all.",
    "path": "Profile menu > Close Friends, then choose Close Friends when posting",
    "risk": "Personal stories, including ones showing your home or child, reach every follower you have ever approved.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "hide-story-from",
    "group": "What people can see",
    "axis": "Content visibility",
    "title": "Set the hide-story-from list",
    "detail": "Hiding a story from specific people is less confrontational than blocking and works for every future story without a reminder. They stay followers and never see the hidden content.",
    "path": "Settings and privacy > Story, live and location > Hide story and live from",
    "risk": "People you would rather not update — an ex, a manager, a landlord — keep seeing every story you post.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "story-resharing-off",
    "group": "What people can see",
    "axis": "Content visibility",
    "title": "Turn off resharing of your posts and stories",
    "detail": "Resharing lets a follower push your post into their own story, where their followers see it. Switching it off keeps a post inside the audience you chose for it.",
    "path": "Settings and privacy > Story, live and location > Allow resharing to stories",
    "risk": "One follower reshares a private-account post and it reaches an audience you never approved.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "old-post-locations",
    "group": "What people can see",
    "axis": "Content visibility",
    "title": "Strip locations from old posts, especially ones near home",
    "detail": "Tagged locations are permanent and searchable, and a cluster of them maps your routine. Edit each post and remove the location; the tag is what identifies the place, not the photo itself.",
    "path": "Open the post > three dots > Edit > tap the location > remove",
    "risk": "Anyone can plot where you live, work and go regularly from a year of tagged posts.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "archive-old-posts",
    "group": "What people can see",
    "axis": "Content visibility",
    "title": "Archive posts you would not publish today",
    "detail": "Archiving hides a post from everyone but keeps it for you, which is the right move for old posts from school or a previous job. It is reversible, unlike deleting.",
    "path": "Open the post > three dots > Archive",
    "risk": "A years-old post keeps representing you to recruiters, clients and strangers who scroll to the bottom.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "highlights-audit",
    "group": "What people can see",
    "axis": "Content visibility",
    "title": "Audit your story highlights",
    "detail": "Highlights are the one part of the profile that never expires, and people forget what is in them. Old highlights routinely contain a flight boarding pass, a school uniform or a house exterior.",
    "path": "Profile > long-press a highlight > Edit highlight",
    "risk": "Documents, addresses and children's faces stay pinned to the top of your profile indefinitely.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "reels-remix",
    "group": "What people can see",
    "axis": "Content visibility",
    "title": "Turn off remixing of your reels",
    "detail": "Remix lets anyone place their own video beside yours and publish it. Disabling it stops your face being used as the setup for someone else's joke or advert.",
    "path": "Settings and privacy > Sharing and reuse > Remix",
    "risk": "Your reel is rebroadcast inside a stranger's video, with their commentary attached to your face.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "allow-downloads",
    "group": "What people can see",
    "axis": "Content visibility",
    "title": "Turn off downloads of your public reels",
    "detail": "Public accounts allow reels to be saved to a viewer's camera roll with the audio and watermark. Turning it off slows down reposting, though screen recording is always possible.",
    "path": "Settings and privacy > Sharing and reuse > Allow downloads",
    "risk": "Your video is saved and re-uploaded elsewhere with your name stripped off.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "tagged-approval",
    "group": "What people can see",
    "axis": "Content visibility",
    "title": "Manually approve tags before they appear on your profile",
    "detail": "Without approval, anyone can attach your profile to their photo and it lands in your tagged tab for all your visitors. Approval turns that from an opt-out into an opt-in.",
    "path": "Settings and privacy > Tags and mentions > Manually approve tags",
    "risk": "Strangers and scam accounts tag you into their posts and it shows on your profile until you notice.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "activity-status",
    "group": "What people can see",
    "axis": "Content visibility",
    "title": "Turn off the activity status",
    "detail": "Activity status shows people you have messaged when you were last active, which is a live presence signal. It works both ways — turning it off means you stop seeing theirs too.",
    "path": "Settings and privacy > Messages and story replies > Show activity status",
    "risk": "Anyone who has messaged you can tell when you are awake, at work or ignoring them.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "dm-from-others",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Stop message requests from people you do not follow",
    "detail": "Message controls decide whether strangers reach your requests folder at all. Setting the 'others on Instagram' category to not receive requests is what actually stops unsolicited images and sextortion approaches.",
    "path": "Settings and privacy > Messages and story replies > Message controls",
    "risk": "Anyone on Instagram can put an image in front of you, which is the entry point for most sextortion scams.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "dm-from-followers",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Set what your followers and the people you follow can send",
    "detail": "The same message-controls screen has separate rows for your followers and for people you follow. Tightening these is what stops a follower you approved years ago from starting a chat today.",
    "path": "Settings and privacy > Messages and story replies > Message controls",
    "risk": "Every approved follower keeps a direct line into your inbox regardless of how long ago you added them.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "group-add-permission",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Restrict who can add you to group chats",
    "detail": "Being silently added to a group exposes your username to every member and is the main vector for crypto and investment spam groups.",
    "path": "Settings and privacy > Messages and story replies > Who can add you to groups",
    "risk": "You are dropped into a 200-person spam group where every member can now message you directly.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "story-replies",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Limit or switch off story replies",
    "detail": "Story replies open a DM thread even from people whose message requests you have blocked, so this is a separate hole from message controls.",
    "path": "Settings and privacy > Messages and story replies > Story replies",
    "risk": "Someone you have restricted from messaging still reaches your inbox by replying to a story.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "comment-controls",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Limit who can comment on your posts",
    "detail": "Comments can be narrowed to people you follow or your followers. That single change removes most drive-by abuse and nearly all comment spam from bot accounts.",
    "path": "Settings and privacy > Comments > Allow comments from",
    "risk": "Bots and strangers post scam links and abuse under photos of you and your family.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "hidden-words",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Switch on Hidden Words for comments and message requests",
    "detail": "Hidden Words filters offensive terms and lets you add your own list, and separately hides message requests that contain them. Add your own name variants, employer and city if you are being targeted.",
    "path": "Settings and privacy > Hidden Words",
    "risk": "Abuse arrives in full view rather than being filtered into a folder you open when you choose.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "restrict-block-review",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Review restricted and blocked accounts",
    "detail": "Restrict is quieter than blocking: their comments are visible only to them and their messages go to a separate folder without notifying you. Reviewing the list also shows accounts you blocked and forgot.",
    "path": "Settings and privacy > Restricted accounts and Blocked accounts",
    "risk": "Someone you meant to restrict is still commenting publicly, or someone you blocked has returned on a new handle.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "mentions-limit",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Limit who can @mention you",
    "detail": "Mentions notify you and link your profile from anyone's post or story. Restricting them to people you follow cuts off bait tags from scam accounts.",
    "path": "Settings and privacy > Tags and mentions > Who can @mention you",
    "risk": "Scam accounts mention you in giveaway posts so their followers see your profile as an apparent endorsement.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "activity-off-meta",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Disconnect your activity off Meta technologies",
    "detail": "Other apps and websites send Meta a record of what you do on them. This screen shows which businesses sent data, lets you clear the history and lets you disconnect it from your account going forward.",
    "path": "Settings and privacy > Accounts Centre > Your information and permissions > Your activity off Meta technologies",
    "risk": "Shops, banks and health sites you visited outside Instagram are still feeding your profile for ad targeting.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "ad-topics",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Restrict sensitive ad topics",
    "detail": "Ad topics let you see less about categories such as alcohol, gambling, parenting and body weight. It reduces what a shared or shoulder-surfed screen reveals about you.",
    "path": "Settings and privacy > Accounts Centre > Ad preferences > Ad topics",
    "risk": "Ads about pregnancy, debt or addiction appear on your screen in front of whoever is sitting next to you.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "location-permission",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Set the app's location permission to 'while using' or off",
    "detail": "This is an operating-system permission, not an Instagram setting, and it is the one that governs background location collection. Precise location can also be downgraded to approximate on both iOS and Android.",
    "path": "Phone Settings > Apps > Instagram > Location (iOS: Settings > Instagram > Location)",
    "risk": "Instagram receives a continuous background trace of where your phone goes, whether or not you post.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "third-party-apps",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Revoke third-party apps connected to the account",
    "detail": "Follower-analytics, scheduling and 'who viewed your profile' apps hold live access tokens. Most breaches of Instagram data come through these, not through Instagram itself.",
    "path": "Settings and privacy > Website permissions > Apps and websites",
    "risk": "A tool you tried once still reads your account and keeps a copy of your follower list and DMs.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "two-factor",
    "group": "Account security",
    "axis": "Account security",
    "title": "Turn on two-factor authentication with an authenticator app",
    "detail": "Choose the authenticator-app option rather than SMS: SMS codes are defeated by a SIM swap, which is the standard method for taking a valuable handle. Save the recovery codes somewhere off the phone.",
    "path": "Settings and privacy > Accounts Centre > Password and security > Two-factor authentication",
    "risk": "A leaked password alone is enough to take the account, and recovery through support is slow and often unsuccessful.",
    "weight": 7,
    "critical": true
  },
  {
    "id": "login-activity",
    "group": "Account security",
    "axis": "Account security",
    "title": "Check where you are logged in and end old sessions",
    "detail": "The login list shows each device and rough location with a date. An entry from a city you have not visited means the password has leaked and everything else on this list is moot until you change it.",
    "path": "Settings and privacy > Accounts Centre > Password and security > Where you're logged in",
    "risk": "An attacker keeps a live session even after you change the password, unless you end the session explicitly.",
    "weight": 5,
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
  "Content visibility",
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
    "id": "personal",
    "name": "Private personal account",
    "description": "Friends and family only. Being hard to find matters more than being reachable.",
    "multipliers": {
      "Discoverability": 1.4,
      "Content visibility": 1.2,
      "Contact & messaging": 1.2,
      "Data & ads": 0.8,
      "Account security": 1
    }
  },
  {
    "id": "creator",
    "name": "Public creator or business",
    "description": "You have to stay findable, so the score leans on message controls, ad data and account security instead of hiding.",
    "multipliers": {
      "Discoverability": 0.5,
      "Content visibility": 1,
      "Contact & messaging": 1.4,
      "Data & ads": 1.2,
      "Account security": 1.4
    }
  },
  {
    "id": "teen",
    "name": "Teen or young account",
    "description": "Weighted towards keeping strangers from finding, messaging or seeing the account at all.",
    "multipliers": {
      "Discoverability": 1.5,
      "Content visibility": 1.3,
      "Contact & messaging": 1.5,
      "Data & ads": 0.9,
      "Account security": 1
    }
  },
  {
    "id": "jobseeker",
    "name": "Job hunting or professional reputation",
    "description": "What a recruiter or client can see is what matters, so old posts, tags and highlights count most.",
    "multipliers": {
      "Discoverability": 0.9,
      "Content visibility": 1.5,
      "Contact & messaging": 0.8,
      "Data & ads": 0.9,
      "Account security": 1.1
    }
  },
  {
    "id": "safety",
    "name": "Leaving an unsafe situation",
    "description": "Everything that could reveal where you are, or let someone reach you, is weighted up hard. Ad settings matter least here.",
    "multipliers": {
      "Discoverability": 1.6,
      "Content visibility": 1.4,
      "Contact & messaging": 1.5,
      "Data & ads": 0.6,
      "Account security": 1.5
    }
  },
  {
    "id": "balanced",
    "name": "Balanced (no re-weighting)",
    "description": "Every setting counts at its base weight, with no profile emphasis applied.",
    "multipliers": {
      "Discoverability": 1,
      "Content visibility": 1,
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
    "hint": "A stranger who lands on your profile learns almost nothing."
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
    "hint": "Your posts, location history and inbox are open to anyone."
  }
];

const byId = new Map(CHECKLIST.map((item) => [item.id, item]));
const profileById = new Map(PROFILES.map((item) => [item.id, item]));

/** Ids pre-ticked at first paint, because most accounts already have them. */
export const DEFAULT_DONE = [
  "two-factor",
  "login-activity"
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
