/**
 * Fake Traffic Challan Scam Explainer — logic module.
 *
 * Three pure pieces of work:
 *  1. A weighted red-flag score for a suspicious e-challan SMS or WhatsApp message.
 *  2. Offline validation of an Indian vehicle registration number, including the
 *     Bharat (BH) series, so a message quoting a malformed number is caught at once.
 *  3. A statutory penalty estimate from the Motor Vehicles Act, 1988 as amended by
 *     the Motor Vehicles (Amendment) Act, 2019, so a demanded amount can be compared
 *     against the compoundable figure Parliament actually set.
 *
 * Informational only. States notify their own compounding amounts under Section 200,
 * so the figures here are the central baseline, not the final word in every state.
 */

/* ---------------------------------------------------------------------------
 * Official channels
 * ------------------------------------------------------------------------- */

/** The single national lookup and payment portal for e-challans. */
export const OFFICIAL_CHALLAN_PORTAL = "echallan.parivahan.gov.in";

/** The national cyber crime helpline number. */
export const CYBER_HELPLINE = "1930";

export const OFFICIAL_CHECKS = [
  {
    id: "portal",
    label: `Look the challan up yourself on ${OFFICIAL_CHALLAN_PORTAL}`,
    detail:
      "Search by vehicle number, driving licence number or challan number. A genuine challan appears there with the offence, the location, the date and a photograph. Nothing found means nothing was issued.",
  },
  {
    id: "app",
    label: "Cross-check in the mParivahan app from an official app store",
    detail:
      "Install it yourself from Google Play or the App Store. Never install a traffic app from a link in a message.",
  },
  {
    id: "state-portal",
    label: "Check your state transport or traffic police portal",
    detail:
      "Some state police issue challans on their own portal as well. Reach it by typing the address, not by tapping a link.",
  },
  {
    id: "helpline",
    label: "Call the traffic police control room on a number you looked up",
    detail:
      "Use a number from the official website, never the callback number printed in the message.",
  },
];

/* ---------------------------------------------------------------------------
 * Anatomy of the script
 * ------------------------------------------------------------------------- */

export const ANATOMY = [
  {
    step: 1,
    title: "A plausible SMS lands",
    detail:
      "The text reads like a real e-challan notice: a vehicle number, an offence such as over-speeding or signal jumping, a fine amount and a warning about court action. It arrives from an ordinary 10-digit mobile number rather than a registered sender header.",
    tell: "Genuine transactional SMS comes from a six-character alphanumeric header registered with TRAI, not a personal mobile number.",
  },
  {
    step: 2,
    title: "The number is close but wrong",
    detail:
      "Many campaigns blast the same message to thousands of numbers with a plausible-looking registration number. Some victims do own a similar vehicle, which is enough to create doubt.",
    tell: "Compare the quoted registration character by character with your own RC. Even one wrong digit ends it.",
  },
  {
    step: 3,
    title: "A shortened or lookalike link",
    detail:
      "The link uses a URL shortener or a domain that imitates the real one — parivahan-echallan.in, echallan-parivahan.org, vahan-parivahan.co — none of which are government domains.",
    tell: "Every genuine central transport service sits on a gov.in domain. Read the text immediately before the first single slash.",
  },
  {
    step: 4,
    title: "The APK trap",
    detail:
      "Tapping the link downloads an Android package file, often named like an official app, and the page instructs you to allow installation from unknown sources.",
    tell: "No government department distributes an app as a downloadable APK from an SMS link. This step alone is the attack.",
  },
  {
    step: 5,
    title: "Permissions harvest",
    detail:
      "The installed app asks for SMS, contacts, accessibility and notification access. With SMS access it can read one-time passwords; with accessibility it can watch and drive the screen.",
    tell: "A payment or challan app has no legitimate reason to need SMS reading or accessibility services.",
  },
  {
    step: 6,
    title: "Silent drain or spread",
    detail:
      "Transactions are authorised using intercepted OTPs, and the same message is forwarded to your contact list from your device, which makes the next wave look like it came from a friend.",
    tell: "Unexplained outgoing SMS in your sent items, or friends asking about a challan link you never sent.",
  },
  {
    step: 7,
    title: "Pressure to pay directly",
    detail:
      "A variant skips malware and simply asks for payment to a UPI ID, framed as a discounted settlement if paid before a deadline.",
    tell: "Challan payment is collected by the transport department gateway or at a Lok Adalat, never into a personal UPI handle.",
  },
];

