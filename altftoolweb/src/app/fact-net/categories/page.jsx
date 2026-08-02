import Categories from "../pages/Categories";
import { formatCount, getAllCategories, getInventoryStats } from "../data/factNetData";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const stats = getInventoryStats();
  // The old description was 64 characters ("Browse 5 categories from the
  // original AltFTool Fact Hub catalog.") — too thin to earn a click, and its
  // noun was hardcoded plural against a live count. Naming the categories is
  // what a searcher on this page is actually looking for; the counts come from
  // the same inventory the page renders.
  const names = [...getAllCategories()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .map((category) => category.name);
  const categoryWord = stats.categoryCount === 1 ? "category" : "categories";
  const factWord = stats.factCount === 1 ? "fact" : "facts";
  const guideWord = stats.postCount === 1 ? "guide" : "guides";
  const nameList =
    names.length > 1
      ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
      : names[0] || "";
  const counts = `${formatCount(stats.factCount)} original ${factWord} across ${formatCount(stats.postCount)} ${guideWord}.`;
  const withNames = `Browse ${formatCount(stats.categoryCount)} Fact Hub ${categoryWord}: ${nameList} — ${counts}`;

  return createPageMetadata({
    title: "Fact Hub Categories",
    description:
      nameList && withNames.length <= 158
        ? withNames
        : `Browse every category in the original AltFTool Fact Hub catalog — ${formatCount(stats.categoryCount)} ${categoryWord} holding ${counts}`,
    path: "/fact-net/categories",
  });
}

export default function Page() {
  return <Categories />;
}
