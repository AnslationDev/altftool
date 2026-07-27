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

function formatToolName(slug) {
  return String(slug || "Calculator")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }) {
  const { toolSlug } = await params;
  const tool = CALCULATORS.find((item) => item.slug === toolSlug);
  const toolName = tool?.name || formatToolName(toolSlug);

  return createPageMetadata({
    title: `${toolName} — Free Online Calculator`,
    description:
      tool?.desc ||
      `Use the free ${toolName} online. Fast, accurate and 100% private — it runs entirely in your browser.`,
    path: `/altfcalculators/${toolSlug}`,
  });
}

export default async function Page(props) {
  const { toolSlug } = await props.params;
  const tool = CALCULATORS.find((item) => item.slug === toolSlug);
  const relatedItems = tool
    ? getRelatedContent({
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
      })
    : [];

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
