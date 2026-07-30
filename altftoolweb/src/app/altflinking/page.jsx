import { createPageMetadata, createToolJsonLd } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "ALTFTool Backlink Marketplace — High-DR Guest Posts",
    description:
      "Buy and sell verified high-DR backlinks, guest posts and link insertions with automated domain verification, escrow protection and real-time index tracking.",
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
      description: "Buy & sell verified high-DR guest posts and backlinks with escrow protection.",
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
