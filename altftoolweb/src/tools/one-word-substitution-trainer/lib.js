/**
 * One Word Substitution Trainer — data, deterministic round builder, grading.
 *
 * A one-word substitution replaces a descriptive phrase with the single word
 * that carries the same meaning ("one who collects coins" → numismatist).
 * The items below are the pattern families that repeat in SSC, banking, railway
 * and state public-service papers: agent nouns, places, forms of government,
 * spans of time, the in-/il-/im- negatives, and the -phobia set.
 *
 * Multiple-choice distractors are drawn from the same family wherever possible,
 * because that is how real papers set them — a wrong option from a different
 * family is too easy to eliminate.
 */

export const CATEGORIES = [
  { id: "people", label: "People & pursuits" },
  { id: "places", label: "Places & buildings" },
  { id: "government", label: "Forms of government" },
  { id: "time", label: "Periods & anniversaries" },
  { id: "negatives", label: "That which cannot be…" },
  { id: "speech", label: "Words, speech & writing" },
  { id: "animals", label: "Animals & feeding" },
  { id: "fears", label: "Fears & phobias" },
];

export const ITEMS = [
  // People & pursuits
  { id: "etymologist", definition: "One who studies the origin and history of words", word: "Etymologist", category: "people", note: "From Greek etymon, 'true sense of a word'. Not to be confused with entomologist, who studies insects." },
  { id: "philatelist", definition: "One who collects postage stamps", word: "Philatelist", category: "people", note: "Greek philos, loving, plus ateleia, exemption from tax — a stamp marked the postage as prepaid." },
  { id: "numismatist", definition: "One who collects or studies coins", word: "Numismatist", category: "people", note: "From Latin numisma, coin." },
  { id: "graphologist", definition: "One who studies handwriting", word: "Graphologist", category: "people", note: "Greek graphe, writing. A calligrapher writes beautifully; a graphologist analyses writing." },
  { id: "lexicographer", definition: "One who compiles a dictionary", word: "Lexicographer", category: "people", note: "Greek lexikon, of words. Samuel Johnson famously defined it as 'a harmless drudge'." },
  { id: "philanthropist", definition: "One who loves and works for the welfare of mankind", word: "Philanthropist", category: "people", note: "Opposite of misanthrope." },
  { id: "misanthrope", definition: "One who hates mankind", word: "Misanthrope", category: "people", note: "Greek misein, to hate, plus anthropos, man." },
  { id: "atheist", definition: "One who does not believe in the existence of God", word: "Atheist", category: "people", note: "An agnostic, by contrast, holds that the question cannot be settled." },
  { id: "somnambulist", definition: "One who walks in his sleep", word: "Somnambulist", category: "people", note: "Latin somnus, sleep, plus ambulare, to walk." },
  { id: "somniloquist", definition: "One who talks in his sleep", word: "Somniloquist", category: "people", note: "Latin loqui, to speak — the same root as loquacious and eloquent." },
  { id: "teetotaller", definition: "One who abstains completely from alcoholic drinks", word: "Teetotaller", category: "people", note: "19th-century temperance coinage; the 'tee' is emphatic repetition of the T in total." },
  { id: "polyglot", definition: "One who speaks many languages", word: "Polyglot", category: "people", note: "Greek poly, many, plus glotta, tongue." },
  { id: "novice", definition: "One who is new to a trade or profession", word: "Novice", category: "people", note: "Latin novus, new. A tyro is a close synonym." },
  { id: "epicure", definition: "One devoted to the refined pleasures of food and drink", word: "Epicure", category: "people", note: "From the philosopher Epicurus, whose actual teaching was far more restrained than the word suggests." },
  { id: "glutton", definition: "One who eats too much", word: "Glutton", category: "people", note: "Distinguish from epicure, who values quality rather than quantity." },
  { id: "insolvent", definition: "One who is declared unable to pay his debts", word: "Insolvent", category: "people", note: "A legal status, unlike 'pauper', which merely describes poverty." },
  { id: "loquacious", definition: "One who talks a great deal", word: "Loquacious", category: "people", note: "Opposite of reticent." },
  { id: "reticent", definition: "One who speaks very little", word: "Reticent", category: "people", note: "Reticent means unwilling to speak; reluctant means unwilling in general." },
  { id: "omniscient", definition: "One who knows everything", word: "Omniscient", category: "people", note: "Latin omnis, all, plus scire, to know." },
  { id: "omnipotent", definition: "One who has unlimited power", word: "Omnipotent", category: "people", note: "Latin potens, powerful." },
  { id: "omnipresent", definition: "One who is present everywhere at the same time", word: "Omnipresent", category: "people", note: "Also written ubiquitous when used of things rather than a deity." },
  { id: "connoisseur", definition: "One who is an expert judge in matters of taste and art", word: "Connoisseur", category: "people", note: "From French connaître, to know." },

  // Places & buildings
  { id: "apiary", definition: "A place where bees are kept", word: "Apiary", category: "places", note: "Latin apis, bee." },
  { id: "aviary", definition: "A large enclosure where birds are kept", word: "Aviary", category: "places", note: "Latin avis, bird — the same root as aviation." },
  { id: "aquarium", definition: "A tank or building where fish are kept", word: "Aquarium", category: "places", note: "Latin aqua, water." },
  { id: "mint", definition: "A place where money is coined", word: "Mint", category: "places", note: "From Latin moneta, the Roman temple where coins were struck." },
  { id: "granary", definition: "A place where grain is stored", word: "Granary", category: "places", note: "Latin granum, grain." },
  { id: "arsenal", definition: "A place where weapons and ammunition are stored", word: "Arsenal", category: "places", note: "An armoury is the same idea; arsenal can also mean the manufacturing establishment." },
  { id: "orphanage", definition: "A home for children without parents", word: "Orphanage", category: "places", note: "Compare asylum, which historically meant a refuge of any kind." },
  { id: "sanatorium", definition: "A place where people recover from long illness", word: "Sanatorium", category: "places", note: "Latin sanare, to heal." },
  { id: "dormitory", definition: "A building where students sleep", word: "Dormitory", category: "places", note: "Latin dormire, to sleep." },
  { id: "archives", definition: "A place where public records are kept", word: "Archives", category: "places", note: "Greek archeion, the residence of a magistrate where records were held." },

  // Forms of government
  { id: "democracy", definition: "Government by the people", word: "Democracy", category: "government", note: "Greek demos, people, plus kratos, rule." },
  { id: "autocracy", definition: "Government by one person with absolute power", word: "Autocracy", category: "government", note: "Greek autos, self." },
  { id: "bureaucracy", definition: "Government by officials", word: "Bureaucracy", category: "government", note: "From French bureau, a desk." },
  { id: "plutocracy", definition: "Government by the wealthy", word: "Plutocracy", category: "government", note: "Greek ploutos, wealth." },
  { id: "aristocracy", definition: "Government by the nobility", word: "Aristocracy", category: "government", note: "Greek aristos, best." },
  { id: "theocracy", definition: "Government by religious authority in the name of God", word: "Theocracy", category: "government", note: "Greek theos, god." },
  { id: "anarchy", definition: "Absence of government and law", word: "Anarchy", category: "government", note: "Greek an-, without, plus arkhos, ruler." },
  { id: "oligarchy", definition: "Government by a small group of people", word: "Oligarchy", category: "government", note: "Greek oligos, few." },

  // Periods & anniversaries
  { id: "decade", definition: "A period of ten years", word: "Decade", category: "time", note: "Greek deka, ten." },
  { id: "century", definition: "A period of one hundred years", word: "Century", category: "time", note: "Latin centum, hundred." },
  { id: "millennium", definition: "A period of one thousand years", word: "Millennium", category: "time", note: "Latin mille, thousand, plus annus, year — hence the double n." },
  { id: "silver-jubilee", definition: "The celebration of a twenty-fifth anniversary", word: "Silver jubilee", category: "time", note: "Golden is the fiftieth, diamond the sixtieth in current British and Indian usage." },
  { id: "golden-jubilee", definition: "The celebration of a fiftieth anniversary", word: "Golden jubilee", category: "time", note: "Platinum jubilee is now used for the seventieth." },
  { id: "biennial", definition: "Something that happens once every two years", word: "Biennial", category: "time", note: "Biannual means twice a year — the two are constantly confused, and papers test exactly that." },
  { id: "posthumous", definition: "Occurring or published after a person's death", word: "Posthumous", category: "time", note: "Latin post humum, after the ground — a folk reshaping of postumus, last." },

  // That which cannot be…
  { id: "invisible", definition: "That which cannot be seen", word: "Invisible", category: "negatives", note: "Latin videre, to see." },
  { id: "inaudible", definition: "That which cannot be heard", word: "Inaudible", category: "negatives", note: "Latin audire, to hear." },
  { id: "inevitable", definition: "That which cannot be avoided", word: "Inevitable", category: "negatives", note: "Latin evitare, to avoid." },
  { id: "incorrigible", definition: "That which cannot be corrected or reformed", word: "Incorrigible", category: "negatives", note: "Used of habits and of people." },
  { id: "incredible", definition: "That which cannot be believed", word: "Incredible", category: "negatives", note: "Incredible describes the claim; incredulous describes the listener." },
  { id: "illegible", definition: "That which cannot be read", word: "Illegible", category: "negatives", note: "Illegible means impossible to decipher; ineligible means not qualified." },
  { id: "invincible", definition: "That which cannot be conquered", word: "Invincible", category: "negatives", note: "Latin vincere, to conquer." },
  { id: "indelible", definition: "That which cannot be erased or removed", word: "Indelible", category: "negatives", note: "Latin delere, to destroy — the source of 'delete'." },
  { id: "irrevocable", definition: "That which cannot be taken back or undone", word: "Irrevocable", category: "negatives", note: "Latin revocare, to call back." },
  { id: "ineffable", definition: "That which is too great to be expressed in words", word: "Ineffable", category: "negatives", note: "Latin effari, to speak out." },

  // Words, speech & writing
  { id: "extempore", definition: "A speech made without previous preparation", word: "Extempore", category: "speech", note: "Latin ex tempore, out of the time." },
  { id: "epitaph", definition: "Words inscribed on a tomb", word: "Epitaph", category: "speech", note: "An epigraph is an inscription or a quotation at the start of a book." },
  { id: "anecdote", definition: "A short amusing account of a real incident", word: "Anecdote", category: "speech", note: "An antidote counters a poison — a classic paired distractor." },
  { id: "paradox", definition: "A statement that contradicts itself yet may be true", word: "Paradox", category: "speech", note: "Greek para, contrary to, plus doxa, opinion." },
  { id: "synonym", definition: "A word having the same meaning as another", word: "Synonym", category: "speech", note: "Greek syn, together, plus onoma, name." },
  { id: "antonym", definition: "A word opposite in meaning to another", word: "Antonym", category: "speech", note: "Greek anti, against." },
  { id: "autobiography", definition: "The life story of a person written by that person", word: "Autobiography", category: "speech", note: "A biography is written by someone else." },
  { id: "manuscript", definition: "A book or document written by hand", word: "Manuscript", category: "speech", note: "Latin manus, hand, plus scriptum, written." },
  { id: "soliloquy", definition: "Speaking one's thoughts aloud when alone", word: "Soliloquy", category: "speech", note: "Latin solus, alone, plus loqui, to speak. A monologue has an audience." },
  { id: "panacea", definition: "A remedy claimed to cure all diseases", word: "Panacea", category: "speech", note: "Greek pan, all, plus akos, cure. Now mostly used of policies rather than medicines." },

  // Animals & feeding
  { id: "herbivore", definition: "An animal that feeds on plants", word: "Herbivore", category: "animals", note: "Latin herba, plant, plus vorare, to devour." },
  { id: "carnivore", definition: "An animal that feeds on flesh", word: "Carnivore", category: "animals", note: "Latin caro, carnis, flesh." },
  { id: "omnivore", definition: "An animal that eats both plants and flesh", word: "Omnivore", category: "animals", note: "Latin omnis, all." },
  { id: "amphibian", definition: "An animal that can live both on land and in water", word: "Amphibian", category: "animals", note: "Greek amphi, both, plus bios, life." },
  { id: "cannibal", definition: "One who eats the flesh of his own species", word: "Cannibal", category: "animals", note: "From a Spanish rendering of a Caribbean people's name." },
  { id: "nocturnal", definition: "An animal that is active at night", word: "Nocturnal", category: "animals", note: "Diurnal is the daytime counterpart." },
  { id: "carnivorous-plant", definition: "A plant that traps and digests insects", word: "Insectivorous", category: "animals", note: "Used of plants such as the pitcher plant and of insect-eating animals." },

  // Fears & phobias
  { id: "claustrophobia", definition: "Fear of enclosed or confined spaces", word: "Claustrophobia", category: "fears", note: "Latin claustrum, an enclosed place." },
  { id: "acrophobia", definition: "Fear of heights", word: "Acrophobia", category: "fears", note: "Greek akron, summit — the same root as acropolis." },
  { id: "hydrophobia", definition: "Fear of water", word: "Hydrophobia", category: "fears", note: "Also the old name for rabies, because of the difficulty swallowing it causes." },
  { id: "xenophobia", definition: "Fear or dislike of foreigners", word: "Xenophobia", category: "fears", note: "Greek xenos, stranger." },
  { id: "agoraphobia", definition: "Fear of open or public places", word: "Agoraphobia", category: "fears", note: "Greek agora, marketplace — the direct opposite of claustrophobia." },
  { id: "pyrophobia", definition: "Fear of fire", word: "Pyrophobia", category: "fears", note: "Greek pyr, fire — the root of pyre and pyrotechnics." },
];

