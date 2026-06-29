"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Youtube, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const navLinks = [
  { label: "Sports", href: "/fact-net/categories/sports-culture" },
  { label: "Future Living", href: "/fact-net/categories/future-living" },
  { label: "Science & Nature", href: "/fact-net/categories/science-nature" },
  { label: "Digital Culture", href: "/fact-net/categories/digital-culture" },
  { label: "Design & Wellness", href: "/fact-net/categories/design-wellness" },
  { label: "Categories", href: "/fact-net/categories" },
  { label: "Latest", href: "/fact-net/listings" },
  { label: "Search", href: "/fact-net/search" },
  { label: "...", href: "/fact-net/listings" },
];

function FactNetLogo() {
  return (
    <Link href="/fact-net" className="fn-logo" aria-label="Fact Hub home">
      <span className="fn-logo-tiles" aria-hidden="true">
        {["F", "A", "C", "T"].map((letter) => (
          <span key={letter}>{letter}</span>
        ))}
      </span>
      <span className="fn-logo-text">HUB</span>
    </Link>
  );
}

export default function FactNetNav() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const pathname = usePathname();

  return (
    <header className="fn-site-header">
      <div className="fn-brand-row">
        <div className="fn-brand-inner">
          <FactNetLogo />
          <p className="fn-tagline">Turn Your Curiosity Into Discovery</p>

          <div className="fn-header-tools">
            <button
              onClick={toggleTheme}
              className="fn-theme-toggle"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? <Sun className="fn-icon" /> : <Moon className="fn-icon" />}
            </button>
            <Link href="/fact-net/listings" className="fn-youtube-link" aria-label="Browse featured facts">
              <Youtube className="fn-icon" />
            </Link>
            <form action="/fact-net/search" className="fn-header-search">
              <label className="fn-sr-only" htmlFor="fn-header-search">
                Search original fact topics
              </label>
              <input id="fn-header-search" name="q" placeholder="Search" />
              <button type="submit" aria-label="Search">
                <Search className="fn-icon" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <nav className="fn-category-strip" aria-label="Fact-Net sections">
        <div className="fn-category-strip-inner">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/fact-net/listings" && pathname.startsWith(link.href + "/"));
            return (
              <Link 
                key={`${link.href}-${link.label}`} 
                href={link.href}
                className={isActive ? "fn-active" : ""}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
