import CategoryDetail from "../../pages/CategoryDetail";
import { formatCount, getCategoryByPath } from "../../data/factNetData";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const categoryPath = Array.isArray(resolvedParams?.categoryPath)
    ? resolvedParams.categoryPath.join("/")
    : "";
  const category = getCategoryByPath(categoryPath);

  if (!category) {
    return {
      title: "Category not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${category.name} Fact Hub`,
    description: `Browse ${formatCount(category.count)} original Fact Hub topics in ${category.name}.`,
    alternates: {
      canonical: `/fact-net/categories/${category.categoryPath}`,
    },
  };
}

export default async function Page({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const categoryPath = Array.isArray(resolvedParams?.categoryPath)
    ? resolvedParams.categoryPath.join("/")
    : "";
  return <CategoryDetail categoryPath={categoryPath} searchParams={resolvedSearchParams} />;
}
