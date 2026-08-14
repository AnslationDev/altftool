import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createHowToJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { getManifest } from "@altftool/core/lexicon/corpus";

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
import SyllableCounter from "./SyllableCounter";

export const revalidate = 86400;

const SLUG = "syllable-counter";
const PATH = `/lexicon/tools/${SLUG}`;
const TOOL = TOOLS_BY_SLUG[SLUG];

const STEPS = [
  "Paste or type your text into the box. A single word works; so does a whole draft.",
  "Read the totals: syllables, words, sentences, syllables per word and words per sentence, all recomputed as you type.",
  "Check the word-by-word list underneath to see which words carry the weight — the number beside each word is its syllable count.",
  "Read the Flesch Reading Ease score to see how the passage lands. Higher is easier; the two things that move it are sentence length and word length.",
];

const FAQS = [
  {
    question: "How is a syllable counted?",
    answer:
      "By finding vowel groups in the spelling and then correcting them. Adjacent vowels normally form one group, so 'boat' is one syllable, but recognised hiatus pairs are split, so 'curious' is three. A silent terminal e is dropped ('make' is one), except after a consonant + le ('candle' is two). A final -ed is silent unless it follows t or d, so 'walked' is one and 'wanted' is two. A final -es is silent unless it follows a sibilant, so 'makes' is one and 'wishes' is two.",
  },
  {
    question: "Is it always right?",
    answer:
      "No, and no spelling-based counter can be. English spelling under-determines pronunciation: 'wind' as a noun and 'wind' as a verb are spelled identically and 'poem' is read as one syllable by some speakers and two by others. Regional accents differ on words like 'family' and 'every'. For a single word, the entry page in this dictionary shows the division derived from the CMU Pronouncing Dictionary, which is transcribed from real speech and is the better answer.",
  },
  {
    question: "What is the Flesch Reading Ease score?",
    answer:
      "A readability formula published by Rudolf Flesch in 1948, still used by style guides and by several governments. It combines average sentence length and average syllables per word into a number that usually falls between 0 and 100, where higher means easier. It is a rough instrument: it measures the shape of your sentences, not whether they make sense.",
  },
  {
    question: "How are sentences counted?",
    answer:
      "A sentence ends at a full stop, exclamation mark, question mark or ellipsis followed by whitespace or the end of the text. That means an abbreviation like 'e.g.' inside a sentence will be read as a sentence break and will pull the score up. Text with no terminator at all counts as one sentence, because a heading is still a unit of reading.",
  },
  {
    question: "Does my text get uploaded?",
    answer:
      "No. The counting function is pure and ships in the page, so everything happens in your browser. There is no request to a server, which means the tool also works with the network off once the page has loaded.",
  },
  {
    question: "Can I use this for haiku or song lyrics?",
    answer:
      "Yes, and it is the most common reason people count syllables. Read the word-by-word list rather than only the total — a haiku that is one syllable out is usually one word out, and the list shows you which word.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "Syllable counter — count syllables in any text",
    description:
      "Count syllables word by word in anything you paste, with totals, words per sentence, syllables per word and a Flesch Reading Ease score. Runs entirely in your browser.",
    path: PATH,
    keywords: TOOL.keywords,
  });
}

