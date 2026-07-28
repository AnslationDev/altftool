/**
 * Punctuation Practice Drill — question bank and grading logic.
 *
 * Every item states a single, checkable punctuation rule drawn from standard
 * English usage guides (comma splices, the pair rule for non-restrictive
 * clauses, apostrophe possessives, the "colon follows a complete clause" rule,
 * and so on). No item depends on a house style that differs between British
 * and American English unless the option text says which style is shown.
 *
 * Pure module: no React, no DOM, no Date.now().
 */

/** Default number of questions in one round. */
export const DEFAULT_DRILL_LENGTH = 10;

/** Hard cap so a round can never be longer than the bank. */
export const MAX_DRILL_LENGTH = 25;

/** Score thresholds, in percent, used to label a finished round. */
export const SCORE_BANDS = [
  { min: 90, band: "Excellent", message: "Near-perfect control of the marks tested." },
  { min: 75, band: "Strong", message: "Solid. Review the rules you missed and try a longer round." },
  { min: 50, band: "Developing", message: "The basics are there. Drill one topic at a time." },
  { min: 0, band: "Needs practice", message: "Work through a single topic and read each rule before moving on." },
];

export const TOPICS = [
  { id: "all", label: "All topics" },
  { id: "comma", label: "Commas" },
  { id: "semicolon", label: "Semicolons" },
  { id: "apostrophe", label: "Apostrophes" },
  { id: "colon", label: "Colons" },
  { id: "quotation", label: "Quotation marks" },
  { id: "endmark", label: "End marks & run-ons" },
  { id: "dash", label: "Hyphens & dashes" },
];

const DEFAULT_PROMPT = "Which version is punctuated correctly?";

