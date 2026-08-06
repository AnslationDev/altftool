import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { COMMONNESS, LETTERS, shortDefinition } from "@altftool/core/lexicon";
import { getList, getManifest, getWords } from "@altftool/core/lexicon/corpus";
import {
  AnswerFirst,
  Breadcrumb,
  Pagination,
  SectionHeading,
  StatStrip,
  WordCardGrid,
  WordChipGrid,
} from "../../_components/WordAtoms";

export const revalidate = 86400;
export const dynamicParams = true;

/*
 * One route, five question shapes.
 *
 * "5 letter words starting with T", "words ending in -ing", "words containing
 * ER" are the same request with different predicates, and the corpus already
 * stores each as a precomputed list. Splitting them into five routes would
 * mean five copies of the pagination, the stat strip and the cross-linking,
 * which is how the sibling links in this tier rot out of sync on rival sites.
 *
 * The slug IS the query. Anything that does not parse to a list the manifest
 * knows about is a 404 rather than an empty page, because an empty list page
 * is worse than no page: it gets indexed and then disappoints.
 */

const PER_PAGE = 200;
const HUB_PATH = "/lexicon/words";
const DEFINITIONS_SHOWN = 12;

/* ------------------------------------------------------------------ *
 * Slug → query
 * ------------------------------------------------------------------ */

/*
 * Order is load-bearing: the cross pattern has to be tried before the plain
 * length pattern, or "5-letter-words-starting-with-t" never matches anything.
 * Leading zeros are rejected outright so "05-letter-words" cannot become a
 * second URL for the same list.
 */
const PATTERNS = [
  {
    re: /^([1-9]\d?)-letter-words-starting-with-([a-z])$/,
    build: (match) => ({
      kind: "cross",
      key: `${match[1]}-${match[2]}`,
      length: Number(match[1]),
      letter: match[2],
    }),
  },
  {
    re: /^([1-9]\d?)-letter-words$/,
    build: (match) => ({ kind: "length", key: match[1], length: Number(match[1]) }),
  },
  {
    re: /^starting-with-([a-z])$/,
    build: (match) => ({ kind: "starting", key: match[1], letter: match[1] }),
  },
  {
    re: /^ending-in-([a-z]+)$/,
    build: (match) => ({ kind: "ending", key: match[1], suffix: match[1] }),
  },
  {
    re: /^containing-([a-z]+)$/,
    build: (match) => ({ kind: "containing", key: match[1], letters: match[1] }),
  },
];

function parseSlug(slug) {
  const clean = String(slug || "").toLowerCase();
  for (const pattern of PATTERNS) {
    const match = clean.match(pattern.re);
    if (match) return pattern.build(match);
  }
  return null;
}

/** The manifest is the authority on which lists exist. */
function totalFor(manifest, query) {
  const totals = manifest?.listTotals?.[query.kind];
  const total = totals?.[query.key];
  return Number.isFinite(total) ? total : null;
}

async function resolveList(slug) {
  const query = parseSlug(slug);
  if (!query) return null;

  const manifest = await getManifest();
  const total = totalFor(manifest, query);
  if (total === null) return null;

  return { query, manifest, total };
}

/* ------------------------------------------------------------------ *
 * Static params
 * ------------------------------------------------------------------ */

/*
 * 58 pages, out of 545 lists.
 *
 * The A–Z is prerendered because it is the tier's own navigation and every
 * word page links into it. Lengths 3–8 cover the band people actually ask
 * about. The 5-letter cross set is prerendered in full because "5 letter words
 * starting with X" is the single highest-volume shape in the category — word
 * games put it in front of millions of people a day. Everything else renders
 * on demand and is then held by ISR, which keeps the build minutes and the
 * deploy artifact proportional to the traffic.
 */
export async function generateStaticParams() {
  const params = LETTERS.map((letter) => ({ slug: `starting-with-${letter}` }));

  for (const length of [3, 4, 5, 6, 7, 8]) {
    params.push({ slug: `${length}-letter-words` });
  }
  for (const letter of LETTERS) {
    params.push({ slug: `5-letter-words-starting-with-${letter}` });
  }

  return params;
}

/* ------------------------------------------------------------------ *
 * Copy
 * ------------------------------------------------------------------ */

/**
 * Everything the page says about itself, written for the query as a reader
 * would type it rather than for the data structure behind it.
 */
