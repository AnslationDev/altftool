/**
 * Gift Parcel Customs Fee Scam Explainer — logic module.
 *
 * Two independent, pure pieces of work live here:
 *
 * 1. A transparent weighted red-flag checklist that scores how closely a real
 *    encounter matches the documented "gift stuck at customs" advance-fee script.
 * 2. A genuine-duty estimator, so a reader can compare the amount being demanded
 *    against what Indian customs would actually charge on a posted gift.
 *
 * Nothing here is legal or customs advice. Rates and limits change; the figures
 * used are the standing statutory defaults cited in the comments.
 */

/* ---------------------------------------------------------------------------
 * Statutory constants
 * ------------------------------------------------------------------------- */

/**
 * Bona fide gifts imported by post or air into India are exempt from duty up to
 * a CIF value of INR 5,000. Source: Customs Notification 171/93-Cus dated
 * 16 September 1993, as amended (the "gift" exemption applied at Foreign Post
 * Offices and courier terminals).
 */
export const GIFT_DUTY_FREE_LIMIT_INR = 5000;

/**
 * Basic Customs Duty on goods imported for personal use (other than motor
 * vehicles, alcohol and a short excluded list) is levied at a flat merit rate.
 * Source: Notification 50/2017-Cus, S.No. 608 — 35% ad valorem.
 */
export const DEFAULT_BCD_RATE_PCT = 35;

/**
 * Social Welfare Surcharge is levied at 10% of the aggregate customs duty.
 * Source: Section 110 of the Finance Act, 2018.
 */
export const SOCIAL_WELFARE_SURCHARGE_PCT = 10;

/**
 * IGST on imports is charged at the GST rate applicable to the goods. 18% is the
 * standard rate and the usual default for consumer electronics and apparel.
 * Source: Section 3(7) of the Customs Tariff Act, 1975 read with the GST rate
 * schedules.
 */
export const DEFAULT_IGST_RATE_PCT = 18;

/**
 * Customs duty in India is payable only to the Government — through ICEGATE
 * e-payment, at the Foreign Post Office counter, or collected by the licensed
 * courier against a printed assessment. There is no lawful route by which duty
 * is paid into a private individual's bank account, UPI ID or wallet.
 */
export const LEGITIMATE_PAYMENT_ROUTES = [
  "ICEGATE e-payment portal against a Bill of Entry / Postal Bill of Import number",
  "Cash or card at the Foreign Post Office counter when you collect the parcel",
  "The licensed courier's own invoice, itemising duty separately from their handling fee",
];

/* ---------------------------------------------------------------------------
 * Anatomy of the script
 * ------------------------------------------------------------------------- */

export const ANATOMY = [
  {
    step: 1,
    title: "The friendly approach",
    detail:
      "A stranger opens contact on Facebook, Instagram, LinkedIn, WhatsApp or a dating app. The profile is usually a well-travelled professional abroad — an engineer on a rig, a doctor with the UN, a soldier posted overseas — with a thin photo history.",
    tell: "The profile was created recently, or has many photos but almost no tagged friends and no history of ordinary posts.",
  },
  {
    step: 2,
    title: "Weeks of rapport",
    detail:
      "Daily messages, voice notes, talk of visiting India. No money is mentioned. This investment period is what makes the later request feel reasonable.",
    tell: "Every call fails or is audio-only. Video is always postponed for a technical reason.",
  },
  {
    step: 3,
    title: "The surprise parcel",
    detail:
      "They announce a gift already in transit — usually cash in an envelope, gold, a phone, or a laptop — and send a photo of a packed box with your name and address written on it.",
    tell: "You never gave a full postal address, or the address on the box is one you shared only in chat.",
  },
  {
    step: 4,
    title: "The intercept message",
    detail:
      "A 'customs officer', 'clearance agent' or 'courier manager' contacts you from an Indian mobile number or a free email address, saying the parcel is held and a fee must be paid to release it.",
    tell: "Government customs officers do not cold-call consignees from personal mobile numbers or Gmail addresses about a specific parcel.",
  },
  {
    step: 5,
    title: "Forged paperwork",
    detail:
      "You are sent an official-looking PDF or image: a certificate with a national emblem, a fake airway bill, a fake 'anti-money-laundering clearance', sometimes a photo of stacked currency inside the box.",
    tell: "The document has no assessable value, no HS code, no Bill of Entry or Postal Bill of Import number, and no way to verify it on any government site.",
  },
  {
    step: 6,
    title: "Payment to a personal account",
    detail:
      "The fee is to be paid by UPI, IMPS or wallet transfer to an individual's account — never to a treasury challan, never through ICEGATE.",
    tell: "The account name does not match any government department or licensed courier.",
  },
  {
    step: 7,
    title: "Escalating demands",
    detail:
      "Once you pay, new charges appear: currency declaration fee, insurance, terrorism-clearance certificate, storage per day. Each is framed as the last one.",
    tell: "The total demanded keeps rising and is often justified by the value of what is supposedly inside.",
  },
  {
    step: 8,
    title: "Pressure and threat flip",
    detail:
      "If you hesitate, the tone changes — the parcel will be seized, you will be reported for smuggling undeclared currency, police will visit. The sender partner may 'panic' alongside you to keep you engaged.",
    tell: "Real customs proceedings arrive as a written notice by post, not as a WhatsApp threat with a deadline in hours.",
  },
];

