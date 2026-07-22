"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Calculator,
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  Lock,
  Zap,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import {
  CALCULATORS,
  CATEGORIES,
  SIDEBAR_CATEGORIES,
  getPopularCalculators,
  getCategoryColor,
  getCategoryCount,
} from "./toolsData";
import CalcIcon from "./components/CalcIcon";

const BENEFITS = [
  { icon: Lock, title: "100% private", text: "Every calculation runs on your device. Nothing is ever uploaded." },
  { icon: Zap, title: "Instant results", text: "Answers update live as you type — no waiting, no page reloads." },
  { icon: ShieldCheck, title: "Free, no sign-up", text: "Every calculator is free forever. No account, no paywall." },
  { icon: WifiOff, title: "Works offline", text: "Once loaded, they keep working even without a connection." },
];

export default function AltfCalcHome() {
  const pathname = usePathname();
  const isSubdir = pathname.startsWith("/altfcalculators");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");

  const getToolLink = (slug) => (isSubdir ? `/altfcalculators/${slug}` : `/${slug}`);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CALCULATORS;
    return CALCULATORS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [query]);

  const popular = useMemo(() => getPopularCalculators(), []);
  const searching = query.trim().length > 0;

  return (
    <div className="afc-page-layout">
      {/* NAVBAR */}
      <header className="afc-navbar">
        <div className="afc-navbar-left">
          <button className="afc-hamburger" onClick={() => setDrawerOpen(true)} aria-label="Open menu" suppressHydrationWarning>
            <Menu size={22} />
          </button>
          <Link href={getToolLink("")} className="afc-navbar-brand">
            <span className="afc-brand-mark" aria-hidden="true"><Calculator size={19} /></span>
            <span>AltF Calculators</span>
          </Link>
        </div>
        <nav className="afc-nav-links">
          {SIDEBAR_CATEGORIES.slice(0, 6).map((cat) => (
            <a key={cat} href={`#cat-${slugifyCat(cat)}`} className="afc-nav-link">{cat}</a>
          ))}
        </nav>
        <div className="afc-navbar-actions">
          <a href="#all-calculators" className="afc-nav-cta">Browse all</a>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <div className={`afc-drawer-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setDrawerOpen(false)} />
      <div className={`afc-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="afc-drawer-header">
          <span className="afc-navbar-brand">
            <span className="afc-brand-mark" aria-hidden="true"><Calculator size={18} /></span>
            AltF Calculators
          </span>
          <button className="afc-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu" suppressHydrationWarning>
            <X size={20} />
          </button>
        </div>
        <nav className="afc-drawer-nav">
          {SIDEBAR_CATEGORIES.map((category) => (
            <div key={category} className="afc-drawer-category">
              <div className="afc-category-heading">{category}</div>
              <div className="afc-category-links">
                {CALCULATORS.filter((c) => c.sidebarCategory === category).map((c) => (
                  <Link key={c.slug} href={getToolLink(c.slug)} className="afc-drawer-link" onClick={() => setDrawerOpen(false)}>
                    <CalcIcon name={c.icon} size={16} />
                    <span>{c.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* HERO */}
      <section className="afc-hero">
        <motion.div
          className="afc-hero-inner"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="afc-eyebrow">
            <span className="afc-eyebrow-dot" /> {CALCULATORS.length} free calculators · 100% private
          </span>
          <h1 className="afc-hero-title">
            Your life in numbers,{" "}<br /><em>solved in seconds.</em>
          </h1>
          <p className="afc-hero-sub">
            A calm, precise home for everyday maths — finance, health, conversions and more.
            No sign-ups, no uploads, just clean answers as you type.
          </p>

          <div className="afc-hero-search">
            <Search size={20} className="afc-search-icon" aria-hidden="true" />
            <input
              type="search"
              className="afc-search-input"
              placeholder={`Search ${CALCULATORS.length} calculators… try “EMI”, “BMI”, or “percentage”`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search calculators"
            />
          </div>

          {!searching ? (
            <div className="afc-quickpicks">
              <span className="afc-quickpicks-label">Popular</span>
              {popular.slice(0, 5).map((c) => (
                <Link key={c.slug} href={getToolLink(c.slug)} className="afc-quickpick">
                  <CalcIcon name={c.icon} size={14} /> {c.name}
                </Link>
              ))}
            </div>
          ) : null}
        </motion.div>
      </section>

      {searching ? (
        <section className="afc-section" id="all-calculators">
          <div className="afc-section-head">
            <h2 className="afc-section-title">
              {filtered.length} result{filtered.length === 1 ? "" : "s"} for “{query.trim()}”
            </h2>
          </div>
          {filtered.length ? (
            <div className="afc-card-grid">
              {filtered.map((c) => <CalcCard key={c.slug} calc={c} href={getToolLink(c.slug)} />)}
            </div>
          ) : (
            <p className="afc-empty">No calculators match your search. Try a different keyword.</p>
          )}
        </section>
      ) : (
        <>
          {/* CATEGORY TILES */}
          <section className="afc-section">
            <div className="afc-section-head">
              <div>
                <h2 className="afc-section-title">Browse by category</h2>
                <p className="afc-section-sub">{CATEGORIES.length} focused collections, {CALCULATORS.length} calculators in total.</p>
              </div>
            </div>
            <div className="afc-cat-tiles">
              {CATEGORIES.map((cat) => (
                <a
                  key={cat.name}
                  href={`#cat-${slugifyCat(cat.name)}`}
                  className="afc-cat-tile"
                  style={{ "--afc-cat": cat.color }}
                >
                  <span className="afc-cat-tile-icon"><CalcIcon name={cat.icon} size={22} /></span>
                  <span className="afc-cat-tile-body">
                    <span className="afc-cat-tile-name">{cat.name}</span>
                    <span className="afc-cat-tile-blurb">{cat.blurb}</span>
                  </span>
                  <span className="afc-cat-tile-count">{getCategoryCount(cat.name)}</span>
                </a>
              ))}
            </div>
          </section>

          {/* POPULAR */}
          <section className="afc-section">
            <div className="afc-section-head">
              <div>
                <h2 className="afc-section-title">Most popular</h2>
                <p className="afc-section-sub">The calculators people reach for most.</p>
              </div>
              <a href="#all-calculators" className="afc-section-link">See all <ArrowRight size={15} /></a>
            </div>
            <div className="afc-pop-grid">
              {popular.map((c) => (
                <Link key={c.slug} href={getToolLink(c.slug)} className="afc-pop-card" style={{ "--afc-cat": getCategoryColor(c.category) }}>
                  <span className="afc-pop-card-head">
                    <span className="afc-pop-card-name">{c.name}</span>
                    <ArrowUpRight size={17} className="afc-pop-arrow" />
                  </span>
                  <span className="afc-pop-desc">{c.desc}</span>
                  <span className="afc-pop-tag">{c.category}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* ALL BY CATEGORY */}
          <section className="afc-section" id="all-calculators">
            <div className="afc-section-head">
              <div>
                <h2 className="afc-section-title">All calculators</h2>
                <p className="afc-section-sub">Everything, grouped by category.</p>
              </div>
            </div>
            {SIDEBAR_CATEGORIES.map((category) => {
              const items = CALCULATORS.filter((c) => c.sidebarCategory === category);
              if (!items.length) return null;
              return (
                <div key={category} className="afc-cat-block" id={`cat-${slugifyCat(category)}`} style={{ "--afc-cat": getCategoryColor(category) }}>
                  <div className="afc-cat-block-head">
                    <span className="afc-cat-block-dot" />
                    <h3 className="afc-cat-block-title">{category}</h3>
                    <span className="afc-cat-block-count">{items.length} calculators</span>
                  </div>
                  <div className="afc-card-grid">
                    {items.map((c) => <CalcCard key={c.slug} calc={c} href={getToolLink(c.slug)} />)}
                  </div>
                </div>
              );
            })}
          </section>

          {/* BENEFITS BAND */}
          <section className="afc-band">
            <div className="afc-band-inner">
              {BENEFITS.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className="afc-band-item">
                    <span className="afc-band-icon"><Icon size={20} /></span>
                    <span className="afc-band-title">{b.title}</span>
                    <span className="afc-band-text">{b.text}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function CalcCard({ calc, href }) {
  return (
    <Link href={href} className="afc-card" style={{ "--afc-cat": categoryColor(calc.category) }}>
      <span className="afc-card-icon" aria-hidden="true"><CalcIcon name={calc.icon} size={21} /></span>
      <span className="afc-card-body">
        <span className="afc-card-name">{calc.name}</span>
        <span className="afc-card-desc">{calc.desc}</span>
      </span>
      <ArrowUpRight size={16} className="afc-card-arrow" />
    </Link>
  );
}

function categoryColor(name) {
  return getCategoryColor(name);
}

function slugifyCat(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
