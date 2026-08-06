import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  CATEGORY_BY_SLUG,
  USE_CASE_BY_SLUG,
  USE_CASE_SLUGS,
  USE_CASES,
} from "@altftool/core/atlas/taxonomy";
import { entriesForUseCase, getFacetCounts } from "@altftool/core/atlas";
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
  return USE_CASE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const useCase = USE_CASE_BY_SLUG[slug];
  if (!useCase) return createPageMetadata({ title: "Task not found" });

  const entries = entriesForUseCase(slug);

  return createPageMetadata({
    title: useCase.question,
    description: `${useCase.answer} ${entries.length} sites in AltF Atlas do this, each with its access level and its limits stated.`,
    path: `/altfatlas/use-case/${slug}`,
    keywords: [
      useCase.question.toLowerCase(),
      useCase.name.toLowerCase(),
      ...useCase.tags,
    ],
  });
}

export default async function AtlasUseCasePage({ params }) {
  const { slug } = await params;
  const useCase = USE_CASE_BY_SLUG[slug];
  if (!useCase) notFound();

  const entries = entriesForUseCase(slug);
  const noSignup = entries.filter((entry) => entry.access === "open");
  const onDevice = entries.filter((entry) => entry.runtime === "local");

  // Categories these sites come from — a task usually crosses two or three,
  // which is precisely why the category index is not enough on its own.
  const categorySlugs = [...new Set(entries.map((entry) => entry.category))];
  const categories = categorySlugs
    .map((categorySlug) => CATEGORY_BY_SLUG[categorySlug])
    .filter(Boolean);

  const facets = getFacetCounts();
  const siblings = USE_CASES.filter((item) => item.slug !== slug)
    .map((item) => ({ ...item, count: facets.useCase[item.slug] || 0 }))
    .filter((item) => item.count > 0)
    .slice(0, 8);

  const faqs = [
    { question: useCase.question, answer: useCase.answer },
    {
      question: `Can I do this without creating an account?`,
      answer: noSignup.length
        ? `Yes — ${noSignup.length} of the ${entries.length} sites listed here work with no account at all. They are marked "No sign-up" and you can spot them by the green rule down the left edge of the card.`
        : `Not with the sites listed here — every one of them wants at least a free account before it will do the job. If avoiding registration matters more than the specific feature, browse the no-sign-up filter for a nearby alternative.`,
    },
    {
      question: `Is it safe to use these with private files?`,
      answer: onDevice.length
        ? `${onDevice.length} of these do the work inside your browser and never upload the file — those are the ones to use for anything with personal data in it. The rest send your input to their servers, which is fine for public material.`
        : `Every option here sends your file to a server to process it, so treat them as suitable for public material only. For anything containing personal data, use a tool that processes files on your own device.`,
    },
  ];

  return (
    <>
      <JsonLd
        id={`altf-atlas-use-case-${slug}-schema`}
        data={[
          createItemListJsonLd({
            path: `/altfatlas/use-case/${slug}`,
            name: useCase.name,
            items: entries.map((entry) => ({
              name: entry.name,
              path: `/altfatlas/site/${entry.slug}`,
            })),
          }),
          createFaqJsonLd({
            path: `/altfatlas/use-case/${slug}`,
            questions: faqs,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Atlas", path: "/altfatlas" },
            { name: "By task", path: "/altfatlas/use-case" },
            { name: useCase.name, path: `/altfatlas/use-case/${slug}` },
          ]),
        ]}
      />

      <AtlasSection className="py-8 sm:py-10">
        <Breadcrumbs
          trail={[
            { name: "Atlas", path: "/altfatlas" },
            { name: "By task", path: "/altfatlas/use-case" },
            { name: useCase.name, path: `/altfatlas/use-case/${slug}` },
          ]}
        />

        <h1 className="mt-4 max-w-3xl text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {useCase.question}
        </h1>

        {/* Answer-first: the self-contained chunk answer engines lift. */}
        <div className="mt-5 max-w-3xl">
          <AnswerBlock>{useCase.answer}</AnswerBlock>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-3">
          <span className="afa-figure text-sm text-muted-foreground">
            <strong className="font-semibold text-foreground">
              {entries.length}
            </strong>{" "}
            sites do this
          </span>
          {noSignup.length ? (
            <span className="afa-figure text-sm text-muted-foreground">
              <strong
                className="font-semibold"
                style={{ color: "var(--afa-open)" }}
              >
                {noSignup.length}
              </strong>{" "}
              need no sign-up
            </span>
          ) : null}
          {onDevice.length ? (
            <span className="afa-figure text-sm text-muted-foreground">
              <strong
                className="font-semibold"
                style={{ color: "var(--afa-local)" }}
              >
                {onDevice.length}
              </strong>{" "}
              run on your device
            </span>
          ) : null}
        </div>

        <div className="mt-8">
          <SiteGrid
            entries={entries}
            empty={{
              title: "Nothing tagged for this task yet",
              body: "The task is defined but no entry claims it. Browse the full directory instead.",
            }}
          />
        </div>

        {categories.length ? (
          <div className="mt-12">
            <SectionHeading
              eyebrow="Where these come from"
              title="Categories this task spans"
              description="A real job usually crosses two or three categories, which is why starting from the task is often faster than starting from the shelf."
            />
            <ul className="mt-5 flex flex-wrap gap-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/altfatlas/category/${category.slug}`}
                    prefetch={false}
                    className="inline-flex items-center rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-12 max-w-3xl">
          <SectionHeading eyebrow="Questions" title="Before you start" />
          <div className="mt-5">
            <FaqList faqs={faqs} />
          </div>
        </div>

        {siblings.length ? (
          <div className="mt-12 border-t border-border pt-8">
            <p className="afa-eyebrow">Other tasks</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {siblings.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/altfatlas/use-case/${item.slug}`}
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
