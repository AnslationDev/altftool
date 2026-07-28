import ForumsPageView from "./PageView";
import { buildAltfWorldMetadata } from "../seo";
import { absoluteUrl, getSiteUrl } from "@/platform/seo/generateMetadata";

export function generateMetadata() {
  return buildAltfWorldMetadata({
    title: "Forums — AltfWorld",
    description: "Browse thoughtful AltfWorld community conversations by builder topic, resource type, and digital-tool workflow.",
    path: "/altfworld/forums",
    keywords: ["AltfWorld forums", "community discussions", "builder forums"],
  });
}

export default function ForumsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AltfWorld Forums",
    description: "A frontend-only mock community forum catalog.",
    url: absoluteUrl("/altfworld/forums"),
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    numberOfItems: 30000,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ForumsPageView />
    </>
  );
}
