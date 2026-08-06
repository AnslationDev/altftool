import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  ACCESS_LEVELS,
  CATEGORY_BY_SLUG,
  CATEGORY_SLUGS,
  USE_CASE_BY_SLUG,
} from "@altftool/core/atlas/taxonomy";
import {
  entriesInCategory,
  getPopulatedCategories,
} from "@altftool/core/atlas";
import { SiteGrid } from "../../_components/SiteCard";
import {
  AnswerBlock,
  AtlasSection,
  Breadcrumbs,
  FaqList,
  SectionHeading,
} from "../../_components/Shell";

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = CATEGORY_BY_SLUG[slug];
  if (!category) return createPageMetadata({ title: "Category not found" });

  const entries = entriesInCategory(slug);
  const open = entries.filter((entry) => entry.access === "open").length;

  return createPageMetadata({
    title: `${category.metaTitle} — ${entries.length} checked picks`,
    description: `${category.tagline} ${entries.length} sites in AltF Atlas, ${open} of them with no sign-up at all. Every entry says where the free version stops.`,
    path: `/altfatlas/category/${slug}`,
    keywords: [
      category.name.toLowerCase(),
      category.metaTitle.toLowerCase(),
      `best ${category.name.toLowerCase()} sites`,
      `free ${category.name.toLowerCase()}`,
      "useful websites",
    ],
  });
}

