import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { USE_CASES } from "@altftool/core/atlas/taxonomy";
import { getFacetCounts } from "@altftool/core/atlas";
import { AtlasSection, Breadcrumbs } from "../_components/Shell";

const description =
  "Start from the job rather than the category. Sixteen common tasks — convert a file, remove a background, send something too big for email, transcribe audio, check a link is safe — each answered with the sites that actually do it.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Find a website by the job you need done",
    description,
    path: "/altfatlas/use-case",
    keywords: [
      "how do I convert a file online",
      "how to send a large file",
      "free tool to do",
      "what website do I use to",
    ],
  });
}

export default function AtlasUseCaseIndexPage() {
  const facets = getFacetCounts();
  const useCases = USE_CASES.map((useCase) => ({
    ...useCase,
    count: facets.useCase[useCase.slug] || 0,
  })).filter((useCase) => useCase.count > 0);

  return (
    <>
      <JsonLd
        id="altf-atlas-use-cases-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/altfatlas/use-case",
            name: "AltF Atlas — by task",
            description,
          }),
          createItemListJsonLd({
            path: "/altfatlas/use-case",
            name: "Tasks answered by AltF Atlas",
            items: useCases.map((useCase) => ({
              name: useCase.name,
              path: `/altfatlas/use-case/${useCase.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Atlas", path: "/altfatlas" },
            { name: "By task", path: "/altfatlas/use-case" },
          ]),
        ]}
      />

      <AtlasSection className="py-8 sm:py-10">
        <Breadcrumbs
          trail={[
            { name: "Atlas", path: "/altfatlas" },
            { name: "By task", path: "/altfatlas/use-case" },
          ]}
        />

        <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          What do you need to get done?
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Most people do not want a category of software, they want a specific
          thing finished in the next ten minutes. Each of these pages opens with
          the short answer and then lists the sites that give it.
        </p>

        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((useCase) => (
            <li key={useCase.slug} className="min-w-0">
              <Link
                href={`/altfatlas/use-case/${useCase.slug}`}
                prefetch={false}
                className="afa-card flex h-full flex-col rounded-lg border border-border p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="text-sm font-semibold text-foreground">
                  {useCase.name}
                </span>
                <span className="mt-1.5 line-clamp-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
                  {useCase.answer}
                </span>
                <span className="afa-figure mt-auto pt-4 text-xs text-muted-foreground">
                  {useCase.count} {useCase.count === 1 ? "site" : "sites"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </AtlasSection>
    </>
  );
}
