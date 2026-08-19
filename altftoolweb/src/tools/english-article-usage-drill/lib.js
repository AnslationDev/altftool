/**
 * English article drill: item bank, seeded selection and grading.
 *
 * Answers are stored as "a", "an", "the" or "none" (the zero article). Every
 * item carries the rule that decides it. Question order is produced by a seeded
 * generator rather than Math.random, so the module stays pure and the same seed
 * always rebuilds the same paper.
 */

export const ARTICLE_OPTIONS = [
  { id: "a", label: "a" },
  { id: "an", label: "an" },
  { id: "the", label: "the" },
  { id: "none", label: "— (no article)" },
];

export const ARTICLE_LABELS = { a: "a", an: "an", the: "the", none: "—" };

export const CATEGORIES = [
  { id: "sound", label: "a or an — the sound rule" },
  { id: "indefinite", label: "a / an — first mention and roles" },
  { id: "definite", label: "the — unique, specified and superlative" },
  { id: "zero", label: "No article — generic, institutions, names" },
];

/** The four decisions that cover almost all article use. */
export const CORE_RULES = [
  { rule: "a / an", when: "Singular countable noun, first mention, one of many", example: "I saw a fox in the lane." },
  { rule: "an", when: "The next word starts with a vowel SOUND, not a vowel letter", example: "an hour, an MP — but a university, a one-way street" },
  { rule: "the", when: "The listener already knows which one: second mention, unique, specified, superlative", example: "The fox came back. The sun set. The best film." },
  { rule: "no article", when: "Plural or uncountable nouns in general, most place names, meals, institutions used for their purpose", example: "Cats sleep a lot. Water boils. She goes to school." },
];

