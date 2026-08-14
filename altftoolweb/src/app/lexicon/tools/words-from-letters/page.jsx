import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createHowToJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

import { AnswerFirst, Breadcrumb, StatStrip } from "../../_components/WordAtoms";
import { TOOLS_BY_SLUG } from "../_shared/catalog";
import { TILE_ROWS } from "../_shared/scrabble";
import {
  FaqBlock,
  HowToSteps,
  Prose,
  RelatedTools,
  SourcesNote,
  ToolSection,
} from "../_shared/ToolFrame";
import { getBankStats } from "../_shared/wordbank";
import RackSolver from "./RackSolver";

export const revalidate = 86400;

const SLUG = "words-from-letters";
const PATH = `/lexicon/tools/${SLUG}`;
const TOOL = TOOLS_BY_SLUG[SLUG];

const STEPS = [
  "Type your tiles into the box. Order does not matter and separators are ignored, so you can copy a rack out however it is written.",
  "Type ? for each blank you hold. A standard set has two, and a blank scores nothing.",
  "Read the highest-scoring play at the top, then the full list grouped by face value.",
  "Open any word for its definition — useful when the play you want to make is one you have never seen before.",
];

const FAQS = [
  {
    question: "How are the scores worked out?",
    answer:
      "Each letter is worth its value on a standard English Scrabble set, and the word's score is the sum. No board multipliers are applied, so these are face values: a double-word square or a triple-letter square will beat every number on this page. A letter covered by a blank scores nothing and is subtracted, which is why QUIZZER played through a blank R scores 33 rather than 34.",
  },
  {
    question: "Are these the standard English tile values?",
    answer:
      "Yes. The table on this page is the distribution printed on an English-language Scrabble set, derived by Alfred Butts in 1938 from letter counts on the front page of the New York Times. Other language editions use different values — the Italian set has no K and scores Z at 8 — so these numbers apply to English play only.",
  },
  {
    question: "Will every word here be accepted in a game?",
    answer:
      "Not necessarily. Tournament play uses a licensed word list — TWL in North America, Collins elsewhere — and this tool searches Princeton WordNet, a general lexical database. The overlap on common words is near total, but the edges differ in both directions: WordNet carries proper nouns and technical terms a tournament list excludes, and omits some short forms it includes.",
  },
  {
    question: "Why is a short word sometimes worth more than a long one?",
    answer:
      "Because value is concentrated in a few letters. Q and Z are worth ten each, J and X eight, so a two-letter word using one of them beats a six-letter word made of one-point tiles. That is why the list is ordered by score rather than by length — those are genuinely different orderings, not the same list twice.",
  },
  {
    question: "Does it know about the board?",
    answer:
      "No. It solves the rack, not the position. It cannot see the premium squares, the letters already played or the hooks available, all of which routinely change which play is best. Use it to find what your tiles can make, then decide where to put it.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "Words from letters — Scrabble rack solver, scored",
    description:
      "Every word your tiles can make, scored with the standard English Scrabble values and ordered highest first. Supports blanks, and links every word to its definition.",
    path: PATH,
    keywords: TOOL.keywords,
  });
}

