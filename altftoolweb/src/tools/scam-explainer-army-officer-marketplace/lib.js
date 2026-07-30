/**
 * Army-officer marketplace scam explainer.
 *
 * The pattern: a listing on a classifieds or marketplace app is priced far
 * below market. The seller (or, in the mirror-image version, the buyer) says
 * they are defence personnel being posted at short notice, sends a photograph
 * of a service ID card, refuses to meet, and asks for an advance that grows
 * one "charge" at a time.
 *
 * Nothing here relies on judging whether someone is really in the forces —
 * that is unknowable over chat, which is exactly why the story is used. The
 * module works on structure instead:
 *
 *  - how far below market the price sits, as a percentage,
 *  - how much money is exposed before anything is inspected,
 *  - the escalation ladder: each new "charge" and the running total,
 *  - weighted structural red flags,
 *  - the direction money moves when a "refund" or "transport charge" is
 *    reversed, which is always a debit from the buyer.
 *
 * Pure functions: no DOM, no network, no clock.
 */

/* ------------------------------------------------------------------ */
/* The structural rule                                                 */
/* ------------------------------------------------------------------ */

export const CORE_RULE =
  "Identity claimed over chat proves nothing; the only protection in a private sale is inspecting the goods in person and paying on handover.";

/**
 * A price this far below a realistic market price, combined with a refusal to
 * meet, is the standard bait. It is a screening threshold, not a rule of law:
 * genuine distress sales exist, and they can still be inspected in person.
 */
export const DEEP_DISCOUNT_PERCENT = 40;

/** An advance larger than this share of the price leaves very little leverage. */
export const HIGH_ADVANCE_SHARE_PERCENT = 20;

/* ------------------------------------------------------------------ */
/* Price and advance maths                                             */
/* ------------------------------------------------------------------ */

export function discountVsMarket({ askingPrice, marketPrice }) {
  const asking = Number(askingPrice);
  const market = Number(marketPrice);
  if (!Number.isFinite(asking) || asking < 0) return { error: "Asking price must be zero or more." };
  if (!Number.isFinite(market) || market <= 0) {
    return { error: "Enter a realistic market price greater than zero to compare against." };
  }
  const gap = market - asking;
  const percent = (gap / market) * 100;
  return {
    gap,
    percent,
    deep: percent >= DEEP_DISCOUNT_PERCENT,
    above: percent < 0,
  };
}

export function advanceExposure({ advance, askingPrice }) {
  const paid = Number(advance);
  const asking = Number(askingPrice);
  if (!Number.isFinite(paid) || paid < 0) return { error: "Advance must be zero or more." };
  if (!Number.isFinite(asking) || asking <= 0) return { error: "Asking price must be greater than zero." };
  const percent = (paid / asking) * 100;
  return {
    paid,
    percent,
    high: percent >= HIGH_ADVANCE_SHARE_PERCENT,
    exceedsPrice: paid > asking,
  };
}

/**
 * The escalation ladder. Each demand is small enough to feel like the last
 * hurdle; the running total is the number that matters and the one nobody is
 * shown.
 */
export function escalationLadder(amounts) {
  const list = Array.isArray(amounts) ? amounts.map(Number) : [];
  if (list.length === 0) return { error: "Add at least one demand to total up." };
  if (list.length > 20) return { error: "Twenty demands is enough to make the point." };
  if (list.some((value) => !Number.isFinite(value) || value < 0)) {
    return { error: "Every demand must be zero or more." };
  }
  let running = 0;
  const steps = list.map((amount, index) => {
    running += amount;
    return { index: index + 1, amount, running };
  });
  const first = list[0];
  return {
    steps,
    total: running,
    count: list.length,
    first,
    multipleOfFirst: first > 0 ? running / first : null,
  };
}

