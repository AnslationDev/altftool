/**
 * SIM Block Warning Scam Explainer — logic module.
 *
 * Pure logic for three things:
 *  1. Scoring a "your number will be disconnected" call against a weighted
 *     red-flag checklist.
 *  2. Checking a subscriber's SIM count against the Department of
 *     Telecommunications per-person connection ceiling, which is the real rule
 *     the scam misrepresents.
 *  3. Rating how much control a remote-access or screen-share app hands over,
 *     which is the payload the call is steering towards.
 *
 * Informational only, not legal advice.
 */

/* ---------------------------------------------------------------------------
 * The real rules the scam distorts
 * ------------------------------------------------------------------------- */

/**
 * DoT caps the number of mobile connections one person may hold against a single
 * proof of identity. The general ceiling is 9. Licensed service areas of Jammu &
 * Kashmir, Assam and the North East are capped at 6.
 * Source: Department of Telecommunications instructions on subscriber
 * verification, surfaced to the public through the TAFCOP facility on Sanchar Saathi.
 */
export const CONNECTION_LIMIT_GENERAL = 9;
export const CONNECTION_LIMIT_RESTRICTED = 6;

export const SERVICE_AREAS = [
  {
    id: "general",
    label: "Rest of India",
    limit: CONNECTION_LIMIT_GENERAL,
  },
  {
    id: "restricted",
    label: "Jammu & Kashmir, Assam and the North East",
    limit: CONNECTION_LIMIT_RESTRICTED,
  },
];

/** Government facilities that actually exist for this problem. */
export const OFFICIAL_FACILITIES = [
  {
    id: "tafcop",
    name: "TAFCOP on Sanchar Saathi",
    detail:
      "sancharsaathi.gov.in lists every mobile connection issued against your identity document. You can flag one as 'not my number' and have it disconnected, free, without speaking to anyone.",
  },
  {
    id: "chakshu",
    name: "Chakshu on Sanchar Saathi",
    detail:
      "The reporting facility for suspected fraud communication — the call, SMS or WhatsApp message that led you here. Reporting takes a minute and needs no complaint number.",
  },
  {
    id: "cyber",
    name: "Cyber crime helpline 1930 and cybercrime.gov.in",
    detail:
      "For anything where money has already moved, or where you were pressured into a video call, screen share or transfer.",
  },
  {
    id: "operator",
    name: "Your operator's own store or app",
    detail:
      "Any genuine KYC or re-verification issue is resolved at a retail store with your original identity document, never over an inbound call.",
  },
];

/** What no lawful process ever includes — stated plainly. */
export const NEVER_HAPPENS = [
  "TRAI does not issue, verify or disconnect individual mobile connections; that is the operator's job under DoT rules.",
  "No Indian police, CBI, ED, Narcotics Control Bureau or court conducts an interrogation or an 'arrest' over a video call. There is no such thing as digital arrest in Indian law.",
  "No agency asks you to transfer money to a 'verification', 'clearance' or 'RBI safe' account and promises to return it.",
  "No genuine helpdesk needs remote control of your phone or computer to fix a SIM.",
  "A real disconnection notice comes from your operator through their registered SMS header and app, and gives you days, not two hours.",
];

/* ---------------------------------------------------------------------------
 * Anatomy of the script
 * ------------------------------------------------------------------------- */

export const ANATOMY = [
  {
    step: 1,
    title: "The recorded warning",
    detail:
      "An automated voice, usually in English then Hindi, says your mobile number will be disconnected in one or two hours because of an incomplete verification or an illegal activity report, and tells you to press 9 or 1 to speak to a customer care executive.",
    tell: "Pressing a key routes you to a person, which is the whole purpose. A real operator notification does not need you to press anything.",
  },
  {
    step: 2,
    title: "The fake executive",
    detail:
      "A calm 'customer care' voice takes over, confirms the last digits of a number or a partial name to build credibility, and says the problem is bigger than a SIM issue.",
    tell: "Partial details are cheap. Leaked databases and marketing lists supply names, cities and part of a number.",
  },
  {
    step: 3,
    title: "Handover to the fake authority",
    detail:
      "The call is transferred to someone claiming to be from the Department of Telecommunications, TRAI, the cyber cell, the CBI or Mumbai crime branch. Sometimes a uniform appears on a video call with a fabricated backdrop.",
    tell: "Departments do not transfer an inbound telemarketing call to a police officer. Hang up and dial the department yourself if in doubt.",
  },
  {
    step: 4,
    title: "The accusation",
    detail:
      "You are told a SIM issued on your Aadhaar was used for harassment, money laundering or a drug parcel. A forged FIR, warrant or notice with your name on it is sent over WhatsApp.",
    tell: "A real FIR is served in writing and can be checked with the police station named on it, using a number you look up yourself.",
  },
  {
    step: 5,
    title: "Isolation",
    detail:
      "You are ordered to stay on the call, not to tell family, and to move to a room alone 'for confidentiality of the investigation'. The call may run for hours to prevent you from checking anything.",
    tell: "Secrecy plus continuous contact is the signature of this fraud. No investigation forbids you from calling a lawyer or a relative.",
  },
  {
    step: 6,
    title: "The app install",
    detail:
      "To 'verify your device' or 'file your statement', you are told to install a remote-access or screen-sharing app, or to join a video call and share your screen while you open your banking app.",
    tell: "Once installed, that app can see and control what you see and type, including one-time passwords.",
  },
  {
    step: 7,
    title: "The transfer",
    detail:
      "You are asked to move your balance to a 'verification account' or 'RBI safe account' for a few hours, with a written promise of return, or to read out OTPs so the officer can 'clear' your accounts.",
    tell: "There is no safe account, no clearance deposit and no refundable verification transfer anywhere in Indian law.",
  },
  {
    step: 8,
    title: "The stretch",
    detail:
      "If you comply, further amounts follow — a bail deposit, a tax on the returned money, an NOC fee. The call ends only when the money or the victim runs out.",
    tell: "Every extra demand after the first payment is the same fraud, not a complication of it.",
  },
];