export default async function AtlasCategoryPage({ params }) {
  const { slug } = await params;
  const category = CATEGORY_BY_SLUG[slug];
  if (!category) notFound();

  const entries = entriesInCategory(slug);
  const retired = entriesInCategory(slug, { includeRetired: true }).filter(
    (entry) => entry.status === "retired",
  );

  const byAccess = ACCESS_LEVELS.map((level) => ({
    ...level,
    count: entries.filter((entry) => entry.access === level.id).length,
  })).filter((level) => level.count > 0);

  const onDevice = entries.filter((entry) => entry.runtime === "local");

  // Use cases this category actually answers, most-covered first — the
  // internal-linking layer that stops these pages being leaves.
  const useCaseCounts = new Map();
  for (const entry of entries) {
    for (const useCaseSlug of entry.useCases || []) {
      useCaseCounts.set(useCaseSlug, (useCaseCounts.get(useCaseSlug) || 0) + 1);
    }
  }
  const relatedUseCases = [...useCaseCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([useCaseSlug, count]) => ({
      ...USE_CASE_BY_SLUG[useCaseSlug],
      count,
    }))
    .filter((useCase) => useCase.slug);

  const siblings = getPopulatedCategories()
    .filter((item) => item.slug !== slug)
    .slice(0, 8);

  const faqs = [
    {
      question: `What is the best free ${category.name.toLowerCase()} site?`,
      answer: `There is no single answer, which is why this page lists ${entries.length} of them with their limits stated. ${
        byAccess.find((level) => level.id === "open")
          ? `If you want to avoid signing up entirely, ${byAccess.find((level) => level.id === "open").count} of these work with no account at all.`
          : "Most of these need at least a free account before they will do the job."
      }`,
    },
    {
      question: `Do these ${category.name.toLowerCase()} sites upload my files?`,
      answer: onDevice.length
        ? `${onDevice.length} of the ${entries.length} sites here process your file inside the browser and never upload it — they are marked "On device". The rest send your input to their server, which is fine for public material and worth thinking twice about for anything personal.`
        : `Every site in this category sends your input to its own server to do the work. That is fine for public material; for anything containing personal data, check the on-device collection instead.`,
    },
    {
      question: `Is anything on this list going to disappear?`,
      answer: retired.length
        ? `Some already have. ${retired.length} ${retired.length === 1 ? "entry" : "entries"} in this category has been retired and moved to the Archive with a working successor, so an old bookmark still leads somewhere useful.`
        : `Nothing in this category has shut down so far. When something does, it moves to the Archive with a named successor rather than being deleted, so the answer to "what replaced it" survives.`,
    },
  ];

  return (
    <>
      <JsonLd
        id={`altf-atlas-category-${slug}-schema`}
        data={[
          createCollectionPageJsonLd({
            path: `/altfatlas/category/${slug}`,
            name: `${category.name} — AltF Atlas`,
            description: category.tagline,
          }),
          createItemListJsonLd({
            path: `/altfatlas/category/${slug}`,
            name: category.metaTitle,
            items: entries.map((entry) => ({
              name: entry.name,
              path: `/altfatlas/site/${entry.slug}`,
            })),
          }),
          createFaqJsonLd({
            path: `/altfatlas/category/${slug}`,
            questions: faqs,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Atlas", path: "/altfatlas" },
            { name: "Categories", path: "/altfatlas/categories" },
            { name: category.name, path: `/altfatlas/category/${slug}` },
          ]),
        ]}
      />

      <AtlasSection className="py-8 sm:py-10">
        <Breadcrumbs
          trail={[
            { name: "Atlas", path: "/altfatlas" },
            { name: "Categories", path: "/altfatlas/categories" },
            { name: category.name, path: `/altfatlas/category/${slug}` },
          ]}
        />

        <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {category.name}
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
          {category.tagline}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-3">
          <span className="afa-figure text-sm text-muted-foreground">
            <strong className="font-semibold text-foreground">
              {entries.length}
            </strong>{" "}
            sites
          </span>
          {byAccess.map((level) => (
            <span
              key={level.id}
              className="afa-figure text-sm text-muted-foreground"
            >
              <strong
                className="font-semibold"
                style={{ color: `var(--afa-${level.id})` }}
              >
                {level.count}
              </strong>{" "}
              {level.short.toLowerCase()}
            </span>
          ))}
          {onDevice.length ? (
            <span className="afa-figure text-sm text-muted-foreground">
              <strong
                className="font-semibold"
                style={{ color: "var(--afa-local)" }}
              >
                {onDevice.length}
              </strong>{" "}
              on device
            </span>
          ) : null}
        </div>

        <div className="mt-6 max-w-3xl">
          <AnswerBlock>{category.intro}</AnswerBlock>
        </div>

        <div className="mt-8">
          <SiteGrid
            entries={entries}
            showCategory={false}
            empty={{
              title: "Nothing listed here yet",
              body: "This category is defined but has no entries. Suggest one and it may be the first.",
            }}
          />
        </div>

        {onDevice.length ? (
          <div className="mt-12">
            <SectionHeading
              eyebrow="Privacy"
              title="The ones that never upload your file"
              description="These process everything inside the browser. Load the page, disconnect from the network, and they still work."
            />
            <div className="mt-5">
              <SiteGrid entries={onDevice} showCategory={false} />
            </div>
          </div>
        ) : null}

        {relatedUseCases.length ? (
          <div className="mt-12">
            <SectionHeading
              eyebrow="By task"
              title="What people use these for"
            />
            <ul className="mt-5 flex flex-wrap gap-2">
              {relatedUseCases.map((useCase) => (
                <li key={useCase.slug}>
                  <Link
                    href={`/altfatlas/use-case/${useCase.slug}`}
                    prefetch={false}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {useCase.name}
                    <span className="afa-figure text-muted-foreground">
                      {useCase.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {retired.length ? (
          <div className="mt-12">
            <SectionHeading
              eyebrow="Archive"
              title={`${retired.length} ${retired.length === 1 ? "entry" : "entries"} in this category has been retired`}
              description="Kept on record so an old bookmark still leads to an answer. Each one names the site that does the job now."
              action={{ href: "/altfatlas/archive", label: "Full archive" }}
            />
            <div className="mt-5">
              <SiteGrid entries={retired} showCategory={false} />
            </div>
          </div>
        ) : null}

        <div className="mt-12 max-w-3xl">
          <SectionHeading
            eyebrow="Questions"
            title={`About ${category.name.toLowerCase()}`}
          />
          <div className="mt-5">
            <FaqList faqs={faqs} />
          </div>
        </div>

        {siblings.length ? (
          <div className="mt-12 border-t border-border pt-8">
            <p className="afa-eyebrow">Other categories</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {siblings.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/altfatlas/category/${item.slug}`}
                    prefetch={false}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {item.name}
                    <span className="afa-figure">{item.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </AtlasSection>
    </>
  );
}
