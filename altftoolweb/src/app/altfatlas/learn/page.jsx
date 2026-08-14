import Link from "next/link";
import { Clock } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { GUIDES } from "./guides";
import { AtlasSection, Breadcrumbs } from "../_components/Shell";

const description =
  "Short guides on judging web tools you have never heard of — how to tell if one is safe, why half of every useful-websites list is dead, how browser tools avoid uploading your file, and what 'free' really means on a pricing page.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Guides — how to judge a free web tool",
    description,
    path: "/altfatlas/learn",
    keywords: [
      "are free online tools safe",
      "how to check a website is safe",
      "link rot",
      "browser based tools privacy",
    ],
  });
}

export default function AtlasLearnIndexPage() {
  return (
    <>
      <JsonLd
        id="altf-atlas-learn-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/altfatlas/learn",
            name: "AltF Atlas guides",
            description,
          }),
          createItemListJsonLd({
            path: "/altfatlas/learn",
            name: "AltF Atlas guides",
            items: GUIDES.map((guide) => ({
              name: guide.title,
              path: `/altfatlas/learn/${guide.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Atlas", path: "/altfatlas" },
            { name: "Guides", path: "/altfatlas/learn" },
          ]),
        ]}
      />

      <AtlasSection className="py-8 sm:py-10">
        <Breadcrumbs
          trail={[
            { name: "Atlas", path: "/altfatlas" },
            { name: "Guides", path: "/altfatlas/learn" },
          ]}
        />

        <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          How to judge a web tool you have never heard of
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          A directory can tell you what a site does. These answer the questions
          it raises — whether to trust it, why the last list you used is broken,
          and what &ldquo;free&rdquo; is doing on that pricing page.
        </p>

        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {GUIDES.map((guide) => (
            <li key={guide.slug} className="min-w-0">
              <Link
                href={`/altfatlas/learn/${guide.slug}`}
                prefetch={false}
                className="afa-card flex h-full flex-col rounded-lg border border-border p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="afa-eyebrow flex items-center gap-1.5">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {guide.readMinutes} min read
                </span>
                <span className="mt-2 text-base font-semibold leading-snug text-foreground">
                  {guide.title}
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {guide.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </AtlasSection>
    </>
  );
}
