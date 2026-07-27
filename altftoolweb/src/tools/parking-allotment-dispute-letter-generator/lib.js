/**
 * Housing society parking dispute letter builder (India).
 *
 * Sources for the rules relied on below:
 *  - Nahalchand Laloochand Pvt Ltd v Panchali Co-operative Housing Society Ltd (2010) 9 SCC 536:
 *    stilt and open parking spaces are part of the common areas of the building and a promoter
 *    cannot sell them separately to a flat purchaser.
 *  - Real Estate (Regulation and Development) Act 2016, s.2(n): "common areas" expressly include
 *    open parking areas; s.2(y) defines a "garage" as a covered, enclosed space, which is what a
 *    promoter may sell.
 *  - Model Bye-laws for Co-operative Housing Societies (Maharashtra, 2014), bye-law 78: the
 *    committee allots parking slots, gives first preference to members who own a vehicle, and
 *    settles competing claims by draw of lots; an allotment runs for 11 months at a time and is
 *    renewed, so no member acquires a permanent right to a particular slot.
 *  - Bye-law 79: parking charges are fixed by the general body, not by the committee alone.
 *  - Maharashtra Co-operative Societies Act 1960, s.164: no suit or dispute may be instituted
 *    against a society until two months after written notice has been given to it.
 *  - Maharashtra Co-operative Societies Act 1960, s.91: disputes touching the management or
 *    business of a society, including allotment of common amenities, go to the Co-operative Court.
 */

/** MCS Act 1960 s.164 — statutory notice period before a dispute can be filed. */
export const SOCIETY_NOTICE_MONTHS = 2;

/** Bye-law 78 — a parking allotment runs for 11 months and is then renewed. */
export const ALLOTMENT_TERM_MONTHS = 11;

/** A reasonable period to demand a written reply in; not a statutory figure. */
export const DEFAULT_REPLY_DAYS = 15;

export const DISPUTE_TYPES = [
  {
    value: "not-allotted",
    label: "No slot allotted although I own a vehicle",
    subject: "Non-allotment of a parking slot",
    complaint:
      "Although I am a member in good standing and own a registered vehicle, no parking slot has been allotted to me, while slots continue to be used by members and occupants whose claims are no stronger than mine.",
    grounds: [
      "Bye-law 78 requires the committee to allot parking slots to members, giving first preference to members who own a vehicle.",
      "Where the number of claimants exceeds the slots available, the allotment must be settled by draw of lots and not by the committee's discretion.",
    ],
    reliefs: [
      "Allot me a parking slot, or place my name on a written waiting list with its position stated",
      "Circulate the current allotment list showing every slot, the member it is allotted to and the date of allotment",
      "Place the allotment on the agenda of the next general body meeting",
    ],
  },
  {
    value: "encroachment",
    label: "Someone else is parking in my allotted slot",
    subject: "Encroachment on an allotted parking slot",
    complaint:
      "My allotted parking slot is being occupied by another vehicle, which forces me to park elsewhere in the compound and has led to avoidable friction at the gate.",
    grounds: [
      "An allotment made by the committee under bye-law 78 is binding on every member and occupant until it is changed by the committee.",
      "The society is responsible for the management and security of the common areas, which includes keeping allotted slots free for the members they are allotted to.",
    ],
    reliefs: [
      "Direct the occupant of the vehicle to vacate my slot immediately",
      "Paint or re-mark the slot number and issue parking stickers so slots can be identified at a glance",
      "Instruct the security desk to record every unauthorised parking in the daily register",
    ],
  },
  {
    value: "unfair-allotment",
    label: "Allotment was not made by draw of lots",
    subject: "Irregular allotment of parking slots",
    complaint:
      "Parking slots have been allotted without a draw of lots and without any published list, and members who own no vehicle or who joined later appear to have been preferred over members with a longer standing claim.",
    grounds: [
      "Bye-law 78 requires a draw of lots when the number of claimants exceeds the number of slots, so that no member is preferred by discretion.",
      "An allotment runs for 11 months and is then renewed, so no member holds a permanent right in a particular slot and the list must be revisited each term.",
    ],
    reliefs: [
      "Cancel the present irregular allotment and hold a fresh draw of lots in the presence of the members",
      "Publish the allotment list on the notice board with the date and the method used",
      "Record the draw in the minutes of the committee meeting",
    ],
  },
  {
    value: "builder-sold",
    label: "A slot is claimed as privately bought from the builder",
    subject: "Claim of ownership over a common area parking space",
    complaint:
      "A member is asserting private ownership of a parking space on the footing that it was purchased from the promoter, and is refusing to let the society allot it.",
    grounds: [
      "In Nahalchand Laloochand Pvt Ltd v Panchali CHS Ltd (2010) 9 SCC 536 the Supreme Court held that stilt and open parking spaces are part of the common areas and cannot be sold by a promoter as a separate unit.",
      "Section 2(n) of the Real Estate (Regulation and Development) Act 2016 includes open parking areas in the definition of common areas; only a covered, enclosed garage falls within section 2(y).",
      "Common areas vest in the society on conveyance, so the right to allot them rests with the society and not with any individual member.",
    ],
    reliefs: [
      "Record in writing that the space is a common area vesting in the society",
      "Bring the space back into the common allotment pool for the next allotment term",
      "Take legal advice on recovering the period during which the space was withheld from the pool",
    ],
  },
  {
    value: "charges",
    label: "Parking charges levied without a general body resolution",
    subject: "Parking charges levied without authority",
    complaint:
      "Parking charges have been added to my maintenance bill at a rate that no general body meeting has approved, and no resolution or minute has been shown to me despite a request.",
    grounds: [
      "Bye-law 79 leaves parking charges to be fixed by the general body; the committee cannot introduce or raise them on its own.",
      "A member is entitled to inspect the minutes and the bye-laws of the society and to be told the resolution under which a charge is raised.",
    ],
    reliefs: [
      "Withdraw the charge, or produce the general body resolution that authorises it",
      "Refund or adjust the amounts already recovered from me",
      "Circulate the approved schedule of charges with the next bill",
    ],
  },
  {
    value: "second-vehicle",
    label: "Extra slots given to one member while others have none",
    subject: "Allotment of multiple parking slots to a single member",
    complaint:
      "More than one parking slot has been allotted to a single member for a second and third vehicle, while members who own one vehicle each have been left without any slot at all.",
    grounds: [
      "Bye-law 78 gives first preference to members who own a vehicle, so every one-vehicle member must be accommodated before any member is allotted a second slot.",
      "Because an allotment runs only for 11 months, the surplus slots can be redistributed at the next renewal without disturbing any vested right.",
    ],
    reliefs: [
      "Redistribute the surplus slots at the next allotment so that every one-vehicle member gets one slot first",
      "Publish the number of slots, the number of member vehicles and the current allotment",
      "Fix a higher charge for any second slot, if the general body approves one",
    ],
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

const isIsoDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
const clean = (value) => (typeof value === "string" ? value.trim() : "");
const round1 = (value) => Math.round((value + Number.EPSILON) * 10) / 10;

export function addDays(isoDate, days) {
  if (!isIsoDate(isoDate) || !Number.isFinite(days)) return null;
  const [year, month, day] = isoDate.trim().split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day) + days * DAY_MS);
  if (Number.isNaN(shifted.getTime())) return null;
  return shifted.toISOString().slice(0, 10);
}

