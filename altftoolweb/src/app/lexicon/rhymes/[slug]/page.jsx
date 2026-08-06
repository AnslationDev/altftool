import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Info } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { countSyllables, letterOf } from "@altftool/core/lexicon";
import { getRhymes, getWord, getWords } from "@altftool/core/lexicon/corpus";
import {
  AnswerFirst,
  Breadcrumb,
  CommonnessMeter,
  PosChips,
  StatStrip,
  SyllableLine,
} from "../../_components/WordAtoms";

export const revalidate = 86400;
export const dynamicParams = true;

/*
 * Rhymes for one word.
 *
 * The matching rule is the whole page, so it is stated in plain words rather
 * than implied: two words rhyme when their pronunciations agree on every
 * phoneme from the last stressed vowel onward. That is the definition a reader
 * already has in their head, and it is computable — the corpus stores the tail
 * as a rhyme key per entry, and a rhyme group is simply every entry sharing
 * one key.
 *
 * The consequence is that a word with no CMU pronunciation has no rhyme key,
 * and this page says so instead of guessing from spelling. Spelling is exactly
 * the wrong signal here: cough, though and through share four letters and
 * rhyme with none of each other.
 */

const FETCH_CAP = 300;
const RHYME_KEY_NOTE =
  "The key is the pronunciation from the last stressed vowel onward, written in the CMU Pronouncing Dictionary's phoneme alphabet. Every entry sharing it rhymes.";

/*
 * Pre-render the words people ask this question about — short, common, and
 * with a rhyme group big enough to be worth reading. Everything else renders
 * on demand and is cached by ISR.
 */
const PRERENDER = [
  "eight", "late", "way", "sea", "man", "eyes", "back", "stone", "time", "land",
  "gate", "light", "sight", "down", "day", "night", "book", "town", "right", "fire",
  "wait", "hold", "hand", "state", "phone", "near", "more", "door", "place", "straight",
  "long", "bone", "fight", "tone", "fair", "great", "rate", "ground", "me", "find",
  "stand", "dear", "part", "cat", "face", "case", "fly", "four", "ate", "nation",
  "ability", "tea", "side", "see", "line", "head", "ball", "size", "be", "boat",
];

export function generateStaticParams() {
  return PRERENDER.map((slug) => ({ slug }));
}

/* ------------------------------------------------------------------ *
 * Shaping
 * ------------------------------------------------------------------ */

const syllablesOf = (row) => row.sy || row.pt?.length || countSyllables(row.w) || 1;

/**
 * Rhymes, grouped by syllable count, shortest group first.
 *
 * A one-syllable rhyme and a five-syllable rhyme are answers to different
 * questions — the first is what a songwriter wants, the second is what a
 * crossword wants — so they are never mixed into one alphabetical run. Within
 * a group the order is commonness first, because the useful rhyme is the one
 * the reader has already met.
 */
function groupBySyllables(rows) {
  const groups = new Map();
  for (const row of rows) {
    const count = syllablesOf(row);
    if (!groups.has(count)) groups.set(count, []);
    groups.get(count).push(row);
  }

  return [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([syllables, words]) => ({
      syllables,
      words: words.sort((a, b) => b.c - a.c || (a.s < b.s ? -1 : 1)),
    }));
}

/* ------------------------------------------------------------------ *
 * Copy helpers
 * ------------------------------------------------------------------ */

function answerSentence(entry, rows, groups) {
  if (!entry.rk) {
    return `Rhymes cannot be computed for ${entry.w}. Rhyming is a fact about pronunciation, not spelling, and ${entry.w} is not recorded in the CMU Pronouncing Dictionary — so there is no phoneme string to match against. AltF Lexicon will not derive one from the letters, because spelling is a poor guide to sound in English: cough, though and through share four letters and rhyme with none of each other.`;
  }

  if (rows.length === 0) {
    return `Nothing in AltF Lexicon rhymes with ${entry.w}. Its pronunciation ends in the phonemes ${entry.rk}, and no other entry in the corpus shares that ending. A word with a rhyme key of its own and no company is genuinely unrhymable in ordinary English — orange is the famous case, and this is another.`;
  }

  const spread =
    groups.length === 1
      ? `all of them ${groups[0].syllables}-syllable ${groups[0].syllables === 1 ? "words" : "words"}`
      : `spread across ${groups.length} syllable lengths, from ${groups[0].syllables} to ${groups[groups.length - 1].syllables}`;

  return `${rows.length} ${rows.length === 1 ? "word rhymes" : "words rhyme"} with ${entry.w}, ${spread}. A rhyme is matched on the phonemes from the last stressed vowel onward — for ${entry.w} that is ${entry.rk} — so every word below genuinely rhymes when spoken, whatever its spelling suggests.`;
}