/* ---------------------------------------------------------------------------
 * Weighted red-flag checklist
 * ------------------------------------------------------------------------- */

export const RED_FLAGS = [
  {
    id: "apk",
    label: "The link downloaded a file (.apk) or asked you to allow unknown sources",
    weight: 4,
    decisive: true,
  },
  {
    id: "non-gov-domain",
    label: "The link is not on a gov.in domain, or is a shortened link",
    weight: 4,
    decisive: true,
  },
  {
    id: "upi",
    label: "You are asked to pay into a UPI ID, wallet or personal bank account",
    weight: 4,
    decisive: true,
  },
  {
    id: "mobile-sender",
    label: "The SMS came from a 10-digit mobile number, not a registered sender header",
    weight: 3,
    decisive: false,
  },
  {
    id: "wrong-vehicle",
    label: "The registration number quoted is not yours, or is malformed",
    weight: 3,
    decisive: false,
  },
  {
    id: "not-on-portal",
    label: `The challan does not appear on ${OFFICIAL_CHALLAN_PORTAL}`,
    weight: 3,
    decisive: false,
  },
  {
    id: "no-details",
    label: "There is no offence location, date, time or photograph",
    weight: 2,
    decisive: false,
  },
  {
    id: "discount",
    label: "You are offered a discount for paying immediately",
    weight: 2,
    decisive: false,
  },
  {
    id: "arrest-threat",
    label: "It threatens arrest, licence cancellation or court within hours",
    weight: 2,
    decisive: false,
  },
  {
    id: "otp",
    label: "Someone asked you to read out an OTP to confirm the payment",
    weight: 3,
    decisive: false,
  },
  {
    id: "spelling",
    label: "Government names or spellings are wrong (Parivahaan, RTO Dept., etc.)",
    weight: 1,
    decisive: false,
  },
  {
    id: "no-drive",
    label: "You were not driving in that place on that date at all",
    weight: 2,
    decisive: false,
  },
];

export const MAX_FLAG_SCORE = RED_FLAGS.reduce((total, flag) => total + flag.weight, 0);

export const BAND_THRESHOLDS = { almostCertain: 45, suspicious: 20 };

/* ---------------------------------------------------------------------------
 * Statutory penalties — Motor Vehicles Act, 1988 as amended in 2019
 * ------------------------------------------------------------------------- */

/**
 * Central penalty amounts in rupees. `first` is the first-offence figure and
 * `subsequent` the repeat-offence figure where the Act specifies one. States may
 * notify different compounding amounts under Section 200.
 */
export const PENALTIES = [
  { id: "no-licence", section: "181", label: "Driving without a valid licence", first: 5000, subsequent: 5000 },
  { id: "unregistered", section: "192", label: "Driving an unregistered vehicle", first: 5000, subsequent: 10000 },
  { id: "no-insurance", section: "196", label: "Driving without third-party insurance", first: 2000, subsequent: 4000 },
  { id: "overspeed-lmv", section: "183", label: "Over-speeding (light motor vehicle)", first: 1000, subsequent: 2000 },
  { id: "overspeed-hmv", section: "183", label: "Over-speeding (medium or heavy vehicle)", first: 2000, subsequent: 4000 },
  { id: "drunk", section: "185", label: "Drink driving", first: 10000, subsequent: 15000 },
  { id: "dangerous", section: "184", label: "Dangerous driving, including using a handheld phone", first: 5000, subsequent: 10000 },
  { id: "no-helmet", section: "194D", label: "Riding without a helmet", first: 1000, subsequent: 1000 },
  { id: "no-seatbelt", section: "194B", label: "Driving without a seat belt", first: 1000, subsequent: 1000 },
  { id: "no-puc", section: "190(2)", label: "No valid pollution under control certificate", first: 10000, subsequent: 10000 },
  { id: "racing", section: "189", label: "Racing or speed trials", first: 5000, subsequent: 10000 },
  { id: "emergency", section: "194E", label: "Not giving way to an emergency vehicle", first: 10000, subsequent: 10000 },
  { id: "overload-passenger", section: "194A", label: "Carrying excess passengers (per extra passenger)", first: 1000, subsequent: 1000 },
  { id: "juvenile", section: "199A", label: "Offence by a juvenile (guardian or owner liable)", first: 25000, subsequent: 25000 },
];

