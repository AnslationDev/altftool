/**
 * Homophone Confusion Checker — data and a pure text analyser.
 *
 * Two separate jobs, deliberately kept apart:
 *
 * 1. RULES — high-confidence patterns where the surrounding words make the
 *    error certain, or near enough. "their is", "should of", "to many",
 *    "your welcome" and "brake the rules" cannot be right in ordinary English,
 *    so each of these is reported as a fix with a suggested replacement.
 *    Nothing goes in this list unless the correction holds in essentially
 *    every context, because a wrong correction is worse than none.
 *
 * 2. SETS — the homophone and near-homophone groups themselves. Any word from
 *    a set that appears in the text is surfaced as something to re-read, with
 *    each member's meaning. This is advice, not a correction: only a human can
 *    tell whether "principal" or "principle" was meant.
 *
 * No spell checking, no grammar checking, no network. Everything here is a
 * pure function of the text passed in.
 */

export const RULES = [
  {
    id: "modal-of",
    find: "\\b(should|could|would|must|might)\\s+of\\b",
    replace: "$1 have",
    why: "'Of' is never a verb. The contraction should've simply sounds like 'should of'.",
  },
  {
    id: "your-welcome",
    find: "\\byour\\s+welcome\\b",
    replace: "you're welcome",
    why: "This says 'you are welcome', so it needs the contraction, not the possessive.",
  },
  {
    id: "your-verb",
    find: "\\byour\\s+(going|coming|welcome|not|always|never|probably|definitely|already)\\b",
    replace: "you're $1",
    why: "'Your' is possessive. Before a verb or an adverb like this, you need 'you are' — you're.",
  },
  {
    id: "their-be",
    find: "\\btheir\\s+(is|are|was|were)\\b",
    replace: "there $1",
    why: "'Their' shows possession. The word that introduces existence is 'there'.",
  },
  {
    id: "there-own",
    find: "\\bthere\\s+own\\b",
    replace: "their own",
    why: "'Own' here needs a possessive, so it must be 'their'.",
  },
  {
    id: "to-adjective",
    find: "\\bto\\s+(much|many|late|early|far|often|soon|little|big|small|good|expensive|cheap|hot|cold|hard|easy)\\b",
    replace: "too $1",
    why: "'Too' means excessively. 'To' is a preposition and never modifies an adjective like this.",
  },
  {
    id: "comparative-then",
    find: "\\b(more|less|better|worse|rather|other|greater|smaller|older|younger|bigger|faster|slower|higher|lower)\\s+then\\b",
    replace: "$1 than",
    why: "Comparisons take 'than'. 'Then' is about time or sequence.",
  },
  {
    id: "its-article",
    find: "\\bits\\s+(a|an|the|been|not|going|too|very|so|really|already|possible|important)\\b",
    replace: "it's $1",
    why: "'Its' is the possessive. Here you need the contraction of 'it is' or 'it has'.",
  },
  {
    id: "it-s-possessive",
    find: "\\bit's\\s+(own|way|place|name|colour|color|size|value|purpose|edge|head|tail|shape|weight)\\b",
    replace: "its $1",
    why: "This is possession, so it takes 'its' with no apostrophe. It's = it is.",
  },
  {
    id: "whose-verb",
    find: "\\bwhose\\s+(going|coming|been|got|coming|ready|next)\\b",
    replace: "who's $1",
    why: "'Who's' is the contraction of who is or who has. 'Whose' is possessive.",
  },
  {
    id: "who-s-possessive",
    find: "\\bwho's\\s+(turn|fault|book|name|idea|job|car|house|responsibility)\\b",
    replace: "whose $1",
    why: "This is asking about possession, so it takes 'whose'.",
  },
  {
    id: "to-loose",
    find: "\\bto\\s+loose\\b",
    replace: "to lose",
    why: "'Lose' is the verb meaning to no longer have. 'Loose' means not tight.",
  },
  {
    id: "loose-object",
    find: "\\bloose\\s+(weight|money|control|interest|track|hope|the\\s+game|your\\s+job)\\b",
    replace: "lose $1",
    why: "You lose weight, money or control. 'Loose' is an adjective meaning slack.",
  },
  {
    id: "a-peace-of",
    find: "\\ba\\s+peace\\s+of\\b",
    replace: "a piece of",
    why: "'Piece' is a portion. 'Peace' is the absence of conflict.",
  },
  {
    id: "brake-break",
    find: "\\bbrake\\s+(the|a|his|her|their|my)\\s+(rule|rules|law|record|promise|silence|habit|ice)\\b",
    replace: "break $1 $2",
    why: "'Brake' is the thing that stops a vehicle. To break is the verb.",
  },
  {
    id: "bare-with",
    find: "\\bbare\\s+with\\s+(me|us)\\b",
    replace: "bear with $1",
    why: "'Bear with me' means tolerate me. 'Bare' means uncovered.",
  },
  {
    id: "have-past",
    find: "\\b(have|has|had)\\s+past\\b",
    replace: "$1 passed",
    why: "The past participle of the verb 'pass' is 'passed'. 'Past' is a noun, adjective or preposition.",
  },
  {
    id: "effected-by",
    find: "\\beffected\\s+by\\b",
    replace: "affected by",
    why: "'Affect' is the verb meaning to influence. 'Effect' as a verb means to bring about, which does not fit 'by'.",
  },
  {
    id: "the-affect-of",
    find: "\\bthe\\s+affect\\s+(of|on)\\b",
    replace: "the effect $1",
    why: "The noun is 'effect'. 'Affect' as a noun exists only as a psychology term for observable emotion.",
  },
  {
    id: "stationary-shop",
    find: "\\bstationary\\s+(shop|store|items|supplies|cupboard|order)\\b",
    replace: "stationery $1",
    why: "Stationery with an e is paper and pens. Stationary with an a means not moving.",
  },
  {
    id: "compliment-colour",
    find: "\\bcompliment(ary)?\\s+(colour|color|colours|colors|angle|angles|shade|shades)\\b",
    replace: "complementary $2",
    why: "Complementary with an e means completing each other. A compliment is praise.",
  },
  {
    id: "school-principle",
    find: "\\b(school|college|deputy|vice)\\s+principle\\b",
    replace: "$1 principal",
    why: "The head of a school is the principal. A principle is a rule or belief.",
  },
  {
    id: "principle-of-the-school",
    find: "\\bthe\\s+principle\\s+of\\s+the\\s+(school|college|institute|university|academy)\\b",
    replace: "the principal of the $1",
    why: "The head of an institution is the principal. A principle is a rule or belief.",
  },
  {
    id: "alot",
    find: "\\balot\\b",
    replace: "a lot",
    why: "'Alot' is not a word. Write 'a lot', or use 'allot' only when you mean to distribute.",
  },
  {
    id: "its-self",
    find: "\\bits\\s+self\\b",
    replace: "itself",
    why: "'Itself' is one word.",
  },
  {
    id: "yours-apostrophe",
    find: "\\byour's\\b",
    replace: "yours",
    why: "Possessive pronouns — yours, hers, theirs, its — never take an apostrophe.",
  },
  {
    id: "everyday-adverb",
    find: "\\beveryday\\s+(i|we|he|she|they|you|at|in|on|after|before|morning|evening)\\b",
    replace: "every day $1",
    why: "'Everyday' as one word is an adjective meaning ordinary. For frequency, use two words.",
  },
  {
    id: "wether",
    find: "\\bwether\\b",
    replace: "whether",
    why: "A wether is a castrated ram, so this is almost always a typo for 'whether'.",
  },
  {
    id: "sneak-peak",
    find: "\\bsneak\\s+peak\\b",
    replace: "sneak peek",
    why: "A peek is a quick look. A peak is the top of a mountain.",
  },
  {
    id: "per-say",
    find: "\\bper\\s+say\\b",
    replace: "per se",
    why: "'Per se' is Latin for 'in itself' and keeps its Latin spelling.",
  },
  {
    id: "intensive-purposes",
    find: "\\bfor\\s+all\\s+intensive\\s+purposes\\b",
    replace: "for all intents and purposes",
    why: "The original phrase is 'intents and purposes'; 'intensive' is a mishearing.",
  },
  {
    id: "nip-in-the-butt",
    find: "\\bnip\\s+(it|this|that)\\s+in\\s+the\\s+butt\\b",
    replace: "nip $1 in the bud",
    why: "The image is cutting a plant bud before it opens.",
  },
];

