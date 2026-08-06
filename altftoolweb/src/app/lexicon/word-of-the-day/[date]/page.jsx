import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createArticleJsonLd,
  createBreadcrumbJsonLd,
  createDefinedTermJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { POS_BY_KEY, normalizePos, posLabel, shortDefinition } from "@altftool/core/lexicon";
import { getFacets, getManifest, getWord } from "@altftool/core/lexicon/corpus";
import {
  AnswerFirst,
  Breadcrumb,
  CommonnessMeter,
  PosChips,
  SyllableLine,
  WordChips,
} from "../../_components/WordAtoms";
import {
  ARCHIVE_START,
  PRERENDER_DAYS,
  answerSentence,
  editorialNote,
  entriesForDateKeys,
  formatDateKey,
  isPublishedKey,
  parseDateKey,
  recentDateKeys,
  rotationFor,
  shiftDateKey,
  todayKey,
  wotdFaqs,
} from "../rotation";

export const revalidate = 86400;
export const dynamicParams = true;

const BASE = "/lexicon/word-of-the-day";

/*
 * Pre-render the last month. Everything older is derivable on demand from the
 * same pure function and is then cached by ISR, so the build stays a fixed
 * size however many years of archive accumulate — the alternative grows the
 * static output by 365 pages a year forever.
 */
export function generateStaticParams() {
  return recentDateKeys(todayKey(), PRERENDER_DAYS).map((date) => ({ date }));
}

/**
 * Resolve a URL segment to a day, or nothing.
 *
 * Rejects anything that is not a real `YYYY-MM-DD` date, anything before the
 * archive begins, and anything after today. The rotation would answer for all
 * of them; publishing them would not be honest about what this page is.
 */
async function load(dateParam) {
  if (!isPublishedKey(dateParam)) return null;

  const rotation = await rotationFor(dateParam);
  if (!rotation?.slug) return null;

  const [entry, manifest, facets] = await Promise.all([
    getWord(rotation.slug),
    getManifest(),
    getFacets(),
  ]);
  if (!entry) return null;

  const today = todayKey();
  const previous = shiftDateKey(dateParam, -1);
  const next = shiftDateKey(dateParam, 1);

  return {
    key: dateParam,
    rotation,
    entry,
    manifest,
    facets,
    isToday: dateParam === today,
    previousKey: previous && previous >= ARCHIVE_START ? previous : null,
    nextKey: next && next <= today ? next : null,
  };
}

/* ------------------------------------------------------------------ *
 * Metadata
 * ------------------------------------------------------------------ */

