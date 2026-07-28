/**
 * English preposition drill: item bank, seeded question selection and grading.
 *
 * Every item states the rule that decides the answer, so a wrong choice
 * teaches the rule rather than just marking a cross. Question order comes from
 * a seeded generator rather than Math.random, so the same seed always produces
 * the same paper — the module stays pure and testable.
 */

export const CATEGORIES = [
  { id: "time", label: "Time — in, on, at, by, since, for" },
  { id: "place", label: "Place — in, on, at, under, between" },
  { id: "movement", label: "Movement — into, onto, across, along, through" },
  { id: "collocation", label: "Fixed pairs — good at, interested in, by bus" },
];

/** The core in/on/at contrasts, shown as a reference table. */
export const CORE_RULES = [
  { preposition: "at", time: "Clock times and points: at 7 o'clock, at noon, at night", place: "A specific point or venue: at the bus stop, at the door, at a concert" },
  { preposition: "on", time: "Days and dates: on Monday, on 12 March, on my birthday", place: "Surfaces, lines and floors: on the table, on the wall, on the third floor" },
  { preposition: "in", time: "Months, years, seasons, centuries, parts of the day: in July, in 1998, in the morning", place: "Enclosed spaces and areas: in the box, in the garden, in Mumbai" },
];

export const DRILL_ITEMS = [
  { id: "t1", category: "time", sentence: "The film starts ___ 7 o'clock.", options: ["at", "on", "in"], answer: "at", rule: "Use at with clock times and exact points in the day." },
  { id: "t2", category: "time", sentence: "My birthday is ___ 12 March.", options: ["at", "on", "in"], answer: "on", rule: "Use on with days and dates." },
  { id: "t3", category: "time", sentence: "It rains a lot ___ July.", options: ["at", "on", "in"], answer: "in", rule: "Use in with months, seasons and years — periods longer than a day." },
  { id: "t4", category: "time", sentence: "She was born ___ 1998.", options: ["at", "on", "in"], answer: "in", rule: "Use in with years." },
  { id: "t5", category: "time", sentence: "We usually go out ___ Saturday evening.", options: ["at", "on", "in"], answer: "on", rule: "A part of the day attached to a named day takes on, not in." },
  { id: "t6", category: "time", sentence: "I can't sleep ___ night.", options: ["at", "on", "in"], answer: "at", rule: "At night is fixed, even though other parts of the day take in." },
  { id: "t7", category: "time", sentence: "He'll be back ___ the morning.", options: ["at", "on", "in"], answer: "in", rule: "Use in with the morning, the afternoon and the evening." },
  { id: "t8", category: "time", sentence: "The shop closes ___ midnight.", options: ["at", "on", "in"], answer: "at", rule: "Midnight and noon are points on the clock, so they take at." },
  { id: "t9", category: "time", sentence: "The Berlin Wall came down ___ the twentieth century.", options: ["at", "on", "in"], answer: "in", rule: "Use in with centuries and decades." },
  { id: "t10", category: "time", sentence: "I'll send the report ___ Friday at the latest.", options: ["by", "since", "for"], answer: "by", rule: "By means not later than a deadline; until means continuing up to it." },
  { id: "t11", category: "time", sentence: "We have lived here ___ 2011.", options: ["by", "since", "for"], answer: "since", rule: "Since marks the point a period started; for marks its length." },
  { id: "t12", category: "time", sentence: "She studied ___ three hours without a break.", options: ["by", "since", "for"], answer: "for", rule: "For gives the length of a period: for three hours, for a week." },
  { id: "t13", category: "time", sentence: "I fell asleep ___ the film.", options: ["during", "since", "until"], answer: "during", rule: "During goes before a noun naming an event or period; while goes before a clause." },
  { id: "t14", category: "time", sentence: "Wait here ___ I get back.", options: ["by", "until", "for"], answer: "until", rule: "Until marks the end of a continuing situation." },

  { id: "p1", category: "place", sentence: "Meet me ___ the bus stop.", options: ["at", "on", "in"], answer: "at", rule: "Use at for a specific point rather than an area or a surface." },
  { id: "p2", category: "place", sentence: "The keys are ___ the table.", options: ["at", "on", "in"], answer: "on", rule: "Use on for contact with a surface." },
  { id: "p3", category: "place", sentence: "He lives ___ Mumbai.", options: ["at", "on", "in"], answer: "in", rule: "Use in with towns, cities, countries and other enclosed areas." },
  { id: "p4", category: "place", sentence: "There's a photograph ___ the wall.", options: ["at", "on", "in"], answer: "on", rule: "On also covers vertical surfaces when something is attached to them." },
  { id: "p5", category: "place", sentence: "She works ___ the third floor.", options: ["at", "on", "in"], answer: "on", rule: "Floors of a building take on." },
  { id: "p6", category: "place", sentence: "The milk is ___ the fridge.", options: ["at", "on", "in"], answer: "in", rule: "Use in for the inside of a container or enclosed space." },
  { id: "p7", category: "place", sentence: "They are waiting ___ the airport.", options: ["at", "on", "in"], answer: "at", rule: "A place named for its function takes at; in the airport would stress being inside the building." },
  { id: "p8", category: "place", sentence: "We were sitting ___ the front row.", options: ["at", "on", "in"], answer: "in", rule: "Rows and queues take in." },
  { id: "p9", category: "place", sentence: "The village is ___ the river.", options: ["at", "on", "in"], answer: "on", rule: "On marks position along a line such as a river, road or coast." },
  { id: "p10", category: "place", sentence: "Put your shoes ___ the bed, not on it.", options: ["under", "over", "between"], answer: "under", rule: "Under means lower than and usually covered; over means higher than, often with movement." },
  { id: "p11", category: "place", sentence: "The bank is ___ the post office and the café.", options: ["between", "among", "along"], answer: "between", rule: "Between is used with two separate things; among with an undivided group." },
  { id: "p12", category: "place", sentence: "She felt lost ___ a crowd of strangers.", options: ["between", "among", "across"], answer: "among", rule: "Among is used for being surrounded by a mass or group of more than two." },
  { id: "p13", category: "place", sentence: "He was standing ___ front of the door.", options: ["in", "on", "at"], answer: "in", rule: "In front of is a fixed phrase; on front of and at front of do not exist." },

  { id: "m1", category: "movement", sentence: "The train went ___ a long tunnel.", options: ["through", "across", "along"], answer: "through", rule: "Through means movement inside something with sides around you." },
  { id: "m2", category: "movement", sentence: "She swam ___ the river to the far bank.", options: ["through", "across", "along"], answer: "across", rule: "Across means from one side of a surface to the other." },
  { id: "m3", category: "movement", sentence: "He jumped ___ the pool.", options: ["into", "onto", "in"], answer: "into", rule: "Into shows movement to the inside of something; in shows position." },
  { id: "m4", category: "movement", sentence: "The cat climbed ___ the roof.", options: ["into", "onto", "in"], answer: "onto", rule: "Onto shows movement to a surface; on alone shows position on it." },
  { id: "m5", category: "movement", sentence: "We drove ___ London to Oxford.", options: ["from", "to", "at"], answer: "from", rule: "From marks the starting point of a journey and pairs with to for the destination." },
  { id: "m6", category: "movement", sentence: "They ran ___ the beach for two kilometres.", options: ["along", "across", "through"], answer: "along", rule: "Along means following the length of a line such as a road, river or beach." },
  { id: "m7", category: "movement", sentence: "The plane flew ___ the clouds.", options: ["above", "onto", "into"], answer: "above", rule: "Above means higher than something, with no contact and no movement implied." },
  { id: "m8", category: "movement", sentence: "She walked ___ the school but turned back halfway.", options: ["towards", "into", "onto"], answer: "towards", rule: "Towards gives the direction of movement without saying you arrived." },

  { id: "c1", category: "collocation", sentence: "The letter was written ___ hand.", options: ["by", "with", "in"], answer: "by", rule: "By names the method: by hand, by post, by email." },
  { id: "c2", category: "collocation", sentence: "I go to work ___ bus.", options: ["by", "on", "in"], answer: "by", rule: "By + transport takes no article: by bus, by train, by car — but on foot." },
  { id: "c3", category: "collocation", sentence: "This poem was written ___ Rabindranath Tagore.", options: ["by", "from", "of"], answer: "by", rule: "In the passive, by introduces the person who did the action." },
  { id: "c4", category: "collocation", sentence: "She is very good ___ mathematics.", options: ["at", "in", "on"], answer: "at", rule: "Good, bad, brilliant and hopeless all take at before a skill or subject." },
  { id: "c5", category: "collocation", sentence: "He has always been interested ___ history.", options: ["at", "in", "on"], answer: "in", rule: "Interested takes in; interesting takes to when a person is named." },
  { id: "c6", category: "collocation", sentence: "I'm worried ___ the exam next week.", options: ["about", "for", "of"], answer: "about", rule: "Worried, excited and concerned all take about before the thing causing the feeling." },
  { id: "c7", category: "collocation", sentence: "This box is full ___ old photographs.", options: ["of", "with", "from"], answer: "of", rule: "Full takes of; filled takes with." },
  { id: "c8", category: "collocation", sentence: "She apologised ___ being late.", options: ["for", "of", "about"], answer: "for", rule: "Apologise for the thing you did, and apologise to the person." },
];

