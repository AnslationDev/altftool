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
import { CATEGORY_BY_SLUG } from "@altftool/core/atlas/taxonomy";
import { getAtlasStats, getEntry, RETIRED_ENTRIES } from "@altftool/core/atlas";
import { SitePlate } from "../_components/SiteCard";
import {
  AnswerBlock,
  AtlasSection,
  Breadcrumbs,
  FaqList,
  SectionHeading,
} from "../_components/Shell";

const description =
  "The useful websites that shut down — and what does the job now. Every retired entry in AltF Atlas keeps its record and names a working successor, so an old bookmark still leads to an answer.";

const FAQS = [
  {
    question: "Why keep websites that no longer exist?",
    answer:
      "Because people still search for them. Someone who bookmarked a tool in 2011 and comes back to a parked domain has a real question — what does this now? — and deleting the entry deletes the answer. Keeping the record with a named successor turns a dead end into a redirect.",
  },
  {
    question: "How much of the classic 'useful websites' lists is still alive?",
    answer:
      "Roughly half. The viral lists of the late 2000s and early 2010s recommended a few hundred sites; social bookmarking, Flash-era media hosts and standalone video communities were hit hardest, while single-purpose utilities and reference archives survived best. That pattern is why the Atlas records status as data rather than assuming a link works forever.",
  },
  {
    question: "How is a successor chosen?",
    answer:
      "By the job, not the branding. The successor is whatever currently does the thing the retired site was listed for, even when it looks nothing like the original — a social bookmarking service is usually replaced by a read-later queue rather than by another social bookmarking service, because that is where the behaviour went.",
  },
];

export async function generateMetadata() {
  const stats = getAtlasStats();
  return createPageMetadata({
    title: `The archive — ${stats.retired} dead websites and what replaced them`,
    description,
    path: "/altfatlas/archive",
    keywords: [
      "websites that shut down",
      "dead websites",
      "what replaced",
      "site alternatives",
      "discontinued web tools",
    ],
  });
}

export default function AtlasArchivePage() {
  const stats = getAtlasStats();

  const rows = RETIRED_ENTRIES.map((entry) => ({
    entry,
    successor: entry.successor ? getEntry(entry.successor) : null,
    category: CATEGORY_BY_SLUG[entry.category],
  }));

  return (
    <>
      <JsonLd
        id="altf-atlas-archive-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/altfatlas/archive",
            name: "AltF Atlas archive",
            description,
          }),
          createItemListJsonLd({
            path: "/altfatlas/archive",
            name: "Retired websites and their successors",
            items: rows.map((row) => ({
              name: row.entry.name,
              path: `/altfatlas/site/${row.entry.slug}`,
            })),
          }),
          createFaqJsonLd({ path: "/altfatlas/archive", questions: FAQS }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Atlas", path: "/altfatlas" },
            { name: "Archive", path: "/altfatlas/archive" },
          ]),
        ]}
      />

      <AtlasSection className="py-8 sm:py-10">
        <Breadcrumbs
          trail={[
            { name: "Atlas", path: "/altfatlas" },
            { name: "Archive", path: "/altfatlas/archive" },
          ]}
        />

        <h1 className="mt-4 max-w-3xl text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {stats.retired} useful websites that did not survive
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
          And what does the job now.
        </p>

        <div className="mt-6 max-w-3xl">
          <AnswerBlock>
            The famous &ldquo;101 useful websites&rdquo; lists were published
            once and never maintained, so roughly half of what they recommended
            is now a dead domain or a parked page. AltF Atlas treats that as
            part of the subject rather than an embarrassment: nothing is
            deleted, it moves here with a named successor chosen by the job it
            did rather than by what it looked like.
          </AnswerBlock>
        </div>

        {/*
         * Rendered as a definition-style list rather than a table.
         * Successor pairs are two-column on desktop and stack on mobile; a
         * real <table> would need a horizontal scroller on phones for content
         * that reads perfectly well stacked.
         */}
        <ul className="mt-10 grid gap-3">
          {rows.map(({ entry, successor, category }) => (
            <li
              key={entry.slug}
              className="afa-card afa-stripe afa-access-retired grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center"
            >
              {/* the retired site */}
              <div className="flex min-w-0 items-start gap-3">
                <SitePlate name={entry.name} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    <Link
                      href={`/altfatlas/site/${entry.slug}`}
                      prefetch={false}
                      className="rounded-sm line-through decoration-1 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {entry.name}
                    </Link>
                  </p>
                  <p className="afa-domain mt-0.5">{entry.domain}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {entry.tagline}
                    {category ? ` · ${category.name}` : ""}
                  </p>
                </div>
              </div>

              <ArrowRight
                className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block"
                aria-hidden="true"
              />

              {/* the successor */}
              {successor ? (
                <div className="flex min-w-0 items-start gap-3 border-t border-border pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                  <SitePlate name={successor.name} size="sm" />
                  <div className="min-w-0">
                    <p className="afa-eyebrow">Use instead</p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">
                      <Link
                        href={`/altfatlas/site/${successor.slug}`}
                        prefetch={false}
                        className="rounded-sm transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {successor.name}
                      </Link>
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {successor.tagline}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground sm:pl-4">
                  No direct successor — the behaviour moved elsewhere entirely.
                </p>
              )}
            </li>
          ))}
        </ul>

        {!rows.length ? (
          <div className="mt-10 rounded-lg border border-dashed border-border p-10 text-center">
            <p className="text-sm font-semibold text-foreground">
              The archive is empty
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Nothing in the Atlas has shut down yet. When something does, it
              will be recorded here with a successor.
            </p>
          </div>
        ) : null}

        <div className="mt-12 max-w-3xl">
          <SectionHeading eyebrow="Questions" title="About the archive" />
          <div className="mt-5">
            <FaqList faqs={FAQS} />
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <SectionHeading
            eyebrow="Still standing"
            title="The classics that survived"
            description="The other half of the story — entries from the original lists that are still live, still free, and still the best answer."
            action={{
              href: "/altfatlas/collections/classics-that-survived",
              label: "Open the collection",
            }}
          />
        </div>
      </AtlasSection>
    </>
  );
}
