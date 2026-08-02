import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import "../top9.css";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createPageMetadata,
  getSiteUrl,
} from "@/platform/seo/generateMetadata";
import {
  getTop9Category,
  getTop9Description,
  getTop9Image,
  getTop9Item,
  getTop9Items,
  getTop9PublishedDate,
  getTop9Title,
} from "../data/getTop9Items";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";

export const dynamic = "force-static";

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return getTop9Items().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = getTop9Item(slug);

  if (!item) {
    return {
      title: "Top9 List Not Found",
      robots: { index: false, follow: true },
    };
  }

  const rankedPickCount = Array.isArray(item.top) ? item.top.length : 0;

  return createPageMetadata({
    title: getTop9Title(item),
    description: rankedPickCount
      ? `${getTop9Description(item)} Explore all ${rankedPickCount} ranked picks, key context, and the complete curated list on AltFTool.`
      : `${getTop9Description(item)} Key context and the complete curated guide on AltFTool.`,
    path: `/top9/${slug}`,
    image: getTop9Image(item),
    type: getTop9PublishedDate(item) ? "article" : "website",
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const item = getTop9Item(slug);

  if (!item) notFound();

  const title = getTop9Title(item);
  const description = getTop9Description(item);
  const image = getTop9Image(item);
  const category = getTop9Category(item);
  const publishedDate = getTop9PublishedDate(item);
  const relatedItems = getRelatedContentForPreset(
    {
      href: `/top9/${slug}`,
      title,
      description,
      tags: [category, ...slug.split("-")],
      section: "top9",
    },
    "editorial"
  );
  // ListItem.position mirrors what a reader sees: the markup below renders
  // item.top in array order with a visible rank badge ({index + 1}) beside
  // each entry, so asserting an ordered list here is a description of the
  // page rather than a claim invented for the schema.
  const rankedItems = Array.isArray(item.top)
    ? item.top.filter(Boolean).map((name, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: String(name),
      }))
    : [];
  // Only stored copy counts as a description. getTop9Description() synthesises
  // "…a concise ranked list, highlights, and quick context" for the three
  // entries that ship without one; that sentence describes a page template,
  // not the subject, so it stays in the meta description and out of the graph.
  const storedDescription = item.desc || item.description || "";
  const pageUrl = absoluteUrl(`/top9/${slug}`);
  // The visible pill (item.cat / item.prefix) mixes real topics ("Gaming",
  // "Movies") with list flavour ("Best", "Greatest", "Top Ten"), so it is not
  // emitted as about/genre — half the values would be a false topic claim.
  const baseSchema = {
    "@context": "https://schema.org",
    name: title,
    url: pageUrl,
    image: absoluteUrl(image),
    inLanguage: "en",
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    ...(storedDescription ? { description: storedDescription } : {}),
  };
  // Type follows what the page actually renders. Only entries carrying a real
  // `top` array collect anything, so only those are a CollectionPage; the rest
  // are a heading, a hero image and one paragraph, which is a WebPage. An
  // Article claim needs the stored publication date to back it.
  const primarySchema = rankedItems.length
    ? {
        ...baseSchema,
        "@type": "CollectionPage",
        "@id": `${pageUrl}#collection`,
        mainEntity: {
          "@type": "ItemList",
          name: `${title} ranked picks`,
          numberOfItems: rankedItems.length,
          itemListElement: rankedItems,
        },
      }
    : publishedDate
      ? {
          ...baseSchema,
          "@type": "Article",
          "@id": `${pageUrl}#article`,
          headline: title,
          datePublished: publishedDate,
          // No dateModified: the record carries one date, and repeating it as
          // dateModified would assert "never revised since publication", which
          // nothing in the data establishes.
          // No byline exists in the data either; the site itself published
          // these, so the organisation node is the honest author, never a Person.
          author: { "@id": `${getSiteUrl()}/#organization` },
        }
      : {
          ...baseSchema,
          "@type": "WebPage",
          "@id": `${pageUrl}#webpage`,
        };

  return (
    <section className="top9-page px-4 md:px-6 py-10">
      <JsonLd
        id={`top9-schema-${slug}`}
        data={[
          primarySchema,
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Top9", path: "/top9" },
            { name: title, path: `/top9/${slug}` },
          ]),
        ]}
      />

      <div className="top9-image-frame max-w-5xl mx-auto overflow-hidden rounded-3xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} className="w-full h-[260px] sm:h-[380px] md:h-[520px] object-cover" />
      </div>

      <div className="max-w-5xl mx-auto mt-8">
        <span className="top9-pill inline-flex items-center text-sm font-medium px-4 py-2 rounded-full">
          {category}
        </span>

        <h1 className="text-3xl md:text-5xl font-extrabold text-(--foreground) leading-tight mt-6">
          {title}
        </h1>

        {item.date && (
          <p className="top9-muted-text text-sm mt-4">
            {item.date}
          </p>
        )}

        <p className="top9-muted-text text-[17px] leading-8 mt-8">
          {description}
        </p>

        {item.top && (
          <div className="mt-12">
            <h2 className="text-2xl md:text-3xl font-bold text-(--foreground) mb-6">
              Top Picks
            </h2>

            <div className="space-y-4">
              {item.top.map((el, index) => (
                <div
                  key={index}
                  className="top9-card flex items-center gap-4 rounded-2xl px-5 py-4"
                >
                  <div className="top9-primary-action w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0">
                    {index + 1}
                  </div>

                  <p className="text-lg font-medium text-(--foreground)">
                    {el}
                  </p>

                </div>
              ))}
            </div>
          </div>
        )}

        <RelatedContentSection
          embedded
          className="mt-12"
          title="Keep exploring AltFTool"
          items={relatedItems}
          path={`/top9/${slug}`}
          jsonLdName={`Related to ${title}`}
        />
      </div>
    </section>
  );
}