/** Add whole calendar months, clamping to the last day of the target month. */
export function addMonths(isoDate, months) {
  if (!isIsoDate(isoDate) || !Number.isInteger(months)) return null;
  const [year, month, day] = isoDate.trim().split("-").map(Number);
  const targetMonthIndex = month - 1 + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalisedMonth = ((targetMonthIndex % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, normalisedMonth + 1, 0)).getUTCDate();
  const safeDay = Math.min(day, lastDay);
  return `${targetYear}-${String(normalisedMonth + 1).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
}

export function formatLongDate(isoDate) {
  if (!isIsoDate(isoDate)) return "";
  const [year, month, day] = isoDate.trim().split("-").map(Number);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  if (!(month >= 1 && month <= 12)) return "";
  return `${String(day).padStart(2, "0")} ${months[month - 1]} ${year}`;
}

/**
 * How far the society's slots go against the vehicles its members own.
 * Returns { error } or { coveragePercent, shortfall, surplus, slotsPerVehicle }.
 */
export function computeSlotShortfall({ totalSlots, memberVehicles }) {
  const slots = Number(totalSlots);
  const vehicles = Number(memberVehicles);
  if (!Number.isFinite(slots) || slots < 0 || slots > 100000) {
    return { error: "Total parking slots must be between 0 and 100,000." };
  }
  if (!Number.isFinite(vehicles) || vehicles < 0 || vehicles > 100000) {
    return { error: "Member vehicles must be between 0 and 100,000." };
  }
  if (vehicles === 0) {
    return { coveragePercent: 100, shortfall: 0, surplus: slots, slotsPerVehicle: null };
  }
  const coverage = (slots / vehicles) * 100;
  return {
    coveragePercent: round1(coverage),
    shortfall: Math.max(0, Math.round(vehicles - slots)),
    surplus: Math.max(0, Math.round(slots - vehicles)),
    slotsPerVehicle: round1(slots / vehicles),
  };
}

/**
 * Build the parking dispute letter.
 * Returns { error } or { letter, subject, grounds, reliefs, replyBy, disputeEligibleFrom, shortfall }.
 */
export function buildParkingDisputeLetter({
  disputeType = "not-allotted",
  societyName = "",
  societyAddress = "",
  memberName = "",
  flatNumber = "",
  wing = "",
  letterDate = "",
  replyDays = DEFAULT_REPLY_DAYS,
  slotNumber = "",
  vehicleNumber = "",
  vehicleType = "car",
  totalSlots = 0,
  memberVehicles = 0,
  earlierRequestDate = "",
  monthlyCharge = 0,
  incidentSummary = "",
  contactPhone = "",
  contactEmail = "",
}) {
  const config = DISPUTE_TYPES.find((item) => item.value === disputeType);
  if (!config) return { error: "Choose the parking problem you are complaining about." };

  const society = clean(societyName);
  const member = clean(memberName);
  const flat = clean(flatNumber);

  if (!society) return { error: "Enter the name of the housing society." };
  if (!member) return { error: "Enter your name as it appears in the society's records." };
  if (!flat) return { error: "Enter your flat number." };
  if (!isIsoDate(letterDate)) return { error: "Pick the date of the letter." };
  if (earlierRequestDate && !isIsoDate(earlierRequestDate)) {
    return { error: "The date of your earlier request must be a real calendar date." };
  }
  if (earlierRequestDate && earlierRequestDate > letterDate) {
    return { error: "The earlier request cannot be dated after this letter." };
  }

  const reply = Number(replyDays);
  if (!Number.isFinite(reply) || reply < 3 || reply > 90) {
    return { error: "Ask for a reply within 3 to 90 days." };
  }

  const charge = Number(monthlyCharge);
  if (!Number.isFinite(charge) || charge < 0) {
    return { error: "The monthly parking charge cannot be negative." };
  }

  const shortfall = computeSlotShortfall({ totalSlots, memberVehicles });
  if (shortfall.error) return { error: shortfall.error };

  const replyBy = addDays(letterDate, Math.round(reply));
  const disputeEligibleFrom = addMonths(letterDate, SOCIETY_NOTICE_MONTHS);
  const allotmentReviewDue = addMonths(letterDate, ALLOTMENT_TERM_MONTHS);

  const flatLabel = clean(wing) ? `Flat No. ${flat}, ${clean(wing)}` : `Flat No. ${flat}`;

  const facts = [
    clean(vehicleNumber)
      ? `I own a ${clean(vehicleType) || "vehicle"} bearing registration number ${clean(vehicleNumber)}, registered in my name.`
      : "",
    clean(slotNumber) ? `The slot in question is Slot No. ${clean(slotNumber)}.` : "",
    earlierRequestDate
      ? `I first raised this with the committee on ${formatLongDate(earlierRequestDate)} and have had no written reply since.`
      : "",
    Number(totalSlots) > 0 && Number(memberVehicles) > 0
      ? `The society has ${Math.round(Number(totalSlots))} slots against ${Math.round(Number(memberVehicles))} member vehicles, so the slots cover ${shortfall.coveragePercent}% of the demand${shortfall.shortfall > 0 ? ` and ${shortfall.shortfall} vehicle(s) must be left out` : ""}.`
      : "",
    charge > 0
      ? `A parking charge of Rs ${Math.round(charge).toLocaleString("en-IN")} a month is being recovered from me.`
      : "",
    clean(incidentSummary),
  ].filter(Boolean);

  const groundsBlock = config.grounds.map((item, index) => `${index + 1}. ${item}`).join("\n");
  const reliefBlock = config.reliefs.map((item, index) => `${index + 1}. ${item}`).join("\n");

  const letter = [
    formatLongDate(letterDate),
    "",
    "To,",
    "The Secretary / Hon. Chairman and the Managing Committee,",
    society,
    clean(societyAddress),
    "",
    `Subject: ${config.subject} — ${flatLabel}`,
    "",
    "Respected Sir / Madam,",
    "",
    `I am the member holding ${flatLabel}. ${config.complaint}`,
    facts.length > 0 ? `\nThe facts are these:\n${facts.map((fact, index) => `${index + 1}. ${fact}`).join("\n")}` : "",
    "",
    "The position under the bye-laws and the law is as follows:",
    groundsBlock,
    "",
    "I therefore request the committee to:",
    reliefBlock,
    "",
    `I request a written reply by ${formatLongDate(replyBy)}. If the matter is not resolved I will be constrained to take it up with the Deputy Registrar of Co-operative Societies, and to give the society the statutory notice that must precede a dispute before the Co-operative Court.`,
    "",
    "I would much rather this were settled within the society, and I am willing to meet the committee at its convenience.",
    "",
    "Yours faithfully,",
    "(signature)",
    member,
    flatLabel,
    clean(contactPhone) ? `Phone: ${clean(contactPhone)}` : "",
    clean(contactEmail) ? `Email: ${clean(contactEmail)}` : "",
  ]
    .filter((line) => line !== undefined && line !== null)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const escalation = [
    { step: "Written complaint to the managing committee", date: letterDate },
    { step: "Written reply requested by", date: replyBy },
    { step: "Statutory notice under s.164 ripens", date: disputeEligibleFrom },
    { step: "Next allotment term to be reviewed by", date: allotmentReviewDue },
  ];

  return {
    letter,
    subject: `${config.subject} — ${flatLabel}`,
    grounds: config.grounds,
    reliefs: config.reliefs,
    replyBy,
    disputeEligibleFrom,
    allotmentReviewDue,
    escalation,
    shortfall,
    wordCount: letter.split(/\s+/).filter(Boolean).length,
  };
}