export const SETS = [
  {
    id: "their-there-theyre",
    words: [
      { word: "their", meaning: "belonging to them" },
      { word: "there", meaning: "in that place, or introducing existence" },
      { word: "they're", meaning: "they are" },
    ],
  },
  {
    id: "your-youre",
    words: [
      { word: "your", meaning: "belonging to you" },
      { word: "you're", meaning: "you are" },
    ],
  },
  {
    id: "its-it-s",
    words: [
      { word: "its", meaning: "belonging to it" },
      { word: "it's", meaning: "it is or it has" },
    ],
  },
  {
    id: "to-too-two",
    words: [
      { word: "to", meaning: "towards, or the infinitive marker" },
      { word: "too", meaning: "also, or excessively" },
      { word: "two", meaning: "the number 2" },
    ],
  },
  {
    id: "than-then",
    words: [
      { word: "than", meaning: "used in comparisons" },
      { word: "then", meaning: "at that time, or next" },
    ],
  },
  {
    id: "affect-effect",
    words: [
      { word: "affect", meaning: "verb: to influence something" },
      { word: "effect", meaning: "noun: the result; verb: to bring about" },
    ],
  },
  {
    id: "principal-principle",
    words: [
      { word: "principal", meaning: "head of an institution; the main one; a loan's capital" },
      { word: "principle", meaning: "a rule or fundamental belief" },
    ],
  },
  {
    id: "stationary-stationery",
    words: [
      { word: "stationary", meaning: "not moving" },
      { word: "stationery", meaning: "paper, pens and envelopes" },
    ],
  },
  {
    id: "complement-compliment",
    words: [
      { word: "complement", meaning: "something that completes" },
      { word: "compliment", meaning: "an expression of praise" },
    ],
  },
  {
    id: "lose-loose",
    words: [
      { word: "lose", meaning: "to misplace or be defeated" },
      { word: "loose", meaning: "not tight, not fastened" },
    ],
  },
  {
    id: "accept-except",
    words: [
      { word: "accept", meaning: "to receive or agree to" },
      { word: "except", meaning: "apart from" },
    ],
  },
  {
    id: "advice-advise",
    words: [
      { word: "advice", meaning: "noun: the guidance itself" },
      { word: "advise", meaning: "verb: to give guidance" },
    ],
  },
  {
    id: "practice-practise",
    words: [
      { word: "practice", meaning: "noun in British English; both noun and verb in American" },
      { word: "practise", meaning: "the verb in British and Indian English" },
    ],
  },
  {
    id: "weather-whether",
    words: [
      { word: "weather", meaning: "rain, sun, temperature" },
      { word: "whether", meaning: "introducing an alternative" },
    ],
  },
  {
    id: "whos-whose",
    words: [
      { word: "who's", meaning: "who is or who has" },
      { word: "whose", meaning: "belonging to whom" },
    ],
  },
  {
    id: "lead-led",
    words: [
      { word: "lead", meaning: "present tense of the verb, or the metal" },
      { word: "led", meaning: "past tense of the verb 'lead'" },
    ],
  },
  {
    id: "past-passed",
    words: [
      { word: "past", meaning: "noun, adjective or preposition — time gone by, beyond" },
      { word: "passed", meaning: "past tense of the verb 'pass'" },
    ],
  },
  {
    id: "peace-piece",
    words: [
      { word: "peace", meaning: "absence of conflict" },
      { word: "piece", meaning: "a portion of something" },
    ],
  },
  {
    id: "desert-dessert",
    words: [
      { word: "desert", meaning: "arid land, or to abandon" },
      { word: "dessert", meaning: "the sweet course" },
    ],
  },
  {
    id: "discreet-discrete",
    words: [
      { word: "discreet", meaning: "careful not to attract attention" },
      { word: "discrete", meaning: "separate and distinct" },
    ],
  },
  {
    id: "elicit-illicit",
    words: [
      { word: "elicit", meaning: "to draw out a response" },
      { word: "illicit", meaning: "not permitted by law" },
    ],
  },
  {
    id: "allusion-illusion",
    words: [
      { word: "allusion", meaning: "an indirect reference" },
      { word: "illusion", meaning: "a false impression" },
    ],
  },
  {
    id: "bare-bear",
    words: [
      { word: "bare", meaning: "uncovered" },
      { word: "bear", meaning: "to carry or tolerate; also the animal" },
    ],
  },
  {
    id: "brake-break",
    words: [
      { word: "brake", meaning: "the device that stops a vehicle" },
      { word: "break", meaning: "to shatter, or a pause" },
    ],
  },
  {
    id: "cite-site-sight",
    words: [
      { word: "cite", meaning: "to quote a source" },
      { word: "site", meaning: "a location" },
      { word: "sight", meaning: "vision, or something seen" },
    ],
  },
  {
    id: "council-counsel",
    words: [
      { word: "council", meaning: "an official body" },
      { word: "counsel", meaning: "advice, or a lawyer" },
    ],
  },
  {
    id: "ensure-insure-assure",
    words: [
      { word: "ensure", meaning: "to make certain something happens" },
      { word: "insure", meaning: "to arrange financial cover" },
      { word: "assure", meaning: "to tell someone confidently" },
    ],
  },
  {
    id: "moral-morale",
    words: [
      { word: "moral", meaning: "concerning right and wrong; a lesson" },
      { word: "morale", meaning: "the confidence of a group" },
    ],
  },
  {
    id: "personal-personnel",
    words: [
      { word: "personal", meaning: "private, individual" },
      { word: "personnel", meaning: "the staff of an organisation" },
    ],
  },
  {
    id: "precede-proceed",
    words: [
      { word: "precede", meaning: "to come before" },
      { word: "proceed", meaning: "to go forward" },
    ],
  },
  {
    id: "role-roll",
    words: [
      { word: "role", meaning: "a part played" },
      { word: "roll", meaning: "to turn over; a list; a bread roll" },
    ],
  },
  {
    id: "waist-waste",
    words: [
      { word: "waist", meaning: "the middle of the body" },
      { word: "waste", meaning: "to squander; rubbish" },
    ],
  },
  {
    id: "lightning-lightening",
    words: [
      { word: "lightning", meaning: "the electrical flash in a storm" },
      { word: "lightening", meaning: "making lighter in weight or colour" },
    ],
  },
  {
    id: "hoard-horde",
    words: [
      { word: "hoard", meaning: "a stock hidden away" },
      { word: "horde", meaning: "a large crowd" },
    ],
  },
  {
    id: "pray-prey",
    words: [
      { word: "pray", meaning: "to address a deity" },
      { word: "prey", meaning: "an animal hunted by another" },
    ],
  },
  {
    id: "rain-reign-rein",
    words: [
      { word: "rain", meaning: "falling water" },
      { word: "reign", meaning: "the period a monarch rules" },
      { word: "rein", meaning: "a strap for controlling a horse" },
    ],
  },
  {
    id: "vain-vane-vein",
    words: [
      { word: "vain", meaning: "conceited, or futile" },
      { word: "vane", meaning: "a blade, as on a weather vane" },
      { word: "vein", meaning: "a blood vessel" },
    ],
  },
  {
    id: "wave-waive",
    words: [
      { word: "wave", meaning: "to move the hand; a ridge of water" },
      { word: "waive", meaning: "to give up a right or a fee" },
    ],
  },
  {
    id: "taut-taught",
    words: [
      { word: "taut", meaning: "stretched tight" },
      { word: "taught", meaning: "past tense of teach" },
    ],
  },
  {
    id: "forward-foreword",
    words: [
      { word: "forward", meaning: "towards the front" },
      { word: "foreword", meaning: "the introduction at the start of a book" },
    ],
  },
  {
    id: "pore-pour",
    words: [
      { word: "pore", meaning: "a tiny opening; to pore over means to study closely" },
      { word: "pour", meaning: "to make a liquid flow" },
    ],
  },
];

