"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const CONTACT_URL = "/policypages/contact";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = pathname === "/hvac" || pathname === "/";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? "bg-[#F7F3EB]/90 backdrop-blur-xl border-b border-[#D4C9B5]/40 py-0"
        : "bg-transparent border-b border-transparent py-2"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/hvac"
            className="flex items-center gap-3 transition-transform duration-500 hover:scale-[1.02]"
          >
            {/* <div className="w-10 h-10 rounded-xl bg-[#C5D2E8] flex items-center justify-center text-[#1a1a1a] font-bold text-lg">
              C
            </div> */}
            <span className={`font-serif-display text-3xl font-bold tracking-tight transition-colors duration-500 ${scrolled ? "text-[#1a1a1a]" : "text-white"
              }`}>
              ClimaTech<span className="text-[#C5D2E8]">.</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {["Services", "About", "Portfolio", "Testimonials", "Contact"].map(
              (item) => (
                <Link
                  key={item}
                  href={isHome ? `#${item.toLowerCase()}` : `/hvac#${item.toLowerCase()}`}
                  className={`text-sm  font-semibold uppercase  tracking-wide relative group transition-colors duration-500 ${scrolled ? "text-[#555] hover:text-[#1a1a1a]" : "text-white/90 hover:text-white"
                    }`}
                >
                  {item}
                  <span className="absolute left-0 -bottom-1 w-0 h-px bg-[#C5D2E8] transition-all duration-300 group-hover:w-full" />
                </Link>
              )
            )}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-6">
            <a
              href={CONTACT_URL}
              className={`hidden md:flex items-center text-1xl font-semibold gap-2 transition-colors  duration-500 ${scrolled ? "text-[#555] hover:text-[#1a1a1a]" : "text-white/80 hover:text-white"
                }`}
            >
              <svg
                className={`w-5 h-5 transition-colors duration-500 ${scrolled ? "text-[#5a6f8a]" : "text-[#C5D2E8]"
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M21 11.5c0 4.142-4.03 7.5-9 7.5a10.2 10.2 0 01-3.4-.57L3 20.5l1.7-3.6A7.2 7.2 0 013 11.5C3 7.358 7.03 4 12 4s9 3.358 9 7.5z"
                />
              </svg>
              Contact us
            </a>
            <Link
              href="#contact"
              className="btn-primary px-6 py-3 rounded-full text-sm font-semibold"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
