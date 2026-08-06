/*
 * AltF Lexicon — collections
 *
 * A collection is a named slice of the corpus with a predicate that decides
 * membership. Nothing here is a hand-typed word list: every collection is
 * computed from data the entry already carries, which is what keeps 140
 * category pages honest at 147,000 entries and what makes them regenerate
 * correctly when the corpus changes.
 *
 * Three sources of membership, in descending order of authority:
 *
 *   1. WordNet's own lexicographer files (`sense.d`) — a lexicographer filed
 *      this sense under noun.animal, so it is an animal. Not a keyword match.
 *   2. WordNet's domain pointers (`sense.tp/rg/us`) — the field, region and
 *      register a sense is used in. This is where "Indian English" and "slang"
 *      come from, and it is primary data rather than our opinion.
 *   3. Shape, sound and frequency of the word itself — objective and checkable.
 *
 * Every `description` states the selection rule, because a category page that
 * will not say how it was built is asking to be trusted rather than read.
 */

const letters = (entry) => entry.w.toLowerCase().replace(/[^a-z]/g, "");

const senses = (entry) => entry.sn || [];

const hasDomain = (entry, domain) => senses(entry).some((sense) => sense.d === domain);

const hasDomainStartingWith = (entry, prefix) =>
  senses(entry).some((sense) => sense.d?.startsWith(prefix));

const matchesLabel = (list, pattern) => list?.some((label) => pattern.test(label));

const hasTopic = (entry, pattern) => senses(entry).some((sense) => matchesLabel(sense.tp, pattern));
const hasRegion = (entry, pattern) => senses(entry).some((sense) => matchesLabel(sense.rg, pattern));
const hasUsage = (entry, pattern) => senses(entry).some((sense) => matchesLabel(sense.us, pattern));

const isWord = (entry) => !entry.ph;

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

/** A topic collection built straight from a WordNet lexicographer file. */
const domainCollection = (slug, name, domain, group, description) => ({
  slug,
  name,
  title: name,
  group,
  description,
  match: (entry) => hasDomain(entry, domain),
});

export const COLLECTION_GROUPS = Object.freeze([
  {
    id: "subject",
    label: "By subject",
    blurb: "What the word is about, taken from WordNet's own classification of every sense.",
  },
  {
    id: "register",
    label: "By register & origin",
    blurb: "How and where a word is used — the field, the region, the level of formality.",
  },
  {
    id: "shape",
    label: "By shape",
    blurb: "Curiosities of spelling: length, repeated letters, missing vowels, symmetry.",
  },
  {
    id: "sound",
    label: "By sound",
    blurb: "Syllables, stress and the words that are harder to say than to read.",
  },
  {
    id: "learning",
    label: "For learning",
    blurb: "Slices built for people studying English rather than browsing it.",
  },
]);