function describe(query, total) {
  const count = total.toLocaleString("en-US");
  const letter = (query.letter || "").toUpperCase();
  const marks = (query.letters || "").toUpperCase();

  switch (query.kind) {
    case "starting":
      return {
        subject: `words that start with ${letter}`,
        h1: `Words that start with ${letter}`,
        crumb: `Starting with ${letter}`,
        title: `Words that start with ${letter} — ${count} words`,
        metaDescription: `All ${count} words beginning with ${letter}, ranked by how often each one turns up in everyday English. Narrow by length, or open any word for its definition, syllables and pronunciation.`,
        rule: `A word is in this list if its first letter is ${letter}. Single words only — multi-word phrases and compounds are browsable by letter but are not what someone asking this question means.`,
        countQuestion: `How many words start with ${letter}?`,
        keywords: [
          `words that start with ${query.letter}`,
          `words starting with ${query.letter}`,
          `words beginning with ${query.letter}`,
          `${query.letter} words`,
        ],
      };

    case "length":
      return {
        subject: `${query.length} letter words`,
        h1: `${query.length} letter words`,
        crumb: `${query.length} letters`,
        title: `${query.length} letter words — ${count} words`,
        metaDescription: `All ${count} ${query.length}-letter words, ranked by how common they are in everyday English. Narrow by starting letter, or open any word for its meaning and pronunciation.`,
        rule: `Length is counted in letters only: hyphens, apostrophes and digits do not add to the total, so a hyphenated compound is measured by its letters rather than its characters.`,
        countQuestion: `How many ${query.length} letter words are there?`,
        keywords: [
          `${query.length} letter words`,
          `${query.length} letter words list`,
          `words with ${query.length} letters`,
          `all ${query.length} letter words`,
        ],
      };

    case "cross":
      return {
        subject: `${query.length} letter words starting with ${letter}`,
        h1: `${query.length} letter words starting with ${letter}`,
        crumb: `${query.length} letters · ${letter}`,
        title: `${query.length} letter words starting with ${letter} — ${count} words`,
        metaDescription: `All ${count} ${query.length}-letter words beginning with ${letter}, most common first. Built for word games: scan the list, or open a word for its definition and syllables.`,
        rule: `Two conditions, both on spelling: the first letter is ${letter}, and the word has exactly ${query.length} letters. Hyphens and apostrophes are not counted as letters.`,
        countQuestion: `How many ${query.length} letter words start with ${letter}?`,
        keywords: [
          `${query.length} letter words starting with ${query.letter}`,
          `${query.length} letter words that start with ${query.letter}`,
          `${query.length} letter words beginning with ${query.letter}`,
          `${query.length} letter ${query.letter} words`,
        ],
      };

    case "ending":
      return {
        subject: `words ending in -${query.suffix}`,
        h1: `Words ending in -${query.suffix}`,
        crumb: `Ending in -${query.suffix}`,
        title: `Words ending in -${query.suffix} — ${count} words`,
        metaDescription: `All ${count} words that end in -${query.suffix}, ranked by how common they are in everyday English. Definitions, syllables and related endings for every one.`,
        rule: `Matched on how the word is spelled, not on grammar: any word whose last letters are “${query.suffix}” is here, whether or not that ending is doing any grammatical work.`,
        countQuestion: `How many words end in -${query.suffix}?`,
        keywords: [
          `words ending in ${query.suffix}`,
          `words that end in ${query.suffix}`,
          `words ending with ${query.suffix}`,
          `${query.suffix} words`,
        ],
      };

    case "containing":
    default:
      return {
        subject: `words containing ${marks}`,
        h1: `Words containing ${marks}`,
        crumb: `Containing ${marks}`,
        title: `Words containing ${marks} — ${count} words`,
        metaDescription: `All ${count} words with ${marks} anywhere in them, ranked by how common they are in everyday English. For crosswords and anagrams, where the letters you have are stuck in the middle.`,
        rule: `The letters “${query.letters}” have to appear somewhere in the word, in that order and next to each other. Position is not constrained — the start, the middle and the end all count.`,
        countQuestion: `How many words contain ${marks}?`,
        keywords: [
          `words containing ${query.letters}`,
          `words with ${query.letters}`,
          `words with ${query.letters} in them`,
          `${query.letters} words`,
        ],
      };
  }
}

