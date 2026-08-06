import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createArticleJsonLd,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { getFacets, getManifest } from "@altftool/core/lexicon/corpus";
import { AnswerFirst, Breadcrumb } from "../../_components/WordAtoms";
import { GUIDES, buildFacts, fillFacts, findGuide, usedTokens } from "../guides";

export const revalidate = 86400;

const PUBLISHED = "2026-07-29";

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

/* ------------------------------------------------------------------ *
 * Fact resolution
 * ------------------------------------------------------------------ */

/**
 * Every string in a guide, resolved.
 *
 * Applied to the whole object rather than to selected fields, because a token
 * added to a heading, a list item, an FAQ question or an explore hint must not
 * depend on someone remembering to widen this call. Non-strings pass through
 * untouched, and `fillFacts` is a no-op on a string with no tokens.
 */
function resolveDeep(value, facts) {
  if (typeof value === "string") return fillFacts(value, facts);
  if (Array.isArray(value)) return value.map((item) => resolveDeep(item, facts));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, resolveDeep(item, facts)]),
    );
  }
  return value;
}

/*
 * The guard.
 *
 * `buildFacts` is the complete list of numbers a guide may assert. A token with
 * no fact behind it is a bug, and `fillFacts` deliberately leaves it in place
 * so the raw `{{token}}` reaches the page — an empty string would turn "carry
 * 47,627 syllable splits" into "carry syllable splits", which still reads as a
 * sentence and hides the failure. This makes the same fault visible above the
 * article as well, so it is caught without reading every paragraph.
 */
function missingTokens(facts) {
  return usedTokens().filter((token) => facts[token] === undefined);
}

async function loadFacts() {
  const [manifest, facets] = await Promise.all([getManifest(), getFacets()]);
  return buildFacts({ manifest, facets });
}

/* ------------------------------------------------------------------ *
 * Metadata
 * ------------------------------------------------------------------ */

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = findGuide(slug);

  if (!guide) {
    return createPageMetadata({
      title: "Guide not found",
      description: "That guide does not exist in AltF Lexicon.",
      path: `/lexicon/learn/${slug}`,
      noindex: true,
    });
  }

  // Titles and summaries cite the corpus too, so metadata is filled from the
  // same facts as the body. A search result must not quote a stale number.
  const facts = await loadFacts();

  return createPageMetadata({
    title: fillFacts(guide.title, facts),
    description: fillFacts(guide.summary, facts),
    path: `/lexicon/learn/${guide.slug}`,
    keywords: guide.keywords,
    type: "article",
    publishedTime: PUBLISHED,
    modifiedTime: guide.updated,
  });
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

