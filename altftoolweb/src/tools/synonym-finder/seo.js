const seo = {
  title: "Synonym Finder — Offline Thesaurus with Antonyms",
  metaDescription:
    "Type a word and get part of speech, synonyms and antonyms instantly from a built-in dataset of 580 headwords — no lookup requests, works offline.",
  steps: [
    "Type a dictionary-form word (run, not running) into the Search for a word... box.",
    "The lookup matches your text against the bundled headword list as you type — no request is sent anywhere.",
    "Read the part-of-speech tag with the Synonyms (count) and Antonyms (count) chip lists, or a No results found notice for words outside the dataset.",
  ],
  intro:
    "This is an offline English thesaurus: type a word and it returns that headword's part of speech, its list of synonyms and its list of antonyms from a built-in dataset of 580 curated headwords carrying roughly 2,900 synonyms and 1,700 antonyms. Because the whole word list ships with the page, results appear as you type with no lookup request and no rate limit. Each entry is tagged as an adjective, verb, noun, adverb or preposition, so you can tell which sense of the word the alternatives belong to.",
  useCases: [
    "You have used \"important\" four times in one paragraph of an essay and need three alternatives that keep the same register, without opening a site that wants you to sign in",
    "You are writing on a train with patchy signal and still need a word that means the opposite of \"abundant\" for the sentence you are stuck on",
    "You are building vocabulary for an exam and want to work through a word alongside its opposites, since learning \"ardent\" against \"apathetic\" sticks better than learning either alone",
  ],
  benefits: [
    ["Antonyms shown next to synonyms", "Most entries list opposites as well as alternatives, so you can flip the meaning of a sentence instead of only rephrasing it."],
    ["Part-of-speech tagged", "Each headword is labelled adjective, verb, noun, adverb or preposition, which stops you swapping in a noun where the sentence needs a verb."],
    ["Instant, dataset-backed results", "The full word list is bundled with the page, so lookups resolve immediately, work offline and never hit a request limit."],
  ],
  faqs: [
    [
      "Why does my word return no results?",
      "The lookup matches whole headwords exactly, and the dataset holds 580 of them — so inflected forms like \"running\" or \"abandoned\" will miss even when the base word is present. Try the dictionary form: \"run\", \"abandon\", \"abundant\" rather than the conjugated or plural version.",
    ],
    [
      "How many synonyms will I get for a word?",
      "Typically four to six, plus two or three antonyms — around 2,900 synonyms and 1,700 antonyms spread across the 580 entries. The lists are curated rather than exhaustive, which keeps every suggestion usable instead of burying the good options among archaic ones.",
    ],
    [
      "Are all the synonyms interchangeable?",
      "No — treat them as candidates, not equivalents. \"Detest\", \"loathe\" and \"abominate\" all sit under abhor but differ sharply in intensity and formality, so read the replacement back inside your own sentence before committing to it.",
    ],
    [
      "Does it work without an internet connection?",
      "Yes, once the page has loaded. The thesaurus is bundled into the page rather than fetched from an API, so every search runs locally and nothing about the words you look up is sent anywhere.",
    ],
  ],
};

export default seo;
