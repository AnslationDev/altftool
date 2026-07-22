import { notFound } from "next/navigation";
import HeroSection from "./components/HeroSection";
import Section1Wrapper from "./components/Section1";
import Section2Wrapper from "./components/Section2";
import Section3Wrapper from "./components/Section3";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const revalidate = 3600; // Cache dynamic route configurations for 1 hour

async function getDynamicRouteConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36";
  const path = "projects/altftool/navigation/dynamic";
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}?key=${apiKey}`;

  try {
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return null;
    const payload = await res.json();
    
    const enabled = payload.fields?.enabled?.booleanValue ?? false;
    const slug = payload.fields?.slug?.stringValue ?? "";
    
    return { enabled, slug };
  } catch (error) {
    console.error("Failed to fetch dynamic route configuration:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const config = await getDynamicRouteConfig();

  if (!config || !config.enabled || config.slug !== slug) {
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
  if (!config || !config.enabled || config.slug !== slug) {
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