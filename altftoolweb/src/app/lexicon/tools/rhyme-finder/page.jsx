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
import RhymeFinder from "./RhymeFinder";

export const revalidate = 86400;

const SLUG = "rhyme-finder";
const PATH = `/lexicon/tools/${SLUG}`;
const TOOL = TOOLS_BY_SLUG[SLUG];

const STEPS = [
  "Type one word into the box. Inflected and irregular forms resolve to their base, so 'ran' is answered as 'run'.",
  "Check the panel that appears: it shows the word's syllable division, its IPA transcription and the rhyme key the match was made from.",
  "Read the rhymes, grouped by syllable count. Within each group the commonest words come first.",
  "Open any rhyme for its full entry, or follow the link at the foot of the list to that word's complete rhyme page.",
];

const FAQS = [
  {
    question: "How does the rhyme finder decide two words rhyme?",
    answer:
      "It compares pronunciations, not spellings. Every entry with a transcription in the CMU Pronouncing Dictionary carries a rhyme key: the sequence of phonemes from its last stressed vowel to the end of the word. Two words rhyme when their keys are identical. That is the definition a reader already has in their head — it puts THROUGH with BLUE and keeps ROUGH away from THOUGH.",
  },
  {
    question: "Why does orange have no rhymes?",
    answer:
      "Because its rhyme key occurs in exactly one English word. The famous unrhymable words — orange, silver, month, purple — are not unrhymable by some special rule; the sound after their last stressed vowel simply does not recur. This tool reports that honestly rather than offering near rhymes it would have had to invent.",
  },
  {
    question: "Does it find near rhymes, slant rhymes or half rhymes?",
    answer:
      "No. It returns perfect rhymes only, because that is the set that can be computed exactly from a pronunciation. A near rhyme is a judgement about how much difference an ear will tolerate in a particular line, and any tool that offers them is applying a threshold it has chosen for you.",
  },
  {
    question: "Why are rhymes grouped by syllable count?",
    answer:
      "Because a rhyme has to fit a line, and the number of syllables is the first thing that decides whether it can. A songwriter closing a four-beat line and a poet closing a pentameter need different groups from the same list.",
  },
  {
    question: "What if my word is not in the dictionary?",
    answer:
      "You get an empty result and a link back to search. Rhyming needs a stored pronunciation, and inventing one from the spelling is exactly the mistake that produces rough/though. Names, brands and very new coinages are the usual misses.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "Rhyme finder — perfect rhymes matched on sound",
    description:
      "Find every word that rhymes with yours, matched on pronunciation from the CMU Pronouncing Dictionary rather than on spelling. Grouped by syllable count, commonest first.",
    path: PATH,
    keywords: TOOL.keywords,
  });
}

export default async function RhymeFinderPage() {
  const manifest = await getManifest();

  const answer = `A rhyme finder returns the words that end in the same sound as yours. This one matches on pronunciation, not spelling: every entry with a transcription in the CMU Pronouncing Dictionary carries the phonemes from its last stressed vowel onward as a rhyme key, and two words rhyme when their keys match. There are ${manifest.rhymeGroups.toLocaleString("en-US")} such keys across ${manifest.withPronunciation.toLocaleString("en-US")} transcribed entries.`;

  return (
    <>
      <JsonLd
        id="altf-lexicon-tool-rhyme-finder"
        data={[
          createHowToJsonLd({
            path: PATH,
            name: "How to find words that rhyme",
            description:
              "Look up the perfect rhymes for any word, matched on its pronunciation rather than its spelling.",
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
            Rhyme finder
          </h1>

          <AnswerFirst>{answer}</AnswerFirst>

          <StatStrip
            stats={[
              { value: manifest.rhymeGroups.toLocaleString("en-US"), label: "Rhyme groups" },
              {
                value: manifest.withPronunciation.toLocaleString("en-US"),
                label: "Transcribed entries",
              },
              { value: "Perfect", label: "Rhyme type" },
              { value: "IPA", label: "Transcription shown" },
            ]}
          />
        </header>

        <RhymeFinder />

        <ToolSection title="How to use it">
          <HowToSteps steps={STEPS} />
        </ToolSection>

        <ToolSection title="Why spelling is the wrong thing to match on">
          <Prose>
            <p>
              English spelling and English pronunciation parted company several centuries ago, and
              rhyme lives entirely on the pronunciation side. THROUGH, BLUE, SHOE and TOO all end
              in the same sound and share no ending in writing. ROUGH and THOUGH share four letters
              at the end and do not rhyme at all. Any tool that matches on the last few letters
              gets both of those wrong.
            </p>
            <p>
              So the matching is done on phonemes. The CMU Pronouncing Dictionary gives a
              transcription for {manifest.withPronunciation.toLocaleString("en-US")} of the entries
              here; from each one the corpus takes the phonemes running from the last stressed
              vowel to the end of the word and stores them as a rhyme key. LIGHT and KITE both
              reduce to the key <span className="font-mono">AYT</span>. Words with the same key
              rhyme, and there are {manifest.rhymeGroups.toLocaleString("en-US")} distinct keys in
              the corpus.
            </p>
            <p>
              Starting at the last <em>stressed</em> vowel rather than the last vowel is what makes
              the result match an ear. A rhyme has to carry the beat: HAPPY and SNAPPY rhyme on two
              syllables, not on the final <em>-y</em> alone.
            </p>
          </Prose>
        </ToolSection>

        <ToolSection title="What you get back">
          <Prose>
            <p>
              Rhymes arrive grouped by syllable count, shortest group first, with the commonest
              words at the top of each group. The five-segment meter beside each answer is that
              word&rsquo;s commonness band, measured against a frequency corpus of everyday
              English — a rhyme your reader has to look up is not a rhyme you can use, and the
              meter is the fastest way to see which is which.
            </p>
            <p>
              Up to 300 rhymes come back in one request. Common endings run well past that, and
              when the list is capped the tool says so and reports the true total; the full set for
              any word lives on its own rhyme page. Every answer also links to its dictionary
              entry, where you can read its senses and see its stress marked.
            </p>
            <p>
              <Link href="/lexicon" className="text-primary hover:underline">
                Look up a word
              </Link>{" "}
              to see its syllable line, IPA transcription and respelling in full.
            </p>
          </Prose>
        </ToolSection>

        <FaqBlock faqs={FAQS} title="Questions about rhyming" />

        <RelatedTools slug={SLUG} />

        <SourcesNote>
          Pronunciations, stress marks and rhyme keys come from the CMU Pronouncing Dictionary,
          which is distributed under a BSD 2-clause licence. Definitions and word relations come
          from Princeton University&rsquo;s WordNet. Commonness bands come from a frequency corpus
          of everyday English.
        </SourcesNote>

        <div className="h-16" />
      </div>
    </>
  );
}