function buildFaqs(entry, rows, groups, commonest) {
  const faqs = [];

  faqs.push({
    question: `What rhymes with ${entry.w}?`,
    answer:
      rows.length === 0
        ? entry.rk
          ? `Nothing in the corpus does. ${entry.w} is pronounced with the ending ${entry.rk}, and no other entry shares it.`
          : `The question cannot be answered for ${entry.w}, because it has no recorded pronunciation in the CMU Pronouncing Dictionary and rhyme is a property of sound rather than spelling.`
        : `${rows.length} ${rows.length === 1 ? "word" : "words"}${
            commonest ? `, the commonest being ${commonest.w}` : ""
          }. In order of how often they turn up in everyday English: ${groups
            .flatMap((group) => group.words)
            .sort((a, b) => b.c - a.c)
            .slice(0, 8)
            .map((row) => row.w)
            .join(", ")}${rows.length > 8 ? ", and others" : ""} — all listed on this page, grouped by syllable count.`,
  });

  faqs.push({
    question: "How is a rhyme decided here?",
    answer:
      "Two words rhyme when their pronunciations agree on every phoneme from the last stressed vowel to the end of the word. That tail is stored as a rhyme key on each entry, and a rhyme group is every entry sharing a key. No spelling is involved at any point, which is why the lists include words that look nothing alike and exclude words that look identical.",
  });

  if (groups.length > 1) {
    faqs.push({
      question: `How many syllables do the rhymes for ${entry.w} have?`,
      answer: `They run from ${groups[0].syllables} to ${groups[groups.length - 1].syllables} syllables. ${groups
        .map(
          (group) =>
            `${group.words.length} ${group.words.length === 1 ? "word has" : "words have"} ${group.syllables}`,
        )
        .join(", ")}. They are grouped that way on this page because a one-syllable rhyme and a four-syllable rhyme answer different questions.`,
    });
  }

  faqs.push({
    question: `How is ${entry.w} pronounced?`,
    answer: entry.pt?.length
      ? `${entry.w} has ${entry.sy || entry.pt.length} ${(entry.sy || entry.pt.length) === 1 ? "syllable" : "syllables"}: ${entry.pt.join("-")}${
          entry.pt.length > 1 ? `, with the stress on “${entry.pt[entry.st]}”` : ""
        }.${entry.ip ? ` In IPA it is /${entry.ip}/.` : ""}${entry.rs ? ` Respelled for reading aloud: ${entry.rs}.` : ""}`
      : `No phonetic transcription is recorded for ${entry.w}.`,
  });

  return faqs;
}

/* ------------------------------------------------------------------ *
 * Metadata
 * ------------------------------------------------------------------ */

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const entry = await getWord(slug);

  if (!entry) {
    return createPageMetadata({
      title: `${slug.replace(/-/g, " ")} — no entry`,
      description: "That word is not in AltF Lexicon.",
      path: `/lexicon/rhymes/${slug}`,
      noindex: true,
    });
  }

  const rhymeSlugs = await getRhymes(entry);

  return createPageMetadata({
    title: rhymeSlugs.length
      ? `${rhymeSlugs.length} words that rhyme with ${entry.w}`
      : `Words that rhyme with ${entry.w}`,
    description: rhymeSlugs.length
      ? `${rhymeSlugs.length} rhymes for ${entry.w}, grouped by syllable count and matched on the phonemes from the last stressed vowel onward — not on spelling.`
      : `${entry.w} has no rhyme in AltF Lexicon. This page explains why, and how rhymes are computed from pronunciation rather than spelling.`,
    path: `/lexicon/rhymes/${entry.s}`,
    keywords: [
      `words that rhyme with ${entry.w}`,
      `${entry.w} rhymes`,
      `rhymes for ${entry.w}`,
      `what rhymes with ${entry.w}`,
    ],
    // Nothing to index on a page with no rhymes: the useful content is the
    // explanation, and it is the same explanation on every such page.
    noindex: rhymeSlugs.length === 0 || !entry.ix,
  });
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

