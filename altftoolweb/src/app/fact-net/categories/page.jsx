import Categories from "../pages/Categories";
import { formatCount, getInventoryStats } from "../data/factNetData";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const stats = getInventoryStats();
  return createPageMetadata({
    title: "Fact Hub Categories",
    description: `Browse ${formatCount(stats.categoryCount)} categories from the original AltFTool Fact Hub catalog.`,
    path: "/fact-net/categories",
  });
}

export default function Page() {
  return <Categories />;
}
