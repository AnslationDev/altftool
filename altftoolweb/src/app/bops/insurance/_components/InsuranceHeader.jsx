"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Moon, ShieldCheck, Sun, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import AltfByline from "@/app/_altf/AltfByline";
import InsuranceQuoteButton from "./InsuranceQuoteButton";

const INSURANCE_BASE = "/bops/insurance";

/**
 * Header for an Insurance vertical page — mirrors the HousingNeeds header (same
 * `.hn-header` styling) but brands "Insurance" and links back to the Insurance
 * hub.
 *
 * `navItems` is `[{ href, label }]` of in-page anchors, passed from the server
 * so this client component never imports the insurance content files.
 * `quoteAction` is `{ mode, label, href }`; InsuranceQuoteButton returns null
 * when href is missing, so a page with no configured quote shows no CTA.
 */
export default function InsuranceHeader({ quoteAction, navItems = [] }) {
  const { resolvedTheme, setThemeMode } = useTheme();
  const [open, setOpen] = useState(false);

  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const navLinks = navItems.map((item) =>
    item.href.startsWith("#") ? (
      <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
        {item.label}
      </a>
    ) : (
      <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
        {item.label}
      </Link>
    ),
  );

  return (
    <header className="hn-header">
      <div className="hn-wrap hn-header-inner">
        <span className="altf-brandlock">
          <Link href={INSURANCE_BASE} className="hn-brand">
            <span className="hn-brand-mark" aria-hidden="true">
              <ShieldCheck size={16} strokeWidth={2.3} />
            </span>
            Insurance
          </Link>
          <AltfByline />
        </span>

        {navItems.length > 0 && (
          <nav className="hn-nav" aria-label="On this page">
            {navLinks}
          </nav>
        )}

        <div className="hn-header-actions">
          <button
            type="button"
            className="hn-icon-btn"
            onClick={() => setThemeMode(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={16} strokeWidth={2.2} /> : <Moon size={16} strokeWidth={2.2} />}
          </button>

          {navItems.length > 0 && (
            <button
              type="button"
              className="hn-icon-btn hn-menu-btn"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls={open ? "ins-drawer" : undefined}
            >
              {open ? <X size={16} strokeWidth={2.2} /> : <Menu size={16} strokeWidth={2.2} />}
            </button>
          )}

          <InsuranceQuoteButton
            href={quoteAction?.href}
            label={quoteAction?.label}
            mode={quoteAction?.mode}
            className="hn-btn hn-btn--primary hn-header-cta"
          />
        </div>
      </div>

      {open && navItems.length > 0 && (
        <nav id="ins-drawer" className="hn-drawer" aria-label="On this page">
          {navLinks}
        </nav>
      )}
    </header>
  );
}
