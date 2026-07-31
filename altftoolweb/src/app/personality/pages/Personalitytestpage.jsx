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
      <FAQ />
    </main>
  );
}
