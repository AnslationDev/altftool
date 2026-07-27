/**
 * Deepfake awareness checklist — scoring model.
 *
 * The indicator list and the decision rule below are drawn from published public-safety
 * guidance rather than invented:
 *
 *  - FBI IC3 Public Service Announcement on criminals using generative AI for fraud
 *    (voice/video cloning of family members and executives): call the person back on a
 *    number you already have, and agree a secret word with family in advance.
 *  - US FTC consumer guidance on "family emergency" and voice-cloning scams: the request
 *    for money, gift cards, wire transfers or crypto is the reliable tell, not the audio.
 *  - CISA / NSA joint guidance "Contextualizing Deepfake Threats to Organizations":
 *    treat provenance and out-of-band confirmation as the control, because automated
 *    detectors degrade badly on compressed, re-shared media.
 *  - C2PA Content Credentials: the open provenance standard whose absence (or presence)
 *    is checked in the provenance group below.
 *
 * The numeric weights are editorial severity ratings on a 1-5 scale, not measured
 * probabilities. They are exported so the scoring is inspectable, and the hard decision
 * rule (HIGH_STAKES_REQUIRES_VERIFICATION) does not depend on them at all.
 */

/** Red-flag indicators. `weight` is a 1-5 severity rating; `highStakes` marks the
 *  social-engineering asks that make out-of-band verification mandatory. */
export const RED_FLAGS = [
  // Request and pressure — the strongest signal per FTC and FBI guidance.
  {
    id: "asks-money",
    group: "Request and pressure",
    label: "Asks for money, a wire transfer, gift cards or crypto",
    weight: 5,
    highStakes: true,
  },
  {
    id: "asks-credentials",
    group: "Request and pressure",
    label: "Asks for a password, OTP, 2FA code, or access to an account or system",
    weight: 5,
    highStakes: true,
  },
  {
    id: "urgency-secrecy",
    group: "Request and pressure",
    label: "Demands you act within minutes and tell nobody else",
    weight: 4,
    highStakes: false,
  },
  {
    id: "new-channel",
    group: "Request and pressure",
    label: "Came from a number, handle or app the real person has never used with you",
    weight: 3,
    highStakes: false,
  },
  {
    id: "refuses-callback",
    group: "Request and pressure",
    label: "Deflects or refuses a callback on the number you already have for them",
    weight: 4,
    highStakes: false,
  },

  // Media artifacts — useful but weak on their own; modern models fix most of these.
  {
    id: "lip-sync",
    group: "Media artifacts",
    label: "Speech drifts out of sync with the lips, or mouth shapes do not match the sounds",
    weight: 3,
    highStakes: false,
  },
  {
    id: "face-edges",
    group: "Media artifacts",
    label: "Stiff expression, odd blinking, or shimmering edges at the jaw, ears or hairline",
    weight: 3,
    highStakes: false,
  },
  {
    id: "lighting",
    group: "Media artifacts",
    label: "Lighting, shadows or skin tone do not match the background",
    weight: 2,
    highStakes: false,
  },
  {
    id: "voice-texture",
    group: "Media artifacts",
    label: "Voice has flat intonation, no breathing or swallowing, odd pacing or clipped word endings",
    weight: 3,
    highStakes: false,
  },
  {
    id: "hands-text",
    group: "Media artifacts",
    label: "Hands, teeth, glasses, jewellery or on-screen text warp between frames",
    weight: 2,
    highStakes: false,
  },

  // Provenance and distribution.
  {
    id: "no-credentials",
    group: "Provenance",
    label: "No C2PA Content Credentials and no original file — only a re-shared clip",
    weight: 2,
    highStakes: false,
  },
  {
    id: "recompressed",
    group: "Provenance",
    label: "Very short, tightly cropped, or an obvious screen recording of a screen recording",
    weight: 2,
    highStakes: false,
  },
  {
    id: "no-earlier-copy",
    group: "Provenance",
    label: "No named original publisher, and no earlier copy turns up in a reverse search",
    weight: 3,
    highStakes: false,
  },
  {
    id: "thin-account",
    group: "Provenance",
    label: "Posting account is new, near-empty or inconsistent with its claimed identity",
    weight: 2,
    highStakes: false,
  },
  {
    id: "unreported-claim",
    group: "Provenance",
    label: "The claim would be major news, yet no reputable outlet is reporting it",
    weight: 3,
    highStakes: false,
  },
];

