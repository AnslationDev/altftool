import Hero from "./components/Hero";
import CategoryMarquee from "./components/CategoryMarquee";
import Top5Showcase from "./components/Top5Showcase";
import TrendingSection from "./components/TrendingSection";
import CategoriesSection from "./components/CategoriesSection";
import FeaturedCollectionsSection from "./components/FeaturedCollectionsSection";
import PopularSection from "./components/PopularSection";
import LiveActivitySection from "./components/LiveActivitySection";
import StatsBand from "./components/StatsBand";
import MethodologyIntro from "./components/MethodologyIntro";
import MethodologySteps from "./components/MethodologySteps";
import ClosingCta from "./components/ClosingCta";
import Newsletter from "./components/Newsletter";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Discover the World's Top 5 Rankings",
    description:
      "A more considered way to find the people, products, places, and ideas that define what is exceptional. Explore Top5 rankings by category and country.",
    path: "/top5",
    noindex: true,
    follow: true,
  });
}

export default function Top5HomePage() {
  return (
    <>
      <Hero />
      <CategoryMarquee />
      <Top5Showcase />
      <TrendingSection />
      <CategoriesSection />
      <FeaturedCollectionsSection />
      <PopularSection />
      <LiveActivitySection />
      <StatsBand />
      <MethodologyIntro />
      <MethodologySteps />
      <ClosingCta />
      <Newsletter />
    </>
  );
}