export default async function WordsFromLettersPage() {
  const stats = await getBankStats();

  const answer = `This tool finds every word that can be made from a set of letter tiles and scores each one with the standard English Scrabble tile values, highest first. It searches the ${stats.words.toLocaleString("en-US")} single-word entries in AltF Lexicon, returns up to 300 plays, and scores a letter covered by a blank at zero. Scores are face values with no board multipliers.`;

  return (
    <>
      <JsonLd
        id="altf-lexicon-tool-words-from-letters"
        data={[
          createHowToJsonLd({
            path: PATH,
            name: "How to find the highest-scoring word from your letters",
            description:
              "Solve a Scrabble rack: find every word your tiles can make and score it with the standard English tile values.",
            steps: STEPS,
          }),
          createFaqJsonLd({ path: PATH, questions: FAQS }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Word tools", path: "/lexicon/tools" },
            { name: TOOL.name, path: PATH },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Breadcrumb
          items={[
            { name: "Lexicon", path: "/lexicon" },
            { name: "Word tools", path: "/lexicon/tools" },
            { name: TOOL.name },
          ]}
        />

        <header>
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Word tools
          </span>
          <h1 className="mt-2 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold tracking-[-0.02em] text-foreground">
            Words from letters
          </h1>

          <AnswerFirst>{answer}</AnswerFirst>

          <StatStrip
            stats={[
              { value: stats.words.toLocaleString("en-US"), label: "Words searched" },
              { value: "300", label: "Plays per rack" },
              { value: "2", label: "Blanks allowed" },
              { value: "0", label: "Board multipliers applied" },
            ]}
          />
        </header>

        <RackSolver />

        <ToolSection title="How to use it">
          <HowToSteps steps={STEPS} />
        </ToolSection>

        <ToolSection
          title="Standard English Scrabble tile values"
          description="These are the values printed on an English-language Scrabble set — the standard English distribution, derived by Alfred Butts in 1938 from letter counts on the front page of the New York Times. Every score on this page is computed from this table and nothing else."
        >
          <ul
            className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4"
            style={{ listStyle: "none" }}
          >
            {TILE_ROWS.map((row) => (
              <li
                key={row.value}
                className="flex items-baseline gap-3 rounded-lg border border-border bg-surface p-4"
              >
                <span className="font-mono text-2xl font-semibold tabular-nums text-primary">
                  {row.value}
                </span>
                <span className="min-w-0">
                  <span className="block font-mono text-[0.9375rem] tracking-[0.14em] text-foreground">
                    {row.letters}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {row.value === 1 ? "point" : "points"} each
                  </span>
                </span>
              </li>
            ))}
            <li className="flex items-baseline gap-3 rounded-lg border border-dashed border-border bg-surface p-4">
              <span className="font-mono text-2xl font-semibold tabular-nums text-muted-foreground">
                0
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[0.9375rem] tracking-[0.14em] text-foreground">
                  Blank
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  two per set, no points
                </span>
              </span>
            </li>
          </ul>
        </ToolSection>

        <ToolSection title="How the rack is solved">
          <Prose>
            <p>
              Every word in the index is stored under its letters, sorted — so PRAISED and DESPAIR
              both live under <span className="font-mono">adeiprs</span>. Your rack is sorted the
              same way, and the solver keeps every signature your tiles can cover, counting
              repeats: two Ps are needed for a word with two Ps. Each blank raises the number of
              letters a word may be missing by one.
            </p>
            <p>
              Then each surviving word is scored from the table above and the list is ordered by
              value. That ordering is the reason this tool exists separately from the{" "}
              <Link href="/lexicon/tools/word-unscrambler" className="text-primary hover:underline">
                word unscrambler
              </Link>
              , which reads the same index and orders by length. From AEINRST the unscrambler leads
              with RETSINA at seven letters; the same seven tiles are worth seven points, which a
              two-letter play using a Z or a Q would beat outright.
            </p>
            <p>
              When a blank covers a letter, that letter&rsquo;s value is subtracted before the word
              is ranked, and the tool says which letter the blank stood in for. Ranking a
              blank-assisted play at its full face value would put words at the top of the list
              that cannot actually be scored that way.
            </p>
          </Prose>
        </ToolSection>

        <ToolSection title="What this cannot tell you">
          <Prose>
            <p>
              It solves the rack, not the position. Premium squares, the letters already on the
              board, the hooks you could play through and the tiles you would keep back are all
              invisible to it, and any of them can change which play is right. A 24-point word on a
              plain row loses to a 12-point word on a double-word square.
            </p>
            <p>
              It also searches a general dictionary rather than a tournament word list. Treat an
              answer as a word that exists, then check it against whichever list your game is
              using. Scrabble is a trademark of Hasbro in North America and Mattel elsewhere;
              neither company is connected to this tool, and the tile values reproduced here are
              facts about the game rather than anything licensed from them.
            </p>
          </Prose>
        </ToolSection>

        <FaqBlock faqs={FAQS} title="Questions about scoring words" />

        <RelatedTools slug={SLUG} />

        <SourcesNote>
          The word list comes from Princeton University&rsquo;s WordNet, with commonness bands
          derived from a frequency corpus of everyday English. Tile values are the standard English
          Scrabble distribution. Definitions and pronunciations on the linked entry pages come from
          WordNet and the CMU Pronouncing Dictionary.
        </SourcesNote>

        <div className="h-16" />
      </div>
    </>
  );
}
