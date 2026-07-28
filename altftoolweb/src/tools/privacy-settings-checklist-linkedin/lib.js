/**
 * LinkedIn Privacy Settings Checklist — exposure scoring logic.
 *
 * Pure module: no React, no DOM, no clocks. Same input, same output. Every
 * exported function is total — unusable input returns { error } rather than
 * NaN, Infinity or a misleading score.
 *
 * The model is deliberately not "count the ticked boxes". Each control sits on
 * one exposure AXIS, and a risk profile re-weights those axes, because
 * someone job hunting while employed needs the activity broadcasts silenced above all else, while a recruiter or founder needs to stay maximally visible and should be graded on data sharing and account security instead.
 */

/** Where the settings live, for the on-page instructions. */
export const PLATFORM = {
  "name": "LinkedIn",
  "settingsRoot": "LinkedIn > Me > Settings & Privacy. Visibility holds the profile and activity controls, Data privacy holds sharing, ads and permitted services, and Communications holds who can reach you.",
  "note": "LinkedIn spreads its controls across Visibility, Data privacy and Communications, and the public-profile editor is a separate page again."
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
    "id": "public-profile-settings",
    "group": "Who sees your profile",
    "axis": "Profile visibility",
    "title": "Edit your public profile, section by section",
    "detail": "A separate editor controls what appears to people who are not signed in and to search engines, with a switch per section — experience, education, skills, recommendations. It is the version of you that shows up in a search for your name.",
    "path": "Settings & Privacy > Visibility > Edit your public profile",
    "risk": "Your full employment history is the top result for your name, readable by anyone without a LinkedIn account.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "connections-visibility",
    "group": "Who sees your profile",
    "axis": "Profile visibility",
    "title": "Hide your connections list",
    "detail": "Set it to Only you. Your connections are a map of your employer's staff, your clients and your candidates, and competitors mine exactly this. Shared connections stay visible either way.",
    "path": "Settings & Privacy > Visibility > Who can see your connections",
    "risk": "A competitor or a recruiter lifts your entire client and colleague list straight off your profile.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "profile-viewing-options",
    "group": "Who sees your profile",
    "axis": "Profile visibility",
    "title": "Choose how you appear when you view someone's profile",
    "detail": "Private mode hides your identity when you look at other people — but it also removes your own 'who viewed your profile' list. Semi-private shows your industry and title without your name.",
    "path": "Settings & Privacy > Visibility > Profile viewing options",
    "risk": "The person you researched before an interview or a negotiation sees exactly who was looking.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "profile-photo-visibility",
    "group": "Who sees your profile",
    "axis": "Profile visibility",
    "title": "Set who can see your profile photo",
    "detail": "The options run from your connections through all LinkedIn members to fully public. A public photo is the one most often lifted for fake profiles that then message your contacts.",
    "path": "Settings & Privacy > Visibility > Profile photo visibility",
    "risk": "Your photo is scraped for a fake profile that approaches your colleagues using your face and job title.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "contact-info-profile",
    "group": "Who sees your profile",
    "axis": "Profile visibility",
    "title": "Prune the contact info on your profile",
    "detail": "Email address, phone number, personal website and birthday sit in the contact-info panel and are visible to your connections. Remove the personal mobile number unless you want cold calls.",
    "path": "Profile > Contact info > edit",
    "risk": "Your personal mobile number is available to every connection, including ones you accepted without thinking.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "birthday-visibility",
    "group": "Who sees your profile",
    "axis": "Profile visibility",
    "title": "Restrict or remove the birthday",
    "detail": "Date of birth combined with a full name and employer is a standard identity-verification set. The professional benefit of publishing it is close to nil.",
    "path": "Profile > Contact info > Birthday, or Settings & Privacy > Visibility",
    "risk": "A field used to verify your identity elsewhere is published next to your employer and job title.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "last-name-visibility",
    "group": "Who sees your profile",
    "axis": "Profile visibility",
    "title": "Decide whether to show your full last name",
    "detail": "LinkedIn can show only the first initial of your surname to people outside your network. It is a meaningful reduction if you are avoiding a specific person while staying professionally visible.",
    "path": "Settings & Privacy > Visibility > Name, location and industry",
    "risk": "Someone searching for your exact full name finds you immediately despite everything else being restricted.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "follow-primary",
    "group": "Who sees your profile",
    "axis": "Profile visibility",
    "title": "Decide between follow and connect as the primary action",
    "detail": "Making follow primary means most people end up following rather than connecting, so they see your posts but not your connections list or contact details.",
    "path": "Settings & Privacy > Visibility > Followers > Make follow primary",
    "risk": "You accept connection requests from strangers just to grow reach, and each one gains access to your contact panel.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "open-to-work-visibility",
    "group": "Activity and job-search signals",
    "axis": "Activity signals",
    "title": "Set Open to Work to recruiters only, not all members",
    "detail": "The green #OpenToWork frame announces your job search to everyone including your employer. The recruiters-only option hides the frame, though LinkedIn states it cannot guarantee recruiters at your own company never see it.",
    "path": "Profile > Open to > Finding a new job > Choose who sees you're open",
    "risk": "Your manager sees the green frame on your photo before you have decided to resign.",
    "weight": 6,
    "critical": true
  },
  {
    "id": "profile-update-broadcast",
    "group": "Activity and job-search signals",
    "axis": "Activity signals",
    "title": "Turn off broadcasting of profile updates",
    "detail": "By default, editing your headline, adding a skill or a certification pushes a notification to your entire network. Switch it off before you touch the profile, not after — the notification cannot be recalled.",
    "path": "Settings & Privacy > Visibility > Share profile updates with your network",
    "risk": "Polishing your profile on a Sunday night tells your whole team you are preparing to leave.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "career-interests-signals",
    "group": "Activity and job-search signals",
    "axis": "Activity signals",
    "title": "Review the job-seeking preferences you have stored",
    "detail": "Job titles, locations, start date and salary expectations are stored under your career interests and shared with recruiters using LinkedIn's hiring tools. Check what is there before you assume it is private.",
    "path": "Profile > Open to > Job preferences / Settings & Privacy > Data privacy > Job seeking preferences",
    "risk": "Recruiters see a salary expectation and a start date you entered a year ago and never revisited.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "activity-broadcast",
    "group": "Activity and job-search signals",
    "axis": "Activity signals",
    "title": "Understand that likes and comments appear in other people's feeds",
    "detail": "There is no switch that hides your reactions and comments; they surface to your network as activity on your profile. The only real control is deciding what to engage with publicly.",
    "path": "Profile > Activity > review recent reactions and comments",
    "risk": "A comment on a competitor's hiring post is shown to your colleagues as suggested content.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "post-audience-default",
    "group": "Activity and job-search signals",
    "axis": "Activity signals",
    "title": "Set the audience on each post deliberately",
    "detail": "The post composer remembers the last audience you used, so one public post makes public the default for the next. Connections-only keeps a post inside your network.",
    "path": "Post composer > audience selector, before posting",
    "risk": "A post you meant for your network is public, indexed, and quotable by anyone.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "mentions-tags",
    "group": "Activity and job-search signals",
    "axis": "Activity signals",
    "title": "Control who can mention or tag you",
    "detail": "Tags attach your name to someone else's post and push it to your network as your activity. Restricting who can do it stops engagement-bait posts using your name.",
    "path": "Settings & Privacy > Visibility > Mentions or tags",
    "risk": "A stranger tags you into a promotional post and your network reads it as your endorsement.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "contacts-sync",
    "group": "Messaging and contact",
    "axis": "Contact & messaging",
    "title": "Turn off contact and calendar syncing, then delete what was uploaded",
    "detail": "Syncing sends your phone book and, separately, your calendar entries to LinkedIn to power suggestions. Stopping the sync and removing the already-uploaded data are two separate actions.",
    "path": "Settings & Privacy > Data privacy > Sync contacts / Sync calendar",
    "risk": "Your address book — including clients, doctors and recruiters — sits on LinkedIn's servers driving suggestions.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "invitations-who",
    "group": "Messaging and contact",
    "axis": "Contact & messaging",
    "title": "Restrict who can send you connection invitations",
    "detail": "The tighter option limits invitations to people who already know your email address or appear in your imported contacts, which removes almost all fake-recruiter and romance approaches.",
    "path": "Settings & Privacy > Communications > Invitations to connect",
    "risk": "A stream of fake recruiter profiles reaches you, and one accepted invitation exposes your contact panel.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "messaging-receipts",
    "group": "Messaging and contact",
    "axis": "Contact & messaging",
    "title": "Turn off read receipts and typing indicators",
    "detail": "The setting is reciprocal — you lose the ability to see theirs too. It removes the pressure of an obviously-read message during a negotiation.",
    "path": "Settings & Privacy > Communications > Messaging experience > Read receipts and typing indicators",
    "risk": "A recruiter or hiring manager sees you read their message at 11pm and did not reply.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "research-invitations",
    "group": "Messaging and contact",
    "axis": "Contact & messaging",
    "title": "Opt out of research invitations",
    "detail": "LinkedIn invites members into surveys and research studies through messages that look personal. Opting out removes a category of message entirely.",
    "path": "Settings & Privacy > Communications > Research invitations",
    "risk": "Survey and research messages keep arriving mixed in with genuine professional contact.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "block-report-review",
    "group": "Messaging and contact",
    "axis": "Contact & messaging",
    "title": "Review your blocked list",
    "detail": "Blocking on LinkedIn is mutual and complete: neither profile is visible to the other. It is the right tool for a specific person, and worth checking after a job change.",
    "path": "Settings & Privacy > Visibility > Blocking",
    "risk": "Someone you meant to block is still able to view your profile and see your activity.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "ai-data-use",
    "group": "Data sharing and ads",
    "axis": "Data & ads",
    "title": "Check the generative AI training setting",
    "detail": "LinkedIn added a control governing whether your data and content are used to improve generative AI models. Its default differs by country — it is off in the EEA, the UK and Switzerland and on in several other markets — so check yours rather than assuming.",
    "path": "Settings & Privacy > Data privacy > Data for Generative AI Improvement",
    "risk": "Your posts, profile and messages feed model training under a default you never saw.",
    "weight": 5,
    "critical": true
  },
  {
    "id": "permitted-services",
    "group": "Data sharing and ads",
    "axis": "Data & ads",
    "title": "Revoke permitted services and connected apps",
    "detail": "Third-party tools you signed into with LinkedIn hold live access to profile data and sometimes your connections. Sales and recruiting tools are the ones with the broadest grants.",
    "path": "Settings & Privacy > Data privacy > Other applications > Permitted services",
    "risk": "A sales tool you trialled once still reads your profile and network on a live grant.",
    "weight": 4,
    "critical": true
  },
  {
    "id": "ad-preferences",
    "group": "Data sharing and ads",
    "axis": "Data & ads",
    "title": "Work through the advertising data settings",
    "detail": "A long list of individual toggles governs whether your profile data, connections, employer, interests and off-LinkedIn activity are used to target ads. They have to be switched off one at a time.",
    "path": "Settings & Privacy > Advertising data",
    "risk": "Your employer, seniority and interests are packaged for advertisers to target you by name.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "third-party-data-sharing",
    "group": "Data sharing and ads",
    "axis": "Data & ads",
    "title": "Turn off data sharing with third parties and affiliates",
    "detail": "Separate switches cover sharing with third-party services, with Microsoft affiliates, and for social, economic and workplace research. Each is opt-out and each is on by default in most regions.",
    "path": "Settings & Privacy > Data privacy > How LinkedIn uses your data",
    "risk": "Your professional data leaves LinkedIn for partners you have no relationship with.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "profile-data-for-partners",
    "group": "Data sharing and ads",
    "axis": "Data & ads",
    "title": "Restrict profile data used by permitted services and partners",
    "detail": "Separate from app grants, this governs whether partners can pull your profile data through LinkedIn's own integrations. It is one of the settings most often left at its default.",
    "path": "Settings & Privacy > Data privacy > Other applications",
    "risk": "Partner services pull your profile data through an integration you never explicitly agreed to.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "salary-demographic",
    "group": "Data sharing and ads",
    "axis": "Data & ads",
    "title": "Review salary and demographic data you contributed",
    "detail": "Salary figures and demographic information you submitted are stored against your account even where they are reported only in aggregate. You can review and withdraw them.",
    "path": "Settings & Privacy > Data privacy > Salary data on LinkedIn",
    "risk": "A salary figure you submitted years ago is still attached to your account record.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "get-a-copy",
    "group": "Data sharing and ads",
    "axis": "Data & ads",
    "title": "Download a copy of your LinkedIn data",
    "detail": "The archive shows your messages, connections, ad-targeting inferences and search history. The inferences file is usually the surprise — it lists what LinkedIn concluded about you.",
    "path": "Settings & Privacy > Data privacy > Get a copy of your data",
    "risk": "You tune settings without ever seeing the inferences and message history the account actually holds.",
    "weight": 2,
    "critical": false
  },
  {
    "id": "two-step-verification",
    "group": "Account security",
    "axis": "Account security",
    "title": "Turn on two-step verification with an authenticator app",
    "detail": "Choose the authenticator app over SMS. A hijacked LinkedIn account is used to message your entire professional network with convincing scams under your name and job title.",
    "path": "Settings & Privacy > Sign in and security > Two-step verification",
    "risk": "Your account is taken over and used to run job-offer scams against everyone you have ever worked with.",
    "weight": 7,
    "critical": true
  },
  {
    "id": "active-sessions",
    "group": "Account security",
    "axis": "Account security",
    "title": "Review active sessions and sign out of old devices",
    "detail": "The list shows each device and rough location. Sign out of everything after leaving a job, because a work laptop can keep a live session long after you hand it back.",
    "path": "Settings & Privacy > Sign in and security > Where you're signed in",
    "risk": "A returned work laptop still holds a live session into your personal LinkedIn account.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "email-addresses",
    "group": "Account security",
    "axis": "Account security",
    "title": "Check the email addresses attached to the account",
    "detail": "Old employer addresses are commonly left on the account and are the route back in if someone re-creates that mailbox. Remove any address you no longer control.",
    "path": "Settings & Privacy > Sign in and security > Email addresses",
    "risk": "A former employer's mail admin can reset your personal LinkedIn account through an old work address.",
    "weight": 2,
    "critical": false
  }
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Who sees your profile",
  "Activity and job-search signals",
  "Messaging and contact",
  "Data sharing and ads",
  "Account security"
];

