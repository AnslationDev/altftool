import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createHowToJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { POS_BY_KEY } from "@altftool/core/lexicon";
import { AnswerFirst, Breadcrumb, StatStrip } from "../../_components/WordAtoms";
import {
  GameFaq,
  HowItWasBuilt,
  HowToPlay,
  MoreGames,
  SourceNote,
} from "../_shared/GamePageParts";
import { GAMES_BY_SLUG } from "../_shared/catalog";
import DefinitionGame from "./DefinitionGame";
import { MIN_BAND, OPTION_COUNT, ROUND_COUNT, buildDefinitionRounds } from "./rounds";

export const revalidate = 86400;

const PATH = "/lexicon/games/guess-the-definition";
const GAME = GAMES_BY_SLUG["guess-the-definition"];

const description =
  "A free multiple-choice vocabulary quiz: one English word, four real dictionary definitions, and only one of them belongs to it. 24 rounds, with the full entry a click away.";

const STEPS = [
  "Read the word at the top of the round. Its part of speech and how common it is are shown beside it.",
  "Read all four definitions. Every one of them is a real WordNet definition of a real entry in the same part of speech.",
  "Choose the one that belongs to the word — click it, or press its number key, or Tab to it and press Enter.",
  "The round settles on your first choice. There is no second guess: the correct definition is marked and the one you picked is marked too.",
  "Open the full entry to see the word's other senses, its pronunciation and its synonyms, then move to the next round.",
];

const FAQS = [
  {
    question: "How does guess the definition work?",
    answer: `Each round shows one word and ${OPTION_COUNT} definitions. One is the word's own first recorded sense in WordNet; the other three are the first senses of three other entries that share its part of speech. You pick once, and the round settles.`,
  },
  {
    question: "Why are the wrong answers so plausible?",
    answer:
      "Because they are not wrong answers — they are right answers to other questions. Inventing three fake definitions would make the quiz easy, since invented lexicography reads nothing like the real thing. Drawing them from the same part of speech removes the second giveaway: a noun's definition and a verb's definition do not have the same grammatical shape, so mixing them would let you rule two out without knowing the word.",
  },
  {
    question: "Are the rounds the same every time I play?",
    answer: `Yes. The ${ROUND_COUNT} words, their three distractors each, and the order the four options appear in are all decided by hashing the word's slug, not by a random draw. Restarting reshuffles the order of the rounds in your browser but never changes what is in them.`,
  },
  {
    question: "What counts as a good score?",
    answer: `Picking at random scores about ${Math.round(100 / OPTION_COUNT)}% — roughly six of ${ROUND_COUNT}. Anything meaningfully above that is vocabulary rather than luck. The streak counter is the harder measure, because one wrong answer resets it.`,
  },
  {
    question: "Which words can appear?",
    answer: `Only single words with one part of speech, in commonness band ${MIN_BAND} or higher, whose definition is short enough to read at a glance and does not contain the word itself. That last rule removes the rounds that would answer themselves.`,
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: `Guess the definition — a ${ROUND_COUNT}-round vocabulary quiz`,
    description,
    path: PATH,
    keywords: [
      "guess the definition",
      "vocabulary quiz",
      "definition quiz",
      "multiple choice word game",
      "English vocabulary test",
      "free word game",
    ],
  });
}

export default async function GuessTheDefinitionPage() {
  const { rounds, poolSize, posGroups } = await buildDefinitionRounds();

  const answer = `Guess the definition is a free multiple-choice vocabulary quiz with ${rounds.length} rounds. Each round shows one English word and ${OPTION_COUNT} definitions: one is the word's own, and the other three are genuine definitions of other entries that share its part of speech, which is what stops the wrong answers from being obvious. The pool is ${poolSize.toLocaleString("en-US")} words and every round links to the full dictionary entry.`;

  const posSummary = posGroups
    .map(([key, list]) => ({ meta: POS_BY_KEY[key], count: list.length }))
    .filter((row) => row.meta)
    .sort((a, b) => b.count - a.count);

  return (
    <>
      <JsonLd
        id="altf-lexicon-game-guess-the-definition"
        data={[
          createFaqJsonLd({ path: PATH, questions: FAQS }),
          createHowToJsonLd({
            path: PATH,
            name: "How to play guess the definition",
            description: GAME.tagline,
            steps: STEPS,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Word games", path: "/lexicon/games" },
            { name: "Guess the definition", path: PATH },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Breadcrumb
          items={[
            { name: "Lexicon", path: "/lexicon" },
            { name: "Word games", path: "/lexicon/games" },
            { name: "Guess the definition" },
          ]}
        />

        <header>
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Word game
          </span>
          <h1 className="mt-2 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold tracking-[-0.02em] text-foreground">
            Guess the definition
          </h1>
          <p className="mt-3 max-w-[68ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
            {GAME.blurb}
          </p>

          <AnswerFirst>{answer}</AnswerFirst>

          <StatStrip
            stats={[
              { value: rounds.length, label: "Rounds" },
              { value: OPTION_COUNT, label: "Definitions per round" },
              { value: poolSize.toLocaleString("en-US"), label: "Words in the pool" },
              { value: `${Math.round(100 / OPTION_COUNT)}%`, label: "Score by guessing" },
            ]}
          />
        </header>

        <DefinitionGame rounds={rounds} />

        <HowToPlay steps={STEPS}>
          Every round is already in the page when it loads, so the quiz never pauses to fetch the
          next question and works with the network switched off.
        </HowToPlay>

        <HowItWasBuilt>
          <p>
            The pool is {poolSize.toLocaleString("en-US")} single words from the everyday
            collections, each with exactly one part of speech and a definition between 22 and 118
            characters that does not contain the word it defines. Splitting the pool by part of
            speech gives{" "}
            {posSummary
              .map((row) => `${row.count.toLocaleString("en-US")} ${row.meta.plural}`)
              .join(", ")}
            .
          </p>
          <p>
            Each round takes the target, then walks its own part-of-speech list in an order seeded
            from the target&rsquo;s slug and takes the first three entries whose definitions are
            distinct from each other and never mention the target. The four options are then shuffled
            with a third seed, which is why the right answer is not in the same slot twice running.
          </p>
        </HowItWasBuilt>

        <GameFaq questions={FAQS} heading="Questions about this quiz" />

        <MoreGames current="guess-the-definition" />

        <SourceNote />
      </div>
    </>
  );
}
