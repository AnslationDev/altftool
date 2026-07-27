/**
 * Random Fun Picker — pure, seeded random selection for three games in one:
 * a lunch-spot picker, a Truth or Dare deck, and a name / team drawer.
 *
 * Randomness here is seeded, not ambient. Every function takes a numeric seed and uses
 * mulberry32, a well-known 32-bit PRNG, so the same seed always produces the same pick.
 * That keeps the module pure (and testable) while the UI supplies a fresh seed per spin.
 *
 * Shuffling uses the Fisher-Yates algorithm, which is the only shuffle that gives every
 * one of the n! orderings equal probability.
 */

/** mulberry32 constants — the published parameters of the generator. */
const MULBERRY_INCREMENT = 0x6d2b79f5;
const MULBERRY_MUL_A = 15;
const MULBERRY_MUL_B = 7;
const MULBERRY_MUL_C = 61;
/** 2^32, used to map a 32-bit unsigned integer into [0, 1). */
const TWO_POW_32 = 4294967296;

/** FNV-1a 32-bit offset basis and prime, used to turn text into a numeric seed. */
const FNV_OFFSET_BASIS = 2166136261;
const FNV_PRIME = 16777619;

/** Most people cannot keep a draw straight past this many names. */
export const MAX_NAMES = 200;

/** Team splitting only makes sense between these bounds. */
export const MIN_TEAMS = 2;
export const MAX_TEAMS = 20;

/** Cuisines the lunch picker knows about. */
export const CUISINES = [
  { id: "italian", name: "Italian", emoji: "🍝" },
  { id: "japanese", name: "Japanese", emoji: "🍣" },
  { id: "mexican", name: "Mexican", emoji: "🌮" },
  { id: "indian", name: "Indian", emoji: "🍛" },
  { id: "chinese", name: "Chinese", emoji: "🥟" },
  { id: "american", name: "American", emoji: "🍔" },
  { id: "mediterranean", name: "Mediterranean", emoji: "🥙" },
  { id: "korean", name: "Korean", emoji: "🥘" },
  { id: "thai", name: "Thai", emoji: "🍜" },
  { id: "french", name: "French", emoji: "🥐" },
  { id: "healthy", name: "Salads and bowls", emoji: "🥗" },
];

/** Budget bands. */
export const BUDGETS = [
  { id: "budget", name: "Budget", emoji: "💰" },
  { id: "moderate", name: "Moderate", emoji: "💵" },
  { id: "premium", name: "Premium", emoji: "💎" },
];

/** Dietary / format preference. */
export const MEAL_TYPES = [
  { id: "veg", name: "Vegetarian", emoji: "🥦" },
  { id: "nonveg", name: "Non-vegetarian", emoji: "🍗" },
  { id: "fastfood", name: "Fast food", emoji: "🍟" },
  { id: "healthy", name: "Healthy", emoji: "🥗" },
  { id: "street", name: "Street food", emoji: "🌯" },
];

