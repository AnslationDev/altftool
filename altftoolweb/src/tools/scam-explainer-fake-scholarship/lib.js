/**
 * Fake Scholarship Scam Explainer — logic module.
 *
 * Pure logic for three things:
 *  1. Scoring a scholarship or admission offer against a weighted red-flag list.
 *  2. Tallying the fee demands against the promised award, since a genuine
 *     scholarship never requires the student to pay anything first.
 *  3. Classifying the domain a "scholarship portal" link points at, entirely
 *     offline, including the user-info and lookalike tricks phishing pages use.
 *
 * Informational only, not legal or tax advice.
 */

/* ---------------------------------------------------------------------------
 * The real rules
 * ------------------------------------------------------------------------- */

/** The single national portal for centrally funded scholarship schemes. */
export const NATIONAL_PORTAL_HOST = "scholarships.gov.in";

/**
 * Section 10(16) of the Income-tax Act, 1961 exempts scholarships granted to meet
 * the cost of education from income tax. There is therefore no tax, TDS or GST for
 * a student to pay before receiving a genuine scholarship.
 */
export const TAX_EXEMPTION_SECTION = "Section 10(16) of the Income-tax Act, 1961";

/**
 * Centrally funded scholarships are disbursed by Direct Benefit Transfer into the
 * student's own Aadhaar-seeded bank account. No intermediary collects the money and
 * no fee is deducted at the student's end.
 */
export const DISBURSAL_METHOD = "Direct Benefit Transfer into the student's own Aadhaar-seeded account";

export const LEGIT_CHANNELS = [
  {
    id: "nsp",
    name: `National Scholarship Portal (${NATIONAL_PORTAL_HOST})`,
    detail:
      "Registration, application and status tracking for centrally funded schemes. Free at every stage. Application windows and renewal deadlines are published on the portal itself.",
  },
  {
    id: "state",
    name: "Your state's own scholarship portal",
    detail:
      "Most states run a separate post-matric portal on a gov.in or nic.in domain. Reach it from the state government website, not from a forwarded link.",
  },
  {
    id: "institute",
    name: "Your college scholarship or financial aid cell",
    detail:
      "The institute verifies and forwards your application. They can confirm in a minute whether a scheme, a deadline or an agent is real.",
  },
  {
    id: "ugc",
    name: "UGC and AICTE approval lists",
    detail:
      "ugc.ac.in publishes the list of recognised universities and a standing list of fake universities; aicte-india.org lists approved technical institutions.",
  },
];

export const NEVER_HAPPENS = [
  "No government scholarship charges a registration, processing, verification or courier fee.",
  `No tax or GST is payable by a student on a scholarship meant to meet education costs — it is exempt under ${TAX_EXEMPTION_SECTION}.`,
  "No genuine scheme asks for your net banking password, UPI PIN or an OTP. Disbursal needs only your account number and IFSC.",
  "No scholarship is awarded to a student who never applied for it.",
  "No official body conducts selection or payment through a WhatsApp or Telegram group.",
];

/* ---------------------------------------------------------------------------
 * Anatomy of the script
 * ------------------------------------------------------------------------- */

