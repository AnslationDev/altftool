import { createPageMetadata, createToolJsonLd } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "ALTFTool Backlink Marketplace — Verified High-DR Guest Posts & Links",
    description:
      "The premier backlink marketplace: buy & sell verified high-authority backlinks, guest posts, and link insertions with automated DNS verification, escrow guarantees, and real-time index tracking.",
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
