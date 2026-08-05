import { createPageMetadata, createToolJsonLd } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "ALTFTool Backlink Marketplace — High-DR Guest Posts",
    description:
      "Browse approved publisher listings for guest posts and link insertions, compare submitted metrics and prices, and request placements.",
    path: "/altflinking",
    keywords: [
      "backlink marketplace",
      "buy backlinks",
      "guest posts",
      "link insertions",
      "high DR backlinks",
      "SEO agency link building",
      "authority backlinks",
    ],
  });
}

export default function Page(props) {
  const jsonLd = createToolJsonLd({
    slug: "altflinking",
    tool: {
      name: "ALTFTool Backlink Marketplace",
      description: "Browse approved publisher listings and request guest-post or link-insertion placements.",
      category: ["SEO Tools", "Marketing", "Backlinks"],
    },
    category: "marketing",
  });

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PageView {...props} />
    </>
  );
}
