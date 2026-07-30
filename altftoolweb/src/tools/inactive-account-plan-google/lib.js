/**
 * Google Inactive Account Manager plan builder.
 *
 * Pure logic: no React, no DOM, no clock reads. The "today" reference date is
 * always passed in as an argument.
 */

/** Inactive Account Manager offers exactly these inactivity periods, in months. */
export const INACTIVITY_OPTIONS = [3, 6, 12, 18];

/** Google warns you one month before the inactivity period ends, by email and SMS. */
export const WARNING_LEAD_MONTHS = 1;

/** Trusted contacts have 3 months to download the data they were granted. */
export const DOWNLOAD_WINDOW_MONTHS = 3;

/** If you ask for deletion, it happens 3 months after the trusted contacts are notified. */
export const DELETE_DELAY_MONTHS = 3;

/** Inactive Account Manager allows up to 10 trusted contacts. */
export const MAX_TRUSTED_CONTACTS = 10;

/**
 * Separate from this plan, Google's inactivity policy allows deletion of a
 * Google Account that has not been used for 2 years.
 */
export const GOOGLE_INACTIVITY_POLICY_MONTHS = 24;

export const TIER_WEIGHTS = { essential: 3, recommended: 2, optional: 1 };

/**
 * needsContacts: only shown when at least one trusted contact is being added.
 * needsDeletion: only shown when the account is set to delete itself.
 */
export const STEPS = [
  {
    id: "open-iam",
    title: "Open Inactive Account Manager and start the plan",
    where: "myaccount.google.com > Data & privacy > More options > Make a plan for your digital legacy",
    why: "Nothing in the plan takes effect until it is switched on in the account itself; a written wish has no effect on Google.",
    tier: "essential",
  },
  {
    id: "recovery-details",
    title: "Add a mobile number and a recovery email Google can actually reach",
    where: "The first screen of Inactive Account Manager, and myaccount.google.com > Personal info",
    why: `The warning one month before the trigger is sent by SMS and to the recovery address. If neither works, the plan can fire while you are simply on a long trip.`,
    tier: "essential",
  },
  {
    id: "choose-period",
    title: "Choose the inactivity period deliberately",
    where: "Inactive Account Manager > Decide when Google should consider your account inactive",
    why: `Only ${INACTIVITY_OPTIONS.join(", ")} months are offered. Shorter means your family waits less; longer means less chance of a false trigger.`,
    tier: "essential",
  },
  {
    id: "add-contacts",
    title: "Add the trusted contacts and check every address twice",
    where: "Inactive Account Manager > Notify contacts and share data",
    why: `Up to ${MAX_TRUSTED_CONTACTS} contacts can be notified. A typo means the notification, and the download link, go to a stranger.`,
    tier: "essential",
    needsContacts: true,
  },
  {
    id: "select-data",
    title: "Choose per contact which products they can download",
    where: "Inactive Account Manager > per contact > select data",
    why: "Photos, Drive, Mail and Contacts are chosen separately, so a sibling can receive photos without receiving your mailbox.",
    tier: "essential",
    needsContacts: true,
  },
  {
    id: "tell-contacts",
    title: "Tell each trusted contact that you have named them",
    where: "A conversation, not a setting",
    why: "The notification arrives out of the blue and looks exactly like a phishing email, so people delete it unread.",
    tier: "essential",
    needsContacts: true,
  },
  {
    id: "personal-message",
    title: "Write the personal message that goes with the notification",
    where: "Inactive Account Manager > per contact > personal message",
    why: "A message in your own words is what makes the email credible, and it can carry instructions the data cannot.",
    tier: "recommended",
    needsContacts: true,
  },
  {
    id: "autoresponder",
    title: "Set the Gmail autoresponder for the inactive period",
    where: "Inactive Account Manager > Gmail autoresponder",
    why: "It answers anyone who writes to you afterwards, which prevents a slow drip of confused messages to a dormant mailbox.",
    tier: "optional",
  },
  {
    id: "deletion-decision",
    title: "Decide whether the account should delete itself, and say so explicitly",
    where: "Inactive Account Manager > Should we delete your inactive Google Account?",
    why: `Deletion happens ${DELETE_DELAY_MONTHS} months after the contacts are notified, and it removes Gmail, Photos, Drive and YouTube for good.`,
    tier: "essential",
  },
  {
    id: "download-window",
    title: "Make sure someone will act inside the download window",
    where: "A conversation with the contacts, plus a note in your will or letter of wishes",
    why: `Trusted contacts have ${DOWNLOAD_WINDOW_MONTHS} months from the notification to download the data; after that the link stops working.`,
    tier: "essential",
    needsContacts: true,
  },
  {
    id: "photos-partner",
    title: "Check what a partner account or shared album already gives someone",
    where: "Google Photos > Sharing > Partner sharing, and shared albums",
    why: "Some of what people assume they will inherit is already shared today, which can be simpler than a posthumous download.",
    tier: "recommended",
  },
  {
    id: "takeout-backup",
    title: "Take a Google Takeout export now and store it where the family can find it",
    where: "takeout.google.com",
    why: "A current export in the family safe removes the dependency on any of this working at the moment it is needed.",
    tier: "recommended",
  },
  {
    id: "password-plan",
    title: "Record where credentials live, without writing the password down",
    where: "A password manager with an emergency-access feature, or a sealed note with the executor",
    why: "The account plan only shares data Google holds; the phone, the two-factor device and other accounts are a separate problem.",
    tier: "recommended",
  },
  {
    id: "two-factor-recovery",
    title: "Check two-factor recovery will not lock everyone out",
    where: "myaccount.google.com > Security > 2-Step Verification > backup codes",
    why: "Trusted contacts download without your password, but any other account tied to this one may still need a code from your phone.",
    tier: "recommended",
  },
  {
    id: "review-annually",
    title: "Diarise a yearly review of the contacts and the data selection",
    where: "Your own calendar",
    why: "Relationships, email addresses and what you would want shared all change; the plan does not.",
    tier: "optional",
  },
  {
    id: "legal-note",
    title: "Mention the plan in your will or letter of wishes",
    where: "With your solicitor or the document itself",
    why: "Executors need to know the plan exists. Digital assets and their handling are treated differently in different jurisdictions.",
    tier: "recommended",
  },
];

