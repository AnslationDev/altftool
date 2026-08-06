import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createHowToJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { AnswerFirst, Breadcrumb, StatStrip } from "../../_components/WordAtoms";
import {
  GameFaq,
  HowItWasBuilt,
  HowToPlay,
  MoreGames,
  SourceNote,
} from "../_shared/GamePageParts";
import { GAMES_BY_SLUG } from "../_shared/catalog";
import OddOneOutGame from "./OddOneOutGame";
import {
  MIN_BAND,
  OPTION_COUNT,
  ROUND_COUNT,
  SOURCE_COLLECTIONS,
  buildOddOneOutRounds,
} from "./rounds";

export const revalidate = 86400;

const PATH = "/lexicon/games/odd-one-out";
const GAME = GAMES_BY_SLUG["odd-one-out"];

const description =
  "A free odd-one-out word game: four English words, three of them from the same WordNet semantic field. Pick the intruder, then see what every word was filed under and why.";

const STEPS = [
  "Read all four words. Three of them belong to one semantic field — animals, made things, verbs of speaking — and one does not.",
  "Pick the intruder: click it, press its number key, or Tab to it and press Enter.",
  "The round settles on your first choice. There is no second guess.",
  "Read the reveal. Every one of the four words is named with the field WordNet filed it under and the definition that put it there, so a round you lost is a round you can check.",
  "Any of the four words opens its full dictionary entry, with the rest of its senses and its relations.",
];

const FAQS = [
  {
    question: "How do you play odd one out?",
    answer: `Each round shows ${OPTION_COUNT} words. Three of them have all their meanings filed under one WordNet subject file and the fourth is filed somewhere else. You choose the fourth. There are ${ROUND_COUNT} rounds, and the reveal names the field every word belongs to rather than only marking the answer.`,
  },
  {
    question: "Who decides which words belong together?",
    answer:
      "Princeton's WordNet does, and it decided before this game existed. Every sense in WordNet is filed by a lexicographer into one of 45 subject files — noun.animal, noun.food, verb.motion. Three words in a round share a file; the fourth does not. Nothing here is a keyword match against definition text, and nothing here is our opinion about what goes with what.",
  },
  {
    question: "What if a word has more than one meaning?",
    answer:
      "It is not used. Every word in every round has all of its senses in a single file, which is checked against the full entry rather than the first definition. That rule is what stops a round turning on a meaning you were not thinking of — nobody loses here because they read 'crane' as a machine.",
  },
  {
    question: "Is the odd word ever a different part of speech?",
    answer:
      "No. The intruder always shares the part of speech of the other three, because a verb among three nouns can be spotted without reading a single meaning, and that is a grammar test wearing a vocabulary test's clothes.",
  },
  {
    question: "Are the rounds the same for everyone?",
    answer: `Yes. The sets, the intruders and the order the four words appear in are all decided by hashing slugs rather than by a random draw, so every player sees the same ${ROUND_COUNT} rounds. Restarting reshuffles the order in your browser; it never changes what is in a round.`,
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: `Odd one out — ${ROUND_COUNT} rounds of semantic fields`,
    description,
    path: PATH,
    keywords: [
      "odd one out",
      "odd one out word game",
      "semantic field game",
      "word category game",
      "vocabulary game",
      "free word game",
    ],
  });
}

export default async function OddOneOutPage() {
  const { rounds, poolSize, singleDomain, domainCount, homeCount } = await buildOddOneOutRounds();

  const answer = `Odd one out is a free word game with ${rounds.length} rounds. Each round shows ${OPTION_COUNT} English words: three whose every sense WordNet files under one subject — animals, food, verbs of thinking — and one filed somewhere else. Picking the intruder reveals the field all four belong to, named in plain English, and the ${singleDomain.toLocaleString("en-US")} words the game draws on are only ever words with a single field to their name.`;

  return (
    <>
      <JsonLd
        id="altf-lexicon-game-odd-one-out"
        data={[
          createFaqJsonLd({ path: PATH, questions: FAQS }),
          createHowToJsonLd({
            path: PATH,
            name: "How to play odd one out",
            description: GAME.tagline,
            steps: STEPS,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Word games", path: "/lexicon/games" },
            { name: "Odd one out", path: PATH },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Breadcrumb
          items={[
            { name: "Lexicon", path: "/lexicon" },
            { name: "Word games", path: "/lexicon/games" },
            { name: "Odd one out" },
          ]}
        />

        <header>
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Word game
          </span>
          <h1 className="mt-2 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold tracking-[-0.02em] text-foreground">
            Odd one out
          </h1>
          <p className="mt-3 max-w-[68ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
            {GAME.blurb}
          </p>

          <AnswerFirst>{answer}</AnswerFirst>

          <StatStrip
            stats={[
              { value: rounds.length, label: "Rounds" },
              { value: OPTION_COUNT, label: "Words per round" },
              { value: singleDomain.toLocaleString("en-US"), label: "Single-field words" },
              { value: homeCount, label: "Fields in play" },
            ]}
          />
        </header>

        <OddOneOutGame rounds={rounds} />

        <HowToPlay steps={STEPS}>
          Every round is in the page when it loads. Nothing is fetched between rounds, so the game
          behaves the same on a slow connection as on a fast one, and keeps working with the network
          switched off.
        </HowToPlay>

        <HowItWasBuilt>
          <p>
            Candidates come from the {SOURCE_COLLECTIONS.length} subject collections that are each
            built from one WordNet lexicographer file. Words in commonness band {MIN_BAND} or
            higher, four to twelve letters, with a definition that reads whole and does not contain
            the word it defines, give {poolSize.toLocaleString("en-US")} entries to check.
          </p>
          <p>
            Each of those is then read in full, because the rule this game turns on cannot be
            checked from a single definition: every sense of the word must sit in the same file, and
            at least one sense must carry a tag from WordNet&rsquo;s hand-annotated corpus — the
            test that keeps proper names with a common spelling out of a vocabulary game.{" "}
            {singleDomain.toLocaleString("en-US")} words survive both, spread across {domainCount}{" "}
            files, of which {homeCount} hold enough words to host a round.
          </p>
          <p>
            A round takes three words from one file and one from another file of the same part of
            speech, skipping pairings a reader would rightly argue with — a jury and a lawyer differ
            only by WordNet&rsquo;s filing convention, so groups and people are never set against
            each other. Which file hosts which round, which word is the intruder and which slot it
            lands in are all fixed by hashing slugs, so the {rounds.length} rounds are identical on
            every build.
          </p>
        </HowItWasBuilt>

        <GameFaq questions={FAQS} heading="Questions about odd one out" />

        <MoreGames current="odd-one-out" />

        <SourceNote />
      </div>
    </>
  );
}
