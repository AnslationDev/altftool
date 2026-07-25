// Server component — renders the site-wide related-content band for one
// Altf LoveImg tool page. Must stay server-only (no "use client"): it pulls
// the full internal-linking content graph.

import { getRelatedContent, RelatedContentSection } from "@/platform/linking";
import { BASE, TOOLS } from "../data/tools";

export default function RelatedToolsBand({ slug }) {
  const tool = TOOLS.find((item) => item.slug === slug);
  if (!tool) return null;

  const items = getRelatedContent({
    source: {
      href: `${BASE}/${slug}`,
      title: tool.name,
      description: tool.description,
      tags: [tool.category, tool.tagline].filter(Boolean),
      section: "imageTools",
    },
    slots: [
      { sections: ["blogs", "top9"], limit: 2 },
      { sections: ["tools", "pdfTools", "calculators"], limit: 2 },
      { sections: ["experiences", "hubs"], limit: 2, minScore: 0 },
    ],
  });

  return (
    <RelatedContentSection
      title="Related tools & guides"
      items={items}
      path={`${BASE}/${slug}`}
      jsonLdName="Related tools & guides"
    />
  );
}
