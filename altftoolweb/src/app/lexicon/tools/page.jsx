import Link from "next/link";
import { ArrowRight } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createHowToJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { getManifest } from "@altftool/core/lexicon/corpus";

import { AnswerFirst, Breadcrumb, StatStrip } from "../_components/WordAtoms";
import { TOOLS, toolPath } from "./_shared/catalog";
import { HowToSteps, Prose, SourcesNote, ToolIcon, ToolSection } from "./_shared/ToolFrame";
import { getBankStats } from "./_shared/wordbank";

export const revalidate = 86400;

const PATH = "/lexicon/tools";

const STEPS = [
  "Decide whether you have letters or a shape. Letters — a rack, a jumble, a set of tiles — go to the anagram solver, the word unscrambler or the Scrabble rack solver. A shape, meaning you know some letters and their positions, goes to the pattern search.",
  "If every letter has to be used, use the anagram solver. If some of them may be left over, use the word unscrambler. They read the same index; the only difference is that rule.",
  "If the answer needs a score rather than a length, use Words from letters. It orders by what each word is worth on a standard English Scrabble set instead of by how long it is.",
  "For sound rather than spelling, use the rhyme finder. It matches phonemes from the last stressed vowel, so it will not offer you rough for though.",
  "For text you already have, use the syllable counter. It reports syllables per word, a total, and a Flesch Reading Ease score for the passage.",
];

const FAQS = [
  {
    question: "Which words do these tools consider real?",
    answer:
      "Every answer is an entry in AltF Lexicon, which is built from Princeton WordNet and the CMU Pronouncing Dictionary. The letter tools search the 77,636 entries whose headword is a single unbroken run of a–z — phrases, hyphenated forms and anything with a digit or apostrophe are excluded, because none of them can be played on a rack or written into a crossword grid.",
  },
  {
    question: "Is this the same word list a Scrabble tournament uses?",
    answer:
      "No. Tournament play uses a licensed word list (TWL or Collins) that includes forms WordNet does not carry and excludes proper nouns WordNet does. These tools search a general English dictionary, so treat a result as a word that exists rather than as a word a tournament judge will accept.",
  },
  {
    question: "Do the tools work offline or send my text anywhere?",
    answer:
      "The syllable counter runs entirely in your browser — the text you paste never leaves it. The other five ask a server for the answer, because the index they search is 26 compressed files and sending any useful part of it to the browser would cost several megabytes before the page could paint. Only the letters or the word you type are sent, never anything else on the page.",
  },
  {
    question: "Why do results link through to a dictionary entry?",
    answer:
      "Because a list of letter strings is not much use on its own. Every answer these tools produce is a headword in the same dictionary, so every answer carries its definition, syllable division, pronunciation and rhymes one click away.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "Word tools — anagrams, rhymes, syllables and patterns",
    description:
      "Six word tools built on a 147,478-entry dictionary: anagram solver, word unscrambler, syllable counter, rhyme finder, crossword pattern search and a Scrabble rack solver.",
    path: PATH,
    keywords: [
      "word tools",
      "anagram solver",
      "word unscrambler",
      "syllable counter",
      "rhyme finder",
      "crossword pattern search",
      "scrabble word finder",
    ],
  });
}

