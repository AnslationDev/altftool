import Home from "./pages/Home";
import { formatCount, getInventoryStats } from "./data/factNetData";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const stats = getInventoryStats();
  return createPageMetadata({
    title: "Fact-Net - Original Facts, Categories and Search",
    description: `Browse ${formatCount(stats.postCount)} original topic guides with owned facts, local images, and clean category navigation.`,
    path: "/fact-net",
  });
}

export default function Page() {
  return <Home />;
}
