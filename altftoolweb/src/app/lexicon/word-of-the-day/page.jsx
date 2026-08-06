import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
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
  StatStrip,
  SyllableLine,
  WordChips,
} from "../_components/WordAtoms";
import {
  ARCHIVE_DAYS,
  ARCHIVE_START,
  answerSentence,
  editorialNote,
  entriesForDateKeys,
  formatDateKey,
  parseDateKey,
  recentDateKeys,
  rotationFor,
  todayKey,
  wotdFaqs,
} from "./rotation";

export const revalidate = 86400;

const PATH = "/lexicon/word-of-the-day";

/* ------------------------------------------------------------------ *
 * Data
 * ------------------------------------------------------------------ */

async function load() {
  const key = todayKey();
  const rotation = await rotationFor(key);

  const [entry, manifest, facets] = await Promise.all([
    getWord(rotation.slug),
    getManifest(),
    getFacets(),
  ]);

  // Today is listed first in the archive as well as rendered in full above it,
  // because the permalink for today's word is the one a reader wants to share.
  const archive = await entriesForDateKeys(recentDateKeys(key, ARCHIVE_DAYS));

  return { key, rotation, entry, manifest, facets, archive };
}

/* ------------------------------------------------------------------ *
 * Metadata
 * ------------------------------------------------------------------ */