export const QUESTIONS = [
  {
    id: "comma-1",
    topic: "comma",
    prompt: DEFAULT_PROMPT,
    options: [
      "She finished the report, and she emailed it to the client.",
      "She finished the report and, she emailed it to the client.",
      "She finished the report, and, she emailed it to the client.",
      "She finished the report and she, emailed it to the client.",
    ],
    answerIndex: 0,
    rule: "Use a comma before a coordinating conjunction (and, but, or, so, for, nor, yet) that joins two independent clauses. The comma goes before the conjunction, never after it.",
  },
  {
    id: "comma-2",
    topic: "comma",
    prompt: DEFAULT_PROMPT,
    options: [
      "After the meeting ended we went for lunch.",
      "After the meeting ended, we went for lunch.",
      "After, the meeting ended we went for lunch.",
      "After the meeting, ended we went for lunch.",
    ],
    answerIndex: 1,
    rule: "An introductory clause or phrase placed before the main clause is followed by a comma. The comma marks where the introduction stops and the main statement begins.",
  },
  {
    id: "comma-3",
    topic: "comma",
    prompt: DEFAULT_PROMPT,
    options: [
      "My brother, who lives in Pune works at a bank.",
      "My brother who lives in Pune, works at a bank.",
      "My brother, who lives in Pune, works at a bank.",
      "My brother who, lives in Pune, works at a bank.",
    ],
    answerIndex: 2,
    rule: "A non-restrictive clause — extra information the sentence would survive without — is fenced by a pair of commas, one at each end. Dropping either comma is an error.",
  },
  {
    id: "comma-4",
    topic: "comma",
    prompt: "One of these is a comma splice. Which sentence fixes it?",
    options: [
      "It rained all night, the match was cancelled.",
      "It rained all night; the match was cancelled.",
      "It rained all night the match was cancelled.",
      "It rained, all night the match was cancelled.",
    ],
    answerIndex: 1,
    rule: "Two independent clauses cannot be joined by a comma alone — that is a comma splice. Repair it with a semicolon, a full stop, or a comma plus a coordinating conjunction.",
  },
  {
    id: "comma-5",
    topic: "comma",
    prompt: DEFAULT_PROMPT,
    options: [
      "Thanks Priya, for sending the file.",
      "Thanks Priya for, sending the file.",
      "Thanks, Priya, for sending the file.",
      "Thanks, Priya for sending the file.",
    ],
    answerIndex: 2,
    rule: "A name used in direct address is set off by commas on both sides when it sits inside the sentence: Thanks, Priya, for sending the file.",
  },
  {
    id: "semicolon-1",
    topic: "semicolon",
    prompt: DEFAULT_PROMPT,
    options: [
      "The train was late; we missed the connection.",
      "The train was late; and we missed the connection.",
      "The train was late; because we missed the connection.",
      "The train was late; missing the connection.",
    ],
    answerIndex: 0,
    rule: "A semicolon joins two independent clauses that could each stand alone as a sentence. Do not follow it with a coordinating conjunction or a fragment.",
  },
  {
    id: "semicolon-2",
    topic: "semicolon",
    prompt: DEFAULT_PROMPT,
    options: [
      "The offer was generous, however, we declined it.",
      "The offer was generous; however, we declined it.",
      "The offer was generous however; we declined it.",
      "The offer was generous, however we declined it.",
    ],
    answerIndex: 1,
    rule: "When a conjunctive adverb such as however, therefore or moreover links two independent clauses, put a semicolon before it and a comma after it.",
  },
  {
    id: "semicolon-3",
    topic: "semicolon",
    prompt: DEFAULT_PROMPT,
    options: [
      "The panel included Rao, a chemist, Iyer, a physicist, and Bose, a statistician.",
      "The panel included Rao, a chemist; Iyer, a physicist; and Bose, a statistician.",
      "The panel included Rao; a chemist, Iyer; a physicist, and Bose; a statistician.",
      "The panel included; Rao a chemist, Iyer a physicist, and Bose a statistician.",
    ],
    answerIndex: 1,
    rule: "Semicolons act as super-commas: when list items already contain commas, separate the items with semicolons so the reader can see where each one ends.",
  },
  {
    id: "semicolon-4",
    topic: "semicolon",
    prompt: DEFAULT_PROMPT,
    options: [
      "We cancelled the trip; because the roads were flooded.",
      "We cancelled the trip because the roads were flooded.",
      "We cancelled the trip, because; the roads were flooded.",
      "We cancelled; the trip because the roads were flooded.",
    ],
    answerIndex: 1,
    rule: "A semicolon cannot introduce a dependent clause. 'Because the roads were flooded' cannot stand alone, so it attaches directly with no mark before it.",
  },
  {
    id: "apostrophe-1",
    topic: "apostrophe",
    prompt: DEFAULT_PROMPT,
    options: [
      "The company announced it's results; its share price rose.",
      "The company announced its results; its share price rose.",
      "The company announced its' results; it's share price rose.",
      "The company announced it's results; it's share price rose.",
    ],
    answerIndex: 1,
    rule: "'It's' is only ever the contraction of 'it is' or 'it has'. The possessive is 'its', with no apostrophe — the form 'its'' does not exist.",
  },
  {
    id: "apostrophe-2",
    topic: "apostrophe",
    prompt: "Several teachers share one lounge. Which form is correct?",
    options: [
      "the teachers lounge",
      "the teacher's lounge",
      "the teachers' lounge",
      "the teachers's lounge",
    ],
    answerIndex: 2,
    rule: "A regular plural noun already ending in -s takes only an apostrophe after the s: teachers' lounge. 'Teacher's lounge' would mean a lounge belonging to one teacher.",
  },
  {
    id: "apostrophe-3",
    topic: "apostrophe",
    prompt: "The rights belong to more than one child. Which form is correct?",
    options: [
      "childrens' rights",
      "children's rights",
      "childrens rights",
      "children rights'",
    ],
    answerIndex: 1,
    rule: "An irregular plural that does not end in -s — children, women, men, people — takes apostrophe + s: children's rights, women's team.",
  },
  {
    id: "apostrophe-4",
    topic: "apostrophe",
    prompt: DEFAULT_PROMPT,
    options: [
      "The 1990's were a decade of reform.",
      "The 1990s' were a decade of reform.",
      "The 1990s were a decade of reform.",
      "The 1990s's were a decade of reform.",
    ],
    answerIndex: 2,
    rule: "An apostrophe never forms a plural. Decades are written 1990s, and plural abbreviations follow the same rule: DVDs, MPs, NGOs.",
  },
  {
    id: "apostrophe-5",
    topic: "apostrophe",
    prompt: DEFAULT_PROMPT,
    options: [
      "Who's bag is this, and whose coming with us?",
      "Whose bag is this, and who's coming with us?",
      "Who's bag is this, and who's coming with us?",
      "Whose bag is this, and whose coming with us?",
    ],
    answerIndex: 1,
    rule: "'Who's' means 'who is' or 'who has'; 'whose' is the possessive. Read the sentence with 'who is' substituted — if it still works, you need who's.",
  },
  {
    id: "colon-1",
    topic: "colon",
    prompt: DEFAULT_PROMPT,
    options: [
      "The kit contains: a torch, a rope and a whistle.",
      "The kit contains three items: a torch, a rope and a whistle.",
      "The kit contains three items ; a torch, a rope and a whistle.",
      "The kit contains three items : a torch, a rope and a whistle.",
    ],
    answerIndex: 1,
    rule: "A colon follows a complete independent clause. Do not place one straight after a verb, and leave no space before the mark.",
  },
  {
    id: "colon-2",
    topic: "colon",
    prompt: DEFAULT_PROMPT,
    options: [
      "Bring the following; a pen, an ID card and a photocopy.",
      "Bring the following, a pen, an ID card and a photocopy.",
      "Bring the following: a pen, an ID card and a photocopy.",
      "Bring: the following a pen, an ID card and a photocopy.",
    ],
    answerIndex: 2,
    rule: "Use a colon — not a semicolon — to introduce a list after an announcing clause such as 'Bring the following' or 'as follows'.",
  },
  {
    id: "colon-3",
    topic: "colon",
    prompt: DEFAULT_PROMPT,
    options: [
      "My favourite cities are: Kochi, Pune and Shillong.",
      "My favourite cities are Kochi, Pune and Shillong.",
      "My favourite cities are; Kochi, Pune and Shillong.",
      "My favourite cities: are Kochi, Pune and Shillong.",
    ],
    answerIndex: 1,
    rule: "Never place a colon between a linking verb and its complement. 'My favourite cities are' is not a complete clause, so the list follows with no mark at all.",
  },
  {
    id: "quotation-1",
    topic: "quotation",
    prompt: DEFAULT_PROMPT,
    options: [
      "She asked, “Have you sent the invoice?”",
      "She asked “Have you sent the invoice?”.",
      "She asked, “Have you sent the invoice”?",
      "She asked, “have you sent the invoice?”",
    ],
    answerIndex: 0,
    rule: "Introduce a direct quotation with a comma, begin the quoted sentence with a capital letter, and keep the question mark inside the quotation marks when the quoted words are the question. No extra full stop follows the closing mark.",
  },
  {
    id: "quotation-2",
    topic: "quotation",
    prompt: DEFAULT_PROMPT,
    options: [
      "She said that, “the deadline was final”.",
      "She said, that the deadline was final.",
      "She said that the deadline was final.",
      "She said that “the deadline was final,”.",
    ],
    answerIndex: 2,
    rule: "Indirect (reported) speech takes no quotation marks and no comma after 'that'. Quotation marks belong only around a speaker's exact words.",
  },
  {
    id: "endmark-1",
    topic: "endmark",
    prompt: DEFAULT_PROMPT,
    options: [
      "He asked whether the office would be open on Monday?",
      "He asked whether the office would be open on Monday.",
      "He asked, whether the office would be open on Monday?",
      "He asked whether the office would be open on Monday!",
    ],
    answerIndex: 1,
    rule: "An indirect question reports a question but is itself a statement, so it ends with a full stop rather than a question mark.",
  },
  {
    id: "endmark-2",
    topic: "endmark",
    prompt: "One of these is a run-on sentence. Which version fixes it?",
    options: [
      "The power went out we finished the work by torchlight.",
      "The power went out, we finished the work by torchlight.",
      "The power went out, so we finished the work by torchlight.",
      "The power went out so, we finished the work by torchlight.",
    ],
    answerIndex: 2,
    rule: "Two independent clauses run together with no punctuation form a run-on; joined by only a comma they form a comma splice. Use a comma plus a coordinating conjunction, a semicolon, or a full stop.",
  },
  {
    id: "endmark-3",
    topic: "endmark",
    prompt: DEFAULT_PROMPT,
    options: [
      "The parcel arrived at 9 p.m..",
      "The parcel arrived at 9 p.m.",
      "The parcel arrived at 9 p.m .",
      "The parcel arrived at 9 p.m,.",
    ],
    answerIndex: 1,
    rule: "When a sentence ends with an abbreviation that already carries a full stop, the abbreviation's stop also ends the sentence. Never write two stops in a row.",
  },
  {
    id: "endmark-4",
    topic: "endmark",
    prompt: DEFAULT_PROMPT,
    options: [
      "Are you coming ? I need to know .",
      "Are you coming?I need to know.",
      "Are you coming ?I need to know.",
      "Are you coming? I need to know.",
    ],
    answerIndex: 3,
    rule: "In English typesetting no space goes before a full stop, comma, question mark or exclamation mark, and exactly one space follows it. (French spacing differs; English does not.)",
  },
  {
    id: "dash-1",
    topic: "dash",
    prompt: DEFAULT_PROMPT,
    options: [
      "She is a well known author.",
      "She is a well-known author.",
      "She is a well-known-author.",
      "She is a wellknown author.",
    ],
    answerIndex: 1,
    rule: "Hyphenate a compound modifier that sits before the noun it modifies: a well-known author. After the noun the hyphen drops: the author is well known.",
  },
  {
    id: "dash-2",
    topic: "dash",
    prompt: DEFAULT_PROMPT,
    options: [
      "The proposal — which no one had read — was approved.",
      "The proposal — which no one had read was approved.",
      "The proposal, which no one had read — was approved.",
      "The proposal —which no one had read, — was approved.",
    ],
    answerIndex: 0,
    rule: "Dashes used as parenthetical marks come in pairs — one before the interruption and one after — exactly like a pair of commas or brackets.",
  },
];

