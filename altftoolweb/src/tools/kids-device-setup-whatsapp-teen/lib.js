/**
 * Teen WhatsApp safety planner.
 *
 * Pure logic: no React, no DOM, no clock reads. The catalogue below lists
 * settings that exist in WhatsApp today, with the menu path for each.
 */

/** WhatsApp's stated minimum age to use the service is 13 in every region. */
export const WHATSAPP_MIN_AGE = 13;

/** A private group invite sent to someone who blocked group adds expires after 72 hours. */
export const GROUP_INVITE_EXPIRY_HOURS = 72;

/** Two-step verification uses a 6-digit PIN, optionally backed by a recovery email. */
export const TWO_STEP_PIN_DIGITS = 6;

/** Reporting a contact forwards the most recent 5 messages from that chat to WhatsApp. */
export const REPORT_MESSAGES_FORWARDED = 5;

/** Score weight per tier. */
export const TIER_WEIGHTS = { essential: 3, recommended: 2, optional: 1 };

export const DEVICES = [
  { id: "android", label: "Android" },
  { id: "ios", label: "iPhone" },
];

export const GROUP_USE = [
  { id: "none", label: "Barely uses groups" },
  { id: "known", label: "Family and close-friend groups only" },
  { id: "school", label: "Class, club and year-group chats" },
  { id: "open", label: "Large groups with people they have never met" },
];

/** Rough stranger-contact exposure of each group pattern before settings are applied. */
export const GROUP_EXPOSURE = { none: 0, known: 1, school: 2, open: 3 };

/**
 * devices: which phone OS the step applies to.
 * groups:  which group-use patterns the step applies to.
 * route:   the stranger-contact route this step closes (used for the open-routes list).
 */
