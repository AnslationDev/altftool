"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@altftool/ui";
import "@/app/_altf/altf-brand.css";
import { Container, Logo } from "./ui";
import { categories } from "../data/content";
import { getAllRankings } from "../data/queries";
import { toCatalog, toHome } from "../router";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? "backdrop-blur-xl bg-paper/75 border-b border-ink/10" : "bg-transparent"
        }`}
      >
        <Container wide className="flex h-16 items-center justify-between">
          {/* Byline is a sibling, not a child: the Top3 mark links to /top3,
              the AltF logo links to altftool.com — anchors cannot nest.
              Deliberately a plain <a>, NOT the shared AltfByline (next/link):
              leaving the microsite must be a full page load, because a client
              navigation keeps top3.css attached and its Tailwind instance's
              `.hidden` then shadows the global header's `lg:flex` variants —
              the main site renders with an invisible nav until a refresh. */}
          <span className="altf-brandlock">
            <Logo />
            <span className="altf-by">
              <span className="altf-by-label">by</span>
              <a href="https://www.altftool.com/" className="altf-by-link">
                <BrandLogo className="altf-by-logo" />
              </a>
            </span>
          </span>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Rankings", href: "#featured" },
              { label: "Catalog", href: toCatalog() },
              { label: "Categories", href: "#categories" },
              { label: "How we test", href: "#methodology" },
              { label: "Experts", href: "#experts" },
              { label: "Editorial", href: "#standards" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="link-underline text-[13px] text-ink-soft hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={toCatalog()}
              aria-label="Search rankings"
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-ink/15 px-3 py-1.5 text-[12px] text-ink-mute transition hover:border-ink/40"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              Search rankings
              <kbd className="hidden md:inline font-mono text-[10px] text-ink-mute/70">⌘K</kbd>
            </a>
            <a
              href="#newsletter"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[12px] font-medium text-paper transition hover:bg-accent"
            >
              Subscribe
            </a>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/20"
            >
              <span className="flex flex-col gap-[3px]">
                <span className="h-px w-3.5 bg-ink" />
                <span className="h-px w-3.5 bg-ink" />
              </span>
            </button>
          </div>
        </Container>
      </motion.header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-paper md:hidden"
            onClick={() => setOpen(false)}
          >
            <div className="flex h-full flex-col items-start justify-center gap-6 px-10">
              <a className="display text-4xl" href={toHome()}>Home</a>
              <a className="display text-4xl" href={toCatalog()}>Catalog</a>
              <a className="display text-4xl" href="#categories">Categories</a>
              <a className="display text-4xl" href="#methodology">How we test</a>
              <a className="display text-4xl" href="#experts">Experts</a>
              <a className="display text-4xl" href="#standards">Editorial</a>
              <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-mute">
                {categories.length} categories · {getAllRankings().length} rankings
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
