import { getAllCategories } from "../data/categories";
import { getAllRankings } from "../data/rankings";
import CategoriesHero from "../components/CategoriesHero";
import CategoriesDirectory from "../components/CategoriesDirectory";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "All Categories",
    description:
      "Browse every Top5 category — the full directory of fields the ranking platform covers.",
    path: "/top5/categories",
    noindex: true,
    follow: true,
  });
}

export default async function Top5CategoriesPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const rawQuery = Array.isArray(resolvedSearchParams?.q)
    ? resolvedSearchParams.q[0]
    : resolvedSearchParams?.q;
  const initialQuery = typeof rawQuery === "string" ? rawQuery.trim().slice(0, 80) : "";
  const categories = getAllCategories();
  const rankings = getAllRankings();
  const publishedByField = rankings.reduce((counts, ranking) => {
    const key = ranking.category.toLowerCase();
    counts.set(key, (counts.get(key) || 0) + 1);
    return counts;
  }, new Map());
  const directoryCategories = categories.map((category) => ({
    ...category,
    publishedCount: publishedByField.get(category.name.toLowerCase()) || 0,
  }));
  const rankedEntriesCount = rankings.reduce(
    (total, ranking) => total + ranking.items.length,
    0,
  );

  return (
    <div>
      <CategoriesHero
        fieldsCount={categories.length}
        publishedRankingsCount={rankings.length}
        rankedEntriesCount={rankedEntriesCount}
      />
      <CategoriesDirectory
        key={initialQuery}
        categories={directoryCategories}
        initialQuery={initialQuery}
      />
    </div>
  );
}
