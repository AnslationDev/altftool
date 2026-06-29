"use client";

import Link from "next/link";
import { Home, Menu, Moon, Sparkles, Sun, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const navItems = [
  { label: "Services", href: "/homeserv#services" },
  { label: "Process", href: "/homeserv#process" },
  { label: "Reviews", href: "/homeserv#reviews" },
  { label: "Contact", href: "/homeserv/contact-us" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <>
      <header className="hs-header">
        <Link className="hs-brand" href="/homeserv" aria-label="QuoteNest Pros home">
          <span className="hs-brand-mark">
            <Home className="hs-brand-home-icon" size={21} strokeWidth={2.4} />
            <Sparkles className="hs-brand-spark-icon" size={13} strokeWidth={2.6} />
          </span>
          <span>
            QuoteNest <strong>Pros</strong>
          </span>
        </Link>

        <nav className="hs-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hs-header-actions">
          <span className="hs-availability">
            <span className="hs-availability-dot" aria-hidden="true" />
            27 pros online
          </span>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="hs-theme-btn"
          >
            <Sun size={16} className={`hs-theme-icon-sun ${isDark ? "hs-theme-icon-hidden" : ""}`} />
            <Moon size={16} className={`hs-theme-icon-moon ${isDark ? "" : "hs-theme-icon-hidden"}`} />
          </button>

          <button
            className="hs-mobile-menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {menuOpen ? (
        <div className="hs-mobile-menu">
          <button
            className="hs-mobile-menu-btn"
            style={{ position: "absolute", top: 16, right: 16 }}
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={toggleTheme}
            className="hs-mobile-theme-btn"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            {isDark ? "Light mode" : "Dark mode"}
          </button>
        </div>
      ) : null}
    </>
  );
}
