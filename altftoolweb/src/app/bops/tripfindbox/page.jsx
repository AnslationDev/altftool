import HeroSection from "./components/HeroSection";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

// Always render fresh so content edited in the admin panel reflects immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return createPageMetadata({
    title: "TripFindBox | Flights, Deals & Route Planning",
    description: "Search flights, compare routes, and discover travel deals with TripFindBox — a booking-first travel experience.",
    path: "/bops/tripfindbox",
  });
}

export default function Home() {
  return <HeroSection />;
}
