/**
 * Decluttering prompt builder.
 *
 * Pure logic only: it (a) assembles a structured keep-or-let-go prompt from the
 * decision rule the user picks, and (b) sizes the sorting work into sessions.
 *
 * The decision rules encoded below are published, widely used decluttering
 * frameworks, quoted here as rules rather than invented advice:
 *  - Four-box method: every item goes into exactly one of Keep / Donate-or-sell /
 *    Relocate / Bin, a long-standing professional-organiser sorting drill.
 *  - 20/20 rule (Joshua Fields Millburn & Ryan Nicodemus, "The Minimalists"):
 *    let go of anything you could replace for less than $20 in less than 20
 *    minutes from where you normally are.
 *  - 90/90 rule (also The Minimalists): if you have not used it in the last 90
 *    days and will not use it in the next 90 days, it goes.
 *  - One-year rule: seasonal items unused through a full 12-month cycle go.
 *  - KonMari (Marie Kondo, "The Life-Changing Magic of Tidying Up"): sort by
 *    category, never by room, in the fixed order clothes -> books -> papers ->
 *    komono (miscellany) -> sentimental, keeping only what "sparks joy".
 */

/** The four destinations of the four-box sorting drill. */
export const FOUR_BOXES = ["Keep", "Donate or sell", "Relocate", "Bin or recycle"];

/** Marie Kondo's fixed category order — sentimental items are always sorted last. */
export const KONMARI_ORDER = [
  "Clothes",
  "Books",
  "Papers",
  "Komono (kitchen, bathroom, garage, miscellany)",
  "Sentimental items",
];

/** 20/20 rule thresholds, in US dollars and minutes. */
export const RULE_20_20 = { dollars: 20, minutes: 20 };

/** 90/90 rule window, in days, applied backwards and forwards. */
export const RULE_90_90_DAYS = 90;

/** One-year rule window, in months — a full seasonal cycle. */
export const RULE_ONE_YEAR_MONTHS = 12;

export const DECISION_METHODS = [
  {
    id: "four-box",
    label: "Four-box method",
    short: "Keep / Donate or sell / Relocate / Bin",
    rule: `Sort every single item into exactly one of four boxes: ${FOUR_BOXES.join(", ")}. Nothing may be left unsorted and nothing may go into two boxes.`,
  },
  {
    id: "20-20",
    label: "20/20 rule",
    short: "Replaceable for under $20 in under 20 minutes",
    rule: `Apply the 20/20 rule: if the item could be replaced for less than $${RULE_20_20.dollars} in less than ${RULE_20_20.minutes} minutes from where I normally am, it is a "just-in-case" item and should go.`,
  },
  {
    id: "90-90",
    label: "90/90 rule",
    short: "Unused for 90 days and unneeded for 90 more",
    rule: `Apply the 90/90 rule: if I have not used the item in the last ${RULE_90_90_DAYS} days and cannot name a concrete use in the next ${RULE_90_90_DAYS} days, it goes.`,
  },
  {
    id: "one-year",
    label: "One-year rule",
    short: "Unused through a full seasonal cycle",
    rule: `Apply the one-year rule: anything untouched for ${RULE_ONE_YEAR_MONTHS} months has survived every season without being needed, so it goes unless it is legally required paperwork or genuine heirloom.`,
  },
  {
    id: "konmari",
    label: "KonMari (category order)",
    short: "Clothes, books, papers, komono, sentimental",
    rule: `Follow the KonMari category order — ${KONMARI_ORDER.join(" -> ")} — gathering every item in the category into one pile first, holding each one, and keeping only what I actively want in my life. Sentimental items are always decided last.`,
  },
];

export const ROOM_PRESETS = [
  {
    id: "wardrobe",
    label: "Wardrobe and clothes",
    // Starting estimates only — the user is expected to overwrite the count
    // after a quick look at the actual space.
    items: 180,
    zones: ["Hanging rail", "Drawers", "Shoes", "Bags and accessories", "Laundry pile"],
  },
  {
    id: "kitchen",
    label: "Kitchen",
    items: 200,
    zones: ["Countertops", "Upper cupboards", "Lower cupboards", "Drawers", "Fridge and freezer", "Pantry"],
  },
  {
    id: "bathroom",
    label: "Bathroom",
    items: 70,
    zones: ["Cabinet", "Shower shelf", "Under the sink", "Medicine box"],
  },
  {
    id: "home-office",
    label: "Home office and paperwork",
    items: 150,
    zones: ["Desk surface", "Drawers", "Filing", "Cables and tech", "Stationery"],
  },
  {
    id: "living-room",
    label: "Living room",
    items: 90,
    zones: ["Surfaces", "Media and books", "Storage furniture", "Decor", "Toys"],
  },
  {
    id: "bedroom",
    label: "Bedroom",
    items: 100,
    zones: ["Bedside tables", "Under the bed", "Dresser", "Surfaces"],
  },
  {
    id: "garage",
    label: "Garage, loft or store room",
    items: 250,
    zones: ["Shelving", "Tools", "Sports and outdoor", "Boxes never unpacked", "Seasonal"],
  },
  {
    id: "kids-room",
    label: "Kids' room",
    items: 160,
    zones: ["Toys", "Books", "Clothes", "Art and school work"],
  },
];

export const TONES = [
  { id: "gentle", label: "Gentle and encouraging" },
  { id: "neutral", label: "Neutral and practical" },
  { id: "blunt", label: "Blunt and fast" },
];

