/**
 * Holiday photo sharing exposure — how much your posting advertises an empty house.
 *
 * The mechanics behind the factors:
 *
 *  - EXIF: photographs from a phone carry GPS coordinates, a timestamp and the device model.
 *    The large social platforms strip most EXIF when they re-encode an upload, but sending
 *    the original FILE — by email, as a cloud link, as a Telegram or WhatsApp "document", or
 *    over AirDrop — preserves it intact. The distinction is the file, not the platform.
 *  - A platform location tag is different from EXIF: you are adding the location back on
 *    purpose, and it is machine-readable and searchable.
 *  - The absence signal, not the photograph, is what matters. A published trip with stated
 *    dates tells a reader exactly how long the house is empty. Posting after you return
 *    removes that signal entirely while costing you nothing.
 *  - Reshares: a post visible to followers who can reshare reaches an audience you never
 *    approved, so "friends only" is only as private as your least careful friend.
 *  - Children: a full name, a school uniform or a school crest turns a holiday photo into an
 *    identification aid. Child-safety guidance consistently recommends removing all three.
 *  - Home insurers have publicly warned that advertising an absence on social media can be
 *    raised against a burglary claim. Policy wording differs, so read your own.
 *
 * The exposure score is weighted; mitigations reduce it but never to zero, because a
 * publicised absence cannot be un-published. The hard rule below is independent of weights.
 *
 * Pure module: no React, no DOM, no clocks — the trip length and the first posting day are
 * passed in as numbers.
 */

/**
 * Risk factors. `derived: true` marks the one factor computed from the posting schedule
 * rather than ticked by the user.
 */
export const RISK_FACTORS = [
  {
    id: "live-posting",
    group: "When you post",
    label: "Posting while you are still away",
    weight: 5,
    derived: true,
    why: "This is the whole problem. Everything else only matters because the absence is public while it is happening.",
  },
  {
    id: "public-account",
    group: "Who can see it",
    label: "The account is public — anyone can see the posts, not only people you approved",
    weight: 5,
    derived: false,
    why: "A public trip album is a searchable notice that nobody is home.",
  },
  {
    id: "reshareable",
    group: "Who can see it",
    label: "Followers can reshare, or the profile is indexed by search engines",
    weight: 3,
    derived: false,
    why: "A reshare reaches an audience you never approved and that you cannot withdraw it from.",
  },
  {
    id: "tagged-by-others",
    group: "Who can see it",
    label: "Travel companions tag you and post to their own public accounts",
    weight: 3,
    derived: false,
    why: "Your privacy settings do not apply to somebody else's post about you.",
  },
  {
    id: "dates-stated",
    group: "What the post says",
    label: "Travel dates or a return date stated in a caption, bio, status or autoreply",
    weight: 5,
    derived: false,
    why: "It converts a vague absence into a precise window.",
  },
  {
    id: "autoresponder",
    group: "What the post says",
    label: "An out-of-office autoresponder that says you are abroad",
    weight: 4,
    derived: false,
    why: "It answers anyone who emails to test whether the house is occupied, including strangers.",
  },
  {
    id: "checkins",
    group: "What the post says",
    label: "Checking in at the airport, hotel or restaurants in real time",
    weight: 4,
    derived: false,
    why: "Each check-in is a timestamped confirmation of exactly how far away you are.",
  },
  {
    id: "platform-geotag",
    group: "Location data",
    label: "Adding a location tag to trip posts",
    weight: 4,
    derived: false,
    why: "Unlike EXIF, this is deliberate, searchable and survives every re-upload.",
  },
  {
    id: "originals-shared",
    group: "Location data",
    label: "Sharing original files — email attachments, cloud links, or sent as documents",
    weight: 3,
    derived: false,
    why: "Uploads to social platforms usually lose EXIF; original files keep the GPS coordinates and timestamps.",
  },
  {
    id: "home-visible",
    group: "What is in frame",
    label: "House number, street sign, front door or number plate visible in any recent post",
    weight: 4,
    derived: false,
    why: "Combined with a published absence, this is the only other thing a burglar needs.",
  },
  {
    id: "kids-identifiable",
    group: "What is in frame",
    label: "Children's full names, school uniform or school crest visible",
    weight: 4,
    derived: false,
    why: "A name plus a uniform identifies where a child is every weekday.",
  },
  {
    id: "boardingpass-post",
    group: "What is in frame",
    label: "Boarding pass, luggage tag or printed itinerary photographed and posted",
    weight: 3,
    derived: false,
    why: "The barcode carries the booking reference, and a luggage tag often carries your home address.",
  },
  {
    id: "stories-auto",
    group: "Automatic sharing",
    label: "Stories, shared albums or automatic memories recaps publishing the trip for you",
    weight: 3,
    derived: false,
    why: "Automatic publishing is the setting people forget they turned on years ago.",
  },
];

