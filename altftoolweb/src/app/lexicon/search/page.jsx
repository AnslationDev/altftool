import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import { createBreadcrumbJsonLd, createPageMetadata } from "@/platform/seo/generateMetadata";
import { letterOf, shortDefinition, slugifyWord } from "@altftool/core/lexicon";
import {
  getInflections,
  getLetterIndex,
  getManifest,
  resolveWord,
  searchWords,
  suggestSpellings,
} from "@altftool/core/lexicon/corpus";
import SearchBox from "../_components/SearchBox";
import {
  AnswerFirst,
  Breadcrumb,
  CommonnessMeter,
  PosChips,
  StatStrip,
  SyllableLine,
  WordCardGrid,
} from "../_components/WordAtoms";

export const revalidate = 86400;

const RESULT_LIMIT = 60;
const NEIGHBOURS_EACH_SIDE = 6;
const MAX_QUERY = 80;

/*
 * The results surface.
 *
 * Two different questions get answered here, in the order a reader asks them.
 * First: "does the word I typed exist?" — resolveWord() answers that, including
 * for forms that are not headwords (ran, mice, hoped), and the answer gets the
 * big card at the top. Second: "what else starts like this?" — searchWords()
 * answers that with a prefix scan over one letter index.
 *
 * The page is noindex. It is a query surface, not a document, and a dictionary
 * that lets search engines index its own search results ends up competing with
 * its own word pages for the same query.
 */

/** searchParams values arrive as string | string[] | undefined. */
function readQuery(params) {
  const raw = Array.isArray(params?.q) ? params.q[0] : params?.q;
  return typeof raw === "string" ? raw.trim().slice(0, MAX_QUERY) : "";
}

/* ------------------------------------------------------------------ *
 * Copy helpers
 * ------------------------------------------------------------------ */

/**
 * Name the relationship between what was typed and what was found.
 *
 * Precision here is the whole point: a reader who typed "ran" and lands on
 * "run" must be told why, or the dictionary looks like it silently ignored
 * them. Regular forms are resolved by suffix rule, so the rule itself is the
 * explanation and can be stated exactly. Irregular forms come from WordNet's
 * exception lists, which record that a form is irregular but not whether it is
 * a past tense or a past participle — so those are named as inflected forms of
 * the base rather than given a tense we cannot actually read from the data.
 */
function inflectionSentence(from, entry, kind, posKey) {
  const typed = from.replace(/-/g, " ");
  const base = entry.w;

  if (kind === "irregular") {
    const labels = {
      n: `“${typed}” is the irregular plural of “${base}”.`,
      v: `“${typed}” is an irregular inflected form of the verb “${base}”.`,
      a: `“${typed}” is an irregular comparative or superlative of “${base}”.`,
      r: `“${typed}” is an irregular form of the adverb “${base}”.`,
    };
    return `${labels[posKey] || `“${typed}” is an irregular form of “${base}”.`} WordNet files every sense under the base form, so the entry below is the one you want.`;
  }

  const isVerb = entry.p.includes("v");
  const isNoun = entry.p.includes("n");
  const isAdjective = entry.p.includes("a") || entry.p.includes("s");

  const rules = [
    [/ing$/, `“${typed}” is the -ing form of “${base}”.`],
    [/(ied|ed)$/, `“${typed}” is the past tense of “${base}”.`],
    [/iest$|est$/, `“${typed}” is the superlative of “${base}”.`],
    [
      /ier$|er$/,
      isAdjective
        ? `“${typed}” is the comparative of “${base}”.`
        : `“${typed}” is a form of “${base}”.`,
    ],
    [/ly$/, `“${typed}” is the adverb formed from “${base}”.`],
    [
      /(ies|ves|es|s)$/,
      isNoun && isVerb
        ? `“${typed}” is the plural of the noun “${base}” or the third-person form of the verb.`
        : isNoun
          ? `“${typed}” is the plural of “${base}”.`
          : `“${typed}” is the third-person singular of “${base}”.`,
    ],
  ];

  const matched = rules.find(([pattern]) => pattern.test(from));
  return `${matched ? matched[1] : `“${typed}” is an inflected form of “${base}”.`} It has no entry of its own, because a dictionary records the base form and the inflection is regular.`;
}

