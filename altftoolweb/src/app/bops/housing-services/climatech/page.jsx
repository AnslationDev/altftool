import Header from "./components/Header";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Showcase from "./components/Showcase";
import About from "./components/About";
import WhyChooseUs from "./components/WhyChooseUs";
import Process from "./components/Process";
import Testimonials from "./components/Testimonials";
import BlogSection from "./components/BlogSection";
import FAQ from "./components/FAQ";
import CTABanner from "./components/CTABanner";
import Footer from "./components/Footer";
import PapercallInterceptor from "./components/PapercallInterceptor";

export default function Home() {
  return (
    <main className="climatech-page bg-[#060D0C] min-h-screen overflow-x-clip">
      <Header />
      <Hero />
      <Services />
      <Showcase />
      <About />
      <WhyChooseUs />
      <Process />
      <Testimonials />
      <BlogSection />
      <FAQ />
      <CTABanner />
      <Footer />
      <PapercallInterceptor />
    </main>
  );
}
