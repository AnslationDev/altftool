/**
 * Wedding Website Privacy Cleanup — scoring rules.
 *
 * Pure module: no React, no DOM, no clock reads.
 *
 * The severity weights below are ordinal risk ranks (1 = cosmetic, 5 = enables a
 * concrete attack such as burglary during a known-empty window, or account takeover
 * via a security-question answer). They are a ranking device, not a probability.
 *
 * The retention rule is not invented: the GDPR storage-limitation principle
 * (Regulation (EU) 2016/679, Article 5(1)(e)) says personal data must be kept in an
 * identifiable form no longer than is necessary for the purpose it was collected for.
 * A guest list collected to plan one event stops being necessary once the event and
 * its thank-you notes are done, so this tool flags anything past 30 days.
 */

/** Severity at or above which an exposure is treated as "fix before you share the link". */
export const CRITICAL_SEVERITY = 4;

/**
 * Days after the event beyond which keeping guest contact records is flagged.
 * Derived from GDPR Art. 5(1)(e) storage limitation applied to a one-off event:
 * one month covers thank-you cards and vendor reconciliation.
 */
export const RECOMMENDED_RETENTION_DAYS = 30;

/** Sanity ceiling on the RSVP record count so a typo cannot produce a nonsense figure. */
export const MAX_GUEST_RECORDS = 5000;

/** Sanity ceiling on "days the page stays public" (10 years). */
export const MAX_DAYS_PUBLIC = 3650;

export const EXPOSURE_GROUPS = [
  { id: "location", label: "Location & timing" },
  { id: "guests", label: "Guest data you collected" },
  { id: "identity", label: "Identity & security answers" },
  { id: "reach", label: "Who can find the page" },
  { id: "media", label: "Photos, video & extras" },
];

/**
 * The catalogue of details that commonly sit on a public wedding page.
 * severity: 1-5 ordinal rank. when: the stage at which the fix belongs.
 */
