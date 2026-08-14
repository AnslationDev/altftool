import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { COMMONNESS, LETTERS, POS_BY_KEY, normalizePos } from "@altftool/core/lexicon";
import { browseLetter, getManifest } from "@altftool/core/lexicon/corpus";
import {
  AnswerFirst,
  Breadcrumb,
  Pagination,
  SectionHeading,
  WordCardGrid,
} from "../../_components/WordAtoms";

export const revalidate = 86400;

const PER_PAGE = 60;

/** 26 letters plus the numerals-and-symbols bucket. The set is closed, so every
    page is pre-rendered and anything else is a 404 rather than a slow miss. */
const ALL_LETTERS = [...LETTERS, "0"];

export function generateStaticParams() {
  return ALL_LETTERS.map((letter) => ({ letter }));
}

const letterTitle = (letter) =>
  letter === "0" ? "a digit or symbol" : letter.toUpperCase();

/* ------------------------------------------------------------------ *
 * Filters
 *
 * Three narrow dimensions, all of them properties already carried on the
 * compact index row, so filtering costs one pass over an array we had to read
 * anyway. Anything richer belongs on a collection page where the rule can be
 * written down.
 * ------------------------------------------------------------------ */

function readFilters(params) {
  const pos = normalizePos(String(params?.pos || "").toLowerCase());
  const syllables = Number.parseInt(params?.syllables ?? "", 10);
  const commonness = Number.parseInt(params?.commonness ?? "", 10);

  return {
    pos: POS_BY_KEY[pos] ? pos : null,
    syllables: syllables >= 1 && syllables <= 13 ? syllables : null,
    commonness: commonness >= 1 && commonness <= 5 ? commonness : null,
  };
}

function buildFilter(filters) {
  if (!filters.pos && !filters.syllables && !filters.commonness) return undefined;
  return (row) => {
    if (filters.pos && !(row.p || "").includes(filters.pos)) return false;
    if (filters.syllables && row.y !== filters.syllables) return false;
    if (filters.commonness && row.c !== filters.commonness) return false;
    return true;
  };
}