function answerSentence({ query, entry, via, matchCount, correctionCount = 0, total }) {
  if (!query) {
    return `AltF Lexicon holds ${total.toLocaleString("en-US")} entries. Type a word to see its meanings, its syllable split with the stress marked, its pronunciation, and its synonyms and antonyms sense by sense.`;
  }

  if (entry) {
    const definition = shortDefinition(entry.sn[0].g, 130);
    const found = via
      ? `“${query}” resolves to the entry for ${entry.w}`
      : `“${query}” is in AltF Lexicon`;
    const more =
      matchCount > 0
        ? ` ${matchCount} other ${matchCount === 1 ? "entry starts" : "entries start"} with the same letters.`
        : "";
    return `${found}: ${entry.w} means “${definition}”, and carries ${entry.ns === 1 ? "one recorded sense" : `${entry.ns} recorded senses`}.${more}`;
  }

  if (matchCount > 0) {
    return `No entry is spelled exactly “${query}”, but ${matchCount} ${
      matchCount === 1 ? "entry begins" : "entries begin"
    } with those letters. They are listed below, commonest first.`;
  }

  if (correctionCount > 0) {
    return `Nothing in the ${total.toLocaleString("en-US")} entries of AltF Lexicon is spelled “${query}”, but ${correctionCount} ${
      correctionCount === 1 ? "entry is" : "entries are"
    } within two edits of it. The closest is below, followed by the entries either side of “${query}” alphabetically.`;
  }

  return `Nothing in the ${total.toLocaleString("en-US")} entries of AltF Lexicon is spelled “${query}”, and no entry begins with or comes close to those letters. The nearest neighbours in alphabetical order are below.`;
}

/* ------------------------------------------------------------------ *
 * Metadata
 * ------------------------------------------------------------------ */

