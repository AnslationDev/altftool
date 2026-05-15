import Hero from "../components/Hero";
import Socials from "../components/Socials";
import HowItWorks from "../components/Howitworks";
import Categories from "../components/Categories";
import Trust from "../components/Trust";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/Faq";

export default function PersonalityTestPage() {
  return (
    <main className="w-full personality-bg">
      <Hero />
      <Socials />
      <HowItWorks />
      <Categories />
      <Trust />
      <Testimonials />
      <FAQ />
    </main>
  );
}