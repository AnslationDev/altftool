import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Headphones, PhoneCall, Search, X } from "lucide-react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import WhyChooseUs from "./components/WhyChooseUs";
import Services from "./components/Services";
import Projects from "./components/Projects";
import Process from "./components/Process";
import BeforeAfter from "./components/BeforeAfter";
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
  const [searchPopup, setSearchPopup] = useState("hidden");

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

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    let resultTimer;
    const openSearchPopup = (event) => {
      const target = event.target.closest("button, a");
      if (
        !target ||
        target.closest("[data-siding-search-popup]") ||
        target.closest("[data-siding-call-popup]") ||
        target.closest("[data-siding-navbar]") ||
        target.closest("[data-siding-blog]") ||
        target.closest("[data-siding-faq]") ||
        target.closest("#contact form")
      ) {
        return;
      }

      const href = target.getAttribute("href") || "";
      const isPageAction =
        target.tagName === "BUTTON" ||
        href.startsWith("#contact") ||
        href.startsWith("#services") ||
        href.startsWith("#blog") ||
        href.startsWith("tel:");

      if (!isPageAction) return;

      event.preventDefault();
      setSearchPopup("loading");
      window.clearTimeout(resultTimer);
      resultTimer = window.setTimeout(() => setSearchPopup("result"), 850);
    };

    document.addEventListener("click", openSearchPopup);

    return () => {
      window.clearTimeout(resultTimer);
      document.removeEventListener("click", openSearchPopup);
    };
  }, []);

  const closeSearchPopup = () => setSearchPopup("hidden");

  if (blogSlug) {
    return (
      <div className="min-h-screen bg-surface text-foreground font-sans antialiased overflow-x-hidden">
        <Navbar />
        <BlogArticle slug={blogSlug} />
        <Footer />
        <SidingSearchPopup state={searchPopup} onClose={closeSearchPopup} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-foreground font-sans antialiased overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <WhyChooseUs />
        <Services />
        <Projects />
        <Process />
        <BeforeAfter />
        {/*
          <Testimonials /> removed. It rendered five reviews with names and US
          cities — Jessica Hartman (Naples, FL), Marcus Williams (Denver, CO),
          Priya & Daniel Shah (Austin, TX), Eleanor Whitfield (Boston, MA),
          Carlos Mendoza (Phoenix, AZ) — with stock portraits. Nobody wrote any
          of them. The component file is left in place for whenever there are
          real reviews, given with permission.
        */}
        <About />
        <FAQ />
        <Blog />
        <EstimateForm />
        <ServiceAreas />
        <CTA />
      </main>
      <Footer />
      <SidingSearchPopup state={searchPopup} onClose={closeSearchPopup} />
    </div>
  );
}

function getBlogSlug() {
  if (typeof window === "undefined") return "";
  const match = window.location.hash.match(/^#blog\/([^/]+)$/);
  return match?.[1] || "";
}

function SidingSearchPopup({ state, onClose }) {
  return (
    <AnimatePresence>
      {state !== "hidden" && (
        <motion.div
          data-siding-search-popup
          className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-soft/80 px-4 py-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-live="polite"
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-surface px-5 py-8 text-center shadow-premium sm:px-8 sm:py-10"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 rounded-full border border-border bg-surface p-2 text-foreground/75 transition hover:border-primary hover:text-primary"
              aria-label="Close popup"
            >
              <X className="h-5 w-5" />
            </button>

            {state === "loading" ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-5">
                <div className="h-16 w-16 animate-spin rounded-full border-[6px] border-surface-soft border-t-primary" />
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
                    Searching...
                  </h2>
                  <p className="mt-2 text-base font-medium text-foreground/75">
                    Please wait while we check the best available options.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative mx-auto max-w-xl">
                <div className="pointer-events-none absolute left-0 top-24 h-4 w-4 rounded-full border-4 border-surface-soft" />
                <div className="pointer-events-none absolute bottom-8 left-10 h-6 w-6 rounded-full border-4 border-surface-soft" />
                <div className="pointer-events-none absolute right-10 top-28 h-2.5 w-2.5 rounded-full bg-secondary" />

                <h2 className="font-display text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
                  Sorry! No Result Found.
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-base font-medium leading-relaxed text-foreground sm:text-lg">
                  Let our agents help you find the best siding option for your home exterior.
                </p>

                <div className="mx-auto mt-7 flex h-24 w-24 items-center justify-center rounded-full bg-surface-soft text-primary shadow-premium sm:h-28 sm:w-28">
                  <Headphones className="h-14 w-14 sm:h-16 sm:w-16" strokeWidth={1.8} />
                </div>

                <h3 className="mt-6 font-display text-2xl font-extrabold text-foreground sm:text-3xl">
                  Now Call Toll Free
                </h3>
                <a
                  href="tel:+18005551234"
                  className="mx-auto mt-3 flex max-w-lg items-center justify-center gap-3 rounded-2xl bg-primary px-4 py-3 text-2xl font-extrabold text-primary-foreground shadow-premium transition hover:bg-primary-active sm:text-3xl"
                >
                  <PhoneCall className="h-6 w-6 sm:h-7 sm:w-7" />
                  +1-800-555-1234
                </a>
                <p className="mt-4 text-xl font-extrabold text-foreground sm:text-2xl">
                  We are available 24x7
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mx-auto mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-bold text-primary-foreground shadow-premium transition hover:bg-primary-active"
                >
                  <Search className="h-5 w-5" />
                  Modify Search
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
