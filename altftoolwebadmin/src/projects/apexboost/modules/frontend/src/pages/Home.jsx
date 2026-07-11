import { lazy, Suspense } from "react";
import { useSeo } from "../hooks/useSeo";
import Hero from "../components/sections/Hero";
import TrustedBy from "../components/sections/TrustedBy";
import WhyChooseUs from "../components/sections/WhyChooseUs";
import Statistics from "../components/sections/Statistics";
import CTA from "../components/sections/CTA";

const Testimonials = lazy(() => import("../components/sections/Testimonials"));

const Fallback = () => (
  <div className="grid place-items-center py-24">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
  </div>
);

export default function Home() {
  useSeo({
    title: "ApexBoost — Digital, Affiliate & Advertising Marketing Agency",
    description:
      "Premium performance marketing agency. We grow brands through Digital Marketing, Affiliate Marketing and high-converting Advertising campaigns. ROI-focused, data-driven.",
  });

  return (
    <>
      <Hero />
      <TrustedBy />
      <WhyChooseUs />
      <Statistics />
      <Suspense fallback={<Fallback />}>
        <Testimonials />
      </Suspense>
      <CTA />
    </>
  );
}
