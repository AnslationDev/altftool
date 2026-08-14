"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Calculator, Menu, X, Lock, Zap, ShieldCheck, WifiOff } from "lucide-react";
import { CALCULATORS, SIDEBAR_CATEGORIES, getCategoryColor } from "../toolsData";
import { ToolRegistry } from "../tools/registry";
import { getToolInfo } from "../toolInfo";
import CalcIcon from "../components/CalcIcon";
import ToolInfo from "../components/ToolInfo";

const GENERIC_FEATURES = [
  { icon: Lock, text: "100% private — nothing is uploaded" },
  { icon: Zap, text: "Instant, live results as you type" },
  { icon: ShieldCheck, text: "Free forever, no sign-up needed" },
  { icon: WifiOff, text: "Works even when you're offline" },
];

export default function AltfCalcToolPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const toolSlug = params?.toolSlug;
  const isSubdir = pathname.startsWith("/altfcalculators");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const getToolLink = useCallback(
    (slug) => (isSubdir ? `/altfcalculators/${slug}` : `/${slug}`),
    [isSubdir]
  );

  const activeTool = CALCULATORS.find((t) => t.slug === toolSlug);

  useEffect(() => {
    if (!activeTool && toolSlug) {
      router.push(getToolLink(""));
    }
  }, [activeTool, toolSlug, router, getToolLink]);

  // Only reachable for a slug that is not in CALCULATORS — `activeTool` is
  // resolved synchronously, so a real calculator never renders this. It said
  // "Loading calculator…" and shipped no heading and no link, which is what an
  // unknown slug served to a crawler while the effect above redirected the
  // browser. Name the state and leave a crawlable way back.
  if (!activeTool) {
    return (
      <div className="afc-loading">
        <h1>Calculator not found</h1>
        <p>
          This calculator does not exist.{" "}
          {/* Not getToolLink("") — that ends in a slash, and
              /altfcalculators/ 308s to /altfcalculators (verified live), so the
              crawler would pay a hop before reaching the hub. */}
          <Link href={isSubdir ? "/altfcalculators" : "/"}>
            Browse all AltFTool calculators
          </Link>
          .
        </p>
      </div>
    );
  }

  const ActiveToolComponent = ToolRegistry[toolSlug];
  const relatedTools = CALCULATORS.filter(
    (t) => t.sidebarCategory === activeTool.sidebarCategory && t.slug !== activeTool.slug
  ).slice(0, 4);

  return (
    <div className="afc-page-layout">
      {/* NAVBAR */}
      <header className="afc-navbar">
        <div className="afc-navbar-left">
          <button className="afc-hamburger" onClick={() => setDrawerOpen(true)} aria-label="Open menu" suppressHydrationWarning>
            <Menu size={22} />
          </button>
          <Link href={getToolLink("")} className="afc-navbar-brand">
            <span className="afc-brand-mark" aria-hidden="true"><Calculator size={20} /></span>
            <span>AltF Calculators</span>
          </Link>
        </div>
        <nav className="afc-nav-links">
          {SIDEBAR_CATEGORIES.slice(0, 6).map((cat) => (
            <Link key={cat} href={`${getToolLink("")}#cat-${slugifyCat(cat)}`} className="afc-nav-link">
              {cat}
            </Link>
          ))}
        </nav>
        <div className="afc-navbar-actions">
          <Link href={getToolLink("")} className="afc-nav-cta">All calculators</Link>
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
                  <Link
                    key={c.slug}
                    href={getToolLink(c.slug)}
                    className={`afc-drawer-link ${c.slug === toolSlug ? "active" : ""}`}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <CalcIcon name={c.icon} size={16} />
                    <span>{c.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* MAIN */}
      <div className="afc-main">
        {/* SIDEBAR */}
        <aside className="afc-sidebar">
          <nav className="afc-sidebar-nav">
            {SIDEBAR_CATEGORIES.map((category) => (
              <div key={category} className="afc-sidebar-category">
                <div className="afc-category-heading">{category}</div>
                <div className="afc-category-links">
                  {CALCULATORS.filter((c) => c.sidebarCategory === category).map((c) => (
                    <Link
                      key={c.slug}
                      href={getToolLink(c.slug)}
                      className={`afc-sidebar-item ${c.slug === toolSlug ? "active" : ""}`}
                    >
                      <span className="afc-sidebar-icon"><CalcIcon name={c.icon} size={16} /></span>
                      <span>{c.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* CONTENT */}
        <main className="afc-content-wrap" style={{ "--afc-cat": getCategoryColor(activeTool.category) }}>
          <nav className="afc-breadcrumb" aria-label="Breadcrumb">
            <Link href={getToolLink("")}>Calculators</Link>
            <span aria-hidden="true">/</span>
            <span>{activeTool.category}</span>
          </nav>

          <motion.section
            className="afc-tool-header"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="afc-tool-icon" aria-hidden="true"><CalcIcon name={activeTool.icon} size={26} /></span>
            <div>
              <span className="afc-tool-chip">{activeTool.category}</span>
              <h1 className="afc-tool-title">{activeTool.name}</h1>
              <p className="afc-tool-desc">{activeTool.desc}</p>
            </div>
          </motion.section>

          <motion.section
            className="afc-tool-container"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="afc-tool-card">
              {ActiveToolComponent ? (
                <ActiveToolComponent />
              ) : (
                <p className="afc-note">This calculator is coming soon.</p>
              )}
            </div>
            <ul className="afc-feature-strip">
              {GENERIC_FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <li key={i}><Icon size={15} /> {f.text}</li>
                );
              })}
            </ul>
          </motion.section>

          {/* DETAILED INFO / ARTICLE */}
          <ToolInfo info={getToolInfo(toolSlug)} toolName={activeTool.name} />

          {relatedTools.length > 0 && (
            <section className="afc-related">
              <h3 className="afc-related-title">Related calculators</h3>
              <div className="afc-related-grid">
                {relatedTools.map((t) => (
                  <Link key={t.slug} href={getToolLink(t.slug)} className="afc-related-card">
                    <span className="afc-related-icon"><CalcIcon name={t.icon} size={18} /></span>
                    <span>
                      <span className="afc-related-name">{t.name}</span>
                      <span className="afc-related-desc">{t.desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function slugifyCat(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