/* ---------------------------------------------------------------------------
 * Weighted red-flag checklist
 * ------------------------------------------------------------------------- */

/**
 * Weights are a transparent 1-4 scale reflecting how rarely each behaviour turns
 * up in a genuine customs interaction. Items marked decisive are ones that alone
 * are incompatible with a lawful customs process in India.
 */
export const RED_FLAGS = [
  {
    id: "personal-account",
    label: "You are asked to pay the fee to a personal bank account, UPI ID or wallet",
    weight: 4,
    decisive: true,
  },
  {
    id: "no-bill-number",
    label: "There is no Bill of Entry or Postal Bill of Import number you can look up",
    weight: 4,
    decisive: true,
  },
  {
    id: "cash-in-parcel",
    label: "The parcel supposedly contains cash, gold or foreign currency",
    weight: 4,
    decisive: true,
  },
  {
    id: "whatsapp-officer",
    label: "A 'customs officer' contacted you on WhatsApp, SMS or a free email address",
    weight: 3,
    decisive: false,
  },
  {
    id: "never-met",
    label: "The sender is someone you have never met in person",
    weight: 3,
    decisive: false,
  },
  {
    id: "no-video-call",
    label: "Video calls are always refused, cut short or blamed on a bad connection",
    weight: 3,
    decisive: false,
  },
  {
    id: "escalating-fees",
    label: "A second or third fee appeared after you paid the first one",
    weight: 3,
    decisive: false,
  },
  {
    id: "urgent-deadline",
    label: "You were given hours, not days, before the parcel is 'seized'",
    weight: 2,
    decisive: false,
  },
  {
    id: "threat-legal",
    label: "You were threatened with police action, arrest or a money-laundering case",
    weight: 2,
    decisive: false,
  },
  {
    id: "secrecy",
    label: "You were told not to discuss it with family, the bank or the police",
    weight: 2,
    decisive: false,
  },
  {
    id: "unsolicited-gift",
    label: "You never asked for the parcel and gave no shipping address",
    weight: 2,
    decisive: false,
  },
  {
    id: "photo-of-box",
    label: "The only proof of the parcel is a photograph of a box, not a trackable number",
    weight: 1,
    decisive: false,
  },
];

export const MAX_FLAG_SCORE = RED_FLAGS.reduce((total, flag) => total + flag.weight, 0);

/** Score bands, expressed as a share of the maximum possible weighted score. */
export const BAND_THRESHOLDS = {
  almostCertain: 45,
  highlySuspicious: 20,
};

/* ---------------------------------------------------------------------------
 * Verification and reporting
 * ------------------------------------------------------------------------- */

export const VERIFY_STEPS = [
  {
    id: "track",
    label: "Ask for the tracking number and check it yourself",
    detail:
      "A genuine international parcel has a 13-character UPU tracking number (two letters, nine digits, two country letters) traceable on indiapost.gov.in or the origin post's own site. No number, or a number that shows nothing, ends the discussion.",
  },
  {
    id: "reverse-image",
    label: "Reverse-image search the profile photos",
    detail:
      "Advance-fee profiles almost always reuse photos from a real person's public account. A single hit on a different name is enough.",
  },
  {
    id: "call-fpo",
    label: "Call the Foreign Post Office or the courier on a number you looked up yourself",
    detail:
      "Never use the number in the message. A parcel under customs assessment is on record at the office holding it.",
  },
  {
    id: "video",
    label: "Insist on a live video call before any money moves",
    detail:
      "Ask them to hold up a written note with today's date. The script cannot survive this request.",
  },
  {
    id: "duty-math",
    label: "Do the duty arithmetic yourself",
    detail:
      "Real duty is a percentage of a declared value with an itemised breakdown. A round demand like 'pay 45,000 for clearance' with no assessable value behind it is not a customs calculation.",
  },
];

export const REPORT_CHANNELS = [
  {
    name: "National Cyber Crime Reporting Portal",
    detail: "cybercrime.gov.in — file a written complaint with screenshots and transaction IDs.",
  },
  {
    name: "Cyber crime helpline 1930",
    detail:
      "Call within the golden hour of a transfer. Fast reporting is what makes a freeze on the beneficiary account possible.",
  },
  {
    name: "Your bank's fraud line",
    detail:
      "Report the transfer immediately and ask in writing for the beneficiary account to be flagged.",
  },
  {
    name: "The platform where contact began",
    detail:
      "Report and block the profile so the account can be actioned before it reaches the next target.",
  },
];

/* ---------------------------------------------------------------------------
 * Pure functions
 * ------------------------------------------------------------------------- */

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Score a real encounter against the red-flag checklist.
 *
 * @param {{ flagIds?: string[] }} input
 * @returns {object} assessment, or { error } for invalid input.
 */
