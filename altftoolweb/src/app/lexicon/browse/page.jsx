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
import { COMMONNESS, LETTERS, POS } from "@altftool/core/lexicon";
import { getFacets, getLetterIndex, getManifest } from "@altftool/core/lexicon/corpus";
import {
  AnswerFirst,
  Breadcrumb,
  LetterTiles,
  SectionHeading,
} from "../_components/WordAtoms";
import SearchBox from "../_components/SearchBox";

export const revalidate = 86400;

const PREVIEW_PER_LETTER = 6;

/*
 * The preview words under each letter are the ones a reader is most likely to
 * recognise: highest commonness band first, then most senses, then shortest.
 * Single words only — a phrase preview would fill the row with species names,
 * which are 64,225 of the 147,478 entries and none of what you came for.
 */
function previewFor(rows) {
  return [...rows]
    .filter((row) => row.ix && !row.ph)
    .sort((a, b) => b.c - a.c || b.n - a.n || a.w.length - b.w.length)
    .slice(0, PREVIEW_PER_LETTER);
}

const description =
  "Browse all 147,478 AltF Lexicon entries A to Z, or by word length, part of speech, syllable count and how common the word is. Every route shows its counts before you click.";

const FAQS = [
  {
    question: "How many words are in AltF Lexicon?",
    answer:
      "147,478 entries in total: 83,253 single words and 64,225 multi-word entries such as idioms, phrasal verbs, compound nouns and species names. Between them they carry 207,235 distinct senses.",
  },
  {
    question: "What is the biggest letter in English?",
    answer:
      "S, with 15,854 entries in this corpus, followed by C with 14,199 and P with 11,443. The smallest is X with 196. The counts are of dictionary entries rather than of running text, so they measure how much vocabulary each letter carries, not how often it is typed.",
  },
  {
    question: "Why are some entries not in the search index?",
    answer:
      "135,783 of the 147,478 entries are marked indexable. The remainder are almost entirely taxonomic — genus and species names such as Genus Acer — which are browsable here and have full pages, but are kept out of search engine indexes because a page reading \"a genus of trees\" 11,000 times over is not useful to anyone.",
  },
  {
    question: "Can I browse by how a word sounds rather than how it is spelled?",
    answer:
      "Yes. Syllable count is a browse dimension on every letter page, and the sound collections group words by number of syllables, by where the stress falls, and by how far the spelling has drifted from the pronunciation.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "Browse the dictionary A–Z — all 147,478 words",
    description,
    path: "/lexicon/browse",
    keywords: [
      "browse dictionary",
      "words by letter",
      "A to Z word list",
      "English word index",
      "words by length",
      "words by syllable count",
    ],
  });
}

