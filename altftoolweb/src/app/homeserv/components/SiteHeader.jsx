"use client";

import Link from "next/link";
import { Home, Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Services", href: "/homeserv#services" },
  { label: "Process", href: "/homeserv#process" },
  { label: "Reviews", href: "/homeserv#reviews" },
  { label: "Contact", href: "/homeserv/contact-us" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/homeserv" aria-label="QuoteNest Pros home">
          <span className="brand-mark">
            <Home className="brand-home-icon" size={21} strokeWidth={2.4} />
            <Sparkles className="brand-spark-icon" size={13} strokeWidth={2.6} />
          </span>
          <span>
            QuoteNest <strong>Pros</strong>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <span className="availability">
            <span aria-hidden="true" />
            27 pros online
          </span>
          <button className="icon-button mobile-only" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
        </div>
      </header>

      {menuOpen ? (
        <div className="mobile-menu">
          <button className="icon-button close-button" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={22} />
          </button>
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </>
  );
}
