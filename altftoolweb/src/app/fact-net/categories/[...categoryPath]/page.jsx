import CategoryDetail from "../../pages/CategoryDetail";
import { formatCount, getCategoryByPath } from "../../data/factNetData";
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

  return createPageMetadata({
    title: `${category.name} Fact Hub`,
    description: `Browse ${formatCount(category.count)} original Fact Hub topics in ${category.name}.`,
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