export default async function BrowseHubPage() {
  const [manifest, facets] = await Promise.all([getManifest(), getFacets()]);

  const allLetters = [...LETTERS, "0"];
  const indexes = await Promise.all(allLetters.map((letter) => getLetterIndex(letter)));
  const previews = allLetters.map((letter, index) => ({
    letter,
    count: manifest.letters[letter] || 0,
    rows: previewFor(indexes[index] || []),
  }));

  const lengths = manifest.lengths.map((length) => ({
    length,
    count: manifest.listTotals.length[String(length)] || 0,
  }));

  const commonness = COMMONNESS.map((band) => ({
    ...band,
    count: facets.commonness[String(band.band)] || 0,
  }));

  const syllables = Object.entries(facets.syllables)
    .map(([count, total]) => ({ count: Number(count), total }))
    .filter((row) => row.count >= 1 && row.count <= 8)
    .sort((a, b) => a.count - b.count);

  const notIndexable = manifest.total - manifest.indexable;

  return (
    <>
      <JsonLd
        id="altf-lexicon-browse"
        data={[
          createCollectionPageJsonLd({
            path: "/lexicon/browse",
            name: "Browse AltF Lexicon A–Z",
            description,
          }),
          createItemListJsonLd({
            path: "/lexicon/browse",
            name: "Dictionary entries by first letter",
            items: allLetters.map((letter) => ({
              name:
                letter === "0"
                  ? "Words beginning with a digit or symbol"
                  : `Words starting with ${letter.toUpperCase()}`,
              path: `/lexicon/browse/${letter}`,
            })),
          }),
          createFaqJsonLd({ path: "/lexicon/browse", questions: FAQS }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Browse", path: "/lexicon/browse" },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Breadcrumb items={[{ name: "Lexicon", path: "/lexicon" }, { name: "Browse" }]} />

        <header className="pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            The index
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold tracking-[-0.025em] text-foreground">
            Browse {manifest.total.toLocaleString("en-US")} entries
          </h1>

          <AnswerFirst>
            AltF Lexicon holds {manifest.total.toLocaleString("en-US")} entries —{" "}
            {manifest.words.toLocaleString("en-US")} single words and{" "}
            {manifest.phrases.toLocaleString("en-US")} multi-word entries — carrying{" "}
            {manifest.senses.toLocaleString("en-US")} senses between them. You can reach any of them
            by first letter, by length, by part of speech, by syllable count or by how common the
            word is. Every route below shows its counts before you click it.
          </AnswerFirst>

          <div className="mt-6 max-w-2xl">
            <SearchBox size="lg" />
          </div>
        </header>

        {/* ---------------- A–Z ---------------- */}
        <section className="border-t border-border py-10">
          <SectionHeading
            eyebrow="By first letter"
            title="A to Z, with the count on every tile"
            description={`The number in each tile is how many entries are filed under that letter. S carries ${manifest.letters.s.toLocaleString(
              "en-US",
            )}; X carries ${manifest.letters.x.toLocaleString(
              "en-US",
            )}. # holds the ${manifest.letters["0"].toLocaleString(
              "en-US",
            )} entries beginning with a digit or a symbol.`}
          />

          <div className="mt-7">
            <LetterTiles counts={manifest.letters} />
          </div>
        </section>

        {/* ---------------- Per-letter previews ---------------- */}
        <section className="border-t border-border py-10">
          <SectionHeading
            eyebrow="What is under each letter"
            title="The words you are most likely to know, letter by letter"
            description={`Up to ${PREVIEW_PER_LETTER} single words per letter, ranked by commonness band and then by how many senses each carries. Phrases are held back here so the row is not filled with species names.`}
          />

          <ul
            className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            style={{ listStyle: "none" }}
          >
            {previews.map((preview) => (
              <li
                key={preview.letter}
                className="rounded-lg border border-border bg-surface p-4"
              >
                <div className="flex items-baseline justify-between gap-3 border-b border-border pb-2.5">
                  <Link
                    href={`/lexicon/browse/${preview.letter}`}
                    className="afl-headword text-2xl uppercase text-foreground no-underline hover:text-primary"
                  >
                    {preview.letter === "0" ? "#" : preview.letter}
                  </Link>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {preview.count.toLocaleString("en-US")} entries
                  </span>
                </div>

                <ul className="mt-2.5 flex flex-wrap gap-1.5" style={{ listStyle: "none" }}>
                  {preview.rows.map((row) => (
                    <li key={row.s}>
                      <Link
                        href={`/lexicon/word/${row.s}`}
                        className="rounded-sm border border-border bg-surface-soft px-2 py-0.5 font-mono text-xs text-muted-foreground no-underline transition hover:border-border-strong hover:text-foreground"
                      >
                        {row.w}
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/lexicon/browse/${preview.letter}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-[0.8125rem] text-primary no-underline hover:underline"
                >
                  All {preview.letter === "0" ? "#" : preview.letter.toUpperCase()} entries
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- By length ---------------- */}
        <section className="border-t border-border py-10">
          <SectionHeading
            eyebrow="By shape"
            title="Words of a given length"
            description={`Letter counts from 2 to 15, single words only. Each list is capped at ${manifest.listCap.toLocaleString(
              "en-US",
            )} entries and ordered by commonness, so the words you are most likely to want are on the first screen.`}
            action={
              <Link
                href="/lexicon/words"
                className="inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-primary no-underline hover:underline"
              >
                All word lists
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            }
          />

          <ul
            className="mt-7 grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2"
            style={{ listStyle: "none" }}
          >
            {lengths.map((row) => (
              <li key={row.length}>
                <Link
                  href={`/lexicon/words/${row.length}-letter-words`}
                  className="afl-card flex flex-col gap-0.5 rounded-lg border border-border bg-surface px-3 py-2.5 no-underline"
                >
                  <span className="text-[0.9375rem] font-semibold text-foreground">
                    {row.length}-letter words
                  </span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {row.count.toLocaleString("en-US")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[0.8125rem] leading-relaxed text-muted-foreground">
            Narrower cuts — a length crossed with a first letter, words ending in a suffix, words
            containing a string — live on{" "}
            <Link href="/lexicon/words" className="text-primary hover:underline">
              the word lists hub
            </Link>
            . Or start from a letter:{" "}
            {LETTERS.slice(0, 6).map((letter, index) => (
              <span key={letter}>
                {index > 0 ? ", " : ""}
                <Link
                  href={`/lexicon/words/starting-with-${letter}`}
                  className="text-primary hover:underline"
                >
                  words starting with {letter.toUpperCase()}
                </Link>
              </span>
            ))}
            .
          </p>
        </section>

        {/* ---------------- By part of speech ---------------- */}
        <section className="border-t border-border py-10">
          <SectionHeading
            eyebrow="By word class"
            title="Nouns, verbs, adjectives and adverbs"
            description="WordNet records four open classes and nothing else, so these four cover the corpus with no leftover bucket. The counts are of senses rather than of headwords, because a word that is both a noun and a verb belongs to both."
          />

          <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" style={{ listStyle: "none" }}>
            {POS.map((pos) => (
              <li key={pos.key}>
                <Link
                  href={`/lexicon/browse/a?pos=${pos.key}`}
                  className="afl-card relative flex h-full flex-col gap-1.5 overflow-hidden rounded-lg border border-border bg-surface p-5 pl-6 no-underline"
                >
                  <span
                    className="absolute inset-y-0 left-0 w-[3px]"
                    style={{ background: `var(${pos.cssVar})` }}
                    aria-hidden="true"
                  />
                  <span
                    className="font-mono text-[0.6875rem] uppercase tracking-[0.06em]"
                    style={{ color: `var(${pos.cssVar})` }}
                  >
                    {pos.abbr}
                  </span>
                  <span className="text-[1.0625rem] font-semibold capitalize tracking-[-0.01em] text-foreground">
                    {pos.plural}
                  </span>
                  <span className="font-mono text-sm tabular-nums text-muted-foreground">
                    {(facets.pos[pos.key] || 0).toLocaleString("en-US")} senses
                  </span>
                  <span className="mt-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
                    {pos.blurb}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[0.8125rem] leading-relaxed text-muted-foreground">
            The links above open letter A filtered to that class; the filter carries across every
            letter. For the complete class as one list, see{" "}
            <Link href="/lexicon/collections/every-adjective" className="text-primary hover:underline">
              every adjective
            </Link>
            ,{" "}
            <Link href="/lexicon/collections/every-verb" className="text-primary hover:underline">
              every verb
            </Link>{" "}
            and{" "}
            <Link href="/lexicon/collections/adverbs" className="text-primary hover:underline">
              the adverbs
            </Link>
            .
          </p>
        </section>

        {/* ---------------- By syllable count ---------------- */}
        <section className="border-t border-border py-10">
          <SectionHeading
            eyebrow="By sound"
            title="Words of a given syllable count"
            description={`Counts from the CMU Pronouncing Dictionary where the word appears in it, and from the syllable rules otherwise. ${(
              facets.syllables["3"] || 0
            ).toLocaleString("en-US")} words come in at three syllables, more than any other length.`}
          />

          <ul
            className="mt-7 grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2"
            style={{ listStyle: "none" }}
          >
            {syllables.map((row) => (
              <li key={row.count}>
                <Link
                  href={`/lexicon/browse/a?syllables=${row.count}`}
                  className="afl-card flex flex-col gap-0.5 rounded-lg border border-border bg-surface px-3 py-2.5 no-underline"
                >
                  <span className="text-[0.9375rem] font-semibold text-foreground">
                    {row.count} {row.count === 1 ? "syllable" : "syllables"}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {row.total.toLocaleString("en-US")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[0.8125rem] leading-relaxed text-muted-foreground">
            Also by sound:{" "}
            <Link href="/lexicon/collections/one-syllable" className="text-primary hover:underline">
              one-syllable words
            </Link>
            ,{" "}
            <Link href="/lexicon/collections/stress-on-last" className="text-primary hover:underline">
              words stressed on the last syllable
            </Link>
            ,{" "}
            <Link href="/lexicon/collections/hard-to-say" className="text-primary hover:underline">
              words that are hard to pronounce
            </Link>
            .
          </p>
        </section>

        {/* ---------------- By commonness ---------------- */}
        <section className="border-t border-border py-10">
          <SectionHeading
            eyebrow="By how common"
            title="From core vocabulary to the rare tail"
            description="Five bands, measured against a corpus of everyday English rather than assigned by an editor. Most of the dictionary sits in band one — that is what a dictionary is: mostly words you will never need, kept for the day you do."
          />

          <ul className="mt-7 space-y-2" style={{ listStyle: "none" }}>
            {commonness.map((band) => {
              const share = manifest.total > 0 ? (band.count / manifest.total) * 100 : 0;
              return (
                <li key={band.band}>
                  <Link
                    href={`/lexicon/browse/a?commonness=${band.band}`}
                    className="afl-card flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border bg-surface p-4 no-underline"
                  >
                    <span className="w-24 shrink-0 text-[0.9375rem] font-semibold text-foreground">
                      {band.label}
                    </span>
                    <span
                      className="h-2 min-w-[3rem] flex-1 overflow-hidden rounded-full"
                      style={{ background: "var(--afl-track)" }}
                      aria-hidden="true"
                    >
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${Math.max(1.5, share)}%`,
                          background: `var(--afl-rank-${band.band})`,
                        }}
                      />
                    </span>
                    <span className="w-40 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                      {band.count.toLocaleString("en-US")} entries
                    </span>
                    <span className="w-full text-[0.8125rem] leading-relaxed text-muted-foreground sm:w-auto sm:flex-[1_1_18rem]">
                      {band.blurb}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ---------------- What is in the corpus ---------------- */}
        <section className="border-t border-border py-10">
          <SectionHeading
            eyebrow="Scope"
            title="What is in here, and what is not"
            description="Stated plainly, because a dictionary that will not say what it covers is asking you to guess."
          />

          <div className="mt-7 grid gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-5">
              <h3 className="text-[1.0625rem] font-semibold tracking-[-0.01em] text-foreground">
                In the corpus
              </h3>
              <ul
                className="mt-3 space-y-2.5 text-[0.875rem] leading-relaxed text-muted-foreground"
                style={{ listStyle: "none" }}
              >
                <li>
                  <strong className="font-semibold text-foreground">
                    {manifest.words.toLocaleString("en-US")} single words
                  </strong>{" "}
                  — every one with a syllable split, and{" "}
                  {manifest.withPronunciation.toLocaleString("en-US")} of them with a phonetic
                  transcription from the CMU Pronouncing Dictionary.
                </li>
                <li>
                  <strong className="font-semibold text-foreground">
                    {manifest.phrases.toLocaleString("en-US")} multi-word entries
                  </strong>{" "}
                  — idioms, phrasal verbs, compound nouns and species names. They are marked as
                  phrases everywhere they appear.
                </li>
                <li>
                  <strong className="font-semibold text-foreground">
                    {manifest.senses.toLocaleString("en-US")} senses
                  </strong>{" "}
                  in total, of which {manifest.withExamples.toLocaleString("en-US")} carry at least
                  one usage example written by a lexicographer.
                </li>
                <li>
                  <strong className="font-semibold text-foreground">
                    {manifest.inflections.toLocaleString("en-US")} irregular inflections
                  </strong>{" "}
                  mapped back to their base form, so searching for <em>mice</em> or <em>ran</em>{" "}
                  lands on the right entry.
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-surface p-5">
              <h3 className="text-[1.0625rem] font-semibold tracking-[-0.01em] text-foreground">
                Not in the corpus, or not indexed
              </h3>
              <ul
                className="mt-3 space-y-2.5 text-[0.875rem] leading-relaxed text-muted-foreground"
                style={{ listStyle: "none" }}
              >
                <li>
                  <strong className="font-semibold text-foreground">
                    {notIndexable.toLocaleString("en-US")} entries are browsable but not indexed
                  </strong>{" "}
                  — overwhelmingly taxonomic names such as <em>genus Acer</em>. They keep their
                  pages and appear in these lists; they are simply not offered to search engines,
                  because a few thousand near-identical pages help nobody.
                </li>
                <li>
                  <strong className="font-semibold text-foreground">
                    Etymology and dated citations
                  </strong>{" "}
                  are not here. WordNet does not record them, and inventing them would be worse than
                  leaving the field empty.
                </li>
                <li>
                  <strong className="font-semibold text-foreground">Audio recordings</strong> are
                  not here either. Pronunciation is given as a syllable split, an IPA transcription
                  and a respelling — three notations, no clips.
                </li>
                <li>
                  <strong className="font-semibold text-foreground">
                    Nothing is generated by a language model.
                  </strong>{" "}
                  Every definition, example and relation is from {manifest.source.lexical}.{" "}
                  <Link href="/lexicon/sources" className="text-primary hover:underline">
                    Sources and licences
                  </Link>
                  .
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section className="border-t border-border py-10 pb-16">
          <h2 className="text-[clamp(1.25rem,2.2vw,1.625rem)] font-semibold tracking-[-0.02em] text-foreground">
            Questions about browsing
          </h2>
          <div className="mt-4 max-w-3xl">
            {FAQS.map((faq, index) => (
              <details key={faq.question} className="border-b border-border" open={index === 0}>
                <summary className="cursor-pointer list-none py-4 text-base font-medium tracking-[-0.01em] text-foreground marker:hidden hover:text-primary">
                  {faq.question}
                </summary>
                <div className="max-w-[68ch] pb-5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