export default async function LexiconGuidePage({ params }) {
  const { slug } = await params;
  const raw = findGuide(slug);
  if (!raw) notFound();

  const facts = await loadFacts();
  const missing = missingTokens(facts);

  if (missing.length > 0) {
    console.warn(
      `[lexicon/learn/${slug}] ${missing.length} guide token(s) have no fact in buildFacts and will render raw: ${missing.join(", ")}`,
    );
  }

  const guide = resolveDeep(raw, facts);
  const path = `/lexicon/learn/${guide.slug}`;

  const related = (raw.related ?? [])
    .map(findGuide)
    .filter(Boolean)
    .map((entry) => resolveDeep(entry, facts));

  const explore = guide.explore ?? [];
  const collectionLinks = explore.filter((link) => link.href.startsWith("/lexicon/collections/"));
  const wordLinks = explore.filter((link) => link.href.startsWith("/lexicon/word/"));

  return (
    <>
      <JsonLd
        id={`altf-lexicon-guide-${guide.slug}`}
        data={[
          createArticleJsonLd({
            path,
            headline: guide.title,
            description: guide.summary,
            datePublished: PUBLISHED,
            dateModified: guide.updated,
            author: "AltF Lexicon",
          }),
          createFaqJsonLd({ path, questions: guide.faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Learn", path: "/lexicon/learn" },
            { name: guide.title, path },
          ]),
        ]}
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Breadcrumb
          items={[
            { name: "Lexicon", path: "/lexicon" },
            { name: "Learn", path: "/lexicon/learn" },
            { name: guide.title },
          ]}
        />

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Guide
          </span>
          <h1 className="mt-3 max-w-[24ch] text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-foreground">
            {guide.title}
          </h1>
          <p className="mt-4 max-w-[62ch] text-[clamp(1rem,1.3vw,1.0625rem)] leading-relaxed text-muted-foreground">
            {guide.summary}
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
            <span>{guide.readingTime} min read</span>
            <span aria-hidden="true" className="opacity-40">
              /
            </span>
            <span>
              Updated <time dateTime={guide.updated}>{guide.updated}</time>
            </span>
          </p>
        </header>

        {missing.length > 0 ? (
          <p
            role="alert"
            className="mt-8 rounded-lg border border-border-strong bg-surface-soft p-5 text-[0.9375rem] leading-relaxed text-foreground"
          >
            <strong className="font-semibold">Unresolved guide tokens.</strong> {missing.length}{" "}
            placeholder{missing.length === 1 ? "" : "s"} used in the guides ha
            {missing.length === 1 ? "s" : "ve"} no matching fact in{" "}
            <code className="font-mono text-[0.8125rem]">buildFacts</code>, so any occurrence below
            renders as raw <code className="font-mono text-[0.8125rem]">{"{{token}}"}</code> rather
            than disappearing:{" "}
            <code className="font-mono text-[0.8125rem]">{missing.join(", ")}</code>.
          </p>
        ) : null}

        <article className="pb-4">
          <AnswerFirst>{guide.answer}</AnswerFirst>

          {guide.sections.map((section) => (
            <section key={section.heading} className="border-b border-border py-9">
              <h2 className="max-w-[38ch] text-[clamp(1.25rem,2.2vw,1.5rem)] font-semibold leading-snug tracking-[-0.02em] text-foreground">
                {section.heading}
              </h2>

              {(section.body ?? []).map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-4 max-w-[68ch] text-[1.0625rem] leading-[1.75] text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}

              {section.list ? (
                <ul className="mt-5 max-w-[68ch] space-y-3" style={{ listStyle: "none" }}>
                  {section.list.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-[1.0625rem] leading-[1.7] text-muted-foreground"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {section.table ? (
                <div className="mt-6 overflow-x-auto rounded-lg border border-border">
                  <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                    <caption className="sr-only">{section.table.caption}</caption>
                    <thead>
                      <tr className="bg-surface-soft">
                        {section.table.head.map((heading) => (
                          <th
                            key={heading}
                            scope="col"
                            className="whitespace-nowrap px-3.5 py-3 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted-foreground"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row) => (
                        <tr key={row[0]} className="border-t border-border align-top">
                          <th
                            scope="row"
                            className="px-3.5 py-3 text-left font-medium text-foreground"
                          >
                            {row[0]}
                          </th>
                          {row.slice(1).map((cell, index) => (
                            <td
                              key={`${row[0]}-${index}`}
                              className="px-3.5 py-3 leading-relaxed text-muted-foreground"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </section>
          ))}

          {/* ---------------- FAQ ---------------- */}
          {guide.faqs?.length ? (
            <section className="border-b border-border py-9">
              <h2 className="text-[clamp(1.25rem,2.2vw,1.5rem)] font-semibold tracking-[-0.02em] text-foreground">
                Questions
              </h2>
              <dl className="afl-divide mt-3 max-w-[68ch]">
                {guide.faqs.map((faq) => (
                  <div key={faq.question} className="py-4">
                    <dt className="text-[1rem] font-semibold leading-snug text-foreground">
                      {faq.question}
                    </dt>
                    <dd className="mt-2 text-[0.9375rem] leading-[1.7] text-muted-foreground">
                      {faq.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </article>

        {/* ---------------- Related guides ---------------- */}
        {related.length > 0 ? (
          <section className="border-b border-border py-9">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-[clamp(1.25rem,2.2vw,1.5rem)] font-semibold tracking-[-0.02em] text-foreground">
                Read next
              </h2>
              <Link
                href="/lexicon/learn"
                className="inline-flex items-center gap-1.5 text-sm text-primary no-underline hover:underline"
              >
                All guides <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <ul className="mt-5 grid gap-3 sm:grid-cols-2" style={{ listStyle: "none" }}>
              {related.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={`/lexicon/learn/${entry.slug}`}
                    className="afl-card group flex h-full flex-col rounded-lg border border-border bg-surface p-4 no-underline"
                  >
                    <span className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-muted-foreground">
                      {entry.readingTime} min read
                    </span>
                    <span className="mt-1.5 text-[0.9375rem] font-semibold leading-snug text-foreground group-hover:text-primary">
                      {entry.title}
                    </span>
                    <span className="mt-1.5 line-clamp-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
                      {entry.summary}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ---------------- Onward into the dictionary ---------------- */}
        {explore.length > 0 ? (
          <section className="border-b border-border py-9">
            <h2 className="text-[clamp(1.25rem,2.2vw,1.5rem)] font-semibold tracking-[-0.02em] text-foreground">
              See it in the dictionary
            </h2>
            <p className="mt-2 max-w-[68ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
              Every example above is an entry you can open. These are the ones this guide leans on.
            </p>

            {wordLinks.length > 0 ? (
              <ExploreGroup title="Entries" links={wordLinks} />
            ) : null}
            {collectionLinks.length > 0 ? (
              <ExploreGroup title="Collections" links={collectionLinks} />
            ) : null}
          </section>
        ) : null}

        <section className="py-9">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/lexicon/browse"
              className="afl-card flex flex-col rounded-lg border border-border bg-surface p-4 no-underline"
            >
              <span className="inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-foreground">
                Browse A–Z
                <ArrowRight className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              </span>
              <span className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
                Every entry in the dictionary, by first letter.
              </span>
            </Link>
            <Link
              href="/lexicon/collections"
              className="afl-card flex flex-col rounded-lg border border-border bg-surface p-4 no-underline"
            >
              <span className="inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-foreground">
                All collections
                <ArrowRight className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              </span>
              <span className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
                Word lists built from rules you can check, not from taste.
              </span>
            </Link>
          </div>

          <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
            Every figure in this guide is read from the corpus when the page renders, so it cannot
            fall out of step with the dictionary. Definitions and semantic relations come from
            WordNet; pronunciations from the CMU Pronouncing Dictionary. Neither records word
            origins, so nothing here claims any.{" "}
            <Link href="/lexicon/sources" className="text-primary hover:underline">
              Full sources and licences
            </Link>
            .
          </p>
        </section>
      </div>
    </>
  );
}

function ExploreGroup({ title, links }) {
  return (
    <div className="mt-5">
      <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-2.5 grid gap-2 sm:grid-cols-2" style={{ listStyle: "none" }}>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex flex-col rounded-sm border border-border bg-surface-soft px-3 py-2 no-underline transition hover:border-border-strong"
            >
              <span className="text-[0.9375rem] font-medium text-foreground">{link.label}</span>
              <span className="mt-0.5 text-[0.8125rem] leading-snug text-muted-foreground">
                {link.hint}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