export async function generateMetadata() {
  const key = todayKey();
  const rotation = await rotationFor(key);
  const entry = await getWord(rotation.slug);

  if (!entry) {
    return createPageMetadata({
      title: "Word of the day",
      description: "A new English word every day, with its syllables split and its stress marked.",
      path: PATH,
    });
  }

  return createPageMetadata({
    title: `Word of the day — ${entry.w}`,
    description: `Today's word is ${entry.w}: ${shortDefinition(
      entry.sn[0].g,
      110,
    )} With its syllables, pronunciation and senses, plus every previous day's word on its own dated page.`,
    path: PATH,
    keywords: [
      "word of the day",
      "word of the day today",
      "daily word",
      "word of the day archive",
      `${entry.w} meaning`,
    ],
  });
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

export default async function WordOfTheDayPage() {
  const { key, rotation, entry, manifest, facets, archive } = await load();

  const faqs = wotdFaqs(entry, rotation);
  const answer = answerSentence(entry, key);
  const notes = editorialNote(entry, { manifest, facets });
  const first = entry.sn[0];

  const startDate = parseDateKey(ARCHIVE_START);
  const published =
    Math.floor((parseDateKey(key).getTime() - startDate.getTime()) / 86_400_000) + 1;

  // Group the archive by month so four months of dates read as a calendar
  // rather than as one 120-item wall.
  const months = [];
  for (const day of archive) {
    if (!day.entry) continue;
    const label = parseDateKey(day.key).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    let group = months.find((candidate) => candidate.label === label);
    if (!group) {
      group = { label, days: [] };
      months.push(group);
    }
    group.days.push(day);
  }

  return (
    <>
      <JsonLd
        id="altf-lexicon-wotd"
        data={[
          createArticleJsonLd({
            path: PATH,
            headline: `Word of the day: ${entry.w}`,
            description: answer,
            datePublished: key,
            dateModified: key,
            author: "AltF Lexicon",
          }),
          createDefinedTermJsonLd({
            path: PATH,
            name: entry.w,
            description: first.g,
            setPath: "/lexicon",
            setName: "AltF Lexicon",
            termCode: entry.w,
            partOfSpeech: entry.p.map(posLabel).join(", "),
          }),
          createFaqJsonLd({ path: PATH, questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Word of the day", path: PATH },
          ]),
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Breadcrumb items={[{ name: "Lexicon", path: "/lexicon" }, { name: "Word of the day" }]} />

        {/* ---------------- Today ---------------- */}
        <header className="border-b border-border pb-8">
          <span className="inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            Word of the day · {formatDateKey(key)}
          </span>

          <h1 className="afl-headword mt-4 text-[clamp(2.75rem,9vw,5.5rem)] leading-[1.05] text-foreground">
            <Link href={`/lexicon/word/${entry.s}`} className="text-foreground no-underline hover:text-primary">
              {entry.w}
            </Link>
          </h1>

          {entry.pt?.length ? (
            <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2 [&_.afl-syllables]:text-[clamp(1.25rem,3.4vw,2rem)]">
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

        <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-14">
          <main>
            {/* ---------------- The first sense, in full ---------------- */}
            <section>
              <div className="flex flex-wrap items-baseline gap-3 border-b border-border pb-3">
                <h2 className="afl-headword text-2xl text-foreground">
                  <span style={{ color: `var(${POS_BY_KEY[normalizePos(first.p)]?.cssVar})` }}>
                    {posLabel(first.p)}
                  </span>
                </h2>
                <span className="font-mono text-xs text-muted-foreground">
                  sense 1 of {entry.ns}
                </span>
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
              ) : (
                <p className="mt-5 text-sm text-muted-foreground">
                  WordNet records no synonym for this sense. That is normal for a precise word: the
                  more exactly a sense is drawn, the fewer other words land on it.
                </p>
              )}

              {entry.ns > 1 ? (
                <p className="mt-6 rounded-lg border border-border bg-surface-soft p-4 text-sm leading-relaxed text-muted-foreground">
                  This is the first of {entry.ns} recorded senses.{" "}
                  <Link href={`/lexicon/word/${entry.s}`} className="text-primary hover:underline">
                    The full entry for {entry.w}
                  </Link>{" "}
                  lists all of them, grouped by part of speech, each with its own synonyms,
                  antonyms and broader and narrower terms.
                </p>
              ) : null}
            </section>

            {/* ---------------- The note ---------------- */}
            <section className="mt-10">
              <h2 className="border-b border-border pb-3 text-xl font-semibold tracking-[-0.02em] text-foreground">
                About {entry.w}
              </h2>
              <div className="mt-4 space-y-3">
                {notes.map((note) => (
                  <p key={note} className="max-w-[68ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
                    {note}
                  </p>
                ))}
              </div>
              <p className="mt-4 max-w-[68ch] text-xs leading-relaxed text-muted-foreground">
                Everything in this note is read off the entry&rsquo;s own record — its syllable
                split, its sense count, the WordNet file its first sense sits in, and its measured
                frequency band. There is no etymology here because the corpus carries none, and an
                invented derivation is the one claim a reader could not check.
              </p>
            </section>

            {/* ---------------- How the rotation works ---------------- */}
            <section className="mt-10">
              <h2 className="border-b border-border pb-3 text-xl font-semibold tracking-[-0.02em] text-foreground">
                How the rotation works
              </h2>
              <div className="mt-4 max-w-[68ch] space-y-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
                <p>
                  The rotation is a fixed list of {rotation.length} words, one for every day of the
                  longest possible year. A date is turned into its position in that year —{" "}
                  {formatDateKey(key)} is day {rotation.index + 1} — and the position picks the
                  word. That is the whole rule. Nothing is random, nothing is stored, and no editor
                  queues anything the night before.
                </p>
                <p>
                  Because the rule is arithmetic on the date, it runs backwards as happily as
                  forwards. Every day since {formatDateKey(ARCHIVE_START)} has a permanent page at
                  its own dated address, and they were all derivable before anyone asked for them.
                  A word of the day published at one evergreen URL, overwritten each morning, has
                  no history to link to at all.
                </p>
                <p>
                  Leap years are the reason the list is {rotation.length} long rather than 365. In a
                  leap year 29 February takes a slot of its own and every date after it moves one
                  place along; in a common year the last slot is never reached. Either way a given
                  date always resolves to the same word, which is the property the archive needs.
                </p>
                <p>
                  Dates in the future return a 404 rather than tomorrow&rsquo;s word. The answer is
                  knowable — it is the same arithmetic — but serving it would open an endless set of
                  dated pages running to the year 9999, none of which anyone would read.
                </p>
              </div>
            </section>

            {/* ---------------- Archive ---------------- */}
            <section className="mt-10">
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-3">
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
                  The last {archive.length} days
                </h2>
                <span className="font-mono text-xs text-muted-foreground">
                  every day since {formatDateKey(ARCHIVE_START, { short: true })}
                </span>
              </div>

              {months.map((month) => (
                <div key={month.label} className="mt-6">
                  <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground">
                    {month.label}
                  </h3>
                  <ul className="afl-divide mt-1" style={{ listStyle: "none" }}>
                    {month.days.map((day) => (
                      <li key={day.key}>
                        <Link
                          href={`${PATH}/${day.key}`}
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
                          {day.key === key ? (
                            <span className="shrink-0 rounded-sm border border-border bg-surface px-1.5 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.06em] text-primary">
                              today
                            </span>
                          ) : null}
                          <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-muted-foreground">
                            {day.entry.sn[0].g}
                          </span>
                          <span className="shrink-0 font-mono text-[0.6875rem] text-muted-foreground">
                            {day.entry.sy ? `${day.entry.sy} syl` : ""}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                This page lists the most recent {ARCHIVE_DAYS} days. Older days are still served —
                every date back to {formatDateKey(ARCHIVE_START, { short: true })} has a page, which
                is {published.toLocaleString("en-US")} of them so far — and each dated page carries
                links to the day before and the day after, so the whole run is walkable.
              </p>
            </section>

            {/* ---------------- FAQ ---------------- */}
            <section className="mt-10">
              <h2 className="border-b border-border pb-3 text-xl font-semibold tracking-[-0.02em] text-foreground">
                Questions
              </h2>
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

            <p className="mt-8 rounded-lg border border-border bg-surface-soft p-4 text-xs leading-relaxed text-muted-foreground">
              Definitions, examples and semantic relations come from Princeton University&rsquo;s
              WordNet.{" "}
              {entry.ip ? "The pronunciation comes from the CMU Pronouncing Dictionary. " : ""}
              Commonness is measured against a corpus of everyday English.{" "}
              <Link href="/lexicon/sources" className="text-primary hover:underline">
                Full sources and licences
              </Link>
              .
            </p>
          </main>

          {/* ---------------- Rail ---------------- */}
          <aside className="space-y-8">
            <section>
              <h2 className="mb-3 border-b border-border pb-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
                The rotation, counted
              </h2>
              <StatStrip
                stats={[
                  { value: rotation.length.toLocaleString("en-US"), label: "Words in the rotation" },
                  { value: `${rotation.index + 1}`, label: "Day of the year today" },
                  { value: published.toLocaleString("en-US"), label: "Dated pages published" },
                  {
                    value: manifest.total.toLocaleString("en-US"),
                    label: "Entries they are drawn from",
                  },
                ]}
              />
            </section>

            <section>
              <h2 className="mb-3 border-b border-border pb-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
                Where today&rsquo;s word sits
              </h2>
              <ul className="space-y-2 text-sm" style={{ listStyle: "none" }}>
                <RailLink href={`/lexicon/word/${entry.s}`} label={`Full entry for ${entry.w}`} />
                {entry.sy ? (
                  <RailLink
                    href={
                      entry.sy === 1
                        ? "/lexicon/collections/one-syllable"
                        : "/lexicon/collections/five-syllable-words"
                    }
                    label={entry.sy === 1 ? "One-syllable words" : "Words of five syllables or more"}
                  />
                ) : null}
                <RailLink
                  href={
                    entry.c >= 4 ? "/lexicon/collections/core-english" : "/lexicon/collections/advanced-vocabulary"
                  }
                  label={entry.c >= 4 ? "The core English vocabulary" : "Advanced vocabulary"}
                />
                {entry.ns >= 10 ? (
                  <RailLink
                    href="/lexicon/collections/words-with-many-meanings"
                    label="Words with the most meanings"
                  />
                ) : null}
                <RailLink href="/lexicon/collections" label="All 199 collections" />
              </ul>
            </section>

            <section>
              <h2 className="mb-3 border-b border-border pb-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
                Read the mechanics
              </h2>
              <ul className="space-y-2 text-sm" style={{ listStyle: "none" }}>
                <RailLink
                  href="/lexicon/learn/syllables-and-stress"
                  label="How syllables and stress work"
                />
                <RailLink
                  href="/lexicon/learn/reading-our-respelling"
                  label="Reading IPA without learning IPA"
                />
                <RailLink
                  href="/lexicon/learn/growing-your-vocabulary"
                  label="Growing your vocabulary"
                />
                <RailLink href="/lexicon/learn" label="All eight guides" />
              </ul>
            </section>

            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-sm leading-relaxed text-foreground">
                Every one of the {manifest.total.toLocaleString("en-US")} entries has its syllables
                split and its stressed syllable marked — not only the word of the day.
              </p>
              <Link
                href="/lexicon"
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary no-underline hover:underline"
              >
                Look up any word <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function RailLink({ href, label }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center justify-between gap-2 text-muted-foreground no-underline transition hover:text-primary"
      >
        <span>{label}</span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden="true" />
      </Link>
    </li>
  );
}
