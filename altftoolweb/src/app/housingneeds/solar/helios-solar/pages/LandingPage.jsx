import { motion, useScroll } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import HeroSection from "../components/HeroSection.jsx";
import StatsSection from "../components/StatsSection.jsx";
import RoofingSection from "../components/RoofingSection.jsx";
import PanelsSection from "../components/PanelsSection.jsx";
import HowItWorksSection from "../components/HowItWorksSection.jsx";
import StorageSection from "../components/StorageSection.jsx";
import AppShowcaseSection from "../components/AppShowcaseSection.jsx";
import ReviewsSection from "../components/ReviewsSection.jsx";
import GallerySection from "../components/GallerySection.jsx";
import FAQSection from "../components/FAQSection.jsx";
import BlogSection from "../components/BlogSection.jsx";
import ContactSection from "../components/ContactSection.jsx";
import Footer from "../components/Footer.jsx";

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  return (
    <div className="min-h-screen bg-black">
      <motion.div
        className="scroll-progress-bar"
        style={{ scaleX: scrollYProgress }}
      />
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <RoofingSection />
        <PanelsSection />
        <HowItWorksSection />
        <StorageSection />
        <AppShowcaseSection />
        <ReviewsSection />
        <GallerySection />
        <BlogSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