export const ROUND_SIZES = [5, 10, 15, 20];
const OPTIONS_PER_QUESTION = 4;

const CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));

/** Deterministic 32-bit LCG so a round number always rebuilds the same round. */
function makeRandom(seed) {
  let state = Math.abs(Math.trunc(Number(seed))) % 2147483647;
  if (!Number.isFinite(state) || state === 0) state = 1;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function shuffle(list, random) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const swap = copy[i];
    copy[i] = copy[j];
    copy[j] = swap;
  }
  return copy;
}

/**
 * Build a multiple-choice round.
 * `count` is clamped to the size of the chosen pool; an unknown category falls
 * back to the full pool. Distractors come from the same category first, topped
 * up from the whole list if that category is too small. Pure for a given
 * (count, seed, category).
 */
export function buildRound({ count = 10, seed = 1, category = "all" } = {}) {
  const safeCategory = category === "all" || CATEGORY_IDS.has(category) ? category : "all";
  const pool =
    safeCategory === "all" ? ITEMS : ITEMS.filter((item) => item.category === safeCategory);

  if (pool.length < OPTIONS_PER_QUESTION) {
    return { error: "That category has too few entries to build a multiple-choice round." };
  }

  const rawCount = Number(count);
  if (!Number.isFinite(rawCount) || rawCount < 1) {
    return { error: "Choose how many questions you want — at least one." };
  }

  const size = Math.min(Math.floor(rawCount), pool.length);
  const random = makeRandom(seed);
  const picked = shuffle(pool, random).slice(0, size);

  const questions = picked.map((item) => {
    const sameFamily = ITEMS.filter(
      (other) => other.category === item.category && other.id !== item.id
    );
    const rest = ITEMS.filter(
      (other) => other.category !== item.category && other.id !== item.id
    );
    const distractors = shuffle(sameFamily, random)
      .concat(shuffle(rest, random))
      .slice(0, OPTIONS_PER_QUESTION - 1)
      .map((other) => other.word);

    return {
      id: item.id,
      definition: item.definition,
      answer: item.word,
      category: item.category,
      note: item.note,
      options: shuffle([item.word, ...distractors], random),
    };
  });

  return {
    questions,
    count: size,
    seed: Math.abs(Math.trunc(Number(seed))) || 1,
    category: safeCategory,
    poolSize: pool.length,
  };
}