/* ---------------------------------------------------------------------------
 * Registration number validation
 * ------------------------------------------------------------------------- */

/** Live state and union territory codes used in Indian registration marks. */
export const STATE_CODES = {
  AN: "Andaman and Nicobar Islands",
  AP: "Andhra Pradesh",
  AR: "Arunachal Pradesh",
  AS: "Assam",
  BR: "Bihar",
  CG: "Chhattisgarh",
  CH: "Chandigarh",
  DD: "Dadra and Nagar Haveli and Daman and Diu",
  DL: "Delhi",
  GA: "Goa",
  GJ: "Gujarat",
  HP: "Himachal Pradesh",
  HR: "Haryana",
  JH: "Jharkhand",
  JK: "Jammu and Kashmir",
  KA: "Karnataka",
  KL: "Kerala",
  LA: "Ladakh",
  LD: "Lakshadweep",
  MH: "Maharashtra",
  ML: "Meghalaya",
  MN: "Manipur",
  MP: "Madhya Pradesh",
  MZ: "Mizoram",
  NL: "Nagaland",
  OD: "Odisha",
  PB: "Punjab",
  PY: "Puducherry",
  RJ: "Rajasthan",
  SK: "Sikkim",
  TN: "Tamil Nadu",
  TR: "Tripura",
  TS: "Telangana",
  UK: "Uttarakhand",
  UP: "Uttar Pradesh",
  WB: "West Bengal",
};

