import Hero from "../components/Hero";
import HowItWorks from "../components/Howitworks";
import Categories from "../components/Categories";
import Trust from "../components/Trust";
import FAQ from "../components/Faq";

export default function PersonalityTestPage() {
  return (
    <main className="w-full personality-page personality-bg">
      <Hero />
      <HowItWorks />
      <Categories />
      <Trust />
      {/* Testimonials is intentionally not mounted. components/Testimonials.jsx
          holds three invented reviewers — names, @handles, star ratings and
          avatar photos — for a test that collects no reviews. It read as real
          social proof. Do not re-mount it without real, attributable reviews. */}
      <FAQ />
    </main>
  );
}
