/**
 * Food-delivery (Swiggy, Zomato, Zepto and similar) data request planner — pure logic.
 *
 * Fixed rules encoded here come from published Indian law and from how these apps
 * actually operate, not from this module:
 *  - Indian food-delivery apps have no self-service export portal. Access requests go
 *    through in-app support and the Grievance Officer whose name and address the
 *    platform must publish.
 *  - IT Rules 2021, Rule 3(2)(a): the Grievance Officer must acknowledge a complaint
 *    within 24 hours and dispose of it within 15 days.
 *  - DPDP Act 2023, Section 11 gives a Data Principal the right to a summary of the
 *    personal data being processed and the identities of anyone it was shared with;
 *    Section 12 covers correction and erasure; Section 13 requires the Data Fiduciary
 *    to provide a grievance-redressal mechanism.
 *  - Account deletion is done in the app, and deletion is not the same as an access
 *    request — ask for the copy first, then delete.
 *
 * Per-row figures are PLANNING ESTIMATES from typical export widths, not a measurement
 * of any specific account.
 */

/** Grievance Officer acknowledgement deadline under IT Rules 2021, Rule 3(2)(a). */
export const GRIEVANCE_ACK_HOURS = 24;

/** Grievance Officer disposal deadline under IT Rules 2021, Rule 3(2)(a). */
export const GRIEVANCE_RESOLVE_DAYS = 15;

/** DPDP Act 2023 sections a written request should cite. */
export const DPDP_ACCESS_SECTION = "Section 11";
export const DPDP_ERASURE_SECTION = "Section 12";

/** Bytes in a megabyte. */
const BYTES_PER_MB = 1024 * 1024;

/** 1 GB expressed in the MB unit used throughout this module. */
const MB_PER_GB = 1024;

/** Months in a year, for turning a monthly order rate into a lifetime count. */
const MONTHS_PER_YEAR = 12;

/**
 * Order-count constant for the diet-inference heuristic. Restaurant and item choices
 * stabilise quickly; used as the decay constant in 1 - e^(-orders/k).
 */
export const DIET_INFERENCE_ORDER_CONSTANT = 25;

/** Saved addresses worth keeping before the rest is just old data (home and work). */
export const ADDRESSES_WORTH_KEEPING = 2;

/** Saved payment methods worth keeping before the rest is just extra exposure. */
export const CARDS_WORTH_KEEPING = 1;

/**
 * Requestable food-delivery data.
 *  baseMb           - one-off size independent of account age
 *  mbPerYear        - extra size per year of use
 *  bytesPerOrder    - scales with lifetime order count
 *  bytesPerAddress  - scales with the number of saved addresses
 *  sensitivity      - 1 (mundane) to 5 (home address, live location, payment trail)
 */
export const EXPORT_CATEGORIES = [
  {
    id: "orders",
    label: "Order history",
    what: "Every order with restaurant, items, quantities, bill, timestamp and the delivery address used.",
    baseMb: 0.4,
    mbPerYear: 0.2,
    bytesPerOrder: 800,
    bytesPerAddress: 0,
    sensitivity: 4,
    note: "Each order freezes a copy of the address you used, so deleting a saved address does not erase it from past orders.",
  },
  {
    id: "addresses",
    label: "Saved addresses",
    what: "Every saved address with coordinates, flat or door number, landmark and free-text delivery instructions.",
    baseMb: 0.05,
    mbPerYear: 0.02,
    bytesPerOrder: 0,
    bytesPerAddress: 400,
    sensitivity: 5,
    note: "Delivery notes are the leak: gate codes, 'key with the neighbour', and which floor you live on.",
  },
  {
    id: "payments",
    label: "Payments and refunds",
    what: "Tokenised cards and UPI handles, transaction history, wallet balance, refunds and coupons applied.",
    baseMb: 0.4,
    mbPerYear: 0.25,
    bytesPerOrder: 150,
    bytesPerAddress: 0,
    sensitivity: 5,
    note: "Card numbers are tokenised, but the UPI handle and the spending trail are still fully identifying.",
  },
  {
    id: "location",
    label: "Device location",
    what: "Location collected while the app was open, and live tracking during an active delivery.",
    baseMb: 0.5,
    mbPerYear: 1.5,
    bytesPerOrder: 60,
    bytesPerAddress: 0,
    sensitivity: 5,
    note: "Ask specifically whether background location was ever collected, and for how long it is retained.",
  },
  {
    id: "profile",
    label: "Profile and preferences",
    what: "Name, phone, email, date of birth, dietary preference, gender and linked accounts.",
    baseMb: 0.1,
    mbPerYear: 0.03,
    bytesPerOrder: 0,
    bytesPerAddress: 0,
    sensitivity: 4,
    note: "A vegetarian or halal preference flag is treated as ordinary data here but can be religiously revealing.",
  },
  {
    id: "support",
    label: "Support and delivery chat",
    what: "Chats with customer support and delivery partners, masked-call metadata and complaint tickets.",
    baseMb: 0.3,
    mbPerYear: 0.3,
    bytesPerOrder: 120,
    bytesPerAddress: 0,
    sensitivity: 4,
    note: "Support agents routinely paste your full address into the transcript.",
  },
  {
    id: "ratings",
    label: "Ratings, reviews and photos",
    what: "Restaurant and rider ratings, written reviews and any photos you uploaded.",
    baseMb: 0.6,
    mbPerYear: 0.9,
    bytesPerOrder: 70,
    bytesPerAddress: 0,
    sensitivity: 3,
    note: "Public reviews tie your real name to a neighbourhood and a routine.",
  },
  {
    id: "device",
    label: "Device and app telemetry",
    what: "Device model, operating system, app version, IP addresses, sessions and crash logs.",
    baseMb: 1.2,
    mbPerYear: 2,
    bytesPerOrder: 0,
    bytesPerAddress: 0,
    sensitivity: 4,
    note: "IP history is a coarse location log covering days you never ordered anything.",
  },
  {
    id: "marketing",
    label: "Marketing and notifications",
    what: "Campaigns sent to you, notifications opened, coupons issued and advertising identifiers.",
    baseMb: 0.4,
    mbPerYear: 0.6,
    bytesPerOrder: 0,
    bytesPerAddress: 0,
    sensitivity: 3,
    note: "Shows which segments you were placed in and what discount the app thinks you need.",
  },
  {
    id: "loyalty",
    label: "Membership and credits",
    what: "Subscription membership history, credits, referrals and loyalty balances.",
    baseMb: 0.1,
    mbPerYear: 0.15,
    bytesPerOrder: 0,
    bytesPerAddress: 0,
    sensitivity: 2,
    note: "Mostly billing history — useful for spotting an auto-renewing plan you forgot about.",
  },
];