export default async function SyllableCounterPage() {
  const manifest = await getManifest();

  const answer = `A syllable counter breaks text into words and counts the spoken beats in each one. This one counts syllables word by word, totals them, and turns the totals into a Flesch Reading Ease score: 206.835 minus 1.015 times the average sentence length minus 84.6 times the average syllables per word. It runs in your browser, so nothing you paste is sent anywhere.`;

  return (
    <>
      <JsonLd
        id="altf-lexicon-tool-syllable-counter"
        data={[
          createHowToJsonLd({
            path: PATH,
            name: "How to count syllables in a text",
            description:
              "Count the syllables in every word of a passage, and read the resulting Flesch Reading Ease score.",
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
            Syllable counter
          </h1>

          <AnswerFirst>{answer}</AnswerFirst>

          <StatStrip
            stats={[
              { value: "0", label: "Requests sent" },
              {
                value: manifest.withSyllables.toLocaleString("en-US"),
                label: "Entries with a stored division",
              },
              {
                value: manifest.withPronunciation.toLocaleString("en-US"),
                label: "Entries with a transcription",
              },
              { value: "1948", label: "Flesch's formula" },
            ]}
          />
        </header>

        <SyllableCounter />

        <ToolSection title="How to use it">
          <HowToSteps steps={STEPS} />
        </ToolSection>

        <ToolSection title="The Flesch Reading Ease formula">
          <Prose>
            <p>
              The score printed above the word list is computed exactly as Rudolf Flesch defined it
              in 1948:
            </p>
          </Prose>

          <figure className="mt-4 max-w-[68ch] overflow-x-auto rounded-lg border border-border bg-surface p-5">
            <pre className="font-mono text-[0.8125rem] leading-relaxed text-foreground">
{`Reading Ease = 206.835
             − 1.015 × (total words ÷ total sentences)
             − 84.6  × (total syllables ÷ total words)`}
            </pre>
            <figcaption className="mt-3 text-xs leading-relaxed text-muted-foreground">
              The two ratios are the average sentence length and the average syllables per word.
              Nothing else enters it — not vocabulary, not grammar, not whether the sentence is
              true.
            </figcaption>
          </figure>

          <Prose>
            <p>
              A score of 100 is roughly a sentence of eight one-syllable words. A score of 30 is
              academic prose. The scale is open at both ends, so a long sentence of long words can
              score below zero, and this tool prints that number rather than clamping it — a
              negative score is information, and rounding it to zero would hide it.
            </p>
            <p>
              The reading level a score maps to is Flesch&rsquo;s own labelling and is a US
              school-grade heuristic from the 1940s. Treat it as a way to compare two drafts of the
              same passage, which it is good at, rather than as a measurement of a reader, which it
              is not.
            </p>
          </Prose>
        </ToolSection>

        <ToolSection title="How the syllables are counted">
          <Prose>
            <p>
              The counter finds the vowel groups in a word&rsquo;s spelling and then applies the
              corrections English spelling requires: adjacent vowels normally form one nucleus
              (BOAT is one syllable) but recognised hiatus pairs are split (CU-RI-OUS is three); a
              silent terminal <em>e</em> is discarded (MAKE is one) unless a consonant + <em>le</em>{" "}
              ending needs it (CAN-DLE is two); a final <em>-ed</em> is silent except after{" "}
              <em>t</em> or <em>d</em> (WALKED is one, WAN-TED is two); a final <em>-es</em> is
              silent except after a sibilant (MAKES is one, WISH-ES is two).
            </p>
            <p>
              This is the same function that generated the stored syllable division for entries in
              the dictionary that the CMU Pronouncing Dictionary does not cover. For the{" "}
              {manifest.withPronunciation.toLocaleString("en-US")} entries it does cover, the
              dictionary uses the transcription instead, because a count derived from real speech
              beats one derived from spelling every time. If you are checking a single word, open
              its entry — the syllable line there is the better answer, and it shows you where the
              stress falls as well.
            </p>
            <p>
              <Link href="/lexicon" className="text-primary hover:underline">
                Look up a single word
              </Link>{" "}
              to see its stored division, its IPA transcription and its respelling.
            </p>
          </Prose>
        </ToolSection>

        <FaqBlock faqs={FAQS} title="Questions about counting syllables" />

        <RelatedTools slug={SLUG} />

        <SourcesNote>
          The counting rules ship with this page and run locally. The stored syllable divisions and
          transcriptions quoted above come from the CMU Pronouncing Dictionary; definitions on
          entry pages come from Princeton University&rsquo;s WordNet. The Flesch Reading Ease
          formula is Rudolf Flesch&rsquo;s, published in 1948 and in the public domain.
        </SourcesNote>

        <div className="h-16" />
      </div>
    </>
  );
}
