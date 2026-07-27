/**
 * Random Joke Generator — pure data + selection logic.
 *
 * There is no joke API call here: the whole set ships with the tool so the
 * generator works offline and returns the same joke for the same seed.
 *
 * Randomness is supplied by the caller as a numeric `seed`, so every function
 * in this module is pure (same input -> same output). The UI creates the seed
 * with Math.random(); the maths never reads a clock or a global RNG.
 *
 * All jokes are original/public-domain wordplay, written clean (safe for work
 * and for classrooms).
 */

/** Joke categories, in display order. Ids are stable and used as filter keys. */
export const CATEGORIES = [
  { id: "all", label: "Any category" },
  { id: "dad", label: "Dad jokes" },
  { id: "tech", label: "Tech & programming" },
  { id: "animals", label: "Animals" },
  { id: "food", label: "Food" },
  { id: "work", label: "Work & office" },
  { id: "school", label: "School & science" },
];

/** The joke set. `id` is stable so the "already seen" list survives re-renders. */
export const JOKES = [
  { id: 1, category: "dad", setup: "I only know 25 letters of the alphabet.", punchline: "I don't know y." },
  { id: 2, category: "dad", setup: "I used to hate facial hair.", punchline: "Then it grew on me." },
  { id: 3, category: "dad", setup: "What do you call a fake noodle?", punchline: "An impasta." },
  { id: 4, category: "dad", setup: "I'm reading a book about anti-gravity.", punchline: "It's impossible to put down." },
  { id: 5, category: "dad", setup: "Why did the scarecrow win an award?", punchline: "He was outstanding in his field." },
  { id: 6, category: "dad", setup: "I told my suitcase we're not going on holiday this year.", punchline: "Now I'm dealing with emotional baggage." },
  { id: 7, category: "dad", setup: "What do you call a belt made of watches?", punchline: "A waist of time." },
  { id: 8, category: "dad", setup: "I would tell you a construction joke.", punchline: "But I'm still working on it." },

  { id: 9, category: "tech", setup: "Why do programmers prefer dark mode?", punchline: "Because light attracts bugs." },
  { id: 10, category: "tech", setup: "There are 10 kinds of people in the world.", punchline: "Those who understand binary and those who don't." },
  { id: 11, category: "tech", setup: "Why did the developer go broke?", punchline: "He used up all his cache." },
  { id: 12, category: "tech", setup: "How many programmers does it take to change a light bulb?", punchline: "None. That's a hardware problem." },
  { id: 13, category: "tech", setup: "A SQL query walks into a bar, goes up to two tables and asks:", punchline: "\"May I join you?\"" },
  { id: 14, category: "tech", setup: "Why was the JavaScript developer sad?", punchline: "Because he didn't know how to null his feelings." },
  { id: 15, category: "tech", setup: "I changed my password to \"incorrect\".", punchline: "Now when I forget it, the computer tells me: your password is incorrect." },
  { id: 16, category: "tech", setup: "Why do Java developers wear glasses?", punchline: "Because they can't C#." },

  { id: 17, category: "animals", setup: "What do you call a bear with no teeth?", punchline: "A gummy bear." },
  { id: 18, category: "animals", setup: "Why don't elephants use computers?", punchline: "They're afraid of the mouse." },
  { id: 19, category: "animals", setup: "What do you call a fish wearing a bowtie?", punchline: "Sofishticated." },
  { id: 20, category: "animals", setup: "Why do cows wear bells?", punchline: "Because their horns don't work." },
  { id: 21, category: "animals", setup: "What did the duck say when it bought lipstick?", punchline: "\"Put it on my bill.\"" },
  { id: 22, category: "animals", setup: "How do you organise a space party?", punchline: "You planet." },
  { id: 23, category: "animals", setup: "What's a sheep's favourite kind of maths?", punchline: "Ewe-clidean geometry." },
  { id: 24, category: "animals", setup: "Why did the chicken join a band?", punchline: "Because it already had drumsticks." },

  { id: 25, category: "food", setup: "Why did the tomato turn red?", punchline: "Because it saw the salad dressing." },
  { id: 26, category: "food", setup: "What do you call cheese that isn't yours?", punchline: "Nacho cheese." },
  { id: 27, category: "food", setup: "Why did the coffee file a police report?", punchline: "It got mugged." },
  { id: 28, category: "food", setup: "How do you make a lemon drop?", punchline: "Just let go of it." },
  { id: 29, category: "food", setup: "What's the best thing about Switzerland?", punchline: "I don't know, but the flag is a big plus." },
  { id: 30, category: "food", setup: "Why don't eggs tell each other jokes?", punchline: "They'd crack up." },
  { id: 31, category: "food", setup: "I burnt my Hawaiian pizza today.", punchline: "I should have used aloha temperature." },
  { id: 32, category: "food", setup: "What did the grape do when it got stepped on?", punchline: "Nothing — it just let out a little wine." },

  { id: 33, category: "work", setup: "My boss told me to have a good day.", punchline: "So I went home." },
  { id: 34, category: "work", setup: "I asked for a pay rise because three companies were after me.", punchline: "The electricity, the gas and the water company." },
  { id: 35, category: "work", setup: "Why did the accountant break up with the calculator?", punchline: "She felt he was just using her to solve his problems." },
  { id: 36, category: "work", setup: "Our office has a strict dress code.", punchline: "I keep getting told a bathrobe doesn't count as business casual." },
  { id: 37, category: "work", setup: "The meeting could have been an email.", punchline: "The email could have been a nap." },
  { id: 38, category: "work", setup: "Why don't skeletons ever apply for promotions?", punchline: "They don't have the guts." },
  { id: 39, category: "work", setup: "I told HR I needed a standing desk.", punchline: "They said I'd have to sit down and discuss it." },
  { id: 40, category: "work", setup: "My printer said \"paper jam\".", punchline: "I've checked every drawer and there is no toast in here." },

  { id: 41, category: "school", setup: "Why can't you trust an atom?", punchline: "They make up everything." },
  { id: 42, category: "school", setup: "Why did the maths book look so sad?", punchline: "Because it had too many problems." },
  { id: 43, category: "school", setup: "What do you call an educated tube?", punchline: "A graduated cylinder." },
  { id: 44, category: "school", setup: "Parallel lines have so much in common.", punchline: "It's a shame they'll never meet." },
  { id: 45, category: "school", setup: "Why did the student eat his homework?", punchline: "The teacher said it was a piece of cake." },
  { id: 46, category: "school", setup: "What is a physicist's favourite food?", punchline: "Fission chips." },
  { id: 47, category: "school", setup: "Why do geologists make bad comedians?", punchline: "Their delivery is too dry, and they take everything for granite." },
  { id: 48, category: "school", setup: "I have a joke about chemistry.", punchline: "But I'm afraid I won't get a reaction." },
];