/** Ordered checklist shown alongside the estimate. */
export const REQUEST_STEPS = [
  [
    "Find the Grievance Officer, not the chatbot",
    "Every Indian platform publishes a Grievance Officer name and email in its privacy policy or terms page. That address, not in-app chat, is what starts the clock.",
  ],
  [
    "Write from the registered phone number and email",
    "These accounts are keyed to a mobile number. A request from any other address will be closed on identity verification.",
  ],
  [
    "Cite the right provisions",
    `Ask under ${DPDP_ACCESS_SECTION} of the DPDP Act 2023 for a summary of the personal data processed and who it was shared with, and note the Grievance Officer's ${GRIEVANCE_ACK_HOURS}-hour acknowledgement duty under the IT Rules 2021.`,
  ],
  [
    "List the categories explicitly",
    "Name order history, saved addresses with delivery instructions, device location, payment records, support chats and marketing segments. A general request usually returns only an order list.",
  ],
  [
    "Track the 15-day clock",
    `The Grievance Officer must dispose of the complaint within ${GRIEVANCE_RESOLVE_DAYS} days. Diarise the date and follow up in the same email thread so the trail stays intact.`,
  ],
  [
    "Request the copy before deleting anything",
    `Deleting the account is a separate step under ${DPDP_ERASURE_SECTION}. Once the account is gone, so is your ability to pull the history.`,
  ],
  [
    "Trim saved addresses and cards afterwards",
    "Keep the two addresses you actually use, delete the rest, and remove saved payment methods you do not need. Rewrite delivery instructions so they do not contain gate codes.",
  ],
  [
    "Reset app permissions",
    "Set location to 'While Using' rather than 'Always', revoke contacts access, and turn off precise location if the app still delivers to a saved address without it.",
  ],
];

/** Human-readable size from a megabyte figure. */
export function formatSize(mb) {
  if (!Number.isFinite(mb) || mb < 0) return "—";
  if (mb === 0) return "0 MB";
  if (mb < 0.01) return "<0.01 MB";
  if (mb < 1) return `${mb.toFixed(2)} MB`;
  if (mb < MB_PER_GB) return `${Math.round(mb)} MB`;
  const gb = mb / MB_PER_GB;
  return `${gb >= 10 ? Math.round(gb) : gb.toFixed(1)} GB`;
}

/** Band label for a 20-100 sensitivity score. */
export function sensitivityBand(score) {
  if (!Number.isFinite(score)) return "—";
  if (score >= 85) return "Critical";
  if (score >= 70) return "High";
  if (score >= 55) return "Moderate";
  return "Low";
}

/**
 * How confidently diet, routine and household size can be read off an order history.
 * Heuristic: 1 - e^(-orders / DIET_INFERENCE_ORDER_CONSTANT), expressed 0-99. It is a
 * readability aid, not a claim about any platform's actual model.
 */
