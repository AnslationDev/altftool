/**
 * YouTube Privacy Settings Checklist — exposure scoring logic.
 *
 * Pure module: no React, no DOM, no clocks. Same input, same output. Every
 * exported function is total — unusable input returns { error } rather than
 * NaN, Infinity or a misleading score.
 *
 * The model is deliberately not "count the ticked boxes". Each control sits on
 * one exposure AXIS, and a risk profile re-weights those axes, because
 * a viewer who never uploads is exposed mainly through subscriptions, playlists and comment history, while a creator is exposed mainly through channel permissions, moderation settings and what a comment section does to their real name.
 */

/** Where the settings live, for the on-page instructions. */
export const PLATFORM = {
  "name": "YouTube",
  "settingsRoot": "youtube.com > your avatar > Settings. Privacy has the playlist and subscription toggles, History and privacy links out to your Google account, and creator controls live in YouTube Studio.",
  "note": "YouTube's two most important toggles sit on the Privacy tab, while history retention is actually a Google account setting and moderation lives in YouTube Studio."
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
    "id": "subscriptions-private",
    "group": "What your channel shows",
    "axis": "Channel visibility",
    "title": "Keep all your subscriptions private",
    "detail": "One toggle on the Privacy tab hides your entire subscription list from your channel page. Subscriptions are the clearest possible statement of politics, religion, health interests and sexuality, and they are public by default.",
    "path": "youtube.com > Settings > Privacy > Keep all my subscriptions private",
    "risk": "Anyone who finds your channel reads a complete list of what you follow, which is often more revealing than your posts.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "saved-playlists-private",
    "group": "What your channel shows",
    "axis": "Channel visibility",
    "title": "Keep all your saved playlists private",
    "detail": "The companion toggle covers playlists created by other people that you saved. It does not change the visibility of playlists you created yourself, which are set individually.",
    "path": "youtube.com > Settings > Privacy > Keep all my saved playlists private",
    "risk": "Playlists you saved for private reasons appear on your public channel page under your name.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "own-playlists-visibility",
    "group": "What your channel shows",
    "axis": "Channel visibility",
    "title": "Set the visibility of each playlist you created",
    "detail": "Playlists you made carry their own Public, Unlisted or Private setting, and the global toggle does not touch them. Unlisted still means anyone with the link can open it.",
    "path": "youtube.com > You > Playlists > each playlist > Edit > Visibility",
    "risk": "A playlist you built for yourself stays public because the global privacy toggle never applied to it.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "liked-videos-visibility",
    "group": "What your channel shows",
    "axis": "Channel visibility",
    "title": "Make the Liked videos playlist private",
    "detail": "Liked videos is itself a playlist with its own visibility setting, and on older accounts it is public. It is a rolling record of everything you approved of, in order.",
    "path": "youtube.com > You > Liked videos > playlist settings > Private",
    "risk": "Every video you have ever liked is browsable in chronological order by anyone who opens your channel.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "channel-name",
    "group": "What your channel shows",
    "axis": "Channel visibility",
    "title": "Decide whether your channel should carry your real name",
    "detail": "The channel created automatically with your Google account uses your real name and photo, and that name appears on every comment you leave anywhere on YouTube. Changing the channel name and handle changes it everywhere at once.",
    "path": "youtube.com > Settings > Channel > Basic info, or youtube.com/handle",
    "risk": "Your legal name and photo appear beside every comment you have ever left, on any video.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "about-links-email",
    "group": "What your channel shows",
    "axis": "Channel visibility",
    "title": "Clean the channel About page",
    "detail": "The About tab can carry a business email, external links and a description. The email is behind a challenge but is still reachable by anyone who wants it.",
    "path": "YouTube Studio > Customisation > Basic info",
    "risk": "A personal email address and links to your other profiles are published from your channel page.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "channel-country",
    "group": "What your channel shows",
    "axis": "Channel visibility",
    "title": "Check the country shown on your channel",
    "detail": "Channels display a country in the About details. It is coarse, but combined with an accent, a language and video backgrounds it narrows you down considerably.",
    "path": "YouTube Studio > Customisation > Basic info > Country",
    "risk": "One more identifying detail is published for anyone trying to work out where you are.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "watch-history-retention",
    "group": "History and recommendations",
    "axis": "History & recommendations",
    "title": "Set watch-history auto-delete to the shortest option",
    "detail": "YouTube History is a Google account control offering 3, 18 or 36-month auto-delete. Three months keeps recommendations working while limiting what is stored and what can be disclosed.",
    "path": "myaccount.google.com > Data and privacy > YouTube History > Auto-delete",
    "risk": "A complete record of everything you have watched, including health and political content, is kept indefinitely.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "search-history-retention",
    "group": "History and recommendations",
    "axis": "History & recommendations",
    "title": "Set or clear YouTube search history",
    "detail": "Search terms sit under the same YouTube History control but can be cleared separately. They are typed queries, so they read as intent rather than curiosity.",
    "path": "myactivity.google.com > YouTube History > Delete activity by",
    "risk": "Search terms you typed once resurface as autocomplete suggestions on a shared television.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "pause-history",
    "group": "History and recommendations",
    "axis": "History & recommendations",
    "title": "Decide whether to pause history entirely",
    "detail": "Pausing stops new entries, at the cost of recommendations and the ability to resume a video. It also stops the home feed reflecting what you last watched on a shared screen.",
    "path": "youtube.com > Settings > History and privacy > Pause watch history",
    "risk": "Your home page keeps advertising what you watched last night to whoever picks up the remote next.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "incognito-mode",
    "group": "History and recommendations",
    "axis": "History & recommendations",
    "title": "Use incognito for one-off viewing",
    "detail": "Incognito in the YouTube app keeps a viewing session out of your history and recommendations without changing account-wide settings. It is the right tool for a single sensitive search.",
    "path": "YouTube app > your avatar > Turn on Incognito",
    "risk": "A single search you would rather not keep permanently rewrites your recommendations for weeks.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "recommendation-cleanup",
    "group": "History and recommendations",
    "axis": "History & recommendations",
    "title": "Remove individual items from watch history",
    "detail": "Deleting one video from history removes its influence on recommendations, which is finer-grained than clearing everything and losing the useful signal.",
    "path": "youtube.com/feed/history > remove individual entries",
    "risk": "One video keeps pulling your entire feed towards content you do not want on screen.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "restricted-mode",
    "group": "History and recommendations",
    "axis": "History & recommendations",
    "title": "Set Restricted Mode on shared devices",
    "detail": "Restricted Mode filters mature content and is set per browser and per device, not per account, so it has to be turned on everywhere you want it.",
    "path": "youtube.com > Settings > Restricted Mode (bottom of the account menu)",
    "risk": "A device used by a child shows unfiltered content because the setting was only applied elsewhere.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "comment-history-audit",
    "group": "Comments and interaction",
    "axis": "Comments & interaction",
    "title": "Audit your public comment history",
    "detail": "Every comment you have left is listed in one place and each carries your channel name and photo. This is the single largest unnoticed exposure on YouTube, because comments feel ephemeral and are not.",
    "path": "youtube.com/feed/history > Comments",
    "risk": "A decade of opinions, arguments and personal details is searchable, attached to your name and photo.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "automated-filters",
    "group": "Comments and interaction",
    "axis": "Comments & interaction",
    "title": "Set blocked words and automated comment filters",
    "detail": "YouTube Studio lets you block specific words, hold potentially inappropriate comments for review and add your own list. Add your real name, employer and city if you are being targeted.",
    "path": "YouTube Studio > Settings > Community > Automated filters",
    "risk": "Doxxing attempts and abuse appear publicly under your videos before you have a chance to see them.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "hold-for-review",
    "group": "Comments and interaction",
    "axis": "Comments & interaction",
    "title": "Hold new comments for review",
    "detail": "Comments then appear only after you approve them, which turns moderation from cleanup into a gate. It slows engagement, which is the trade-off.",
    "path": "YouTube Studio > Settings > Community > Defaults > Comments on your new videos",
    "risk": "Scam links and abuse sit publicly under your video for hours before anyone notices.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "hidden-users",
    "group": "Comments and interaction",
    "axis": "Comments & interaction",
    "title": "Hide users from your channel rather than arguing",
    "detail": "Hiding a user makes their comments invisible to everyone except themselves, so they usually do not realise and do not escalate. The list is reviewable at any time.",
    "path": "YouTube Studio > Settings > Community > Hidden users",
    "risk": "A persistent commenter keeps a public argument running under your name.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "live-chat-exposure",
    "group": "Comments and interaction",
    "axis": "Comments & interaction",
    "title": "Check what live chat reveals about you",
    "detail": "Live chat messages carry your channel name in real time to everyone watching, and archived streams keep the chat replay. Chat in a stream once and that name is in the archive permanently.",
    "path": "Use a separate channel for chat, or review archived streams you have participated in",
    "risk": "Your channel name appears in the permanent chat replay of a stream you watched years ago.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "ad-personalisation",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Turn off personalised ads for YouTube",
    "detail": "YouTube ads are chosen by the same Google profile that Search and Maps feed. The switch lives in My Ad Center, not in YouTube settings, which is why people miss it.",
    "path": "myadcenter.google.com",
    "risk": "Your watch history is converted into an ad profile that follows you across the web.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "third-party-apps",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Revoke third-party apps with YouTube access",
    "detail": "Analytics dashboards, thumbnail tools and subscriber trackers hold live access to your channel and history. Each grant survives a password change until you revoke it.",
    "path": "myaccount.google.com > Security > Your connections to third-party apps and services",
    "risk": "A tool you tried once still reads your channel data and can post or delete on your behalf.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "shorts-remix",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Decide whether others can remix your videos",
    "detail": "Remixing lets viewers pull your audio or clips into their own Shorts. Disabling it stops your face or voice being reused as the setup for someone else's video.",
    "path": "YouTube Studio > Content > each video > Show more > Allow remixing",
    "risk": "Your clip is rebroadcast inside a stranger's Short with their commentary attached.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "takeout-export",
    "group": "Data and advertising",
    "axis": "Data & ads",
    "title": "Export your YouTube data to see what is held",
    "detail": "Google Takeout produces your watch history, search history, comments, playlists and subscriptions as files. It is the fastest way to see the scale of what exists before deciding what to delete.",
    "path": "takeout.google.com > select YouTube and YouTube Music",
    "risk": "You delete selectively without ever seeing how much there was, and miss whole categories.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "google-2sv",
    "group": "Account and channel access",
    "axis": "Account security",
    "title": "Turn on 2-Step Verification on the Google account",
    "detail": "A YouTube channel is only as secure as the Google account behind it. Use a passkey or a security key; channel hijacking for crypto-scam livestreams almost always starts with a phished password or a session cookie.",
    "path": "myaccount.google.com > Security > 2-Step Verification",
    "risk": "The channel is taken over, renamed and used to run a scam livestream to your subscribers.",
    "weight": 8,
    "critical": true
  },
  {
    "id": "channel-permissions",
    "group": "Account and channel access",
    "axis": "Account security",
    "title": "Review who has manager or editor access to the channel",
    "detail": "Permissions grant editors and managers access without sharing your password, and old collaborators are routinely left in place. Access is per person and revocable at any time.",
    "path": "YouTube Studio > Settings > Permissions",
    "risk": "A former editor still uploads, deletes and reads analytics on a channel they no longer work on.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "brand-account-owners",
    "group": "Account and channel access",
    "axis": "Account security",
    "title": "Check the Brand Account owner list",
    "detail": "A channel on a Brand Account has its own owner list separate from Studio permissions. Ownership is what survives if you lose access to the primary Google account, so it matters more than editor rights.",
    "path": "myaccount.google.com > People and sharing > Brand Accounts",
    "risk": "Someone else is a listed owner of the channel and can remove you from your own account.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "device-signout",
    "group": "Account and channel access",
    "axis": "Account security",
    "title": "Sign out of televisions and old devices",
    "detail": "Smart TVs, consoles and hotel devices stay signed in indefinitely and keep writing to your watch history. Signing out remotely from the account device list is the reliable way to clear them.",
    "path": "myaccount.google.com > Security > Your devices",
    "risk": "A television you sold, or one in a rental, keeps playing and recording under your account.",
    "weight": 3,
    "critical": false
  }
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "What your channel shows",
  "History and recommendations",
  "Comments and interaction",
  "Data and advertising",
  "Account and channel access"
];

