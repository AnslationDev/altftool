/**
 * Republic Day message generator — pure logic, no React and no DOM.
 *
 * Historical anchors used below (all fixed, verifiable facts):
 *  - The Constituent Assembly adopted the Constitution of India on 26 November 1949.
 *  - The Constitution came into force on 26 January 1950, making India a republic.
 *  - 26 January was chosen to honour the Purna Swaraj (complete independence)
 *    declaration made on 26 January 1930.
 *  - The Drafting Committee was chaired by Dr B. R. Ambedkar.
 * The Republic Day *number* is derived from those dates, never from the system clock.
 */

/** Calendar date of Republic Day, every year. */
export const REPUBLIC_DAY_DATE = "26 January";
/** Year the Constitution came into force — the first Republic Day. */
export const FIRST_REPUBLIC_DAY_YEAR = 1950;
/** Date the Constituent Assembly adopted the Constitution. */
export const CONSTITUTION_ADOPTED = "26 November 1949";
/** Year of the Purna Swaraj declaration that fixed the 26 January date. */
export const PURNA_SWARAJ_YEAR = 1930;

export const FORMATS = [
  { id: "greeting", label: "Greeting message" },
  { id: "caption", label: "Social caption" },
  { id: "speech", label: "Speech opener" },
];

export const TONES = [
  { id: "patriotic", label: "Patriotic" },
  { id: "formal", label: "Formal" },
  { id: "warm", label: "Warm & simple" },
];

export const HASHTAGS = "#RepublicDay #26January #JaiHind";

/** Maximum messages returned in one run. */
export const MAX_COUNT = 8;
export const MAX_NAME_LENGTH = 40;
/** Sensible bounds for the year input. */
export const MIN_YEAR = FIRST_REPUBLIC_DAY_YEAR;
export const MAX_YEAR = 2200;

/**
 * Which Republic Day a given year marks.
 * 1950 was the 1st Republic Day, so ordinal = year - 1949.
 */
export function republicDayOrdinal(year) {
  const y = Math.floor(Number(year));
  if (!Number.isFinite(y)) return { error: "Enter a four-digit year." };
  if (y < MIN_YEAR) {
    return { error: `India became a republic in ${FIRST_REPUBLIC_DAY_YEAR}, so pick ${MIN_YEAR} or later.` };
  }
  if (y > MAX_YEAR) return { error: `Pick a year up to ${MAX_YEAR}.` };
  const ordinal = y - (FIRST_REPUBLIC_DAY_YEAR - 1);
  return { year: y, ordinal, label: `${ordinal}${ordinalSuffix(ordinal)}` };
}

