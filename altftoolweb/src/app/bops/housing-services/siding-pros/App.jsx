import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import WhyChooseUs from "./components/WhyChooseUs";
import Services from "./components/Services";
import Projects from "./components/Projects";
import Process from "./components/Process";
import BeforeAfter from "./components/BeforeAfter";
import Testimonials from "./components/Testimonials";
import About from "./components/About";
import FAQ from "./components/FAQ";
import Blog from "./components/Blog";
import BlogArticle from "./components/BlogArticle";
import EstimateForm from "./components/EstimateForm";
import ServiceAreas from "./components/ServiceAreas";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function App() {
  const [blogSlug, setBlogSlug] = useState(() => getBlogSlug());

  useEffect(() => {
    const onHashChange = () => setBlogSlug(getBlogSlug());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (!blogSlug && typeof window !== "undefined" && window.location.hash === "#blog") {
      setTimeout(() => {
        const el = document.getElementById("blog");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    }
  }, [blogSlug]);

  if (blogSlug) {
    return (
      <div className="siding-pros-page min-h-screen bg-white text-[#111827] font-sans antialiased overflow-x-hidden">
        <Navbar />
        <BlogArticle slug={blogSlug} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans antialiased overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <WhyChooseUs />
        <Services />
        <Projects />
        <Process />
        <BeforeAfter />
        <Testimonials />
        <About />
        <FAQ />
        <Blog />
        <EstimateForm />
        <ServiceAreas />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function getBlogSlug() {
  if (typeof window === "undefined") return "";
  const match = window.location.hash.match(/^#blog\/([^/]+)$/);
  return match?.[1] || "";
}
