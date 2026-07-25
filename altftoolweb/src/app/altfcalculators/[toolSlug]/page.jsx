import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { getRelatedContent, RelatedContentSection } from "@/platform/linking";
import { CALCULATORS } from "../toolsData";
import PageView from "./PageView";

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