export default async function ToolsHubPage() {
  const [manifest, stats] = await Promise.all([getManifest(), getBankStats()]);

  const answer = `AltF Lexicon has six word tools: an anagram solver, a word unscrambler, a syllable counter, a rhyme finder, a crossword pattern search and a Scrabble rack solver. All six search the same ${manifest.total.toLocaleString("en-US")}-entry dictionary, and every answer links to that word's full entry.`;

  return (
    <>
      <JsonLd
        id="altf-lexicon-tools-hub"
        data={[
          createCollectionPageJsonLd({
            path: PATH,
            name: "AltF Lexicon word tools",
            description:
              "Anagram solver, word unscrambler, syllable counter, rhyme finder, crossword pattern search and Scrabble rack solver, all searching one 147,478-entry dictionary.",
          }),
          createItemListJsonLd({
            path: PATH,
            name: "AltF Lexicon word tools",
            items: TOOLS.map((tool) => ({ name: tool.name, path: toolPath(tool.slug) })),
          }),
          createHowToJsonLd({
            path: PATH,
            name: "How to choose an AltF Lexicon word tool",
            description:
              "Pick the right word tool by what you are starting from: loose letters, a fixed pattern, a sound, or text you already have.",
            steps: STEPS,
          }),
          createFaqJsonLd({ path: PATH, questions: FAQS }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Word tools", path: PATH },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Breadcrumb items={[{ name: "Lexicon", path: "/lexicon" }, { name: "Word tools" }]} />

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Word tools
          </span>
          <h1 className="mt-2 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold tracking-[-0.02em] text-foreground">
            Six tools, one dictionary
          </h1>

          <AnswerFirst>{answer}</AnswerFirst>

          <StatStrip
            stats={[
              { value: manifest.total.toLocaleString("en-US"), label: "Dictionary entries" },
              { value: stats.words.toLocaleString("en-US"), label: "Playable single words" },
              {
                value: stats.anagramKeys.toLocaleString("en-US"),
                label: "Distinct letter sets",
              },
              { value: manifest.rhymeGroups.toLocaleString("en-US"), label: "Rhyme groups" },
            ]}
          />
        </header>

        <ul
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          style={{ listStyle: "none" }}
        >
          {TOOLS.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={toolPath(tool.slug)}
                className="afl-card flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-5 no-underline"
              >
                <span className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <ToolIcon name={tool.icon} />
                  </span>
                  <span className="text-lg font-semibold tracking-[-0.01em] text-foreground">
                    {tool.name}
                  </span>
                </span>
                <span className="text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {tool.summary}
                </span>
                <span className="mt-auto flex items-center gap-1.5 pt-2 font-mono text-xs text-primary">
                  Try {tool.example}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <ToolSection title="How to pick one">
          <HowToSteps steps={STEPS} />
        </ToolSection>

        <ToolSection title="What they all search">
          <Prose>
            <p>
              AltF Lexicon holds {manifest.total.toLocaleString("en-US")} entries: definitions and
              semantic relations from Princeton University&rsquo;s WordNet, pronunciation and
              stress from the CMU Pronouncing Dictionary, and a commonness band derived from how
              often each word appears in a large corpus of everyday English.
            </p>
            <p>
              The five letter-and-sound tools work from a reduced index of{" "}
              {stats.words.toLocaleString("en-US")} of those entries — the ones whose headword is a
              single unbroken run of a–z, between {stats.minLength} and {stats.maxLength} letters
              long. Phrases like <em>q fever</em>, hyphenated compounds and anything carrying a
              digit or an apostrophe are left out, because none of them can be played on a rack or
              written into a crossword grid. Those{" "}
              {stats.words.toLocaleString("en-US")} words collapse into{" "}
              {stats.anagramKeys.toLocaleString("en-US")} distinct letter sets, which is what makes
              an anagram lookup a single index hit rather than a scan.
            </p>
            <p>
              Every answer carries its commonness band as a five-segment meter, because a word that
              technically exists and a word you can actually use are different things, and the
              meter is the fastest way to tell them apart.
            </p>
          </Prose>
        </ToolSection>

        <ToolSection title="Questions about these tools">
          <dl className="afl-divide mt-2">
            {FAQS.map((faq) => (
              <div key={faq.question} className="py-4">
                <dt className="text-[0.9375rem] font-semibold text-foreground">{faq.question}</dt>
                <dd className="mt-1.5 max-w-[68ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </ToolSection>

        <ToolSection title="Elsewhere in the dictionary">
          <ul className="mt-5 flex flex-wrap gap-2" style={{ listStyle: "none" }}>
            {[
              { href: "/lexicon", label: "Look up a word" },
              { href: "/lexicon/browse", label: "Browse A–Z" },
              { href: "/lexicon/words", label: "Word lists" },
              { href: "/lexicon/collections", label: "Collections" },
              { href: "/lexicon/sources", label: "Sources and licences" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-[2.75rem] items-center rounded-lg border border-border bg-surface px-4 text-sm text-muted-foreground no-underline motion-safe:transition hover:border-border-strong hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </ToolSection>

        <SourcesNote>
          Definitions and word relations come from Princeton University&rsquo;s WordNet;
          pronunciation, stress and rhyme keys come from the CMU Pronouncing Dictionary;
          commonness bands come from a frequency corpus of everyday English. Scrabble tile values
          are the standard English distribution and are not licensed from Hasbro or Mattel.
        </SourcesNote>

        <div className="h-16" />
      </div>
    </>
  );
}