/** The order the demands usually arrive in, with the excuse attached to each. */
export const DEMAND_LADDER = [
  {
    id: "token",
    label: "Token advance to 'block' the item",
    excuse: "Others are asking, I will hold it only if you pay something now.",
  },
  {
    id: "transport",
    label: "Transport or courier charge",
    excuse: "The unit courier will deliver it; pay the freight and it ships today.",
  },
  {
    id: "insurance",
    label: "Refundable insurance or security deposit",
    excuse: "The department needs a deposit that comes straight back to you.",
  },
  {
    id: "clearance",
    label: "Clearance, RTO transfer or duty charge",
    excuse: "The paperwork is stuck at the office and needs a fee to release.",
  },
  {
    id: "reversal",
    label: "Small payment to 'enable' the refund of everything paid",
    excuse: "Approve this request and the whole amount comes back at once.",
  },
];

/* ------------------------------------------------------------------ */
/* Structural red flags                                                */
/* ------------------------------------------------------------------ */

export const RED_FLAGS = [
  {
    id: "id-card-photo",
    weight: 5,
    label: "Sent a photo of a service ID card, posting order or uniform as proof",
    why: "A photograph proves possession of an image, nothing more. Real service identity is never verified this way, and these images circulate in bulk.",
  },
  {
    id: "no-meeting",
    weight: 5,
    label: "Will not meet in person or allow inspection before payment",
    why: "In a private sale, inspecting and paying on handover is the only real protection. Removing it is the point of the story.",
  },
  {
    id: "advance-before-inspection",
    weight: 5,
    label: "Wants money before you have seen the item",
    why: "Once an advance is sent voluntarily, it is an authorised transaction and very hard to reverse.",
  },
  {
    id: "collect-request",
    weight: 5,
    label: "Asked you to approve a UPI request to 'receive' a refund",
    why: "Approving a request debits you. Nothing you approve can pay money into your account.",
  },
  {
    id: "name-mismatch",
    weight: 4,
    label: "The account name shown at payment does not match the person you are talking to",
    why: "UPI displays the beneficiary's registered name before you pay. A different name means the money is going to a third party.",
  },
  {
    id: "unit-courier",
    weight: 4,
    label: "Claims a defence courier, canteen or unit logistics service will deliver",
    why: "No such service ships privately sold goods to civilians. The 'courier' is a second person in the same script.",
  },
  {
    id: "posting-urgency",
    weight: 3,
    label: "Posted or transferred at short notice, so it must be settled today",
    why: "Urgency plus a story that discourages questioning is the whole mechanism.",
  },
  {
    id: "deep-discount",
    weight: 3,
    label: "Priced far below anything comparable",
    why: "The discount buys your attention and pays for the story's implausibility.",
  },
  {
    id: "moved-off-platform",
    weight: 2,
    label: "Moved to WhatsApp or a personal number immediately",
    why: "Off-platform chat removes the marketplace's records, reporting and any protection it offers.",
  },
  {
    id: "new-profile",
    weight: 2,
    label: "Recently created profile with no history or ratings",
    why: "Accounts are cheap and disposable; a clean history is the normal state for this script.",
  },
];

export const MAX_FLAG_SCORE = RED_FLAGS.reduce((sum, flag) => sum + flag.weight, 0);

export const RISK_BANDS = [
  {
    min: 10,
    label: "Walk away",
    tone: "danger",
    advice:
      "The structure matches the standard advance-payment script. Do not send anything, and report the listing on the platform.",
  },
  {
    min: 5,
    label: "Serious warning signs",
    tone: "warning",
    advice:
      "Insist on meeting in a public place and paying only on handover. If that is refused, the deal is over.",
  },
  {
    min: 1,
    label: "Proceed carefully",
    tone: "warning",
    advice: "Keep everything on the platform, verify the item in person, and pay nothing in advance.",
  },
  {
    min: 0,
    label: "Nothing ticked yet",
    tone: "muted",
    advice: "Tick what has actually happened in your conversation.",
  },
];

export function scoreListing(selectedIds) {
  const ids = Array.isArray(selectedIds) ? selectedIds : [];
  const matched = RED_FLAGS.filter((flag) => ids.includes(flag.id));
  const score = matched.reduce((sum, flag) => sum + flag.weight, 0);
  const band = RISK_BANDS.find((item) => score >= item.min) || RISK_BANDS[RISK_BANDS.length - 1];
  return {
    score,
    max: MAX_FLAG_SCORE,
    percent: MAX_FLAG_SCORE > 0 ? (score / MAX_FLAG_SCORE) * 100 : 0,
    band,
    matched,
  };
}

