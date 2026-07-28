/**
 * Discord Privacy Settings Checklist — exposure scoring logic.
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
  "name": "Discord",
  "settingsRoot": "Discord > the cog beside your name > User Settings, then the My Account, Privacy & Safety, Connections, Authorized Apps and Devices tabs.",
  "note": "Two of Discord's most important privacy controls are per-server, not global: the DM filter and the allow-direct-messages toggle each have a default in User Settings and an override inside every individual server."
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
    "id": "dm-filter-global",
    "group": "Who can message you",
    "axis": "Contact & messaging",
    "title": "Set the global direct-message filter to filter messages from everyone",
    "detail": "The safe-messaging filter scans direct messages for explicit images and can be set to filter messages from everyone, including friends. This is the control that stops unsolicited explicit images landing in your inbox from a stranger who shares one server with you.",
    "path": "User Settings > Privacy & Safety > Safe Direct Messaging",
    "risk": "An account you have never spoken to sends an explicit image straight into your DMs, unfiltered.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "dm-allow-default",
    "group": "Who can message you",
    "axis": "Contact & messaging",
    "title": "Turn off “Allow direct messages from server members” as a default",
    "detail": "Left on, joining any server hands every one of its members — which can be hundreds of thousands of accounts — a private channel to you. Turning off the default applies it to servers you join from now on.",
    "path": "User Settings > Privacy & Safety > Allow direct messages from server members",
    "risk": "Joining one large server exposes you to unsolicited DMs from every member of it.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "dm-per-server-override",
    "group": "Who can message you",
    "axis": "Contact & messaging",
    "title": "Fix the per-server DM override on servers you already joined",
    "detail": "The global default only governs servers you join afterwards. Every server you were already in keeps its own copy of the setting, so the global toggle appears to have worked while the old servers stay open. Each one has to be changed individually.",
    "path": "Server name > the dropdown > Privacy Settings > Direct Messages",
    "risk": "You switch off DMs globally, and the twenty servers you joined last year keep letting strangers message you.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "friend-requests",
    "group": "Who can message you",
    "axis": "Contact & messaging",
    "title": "Restrict who can send you friend requests",
    "detail": "Three independent sources — everyone, friends of friends, and server members — each with its own tick box. Unticking “Everyone” while leaving “Server members” on still lets anyone in a shared server request you.",
    "path": "User Settings > Privacy & Safety > Who can add you as a friend",
    "risk": "Request spam from bot accounts, each one an opening for a phishing or crypto scam.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "block-and-report",
    "group": "Who can message you",
    "axis": "Contact & messaging",
    "title": "Know what blocking does and keep the block list current",
    "detail": "Blocking hides that user's messages from you and stops them DMing you, but it does not remove you from servers you share, and they can still see your messages in public channels. It is noise removal, not invisibility.",
    "path": "User profile > the three-dot menu > Block",
    "risk": "You assume a block hides you, and the person still reads everything you post in shared channels.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "username-uniqueness",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Use a username and display name you do not reuse elsewhere",
    "detail": "Discord's move to unique @usernames means your handle is a global, searchable identifier. If it matches your handle on other platforms, the two accounts are joined permanently by a single search.",
    "path": "User Settings > My Account > Username / Display Name",
    "risk": "Your Discord handle matches your Twitch, GitHub or Reddit handle, linking every account you own.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "discoverability-phone-email",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Turn off discovery by phone number and email address",
    "detail": "Discord can match you to people who have your number or address in their contacts. This is what surfaces a gaming account to a colleague or a family member you deliberately never told about it.",
    "path": "User Settings > Privacy & Safety > Server & Friend Discovery",
    "risk": "An account you kept separate is suggested to everyone who has your phone number saved.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "contact-sync-off",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Turn off contact syncing and remove contacts already uploaded",
    "detail": "Syncing uploads your phone book so Discord can suggest people. Switching the toggle off stops future uploads; the contacts already sent need removing separately from the same screen.",
    "path": "User Settings > Friend Requests / Privacy & Safety > Manage contacts",
    "risk": "Your whole address book sits on Discord's servers, powering suggestions in both directions.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "mutual-servers-visibility",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Understand that mutual servers and mutual friends are shown on your profile",
    "detail": "Anyone who can open your profile sees the servers you share with them and your mutual friends. There is no toggle for this, so the control is which servers you join and stay in — leaving a server is what removes the entry.",
    "path": "Behavioural — review your server list and leave the ones you no longer want associated with you",
    "risk": "A stranger reads your interests, community and social circle straight off your profile card.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "server-profile-separation",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Use per-server profiles to keep identities apart",
    "detail": "Discord lets you set a different nickname, avatar and bio inside each server. That is the supported way to keep a work community and a hobby community from sharing one face without running two accounts.",
    "path": "Server name > the dropdown > Edit Server Profile",
    "risk": "The same photo and bio follow you from a professional server into a personal one.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "server-discovery-listing",
    "group": "Who can find you",
    "axis": "Discoverability",
    "title": "Check whether the servers you run are listed in Server Discovery",
    "detail": "A discoverable server is publicly browsable and indexable, and its member list is visible to anyone who joins. If you run one, that decision exposes every member, not only you.",
    "path": "Server Settings > Discovery / Enable Community",
    "risk": "A small private community becomes publicly browsable and its member list readable by anyone.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "activity-status",
    "group": "What you broadcast",
    "axis": "Activity broadcast",
    "title": "Turn off “Display current activity as a status message”",
    "detail": "Discord reads the process list to show what you are running and broadcasts it to everyone who can see your profile — the game, the application, sometimes the document title. It is on by default.",
    "path": "User Settings > Activity Privacy > Display current activity as a status message",
    "risk": "Everyone in every shared server sees what software you are running, and when you are at your desk.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "online-status",
    "group": "What you broadcast",
    "axis": "Activity broadcast",
    "title": "Set your status to Invisible when you do not want to be seen online",
    "detail": "Online status is a presence log. Someone watching your profile learns your waking hours, your working pattern and when you are away from home. Invisible still lets you read and post normally.",
    "path": "Click your avatar > Invisible",
    "risk": "Your daily routine and time zone are readable by anyone who checks your name in a member list.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "spotify-and-rich-presence",
    "group": "What you broadcast",
    "axis": "Activity broadcast",
    "title": "Stop connected services broadcasting what you are listening to or playing",
    "detail": "A linked Spotify, Xbox or PlayStation account publishes a live feed of your activity to your profile. Each connection has its own “Display on profile” switch, separate from the global activity setting.",
    "path": "User Settings > Connections > per-connection “Display on profile”",
    "risk": "A live feed of what you listen to and play runs on your profile all day.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "voice-ip-and-servers",
    "group": "What you broadcast",
    "axis": "Activity broadcast",
    "title": "Do not accept calls or screen shares from people you do not know",
    "detail": "Discord routes voice through its own servers rather than peer-to-peer, so a normal call does not hand over your IP address. The real risk is what you show: a screen share leaks open tabs, file paths, notifications and your real name in a window title.",
    "path": "Behavioural — and share a single window rather than the whole screen",
    "risk": "A screen share exposes your real name in a window title, your file paths and incoming notifications.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "profile-detail",
    "group": "What you broadcast",
    "axis": "Activity broadcast",
    "title": "Strip identifying detail from your bio, pronouns and profile banner",
    "detail": "Profile fields accumulate a city, a school, an age and links to other accounts. Every one of them is visible to anyone who shares a server with you, with no audience control at all.",
    "path": "User Settings > Profiles > About Me",
    "risk": "Your age, city and other handles are on a card any stranger can open from a member list.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "connections-visibility",
    "group": "Data and personalisation",
    "axis": "Data & personalisation",
    "title": "Audit Connections and unlink accounts that identify you",
    "detail": "Connections tie your Discord account to Steam, GitHub, Reddit, Twitter, Spotify and more. Each link is a self-declared mapping between this account and one that may carry your real name, and several also grant read access to the other service.",
    "path": "User Settings > Connections",
    "risk": "A GitHub or Twitter link on your profile hands over your real name and work history in one click.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "authorized-apps",
    "group": "Data and personalisation",
    "axis": "Data & personalisation",
    "title": "Revoke authorised apps and bots you no longer use",
    "detail": "Every OAuth grant you have ever made stays live with the scopes it was given — reading your email address, your server list, sometimes joining servers as you. Nothing prompts you to review them, so they accumulate for years.",
    "path": "User Settings > Authorized Apps",
    "risk": "A bot you authorised once for a giveaway still has live access to your account and server list.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "data-personalisation",
    "group": "Data and personalisation",
    "axis": "Data & personalisation",
    "title": "Turn off “Use data to improve Discord” and personalisation",
    "detail": "These switches govern whether the content of your activity is used to personalise your experience and to build a profile of you. Turning them off is a genuine reduction in processing, though basic operational logging continues either way.",
    "path": "User Settings > Privacy & Safety > How we use your data",
    "risk": "Your messages and activity are processed to build a behavioural profile you never see.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "in-game-rewards",
    "group": "Data and personalisation",
    "axis": "Data & personalisation",
    "title": "Turn off in-game rewards and sponsored quest data sharing",
    "detail": "Quests and in-game reward programmes share play data with advertisers and partners in exchange for cosmetics. Switching them off keeps your game activity out of an advertising pipeline.",
    "path": "User Settings > Privacy & Safety > In-game rewards / Quests",
    "risk": "What and when you play is shared with advertising partners in exchange for a cosmetic item.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "request-your-data",
    "group": "Data and personalisation",
    "axis": "Data & personalisation",
    "title": "Request your data package once, to see what is actually held",
    "detail": "The export shows your message history, the servers you joined, your connections and the analytics events recorded against you. It is the only way to see the real shape of your account rather than guessing at it.",
    "path": "User Settings > Privacy & Safety > Request all of my data",
    "risk": "You tune settings blind, with no idea which of them were ever doing anything.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "message-deletion",
    "group": "Data and personalisation",
    "axis": "Data & personalisation",
    "title": "Accept that deleting your account does not delete your messages",
    "detail": "Discord messages live in the server's channel, not in your account. Deleting or disabling the account leaves your messages in place, reattributed to a Deleted User. Removing them means deleting them yourself, message by message, before you go.",
    "path": "Behavioural — delete messages in the channel before disabling the account",
    "risk": "Years of messages stay readable in every server after you think you have left.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "two-factor",
    "group": "Account security",
    "axis": "Account security",
    "title": "Turn on two-factor authentication with an authenticator app",
    "detail": "Discord account theft is industrialised: a stolen account is used to spam its friend list and its servers with scam links that land with your name attached. An authenticator app, not SMS, is what stops it.",
    "path": "User Settings > My Account > Enable Two-Factor Auth",
    "risk": "Your account is stolen and used to send scam links to every friend and server that trusts you.",
    "weight": 7,
    "critical": true
  },
  {
    "id": "token-hygiene",
    "group": "Account security",
    "axis": "Account security",
    "title": "Never paste code into the browser console, and treat any “free Nitro” link as theft",
    "detail": "The most common Discord compromise is not a password guess — it is being talked into pasting a script that steals your session token, which bypasses two-factor entirely. No legitimate tool, giveaway or moderator ever needs you to do this.",
    "path": "Behavioural — and change your password immediately if you have ever done it, which invalidates tokens",
    "risk": "A stolen session token gives full access to your account without ever needing your password or 2FA code.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "devices-review",
    "group": "Account security",
    "axis": "Account security",
    "title": "Review and log out of unrecognised devices",
    "detail": "The Devices tab lists every active session. Logging out of the ones you do not recognise ends their access immediately, and is the first thing to do after any suspected compromise.",
    "path": "User Settings > Devices",
    "risk": "A session from a shared computer or an attacker's machine stays logged in indefinitely.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "email-separation",
    "group": "Account security",
    "axis": "Account security",
    "title": "Use an email address that does not carry your real name",
    "detail": "The address on the account is a lookup key into breach databases and other services, and often contains your name outright. An alias used only for Discord breaks that link while keeping password resets working.",
    "path": "User Settings > My Account > Email",
    "risk": "firstname.lastname@ on the account undoes the pseudonym you chose for the username.",
    "weight": 3,
    "critical": false
  }
];

/** Reporting order of the on-screen sections. */
export const GROUPS = [
  "Who can find you",
  "Who can message you",
  "What you broadcast",
  "Data and personalisation",
  "Account security"
];