/** Verification steps. `decisive` marks the two out-of-band checks that satisfy the
 *  hard rule for a high-stakes request. Tick a step only if you ran it AND it checked out. */
export const VERIFICATION_STEPS = [
  {
    id: "callback",
    label: "Called back on a number you already had — not one supplied in the message",
    weight: 5,
    decisive: true,
  },
  {
    id: "safe-word",
    label: "Asked a pre-agreed code word, or a question only the real person could answer",
    weight: 4,
    decisive: true,
  },
  {
    id: "live-test",
    label: "On a live call, asked them to turn fully side-on or pass a hand across their face",
    weight: 3,
    decisive: false,
  },
  {
    id: "reverse-search",
    label: "Ran a reverse image or keyframe search looking for an earlier original",
    weight: 2,
    decisive: false,
  },
  {
    id: "provenance-check",
    label: "Inspected Content Credentials (C2PA) or the original file's metadata",
    weight: 2,
    decisive: false,
  },
  {
    id: "second-source",
    label: "Confirmed through a second independent person or an official channel",
    weight: 3,
    decisive: false,
  },
];

const sumWeights = (items) => items.reduce((total, item) => total + item.weight, 0);

export const TOTAL_FLAG_WEIGHT = sumWeights(RED_FLAGS);
export const TOTAL_VERIFICATION_WEIGHT = sumWeights(VERIFICATION_STEPS);

/**
 * Verification never drives residual risk to zero. CISA/NSA guidance is explicit that no
 * single check is conclusive on re-shared, recompressed media, so completing every step
 * removes at most 60% of the assessed risk.
 */
export const MAX_VERIFICATION_CREDIT = 0.6;

/**
 * Hard rule, independent of the weights: a request for money, credentials or access must
 * be confirmed out of band before you act, however clean the media looks.
 */
export const HIGH_STAKES_REQUIRES_VERIFICATION = true;

/** Residual-risk bands (percent, lower bound inclusive). */
export const RISK_BANDS = [
  { id: "low", min: 0, label: "Low concern", tone: "success" },
  { id: "elevated", min: 20, label: "Elevated concern", tone: "warning" },
  { id: "high", min: 45, label: "High concern", tone: "danger" },
  { id: "critical", min: 70, label: "Critical — treat as fake", tone: "danger" },
];

function bandFor(percent) {
  let match = RISK_BANDS[0];
  for (const band of RISK_BANDS) {
    if (percent >= band.min) match = band;
  }
  return match;
}

function bandIndex(id) {
  return RISK_BANDS.findIndex((band) => band.id === id);
}

const uniqueIds = (value) => (Array.isArray(value) ? Array.from(new Set(value.map(String))) : null);

/**
 * Assess a suspicious clip, voice note or call.
 *
 * @param {object} input
 * @param {string[]} input.flaggedIds   Ids from RED_FLAGS that are present.
 * @param {string[]} input.verifiedIds  Ids from VERIFICATION_STEPS already completed and passed.
 * @returns {object} assessment, or { error } when the input is unusable.
 */
