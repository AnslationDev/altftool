/*
 * The four games, described once.
 *
 * The hub, the cross-links at the foot of each game and the metadata all read
 * from this list, so a game cannot end up described one way on its own page and
 * another way on the page that sends readers to it.
 */

export const GAMES = Object.freeze([
  {
    slug: "word-scramble",
    name: "Word scramble",
    tagline: "Unscramble the letters, with the definition as your only clue.",
    blurb:
      "Thirty words with their letters shuffled. The definition is the hint, so the game is a vocabulary test wearing an anagram as a disguise.",
    rule: "Familiar-to-core words of four to eight letters, drawn by hashing the slug so the same thirty come back on every build.",
    rounds: "30 rounds",
  },
  {
    slug: "guess-the-definition",
    name: "Guess the definition",
    tagline: "One word, four definitions, three of them belonging to other entries.",
    blurb:
      "The wrong answers are real definitions of real words in the same part of speech, which is what makes them hard — none of them is nonsense you can rule out on sight.",
    rule: "Distractors are pulled from entries sharing the target's part of speech, so a noun is never offered a verb's definition.",
    rounds: "24 rounds",
  },
  {
    slug: "syllable-split",
    name: "Syllable split",
    tagline: "Count the syllables, then see the split and where the stress lands.",
    blurb:
      "The playable form of the thing this dictionary is built around. Guess the count, then the word opens up: the split, the stressed syllable inked, the IPA, the respelling and why the stress sits there.",
    rule: "Only words with a real CMU Pronouncing Dictionary entry — nothing here is a syllable count guessed from spelling.",
    rounds: "30 rounds",
  },
  {
    slug: "odd-one-out",
    name: "Odd one out",
    tagline: "Three words share a semantic field. One does not.",
    blurb:
      "Grouping comes from WordNet's own classification of every sense, not from a keyword match, so the answer is checkable rather than a matter of taste.",
    rule: "Every word used has all of its senses filed under a single domain, so no round turns on a meaning you were not thinking of.",
    rounds: "18 rounds",
  },
]);

export const GAMES_BY_SLUG = Object.freeze(
  GAMES.reduce((acc, game) => {
    acc[game.slug] = game;
    return acc;
  }, {}),
);

export const otherGames = (slug) => GAMES.filter((game) => game.slug !== slug);