/* ---------------------------------------------------------------------------
 * Weighted red-flag checklist
 * ------------------------------------------------------------------------- */

export const RED_FLAGS = [
  {
    id: "remote-app",
    label: "You were told to install a remote-access or screen-sharing app",
    weight: 4,
    decisive: true,
  },
  {
    id: "safe-account",
    label: "You were asked to transfer money to a 'verification' or 'RBI safe' account",
    weight: 4,
    decisive: true,
  },
  {
    id: "digital-arrest",
    label: "You were kept on a video call under 'digital arrest' or house confinement",
    weight: 4,
    decisive: true,
  },
  {
    id: "otp",
    label: "You were asked to read out an OTP or a card CVV",
    weight: 4,
    decisive: true,
  },
  {
    id: "press-key",
    label: "A recorded call told you to press a key to avoid disconnection",
    weight: 3,
    decisive: false,
  },
  {
    id: "trai-caller",
    label: "The caller claimed to be from TRAI or the Department of Telecommunications",
    weight: 3,
    decisive: false,
  },
  {
    id: "police-transfer",
    label: "The call was transferred to a 'police officer' or 'CBI officer'",
    weight: 3,
    decisive: false,
  },
  {
    id: "secrecy",
    label: "You were told not to tell family, colleagues or the bank",
    weight: 3,
    decisive: false,
  },
  {
    id: "forged-doc",
    label: "You were sent an FIR, warrant or notice over WhatsApp",
    weight: 2,
    decisive: false,
  },
  {
    id: "two-hours",
    label: "You were given a deadline of hours before the number is blocked",
    weight: 2,
    decisive: false,
  },
  {
    id: "aadhaar-claim",
    label: "The caller said a SIM issued on your Aadhaar was used in a crime",
    weight: 2,
    decisive: false,
  },
  {
    id: "long-call",
    label: "You were kept on the line for more than an hour",
    weight: 2,
    decisive: false,
  },
];

export const MAX_FLAG_SCORE = RED_FLAGS.reduce((total, flag) => total + flag.weight, 0);

export const BAND_THRESHOLDS = { almostCertain: 45, suspicious: 20 };

/* ---------------------------------------------------------------------------
 * Remote-access exposure
 * ------------------------------------------------------------------------- */

/**
 * Capability weights used to describe what a remote tool actually grants. These
 * are descriptive categories, not a security rating of any product — every one of
 * these tools has entirely legitimate uses.
 */
export const REMOTE_CAPABILITIES = [
  { id: "view", label: "Sees your screen, including OTP banners", weight: 3 },
  { id: "control", label: "Controls taps and keystrokes on your device", weight: 4 },
  { id: "files", label: "Transfers files to and from your device", weight: 2 },
  { id: "unattended", label: "Can reconnect later without you approving it again", weight: 3 },
  { id: "clipboard", label: "Reads and writes your clipboard", weight: 2 },
];

export const MAX_CAPABILITY_SCORE = REMOTE_CAPABILITIES.reduce((total, item) => total + item.weight, 0);

/* ---------------------------------------------------------------------------
 * Pure functions
 * ------------------------------------------------------------------------- */

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Score a suspected SIM-block call.
 *
 * @param {{ flagIds?: string[] }} input
 * @returns {object} assessment, or { error } for invalid input.
 */
