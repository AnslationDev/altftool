/**
 * Subject-verb agreement drill: item bank, seeded selection and grading.
 *
 * Each item isolates one agreement rule and names it, so a wrong answer teaches
 * the pattern rather than the sentence. Question order comes from a seeded
 * generator instead of Math.random, keeping the module pure and reproducible.
 */

export const CATEGORIES = [
  { id: "intervening", label: "Words between subject and verb" },
  { id: "compound", label: "Subjects joined by and, or, nor" },
  { id: "pronoun", label: "Indefinite pronouns — each, either, none" },
  { id: "quantity", label: "Quantities, fractions and collective nouns" },
  { id: "special", label: "Nouns that only look plural, titles, there is/are" },
];

/** The rules the item bank is built from. */
export const CORE_RULES = [
  { id: "head", rule: "Agree with the head noun", detail: "Words between the subject and the verb never change its number: the box of chocolates is, not are." },
  { id: "and", rule: "and makes it plural", detail: "Unless the two nouns name a single thing — fish and chips is, but Tom and Jerry are." },
  { id: "proximity", rule: "or and nor take the nearer subject", detail: "Neither the manager nor the workers are; reverse the order and it becomes is." },
  { id: "indefinite", rule: "each, every, either, neither are singular", detail: "Each of the boys has a bat, even though boys is plural." },
  { id: "notional", rule: "some, none, all, most and fractions follow the noun", detail: "Most of the money has gone, but most of the coins have gone." },
  { id: "amount", rule: "an amount treated as one unit is singular", detail: "Ten miles is a long way; five years is a long time." },
];