export async function generateMetadata({ searchParams }) {
  const query = readQuery(await searchParams);

  return createPageMetadata({
    title: query ? `Search results for “${query}”` : "Search the dictionary",
    description: query
      ? `Dictionary entries matching “${query}” in AltF Lexicon — meanings, syllables, pronunciation, synonyms and antonyms.`
      : "Search 147,478 English dictionary entries. Every entry shows its syllable split with the stress marked, its pronunciation and all of its recorded senses.",
    path: "/lexicon/search",
    // A results page is a query surface, not a document. Indexing it would put
    // it in competition with the word pages it exists to send readers to.
    noindex: true,
  });
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

export default async function LexiconSearchPage({ searchParams }) {
  const query = readQuery(await searchParams);
  const slug = slugifyWord(query);

  const manifest = await getManifest();

  const [resolved, prefixMatches] = slug
    ? await Promise.all([resolveWord(slug), searchWords(slug, { limit: RESULT_LIMIT })])
    : [null, []];

  const entry = resolved?.entry ?? null;
  const via = resolved?.via ?? null;

  // The resolved entry already has the card at the top; repeating it in the
  // grid underneath reads like the dictionary counted it twice.
  const matches = entry ? prefixMatches.filter((row) => row.s !== entry.s) : prefixMatches;

  // Only read the irregular table when the resolution actually came from it.
  const inflectionPos =
    via?.kind === "irregular" ? (await getInflections())[via.from]?.[1] ?? null : null;

  // The empty state is where a dictionary earns trust: the alphabetical
  // neighbours of a word that does not exist are almost always the word that
  // does, because the reader's error is usually in the tail of the spelling.
  let neighbours = [];
  let corrections = [];
  if (slug && !entry && matches.length === 0) {
    const rows = (await getLetterIndex(letterOf(slug))) || [];
    let position = rows.findIndex((row) => row.s >= slug);
    if (position === -1) position = rows.length;
    neighbours = rows.slice(
      Math.max(0, position - NEIGHBOURS_EACH_SIDE),
      position + NEIGHBOURS_EACH_SIDE,
    );

    /*
     * Alphabetical neighbours only rescue a typo in the tail of a word. They
     * will never get from "recieve" to "receive", because the two diverge at
     * the fourth letter and sit hundreds of rows apart. Real edit distance
     * does, and a transposition counts as one edit, which is exactly the slip
     * that produces most misspellings.
     */
    corrections = await suggestSpellings(slug, { limit: 6 });
  }

  const answer = answerSentence({
    query,
    entry,
    via,
    matchCount: matches.length,
    correctionCount: corrections.length,
    total: manifest.total,
  });

  return (
    <>
      <JsonLd
        id="altf-lexicon-search"
        data={[
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Search", path: "/lexicon/search" },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Breadcrumb items={[{ name: "Lexicon", path: "/lexicon" }, { name: "Search" }]} />

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Look up a word
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            {query ? (
              <>
                Search results for{" "}
                <span className="afl-headword text-primary">{`“${query}”`}</span>
              </>
            ) : (
              "Search the dictionary"
            )}
          </h1>

          <div className="mt-6 max-w-2xl">
            <SearchBox size="lg" autoFocus={!query} />
          </div>

          <AnswerFirst>{answer}</AnswerFirst>

          <StatStrip
            stats={[
              { value: manifest.total.toLocaleString("en-US"), label: "Entries searched" },
              {
                value: (matches.length + (entry ? 1 : 0)).toLocaleString("en-US"),
                label: "Results on this page",
              },
              { value: manifest.senses.toLocaleString("en-US"), label: "Senses behind them" },
            ]}
          />
        </header>

        {/* ---------------- The exact hit ---------------- */}
        {entry ? (
          <section className="py-8">
            {via ? (
              <p className="mb-4 flex max-w-[80ch] items-start gap-2 rounded-lg border border-border bg-surface-soft p-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
                <Info className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{inflectionSentence(via.from, entry, via.kind, inflectionPos)}</span>
              </p>
            ) : null}

            <Link
              href={`/lexicon/word/${entry.s}`}
              className="afl-card group block rounded-lg border border-border bg-surface p-5 no-underline sm:p-8"
            >
              <span className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5">
                <span className="min-w-0">
                  <span className="afl-headword block text-[clamp(2rem,5.5vw,3.25rem)] text-foreground group-hover:text-primary">
                    {entry.w}
                  </span>

                  {entry.pt?.length ? (
                    <span className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-2">
                      <SyllableLine parts={entry.pt} stress={entry.st} size="lg" />
                      {entry.ip ? (
                        <span className="font-mono text-[0.9375rem] text-muted-foreground">
                          /{entry.ip}/
                        </span>
                      ) : null}
                    </span>
                  ) : null}

                  {entry.rs ? (
                    <span className="mt-1.5 block font-mono text-sm text-muted-foreground">
                      say it: <span className="text-foreground">{entry.rs}</span>
                    </span>
                  ) : null}
                </span>

                <span className="flex shrink-0 flex-wrap items-start gap-x-8 gap-y-4">
                  <span className="block">
                    <span className="block text-xs text-muted-foreground">Part of speech</span>
                    <span className="mt-1.5 block">
                      <PosChips parts={entry.p} />
                    </span>
                  </span>
                  <span className="block">
                    <span className="block text-xs text-muted-foreground">How common</span>
                    <span className="mt-1.5 block">
                      <CommonnessMeter band={entry.c} />
                    </span>
                  </span>
                </span>
              </span>

              <span className="mt-6 block border-t border-border pt-5">
                <span className="afl-sense__gloss block">
                  <span className="mr-2 font-mono text-[0.8125rem] tabular-nums text-muted-foreground">
                    1.
                  </span>
                  {entry.sn[0].g}
                </span>
                {entry.sn[0].ex?.length ? (
                  <span className="afl-sense__example block">“{entry.sn[0].ex[0]}”</span>
                ) : null}

                <span className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                    {entry.ns === 1
                      ? "Read the full entry"
                      : `Read all ${entry.ns} senses on the full entry`}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </span>
              </span>
            </Link>

            <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Link
                href={`/lexicon/thesaurus/${entry.s}`}
                className="text-primary no-underline hover:underline"
              >
                Synonyms and antonyms for {entry.w}
              </Link>
              <Link
                href={`/lexicon/rhymes/${entry.s}`}
                className="text-primary no-underline hover:underline"
              >
                Words that rhyme with {entry.w}
              </Link>
            </p>
          </section>
        ) : null}

        {/* ---------------- Prefix matches ---------------- */}
        {matches.length > 0 ? (
          <section className="border-t border-border py-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3 pb-5">
              <h2 className="text-[1.375rem] font-semibold tracking-tight text-foreground">
                {entry ? "Other entries" : "Entries"} beginning with{" "}
                <span className="font-mono text-primary">{slug}</span>
              </h2>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {matches.length.toLocaleString("en-US")}{" "}
                {matches.length === RESULT_LIMIT ? "shown" : "found"}
              </span>
            </div>

            <p className="mb-6 max-w-[80ch] text-sm leading-relaxed text-muted-foreground">
              Matching is by prefix, not by fuzzy similarity: these are the entries whose spelling
              starts with the letters you typed, ranked by how often the word appears in everyday
              English and then by length, so the word you probably meant is first.
              {matches.length === RESULT_LIMIT
                ? ` More than ${RESULT_LIMIT} entries match — this is the first ${RESULT_LIMIT}.`
                : ""}
            </p>

            <WordCardGrid rows={matches} />
          </section>
        ) : null}

        {/* ---------------- Empty state ---------------- */}
        {query && !entry && matches.length === 0 ? (
          <section className="border-t border-border py-8">
            {corrections.length > 0 ? (
              <div className="mb-10">
                <h2 className="text-[1.375rem] font-semibold tracking-tight text-foreground">
                  Did you mean{" "}
                  <Link
                    href={`/lexicon/word/${corrections[0].s}`}
                    className="afl-headword text-primary hover:underline"
                  >
                    {corrections[0].w}
                  </Link>
                  ?
                </h2>
                <p className="mt-2 max-w-[80ch] text-sm leading-relaxed text-muted-foreground">
                  Nothing is spelled &ldquo;{query}&rdquo;, but{" "}
                  {corrections.length === 1 ? "one entry is" : `${corrections.length} entries are`}{" "}
                  within two edits of it — a swapped pair of letters, a missing one or one too many.
                  Closest first.
                </p>
                <WordCardGrid className="mt-6" rows={corrections} />
              </div>
            ) : null}

            <h2 className="text-[1.375rem] font-semibold tracking-tight text-foreground">
              {neighbours.length > 0
                ? `Nearest entries to “${query}”`
                : `Nothing found for “${query}”`}
            </h2>
            <p className="mt-2 max-w-[80ch] text-sm leading-relaxed text-muted-foreground">
              {neighbours.length > 0
                ? `These are the entries either side of “${query}” in alphabetical order — the same place you would land opening a printed dictionary at that page.`
                : "The query contains no letters the dictionary indexes. Try a word rather than punctuation or digits, or browse the alphabet below."}
            </p>

            {neighbours.length > 0 ? <WordCardGrid className="mt-6" rows={neighbours} /> : null}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <FallbackCard
                href="/lexicon/browse"
                title="Browse A–Z"
                blurb="Every entry by first letter, with the number each letter carries. The fastest route when you know how a word starts but not how it ends."
              />
              <FallbackCard
                href="/lexicon/words"
                title="Word lists"
                blurb="By length, by ending, by the letters a word contains. Built for the moment you know the shape of a word but not the word."
              />
            </div>
          </section>
        ) : null}

        {/* ---------------- No query at all ---------------- */}
        {!query ? (
          <section className="border-t border-border py-8">
            <h2 className="text-[1.375rem] font-semibold tracking-tight text-foreground">
              Or start somewhere else
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <FallbackCard
                href="/lexicon/browse"
                title="Browse A–Z"
                blurb="Every entry by first letter."
              />
              <FallbackCard
                href="/lexicon/words"
                title="Word lists"
                blurb="By length, ending and pattern."
              />
              <FallbackCard
                href="/lexicon/collections"
                title="Collections"
                blurb="199 curated slices of English."
              />
              <FallbackCard
                href="/lexicon/thesaurus"
                title="Thesaurus"
                blurb="Synonyms and antonyms, grouped by sense."
              />
            </div>
          </section>
        ) : null}

        <p className="border-t border-border py-8 text-xs leading-relaxed text-muted-foreground">
          Definitions and semantic relations come from Princeton University&rsquo;s WordNet;
          pronunciations come from the CMU Pronouncing Dictionary where the word is recorded in it.{" "}
          <Link href="/lexicon/sources" className="text-primary hover:underline">
            Full sources and licences
          </Link>
          .
        </p>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Local pieces
 * ------------------------------------------------------------------ */

function FallbackCard({ href, title, blurb }) {
  return (
    <Link
      href={href}
      className="afl-card group flex flex-col rounded-lg border border-border bg-surface p-4 no-underline"
    >
      <span className="flex items-center justify-between gap-2 text-[0.9375rem] font-semibold text-foreground group-hover:text-primary">
        {title}
        <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden="true" />
      </span>
      <span className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">{blurb}</span>
    </Link>
  );
}
