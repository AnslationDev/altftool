"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Home, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import HnQuoteButton from "./HnQuoteButton";
import AltfByline from "@/app/_altf/AltfByline";
import { HN_BASE } from "../_data/site";

/**
 * `navItems` is `[{ href, label }]`, passed in from the server rather than
 * imported here.
 *
 * This is a client component; importing VERTICALS would pull all eight
 * verticals' full content — every service description, FAQ answer and cost
 * note — into the client bundle purely to render a handful of nav labels.
 *
 * Two shapes of href are supported and rendered differently:
 *   "#services"    in-page anchor  -> plain <a>, no router involvement
 *   "/housingneeds/roofing"  route -> next/link, prefetched
 */
/**
 * `quoteAction` is `{ mode, label, href }` resolved by the server from the CMS
 * Business Ops config. The hub passes none, which is why HnQuoteButton's
 * `!href` guard must keep returning null.
 */
export default function HnHeader({ quoteAction, navItems = [] }) {
  const { resolvedTheme, setThemeMode } = useTheme();
  const [open, setOpen] = useState(false);

  // No mount guard needed: ThemeProvider's own initial state is "light" on both
  // the server and the first client render, and it re-renders from its effect
  // once the stored preference is read. Reading resolvedTheme directly is
  // therefore already hydration-safe.
  const isDark = resolvedTheme === "dark";

  // Close the drawer on Escape.
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
      <Link
        key={item.href}
        href={item.href}
        aria-current={item.current ? "page" : undefined}
        onClick={() => setOpen(false)}
      >
        {item.label}
      </Link>
    ),
  );

  return (
    <header className="hn-header">
      <div className="hn-wrap hn-header-inner">
        {/* Byline is a sibling, not a child: the name links to the module,
            the logo links to altftool.com, and anchors cannot nest. */}
        <span className="altf-brandlock">
          <Link href={HN_BASE} className="hn-brand">
            <span className="hn-brand-mark" aria-hidden="true">
              <Home size={16} strokeWidth={2.3} />
            </span>
            HousingNeeds
          </Link>
          <AltfByline />
        </span>

        {/* Omitted entirely on vertical landing pages, which pass no navItems —
            an empty <nav> is still an announced landmark for screen readers. */}
        {navItems.length > 0 && (
          <nav className="hn-nav" aria-label="Services">
            {navLinks}
          </nav>
        )}

        <div className="hn-header-actions">
          {/* Action-phrased label only. Pairing "Switch to dark mode" with
              aria-pressed makes screen readers announce it as a toggle whose
              label already describes the opposite state, which reads as a
              double negative. */}
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
            /* Only reference the drawer while it exists — aria-controls
               pointing at a missing id is an ARIA violation. */
            aria-controls={open ? "hn-drawer" : undefined}
          >
            {open ? <X size={16} strokeWidth={2.2} /> : <Menu size={16} strokeWidth={2.2} />}
          </button>
          )}

          {/* Same component as the in-page CTAs so the new-tab warning and rel
              are identical everywhere. */}
          {/* Uses the resolved label verbatim in both modes. An earlier version
              substituted a generic "Get a quote" here, which silently discarded
              the button text an admin had configured in the CMS. */}
          <HnQuoteButton
            href={quoteAction?.href}
            label={quoteAction?.label}
            mode={quoteAction?.mode}
            className="hn-btn hn-btn--primary hn-header-cta"
          />
        </div>
      </div>

      {open && navItems.length > 0 && (
        <nav id="hn-drawer" className="hn-drawer" aria-label="Services">
          {navLinks}
        </nav>
      )}
    </header>
  );
}
