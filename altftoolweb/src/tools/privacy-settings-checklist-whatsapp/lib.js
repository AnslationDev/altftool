/**
 * WhatsApp Privacy Settings Checklist — exposure scoring logic.
 *
 * Pure module: no React, no DOM, no clocks. Same input, same output. Every
 * exported function is total — unusable input returns { error } rather than
 * NaN, Infinity or a misleading score.
 *
 * The model is deliberately not "count the ticked boxes". Each control sits on
 * one exposure AXIS, and a risk profile re-weights those axes, because
 * an encrypted backup matters most to someone protecting a source, while hiding the profile photo and online status matters most to someone being watched by a person who already has their number.
 */

/** Where the settings live, for the on-page instructions. */
export const PLATFORM = {
  "name": "WhatsApp",
  "settingsRoot": "WhatsApp > Settings > Privacy for most controls, Settings > Account for two-step verification, and Settings > Chats > Chat backup for the encrypted-backup option.",
  "note": "WhatsApp encrypts message content end to end, but who you talk to, when you are online and what is in your cloud backup are separate questions that these settings govern."
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
    "id": "last-seen-online",
    "group": "What people can see about you",
    "axis": "Profile visibility",
    "title": "Restrict last seen and the online indicator",
    "detail": "These are two separate settings on the same screen. Last seen can be hidden from everyone, but 'who can see when I'm online' only offers Everyone or 'Same as last seen' — so hiding last seen is the only way to hide the live green indicator too.",
    "path": "Settings > Privacy > Last seen and online",
    "risk": "Anyone with your number can watch when you pick up your phone at 2am, which is the single most used surveillance signal in WhatsApp.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "profile-photo",
    "group": "What people can see about you",
    "axis": "Profile visibility",
    "title": "Limit who can see your profile photo",
    "detail": "Set it to My contacts, or Nobody if you are being targeted. A public WhatsApp photo is routinely scraped and reused to build fake accounts that message your contacts pretending to be you.",
    "path": "Settings > Privacy > Profile photo",
    "risk": "Your face is available to every scammer with a list of numbers, and it is the first thing used in an impersonation.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "about",
    "group": "What people can see about you",
    "axis": "Profile visibility",
    "title": "Limit the About text",
    "detail": "The About line is visible on the same terms as the photo and often carries a job title, a city or a quote that identifies you. Restrict it and keep it generic.",
    "path": "Settings > Privacy > About",
    "risk": "A stranger confirms they have the right person from the one line of text next to your number.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "status-audience",
    "group": "What people can see about you",
    "axis": "Profile visibility",
    "title": "Set the status audience and exclude specific contacts",
    "detail": "Status defaults to all your contacts, which usually includes plumbers, ex-colleagues and people you messaged once. 'My contacts except...' lets you exclude named people permanently rather than remembering each time.",
    "path": "Settings > Privacy > Status",
    "risk": "A status showing your street, your car or your children goes to every number saved in your phone.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "read-receipts",
    "group": "What people can see about you",
    "axis": "Profile visibility",
    "title": "Decide about read receipts",
    "detail": "Turning them off is reciprocal — you also stop seeing when others read your messages — and it does not apply to group chats, where read receipts always work. It removes the pressure of a visible blue tick.",
    "path": "Settings > Privacy > Read receipts",
    "risk": "Someone monitoring you knows the exact second you read each message and can time their next one.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "groups-add",
    "group": "Who can reach and add you",
    "axis": "Messaging & groups",
    "title": "Restrict who can add you to groups",
    "detail": "Set this to 'My contacts' or 'My contacts except...'. People outside the allowed set then have to send an invite you can decline, instead of dropping you into a group where your number is visible to everyone in it.",
    "path": "Settings > Privacy > Groups",
    "risk": "A stranger adds you to a 500-member group and every member now has your phone number and profile photo.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "silence-unknown-callers",
    "group": "Who can reach and add you",
    "axis": "Messaging & groups",
    "title": "Silence calls from unknown numbers",
    "detail": "Calls from numbers not in your contacts are silenced but still listed in the call log and in notifications, so you can call back a genuine one. It stops the international spam-call waves outright.",
    "path": "Settings > Privacy > Calls > Silence unknown callers",
    "risk": "Spam and scam calls ring your phone at all hours, and answering one confirms the number is live.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "block-unknown-messages",
    "group": "Who can reach and add you",
    "axis": "Messaging & groups",
    "title": "Turn on blocking of unknown account messages",
    "detail": "This limits messages from accounts you have never spoken to when they arrive in unusually high volume, which is how bulk scam campaigns work. It sits with the other advanced privacy controls, not with the main list.",
    "path": "Settings > Privacy > Advanced > Block unknown account messages",
    "risk": "Bulk scam campaigns reach your inbox at full volume and drain the battery with background message handling.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "number-visible-in-groups",
    "group": "Who can reach and add you",
    "axis": "Messaging & groups",
    "title": "Accept that every group member can see your number",
    "detail": "There is no setting for this: joining a group hands your phone number and profile photo to every member, including ones added after you. Leave groups you no longer need rather than muting them.",
    "path": "Chat list > review each group > Exit group",
    "risk": "Your number sits in dozens of groups full of strangers, exported by anyone who wants a marketing list.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "block-list",
    "group": "Who can reach and add you",
    "axis": "Messaging & groups",
    "title": "Review the blocked contacts list",
    "detail": "Blocking hides your last seen, online status, profile photo and status updates from that number, and stops calls and messages. It does not tell the other person, but they can still see the account exists.",
    "path": "Settings > Privacy > Blocked contacts",
    "risk": "Someone you meant to block has returned on a new number, or a block you set is no longer in place.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "privacy-checkup",
    "group": "Who can reach and add you",
    "axis": "Messaging & groups",
    "title": "Run the built-in privacy checkup",
    "detail": "WhatsApp's own guided flow walks the main controls in order. It is the fastest way to confirm nothing reset after an app update or a phone migration.",
    "path": "Settings > Privacy > Privacy checkup",
    "risk": "A setting quietly reverted during a restore and you carry on assuming it is still in place.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "community-announcement",
    "group": "Who can reach and add you",
    "axis": "Messaging & groups",
    "title": "Check which communities you belong to",
    "detail": "A community groups several chats under one umbrella and gives admins an announcement channel to everyone in it. Community admins can see the groups you are in within that community.",
    "path": "Chat list > Communities tab > each community > view groups",
    "risk": "A community admin has a broadcast line to you and visibility of which of its groups you joined.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "disappearing-default",
    "group": "Message content and traces",
    "axis": "Content & metadata",
    "title": "Set a default disappearing-message timer",
    "detail": "The default applies to new chats you start and can be set to 24 hours, 7 days or 90 days. It limits what a lost or seized phone reveals without you having to remember to delete anything.",
    "path": "Settings > Privacy > Default message timer",
    "risk": "Years of messages sit on the device, readable by anyone who gets the phone unlocked once.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "chat-lock",
    "group": "Message content and traces",
    "axis": "Content & metadata",
    "title": "Put sensitive chats behind Chat Lock",
    "detail": "Chat Lock moves a conversation into a Locked Chats folder behind biometrics or a device passcode, hides its notification content, and can be given a secret code so the folder itself is hidden from the chat list.",
    "path": "Open the chat > contact name > Lock chat",
    "risk": "Anyone who picks up your unlocked phone reads the one conversation you most needed hidden.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "advanced-chat-privacy",
    "group": "Message content and traces",
    "axis": "Content & metadata",
    "title": "Turn on Advanced Chat Privacy in sensitive chats",
    "detail": "This per-chat setting blocks exporting the conversation, stops media auto-saving to the other person's photo gallery, and keeps the messages out of AI features. It is a per-chat control, not a global one.",
    "path": "Open the chat > contact or group name > Advanced chat privacy",
    "risk": "The other side exports the whole conversation as a text file, or your photos land in their camera roll automatically.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "view-once",
    "group": "Message content and traces",
    "axis": "Content & metadata",
    "title": "Use view-once for photos, knowing its limits",
    "detail": "A view-once photo disappears after being opened and cannot be forwarded, saved or starred. It does not stop a second phone photographing the screen, so treat it as friction rather than protection.",
    "path": "Attach a photo > the '1' icon before sending",
    "risk": "A photo you meant to be momentary sits permanently in someone else's gallery and cloud backup.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "media-visibility",
    "group": "Message content and traces",
    "axis": "Content & metadata",
    "title": "Turn off media visibility in the phone gallery",
    "detail": "By default, WhatsApp photos and videos appear in your phone's photo app, where they sync to whatever cloud backup that app uses and appear in shared albums.",
    "path": "Settings > Chats > Media visibility, or per chat under the contact name",
    "risk": "Every image sent to you is copied into your phone gallery and from there into a cloud photo backup.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "link-previews",
    "group": "Message content and traces",
    "axis": "Content & metadata",
    "title": "Disable link previews",
    "detail": "Generating a preview means your phone fetches the linked page before you open it, which tells that server you received the link. Turning previews off means links are only fetched when you tap them.",
    "path": "Settings > Privacy > Advanced > Disable link previews",
    "risk": "A tracking link tells the sender you received their message, and roughly where you are, before you tap anything.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "ip-protect",
    "group": "Message content and traces",
    "axis": "Content & metadata",
    "title": "Turn on IP address protection in calls",
    "detail": "Normally a WhatsApp call connects the two phones directly, exposing each side's IP address to the other. Relaying calls through WhatsApp servers hides it, at some cost to call quality.",
    "path": "Settings > Privacy > Advanced > Protect IP address in calls",
    "risk": "Anyone who can call you learns your IP address, which places you in a city and identifies your network.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "e2e-backup",
    "group": "Backups and data",
    "axis": "Backups & data",
    "title": "Switch on end-to-end encrypted backup",
    "detail": "Messages are encrypted in transit by default, but the cloud backup is not unless you turn this on. Available since 2021, it protects the backup with a 64-digit key or a password that only you hold — and which nobody can recover for you.",
    "path": "Settings > Chats > Chat backup > End-to-end encrypted backup",
    "risk": "Your entire message history sits in iCloud or Google Drive in a form the cloud provider can hand over on request.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "linked-devices",
    "group": "Backups and data",
    "axis": "Backups & data",
    "title": "Review linked devices and remove old ones",
    "detail": "A linked laptop or web session keeps receiving your messages independently of your phone, and stays linked until it goes 30 days without use. This screen is the first place to check if you suspect someone is reading along.",
    "path": "Settings > Linked devices",
    "risk": "A browser session on a shared or ex-partner's computer keeps mirroring your messages in real time.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "cloud-backup-scope",
    "group": "Backups and data",
    "axis": "Backups & data",
    "title": "Decide what the backup includes and which account it uses",
    "detail": "Backups can exclude videos, which is most of the size, and are tied to a specific Google or Apple account. Check that account is one you still control and that it has its own two-factor protection.",
    "path": "Settings > Chats > Chat backup",
    "risk": "Your message history restores into an old Google account you no longer control, or someone else's.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "request-account-info",
    "group": "Backups and data",
    "axis": "Backups & data",
    "title": "Request your account information report",
    "detail": "The report shows the settings and account metadata WhatsApp holds — not your message content, which it cannot read. It takes about three days to generate and is the way to see what the account itself reveals.",
    "path": "Settings > Account > Request account info",
    "risk": "You never see which devices, settings and metadata are attached to the number in WhatsApp's own records.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "two-step-verification",
    "group": "Account security",
    "axis": "Account security",
    "title": "Turn on two-step verification",
    "detail": "A six-digit PIN is required whenever the number is registered on a new phone. It is the only thing that stops a stolen or ported SIM being turned into a full takeover of your WhatsApp account.",
    "path": "Settings > Account > Two-step verification",
    "risk": "Anyone who intercepts one SMS code — through a SIM swap or a shared phone — takes over the account entirely.",
    "weight": 7,
    "critical": true
  },
  {
    "id": "pin-recovery-email",
    "group": "Account security",
    "axis": "Account security",
    "title": "Add a recovery email for the two-step PIN",
    "detail": "Without an email on file, forgetting the PIN locks you out of the number for a waiting period with no way to shorten it. Use an address protected by its own two-factor authentication.",
    "path": "Settings > Account > Two-step verification > Add email address",
    "risk": "You forget the PIN and are locked out of your own number for days with no recovery route.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "security-notifications",
    "group": "Account security",
    "axis": "Account security",
    "title": "Turn on security notifications for changed security codes",
    "detail": "A security code changes when a contact reinstalls the app or switches phone — and also if someone has taken over their account. Being told means you can verify before sending anything sensitive.",
    "path": "Settings > Account > Security notifications",
    "risk": "A contact's account is taken over and you keep messaging the impersonator with no warning that anything changed.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "app-lock",
    "group": "Account security",
    "axis": "Account security",
    "title": "Put a fingerprint or face lock on the app",
    "detail": "App lock stops someone who already has your unlocked phone from opening WhatsApp. Set the timeout to immediately rather than the default, which leaves a window after each use.",
    "path": "Settings > Privacy > Fingerprint lock / Screen lock",
    "risk": "Handing your unlocked phone to someone for a moment gives them full read access to every conversation.",
    "weight": 4,
    "critical": false
  }
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "What people can see about you",
  "Who can reach and add you",
  "Message content and traces",
  "Backups and data",
  "Account security"
];

