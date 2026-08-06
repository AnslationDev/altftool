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
import { COLLECTION_GROUPS } from "@altftool/core/lexicon/collections";
import { getCollection, getCollectionIndex, getManifest } from "@altftool/core/lexicon/corpus";
import {
  AnswerFirst,
  Breadcrumb,
  Pagination,
  StatStrip,
  WordCardGrid,
} from "../../_components/WordAtoms";

export const revalidate = 86400;
export const dynamicParams = true;

const PER_PAGE = 60;
const STORED_CAP = 600;
const PRERENDER = 120;

/*
 * Pre-render the 120 largest collections. They are the ones with the traffic
 * and the ones most expensive to build on demand; the remaining ~79 are small,
 * render in milliseconds and are cached by ISR after the first request.
 */
export async function generateStaticParams() {
  const index = await getCollectionIndex();
  return index
    .filter((collection) => collection.count > 0)
    .slice(0, PRERENDER)
    .map((collection) => ({ slug: collection.slug }));
}

async function loadCollection(slug) {
  const index = await getCollectionIndex();
  const meta = index.find((collection) => collection.slug === slug);
  if (!meta) return null;

  const [rows, manifest] = await Promise.all([getCollection(slug), getManifest()]);
  return { meta, rows: rows || [], index, manifest };
}

/* ------------------------------------------------------------------ *
 * Copy helpers
 * ------------------------------------------------------------------ */

/** How this particular list decided who is in it. */
function ruleSentence(meta) {
  if (meta.derivedFrom?.kind === "topic") {
    return `Membership is WordNet's own subject label: every entry here has at least one sense that a lexicographer filed under "${meta.derivedFrom.label}". No keyword matching against definition text is involved.`;
  }
  if (meta.derivedFrom?.kind === "region") {
    return `Membership is WordNet's own regional label: every entry here has at least one sense marked as ${meta.derivedFrom.label} usage.`;
  }
  if (meta.derivedFrom?.kind === "usage") {
    return `Membership is WordNet's own register label: every entry here has at least one sense marked "${meta.derivedFrom.label}".`;
  }
  if (meta.group === "shape" || meta.group === "sound") {
    return "Membership is decided by a property of the word you can check yourself — its letters, its syllables or where its stress falls — applied to every entry in the corpus.";
  }
  return "Membership is computed from data the entry already carries, applied to every entry in the corpus, so the list regenerates correctly whenever the corpus changes.";
}

function buildFaqs(meta, stats, corpusTotal) {
  const faqs = [
    {
      question: `What is the ${meta.name.toLowerCase()} collection?`,
      answer: `${meta.description} It holds ${meta.count.toLocaleString("en-US")} ${
        meta.count === 1 ? "entry" : "entries"
      } drawn from the ${corpusTotal.toLocaleString("en-US")} in AltF Lexicon.`,
    },
    {
      question: `How was this list of ${meta.name.toLowerCase()} put together?`,
      answer: ruleSentence(meta),
    },
  ];

  if (stats?.commonest) {
    faqs.push({
      question: `What is the most common of the ${meta.name.toLowerCase()}?`,
      answer: `${stats.commonest.w} — it sits in the top commonness band of the words stored for this list. The list is ordered by commonness, so the words most readers already half know come first and the specialist tail comes last.`,
    });
  }

  if (stats?.longest) {
    faqs.push({
      question: `What is the longest word in this collection?`,
      answer: `${stats.longest.w}, at ${stats.longest.l} letters${
        stats.averageSyllables ? `. The average across the list is ${stats.averageSyllables} syllables per word` : ""
      }.`,
    });
  }

  if (meta.count > STORED_CAP) {
    faqs.push({
      question: `Does this page show every one of the ${meta.count.toLocaleString("en-US")} words?`,
      answer: `No. ${meta.count.toLocaleString("en-US")} entries match the rule; the page carries the first ${STORED_CAP} of them, ranked by commonness. The remainder are all still in the dictionary and reachable by search or by browsing A–Z.`,
    });
  }

  return faqs;
}

/* ------------------------------------------------------------------ *
 * Metadata
 * ------------------------------------------------------------------ */

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const index = await getCollectionIndex();
  const meta = index.find((collection) => collection.slug === slug);

  if (!meta) {
    return createPageMetadata({
      title: "Collection not found",
      description: "That word collection does not exist in AltF Lexicon.",
      path: `/lexicon/collections/${slug}`,
      noindex: true,
    });
  }

  return createPageMetadata({
    title: `${meta.title} — ${meta.count.toLocaleString("en-US")} words`,
    description: meta.description,
    path: `/lexicon/collections/${meta.slug}`,
    keywords: [
      meta.name.toLowerCase(),
      `list of ${meta.name.toLowerCase()}`,
      `${meta.name.toLowerCase()} in English`,
      "word list",
    ],
    // A list with nothing in it is not worth a crawl budget.
    noindex: meta.count === 0,
  });
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