export const STEPS = [
  {
    id: "groups-privacy",
    title: "Set who can add them to groups to 'My contacts'",
    where: "WhatsApp > Settings > Privacy > Groups > My contacts (or My contacts except…)",
    why: `Anyone with the number can otherwise drop them into a group full of strangers. Blocked adders can only send a private invite, which expires after ${GROUP_INVITE_EXPIRY_HOURS} hours.`,
    tier: "essential",
    devices: ["android", "ios"],
    groups: ["none", "known", "school", "open"],
    route: "Being added to a group by someone they do not know",
  },
  {
    id: "silence-unknown-callers",
    title: "Turn on Silence unknown callers",
    where: "Settings > Privacy > Calls > Silence unknown callers",
    why: "Calls from numbers not in contacts stop ringing but still appear in the call list, which kills scam and pressure calls without hiding them.",
    tier: "essential",
    devices: ["android", "ios"],
    groups: ["none", "known", "school", "open"],
    route: "Cold calls from unknown numbers",
  },
  {
    id: "profile-photo",
    title: "Limit profile photo to 'My contacts'",
    where: "Settings > Privacy > Profile photo > My contacts",
    why: "A public profile photo is visible to every stranger who has the number, and gets scraped and reused in fake profiles.",
    tier: "essential",
    devices: ["android", "ios"],
    groups: ["none", "known", "school", "open"],
    route: "Strangers seeing their face and name",
  },
  {
    id: "about-and-status",
    title: "Limit About and Status to 'My contacts' or a custom list",
    where: "Settings > Privacy > About, then Settings > Privacy > Status",
    why: "Status updates leak school, location and routine more than any other part of the app; a custom list keeps them to real friends.",
    tier: "essential",
    devices: ["android", "ios"],
    groups: ["known", "school", "open"],
    route: "Status posts revealing routine and location",
  },
  {
    id: "last-seen-online",
    title: "Set Last seen and 'Who can see when I'm online' to My contacts",
    where: "Settings > Privacy > Last seen and online",
    why: "Online presence is what turns 'why aren't you replying' into pressure, and it tells strangers when the phone is in hand.",
    tier: "recommended",
    devices: ["android", "ios"],
    groups: ["none", "known", "school", "open"],
    route: "Anyone tracking when they are online",
  },
  {
    id: "two-step-verification",
    title: `Turn on two-step verification with a ${TWO_STEP_PIN_DIGITS}-digit PIN`,
    where: "Settings > Account > Two-step verification",
    why: "Without a PIN, anyone who gets a one-time SMS code can take over the account and message every contact as your teenager.",
    tier: "essential",
    devices: ["android", "ios"],
    groups: ["none", "known", "school", "open"],
    route: "Account takeover through a stolen SMS code",
  },
  {
    id: "encrypted-backup",
    title: "Turn on end-to-end encrypted chat backup",
    where: "Settings > Chats > Chat backup > End-to-end encrypted backup",
    why: "A normal cloud backup is readable by whoever can get into the Google or Apple account; the encrypted one needs a password or 64-digit key.",
    tier: "recommended",
    devices: ["android", "ios"],
    groups: ["none", "known", "school", "open"],
  },
  {
    id: "block-and-report",
    title: "Practise block and report together, once",
    where: "Open the chat > tap the contact name > Block / Report",
    why: `Reporting sends WhatsApp the last ${REPORT_MESSAGES_FORWARDED} messages from that chat, so a teen who reports early gives moderators something to act on.`,
    tier: "essential",
    devices: ["android", "ios"],
    groups: ["none", "known", "school", "open"],
    route: "Not knowing how to end contact with a specific person",
  },
  {
    id: "privacy-checkup",
    title: "Walk through Privacy checkup together",
    where: "Settings > Privacy > Privacy checkup",
    why: "It steps through contact, personal-info and chat-security settings in order, which is a faster review than hunting menus.",
    tier: "recommended",
    devices: ["android", "ios"],
    groups: ["none", "known", "school", "open"],
  },
  {
    id: "protect-ip-calls",
    title: "Turn on 'Protect IP address in calls'",
    where: "Settings > Privacy > Advanced > Protect IP address in calls",
    why: "It relays calls through WhatsApp's servers so the other person's app cannot read the phone's IP address and infer a rough location.",
    tier: "recommended",
    devices: ["android", "ios"],
    groups: ["school", "open"],
    route: "Location inferred from a call connection",
  },
  {
    id: "disable-link-previews",
    title: "Turn off link previews",
    where: "Settings > Privacy > Advanced > Disable link previews",
    why: "Previews are generated by fetching the link, which tells the sender's server that the message was opened and from roughly where.",
    tier: "optional",
    devices: ["android", "ios"],
    groups: ["school", "open"],
  },
  {
    id: "advanced-chat-privacy",
    title: "Switch on Advanced chat privacy in sensitive chats",
    where: "Open the chat > tap the chat name > Advanced chat privacy",
    why: "It blocks exporting the chat, stops media auto-saving to the other person's gallery, and keeps the messages out of AI features.",
    tier: "recommended",
    devices: ["android", "ios"],
    groups: ["known", "school", "open"],
  },
  {
    id: "disappearing-default",
    title: "Set a default disappearing-message timer",
    where: "Settings > Privacy > Default message timer > 24 hours, 7 days or 90 days",
    why: "Old chats are the material used in screenshot bullying; a default timer limits how much history exists to be dug up.",
    tier: "optional",
    devices: ["android", "ios"],
    groups: ["known", "school", "open"],
  },
  {
    id: "media-visibility-android",
    title: "Turn off Media visibility so received photos stay out of the gallery",
    where: "Settings > Chats > Media visibility (or per chat > Media visibility)",
    why: "Unsolicited images otherwise land in the phone gallery, where they get backed up and shared by accident.",
    tier: "recommended",
    devices: ["android"],
    groups: ["known", "school", "open"],
  },
  {
    id: "save-to-photos-ios",
    title: "Turn off 'Save to Photos' for received media",
    where: "Settings > Chats > Save to Photos (off)",
    why: "Unsolicited images otherwise land in the Photos library and sync to iCloud, where they are far harder to get rid of.",
    tier: "recommended",
    devices: ["ios"],
    groups: ["known", "school", "open"],
  },
  {
    id: "app-lock",
    title: "Turn on the app lock (fingerprint or Face ID)",
    where: "Settings > Privacy > App lock / Screen lock",
    why: "Stops classmates opening WhatsApp on a briefly unattended phone and posting as your teenager.",
    tier: "recommended",
    devices: ["android", "ios"],
    groups: ["known", "school", "open"],
  },
  {
    id: "live-location-audit",
    title: "Check nothing is sharing live location",
    where: "Settings > Privacy > Live location — it lists every chat currently receiving location",
    why: "Live location shares are easy to start during a meet-up and easy to forget about afterwards.",
    tier: "essential",
    devices: ["android", "ios"],
    groups: ["known", "school", "open"],
    route: "A live location share left running",
  },
  {
    id: "leave-open-groups",
    title: "Review and leave large groups where they know nobody",
    where: "Chats > group > group info > member list, then Exit group",
    why: "Every member of a group can see their number and profile photo, so one open group exposes them to everyone in it.",
    tier: "essential",
    devices: ["android", "ios"],
    groups: ["open"],
    route: "Number and photo visible to every member of an open group",
  },
  {
    id: "number-sharing-rule",
    title: "Agree the rule: the number is not posted in bios, games or public profiles",
    where: "A conversation, not a setting",
    why: "Most unwanted WhatsApp contact starts with the number being posted somewhere public rather than with a WhatsApp setting.",
    tier: "essential",
    devices: ["android", "ios"],
    groups: ["none", "known", "school", "open"],
    route: "The number circulating outside their contact list",
  },
];

