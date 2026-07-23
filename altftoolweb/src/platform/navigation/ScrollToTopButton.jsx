"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";

const SHOW_AFTER_PX = 600;
const BLOG_INDEX_SEGMENTS = new Set([
  "author",
  "category",
  "tag",
  "topics",
  "view-all",
]);

/**
 * Floating "back to top" button. Appears after the user scrolls past the
 * first viewport-and-a-half, sits above the mobile bottom nav, and honours
 * prefers-reduced-motion for the scroll behaviour.
 */
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const pathSegments = pathname?.split("/").filter(Boolean) || [];
  const readerToolsPresent =
    pathSegments.length === 2 &&
    pathSegments[0] === "blogs" &&
    !BLOG_INDEX_SEGMENTS.has(pathSegments[1]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setVisible(window.scrollY > SHOW_AFTER_PX);
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  if (readerToolsPresent) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-24 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-(--card) text-(--foreground) shadow-md transition-all duration-200 ease-out hover:bg-(--muted) hover:shadow-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:transition-none sm:bottom-6 sm:right-6 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

export default ScrollToTopButton;