export default async function CollectionPage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const loaded = await loadCollection(slug);
  if (!loaded) notFound();

  const { meta, rows, index, manifest } = loaded;
  const path = `/lexicon/collections/${meta.slug}`;

  const page = Math.max(1, Number.parseInt(query?.page, 10) || 1);
  const start = (page - 1) * PER_PAGE;
  const visible = rows.slice(start, start + PER_PAGE);

  // Everything measured below is measured over the words stored for this list,
  // not over the full matching set — the page says which, rather than implying
  // a figure it cannot compute.
  const syllableRows = rows.filter((row) => row.y > 0);
  const stats = rows.length
    ? {
        commonest: rows.reduce((best, row) => (row.c > best.c ? row : best), rows[0]),
        longest: rows.reduce((best, row) => (row.l > best.l ? row : best), rows[0]),
        averageSyllables: syllableRows.length
          ? (syllableRows.reduce((sum, row) => sum + row.y, 0) / syllableRows.length).toFixed(1)
          : null,
      }
    : null;

  const group = COLLECTION_GROUPS.find((candidate) => candidate.id === meta.group);
  const related = index
    .filter((candidate) => candidate.group === meta.group && candidate.slug !== meta.slug)
    .slice(0, 9);

  const faqs = buildFaqs(meta, stats, manifest.total);
  const truncated = meta.count > rows.length;

  return (
    <>
      <JsonLd
        id={`altf-lexicon-collection-${meta.slug}`}
        data={[
          createCollectionPageJsonLd({ path, name: meta.title, description: meta.description }),
          createItemListJsonLd({
            path,
            name: meta.title,
            items: visible.map((row) => ({ name: row.w, path: `/lexicon/word/${row.s}` })),
          }),
          createFaqJsonLd({ path, questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Collections", path: "/lexicon/collections" },
            { name: meta.name, path },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Breadcrumb
          items={[
            { name: "Lexicon", path: "/lexicon" },
            { name: "Collections", path: "/lexicon/collections" },
            { name: meta.name },
          ]}
        />

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            {group ? group.label : "Collection"}
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            {meta.title}
          </h1>

          <AnswerFirst>
            {meta.description} {ruleSentence(meta)}
          </AnswerFirst>

          {stats ? (
            <>
              <StatStrip
                stats={[
                  {
                    value: meta.count.toLocaleString("en-US"),
                    label: meta.count === 1 ? "Word in this list" : "Words in this list",
                  },
                  { value: stats.commonest.w, label: "Commonest" },
                  { value: stats.longest.w, label: `Longest (${stats.longest.l} letters)` },
                  ...(stats.averageSyllables
                    ? [{ value: stats.averageSyllables, label: "Average syllables" }]
                    : []),
                ]}
              />
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Commonest, longest and average syllables are measured across the{" "}
                {rows.length.toLocaleString("en-US")} words carried on this page, ordered by how
                often each appears in everyday English.
              </p>
            </>
          ) : null}
        </header>

        {truncated ? (
          <p className="mt-6 rounded-lg border border-border bg-surface-soft p-4 text-sm leading-relaxed text-muted-foreground">
            <strong className="font-semibold text-foreground">
              {meta.count.toLocaleString("en-US")} entries
            </strong>{" "}
            match this rule. This page carries the first {rows.length.toLocaleString("en-US")} of
            them, ranked by commonness, so the list stays readable and the page stays small. The
            rest are still in the dictionary — search for one, or browse the letter it starts with.
          </p>
        ) : null}

        {rows.length === 0 ? (
          <p className="my-10 rounded-lg border border-border bg-surface-soft p-5 text-[0.9375rem] leading-relaxed text-muted-foreground">
            No entry in the corpus currently matches this rule. The collection is kept rather than
            deleted because the rule is real — WordNet simply carries no sense with that label in
            the release we build from. Nothing here is a placeholder for words we have not got
            around to adding.
          </p>
        ) : (
          <section className="py-8">
            <WordCardGrid rows={visible} />
            <Pagination page={page} total={rows.length} perPage={PER_PAGE} basePath={path} />
          </section>
        )}

        {/* ---------------- FAQ ---------------- */}
        <section className="border-t border-border py-8">
          <h2 className="text-[1.375rem] font-semibold tracking-tight text-foreground">
            Questions about this list
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

        {/* ---------------- Related ---------------- */}
        {related.length > 0 ? (
          <section className="border-t border-border py-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-[1.375rem] font-semibold tracking-tight text-foreground">
                More {group ? group.label.replace(/^By /, "by ").toLowerCase() : "collections"}
              </h2>
              <Link
                href="/lexicon/collections"
                className="inline-flex items-center gap-1.5 text-sm text-primary no-underline hover:underline"
              >
                All collections <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <ul
              className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              style={{ listStyle: "none" }}
            >
              {related.map((candidate) => (
                <li key={candidate.slug}>
                  <Link
                    href={`/lexicon/collections/${candidate.slug}`}
                    className="afl-card group flex h-full flex-col rounded-lg border border-border bg-surface p-4 no-underline"
                  >
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="text-[0.9375rem] font-semibold text-foreground group-hover:text-primary">
                        {candidate.name}
                      </span>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {candidate.count.toLocaleString("en-US")}
                      </span>
                    </span>
                    <span className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
                      {candidate.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="border-t border-border py-8 text-xs leading-relaxed text-muted-foreground">
          Definitions, subject classification and semantic relations come from WordNet. Syllable
          counts come from the CMU Pronouncing Dictionary where the word is recorded in it.{" "}
          <Link href="/lexicon/sources" className="text-primary hover:underline">
            Full sources and licences
          </Link>
          .
        </p>
      </div>
    </>
  );
}
