import Link from "next/link";
import { ArrowRight } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { POS_BY_KEY, normalizePos, slugifyWord } from "@altftool/core/lexicon";
import { getCollectionIndex, getManifest, getWord } from "@altftool/core/lexicon/corpus";
import SearchBox from "../_components/SearchBox";
import { AnswerFirst, Breadcrumb, SectionHeading, StatStrip } from "../_components/WordAtoms";

export const revalidate = 86400;

const HUB_PATH = "/lexicon/thesaurus";

/* The word the demo is built from. Chosen because it is the argument: 48
   senses across four parts of speech, and no synonym that works for more than
   a handful of them. */
const DEMO_SLUG = "light";
const DEMO_SENSES = 5;

/* The collections that are actually useful for synonym work, as opposed to the
   ones that are merely interesting. Counts are read from the index at request
   time so a number on this page can never drift from the list behind it. */
const USEFUL_COLLECTIONS = [
  {
    slug: "words-with-opposites",
    why: "Every entry here has a direct antonym recorded by a lexicographer, not inferred. Antonymy in WordNet is a relation between word forms rather than between concepts, which is why it is rarer and more reliable than synonymy.",
  },
  {
    slug: "verbs-worth-knowing",
    why: "The substitution that improves a sentence most is almost always a verb. Each of these carries a usage example, so you can check the register before you swap it in.",
  },
  {
    slug: "adjectives-worth-knowing",
    why: "Adjectives are where a thesaurus does the most damage, because near-synonyms differ by connotation rather than by meaning. Every entry here has a recorded example showing how it is actually used.",
  },
];

/* Words with enough polysemy that the sense grouping visibly matters. Each has
   a page under /lexicon/thesaurus/<slug>. */
const POPULAR = [
  "take",
  "make",
  "run",
  "get",
  "light",
  "good",
  "bad",
  "big",
  "small",
  "happy",
  "sad",
  "hard",
  "easy",
  "clear",
  "start",
  "stop",
  "give",
  "work",
  "close",
  "open",
  "strong",
  "weak",
  "fast",
  "slow",
  "old",
  "new",
  "quiet",
  "loud",
  "clean",
  "dirty",
  "true",
  "false",
];

const description =
  "A thesaurus built on WordNet synsets, so synonyms are grouped by sense rather than flattened into one list. A word with eight meanings does not have one set of substitutes — it has eight.";

/* ------------------------------------------------------------------ *
 * Demo
 * ------------------------------------------------------------------ */

/**
 * Pick the senses that make the point.
 *
 * Deterministic rather than hand-picked: take the senses carrying two or more
 * synonyms, keep the first one for each part of speech so the spread is
 * visible, then fill up to DEMO_SENSES in WordNet's own sense order. Editing
 * the corpus changes the demo; nothing here is transcribed by hand.
 */
function pickDemoSenses(entry) {
  const candidates = entry.sn
    .map((sense, index) => ({ sense, index }))
    .filter((row) => (row.sense.sy?.length || 0) >= 2);

  const chosen = [];
  const seenPos = new Set();
  for (const row of candidates) {
    const pos = normalizePos(row.sense.p);
    if (seenPos.has(pos)) continue;
    seenPos.add(pos);
    chosen.push(row);
  }
  for (const row of candidates) {
    if (chosen.length >= DEMO_SENSES) break;
    if (!chosen.includes(row)) chosen.push(row);
  }

  return chosen.sort((a, b) => a.index - b.index).slice(0, DEMO_SENSES);
}

/* ------------------------------------------------------------------ *
 * Metadata
 * ------------------------------------------------------------------ */

