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
import SyllableGame from "./SyllableGame";
import {
  MAX_SYLLABLES,
  MIN_BAND,
  PER_SYLLABLE,
  ROUND_COUNT,
  SOURCE_COLLECTIONS,
  buildSyllableRounds,
} from "./rounds";

export const revalidate = 86400;

const PATH = "/lexicon/games/syllable-split";
const GAME = GAMES_BY_SLUG["syllable-split"];

const description =
  "A free syllable counting game: guess how many syllables a word has, then see the split, the stressed syllable, the IPA, the respelling and the rule that puts the stress there. 30 rounds.";

const STEPS = [
  "Read the word, then say it under your breath. Counting beats out loud is more accurate than counting vowels on the page — English spells more vowels than it says.",
  `Press the number of syllables you heard, from 1 to ${MAX_SYLLABLES}. Click a tile, press its number key, or Tab to it and press Enter.`,
  "The round settles on your first press. There is no second guess.",
  "Read the split. The stressed syllable is inked and raised, so the beat is visible rather than something you decode from a mark you half remember.",
  "Read the note underneath it. Where a suffix rule fixes the stress, the rule is named — and it is only named when the word in front of you actually obeys it.",
];

const FAQS = [
  {
    question: "How do you count syllables in a word?",
    answer:
      "Say the word and count the beats — each syllable carries exactly one vowel sound, however many vowel letters are written. Comfortable looks like four and is said as three; chocolate looks like three and is usually said as two. That gap between spelling and speech is why this game reads the count from a pronouncing dictionary rather than from the spelling.",
  },
  {
    question: "Where do these syllable counts come from?",
    answer:
      "From the CMU Pronouncing Dictionary, which records the phonemes and the stress of each word as it is actually said. A word only appears here if it has a real CMU entry: nothing in this game is a count guessed from the letters, because a wrong answer you cannot defend is worse than one round fewer.",
  },
  {
    question: "What is the inked syllable in the reveal?",
    answer:
      "The stressed one — the beat the word leans on. English marks stress nowhere in its spelling, which is why PRESent the gift and preSENT the argument are written identically. Ink, capitals and a hair of lift make it readable at a glance.",
  },
  {
    question: "Why does the stress explanation change from word to word?",
    answer:
      "Because the reason changes. Some words are governed by their ending: anything in -tion takes the stress onto the syllable before it, and -ity pulls it three from the end. Where a rule like that holds, the game names it. Where none applies, it describes the position instead. A rule is only ever printed when the recorded stress matches what the rule predicts, so you are never told a rule the word in front of you breaks.",
  },
  {
    question: "Are the words the same every time?",
    answer: `Yes. All ${ROUND_COUNT} are chosen by hashing slugs rather than by a random draw — ${PER_SYLLABLE} words at each length from one syllable to ${MAX_SYLLABLES} — so every player sees the same set. Restarting reshuffles the order in your browser; it does not swap the words.`,
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: `Syllable split — a ${ROUND_COUNT}-round syllable counting game`,
    description,
    path: PATH,
    keywords: [
      "syllable game",
      "syllable counting game",
      "how many syllables",
      "word stress game",
      "pronunciation game",
      "free word game",
    ],
  });
}

export default async function SyllableSplitPage() {
  const { rounds, poolSize, checked, withPronunciation } = await buildSyllableRounds();

  const answer = `Syllable split is a free syllable counting game with ${rounds.length} rounds: ${PER_SYLLABLE} words at each length from one syllable to ${MAX_SYLLABLES}. Guess the count and the word opens up — the split, the stressed syllable inked, the IPA, the respelling and one sentence on why the stress sits where it does. Every count is read from the CMU Pronouncing Dictionary, so nothing here is a syllable count guessed from spelling.`;

  return (
    <>
      <JsonLd
        id="altf-lexicon-game-syllable-split"
        data={[
          createFaqJsonLd({ path: PATH, questions: FAQS }),
          createHowToJsonLd({
            path: PATH,
            name: "How to play syllable split",
            description: GAME.tagline,
            steps: STEPS,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Word games", path: "/lexicon/games" },
            { name: "Syllable split", path: PATH },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Breadcrumb
          items={[
            { name: "Lexicon", path: "/lexicon" },
            { name: "Word games", path: "/lexicon/games" },
            { name: "Syllable split" },
          ]}
        />

        <header>
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Word game
          </span>
          <h1 className="mt-2 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold tracking-[-0.02em] text-foreground">
            Syllable split
          </h1>
          <p className="mt-3 max-w-[68ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
            {GAME.blurb}
          </p>

          <AnswerFirst>{answer}</AnswerFirst>

          <StatStrip
            stats={[
              { value: rounds.length, label: "Rounds" },
              { value: `1–${MAX_SYLLABLES}`, label: "Syllables in play" },
              { value: PER_SYLLABLE, label: "Words at each length" },
              { value: poolSize.toLocaleString("en-US"), label: "Words in the pool" },
            ]}
          />
        </header>

        <SyllableGame rounds={rounds} maxCount={MAX_SYLLABLES} />

        <HowToPlay steps={STEPS}>
          All {rounds.length} words, their splits, their transcriptions and their stress notes are
          in the page when it loads. Nothing is fetched between rounds, so the game behaves the same
          on a slow connection as on a fast one.
        </HowToPlay>

        <HowItWasBuilt>
          <p>
            Candidates are drawn from {SOURCE_COLLECTIONS.length} collections — the everyday ones,
            plus the sound-shaped ones: one-syllable words, five-syllable words, words stressed on
            the last beat, words spelled nothing like they are said. Left to the everyday
            collections alone the draw is almost all one- and two-syllable words, because that is
            what English mostly is, and a six-button game would not be worth six buttons.{" "}
            {poolSize.toLocaleString("en-US")} single words in commonness band {MIN_BAND} or higher,
            with a recorded syllable count of {MAX_SYLLABLES} or fewer, clear the first pass.
          </p>
          <p>
            An even slice across the six lengths gives {checked.toLocaleString("en-US")} candidates
            to read in full, and {withPronunciation.toLocaleString("en-US")} of those survive the
            test that matters: a real entry in the CMU Pronouncing Dictionary, carrying IPA, a
            respelling, a split whose parts match the recorded count, and a stress position inside
            that split. Entries whose division was derived from spelling because CMU has never heard
            of the word are thrown out — asking a player to guess a number we ourselves guessed
            would make the wrong answer indefensible.
          </p>
          <p>
            The {rounds.length} that become rounds are the first {PER_SYLLABLE} at each length in
            hash order, so the set is fixed rather than sampled and comes back identical on every
            build. The stress note is written from the word&rsquo;s own ending and its recorded
            stress: a suffix rule is quoted only when the recorded stress is where the rule predicts,
            and otherwise the note describes the position and claims nothing more.
          </p>
        </HowItWasBuilt>

        <GameFaq questions={FAQS} heading="Questions about syllables and stress" />

        <MoreGames current="syllable-split" />

        <SourceNote pronunciation />
      </div>
    </>
  );
}
