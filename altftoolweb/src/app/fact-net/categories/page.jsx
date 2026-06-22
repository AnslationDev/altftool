import Categories from "../pages/Categories";
import { formatCount, getInventoryStats } from "../data/factNetData";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const stats = getInventoryStats();
  return {
    title: "Fact Hub Categories",
    description: `Browse ${formatCount(stats.categoryCount)} categories from the original AltFTool Fact Hub catalog.`,
    alternates: {
      canonical: "/fact-net/categories",
    },
  };
}

export default function Page() {
  return <Categories />;
}