export const ANATOMY = [
  {
    step: 1,
    title: "The unsolicited award",
    detail:
      "A message, call or social media post announces that you have been selected for a scholarship, often naming a real scheme or a plausible foundation, with an amount large enough to matter and small enough to believe.",
    tell: "You never applied. Selection cannot precede an application in any real scheme.",
  },
  {
    step: 2,
    title: "The convincing wrapper",
    detail:
      "An offer letter arrives as a PDF with a national emblem, a scheme code, a reference number and sometimes a signature lifted from a genuine circular.",
    tell: "The reference number cannot be looked up anywhere, and the letter arrives over WhatsApp rather than from an institutional email domain.",
  },
  {
    step: 3,
    title: "The lookalike portal",
    detail:
      "You are sent to a site that copies the layout of the National Scholarship Portal but sits on a commercial domain — scholarship-gov.in, nsp-scholarships.org, indiascholarship.co.",
    tell: "Central government services are on gov.in or nic.in. Anything else, however official the design, is not the portal.",
  },
  {
    step: 4,
    title: "The first small fee",
    detail:
      "A registration or verification fee is demanded, deliberately modest against the promised award — a few hundred to a couple of thousand rupees, payable by UPI.",
    tell: "The economics are the giveaway: a scheme that hands out lakhs does not need your two thousand rupees to process it.",
  },
  {
    step: 5,
    title: "Data harvest",
    detail:
      "The form asks for far more than a scholarship needs: Aadhaar number, full bank credentials, a photograph of your marksheet, sometimes net banking login details 'to enable transfer'.",
    tell: "Disbursal requires only an account number and IFSC. Anything asking for a password, PIN or OTP is collecting credentials, not enabling a transfer.",
  },
  {
    step: 6,
    title: "The escalation",
    detail:
      "New charges appear — a tax or GST component, a bank clearance charge, a courier fee for the certificate — each framed as the final step before release.",
    tell: "A scholarship for education costs is tax-exempt, so a tax demand on it is definitionally fake.",
  },
  {
    step: 7,
    title: "The referral twist",
    detail:
      "Some variants add a group in which you are asked to bring in classmates for a 'batch disbursal', turning victims into recruiters and making later warnings harder to hear.",
    tell: "No selection process depends on you enrolling other students.",
  },
  {
    step: 8,
    title: "The silence",
    detail:
      "Payments stop being answered, the group goes quiet or is deleted, and the portal disappears. Sometimes a 'recovery agent' then offers to get your money back for a fee.",
    tell: "Recovery offers after a scam are almost always the same group returning for a second pass.",
  },
];

/* ---------------------------------------------------------------------------
 * Weighted red-flag checklist
 * ------------------------------------------------------------------------- */

export const RED_FLAGS = [
  {
    id: "fee-demanded",
    label: "You are asked to pay any fee to receive or process the scholarship",
    weight: 4,
    decisive: true,
  },
  {
    id: "credentials",
    label: "You are asked for a net banking password, UPI PIN, card CVV or OTP",
    weight: 4,
    decisive: true,
  },
  {
    id: "never-applied",
    label: "You were 'selected' for a scheme you never applied to",
    weight: 4,
    decisive: true,
  },
  {
    id: "tax-demand",
    label: "You are asked to pay tax or GST on the scholarship amount",
    weight: 4,
    decisive: true,
  },
  {
    id: "non-gov-portal",
    label: "The portal is not on a gov.in, nic.in or recognised institutional domain",
    weight: 3,
    decisive: false,
  },
  {
    id: "whatsapp-process",
    label: "The whole process runs through a WhatsApp or Telegram group",
    weight: 3,
    decisive: false,
  },
  {
    id: "personal-upi",
    label: "Payment goes to a personal UPI ID or an individual's bank account",
    weight: 3,
    decisive: false,
  },
  {
    id: "deadline",
    label: "You are given hours or a single day before the award 'lapses'",
    weight: 2,
    decisive: false,
  },
  {
    id: "no-verification",
    label: "The reference or scheme number cannot be verified anywhere",
    weight: 2,
    decisive: false,
  },
  {
    id: "referral",
    label: "You are asked to bring in classmates for a batch disbursal",
    weight: 2,
    decisive: false,
  },
  {
    id: "free-email",
    label: "Official correspondence comes from a Gmail, Yahoo or Outlook address",
    weight: 2,
    decisive: false,
  },
  {
    id: "guaranteed-seat",
    label: "An agent guarantees an admission or a management seat for a cash payment",
    weight: 3,
    decisive: false,
  },
];

export const MAX_FLAG_SCORE = RED_FLAGS.reduce((total, flag) => total + flag.weight, 0);

export const BAND_THRESHOLDS = { almostCertain: 45, suspicious: 20 };

/* ---------------------------------------------------------------------------
 * Pure functions
 * ------------------------------------------------------------------------- */

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Score a scholarship or admission offer.
 *
 * @param {{ flagIds?: string[] }} input
 * @returns {object} assessment, or { error } for invalid input.
 */