export const BANDS = [
  { min: 90, label: "Well protected", tone: "success" },
  { min: 65, label: "Mostly covered", tone: "success" },
  { min: 35, label: "Half done", tone: "warning" },
  { min: 0, label: "Wide open", tone: "danger" },
];

function bandFor(score) {
  return BANDS.find((band) => score >= band.min) || BANDS[BANDS.length - 1];
}

/**
 * @param {object} input
 * @param {number} input.age        teen's age in years
 * @param {string} input.device     one of DEVICES ids
 * @param {string} input.groupUse   one of GROUP_USE ids
 * @param {string[]} [input.completed]
 */
export function buildPlan({ age, device, groupUse, completed = [] } = {}) {
  const years = Number(age);
  if (!Number.isFinite(years)) return { error: "Enter the teenager's age in years." };
  if (years < WHATSAPP_MIN_AGE) {
    return {
      error: `WhatsApp's minimum age is ${WHATSAPP_MIN_AGE}. Below that the account should not be created at all, so there is nothing to configure.`,
    };
  }
  if (years > 19) return { error: "Enter an age between 13 and 19." };
  if (!DEVICES.some((item) => item.id === device)) return { error: "Choose the phone they use." };
  if (!GROUP_USE.some((item) => item.id === groupUse)) {
    return { error: "Choose how they use WhatsApp groups." };
  }

  const doneSet = new Set(Array.isArray(completed) ? completed : []);

  const steps = STEPS.filter(
    (step) => step.devices.includes(device) && step.groups.includes(groupUse),
  ).map((step) => ({ ...step, weight: TIER_WEIGHTS[step.tier], done: doneSet.has(step.id) }));

  const totalWeight = steps.reduce((sum, step) => sum + step.weight, 0);
  const doneWeight = steps.reduce((sum, step) => (step.done ? sum + step.weight : sum), 0);
  const score = totalWeight > 0 ? Math.round((doneWeight / totalWeight) * 100) : 0;

  const essentials = steps.filter((step) => step.tier === "essential");
  const essentialsMissing = essentials.filter((step) => !step.done).length;

  let band = bandFor(score);
  if (essentialsMissing > 0 && band.label === BANDS[0].label) band = BANDS[1];

  const openRoutes = steps
    .filter((step) => !step.done && step.route)
    .map((step) => step.route);

  return {
    steps,
    totalSteps: steps.length,
    doneSteps: steps.filter((step) => step.done).length,
    remaining: steps.filter((step) => !step.done),
    totalWeight,
    doneWeight,
    score,
    band: band.label,
    tone: band.tone,
    essentialsTotal: essentials.length,
    essentialsMissing,
    openRoutes,
    exposure: GROUP_EXPOSURE[groupUse],
    minAge: WHATSAPP_MIN_AGE,
  };
}
