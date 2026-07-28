/**
 * Women's Day message generator — pure logic.
 *
 * International Women's Day is observed annually on 8 March. The United Nations
 * has marked the day since 1975; the first international observance was in 1911.
 * Nothing here depends on the current date — the caller supplies a seed so the
 * same inputs always produce the same messages.
 */

/** Fixed calendar date of International Women's Day (Gregorian, every year). */
export const WOMENS_DAY_DATE = "8 March";
/** Year the United Nations began observing International Women's Day. */
export const UN_OBSERVANCE_SINCE = 1975;

export const TONES = [
  { id: "heartfelt", label: "Heartfelt" },
  { id: "empowering", label: "Empowering" },
  { id: "professional", label: "Professional" },
  { id: "playful", label: "Playful" },
];

export const AUDIENCES = [
  { id: "personal", label: "Family & friends" },
  { id: "workplace", label: "Colleagues & team" },
];

export const LENGTHS = [
  { id: "short", label: "Short", parts: 2 },
  { id: "medium", label: "Medium", parts: 3 },
  { id: "long", label: "Long", parts: 4 },
];

export const HASHTAGS = "#InternationalWomensDay #IWD #WomensDay";

/** Maximum number of messages a single run may return. */
export const MAX_COUNT = 8;
/** Longest recipient name we will echo back into a message. */
export const MAX_NAME_LENGTH = 40;

export const OPENINGS = [
  {
    tone: "heartfelt",
    audience: "personal",
    text: "Happy Women's Day, {name} — the world is warmer and braver because you are in it.",
  },
  {
    tone: "heartfelt",
    audience: "personal",
    text: "Happy Women's Day, {name}. Thank you for every quiet thing you carry that nobody else ever notices.",
  },
  {
    tone: "heartfelt",
    audience: "personal",
    text: "{name}, happy International Women's Day to the person who has been my example of strength for years.",
  },
  {
    tone: "heartfelt",
    audience: "workplace",
    text: "Happy Women's Day, {name} — working alongside you has improved this team in ways the org chart never shows.",
  },
  {
    tone: "heartfelt",
    audience: "workplace",
    text: "Happy International Women's Day, {name}. Thank you for the steadiness you bring to every difficult week.",
  },
  {
    tone: "empowering",
    audience: "personal",
    text: "Happy Women's Day, {name} — keep taking up exactly as much space as you deserve.",
  },
  {
    tone: "empowering",
    audience: "personal",
    text: "{name}, happy International Women's Day. Nothing on your list this year is too big for you.",
  },
  {
    tone: "empowering",
    audience: "workplace",
    text: "Happy Women's Day, {name} — here is to the standards you set and the doors you keep opening.",
  },
  {
    tone: "empowering",
    audience: "workplace",
    text: "Happy International Women's Day, {name}. You have changed what this team believes is possible.",
  },
  {
    tone: "professional",
    audience: "workplace",
    text: "Happy International Women's Day, {name}. Thank you for the work and the leadership you bring to this team.",
  },
  {
    tone: "professional",
    audience: "workplace",
    text: "{name}, wishing you a meaningful International Women's Day on behalf of the whole team.",
  },
  {
    tone: "professional",
    audience: "personal",
    text: "Wishing you a happy International Women's Day, {name}, and a year of well-earned recognition.",
  },
  {
    tone: "professional",
    audience: "personal",
    text: "{name}, happy International Women's Day — and here is to a year in which the work speaks for itself.",
  },
  {
    tone: "playful",
    audience: "personal",
    text: "Happy Women's Day, {name} — officially one day of celebration for someone who runs all 365.",
  },
  {
    tone: "playful",
    audience: "personal",
    text: "{name}, happy Women's Day! The group chat has formally agreed that you are the reason it functions.",
  },
  {
    tone: "playful",
    audience: "workplace",
    text: "Happy Women's Day, {name} — the person who somehow makes Monday meetings survivable.",
  },
  {
    tone: "playful",
    audience: "workplace",
    text: "{name}, happy International Women's Day from everyone who has been rescued by one of your calendar invites.",
  },
];

