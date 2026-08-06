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
import { LETTERS } from "@altftool/core/lexicon";
import { getManifest } from "@altftool/core/lexicon/corpus";
import { AnswerFirst, Breadcrumb, SectionHeading, StatStrip } from "../_components/WordAtoms";

export const revalidate = 86400;

/*
 * The word-list index.
 *
 * Every list the corpus generator produced is reachable from this one page.
 * That sounds obvious and is the thing the category consistently gets wrong:
 * rival dictionaries ship tens of thousands of pattern pages that exist only as
 * search landing pages, with no route from anywhere on the site to most of
 * them. A list nobody can browse to is a list a crawler finds once and a reader
 * never finds at all.
 *
 * All counts are read from the manifest rather than from the list files, so the
 * number on a card is the TRUE size of the list, not the capped row count of
 * the file behind it.
 */

const HUB_PATH = "/lexicon/words";

const description =
  "Every word list in AltF Lexicon: by starting letter, by length, by ending, by length and letter together, and by the letters a word contains. Each list is ranked by how often the word appears in everyday English.";

export async function generateMetadata() {
  const manifest = await getManifest();
  const listCount = countLists(manifest);

  return createPageMetadata({
    title: `Word lists — ${listCount} ways to slice ${manifest.words.toLocaleString("en-US")} words`,
    description,
    path: HUB_PATH,
    keywords: [
      "word lists",
      "words by length",
      "words starting with",
      "words ending in",
      "words containing",
      "5 letter words",
    ],
  });
}

function countLists(manifest) {
  const totals = manifest.listTotals;
  return (
    Object.keys(totals.starting).length +
    Object.keys(totals.length).length +
    Object.keys(totals.ending).length +
    Object.keys(totals.cross).length +
    Object.keys(totals.containing).length
  );
}