export function assessOffer({ flagIds } = {}) {
  if (!Array.isArray(flagIds)) {
    return { error: "Tick everything that is true of the offer in front of you." };
  }
  const selected = new Set(flagIds.filter((id) => typeof id === "string"));
  const matched = RED_FLAGS.filter((flag) => selected.has(flag.id));
  const score = matched.reduce((total, flag) => total + flag.weight, 0);
  const decisive = matched.filter((flag) => flag.decisive);
  const percent = MAX_FLAG_SCORE > 0 ? round2((score / MAX_FLAG_SCORE) * 100) : 0;

  let band = "none";
  let verdict = "Nothing ticked yet. Mark everything that matches the offer you received.";

  if (decisive.length > 0) {
    band = "almost-certain";
    verdict =
      "This is a fake scholarship offer. At least one thing you ticked cannot occur in any genuine government or institutional scheme.";
  } else if (percent >= BAND_THRESHOLDS.almostCertain) {
    band = "almost-certain";
    verdict =
      "The offer matches the fake scholarship pattern. Verify the scheme on the national portal or with your college before anything else.";
  } else if (percent >= BAND_THRESHOLDS.suspicious) {
    band = "suspicious";
    verdict =
      "Enough signals to stop and verify. Take the scheme name to your college scholarship cell before responding.";
  } else if (score > 0) {
    band = "watch";
    verdict =
      "A few weak signals. Confirm the scheme exists on the official portal before sharing any documents.";
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
 * Tally what has been demanded against the promised award.
 *
 * @param {{ promisedAwardInr: number, feesInr?: number[] }} input
 * @returns {object} tally, or { error } for invalid input.
 */
export function analyseFeeDemands({ promisedAwardInr, feesInr } = {}) {
  const award = Number(promisedAwardInr);
  if (!Number.isFinite(award)) {
    return { error: "Enter the promised scholarship amount as a number." };
  }
  if (award < 0) {
    return { error: "The promised award cannot be negative." };
  }
  if (!Array.isArray(feesInr)) {
    return { error: "Enter each fee you have been asked for, one per line." };
  }

  const amounts = [];
  for (const raw of feesInr) {
    const value = Number(raw);
    if (!Number.isFinite(value)) {
      return { error: "One of the fee amounts is not a number. Use digits only, one amount per line." };
    }
    if (value < 0) {
      return { error: "A fee amount cannot be negative." };
    }
    amounts.push(value);
  }

  const totalDemanded = amounts.reduce((total, value) => total + value, 0);
  const sharePct = award > 0 ? round2((totalDemanded / award) * 100) : null;
  const correctAmountPayable = 0;

  let verdict;
  if (totalDemanded === 0) {
    verdict =
      "Nothing demanded yet, which is exactly right — the correct amount a student pays for a genuine scholarship is zero at every stage.";
  } else if (award > 0) {
    verdict = `You have been asked for ${round2(totalDemanded)} rupees against a promised ${round2(award)}. The correct figure is zero: centrally funded scholarships are disbursed by ${DISBURSAL_METHOD} with no fee at the student's end.`;
  } else {
    verdict = `You have been asked for ${round2(totalDemanded)} rupees. The correct figure is zero — no genuine scholarship requires a student to pay first.`;
  }

  return {
    promisedAward: round2(award),
    fees: amounts.map((value) => round2(value)),
    feeCount: amounts.length,
    totalDemanded: round2(totalDemanded),
    correctAmountPayable,
    sharePct,
    verdict,
  };
}

/* ---------------------------------------------------------------------------
 * Offline domain classification
 * ------------------------------------------------------------------------- */

const GOVERNMENT_SUFFIXES = [".gov.in", ".nic.in"];
const ACADEMIC_SUFFIXES = [".ac.in", ".edu.in", ".edu"];
const SUSPICIOUS_WORDS = ["scholarship", "scholar", "nsp", "gov", "govt", "sarkari", "yojana", "india"];
const IPV4_PATTERN = /^\d{1,3}(\.\d{1,3}){3}$/;

/**
 * Classify a scholarship link offline. Nothing is fetched or sent anywhere.
 *
 * @param {string} raw a URL or bare host
 * @returns {object} classification, or { error } for unusable input.
 */
export function checkPortalDomain(raw) {
  if (typeof raw !== "string") {
    return { error: "Paste the link exactly as it appears in the message." };
  }
  const trimmed = raw.trim();
  if (trimmed === "") {
    return { error: "Paste the link exactly as it appears in the message." };
  }

  const warnings = [];
  let rest = trimmed;

  const schemeMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//.exec(rest);
  const scheme = schemeMatch ? schemeMatch[1].toLowerCase() : null;
  if (schemeMatch) rest = rest.slice(schemeMatch[0].length);
  if (scheme === "http") {
    warnings.push("The link is plain http, so anything typed into it travels unencrypted.");
  }

  rest = rest.split(/[/?#]/)[0];

  if (rest.includes("@")) {
    const parts = rest.split("@");
    const shown = parts[0];
    rest = parts[parts.length - 1];
    warnings.push(
      `Everything before the @ sign ("${shown}") is ignored by the browser. The site you would actually reach is ${rest || "unknown"}.`,
    );
  }

  let port = null;
  const portMatch = /:(\d+)$/.exec(rest);
  if (portMatch) {
    port = portMatch[1];
    rest = rest.slice(0, portMatch.index);
    warnings.push(`The link specifies port ${port}. Government portals are served on the default web ports.`);
  }

  const host = rest.toLowerCase().replace(/\.+$/, "");
  if (host === "") {
    return { error: "No hostname could be read from that link. Copy the whole address including the domain." };
  }
  if (!/^[a-z0-9.-]+$/.test(host)) {
    return {
      host,
      category: "invalid",
      isOfficialPortal: false,
      verdict: "That is not a usable hostname. Do not open it.",
      warnings: ["The hostname contains characters that do not belong in a domain name."],
    };
  }

  if (IPV4_PATTERN.test(host)) {
    warnings.push("The link points at a bare IP address rather than a domain name.");
  }
  if (host.includes("xn--")) {
    warnings.push(
      "The domain uses punycode, which is how lookalike characters from other alphabets are encoded. Treat it as hostile.",
    );
  }
  if (host.split(".").length > 4) {
    warnings.push("Unusually deep subdomain nesting, a common way to hide the real registered domain.");
  }

  const isOfficialPortal = host === NATIONAL_PORTAL_HOST;
  const isGovernment = GOVERNMENT_SUFFIXES.some((suffix) => host.endsWith(suffix));
  const isAcademic = ACADEMIC_SUFFIXES.some((suffix) => host.endsWith(suffix));

  let category;
  let verdict;
  if (isOfficialPortal) {
    category = "official";
    verdict = "This is the National Scholarship Portal itself.";
  } else if (isGovernment) {
    category = "government";
    verdict =
      "A government domain. Still confirm the scheme is listed on the national or your state portal before applying.";
  } else if (isAcademic) {
    category = "academic";
    verdict =
      "An academic domain. Plausible for an institutional scheme; confirm with your college scholarship cell.";
  } else {
    category = "other";
    verdict =
      "Not a government or academic domain. No centrally funded scholarship is applied for or paid on a commercial domain.";
    const hits = SUSPICIOUS_WORDS.filter((word) => host.includes(word));
    // Drop the shorter of any overlapping pair so the message reads cleanly.
    const impersonates = hits.filter(
      (word) => !hits.some((other) => other !== word && other.includes(word)),
    );
    if (impersonates.length > 0) {
      warnings.push(
        `The name borrows official-sounding words (${impersonates.join(", ")}) while sitting outside gov.in and nic.in — the standard shape of a lookalike portal.`,
      );
    }
  }

  return {
    host,
    scheme,
    port,
    category,
    isOfficialPortal,
    isGovernment,
    isAcademic,
    verdict,
    warnings,
  };
}
