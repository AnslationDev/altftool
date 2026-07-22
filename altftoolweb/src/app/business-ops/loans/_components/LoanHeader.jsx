"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Landmark, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import AltfByline from "@/app/_altf/AltfByline";
import LoanQuoteButton from "./LoanQuoteButton";

const LOANS_BASE = "/business-ops/loans";

/**
 * Header for a Loans vertical page — mirrors the HousingNeeds header (same
 * `.hn-header` styling) but brands "Loans" and links back to the Loans hub.
 *
 * `navItems` is `[{ href, label }]` of in-page anchors, passed from the server
 * so this client component never imports the loan content files.
 * `quoteAction` is `{ mode, label, href }`; LoanQuoteButton returns null when
 * href is missing, so a page with no configured quote simply shows no CTA.
 */
export default function LoanHeader({ quoteAction, navItems = [] }) {
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
          <Link href={LOANS_BASE} className="hn-brand">
            <span className="hn-brand-mark" aria-hidden="true">
              <Landmark size={16} strokeWidth={2.3} />
            </span>
            Loans
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
              aria-controls={open ? "loan-drawer" : undefined}
            >
              {open ? <X size={16} strokeWidth={2.2} /> : <Menu size={16} strokeWidth={2.2} />}
            </button>
          )}

          <LoanQuoteButton
            href={quoteAction?.href}
            label={quoteAction?.label}
            mode={quoteAction?.mode}
            className="hn-btn hn-btn--primary hn-header-cta"
          />
        </div>
      </div>

      {open && navItems.length > 0 && (
        <nav id="loan-drawer" className="hn-drawer" aria-label="On this page">
          {navLinks}
        </nav>
      )}
    </header>
  );
}