/** Exposure axes, in reporting order. */
export const AXES = [
  "Profile visibility",
  "Activity signals",
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
    "id": "quiet-jobseeker",
    "name": "Job hunting while employed",
    "description": "Nothing must broadcast. Activity signals and Open to Work visibility outrank everything else.",
    "multipliers": {
      "Profile visibility": 1.1,
      "Activity signals": 2,
      "Contact & messaging": 1,
      "Data & ads": 0.7,
      "Account security": 1
    }
  },
  {
    "id": "visible-professional",
    "name": "Recruiter, founder or salesperson",
    "description": "Being findable is the job, so data sharing, connected apps and account security carry the score.",
    "multipliers": {
      "Profile visibility": 0.5,
      "Activity signals": 0.8,
      "Contact & messaging": 1.2,
      "Data & ads": 1.5,
      "Account security": 1.7
    }
  },
  {
    "id": "privacy-first",
    "name": "Present but not exposed",
    "description": "A profile that exists for verification only. Public profile, connections and contact fields dominate.",
    "multipliers": {
      "Profile visibility": 1.8,
      "Activity signals": 1.2,
      "Contact & messaging": 1.3,
      "Data & ads": 1.2,
      "Account security": 1
    }
  },
  {
    "id": "safety",
    "name": "Avoiding a specific person",
    "description": "Discoverability and blocking come first; the connections list and last-name display are weighted up hard.",
    "multipliers": {
      "Profile visibility": 1.9,
      "Activity signals": 1.3,
      "Contact & messaging": 1.6,
      "Data & ads": 0.6,
      "Account security": 1.3
    }
  },
  {
    "id": "balanced",
    "name": "Balanced (no re-weighting)",
    "description": "Every setting counts at its base weight, with no profile emphasis applied.",
    "multipliers": {
      "Profile visibility": 1,
      "Activity signals": 1,
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
    "hint": "You are visible on your terms, and nothing is broadcast by accident."
  },
  {
    "id": "strong",
    "min": 70,
    "label": "Well protected",
    "hint": "The broadcast risks are closed. Tidy the data-sharing settings."
  },
  {
    "id": "partial",
    "min": 40,
    "label": "Partly protected",
    "hint": "The profile is handled but your activity is still announcing things."
  },
  {
    "id": "open",
    "min": 0,
    "label": "Wide open",
    "hint": "Every profile edit is broadcast and your connections list is public."
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