/** Exposure axes, in reporting order. */
export const AXES = [
  "Discoverability",
  "Contact & messaging",
  "Activity broadcast",
  "Data & personalisation",
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
    "description": "You are here for a handful of servers with people you know. Message controls and not being findable carry the weight.",
    "multipliers": {
      "Discoverability": 1.3,
      "Contact & messaging": 1.4,
      "Activity broadcast": 1.1,
      "Data & personalisation": 0.8,
      "Account security": 1
    }
  },
  {
    "id": "teen",
    "name": "Teen or young account",
    "description": "Weighted hardest towards stopping strangers messaging, adding or finding the account at all. Ad and data settings matter least.",
    "multipliers": {
      "Discoverability": 1.4,
      "Contact & messaging": 1.7,
      "Activity broadcast": 1.2,
      "Data & personalisation": 0.7,
      "Account security": 1.1
    }
  },
  {
    "id": "community-owner",
    "name": "Server owner or moderator",
    "description": "You have to stay reachable and visible, so account security and connection hygiene take over from hiding.",
    "multipliers": {
      "Discoverability": 0.6,
      "Contact & messaging": 1.1,
      "Activity broadcast": 1,
      "Data & personalisation": 1.3,
      "Account security": 1.6
    }
  },
  {
    "id": "separate-identity",
    "name": "Keeping this account off your real name",
    "description": "A gaming or hobby account that must not connect to your professional identity. Discoverability and connections are weighted up hard.",
    "multipliers": {
      "Discoverability": 1.6,
      "Contact & messaging": 1,
      "Activity broadcast": 1.3,
      "Data & personalisation": 1.4,
      "Account security": 1.1
    }
  },
  {
    "id": "balanced",
    "name": "Balanced (no re-weighting)",
    "description": "Every setting counts at its base weight, with no profile emphasis applied.",
    "multipliers": {
      "Discoverability": 1,
      "Contact & messaging": 1,
      "Activity broadcast": 1,
      "Data & personalisation": 1,
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
    "hint": "A stranger who shares a server with you learns almost nothing and cannot reach you."
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
    "hint": "The global toggles are done; the per-server overrides probably are not."
  },
  {
    "id": "open",
    "min": 0,
    "label": "Wide open",
    "hint": "Every member of every server you joined can message you and watch what you are doing."
  }
];

const byId = new Map(CHECKLIST.map((item) => [item.id, item]));
const profileById = new Map(PROFILES.map((item) => [item.id, item]));

/** Ids pre-ticked at first paint. */
export const DEFAULT_DONE = [
  "block-and-report",
  "online-status"
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