export default async function WordListsHubPage() {
  const manifest = await getManifest();
  const totals = manifest.listTotals;

  const letterLists = LETTERS.filter((letter) => totals.starting[letter] !== undefined).map(
    (letter) => ({
      key: letter,
      label: letter,
      count: totals.starting[letter],
      href: `${HUB_PATH}/starting-with-${letter}`,
    }),
  );

  const lengthLists = manifest.lengths
    .filter((length) => totals.length[String(length)] !== undefined)
    .map((length) => ({
      key: String(length),
      label: `${length} letters`,
      count: totals.length[String(length)],
      href: `${HUB_PATH}/${length}-letter-words`,
    }));

  // The cross lists are the biggest group and the most searched — "5 letter
  // words starting with T" is a query shape people type dozens of times a day
  // while playing a word game. Grouped by letter so a reader scans one row.
  const crossByLetter = LETTERS.map((letter) => ({
    letter,
    lists: manifest.lengths
      .filter((length) => totals.cross[`${length}-${letter}`] !== undefined)
      .map((length) => ({
        key: `${length}-${letter}`,
        label: String(length),
        count: totals.cross[`${length}-${letter}`],
        href: `${HUB_PATH}/${length}-letter-words-starting-with-${letter}`,
      })),
  })).filter((row) => row.lists.length > 0);

  const endingLists = manifest.suffixes
    .filter((suffix) => totals.ending[suffix] !== undefined)
    .map((suffix) => ({
      key: suffix,
      label: `-${suffix}`,
      count: totals.ending[suffix],
      href: `${HUB_PATH}/ending-in-${suffix}`,
    }))
    .sort((a, b) => b.count - a.count);

  const containingAll = manifest.containing
    .filter((letters) => totals.containing[letters] !== undefined)
    .map((letters) => ({
      key: letters,
      label: letters,
      count: totals.containing[letters],
      href: `${HUB_PATH}/containing-${letters}`,
    }));
  const containingSingle = containingAll.filter((row) => row.key.length === 1);
  const containingPairs = containingAll
    .filter((row) => row.key.length > 1)
    .sort((a, b) => b.count - a.count);

  const listCount = countLists(manifest);
  const crossCount = crossByLetter.reduce((sum, row) => sum + row.lists.length, 0);

  const faqs = [
    {
      question: "How are these word lists ordered?",
      answer:
        "Every list is ranked by commonness — how often the word appears in a large corpus of everyday English — and alphabetically within each band. So the words you already know sit at the top, and the specialist tail is at the bottom rather than scattered through the middle.",
    },
    {
      question: "Do the lists show every matching word?",
      answer: `Each list stores at most ${manifest.listCap.toLocaleString("en-US")} words. Where a list is bigger than that, the page says so and names the true total, and what you see is the ${manifest.listCap.toLocaleString("en-US")} most common matches rather than an arbitrary slice.`,
    },
    {
      question: "What counts as a word here?",
      answer: `The lists cover the ${manifest.words.toLocaleString("en-US")} single words in the corpus. The ${manifest.phrases.toLocaleString("en-US")} multi-word phrases and compounds are browsable by letter but are left out of the pattern lists, because "words starting with T" is not a question about "table tennis".`,
    },
    {
      question: "How many word lists are there?",
      answer: `${listCount} — ${letterLists.length} by starting letter, ${lengthLists.length} by length, ${crossCount} by length and letter together, ${endingLists.length} by ending and ${containingAll.length} by the letters a word contains. Every one of them is linked from this page.`,
    },
  ];

  return (
    <>
      <JsonLd
        id="altf-lexicon-word-lists"
        data={[
          createCollectionPageJsonLd({
            path: HUB_PATH,
            name: "AltF Lexicon word lists",
            description,
          }),
          createItemListJsonLd({
            path: HUB_PATH,
            name: "Word lists by pattern",
            items: [
              ...letterLists.map((row) => ({
                name: `Words starting with ${row.label.toUpperCase()}`,
                path: row.href,
              })),
              ...lengthLists.map((row) => ({
                name: `${row.key} letter words`,
                path: row.href,
              })),
              ...endingLists.slice(0, 40).map((row) => ({
                name: `Words ending in ${row.label}`,
                path: row.href,
              })),
            ],
          }),
          createFaqJsonLd({ path: HUB_PATH, questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Word lists", path: HUB_PATH },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Breadcrumb items={[{ name: "Lexicon", path: "/lexicon" }, { name: "Word lists" }]} />

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Every list, one page
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            Word lists
          </h1>

          <AnswerFirst>
            {`AltF Lexicon publishes ${listCount} word lists over ${manifest.words.toLocaleString("en-US")} single words: ${letterLists.length} by starting letter, ${lengthLists.length} by length, ${crossCount} by length and starting letter together, ${endingLists.length} by ending and ${containingAll.length} by the letters a word contains. Every list is ranked by how often the word appears in everyday English, and every one of them is linked below.`}
          </AnswerFirst>

          <StatStrip
            stats={[
              { value: listCount.toLocaleString("en-US"), label: "Word lists" },
              { value: manifest.words.toLocaleString("en-US"), label: "Single words indexed" },
              { value: `2–${Math.max(...manifest.lengths)}`, label: "Letters covered" },
              { value: manifest.listCap.toLocaleString("en-US"), label: "Rows stored per list" },
            ]}
          />
        </header>

        {/* ---------------- By starting letter ---------------- */}
        <section className="py-10">
          <SectionHeading
            eyebrow={`${letterLists.length} lists`}
            title="Words by starting letter"
            description="The A–Z, with the number of single words each letter carries. S is more than sixty times the size of X, which is the sort of thing you only see when the counts sit on the tiles."
          />
          <ul
            className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(3.75rem,1fr))] gap-2 sm:gap-2.5"
            style={{ listStyle: "none" }}
          >
            {letterLists.map((row) => (
              <li key={row.key}>
                <Link href={row.href} className="afl-tile text-xl sm:text-2xl">
                  {row.label}
                  <span className="afl-tile__count">{row.count.toLocaleString("en-US")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- By length ---------------- */}
        <section className="py-10">
          <SectionHeading
            eyebrow={`${lengthLists.length} lists`}
            title="Words by length"
            description="Two letters to fifteen. The distribution peaks at eight — English has more eight-letter words than words of any other length, and the curve falls away sharply either side of it."
          />
          <ul
            className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-2"
            style={{ listStyle: "none" }}
          >
            {lengthLists.map((row) => (
              <ListCard key={row.key} href={row.href} label={row.label} count={row.count} />
            ))}
          </ul>
        </section>

        {/* ---------------- Length × letter ---------------- */}
        <section className="py-10">
          <SectionHeading
            eyebrow={`${crossCount} lists`}
            title="Words by length and starting letter"
            description="The word-game grid. Pick a letter, then the length you need — the number under each tile is how many words match."
          />
          <div className="afl-divide mt-6">
            {crossByLetter.map((row) => (
              <div
                key={row.letter}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 sm:flex-nowrap sm:items-start"
              >
                <Link
                  href={`${HUB_PATH}/starting-with-${row.letter}`}
                  className="afl-headword w-10 shrink-0 text-2xl uppercase text-foreground no-underline hover:text-primary"
                >
                  {row.letter}
                </Link>
                <ul className="flex flex-wrap gap-1.5" style={{ listStyle: "none" }}>
                  {row.lists.map((list) => (
                    <li key={list.key}>
                      <Link
                        href={list.href}
                        title={`${list.label}-letter words starting with ${row.letter.toUpperCase()}`}
                        className="flex items-baseline gap-1.5 rounded-sm border border-border bg-surface-soft px-2 py-1 no-underline transition hover:border-border-strong hover:bg-surface"
                      >
                        <span className="font-mono text-[0.8125rem] font-semibold tabular-nums text-foreground">
                          {list.label}
                        </span>
                        <span className="font-mono text-[0.6875rem] tabular-nums text-muted-foreground">
                          {list.count.toLocaleString("en-US")}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- By ending ---------------- */}
        <section className="py-10">
          <SectionHeading
            eyebrow={`${endingLists.length} lists`}
            title="Words by ending"
            description="The suffixes that carry enough words to be worth a page of their own, largest first. Several are families — -ion, -tion and -ation each get their own list because each is a different question."
          />
          <ul
            className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-2"
            style={{ listStyle: "none" }}
          >
            {endingLists.map((row) => (
              <ListCard key={row.key} href={row.href} label={row.label} count={row.count} mono />
            ))}
          </ul>
        </section>

        {/* ---------------- By containing ---------------- */}
        <section className="py-10">
          <SectionHeading
            eyebrow={`${containingAll.length} lists`}
            title="Words containing a letter or pair"
            description="Anywhere in the word, not just at the start or end. Useful for crosswords and for anagram-shaped questions, where the letter you know is stuck in the middle."
          />

          <h3 className="mt-6 font-mono text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Single letters
          </h3>
          <ul
            className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2"
            style={{ listStyle: "none" }}
          >
            {containingSingle.map((row) => (
              <ListCard key={row.key} href={row.href} label={row.label} count={row.count} mono />
            ))}
          </ul>

          <h3 className="mt-8 font-mono text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Letter pairs
          </h3>
          <ul
            className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2"
            style={{ listStyle: "none" }}
          >
            {containingPairs.map((row) => (
              <ListCard key={row.key} href={row.href} label={row.label} count={row.count} mono />
            ))}
          </ul>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section className="border-t border-border py-10">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
            About these lists
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
            Word lists are computed from Princeton University&rsquo;s WordNet; commonness is
            measured against a corpus of everyday English.{" "}
            <Link href="/lexicon/sources" className="text-primary hover:underline">
              Full sources and licences
            </Link>
            .
          </p>

          <Link
            href="/lexicon"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-primary no-underline hover:underline"
          >
            Look up a single word instead{" "}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Local pieces
 * ------------------------------------------------------------------ */

function ListCard({ href, label, count, mono = false }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-baseline justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2 no-underline transition hover:border-border-strong hover:bg-surface-soft"
      >
        <span
          className={`truncate text-[0.9375rem] text-foreground ${mono ? "font-mono" : "font-medium"}`}
        >
          {label}
        </span>
        <span className="shrink-0 font-mono text-[0.6875rem] tabular-nums text-muted-foreground">
          {count.toLocaleString("en-US")}
        </span>
      </Link>
    </li>
  );
}