/* ------------------------------------------------------------------ */
/* Whole-deal assessment                                               */
/* ------------------------------------------------------------------ */

/**
 * Combine price, exposure and structural flags. Price alone never condemns a
 * deal — a cheap listing you can inspect in person is just a cheap listing.
 */
export function assessDeal({ askingPrice, marketPrice, advance, demands, flags }) {
  const discount = discountVsMarket({ askingPrice, marketPrice });
  if (discount.error) return { error: discount.error };

  const exposure = advanceExposure({ advance, askingPrice });
  if (exposure.error) return { error: exposure.error };

  const ladder = escalationLadder(demands && demands.length ? demands : [Number(advance) || 0]);
  if (ladder.error) return { error: ladder.error };

  const risk = scoreListing(flags);

  const structural = [
    discount.deep ? "Priced at least " + DEEP_DISCOUNT_PERCENT + "% below market" : null,
    exposure.high ? "More than " + HIGH_ADVANCE_SHARE_PERCENT + "% of the price is exposed up front" : null,
    exposure.exceedsPrice ? "The money asked for now already exceeds the price of the item" : null,
  ].filter(Boolean);

  const combined = risk.score + (discount.deep ? 3 : 0) + (exposure.high ? 2 : 0);
  const band = RISK_BANDS.find((item) => combined >= item.min) || RISK_BANDS[RISK_BANDS.length - 1];

  return {
    discount,
    exposure,
    ladder,
    risk,
    structural,
    combined,
    band,
    atRisk: ladder.total,
  };
}

/* ------------------------------------------------------------------ */
/* Doing it safely, and afterwards                                     */
/* ------------------------------------------------------------------ */

export const SAFE_PRACTICE = [
  "Meet in a public place in daylight and inspect the item before any money moves.",
  "Pay on handover, in person. An advance to a stranger has no protection behind it.",
  "Read the beneficiary name your payment app shows before confirming; if it is not the person you are dealing with, stop.",
  "Keep the whole conversation inside the marketplace app so there is a record to report.",
  "Never approve a payment request to 'receive' anything — approving always debits you.",
  "For a vehicle, verify the registration and ownership through the official transport records, not a photo of a document.",
];

export const CYBERCRIME_HELPLINE = "1930";
export const CYBERCRIME_PORTAL = "cybercrime.gov.in";

export const AFTER_STEPS = [
  `Call ${CYBERCRIME_HELPLINE} straight away — a fast report is what gives the receiving bank a chance to freeze the account.`,
  `File the complaint at ${CYBERCRIME_PORTAL} and keep the acknowledgement number.`,
  "Report the listing and the profile inside the marketplace app so the account can be pulled.",
  "Screenshot the chat, the profile, the listing and every payment reference before anything is deleted.",
  "Tell your bank in writing, using the number printed in its official app.",
];

export function formatBriefing(assessment) {
  if (!assessment || assessment.error) return "";
  const lines = [
    "MARKETPLACE ADVANCE-PAYMENT CHECK",
    CORE_RULE,
    "",
    `Below market by: ${assessment.discount.percent.toFixed(1)}%`,
    `Money asked for before inspection: ${assessment.exposure.paid} (${assessment.exposure.percent.toFixed(1)}% of the price)`,
    `Demands so far: ${assessment.ladder.count}, totalling ${assessment.ladder.total}`,
    `Red-flag score: ${assessment.risk.score} of ${assessment.risk.max}`,
    `Verdict: ${assessment.band.label} — ${assessment.band.advice}`,
    "",
  ];
  if (assessment.structural.length) {
    lines.push("Structural problems:", ...assessment.structural.map((item) => `- ${item}`), "");
  }
  if (assessment.risk.matched.length) {
    lines.push("Flags ticked:", ...assessment.risk.matched.map((flag) => `- ${flag.label}`), "");
  }
  lines.push("Safer practice:", ...SAFE_PRACTICE.map((item) => `- ${item}`));
  return lines.join("\n");
}
