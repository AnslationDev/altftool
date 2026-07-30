/**
 * Senior Citizen Privacy Starter Kit — protection scoring plus a money-at-risk model.
 *
 * The checklist is weighted 1-5 by how much of the common fraud path each control
 * removes. The highest weights sit on the three steps that fraud advisories from the
 * Reserve Bank of India and the national cybercrime portal repeat most often:
 * never share an OTP, never install an app sent over a chat link, and never install a
 * remote screen-sharing app at a caller's request.
 *
 * Money-at-risk model
 * -------------------
 * residualDailyExposure = dailyLimit x (1 - score/100)
 * It is a deliberately simple illustration, not an actuarial figure: the daily
 * transfer limit sets the ceiling on what a single successful scam can move, and the
 * completed controls reduce the share of that ceiling that is realistically reachable.
 */

/** NPCI's general per-day UPI ceiling for a customer, in rupees. */
export const UPI_DAILY_CAP_INR = 100000;

/** NPCI restricts a brand-new UPI user to this amount in the first 24 hours. */
export const NEW_USER_FIRST_DAY_CAP_INR = 5000;

/** RBI's limited-liability framework: report an unauthorised electronic transaction
 *  within this many working days for zero customer liability. */
export const ZERO_LIABILITY_WORKING_DAYS = 3;

/** National cyber crime reporting helpline (India). */
export const CYBER_HELPLINE = "1930";

/** TRAI requires a Do Not Disturb preference to take effect within this many days. */
export const DND_EFFECTIVE_DAYS = 7;

/** TRAI DND registration short code. */
export const DND_SHORTCODE = "1909";

export const RISK_BANDS = [
  { min: 85, label: "Well protected", note: "The main scam routes are closed. Review it again in six months." },
  { min: 65, label: "Mostly protected", note: "Good cover. Finish the remaining steps with a family member." },
  { min: 40, label: "Partly protected", note: "A convincing phone call could still cause a loss. Close the critical steps first." },
  { min: 0, label: "At risk", note: "Start today with OTPs, app installs and the phone lock." },
];

export const CHECKLIST = [
  {
    id: "otp-never",
    area: "Calls and OTPs",
    title: "Never read an OTP out to anyone",
    action:
      "No bank, no delivery agent, no government office and no relative on a call will ever need your OTP. End the call.",
    why: "An OTP is the last step of a transfer. Sharing it completes the fraud that everything else was leading up to.",
    weight: 5,
    critical: true,
  },
  {
    id: "callback",
    area: "Calls and OTPs",
    title: "Hang up and call the number printed on your card or passbook",
    action:
      "If a caller says there is a problem with your account, disconnect and dial the official helpline yourself.",
    why: "Caller ID can be faked. Calling back on a number you can see in print removes the impersonation entirely.",
    weight: 4,
    critical: true,
  },
  {
    id: "collect-request",
    area: "Calls and OTPs",
    title: "Never approve a UPI 'collect' or 'request money' notification",
    action:
      "Receiving money never asks for your UPI PIN. If a screen asks for the PIN, money is going out, not coming in.",
    why: "Fake refund and 'I sent extra by mistake' scams rely on the victim entering a PIN on a request-money screen.",
    weight: 4,
    critical: true,
  },
  {
    id: "dnd",
    area: "Calls and OTPs",
    title: `Register on the Do Not Disturb list by sending START 0 to ${DND_SHORTCODE}`,
    action: `You can also call ${DND_SHORTCODE} or use your operator's DND app. TRAI requires it to take effect within ${DND_EFFECTIVE_DAYS} days.`,
    why: "Fewer legitimate marketing calls makes the remaining unsolicited calls easier to treat as suspicious.",
    weight: 3,
    critical: false,
  },
  {
    id: "spam-id",
    area: "Calls and OTPs",
    title: "Switch on your phone's spam and caller-ID warnings",
    action: "Android and iPhone both have a built-in setting to flag suspected spam calls and filter unknown senders.",
    why: "A visible spam label gives you a second to think before answering a scripted call.",
    weight: 3,
    critical: false,
  },
  {
    id: "app-store-only",
    area: "Apps",
    title: "Install apps only from the Play Store or App Store",
    action:
      "Never install an APK file or a 'bank update' sent on WhatsApp, SMS or email, however official it looks.",
    why: "Side-loaded apps sent over chat are the standard delivery method for SMS-stealing and banking malware.",
    weight: 5,
    critical: true,
  },
  {
    id: "no-remote",
    area: "Apps",
    title: "Never install a screen-sharing or remote-control app because a caller asked",
    action:
      "AnyDesk, TeamViewer and QuickSupport hand over your whole screen. No genuine bank or helpline needs them.",
    why: "Remote-access apps let a caller watch you type your PIN and operate the banking app themselves.",
    weight: 5,
    critical: true,
  },
  {
    id: "updates",
    area: "Apps",
    title: "Turn on automatic updates for the phone and its apps",
    action: "Set updates to install overnight over Wi-Fi so security fixes arrive without you doing anything.",
    why: "Most phone compromises use flaws that were already fixed in an update the owner never installed.",
    weight: 3,
    critical: false,
  },
  {
    id: "permissions",
    area: "Apps",
    title: "Review which apps can read your SMS messages",
    action: "In app permissions, remove SMS and accessibility access from anything that is not your messaging app.",
    why: "An app with SMS access can read banking OTPs silently, without the phone ever ringing.",
    weight: 4,
    critical: false,
  },
  {
    id: "phone-lock",
    area: "Phone and device",
    title: "Lock the phone with a PIN that is not a birthday or 1234",
    action: "Use six digits you have not used elsewhere, and add fingerprint or face unlock so it stays convenient.",
    why: "A lost or borrowed phone with no lock gives a stranger the banking app and the OTP inbox together.",
    weight: 4,
    critical: true,
  },
  {
    id: "alerts",
    area: "Banking",
    title: "Switch on SMS and email alerts for every debit",
    action: "Ask the bank to alert on all amounts, not only above a threshold, and read the alerts the same day.",
    why: "Early notice is what makes the reporting window usable — the loss is recoverable only if you spot it.",
    weight: 4,
    critical: false,
  },
  {
    id: "limits",
    area: "Banking",
    title: "Set a daily transaction limit in the banking or UPI app",
    action: `You can lower the limit well below the ${UPI_DAILY_CAP_INR.toLocaleString("en-IN")} rupee ceiling and raise it for a day when you actually need to.`,
    why: "The limit is the hard ceiling on what a single successful scam can move out in one day.",
    weight: 4,
    critical: false,
  },
  {
    id: "intl-off",
    area: "Banking",
    title: "Turn off international and contactless use on cards you do not need",
    action: "Most banking apps let you switch off online, international and tap payments independently.",
    why: "A card switched off for international use cannot be charged from a cloned or stolen card number abroad.",
    weight: 3,
    critical: false,
  },
  {
    id: "kyc-links",
    area: "Messages",
    title: "Ignore 'KYC expiring' and 'electricity will be disconnected' messages",
    action: "Do not tap the link. Visit the branch or the official app instead, or call the number on your bill.",
    why: "Urgency plus a short link is the standard template for phishing pages that harvest banking logins.",
    weight: 4,
    critical: false,
  },
  {
    id: "report",
    area: "If something goes wrong",
    title: `Keep the cybercrime helpline ${CYBER_HELPLINE} written near the phone`,
    action: `Report immediately and also file at cybercrime.gov.in. Reporting an unauthorised electronic transaction within ${ZERO_LIABILITY_WORKING_DAYS} working days is what preserves zero customer liability under RBI's rules.`,
    why: "The money can often be held mid-transfer, but only if the report reaches the bank quickly.",
    weight: 4,
    critical: true,
  },
  {
    id: "trusted-person",
    area: "If something goes wrong",
    title: "Agree one trusted person to call before any unusual transfer",
    action: "Write their number on the same card as the helpline, and make it a rule for any amount above your comfort level.",
    why: "A 30-second call to a second person breaks the pressure that every scam script depends on.",
    weight: 3,
    critical: false,
  },
];