export function assessDeepfakeRisk({ flaggedIds, verifiedIds }) {
  const flagged = uniqueIds(flaggedIds);
  const verified = uniqueIds(verifiedIds);

  if (!flagged) return { error: "Flagged indicators must be provided as a list." };
  if (!verified) return { error: "Completed verification steps must be provided as a list." };

  const knownFlagIds = new Set(RED_FLAGS.map((item) => item.id));
  const knownStepIds = new Set(VERIFICATION_STEPS.map((item) => item.id));
  if (flagged.some((id) => !knownFlagIds.has(id))) {
    return { error: "One of the selected indicators is not on the checklist." };
  }
  if (verified.some((id) => !knownStepIds.has(id))) {
    return { error: "One of the selected verification steps is not on the checklist." };
  }

  const flaggedSet = new Set(flagged);
  const verifiedSet = new Set(verified);

  const flaggedItems = RED_FLAGS.filter((item) => flaggedSet.has(item.id));
  const verifiedItems = VERIFICATION_STEPS.filter((item) => verifiedSet.has(item.id));

  const flaggedWeight = sumWeights(flaggedItems);
  const verifiedWeight = sumWeights(verifiedItems);

  const riskPercent = Math.round((flaggedWeight / TOTAL_FLAG_WEIGHT) * 100);
  const verificationPercent = Math.round((verifiedWeight / TOTAL_VERIFICATION_WEIGHT) * 100);

  const credit = MAX_VERIFICATION_CREDIT * (verifiedWeight / TOTAL_VERIFICATION_WEIGHT);
  let residualPercent = Math.round(riskPercent * (1 - credit));

  const highStakesFlags = flaggedItems.filter((item) => item.highStakes);
  const highStakes = highStakesFlags.length > 0;
  const decisiveDone = verifiedItems.some((item) => item.decisive);
  const verificationOverdue = HIGH_STAKES_REQUIRES_VERIFICATION && highStakes && !decisiveDone;

  let band = bandFor(residualPercent);
  // The hard rule floors the verdict: an unverified money/credential ask is never "low".
  if (verificationOverdue) {
    const floor = RISK_BANDS[bandIndex("high")];
    if (bandIndex(band.id) < bandIndex(floor.id)) {
      band = floor;
      residualPercent = Math.max(residualPercent, floor.min);
    }
  }

  const groups = [];
  for (const item of RED_FLAGS) {
    let group = groups.find((entry) => entry.group === item.group);
    if (!group) {
      group = { group: item.group, flagged: 0, count: 0, weight: 0, maxWeight: 0 };
      groups.push(group);
    }
    group.count += 1;
    group.maxWeight += item.weight;
    if (flaggedSet.has(item.id)) {
      group.flagged += 1;
      group.weight += item.weight;
    }
  }

  const outstandingSteps = VERIFICATION_STEPS.filter((step) => !verifiedSet.has(step.id));

  let action;
  if (verificationOverdue) {
    action =
      "Do not send anything. Hang up or stop replying, then call the person back on a number you already have and ask a pre-agreed question before you act.";
  } else if (band.id === "critical") {
    action =
      "Treat this as synthetic. Do not forward it, and report it to the platform and to the person being impersonated.";
  } else if (band.id === "high") {
    action =
      "Assume it is fake until proven otherwise. Complete the outstanding verification steps before you act on it or share it.";
  } else if (band.id === "elevated") {
    action =
      "Plausible but unconfirmed. Finish the outstanding checks, and do not forward it as fact in the meantime.";
  } else {
    action =
      "Nothing here points to a fake, but absence of red flags is not proof. Keep the out-of-band habit for any future request involving money or access.";
  }

  return {
    riskPercent,
    verificationPercent,
    residualPercent,
    band,
    flaggedCount: flaggedItems.length,
    totalIndicators: RED_FLAGS.length,
    flaggedWeight,
    maxFlagWeight: TOTAL_FLAG_WEIGHT,
    verifiedCount: verifiedItems.length,
    totalSteps: VERIFICATION_STEPS.length,
    highStakes,
    highStakesLabels: highStakesFlags.map((item) => item.label),
    decisiveDone,
    verificationOverdue,
    groups,
    outstandingSteps: outstandingSteps.map((step) => ({ id: step.id, label: step.label })),
    action,
  };
}
