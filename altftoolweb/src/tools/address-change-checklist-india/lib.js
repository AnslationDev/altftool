/**
 * Post-relocation address-change checklist for India.
 *
 * Three of the entries carry a hard statutory deadline counted from the date
 * the address actually changes, and those are dated by this module:
 *
 *   - Vehicle registration certificate: Section 49 of the Motor Vehicles Act,
 *     1988 requires the owner to intimate a change of address to the
 *     registering authority within 30 days, using Form 33 under Rule 54 of the
 *     Central Motor Vehicles Rules, 1989.
 *   - GST registration: Rule 19(1) of the CGST Rules, 2017 requires an
 *     amendment application in Form GST REG-14 within 15 days of the change.
 *   - Company registered office: Section 12(4) of the Companies Act, 2013
 *     requires notice to the Registrar in e-Form INC-22 within 30 days.
 *
 * Everything else is ordered by practical priority: Aadhaar first, because
 * most other address updates accept it as proof of address, then the records
 * that block money movement (bank and CKYC), then utilities, then everyday
 * accounts.
 *
 * This is an informational checklist, not legal or tax advice. Procedures,
 * fees and forms change; confirm the current requirement with the department
 * or a professional before relying on it.
 */

export const MS_PER_DAY = 86400000;

/** Profile switches that add or remove items. */
export const PROFILE_KEYS = [
  "ownsVehicle",
  "isTenant",
  "hasKids",
  "investsInMarkets",
  "runsBusiness",
  "hasCompany",
  "ownsNewHome",
];

export const PROFILE_LABELS = {
  ownsVehicle: "I own a registered vehicle",
  isTenant: "I am renting the new place",
  hasKids: "We have school-going children",
  investsInMarkets: "I hold demat, mutual funds or NPS",
  runsBusiness: "I have a GST registration",
  hasCompany: "The registered office of a company moved too",
  ownsNewHome: "I bought the new home",
};

/**
 * Checklist items.
 *  priority: "statutory" | "high" | "medium" | "low"
 *  deadlineDays: days from the change of address, where the law sets one
 *  when / unless: PROFILE_KEYS that switch the item on or off
 */