export const BODIES = [
  {
    tone: "heartfelt",
    audience: "personal",
    text: "You listen when it would be easier not to, you show up when it is inconvenient, and you have never once made anyone feel small for needing you.",
  },
  {
    tone: "heartfelt",
    audience: "personal",
    text: "Most of what I know about patience and courage I learned by watching how you handle the ordinary days, not the big ones.",
  },
  {
    tone: "heartfelt",
    audience: "personal",
    text: "I hope today you get back some of the care you hand out so freely for the rest of the year.",
  },
  {
    tone: "heartfelt",
    audience: "workplace",
    text: "You make room for people to speak, you credit work that would otherwise go unnoticed, and you hold a line on quality without ever making it personal.",
  },
  {
    tone: "heartfelt",
    audience: "workplace",
    text: "The calm you bring to a difficult review or a bad quarter is not a small thing, and a lot of us have quietly learned from it.",
  },
  {
    tone: "empowering",
    audience: "personal",
    text: "Every year you take on something that scares you a little, and every year it turns out you were exactly the right person for it.",
  },
  {
    tone: "empowering",
    audience: "personal",
    text: "Ambition suits you. Ask for the thing, apply for the role, name your number, and let everyone else catch up.",
  },
  {
    tone: "empowering",
    audience: "workplace",
    text: "You have raised the bar on what good work looks like here, and everyone who joined after you has an easier path because of it.",
  },
  {
    tone: "empowering",
    audience: "workplace",
    text: "Mentoring, hiring, hard feedback delivered kindly — the parts of leadership that never reach a performance review are the parts you do best.",
  },
  {
    tone: "professional",
    audience: "workplace",
    text: "International Women's Day falls on 8 March each year, and it is a good moment to say plainly that your contribution to this team is seen and valued.",
  },
  {
    tone: "professional",
    audience: "workplace",
    text: "Thank you for the standard you set on delivery, for the way you develop the people around you, and for the judgement you bring to difficult calls.",
  },
  {
    tone: "professional",
    audience: "personal",
    text: "Marked on 8 March every year, International Women's Day is as good a moment as any to say that your work and your persistence deserve recognition.",
  },
  {
    tone: "professional",
    audience: "personal",
    text: "Recognition tends to arrive late for people who do the least visible work, so treat this as a deliberate and early note of thanks.",
  },
  {
    tone: "playful",
    audience: "personal",
    text: "You are the friend who remembers the birthdays, books the table, finds the missing charger, and still turns up looking better than everyone else.",
  },
  {
    tone: "playful",
    audience: "personal",
    text: "If competence were an Olympic event, you would have been quietly banned for being too far ahead of the field.",
  },
  {
    tone: "playful",
    audience: "workplace",
    text: "You have unblocked more projects with a single message than most people manage in a whole quarter, and you make it look like nothing.",
  },
  {
    tone: "playful",
    audience: "workplace",
    text: "Somewhere in this company there is one spreadsheet holding everything together, and all of us know exactly whose it is.",
  },
];

export const CLOSINGS = [
  { tone: "heartfelt", text: "Happy Women's Day — with a great deal of love." },
  { tone: "heartfelt", text: "Wishing you a day as good as you are." },
  { tone: "heartfelt", text: "Thank you, today and on the other 364 days." },
  { tone: "empowering", text: "Go and get it. Happy Women's Day." },
  { tone: "empowering", text: "Here is to your next year of firsts." },
  { tone: "empowering", text: "Take up the space. Happy International Women's Day." },
  { tone: "professional", text: "With appreciation, and best wishes for the year ahead." },
  { tone: "professional", text: "Thank you again, and happy International Women's Day." },
  { tone: "professional", text: "Wishing you a strong and rewarding year." },
  { tone: "playful", text: "Happy Women's Day — the cake is on us." },
  { tone: "playful", text: "Enjoy the day. You have earned roughly a decade of them." },
  { tone: "playful", text: "Happy Women's Day. Please never stop doing whatever it is you do." },
];

