"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, Search, Menu, X } from "lucide-react";
import { BrandLogo } from "@altftool/ui";
import { EASE } from "./motion";

/**
 * Top5's own navbar — the section's dedicated chrome, branded
 * "Top5 by Alt F" (same pattern as "Business Ops by Alt F"):
 *
 * - "Top5" mark → /top5 (section home) · "Alt F" → / (platform home)
 * - One-tap Back on every subpage (real history, /top5 fallback) so the
 *   reader never scrolls to the footer to get out.
 * - Section nav (Trending / Categories / New & notable) with animated
 *   active underline, search pill, and a staggered mobile menu.
 * - Glass bar: translucent + blur, gains a shadow once the page scrolls.
 */
const NAV_LINKS = [
  { label: "Trending", href: "/top5#trending", match: null },
  { label: "Categories", href: "/top5/categories", match: /^\/top5\/(categories|category)/ },
  { label: "New & notable", href: "/top5#featured", match: null },
];

export default function Top5Bar() {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isSectionHome = pathname === "/top5" || pathname === "/top5/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push("/top5");
    }
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: EASE }}
      className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-all duration-300 ${
        scrolled || menuOpen
          ? "bg-surface/90 border-border shadow-md"
          : "bg-surface/65 border-border shadow-none"
      }`}
    >
      <div className="max-w-7xl mx-auto flex h-14 sm:h-16 items-center gap-2.5 sm:gap-4 px-4 sm:px-6">
        {/* Back — only on subpages. */}
        <AnimatePresence initial={false}>
          {!isSectionHome ? (
            <motion.button
              key="back"
              type="button"
              onClick={goBack}
              initial={{ opacity: 0, x: -12, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -12, scale: 0.8 }}
              transition={{ duration: 0.3, ease: EASE }}
              whileTap={{ scale: 0.92 }}
              aria-label="Go back"
              className="group flex h-11 shrink-0 items-center rounded-full bg-surface px-2.5 sm:px-3 ring-1 ring-border shadow-sm transition-all duration-300 hover:bg-primary-soft hover:ring-primary/30 hover:shadow-md"
            >
              <ArrowLeft
                size={16}
                className="shrink-0 text-foreground-soft transition-all duration-300 group-hover:-translate-x-0.5 group-hover:text-primary-text"
              />
              {/* Label unfolds out of the circle on hover — a quiet
                  morphing pill instead of a color slap. */}
              <span className="max-w-0 overflow-hidden whitespace-nowrap pl-0 text-xs font-semibold text-primary-text opacity-0 transition-all duration-300 ease-out group-hover:max-w-[52px] group-hover:pl-1.5 group-hover:opacity-100">
                Back
              </span>
            </motion.button>
          ) : null}
        </AnimatePresence>

        {/* Brand: Top5 → section home · Alt F → platform home. */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          <Link href="/top5" className="group flex min-h-11 shrink-0 items-center gap-2 sm:gap-2.5" aria-label="Top5 home">
            {/* Monogram tile: layered gradient, inner highlight, idle sheen
                that sweeps every few seconds, laurel dot, hover tilt+glow. */}
            <motion.span
              whileHover={{ rotate: -7, scale: 1.08, y: -1 }}
              whileTap={{ scale: 0.94 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary to-primary-active text-primary-foreground shadow-md ring-1 ring-inset ring-on-media/25 transition-shadow duration-300 group-hover:shadow-lg"
            >
              {/* Glossy top light. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-on-media/30 to-transparent"
              />
              {/* Idle sheen sweep. */}
              <motion.span
                aria-hidden="true"
                initial={{ x: "-130%" }}
                animate={reduceMotion ? undefined : { x: "160%" }}
                transition={reduceMotion ? undefined : { duration: 1.1, ease: "easeInOut", repeat: Infinity, repeatDelay: 3.4 }}
                className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-on-media/45 to-transparent"
              />
              <span
                className="relative text-base sm:text-lg italic leading-none"
                style={{ fontFamily: "var(--font-top5-display, serif)" }}
              >
                5
              </span>
            </motion.span>

            {/* Wordmark: gradient "5", underline draws on hover. */}
            <span className="relative pb-0.5 text-base sm:text-lg font-black tracking-tight text-foreground">
              Top
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary-active">
                5
              </span>
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-[2px] w-0 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-400 ease-out group-hover:w-full"
              />
            </span>
          </Link>

          {/* "by Alt F" needs breathing room — below sm it moves into the
              mobile menu instead of squeezing the bar. */}
          <span
            aria-hidden="true"
            className="hidden sm:block h-4 w-px shrink-0 rotate-[18deg] bg-border-strong"
          />
          <span className="hidden sm:inline text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground shrink-0">
            by
          </span>

          <Link
            href="/"
            aria-label="Alt F home"
            className="group/altf hidden min-h-11 shrink-0 items-center gap-1 rounded-full border border-transparent px-2 py-1 transition-all duration-300 hover:border-border hover:bg-surface hover:shadow-sm sm:flex"
          >
            {/* The platform's real brand lockup — same mark as the AltF
                header, gradient F + "Alt F" wordmark. */}
            <BrandLogo
              size="sm"
              decorative
              className="transition-transform duration-300 group-hover/altf:scale-[1.04]"
            />
            <span
              aria-hidden="true"
              className="hidden sm:inline-block text-[10px] text-muted-foreground opacity-0 -translate-x-1 transition-all duration-300 group-hover/altf:opacity-100 group-hover/altf:translate-x-0"
            >
              &#8599;
            </span>
          </Link>
        </div>

        {/* Desktop nav. */}
        <nav className="ml-auto hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => {
            const active = link.match ? link.match.test(pathname) : false;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`group relative flex min-h-11 items-center py-1 text-sm font-semibold transition-colors ${
                  active ? "text-foreground" : "text-foreground-soft hover:text-foreground"
                }`}
              >
                {link.label}
                {active ? (
                  <motion.span
                    layoutId="top5-nav-underline"
                    transition={{ duration: 0.3, ease: EASE }}
                    className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full bg-primary"
                  />
                ) : (
                  <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 rounded-full bg-primary transition-all duration-300 group-hover:w-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Search pill. */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          className="ml-auto md:ml-0 shrink-0"
        >
          <Link
            href="/top5/categories"
            aria-label="Search rankings"
            className="flex min-h-11 items-center gap-2 rounded-full bg-surface-soft px-3 py-2 sm:px-4 text-sm text-foreground-soft transition-colors hover:bg-footer hover:text-on-media"
          >
            <Search size={15} />
            <span className="hidden lg:inline">Search rankings</span>
          </Link>
        </motion.div>

        {/* Mobile menu toggle. */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-foreground md:hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={menuOpen ? "close" : "open"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="inline-flex"
            >
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile menu panel. */}
      <AnimatePresence>
        {menuOpen ? (
          <motion.nav
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: 0.4, ease: EASE }, opacity: { duration: 0.25 } }}
            className="md:hidden overflow-hidden border-t border-border"
          >
            <motion.div
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}
              className="px-4 py-3 flex flex-col"
            >
              {NAV_LINKS.map((link) => {
                const active = link.match ? link.match.test(pathname) : false;
                return (
                  <motion.div
                    key={link.label}
                    variants={{
                      hidden: { opacity: 0, x: -14 },
                      show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                        active ? "bg-primary-soft text-foreground" : "text-foreground-soft hover:bg-page hover:text-foreground"
                      }`}
                    >
                      {link.label}
                      {active ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                      ) : null}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Platform escape hatch — the "by Alt F" credit lives here
                  on mobile. */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -14 },
                  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
                }}
                className="mt-2 border-t border-border pt-2"
              >
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm text-foreground-soft transition-colors hover:bg-page hover:text-foreground"
                >
                  <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    by
                  </span>
                  <BrandLogo size="sm" decorative />
                  <span className="ml-auto text-xs text-muted-foreground">Platform home &#8599;</span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