/** Deterministic 32-bit PRNG (Mulberry32). Same seed, same sequence, always. */
function mulberry32(seedValue) {
  let a = seedValue >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates using a supplied PRNG. Returns a new array. */
function shuffle(list, rand) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const swap = out[i];
    out[i] = out[j];
    out[j] = swap;
  }
  return out;
}

function normaliseSeed(seed) {
  const value = Number(seed);
  if (!Number.isFinite(value)) return 1;
  return Math.abs(Math.trunc(value)) % 4294967296 || 1;
}

/** Questions belonging to a topic id, or the whole bank for "all". */
export function questionsForTopic(topicId) {
  if (topicId === "all" || !topicId) return QUESTIONS.slice();
  return QUESTIONS.filter((question) => question.topic === topicId);
}

/**
 * Build one deterministic round.
 * Both the question order and the option order are shuffled from the seed,
 * and answerIndex is remapped so the correct option travels with it.
 */
export function buildDrill({ topic = "all", count = DEFAULT_DRILL_LENGTH, seed = 1 } = {}) {
  const known = TOPICS.some((entry) => entry.id === topic);
  if (!known) return { error: "Choose one of the listed punctuation topics." };

  const pool = questionsForTopic(topic);
  if (pool.length === 0) return { error: "No questions are available for that topic yet." };

  const requested = Number(count);
  if (!Number.isFinite(requested) || requested < 1) {
    return { error: "Ask for at least one question." };
  }
  if (requested > MAX_DRILL_LENGTH) {
    return { error: `The bank holds ${MAX_DRILL_LENGTH} questions, so a round cannot be longer than that.` };
  }

  const size = Math.min(Math.floor(requested), pool.length);
  const rand = mulberry32(normaliseSeed(seed));
  const ordered = shuffle(pool, rand).slice(0, size);

  const questions = ordered.map((question) => {
    const paired = question.options.map((text, index) => ({ text, correct: index === question.answerIndex }));
    const mixed = shuffle(paired, rand);
    return {
      id: question.id,
      topic: question.topic,
      prompt: question.prompt,
      rule: question.rule,
      options: mixed.map((option) => option.text),
      answerIndex: mixed.findIndex((option) => option.correct),
    };
  });

  return { questions, total: questions.length, topic, requested: size };
}