export const MAX_POINTS = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

export const AREAS = CHECKLIST.reduce(
  (list, item) => (list.includes(item.area) ? list : [...list, item.area]),
  [],
);

function bandFor(percent) {
  return RISK_BANDS.find((band) => percent >= band.min) ?? RISK_BANDS[RISK_BANDS.length - 1];
}

/**
 * @param {{doneIds:string[], dailyLimit:number}} input
 * @returns {{error:string}|object}
 */
export function assessKit({ doneIds, dailyLimit } = {}) {
  if (!Array.isArray(doneIds)) {
    return { error: "Completed items must be provided as a list." };
  }

  const limit = Number(dailyLimit);
  if (!Number.isFinite(limit)) {
    return { error: "Enter your daily transfer limit as a plain number of rupees." };
  }
  if (limit < 0) {
    return { error: "A daily transfer limit cannot be negative." };
  }
  if (limit > UPI_DAILY_CAP_INR) {
    return {
      error: `The general UPI ceiling is ${UPI_DAILY_CAP_INR.toLocaleString("en-IN")} rupees a day — enter that or less.`,
    };
  }

  const done = new Set(doneIds.filter((id) => typeof id === "string"));
  let points = 0;
  const remaining = [];
  for (const item of CHECKLIST) {
    if (done.has(item.id)) points += item.weight;
    else remaining.push(item);
  }

  const percent = MAX_POINTS > 0 ? (points / MAX_POINTS) * 100 : 0;
  const residualDailyExposure = limit * (1 - percent / 100);
  const openCritical = remaining.filter((item) => item.critical);

  const areaBreakdown = AREAS.map((area) => {
    const items = CHECKLIST.filter((item) => item.area === area);
    const earned = items.reduce((sum, item) => sum + (done.has(item.id) ? item.weight : 0), 0);
    const available = items.reduce((sum, item) => sum + item.weight, 0);
    return {
      area,
      done: items.filter((item) => done.has(item.id)).length,
      total: items.length,
      percent: available > 0 ? (earned / available) * 100 : 0,
    };
  });

  // Guidance: while the critical controls are open, keep the ceiling low.
  const suggestedLimit =
    openCritical.length > 0 ? Math.min(limit, NEW_USER_FIRST_DAY_CAP_INR * 5) : limit;

  return {
    points,
    maxPoints: MAX_POINTS,
    percent,
    band: bandFor(percent),
    completed: CHECKLIST.length - remaining.length,
    total: CHECKLIST.length,
    remaining,
    openCritical,
    nextStep: openCritical[0] ?? remaining[0] ?? null,
    dailyLimit: limit,
    residualDailyExposure,
    suggestedLimit,
    shouldLowerLimit: suggestedLimit < limit,
    areaBreakdown,
  };
}
