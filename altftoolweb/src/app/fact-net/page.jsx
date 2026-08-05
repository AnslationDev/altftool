import Home from "./pages/Home";
import { formatCount, getInventoryStats } from "./data/factNetData";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const stats = getInventoryStats();
  // 93 characters previously, which left most of a mobile SERP snippet unused
  // and mentioned neither the fact count nor the categories — the two things
  // this hub actually offers. Both numbers come from the same inventory the
  // page renders, so the copy cannot drift from what a visitor lands on.
  const guideWord = stats.postCount === 1 ? "guide" : "guides";
  const factWord = stats.factCount === 1 ? "fact" : "facts";
  const categoryWord = stats.categoryCount === 1 ? "category" : "categories";
  const full = `Browse ${formatCount(stats.postCount)} original topic ${guideWord} holding ${formatCount(stats.factCount)} owned ${factWord} across ${formatCount(stats.categoryCount)} ${categoryWord}, each with its own local images, fast search and clean navigation.`;
  return createPageMetadata({
    title: "Fact-Net - Original Facts, Categories and Search",
    description:
      full.length <= 158
        ? full
        : `Browse ${formatCount(stats.postCount)} original topic ${guideWord} holding ${formatCount(stats.factCount)} owned ${factWord} across ${formatCount(stats.categoryCount)} ${categoryWord}, with local images and fast search.`,
    path: "/fact-net",
  });
}

export default function Page() {
  return <Home />;
}