export const DRILL_ITEMS = [
  // The a / an sound rule
  { id: "s1", category: "sound", sentence: "It took me ___ hour to get here.", answer: "an", rule: "The h in hour is silent, so the word begins with a vowel sound and takes an." },
  { id: "s2", category: "sound", sentence: "She is studying at ___ university in Delhi.", answer: "a", rule: "University begins with a 'yoo' sound, which is a consonant sound, so it takes a." },
  { id: "s3", category: "sound", sentence: "He is ___ honest man.", answer: "an", rule: "Honest starts with a silent h and therefore a vowel sound." },
  { id: "s4", category: "sound", sentence: "My uncle is ___ MP.", answer: "an", rule: "Letters are judged by how they are said: M is pronounced 'em', a vowel sound." },
  { id: "s5", category: "sound", sentence: "That is ___ European custom.", answer: "a", rule: "European begins with a 'y' sound, so it takes a despite the vowel letter." },
  { id: "s6", category: "sound", sentence: "They live on ___ one-way street.", answer: "a", rule: "One begins with a 'w' sound, so it takes a." },
  { id: "s7", category: "sound", sentence: "I need ___ umbrella before we go out.", answer: "an", rule: "Umbrella begins with a plain vowel sound, so an." },
  { id: "s8", category: "sound", sentence: "She wants to be ___ engineer.", answer: "an", rule: "Engineer begins with a vowel sound; a job title in the singular takes an article." },

  // Indefinite article: first mention, roles, rates
  { id: "i1", category: "indefinite", sentence: "There is ___ cat sitting on the fence.", answer: "a", rule: "First mention of a singular countable noun takes a or an." },
  { id: "i2", category: "indefinite", sentence: "She works as ___ teacher at the local school.", answer: "a", rule: "Jobs and roles in the singular take a or an: a teacher, an architect." },
  { id: "i3", category: "indefinite", sentence: "We go swimming twice ___ week.", answer: "a", rule: "A means 'per' in rates of frequency, speed and price: twice a week, 60 km an hour." },
  { id: "i4", category: "indefinite", sentence: "What ___ beautiful day!", answer: "a", rule: "Exclamations with a singular countable noun keep the indefinite article." },
  { id: "i5", category: "indefinite", sentence: "He had ___ headache all morning.", answer: "a", rule: "Common ailments such as a headache, a cold and a sore throat take a." },
  { id: "i6", category: "indefinite", sentence: "Could you lend me ___ pen? Any one will do.", answer: "a", rule: "Any member of a class, not a specific one the listener knows, takes a or an." },

  // Definite article
  { id: "d1", category: "definite", sentence: "I bought a book yesterday. ___ book was expensive.", answer: "the", rule: "Second mention: once the listener knows which one, switch from a to the." },
  { id: "d2", category: "definite", sentence: "___ sun rises in the east.", answer: "the", rule: "Unique objects — the sun, the moon, the sky, the equator — take the." },
  { id: "d3", category: "definite", sentence: "That is ___ best film I have seen this year.", answer: "the", rule: "Superlatives point to one thing only, so they take the." },
  { id: "d4", category: "definite", sentence: "He was ___ first person to arrive.", answer: "the", rule: "Ordinal numbers — first, second, last, next — take the." },
  { id: "d5", category: "definite", sentence: "She plays ___ violin beautifully.", answer: "the", rule: "Musical instruments take the after play: play the violin, play the piano." },
  { id: "d6", category: "definite", sentence: "___ Ganges flows through Varanasi.", answer: "the", rule: "Rivers, seas, oceans and canals take the." },
  { id: "d7", category: "definite", sentence: "They trekked in ___ Himalayas last summer.", answer: "the", rule: "Mountain ranges take the, although single peaks do not." },
  { id: "d8", category: "definite", sentence: "He works for ___ United Nations.", answer: "the", rule: "Organisation names that are plural or contain 'of' take the." },
  { id: "d9", category: "definite", sentence: "We visited ___ Netherlands last year.", answer: "the", rule: "Countries whose names are plural or contain a common noun take the: the Netherlands, the United Kingdom." },
  { id: "d10", category: "definite", sentence: "___ book on the table is mine.", answer: "the", rule: "A following phrase or clause identifies which one, so the noun takes the." },
  { id: "d11", category: "definite", sentence: "Could you pass ___ salt, please?", answer: "the", rule: "Things obvious from the shared situation take the, even on first mention." },
  { id: "d12", category: "definite", sentence: "She is ___ only person who knows the answer.", answer: "the", rule: "Only, same and very before a noun force the definite article." },
  { id: "d13", category: "definite", sentence: "___ rich should pay more tax than they do.", answer: "the", rule: "The + adjective names a whole group of people and takes a plural verb." },
  { id: "d14", category: "definite", sentence: "Her mother drove to ___ school to collect the forms.", answer: "the", rule: "When you mean the building rather than the activity, use the: go to the school, not go to school." },
  { id: "d15", category: "definite", sentence: "We sailed across ___ Atlantic.", answer: "the", rule: "Oceans and seas take the." },

  // Zero article
  { id: "z1", category: "zero", sentence: "___ cats sleep for most of the day.", answer: "none", rule: "Plural nouns used in a general sense take no article." },
  { id: "z2", category: "zero", sentence: "___ water boils at 100 degrees Celsius.", answer: "none", rule: "Uncountable nouns in a general sense take no article." },
  { id: "z3", category: "zero", sentence: "She speaks ___ Japanese fluently.", answer: "none", rule: "Names of languages take no article — unless you add 'language': the Japanese language." },
  { id: "z4", category: "zero", sentence: "We had ___ lunch at two o'clock.", answer: "none", rule: "Meals take no article: have breakfast, have lunch, have dinner." },
  { id: "z5", category: "zero", sentence: "He goes to ___ school by bus every morning.", answer: "none", rule: "Institutions used for their purpose take no article: go to school, go to church, go to prison." },
  { id: "z6", category: "zero", sentence: "They have lived in ___ India for ten years.", answer: "none", rule: "Most countries, cities and single mountains take no article." },
  { id: "z7", category: "zero", sentence: "I play ___ cricket on Sundays.", answer: "none", rule: "Sports and games take no article, unlike musical instruments." },
  { id: "z8", category: "zero", sentence: "She went to ___ bed early last night.", answer: "none", rule: "Go to bed, be in bed and at home are fixed phrases with no article." },
  { id: "z9", category: "zero", sentence: "We travelled by ___ train to Chennai.", answer: "none", rule: "By + means of transport takes no article: by train, by car, by air." },
  { id: "z10", category: "zero", sentence: "___ Everest is the highest mountain on earth.", answer: "none", rule: "Individual mountains take no article, even though ranges take the." },
  { id: "z11", category: "zero", sentence: "He studied ___ history at university.", answer: "none", rule: "School and university subjects take no article." },
  { id: "z12", category: "zero", sentence: "She was elected ___ president of the club.", answer: "none", rule: "A unique post after appoint, elect or become drops the article." },
  { id: "z13", category: "zero", sentence: "___ life is short.", answer: "none", rule: "Abstract uncountable nouns in a general sense take no article." },
];