/** Standard mark: two-letter state code, RTO number, series letters, serial. */
const STANDARD_PATTERN = /^([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{1,4})$/;
/** Bharat series introduced in 2021: two-digit year, BH, four-digit serial, series letters. */
const BH_PATTERN = /^(\d{2})BH(\d{4})([A-Z]{1,2})$/;

/**
 * Validate an Indian vehicle registration number offline.
 *
 * @param {string} raw
 * @returns {object} validation result, or { error } for invalid input.
 */
export function checkRegistrationNumber(raw) {
  if (typeof raw !== "string") {
    return { error: "Enter the registration number exactly as it appears in the message." };
  }
  const normalised = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (normalised.length === 0) {
    return { error: "Enter the registration number exactly as it appears in the message." };
  }
  if (normalised.length > 11) {
    return {
      valid: false,
      normalised,
      reason: "Too many characters for any Indian registration format.",
    };
  }

  const bh = BH_PATTERN.exec(normalised);
  if (bh) {
    return {
      valid: true,
      normalised,
      format: "Bharat (BH) series",
      registrationYear: `20${bh[1]}`,
      serial: bh[2],
      series: bh[3],
      formatted: `${bh[1]} BH ${bh[2]} ${bh[3]}`,
      reason: "Matches the Bharat series format used for transferable all-India registration.",
    };
  }

  const standard = STANDARD_PATTERN.exec(normalised);
  if (!standard) {
    return {
      valid: false,
      normalised,
      reason:
        "Does not match either the standard state format (two letters, RTO number, series letters, serial) or the Bharat series format.",
    };
  }

  const [, stateCode, rto, series, serial] = standard;
  const stateName = STATE_CODES[stateCode];
  if (!stateName) {
    return {
      valid: false,
      normalised,
      stateCode,
      reason: `"${stateCode}" is not a live Indian state or union territory code.`,
    };
  }

  return {
    valid: true,
    normalised,
    format: "Standard state registration",
    stateCode,
    stateName,
    rtoCode: rto.padStart(2, "0"),
    series,
    serial,
    formatted: `${stateCode} ${rto.padStart(2, "0")} ${series} ${serial}`,
    reason: `Well-formed mark registered in ${stateName} at RTO ${rto.padStart(2, "0")}.`,
  };
}

/* ---------------------------------------------------------------------------
 * Pure scoring and penalty functions
 * ------------------------------------------------------------------------- */

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Score a suspected fake challan message.
 *
 * @param {{ flagIds?: string[] }} input
 * @returns {object} assessment, or { error } for invalid input.
 */
export function assessChallanMessage({ flagIds } = {}) {
  if (!Array.isArray(flagIds)) {
    return { error: "Tick the things that are true of the message you received." };
  }
  const selected = new Set(flagIds.filter((id) => typeof id === "string"));
  const matched = RED_FLAGS.filter((flag) => selected.has(flag.id));
  const score = matched.reduce((total, flag) => total + flag.weight, 0);
  const decisive = matched.filter((flag) => flag.decisive);
  const percent = MAX_FLAG_SCORE > 0 ? round2((score / MAX_FLAG_SCORE) * 100) : 0;

  let band = "none";
  let verdict = "Nothing ticked yet. Mark everything that is true of the message in front of you.";

  if (decisive.length > 0) {
    band = "almost-certain";
    verdict =
      "This is a fake challan. At least one thing you ticked never happens with a genuine e-challan notice.";
  } else if (percent >= BAND_THRESHOLDS.almostCertain) {
    band = "almost-certain";
    verdict =
      "The message matches the fake challan pattern. Do not open the link; check the portal directly instead.";
  } else if (percent >= BAND_THRESHOLDS.suspicious) {
    band = "suspicious";
    verdict =
      "Several signals point to a fake. Verify the challan on the official portal before doing anything else.";
  } else if (score > 0) {
    band = "watch";
    verdict =
      "A couple of weak signals. Not conclusive, but still check the portal yourself rather than tapping the link.";
  }

  return {
    score,
    maxScore: MAX_FLAG_SCORE,
    percent,
    band,
    verdict,
    matched,
    decisive,
    decisiveCount: decisive.length,
    matchedCount: matched.length,
    totalFlags: RED_FLAGS.length,
  };
}

/**
 * Total the statutory penalty for one or more offences and compare it with the
 * amount a message is demanding.
 *
 * @param {{ offenceIds?: string[], repeatOffence?: boolean, demandedInr?: number }} input
 * @returns {object} penalty breakdown, or { error } for invalid input.
 */
export function estimateStatutoryPenalty({ offenceIds, repeatOffence = false, demandedInr = 0 } = {}) {
  if (!Array.isArray(offenceIds)) {
    return { error: "Select at least one offence to compare against the amount demanded." };
  }
  const demanded = Number(demandedInr);
  if (!Number.isFinite(demanded)) {
    return { error: "Enter a valid amount for the fine being demanded." };
  }
  if (demanded < 0) {
    return { error: "The amount demanded cannot be negative." };
  }

  const selected = new Set(offenceIds.filter((id) => typeof id === "string"));
  const items = PENALTIES.filter((penalty) => selected.has(penalty.id)).map((penalty) => ({
    ...penalty,
    amount: repeatOffence ? penalty.subsequent : penalty.first,
  }));
  const statutoryTotal = items.reduce((total, item) => total + item.amount, 0);
  const difference = demanded - statutoryTotal;
  const ratio = statutoryTotal > 0 && demanded > 0 ? round2(demanded / statutoryTotal) : null;

  return {
    items,
    itemCount: items.length,
    repeatOffence: repeatOffence === true,
    statutoryTotal,
    demanded: round2(demanded),
    difference: round2(difference),
    ratio,
    verdict:
      items.length === 0
        ? "Pick the offence the message names to see the amount the Act actually sets."
        : difference > 0
          ? `The message is asking for ${round2(difference)} rupees more than the central statutory figure for these offences.`
          : difference < 0
            ? `The message is asking for less than the central statutory figure, which is itself a warning sign — genuine challans are not discounted over SMS.`
            : "The amount matches the central statutory figure, which proves nothing on its own — verify the challan on the portal.",
  };
}