/** Things that genuinely reduce the risk of a publicised absence. */
export const MITIGATIONS = [
  {
    id: "no-live",
    label: "An agreement with everyone travelling: nothing gets posted until you are all home",
    weight: 5,
    why: "The only measure that removes the signal rather than muffling it.",
  },
  {
    id: "house-sitter",
    label: "Someone is staying at the house, or visiting it every day",
    weight: 5,
    why: "An occupied-looking house defeats the entire premise of the post being useful.",
  },
  {
    id: "neighbour-told",
    label: "A neighbour knows the dates, has a contact number, and is watching the place",
    weight: 4,
    why: "Somebody noticing is what turns an attempt into an interrupted attempt.",
  },
  {
    id: "mail-held",
    label: "Post and deliveries held or collected daily",
    weight: 4,
    why: "An overflowing letterbox is a more reliable absence signal than any social post.",
  },
  {
    id: "alarm",
    label: "Alarm set, and any cameras recording to off-site storage",
    weight: 4,
    why: "Footage stored only on a device inside the house leaves with the device.",
  },
  {
    id: "timers",
    label: "Lights on timers, curtains left normal, bins put out and brought in",
    weight: 3,
    why: "The house should look the same from the street as it does when you are in it.",
  },
  {
    id: "valuables-secured",
    label: "Valuables, documents and spare keys moved out of the house or into a safe",
    weight: 3,
    why: "It changes the cost of a break-in even if one happens.",
  },
  {
    id: "close-friends-list",
    label: "Posting to a curated close-friends list rather than to all followers",
    weight: 3,
    why: "A shorter list is a smaller reshare surface, though it is not the same as not posting.",
  },
];

/** Mitigations can remove at most this share of the exposure — a public post cannot be recalled. */
export const MAX_MITIGATION_CREDIT = 0.6;

/** Exposure bands, lower bound inclusive. */
export const BANDS = [
  { id: "low", min: 0, label: "Low — the trip is not advertising your home", tone: "success" },
  { id: "moderate", min: 20, label: "Moderate exposure", tone: "warning" },
  { id: "high", min: 45, label: "High exposure", tone: "danger" },
  { id: "severe", min: 70, label: "Severe — you are publishing an empty house", tone: "danger" },
];

/** Hard rule: live public posting alongside a home identifier or stated dates is never "low". */
export const HARD_RULE_FLOOR_BAND = "high";

const TICKABLE = RISK_FACTORS.filter((factor) => !factor.derived);

export const TOTAL_RISK_WEIGHT = RISK_FACTORS.reduce((sum, factor) => sum + factor.weight, 0);
export const TOTAL_MITIGATION_WEIGHT = MITIGATIONS.reduce((sum, item) => sum + item.weight, 0);

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

const cleanIds = (value) =>
  Array.isArray(value) ? Array.from(new Set(value.map((entry) => String(entry)))) : null;

function bandFor(percent) {
  let match = BANDS[0];
  for (const band of BANDS) if (percent >= band.min) match = band;
  return match;
}

const bandIndex = (id) => BANDS.findIndex((band) => band.id === id);

/**
 * Assess holiday-posting exposure.
 *
 * @param {object} input
 * @param {string[]} input.riskIds        Ticked risk factors (derived ones are ignored).
 * @param {string[]} input.mitigationIds  Mitigations already in place.
 * @param {number}   input.tripNights     Nights away, 1-365.
 * @param {number}   input.firstPostDay   Day of the trip the first post goes up, 1-tripNights.
 * @param {boolean}  input.postAfterReturn  True if nothing is published until you are home.
 * @returns {object} assessment, or { error } when the input cannot be used.
 */
