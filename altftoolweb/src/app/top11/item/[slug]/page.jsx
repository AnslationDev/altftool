import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import RankingDetailPage from "../../components/ranking/RankingDetailPage";
import {
  getRanking,
  getRankingEntries,
  getSubjectLabel,
  rankings,
  toSlug,
} from "../../data/mock-data";
import { isTop11Indexable } from "../../data/indexPolicy";

export const dynamic = "force-static";

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return rankings.map((ranking) => ({ slug: ranking.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const ranking = getRanking(slug);

  if (!ranking) {
    return {
      title: "Top 11 Ranking Not Found",
      robots: { index: false, follow: true },
    };
  }

  return createPageMetadata({
    title: ranking.title,
    description: ranking.description,
    path: `/top11/item/${slug}`,
    image: ranking.image,
    noindex: !isTop11Indexable(`/top11/item/${slug}`),
    follow: true,
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const ranking = getRanking(slug);

  if (!ranking) notFound();

  const entries = getRankingEntries(ranking);
  const categorySlug = toSlug(ranking.category);
  const indexable = isTop11Indexable(`/top11/item/${slug}`);

  return (
    <>
      <JsonLd
        id={`top11-item-schema-${slug}`}
        data={[
          // The ItemList mirrors the rendered <ol> exactly, and is emitted only
          // while the page is in the index. No AggregateRating is emitted: the
          // scores on this page are illustrative, not measured.
          indexable
            ? {
                "@context": "https://schema.org",
                "@type": "ItemList",
                name: ranking.title,
                description: ranking.description,
                numberOfItems: entries.length,
                itemListOrder: "https://schema.org/ItemListOrderDescending",
                itemListElement: entries.map((entry, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: entry.name,
                })),
              }
            : null,
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Top 11", path: "/top11" },
            { name: ranking.category, path: `/top11/category/${categorySlug}` },
            { name: ranking.title, path: `/top11/item/${slug}` },
          ]),
        ]}
      />
      <RankingDetailPage
        ranking={ranking}
        entries={entries}
        subjectLabel={getSubjectLabel(ranking)}
        categorySlug={categorySlug}
      />
    </>
  );
}
