/**
 * Random Quote Generator — pure data + selection logic.
 *
 * The whole quote set ships with the tool, so nothing is fetched at runtime and
 * the same seed always returns the same quote. Randomness is injected by the
 * caller as a numeric `seed`, keeping every function here pure.
 *
 * Every quote is a short, widely documented line from an author whose work is
 * in the public domain, and each carries its attribution. Attribution travels
 * with the text everywhere it is copied.
 */

/** Themes, in display order. `all` draws from every quote. */
export const THEMES = [
  { id: "all", label: "Any theme" },
  { id: "motivation", label: "Motivation" },
  { id: "wisdom", label: "Wisdom" },
  { id: "perseverance", label: "Perseverance" },
  { id: "creativity", label: "Creativity" },
  { id: "leadership", label: "Leadership" },
  { id: "learning", label: "Learning" },
];

/** The quote set: { id, text, author, theme }. */
export const QUOTES = [
  { id: 1, theme: "motivation", text: "Well begun is half done.", author: "Aristotle" },
  { id: 2, theme: "motivation", text: "The best way out is always through.", author: "Robert Frost" },
  { id: 3, theme: "motivation", text: "Do not wait; the time will never be just right.", author: "Napoleon Hill" },
  { id: 4, theme: "motivation", text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  { id: 5, theme: "motivation", text: "Arise, awake, and stop not till the goal is reached.", author: "Swami Vivekananda" },
  { id: 6, theme: "motivation", text: "Lost time is never found again.", author: "Benjamin Franklin" },
  { id: 7, theme: "motivation", text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { id: 8, theme: "motivation", text: "Action is the foundational key to all success.", author: "Pablo Picasso" },

  { id: 9, theme: "wisdom", text: "The unexamined life is not worth living.", author: "Socrates" },
  { id: 10, theme: "wisdom", text: "You have power over your mind, not outside events.", author: "Marcus Aurelius" },
  { id: 11, theme: "wisdom", text: "We suffer more often in imagination than in reality.", author: "Seneca" },
  { id: 12, theme: "wisdom", text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
  { id: 13, theme: "wisdom", text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { id: 14, theme: "wisdom", text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { id: 15, theme: "wisdom", text: "It is not length of life, but depth of life.", author: "Ralph Waldo Emerson" },
  { id: 16, theme: "wisdom", text: "Be the change you wish to see in the world.", author: "Mahatma Gandhi" },

  { id: 17, theme: "perseverance", text: "Fall seven times, stand up eight.", author: "Japanese proverb" },
  { id: 18, theme: "perseverance", text: "Our greatest glory is not in never falling, but in rising every time we fall.", author: "Confucius" },
  { id: 19, theme: "perseverance", text: "I have not failed. I've just found ten thousand ways that won't work.", author: "Thomas Edison" },
  { id: 20, theme: "perseverance", text: "Nothing in life is to be feared, it is only to be understood.", author: "Marie Curie" },
  { id: 21, theme: "perseverance", text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { id: 22, theme: "perseverance", text: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
  { id: 23, theme: "perseverance", text: "The most difficult thing is the decision to act; the rest is merely tenacity.", author: "Amelia Earhart" },
  { id: 24, theme: "perseverance", text: "Character cannot be developed in ease and quiet.", author: "Helen Keller" },

  { id: 25, theme: "creativity", text: "Every child is an artist; the problem is staying an artist when you grow up.", author: "Pablo Picasso" },
  { id: 26, theme: "creativity", text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
  { id: 27, theme: "creativity", text: "Art is never finished, only abandoned.", author: "Leonardo da Vinci" },
  { id: 28, theme: "creativity", text: "The present is theirs; the future, for which I really worked, is mine.", author: "Nikola Tesla" },
  { id: 29, theme: "creativity", text: "You cannot cross the sea merely by standing and staring at the water.", author: "Rabindranath Tagore" },
  { id: 30, theme: "creativity", text: "Whatever you can do, or dream you can, begin it.", author: "Johann Wolfgang von Goethe" },
  { id: 31, theme: "creativity", text: "To create, one must first question everything.", author: "Eileen Gray" },
  { id: 32, theme: "creativity", text: "Genius is one percent inspiration and ninety-nine percent perspiration.", author: "Thomas Edison" },

  { id: 33, theme: "leadership", text: "A leader is best when people barely know he exists.", author: "Lao Tzu" },
  { id: 34, theme: "leadership", text: "The supreme art of war is to subdue the enemy without fighting.", author: "Sun Tzu" },
  { id: 35, theme: "leadership", text: "Nearly all men can stand adversity, but if you want to test a man's character, give him power.", author: "Abraham Lincoln" },
  { id: 36, theme: "leadership", text: "Before you start some work, always ask yourself three questions: why am I doing it, what the results might be, and will I be successful.", author: "Chanakya" },
  { id: 37, theme: "leadership", text: "No one can make you feel inferior without your consent.", author: "Eleanor Roosevelt" },
  { id: 38, theme: "leadership", text: "I attribute my success to this: I never gave or took any excuse.", author: "Florence Nightingale" },
  { id: 39, theme: "leadership", text: "He who cannot be a good follower cannot be a good leader.", author: "Aristotle" },
  { id: 40, theme: "leadership", text: "Example is not the main thing in influencing others. It is the only thing.", author: "Albert Schweitzer" },

  { id: 41, theme: "learning", text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { id: 42, theme: "learning", text: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
  { id: 43, theme: "learning", text: "Real knowledge is to know the extent of one's ignorance.", author: "Confucius" },
  { id: 44, theme: "learning", text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", author: "Benjamin Franklin" },
  { id: 45, theme: "learning", text: "Study without desire spoils the memory, and it retains nothing that it takes in.", author: "Leonardo da Vinci" },
  { id: 46, theme: "learning", text: "Education is not the filling of a pail, but the lighting of a fire.", author: "William Butler Yeats" },
  { id: 47, theme: "learning", text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { id: 48, theme: "learning", text: "The mind is not a vessel to be filled but a fire to be kindled.", author: "Plutarch" },
];

/** Upper bound for a seed value (2^31 - 1) — keeps the hash in integer range. */
export const MAX_SEED = 2147483647;

/**
 * mulberry32 mixing step: spreads any finite number across the 32-bit range so
 * consecutive seeds do not give neighbouring quotes.
 * @param {number} seed
 * @returns {number} unsigned 32-bit integer
 */
export function hashSeed(seed) {
  let x = Math.floor(Math.abs(Number(seed) || 0)) % 4294967296;
  x = (x + 0x6d2b79f5) >>> 0;
  x = Math.imul(x ^ (x >>> 15), x | 1) >>> 0;
  x ^= (x + Math.imul(x ^ (x >>> 7), x | 61)) >>> 0;
  return (x ^ (x >>> 14)) >>> 0;
}

/**
 * Quotes belonging to a theme.
 * @param {string} themeId
 * @returns {Array}
 */
export function quotesInTheme(themeId) {
  if (!themeId || themeId === "all") return QUOTES.slice();
  return QUOTES.filter((quote) => quote.theme === themeId);
}

/**
 * Deterministically pick a quote.
 *
 * @param {object} input
 * @param {number} input.seed - finite number; same seed gives the same quote
 * @param {string} [input.theme="all"]
 * @param {number[]} [input.excludeIds=[]] - ids already shown this session
 * @returns {{quote: object, poolSize: number, remaining: number, cycled: boolean} | {error: string}}
 */
export function pickQuote({ seed, theme = "all", excludeIds = [] } = {}) {
  if (typeof seed !== "number" || !Number.isFinite(seed)) {
    return { error: "Pass a finite number as the seed." };
  }
  if (!THEMES.some((t) => t.id === theme)) {
    return { error: "That theme does not exist." };
  }

  const pool = quotesInTheme(theme);
  if (pool.length === 0) return { error: "No quotes are available in that theme yet." };

  const seen = new Set(Array.isArray(excludeIds) ? excludeIds : []);
  let candidates = pool.filter((quote) => !seen.has(quote.id));
  const cycled = candidates.length === 0;
  if (cycled) candidates = pool;

  const index = hashSeed(seed) % candidates.length;
  return {
    quote: candidates[index],
    poolSize: pool.length,
    remaining: cycled ? pool.length - 1 : candidates.length - 1,
    cycled,
  };
}

/**
 * Quote rendered for copying — always carries the attribution.
 * @param {{text: string, author: string}} quote
 * @returns {string}
 */
export function formatQuote(quote) {
  if (!quote || !quote.text || !quote.author) return "";
  return `"${quote.text}" — ${quote.author}`;
}

/**
 * Word and character counts, useful when a quote has to fit a caption limit.
 * @param {{text: string, author: string}} quote
 * @returns {{words: number, characters: number, withAttribution: number} | {error: string}}
 */
export function quoteLength(quote) {
  if (!quote || typeof quote.text !== "string" || quote.text.trim() === "") {
    return { error: "No quote to measure." };
  }
  const words = quote.text.trim().split(/\s+/).length;
  return {
    words,
    characters: quote.text.length,
    withAttribution: formatQuote(quote).length,
  };
}

/**
 * How many quotes sit under each theme, plus the distinct author count.
 * @returns {{total: number, authors: number, byTheme: Array<{id: string, label: string, count: number}>}}
 */
export function quoteStats() {
  const byTheme = THEMES.filter((t) => t.id !== "all").map((t) => ({
    id: t.id,
    label: t.label,
    count: QUOTES.filter((quote) => quote.theme === t.id).length,
  }));
  return {
    total: QUOTES.length,
    authors: new Set(QUOTES.map((quote) => quote.author)).size,
    byTheme,
  };
}
