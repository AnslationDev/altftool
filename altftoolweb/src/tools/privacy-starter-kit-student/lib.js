/**
 * Student Privacy Starter Kit — scoring and time-boxed action planning.
 *
 * Scoring model
 * -------------
 * Every control carries a "protection weight" of 1-5 points. The weight is the
 * relative amount of account-takeover / exposure risk the control removes, in the
 * order the same controls are prioritised by widely published baselines:
 *   - Multi-factor authentication and unique passwords sit at the top because
 *     credential stuffing and password reuse are the dominant cause of student
 *     account takeover (CISA "Secure Our World" core four: MFA, strong unique
 *     passwords, update software, recognise phishing).
 *   - Device lock + full-disk encryption is the control that protects data when a
 *     laptop or phone is lost in a hostel, lab or library.
 *   - Everything else (network, portal exposure, social surface, backups) reduces
 *     narrower, lower-frequency exposure and is weighted 3-4.
 *
 * Score = points earned / points available x 100. Bands are fixed cut-offs so the
 * same answers always produce the same band.
 */

/** Upper bound on a single planning session: 8 hours. Beyond this the input is a typo. */
export const MAX_MINUTES = 480;

/** Fixed score bands, highest first. */
export const RISK_BANDS = [
  {
    min: 85,
    label: "Hardened",
    note: "Your campus setup matches a strong personal-security baseline. Re-check once a semester.",
  },
  {
    min: 65,
    label: "Solid",
    note: "The high-impact controls are in place. Close the remaining items to remove the soft spots.",
  },
  {
    min: 40,
    label: "Basic",
    note: "You have partial cover. A lost phone or a reused password would still expose a lot.",
  },
  {
    min: 0,
    label: "Exposed",
    note: "The core controls are missing. Start with multi-factor authentication and device lock today.",
  },
];

/**
 * The kit. `minutes` is a realistic one-off setup time, used for the time-boxed plan.
 * `critical` marks controls that should never be left open.
 */
export const CHECKLIST = [
  {
    id: "acc-mfa",
    area: "Accounts",
    title: "Turn on multi-factor authentication on your personal email and college account",
    action:
      "Use an authenticator app or a passkey rather than SMS codes, and save the backup codes somewhere offline.",
    why: "Your email is the reset path for every other account, so it is the single account worth protecting first.",
    weight: 5,
    minutes: 10,
    critical: true,
  },
  {
    id: "acc-manager",
    area: "Accounts",
    title: "Move to a password manager with one unique password per site",
    action:
      "Import the passwords the browser already stores, then let the manager flag reused and breached ones.",
    why: "One leaked forum password should not unlock your bank, portal and email as well.",
    weight: 5,
    minutes: 25,
    critical: true,
  },
  {
    id: "acc-recovery",
    area: "Accounts",
    title: "Replace your college email as the recovery address on personal accounts",
    action:
      "Point recovery at a personal address and phone number you will still control after graduation.",
    why: "Most institutions deactivate or recycle student mailboxes after you leave, which can lock you out permanently.",
    weight: 4,
    minutes: 15,
    critical: false,
  },
  {
    id: "acc-apps",
    area: "Accounts",
    title: "Review third-party apps connected to your student Google or Microsoft account",
    action:
      "Revoke anything you no longer use, especially note-takers, CGPA apps and one-off hackathon logins.",
    why: "Old OAuth grants keep read access to mail and files long after you stop using the app.",
    weight: 3,
    minutes: 10,
    critical: false,
  },
  {
    id: "dev-lock",
    area: "Devices",
    title: "Set a device passcode, short auto-lock and full-disk encryption",
    action:
      "Use a 6-digit PIN or longer, auto-lock at one minute, and switch on BitLocker, FileVault or the Android/iOS default encryption.",
    why: "An unlocked laptop left in a library carrel gives away everything a password would have protected.",
    weight: 5,
    minutes: 10,
    critical: true,
  },
  {
    id: "dev-shared",
    area: "Devices",
    title: "Never let a lab or shared machine save your password",
    action:
      "Use a private window, decline every save prompt, and sign out of the browser profile and the site before you leave.",
    why: "Saved credentials and a live session on a shared PC are usable by the next person who sits down.",
    weight: 4,
    minutes: 5,
    critical: true,
  },
  {
    id: "dev-sync",
    area: "Devices",
    title: "Turn off browser sync and remove your profile from shared computers",
    action:
      "Sign out of Chrome/Edge sync and delete the local profile so bookmarks, history and passwords do not stay behind.",
    why: "Signing into browser sync on a lab machine copies your whole password vault onto it.",
    weight: 3,
    minutes: 5,
    critical: false,
  },
  {
    id: "net-enterprise",
    area: "Campus network",
    title: "Use the campus WPA2/WPA3-Enterprise SSID, not the open captive-portal one",
    action:
      "Install the network profile your IT department publishes and verify the server certificate name when prompted.",
    why: "Open Wi-Fi and blindly accepted certificates are what make on-campus credential interception possible.",
    weight: 4,
    minutes: 10,
    critical: false,
  },
  {
    id: "net-autojoin",
    area: "Campus network",
    title: "Turn off auto-join for open networks and forget old hotspots",
    action:
      "Remove saved SSIDs like hostel, cafe and airport networks so your phone stops announcing and rejoining them.",
    why: "A device that auto-joins any remembered open SSID can be pulled onto a look-alike network.",
    weight: 3,
    minutes: 5,
    critical: false,
  },
  {
    id: "net-sharing",
    area: "Campus network",
    title: "Disable open file, AirDrop and printer sharing",
    action:
      "Set AirDrop to Contacts Only, mark campus Wi-Fi as a public network, and switch off SMB and network discovery.",
    why: "Shared folders left open on a hostel LAN are one of the easiest things to find on a campus network.",
    weight: 3,
    minutes: 5,
    critical: false,
  },
  {
    id: "por-visibility",
    area: "Student portal",
    title: "Check what your student portal or ERP shows publicly",
    action:
      "Look at your own profile while signed out, then ask the registrar to hide phone number, address, photo and date of birth.",
    why: "Directory-style listings are routinely scraped, and a roll number plus date of birth is a common reset combination.",
    weight: 4,
    minutes: 20,
    critical: false,
  },
  {
    id: "por-rollpin",
    area: "Student portal",
    title: "Stop using your roll or enrolment number as a password or PIN",
    action:
      "Change any portal, library or lab password that is still the default derived from your enrolment number.",
    why: "Enrolment numbers are printed on ID cards and shared in class lists, so they are public, not secret.",
    weight: 3,
    minutes: 5,
    critical: true,
  },
  {
    id: "soc-contact",
    area: "Social",
    title: "Hide phone number and email on your social profiles",
    action:
      "Set contact fields to private, restrict old posts to friends, and turn off automatic tag approval.",
    why: "A public phone number on a student profile is the raw material for SIM-swap and OTP scam calls.",
    weight: 3,
    minutes: 15,
    critical: false,
  },
  {
    id: "soc-location",
    area: "Social",
    title: "Remove hostel block, room number and timetable from public bios and stories",
    action:
      "Keep live location off, post trip and event photos after you leave, and drop room details from bios.",
    why: "A public routine plus a room number tells a stranger exactly where you are not going to be.",
    weight: 3,
    minutes: 10,
    critical: false,
  },
  {
    id: "dat-backup",
    area: "Coursework",
    title: "Back up your thesis and coursework on the 3-2-1 rule",
    action:
      "Keep three copies on two kinds of media with one off-site — for example laptop, external drive and cloud.",
    why: "A stolen laptop in the final semester is a data-loss problem long before it is a privacy problem.",
    weight: 4,
    minutes: 30,
    critical: false,
  },
  {
    id: "dat-export",
    area: "Coursework",
    title: "Export your college mail and drive data before you graduate",
    action:
      "Use the provider's takeout or export tool while the account is still active, then verify the archive opens.",
    why: "Access usually ends within weeks of your final result, and exports cannot be requested afterwards.",
    weight: 4,
    minutes: 40,
    critical: false,
  },
];

