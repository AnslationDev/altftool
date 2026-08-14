import { getWords } from "@altftool/core/lexicon/corpus";
import { byHash, hashString, seededShuffle } from "../_shared/rng";
import { collectionRows, glossHidesWord, isPlainWord, isWholeGloss } from "../_shared/pool";

/*
 * Round construction for odd one out.
 *
 * The grouping is not ours. WordNet files every sense it holds under one of 45
 * lexicographer files — noun.animal, verb.motion, noun.food — and that filing
 * was done by a person reading the sense. So "three of these are animals" is a
 * checkable claim about the data rather than a category we invented, which is
 * the difference between this and every keyword-matched word game.
 *
 * Two rules make a round fair, and both are enforced here rather than hoped for:
 *
 *   1. Every word used has ALL of its senses in one file. A word with a second
 *      meaning somewhere else is a trap: a player who thinks of "crane" as a
 *      machine is not wrong, they just thought of the sense we were not filing
 *      under. Those words never reach a round.
 *   2. The odd word shares its part of speech with the other three. Mixing a
 *      verb into three nouns makes the puzzle answerable from grammar alone,
 *      without reading a single meaning.
 */

export const ROUND_COUNT = 18;
export const OPTION_COUNT = 4;

/** Bands 3-5: familiar, common, core. A puzzle needs four words a reader knows. */
export const MIN_BAND = 3;
export const MIN_LETTERS = 4;
export const MAX_LETTERS = 12;

/** A domain can only host a round if it can field three words plus a spare. */
export const MIN_DOMAIN_SIZE = 4;

/*
 * Where the candidates come from.
 *
 * Every one of these is a published collection page built from a single
 * lexicographer file, so a word offered here as an animal is an animal on
 * /lexicon/collections/animals too — the game and the collection cannot
 * disagree.
 *
 * noun.location is deliberately absent. Its everyday half is Boston, Sweden and
 * Texas, and a round drawn from it tests an atlas rather than a vocabulary.
 */
export const SOURCE_COLLECTIONS = [
  "animals",
  "plants",
  "food-and-drink",
  "body-words",
  "things-we-make",
  "substances",
  "people-words",
  "time-words",
  "feelings",
  "phenomena",
  "possessions",
  "groups",
  "communication",
  "thinking-words",
  "movement-verbs",
  "speaking-verbs",
  "thinking-verbs",
  "emotion-verbs",
  "body-verbs",
  "eating-verbs",
  "senses-verbs",
  "making-verbs",
  "competition-verbs",
  "social-verbs",
  "contact-verbs",
  "change-verbs",
];

/*
 * Lexicographer file -> what to call it in front of a reader.
 *
 * "noun.animal" is a filename. A player who has just lost a round deserves the
 * reason in English, so every file this game can produce has a phrase written
 * for it, and the fallback still reads as a sentence rather than as data.
 */
export const DOMAIN_LABELS = Object.freeze({
  "noun.Tops": "the broadest categories of all",
  "noun.act": "things people do",
  "noun.animal": "animals",
  "noun.artifact": "made things",
  "noun.attribute": "qualities",
  "noun.body": "parts of the body",
  "noun.cognition": "ideas and knowledge",
  "noun.communication": "communication",
  "noun.event": "events",
  "noun.feeling": "feelings",
  "noun.food": "food and drink",
  "noun.group": "groups of people or things",
  "noun.location": "places",
  "noun.motive": "motives",
  "noun.object": "natural objects",
  "noun.person": "people",
  "noun.phenomenon": "natural phenomena",
  "noun.plant": "plants",
  "noun.possession": "money and property",
  "noun.process": "natural processes",
  "noun.quantity": "amounts and measures",
  "noun.relation": "relations between things",
  "noun.shape": "shapes",
  "noun.state": "states and conditions",
  "noun.substance": "substances and materials",
  "noun.time": "time",
  "verb.body": "verbs the body does",
  "verb.change": "verbs of change",
  "verb.cognition": "verbs of thinking",
  "verb.communication": "verbs of speaking",
  "verb.competition": "verbs of contest",
  "verb.consumption": "verbs of eating and drinking",
  "verb.contact": "verbs of touch and contact",
  "verb.creation": "verbs of making",
  "verb.emotion": "verbs of emotion",
  "verb.motion": "verbs of movement",
  "verb.perception": "verbs of the senses",
  "verb.possession": "verbs of having and giving",
  "verb.social": "verbs of social life",
  "verb.stative": "verbs of being",
  "verb.weather": "weather verbs",
  "adj.all": "adjectives",
  "adj.pert": "relational adjectives",
  "adj.ppl": "adjectives made from verbs",
  "adv.all": "adverbs",
});

export const domainLabel = (domain) =>
  DOMAIN_LABELS[domain] || `WordNet's "${String(domain).split(".")[1]}" file`;

/** noun.animal -> noun. The two halves of a round must match on this. */
const posOf = (domain) => String(domain).split(".")[0];

/*
 * Pairs of files that overlap in a reader's head even though WordNet keeps them
 * apart. A jury is a group and a lawyer is a person; asking which of those is
 * the odd one is a question about WordNet's filing conventions, not about
 * English, so these pairings are never built.
 */
const TOO_CLOSE = [
  ["noun.person", "noun.group"],
  ["noun.cognition", "noun.communication"],
  ["noun.artifact", "noun.substance"],
  ["noun.food", "noun.substance"],
  ["noun.feeling", "noun.attribute"],
].map((pair) => pair.slice().sort().join("|"));

const tooClose = (a, b) => TOO_CLOSE.includes([a, b].sort().join("|"));

