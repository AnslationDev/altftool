/*
 * The word tools, as data.
 *
 * One list, read by the hub, by every tool's "related tools" rail and by the
 * hub's ItemList JSON-LD. A tool that exists in the routing tree and not here
 * would be invisible to all three, so this is the register, not a copy of it.
 *
 * `icon` is a lucide-react export name and is resolved by the component that
 * renders it — an icon name that does not exist renders as nothing at all, so
 * every one of these is checked against the installed package.
 */

export const TOOLS = Object.freeze([
  {
    slug: "anagram-solver",
    name: "Anagram solver",
    icon: "Shuffle",
    tagline: "Every real word that uses all your letters",
    summary:
      "Rearranges the letters you type into dictionary words that use every one of them. Type ? for a blank.",
    example: "listen",
    keywords: ["anagram solver", "anagram finder", "solve anagrams", "anagram maker"],
  },
  {
    slug: "word-unscrambler",
    name: "Word unscrambler",
    icon: "WandSparkles",
    tagline: "Every word hiding in a jumble of letters",
    summary:
      "Finds every word that can be spelled from some or all of your letters, longest first. The same engine as the anagram solver, without the rule that every letter must be used.",
    example: "sprained",
    keywords: ["word unscrambler", "unscramble letters", "jumble solver", "word finder"],
  },
  {
    slug: "syllable-counter",
    name: "Syllable counter",
    icon: "AudioLines",
    tagline: "Syllables per word, and a readability score",
    summary:
      "Counts the syllables in anything you paste, word by word, and turns the totals into a Flesch Reading Ease score. Runs entirely in your browser.",
    example: "haiku drafts",
    keywords: ["syllable counter", "count syllables", "syllables in a word", "flesch reading ease"],
  },
  {
    slug: "rhyme-finder",
    name: "Rhyme finder",
    icon: "Music",
    tagline: "Rhymes matched on sound, not spelling",
    summary:
      "Looks up a word's pronunciation and returns every entry that shares its phonemes from the last stressed vowel onward — so it finds through/blue and never rough/though.",
    example: "orange",
    keywords: ["rhyme finder", "rhyming words", "what rhymes with", "rhyme dictionary"],
  },
  {
    slug: "word-pattern-search",
    name: "Word pattern search",
    icon: "Grid3x3",
    tagline: "Crossword patterns, with wildcards",
    summary:
      "Matches a pattern against the dictionary: ? for one letter, * for any run, @ for any vowel, # for any consonant.",
    example: "st??e",
    keywords: ["word pattern search", "crossword solver", "word with letters in position", "wildcard word search"],
  },
  {
    slug: "words-from-letters",
    name: "Words from letters",
    icon: "Dices",
    tagline: "Your rack, scored highest first",
    summary:
      "Solves a Scrabble rack: every playable word from your tiles, scored with the standard English tile values and ordered by what it is worth.",
    example: "aeinrst",
    keywords: ["words from letters", "scrabble word finder", "scrabble solver", "words with letters"],
  },
]);

export const TOOLS_BY_SLUG = Object.freeze(
  Object.fromEntries(TOOLS.map((tool) => [tool.slug, tool])),
);

export const toolPath = (slug) => `/lexicon/tools/${slug}`;

/** The other five, in catalog order — the rail at the foot of every tool. */
export const otherTools = (slug) => TOOLS.filter((tool) => tool.slug !== slug);