export const GROUPS = [
  {
    id: "identity",
    title: "Identity and statutory records",
    note: "Do Aadhaar first — most other updates accept it as proof of address.",
    items: [
      {
        id: "aadhaar",
        title: "Aadhaar",
        how: "Update address on myAadhaar (myaadhaar.uidai.gov.in) with a valid proof-of-address document, or at an enrolment centre.",
        priority: "high",
        detail:
          "UIDAI charges a fee for a demographic update at an enrolment centre; the online document update is periodically made free, so check the current UIDAI notice before paying.",
      },
      {
        id: "voter",
        title: "Electoral roll (Voter ID)",
        how: "File Form 8 — shifting of residence — on voters.eci.gov.in or the Voter Helpline app.",
        priority: "high",
        detail:
          "Form 8 now covers shifting of residence both within and outside a constituency; the old Form 8A is no longer used.",
      },
      {
        id: "rc",
        title: "Vehicle registration certificate (RC)",
        how: "Intimate the registering authority in Form 33 through parivahan.gov.in, with proof of the new address.",
        priority: "statutory",
        deadlineDays: 30,
        when: "ownsVehicle",
        detail:
          "Section 49 of the Motor Vehicles Act, 1988: intimation within 30 days of the change of address. A stale RC address also complicates insurance claims and challan notices.",
      },
      {
        id: "dl",
        title: "Driving licence",
        how: "Apply for change of address in the DL through the Sarathi service on parivahan.gov.in.",
        priority: "high",
        when: "ownsVehicle",
      },
      {
        id: "passport",
        title: "Passport",
        how: "Apply for re-issue with a change in personal particulars on passportindia.gov.in; fresh police verification happens at the new address.",
        priority: "medium",
        detail: "Only the address on the last page changes; the passport number stays the same.",
      },
      {
        id: "pan",
        title: "PAN and the income tax portal",
        how: "Update PAN data through NSDL or UTIITSL, and change the address in your profile on incometax.gov.in.",
        priority: "high",
        detail:
          "The address is not printed on a PAN card, but the department uses it for notices and refunds, and Aadhaar-based e-KYC can carry the new address across.",
      },
      {
        id: "ration",
        title: "Ration card",
        how: "Apply to the state food and civil supplies department for a change of address or a new card in the new state.",
        priority: "medium",
        detail:
          "One Nation One Ration Card lets you draw rations anywhere while the update is pending, but the card address still has to be corrected.",
      },
      {
        id: "police",
        title: "Tenant police verification",
        how: "Get the landlord to file tenant verification with the local police station, online where the state police offer it.",
        priority: "high",
        when: "isTenant",
      },
      {
        id: "rentReg",
        title: "Register the rent agreement",
        how: "Register the leave-and-licence or lease deed at the sub-registrar's office.",
        priority: "high",
        when: "isTenant",
        detail:
          "Under the Registration Act, 1908, leases from year to year or exceeding one year must be registered; an unregistered long lease is weak evidence in a dispute.",
      },
    ],
  },
  {
    id: "money",
    title: "Banking, investments and insurance",
    note: "A stale KYC address delays payouts, cheque books and card deliveries.",
    items: [
      {
        id: "bank",
        title: "Every bank account",
        how: "Submit a KYC address change in branch or in the app for each bank you hold an account with.",
        priority: "high",
        detail: "This also refreshes the CKYC record most other regulated entities read from.",
      },
      {
        id: "cards",
        title: "Credit cards and loans",
        how: "Update the billing and communication address with each card issuer and lender.",
        priority: "high",
      },
      {
        id: "kra",
        title: "Mutual fund KYC (KRA)",
        how: "File a KYC change of address with a SEBI-registered KRA such as CAMS, KFintech or CVL KRA.",
        priority: "medium",
        when: "investsInMarkets",
        detail: "One KRA update propagates to every fund house you invest with.",
      },
      {
        id: "demat",
        title: "Demat account",
        how: "Give the depository participant a modification form to update the address held with CDSL or NSDL.",
        priority: "medium",
        when: "investsInMarkets",
      },
      {
        id: "nps",
        title: "NPS subscriber record",
        how: "Submit Form S2 to your point of presence, or update through the CRA portal.",
        priority: "low",
        when: "investsInMarkets",
      },
      {
        id: "insurance",
        title: "Life and health insurance policies",
        how: "Update the address with each insurer and with the health TPA.",
        priority: "high",
        detail: "Health cover network hospitals and cashless tie-ups differ by city — check the network at the new address.",
      },
      {
        id: "motorInsurance",
        title: "Motor insurance",
        how: "Tell the motor insurer the vehicle's new garaging address.",
        priority: "high",
        when: "ownsVehicle",
        detail:
          "Premium zones and own-damage rates vary by city, and an undisclosed change of location can be raised at claim time.",
      },
    ],
  },
  {
    id: "utilities",
    title: "Home, utilities and civic records",
    items: [
      {
        id: "electricity",
        title: "Electricity connection",
        how: "Apply for a name transfer or a new connection with the discom, and close the old account after a final meter reading.",
        priority: "high",
      },
      {
        id: "water",
        title: "Water and sewerage",
        how: "Transfer or apply afresh with the municipal water board.",
        priority: "medium",
      },
      {
        id: "lpg",
        title: "LPG connection",
        how: "Transfer through the distributor or the oil company app; collect a termination voucher if you move out of the distributor's area.",
        priority: "high",
        detail: "The subsidy follows the connection, so do not leave the transfer half-finished.",
      },
      {
        id: "pipedGas",
        title: "Piped natural gas",
        how: "Ask the city gas distributor for a transfer or disconnection and a final reading.",
        priority: "medium",
      },
      {
        id: "broadband",
        title: "Broadband, DTH and mobile billing",
        how: "Book a shift with the ISP, and update the billing address on postpaid and DTH accounts.",
        priority: "high",
      },
      {
        id: "propertyTax",
        title: "Property tax and mutation",
        how: "Apply for mutation of the property in the municipal records so tax bills issue in your name.",
        priority: "high",
        when: "ownsNewHome",
      },
      {
        id: "society",
        title: "Society or RWA records",
        how: "Register with the housing society, get the maintenance account, parking sticker and gate app updated.",
        priority: "medium",
      },
      {
        id: "post",
        title: "Mail redirection",
        how: "Book India Post's redirection of mail service at the old post office so anything still in transit follows you.",
        priority: "medium",
      },
    ],
  },
  {
    id: "workLife",
    title: "Work, health and education",
    items: [
      {
        id: "employer",
        title: "Employer HR records",
        how: "Update the address in the HR system so Form 16, insurance cards and couriered documents reach you.",
        priority: "high",
      },
      {
        id: "gst",
        title: "GST registration",
        how: "File an amendment of core fields in Form GST REG-14 on the GST portal, with proof of the new principal place of business.",
        priority: "statutory",
        deadlineDays: 15,
        when: "runsBusiness",
        detail: "Rule 19(1) of the CGST Rules, 2017: apply within 15 days of the change.",
      },
      {
        id: "inc22",
        title: "Company registered office",
        how: "File e-Form INC-22 with the Registrar of Companies; a shift outside the city or state needs a board or shareholder resolution first.",
        priority: "statutory",
        deadlineDays: 30,
        when: "hasCompany",
        detail: "Section 12(4) of the Companies Act, 2013: notice within 30 days of the change.",
      },
      {
        id: "professional",
        title: "Professional body membership",
        how: "Update the address on the register of your council or institute (ICAI, Bar Council, NMC, CoA and similar).",
        priority: "low",
      },
      {
        id: "school",
        title: "School and college records",
        how: "Give the new address to the school, get the transfer certificate from the old one, and update the transport route.",
        priority: "high",
        when: "hasKids",
      },
      {
        id: "medical",
        title: "Doctor, dentist and prescriptions",
        how: "Register with a local clinic, transfer repeat prescriptions and vaccination records.",
        priority: "medium",
      },
    ],
  },
  {
    id: "everyday",
    title: "Everyday accounts",
    note: "Cheap to do, annoying to forget.",
    items: [
      {
        id: "shopping",
        title: "Shopping and delivery apps",
        how: "Replace the saved default address on every marketplace, grocery, food and pharmacy app.",
        priority: "medium",
      },
      {
        id: "subscriptions",
        title: "Physical subscriptions",
        how: "Update newspaper, magazine and subscription-box deliveries.",
        priority: "low",
      },
      {
        id: "memberships",
        title: "Gym, library and club memberships",
        how: "Transfer or cancel, and reclaim any deposit.",
        priority: "low",
      },
      {
        id: "contacts",
        title: "People",
        how: "Tell family, close friends and anyone who couriers you things.",
        priority: "low",
      },
    ],
  },
];