export const EXPOSURE_ITEMS = [
  {
    id: "home-address",
    group: "location",
    label: "Your home address is printed on the page",
    severity: 5,
    why: "A home address plus a published event date tells anyone reading exactly when the house is empty.",
    fix: "Remove the address entirely. Send it only inside the invitation or a direct message to the people who need it.",
    when: "now",
  },
  {
    id: "honeymoon-dates",
    group: "location",
    label: "Honeymoon or travel dates are public",
    severity: 5,
    why: "This is a published absence window — the single most useful fact for anyone targeting an empty home.",
    fix: "Say 'we're away for a while' with no dates, and post travel photos after you are home.",
    when: "now",
  },
  {
    id: "venue-plus-time",
    group: "location",
    label: "Exact venue, date and ceremony time are all public",
    severity: 3,
    why: "Together these let a stranger show up, and they confirm the hours you and your guests are elsewhere.",
    fix: "Put the venue and time behind the RSVP step so only invited guests see the full detail.",
    when: "before-link",
  },
  {
    id: "couple-phone",
    group: "location",
    label: "A personal mobile number is listed for questions",
    severity: 3,
    why: "Published numbers get scraped, and a mobile number is the recovery channel for most of your accounts.",
    fix: "Use a contact form, or a separate number you only use for the wedding.",
    when: "before-link",
  },
  {
    id: "rsvp-addresses",
    group: "guests",
    label: "The RSVP form collects guests' home addresses",
    severity: 5,
    why: "You become the custodian of a list of homes. If the site is breached, that list leaks with it.",
    fix: "Collect addresses only from the people you post something to, and delete the field once cards are sent.",
    when: "now",
  },
  {
    id: "rsvp-dob",
    group: "guests",
    label: "The RSVP form asks for dates of birth or ID numbers",
    severity: 4,
    why: "A date of birth is a core identity element. Almost no wedding needs one.",
    fix: "Drop the field. If a venue needs ages for alcohol or child pricing, ask for an age band instead.",
    when: "now",
  },
  {
    id: "guest-list-public",
    group: "guests",
    label: "The guest list, seating chart or RSVP replies are visible to anyone",
    severity: 4,
    why: "It exposes other people's names and relationships without their consent, not just yours.",
    fix: "Keep the guest list in your own spreadsheet and never render it on a public URL.",
    when: "now",
  },
  {
    id: "children-details",
    group: "guests",
    label: "Children are named alongside their ages or school",
    severity: 4,
    why: "Name plus school plus a known family event is enough for a convincing approach to a child.",
    fix: "Use first names only, and never pair a child's name with a school, class or address.",
    when: "now",
  },
  {
    id: "guest-contacts-public",
    group: "guests",
    label: "Guest email addresses or phone numbers appear on the page",
    severity: 4,
    why: "Scrapers harvest these for phishing that name-drops your wedding to sound credible.",
    fix: "Move all guest contact detail into your private planning sheet.",
    when: "now",
  },
  {
    id: "security-trivia",
    group: "identity",
    label: "'How we met' style trivia: first pet, first school, street you grew up on",
    severity: 4,
    why: "These are the exact answers to standard account-recovery questions.",
    fix: "Keep the story, drop the specifics — or change the security answers on your accounts to random strings.",
    when: "now",
  },
  {
    id: "full-birth-dates",
    group: "identity",
    label: "Your full birth dates or the year you were born appear",
    severity: 4,
    why: "Date of birth plus full name plus town is a common identity-verification triple.",
    fix: "Remove birth years from bios and timelines.",
    when: "now",
  },
  {
    id: "maiden-name-change",
    group: "identity",
    label: "The exact name change is announced (old surname to new surname)",
    severity: 2,
    why: "It links two identities and hands over a maiden name, still used as a verification question by some banks.",
    fix: "Announce it privately. Tell your bank to stop using maiden name as a verification question.",
    when: "later",
  },
  {
    id: "employer-names",
    group: "identity",
    label: "Both employers are named in the bios",
    severity: 2,
    why: "Employer plus personal event detail is the raw material for a targeted business-email scam.",
    fix: "Say what you do, not who you do it for.",
    when: "later",
  },
  {
    id: "no-password",
    group: "reach",
    label: "The page has no password and no unlisted URL",
    severity: 4,
    why: "Everything above is only a real problem because anyone can reach the page.",
    fix: "Turn on the site password. One shared passphrase, printed on the invitation, fixes most of this list at once.",
    when: "before-link",
  },
  {
    id: "search-indexed",
    group: "reach",
    label: "Search engines are allowed to index the page",
    severity: 3,
    why: "Indexing turns a private page into a permanent, searchable record of your names and address.",
    fix: "Switch on the 'hide from search engines' option, which sets a noindex tag.",
    when: "before-link",
  },
  {
    id: "registry-address",
    group: "reach",
    label: "A gift registry ships to your home address and shows it at checkout",
    severity: 3,
    why: "Registries reveal the delivery address to buyers and sometimes to the whole product page.",
    fix: "Ship to the venue, a parent's house or a pickup point, or use a cash fund instead.",
    when: "before-link",
  },
  {
    id: "geotagged-photos",
    group: "media",
    label: "Photos are uploaded straight from a phone with location metadata",
    severity: 2,
    why: "EXIF GPS tags can pin the house in the engagement photos even when no address is written.",
    fix: "Strip metadata before upload, or export the images through an editor that drops EXIF.",
    when: "before-link",
  },
  {
    id: "open-guestbook",
    group: "media",
    label: "An open guestbook or comment wall accepts posts with no moderation",
    severity: 2,
    why: "Unmoderated fields attract spam links and let strangers post about your family under your name.",
    fix: "Turn on moderation, or close the guestbook once the event is over.",
    when: "later",
  },
  {
    id: "public-livestream",
    group: "media",
    label: "The ceremony livestream link is public and permanent",
    severity: 3,
    why: "A public stream URL is shareable forever and often lists guest names in the chat.",
    fix: "Use a one-off passcode and delete the recording afterwards.",
    when: "before-link",
  },
];

export const STAGE_LABELS = {
  now: "Fix today",
  "before-link": "Fix before you share the link",
  later: "Tidy up after the event",
};

const STAGE_ORDER = { now: 0, "before-link": 1, later: 2 };

export const RISK_BANDS = [
  { id: "clean", label: "Clean", max: 0, advice: "Nothing flagged. Re-check after any vendor edits the page." },
  { id: "low", label: "Low risk", max: 20, advice: "A couple of loose ends. Clear the critical items and you are done." },
  { id: "moderate", label: "Moderate risk", max: 45, advice: "Enough detail is public to build a picture of your household." },
  { id: "high", label: "High risk", max: 70, advice: "Take the page private now, then clean it before sharing again." },
  { id: "severe", label: "Severe exposure", max: 100, advice: "Unpublish the page today. It exposes both an absence window and identity data." },
];

