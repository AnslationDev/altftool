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
import {
  FaqBlock,
  HowToSteps,
  Prose,
  RelatedTools,
  SourcesNote,
  ToolSection,
} from "../_shared/ToolFrame";
import { getBankStats } from "../_shared/wordbank";
import WordUnscrambler from "./WordUnscrambler";

export const revalidate = 86400;

const SLUG = "word-unscrambler";
const PATH = `/lexicon/tools/${SLUG}`;
const TOOL = TOOLS_BY_SLUG[SLUG];

const STEPS = [
  "Type the scrambled letters into the box. Up to fifteen are read; spaces, commas and hyphens are ignored.",
  "Type ? for a letter you do not have or cannot make out. Two blanks are the maximum.",
  "Set the shortest answer you care about. Two letters is the floor; raising it hides the short tail without re-running the search.",
  "Read the answers longest first, and click any of them to open its dictionary entry.",
];

const FAQS = [
  {
    question: "What is the difference between unscrambling and solving an anagram?",
    answer:
      "An anagram uses every letter exactly once. Unscrambling allows letters to be left over — from the letters of SPRAINED it will return SPRAINED, PARDONS, RAPIDS, RAIN and AS, because each of those can be spelled from some or all of them. If you need answers that spend the whole rack, use the anagram solver instead.",
  },
  {
    question: "Why are the answers ordered longest first?",
    answer:
      "Because that is the order of usefulness for the two things people unscramble letters for: a puzzle answer of a known length, and a high-scoring play. Within each length the commonest words come first, so the words you can actually use are at the top of every band.",
  },
  {
    question: "Can it unscramble a phrase or a sentence?",
    answer:
      "No. It returns single dictionary headwords, so it will not split your letters across several words. Multi-word solutions have an answer space orders of magnitude larger and are almost never what a puzzle wants.",
  },
  {
    question: "How many answers can it return?",
    answer:
      "Up to 400 in one pass. Eight or nine common letters routinely produce more than that, so when the list is capped the tool says so and reports the true total. The longest answers are always kept — the tail that gets dropped is the two- and three-letter words.",
  },
  {
    question: "Does it include plurals and verb forms?",
    answer:
      "Yes, where the dictionary carries them as headwords in their own right. WordNet lists many inflected forms; where it does not, the base form is what you will get, and the entry page for that base form covers the inflections.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "Word unscrambler — every word hiding in your letters",
    description:
      "Unscramble any set of letters into real words, longest first. Uses some or all of your letters, supports blanks, and links every answer to its dictionary entry.",
    path: PATH,
    keywords: TOOL.keywords,
  });
}

export default async function WordUnscramblerPage() {
  const stats = await getBankStats();

  const answer = `A word unscrambler finds every real word that can be spelled from a set of jumbled letters, using some or all of them. This one searches the ${stats.words.toLocaleString("en-US")} single-word entries in AltF Lexicon, returns up to 400 answers ordered longest first, and links each one to its full dictionary entry. Type ? for a letter you do not have.`;

  return (
    <>
      <JsonLd
        id="altf-lexicon-tool-word-unscrambler"
        data={[
          createHowToJsonLd({
            path: PATH,
            name: "How to unscramble letters into words",
            description:
              "Find every dictionary word that can be spelled from some or all of a set of jumbled letters.",
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
            Word unscrambler
          </h1>

          <AnswerFirst>{answer}</AnswerFirst>

          <StatStrip
            stats={[
              { value: stats.words.toLocaleString("en-US"), label: "Words searched" },
              { value: "400", label: "Answers per search" },
              { value: "15", label: "Letters read" },
              { value: "2", label: "Blanks allowed" },
            ]}
          />
        </header>

        <WordUnscrambler />

        <ToolSection title="How to use it">
          <HowToSteps steps={STEPS} />
        </ToolSection>

        <ToolSection title="How the unscrambler works">
          <Prose>
            <p>
              Unscrambling is a containment question, not a rearrangement one. The tool holds every
              dictionary word by its sorted letters —{" "}
              <span className="font-mono">deprais</span> for both PRAISED and DESPAIR — and asks of
              each signature: can your letters cover it? A word is an answer when every letter it
              needs is present in your set, counted with multiplicity, so RAPIDS is an answer for
              SPRAINED but PAPERS is not, because you only have one P.
            </p>
            <p>
              That check runs against all{" "}
              {stats.anagramKeys.toLocaleString("en-US")} signatures in the index, skipping any
              longer than your rack. Each blank you type raises the number of missing letters a
              word is allowed to have by one, which is exactly what a blank tile does.
            </p>
            <p>
              The engine behind this page and behind the{" "}
              <Link href="/lexicon/tools/anagram-solver" className="text-primary hover:underline">
                anagram solver
              </Link>{" "}
              is the same code with one flag changed. An anagram is the special case where the
              answer has to be the same length as the rack.
            </p>
          </Prose>
        </ToolSection>

        <ToolSection title="Where the words come from">
          <Prose>
            <p>
              All {stats.words.toLocaleString("en-US")} of them are headwords in AltF Lexicon,
              which is built from Princeton University&rsquo;s WordNet. Only entries written as a
              single unbroken run of a–z are searched, between {stats.minLength} and{" "}
              {stats.maxLength} letters long — a jumble of loose letters cannot produce a space, a
              hyphen or an apostrophe, so entries containing them are left out rather than silently
              matched on a stripped-down form.
            </p>
            <p>
              The meter beside each answer is that word&rsquo;s commonness band, from a frequency
              corpus of everyday English. Puzzle setters and Scrabble players want opposite ends of
              it, so it is shown rather than used to filter.
            </p>
          </Prose>
        </ToolSection>

        <FaqBlock faqs={FAQS} title="Questions about unscrambling words" />

        <RelatedTools slug={SLUG} />

        <SourcesNote>
          The word list comes from Princeton University&rsquo;s WordNet, with commonness bands
          derived from a frequency corpus of everyday English. Definitions and pronunciations on
          the linked entry pages come from WordNet and the CMU Pronouncing Dictionary.
        </SourcesNote>

        <div className="h-16" />
      </div>
    </>
  );
}