export async function generateMetadata() {
  const manifest = await getManifest();

  return createPageMetadata({
    title: `Thesaurus — synonyms grouped by sense, not flattened`,
    description,
    path: HUB_PATH,
    keywords: [
      "thesaurus",
      "synonyms",
      "antonyms",
      "another word for",
      "opposite of",
      "synonyms by meaning",
      `${manifest.senses.toLocaleString("en-US")} senses`,
    ],
  });
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

export default async function ThesaurusHubPage() {
  const [manifest, index, demo] = await Promise.all([
    getManifest(),
    getCollectionIndex(),
    getWord(DEMO_SLUG),
  ]);

  const collections = USEFUL_COLLECTIONS.map((item) => ({
    ...item,
    meta: index.find((candidate) => candidate.slug === item.slug),
  })).filter((item) => item.meta);

  const demoSenses = demo ? pickDemoSenses(demo) : [];
  const demoSynonyms = demo
    ? new Set(demo.sn.flatMap((sense) => sense.sy || []))
    : new Set();
  const demoAntonyms = demo ? new Set(demo.sn.flatMap((sense) => sense.an || [])) : new Set();
  const demoSensesWithSynonyms = demo
    ? demo.sn.filter((sense) => (sense.sy?.length || 0) + (sense.an?.length || 0) > 0).length
    : 0;

  const oppositesCount = collections.find((item) => item.slug === "words-with-opposites")?.meta
    ?.count;

  const faqs = [
    {
      question: "Where do these synonyms come from?",
      answer:
        "From Princeton University's WordNet. WordNet is not a list of words with a list of substitutes next to each — it is a network of synsets, where a synset is a set of word forms that are interchangeable in one particular context. A synonym in AltF Lexicon is a word that shares a synset with the word you looked up, which means it always belongs to a specific sense and never to the word as a whole.",
    },
    {
      question: "Why are the synonyms split up by meaning?",
      answer: demo
        ? `Because a word with several meanings does not have one set of substitutes. “${demo.w}” carries ${demo.ns} recorded senses and ${demoSynonyms.size} distinct synonyms across them, but no single one of those works for more than a few senses — “visible radiation” and “ignite” are both synonyms of “${demo.w}”, and swapping either into the other's sentence produces nonsense. A flat list hides that; grouping by sense is the only honest way to present it.`
        : "Because a word with several meanings does not have one set of substitutes. A flat list forces the reader to work out which of the offered words belongs to the meaning they actually had in mind, which is the job the thesaurus was supposed to do.",
    },
    {
      question: "What is the difference between a synonym and an antonym here?",
      answer: `A synonym is a shared synset — a semantic relation between concepts. An antonym in WordNet is a relation between specific word forms, deliberately narrower, which is why antonyms are far rarer: ${
        oppositesCount ? oppositesCount.toLocaleString("en-US") : "several thousand"
      } entries in the corpus carry one at all, against ${manifest.total.toLocaleString("en-US")} entries in total. Where a page shows no antonym, it is because WordNet records none, not because we ran out of room.`,
    },
    {
      question: "Are there synonyms for every word?",
      answer: `No, and the pages say so rather than padding. Many entries are the only member of their synset — a great deal of technical and taxonomic vocabulary has no substitute in English at all. Those pages show the senses and the broader and narrower terms, which are the useful relations when no synonym exists, and are kept out of the search index.`,
    },
    {
      question: "How do I find the opposite of a word?",
      answer:
        "Look the word up and read the antonym row under the sense you mean. Opposites are sense-specific in exactly the way synonyms are: the opposite of a light load is a heavy one, the opposite of a light room is a dark one, and nothing about the word alone tells you which is wanted.",
    },
  ];

  return (
    <>
      <JsonLd
        id="altf-lexicon-thesaurus-hub"
        data={[
          createCollectionPageJsonLd({
            path: HUB_PATH,
            name: "AltF Lexicon thesaurus",
            description,
          }),
          createItemListJsonLd({
            path: HUB_PATH,
            name: "Thesaurus entries",
            items: POPULAR.map((slug) => ({
              name: `Synonyms for ${slug}`,
              path: `${HUB_PATH}/${slug}`,
            })),
          }),
          createFaqJsonLd({ path: HUB_PATH, questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Thesaurus", path: HUB_PATH },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Breadcrumb items={[{ name: "Lexicon", path: "/lexicon" }, { name: "Thesaurus" }]} />

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Synonyms and antonyms
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            Thesaurus
          </h1>

          <AnswerFirst>
            {`Synonyms in AltF Lexicon come from Princeton University's WordNet, where a synonym is a word that shares a synset — a single recorded sense — with the word you looked up. That is why every list on this site is grouped by sense rather than flattened into one column: across ${manifest.total.toLocaleString(
              "en-US",
            )} entries and ${manifest.senses.toLocaleString(
              "en-US",
            )} senses, a word with eight meanings has eight sets of substitutes, not one.`}
          </AnswerFirst>

          <div className="mt-6 max-w-2xl">
            <SearchBox size="lg" placeholder="Find synonyms for any word…" />
          </div>

          <StatStrip
            stats={[
              { value: manifest.total.toLocaleString("en-US"), label: "Entries" },
              { value: manifest.senses.toLocaleString("en-US"), label: "Senses, each with its own synonyms" },
              ...(oppositesCount
                ? [
                    {
                      value: oppositesCount.toLocaleString("en-US"),
                      label: "Entries with a recorded antonym",
                    },
                  ]
                : []),
            ]}
          />
        </header>

        {/* ---------------- The demo ---------------- */}
        {demo && demoSenses.length > 0 ? (
          <section className="py-10">
            <SectionHeading
              eyebrow="What sense-grouping looks like"
              title={`“${demo.w}” has ${demoSynonyms.size} synonyms and not one of them fits every meaning`}
              description={`${demo.w} carries ${demo.ns} senses across ${demo.p.length} parts of speech. ${demoSensesWithSynonyms} of those senses have a synonym or an antonym recorded. Below are ${demoSenses.length} of them, straight from the corpus — read across a row and the substitution works; read down the column and it does not.`}
              action={
                <Link
                  href={`${HUB_PATH}/${demo.s}`}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-primary no-underline hover:underline"
                >
                  All {demo.ns} senses of {demo.w}{" "}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              }
            />

            <ul className="afl-divide mt-2" style={{ listStyle: "none" }}>
              {demoSenses.map(({ sense, index }) => {
                const meta = POS_BY_KEY[normalizePos(sense.p)];
                return (
                  <li key={index} className="grid gap-x-6 gap-y-3 py-5 lg:grid-cols-[22rem_1fr]">
                    <div className="min-w-0">
                      <span
                        className="font-mono text-[0.6875rem] uppercase tracking-[0.06em]"
                        style={{ color: `var(${meta.cssVar})` }}
                      >
                        {meta.label} · sense {index + 1} of {demo.ns}
                      </span>
                      <p className="afl-sense__gloss mt-1.5">{sense.g}</p>
                    </div>

                    <div className="min-w-0 space-y-2.5">
                      <DemoRow label="Synonyms" words={sense.sy} tone="var(--afl-verb)" />
                      <DemoRow label="Antonyms" words={sense.an} tone="var(--afl-adverb)" />
                    </div>
                  </li>
                );
              })}
            </ul>

            <p className="mt-5 max-w-[80ch] rounded-lg border border-border bg-surface-soft p-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
              {`This is the thing a flat thesaurus gets wrong. Ask most reference sites for synonyms of “${demo.w}” and you get one alphabetised heap of ${demoSynonyms.size} words with no indication that “${
                [...demoSynonyms][0]
              }” and “${[...demoSynonyms][demoSynonyms.size - 1]}” belong to meanings that have nothing to do with each other. Picking one at random is how a sentence ends up wrong in a way a spell-checker will never catch.`}{" "}
              {demoAntonyms.size > 0
                ? `The antonyms behave the same way: ${demo.w} has only ${demoAntonyms.size} distinct ${
                    demoAntonyms.size === 1 ? "opposite" : "opposites"
                  } (${[...demoAntonyms].join(", ")}), and which one is right depends entirely on the sense.`
                : ""}
            </p>
          </section>
        ) : null}

        {/* ---------------- Collections for synonym work ---------------- */}
        {collections.length > 0 ? (
          <section className="border-t border-border py-10">
            <SectionHeading
              eyebrow={`${collections.length} lists`}
              title="Collections built for synonym work"
              description="Three of the 199 collections earn their place in a thesaurus. Each is computed from data the entries already carry, so the counts are exact rather than editorial."
            />

            <ul className="mt-6 grid gap-3 lg:grid-cols-3" style={{ listStyle: "none" }}>
              {collections.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/lexicon/collections/${item.slug}`}
                    className="afl-card group flex h-full flex-col rounded-lg border border-border bg-surface p-5 no-underline"
                  >
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="text-[1.0625rem] font-semibold text-foreground group-hover:text-primary">
                        {item.meta.name}
                      </span>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {item.meta.count.toLocaleString("en-US")}
                      </span>
                    </span>
                    <span className="mt-2 text-[0.875rem] leading-relaxed text-muted-foreground">
                      {item.meta.description}
                    </span>
                    <span className="mt-auto pt-4 text-[0.8125rem] leading-relaxed text-muted-foreground">
                      {item.why}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ---------------- Popular entries ---------------- */}
        <section className="border-t border-border py-10">
          <SectionHeading
            eyebrow={`${POPULAR.length} entries`}
            title="Words where the sense grouping matters most"
            description="The words that carry the most meanings are the ones a flat thesaurus mangles worst. Each of these opens on a page where every sense keeps its own synonyms, antonyms and related terms."
          />
          <ul
            className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-1.5"
            style={{ listStyle: "none" }}
          >
            {POPULAR.map((slug) => (
              <li key={slug}>
                <Link
                  href={`${HUB_PATH}/${slug}`}
                  className="flex items-center justify-between gap-2 rounded-sm border border-border bg-surface-soft px-2.5 py-1.5 text-[0.875rem] text-foreground no-underline transition hover:border-border-strong hover:bg-surface hover:text-primary"
                >
                  <span className="truncate">{slug}</span>
                  <ArrowRight className="h-3 w-3 shrink-0 opacity-40" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- How to read a thesaurus entry ---------------- */}
        <section className="border-t border-border py-10">
          <SectionHeading
            eyebrow="How to read an entry"
            title="Four relations, four different jobs"
            description="WordNet records more than synonymy, and the other relations are often the ones you actually needed. Every thesaurus page here shows all four, per sense."
          />
          <dl className="afl-divide mt-2 max-w-[80ch]">
            {[
              [
                "Synonyms",
                "Word forms sharing the same synset. Interchangeable in that sense, though not necessarily in register — “ignite” and “light” mean the same thing and do not belong in the same sentence.",
              ],
              [
                "Antonyms",
                "A relation between word forms rather than concepts, so it is recorded sparingly and is correspondingly trustworthy. Most senses have none.",
              ],
              [
                "Broader",
                "The category the sense belongs to (WordNet calls it a hypernym). What you want when the word you have is too specific: a “sedan” is a “car” is a “vehicle”.",
              ],
              [
                "Narrower",
                "The kinds of the thing (hyponyms). What you want when the word you have is too vague and you are reaching for the precise one.",
              ],
            ].map(([term, blurb]) => (
              <div key={term} className="py-4">
                <dt className="text-[0.9375rem] font-semibold text-foreground">{term}</dt>
                <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {blurb}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section className="border-t border-border py-10">
          <h2 className="text-[1.375rem] font-semibold tracking-tight text-foreground">
            Questions about this thesaurus
          </h2>
          <dl className="afl-divide mt-2 max-w-[80ch]">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-4">
                <dt className="text-[0.9375rem] font-semibold text-foreground">{faq.question}</dt>
                <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 max-w-[80ch] rounded-lg border border-border bg-surface-soft p-4 text-xs leading-relaxed text-muted-foreground">
            Synonyms, antonyms and the broader and narrower relations come from Princeton
            University&rsquo;s WordNet. Nothing on these pages is generated by a language model.{" "}
            <Link href="/lexicon/sources" className="text-primary hover:underline">
              Full sources and licences
            </Link>
            .
          </p>

          <Link
            href="/lexicon"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-primary no-underline hover:underline"
          >
            Back to the dictionary <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Local pieces
 * ------------------------------------------------------------------ */

function DemoRow({ label, words = [], tone }) {
  if (!words || words.length === 0) return null;
  return (
    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5">
      <span
        className="shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.06em]"
        style={{ color: tone }}
      >
        {label}
      </span>
      <span className="flex flex-wrap gap-1.5">
        {words.map((word) => (
          <Link
            key={word}
            href={`${HUB_PATH}/${slugifyWord(word)}`}
            className="rounded-sm border border-border bg-surface-soft px-2 py-0.5 font-mono text-xs text-muted-foreground no-underline transition hover:border-border-strong hover:text-foreground"
          >
            {word}
          </Link>
        ))}
      </span>
    </div>
  );
}