export async function generateMetadata({ params }) {
  const { date } = await params;
  const loaded = await load(date);

  if (!loaded) {
    return createPageMetadata({
      title: "No word of the day for that date",
      description:
        "The AltF Lexicon word-of-the-day archive covers every day from the launch of the dictionary up to today.",
      path: `${BASE}/${date}`,
      noindex: true,
    });
  }

  const { entry, key } = loaded;
  const label = formatDateKey(key);

  return createPageMetadata({
    title: `Word of the day, ${label} — ${entry.w}`,
    description: `${entry.w} was the AltF Lexicon word of the day on ${label}: ${shortDefinition(
      entry.sn[0].g,
      100,
    )} Syllables, pronunciation, senses and synonyms.`,
    path: `${BASE}/${key}`,
    keywords: [
      `word of the day ${label}`,
      "word of the day archive",
      "past word of the day",
      `${entry.w} meaning`,
      `${entry.w} pronunciation`,
    ],
  });
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

export default async function DatedWordOfTheDayPage({ params }) {
  const { date } = await params;
  const loaded = await load(date);
  if (!loaded) notFound();

  const { key, rotation, entry, manifest, facets, isToday, previousKey, nextKey } = loaded;

  const faqs = wotdFaqs(entry, rotation);
  const answer = answerSentence(entry, key);
  const notes = editorialNote(entry, { manifest, facets });
  const first = entry.sn[0];
  const label = formatDateKey(key);
  const path = `${BASE}/${key}`;

  // The week before this day, so a reader who arrives on a dated page can walk
  // the run without going back to the hub first.
  const nearby = (await entriesForDateKeys(recentDateKeys(key, 8))).filter(
    (day) => day.entry && day.key !== key,
  );

  return (
    <>
      <JsonLd
        id={`altf-lexicon-wotd-${key}`}
        data={[
          createArticleJsonLd({
            path,
            headline: `Word of the day, ${label}: ${entry.w}`,
            description: answer,
            datePublished: key,
            dateModified: key,
            author: "AltF Lexicon",
          }),
          createDefinedTermJsonLd({
            path,
            name: entry.w,
            description: first.g,
            setPath: "/lexicon",
            setName: "AltF Lexicon",
            termCode: entry.w,
            partOfSpeech: entry.p.map(posLabel).join(", "),
          }),
          createFaqJsonLd({ path, questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Word of the day", path: BASE },
            { name: label, path },
          ]),
        ]}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Breadcrumb
          items={[
            { name: "Lexicon", path: "/lexicon" },
            { name: "Word of the day", path: BASE },
            { name: formatDateKey(key, { short: true }) },
          ]}
        />

        {/* ---------------- Prev / next ---------------- */}
        <nav
          aria-label="Adjacent days"
          className="flex items-center justify-between gap-4 border-b border-border pb-5"
        >
          {previousKey ? (
            <Link
              href={`${BASE}/${previousKey}`}
              className="inline-flex items-center gap-1.5 text-sm text-primary no-underline hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDateKey(previousKey, { short: true })}
            </Link>
          ) : (
            <span className="font-mono text-xs text-muted-foreground">
              start of the archive
            </span>
          )}

          <Link
            href={BASE}
            className="font-mono text-xs text-muted-foreground no-underline hover:text-primary"
          >
            all days
          </Link>

          {nextKey ? (
            <Link
              href={`${BASE}/${nextKey}`}
              className="inline-flex items-center gap-1.5 text-sm text-primary no-underline hover:underline"
            >
              {formatDateKey(nextKey, { short: true })}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ) : (
            <span className="font-mono text-xs text-muted-foreground">today is the latest</span>
          )}
        </nav>

        {/* ---------------- Headword ---------------- */}
        <header className="border-b border-border py-8">
          <span className="inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            {isToday ? "Today · " : ""}
            {label}
          </span>

          <h1 className="afl-headword mt-4 text-[clamp(2.5rem,8vw,5rem)] leading-[1.05] text-foreground">
            <Link
              href={`/lexicon/word/${entry.s}`}
              className="text-foreground no-underline hover:text-primary"
            >
              {entry.w}
            </Link>
          </h1>

          {entry.pt?.length ? (
            <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2 [&_.afl-syllables]:text-[clamp(1.25rem,3.4vw,1.875rem)]">
              <SyllableLine parts={entry.pt} stress={entry.st} size="lg" />
              {entry.ip ? (
                <span className="font-mono text-[1.0625rem] text-muted-foreground">/{entry.ip}/</span>
              ) : null}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
            {entry.rs ? (
              <p className="font-mono text-sm text-muted-foreground">
                say it: <span className="text-foreground">{entry.rs}</span>
              </p>
            ) : null}
            <CommonnessMeter band={entry.c} />
            <PosChips parts={entry.p} />
          </div>

          <AnswerFirst>{answer}</AnswerFirst>
        </header>

        {/* ---------------- The first sense ---------------- */}
        <section className="py-8">
          <div className="flex flex-wrap items-baseline gap-3 border-b border-border pb-3">
            <h2 className="afl-headword text-2xl text-foreground">
              <span style={{ color: `var(${POS_BY_KEY[normalizePos(first.p)]?.cssVar})` }}>
                {posLabel(first.p)}
              </span>
            </h2>
            <span className="font-mono text-xs text-muted-foreground">sense 1 of {entry.ns}</span>
          </div>

          <p className="afl-sense__gloss mt-4">{first.g}</p>

          {first.ex?.map((example) => (
            <p key={example} className="afl-sense__example">
              &ldquo;{example}&rdquo;
            </p>
          ))}

          {first.sy?.length ? (
            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-2">
              <span
                className="shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.06em]"
                style={{ color: "var(--afl-verb)" }}
              >
                Synonyms
              </span>
              <WordChips words={first.sy} limit={16} />
            </div>
          ) : null}

          {entry.ns > 1 ? (
            <p className="mt-6 rounded-lg border border-border bg-surface-soft p-4 text-sm leading-relaxed text-muted-foreground">
              {entry.w} carries {entry.ns} recorded senses in total.{" "}
              <Link href={`/lexicon/word/${entry.s}`} className="text-primary hover:underline">
                Open the full entry
              </Link>{" "}
              to read them all, grouped by part of speech and each with its own synonyms, antonyms
              and broader and narrower terms.
            </p>
          ) : null}
        </section>

        {/* ---------------- The note ---------------- */}
        <section className="border-t border-border py-8">
          <h2 className="text-[1.375rem] font-semibold tracking-tight text-foreground">
            About {entry.w}
          </h2>
          <div className="mt-4 space-y-3">
            {notes.map((note) => (
              <p
                key={note}
                className="max-w-[68ch] text-[0.9375rem] leading-relaxed text-muted-foreground"
              >
                {note}
              </p>
            ))}
          </div>
          <p className="mt-4 max-w-[68ch] text-xs leading-relaxed text-muted-foreground">
            Every sentence above is derived from the entry&rsquo;s stored record. Nothing here is a
            story about where the word came from, because the corpus does not carry etymology and a
            plausible invented one would be the only unverifiable claim on the page.
          </p>
        </section>

        {/* ---------------- Why this word ---------------- */}
        <section className="border-t border-border py-8">
          <h2 className="text-[1.375rem] font-semibold tracking-tight text-foreground">
            Why {entry.w} on this date
          </h2>
          <p className="mt-4 max-w-[68ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
            {label} is day {rotation.index + 1} of its year, and slot {rotation.index + 1} of the{" "}
            {rotation.length}-word rotation holds {entry.w}. The mapping is arithmetic on the date
            and nothing else, so this page said the same thing a year ago and will say it a year
            from now, and every other day in the archive resolves the same way.{" "}
            <Link href={BASE} className="text-primary hover:underline">
              How the rotation works, in full
            </Link>
            .
          </p>
        </section>

        {/* ---------------- Nearby days ---------------- */}
        {nearby.length > 0 ? (
          <section className="border-t border-border py-8">
            <h2 className="text-[1.375rem] font-semibold tracking-tight text-foreground">
              The week before
            </h2>
            <ul className="afl-divide mt-3" style={{ listStyle: "none" }}>
              {nearby.map((day) => (
                <li key={day.key}>
                  <Link
                    href={`${BASE}/${day.key}`}
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5 no-underline sm:flex-nowrap"
                  >
                    <span className="w-11 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                      {parseDateKey(day.key).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        timeZone: "UTC",
                      })}
                    </span>
                    <span className="afl-headword shrink-0 text-[1.0625rem] text-foreground">
                      {day.entry.w}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-muted-foreground">
                      {day.entry.sn[0].g}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ---------------- FAQ ---------------- */}
        <section className="border-t border-border py-8">
          <h2 className="text-[1.375rem] font-semibold tracking-tight text-foreground">Questions</h2>
          <dl className="afl-divide mt-2 max-w-[72ch]">
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

        <p className="border-t border-border py-8 text-xs leading-relaxed text-muted-foreground">
          Definitions, examples and semantic relations come from Princeton University&rsquo;s
          WordNet.{" "}
          {entry.ip ? "The pronunciation comes from the CMU Pronouncing Dictionary. " : ""}
          Commonness is measured against a corpus of everyday English.{" "}
          <Link href="/lexicon/sources" className="text-primary hover:underline">
            Full sources and licences
          </Link>
          .
        </p>
      </div>
    </>
  );
}