/** Sample places. Ratings are illustrative, not scraped from any review site. */
export const RESTAURANTS = [
  { name: "The Green Bowl", cuisine: "healthy", budget: "moderate", type: "veg", rating: 4.5 },
  { name: "Sakura Sushi", cuisine: "japanese", budget: "premium", type: "nonveg", rating: 4.8 },
  { name: "El Mariachi", cuisine: "mexican", budget: "moderate", type: "nonveg", rating: 4.3 },
  { name: "Spice Route", cuisine: "indian", budget: "premium", type: "nonveg", rating: 4.7 },
  { name: "Golden Dragon", cuisine: "chinese", budget: "moderate", type: "nonveg", rating: 4.2 },
  { name: "Burger Republic", cuisine: "american", budget: "budget", type: "fastfood", rating: 4.0 },
  { name: "Trattoria Verde", cuisine: "italian", budget: "moderate", type: "veg", rating: 4.4 },
  { name: "Pita Paradise", cuisine: "mediterranean", budget: "moderate", type: "veg", rating: 4.6 },
  { name: "Seoul BBQ", cuisine: "korean", budget: "premium", type: "nonveg", rating: 4.9 },
  { name: "Bangkok Street", cuisine: "thai", budget: "budget", type: "street", rating: 4.1 },
  { name: "Le Petit Bistro", cuisine: "french", budget: "premium", type: "nonveg", rating: 4.8 },
  { name: "Fresh Harvest", cuisine: "healthy", budget: "moderate", type: "healthy", rating: 4.5 },
  { name: "Taco Stand", cuisine: "mexican", budget: "budget", type: "street", rating: 4.2 },
  { name: "Ramen House", cuisine: "japanese", budget: "moderate", type: "nonveg", rating: 4.3 },
  { name: "Paneer Paradise", cuisine: "indian", budget: "moderate", type: "veg", rating: 4.4 },
  { name: "Pizza Express Lane", cuisine: "italian", budget: "moderate", type: "fastfood", rating: 4.1 },
  { name: "Dim Sum Palace", cuisine: "chinese", budget: "moderate", type: "nonveg", rating: 4.3 },
  { name: "Veggie Delight", cuisine: "healthy", budget: "budget", type: "veg", rating: 4.0 },
  { name: "Falafel King", cuisine: "mediterranean", budget: "budget", type: "veg", rating: 4.2 },
  { name: "Korean Fried Chicken", cuisine: "korean", budget: "moderate", type: "fastfood", rating: 4.6 },
  { name: "Pad Thai Corner", cuisine: "thai", budget: "budget", type: "street", rating: 4.1 },
  { name: "Croissant Cafe", cuisine: "french", budget: "moderate", type: "veg", rating: 4.3 },
  { name: "Salad Lab", cuisine: "healthy", budget: "moderate", type: "healthy", rating: 4.2 },
  { name: "Steakhouse Prime", cuisine: "american", budget: "premium", type: "nonveg", rating: 4.7 },
];

/** Truth prompts by difficulty. */
export const TRUTHS = {
  easy: [
    "What is your favourite food?",
    "What is your dream job?",
    "What film have you rewatched the most?",
    "What hobby would you pick up if time were free?",
    "Where would you travel tomorrow if the ticket were paid?",
    "What song do you play on repeat?",
    "Who is the person you most look up to?",
    "What book stayed with you longest?",
  ],
  medium: [
    "What is the most embarrassing thing you have done in public?",
    "What is your biggest fear?",
    "What is your guilty pleasure?",
    "What was your worst date?",
    "What is the strangest food you genuinely enjoy?",
    "What is the worst gift you have ever received?",
    "What was your most awkward moment at work?",
    "What is something you pretend to like?",
  ],
  hard: [
    "What is the biggest mistake you have made?",
    "What is something you have done that you regret?",
    "What is the biggest risk you have taken?",
    "What is the worst thing you have said to someone?",
    "What is your biggest regret so far?",
    "What is a promise you broke?",
    "What is the most trouble you have been in?",
    "What is something you have never admitted to your family?",
  ],
};

/** Dare prompts by difficulty. */
export const DARES = {
  easy: [
    "Do ten push-ups.",
    "Sing for thirty seconds.",
    "Speak in an accent for one minute.",
    "Show your best dance move.",
    "Hop on one foot for thirty seconds.",
    "Say the alphabet backwards.",
    "Act like your favourite animal.",
    "Give everyone in the room a genuine compliment.",
  ],
  medium: [
    "Do your best celebrity impression.",
    "Talk for a minute without closing your mouth.",
    "Sing the national anthem at full volume.",
    "Act out a film scene for one minute.",
    "Let someone read out your last text message dramatically.",
    "Wear your shirt backwards for three rounds.",
    "Make up a rap about the person to your left.",
    "Swap seats with someone and imitate them for a round.",
  ],
  hard: [
    "Let the group choose your profile picture for the next hour.",
    "Call a friend and sing to them.",
    "Do fifty push-ups in two minutes.",
    "Swap one item of clothing with the person opposite.",
    "Tell an embarrassing story in full detail.",
    "Let the group pick your next meal.",
    "Hold a handstand against the wall for thirty seconds.",
    "Do a dramatic reading of the last thing you searched for.",
  ],
};

