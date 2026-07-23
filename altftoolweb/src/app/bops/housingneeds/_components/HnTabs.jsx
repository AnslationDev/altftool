"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HnCard, { ICONS } from "./HnCard";
import { HN_CATEGORIES } from "../_data/categories";

const DEFAULT_SLUG = HN_CATEGORIES[0].slug;

/**
 * Category switcher for the Housing Needs dashboard. Replaces the dedicated
 * category pages: each category is a tab, selecting one swaps the page grid in
 * place. The strip scrolls when the tabs overflow — chevron buttons appear at
 * whichever end has more, and the selected tab is scrolled into view — so no
 * category (e.g. the last one) can be left clipped and unreachable.
 */
export default function HnTabs({ initialCategory }) {
  const initial = HN_CATEGORIES.some((c) => c.slug === initialCategory)
    ? initialCategory
    : DEFAULT_SLUG;
  const [active, setActive] = useState(initial);
  const category =
    HN_CATEGORIES.find((c) => c.slug === active) ?? HN_CATEGORIES[0];

  const scrollerRef = useRef(null);
  const [overflow, setOverflow] = useState({ left: false, right: false });

  const syncOverflow = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setOverflow({
      left: el.scrollLeft > 2,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
    });
  };

  // Track overflow on mount, on resize and on scroll; scroll the initial tab
  // into view so a deep-linked far-right category isn't off-screen.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    scrollTabIntoView(active, "auto");
    syncOverflow();
    const ro = new ResizeObserver(syncOverflow);
    ro.observe(el);
    window.addEventListener("resize", syncOverflow);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", syncOverflow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollTabIntoView = (slug, behavior = "smooth") => {
    const el = scrollerRef.current;
    const tab = el?.querySelector(`[data-slug="${slug}"]`);
    if (!el || !tab) return;
    // Minimal scroll to bring the tab fully into view, keeping a chevron-width
    // of margin so the active tab never hides under a scroll button.
    const pad = 52;
    const tabLeft = tab.offsetLeft;
    const tabRight = tab.offsetLeft + tab.clientWidth;
    let next = el.scrollLeft;
    if (tabLeft - pad < el.scrollLeft) {
      next = tabLeft - pad;
    } else if (tabRight + pad > el.scrollLeft + el.clientWidth) {
      next = tabRight + pad - el.clientWidth;
    }
    el.scrollTo({ left: Math.max(0, next), behavior });
  };

  const nudge = (direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: "smooth" });
  };

  const select = (slug) => {
    if (slug === active) return;
    setActive(slug);
    scrollTabIntoView(slug);
    const url =
      slug === DEFAULT_SLUG
        ? "/bops/housingneeds"
        : `/bops/housingneeds?category=${slug}`;
    window.history.replaceState(null, "", url);
  };

  return (
    <div className="hn-tabs-wrap">
      <div className="hn-tabs-bar">
        <button
          type="button"
          className="hn-tabs-scroll hn-tabs-scroll--left"
          data-hidden={!overflow.left}
          aria-hidden={!overflow.left}
          tabIndex={overflow.left ? 0 : -1}
          aria-label="Scroll categories left"
          onClick={() => nudge(-1)}
        >
          <span className="hn-tabs-scroll-ico">
            <ChevronLeft size={16} strokeWidth={2.4} />
          </span>
        </button>

        <div
          ref={scrollerRef}
          className="hn-tabs"
          role="tablist"
          aria-label="Housing Needs categories"
          onScroll={syncOverflow}
        >
          {HN_CATEGORIES.map((c) => {
            const Icon = ICONS[c.icon] ?? ICONS.layers;
            const isActive = c.slug === active;
            return (
              <button
                key={c.slug}
                type="button"
                role="tab"
                data-slug={c.slug}
                aria-selected={isActive}
                className="hn-tab"
                data-active={isActive}
                onClick={() => select(c.slug)}
              >
                <Icon className="hn-tab-icon" size={16} strokeWidth={2} />
                <span className="hn-tab-label">{c.name}</span>
                <span className="hn-tab-count">{c.pages.length}</span>
                {isActive && (
                  <motion.span
                    layoutId="hn-tab-underline"
                    className="hn-tab-underline"
                    transition={{ type: "spring", stiffness: 520, damping: 40 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="hn-tabs-scroll hn-tabs-scroll--right"
          data-hidden={!overflow.right}
          aria-hidden={!overflow.right}
          tabIndex={overflow.right ? 0 : -1}
          aria-label="Scroll categories right"
          onClick={() => nudge(1)}
        >
          <span className="hn-tabs-scroll-ico">
            <ChevronRight size={16} strokeWidth={2.4} />
          </span>
        </button>
      </div>

      {/* Keyed remount rather than AnimatePresence: changing `active` mounts a
          fresh panel immediately with the new cards, so the swap never depends
          on an exit animation completing. */}
      <motion.div
        key={active}
        role="tabpanel"
        className="bizops-grid hn-tab-panel"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {category.pages.map((page) => (
          <HnCard
            key={page.slug}
            href={page.href}
            icon={category.icon}
            accent={category.accent}
            name={page.name}
            tagline={page.tagline}
            description={page.description}
            tags={page.tags}
            meta={page.tags?.includes("Guide") ? "Guide page" : "Landing page"}
            cta="Open"
          />
        ))}
      </motion.div>
    </div>
  );
}