export const MIN_QUESTIONS = 5;
export const MAX_QUESTIONS = DRILL_ITEMS.length;

/** Mulberry32 — deterministic 32-bit generator, so a seed reproduces a paper. */
export function makeRandom(seed) {
  let state = (Number.isFinite(seed) ? Math.floor(seed) : 1) >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle driven by a supplied generator. Does not mutate input. */
export function shuffle(list, random) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const temp = copy[index];
    copy[index] = copy[swap];
    copy[swap] = temp;
  }
  return copy;
}

/**
 * Pick a reproducible set of questions.
 * All four articles are always offered, so guessing is not narrowed by options.
 */
export function buildQuiz({ categories = CATEGORIES.map((c) => c.id), count = 10, seed = 1 } = {}) {
  if (!Array.isArray(categories) || categories.length === 0) {
    return { error: "Choose at least one category to practise." };
  }
  if (!Number.isFinite(count) || count < MIN_QUESTIONS) {
    return { error: `Ask for at least ${MIN_QUESTIONS} questions.` };
  }

  const pool = DRILL_ITEMS.filter((item) => categories.includes(item.category));
  if (pool.length === 0) return { error: "No questions match those categories." };

  const random = makeRandom(seed);
  const wanted = Math.min(Math.floor(count), pool.length);

  return {
    seed,
    requested: Math.floor(count),
    poolSize: pool.length,
    questions: shuffle(pool, random).slice(0, wanted),
  };
}

/** Exact match on the stored answer id. */
export function isCorrect(item, response) {
  if (!item || typeof response !== "string") return false;
  return response === item.answer;
}

/**
 * Fill the blank in a sentence with an article. For the zero article the blank
 * and its trailing space are removed, and the sentence is recapitalised if the
 * blank stood at the start.
 */
export function fillSentence(sentence, articleId) {
  if (typeof sentence !== "string") return "";
  if (articleId !== "none") {
    const filled = sentence.replace("___", ARTICLE_LABELS[articleId] || "___");
    if (sentence.startsWith("___") && filled.length > 0) {
      return filled[0].toUpperCase() + filled.slice(1);
    }
    return filled;
  }
  const stripped = sentence.replace("___ ", "");
  if (!sentence.startsWith("___") || stripped.length === 0) return stripped;
  return stripped[0].toUpperCase() + stripped.slice(1);
}

/**
 * Grade responses.
 *
 * @param {Array} questions questions as returned by buildQuiz
 * @param {object} responses map of question id to chosen article id
 */
export function gradeQuiz(questions, responses = {}) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return { error: "There are no questions to grade." };
  }

  const byCategory = {};
  const wrong = [];
  let correct = 0;
  let answered = 0;

  for (const question of questions) {
    const response = responses[question.id];
    const bucket = byCategory[question.category] || { correct: 0, total: 0 };
    bucket.total += 1;
    if (typeof response === "string" && response !== "") {
      answered += 1;
      if (isCorrect(question, response)) {
        correct += 1;
        bucket.correct += 1;
      } else {
        wrong.push({
          id: question.id,
          corrected: fillSentence(question.sentence, question.answer),
          chose: ARTICLE_LABELS[response] || response,
          answer: ARTICLE_LABELS[question.answer],
          rule: question.rule,
        });
      }
    }
    byCategory[question.category] = bucket;
  }

  const total = questions.length;
  return {
    total,
    answered,
    correct,
    incorrect: answered - correct,
    unanswered: total - answered,
    // Guarded: total comes from a non-empty array, so this never divides by zero.
    scorePct: Math.round((correct / total) * 1000) / 10,
    byCategory,
    wrong,
  };
}