/** Difficulty levels available in the Truth or Dare deck. */
export const DIFFICULTIES = [
  { id: "easy", label: "Easy", note: "Safe for family and office groups." },
  { id: "medium", label: "Medium", note: "Classic party level." },
  { id: "hard", label: "Hard", note: "For friends who will forgive you." },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * mulberry32: a compact 32-bit PRNG with a full 2^32 period.
 * @param {number} seed Any 32-bit integer.
 * @returns {function(): number} generator returning values in [0, 1).
 */
export function mulberry32(seed) {
  let state = (isNum(seed) ? Math.floor(seed) : 0) >>> 0;
  return function next() {
    state = (state + MULBERRY_INCREMENT) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> MULBERRY_MUL_A), 1 | t);
    t = (t + Math.imul(t ^ (t >>> MULBERRY_MUL_B), 1 | t)) ^ t;
    return ((t ^ (t >>> MULBERRY_MUL_C)) >>> 0) / TWO_POW_32;
  };
}

/** FNV-1a hash, so a piece of text can be used as a reproducible seed. */
export function hashSeed(text) {
  let hash = FNV_OFFSET_BASIS;
  const value = String(text === undefined || text === null ? "" : text);
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME) >>> 0;
  }
  return hash;
}

/** Chance any one item is picked from a list of n, as a percentage. */
export function probabilityPercent(n) {
  if (!isNum(n) || n <= 0) return 0;
  return 100 / n;
}

/**
 * Picks one item from a list using the given seed.
 * @returns {{item:*, index:number, chancePercent:number}|{error:string}}
 */
export function pickOne(items, seed) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "There is nothing to pick from — add at least one option." };
  }
  const random = mulberry32(seed);
  const index = Math.floor(random() * items.length) % items.length;
  return { item: items[index], index, chancePercent: probabilityPercent(items.length) };
}

/**
 * Fisher-Yates shuffle. Every permutation is equally likely.
 * @returns {Array} a new array; the input is never mutated.
 */
export function shuffle(items, seed) {
  if (!Array.isArray(items)) return [];
  const output = [...items];
  const random = mulberry32(seed);
  for (let i = output.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const swap = output[i];
    output[i] = output[j];
    output[j] = swap;
  }
  return output;
}

/**
 * Draws `count` distinct names, in order of drawing.
 * @returns {{winners:string[], remaining:string[], chancePercent:number}|{error:string}}
 */
export function drawNames(names, count, seed) {
  const cleaned = (Array.isArray(names) ? names : [])
    .map((name) => String(name || "").trim())
    .filter(Boolean);

  if (cleaned.length === 0) return { error: "Add at least one name to draw from." };
  if (cleaned.length > MAX_NAMES) {
    return { error: `This picker handles up to ${MAX_NAMES} names at a time.` };
  }
  const unique = Array.from(new Set(cleaned));
  if (unique.length !== cleaned.length) {
    return { error: "Two names are identical — make them unique so the draw is fair." };
  }
  if (!isNum(count) || count < 1) return { error: "Draw at least one name." };
  if (count > unique.length) {
    return { error: `You asked for ${Math.round(count)} names but only listed ${unique.length}.` };
  }

  const order = shuffle(unique, seed);
  const winners = order.slice(0, Math.round(count));
  return {
    winners,
    remaining: order.slice(Math.round(count)),
    chancePercent: (Math.round(count) / unique.length) * 100,
  };
}

/**
 * Splits names into teams as evenly as possible. With n names and t teams, the first
 * (n mod t) teams get one extra member — the standard even split.
 * @returns {{teams:Array<{name:string, members:string[]}>, largest:number, smallest:number}|{error:string}}
 */
