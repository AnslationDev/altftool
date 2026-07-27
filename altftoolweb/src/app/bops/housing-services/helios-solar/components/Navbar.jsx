import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const CONTACT_URL = "/policypages/contact";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const navLinks = [
    { name: "Solar Roofing", id: "roofing" },
    { name: "Solar Panels", id: "panels" },
    { name: "How It Works", id: "how-it-works" },
    { name: "Reviews", id: "reviews" },
    { name: "Blog", id: "blog" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-15% 0px -45% 0px", threshold: 0.15 }
    );
    navLinks.forEach((link) => {
      const el = document.getElementById(link.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const Logo = () => (
    <div
      className="navbar-logo"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2"/><path d="M12 20v2"/>
        <path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>
        <path d="M2 12h2"/><path d="M20 12h2"/>
        <path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
      </svg>
      <span className="navbar-logo-text">HELIOS</span>
    </div>
  );

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar--scrolled" : "navbar--transparent"}`}>
        <Logo />
        <div className={`hidden lg:flex items-center space-x-8 whitespace-nowrap transition-all duration-500 ease-in-out ${
          scrolled ? "opacity-0 pointer-events-none invisible max-w-0 overflow-hidden" : "opacity-100 max-w-[800px]"
        }`}>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className={`navbar-link ${activeSection === link.id ? "navbar-link--active" : ""}`}
            >
              {link.name}
              {activeSection === link.id && (
                <span className="navbar-link-underline" />
              )}
            </button>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-6">
          <a
            href={CONTACT_URL}
            className="navbar-cta flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M8 10h.01M12 10h.01M16 10h.01M21 11.5c0 4.142-4.03 7.5-9 7.5a10.2 10.2 0 0 1-3.4-.57L3 20.5l1.7-3.6A7.2 7.2 0 0 1 3 11.5C3 7.358 7.03 4 12 4s9 3.358 9 7.5z" />
            </svg>
            <span>Contact us</span>
          </a>
        </div>
        <button
          className="lg:hidden z-50 text-white p-2 rounded hover:bg-white/10 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </nav>

      <div className={`mobile-menu ${mobileMenuOpen ? "mobile-menu--open" : ""}`}>
        <div className="flex flex-col pt-24 space-y-6 text-white">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="mobile-menu-link"
            >
              {link.name}
            </button>
          ))}
          <a
            href={CONTACT_URL}
            className="navbar-cta mt-6 w-full py-4 text-center justify-center flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M8 10h.01M12 10h.01M16 10h.01M21 11.5c0 4.142-4.03 7.5-9 7.5a10.2 10.2 0 0 1-3.4-.57L3 20.5l1.7-3.6A7.2 7.2 0 0 1 3 11.5C3 7.358 7.03 4 12 4s9 3.358 9 7.5z" />
            </svg>
            <span>Contact us</span>
          </a>
        </div>
      </div>
    </>
  );
}
