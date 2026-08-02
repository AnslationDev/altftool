import CategoryDetail from "../../pages/CategoryDetail";
import { getCategoryByPath } from "../../data/factNetData";
import { toMetaSnippet } from "../../metaSnippet";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const categoryPath = Array.isArray(resolvedParams?.categoryPath)
    ? resolvedParams.categoryPath.join("/")
    : "";
  const category = getCategoryByPath(categoryPath);

  if (!category) {
    return createPageMetadata({
      title: "Category not found",
      path: `/fact-net/categories/${categoryPath}`,
      noindex: true,
      follow: false,
    });
  }

  // The old string was `Browse ${count} original Fact Hub topics in ${name}.`
  // — 52 characters on /fact-net/categories/sports-culture, well under the 70
  // a snippet needs, and it read "Browse 1 original Fact Hub topics" because
  // the noun was never pluralised against the count. Every category in
  // data/aiFactsData.js already carries a 104-112 character description, so
  // lead with the category's own words and let the count agree with itself.
  const count = Number(category.count) || 0;
  const description = toMetaSnippet(
    `${category.description} Browse ${count} ${count === 1 ? "topic" : "topics"} in this Fact Hub category.`,
  );

  return createPageMetadata({
    title: `${category.name} Fact Hub`,
    description,
    path: `/fact-net/categories/${category.categoryPath}`,
  });
}

export default async function Page({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const categoryPath = Array.isArray(resolvedParams?.categoryPath)
    ? resolvedParams.categoryPath.join("/")
    : "";
  return <CategoryDetail categoryPath={categoryPath} searchParams={resolvedSearchParams} />;
}