/** English ordinal suffix: 1st, 2nd, 3rd, 11th, 21st ... */
export function ordinalSuffix(n) {
  const value = Math.abs(Math.floor(Number(n)));
  if (!Number.isFinite(value)) return "th";
  const lastTwo = value % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return "th";
  switch (value % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/**
 * Slot pools per format. Each format is an ordered list of pools; one line is
 * taken from each pool and the lines are joined with a space.
 */
export const FORMAT_SLOTS = {
  greeting: [
    [
      { tone: "patriotic", text: "Happy {ordinal} Republic Day, {name} — 26 January, the day India's Constitution came to life." },
      { tone: "patriotic", text: "{name}, a very happy {ordinal} Republic Day to you and everyone at home." },
      { tone: "formal", text: "Wishing you and your family a very happy {ordinal} Republic Day, {name}." },
      { tone: "formal", text: "Warm greetings to you, {name}, on the {ordinal} Republic Day of India." },
      { tone: "warm", text: "Happy Republic Day, {name}!" },
      { tone: "warm", text: "Happy {ordinal} Republic Day, {name} — enjoy the parade and the day off." },
    ],
    [
      { tone: "patriotic", text: "On 26 January 1950 the Constitution came into force and a hard-won freedom became a working republic: one citizen, one vote, one set of rights." },
      { tone: "patriotic", text: "The tricolour we salute today stands for a promise ordinary people made to each other — justice, liberty, equality and fraternity." },
      { tone: "formal", text: "Adopted on 26 November 1949 and in force from 26 January 1950, the Constitution is still the source of every right and duty we exercise." },
      { tone: "formal", text: "The date honours the Purna Swaraj declaration of 26 January 1930, when complete independence was first demanded in public." },
      { tone: "warm", text: "Here is to a country that keeps arguing, keeps voting and somehow keeps moving forward." },
      { tone: "warm", text: "Wishing you a day of flags on the balcony, sweets in the kitchen and a little quiet pride." },
    ],
    [
      { tone: "patriotic", text: "Jai Hind." },
      { tone: "patriotic", text: "Vande Mataram — happy Republic Day." },
      { tone: "formal", text: "With best wishes on this national day." },
      { tone: "formal", text: "Warm regards, and a proud Republic Day to you." },
      { tone: "warm", text: "Happy Republic Day!" },
      { tone: "warm", text: "Enjoy the day — Jai Hind." },
    ],
  ],
  caption: [
    [
      { tone: "patriotic", text: "Three colours, one country. Happy {ordinal} Republic Day." },
      { tone: "patriotic", text: "Saluting the document that holds a billion people together." },
      { tone: "formal", text: "Commemorating the {ordinal} Republic Day of India, 26 January." },
      { tone: "formal", text: "In force since 26 January 1950 — the Constitution of India." },
      { tone: "warm", text: "Chai, tricolour, goosebumps. Happy Republic Day." },
      { tone: "warm", text: "Happy {ordinal} Republic Day from our home to yours." },
    ],
    [
      { tone: "patriotic", text: "Jai Hind." },
      { tone: "patriotic", text: "Proud, and paying attention." },
      { tone: "formal", text: "26 January, every year." },
      { tone: "formal", text: "Rights, duties, and the republic that guarantees both." },
      { tone: "warm", text: "Wishing everyone a lovely 26 January." },
      { tone: "warm", text: "Wave the flag, and keep it off the ground." },
    ],
  ],
  speech: [
    [
      { tone: "formal", text: "Respected Principal, teachers and my dear friends — a very happy {ordinal} Republic Day to all of you." },
      { tone: "formal", text: "Honourable chief guest, respected teachers and dear students, good morning, and a happy {ordinal} Republic Day." },
      { tone: "patriotic", text: "Good morning everyone. Today, on our {ordinal} Republic Day, we stand under a flag that took a very long fight to earn." },
      { tone: "patriotic", text: "Friends, {ordinal} Republic Day. Seventy-odd years of one of the boldest experiments any country has attempted." },
      { tone: "warm", text: "Good morning friends, and a very happy Republic Day to every one of you." },
      { tone: "warm", text: "Good morning. Before the sweets are handed out, may I have two minutes of your time on this {ordinal} Republic Day." },
    ],
    [
      { tone: "formal", text: "The Constituent Assembly adopted the Constitution on 26 November 1949, and it came into force on 26 January 1950 — the date we mark today." },
      { tone: "formal", text: "Dr B. R. Ambedkar chaired the drafting committee, and the Assembly debated the text for almost three years before it was finalised." },
      { tone: "patriotic", text: "A group of Indians sat down and wrote what kind of country they wanted, and on 26 January 1950 that document became the law of the land." },
      { tone: "patriotic", text: "26 January was not picked at random: it is the anniversary of the Purna Swaraj declaration of 1930, when complete independence was first demanded openly." },
      { tone: "warm", text: "Republic Day is not only the parade on Kartavya Path; it is also about what the other 364 days look like for ordinary people." },
      { tone: "warm", text: "Independence Day is about the freedom we won. Republic Day is about the rules we chose to live by afterwards." },
    ],
    [
      { tone: "formal", text: "In the next few minutes I would like to talk about what that Constitution promises us, and what it asks of us in return." },
      { tone: "formal", text: "Allow me to spend a few minutes on three ideas from the Preamble that still decide how we live." },
      { tone: "patriotic", text: "Let me tell you why one date on a calendar still matters to every single person in this room." },
      { tone: "patriotic", text: "So today, let us look past the flags for a moment and talk about the promise underneath them." },
      { tone: "warm", text: "So let me share a few simple thoughts on what being a republic means in everyday life." },
      { tone: "warm", text: "Give me two more minutes and I will explain why that matters to us, right here." },
    ],
  ],
};

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

export function cleanName(raw) {
  if (typeof raw !== "string") return "";
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

/**
 * Build Republic Day messages.
 *
 * @param {object} options
 * @param {string} [options.name]   recipient name (greetings only), optional
 * @param {number} options.year     the Republic Day year, e.g. 2026
 * @param {string} options.format   "greeting" | "caption" | "speech"
 * @param {string} options.tone     one of TONES
 * @param {number} options.count    1..MAX_COUNT
 * @param {number} options.seed     integer seed — same seed, same output
 * @param {boolean} [options.hashtags]
 * @returns {{messages: string[], ordinalLabel: string, ordinal: number, available: number, truncated: boolean}|{error: string}}
 */
export function generateMessages({
  name = "",
  year = FIRST_REPUBLIC_DAY_YEAR,
  format = "greeting",
  tone = "patriotic",
  count = 3,
  seed = 1,
  hashtags = false,
} = {}) {
  const slots = FORMAT_SLOTS[format];
  if (!slots) return { error: "Choose a message format." };
  if (!TONES.some((t) => t.id === tone)) return { error: "Choose a tone." };

  const rd = republicDayOrdinal(year);
  if (rd.error) return { error: rd.error };

  const wanted = Math.floor(Number(count));
  if (!Number.isFinite(wanted) || wanted < 1) return { error: "Ask for at least one message." };
  if (wanted > MAX_COUNT) return { error: `Ask for ${MAX_COUNT} messages or fewer in one go.` };

  const safeSeed = Number.isFinite(Number(seed)) ? Math.abs(Math.floor(Number(seed))) : 1;
  const rand = mulberry32(safeSeed + 1);

  const pools = slots.map((pool) => shuffle(pool.filter((item) => item.tone === tone), rand));
  if (pools.some((pool) => pool.length === 0)) {
    return { error: "No wording available for that format and tone yet." };
  }

  const available = pools.reduce((product, pool) => product * pool.length, 1);
  const total = Math.min(wanted, available);

  const who = cleanName(name) || "friend";
  const messages = [];

  // Mixed-radix enumeration guarantees every message is a distinct combination.
  for (let i = 0; i < total; i += 1) {
    let remainder = i;
    const pieces = pools.map((pool) => {
      const item = pool[remainder % pool.length];
      remainder = Math.floor(remainder / pool.length);
      return item.text;
    });
    let text = capitalizeFirst(
      pieces.join(" ").replace(/\{name\}/g, who).replace(/\{ordinal\}/g, rd.label),
    );
    if (hashtags) text = `${text} ${HASHTAGS}`;
    messages.push(text);
  }

  return {
    messages,
    ordinal: rd.ordinal,
    ordinalLabel: rd.label,
    year: rd.year,
    available,
    truncated: messages.length < wanted,
  };
}