/** Total points available across the kit. */
export const MAX_POINTS = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** Total one-off setup minutes if you did every item. */
export const TOTAL_MINUTES = CHECKLIST.reduce((sum, item) => sum + item.minutes, 0);

/** All distinct areas, in checklist order. */
export const AREAS = CHECKLIST.reduce(
  (list, item) => (list.includes(item.area) ? list : [...list, item.area]),
  [],
);

function bandFor(percent) {
  return RISK_BANDS.find((band) => percent >= band.min) ?? RISK_BANDS[RISK_BANDS.length - 1];
}

/**
 * Score a set of completed control ids.
 * @param {string[]} doneIds
 * @returns {{error:string}|{points:number,maxPoints:number,percent:number,band:object,
 *   completed:number,total:number,remaining:object[],openCritical:object[],
 *   minutesRemaining:number,areaBreakdown:object[]}}
 */
export function scoreKit(doneIds) {
  if (!Array.isArray(doneIds)) {
    return { error: "Completed items must be provided as a list." };
  }
  const done = new Set(doneIds.filter((id) => typeof id === "string"));

  let points = 0;
  const remaining = [];
  for (const item of CHECKLIST) {
    if (done.has(item.id)) points += item.weight;
    else remaining.push(item);
  }

  const percent = MAX_POINTS > 0 ? (points / MAX_POINTS) * 100 : 0;
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

  return {
    points,
    maxPoints: MAX_POINTS,
    percent,
    band: bandFor(percent),
    completed: CHECKLIST.length - remaining.length,
    total: CHECKLIST.length,
    remaining,
    openCritical: remaining.filter((item) => item.critical),
    minutesRemaining: remaining.reduce((sum, item) => sum + item.minutes, 0),
    areaBreakdown,
  };
}

/**
 * Score, then greedily pick the open items that fit a time budget.
 * Ordering: open critical items first, then best protection points per minute.
 * @param {{doneIds:string[], minutesAvailable:number}} input
 */
export function planKit({ doneIds, minutesAvailable } = {}) {
  const score = scoreKit(doneIds);
  if (score.error) return score;

  const budget = Number(minutesAvailable);
  if (!Number.isFinite(budget)) {
    return { error: "Enter the number of minutes you can spend as a plain number." };
  }
  if (budget < 0) {
    return { error: "Time available cannot be negative." };
  }
  if (budget > MAX_MINUTES) {
    return { error: `Plan ${MAX_MINUTES} minutes or less at a time — split anything longer across days.` };
  }

  const ordered = [...score.remaining].sort((a, b) => {
    if (a.critical !== b.critical) return a.critical ? -1 : 1;
    const rateA = a.weight / a.minutes;
    const rateB = b.weight / b.minutes;
    if (rateB !== rateA) return rateB - rateA;
    return b.weight - a.weight;
  });

  const plan = [];
  let used = 0;
  let gain = 0;
  for (const item of ordered) {
    if (used + item.minutes > budget) continue;
    plan.push(item);
    used += item.minutes;
    gain += item.weight;
  }

  const projectedPercent =
    MAX_POINTS > 0 ? ((score.points + gain) / MAX_POINTS) * 100 : 0;

  return {
    ...score,
    budgetMinutes: budget,
    plan,
    planMinutes: used,
    planPoints: gain,
    projectedPercent,
    projectedBand: bandFor(projectedPercent),
  };
}
