import HeroSection from "@/app/tripfindbox/components/HeroSection";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

// Always render fresh so content edited in the admin panel reflects immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return createPageMetadata({
    title: "TripFindBox | Flight Search, Travel Deals & Route Planning",
    description: "Search flights, compare routes, and discover travel deals with TripFindBox — a booking-first travel experience.",
    path: "/tripfindbox",
  });
}

export default function Home() {
  return <HeroSection />;
}
