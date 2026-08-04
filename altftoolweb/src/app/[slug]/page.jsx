import { notFound } from "next/navigation";
import HeroSection from "./components/HeroSection";
import Section1Wrapper from "./components/Section1";
import Section2Wrapper from "./components/Section2";
import Section3Wrapper from "./components/Section3";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import {
  fetchDynamicRouteConfig,
  isDynamicRouteActiveForSlug,
} from "./data/dynamicRoute";

export const revalidate = 300;

async function getDynamicRouteConfig() {
  try {
    return await fetchDynamicRouteConfig();
  } catch (error) {
    console.error("Failed to fetch dynamic route configuration:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const config = await getDynamicRouteConfig();

  if (!isDynamicRouteActiveForSlug(config, slug)) {
    return createPageMetadata({
      title: "Page Not Found",
      description: "The requested page does not exist.",
      path: `/${slug}`,
      noindex: true,
    });
  }

  return createPageMetadata({
    title: `${config.slug.toUpperCase()} Deals & Special Offers`,
    description: "Discover curated styles, fresh arrivals, and special promotions on AltFTool.",
    path: `/${slug}`,
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const config = await getDynamicRouteConfig();

  // If the dynamic route is disabled or the slug is incorrect, return 404
  if (!isDynamicRouteActiveForSlug(config, slug)) {
    notFound();
  }

  return (
    <div>
      <HeroSection />
      <Section1Wrapper />
      <Section2Wrapper />
      <Section3Wrapper />
    </div>
  );
}
