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

  // Was `Browse ${count} original Fact Hub topics in ${name}.` — 51–55
  // characters, under the floor, and "1 original Fact Hub topics" on the three
  // categories that hold a single guide. The authored category blurb already
  // says what the section covers, so it leads and the live count follows it.
  const guideWord = category.count === 1 ? "fact guide" : "fact guides";
  const blurb = String(category.description || "").trim() ||
    `Original AltFTool fact guides about ${category.name}.`;
  const withCount = `${blurb} ${formatCount(category.count)} ${guideWord} in the AltFTool Fact Hub.`;

  return createPageMetadata({
    title: `${category.name} Fact Hub`,
    description: withCount.length <= 158 ? withCount : blurb,
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