export function dietInferenceIndex(totalOrders) {
  if (!Number.isFinite(totalOrders) || totalOrders <= 0) return 0;
  return Math.min(99, Math.round((1 - Math.exp(-totalOrders / DIET_INFERENCE_ORDER_CONSTANT)) * 100));
}

/**
 * Estimate a food-delivery data request.
 *
 * Volume model: totalOrders = ordersPerMonth * 12 * years, and every order stores its
 * own snapshot of the delivery address used.
 *
 * Size model per category:
 *   baseMb + mbPerYear * years
 *          + bytesPerOrder * totalOrders / 1 MB
 *          + bytesPerAddress * savedAddresses / 1 MB
 *
 * Sensitivity score = 20 * (0.6 * highest + 0.4 * mean) of the 1-5 ratings, bounded
 * to 20-100 by construction.
 *
 * @returns {{error: string} | object} plain object; never NaN or Infinity.
 */
export function estimateExport({ selectedIds, years, ordersPerMonth, savedAddresses, savedCards }) {
  if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
    return { error: "Select at least one category to estimate a food-delivery data request." };
  }

  const known = EXPORT_CATEGORIES.filter((category) => selectedIds.includes(category.id));
  if (known.length === 0) {
    return { error: "None of the selected items match a food-delivery data category." };
  }

  const useYears = Number(years);
  if (!Number.isFinite(useYears)) {
    return { error: "Enter how many years you have used the app as a number." };
  }
  if (useYears <= 0) {
    return { error: "Years of use must be greater than zero." };
  }
  if (useYears > 18) {
    return { error: "These apps date from around 2008, so more than 18 years of use is not possible." };
  }

  const monthlyOrders = Number(ordersPerMonth);
  if (!Number.isFinite(monthlyOrders)) {
    return { error: "Enter your rough number of orders per month as a number." };
  }
  if (monthlyOrders < 0) {
    return { error: "Orders per month cannot be negative." };
  }
  if (monthlyOrders > 200) {
    return { error: "More than 200 orders a month is outside the range this estimate handles." };
  }

  const addressCount = Number(savedAddresses);
  if (!Number.isFinite(addressCount)) {
    return { error: "Enter how many addresses are saved in the app as a number." };
  }
  if (addressCount < 0) {
    return { error: "Saved addresses cannot be a negative number." };
  }
  if (addressCount > 50) {
    return { error: "More than 50 saved addresses is outside the range this estimate handles." };
  }

  const cardCount = Number(savedCards);
  if (!Number.isFinite(cardCount)) {
    return { error: "Enter how many payment methods are saved as a number." };
  }
  if (cardCount < 0) {
    return { error: "Saved payment methods cannot be a negative number." };
  }
  if (cardCount > 20) {
    return { error: "More than 20 saved payment methods is outside the range this estimate handles." };
  }

  const totalOrders = monthlyOrders * MONTHS_PER_YEAR * useYears;

  const rows = known.map((category) => {
    const sizeMb =
      category.baseMb +
      category.mbPerYear * useYears +
      (category.bytesPerOrder * totalOrders) / BYTES_PER_MB +
      (category.bytesPerAddress * addressCount) / BYTES_PER_MB;
    return { ...category, sizeMb };
  });

  const totalMb = rows.reduce((sum, row) => sum + row.sizeMb, 0);

  const sensitivities = rows.map((row) => row.sensitivity);
  const highest = Math.max(...sensitivities);
  const mean = sensitivities.reduce((sum, value) => sum + value, 0) / sensitivities.length;
  const sensitivityScore = Math.round(20 * (0.6 * highest + 0.4 * mean));

  const sorted = [...rows].sort((a, b) => b.sizeMb - a.sizeMb);

  return {
    rows: sorted,
    count: rows.length,
    totalMb,
    totalLabel: formatSize(totalMb),
    totalOrders: Math.round(totalOrders),
    addressSnapshots: selectedIds.includes("orders") ? Math.round(totalOrders) : 0,
    savedAddresses: addressCount,
    trimmableAddresses: Math.max(0, addressCount - ADDRESSES_WORTH_KEEPING),
    trimmableCards: Math.max(0, cardCount - CARDS_WORTH_KEEPING),
    dietInference: selectedIds.includes("orders") ? dietInferenceIndex(totalOrders) : 0,
    largestLabel: sorted[0].label,
    sensitivityScore,
    band: sensitivityBand(sensitivityScore),
    criticalCategories: rows.filter((row) => row.sensitivity >= 5).map((row) => row.label),
    ackHours: GRIEVANCE_ACK_HOURS,
    resolveDays: GRIEVANCE_RESOLVE_DAYS,
  };
}
