import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ScrollProgress from "./components/ui/ScrollProgress";
import ScrollToTop from "./components/ui/ScrollToTop";
import BackToTop from "./components/ui/BackToTop";
import WhatsAppButton from "./components/ui/WhatsAppButton";
import CookieConsent from "./components/ui/CookieConsent";
import NewsletterPopup from "./components/ui/NewsletterPopup";
import Home from "./pages/Home";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceCategoryPage from "./pages/ServiceCategoryPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";

/**
 * Root application shell.
 * - Sticky navbar + footer wrap every route
 * - Multi-page website with dedicated routes
 * - Global floating utilities (scroll progress, back-to-top, WhatsApp, popups)
 */
export default function App() {
  return (
    <>
      <ScrollProgress />
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:id" element={<ServiceCategoryPage />} />
          <Route path="/services/:categoryId/:itemId" element={<ServiceDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />

      {/* Global utilities */}
      <BackToTop />
      <WhatsAppButton />
      <CookieConsent />
      <NewsletterPopup />
    </>
  );
}