/** The querystring for the active filters, minus `page`. */
function filterQuery(filters, { drop } = {}) {
  const parts = [];
  if (filters.pos && drop !== "pos") parts.push(`pos=${filters.pos}`);
  if (filters.syllables && drop !== "syllables") parts.push(`syllables=${filters.syllables}`);
  if (filters.commonness && drop !== "commonness") parts.push(`commonness=${filters.commonness}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

/** "nouns", "3-syllable words", "Core-band words" — used in prose and in metadata. */
function filterPhrases(filters) {
  const phrases = [];
  if (filters.pos) phrases.push(POS_BY_KEY[filters.pos].plural);
  if (filters.syllables) {
    phrases.push(`${filters.syllables}-syllable ${filters.pos ? "" : "words"}`.trim());
  }
  if (filters.commonness) {
    const band = COMMONNESS.find((entry) => entry.band === filters.commonness);
    phrases.push(`words in the ${band.label.toLowerCase()} band`);
  }
  return phrases;
}

function describeSelection(letter, filters) {
  const phrases = filterPhrases(filters);
  const noun = phrases.length ? phrases.join(", ") : "words";
  return letter === "0"
    ? `${noun} beginning with a digit or symbol`
    : `${noun} starting with ${letter.toUpperCase()}`;
}

/* ------------------------------------------------------------------ *
 * Metadata
 * ------------------------------------------------------------------ */

export async function generateMetadata({ params, searchParams }) {
  const { letter } = await params;
  const query = await searchParams;

  if (!ALL_LETTERS.includes(letter)) {
    return createPageMetadata({
      title: "Letter not found",
      description: "AltF Lexicon browses A–Z plus one bucket for digits and symbols.",
      path: `/lexicon/browse/${letter}`,
      noindex: true,
    });
  }

  const filters = readFilters(query);
  const page = Math.max(1, Number.parseInt(query?.page ?? "1", 10) || 1);
  const { total } = await browseLetter(letter, {
    page,
    perPage: PER_PAGE,
    filter: buildFilter(filters),
  });

  const selection = describeSelection(letter, filters);
  const capitalised = selection.charAt(0).toUpperCase() + selection.slice(1);
  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  /* Page 2 and beyond are indexed like any other page, so the title and the
     description have to carry the page number — two pages of the same letter
     with identical metadata are a duplicate, not a paginated set. */
  const pageSuffix = page > 1 ? ` — page ${page} of ${lastPage}` : "";

  return createPageMetadata({
    title: `${capitalised}${pageSuffix}`,
    description:
      page > 1
        ? `Page ${page} of ${lastPage}: ${total.toLocaleString("en-US")} ${selection} in AltF Lexicon, ${PER_PAGE} per page with definitions, syllables and how common each word is.`
        : `All ${total.toLocaleString("en-US")} ${selection}, with the first definition, the syllable count and a commonness band on every entry.`,
    path: `/lexicon/browse/${letter}`,
    keywords: [
      `words starting with ${letterTitle(letter)}`,
      `${letterTitle(letter)} words`,
      `dictionary ${letterTitle(letter)}`,
      "English word list",
    ],
  });
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

export default async function BrowseLetterPage({ params, searchParams }) {
  const { letter } = await params;
  if (!ALL_LETTERS.includes(letter)) notFound();

  const query = await searchParams;
  const filters = readFilters(query);
  const page = Math.max(1, Number.parseInt(query?.page ?? "1", 10) || 1);

  const [manifest, result] = await Promise.all([
    getManifest(),
    browseLetter(letter, { page, perPage: PER_PAGE, filter: buildFilter(filters) }),
  ]);

  const { rows, total } = result;
  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));
  if (total > 0 && page > lastPage) notFound();

  const baseQuery = filterQuery(filters);
  const basePath = `/lexicon/browse/${letter}`;
  const letterCount = manifest.letters[letter] || 0;
  const selection = describeSelection(letter, filters);
  const hasFilters = Boolean(filters.pos || filters.syllables || filters.commonness);

  const position = ALL_LETTERS.indexOf(letter);
  const previous = position > 0 ? ALL_LETTERS[position - 1] : null;
  const next = position < ALL_LETTERS.length - 1 ? ALL_LETTERS[position + 1] : null;

  const heading =
    letter === "0"
      ? "Entries starting with a digit or symbol"
      : `Words starting with ${letter.toUpperCase()}`;

  const chips = [
    filters.pos
      ? {
          key: "pos",
          label: POS_BY_KEY[filters.pos].plural,
          href: `${basePath}${filterQuery(filters, { drop: "pos" })}`,
        }
      : null,
    filters.syllables
      ? {
          key: "syllables",
          label: `${filters.syllables} ${filters.syllables === 1 ? "syllable" : "syllables"}`,
          href: `${basePath}${filterQuery(filters, { drop: "syllables" })}`,
        }
      : null,
    filters.commonness
      ? {
          key: "commonness",
          label: `${COMMONNESS.find((entry) => entry.band === filters.commonness).label} band`,
          href: `${basePath}${filterQuery(filters, { drop: "commonness" })}`,
        }
      : null,
  ].filter(Boolean);

  const answer =
    total === 0
      ? `AltF Lexicon has no ${selection}. The letter itself holds ${letterCount.toLocaleString(
          "en-US",
        )} entries — clear the filter to see them.`
      : `AltF Lexicon lists ${total.toLocaleString("en-US")} ${selection}${
          hasFilters ? ` out of ${letterCount.toLocaleString("en-US")} entries under the letter` : ""
        }. They are shown ${PER_PAGE} to a page in dictionary order, each with its first definition, its syllable count and how common the word is.`;

  return (
    <>
      <JsonLd
        id={`altf-lexicon-browse-${letter}`}
        data={[
          createCollectionPageJsonLd({
            path: basePath,
            name: heading,
            description: answer,
          }),
          /* Only the first page carries an ItemList. Repeating a differently
             ordered list on every page of a paginated set tells a crawler the
             pages are alternatives to each other, which they are not. */
          page === 1 && !hasFilters
            ? createItemListJsonLd({
                path: basePath,
                name: heading,
                items: rows.slice(0, 30).map((row) => ({
                  name: row.w,
                  path: `/lexicon/word/${row.s}`,
                })),
              })
            : null,
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Browse", path: "/lexicon/browse" },
            { name: letterTitle(letter), path: basePath },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Breadcrumb
          items={[
            { name: "Lexicon", path: "/lexicon" },
            { name: "Browse", path: "/lexicon/browse" },
            { name: letterTitle(letter) },
          ]}
        />

        <header className="pb-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span
              className="afl-tile shrink-0 text-3xl"
              style={{ width: "3.5rem" }}
              aria-hidden="true"
            >
              {letter === "0" ? "#" : letter}
            </span>
            <div className="min-w-0">
              <h1 className="text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold tracking-[-0.025em] text-foreground">
                {heading}
              </h1>
              <p className="mt-1.5 font-mono text-sm tabular-nums text-muted-foreground">
                {total.toLocaleString("en-US")} {total === 1 ? "entry" : "entries"}
                {page > 1 ? ` · page ${page} of ${lastPage.toLocaleString("en-US")}` : ""}
              </p>
            </div>
          </div>

          {chips.length > 0 ? (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
                Filtered
              </span>
              {chips.map((chip) => (
                <Link
                  key={chip.key}
                  href={chip.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface px-3 py-1 text-[0.8125rem] text-foreground no-underline transition hover:border-primary hover:text-primary"
                >
                  {chip.label}
                  <X className="h-3 w-3 opacity-60" aria-hidden="true" />
                  <span className="sr-only">Remove this filter</span>
                </Link>
              ))}
              {chips.length > 1 ? (
                <Link
                  href={basePath}
                  className="text-[0.8125rem] text-primary no-underline hover:underline"
                >
                  Clear all
                </Link>
              ) : null}
            </div>
          ) : null}

          <AnswerFirst>{answer}</AnswerFirst>
        </header>

        {/* ---------------- Letter sub-nav ---------------- */}
        <nav
          aria-label="Browse another letter"
          className="flex flex-wrap items-center gap-1.5 border-y border-border py-3"
        >
          {previous ? (
            <Link
              href={`/lexicon/browse/${previous}${baseQuery}`}
              className="mr-1 inline-flex items-center gap-1 text-xs text-muted-foreground no-underline hover:text-primary"
            >
              <ArrowLeft className="h-3 w-3" aria-hidden="true" />
              {letterTitle(previous)}
            </Link>
          ) : null}

          {ALL_LETTERS.map((candidate) => (
            <Link
              key={candidate}
              href={`/lexicon/browse/${candidate}${baseQuery}`}
              aria-current={candidate === letter ? "page" : undefined}
              className={`flex h-7 w-7 items-center justify-center rounded-sm font-mono text-xs uppercase no-underline transition ${
                candidate === letter
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-surface-soft hover:text-foreground"
              }`}
            >
              {candidate === "0" ? "#" : candidate}
            </Link>
          ))}

          {next ? (
            <Link
              href={`/lexicon/browse/${next}${baseQuery}`}
              className="ml-1 inline-flex items-center gap-1 text-xs text-muted-foreground no-underline hover:text-primary"
            >
              {letterTitle(next)}
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          ) : null}
        </nav>

        {/* ---------------- Rows ---------------- */}
        <div className="py-8">
          {rows.length > 0 ? (
            <WordCardGrid rows={rows} />
          ) : (
            <div className="rounded-lg border border-border bg-surface-soft p-6">
              <p className="text-[0.9375rem] text-foreground">
                Nothing under {letterTitle(letter)} matches that combination of filters.
              </p>
              <p className="mt-2 text-[0.9375rem] text-muted-foreground">
                {letterCount.toLocaleString("en-US")} entries are filed under this letter in total.{" "}
                <Link href={basePath} className="text-primary hover:underline">
                  Clear the filters
                </Link>{" "}
                or{" "}
                <Link href="/lexicon/browse" className="text-primary hover:underline">
                  start again from the A–Z
                </Link>
                .
              </p>
            </div>
          )}
        </div>

        <Pagination
          page={page}
          total={total}
          perPage={PER_PAGE}
          basePath={basePath}
          query={baseQuery}
        />

        {/* ---------------- Narrow it down ---------------- */}
        <section className="border-t border-border py-10">
          <SectionHeading
            eyebrow="Narrow it down"
            title={`Other ways into ${letterTitle(letter)}`}
            description="Each of these applies on top of the current letter. The filter travels with you when you move to another letter in the strip above."
          />

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
                By word class
              </h3>
              <ul className="mt-3 flex flex-wrap gap-1.5" style={{ listStyle: "none" }}>
                {Object.values(POS_BY_KEY).map((pos) => (
                  <li key={pos.key}>
                    <Link
                      href={`${basePath}?pos=${pos.key}`}
                      className="rounded-sm border border-border bg-surface-soft px-2.5 py-1 font-mono text-xs no-underline transition hover:border-border-strong"
                      style={{ color: `var(${pos.cssVar})` }}
                    >
                      {pos.plural}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
                By syllable count
              </h3>
              <ul className="mt-3 flex flex-wrap gap-1.5" style={{ listStyle: "none" }}>
                {[1, 2, 3, 4, 5, 6, 7].map((count) => (
                  <li key={count}>
                    <Link
                      href={`${basePath}?syllables=${count}`}
                      className="rounded-sm border border-border bg-surface-soft px-2.5 py-1 font-mono text-xs text-muted-foreground no-underline transition hover:border-border-strong hover:text-foreground"
                    >
                      {count} syl
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
                By how common
              </h3>
              <ul className="mt-3 flex flex-wrap gap-1.5" style={{ listStyle: "none" }}>
                {COMMONNESS.map((band) => (
                  <li key={band.band}>
                    <Link
                      href={`${basePath}?commonness=${band.band}`}
                      className="rounded-sm border border-border bg-surface-soft px-2.5 py-1 font-mono text-xs text-muted-foreground no-underline transition hover:border-border-strong hover:text-foreground"
                    >
                      {band.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {letter !== "0" ? (
            <p className="mt-6 text-[0.8125rem] leading-relaxed text-muted-foreground">
              Looking for a pattern rather than a letter? Try{" "}
              <Link
                href={`/lexicon/words/starting-with-${letter}`}
                className="text-primary hover:underline"
              >
                the {letter.toUpperCase()} word list
              </Link>
              ,{" "}
              <Link href="/lexicon/words/5-letter-words" className="text-primary hover:underline">
                five-letter words
              </Link>{" "}
              or{" "}
              <Link href="/lexicon/collections" className="text-primary hover:underline">
                the {manifest.collections} collections
              </Link>
              .
            </p>
          ) : null}
        </section>
      </div>
    </>
  );
}
