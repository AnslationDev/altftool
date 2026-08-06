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
import PatternSearch from "./PatternSearch";

export const revalidate = 86400;

const SLUG = "word-pattern-search";
const PATH = `/lexicon/tools/${SLUG}`;
const TOOL = TOOLS_BY_SLUG[SLUG];

const STEPS = [
  "Write the letters you already know in the positions they occupy.",
  "Fill each unknown position with a token: ? for exactly one letter, @ for any vowel, # for any consonant.",
  "Use * where you do not know how many letters are missing — it stands for any run, including none, so *ology finds words of any length ending in those five letters.",
  "Read the matches, commonest first, and open any of them for its definition.",
];

const TOKEN_TABLE = [
  { token: "?", meaning: "Exactly one letter", example: "st??e", finds: "stone, stage, stale" },
  {
    token: "*",
    meaning: "Any run of letters, including none",
    example: "*ology",
    finds: "biology, psychology, ology",
  },
  { token: "@", meaning: "Any vowel: a e i o u", example: "b@ll", finds: "ball, bell, bill, bull" },
  {
    token: "#",
    meaning: "Any consonant: the other twenty-one letters",
    example: "#ight",
    finds: "light, night, right, sight",
  },
];

const FAQS = [
  {
    question: "How is this different from a crossword solver that wants a clue?",
    answer:
      "It works from the grid, not the clue. You give it the letters you have already filled in and their positions, and it returns every word in the dictionary that fits that shape. It has no opinion about what the clue means — which is exactly what you want when the clue is the part you are stuck on.",
  },
  {
    question: "Does the pattern have to describe the whole word?",
    answer:
      "Yes, unless you use *. A pattern is matched from a word's first letter to its last, so st??e finds STONE but not MISTAKE. Wrap the pattern in stars — *st??e* — to let it match anywhere inside a word.",
  },
  {
    question: "Is y a vowel or a consonant here?",
    answer:
      "A consonant. @ matches a, e, i, o and u only; # matches the other twenty-one letters including y. English treats y both ways depending on the word, and a tool that had to guess which would be wrong about half the time, so the rule is fixed and stated rather than inferred.",
  },
  {
    question: "How many results does it return?",
    answer:
      "Up to 300. Loose patterns match far more than that — a bare ????? matches thousands — so when the list is capped the tool says so and reports the true total. Adding one known letter usually cuts the result set by an order of magnitude.",
  },
  {
    question: "Why are results ordered by how common the word is?",
    answer:
      "Because a solver wants the likely answer, not the alphabetically first one. A five-letter pattern typically matches a handful of everyday words and a long tail of taxonomic names, and sorting by commonness puts the ones you might actually write into the grid at the top.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "Word pattern search — crossword patterns with wildcards",
    description:
      "Find every word matching a pattern: ? for one letter, * for any run, @ for any vowel, # for any consonant. Searches 77,636 words and orders results by how common they are.",
    path: PATH,
    keywords: TOOL.keywords,
  });
}

export default async function WordPatternSearchPage() {
  const stats = await getBankStats();

  const answer = `A word pattern search finds every word that fits a shape you already know part of. Write the letters you have and a token for each one you do not: ? for exactly one letter, * for any run of letters, @ for any vowel, # for any consonant. The pattern is matched against ${stats.words.toLocaleString("en-US")} single-word dictionary entries and up to 300 matches come back, commonest first.`;

  return (
    <>
      <JsonLd
        id="altf-lexicon-tool-word-pattern-search"
        data={[
          createHowToJsonLd({
            path: PATH,
            name: "How to search for words by pattern",
            description:
              "Find every dictionary word matching a crossword-style pattern of known letters and wildcards.",
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
            Word pattern search
          </h1>

          <AnswerFirst>{answer}</AnswerFirst>

          <StatStrip
            stats={[
              { value: stats.words.toLocaleString("en-US"), label: "Words matched against" },
              { value: "4", label: "Wildcard tokens" },
              { value: "300", label: "Results per search" },
              {
                value: `${stats.minLength}–${stats.maxLength}`,
                label: "Word lengths covered",
              },
            ]}
          />
        </header>

        <PatternSearch />

        <ToolSection title="How to use it">
          <HowToSteps steps={STEPS} />
        </ToolSection>

        <ToolSection title="The four tokens">
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="py-2 pr-4 font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
                    Token
                  </th>
                  <th scope="col" className="py-2 pr-4 font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
                    Matches
                  </th>
                  <th scope="col" className="py-2 pr-4 font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
                    Example
                  </th>
                  <th scope="col" className="py-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
                    Finds
                  </th>
                </tr>
              </thead>
              <tbody className="afl-divide">
                {TOKEN_TABLE.map((row) => (
                  <tr key={row.token}>
                    <td className="py-3 pr-4 font-mono text-base font-semibold text-foreground">
                      {row.token}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{row.meaning}</td>
                    <td className="py-3 pr-4 font-mono text-foreground">{row.example}</td>
                    <td className="py-3 text-muted-foreground">{row.finds}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ToolSection>

        <ToolSection title="How the search works">
          <Prose>
            <p>
              The pattern is compiled into a regular expression on the server. The compiler reads
              your input one character at a time and keeps only letters a–z and the four tokens;
              everything else is discarded rather than escaped. That means the compiled expression
              can only ever contain letters and four fixed character classes, and there is no route
              from what you type to a regex metacharacter — which is why the box takes anything you
              paste into it without complaint.
            </p>
            <p>
              When a pattern begins with a known letter, the scan runs inside that letter&rsquo;s
              block of the index rather than over the whole thing. A pattern starting with{" "}
              <span className="font-mono">s</span> reads about eight thousand entries instead of{" "}
              {stats.words.toLocaleString("en-US")}; a pattern starting with{" "}
              <span className="font-mono">x</span> reads a couple of hundred. Patterns that begin
              with a wildcard have no such shortcut and scan the whole index, which is still fast
              enough to answer while you type. The tool reports how many entries it read under
              every result set.
            </p>
            <p>
              Length is bounded before the expression runs: a pattern with no{" "}
              <span className="font-mono">*</span> can only match words of exactly its own length,
              so words of any other length are skipped without being tested at all.
            </p>
          </Prose>
        </ToolSection>

        <ToolSection title="What is in the index">
          <Prose>
            <p>
              The {stats.words.toLocaleString("en-US")} AltF Lexicon entries whose headword is a
              single unbroken run of a–z, from {stats.minLength} to {stats.maxLength} letters. That
              deliberately excludes phrases, hyphenated compounds and anything with an apostrophe
              or a digit, because none of them can be written into a crossword grid one letter per
              square.
            </p>
            <p>
              If you would rather browse than search, the dictionary also keeps precomputed lists
              by length, first letter and last letter.{" "}
              <Link href="/lexicon/words" className="text-primary hover:underline">
                Word lists
              </Link>{" "}
              has all of them.
            </p>
          </Prose>
        </ToolSection>

        <FaqBlock faqs={FAQS} title="Questions about pattern search" />

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
