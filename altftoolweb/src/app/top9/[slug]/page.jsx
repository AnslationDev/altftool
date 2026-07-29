import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import "../top9.css";
import {
  absoluteUrl,
  compactBrandedTitle,
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  getTop9Category,
  getTop9Description,
  getTop9Image,
  getTop9Item,
  getTop9Items,
  getTop9PublishedDate,
  getTop9RankedEntries,
  getTop9Title,
  isTop9Indexable,
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

  // The description used to promise "all nine ranked picks" on every route.
  // Only three lists carry ranked entries at all, and those carry three each,
  // so the sentence is now built from the entries the page really renders.
  const rankedCount = getTop9RankedEntries(item).length;

  return createPageMetadata({
    title: compactBrandedTitle(`${getTop9Title(item)} | Top9`),
    description: rankedCount
      ? `${getTop9Description(item)} See all ${rankedCount} ranked picks on AltFTool.`
      : `${getTop9Description(item)} Read the topic summary on AltFTool.`,
    path: `/top9/${slug}`,
    image: getTop9Image(item),
    type: getTop9PublishedDate(item) ? "article" : "website",
    // A list with no ranking has nothing to rank for. Those routes stay live
    // and stay linked, but leave the index. `follow` stays true so the links
    // out of them still reach the pages that should rank.
    noindex: !isTop9Indexable(item),
    follow: true,
  });
}

/**
 * The list subject with the inaccurate "Top 9" prefix stripped, e.g.
 * "Top 9 Best NBA Players Heading Into 2026" -> "NBA Players Heading Into 2026".
 */
function getListSubject(title) {
  return title
    .replace(/^top\s*(9|nine)\s*/i, "")
    .replace(/^(best|greatest|most)\s+/i, "")
    .trim();
}

/**
 * Question-form heading over the ranking. When the source title already poses a
 * question, its own wording is kept; otherwise the question is built from the
 * subject and the real entry count, so it never advertises nine picks.
 */
function getRankingHeading(title, rankedCount) {
  if (/\?\s*$/.test(title)) return title;
  if (/^(what|why|how|which|who|when|did|is|are|does)\b/i.test(title)) {
    return `${title}?`;
  }
  return `What Are the Top ${rankedCount} ${getListSubject(title)}?`;
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
  const rankedEntries = getTop9RankedEntries(item);
  const indexable = isTop9Indexable(item);
  const rankingHeading = getRankingHeading(title, rankedEntries.length);
  // Schema is built from the same array the <ol> below renders, so the marked-up
  // ranking and the visible ranking can never drift apart.
  const itemListSchema = rankedEntries.length
    ? {
        "@type": "ItemList",
        name: rankingHeading,
        numberOfItems: rankedEntries.length,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: rankedEntries.map((name, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name,
        })),
      }
    : null;
  // Rich schema is only emitted on routes that are still in the index. A
  // noindexed page cannot win an Article or ItemList result, so marking one up
  // buys nothing and asks a crawler to parse a claim it will never surface.
  // The breadcrumb stays: it is navigation, and it keeps the crawl path legible.
  const primarySchema = !indexable
    ? null
    : publishedDate
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        image: absoluteUrl(image),
        mainEntityOfPage: absoluteUrl(`/top9/${slug}`),
        // Only a date that exists in the source data reaches this point; when a
        // list has none, the Article branch is skipped entirely rather than
        // stamping the page with a build date.
        datePublished: publishedDate,
        dateModified: publishedDate,
        author: {
          "@type": "Organization",
          name: "AltFTool",
        },
        ...(itemListSchema ? { mainEntity: itemListSchema } : {}),
      }
    : {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: title,
        description,
        image: absoluteUrl(image),
        url: absoluteUrl(`/top9/${slug}`),
        ...(itemListSchema ? { mainEntity: itemListSchema } : {}),
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

        {/*
          Answer-first summary, directly under the H1. Both the count and the
          leading pick are read out of the list data — nothing here is written
          per route, so it cannot describe a ranking the page does not show.
        */}
        <p className="text-[17px] md:text-lg leading-8 text-(--foreground) font-medium mt-6">
          {rankedEntries.length
            ? `This list ranks ${rankedEntries.length} ${
                rankedEntries.length === 1 ? "pick" : "picks"
              } for ${getListSubject(title)}, in order, starting with ${rankedEntries[0]}.`
            : `This is a topic summary for ${title}. It carries no ranked entries, so no ordered picks are shown below.`}
        </p>

        {publishedDate && (
          <p className="top9-muted-text text-sm mt-4">
            Published <time dateTime={publishedDate}>{item.date}</time>
          </p>
        )}

        <p className="top9-muted-text text-[17px] leading-8 mt-8">
          {description}
        </p>

        {rankedEntries.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl md:text-3xl font-bold text-(--foreground) mb-6">
              {rankingHeading}
            </h2>

            {/*
              A real <ol>: the ranking is the document order, not a stack of
              divs with a number glyph painted on. The counter is suppressed
              visually because the badge already carries the position, but the
              order survives for assistive tech, parsers and extraction.
            */}
            {/* role="list" is required: Safari/VoiceOver drops list semantics
                from any list styled `list-style: none`. */}
            <ol role="list" className="space-y-4 list-none p-0 m-0">
              {rankedEntries.map((entry, index) => (
                <li
                  key={entry}
                  className="top9-card flex items-center gap-4 rounded-2xl px-5 py-4"
                >
                  <span
                    aria-hidden="true"
                    className="top9-primary-action w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0"
                  >
                    {index + 1}
                  </span>

                  <p className="text-lg font-medium text-(--foreground)">
                    {entry}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/*
          The related band always renders — a noindexed page keeps its human
          navigation and keeps passing link equity onward. Only its ItemList
          markup is dropped when the page is out of the index.
        */}
        <RelatedContentSection
          embedded
          className="mt-12"
          title="Keep exploring AltFTool"
          items={relatedItems}
          path={`/top9/${slug}`}
          jsonLdName={indexable ? `Related to ${title}` : undefined}
        />
      </div>
    </section>
  );
}