/** Grade a single response against a question produced by buildDrill. */
export function gradeAnswer(question, choiceIndex) {
  if (!question || !Array.isArray(question.options)) {
    return { error: "That question could not be read." };
  }
  const choice = Number(choiceIndex);
  if (!Number.isInteger(choice) || choice < 0 || choice >= question.options.length) {
    return { error: "Pick one of the options before checking." };
  }
  const isCorrect = choice === question.answerIndex;
  return {
    isCorrect,
    chosen: question.options[choice],
    answer: question.options[question.answerIndex],
    rule: question.rule,
  };
}

/** Percent complete for a progress bar. Never divides by zero. */
export function drillProgress({ answered = 0, total = 0 } = {}) {
  const done = Number(answered);
  const all = Number(total);
  if (!Number.isFinite(done) || !Number.isFinite(all) || all <= 0) {
    return { percent: 0, label: "0 of 0" };
  }
  const clamped = Math.max(0, Math.min(done, all));
  return {
    percent: Math.round((clamped / all) * 100),
    label: `${clamped} of ${all}`,
  };
}

/** Turn a raw score into a percentage and a band label. */
export function summarizeScore({ correct = 0, total = 0 } = {}) {
  const right = Number(correct);
  const all = Number(total);
  if (!Number.isFinite(right) || !Number.isFinite(all)) {
    return { error: "Scores must be numbers." };
  }
  if (all <= 0) return { error: "Answer at least one question to see a score." };
  if (right < 0 || right > all) {
    return { error: "The number correct cannot be negative or larger than the number attempted." };
  }
  const percent = Math.round((right / all) * 100);
  const found = SCORE_BANDS.find((entry) => percent >= entry.min) || SCORE_BANDS[SCORE_BANDS.length - 1];
  return {
    correct: right,
    total: all,
    incorrect: all - right,
    percent,
    band: found.band,
    message: found.message,
  };
}

/** Count how many of a round's questions came from each topic. */
export function topicBreakdown(questions) {
  if (!Array.isArray(questions) || questions.length === 0) return [];
  const counts = new Map();
  questions.forEach((question) => {
    counts.set(question.topic, (counts.get(question.topic) || 0) + 1);
  });
  return TOPICS.filter((entry) => entry.id !== "all" && counts.has(entry.id)).map((entry) => ({
    id: entry.id,
    label: entry.label,
    count: counts.get(entry.id),
  }));
}