const MAX_SCORE = EXPOSURE_ITEMS.reduce((sum, item) => sum + item.severity, 0);

/** Total possible severity across the whole catalogue. */
export function maxExposureScore() {
  return MAX_SCORE;
}

function bandFor(percent) {
  return RISK_BANDS.find((band) => percent <= band.max) || RISK_BANDS[RISK_BANDS.length - 1];
}

/**
 * Audit a wedding or event page.
 *
 * @param {object} input
 * @param {string[]} input.exposedIds  ids from EXPOSURE_ITEMS that are currently public
 * @param {number}   input.guestRecords number of guest records held in the RSVP form
 * @param {number}   input.daysPublicAfter days the page (and its data) stays up after the event
 * @returns {object} audit result, or { error } for invalid input
 */
export function auditWeddingSite({ exposedIds, guestRecords, daysPublicAfter } = {}) {
  if (!Array.isArray(exposedIds)) {
    return { error: "Tick the details that are currently public on the page." };
  }
  const records = Number(guestRecords);
  const days = Number(daysPublicAfter);

  if (!Number.isFinite(records) || !Number.isFinite(days)) {
    return { error: "Guest records and days online must both be numbers." };
  }
  if (records < 0 || days < 0) {
    return { error: "Guest records and days online cannot be negative." };
  }
  if (records > MAX_GUEST_RECORDS) {
    return { error: `Guest records must be ${MAX_GUEST_RECORDS} or fewer — check for a typo.` };
  }
  if (days > MAX_DAYS_PUBLIC) {
    return { error: `Days online must be ${MAX_DAYS_PUBLIC} or fewer (10 years).` };
  }

  const wanted = new Set(exposedIds);
  const exposed = EXPOSURE_ITEMS.filter((item) => wanted.has(item.id));
  const score = exposed.reduce((sum, item) => sum + item.severity, 0);
  const riskPercent = MAX_SCORE > 0 ? Math.round((score / MAX_SCORE) * 100) : 0;
  const band = bandFor(riskPercent);

  const actions = [...exposed].sort((a, b) => {
    const stage = STAGE_ORDER[a.when] - STAGE_ORDER[b.when];
    if (stage !== 0) return stage;
    return b.severity - a.severity;
  });

  const critical = exposed.filter((item) => item.severity >= CRITICAL_SEVERITY);
  const guestDataExposed = exposed.some((item) => item.group === "guests");
  const recordsAtRisk = guestDataExposed ? Math.round(records) : 0;

  const retentionOverBy = Math.max(0, Math.round(days) - RECOMMENDED_RETENTION_DAYS);
  const retentionFlagged = retentionOverBy > 0 && Math.round(records) > 0;

  const byGroup = EXPOSURE_GROUPS.map((group) => {
    const all = EXPOSURE_ITEMS.filter((item) => item.group === group.id);
    const hit = all.filter((item) => wanted.has(item.id));
    const groupMax = all.reduce((sum, item) => sum + item.severity, 0);
    const groupScore = hit.reduce((sum, item) => sum + item.severity, 0);
    return {
      id: group.id,
      label: group.label,
      exposed: hit.length,
      total: all.length,
      percent: groupMax > 0 ? Math.round((groupScore / groupMax) * 100) : 0,
    };
  });

  return {
    exposedCount: exposed.length,
    totalItems: EXPOSURE_ITEMS.length,
    score,
    maxScore: MAX_SCORE,
    riskPercent,
    bandId: band.id,
    bandLabel: band.label,
    bandAdvice: band.advice,
    criticalCount: critical.length,
    critical,
    actions,
    byGroup,
    recordsAtRisk,
    retentionFlagged,
    retentionOverBy,
    retentionAdvice: retentionFlagged
      ? `You plan to keep ${Math.round(records)} guest records for ${Math.round(days)} days — ${retentionOverBy} days past the ${RECOMMENDED_RETENTION_DAYS}-day mark. Export what you need, then delete the rest.`
      : `Deleting guest records within ${RECOMMENDED_RETENTION_DAYS} days of the event keeps you inside the storage-limitation principle.`,
  };
}