/** Every word that belongs to at least one set, mapped to its set. */
const WORD_TO_SET = (() => {
  const map = new Map();
  for (const set of SETS) {
    for (const entry of set.words) {
      map.set(entry.word, set);
    }
  }
  return map;
})();

function lineNumberAt(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i += 1) {
    if (text[i] === "\n") line += 1;
  }
  return line;
}

function contextAt(text, index, length) {
  const start = Math.max(0, index - 32);
  const end = Math.min(text.length, index + length + 32);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${text.slice(start, end).replace(/\s+/g, " ").trim()}${suffix}`;
}

/**
 * Apply a rule's replacement to one matched string, keeping capture groups and
 * restoring a leading capital so "Their is" becomes "There is", not "there is".
 */
function suggestionFor(rule, matched) {
  const replaced = matched.replace(new RegExp(rule.find, "i"), rule.replace);
  const firstLetter = matched.match(/[A-Za-z]/)?.[0] ?? "";
  if (firstLetter && firstLetter === firstLetter.toUpperCase()) {
    return replaced.charAt(0).toUpperCase() + replaced.slice(1);
  }
  return replaced;
}

/**
 * Drop any match that overlaps one already kept. Two rules can legitimately fire
 * on the same words ("your welcome" matches both the specific and the general
 * rule) and the reader should see one fix, not two.
 */
function dropOverlaps(found) {
  const kept = [];
  for (const issue of found) {
    const end = issue.index + issue.found.length;
    const clashes = kept.some(
      (other) => issue.index < other.index + other.found.length && other.index < end
    );
    if (!clashes) kept.push(issue);
  }
  return kept;
}

/**
 * Analyse a block of text.
 *
 * Returns { error } for empty input. Otherwise:
 *   issues     — high-confidence fixes, in the order they appear in the text
 *   watchlist  — homophone sets present in the text, with per-word counts
 *   wordCount, charCount, issueCount, watchWordCount
 *
 * Pure: same text in, same object out. Nothing is mutated or fetched.
 */
export function analyseText(input) {
  const text = typeof input === "string" ? input : String(input ?? "");
  if (text.trim().length === 0) {
    return { error: "Paste or type some text to check." };
  }

  const raw = [];
  for (const rule of RULES) {
    const pattern = new RegExp(rule.find, "gi");
    let match = pattern.exec(text);
    while (match !== null) {
      const found = match[0];
      raw.push({
        ruleId: rule.id,
        index: match.index,
        line: lineNumberAt(text, match.index),
        found,
        suggestion: suggestionFor(rule, found),
        why: rule.why,
        context: contextAt(text, match.index, found.length),
      });
      if (match.index === pattern.lastIndex) pattern.lastIndex += 1;
      match = pattern.exec(text);
    }
  }
  raw.sort((a, b) => a.index - b.index || b.found.length - a.found.length);
  const issues = dropOverlaps(raw);

  const tokens = text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? [];
  const wordCount = tokens.length;

  const counts = new Map();
  for (const token of tokens) {
    if (WORD_TO_SET.has(token)) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }

  const bySet = new Map();
  for (const [word, count] of counts) {
    const set = WORD_TO_SET.get(word);
    if (!bySet.has(set.id)) {
      bySet.set(set.id, { id: set.id, words: set.words, found: [], total: 0 });
    }
    const row = bySet.get(set.id);
    row.found.push({ word, count });
    row.total += count;
  }

  const watchlist = Array.from(bySet.values())
    .map((row) => ({
      ...row,
      found: row.found.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word)),
    }))
    .sort((a, b) => b.total - a.total || a.id.localeCompare(b.id));

  const watchWordCount = watchlist.reduce((sum, row) => sum + row.total, 0);

  return {
    issues,
    watchlist,
    wordCount,
    charCount: text.length,
    issueCount: issues.length,
    watchWordCount,
    setsTouched: watchlist.length,
  };
}

/** Total number of confusable words the checker knows about. */
export function setStats() {
  return {
    sets: SETS.length,
    words: WORD_TO_SET.size,
    rules: RULES.length,
  };
}
