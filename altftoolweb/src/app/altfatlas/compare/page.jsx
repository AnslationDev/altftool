import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { LIVE_ENTRIES, resolveComparison } from "@altftool/core/atlas";
import CompareBoard from "./CompareBoard";
import { AtlasSection, Breadcrumbs } from "../_components/Shell";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Compare useful websites side by side",
    description:
      "Put two to four tools next to each other and see what each one costs you before it works, whether your files are uploaded, and where each one stops.",
    path: "/altfatlas/compare",
    // Every slug combination is a valid URL here. Letting a crawler enumerate
    // them would mint thousands of near-identical pages competing with the
    // category pages that should actually rank.
    noindex: true,
    follow: true,
  });
}

export default async function AtlasComparePage({ searchParams }) {
  const params = await searchParams;
  const raw = typeof params?.sites === "string" ? params.sites : "";
  const initial = resolveComparison(raw.split(",").filter(Boolean)).map(
    (entry) => entry.slug,
  );

  // Only the fields the board renders cross the boundary; full records would
  // roughly quadruple the payload for 292 entries.
  const entries = LIVE_ENTRIES.map((entry) => ({
    slug: entry.slug,
    name: entry.name,
    domain: entry.domain,
    url: entry.url,
    tagline: entry.tagline,
    category: entry.category,
    access: entry.access,
    runtime: entry.runtime,
    limits: entry.limits,
    bestFor: entry.bestFor || [],
    checked: entry.checked,
  }));

  return (
    <>
      <JsonLd
        id="altf-atlas-compare-schema"
        data={[
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Atlas", path: "/altfatlas" },
            { name: "Compare", path: "/altfatlas/compare" },
          ]),
        ]}
      />

      <AtlasSection className="py-8 sm:py-10">
        <Breadcrumbs
          trail={[
            { name: "Atlas", path: "/altfatlas" },
            { name: "Compare", path: "/altfatlas/compare" },
          ]}
        />

        <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Compare side by side
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Feature checklists make every tool look equivalent. This table leads
          with the three things that actually differ — what it costs you before
          it works, whether your files leave your device, and where the free
          version stops.
        </p>

        <div className="mt-8">
          <CompareBoard entries={entries} initialSlugs={initial} />
        </div>
      </AtlasSection>
    </>
  );
}