export function assessCall({ flagIds } = {}) {
  if (!Array.isArray(flagIds)) {
    return { error: "Tick everything the caller actually said or asked you to do." };
  }
  const selected = new Set(flagIds.filter((id) => typeof id === "string"));
  const matched = RED_FLAGS.filter((flag) => selected.has(flag.id));
  const score = matched.reduce((total, flag) => total + flag.weight, 0);
  const decisive = matched.filter((flag) => flag.decisive);
  const percent = MAX_FLAG_SCORE > 0 ? round2((score / MAX_FLAG_SCORE) * 100) : 0;

  let band = "none";
  let verdict = "Nothing ticked yet. Mark everything that happened on the call.";

  if (decisive.length > 0) {
    band = "almost-certain";
    verdict =
      "This is the SIM-block fraud. At least one thing you ticked has no lawful counterpart anywhere in Indian telecom or policing procedure. Disconnect and report it.";
  } else if (percent >= BAND_THRESHOLDS.almostCertain) {
    band = "almost-certain";
    verdict =
      "The call matches the fraud script closely. Hang up, and check any real connection issue through Sanchar Saathi or your operator's own store.";
  } else if (percent >= BAND_THRESHOLDS.suspicious) {
    band = "suspicious";
    verdict =
      "Several elements of the script are present. Do not continue the call; verify independently instead.";
  } else if (score > 0) {
    band = "watch";
    verdict =
      "Weak signals so far. End the call anyway and check your connections yourself — it costs nothing.";
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
 * Compare a subscriber's SIM count against the DoT ceiling for their service area.
 *
 * @param {{ connections: number, serviceAreaId?: string, unrecognised?: number }} input
 * @returns {object} result, or { error } for invalid input.
 */
export function checkConnectionCount({ connections, serviceAreaId = "general", unrecognised = 0 } = {}) {
  const area = SERVICE_AREAS.find((item) => item.id === serviceAreaId);
  if (!area) {
    return { error: "Choose a service area so the correct connection limit can be applied." };
  }

  const held = Number(connections);
  const unknown = Number(unrecognised);

  if (!Number.isFinite(held) || !Number.isFinite(unknown)) {
    return { error: "Enter whole numbers for the connections listed and the ones you do not recognise." };
  }
  if (held < 0 || unknown < 0) {
    return { error: "Counts cannot be negative." };
  }
  if (!Number.isInteger(held) || !Number.isInteger(unknown)) {
    return { error: "Enter whole numbers — a SIM is not a fraction." };
  }
  if (held > 100) {
    return { error: "That is far beyond any real subscriber record. Check the number from the TAFCOP listing." };
  }
  if (unknown > held) {
    return { error: "You cannot have more unrecognised connections than connections listed." };
  }

  const limit = area.limit;
  const excess = Math.max(0, held - limit);
  const headroom = Math.max(0, limit - held);
  const withinLimit = held <= limit;

  let action;
  if (unknown > 0) {
    action = `Flag the ${unknown} connection${unknown === 1 ? "" : "s"} you do not recognise as "This is not my number" on the TAFCOP page of Sanchar Saathi. It is free and needs no phone call.`;
  } else if (!withinLimit) {
    action = `You are ${excess} over the ceiling of ${limit} that applies in ${area.label}. Surrender the connections you no longer use through your operator, not through anyone who calls you.`;
  } else {
    action = `Nothing to do. ${held} connection${held === 1 ? "" : "s"} is within the ceiling of ${limit}, so any caller claiming your number is about to be blocked for exceeding a limit is wrong.`;
  }

  return {
    connections: held,
    unrecognised: unknown,
    serviceArea: area.label,
    limit,
    withinLimit,
    excess,
    headroom,
    action,
  };
}

/**
 * Describe how much control a remote tool would hand over, given the capabilities
 * it was granted.
 *
 * @param {{ capabilityIds?: string[] }} input
 * @returns {object} exposure summary, or { error } for invalid input.
 */
export function rateRemoteExposure({ capabilityIds } = {}) {
  if (!Array.isArray(capabilityIds)) {
    return { error: "Select the permissions the app asked for." };
  }
  const selected = new Set(capabilityIds.filter((id) => typeof id === "string"));
  const matched = REMOTE_CAPABILITIES.filter((item) => selected.has(item.id));
  const score = matched.reduce((total, item) => total + item.weight, 0);
  const percent = MAX_CAPABILITY_SCORE > 0 ? round2((score / MAX_CAPABILITY_SCORE) * 100) : 0;

  let level = "none";
  let summary = "No remote capability granted.";
  if (score === 0) {
    level = "none";
  } else if (percent >= 60) {
    level = "total";
    summary =
      "Effectively total control of the device. Assume every credential typed or displayed during the session is compromised.";
  } else if (percent >= 30) {
    level = "high";
    summary =
      "Enough to read one-time passwords and drive the screen. Change credentials from a different device.";
  } else {
    level = "moderate";
    summary =
      "Limited but still enough to observe sensitive information on screen. Treat anything shown during the session as seen.";
  }

  return { score, maxScore: MAX_CAPABILITY_SCORE, percent, level, summary, matched };
}