/** Usage labels that make a word wrong for a game anyone might open. */
const BARRED_USAGE = /slang|vulgar|obscen|offensive|disparag|ethnic slur|coarse/i;

export async function buildOddOneOutRounds() {
  const rows = await collectionRows(SOURCE_COLLECTIONS);

  /*
   * Inflected forms that happen to have their own entry.
   *
   * "eggs" is filed under food and "breaking" under acts, and both are real
   * WordNet entries — but a puzzle whose options are cheese, bacon and eggs
   * reads as a shopping list rather than as a test. A candidate is dropped when
   * the word it was formed from is also in the pool.
   */
  const headwords = new Set(rows.map((row) => row.w));
  const isDerivedForm = (word) => {
    if (word.endsWith("ies") && headwords.has(`${word.slice(0, -3)}y`)) return true;
    if (word.endsWith("es") && headwords.has(word.slice(0, -2))) return true;
    if (word.endsWith("s") && headwords.has(word.slice(0, -1))) return true;
    if (word.endsWith("ing")) {
      const stem = word.slice(0, -3);
      return headwords.has(stem) || headwords.has(`${stem}e`) || headwords.has(stem.slice(0, -1));
    }
    if (word.endsWith("ed")) {
      const stem = word.slice(0, -2);
      return headwords.has(stem) || headwords.has(`${stem}e`);
    }
    return false;
  };

  const pool = rows.filter(
    (row) =>
      isPlainWord(row, { min: MIN_LETTERS, max: MAX_LETTERS }) &&
      row.c >= MIN_BAND &&
      isWholeGloss(row.g, { min: 20, max: 130 }) &&
      // A gloss opening with a field label — "(biochemistry) a long linear
      // polymer…" — is a technical entry wearing an everyday spelling.
      !row.g.startsWith("(") &&
      glossHidesWord(row.g, row.w) &&
      !isDerivedForm(row.w),
  );

  const entries = await getWords(pool.map((row) => row.s));

  /*
   * The two tests that cannot be made from a compact row.
   *
   * A row carries one gloss; deciding that every sense of a word sits in the
   * same file needs all of them, which means the full entry. `tc` is WordNet's
   * count of how often a sense was tagged in real text, and requiring one
   * tagged sense is what keeps Marge, Chen and Melissa out of a game about
   * vocabulary — proper names carry a spelling and a frequency but no evidence
   * of use as a common noun.
   */
  const byDomain = new Map();
  for (const entry of entries) {
    const senses = entry.sn || [];
    if (senses.length === 0) continue;

    const domains = senses.map((sense) => sense.d);
    if (domains.some((domain) => !domain)) continue;
    if (new Set(domains).size !== 1) continue;
    if (!senses.some((sense) => sense.tc > 0)) continue;
    if (senses.some((sense) => (sense.us || []).some((label) => BARRED_USAGE.test(label)))) continue;

    const domain = domains[0];
    if (!byDomain.has(domain)) byDomain.set(domain, []);
    byDomain.get(domain).push({
      slug: entry.s,
      word: entry.w,
      gloss: senses[0].g,
      band: entry.c,
      domain,
    });
  }

  // Order inside a file, and the order the files are used in, both by hash.
  for (const [domain, list] of byDomain) {
    byDomain.set(domain, byHash(list, (item) => item.slug, `odd:${domain}`));
  }
  const domains = byHash(
    [...byDomain.keys()].filter((domain) => byDomain.get(domain).length >= MIN_DOMAIN_SIZE),
    (domain) => domain,
    "odd-home",
  );

  const taken = new Set();
  const unused = (domain) =>
    (byDomain.get(domain) || []).filter((item) => !taken.has(item.slug));

  const rounds = [];
  for (let attempt = 0; rounds.length < ROUND_COUNT && attempt < domains.length * 4; attempt += 1) {
    const home = domains[attempt % domains.length];
    const trio = unused(home).slice(0, OPTION_COUNT - 1);
    if (trio.length < OPTION_COUNT - 1) continue;

    /*
     * The odd word. Same part of speech, a different file, and not one of the
     * pairings a reader would reasonably argue with. Candidate files are walked
     * in an order seeded from the trio itself, so two rounds sharing a home
     * file do not draw their odd word from the same place.
     */
    const oddDomain = byHash(
      [...byDomain.keys()].filter(
        (domain) =>
          domain !== home &&
          posOf(domain) === posOf(home) &&
          !tooClose(domain, home) &&
          unused(domain).length > 0,
      ),
      (domain) => domain,
      `odd-out:${trio[0].slug}`,
    )[0];
    if (!oddDomain) continue;

    const stranger = unused(oddDomain)[0];
    for (const item of [...trio, stranger]) taken.add(item.slug);

    const words = seededShuffle(
      [
        ...trio.map((item) => ({ ...item, odd: false })),
        { ...stranger, odd: true },
      ],
      hashString(`odd-order:${trio[0].slug}`),
    );

    rounds.push({
      slug: stranger.slug,
      word: stranger.word,
      home,
      homeLabel: domainLabel(home),
      oddDomain,
      oddLabel: domainLabel(oddDomain),
      words: words.map((item) => ({
        slug: item.slug,
        word: item.word,
        gloss: item.gloss,
        band: item.band,
        label: domainLabel(item.domain),
        odd: item.odd,
      })),
      answer: words.findIndex((item) => item.odd),
    });
  }

  return {
    rounds,
    poolSize: entries.length,
    singleDomain: [...byDomain.values()].reduce((sum, list) => sum + list.length, 0),
    domainCount: byDomain.size,
    homeCount: domains.length,
  };
}