export default async function RhymesPage({ params }) {
  const { slug } = await params;
  const entry = await getWord(slug);
  if (!entry) notFound();

  const rhymeSlugs = await getRhymes(entry);
  // The rhyme shards store at most 200 slugs per key, so this cap is headroom
  // rather than truncation — but it is enforced anyway, because the 1 MiB
  // prerender ceiling is not negotiable.
  const rows = rhymeSlugs.length ? await getWords(rhymeSlugs.slice(0, FETCH_CAP)) : [];
  const groups = groupBySyllables(rows);
  const commonest = rows.length
    ? rows.reduce((best, row) => (row.c > best.c ? row : best), rows[0])
    : null;

  const path = `/lexicon/rhymes/${entry.s}`;
  const faqs = buildFaqs(entry, rows, groups, commonest);
  const firstLetter = letterOf(entry.s);

  return (
    <>
      <JsonLd
        id={`altf-lexicon-rhymes-${entry.s}`}
        data={[
          createItemListJsonLd({
            path,
            name: `Words that rhyme with ${entry.w}`,
            items: rows.slice(0, 50).map((row) => ({
              name: row.w,
              path: `/lexicon/word/${row.s}`,
            })),
          }),
          createFaqJsonLd({ path, questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: entry.w, path: `/lexicon/word/${entry.s}` },
            { name: "Rhymes", path },
          ]),
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Breadcrumb
          items={[
            { name: "Lexicon", path: "/lexicon" },
            { name: entry.w, path: `/lexicon/word/${entry.s}` },
            { name: "Rhymes" },
          ]}
        />

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Rhymes
          </span>

          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            Words that rhyme with{" "}
            <span className="afl-headword text-primary">{entry.w}</span>
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            {entry.pt?.length ? (
              <SyllableLine parts={entry.pt} stress={entry.st} size="md" />
            ) : null}
            {entry.ip ? (
              <span className="font-mono text-sm text-muted-foreground">/{entry.ip}/</span>
            ) : null}
            <PosChips parts={entry.p} abbreviated />
            <CommonnessMeter band={entry.c} />
          </div>

          <AnswerFirst>{answerSentence(entry, rows, groups)}</AnswerFirst>

          {rows.length > 0 ? (
            <StatStrip
              stats={[
                { value: rows.length.toLocaleString("en-US"), label: "Rhymes found" },
                {
                  value:
                    groups.length === 1
                      ? String(groups[0].syllables)
                      : `${groups[0].syllables}–${groups[groups.length - 1].syllables}`,
                  label: groups.length === 1 ? "Syllables" : "Syllable spread",
                },
                { value: commonest.w, label: "Commonest rhyme" },
                { value: entry.rk, label: "Rhyme key matched" },
              ]}
            />
          ) : null}
        </header>

        {/* ---------------- The rule ---------------- */}
        <section className="py-8">
          <div className="max-w-[80ch] rounded-lg border border-border bg-surface-soft p-5">
            <h2 className="text-[0.9375rem] font-semibold text-foreground">
              How these rhymes were computed
            </h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
              Two words rhyme when their pronunciations agree on every phoneme from the last
              stressed vowel to the end of the word. Nothing about spelling is consulted — that is
              why <em>eight</em> rhymes with <em>freight</em> and <em>straight</em>, and why{" "}
              <em>cough</em> rhymes with none of <em>though</em>, <em>through</em> or{" "}
              <em>bough</em>.
              {entry.rk ? (
                <>
                  {" "}
                  For {entry.w} the matched ending is{" "}
                  <span className="font-mono text-foreground">{entry.rk}</span>. {RHYME_KEY_NOTE}
                </>
              ) : null}
            </p>
            {rows.length > 0 ? (
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
                The list below is grouped by syllable count, one-syllable words first, and ordered
                within each group by how often the word appears in everyday English. It is not
                filtered for quality or for near-rhymes: everything here is an exact match on the
                rule above, and nothing that matches has been left out.
              </p>
            ) : null}
          </div>
        </section>

        {/* ---------------- No pronunciation ---------------- */}
        {!entry.rk ? (
          <section className="pb-8">
            <div className="max-w-[80ch] rounded-lg border border-border bg-surface p-5">
              <p className="flex items-start gap-2 text-[0.9375rem] leading-relaxed text-foreground">
                <Info className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  <strong className="font-semibold">
                    Rhymes cannot be computed for {entry.w}.
                  </strong>{" "}
                  It has no entry in the CMU Pronouncing Dictionary, so the corpus holds no phoneme
                  string for it and there is nothing to match other words against.
                  {entry.pd
                    ? " The syllable split shown on the word page was derived from spelling, which is good enough to break a word into parts but nowhere near good enough to decide what it rhymes with."
                    : ""}
                </span>
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
                Roughly one entry in four across the corpus carries a real transcription; the rest
                are compounds, proper nouns, taxonomic names and rare vocabulary that the
                pronouncing dictionary never covered. A rhyme list guessed from letters would be
                confidently wrong, so none is printed.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <Link
                  href={`/lexicon/word/${entry.s}`}
                  className="text-primary no-underline hover:underline"
                >
                  The full entry for {entry.w}
                </Link>
                <Link
                  href={`/lexicon/browse/${firstLetter}`}
                  className="text-primary no-underline hover:underline"
                >
                  Browse {firstLetter.toUpperCase()}
                </Link>
                <Link href="/lexicon/browse" className="text-primary no-underline hover:underline">
                  Browse A–Z
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {/* ---------------- No rhymes, but a key ---------------- */}
        {entry.rk && rows.length === 0 ? (
          <section className="pb-8">
            <div className="max-w-[80ch] rounded-lg border border-border bg-surface p-5">
              <p className="text-[0.9375rem] leading-relaxed text-foreground">
                <strong className="font-semibold">{entry.w} has no rhyme.</strong> Its ending{" "}
                <span className="font-mono">{entry.rk}</span> is unique among the entries in AltF
                Lexicon — no other word in the corpus is pronounced that way from its last stressed
                vowel onward.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <Link
                  href={`/lexicon/word/${entry.s}`}
                  className="text-primary no-underline hover:underline"
                >
                  The full entry for {entry.w}
                </Link>
                <Link href="/lexicon/browse" className="text-primary no-underline hover:underline">
                  Browse A–Z
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {/* ---------------- Rhyme groups ---------------- */}
        {groups.map((group) => (
          <section key={group.syllables} className="border-t border-border py-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3 pb-5">
              <h2 className="text-[1.375rem] font-semibold tracking-tight text-foreground">
                {group.syllables === 1 ? "One-syllable" : `${group.syllables}-syllable`} rhymes
              </h2>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {group.words.length.toLocaleString("en-US")}{" "}
                {group.words.length === 1 ? "word" : "words"} · commonest first
              </span>
            </div>

            <ul
              className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-2"
              style={{ listStyle: "none" }}
            >
              {group.words.map((row) => (
                <li key={row.s}>
                  <Link
                    href={`/lexicon/word/${row.s}`}
                    className="afl-card group flex h-full flex-col rounded-md border border-border bg-surface px-3 py-2.5 no-underline"
                  >
                    <span className="afl-headword text-[1.0625rem] text-foreground group-hover:text-primary">
                      {row.w}
                    </span>
                    {/* A one-syllable word's syllable line is the word again, so
                        it is skipped rather than printed twice in a small card. */}
                    {row.pt?.length > 1 ? (
                      <span className="mt-1 block">
                        <SyllableLine parts={row.pt} stress={row.st} size="sm" />
                      </span>
                    ) : null}
                    <span className="mt-auto flex items-center gap-2 pt-2">
                      <CommonnessMeter band={row.c} showLabel={false} />
                      {row.ph ? (
                        <span className="font-mono text-[0.6875rem] text-muted-foreground">
                          phrase
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* ---------------- FAQ ---------------- */}
        <section className="border-t border-border py-8">
          <h2 className="text-[1.375rem] font-semibold tracking-tight text-foreground">
            Questions about rhyming {entry.w}
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
        </section>

        {/* ---------------- Across ---------------- */}
        <section className="border-t border-border py-8">
          <h2 className="text-[1.375rem] font-semibold tracking-tight text-foreground">
            Other views of {entry.w}
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-3" style={{ listStyle: "none" }}>
            <CrossLink
              href={`/lexicon/word/${entry.s}`}
              title={`Full entry for ${entry.w}`}
              blurb={`All ${entry.ns} ${entry.ns === 1 ? "sense" : "senses"}, with examples, syllables and pronunciation.`}
            />
            <CrossLink
              href={`/lexicon/thesaurus/${entry.s}`}
              title={`Synonyms for ${entry.w}`}
              blurb="Synonyms and antonyms grouped by sense, because a word with several meanings has several sets."
            />
            <CrossLink
              href={`/lexicon/browse/${firstLetter}`}
              title={`Browse ${firstLetter.toUpperCase()}`}
              blurb="Every entry starting with the same letter, in dictionary order."
            />
          </ul>
        </section>

        <p className="border-t border-border py-8 text-xs leading-relaxed text-muted-foreground">
          Pronunciations and rhyme keys come from the CMU Pronouncing Dictionary; definitions and
          commonness come from WordNet and a corpus of everyday English.{" "}
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

function CrossLink({ href, title, blurb }) {
  return (
    <li>
      <Link
        href={href}
        className="afl-card group flex h-full flex-col rounded-lg border border-border bg-surface p-4 no-underline"
      >
        <span className="flex items-center justify-between gap-2 text-[0.9375rem] font-semibold text-foreground group-hover:text-primary">
          {title}
          <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden="true" />
        </span>
        <span className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
          {blurb}
        </span>
      </Link>
    </li>
  );
}
