import ForumsPageView from "./PageView";

export const metadata = {
  title: "Forums — AltfWorld",
  description: "Browse a large mock catalog of thoughtful community conversations.",
};

export default function ForumsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AltfWorld Forums",
    description: "A frontend-only mock community forum catalog.",
    numberOfItems: 30000,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ForumsPageView />
    </>
  );
}