function capSentence(total, shown, listCap) {
  if (total <= shown) return null;
  return `Showing the ${listCap.toLocaleString("en-US")} most common of ${total.toLocaleString("en-US")} — ranked by how often each word appears in everyday English.`;
}

/* ------------------------------------------------------------------ *
 * Metadata
 * ------------------------------------------------------------------ */

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const { page: pageParam } = (await searchParams) || {};
  const resolved = await resolveList(slug);

  if (!resolved) {
    return createPageMetadata({
      title: "Word list not found",
      description: "That word list does not exist. Browse every list AltF Lexicon publishes.",
      path: `${HUB_PATH}/${slug}`,
      noindex: true,
    });
  }

  const { query, total } = resolved;
  const copy = describe(query, total);
  const page = Math.max(1, Number.parseInt(pageParam, 10) || 1);
  const path = page > 1 ? `${HUB_PATH}/${query.kind === "length" ? `${query.length}-letter-words` : slug}?page=${page}` : `${HUB_PATH}/${slug}`;

  return createPageMetadata({
    title: page > 1 ? `${copy.title} (page ${page})` : copy.title,
    description: copy.metaDescription,
    path,
    keywords: copy.keywords,
  });
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

export default async function WordListPage({ params, searchParams }) {
  const { slug } = await params;
  const { page: pageParam } = (await searchParams) || {};

  const resolved = await resolveList(slug);
  if (!resolved) notFound();

  const { query, manifest, total } = resolved;

  const rows = await getList(query.kind, query.key);
  if (!rows || rows.length === 0) notFound();

  const page = Math.max(1, Number.parseInt(pageParam, 10) || 1);
  const lastPage = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  if (page > lastPage) notFound();

  const pageRows = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Definitions for the top of the page. A pattern page that is only a word
  // wall answers the query and teaches nothing; twelve real entries cost one
  // bucket read each and make the page worth landing on.
  const entries = await getWords(pageRows.slice(0, DEFINITIONS_SHOWN).map((row) => row.s));
  const cards = entries.map((entry) => ({
    s: entry.s,
    w: entry.w,
    p: (entry.p || []).join(""),
    c: entry.c,
    y: entry.sy,
    n: entry.ns,
    ph: entry.ph,
    g: shortDefinition(entry.sn?.[0]?.g || "", 140),
  }));

  const copy = describe(query, total);
  const cap = capSentence(total, rows.length, manifest.listCap);
  const stats = buildStats(query, rows, total);
  const related = relatedSections(query, manifest);
  const path = `${HUB_PATH}/${slug}`;

  const top = rows[0];
  const topBand = COMMONNESS.find((band) => band.band === top.c);
  const faqs = buildFaqs({ query, copy, rows, total, manifest, cap, top, topBand });

  return (
    <>
      <JsonLd
        id={`altf-lexicon-list-${query.kind}-${query.key}`}
        data={[
          createCollectionPageJsonLd({
            path,
            name: copy.h1,
            description: copy.metaDescription,
          }),
          createItemListJsonLd({
            path,
            name: copy.h1,
            items: pageRows.slice(0, 100).map((row) => ({
              name: row.w,
              path: `/lexicon/word/${row.s}`,
            })),
          }),
          createFaqJsonLd({ path, questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Word lists", path: HUB_PATH },
            { name: copy.crumb, path },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Breadcrumb
          items={[
            { name: "Lexicon", path: "/lexicon" },
            { name: "Word lists", path: HUB_PATH },
            { name: copy.crumb },
          ]}
        />

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            {total.toLocaleString("en-US")} words
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            {copy.h1}
          </h1>

          <AnswerFirst>
            {`There are ${total.toLocaleString("en-US")} ${copy.subject} in AltF Lexicon. ${copy.rule} The list is ordered by commonness — how often the word turns up in a large corpus of everyday English — then alphabetically, so the ones you already know come first.`}
          </AnswerFirst>

          <StatStrip stats={stats} />

          {cap ? (
            <p className="mt-6 max-w-[75ch] rounded-lg border border-border bg-surface-soft p-4 text-sm leading-relaxed text-muted-foreground">
              {cap} The averages above describe those{" "}
              {rows.length.toLocaleString("en-US")} words, not all{" "}
              {total.toLocaleString("en-US")}.
            </p>
          ) : null}
        </header>

        {/* ---------------- Definitions ---------------- */}
        {cards.length > 0 ? (
          <section className="py-10">
            <SectionHeading
              eyebrow="What they mean"
              title={
                page > 1
                  ? `The first ${cards.length} on this page, defined`
                  : `The ${cards.length} most common, defined`
              }
              description="Definitions come from Princeton's WordNet. Every word below the fold links to the same treatment — meaning, syllables, stress and pronunciation."
            />
            <WordCardGrid rows={cards} className="mt-6" />
          </section>
        ) : null}

        {/* ---------------- The grid ---------------- */}
        <section className="py-10">
          <SectionHeading
            eyebrow={
              lastPage > 1
                ? `Page ${page.toLocaleString("en-US")} of ${lastPage.toLocaleString("en-US")}`
                : "Full list"
            }
            title={`All ${copy.subject}`}
            description={`${rows.length.toLocaleString("en-US")} words, ${PER_PAGE} to a page, most common first. The dots after each word are its commonness band.`}
          />
          <WordChipGrid rows={pageRows} className="mt-6" />
          <Pagination
            page={page}
            total={rows.length}
            perPage={PER_PAGE}
            basePath={path}
          />
        </section>

        {/* ---------------- Related lists ---------------- */}
        {related.map((section) => (
          <section key={section.title} className="border-t border-border py-8">
            <h2 className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
              {section.title}
            </h2>
            {section.blurb ? (
              <p className="mt-2 max-w-[70ch] text-sm text-muted-foreground">{section.blurb}</p>
            ) : null}
            <ul className="mt-4 flex flex-wrap gap-1.5" style={{ listStyle: "none" }}>
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-baseline gap-2 rounded-sm border border-border bg-surface-soft px-2.5 py-1 text-[0.875rem] text-foreground no-underline transition hover:border-border-strong hover:bg-surface hover:text-primary"
                  >
                    <span>{link.label}</span>
                    <span className="font-mono text-[0.6875rem] tabular-nums text-muted-foreground">
                      {link.count.toLocaleString("en-US")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* ---------------- FAQ ---------------- */}
        <section className="border-t border-border py-10">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
            Questions about {copy.subject}
          </h2>
          <dl className="afl-divide mt-4 max-w-[75ch]">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-4">
                <dt className="text-[0.9375rem] font-semibold text-foreground">{faq.question}</dt>
                <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 max-w-[75ch] rounded-lg border border-border bg-surface-soft p-4 text-xs leading-relaxed text-muted-foreground">
            Words and definitions come from Princeton University&rsquo;s WordNet; commonness is
            measured against a corpus of everyday English.{" "}
            <Link href="/lexicon/sources" className="text-primary hover:underline">
              Full sources and licences
            </Link>
            .
          </p>

          <Link
            href={HUB_PATH}
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-primary no-underline hover:underline"
          >
            Every word list <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Stats
 * ------------------------------------------------------------------ */

/*
 * A stat that is constant by construction is not a stat. On a "5 letter words"
 * page the average length is five and the longest word is five, so those two
 * slots carry syllables instead — which for a fixed-length list is the only
 * shape left that varies.
 */
function buildStats(query, rows, total) {
  const fixedLength = query.kind === "length" || query.kind === "cross";
  const sum = (pick) => rows.reduce((carry, row) => carry + (pick(row) || 0), 0);
  const pickMax = (score) =>
    rows.reduce((best, row) => (score(row) > score(best) ? row : best), rows[0]);

  const stats = [
    { value: total.toLocaleString("en-US"), label: "Words matching" },
  ];

  if (fixedLength) {
    stats.push({ value: (sum((row) => row.y) / rows.length).toFixed(1), label: "Average syllables" });
  } else {
    stats.push({ value: (sum((row) => row.l) / rows.length).toFixed(1), label: "Average letters" });
  }

  stats.push({ value: rows[0].w, label: "Most common" });

  stats.push(
    fixedLength
      ? { value: pickMax((row) => row.y || 0).w, label: "Most syllables" }
      : { value: pickMax((row) => row.l || 0).w, label: "Longest" },
  );

  return stats;
}

/* ------------------------------------------------------------------ *
 * FAQ
 * ------------------------------------------------------------------ */

function buildFaqs({ query, copy, rows, total, manifest, cap, top, topBand }) {
  const fixedLength = query.kind === "length" || query.kind === "cross";
  const longest = rows.reduce((best, row) => (row.l > best.l ? row : best), rows[0]);
  const wordiest = rows.reduce((best, row) => ((row.y || 0) > (best.y || 0) ? row : best), rows[0]);

  const faqs = [
    {
      question: copy.countQuestion,
      answer: `${total.toLocaleString("en-US")}. That is every one in AltF Lexicon, which indexes ${manifest.words.toLocaleString("en-US")} single English words from Princeton's WordNet.${
        cap
          ? ` This page lists the ${manifest.listCap.toLocaleString("en-US")} most common of them.`
          : " All of them are listed on this page."
      }`,
    },
    {
      question: `What is the most common of the ${copy.subject}?`,
      answer: `${top.w}. It sits in the "${topBand.label}" commonness band — ${topBand.blurb.toLowerCase()} Commonness is measured from a frequency corpus, not from an editor's impression.`,
    },
  ];

  if (fixedLength) {
    faqs.push({
      question: `Which of the ${copy.subject} has the most syllables?`,
      answer: `${wordiest.w}, with ${wordiest.y} syllables. Syllable counts come from the CMU Pronouncing Dictionary where the word is in it, and from a spelling-based split where it is not.`,
    });
  } else {
    faqs.push({
      question: `What is the longest of the ${copy.subject}?`,
      answer: `${longest.w}, at ${longest.l} letters. Hyphens and apostrophes are not counted, so the letter count can be shorter than the string.`,
    });
  }

  faqs.push({
    question: "How was this list built?",
    answer: `${copy.rule} Nothing on this page is hand-picked: the list is regenerated from the corpus every time it is rebuilt, ordered by commonness and then alphabetically.`,
  });

  if (cap) {
    faqs.push({
      question: `Why are only ${manifest.listCap.toLocaleString("en-US")} shown?`,
      answer: `${cap} The tail is overwhelmingly taxonomic and technical vocabulary — Latin genus names and the like — which nobody scanning this list is looking for. Every one of those words still has its own page and is reachable by search or by browsing its letter.`,
    });
  }

  return faqs;
}

/* ------------------------------------------------------------------ *
 * Cross-linking
 * ------------------------------------------------------------------ */

/*
 * The whole point of the tier.
 *
 * A reader who lands on "5 letter words starting with T" is one keystroke away
 * from wanting six letters, or a different letter, and a crawler needs a path
 * from every list to its neighbours. Both are served by the same links.
 */
function relatedSections(query, manifest) {
  const totals = manifest.listTotals;
  const sections = [];

  const lengthsForLetter = (letter) =>
    manifest.lengths
      .filter((length) => Number.isFinite(totals.cross[`${length}-${letter}`]))
      .map((length) => ({
        href: `${HUB_PATH}/${length}-letter-words-starting-with-${letter}`,
        label: `${length} letters`,
        count: totals.cross[`${length}-${letter}`],
        key: `${length}-${letter}`,
      }));

  const lettersForLength = (length) =>
    LETTERS.filter((letter) => Number.isFinite(totals.cross[`${length}-${letter}`])).map(
      (letter) => ({
        href: `${HUB_PATH}/${length}-letter-words-starting-with-${letter}`,
        label: letter.toUpperCase(),
        count: totals.cross[`${length}-${letter}`],
        key: `${length}-${letter}`,
      }),
    );

  const allLetters = LETTERS.filter((letter) => Number.isFinite(totals.starting[letter])).map(
    (letter) => ({
      href: `${HUB_PATH}/starting-with-${letter}`,
      label: letter.toUpperCase(),
      count: totals.starting[letter],
      key: letter,
    }),
  );

  const allLengths = manifest.lengths
    .filter((length) => Number.isFinite(totals.length[String(length)]))
    .map((length) => ({
      href: `${HUB_PATH}/${length}-letter-words`,
      label: `${length} letters`,
      count: totals.length[String(length)],
      key: String(length),
    }));

  if (query.kind === "starting") {
    const byLength = lengthsForLetter(query.letter);
    if (byLength.length) {
      sections.push({
        title: `Narrow ${query.letter.toUpperCase()} by length`,
        blurb: "The same letter, split by how many letters the word has.",
        links: byLength,
      });
    }
    sections.push({
      title: "Other starting letters",
      links: allLetters.filter((link) => link.key !== query.letter),
    });
  }

  if (query.kind === "length") {
    const byLetter = lettersForLength(query.length);
    if (byLetter.length) {
      sections.push({
        title: `${query.length} letter words by starting letter`,
        blurb: "The list people usually want next — same length, one letter at a time.",
        links: byLetter,
      });
    }
    sections.push({
      title: "Other lengths",
      links: allLengths.filter((link) => link.key !== String(query.length)),
    });
  }

  if (query.kind === "cross") {
    const byLength = lengthsForLetter(query.letter).filter((link) => link.key !== query.key);
    if (byLength.length) {
      sections.push({
        title: `Other lengths starting with ${query.letter.toUpperCase()}`,
        links: byLength,
      });
    }
    const byLetter = lettersForLength(query.length).filter((link) => link.key !== query.key);
    if (byLetter.length) {
      sections.push({
        title: `Other letters, ${query.length} letters long`,
        links: byLetter,
      });
    }
    sections.push({
      title: "Drop a condition",
      blurb: "The two wider lists this one sits inside.",
      links: [
        {
          href: `${HUB_PATH}/starting-with-${query.letter}`,
          label: `All words starting with ${query.letter.toUpperCase()}`,
          count: totals.starting[query.letter],
          key: `s-${query.letter}`,
        },
        {
          href: `${HUB_PATH}/${query.length}-letter-words`,
          label: `All ${query.length} letter words`,
          count: totals.length[String(query.length)],
          key: `l-${query.length}`,
        },
      ].filter((link) => Number.isFinite(link.count)),
    });
  }

  if (query.kind === "ending") {
    // A suffix family: -ing and -ng, -ion and -tion and -ation. One is a tail
    // of the other, which is exactly the relationship a reader wants next.
    const family = manifest.suffixes
      .filter(
        (suffix) =>
          suffix !== query.suffix &&
          (suffix.endsWith(query.suffix) || query.suffix.endsWith(suffix)),
      )
      .map((suffix) => ({
        href: `${HUB_PATH}/ending-in-${suffix}`,
        label: `-${suffix}`,
        count: totals.ending[suffix],
        key: suffix,
      }))
      .sort((a, b) => b.count - a.count);

    if (family.length) {
      sections.push({
        title: `Endings related to -${query.suffix}`,
        blurb: "Longer and shorter forms of the same tail, each with its own list.",
        links: family,
      });
    }

    const familyKeys = new Set(family.map((link) => link.key));
    sections.push({
      title: "The biggest endings",
      links: manifest.suffixes
        .filter((suffix) => suffix !== query.suffix && !familyKeys.has(suffix))
        .map((suffix) => ({
          href: `${HUB_PATH}/ending-in-${suffix}`,
          label: `-${suffix}`,
          count: totals.ending[suffix],
          key: suffix,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 30),
    });
  }

  if (query.kind === "containing") {
    const chars = new Set(query.letters.split(""));
    sections.push({
      title: `Patterns sharing a letter with ${query.letters.toUpperCase()}`,
      blurb: "Other letters and pairs that appear anywhere in a word.",
      links: manifest.containing
        .filter(
          (letters) =>
            letters !== query.letters && [...letters].some((character) => chars.has(character)),
        )
        .map((letters) => ({
          href: `${HUB_PATH}/containing-${letters}`,
          label: letters,
          count: totals.containing[letters],
          key: letters,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 30),
    });

    const positional = [];
    const firstLetter = query.letters[0];
    if (Number.isFinite(totals.starting[firstLetter])) {
      positional.push({
        href: `${HUB_PATH}/starting-with-${firstLetter}`,
        label: `Starting with ${firstLetter.toUpperCase()}`,
        count: totals.starting[firstLetter],
        key: `s-${firstLetter}`,
      });
    }
    if (Number.isFinite(totals.ending[query.letters])) {
      positional.push({
        href: `${HUB_PATH}/ending-in-${query.letters}`,
        label: `Ending in -${query.letters}`,
        count: totals.ending[query.letters],
        key: `e-${query.letters}`,
      });
    }
    if (positional.length) {
      sections.push({
        title: "Fix the position instead",
        blurb: "Same letters, but pinned to the start or the end of the word.",
        links: positional,
      });
    }
  }

  return sections.filter((section) => section.links.length > 0);
}
