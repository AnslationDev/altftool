import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  CircleSlash,
  ExternalLink,
  Target,
  Wrench,
} from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { createAtlasEntryJsonLd } from "@/platform/seo/atlasEntrySchema";
import {
  ACCESS_LEVELS,
  CATEGORY_BY_SLUG,
  COLLECTION_BY_SLUG,
  RUNTIMES,
  USE_CASE_BY_SLUG,
} from "@altftool/core/atlas/taxonomy";
import {
  ENTRIES,
  getEntry,
  getIndexableTags,
  relatedEntries,
  tagSlug,
} from "@altftool/core/atlas";
import { SiteGrid, SitePlate } from "../../_components/SiteCard";
import { AccessPill, LegacyPill, RuntimeLine } from "../../_components/Pills";
import {
  AnswerBlock,
  AtlasSection,
  Breadcrumbs,
  FaqList,
  SectionHeading,
} from "../../_components/Shell";

const ACCESS_BY_ID = Object.fromEntries(
  ACCESS_LEVELS.map((level) => [level.id, level]),
);
const RUNTIME_BY_ID = Object.fromEntries(
  RUNTIMES.map((runtime) => [runtime.id, runtime]),
);

export const dynamicParams = false;

export function generateStaticParams() {
  return ENTRIES.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) return createPageMetadata({ title: "Site not found" });

  const category = CATEGORY_BY_SLUG[entry.category];
  const retired = entry.status === "retired";

  return createPageMetadata({
    title: retired
      ? `${entry.name} has shut down — what to use instead`
      : `${entry.name} — ${entry.tagline}`,
    description: retired
      ? `${entry.name} (${entry.domain}) is no longer running. Here is what it did, why it mattered, and the site that does the same job today.`
      : `${entry.tagline}. ${ACCESS_BY_ID[entry.access]?.blurb || ""} ${entry.limits}`,
    path: `/altfatlas/site/${entry.slug}`,
    keywords: [
      entry.name,
      entry.domain,
      ...(entry.tags || []),
      category?.name?.toLowerCase(),
      retired ? `${entry.name} alternative` : `${entry.name} free`,
    ].filter(Boolean),
  });
}

function Fact({ label, children }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border py-2.5 last:border-b-0">
      <dt className="afa-eyebrow">{label}</dt>
      <dd className="min-w-0 text-right text-[0.8125rem] font-medium text-foreground">
        {children}
      </dd>
    </div>
  );
}

