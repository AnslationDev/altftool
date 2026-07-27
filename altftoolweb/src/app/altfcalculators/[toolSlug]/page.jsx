import { notFound } from "next/navigation";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { getRelatedContent, RelatedContentSection } from "@/platform/linking";
import { CALCULATORS } from "../toolsData";
import PageView from "./PageView";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

export const dynamic = "force-static";
export const revalidate = 86400;

// Prerender every calculator so crawlers hit a cached page. Amplify builds
// defer the bulk prerender (artifact-size limit) and let ISR fill the cache on
// demand — same guard as /blogs/[slug].
export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return CALCULATORS.map((tool) => ({ toolSlug: tool.slug }));
}

// Only the slugs in CALCULATORS exist. Anything else used to get a title and a
// description built out of the URL segment ("Foo Bar — Free Online Calculator")
// and was served 200 + index,follow with a self-canonical, so /altfcalculators/
// <any string> minted an indexable page for a calculator that does not exist.
function findCalculator(toolSlug) {
  return CALCULATORS.find((item) => item.slug === toolSlug) || null;
}

export async function generateMetadata({ params }) {
  const { toolSlug } = await params;
  const tool = findCalculator(toolSlug);

  // notFound() still renders a 200 body on this deployment, so the page must
  // also carry noindex — that is what actually keeps the URL out of the index.
  if (!tool) {
    return createPageMetadata({
      title: "Calculator not found",
      description: "This calculator does not exist. Browse the full list of free AltFTool calculators.",
      path: "/altfcalculators",
      canonical: "/altfcalculators",
      noindex: true,
      follow: false,
    });
  }

  return createPageMetadata({
    title: `${tool.name} — Free Online Calculator`,
    description:
      tool.desc ||
      `Use the free ${tool.name} online. Fast, accurate and 100% private — it runs entirely in your browser.`,
    path: `/altfcalculators/${toolSlug}`,
  });
}

export default async function Page(props) {
  const { toolSlug } = await props.params;
  const tool = findCalculator(toolSlug);
  if (!tool) notFound();

  const relatedItems = getRelatedContent({
    source: {
      href: `/altfcalculators/${toolSlug}`,
      title: tool.name,
      description: tool.desc,
      tags: [tool.category, tool.sidebarCategory].filter(Boolean),
      section: "calculators",
    },
    slots: [
      { sections: ["blogs", "top9"], limit: 2 },
      { sections: ["tools", "pdfTools", "imageTools"], limit: 2 },
      { sections: ["experiences", "hubs"], limit: 2, minScore: 0 },
    ],
  });

  return (
    <>
      <PageView {...props} />
      <RelatedContentSection
        title="Related tools & guides"
        items={relatedItems}
        path={`/altfcalculators/${toolSlug}`}
        jsonLdName="Related tools & guides"
      />
    </>
  );
}
