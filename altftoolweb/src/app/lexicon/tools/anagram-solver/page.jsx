import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createHowToJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

import { AnswerFirst, Breadcrumb, StatStrip } from "../../_components/WordAtoms";
import { TOOLS_BY_SLUG } from "../_shared/catalog";
import {
  FaqBlock,
  HowToSteps,
  Prose,
  RelatedTools,
  SourcesNote,
  ToolSection,
} from "../_shared/ToolFrame";
import { getBankStats } from "../_shared/wordbank";
import AnagramSolver from "./AnagramSolver";

export const revalidate = 86400;

const SLUG = "anagram-solver";
const PATH = `/lexicon/tools/${SLUG}`;
const TOOL = TOOLS_BY_SLUG[SLUG];

const STEPS = [
  "Type or paste your letters into the box. Spaces, commas and hyphens are stripped, so a rack copied out of a game board works as it stands.",
  "Type ? in place of a letter you do not have or cannot read — a blank tile, a smudged clue, a missing scrap. Up to two blanks are allowed.",
  "Read the answers as they appear. The search runs as you type, so there is no button to press and no page to reload.",
  "Click any answer to open its dictionary entry, with definitions, syllable division, pronunciation and rhymes.",
];

const FAQS = [
  {
    question: "What is an anagram?",
    answer:
      "An anagram is a word made by rearranging all the letters of another, using each letter exactly once. LISTEN and SILENT are anagrams; LISTEN and LINE are not, because LINE leaves S and T unused. This tool returns full anagrams only.",
  },
  {
    question: "Why does my word have no anagrams?",
    answer:
      "Most letter sets have none. English distributes letters unevenly, so a set with several low-frequency consonants and one vowel usually cannot be respelled at all. Roughly two thirds of the distinct letter sets in this dictionary have exactly one word in them, meaning that word is the only arrangement of those letters that means anything.",
  },
  {
    question: "How do I use a blank or a wildcard?",
    answer:
      "Type ? where the unknown letter goes — for example lis?en. Each ? stands for exactly one letter, and every answer will still use every other letter you typed. Two blanks are the maximum, which matches a standard Scrabble set; a third makes the answer list too broad to be an answer.",
  },
  {
    question: "Does it find anagrams of phrases?",
    answer:
      "No. It searches single-word headwords only, so it will not split your letters across two or more words. That is a different problem with a much larger answer space, and a multi-word anagram generator is not what a crossword or a Scrabble rack calls for.",
  },
  {
    question: "Are the answers valid in Scrabble?",
    answer:
      "Treat them as words that exist rather than as words a tournament will accept. This dictionary is Princeton WordNet, a general lexical database, not the licensed TWL or Collins tournament lists. Most common words appear in all three, but the edges differ.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "Anagram solver — every word from your exact letters",
    description:
      "Rearrange any set of letters into real dictionary words that use every one of them. Supports blank tiles, searches 77,636 single-word entries, and links every answer to its definition.",
    path: PATH,
    keywords: TOOL.keywords,
  });
}

export default async function AnagramSolverPage() {
  const stats = await getBankStats();

  const answer = `An anagram solver rearranges a set of letters into words that use every one of them. This one searches the ${stats.words.toLocaleString("en-US")} single-word entries in AltF Lexicon, matches your letters against ${stats.anagramKeys.toLocaleString("en-US")} distinct letter sets, and returns every real word that spends the whole rack. Type ? for a blank tile.`;

  return (
    <>
      <JsonLd
        id="altf-lexicon-tool-anagram-solver"
        data={[
          createHowToJsonLd({
            path: PATH,
            name: "How to solve an anagram",
            description:
              "Find every dictionary word that can be spelled with an exact set of letters, including blank tiles.",
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
            Anagram solver
          </h1>

          <AnswerFirst>{answer}</AnswerFirst>

          <StatStrip
            stats={[
              { value: stats.words.toLocaleString("en-US"), label: "Words searched" },
              { value: stats.anagramKeys.toLocaleString("en-US"), label: "Letter sets indexed" },
              { value: "2", label: "Blanks allowed" },
              {
                value: `${stats.minLength}–${stats.maxLength}`,
                label: "Letters per answer",
              },
            ]}
          />
        </header>

        <AnagramSolver />

        <ToolSection title="How to use it">
          <HowToSteps steps={STEPS} />
        </ToolSection>

        <ToolSection title="How the solver works">
          <Prose>
            <p>
              Every word in the dictionary has a signature: its letters, sorted. LISTEN, SILENT,
              ENLIST and TINSEL all reduce to <span className="font-mono">eilnst</span>. Sorting
              throws away the arrangement and keeps only the multiset of letters, which is exactly
              the thing anagrams have in common.
            </p>
            <p>
              The solver builds that signature for all{" "}
              {stats.words.toLocaleString("en-US")} single-word entries once, and groups them into{" "}
              {stats.anagramKeys.toLocaleString("en-US")} buckets. When you type letters, it sorts
              them the same way and looks the bucket up directly — one hash lookup, not a scan of
              the dictionary. That is why the answers arrive while you are still typing.
            </p>
            <p>
              A blank breaks the shortcut, because <span className="font-mono">?</span> could be
              any of twenty-six letters and there is no single bucket to look in. With blanks the
              solver walks every bucket of the right length and asks whether your letters cover it
              with at most that many gaps. It is a full pass over the index rather than one lookup,
              which is why blanks are capped at two: a third would widen the answer set past the
              point where it answers anything.
            </p>
          </Prose>
        </ToolSection>

        <ToolSection title="What counts as a word here">
          <Prose>
            <p>
              The index holds the {stats.words.toLocaleString("en-US")} AltF Lexicon entries whose
              headword is a single unbroken run of a–z, between {stats.minLength} and{" "}
              {stats.maxLength} letters. Phrases (<em>q fever</em>), hyphenated compounds and
              anything carrying a digit or an apostrophe are excluded, because a rack of tiles
              cannot produce them.
            </p>
            <p>
              Answers are ordered by length, then by how common the word is, then alphabetically.
              The five-segment meter beside each answer is that commonness band, measured against a
              corpus of everyday English rather than assigned by an editor — it is the quickest way
              to see that <em>silent</em> and <em>drepanis</em> are not equally useful to you.
            </p>
          </Prose>
        </ToolSection>

        <FaqBlock faqs={FAQS} title="Questions about anagrams" />

        <RelatedTools slug={SLUG} />

        <SourcesNote>
          The word list comes from Princeton University&rsquo;s WordNet, with commonness bands
          derived from a frequency corpus of everyday English. Definitions on the linked entry
          pages are WordNet&rsquo;s; pronunciation comes from the CMU Pronouncing Dictionary.
        </SourcesNote>

        <div className="h-16" />
      </div>
    </>
  );
}