export default async function AtlasSitePage({ params }) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();

  const category = CATEGORY_BY_SLUG[entry.category];
  const access = ACCESS_BY_ID[entry.access];
  const runtime = RUNTIME_BY_ID[entry.runtime];
  const retired = entry.status === "retired";
  const successor = entry.successor ? getEntry(entry.successor) : null;
  const related = relatedEntries(entry, 6);
  const indexableTagSlugs = new Set(getIndexableTags().map((row) => row.slug));

  const useCases = (entry.useCases || [])
    .map((useCaseSlug) => USE_CASE_BY_SLUG[useCaseSlug])
    .filter(Boolean);
  const collections = (entry.collections || [])
    .map((collectionSlug) => COLLECTION_BY_SLUG[collectionSlug])
    .filter(Boolean);

  const faqs = [
    {
      question: retired
        ? `Is ${entry.name} still available?`
        : `Is ${entry.name} free?`,
      answer: retired
        ? `No. ${entry.name} is no longer running and ${entry.domain} does not serve the tool any more. ${
            successor
              ? `${successor.name} is the closest current equivalent — it ${successor.tagline.charAt(0).toLowerCase()}${successor.tagline.slice(1)}.`
              : ""
          }`
        : `${access?.blurb || ""} ${entry.limits}`,
    },
    {
      question: `Does ${entry.name} upload my files?`,
      answer:
        entry.runtime === "local"
          ? `No. ${entry.name} does the work inside your browser, so the file never leaves your device — you can load the page, disconnect from the network, and it still works. That makes it a reasonable choice for material containing personal data.`
          : `Yes. ${entry.name} sends your input to its own servers to process it. That is fine for public material; for anything containing personal data, use one of the on-device tools instead.`,
    },
    {
      question: `What are the limitations of ${entry.name}?`,
      answer: entry.limits,
    },
  ];

  return (
    <>
      <JsonLd
        id={`altf-atlas-site-${slug}-schema`}
        data={[
          createAtlasEntryJsonLd({
            entry,
            category,
            pageUrl: absoluteUrl(`/altfatlas/site/${slug}`),
            atlasUrl: absoluteUrl("/altfatlas"),
          }),
          createFaqJsonLd({ path: `/altfatlas/site/${slug}`, questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Atlas", path: "/altfatlas" },
            ...(category
              ? [
                  {
                    name: category.name,
                    path: `/altfatlas/category/${category.slug}`,
                  },
                ]
              : []),
            { name: entry.name, path: `/altfatlas/site/${slug}` },
          ]),
        ]}
      />

      <AtlasSection className="py-8 sm:py-10">
        <Breadcrumbs
          trail={[
            { name: "Atlas", path: "/altfatlas" },
            ...(category
              ? [
                  {
                    name: category.name,
                    path: `/altfatlas/category/${category.slug}`,
                  },
                ]
              : []),
            { name: entry.name, path: `/altfatlas/site/${slug}` },
          ]}
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          {/* ------------------------- main column ------------------------- */}
          <div className="min-w-0">
            <div className="flex items-start gap-4">
              <SitePlate
                name={entry.name}
                size="lg"
                className={`afa-access-${retired ? "retired" : entry.access}`}
              />
              <div className="min-w-0">
                <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {entry.name}
                </h1>
                <p className="afa-domain mt-1 text-sm">{entry.domain}</p>
              </div>
            </div>

            <p className="mt-5 text-pretty text-lg leading-relaxed text-foreground">
              {entry.tagline}.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {retired ? (
                <span
                  className="afa-pill afa-pill--solid"
                  style={{
                    "--afa-pill-ink": "var(--afa-retired)",
                    "--afa-pill-soft": "var(--afa-retired-soft)",
                  }}
                >
                  <CircleSlash className="h-3 w-3" aria-hidden="true" />
                  Retired
                </span>
              ) : (
                <AccessPill access={entry.access} />
              )}
              <LegacyPill legacy={entry.legacy} />
              <RuntimeLine runtime={entry.runtime} />
            </div>

            {retired && successor ? (
              <div
                className="afa-stripe afa-access-open mt-6 rounded-r-lg bg-muted/50 p-4"
                role="note"
              >
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  Use {successor.name} instead
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {successor.tagline}. {successor.limits}
                </p>
                <Link
                  href={`/altfatlas/site/${successor.slug}`}
                  prefetch={false}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-primary transition hover:gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Open {successor.name}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            ) : null}

            <div className="mt-8">
              <h2 className="text-base font-semibold text-foreground">
                What it does
              </h2>
              <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                {entry.what}
              </p>
            </div>

            {entry.bestFor?.length ? (
              <div className="mt-8">
                <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Target className="h-4 w-4 text-primary" aria-hidden="true" />
                  Best for
                </h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {entry.bestFor.map((item) => (
                    <li
                      key={item}
                      className="rounded-md border border-border bg-card px-3 py-2 text-[0.8125rem] text-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/*
             * The limitation gets equal visual weight to "what it does".
             * A directory where every entry reads as a recommendation is an
             * advert; this section is the reason to believe the rest.
             */}
            <div className="mt-8">
              <h2 className="text-base font-semibold text-foreground">
                Where it stops
              </h2>
              <div className="mt-2">
                <AnswerBlock>{entry.limits}</AnswerBlock>
              </div>
            </div>

            {entry.altf ? (
              <div className="mt-8 rounded-lg border border-border bg-card p-5">
                <p className="afa-eyebrow flex items-center gap-2">
                  <Wrench
                    className="h-3.5 w-3.5 text-primary"
                    aria-hidden="true"
                  />
                  AltFTool does this too
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  If you would rather not leave the site,{" "}
                  <strong className="font-semibold text-foreground">
                    {entry.altf.label}
                  </strong>{" "}
                  covers the same job here — free, no account, and it runs in
                  your browser.
                </p>
                <Link
                  href={entry.altf.href}
                  prefetch={false}
                  className="mt-3 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
                >
                  Open {entry.altf.label}
                </Link>
              </div>
            ) : null}

            <div className="mt-10 max-w-2xl">
              <SectionHeading
                eyebrow="Questions"
                title={`About ${entry.name}`}
              />
              <div className="mt-4">
                <FaqList faqs={faqs} />
              </div>
            </div>
          </div>

          {/* --------------------------- sidebar --------------------------- */}
          <aside className="min-w-0 lg:sticky lg:top-32">
            {entry.url && !retired ? (
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Open {entry.domain}
              </a>
            ) : null}

            <dl className="mt-5 rounded-lg border border-border bg-card px-4 py-1">
              {category ? (
                <Fact label="Category">
                  <Link
                    href={`/altfatlas/category/${category.slug}`}
                    prefetch={false}
                    className="text-primary underline underline-offset-2"
                  >
                    {category.name}
                  </Link>
                </Fact>
              ) : null}
              <Fact label="Access">{access?.label || "—"}</Fact>
              <Fact label="Processing">{runtime?.label || "—"}</Fact>
              <Fact label="Status">{retired ? "Retired" : "Live"}</Fact>
              {/* The claim this directory rests on: opened, not scraped. */}
              <Fact label="Last checked">
                <span className="afa-domain">{entry.checked}</span>
              </Fact>
              {entry.legacy ? (
                <Fact label="Heritage">On the classic lists</Fact>
              ) : null}
            </dl>

            {useCases.length ? (
              <div className="mt-5">
                <p className="afa-eyebrow">Answers</p>
                <ul className="mt-2 grid gap-1.5">
                  {useCases.map((useCase) => (
                    <li key={useCase.slug}>
                      <Link
                        href={`/altfatlas/use-case/${useCase.slug}`}
                        prefetch={false}
                        className="block rounded-md border border-border px-3 py-2 text-[0.8125rem] font-medium text-muted-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {useCase.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {collections.length ? (
              <div className="mt-5">
                <p className="afa-eyebrow">In these collections</p>
                <ul className="mt-2 grid gap-1.5">
                  {collections.map((collection) => (
                    <li key={collection.slug}>
                      <Link
                        href={`/altfatlas/collections/${collection.slug}`}
                        prefetch={false}
                        className="block rounded-md border border-border px-3 py-2 text-[0.8125rem] font-medium text-muted-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {collection.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {entry.tags?.length ? (
              <div className="mt-5">
                <p className="afa-eyebrow">Tags</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {entry.tags.map((tag) => {
                    // Only tags above the indexing threshold have a page; the
                    // rest render as plain labels rather than links to a 404.
                    const slug = tagSlug(tag);
                    const linked = indexableTagSlugs.has(slug);

                    return (
                      <li key={tag}>
                        {linked ? (
                          <Link
                            href={`/altfatlas/tag/${slug}`}
                            prefetch={false}
                            className="afa-domain inline-block rounded-full border border-border px-2.5 py-1 transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            {tag}
                          </Link>
                        ) : (
                          <span className="afa-domain inline-block rounded-full border border-border px-2.5 py-1">
                            {tag}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>

        {related.length ? (
          <div className="mt-14 border-t border-border pt-10">
            <SectionHeading
              eyebrow="Alternatives"
              title={`Sites that do a similar job to ${entry.name}`}
              description="Same category or same task, ordered by how closely they overlap."
              action={{
                // Pre-loads this entry against its three closest matches, which
                // is the comparison someone on this page actually wants.
                href: `/altfatlas/compare?sites=${[entry.slug, ...related.slice(0, 3).map((item) => item.slug)].join(",")}`,
                label: "Compare these",
              }}
            />
            <div className="mt-6">
              <SiteGrid entries={related} />
            </div>
          </div>
        ) : null}
      </AtlasSection>
    </>
  );
}