export const COLLECTIONS = Object.freeze([
  /* ---------------- Subject: WordNet lexicographer files ---------------- */

  domainCollection(
    "animals",
    "Animal words",
    "noun.animal",
    "subject",
    "Every noun WordNet files under animals — species, groups, body plans and the words for what animals do to each other.",
  ),
  domainCollection(
    "plants",
    "Plant words",
    "noun.plant",
    "subject",
    "Trees, flowers, fungi, grasses and crops, as classified in WordNet's botanical file.",
  ),
  domainCollection(
    "food-and-drink",
    "Food and drink words",
    "noun.food",
    "subject",
    "Ingredients, dishes, drinks and preparations — the whole of WordNet's food file.",
  ),
  domainCollection(
    "body-words",
    "Words for the body",
    "noun.body",
    "subject",
    "Anatomy from the outside in: parts, organs, tissues, fluids and the words for their shapes.",
  ),
  domainCollection(
    "feelings",
    "Words for feelings",
    "noun.feeling",
    "subject",
    "Emotions as nouns — the states themselves, from mild preference to overwhelming grief.",
  ),
  domainCollection(
    "emotion-verbs",
    "Verbs of emotion",
    "verb.emotion",
    "subject",
    "What feelings do: to cheer, to dread, to resent. The verb side of the emotional vocabulary.",
  ),
  domainCollection(
    "thinking-words",
    "Words for thinking",
    "noun.cognition",
    "subject",
    "Ideas, beliefs, methods, misconceptions — the nouns of mental life.",
  ),
  domainCollection(
    "thinking-verbs",
    "Verbs of thinking",
    "verb.cognition",
    "subject",
    "To reckon, to infer, to doubt: every verb WordNet files under cognition.",
  ),
  domainCollection(
    "communication",
    "Words for communication",
    "noun.communication",
    "subject",
    "Messages, documents, signals, genres and the names for ways of saying things.",
  ),
  domainCollection(
    "speaking-verbs",
    "Verbs of speaking",
    "verb.communication",
    "subject",
    "Alternatives to 'said' and much more — every verb of communicating, from murmur to proclaim.",
  ),
  domainCollection(
    "people-words",
    "Words for people",
    "noun.person",
    "subject",
    "Roles, trades, types and characters — the largest single file in WordNet's noun classification.",
  ),
  domainCollection(
    "places",
    "Words for places",
    "noun.location",
    "subject",
    "Regions, landforms, addresses and the general vocabulary of where things are.",
  ),
  domainCollection(
    "things-we-make",
    "Words for made things",
    "noun.artifact",
    "subject",
    "Tools, buildings, vehicles, clothing, instruments — everything manufactured rather than found.",
  ),
  domainCollection(
    "substances",
    "Words for materials",
    "noun.substance",
    "subject",
    "Elements, compounds, fabrics, minerals and the stuff other things are made of.",
  ),
  domainCollection(
    "time-words",
    "Words for time",
    "noun.time",
    "subject",
    "Periods, points, rhythms and units — how English divides duration.",
  ),
  domainCollection(
    "groups",
    "Words for groups",
    "noun.group",
    "subject",
    "Collectives of every kind: organisations, gatherings, taxonomic ranks and crowds.",
  ),
  domainCollection(
    "events",
    "Words for events",
    "noun.event",
    "subject",
    "Happenings that are not actions — accidents, occurrences, phenomena with a beginning and an end.",
  ),
  domainCollection(
    "actions",
    "Words for actions",
    "noun.act",
    "subject",
    "Deeds named as nouns: the arrival, the refusal, the negotiation.",
  ),
  domainCollection(
    "states",
    "Words for states",
    "noun.state",
    "subject",
    "Conditions rather than events — being ill, being at peace, being in debt.",
  ),
  domainCollection(
    "qualities",
    "Words for qualities",
    "noun.attribute",
    "subject",
    "Properties as nouns: brightness, patience, density, cruelty.",
  ),
  domainCollection(
    "quantities",
    "Words for quantities",
    "noun.quantity",
    "subject",
    "Amounts, measures, units and the vocabulary of how much.",
  ),
  domainCollection(
    "shapes",
    "Words for shapes",
    "noun.shape",
    "subject",
    "Forms and figures, from the strictly geometric to the merely suggested by an outline.",
  ),
  domainCollection(
    "phenomena",
    "Words for natural phenomena",
    "noun.phenomenon",
    "subject",
    "Processes of the physical world — weather, radiation, tides, decay.",
  ),
  domainCollection(
    "possessions",
    "Words for money and property",
    "noun.possession",
    "subject",
    "Assets, debts, payments and the vocabulary of owning.",
  ),
  domainCollection(
    "movement-verbs",
    "Verbs of movement",
    "verb.motion",
    "subject",
    "Every way of going: to amble, to hurtle, to trickle, to migrate.",
  ),
  domainCollection(
    "contact-verbs",
    "Verbs of touch and contact",
    "verb.contact",
    "subject",
    "To grasp, to graze, to hammer — verbs about one thing meeting another.",
  ),
  domainCollection(
    "making-verbs",
    "Verbs of making",
    "verb.creation",
    "subject",
    "To forge, to compose, to knit, to draft — the vocabulary of bringing things into being.",
  ),
  domainCollection(
    "change-verbs",
    "Verbs of change",
    "verb.change",
    "subject",
    "Every verb about becoming different: to ripen, to erode, to escalate.",
  ),
  domainCollection(
    "social-verbs",
    "Verbs of social life",
    "verb.social",
    "subject",
    "What people do to and with each other — to marry, to betray, to govern, to celebrate.",
  ),
  domainCollection(
    "senses-verbs",
    "Verbs of the senses",
    "verb.perception",
    "subject",
    "To glimpse, to savour, to eavesdrop: verbs of seeing, hearing, tasting, smelling and feeling.",
  ),
  domainCollection(
    "competition-verbs",
    "Verbs of competition",
    "verb.competition",
    "subject",
    "Contest and conflict, from playing a match to waging a war.",
  ),
  domainCollection(
    "eating-verbs",
    "Verbs of eating and drinking",
    "verb.consumption",
    "subject",
    "To nibble, to guzzle, to sip, to devour — how English distinguishes ways of consuming.",
  ),
  domainCollection(
    "weather-verbs",
    "Weather verbs",
    "verb.weather",
    "subject",
    "The smallest file in WordNet and one of the most vivid: to drizzle, to squall, to thaw.",
  ),
  domainCollection(
    "body-verbs",
    "Verbs the body does",
    "verb.body",
    "subject",
    "Involuntary and bodily actions — to blink, to shiver, to ache, to heal.",
  ),

  /* ---------------- Subject: WordNet topic domains ---------------- */

  {
    slug: "medical-terms",
    name: "Medical terms",
    title: "Medical terms",
    group: "subject",
    description:
      "Words whose senses WordNet tags with a medical field — medicine, surgery, pathology, pharmacology, psychiatry, dentistry.",
    match: (entry) =>
      hasTopic(entry, /medicine|medical|surgery|patholog|pharmacolog|psychiatry|dentistry|anatomy|immunolog/i),
  },
  {
    slug: "legal-terms",
    name: "Legal terms",
    title: "Legal terms",
    group: "subject",
    description: "Vocabulary tagged to law, jurisprudence and criminal justice.",
    match: (entry) => hasTopic(entry, /\blaw\b|jurisprudence|legal|criminal/i),
  },
  {
    slug: "computing-terms",
    name: "Computing terms",
    title: "Computing and technology terms",
    group: "subject",
    description:
      "Words tagged to computer science, computing and information technology — the vocabulary that came with the machines.",
    match: (entry) => hasTopic(entry, /comput|informatics|cryptograph|electronic/i),
  },
  {
    slug: "business-terms",
    name: "Business and finance terms",
    title: "Business and finance terms",
    group: "subject",
    description: "Words tagged to economics, commerce, finance, banking and accounting.",
    match: (entry) => hasTopic(entry, /econom|commerc|financ|banking|accounting|business|trade/i),
  },
  {
    slug: "science-terms",
    name: "Science terms",
    title: "Science terms",
    group: "subject",
    description: "Words tagged to physics, chemistry, biology, astronomy, geology or mathematics.",
    match: (entry) =>
      hasTopic(entry, /physics|chemistry|biolog|astronom|geolog|mathematic|science|zoolog|botan/i),
  },
  {
    slug: "music-terms",
    name: "Music terms",
    title: "Music terms",
    group: "subject",
    description: "The vocabulary of performance, notation, instruments and genre.",
    match: (entry) => hasTopic(entry, /music|song|dance/i),
  },
  {
    slug: "sport-terms",
    name: "Sport terms",
    title: "Sport terms",
    group: "subject",
    description: "Words tagged to a sport or game — cricket, football, chess, athletics and the rest.",
    match: (entry) => hasTopic(entry, /sport|game|cricket|football|baseball|tennis|chess|athletic/i),
  },
  {
    slug: "military-terms",
    name: "Military terms",
    title: "Military terms",
    group: "subject",
    description: "Vocabulary tagged to armed forces, warfare, weaponry and defence.",
    match: (entry) => hasTopic(entry, /military|armed forces|weapon|navy|army|war/i),
  },
  {
    slug: "religion-terms",
    name: "Words from religion",
    title: "Words from religion",
    group: "subject",
    description:
      "Terms tagged to a religion or to theology — Hinduism, Islam, Christianity, Buddhism, Judaism and comparative religion.",
    match: (entry) => hasTopic(entry, /relig|theolog|hindu|islam|christian|buddh|jud|sikh|myth/i),
  },
  {
    slug: "architecture-terms",
    name: "Architecture and building terms",
    title: "Architecture and building terms",
    group: "subject",
    description: "The vocabulary of structure, ornament and construction.",
    match: (entry) => hasTopic(entry, /architect|building|construction|masonry/i),
  },
  {
    slug: "cooking-terms",
    name: "Cooking terms",
    title: "Cooking terms",
    group: "subject",
    description: "Words tagged to cookery and food preparation, as distinct from the food itself.",
    match: (entry) => hasTopic(entry, /cook|cuisine|culinary|baking/i),
  },
  {
    slug: "nautical-terms",
    name: "Nautical terms",
    title: "Nautical and sailing terms",
    group: "subject",
    description: "The specialised vocabulary of ships, sailing and the sea.",
    match: (entry) => hasTopic(entry, /nautical|sailing|navigation|marine|ship/i),
  },
  {
    slug: "grammar-terms",
    name: "Grammar and language terms",
    title: "Grammar and linguistics terms",
    group: "subject",
    description: "The words English uses to talk about itself: parts of speech, tenses, figures of speech.",
    match: (entry) => hasTopic(entry, /grammar|linguistic|rhetoric|phonet|lexicograph/i),
  },
  {
    slug: "psychology-terms",
    name: "Psychology terms",
    title: "Psychology terms",
    group: "subject",
    description: "Words tagged to psychology, psychoanalysis and the study of behaviour.",
    match: (entry) => hasTopic(entry, /psycholog|psychoanaly|behaviou?r/i),
  },
  {
    slug: "art-terms",
    name: "Art terms",
    title: "Art and design terms",
    group: "subject",
    description: "Vocabulary tagged to the fine and applied arts — technique, movement, material.",
    match: (entry) => hasTopic(entry, /\bart\b|painting|sculpture|drawing|graphic|photograph/i),
  },

  /* ---------------- Register, region and origin ---------------- */

  {
    slug: "indian-english",
    name: "Indian English words",
    title: "Words from Indian English",
    group: "register",
    description:
      "Entries whose senses WordNet marks as Indian, or as borrowed from Hindi, Sanskrit, Urdu, Tamil, Bengali or another language of the subcontinent.",
    match: (entry) =>
      hasRegion(entry, /india|south asia/i) ||
      hasTopic(entry, /hindi|sanskrit|urdu|tamil|bengali|hinduism|india/i),
  },
  {
    slug: "british-english",
    name: "British English words",
    title: "Words marked British",
    group: "register",
    description: "Senses WordNet marks as British or as belonging to a British regional usage.",
    match: (entry) => hasRegion(entry, /britain|british|england|english|scotland|ireland|wales/i),
  },
  {
    slug: "american-english",
    name: "American English words",
    title: "Words marked American",
    group: "register",
    description: "Senses WordNet marks as belonging to United States usage.",
    match: (entry) => hasRegion(entry, /united states|american|\bus\b/i),
  },
  {
    slug: "australian-english",
    name: "Australian and New Zealand words",
    title: "Words marked Australian or New Zealand",
    group: "register",
    description: "Senses marked as Australian or New Zealand usage.",
    match: (entry) => hasRegion(entry, /australia|new zealand/i),
  },
  {
    slug: "slang",
    name: "Slang",
    title: "Slang words",
    group: "register",
    description: "Senses WordNet marks as slang — informal vocabulary that has not been admitted to neutral writing.",
    match: (entry) => hasUsage(entry, /slang/i),
  },
  {
    slug: "informal",
    name: "Informal words",
    title: "Informal and colloquial words",
    group: "register",
    description: "Senses marked colloquial or informal: fine in speech, conspicuous in a report.",
    match: (entry) => hasUsage(entry, /colloquial|informal/i),
  },
  {
    slug: "archaic",
    name: "Archaic words",
    title: "Archaic and obsolete words",
    group: "register",
    description: "Senses marked archaic or obsolete — still readable, no longer current.",
    match: (entry) => hasUsage(entry, /archaic|obsolete|antiquated/i),
  },
  {
    slug: "vulgar",
    name: "Words marked coarse",
    title: "Words marked vulgar or coarse",
    group: "register",
    description:
      "Senses WordNet marks vulgar, obscene or offensive. Listed because a dictionary that hides them is not much use to someone who has just been called one.",
    match: (entry) => hasUsage(entry, /vulgar|obscen|offensive|profan/i),
  },
  {
    slug: "trademarks",
    name: "Words that began as trademarks",
    title: "Words that began as trademarks",
    group: "register",
    description: "Senses marked as trademarks — brand names that turned into common nouns.",
    match: (entry) => hasUsage(entry, /trademark/i),
  },
  {
    slug: "idioms-and-phrases",
    name: "Idioms and phrases",
    title: "Idioms and multi-word phrases",
    group: "register",
    description:
      "Entries of more than one word whose meaning is not the sum of its parts — the part of English that defeats literal translation.",
    match: (entry) => Boolean(entry.ph) && entry.w.split(" ").length <= 4 && entry.c >= 2,
  },
  {
    slug: "phrasal-verbs",
    name: "Phrasal verbs",
    title: "Phrasal verbs",
    group: "register",
    description:
      "Two-word verbs — a verb plus a particle that changes its meaning entirely. Give up, take on, put off.",
    match: (entry) =>
      Boolean(entry.ph) &&
      entry.p.includes("v") &&
      entry.w.split(" ").length === 2 &&
      /^(up|down|in|out|on|off|over|away|back|through|around|about|along|by|for|to|with|apart|aside|ahead|forward|together)$/.test(
        entry.w.split(" ")[1],
      ),
  },

  /* ---------------- Shape ---------------- */

  {
    slug: "palindromes",
    name: "Palindromes",
    title: "Palindromes",
    group: "shape",
    description: "Words that read the same backwards — at least four letters, so 'eye' and 'did' do not crowd it out.",
    match: (entry) => {
      const value = letters(entry);
      return isWord(entry) && value.length >= 4 && value === [...value].reverse().join("");
    },
  },
  {
    slug: "all-five-vowels",
    name: "Words with all five vowels",
    title: "Words containing all five vowels",
    group: "shape",
    description: "Every word that manages a, e, i, o and u at least once.",
    match: (entry) => {
      if (!isWord(entry)) return false;
      const value = letters(entry);
      return [...VOWELS].every((vowel) => value.includes(vowel));
    },
  },
  {
    slug: "all-vowels-in-order",
    name: "Vowels in alphabetical order",
    title: "Words with all five vowels in order",
    group: "shape",
    description:
      "The rarest shape in the collection: a, e, i, o and u appearing once each, in that order, like 'facetious'.",
    match: (entry) => {
      if (!isWord(entry)) return false;
      const found = letters(entry).split("").filter((ch) => VOWELS.has(ch));
      return found.join("") === "aeiou";
    },
  },
  {
    slug: "no-vowels",
    name: "Words without vowels",
    title: "Words with no vowels",
    group: "shape",
    description: "Words spelled without a, e, i, o or u — most of them lean on y, and a few on nothing at all.",
    match: (entry) => {
      if (!isWord(entry)) return false;
      const value = letters(entry);
      return value.length >= 3 && ![...value].some((ch) => VOWELS.has(ch));
    },
  },
  {
    slug: "double-letters",
    name: "Words with double letters",
    title: "Words with a double letter",
    group: "shape",
    description: "Words containing a repeated letter side by side — the commonest source of spelling mistakes.",
    match: (entry) => isWord(entry) && /(.)\1/.test(letters(entry)),
  },
  {
    slug: "triple-double-letters",
    name: "Words with three double letters",
    title: "Words with three pairs of double letters",
    group: "shape",
    description: "Words carrying three separate doubled letters. There are not many.",
    match: (entry) => isWord(entry) && (letters(entry).match(/(.)\1/g) || []).length >= 3,
  },
  {
    slug: "same-start-and-end",
    name: "Words that start and end alike",
    title: "Words that begin and end with the same letter",
    group: "shape",
    description: "At least five letters long, first letter equal to last.",
    match: (entry) => {
      const value = letters(entry);
      return isWord(entry) && value.length >= 5 && value[0] === value[value.length - 1];
    },
  },
  {
    slug: "alphabetical-order",
    name: "Letters in alphabetical order",
    title: "Words whose letters are in alphabetical order",
    group: "shape",
    description: "Words at least five letters long whose letters never go backwards through the alphabet.",
    match: (entry) => {
      const value = letters(entry);
      if (!isWord(entry) || value.length < 5) return false;
      for (let i = 1; i < value.length; i += 1) if (value[i] < value[i - 1]) return false;
      return true;
    },
  },
  {
    slug: "longest-words",
    name: "The longest words",
    title: "The longest words in English",
    group: "shape",
    description: "Single words of sixteen letters or more, ordered by how likely you are to have met them.",
    match: (entry) => isWord(entry) && letters(entry).length >= 16,
  },
  {
    slug: "two-letter-words",
    name: "Two-letter words",
    title: "Every two-letter word",
    group: "shape",
    description: "The complete two-letter vocabulary — the list every word-game player eventually memorises.",
    match: (entry) => isWord(entry) && letters(entry).length === 2,
  },
  {
    slug: "three-letter-words",
    name: "Three-letter words",
    title: "Every three-letter word",
    group: "shape",
    description: "All three-letter entries, ranked by commonness.",
    match: (entry) => isWord(entry) && letters(entry).length === 3,
  },
  {
    slug: "q-without-u",
    name: "Q without U",
    title: "Words with Q not followed by U",
    group: "shape",
    description: "The exceptions to the rule everyone was taught — Q standing on its own.",
    match: (entry) => isWord(entry) && /q(?!u)/.test(letters(entry)),
  },
  {
    slug: "silent-letters",
    name: "Words with silent letters",
    title: "Words with silent letters",
    group: "shape",
    description:
      "Words whose spelling carries a letter the pronunciation does not — identified by comparing letter count with syllable structure across the commonest silent patterns.",
    match: (entry) =>
      isWord(entry) &&
      /^(kn|gn|wr|ps|pn|mn)|(mb|mn|gh|st[le]n|lm)$|ough|eigh/.test(letters(entry)) &&
      Boolean(entry.ip),
  },
  {
    slug: "hyphenated",
    name: "Hyphenated words",
    title: "Hyphenated words",
    group: "shape",
    description: "Compounds English has half-joined and not yet finished joining.",
    match: (entry) => entry.w.includes("-"),
  },

  /* ---------------- Sound ---------------- */

  {
    slug: "one-syllable",
    name: "One-syllable words",
    title: "One-syllable words",
    group: "sound",
    description: "Words said in a single beat — the backbone of plain English.",
    match: (entry) => entry.sy === 1 && isWord(entry),
  },
  {
    slug: "five-syllable-words",
    name: "Five-syllable words",
    title: "Words with five or more syllables",
    group: "sound",
    description: "The long ones. Every syllable count here comes from the CMU pronouncing dictionary, not a guess.",
    match: (entry) => entry.sy >= 5 && isWord(entry),
  },
  {
    slug: "stress-on-last",
    name: "Words stressed at the end",
    title: "Words with stress on the final syllable",
    group: "sound",
    description:
      "Multi-syllable words whose emphasis lands last — the pattern most often got wrong by speakers of syllable-timed languages.",
    match: (entry) => entry.sy >= 2 && entry.st === entry.sy - 1,
  },
  {
    slug: "hard-to-say",
    name: "Hard to pronounce",
    title: "Words that are hard to pronounce",
    group: "sound",
    description:
      "Four syllables or more with a consonant cluster of three or more letters — words where the spelling gives the least help.",
    match: (entry) => isWord(entry) && entry.sy >= 4 && /[bcdfghjklmnpqrstvwxz]{3}/.test(letters(entry)),
  },
  {
    slug: "spelled-nothing-like-said",
    name: "Spelled nothing like they sound",
    title: "Words spelled nothing like they sound",
    group: "sound",
    description:
      "Words with at least three more letters than phonemes — where English spelling and English speech have drifted furthest apart.",
    match: (entry) =>
      isWord(entry) && Boolean(entry.ip) && letters(entry).length - entry.ip.replace(/[ˈˌ]/g, "").length >= 3,
  },

  /* ---------------- Learning ---------------- */

  {
    slug: "core-english",
    name: "Core English",
    title: "The core English vocabulary",
    group: "learning",
    description:
      "The words carrying the most work in everyday English — top commonness band, ordered by how many senses each has been stretched to cover.",
    match: (entry) => entry.c === 5 && isWord(entry),
  },
  {
    slug: "everyday-words",
    name: "Everyday words",
    title: "Everyday English words",
    group: "learning",
    description: "Common vocabulary a step beyond the core — the words that make writing sound natural rather than basic.",
    match: (entry) => entry.c === 4 && isWord(entry),
  },
  {
    slug: "advanced-vocabulary",
    name: "Advanced vocabulary",
    title: "Advanced English vocabulary",
    group: "learning",
    description:
      "Uncommon words of three syllables or more that still carry a usage example — the band that competitive exams and serious writing draw on. Selected by frequency band, not copied from any exam's official list.",
    match: (entry) =>
      isWord(entry) && entry.c <= 2 && entry.sy >= 3 && senses(entry).some((sense) => sense.ex?.length),
  },
  {
    slug: "words-with-many-meanings",
    name: "Words with the most meanings",
    title: "Words with the most meanings",
    group: "learning",
    description:
      "Entries carrying ten senses or more. These are the words worth reading all the way down, because the meaning you know is rarely the only one.",
    match: (entry) => entry.ns >= 10,
  },
  {
    slug: "words-with-opposites",
    name: "Words with clear opposites",
    title: "Words with clear opposites",
    group: "learning",
    description: "Entries where WordNet records a direct antonym — the pairs worth learning together.",
    match: (entry) => senses(entry).some((sense) => sense.an?.length),
  },
  {
    slug: "verbs-worth-knowing",
    name: "Verbs worth knowing",
    title: "Precise verbs worth knowing",
    group: "learning",
    description:
      "Uncommon verbs with a usage example attached — the single fastest way to stop writing 'do', 'get' and 'make' three times a paragraph.",
    match: (entry) =>
      isWord(entry) && entry.p[0] === "v" && entry.c <= 3 && senses(entry).some((sense) => sense.ex?.length),
  },
  {
    slug: "adjectives-worth-knowing",
    name: "Adjectives worth knowing",
    title: "Precise adjectives worth knowing",
    group: "learning",
    description: "Descriptive adjectives beyond the everyday band, each with at least one recorded example of use.",
    match: (entry) =>
      isWord(entry) && entry.p[0] === "a" && entry.c <= 3 && senses(entry).some((sense) => sense.ex?.length),
  },
  {
    slug: "adverbs",
    name: "Adverbs",
    title: "English adverbs",
    group: "learning",
    description: "The smallest of the four open word classes, and the one most often overused.",
    match: (entry) => entry.p.includes("r") && isWord(entry),
  },
  {
    slug: "abstract-nouns",
    name: "Abstract nouns",
    title: "Abstract nouns",
    group: "learning",
    description:
      "Nouns for states, qualities and ideas rather than things you can point at — WordNet's attribute, state and cognition files combined.",
    match: (entry) =>
      hasDomain(entry, "noun.attribute") || hasDomain(entry, "noun.state") || hasDomain(entry, "noun.cognition"),
  },
  {
    slug: "concrete-nouns",
    name: "Concrete nouns",
    title: "Concrete nouns",
    group: "learning",
    description: "Nouns for things with physical existence — objects, substances, artifacts, bodies, plants and animals.",
    match: (entry) =>
      ["noun.object", "noun.artifact", "noun.substance", "noun.body", "noun.plant", "noun.animal"].some((domain) =>
        hasDomain(entry, domain),
      ),
  },
  {
    slug: "every-verb",
    name: "Every verb",
    title: "Every English verb",
    group: "learning",
    description: "The complete verb vocabulary of the corpus, ordered by commonness.",
    match: (entry) => hasDomainStartingWith(entry, "verb.") && isWord(entry),
  },
  {
    slug: "every-adjective",
    name: "Every adjective",
    title: "Every English adjective",
    group: "learning",
    description: "The complete adjective vocabulary, ordered by commonness.",
    match: (entry) => hasDomainStartingWith(entry, "adj.") && isWord(entry),
  },
]);

export const COLLECTIONS_BY_SLUG = Object.freeze(
  COLLECTIONS.reduce((acc, collection) => {
    acc[collection.slug] = collection;
    return acc;
  }, {}),
);

export const collectionsInGroup = (groupId) => COLLECTIONS.filter((c) => c.group === groupId);