export const DRILL_ITEMS = [
  // Words between the subject and the verb
  { id: "n1", category: "intervening", sentence: "The box of chocolates ___ on the table.", options: ["is", "are"], answer: "is", rule: "The subject is box. A prepositional phrase such as 'of chocolates' never changes the number of the verb." },
  { id: "n2", category: "intervening", sentence: "The list of items ___ been sent to you.", options: ["has", "have"], answer: "has", rule: "The head noun is list, which is singular; items belongs to the phrase, not the subject." },
  { id: "n3", category: "intervening", sentence: "One of my friends ___ a doctor.", options: ["is", "are"], answer: "is", rule: "One is the subject; 'of my friends' only tells you which group it comes from." },
  { id: "n4", category: "intervening", sentence: "The quality of the answers ___ improved this term.", options: ["has", "have"], answer: "has", rule: "Quality is the subject and is singular, however plural the following phrase looks." },
  { id: "n5", category: "intervening", sentence: "The teacher, along with her students, ___ leaving on Friday.", options: ["is", "are"], answer: "is", rule: "Along with, as well as and together with add information; they do not create a compound subject." },
  { id: "n6", category: "intervening", sentence: "Rakesh, as well as his brothers, ___ coming to the wedding.", options: ["is", "are"], answer: "is", rule: "The subject stays Rakesh; only 'and' would make it plural." },
  { id: "n7", category: "intervening", sentence: "The results of the survey ___ surprising.", options: ["was", "were"], answer: "were", rule: "Here the head noun is results, which is plural, so the verb is plural too." },

  // Compound subjects
  { id: "c1", category: "compound", sentence: "Tom and Jerry ___ always fighting.", options: ["is", "are"], answer: "are", rule: "Two separate subjects joined by and take a plural verb." },
  { id: "c2", category: "compound", sentence: "Fish and chips ___ sold at the corner shop.", options: ["is", "are"], answer: "is", rule: "When two nouns joined by and name one single thing, the verb is singular." },
  { id: "c3", category: "compound", sentence: "Neither the manager nor the workers ___ satisfied.", options: ["is", "are"], answer: "are", rule: "With or and nor the verb agrees with the subject nearer to it — here, workers." },
  { id: "c4", category: "compound", sentence: "Neither the workers nor the manager ___ satisfied.", options: ["is", "are"], answer: "is", rule: "Same rule, reversed order: the nearer subject is manager, so the verb is singular." },
  { id: "c5", category: "compound", sentence: "Either my sister or my parents ___ going to call you.", options: ["is", "are"], answer: "are", rule: "Either... or follows the proximity rule; parents sits closer to the verb." },
  { id: "c6", category: "compound", sentence: "Every boy and girl ___ been given a book.", options: ["has", "have"], answer: "has", rule: "Every or each in front of a compound subject makes the whole subject singular." },
  { id: "c7", category: "compound", sentence: "Each student and teacher ___ a copy of the timetable.", options: ["receives", "receive"], answer: "receives", rule: "Each distributes the subject one at a time, so the verb stays singular." },
  { id: "c8", category: "compound", sentence: "The secretary and treasurer ___ signed the letter.", options: ["has", "have"], answer: "has", rule: "One article for two roles means one person holds both, so the verb is singular." },

  // Indefinite pronouns
  { id: "p1", category: "pronoun", sentence: "Each of the boys ___ a bat.", options: ["has", "have"], answer: "has", rule: "Each is always singular, whatever plural noun follows it." },
  { id: "p2", category: "pronoun", sentence: "Everyone in the class ___ passed the test.", options: ["has", "have"], answer: "has", rule: "Everyone, everybody, someone and nobody are singular." },
  { id: "p3", category: "pronoun", sentence: "Neither of the answers ___ correct.", options: ["is", "are"], answer: "is", rule: "Neither means 'not one of the two' and takes a singular verb." },
  { id: "p4", category: "pronoun", sentence: "Either of the routes ___ acceptable.", options: ["is", "are"], answer: "is", rule: "Either means 'one of the two' and is singular." },
  { id: "p5", category: "pronoun", sentence: "Somebody ___ left the door open.", options: ["has", "have"], answer: "has", rule: "Pronouns ending in -body and -one are singular." },
  { id: "p6", category: "pronoun", sentence: "Few of the players ___ fully fit.", options: ["is", "are"], answer: "are", rule: "Few, many, several and both are always plural." },
  { id: "p7", category: "pronoun", sentence: "Several of the books ___ missing from the shelf.", options: ["is", "are"], answer: "are", rule: "Several is plural regardless of what follows it." },
  { id: "p8", category: "pronoun", sentence: "Both of the cars ___ been sold.", options: ["has", "have"], answer: "have", rule: "Both refers to two things and takes a plural verb." },
  { id: "p9", category: "pronoun", sentence: "None of the milk ___ left.", options: ["is", "are"], answer: "is", rule: "None takes its number from the noun after it; milk is uncountable, so the verb is singular." },
  { id: "p10", category: "pronoun", sentence: "None of the students ___ arrived yet.", options: ["has", "have"], answer: "have", rule: "The same rule with a plural noun: none of the students have." },

  // Quantities, fractions and collective nouns
  { id: "q1", category: "quantity", sentence: "The number of applicants ___ risen sharply.", options: ["has", "have"], answer: "has", rule: "The number of is always singular — the subject is the number itself." },
  { id: "q2", category: "quantity", sentence: "A number of applicants ___ withdrawn.", options: ["has", "have"], answer: "have", rule: "A number of means 'several' and is always plural. Contrast it with 'the number of'." },
  { id: "q3", category: "quantity", sentence: "Two-thirds of the cake ___ gone.", options: ["is", "are"], answer: "is", rule: "A fraction takes its number from the noun that follows: cake is uncountable here." },
  { id: "q4", category: "quantity", sentence: "Two-thirds of the students ___ absent.", options: ["is", "are"], answer: "are", rule: "Same fraction, plural noun, so the verb becomes plural." },
  { id: "q5", category: "quantity", sentence: "Most of the money ___ been spent.", options: ["has", "have"], answer: "has", rule: "Most, some and all follow the noun; money is uncountable." },
  { id: "q6", category: "quantity", sentence: "Most of the coins ___ been found.", options: ["has", "have"], answer: "have", rule: "The same word takes a plural verb before a plural noun." },
  { id: "q7", category: "quantity", sentence: "The crowd ___ enormous.", options: ["was", "were"], answer: "was", rule: "A collective noun describing the group as one thing takes a singular verb." },
  { id: "q8", category: "quantity", sentence: "The committee ___ reached a unanimous decision.", options: ["has", "have"], answer: "has", rule: "Acting as one body, a committee takes a singular verb. British English allows a plural verb when the members act individually." },
  { id: "q9", category: "quantity", sentence: "Ten miles ___ a long way to walk in one day.", options: ["is", "are"], answer: "is", rule: "A distance, sum or period treated as one unit takes a singular verb." },
  { id: "q10", category: "quantity", sentence: "Five years ___ a long time to wait.", options: ["is", "are"], answer: "is", rule: "The five years are being treated as a single stretch of time." },
  { id: "q11", category: "quantity", sentence: "Twenty rupees ___ not enough for the fare.", options: ["is", "are"], answer: "is", rule: "A sum of money is a single amount, so the verb is singular." },

  // Nouns that only look plural, titles, there is/are
  { id: "s1", category: "special", sentence: "The news ___ good this morning.", options: ["is", "are"], answer: "is", rule: "News ends in -s but is uncountable and singular." },
  { id: "s2", category: "special", sentence: "Mathematics ___ my favourite subject.", options: ["is", "are"], answer: "is", rule: "Subject names ending in -ics — mathematics, physics, economics — are singular." },
  { id: "s3", category: "special", sentence: "Physics ___ taught in the science block.", options: ["is", "are"], answer: "is", rule: "Physics names one field of study, so it takes a singular verb." },
  { id: "s4", category: "special", sentence: "These scissors ___ blunt.", options: ["is", "are"], answer: "are", rule: "Tools and garments made of two joined parts — scissors, trousers, glasses — are plural." },
  { id: "s5", category: "special", sentence: "My trousers ___ too long.", options: ["is", "are"], answer: "are", rule: "Trousers, jeans and pyjamas take plural verbs." },
  { id: "s6", category: "special", sentence: "A pair of scissors ___ on the desk.", options: ["is", "are"], answer: "is", rule: "Adding 'a pair of' makes the subject singular: the pair is the head noun." },
  { id: "s7", category: "special", sentence: "The United States ___ a federal republic.", options: ["is", "are"], answer: "is", rule: "A country name is singular even when it ends in -s." },
  { id: "s8", category: "special", sentence: "Great Expectations ___ written by Charles Dickens.", options: ["was", "were"], answer: "was", rule: "The title of a single work takes a singular verb, however plural it sounds." },
  { id: "s9", category: "special", sentence: "There ___ three reasons for the delay.", options: ["is", "are"], answer: "are", rule: "With there is/there are the verb agrees with the subject that follows it." },
  { id: "s10", category: "special", sentence: "There ___ a book and two pens on the table.", options: ["is", "are"], answer: "is", rule: "In a list after there, the verb agrees with the first item — here, a book." },
  { id: "s11", category: "special", sentence: "She is one of those people who ___ always early.", options: ["is", "are"], answer: "are", rule: "Who refers back to people, not to one, so the verb is plural." },
  { id: "s12", category: "special", sentence: "He is the only one of the students who ___ passed.", options: ["has", "have"], answer: "has", rule: "'The only one' pins who to a single person, so the verb turns singular." },
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

/** Pick a reproducible set of questions, with the two verb forms shuffled. */
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
    questions: picked.map((item) => ({ ...item, options: shuffle(item.options, random) })),
  };
}

/** Exact match, ignoring case and surrounding spaces. */
export function isCorrect(item, response) {
  if (!item || typeof response !== "string") return false;
  return response.trim().toLowerCase() === item.answer.toLowerCase();
}

/** Write the sentence out with the correct verb in place. */
export function fillSentence(sentence, verb) {
  if (typeof sentence !== "string") return "";
  return sentence.replace("___", verb);
}

/**
 * Grade responses.
 *
 * @param {Array} questions questions as returned by buildQuiz
 * @param {object} responses map of question id to chosen verb form
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
          chose: response,
          answer: question.answer,
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
