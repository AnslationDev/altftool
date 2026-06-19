import HeroSection from "@/app/tripfindbox/components/HeroSection";

// Always render fresh so content edited in the admin panel reflects immediately.
export const dynamic = "force-dynamic";

export default function Home() {
  return <HeroSection />;
}