export function makeTeams(names, teamCount, seed) {
  const cleaned = (Array.isArray(names) ? names : [])
    .map((name) => String(name || "").trim())
    .filter(Boolean);

  if (cleaned.length === 0) return { error: "Add at least one name before making teams." };
  if (!isNum(teamCount) || teamCount < MIN_TEAMS || teamCount > MAX_TEAMS) {
    return { error: `Choose between ${MIN_TEAMS} and ${MAX_TEAMS} teams.` };
  }
  const teams = Math.round(teamCount);
  if (teams > cleaned.length) {
    return { error: `You cannot build ${teams} teams from ${cleaned.length} names.` };
  }

  const order = shuffle(cleaned, seed);
  const base = Math.floor(order.length / teams);
  const extra = order.length % teams;

  const output = [];
  let cursor = 0;
  for (let i = 0; i < teams; i += 1) {
    const size = base + (i < extra ? 1 : 0);
    output.push({ name: `Team ${i + 1}`, members: order.slice(cursor, cursor + size) });
    cursor += size;
  }

  return {
    teams: output,
    largest: base + (extra > 0 ? 1 : 0),
    smallest: base,
  };
}

/**
 * Picks a lunch spot matching the chosen filters.
 * @param {object} input
 * @param {string} [input.cuisine] Cuisine id, or "any".
 * @param {string} [input.budget]  Budget id, or "any".
 * @param {string} [input.type]    Meal type id, or "any".
 * @param {number} [input.minRating] Minimum rating, 0 to 5.
 * @param {number} input.seed
 * @returns {{pick:object, matches:object[], chancePercent:number}|{error:string}}
 */
export function pickLunch({ cuisine = "any", budget = "any", type = "any", minRating = 0, seed = 0 } = {}) {
  if (!isNum(minRating) || minRating < 0 || minRating > 5) {
    return { error: "Minimum rating must be between 0 and 5." };
  }
  const matches = RESTAURANTS.filter((place) => {
    if (cuisine !== "any" && place.cuisine !== cuisine) return false;
    if (budget !== "any" && place.budget !== budget) return false;
    if (type !== "any" && place.type !== type) return false;
    return place.rating >= minRating;
  });

  if (matches.length === 0) {
    return { error: "Nothing matches those filters. Loosen one of them and try again." };
  }

  const picked = pickOne(matches, seed);
  if (picked.error) return { error: picked.error };

  return {
    pick: picked.item,
    matches,
    chancePercent: picked.chancePercent,
  };
}

/**
 * Draws a Truth or a Dare.
 * @param {object} input
 * @param {string} input.mode        "truth", "dare" or "either".
 * @param {string} input.difficulty  Key from DIFFICULTIES.
 * @param {number} input.seed
 * @returns {{kind:string, prompt:string, deckSize:number, chancePercent:number}|{error:string}}
 */
export function pickTruthOrDare({ mode = "either", difficulty = "easy", seed = 0 } = {}) {
  if (!DIFFICULTIES.some((entry) => entry.id === difficulty)) {
    return { error: "Pick a difficulty: easy, medium or hard." };
  }
  if (!["truth", "dare", "either"].includes(mode)) {
    return { error: "Mode must be truth, dare or either." };
  }

  const random = mulberry32(seed);
  const kind = mode === "either" ? (random() < 0.5 ? "truth" : "dare") : mode;
  const deck = kind === "truth" ? TRUTHS[difficulty] : DARES[difficulty];

  if (!Array.isArray(deck) || deck.length === 0) {
    return { error: "That deck is empty." };
  }

  // Reuse the same generator so the kind and the prompt both come from one seed.
  const index = Math.floor(random() * deck.length) % deck.length;
  return {
    kind,
    prompt: deck[index],
    deckSize: deck.length,
    chancePercent: probabilityPercent(deck.length),
  };
}