export function assessEncounter({ flagIds } = {}) {
  if (!Array.isArray(flagIds)) {
    return { error: "Select the things that actually happened to you, then read the verdict." };
  }

  const selected = new Set(flagIds.filter((id) => typeof id === "string"));
  const matched = RED_FLAGS.filter((flag) => selected.has(flag.id));
  const missing = RED_FLAGS.filter((flag) => !selected.has(flag.id));
  const score = matched.reduce((total, flag) => total + flag.weight, 0);
  const decisive = matched.filter((flag) => flag.decisive);
  const percent = MAX_FLAG_SCORE > 0 ? round2((score / MAX_FLAG_SCORE) * 100) : 0;

  let band = "none";
  let verdict = "Nothing selected yet. Tick every item that matches what actually happened.";

  if (decisive.length > 0) {
    band = "almost-certain";
    verdict =
      "This matches the advance-fee parcel scam. At least one thing you ticked cannot happen in a lawful customs process in India.";
  } else if (percent >= BAND_THRESHOLDS.almostCertain) {
    band = "almost-certain";
    verdict =
      "This matches the advance-fee parcel scam closely enough that you should stop paying and start reporting.";
  } else if (percent >= BAND_THRESHOLDS.highlySuspicious) {
    band = "suspicious";
    verdict =
      "Several signals line up with the scam script. Verify the parcel independently before any money moves.";
  } else if (score > 0) {
    band = "watch";
    verdict =
      "A few signals are present. They are not conclusive on their own, but they are worth resolving before you pay anything.";
  }

  return {
    score,
    maxScore: MAX_FLAG_SCORE,
    percent,
    band,
    verdict,
    matched,
    missing,
    decisive,
    decisiveCount: decisive.length,
    matchedCount: matched.length,
    totalFlags: RED_FLAGS.length,
  };
}

/**
 * Estimate what Indian customs would genuinely charge on a posted gift, so the
 * demanded amount can be compared against a real calculation.
 *
 * @param {{ declaredValueInr: number, isGift?: boolean, bcdRatePct?: number,
 *           igstRatePct?: number, demandedInr?: number }} input
 * @returns {object} duty breakdown, or { error } for invalid input.
 */
export function estimateGenuineDuty({
  declaredValueInr,
  isGift = true,
  bcdRatePct = DEFAULT_BCD_RATE_PCT,
  igstRatePct = DEFAULT_IGST_RATE_PCT,
  demandedInr = 0,
} = {}) {
  const value = Number(declaredValueInr);
  const bcdRate = Number(bcdRatePct);
  const igstRate = Number(igstRatePct);
  const demanded = Number(demandedInr);

  if (!Number.isFinite(value) || !Number.isFinite(bcdRate) || !Number.isFinite(igstRate) || !Number.isFinite(demanded)) {
    return { error: "Enter valid numbers for the parcel value, the duty rates and the amount demanded." };
  }
  if (value < 0) return { error: "Declared parcel value cannot be negative." };
  if (demanded < 0) return { error: "The amount demanded cannot be negative." };
  if (bcdRate < 0 || bcdRate > 100) return { error: "Basic customs duty rate must be between 0% and 100%." };
  if (igstRate < 0 || igstRate > 100) return { error: "IGST rate must be between 0% and 100%." };

  const exempt = isGift === true && value <= GIFT_DUTY_FREE_LIMIT_INR;

  if (exempt) {
    return {
      declaredValue: round2(value),
      exempt: true,
      exemptionLimit: GIFT_DUTY_FREE_LIMIT_INR,
      basicCustomsDuty: 0,
      socialWelfareSurcharge: 0,
      igst: 0,
      totalDuty: 0,
      effectiveRatePct: 0,
      demanded: round2(demanded),
      overchargeMultiple: null,
      note: `A bona fide gift with a CIF value of ${GIFT_DUTY_FREE_LIMIT_INR} or less is exempt from duty, so the correct amount payable is zero.`,
    };
  }

  const basicCustomsDuty = (value * bcdRate) / 100;
  const socialWelfareSurcharge = (basicCustomsDuty * SOCIAL_WELFARE_SURCHARGE_PCT) / 100;
  const igst = ((value + basicCustomsDuty + socialWelfareSurcharge) * igstRate) / 100;
  const totalDuty = basicCustomsDuty + socialWelfareSurcharge + igst;
  const effectiveRatePct = value > 0 ? (totalDuty / value) * 100 : 0;
  const overchargeMultiple = totalDuty > 0 && demanded > 0 ? round2(demanded / totalDuty) : null;

  return {
    declaredValue: round2(value),
    exempt: false,
    exemptionLimit: GIFT_DUTY_FREE_LIMIT_INR,
    bcdRatePct: bcdRate,
    igstRatePct: igstRate,
    basicCustomsDuty: round2(basicCustomsDuty),
    socialWelfareSurcharge: round2(socialWelfareSurcharge),
    igst: round2(igst),
    totalDuty: round2(totalDuty),
    effectiveRatePct: round2(effectiveRatePct),
    demanded: round2(demanded),
    overchargeMultiple,
    note:
      "Duty above the gift exemption is charged on the whole CIF value, not just the excess, and always arrives with an itemised assessment you can verify.",
  };
}
