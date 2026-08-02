import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import { getRelatedContent, RelatedContentSection } from "@/platform/linking";
import { notFound } from "next/navigation";
import { getCalculatorSeo } from "../calculatorSeo";
import PageView from "./PageView";

export async function generateMetadata({ params }) {
  const { toolSlug } = await params;
  const seo = getCalculatorSeo(toolSlug);

  // An unknown slug used to mint its own indexable page: 200, robots
  // "index, follow", a self-canonical, and a title and description invented
  // from the URL segment ("Foo Bar — Free Online Calculator"). The slug space
  // is unbounded, so that was an unbounded soft-404 surface.
  //
  // notFound() cannot be thrown from here: it aborts metadata generation and
  // the altfcalculators layout's metadata takes over, which is indexable and
  // titled "AltF Calculators". So return noindex metadata instead and let the
  // page component below do the 404. Same shape as the fix shipped for
  // src/app/bops/tripfindbox/(site-pages)/[slug]/page.jsx.
  if (!seo) {
    return createPageMetadata({
      title: "Calculator Not Found",
      description:
        "This calculator does not exist. Browse the full AltF Calculators library for finance, health, maths, unit conversion, date and time tools instead.",
      path: `/altfcalculators/${toolSlug}`,
      noindex: true,
    });
  }

  return createPageMetadata({
    title: seo.title,
    description: seo.description,
    path: `/altfcalculators/${toolSlug}`,
  });
}

export default async function Page(props) {
  const { toolSlug } = await props.params;
  const seo = getCalculatorSeo(toolSlug);
  if (!seo) notFound();

  const { tool } = seo;
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
      {/* Without this the page carried only the layout's Organization and
          WebSite nodes, so it described no software at all. A /tools page
          ships a SoftwareApplication entity an answer engine can cite; a
          calculator is the same kind of thing and had nothing. */}
      <JsonLd
        id={`altfcalculators-schema-${toolSlug}`}
        data={[
          createToolJsonLd({
            slug: toolSlug,
            path: `/altfcalculators/${toolSlug}`,
            tool: {
              name: tool.name,
              // The same sentence the meta description carries, so the entity
              // an answer engine reads matches the snippet a searcher sees.
              description: seo.description,
              category: tool.category,
            },
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Calculators", path: "/altfcalculators" },
            { name: tool.name, path: `/altfcalculators/${toolSlug}` },
          ]),
        ]}
      />
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