/** Exposure axes, in reporting order. */
export const AXES = [
  "Profile visibility",
  "Messaging & groups",
  "Content & metadata",
  "Backups & data",
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
    "name": "Everyday personal use",
    "description": "Ordinary contacts and groups. What strangers can see about you matters most.",
    "multipliers": {
      "Profile visibility": 1.3,
      "Messaging & groups": 1.2,
      "Content & metadata": 1,
      "Backups & data": 0.9,
      "Account security": 1.1
    }
  },
  {
    "id": "safety",
    "name": "Being monitored or leaving an unsafe situation",
    "description": "Someone already has your number. Hiding online status, locking chats and clearing linked devices come first.",
    "multipliers": {
      "Profile visibility": 1.6,
      "Messaging & groups": 1.2,
      "Content & metadata": 1.5,
      "Backups & data": 1.4,
      "Account security": 1.5
    }
  },
  {
    "id": "sensitive",
    "name": "Protecting sources or confidential work",
    "description": "Metadata and backups outrank appearance: encrypted backup, disappearing messages, link previews and IP protection.",
    "multipliers": {
      "Profile visibility": 0.8,
      "Messaging & groups": 0.9,
      "Content & metadata": 1.6,
      "Backups & data": 1.7,
      "Account security": 1.4
    }
  },
  {
    "id": "business",
    "name": "Public or business number",
    "description": "The number is meant to be contactable, so spam filtering and account security carry the score instead of hiding.",
    "multipliers": {
      "Profile visibility": 0.6,
      "Messaging & groups": 1.4,
      "Content & metadata": 1,
      "Backups & data": 1.1,
      "Account security": 1.5
    }
  },
  {
    "id": "balanced",
    "name": "Balanced (no re-weighting)",
    "description": "Every setting counts at its base weight, with no profile emphasis applied.",
    "multipliers": {
      "Profile visibility": 1,
      "Messaging & groups": 1,
      "Content & metadata": 1,
      "Backups & data": 1,
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
    "hint": "Someone with your number learns almost nothing they did not already know."
  },
  {
    "id": "strong",
    "min": 70,
    "label": "Well protected",
    "hint": "The visible leaks are closed. Finish the backup and device checks."
  },
  {
    "id": "partial",
    "min": 40,
    "label": "Partly protected",
    "hint": "Your photo and status are handled; the backup and metadata are not."
  },
  {
    "id": "open",
    "min": 0,
    "label": "Wide open",
    "hint": "Anyone with your number sees your photo, your status and when you are online."
  }
];

const byId = new Map(CHECKLIST.map((item) => [item.id, item]));
const profileById = new Map(PROFILES.map((item) => [item.id, item]));

/** Ids pre-ticked at first paint, because most accounts already have them. */
export const DEFAULT_DONE = [
  "two-step-verification",
  "profile-photo"
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