/** Exposure axes, in reporting order. */
export const AXES = [
  "Channel visibility",
  "History & recommendations",
  "Comments & interaction",
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
    "id": "viewer",
    "name": "Viewer with an accidental channel",
    "description": "You never upload but you have a channel anyway. Subscriptions, playlists and comment history are the exposure.",
    "multipliers": {
      "Channel visibility": 1.6,
      "History & recommendations": 1.3,
      "Comments & interaction": 1.4,
      "Data & ads": 1,
      "Account security": 0.8
    }
  },
  {
    "id": "creator",
    "name": "Active creator",
    "description": "Publishing is the point, so moderation, channel access and remix rights carry the score instead of hiding.",
    "multipliers": {
      "Channel visibility": 0.7,
      "History & recommendations": 0.8,
      "Comments & interaction": 1.6,
      "Data & ads": 1.2,
      "Account security": 1.8
    }
  },
  {
    "id": "family",
    "name": "Shared television or family account",
    "description": "Other people see this screen, so history, recommendations and Restricted Mode matter most.",
    "multipliers": {
      "Channel visibility": 1,
      "History & recommendations": 1.8,
      "Comments & interaction": 0.8,
      "Data & ads": 1.2,
      "Account security": 1
    }
  },
  {
    "id": "anonymous",
    "name": "Keeping the account unlinked to your name",
    "description": "Channel name, comments and public lists dominate; everything that ties the account to a real identity is weighted up.",
    "multipliers": {
      "Channel visibility": 1.8,
      "History & recommendations": 1,
      "Comments & interaction": 1.7,
      "Data & ads": 0.8,
      "Account security": 1.2
    }
  },
  {
    "id": "balanced",
    "name": "Balanced (no re-weighting)",
    "description": "Every setting counts at its base weight, with no profile emphasis applied.",
    "multipliers": {
      "Channel visibility": 1,
      "History & recommendations": 1,
      "Comments & interaction": 1,
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
    "hint": "Your channel reveals nothing you did not choose to publish."
  },
  {
    "id": "strong",
    "min": 70,
    "label": "Well protected",
    "hint": "The public side is handled. Finish the history and access checks."
  },
  {
    "id": "partial",
    "min": 40,
    "label": "Partly protected",
    "hint": "Some lists are private, but comments or history are still public."
  },
  {
    "id": "open",
    "min": 0,
    "label": "Wide open",
    "hint": "Your subscriptions, playlists and every comment are readable by anyone."
  }
];

const byId = new Map(CHECKLIST.map((item) => [item.id, item]));
const profileById = new Map(PROFILES.map((item) => [item.id, item]));

/** Ids pre-ticked at first paint, because most accounts already have them. */
export const DEFAULT_DONE = [
  "google-2sv"
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
