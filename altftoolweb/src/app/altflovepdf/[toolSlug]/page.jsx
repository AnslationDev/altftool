import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { getRelatedContent, RelatedContentSection } from "@/platform/linking";
import { TOOLS } from "../toolsData";
import PageView from "./PageView";

export async function generateMetadata({ params }) {
  const { toolSlug } = await params;
  return createPageMetadata({
    title: "PDF Tool — Convert, Merge, Split & More",
    description:
      "Free online PDF tool. Convert, merge, split, compress, rotate, protect and unlock PDF files securely in your browser.",
    path: `/altflovepdf/${toolSlug}`,
  });
}

export default async function Page(props) {
  const { toolSlug } = await props.params;
  const tool = TOOLS.find((item) => item.slug === toolSlug);
  const relatedItems = tool
    ? getRelatedContent({
        source: {
          href: `/altflovepdf/${toolSlug}`,
          title: tool.name,
          description: tool.desc,
          tags: [tool.category, tool.sidebarCategory].filter(Boolean),
          section: "pdfTools",
        },
        slots: [
          { sections: ["blogs", "top9"], limit: 2 },
          { sections: ["tools", "calculators", "imageTools"], limit: 2 },
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
        path={`/altflovepdf/${toolSlug}`}
        jsonLdName="Related tools & guides"
      />
    </>
  );
}