/** Deterministic 32-bit PRNG (Mulberry32) so a seed always reproduces a run. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle driven by the seeded PRNG. Returns a new array. */
function shuffle(list, rand) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/** Word count used to label message length in the UI. */
/** Uppercase the first character. A no-op for scripts without letter case. */
export function capitalizeFirst(text) {
  if (typeof text !== "string" || text.length === 0) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** Trim, collapse whitespace and cap the recipient name. */
export function cleanName(raw) {
  if (typeof raw !== "string") return "";
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

function fallbackName(audience) {
  return audience === "workplace" ? "team" : "friend";
}

/**
 * Build Women's Day messages.
 *
 * @param {object} options
 * @param {string} [options.name]      recipient name, optional
 * @param {string} options.audience    "personal" | "workplace"
 * @param {string} options.tone        one of TONES
 * @param {string} options.length      "short" | "medium" | "long"
 * @param {number} options.count       how many messages to build (1..MAX_COUNT)
 * @param {number} options.seed        integer seed — same seed, same output
 * @param {boolean} [options.hashtags] append the standard hashtags
 * @returns {{messages: string[], requested: number, available: number, truncated: boolean}|{error: string}}
 */
export function generateMessages({
  name = "",
  audience = "personal",
  tone = "heartfelt",
  length = "medium",
  count = 3,
  seed = 1,
  hashtags = false,
} = {}) {
  if (!AUDIENCES.some((a) => a.id === audience)) {
    return { error: "Choose who the message is for." };
  }
  if (!TONES.some((t) => t.id === tone)) {
    return { error: "Choose a tone for the message." };
  }
  const lengthSpec = LENGTHS.find((l) => l.id === length);
  if (!lengthSpec) {
    return { error: "Choose a message length." };
  }

  const wanted = Math.floor(Number(count));
  if (!Number.isFinite(wanted) || wanted < 1) {
    return { error: "Ask for at least one message." };
  }
  if (wanted > MAX_COUNT) {
    return { error: `Ask for ${MAX_COUNT} messages or fewer in one go.` };
  }

  const matches = (part) =>
    part.tone === tone && (!part.audience || part.audience === audience);

  const openings = OPENINGS.filter(matches);
  const bodies = BODIES.filter(matches);
  const closings = CLOSINGS.filter((c) => c.tone === tone);

  if (openings.length === 0 || closings.length === 0) {
    return { error: "No wording available for that tone and audience yet." };
  }
  if (lengthSpec.parts >= 3 && bodies.length === 0) {
    return { error: "No wording available for that tone and audience yet." };
  }

  const safeSeed = Number.isFinite(Number(seed)) ? Math.abs(Math.floor(Number(seed))) : 1;
  const rand = mulberry32(safeSeed + 1);

  const who = cleanName(name) || fallbackName(audience);
  const openPool = shuffle(openings, rand);
  const bodyPool = shuffle(bodies, rand);
  const closePool = shuffle(closings, rand);

  const bodySlots = lengthSpec.parts >= 4 ? 2 : lengthSpec.parts >= 3 ? 1 : 0;
  const O = openPool.length;
  const B = bodySlots >= 1 ? bodyPool.length : 1;
  const C = closePool.length;

  // Distinct opening/body/closing combinations reachable for this length.
  const available = O * B * C;
  const total = Math.min(wanted, available);

  const messages = [];
  // Mixed-radix enumeration: opening varies fastest, then body, then closing,
  // so consecutive messages never share an opening while options remain.
  for (let i = 0; i < total; i += 1) {
    const opening = openPool[i % O];
    const bodyIndex = Math.floor(i / O) % B;
    const closing = closePool[Math.floor(i / (O * B)) % C];

    const pieces = [opening.text];
    if (bodySlots >= 1) pieces.push(bodyPool[bodyIndex].text);
    if (bodySlots >= 2 && bodyPool.length > 1) {
      const secondIndex = (bodyIndex + 1 + Math.floor(i / (O * B * C))) % bodyPool.length;
      const second = bodyPool[secondIndex === bodyIndex ? (bodyIndex + 1) % bodyPool.length : secondIndex];
      pieces.push(second.text);
    }
    pieces.push(closing.text);

    let text = capitalizeFirst(pieces.join(" ").replace(/\{name\}/g, who));
    if (hashtags) text = `${text} ${HASHTAGS}`;
    messages.push(text);
  }

  return {
    messages,
    requested: wanted,
    available,
    truncated: messages.length < wanted,
  };
}