/** Largest seed the hash accepts before precision starts to bite (2^31 - 1). */
export const MAX_SEED = 2147483647;

/**
 * xorshift-style 32-bit integer hash (Thomas Wang / mulberry32 mixer).
 * Turns any finite number into a well-spread unsigned 32-bit integer, so two
 * seeds one apart do not produce neighbouring picks.
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
 * Jokes belonging to a category id.
 * @param {string} categoryId - one of CATEGORIES ids ("all" means every joke)
 * @returns {Array} the matching jokes (a new array; never the internal one)
 */
export function jokesInCategory(categoryId) {
  if (!categoryId || categoryId === "all") return JOKES.slice();
  return JOKES.filter((joke) => joke.category === categoryId);
}

/**
 * Pick one joke deterministically from a seed.
 *
 * Jokes already in `excludeIds` are skipped so a session does not repeat until
 * the pool is exhausted; once every joke in the category has been seen the pool
 * resets and `cycled` is true.
 *
 * @param {object} input
 * @param {number} input.seed - any finite number; identical seeds give identical jokes
 * @param {string} [input.category="all"] - category id
 * @param {number[]} [input.excludeIds=[]] - joke ids already shown this session
 * @returns {{joke: object, poolSize: number, remaining: number, cycled: boolean} | {error: string}}
 */
export function pickJoke({ seed, category = "all", excludeIds = [] } = {}) {
  if (typeof seed !== "number" || !Number.isFinite(seed)) {
    return { error: "Pass a finite number as the seed." };
  }
  const known = CATEGORIES.some((c) => c.id === category);
  if (!known) return { error: "That category does not exist." };

  const pool = jokesInCategory(category);
  if (pool.length === 0) return { error: "No jokes are available in that category yet." };

  const seen = new Set(Array.isArray(excludeIds) ? excludeIds : []);
  let candidates = pool.filter((joke) => !seen.has(joke.id));
  const cycled = candidates.length === 0;
  if (cycled) candidates = pool;

  const index = hashSeed(seed) % candidates.length;
  return {
    joke: candidates[index],
    poolSize: pool.length,
    remaining: cycled ? pool.length - 1 : candidates.length - 1,
    cycled,
  };
}

/**
 * Render a joke as plain text for copying or sharing.
 * @param {{setup: string, punchline: string}} joke
 * @returns {string}
 */
export function formatJoke(joke) {
  if (!joke || !joke.setup || !joke.punchline) return "";
  return `${joke.setup}\n${joke.punchline}`;
}

/**
 * Counts per category, for the stats strip.
 * @returns {{total: number, byCategory: Array<{id: string, label: string, count: number}>}}
 */
export function jokeStats() {
  const byCategory = CATEGORIES.filter((c) => c.id !== "all").map((c) => ({
    id: c.id,
    label: c.label,
    count: JOKES.filter((joke) => joke.category === c.id).length,
  }));
  return { total: JOKES.length, byCategory };
}