export const BANDS = [
  { min: 90, label: "Plan complete", tone: "success" },
  { min: 65, label: "Mostly set up", tone: "success" },
  { min: 35, label: "Started", tone: "warning" },
  { min: 0, label: "Not set up", tone: "danger" },
];

function bandFor(score) {
  return BANDS.find((band) => score >= band.min) || BANDS[BANDS.length - 1];
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseIsoDate(value) {
  const match = ISO_DATE.exec(String(value).trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  // Reject impossible days such as 2026-02-30.
  if (day > daysInMonth(year, month - 1)) return null;
  return { year, monthIndex: month - 1, day };
}

function daysInMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function formatParts({ year, monthIndex, day }) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Add whole months, clamping to the last valid day of the target month so that
 * 31 January plus one month is 28 or 29 February rather than rolling into March.
 */
export function addMonths(dateString, months) {
  const parts = parseIsoDate(dateString);
  if (!parts) return { error: "Enter the date as YYYY-MM-DD." };
  const step = Number(months);
  if (!Number.isInteger(step)) return { error: "Months to add must be a whole number." };

  const absolute = parts.year * 12 + parts.monthIndex + step;
  const year = Math.floor(absolute / 12);
  const monthIndex = ((absolute % 12) + 12) % 12;
  const day = Math.min(parts.day, daysInMonth(year, monthIndex));
  return { date: formatParts({ year, monthIndex, day }) };
}

/** Whole days between two ISO dates, b minus a. */
export function daysBetween(a, b) {
  const first = parseIsoDate(a);
  const second = parseIsoDate(b);
  if (!first || !second) return { error: "Enter both dates as YYYY-MM-DD." };
  const msPerDay = 24 * 60 * 60 * 1000;
  const start = Date.UTC(first.year, first.monthIndex, first.day);
  const end = Date.UTC(second.year, second.monthIndex, second.day);
  return { days: Math.round((end - start) / msPerDay) };
}

/**
 * Build the timeline the plan will follow.
 *
 * @param {string} lastActiveDate ISO date of the last account activity
 * @param {number} inactivityMonths one of INACTIVITY_OPTIONS
 * @param {boolean} deleteAccount whether the account is set to delete itself
 */
export function buildTimeline({ lastActiveDate, inactivityMonths, deleteAccount = false } = {}) {
  if (!parseIsoDate(lastActiveDate)) {
    return { error: "Enter the last activity date as YYYY-MM-DD." };
  }
  const months = Number(inactivityMonths);
  if (!INACTIVITY_OPTIONS.includes(months)) {
    return {
      error: `Google only offers ${INACTIVITY_OPTIONS.join(", ")} months as the inactivity period.`,
    };
  }

  const trigger = addMonths(lastActiveDate, months);
  if (trigger.error) return trigger;
  const warning = addMonths(trigger.date, -WARNING_LEAD_MONTHS);
  if (warning.error) return warning;
  const downloadDeadline = addMonths(trigger.date, DOWNLOAD_WINDOW_MONTHS);
  if (downloadDeadline.error) return downloadDeadline;

  const deletion = deleteAccount ? addMonths(trigger.date, DELETE_DELAY_MONTHS) : null;
  if (deletion && deletion.error) return deletion;

  const totalMonths = months + (deleteAccount ? DELETE_DELAY_MONTHS : 0);
  const span = daysBetween(lastActiveDate, deletion ? deletion.date : downloadDeadline.date);

  return {
    lastActiveDate,
    inactivityMonths: months,
    warningDate: warning.date,
    triggerDate: trigger.date,
    downloadDeadline: downloadDeadline.date,
    deletionDate: deletion ? deletion.date : null,
    totalMonths,
    totalDays: span.days,
    // Months of slack between the download deadline and Google's own 2-year
    // inactivity threshold, after which a dormant account can be removed anyway.
    policyMarginMonths: GOOGLE_INACTIVITY_POLICY_MONTHS - (months + DOWNLOAD_WINDOW_MONTHS),
  };
}

/**
 * @param {object} input
 * @param {string} input.lastActiveDate
 * @param {number} input.inactivityMonths
 * @param {number} input.trustedContacts
 * @param {boolean} input.deleteAccount
 * @param {string[]} [input.completed]
 */
export function buildPlan({
  lastActiveDate,
  inactivityMonths,
  trustedContacts,
  deleteAccount = false,
  completed = [],
} = {}) {
  const contacts = Number(trustedContacts);
  if (!Number.isInteger(contacts) || contacts < 0) {
    return { error: "Enter the number of trusted contacts as a whole number, zero or more." };
  }
  if (contacts > MAX_TRUSTED_CONTACTS) {
    return { error: `Inactive Account Manager allows at most ${MAX_TRUSTED_CONTACTS} trusted contacts.` };
  }

  const timeline = buildTimeline({ lastActiveDate, inactivityMonths, deleteAccount });
  if (timeline.error) return { error: timeline.error };

  const doneSet = new Set(Array.isArray(completed) ? completed : []);
  const steps = STEPS.filter(
    (step) => (!step.needsContacts || contacts > 0) && (!step.needsDeletion || deleteAccount),
  ).map((step) => ({ ...step, weight: TIER_WEIGHTS[step.tier], done: doneSet.has(step.id) }));

  const totalWeight = steps.reduce((sum, step) => sum + step.weight, 0);
  const doneWeight = steps.reduce((sum, step) => (step.done ? sum + step.weight : sum), 0);
  const score = totalWeight > 0 ? Math.round((doneWeight / totalWeight) * 100) : 0;

  const essentials = steps.filter((step) => step.tier === "essential");
  const essentialsMissing = essentials.filter((step) => !step.done).length;

  let band = bandFor(score);
  if (essentialsMissing > 0 && band.label === BANDS[0].label) band = BANDS[1];

  const warnings = [];
  if (contacts === 0 && deleteAccount) {
    warnings.push(
      "With no trusted contacts and deletion switched on, everything in the account is destroyed and nobody receives a copy.",
    );
  }
  if (contacts === 0 && !deleteAccount) {
    warnings.push(
      "With no trusted contacts, nobody is notified and no data is shared — the plan only records that the account is inactive.",
    );
  }
  if (timeline.policyMarginMonths <= 6) {
    warnings.push(
      `Only ${timeline.policyMarginMonths} months separate the download deadline from Google's own ${GOOGLE_INACTIVITY_POLICY_MONTHS}-month inactivity policy, under which a dormant account can be removed anyway. A shorter inactivity period leaves more room.`,
    );
  }

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
    timeline,
    contacts,
    warnings,
  };
}