const TONE_LINES = {
  gentle: "Keep the wording kind and low-pressure. Never shame me for owning something.",
  neutral: "Keep the wording plain and practical. No pep talk, no judgement.",
  blunt: "Be direct and fast. One short question per item, no softening, no preamble.",
};

/** Seconds to decide a single item. Default is a deliberately conservative
 *  pace for rapid keep-or-go sorting; the user can change it. */
export const DEFAULT_SECONDS_PER_ITEM = 30;

/** Default working block, in minutes. */
export const DEFAULT_SESSION_MINUTES = 25;

const SECONDS_PER_MINUTE = 60;

/**
 * Size the sorting job into sessions.
 * @returns {{totalMinutes:number,sessions:number,itemsPerSession:number,minutesPerZone:number}|{error:string}}
 */
export function planSessions({ itemCount, secondsPerItem, sessionMinutes, zoneCount = 1 }) {
  const items = Number(itemCount);
  const perItem = Number(secondsPerItem);
  const block = Number(sessionMinutes);
  const zones = Math.max(1, Math.floor(Number(zoneCount) || 1));

  if (!Number.isFinite(items) || items <= 0) {
    return { error: "Enter how many items you expect to review — it must be more than zero." };
  }
  if (!Number.isFinite(perItem) || perItem <= 0) {
    return { error: "Seconds per decision must be greater than zero." };
  }
  if (!Number.isFinite(block) || block <= 0) {
    return { error: "Session length must be greater than zero minutes." };
  }

  const totalMinutes = Math.ceil((items * perItem) / SECONDS_PER_MINUTE);
  const sessions = Math.max(1, Math.ceil(totalMinutes / block));
  const itemsPerSession = Math.ceil(items / sessions);
  const minutesPerZone = Math.ceil(totalMinutes / zones);

  return { totalMinutes, sessions, itemsPerSession, minutesPerZone, zones, items };
}

/**
 * Build the finished decluttering prompt plus the session plan.
 *
 * @param {object} input
 * @param {string} input.roomLabel      Space being decluttered.
 * @param {string} input.methodId       One of DECISION_METHODS[].id.
 * @param {string[]} input.zones        Zones inside the space, in working order.
 * @param {number} input.itemCount      Items expected to be reviewed.
 * @param {number} input.secondsPerItem Seconds allowed per keep-or-go decision.
 * @param {number} input.sessionMinutes Length of one working block.
 * @param {string} input.toneId         One of TONES[].id.
 * @param {string} input.constraints    Free-text limits (pets, shared space, resale, etc.).
 * @param {boolean} input.includeDisposal Ask for a disposal route per discard pile.
 */
export function buildDeclutterPrompt({
  roomLabel,
  methodId,
  zones = [],
  itemCount,
  secondsPerItem = DEFAULT_SECONDS_PER_ITEM,
  sessionMinutes = DEFAULT_SESSION_MINUTES,
  toneId = "neutral",
  constraints = "",
  includeDisposal = true,
}) {
  const room = String(roomLabel || "").trim();
  if (!room) return { error: "Name the room or space you are decluttering." };

  const method = DECISION_METHODS.find((entry) => entry.id === methodId) ?? DECISION_METHODS[0];
  const cleanZones = zones.map((zone) => String(zone).trim()).filter(Boolean);

  const plan = planSessions({
    itemCount,
    secondsPerItem,
    sessionMinutes,
    zoneCount: cleanZones.length || 1,
  });
  if (plan.error) return { error: plan.error };

  const tone = TONE_LINES[toneId] ?? TONE_LINES.neutral;
  const zoneList = cleanZones.length
    ? cleanZones.map((zone, index) => `${index + 1}. ${zone}`).join("\n")
    : "1. Whole space, left to right";

  const lines = [
    `You are helping me declutter my ${room}. Act as a calm, practical professional organiser.`,
    "",
    "DECISION RULE",
    method.rule,
    "",
    "WORK ORDER (one zone at a time, finish a zone before moving on)",
    zoneList,
    "",
    "SESSION PLAN I AM WORKING TO",
    `- About ${plan.items} items to review, ${secondsPerItem} seconds per decision.`,
    `- ${plan.sessions} session${plan.sessions === 1 ? "" : "s"} of ${sessionMinutes} minutes, roughly ${plan.itemsPerSession} items per session.`,
    `- Total hands-on time: about ${plan.totalMinutes} minutes.`,
    "",
    "WHAT I WANT FROM YOU",
    "1. For each zone, give me a short numbered list of keep-or-let-go questions I can ask myself item by item. One question per line, answerable in under ten seconds.",
    "2. Flag the items in that zone that people most often keep by default and should actually challenge.",
    "3. Give me a stopping rule so I know when the zone is done.",
  ];

  if (includeDisposal) {
    lines.push(
      "4. For each discard pile, suggest a realistic disposal route (donate, sell, recycle, hazardous waste, return to owner) and what to do first so the bags actually leave the house.",
    );
  }

  lines.push(
    "",
    "CONSTRAINTS",
    constraints.trim() ? constraints.trim() : "No special constraints.",
    "",
    "STYLE",
    tone,
    "Do not suggest buying storage containers before the sorting is finished.",
    "Ask me one clarifying question only if the room description is genuinely ambiguous; otherwise start straight away.",
  );

  return {
    prompt: lines.join("\n"),
    plan,
    method,
    zones: cleanZones,
    characters: lines.join("\n").length,
  };
}