export const MIN_QUESTIONS = 5;
export const MAX_QUESTIONS = DRILL_ITEMS.length;

/**
 * Mulberry32 — a small, fast, deterministic 32-bit generator. Given the same
 * seed it always yields the same sequence, which keeps question selection
 * reproducible and the module pure.
 */
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
 *
 * @param {object} input
 * @param {string[]} input.categories category ids to draw from
 * @param {number}   input.count      how many questions to return
 * @param {number}   input.seed       any integer; the same seed repeats the paper
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
  const picked = shuffle(pool, random).slice(0, wanted);

  return {
    seed,
    requested: Math.floor(count),
    poolSize: pool.length,
    // Options are shuffled too, so the right answer is not always in one place.
    questions: picked.map((item) => ({ ...item, options: shuffle(item.options, random) })),
  };
}

/** True only for an exact match, ignoring surrounding spaces and case. */
export function isCorrect(item, response) {
  if (!item || typeof response !== "string") return false;
  return response.trim().toLowerCase() === item.answer.toLowerCase();
}

/**
 * Grade a set of responses.
 *
 * @param {Array} questions questions as returned by buildQuiz
 * @param {object} responses map of question id to the chosen preposition
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
        wrong.push({ id: question.id, sentence: question.sentence, chose: response, answer: question.answer, rule: question.rule });
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
