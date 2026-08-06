import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createHowToJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { COMMONNESS } from "@altftool/core/lexicon";
import { AnswerFirst, Breadcrumb, StatStrip } from "../../_components/WordAtoms";
import {
  GameFaq,
  HowItWasBuilt,
  HowToPlay,
  MoreGames,
  SourceNote,
} from "../_shared/GamePageParts";
import { GAMES_BY_SLUG } from "../_shared/catalog";
import ScrambleGame from "./ScrambleGame";
import {
  MAX_BAND,
  MAX_LETTERS,
  MIN_BAND,
  MIN_LETTERS,
  ROUND_COUNT,
  SOURCE_COLLECTIONS,
  buildScrambleRounds,
} from "./rounds";

export const revalidate = 86400;

const PATH = "/lexicon/games/word-scramble";
const GAME = GAMES_BY_SLUG["word-scramble"];

const description =
  "A free word scramble with a definition for every puzzle: unscramble 30 common English words, four to eight letters each, and open the full dictionary entry when you solve one.";

const STEPS = [
  "Read the definition. It belongs to the word whose letters are shuffled above it.",
  "Build the answer by tapping the letter tiles, or type it straight into the box — both write to the same field, so you can switch mid-word.",
  "Press Check. A wrong guess costs nothing but the streak you were building; you can keep trying the same word for as long as you like.",
  "Stuck? Reveal shows the answer. That round stops counting towards your score, and the streak resets.",
  "Every solved word links to its full entry, with the pronunciation, all of its senses and its synonyms.",
];

const FAQS = [
  {
    question: "How do you play word scramble?",
    answer:
      "You are shown the letters of a word in a shuffled order and the dictionary definition of that word. Rearrange the letters to spell the word. In this version every letter is used exactly once, the definition is always the first recorded sense of the answer, and the answer is always a single word of four to eight letters.",
  },
  {
    question: "Are the puzzles the same for everyone?",
    answer: `Yes. All ${ROUND_COUNT} rounds are chosen by hashing each word's slug rather than by a random draw, so the same thirty words appear in the same order for every player on every visit. Restarting reshuffles the order in your browser; it does not swap the words.`,
  },
  {
    question: "Where do the scrambled words come from?",
    answer:
      "From the everyday half of AltF Lexicon: the core English, everyday, adjectives worth knowing, verbs worth knowing and concrete noun collections. Words are filtered to commonness bands 3 to 5 — familiar, common and core — so no round turns on vocabulary a general reader has never met.",
  },
  {
    question: "Why does the definition never contain the answer?",
    answer:
      "Because a definition that repeats its own headword solves the puzzle for you. WordNet defines a good number of derived words in terms of their stem, so any candidate whose definition contains the first letters of the answer is dropped before the round is built.",
  },
  {
    question: "Do I need an account, and is it free?",
    answer:
      "No account, no sign-in, no cost. The game runs entirely in your browser once the page has loaded, and nothing about how you played is sent anywhere.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: `Word scramble — ${ROUND_COUNT} anagram puzzles with real definitions`,
    description,
    path: PATH,
    keywords: [
      "word scramble",
      "word scramble game",
      "anagram game",
      "unscramble words",
      "word puzzle with definitions",
      "free word game",
    ],
  });
}

export default async function WordScramblePage() {
  const { rounds, poolSize } = await buildScrambleRounds();

  const answer = `Word scramble is a free anagram game with ${rounds.length} rounds: each puzzle shuffles the letters of one English word and gives you its dictionary definition as the clue. Every answer is a single word of ${MIN_LETTERS} to ${MAX_LETTERS} letters drawn from the ${poolSize.toLocaleString("en-US")} words in AltF Lexicon that are common enough for a general reader, and solving one opens its full entry.`;

  const bandLabels = COMMONNESS.filter((band) => band.band >= MIN_BAND && band.band <= MAX_BAND)
    .map((band) => band.label.toLowerCase())
    .join(", ");

  return (
    <>
      <JsonLd
        id="altf-lexicon-game-word-scramble"
        data={[
          createFaqJsonLd({ path: PATH, questions: FAQS }),
          createHowToJsonLd({
            path: PATH,
            name: "How to play word scramble",
            description: GAME.tagline,
            steps: STEPS,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Word games", path: "/lexicon/games" },
            { name: "Word scramble", path: PATH },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Breadcrumb
          items={[
            { name: "Lexicon", path: "/lexicon" },
            { name: "Word games", path: "/lexicon/games" },
            { name: "Word scramble" },
          ]}
        />

        <header>
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Word game
          </span>
          <h1 className="mt-2 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold tracking-[-0.02em] text-foreground">
            Word scramble
          </h1>
          <p className="mt-3 max-w-[68ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
            {GAME.blurb}
          </p>

          <AnswerFirst>{answer}</AnswerFirst>

          <StatStrip
            stats={[
              { value: rounds.length, label: "Rounds" },
              { value: `${MIN_LETTERS}–${MAX_LETTERS}`, label: "Letters per word" },
              { value: poolSize.toLocaleString("en-US"), label: "Words in the pool" },
              { value: "0", label: "Sign-ins required" },
            ]}
          />
        </header>

        <ScrambleGame rounds={rounds} />

        <HowToPlay steps={STEPS}>
          The whole game is in the page you already downloaded. There is no timer, no lives and no
          request to a server between rounds, so it works exactly the same on a slow connection as
          on a fast one.
        </HowToPlay>

        <HowItWasBuilt>
          <p>
            Candidates are every entry in the{" "}
            {SOURCE_COLLECTIONS.length.toLocaleString("en-US")} everyday collections that is a
            single unhyphenated word of {MIN_LETTERS} to {MAX_LETTERS} letters, sits in commonness
            band {MIN_BAND} to {MAX_BAND} ({bandLabels}), has a definition short enough to read at a
            glance, and has a definition that does not contain the answer.{" "}
            {poolSize.toLocaleString("en-US")} words clear all four tests.
          </p>
          <p>
            The {rounds.length} that become rounds are the {rounds.length} whose slugs hash lowest —
            a fixed, reproducible draw rather than a random sample. The letter order inside each
            puzzle is a seeded shuffle of the same slug, retried until it differs from the word
            itself.
          </p>
        </HowItWasBuilt>

        <GameFaq questions={FAQS} heading="Questions about word scramble" />

        <MoreGames current="word-scramble" />

        <SourceNote />
      </div>
    </>
  );
}
