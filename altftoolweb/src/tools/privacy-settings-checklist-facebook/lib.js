/**
 * Facebook Privacy Settings Checklist — exposure scoring logic.
 *
 * Pure module: no React, no DOM, no clocks. Same input, same output. Every
 * exported function is total — unusable input returns { error } rather than
 * NaN, Infinity or a misleading score.
 *
 * The model is deliberately not "count the ticked boxes". Each control sits on
 * one exposure AXIS, and a risk profile re-weights those axes, because
 * the same account is a different risk depending on why you are auditing it: a job seeker cares about what a stranger reads on the profile, while someone being harassed cares first about not being findable at all.
 */

/** Where the settings live, for the on-page instructions. */
export const PLATFORM = {
  "name": "Facebook",
  "settingsRoot": "Facebook > menu > Settings and privacy > Settings. Password, two-factor, ad preferences and off-platform activity now live in the Meta Accounts Centre at the top of that screen.",
  "note": "Facebook splits its controls between Settings and the Meta Accounts Centre, and several audience settings live on the profile itself rather than in Settings at all."
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
    "id": "search-engine-link",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Stop search engines outside Facebook linking to your profile",
    "detail": "This single toggle decides whether your profile appears in a Google search for your name. It is off by default for nobody — most accounts have it on, which is why old Facebook profiles are the top result for so many people.",
    "path": "Settings and privacy > Settings > Privacy > How people find and contact you > Do you want search engines outside of Facebook to link to your profile?",
    "risk": "Your profile photo, cover photo and public posts are the first result when anyone searches your name.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "friends-list-visibility",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Hide your friends list",
    "detail": "A visible friends list is the map an impersonator uses: they clone your profile, then send requests to everyone on it. The setting is on the profile's Friends tab, not in Settings, which is why it gets missed.",
    "path": "Profile > Friends > pencil / three dots > Edit privacy > Friend list > Only me",
    "risk": "A cloned profile targets your entire friends list, and strangers can map your family and colleagues.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "lookup-phone-email",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Limit who can look you up by phone number and email",
    "detail": "Two separate settings on the same screen. Set both to Friends. These were the fields abused in the large-scale scraping that matched hundreds of millions of phone numbers to Facebook profiles.",
    "path": "Settings and privacy > Settings > Privacy > How people find and contact you",
    "risk": "Anyone holding your phone number or email — including a data broker with a leaked list — can pull up your profile.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "friend-requests-who",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Restrict who can send you friend requests",
    "detail": "Setting this to friends of friends cuts the flow of romance-scam and impersonation requests, which almost always come from accounts with no mutual connections.",
    "path": "Settings and privacy > Settings > Privacy > How people find and contact you > Who can send you friend requests",
    "risk": "A stream of fake accounts reaches your requests, and one accepted request exposes your friends-only posts.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "follower-settings",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Check who can follow you and what followers see",
    "detail": "Followers are separate from friends: they see everything you post as Public without ever sending a request. If you did not intend to have a public audience, restrict followers to friends.",
    "path": "Settings and privacy > Settings > Public posts > Who can follow me",
    "risk": "People you never accepted as friends receive your public posts in their feed indefinitely.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "contact-upload",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Turn off contact uploading and delete uploaded contacts",
    "detail": "Contact syncing from the Facebook or Messenger app feeds the People You May Know engine. The toggle stops future uploads; removing what was already sent is a separate action.",
    "path": "Settings and privacy > Settings > Accounts Centre > Your information and permissions > Upload contacts",
    "risk": "Facebook suggests you to everyone who has your number saved, including people you deliberately avoid.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "limit-past-posts",
    "group": "What people can see",
    "axis": "Content visibility",
    "title": "Run Limit Past Posts",
    "detail": "One action changes every post you ever shared as Public or Friends of friends to Friends only. It is the highest-value single click on Facebook and it cannot be undone in bulk, only post by post.",
    "path": "Settings and privacy > Settings > Privacy > Your activity > Limit who can see past posts",
    "risk": "Fifteen years of public posts, photos and comments stay readable to anyone who opens your profile.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "timeline-review",
    "group": "What people can see",
    "axis": "Content visibility",
    "title": "Turn on review for posts you are tagged in",
    "detail": "Without review, a tag puts someone else's photo on your profile immediately. With it on, nothing appears until you approve it — and you still get the notification either way.",
    "path": "Settings and privacy > Settings > Profile and tagging > Review posts you're tagged in before the post appears on your profile",
    "risk": "Anyone can attach a photo or a scam post to your profile, where your friends read it as yours.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "profile-fields-audit",
    "group": "What people can see",
    "axis": "Content visibility",
    "title": "Set the audience on every About field individually",
    "detail": "Birthday, hometown, workplace, school, relationship status, email and phone each carry their own audience. Date of birth plus hometown is most of what is needed to open credit in your name.",
    "path": "Profile > About > hover each field > audience selector",
    "risk": "Your date of birth, hometown and employer are public, which is the raw material for identity theft.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "default-audience",
    "group": "What people can see",
    "axis": "Content visibility",
    "title": "Set the default audience for future posts",
    "detail": "Facebook remembers the audience of your last post and reuses it. One post shared publicly silently makes Public the default for everything after it until you change it back.",
    "path": "Settings and privacy > Settings > Privacy > Your activity > Who can see your future posts",
    "risk": "A post you meant for friends goes out publicly because of an audience you set months ago and forgot.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "tag-review",
    "group": "What people can see",
    "axis": "Content visibility",
    "title": "Turn on review for tags people add to your own posts",
    "detail": "A separate control from timeline review. It stops someone tagging twenty accounts into your photo, which pushes it to all of their friends as well.",
    "path": "Settings and privacy > Settings > Profile and tagging > Review tags people add to your posts before the tags appear on Facebook",
    "risk": "Someone widens the audience of your own post by tagging people you have never met.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "who-can-post-timeline",
    "group": "What people can see",
    "axis": "Content visibility",
    "title": "Limit who can post on your profile and who sees those posts",
    "detail": "Set posting to Only me if you do not want a wall at all, or keep friends and hide their posts from others. Compromised friend accounts use profile posts to spread scam links.",
    "path": "Settings and privacy > Settings > Profile and tagging > Who can post on your profile",
    "risk": "A hacked friend account posts an investment scam on your profile, signed with your name.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "old-photo-albums",
    "group": "What people can see",
    "axis": "Content visibility",
    "title": "Check the audience on old photo albums",
    "detail": "Profile Pictures, Cover Photos and Mobile Uploads are separate albums with their own audience, and the first two are public by default. Limit Past Posts does not change album-level settings.",
    "path": "Profile > Photos > Albums > each album > audience selector",
    "risk": "Every profile picture you have ever used, with its comments and tags, stays publicly browsable.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "story-audience",
    "group": "What people can see",
    "axis": "Content visibility",
    "title": "Set the story audience and the custom hide list",
    "detail": "Stories carry their own audience setting, separate from posts, and default to a wider one than most people expect. Custom lets you exclude named people without unfriending them.",
    "path": "Story > Story privacy / Settings and privacy > Settings > Stories",
    "risk": "A story showing your street, car or workplace goes to a much wider audience than your posts do.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "check-in-location",
    "group": "What people can see",
    "axis": "Content visibility",
    "title": "Remove check-ins and location tags from old posts",
    "detail": "Check-ins are individually searchable and, taken together, show where you live, where your children go to school and when you are away. Delete the location from the post rather than the post itself if you want to keep it.",
    "path": "Profile > three dots > Activity log > filter by check-ins",
    "risk": "Your home area and routine are reconstructable, and a run of holiday check-ins announces an empty house.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "public-post-comments",
    "group": "What people can see",
    "axis": "Content visibility",
    "title": "Limit who can comment on your public posts",
    "detail": "If any post is public, restricting comments to friends or to people and pages you mention removes the drive-by abuse and the scam replies without making the post private.",
    "path": "Settings and privacy > Settings > Public posts > Public post comments",
    "risk": "Strangers argue and post scam links under a public post that carries your real name.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "messenger-delivery",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Set who can message you and where those messages land",
    "detail": "Message delivery controls decide whether people who are not friends reach your chats, your requests folder, or nowhere at all. Separate rows cover friends of friends, people with your number, and everyone else.",
    "path": "Messenger > Settings > Privacy and safety > Message delivery",
    "risk": "Romance and investment scammers open a chat with you directly, which is how most of them start.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "message-requests-review",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Clear the message requests and spam folders",
    "detail": "Messenger hides two folders most people never open. Old requests there often contain phishing links, and opening one signals to the sender that the account is live.",
    "path": "Messenger > Requests > You may know / Spam",
    "risk": "Phishing and sextortion attempts sit unread, and any reply confirms the account is active.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "restricted-list",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Use the Restricted list instead of unfriending",
    "detail": "Someone on the Restricted list stays a friend but only ever sees posts you share publicly. It is the quiet option for a boss, a client or a relative you do not want to update.",
    "path": "Profile > Friends > Edit friend list / Friends > Restricted",
    "risk": "Colleagues and relatives keep seeing personal posts, or you unfriend them and create an argument.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "block-review",
    "group": "Who can reach you",
    "axis": "Contact & messaging",
    "title": "Review the blocking lists",
    "detail": "The blocking screen holds separate lists for people, messages, app invites, event invites and pages. Blocking a person on Facebook does not automatically block them in Messenger.",
    "path": "Settings and privacy > Settings > Blocking",
    "risk": "Someone you blocked on Facebook still reaches you through Messenger, or has returned on a new account.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "off-facebook-activity",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Clear and disconnect your activity off Meta technologies",
    "detail": "Shops, apps and websites send Meta a record of what you did on them. This screen names every business that sent data, clears the history, and disconnects future activity from your account.",
    "path": "Settings and privacy > Settings > Accounts Centre > Your information and permissions > Your activity off Meta technologies",
    "risk": "Purchases and pages you viewed on unrelated sites, including health and finance ones, keep flowing into your ad profile.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "apps-websites",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Remove apps and games you logged into with Facebook",
    "detail": "Every 'Continue with Facebook' login holds a live permission grant, often including your friends list and email. This list is usually decades long and most entries are for services people no longer use.",
    "path": "Settings and privacy > Settings > Apps and websites",
    "risk": "A defunct quiz app or game still holds a live token to your profile data and your email address.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "location-history",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Turn off location history and set the app permission",
    "detail": "Facebook's own location history is separate from the operating-system permission, and both need attention. Set the phone permission to 'while using' or off, then delete the stored history.",
    "path": "Settings and privacy > Settings > Location, plus phone Settings > Apps > Facebook > Location",
    "risk": "A continuous background trace of everywhere your phone has been sits in your account, ready to be exported or subpoenaed.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "ad-topics-sensitive",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Restrict sensitive ad topics",
    "detail": "Ad topics lets you see less about alcohol, gambling, parenting, body weight and similar categories. It changes what appears on your screen in front of other people.",
    "path": "Settings and privacy > Settings > Accounts Centre > Ad preferences > Ad topics",
    "risk": "Ads about pregnancy, debt, addiction or a health condition surface in front of whoever can see your screen.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "advertisers-uploaded-list",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "See which advertisers uploaded a contact list containing you",
    "detail": "This list names the businesses that gave Meta your email or phone number to target you. It is the clearest evidence of which companies sold or shared your contact details, and you can block each one.",
    "path": "Settings and privacy > Settings > Accounts Centre > Ad preferences > Advertisers > Advertisers who uploaded a contact list with your info",
    "risk": "Companies you never gave permission keep targeting you from a list they bought with your details on it.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "ads-from-partners",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Turn off ads shown from data provided by partners",
    "detail": "A separate control from off-platform activity: it governs whether third-party data is used to pick ads for you. Availability varies by country because of local data-protection law.",
    "path": "Settings and privacy > Settings > Accounts Centre > Ad preferences > Ad settings",
    "risk": "Third-party data brokers keep influencing which ads you are shown even after you clear off-platform activity.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "face-recognition",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Understand the current state of face recognition",
    "detail": "Meta shut down the tag-suggestion face-recognition system in November 2021 and deleted over a billion face templates. Newer facial-recognition features are narrower — detecting celeb-bait scam ads and video-selfie account recovery — are opt-in in some regions and unavailable in others, so check what your account actually offers before assuming either way.",
    "path": "Settings and privacy > Settings > Face recognition (only shown where the feature is available)",
    "risk": "You assume a control exists that does not, or leave an available one at its default without deciding.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "two-factor",
    "group": "Account security",
    "axis": "Account security",
    "title": "Turn on two-factor authentication with an authenticator app",
    "detail": "Pick the authenticator-app method over SMS, because a SIM swap defeats SMS codes. Store the recovery codes somewhere that is not the same phone.",
    "path": "Settings and privacy > Settings > Accounts Centre > Password and security > Two-factor authentication",
    "risk": "A leaked password is enough to take the account, and Facebook account recovery is notoriously slow.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "where-logged-in",
    "group": "Account security",
    "axis": "Account security",
    "title": "Review active sessions and end the ones you do not recognise",
    "detail": "The list shows device, browser and rough location with a date. A session from a country you have not visited means the credentials leaked, and changing the password alone may not end it.",
    "path": "Settings and privacy > Settings > Accounts Centre > Password and security > Where you're logged in",
    "risk": "An intruder keeps a live session and reads your messages long after you change the password.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "login-alerts",
    "group": "Account security",
    "axis": "Account security",
    "title": "Switch on login alerts",
    "detail": "Alerts tell you about a sign-in from an unrecognised device the moment it happens, which is what turns a takeover from a discovery weeks later into something you can stop the same day.",
    "path": "Settings and privacy > Settings > Accounts Centre > Password and security > Login alerts",
    "risk": "An account takeover runs unnoticed until a friend tells you about the messages being sent from it.",
    "weight": 3,
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
    "name": "Personal account, friends only",
    "description": "Ordinary use. Old posts and being findable by strangers are the main worries.",
    "multipliers": {
      "Discoverability": 1.3,
      "Content visibility": 1.3,
      "Contact & messaging": 1,
      "Data & ads": 0.9,
      "Account security": 1
    }
  },
  {
    "id": "jobseeker",
    "name": "Job hunting or professional reputation",
    "description": "What a recruiter or client reads on your profile is what counts, so past posts, tags and About fields dominate.",
    "multipliers": {
      "Discoverability": 1.2,
      "Content visibility": 1.6,
      "Contact & messaging": 0.7,
      "Data & ads": 0.7,
      "Account security": 1
    }
  },
  {
    "id": "public",
    "name": "Public page or community role",
    "description": "You have to stay reachable, so messaging controls, ad data and account security carry the weight instead of hiding.",
    "multipliers": {
      "Discoverability": 0.6,
      "Content visibility": 1,
      "Contact & messaging": 1.4,
      "Data & ads": 1.2,
      "Account security": 1.5
    }
  },
  {
    "id": "safety",
    "name": "Leaving an unsafe situation",
    "description": "Not being findable, and not leaking location, outranks everything. Ad settings matter least here.",
    "multipliers": {
      "Discoverability": 1.7,
      "Content visibility": 1.4,
      "Contact & messaging": 1.4,
      "Data & ads": 0.6,
      "Account security": 1.5
    }
  },
  {
    "id": "scam-target",
    "name": "Worried about scams and impersonation",
    "description": "Friend-list cloning, message scams and hacked-account takeovers, weighted towards contact and security controls.",
    "multipliers": {
      "Discoverability": 1.3,
      "Content visibility": 0.9,
      "Contact & messaging": 1.5,
      "Data & ads": 0.8,
      "Account security": 1.6
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
    "hint": "A stranger searching your name finds a profile that tells them nothing."
  },
  {
    "id": "strong",
    "min": 70,
    "label": "Well protected",
    "hint": "The big exposures are closed. Tidy the remainder when you have time."
  },
  {
    "id": "partial",
    "min": 40,
    "label": "Partly protected",
    "hint": "Recent posts are handled; the old ones and the data settings are not."
  },
  {
    "id": "open",
    "min": 0,
    "label": "Wide open",
    "hint": "A decade of posts, tags and check-ins is readable by anyone."
  }
];

const byId = new Map(CHECKLIST.map((item) => [item.id, item]));
const profileById = new Map(PROFILES.map((item) => [item.id, item]));

/** Ids pre-ticked at first paint, because most accounts already have them. */
export const DEFAULT_DONE = [
  "two-factor",
  "default-audience"
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