export const PRIORITY_ORDER = { statutory: 0, high: 1, medium: 2, low: 3 };

export const PRIORITY_LABELS = {
  statutory: "Statutory deadline",
  high: "Do first",
  medium: "Soon",
  low: "When you can",
};

/** Parse YYYY-MM-DD to a UTC midnight timestamp, or NaN. */
export function parseIsoDate(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return NaN;
  }
  return ms;
}

/** Format a UTC timestamp as YYYY-MM-DD. */
export function toIsoDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Widest window this planner will date, in days. */
export const MAX_WINDOW_DAYS = 730;

/**
 * Build the checklist for a profile, dating the statutory deadlines.
 *
 * @param {object} input
 * @param {string} input.moveDate  Date the address actually changed, YYYY-MM-DD.
 * @param {string} input.today     Reference date, YYYY-MM-DD.
 * @param {object} input.profile   Booleans keyed by PROFILE_KEYS.
 * @param {string[]} input.done    Ticked item keys, "<groupId>:<itemId>".
 * @returns {object} groups, counts and deadlines, or { error }.
 */
export function buildAddressChecklist({ moveDate, today, profile = {}, done = [] } = {}) {
  const moveMs = parseIsoDate(moveDate);
  if (Number.isNaN(moveMs)) return { error: "Enter the date you moved as a real calendar date." };

  const todayMs = parseIsoDate(today);
  if (Number.isNaN(todayMs)) return { error: "Enter today's date as a real calendar date." };

  const daysSinceMove = Math.round((todayMs - moveMs) / MS_PER_DAY);
  if (daysSinceMove > MAX_WINDOW_DAYS) {
    return { error: "That move was more than two years ago — the statutory windows have long closed." };
  }
  if (daysSinceMove < -MAX_WINDOW_DAYS) {
    return { error: "That moving date is more than two years away." };
  }

  const doneSet = new Set(Array.isArray(done) ? done.filter((id) => typeof id === "string") : []);

  const groups = GROUPS.map((group) => {
    const items = group.items
      .filter((item) => {
        if (item.when && !profile[item.when]) return false;
        if (item.unless && profile[item.unless]) return false;
        return true;
      })
      .map((item) => {
        const key = `${group.id}:${item.id}`;
        const base = {
          ...item,
          key,
          groupId: group.id,
          groupTitle: group.title,
          done: doneSet.has(key),
        };
        if (!item.deadlineDays) return base;
        const dueMs = moveMs + item.deadlineDays * MS_PER_DAY;
        const daysLeft = Math.round((dueMs - todayMs) / MS_PER_DAY);
        return {
          ...base,
          dueDate: toIsoDate(dueMs),
          daysLeft,
          late: daysLeft < 0 && !base.done,
        };
      })
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

    return {
      id: group.id,
      title: group.title,
      note: group.note ?? "",
      items,
      doneCount: items.filter((item) => item.done).length,
    };
  }).filter((group) => group.items.length > 0);

  const allItems = groups.flatMap((group) => group.items);
  const totalItems = allItems.length;
  const doneCount = allItems.filter((item) => item.done).length;
  const deadlines = allItems
    .filter((item) => typeof item.daysLeft === "number")
    .sort((a, b) => a.daysLeft - b.daysLeft);
  const lateCount = deadlines.filter((item) => item.late).length;
  const openHigh = allItems.filter((item) => !item.done && item.priority === "high").length;

  return {
    groups,
    deadlines,
    totalItems,
    doneCount,
    // totalItems can never be zero: the unconditional items always survive the filter.
    percentDone: Math.round((doneCount / totalItems) * 100),
    lateCount,
    openHigh,
    daysSinceMove,
    moveDate: toIsoDate(moveMs),
  };
}