const BANDS = [
  { min: 90, label: "Exam ready — you are recognising the word families, not guessing." },
  { min: 70, label: "Solid. Revise the ones you missed and run another round." },
  { min: 50, label: "Halfway. Learn the Greek and Latin roots behind each family." },
  { min: 0, label: "Start with one family at a time — the -cracy words or the -phobia words." },
];

/**
 * Grade a round. `answers` maps question id to the chosen word.
 * Unanswered questions count as wrong but are reported separately.
 * An empty round scores 0%, never NaN.
 */
export function gradeRound(questions, answers) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return { error: "There are no questions to grade yet." };
  }
  const given = answers && typeof answers === "object" ? answers : {};

  const rows = questions.map((question) => {
    const chosen = typeof given[question.id] === "string" ? given[question.id] : null;
    return {
      ...question,
      chosen,
      answered: chosen !== null && question.options.includes(chosen),
      correct: chosen === question.answer,
    };
  });

  const total = rows.length;
  const correct = rows.filter((row) => row.correct).length;
  const answered = rows.filter((row) => row.answered).length;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const band = BANDS.find((entry) => percent >= entry.min)?.label ?? BANDS[BANDS.length - 1].label;

  return { rows, total, correct, answered, unanswered: total - answered, percent, band };
}

export function categoryCounts() {
  const counts = {};
  for (const { id } of CATEGORIES) counts[id] = 0;
  for (const item of ITEMS) {
    if (counts[item.category] === undefined) counts[item.category] = 0;
    counts[item.category] += 1;
  }
  return counts;
}
