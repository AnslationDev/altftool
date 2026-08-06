/*
 * AltF Lexicon — Learn guides.
 *
 * Eight explanations of the machinery a dictionary usually leaves implicit:
 * how syllables divide, how stress is found, what a part of speech actually
 * tests for, why a thesaurus that pools senses gives you the wrong word, and
 * why 825 entries carry ten meanings while most carry one.
 *
 * Every claim about English that can be counted is counted. Numbers are not
 * written into the prose — they are `{{tokens}}` resolved at render time from
 * `getManifest()` and `getFacets()`, so a guide cannot drift away from the
 * corpus it describes when the corpus is regenerated. `buildFacts` is the
 * whole list of what a guide is allowed to assert numerically.
 *
 * Where the corpus cannot support a claim, the guide says so rather than
 * reaching for a plausible figure. There is no etymology anywhere in here,
 * because WordNet does not carry any.
 */

/* ------------------------------------------------------------------ *
 * Facts
 * ------------------------------------------------------------------ */

const TOKEN = /\{\{([a-zA-Z0-9_.-]+)\}\}/g;

/** Every number a guide may cite, keyed by the token that produces it. */
export function buildFacts({ manifest, facets }) {
  const n = (value) => Number(value ?? 0).toLocaleString("en-US");

  const facts = {
    total: n(manifest.total),
    indexable: n(manifest.indexable),
    words: n(manifest.words),
    phrases: n(manifest.phrases),
    senses: n(manifest.senses),
    withPronunciation: n(manifest.withPronunciation),
    withSyllables: n(manifest.withSyllables),
    withExamples: n(manifest.withExamples),
    withFrequency: n(manifest.withFrequency),
    rhymeGroups: n(manifest.rhymeGroups),
    collections: n(manifest.collections),

    // Single words that get a spelling-derived split and no transcription,
    // because they are not in the pronouncing dictionary.
    noTranscription: n(manifest.withSyllables - manifest.withPronunciation),
    sensesPerEntry: (manifest.senses / manifest.total).toFixed(1),

    nouns: n(facets.pos.n),
    verbs: n(facets.pos.v),
    adjectives: n(facets.pos.a),
    adverbs: n(facets.pos.r),
    posTotal: n(facets.pos.n + facets.pos.v + facets.pos.a + facets.pos.r),

    rare: n(facets.commonness["1"]),
    uncommon: n(facets.commonness["2"]),
    familiar: n(facets.commonness["3"]),
    common: n(facets.commonness["4"]),
    core: n(facets.commonness["5"]),

    syl1: n(facets.syllables["1"]),
    syl2: n(facets.syllables["2"]),
    syl3: n(facets.syllables["3"]),
    syl4: n(facets.syllables["4"]),
    sylMax: Math.max(...Object.keys(facets.syllables).map(Number)),
  };

  // Percentages that a guide leans on, computed rather than typed.
  facts.pctManyMeanings = (
    ((facets.collection["words-with-many-meanings"] ?? 0) / manifest.total) *
    100
  ).toFixed(1);
  facts.pctPhrases = ((manifest.phrases / manifest.total) * 100).toFixed(0);
  facts.pctTranscribed = ((manifest.withPronunciation / manifest.withSyllables) * 100).toFixed(0);

  for (const [slug, count] of Object.entries(facets.collection ?? {})) {
    facts[`c.${slug}`] = n(count);
  }

  return facts;
}

/** Replace `{{token}}` with its number. An unknown token is left visible on purpose. */
export function fillFacts(text, facts) {
  return String(text).replace(TOKEN, (match, key) => facts[key] ?? match);
}

/** Every token used anywhere in the guides — the verification hook. */
export function usedTokens() {
  const found = new Set();
  const walk = (value) => {
    if (typeof value === "string") {
      for (const match of value.matchAll(TOKEN)) found.add(match[1]);
    } else if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(walk);
    }
  };
  walk(GUIDES);
  return [...found];
}

/* ------------------------------------------------------------------ *
 * Guides
 * ------------------------------------------------------------------ */