export function assessSharingExposure({
  riskIds,
  mitigationIds,
  tripNights,
  firstPostDay,
  postAfterReturn,
}) {
  const risks = cleanIds(riskIds);
  const mitigations = cleanIds(mitigationIds);

  if (!risks) return { error: "Risk factors must be supplied as a list." };
  if (!mitigations) return { error: "Mitigations must be supplied as a list." };
  if (!isFiniteNumber(tripNights)) return { error: "Enter the trip length as a plain number of nights." };
  if (tripNights < 1 || tripNights > 365) {
    return { error: "Trip length should be between 1 and 365 nights." };
  }

  const knownRisks = new Set(TICKABLE.map((factor) => factor.id));
  const knownMitigations = new Set(MITIGATIONS.map((item) => item.id));
  if (risks.some((id) => !knownRisks.has(id))) {
    return { error: "One of the ticked risk factors is not on the list." };
  }
  if (mitigations.some((id) => !knownMitigations.has(id))) {
    return { error: "One of the ticked mitigations is not on the list." };
  }

  const live = !postAfterReturn;
  let exposureNights = 0;
  if (live) {
    if (!isFiniteNumber(firstPostDay)) {
      return { error: "Enter the day of the trip your first post goes up." };
    }
    if (firstPostDay < 1 || firstPostDay > tripNights) {
      return { error: `The first post day should be between 1 and ${tripNights}.` };
    }
    exposureNights = Math.round(tripNights - firstPostDay + 1);
  }

  const riskSet = new Set(risks);
  if (live) riskSet.add("live-posting");

  const activeRisks = RISK_FACTORS.filter((factor) => riskSet.has(factor.id));
  const riskWeight = activeRisks.reduce((sum, factor) => sum + factor.weight, 0);
  const rawPercent = Math.round((riskWeight / TOTAL_RISK_WEIGHT) * 100);

  const mitigationSet = new Set(mitigations);
  const activeMitigations = MITIGATIONS.filter((item) => mitigationSet.has(item.id));
  const mitigationWeight = activeMitigations.reduce((sum, item) => sum + item.weight, 0);
  const mitigationPercent = Math.round((mitigationWeight / TOTAL_MITIGATION_WEIGHT) * 100);

  const credit = MAX_MITIGATION_CREDIT * (mitigationWeight / TOTAL_MITIGATION_WEIGHT);
  let exposurePercent = Math.round(rawPercent * (1 - credit));

  let band = bandFor(exposurePercent);

  const homeSignal = riskSet.has("home-visible") || riskSet.has("dates-stated");
  const hardRuleTriggered = live && riskSet.has("public-account") && homeSignal;
  if (hardRuleTriggered) {
    const floor = BANDS[bandIndex(HARD_RULE_FLOOR_BAND)];
    if (bandIndex(band.id) < bandIndex(floor.id)) {
      band = floor;
      exposurePercent = Math.max(exposurePercent, floor.min);
    }
  }

  const groups = [];
  for (const factor of RISK_FACTORS) {
    let group = groups.find((entry) => entry.group === factor.group);
    if (!group) {
      group = { group: factor.group, active: 0, count: 0, weight: 0, maxWeight: 0 };
      groups.push(group);
    }
    group.count += 1;
    group.maxWeight += factor.weight;
    if (riskSet.has(factor.id)) {
      group.active += 1;
      group.weight += factor.weight;
    }
  }

  const topFixes = activeRisks
    .filter((factor) => !factor.derived)
    .sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label))
    .slice(0, 3)
    .map((factor) => ({ id: factor.id, label: factor.label, why: factor.why }));

  const missingMitigations = MITIGATIONS.filter((item) => !mitigationSet.has(item.id))
    .sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label))
    .map((item) => ({ id: item.id, label: item.label, why: item.why }));

  let verdict;
  if (hardRuleTriggered) {
    verdict = `You are posting publicly, in real time, alongside your home address or your dates. That combination is the one worth changing today: switch to posting after you return, or at minimum remove the location and date detail while you are away.`;
  } else if (band.id === "severe") {
    verdict =
      "Almost everything that advertises an absence is switched on. Start with the posting schedule — moving the whole album to after you return removes the largest single factor by itself.";
  } else if (band.id === "high") {
    verdict = `The trip is publicised for ${exposureNights} night(s) while the house is empty. Fix the top items below, or hold the posts.`;
  } else if (band.id === "moderate") {
    verdict =
      "Nothing here is alarming, but a few settings are doing more work than you would want. The fixes below take a minute each.";
  } else {
    verdict = live
      ? "Low exposure. You are posting live but without the details that make it useful to anyone — keep the location tags and the return date out of it."
      : "Low exposure. Holding the album until you are home removes the absence signal entirely, which is why nothing else scores much.";
  }

  return {
    exposurePercent,
    rawPercent,
    band,
    live,
    exposureNights,
    tripNights,
    riskWeight,
    maxRiskWeight: TOTAL_RISK_WEIGHT,
    activeRiskCount: activeRisks.length,
    totalRiskCount: RISK_FACTORS.length,
    mitigationPercent,
    mitigationCount: activeMitigations.length,
    totalMitigations: MITIGATIONS.length,
    hardRuleTriggered,
    groups,
    topFixes,
    missingMitigations,
    verdict,
  };
}

export { TICKABLE as TICKABLE_RISK_FACTORS };