export const GUIDES = [
  /* ---------------------------------------------------------------- */
  {
    slug: "syllables-and-stress",
    title: "How English syllables work, and how to find the stressed one",
    summary:
      "What a syllable is made of, where the breaks fall and why, and four tests that locate the stressed syllable in a word you have never said aloud.",
    readingTime: 9,
    updated: "2026-07-29",
    keywords: [
      "how many syllables",
      "how to count syllables",
      "word stress English",
      "which syllable is stressed",
      "syllable rules English",
    ],
    answer:
      "A syllable is one beat of a word, built around a single vowel sound. Count vowel sounds, not vowel letters: “queue” has four vowel letters and one syllable. In every English word of more than one syllable, exactly one syllable is stressed — said louder, longer and on a higher pitch — and the others reduce. To find it, say the word as a question: your pitch rises on the stressed syllable.",
    sections: [
      {
        heading: "A syllable is a vowel sound with things attached",
        body: [
          "Every syllable has exactly one vowel sound at its centre. Consonants before it are the onset, consonants after it are the coda, and either can be empty. That is the whole structure: “a” is a syllable with no onset and no coda, “strengths” is one syllable with a three-consonant onset and a four-consonant coda.",
          "This is why counting letters fails. “Queue” has four vowel letters and one vowel sound. “Rhythm” has one vowel letter and two vowel sounds. The question is never how the word is spelled; it is how many times your jaw opens.",
          "Across the {{withSyllables}} single words in this dictionary, {{syl1}} are one syllable, {{syl2}} are two and {{syl3}} are three — three-syllable words are the largest group, and the longest entries run to {{sylMax}} syllables.",
        ],
      },
      {
        heading: "Where the break falls: the rule that decides",
        body: [
          "Given a run of consonants between two vowels, English has to decide which syllable they belong to. The deciding factor is the vowel in front of them.",
          "English vowels split into two kinds. Lax vowels — the ones in bet, bit, book, hat, cut — cannot end a syllable, so they pull the following consonant back to close themselves: BET-ter, HAP-py, BOX-es. Tense vowels — the ones in beat, boot, bait, boat — can end a syllable perfectly well, so the consonant travels forward to start the next one: WA-ter, O-pen, TA-ble.",
          "That single distinction is what separates a dictionary-style split from the naive vowel-counting most syllable tools do. It is also why our splits require a pronouncing dictionary rather than a spelling rule: “water” and “wetter” look identical in structure and divide differently, because the vowels are different sounds.",
        ],
        list: [
          "bet·ter, hap·py, mes·sage — lax vowel, consonant pulled back to close the syllable.",
          "wa·ter, o·pen, la·bel — tense vowel, consonant moves forward to open the next syllable.",
          "hun·gry — the run “ngr” splits so the next syllable takes “gr”, because no English syllable can begin “ngr”.",
          "qui·et — “qu” is an onset, never a nucleus, so it is never split as “qu·iet”.",
        ],
      },
      {
        heading: "Stress is four things happening at once",
        body: [
          "A stressed syllable is louder, longer, higher in pitch, and keeps its full vowel. The last of those matters most for finding it, because English does something unusual: unstressed vowels collapse towards a single neutral sound, the one written “uh” in our respellings and /ə/ in IPA.",
          "The clearest demonstration is a word family that keeps its letters and moves its stress. Photograph is FOH-tuh-graf, stressed first. Photographer is fuh-TAH-gruh-fur, stressed second. Photographic is foh-tuh-GRAF-ik, stressed third. The spelling barely changes; almost every vowel sound does, because whichever syllable loses the stress loses its vowel quality with it.",
          "This is also why a learner who pronounces every syllable clearly and evenly sounds wrong even when every individual sound is right. English rhythm is built out of the contrast between full and reduced syllables, not out of clarity.",
        ],
      },
      {
        heading: "Four tests that find the stress",
        body: [
          "None of these require you to know anything about phonetics. They work because they exaggerate one of the four things stress does.",
        ],
        list: [
          "Say it as a question. “PhoTOgrapher?” — your pitch climbs on the stressed syllable and falls after it.",
          "Shout it across a room. Volume alone is unreliable, but shouting stretches the stressed syllable, and length is easy to hear.",
          "Hum the word without saying it. What survives is the stress pattern: da-DA-da-da is unmistakably photographer, not photograph.",
          "Look for the full vowel in our respelling. In fuh-TAH-gruh-fur, three syllables have collapsed to “uh” and one has not. The one that has not is the stressed one — and it is the one printed in capitals.",
        ],
      },
      {
        heading: "Stress moves, and some endings move it predictably",
        body: [
          "English stress is not fixed to a position the way it is in Czech (first) or Polish (second-last). But it is not random either: a handful of suffixes reliably pull it.",
          "Endings in -ic, -ical, -ity, -tion and -sion pull the stress onto the syllable immediately before them. Sensitive is SEN-suh-tiv; sensitivity is sen-si-TIV-i-tee. Democracy is di-MAH-kruh-see; democratic is dem-uh-KRAT-ik.",
          "Endings in -ee, -eer, -ese and -esque take the stress onto themselves. Volunteer is vah-luhn-TIR; Japanese is jap-uh-NEEZ. This is the pattern behind {{c.stress-on-last}} entries in the corpus whose stress lands on the final syllable — the pattern speakers of syllable-timed languages most often miss.",
          "Endings in -ly, -ness, -ment, -ful and -er do the opposite: they attach without disturbing the stress at all. Friendly, kindness, movement and quicker all keep the stress where the base word had it.",
        ],
      },
      {
        heading: "What we can and cannot tell you",
        body: [
          "{{withPronunciation}} entries carry a transcription from the CMU Pronouncing Dictionary, which means their syllable division and stress position are recorded rather than inferred. That is {{pctTranscribed}}% of the {{withSyllables}} single words in the corpus.",
          "The other {{noTranscription}} get a syllable split derived from their spelling, and no phonetic transcription at all. Their entry pages say so. A guessed IPA string that looks authoritative is worse than an admitted gap, because a reader has no way to tell the two apart.",
          "Stress position is also, for a few words, genuinely contested between varieties of English — and a single marked syllable cannot represent that. Where our transcription differs from the one in your head, it is showing you General American, which is what the CMU dictionary records.",
        ],
      },
    ],
    faqs: [
      {
        question: "How do I count the syllables in a word?",
        answer:
          "Count vowel sounds, not vowel letters, and ignore silent letters entirely. Saying the word slowly while resting a hand under your chin works because your jaw drops once per syllable. “Chocolate” is usually two drops, not three.",
      },
      {
        question: "Does every English word have a stressed syllable?",
        answer:
          "Every word of more than one syllable has exactly one primary stress. One-syllable words — {{syl1}} of them here — carry stress only when the sentence gives it to them, which is why “I said the book, not a book” can stress either word.",
      },
      {
        question: "What is the difference between primary and secondary stress?",
        answer:
          "Primary stress is the strongest beat; secondary stress is a weaker one that still keeps its vowel from reducing. In IPA they are marked ˈ and ˌ. Our syllable line marks only the primary, because a device that marks two levels of emphasis stops being readable at a glance, which was the point of drawing it.",
      },
      {
        question: "Why do dictionaries disagree about where syllables break?",
        answer:
          "Because two defensible principles conflict. Maximal onset says a consonant starts the next syllable wherever that is legal; the lax-vowel rule says a checked vowel must be closed. We follow the second for the printed split, so the syllable line and the respelling under it never contradict each other on the same page.",
      },
    ],
    related: ["reading-our-respelling", "growing-your-vocabulary"],
    explore: [
      { href: "/lexicon/word/photographer", label: "photographer", hint: "Stress on the second syllable" },
      { href: "/lexicon/word/serendipity", label: "serendipity", hint: "Five syllables, stress in the middle" },
      { href: "/lexicon/collections/one-syllable", label: "One-syllable words", hint: "The single-beat backbone" },
      { href: "/lexicon/collections/stress-on-last", label: "Words stressed at the end", hint: "The pattern most often missed" },
      { href: "/lexicon/collections/hard-to-say", label: "Words that are hard to pronounce", hint: "Long, with heavy clusters" },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    slug: "reading-our-respelling",
    title: "Reading IPA without learning IPA: our respelling scheme explained",
    summary:
      "Every entry prints a pronunciation twice — once in IPA and once in plain letters. This is what each respelling symbol means, why ahy and uu look strange, and what the scheme deliberately throws away.",
    readingTime: 8,
    updated: "2026-07-29",
    keywords: [
      "phonetic respelling",
      "how to read IPA",
      "pronunciation key",
      "English pronunciation guide",
      "what does ahy mean",
    ],
    answer:
      "A respelling writes a pronunciation using ordinary English letters instead of phonetic symbols: serendipity is ser-uhn-DIP-i-tee. Hyphens mark syllable breaks, capitals mark the stressed syllable, and each vowel spelling always means the same sound — “oo” is always the vowel of boot, “uu” is always the vowel of book. It is less precise than IPA and readable without training, which is why every entry here carries both.",
    sections: [
      {
        heading: "Why two notations for the same thing",
        body: [
          "IPA is exact. One symbol, one sound, no ambiguity across any language. It is also a notation you have to learn before it tells you anything, and most readers have not learned it — which makes it a pronunciation guide that does not guide.",
          "A respelling is the opposite trade. It uses letters you already read, so it works on sight, and it pays for that with precision: it cannot distinguish sounds that English spelling has no separate letters for. Neither one is the better choice, so {{withPronunciation}} entries carry both, plus the syllable line above them showing where the stress falls.",
          "Read them together and each covers the other's gap. The syllable line shows the shape, the respelling gets you speaking, and the IPA settles any argument about which vowel is meant.",
        ],
      },
      {
        heading: "How to read a respelling",
        body: [
          "Three conventions, and then the vowel table below does the rest.",
        ],
        list: [
          "Hyphens are syllable breaks. ser-uhn-DIP-i-tee is five syllables.",
          "CAPITALS mark the stressed syllable. There is exactly one in every word of more than one syllable, and none in a word of one — a single-syllable respelling is printed entirely in lower case, like “lahyt”.",
          "Consonants are read as you would expect: b, d, f, k, l, m, n, p, r, s, t, v, w, y, z, plus ch, sh, th, ng, zh. The only one that surprises people is “th”, which covers both the sound in thin and the sound in this — English spelling does not distinguish them either.",
        ],
      },
      {
        heading: "The five spellings that need explaining",
        body: [
          "Most of the scheme reads itself. These five are the ones readers ask about, and each of them is a deliberate choice rather than an accident.",
        ],
        table: {
          caption: "Respelling symbols that are not self-evident",
          head: ["Spelling", "IPA", "Sound of", "In our entries"],
          rows: [
            ["ahy", "/aɪ/", "light, my, island", "lahyt · AHY-luhnd · KWAHY-ur (choir)"],
            ["uh", "/ə/ and /ʌ/", "about, cup, the second vowel of rhythm", "uh-BOWT · RITH-uhm · KUHL-ur (colour)"],
            ["oo", "/u/", "boot, blue, queue", "boot · kyoo (queue) · throo (through)"],
            ["uu", "/ʊ/", "book, put, could", "buuk · KUUK-ee (cookie)"],
            ["ur", "/ɝ/ and /ɚ/", "bird, her, the ending of better", "burd · KUR-nuhl (colonel) · THUR-oh (thorough)"],
          ],
        },
      },
      {
        heading: "Why ahy and not eye",
        body: [
          "“Eye” is the clearest way to write the /aɪ/ sound on its own. It falls apart the moment anything is attached to it: “light” becomes “leyet”, which nobody can read. The sequence has to survive a consonant on either side.",
          "“Ay” was unavailable — it already carries the different vowel of rain and pavement (PAYV-muhnt). Published dictionaries settled on “ahy” for exactly this reason, and it is the one respelling here that has to be learned rather than guessed.",
          "The same logic explains “uu”. English writes both the vowel of boot and the vowel of book as “oo”, so a respelling that used “oo” for both would be no help at all in the one case where a reader actually needs help. Boot keeps “oo”; book gets “uu”.",
        ],
      },
      {
        heading: "What the respelling throws away on purpose",
        body: [
          "It is lossier than the IPA on the same page, in three specific ways, and knowing which three tells you when to look at the IPA instead.",
          "It does not distinguish stressed from unstressed r-coloured vowels. Bird and the ending of better are both written “ur”, where IPA writes /ɝ/ and /ɚ/. It does not distinguish the vowel of cup from the reduced vowel of about: both are “uh”, where IPA writes /ʌ/ and /ə/. And it marks only primary stress, not secondary.",
          "It also represents one accent. The transcriptions come from the CMU Pronouncing Dictionary, which records General American. If you say “bath” with the vowel of “father”, or do not pronounce the r in “bird”, the respelling is not describing your accent — it is describing a common one, consistently.",
          "Finally, {{noTranscription}} single words have no CMU entry at all. Those get a syllable split derived from their spelling and no respelling or IPA, and their pages say so. Words like lakh and crore fall in this gap: entirely standard in Indian English, absent from an American pronouncing dictionary.",
        ],
      },
      {
        heading: "A worked example, symbol by symbol",
        body: [
          "Serendipity is transcribed /ˌsɛɹənˈdɪpɪti/ and respelled ser-uhn-DIP-i-tee. Reading them against each other is the fastest way to learn the correspondences.",
          "The opening ˌsɛɹ is “ser” — the ˌ is a secondary stress the respelling does not mark. Then ən is “uhn”: an unstressed vowel, reduced, which is what “uh” always means. Then ˈdɪp carries the ˈ primary stress, so the respelling capitalises it: DIP. Then ɪ is “i”, and ti is “tee”, because /i/ at the end of a word is the vowel of see rather than of sit.",
          "Once you have done that twice, the IPA stops being opaque. That is the actual purpose of printing both: not to make you choose, but to let one teach you the other.",
        ],
      },
    ],
    faqs: [
      {
        question: "What does “ahy” mean in a pronunciation?",
        answer:
          "It is the vowel sound of light, my and island — /aɪ/ in IPA. It is written “ahy” rather than “eye” because “eye” cannot take consonants either side without becoming unreadable, and “ay” already means the different vowel of rain.",
      },
      {
        question: "What is the difference between “oo” and “uu”?",
        answer:
          "“oo” is the long vowel of boot and blue; “uu” is the short vowel of book and put. English spells both with the letters oo, which is precisely why a pronunciation guide has to separate them.",
      },
      {
        question: "Which accent do your pronunciations show?",
        answer:
          "General American, because that is what the CMU Pronouncing Dictionary records. It is stated rather than hidden: a dictionary that presents one accent as the pronunciation is making a claim it cannot support.",
      },
      {
        question: "Why do some words have no pronunciation at all?",
        answer:
          "{{noTranscription}} of the {{withSyllables}} single words in the corpus are not in the pronouncing dictionary. Those entries show a syllable split derived from their spelling and print no IPA and no respelling. Inventing one that looked authoritative would be the only thing on the page a reader could not check.",
      },
    ],
    related: ["syllables-and-stress", "british-american-and-indian-english"],
    explore: [
      { href: "/lexicon/word/serendipity", label: "serendipity", hint: "The worked example, in full" },
      { href: "/lexicon/word/colonel", label: "colonel", hint: "KUR-nuhl — spelled nothing like it sounds" },
      { href: "/lexicon/word/choir", label: "choir", hint: "KWAHY-ur" },
      { href: "/lexicon/collections/spelled-nothing-like-said", label: "Words spelled nothing like they sound", hint: "Where spelling and speech diverge most" },
      { href: "/lexicon/collections/silent-letters", label: "Words with silent letters", hint: "Letters the pronunciation ignores" },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    slug: "the-four-parts-of-speech",
    title: "The four parts of speech, and the test that tells them apart",
    summary:
      "Noun, verb, adjective, adverb — defined by where they fit in a sentence rather than by what they mean, which is the only definition that survives contact with real words.",
    readingTime: 8,
    updated: "2026-07-29",
    keywords: [
      "parts of speech",
      "noun verb adjective adverb",
      "how to identify parts of speech",
      "what part of speech is this word",
      "grammar basics English",
    ],
    answer:
      "English has four open word classes: nouns, verbs, adjectives and adverbs. The reliable way to tell them apart is a slot test rather than a meaning test — a noun fits “the ___ is here”, a verb fits “they ___ed yesterday”, an adjective fits “a very ___ thing”, an adverb fits “she did it ___”. Meaning-based definitions fail immediately: “arrival” is a noun and it is not a person, place or thing.",
    sections: [
      {
        heading: "Four classes, and the ones that are missing",
        body: [
          "This dictionary records four parts of speech: {{nouns}} noun entries, {{adjectives}} adjective entries, {{verbs}} verb entries and {{adverbs}} adverb entries. Those add to {{posTotal}} across only {{total}} entries, because a great many words belong to more than one class.",
          "They are the four open classes — open because new members join constantly. English gained new nouns and verbs this year and will gain more next year. What is missing is the closed classes: determiners (the, a, this), prepositions (of, in, between), pronouns (she, which), conjunctions (and, because) and auxiliaries (have, will). They are missing because WordNet is a database of lexical meaning, and those words do grammatical work rather than carrying a meaning you could gloss.",
          "That is a real limit and worth stating plainly. If you look up “the” here you will not find a determiner entry, and that is not an oversight in the corpus — it is the boundary of what the corpus is for.",
        ],
      },
      {
        heading: "Why meaning-based definitions fail",
        body: [
          "The school definition — a noun is a person, place or thing — collapses on contact with ordinary English. Arrival is not a thing. Honesty is not a thing. The running of the race is not a thing. All three are nouns.",
          "It fails in the other direction too. “Sleep” names an activity, which sounds verb-like, but “a good sleep” shows it is also a noun. Meaning does not determine class, because the same meaning can be packaged in any class: destroy, destruction, destructive, destructively all describe one event.",
          "What a part of speech actually is, is a statement about distribution — which slots in a sentence a word can occupy. So the test that works is a slot test.",
        ],
      },
      {
        heading: "The frame test",
        body: [
          "Put the word in the frame. If it fits without the sentence going strange, it belongs to that class. Try each frame in turn; a word that fits several belongs to several.",
        ],
        table: {
          caption: "A frame for each of the four open classes",
          head: ["Class", "Frame", "Extra check"],
          rows: [
            ["Noun", "The ___ is here. / I saw a ___.", "Can it take a plural or a possessive? one dog, two dogs, the dog’s"],
            ["Verb", "They ___ every day. / They ___ed yesterday.", "Can it take -ing and a past tense? running, ran"],
            ["Adjective", "It is a very ___ thing.", "Can it compare? bigger, biggest — or “more careful”"],
            ["Adverb", "She did it ___. / It was ___ obvious.", "Does it modify a verb, an adjective or another adverb?"],
          ],
        },
      },
      {
        heading: "One word, several classes",
        body: [
          "This is normal, not exceptional. “Fast” is an adjective, a verb, an adverb and a noun in this corpus, across 15 senses. “Well” covers all four across 22. “Present” carries 18 senses spread over verb, noun and adjective.",
          "Because of that, every word page here groups senses by part of speech instead of running them together in one numbered list. When you look up “light”, the six adjective senses are separated from the noun senses and the verb senses, so you can go straight to the class you meant rather than reading past 40 meanings you did not.",
          "It also matters for pronunciation. A handful of two-syllable words shift their stress with their class — the noun REC-ord against the verb ruh-KAWRD, the noun OB-ject against the verb ob-JECT. Our transcription records one stress per entry, which is a real limitation on exactly these words, and the entry pages do not pretend otherwise.",
        ],
      },
      {
        heading: "Adverbs are the small class, and the leaky one",
        body: [
          "There are only {{adverbs}} adverb entries here against {{nouns}} nouns — adverbs are by far the smallest of the four, and the class where the usual shortcut lets you down.",
          "The shortcut is “-ly means adverb”. It is wrong in both directions. Friendly, lovely, likely and costly are adjectives ending in -ly. Fast, well, hard, straight and early are adverbs with no -ly at all: “drive fast”, “slept well”, “works hard”.",
          "Run the frame test instead. “She did it friendly” fails; “she did it fast” works. The suffix is a hint, and the slot is the answer.",
        ],
        list: [
          "friendly, lovely, costly, likely — adjectives, despite the -ly.",
          "fast, well, hard, straight, late, early — adverbs, without one.",
          "hardly is not the adverb of hard: “works hard” and “hardly works” mean opposite things.",
        ],
      },
      {
        heading: "Why any of this is worth knowing",
        body: [
          "Three practical payoffs. It tells you which senses of a long entry to read — knowing you want the verb “run” cuts a 57-sense entry down to something manageable. It tells you which synonyms are even candidates, because a synonym has to belong to the same class as the word it replaces. And it explains why a word feels wrong in a sentence when every individual word in it is correct.",
          "It is also the layer beneath most grammar advice. “Do not use adverbs” is really advice about a distributional class; so is “nominalisation makes prose heavy”, which is a complaint about turning verbs into nouns.",
        ],
      },
    ],
    faqs: [
      {
        question: "How many parts of speech does English have?",
        answer:
          "Traditionally eight or nine, but only four are open classes that gain new members: nouns, verbs, adjectives and adverbs. This dictionary records those four — {{posTotal}} entries across the {{total}} in the corpus — because they are the classes that carry lexical meaning.",
      },
      {
        question: "Can a word be more than one part of speech?",
        answer:
          "Constantly. The four class counts here add up to {{posTotal}} across {{total}} entries, and the excess is words in more than one class. “Fast” is in all four.",
      },
      {
        question: "Is every word ending in -ly an adverb?",
        answer:
          "No. Friendly, lovely, costly and likely are adjectives. And many common adverbs — fast, well, hard, straight — have no -ly. Use the frame test: an adverb fits “she did it ___”, an adjective fits “a very ___ thing”.",
      },
      {
        question: "Why can’t I find “the” or “because” in this dictionary?",
        answer:
          "They are function words, and WordNet records lexical meaning rather than grammatical machinery. Determiners, prepositions, pronouns, conjunctions and auxiliaries are outside it. Every entry here belongs to one of the four open classes.",
      },
    ],
    related: ["synonyms-are-not-interchangeable", "broader-and-narrower-words"],
    explore: [
      { href: "/lexicon/word/fast", label: "fast", hint: "All four classes in one entry" },
      { href: "/lexicon/word/present", label: "present", hint: "18 senses across three classes" },
      { href: "/lexicon/collections/every-verb", label: "Every verb", hint: "The complete verb vocabulary" },
      { href: "/lexicon/collections/every-adjective", label: "Every adjective", hint: "Ordered by commonness" },
      { href: "/lexicon/collections/adverbs", label: "Adverbs", hint: "The smallest open class" },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    slug: "synonyms-are-not-interchangeable",
    title: "Synonyms are not interchangeable, and sense-grouping is why",
    summary:
      "A synonym belongs to a meaning, not to a word. Pooling every synonym of every sense into one list is how a thesaurus hands you a word that is technically correct and obviously wrong.",
    readingTime: 8,
    updated: "2026-07-29",
    keywords: [
      "synonyms",
      "how to use a thesaurus",
      "are synonyms interchangeable",
      "word choice",
      "sense grouping synonyms",
    ],
    answer:
      "Synonymy holds between senses, not between words. “Keen” and “sharp” are synonyms in the sense of drawing fine distinctions — a keen mind, a sharp mind — and not synonyms in the sense of harsh, where sharp pairs with tart and keen does not appear at all. A thesaurus that pools all senses of a word into one list produces sets whose members cannot substitute for each other in your sentence.",
    sections: [
      {
        heading: "What a synonym actually is",
        body: [
          "In the lexical database behind this dictionary, meanings are the primary objects. A meaning is a set of words that can express it, and that set is the synonym list. “Sharp” does not have synonyms; each of its 15 senses does.",
          "The consequence is immediate and easy to miss. Two words are synonyms only relative to a sense, so the true statement is never “keen means sharp”. It is “keen and sharp share this sense and not that one”.",
          "That is why every synonym list on this site is printed inside a sense rather than at the top of the entry. It is more work to render and it is the only arrangement that is true.",
        ],
      },
      {
        heading: "The example, in full",
        body: [
          "Sharp, sense 3, is “having or demonstrating ability to recognize or draw fine distinctions”. Its recorded synonyms are acute, discriminating, incisive, keen and knifelike. So keen is a synonym of sharp — here.",
          "Sharp, sense 5, is “harsh”. Its recorded synonyms are sharp-worded and tart. Keen is absent. A sharp remark is not a keen remark, and no amount of the two words being “synonyms” makes that substitution work.",
          "Keen has senses sharp does not reach at all — sense 3 of keen is “very good”, with synonyms bang-up, bully, corking, cracking and dandy, a set nobody would arrive at from the word sharp. And keen has a noun sense, a funeral lament, which shares nothing with any of it.",
        ],
      },
      {
        heading: "What pooling does to a thesaurus",
        body: [
          "Flatten a polysemous entry and you get a list where most pairs are not substitutable. “Fine” has 10 senses here. Sense 1 is “being satisfactory”, with synonyms all right, o.k., okay and hunky-dory. Other senses cover thinness, fineness of texture, and purity of a metal.",
          "Pooled, that entry offers hunky-dory as a synonym of fine. Which is true — for one sense out of ten. Apply it to “a fine thread” and you get nonsense, and the thesaurus that handed it to you gave no indication which of the ten it came from.",
          "This is the single most common way a thesaurus makes writing worse. The replacement is not a word the writer misunderstood; it is a word the tool presented without the context that made it correct.",
        ],
      },
      {
        heading: "Three things a synonym still does not carry",
        body: [
          "Even inside the right sense, substitutability is not guaranteed. Sense-grouping fixes the largest error, not every error.",
        ],
        list: [
          "Register. {{c.informal}} entries carry an informality label and {{c.slang}} are marked slang. Within one sense, one member may be neutral and another unusable in a report.",
          "Region. {{c.region-united-kingdom}} entries carry a British usage label, {{c.american-english}} an American one. A synonym that is ordinary in one place is conspicuous in the other.",
          "Collocation — which words a word habitually stands next to. “Strong tea” and “powerful tea” describe the same thing and only one is English. No lexical database records this, including ours, and the only reliable source for it is reading.",
        ],
      },
      {
        heading: "Antonyms work differently, and more strictly",
        body: [
          "{{c.words-with-opposites}} entries here carry a directly recorded antonym. That is a much smaller number than the synonym coverage, and the reason is that antonymy is recorded between specific word forms rather than between meanings in general.",
          "Hot and cold are recorded as antonyms; hot and chilly are not, even though chilly and cold share a sense. The opposite relation attaches to the pair, not to the concept, and it does not travel across a synonym set.",
          "That makes antonyms unusually reliable when they exist. If two words are listed as opposites here, a lexicographer recorded that pair, and antonym pairs are the most efficient vocabulary to learn together because each one anchors the other.",
        ],
      },
      {
        heading: "How to actually use the entries",
        body: [
          "Find the sense you mean first, then read only its synonyms. On a word page the senses are grouped by part of speech and numbered, and each carries its own synonyms, antonyms, broader terms and narrower terms in its own block.",
          "If your candidate replacement looks promising, open its page and check which of its senses your sense corresponds to. A word borrowed from sense 3 of one entry and dropped into sense 1 of another is exactly the failure this whole arrangement exists to prevent.",
          "And when the entry lists no synonym for a sense — which is common — that is information, not a gap. The more precisely a sense is drawn, the fewer other words land on it.",
        ],
      },
    ],
    faqs: [
      {
        question: "Are synonyms always interchangeable?",
        answer:
          "No. Synonymy holds between senses, so two words can be synonyms in one meaning and unrelated in another. Keen and sharp are synonyms for “drawing fine distinctions” and not for “harsh”.",
      },
      {
        question: "Why does this dictionary list synonyms under each meaning instead of once at the top?",
        answer:
          "Because a single pooled list is wrong for every sense but one. An entry with ten meanings has ten synonym sets, and merging them produces a list whose members cannot replace each other in your sentence.",
      },
      {
        question: "How do I choose between two synonyms in the same sense?",
        answer:
          "Check register, region and collocation in that order. Two words in one sense can differ in formality, in which country they are ordinary, and in which words they habitually appear beside. The last of those is not recorded in any lexical database and only reading supplies it.",
      },
      {
        question: "Why do some senses have no synonyms at all?",
        answer:
          "Because the sense is drawn precisely. A meaning that only one word expresses is the normal case for specific vocabulary, and an empty synonym list is an accurate statement rather than missing data.",
      },
    ],
    related: ["polysemy-and-frequency", "the-four-parts-of-speech"],
    explore: [
      { href: "/lexicon/word/sharp", label: "sharp", hint: "15 senses, each with its own synonyms" },
      { href: "/lexicon/word/keen", label: "keen", hint: "Where it overlaps sharp, and where it does not" },
      { href: "/lexicon/word/fine", label: "fine", hint: "Ten senses that pool badly" },
      { href: "/lexicon/collections/words-with-opposites", label: "Words with clear opposites", hint: "Entries with a recorded antonym" },
      { href: "/lexicon/collections/informal", label: "Informal words", hint: "Register, as a label" },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    slug: "polysemy-and-frequency",
    title: "Why a few words have fifty meanings and most have one",
    summary:
      "{{c.words-with-many-meanings}} entries carry ten senses or more; the corpus average is {{sensesPerEntry}}. The words at the top are short, old and ones you use daily — and that is not a coincidence.",
    readingTime: 8,
    updated: "2026-07-29",
    keywords: [
      "polysemy",
      "words with the most meanings",
      "why do words have multiple meanings",
      "most meanings English word",
      "word frequency and meaning",
    ],
    answer:
      "Across {{total}} entries this dictionary records {{senses}} distinct senses — an average of {{sensesPerEntry}} per entry. Only {{c.words-with-many-meanings}} entries, {{pctManyMeanings}}% of the corpus, carry ten meanings or more, and almost all of them are short, common, everyday words: break, cut, run, play, make. Rare and technical words carry one meaning because they were coined to carry exactly one.",
    sections: [
      {
        heading: "The shape of the distribution",
        body: [
          "{{senses}} senses across {{total}} entries sounds like plenty to go round. It is not distributed evenly. The great majority of entries carry a single sense, and a very small number carry dozens.",
          "{{c.words-with-many-meanings}} entries — {{pctManyMeanings}}% of the corpus — have ten senses or more. At the extreme, “break” carries 75 in this corpus, “cut” 70, “run” 57, “play” 52 and “make” 51. Every one of those is a one-syllable word in the top commonness band.",
          "At the other end, {{rare}} entries sit in the rarest band, and most of them mean one thing. A species name, a mineral, a piece of clinical vocabulary: coined for a referent, still attached to it.",
        ],
      },
      {
        heading: "Why the commonest words collect the most meanings",
        body: [
          "New meanings do not attach to words at random. They attach to words that are already available — short, familiar, cheap to say, already in everyone's mouth. When English needs to talk about something new, it reaches first for what it is already holding.",
          "So “run” acquires a sense for machinery, for software, for a candidate in an election, for a length of stocking, for a score in cricket. None of these required a new word; each borrowed a word that was already doing several jobs and could take another.",
          "The result is circular in a way that is genuinely self-reinforcing: being frequent makes a word available, being available makes it collect senses, and having many senses makes it usable in more contexts, which makes it more frequent. That is why the top of the polysemy list and the top of the frequency list are nearly the same list.",
        ],
      },
      {
        heading: "The reverse case: vocabulary coined for one job",
        body: [
          "{{c.plants}} entries here are plant words and {{c.animals}} are animal words — between them a fifth of the corpus. Almost all of them carry exactly one sense.",
          "That is not a shortcoming of the database. A name minted to designate one species designates one species. It has no history of being stretched, because nobody reaches for a technical binomial when they want to say something else.",
          "This is the practical reason a dictionary of {{total}} entries is not a vocabulary of {{total}} words to learn. Much of it is reference material that exists to be looked up once, and the part that rewards study is the small, heavily-loaded core.",
        ],
      },
      {
        heading: "What this means when you look a word up",
        body: [
          "Sense 1 is not “the” meaning, and it is not the oldest or the most basic. Senses here are in WordNet's own order, which is roughly how often each sense was tagged in annotated text — most-attested first. For a word with 40 senses, the one you want may be twelfth.",
          "So checking a spelling and reading an entry are different activities. Checking takes a glance at sense 1. Reading an entry for a common word means scanning the sense list for the one that matches your context, which is why the pages here group by part of speech first — that alone usually removes three-quarters of the list.",
          "It also means a “definition” of a common word is a fiction. There is no single statement of what “set” means. There are dozens of related uses, and the entry is a map of them rather than an answer.",
        ],
      },
      {
        heading: "What this means when you write",
        body: [
          "A common word is ambiguous in direct proportion to how common it is. If a sentence has to be unmistakable, the band-5 word is the risky choice, not the safe one — it is the word carrying the most alternative readings.",
          "The move is not to reach for something obscure. It is to reach one band out: {{common}} entries sit in the Common band and {{familiar}} in the Familiar band, and those carry far fewer competing senses while remaining words your reader knows.",
          "The exception is speech and plain instruction, where ambiguity is resolved by context faster than a rarer word can be understood. Then the heavily-polysemous word is right, precisely because everyone has all its senses loaded.",
        ],
      },
      {
        heading: "A caveat about counting senses at all",
        body: [
          "“Break has 75 meanings” is a statement about this corpus, not a fact about English. Sense counts depend entirely on how finely a lexicographer splits, and different dictionaries split differently — one may record two senses where another records five.",
          "What survives across every dictionary is the shape, not the number: a small set of frequent words carrying many senses, and a long tail carrying one. Compare figures within one dictionary and they are meaningful. Compare them across two and you are mostly measuring editorial policy.",
        ],
      },
    ],
    faqs: [
      {
        question: "Which English word has the most meanings?",
        answer:
          "In this corpus, “break”, with 75 recorded senses, followed by “cut” at 70 and “run” at 57. Other dictionaries name other winners, because the count depends on how finely senses are split rather than on the language.",
      },
      {
        question: "How many meanings does the average word have?",
        answer:
          "{{sensesPerEntry}} — {{senses}} senses across {{total}} entries. The average is misleading on its own, because most entries have one and a few have dozens.",
      },
      {
        question: "How many English words have ten or more meanings?",
        answer:
          "{{c.words-with-many-meanings}} entries here, which is {{pctManyMeanings}}% of the corpus. They are collected in one list, ordered by sense count.",
      },
      {
        question: "Is the first sense listed the main meaning?",
        answer:
          "It is the most-attested sense in the annotated corpora WordNet draws on, which is not the same as the oldest, the most basic, or the one you want. For a heavily polysemous word, read past it.",
      },
    ],
    related: ["synonyms-are-not-interchangeable", "growing-your-vocabulary"],
    explore: [
      { href: "/lexicon/word/break", label: "break", hint: "75 senses, the most in the corpus" },
      { href: "/lexicon/word/run", label: "run", hint: "57 senses across noun and verb" },
      { href: "/lexicon/collections/words-with-many-meanings", label: "Words with the most meanings", hint: "Ten senses or more" },
      { href: "/lexicon/collections/core-english", label: "The core English vocabulary", hint: "The top commonness band" },
      { href: "/lexicon/collections/advanced-vocabulary", label: "Advanced vocabulary", hint: "One band out from everyday" },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    slug: "broader-and-narrower-words",
    title: "How meaning is built: broader and narrower words",
    summary:
      "Every noun sense sits inside a hierarchy of categories. Reading it upward tells you what a word is; reading it downward tells you what your options are. Three real chains from the corpus, and the trap that derails them.",
    readingTime: 9,
    updated: "2026-07-29",
    keywords: [
      "hypernym",
      "hyponym",
      "broader and narrower terms",
      "semantic hierarchy English",
      "is a kind of relationship words",
    ],
    answer:
      "Nouns in this dictionary sit in an inheritance hierarchy: each sense has broader terms (the categories it is a kind of) and narrower terms (the kinds of it). A collie is a kind of shepherd dog, which is a kind of working dog, which is a kind of dog, which is a kind of domestic animal, which is a kind of animal. The relation holds between senses, not between spellings — which is where most attempts to follow a chain go wrong.",
    sections: [
      {
        heading: "Two relations, one test",
        body: [
          "A broader term names the category a sense belongs to. A narrower term names a subtype of it. Lexicographers call them hypernyms and hyponyms; the test for both is the same sentence.",
          "Say “an X is a kind of Y”. If that reads as true, Y is broader than X. A poodle is a kind of dog: true, so dog is broader. A dog is a kind of poodle: false. The relation only runs one way, and that asymmetry is what makes it a hierarchy rather than a web.",
          "It also inherits. If a poodle is a kind of dog and a dog is a kind of animal, a poodle is a kind of animal, without anyone recording that link directly. Everything true of the category is true of everything under it, which is the whole reason the structure is worth having.",
        ],
      },
      {
        heading: "Three chains, as recorded",
        body: [
          "These are read directly off the entries. Each arrow is one recorded broader-term link, and every step in each chain is one you can check by opening the word.",
        ],
        list: [
          "collie → shepherd dog → working dog → dog → domestic animal → animal",
          "sparrow → passerine → bird → vertebrate",
          "espresso → coffee → beverage → food → substance",
        ],
      },
      {
        heading: "What the chains show",
        body: [
          "Read upward and you get a definition. A good dictionary definition is almost always its broader term plus what distinguishes it: a collie is “a silky-coated sheepdog with a long ruff and long narrow head” — a shepherd dog, plus three distinguishing features. Once you see that pattern you see it everywhere, because it is how definitions are built.",
          "Read downward and you get options. “Dog” has narrower terms including puppy, pooch, cur, lapdog, toy dog and hunting dog; “poodle” has toy poodle, miniature poodle, standard poodle and large poodle. If your sentence needs more precision than the word you reached for, the narrower list is where the more precise word already is.",
          "The chains also show how uneven the hierarchy is. Espresso reaches “food” in three steps; sparrow reaches “vertebrate” in three. Dog breeds are recorded in more levels than beverages because the vocabulary is finer-grained, not because dogs are more deeply nested in reality.",
        ],
      },
      {
        heading: "The trap: relations connect senses, not spellings",
        body: [
          "Follow a chain by looking up each broader term as a headword and it will derail. “Dog” records “canine” among its broader terms. Look up canine as a word and its first sense is a tooth — one of the four pointed conical teeth — whose own broader term is “tooth”, then bone, then tissue. Two steps later you are in anatomy and the chain is nonsense.",
          "Nothing is wrong with the data. The link from dog runs to the animal sense of canine, not to the tooth sense. Only the display, which shows a lemma rather than a sense id, invites the wrong jump.",
          "So when you follow a broader term to its page, pick the sense that matches the one you came from. A chain that suddenly changes subject is the signal you took the wrong sense at the last step. It is also the single best demonstration of why a thesaurus organised by word rather than by meaning misleads.",
        ],
      },
      {
        heading: "Verbs and adjectives are built differently",
        body: [
          "The deep hierarchy is a noun phenomenon. There are {{nouns}} noun entries here and the structure under them runs many levels; there are {{adjectives}} adjective entries and {{adverbs}} adverb entries with almost no hierarchy at all.",
          "Verbs have something related but not identical. “Whisper” is not a kind of “speak” in the way a poodle is a kind of dog — it is a manner of speaking. Lexicographers call these troponyms, and the test sentence changes to “to X is to Y in some particular manner”.",
          "Adjectives are organised as clusters around opposites instead. A head adjective (hot, cold) anchors a group of similar adjectives that have no opposite of their own — which is why our adjective entries show “similar” terms where noun entries show broader and narrower ones. The structure of English is not uniform, and a dictionary that rendered every class the same way would be flattening something real.",
        ],
      },
      {
        heading: "Where the hierarchy stops",
        body: [
          "Climb far enough up any noun chain and you arrive at a small set of top categories — entity, abstraction, physical entity — that have nothing above them. They are marked in the corpus as a distinct file, and they are the roots the whole noun vocabulary hangs from.",
          "They are also useless in a sentence. Nobody has ever needed to call something a physical entity. Their value is structural: they are the point at which two apparently unrelated words turn out to be related, which is what lets a chain answer “what do a collie and an espresso have in common” with a real answer rather than a joke.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is a hypernym?",
        answer:
          "The broader category a word belongs to. Dog is a hypernym of poodle; animal is a hypernym of dog. This site labels them “Broader” on each sense, because the relation belongs to the sense rather than to the word.",
      },
      {
        question: "What is a hyponym?",
        answer:
          "A more specific kind. Poodle, collie and spaniel are hyponyms of dog. They are labelled “Narrower”, and they are the fastest route from a word that is nearly right to the word that is exactly right.",
      },
      {
        question: "Why does following a chain of broader terms sometimes go strange?",
        answer:
          "Because the link runs between senses and the page shows you a word. “Canine” is broader than “dog” in its animal sense, but the first sense of canine as a headword is a tooth. Choose the matching sense when you follow the link.",
      },
      {
        question: "Do verbs and adjectives have broader and narrower terms too?",
        answer:
          "Not in the same way. Verbs have troponyms — to whisper is to speak in a manner — and adjectives are grouped into similarity clusters around opposite pairs. The deep inheritance hierarchy is essentially a noun structure.",
      },
    ],
    related: ["the-four-parts-of-speech", "growing-your-vocabulary"],
    explore: [
      { href: "/lexicon/word/collie", label: "collie", hint: "The start of the longest chain here" },
      { href: "/lexicon/word/dog", label: "dog", hint: "Broader and narrower in one screen" },
      { href: "/lexicon/word/espresso", label: "espresso", hint: "Three steps to food" },
      { href: "/lexicon/collections/concrete-nouns", label: "Concrete nouns", hint: "Where the hierarchy is deepest" },
      { href: "/lexicon/collections/abstract-nouns", label: "Abstract nouns", hint: "States, qualities and ideas" },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    slug: "british-american-and-indian-english",
    title: "British, American and Indian English: spelling, vocabulary and register",
    summary:
      "Four spelling patterns account for most of the visible difference, the vocabulary differences are fewer than people think, and register is where the real gap sits. What this corpus can and cannot tell you about any of it.",
    readingTime: 9,
    updated: "2026-07-29",
    keywords: [
      "British vs American English",
      "Indian English",
      "British American spelling differences",
      "-ise or -ize",
      "English variety differences",
    ],
    answer:
      "The visible differences between British, American and Indian English are mostly four spelling patterns — colour/color, centre/center, organise/organize, travelled/traveled — plus a few dozen everyday vocabulary pairs. Indian English follows British spelling and adds its own vocabulary (lakh, crore) and register conventions. This dictionary carries both spellings of each pair as separate entries and marks {{c.region-united-kingdom}} entries as British usage, {{c.american-english}} as American and {{c.indian-english}} as Indian.",
    sections: [
      {
        heading: "What this corpus can and cannot tell you",
        body: [
          "Start with the limits, because they shape everything below. This dictionary marks a sense as regional only when the meaning itself is regional — {{c.region-united-kingdom}} entries carry a United Kingdom usage label, {{c.american-english}} an American one, {{c.indian-english}} Indian or subcontinental. Those are small numbers against {{total}} entries, and deliberately so.",
          "It does not mark spelling variants as regional at all, because to a lexical database “colour” and “color” are the same word with the same meaning. Both are here, both have full entries, and neither is flagged.",
          "There is one measurable side effect of that worth knowing about. Our commonness bands are computed from a frequency corpus dominated by American-spelled text, so in every variant pair the American spelling sits a band higher: color is Core where colour is Common, center is Core where centre is Common, defense is Core where defence is Common. That is a fact about the measuring corpus, not about the words, and you should read the bands on those pairs accordingly.",
        ],
      },
      {
        heading: "The spelling patterns, in order of how often they bite",
        body: [
          "Almost all the spelling difference you will ever meet is these six patterns. Indian English follows the British column throughout.",
        ],
        table: {
          caption: "Systematic spelling differences",
          head: ["Pattern", "British and Indian", "American"],
          rows: [
            ["-our / -or", "colour, favour, behaviour", "color, favor, behavior"],
            ["-re / -er", "centre, theatre, metre", "center, theater, meter"],
            ["-ise / -ize", "organise, realise, recognise", "organize, realize, recognize"],
            ["doubled l", "travelled, cancelled, modelling", "traveled, canceled, modeling"],
            ["-ce / -se (nouns)", "licence, defence, practice (noun)", "license, defense, practice"],
            ["-ogue / -og", "catalogue, dialogue, analogue", "catalog, dialog, analog"],
          ],
        },
      },
      {
        heading: "The -ise / -ize rule almost everyone gets wrong",
        body: [
          "“-ize is American” is the most repeated and least accurate of the spelling rules. -ize is the older form in English, it is the house style of Oxford University Press, and it is used throughout British academic and scientific publishing. Both organise and organize are British; only organize is American.",
          "There is a genuine catch. A group of verbs are never spelled -ize in any variety, because their -ise is not the suffix at all: advertise, advise, comprise, compromise, despise, devise, exercise, improvise, revise, supervise, surprise, televise. Write “advertize” anywhere and it is simply wrong.",
          "So the safe rule is the opposite of the one people repeat: -ise is safe everywhere, -ize is safe in America and in British academic writing, and there is a fixed list of verbs where only -ise is possible.",
        ],
      },
      {
        heading: "Vocabulary: fewer differences than the lists suggest",
        body: [
          "The famous pairs — lift and elevator, flat and apartment, pavement and sidewalk, biscuit and cookie, boot and trunk — are all real, all in this dictionary, and all mutually understood. Neither side of any of them needs translating; they are marked, not opaque.",
          "The ones that cause actual trouble are the false friends, where the same word means different things. Ask for a “rubber” in an American office, or say a proposal has been “tabled” — in British use tabling something puts it on the agenda, in American use it takes it off. Nothing sounds foreign and the meaning inverts.",
          "Indian English adds vocabulary rather than replacing it. Lakh and crore for hundred-thousand and ten-million are in this dictionary as ordinary entries; so are ashram, dacoit, godown, guru, karma, mantra and caste. They are not informal and they are not slang — in Indian newspapers and financial reporting, crore is the standard unit.",
        ],
      },
      {
        heading: "The gap our own data has here",
        body: [
          "Both lakh and crore are in this corpus with definitions, and neither has a pronunciation. The reason is exactly the kind of thing worth surfacing rather than hiding: our transcriptions come from an American pronouncing dictionary, and words standard to several hundred million English speakers are simply not in it.",
          "That is not a small caveat. {{withPronunciation}} of {{withSyllables}} single words have a transcription; the missing ones are not randomly distributed, and vocabulary from outside British and American English is over-represented among them.",
          "The definitions have their own centre of gravity too. WordNet was built in the United States, so its coverage of American vocabulary and American senses is denser than its coverage of Indian, Nigerian, Singaporean or Australian English. Where a dictionary's sources come from shows up in what it happens to know.",
        ],
      },
      {
        heading: "Register is the difference that actually matters",
        body: [
          "Spelling is a surface you can convert mechanically. Register — how formal a word is, and whether it is the expected word in a given kind of writing — does not convert, and it is where writing sounds foreign long after the spelling is consistent.",
          "This dictionary labels register where WordNet does: {{c.informal}} entries are marked informal, {{c.slang}} slang, {{c.usage-archaism}} archaic, {{c.trademarks}} trademarks. Those labels are shown on the sense that carries them. What no label can tell you is that a word neutral in one variety reads as stiff or as casual in another, because that is a fact about a readership rather than about a word.",
          "The one piece of advice that holds regardless of variety: pick one and be consistent within a document. Readers barely register which convention you chose. They notice immediately when it changes halfway down the page.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is -ize American and -ise British?",
        answer:
          "No. -ize is standard in American English and also in British academic publishing, including Oxford University Press house style. -ise is standard in most other British and Indian writing. A fixed group of verbs — advertise, advise, surprise, televise and about a dozen more — are never -ize anywhere.",
      },
      {
        question: "Does Indian English use British or American spelling?",
        answer:
          "British, consistently: colour, centre, organise, travelled. The vocabulary adds terms of its own — lakh, crore, ashram, godown — which are standard rather than informal in Indian publishing.",
      },
      {
        question: "Which spelling does this dictionary use?",
        answer:
          "Both. Every variant pair has two full entries with the same definitions. What you should know is that the commonness band is measured against a mostly American-spelled corpus, so the American spelling of a pair reads one band commoner than its British twin.",
      },
      {
        question: "Which accent do the pronunciations show?",
        answer:
          "General American, from the CMU Pronouncing Dictionary. That also means vocabulary from outside American English is over-represented among the {{noTranscription}} single words that have no transcription here at all — lakh and crore among them.",
      },
    ],
    related: ["reading-our-respelling", "synonyms-are-not-interchangeable"],
    explore: [
      { href: "/lexicon/collections/british-english", label: "Words marked British", hint: "Senses with a British usage label" },
      { href: "/lexicon/collections/american-english", label: "Words marked American", hint: "Senses marked United States usage" },
      { href: "/lexicon/collections/indian-english", label: "Words from Indian English", hint: "Indian and subcontinental vocabulary" },
      { href: "/lexicon/word/crore", label: "crore", hint: "Standard, and untranscribed" },
      { href: "/lexicon/collections/idioms-and-phrases", label: "Idioms and phrases", hint: "The part that defeats translation" },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    slug: "growing-your-vocabulary",
    title: "Growing your vocabulary without memorising word lists",
    summary:
      "Word lists produce recognition, not use. What works instead is learning words in structures — opposites, categories, senses and sounds — and a dictionary of {{total}} entries is mostly not the material.",
    readingTime: 8,
    updated: "2026-07-29",
    keywords: [
      "how to improve vocabulary",
      "learn new words",
      "vocabulary building",
      "expand vocabulary English",
      "vocabulary learning method",
    ],
    answer:
      "Memorising a word and its one-line gloss produces recognition without the ability to use it, because using a word requires knowing its register, its collocations and its pronunciation as well as its meaning. What works is learning words in structures — with their opposites, with the category above them, with all of their senses, and with their stress pattern — and reading enough in one subject that the vocabulary repeats until it sticks.",
    sections: [
      {
        heading: "Why lists fail even when you remember them",
        body: [
          "Knowing a word means knowing several things at once: what it means, how formal it is, which words it appears beside, which grammatical frames it takes, and how it is said. A list gives you the first and nothing else.",
          "The result is a familiar failure. You recognise the word when you read it and never produce it when you write, because producing it requires the four facts the list left out. Recognition vocabulary and production vocabulary are different sizes for everyone, and list-learning grows only the first.",
          "It also mislearns register. A word met once in a gloss carries no signal about whether it belongs in a work email, and the characteristic sound of vocabulary learned from lists is a formal word dropped into a casual sentence.",
        ],
      },
      {
        heading: "Learn in structures, not in lists",
        body: [
          "Each of these attaches a new word to something you already hold, which is the whole mechanism. The corpus is organised to make all four of them easy.",
        ],
        list: [
          "In opposite pairs. {{c.words-with-opposites}} entries here carry a directly recorded antonym. Learning hot with cold costs barely more than learning hot, and each anchors the other.",
          "In categories. Learn a broader term with three or four of its narrower terms — dog with poodle, collie, spaniel — and each new word arrives in a slot rather than in isolation.",
          "With all their senses. For a common word, the meaning you do not know is usually the one that would have been useful. The {{c.words-with-many-meanings}} entries with ten senses or more are the highest-yield reading in the whole dictionary.",
          "With the pronunciation. A word you cannot say is a word you will not use in speech and will avoid in writing. Learn the stress at the same time as the meaning, not later.",
        ],
      },
      {
        heading: "Use the commonness bands as an ordering",
        body: [
          "The five-band meter on every entry is measured against a corpus of everyday English, and it doubles as a curriculum. Working outward from what you already know beats working through the alphabet.",
          "{{core}} entries sit in the top band — the words carrying most of the language. {{common}} are in the Common band and {{familiar}} in Familiar; those two are where most useful growth happens for a fluent reader. {{uncommon}} are Uncommon, and {{rare}} are Rare, which is where the specialist and archaic vocabulary lives.",
          "Three curated lists follow those bands: the core English vocabulary at {{c.core-english}} entries, everyday words at {{c.everyday-words}}, and advanced vocabulary at {{c.advanced-vocabulary}} — uncommon words of three syllables or more that still carry a usage example, selected by frequency rather than copied from any exam's list.",
        ],
      },
      {
        heading: "Most of a dictionary is not vocabulary",
        body: [
          "This is the correction that saves the most wasted effort. Of {{total}} entries, {{phrases}} are multi-word — {{pctPhrases}}% of the corpus is idioms, compound nouns and species names. Of the single words, {{c.plants}} are plant vocabulary and {{c.animals}} are animal vocabulary, most of it taxonomic.",
          "None of that is material to learn. It is reference: there to be looked up when you meet it, and to be forgotten immediately afterwards without loss.",
          "The part that repays study is small. A few thousand words in the top bands, the phrasal verbs — {{c.phrasal-verbs}} of them, high-frequency and completely opaque if you do not know them — and whatever vocabulary your own subject actually uses.",
        ],
      },
      {
        heading: "Pronunciation is the half that gets skipped",
        body: [
          "Vocabulary learned silently stays passive. If you are not sure where the stress falls, you will avoid the word aloud, and avoiding it aloud stops it becoming yours.",
          "Three collections here are built for exactly this: {{c.hard-to-say}} words of four syllables or more with heavy consonant clusters, {{c.stress-on-last}} words whose stress lands on the final syllable, and {{c.spelled-nothing-like-said}} words whose spelling and sound have drifted furthest apart.",
          "The stress is drawn on every entry, so it costs nothing to learn it at the same time. Say the word out loud once when you meet it. That single habit does more for production than any amount of re-reading.",
        ],
      },
      {
        heading: "A routine that is small enough to keep",
        body: [
          "Everything above collapses into a short weekly loop. The point is that it is small: a routine you abandon in three weeks grows no vocabulary at all.",
        ],
        list: [
          "Read one thing a week in a subject you care about and mark every word you half know — not the ones you do not know at all, the ones you would not risk using.",
          "Look up five of them properly: all senses, the stress, the opposite if it has one, one narrower term.",
          "Write one sentence with each, in your own voice, about something real.",
          "Say each one aloud once. If the stress feels uncertain, look at the syllable line again.",
          "Next week, before you start, write the five from memory. The ones that have gone were never learned; put them back in the pile rather than adding five more.",
        ],
      },
    ],
    faqs: [
      {
        question: "How many words do I need to know?",
        answer:
          "There is no defensible single number, and any source quoting one is quoting an estimate with a large error bar. What is measurable here is the shape: {{core}} entries sit in the top commonness band and carry a disproportionate amount of the language, while {{rare}} sit in the rarest and appear almost nowhere.",
      },
      {
        question: "Do vocabulary apps and flashcards work?",
        answer:
          "They work for recognition, which is genuinely useful for reading and for exams. They do not by themselves produce usable vocabulary, because a card cannot carry register or collocation. Pair them with writing the word in your own sentence.",
      },
      {
        question: "Should I learn phrasal verbs?",
        answer:
          "Yes, ahead of most single-word vocabulary. {{c.phrasal-verbs}} are recorded here, they are extremely frequent in speech, and their meanings cannot be worked out from their parts — give up, take on, put off. That combination makes them high-value and impossible to guess.",
      },
      {
        question: "Is it better to learn many words shallowly or few words deeply?",
        answer:
          "Few, deeply, if the goal is to use them. Reading one entry all the way down — every sense, the antonym, the narrower terms, the stress — teaches more usable language than skimming ten glosses, and the {{c.words-with-many-meanings}} entries with ten senses or more are where that pays best.",
      },
    ],
    related: ["polysemy-and-frequency", "syllables-and-stress"],
    explore: [
      { href: "/lexicon/collections/core-english", label: "The core English vocabulary", hint: "{{c.core-english}} entries, top band" },
      { href: "/lexicon/collections/everyday-words", label: "Everyday words", hint: "A step beyond the core" },
      { href: "/lexicon/collections/advanced-vocabulary", label: "Advanced vocabulary", hint: "{{c.advanced-vocabulary}} entries" },
      { href: "/lexicon/collections/words-with-opposites", label: "Words with clear opposites", hint: "Pairs worth learning together" },
      { href: "/lexicon/collections/phrasal-verbs", label: "Phrasal verbs", hint: "Frequent and impossible to guess" },
    ],
  },
];

export const findGuide = (slug) => GUIDES.find((guide) => guide.slug === slug) ?? null;
