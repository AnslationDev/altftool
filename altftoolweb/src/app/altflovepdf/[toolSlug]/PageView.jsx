"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter, usePathname } from "next/navigation";
import { TOOLS, SIDEBAR_CATEGORIES } from "../toolsData";
import { getToolFacts } from "../toolFacts";
import AltfPdfPanels from "../panels";
import { ToolRegistry } from "../tools/registry";
import { motion } from "framer-motion";

const TOOL_INFO_MAP = {
  "merge-pdf": {
    features: [
      "Reorder pages via drag & drop",
      "Optional table of contents",
      "Custom output filename",
      "No file-count limit — merging runs on your device"
    ],
    steps: [
      "Select or drag your PDF files into the upload area",
      "Reorder files or pages as needed before merging",
      "Set filename, then click Merge PDF to download"
    ]
  },
  "split-pdf": {
    features: [
      "Extract custom page ranges",
      "Split into single-page files",
      "Accurate visual preview",
      "High-speed extraction"
    ],
    steps: [
      "Upload the PDF document you want to split",
      "Specify ranges or choose to split all pages",
      "Click Split PDF to download the processed files"
    ]
  },
  "rotate-pdf": {
    features: [
      "Rotate individual pages or all pages",
      "90, 180, or 270 degrees rotation",
      "Live thumbnail previews",
      "Zero quality loss"
    ],
    steps: [
      "Select your PDF document",
      "Click on thumbnails to rotate pages to your liking",
      "Click Rotate PDF and download the result"
    ]
  },
  "organize-pdf": {
    features: [
      "Drag and drop pages to reorder",
      "Delete unnecessary pages instantly",
      "Insert pages from other documents",
      "Fast client-side rendering"
    ],
    steps: [
      "Upload your PDF document to the visual organizer",
      "Drag pages to reorder or click trash to delete",
      "Click Organize PDF to generate your new document"
    ]
  }
};

const HEADER_NAV_ITEMS = [
  { label: "Convert", slug: "pdf-to-word", category: "Convert" },
  { label: "Merge", slug: "merge-pdf" },
  { label: "Split", slug: "split-pdf" },
  { label: "Protect", slug: "protect-pdf" },
  { label: "Unlock", slug: "unlock-pdf" },
  { label: "Compress", slug: "compress-pdf" },
  { label: "Rotate", slug: "rotate-pdf" },
  { label: "Redact", slug: "redact-pdf" },
  { label: "Flatten", slug: "flatten-pdf" },
];

const HEADER_DIRECT_SLUGS = new Set(HEADER_NAV_ITEMS.map((item) => item.slug));

export default function AltfPdfToolPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const toolSlug = params?.toolSlug;
  const isSubdir = pathname.startsWith("/altflovepdf");

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Helper to generate correct URLs
  const getToolLink = useCallback((slug) => {
    return isSubdir ? `/altflovepdf/${slug}` : `/${slug}`;
  }, [isSubdir]);

  const activeTool = TOOLS.find((t) => t.slug === toolSlug);

  useEffect(() => {
    if (!activeTool && toolSlug) {
      router.push(getToolLink(""));
    }
  }, [activeTool, toolSlug, router, getToolLink]);

  // Sync / initialize app.js bindings
  useEffect(() => {
    const initInterval = setInterval(() => {
      if (typeof window !== "undefined" && typeof window.initPDFToolkit === "function") {
        clearInterval(initInterval);
        if (!window.pdfToolkitInitialized) {
          window.pdfToolkitInitialized = true;
          window.initPDFToolkit();
          console.log("AltfPDF Toolkit Engine Initialized!");
        }
      }
    }, 100);

    return () => clearInterval(initInterval);
  }, []);

  // Custom slider repaint and sync bindings for route transitions
  useEffect(() => {
    const repaintSliders = () => {
      const cfg = [
        { id: "pdf2img-scale", lbl: "pdf2img-scale-val", sfx: "x" },
        { id: "wm-opacity", lbl: "wm-opacity-val", sfx: "%" },
        { id: "gray-quality", lbl: "gray-quality-val", sfx: "%" },
        { id: "gray-scale", lbl: "gray-scale-val", sfx: "x" },
        { id: "compress-quality", lbl: "compress-quality-val", sfx: "%" },
        { id: "compress-dpi", lbl: "compress-dpi-val", sfx: "" },
        { id: "imgresize-quality", lbl: "imgresize-quality-val", sfx: "%" },
        { id: "imgcompress-quality", lbl: "imgcompress-quality-val", sfx: "%" },
        { id: "imgcrop-quality", lbl: "imgcrop-quality-val", sfx: "%" },
        { id: "imgconvert-quality", lbl: "imgconvert-quality-val", sfx: "%" },
        { id: "imgresize-pct", lbl: "imgresize-pct-val", sfx: "%" },
      ];
      cfg.forEach((c) => {
        const el = document.getElementById(c.id);
        const lbl = document.getElementById(c.lbl);
        if (!el) return;
        const paint = () => {
          const min = parseFloat(el.min) || 0;
          const max = parseFloat(el.max) || 100;
          const val = parseFloat(el.value);
          const pct = Math.round(((val - min) / (max - min)) * 100);
          el.style.background = `linear-gradient(to right, #1A4FD6 0%, #1A4FD6 ${pct}%, rgba(0, 0, 0, 0.06) ${pct}%, rgba(0, 0, 0, 0.06) 100%)`;
          if (lbl) lbl.textContent = val + c.sfx;
        };
        paint();
        el.removeEventListener("input", paint);
        el.addEventListener("input", paint);
      });
    };

    const timer = setTimeout(repaintSliders, 150);
    return () => clearTimeout(timer);
  }, [toolSlug]);

  if (!activeTool) {
    return (
      <div className="altf-loading">
        <p>Loading tool panel...</p>
      </div>
    );
  }

  // Filter 4 related tools from the same category
  const relatedTools = TOOLS.filter(
    (t) => t.sidebarCategory === activeTool.sidebarCategory && t.slug !== activeTool.slug
  ).slice(0, 4);

  const ActiveToolComponent = ToolRegistry[toolSlug];

  const isHeaderItemActive = (item) => {
    if (item.slug === toolSlug) return true;
    return Boolean(
      item.category &&
      activeTool?.sidebarCategory === item.category &&
      !HEADER_DIRECT_SLUGS.has(activeTool.slug)
    );
  };

  const facts = getToolFacts(activeTool.slug);

  const info = TOOL_INFO_MAP[activeTool.slug] || {
    features: [
      "Runs on your device — files are never uploaded",
      "No upload size cap; limited only by your device's memory",
      "Free, with no account and no watermark",
      "Result downloads straight from your browser"
    ],
    steps: [
      "Choose or drag files into the dashed upload area below",
      "Adjust configuration settings in the options card",
      "Click the action button to instantly render and download"
    ]
  };

  return (
    <div className="altf-page-layout">
      {/* NAVBAR */}
      <header className="altf-navbar">
        <div className="altf-navbar-left">
          <Link href={getToolLink("")} className="altf-navbar-brand">
            <span>PDF Converter</span>
          </Link>
          <button
            className="altf-hamburger"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open Menu"
            suppressHydrationWarning
          >
            ☰
          </button>
        </div>

        <div className="altf-nav-links">
          <Link href={`${getToolLink("")}#page-tools`} className="nav-link-item altf-all-tools-link">
            <span className="altf-grid-icon" aria-hidden="true">
              <span></span><span></span><span></span><span></span>
            </span>
            All Tools
          </Link>
          <span className="altf-nav-divider" aria-hidden="true"></span>
          {HEADER_NAV_ITEMS.map((item) => (
            <Link
              key={item.slug}
              href={getToolLink(item.slug)}
              className={`nav-link-item ${isHeaderItemActive(item) ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="altf-navbar-actions">
          <button className="altf-signin" type="button" suppressHydrationWarning>Sign In</button>
          <button className="altf-signup" type="button" onClick={() => router.push(getToolLink(""))} suppressHydrationWarning>
            Sign Up
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <div className={`altf-drawer-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setDrawerOpen(false)}></div>
      <div className={`altf-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="altf-drawer-header">
          <h3>PDF Converter</h3>
          <button className="altf-drawer-close" onClick={() => setDrawerOpen(false)} suppressHydrationWarning>✕</button>
        </div>
        <nav className="altf-drawer-nav">
          {SIDEBAR_CATEGORIES.map((category) => {
            const categoryTools = TOOLS.filter((t) => t.sidebarCategory === category);
            return (
              <div key={category} className="altf-drawer-category">
                <div className="altf-category-heading">{category}</div>
                <div className="altf-category-links">
                  {categoryTools.map((t) => (
                    <Link
                      key={t.slug}
                      href={getToolLink(t.slug)}
                      className={`altf-drawer-link ${t.slug === toolSlug ? "active" : ""}`}
                      onClick={() => setDrawerOpen(false)}
                    >
                      <svg className="altf-drawer-link-icon"><use href={t.icon} /></svg>
                      <span>{t.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* WRAPPER FOR SIDEBAR & MAIN */}
      <div className="altf-main">
        {/* DESKTOP SIDEBAR */}
        <aside id="sidebar" className="altf-sidebar">
          <nav className="altf-sidebar-nav">
            {SIDEBAR_CATEGORIES.map((category) => {
              const categoryTools = TOOLS.filter((t) => t.sidebarCategory === category);
              return (
                <div key={category} className="altf-sidebar-category">
                  <div className="altf-category-heading">{category}</div>
                  <div className="altf-category-links">
                    {categoryTools.map((t) => (
                      <Link
                        key={t.slug}
                        href={getToolLink(t.slug)}
                        data-panel={t.panelId}
                        className={`altf-sidebar-item ${t.slug === toolSlug ? "active" : ""}`}
                      >
                        <span className="altf-sidebar-icon">
                          <svg><use href={t.icon} /></svg>
                        </span>
                        <span>{t.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* MAIN AREA */}
        <main className="altf-content-wrap">
          {/* SPLIT 50/50 HERO HEADER */}
          <section className="altf-tool-header">
            {/* LEFT HEADER COLUMN */}
            <motion.div
              className="altf-tool-header-main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <span className="altf-tool-chip">{activeTool.sidebarCategory || "Tool"}</span>
              <h1 className="altf-tool-title">
                {activeTool.name.split(" ")[0]} <em>{activeTool.name.split(" ").slice(1).join(" ")}.</em>
              </h1>
              {/* Answer-first: a self-contained sentence that states exactly
                  what this tool does and that it runs in the browser, so it can
                  be quoted without any surrounding context. */}
              <p className="altf-tool-desc">{facts?.answer || activeTool.desc}</p>
              <div className="altf-feature-list">
                {info.features.map((feature, idx) => (
                  <div key={idx} className="altf-feature-row">
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT HEADER COLUMN */}
            <div className="altf-tool-header-side">
              <div className="altf-stats-grid">
                {[
                  { num: "100%", label: "Local" },
                  { num: "Free", label: "Basic" },
                  { num: "Fast", label: "Instant" },
                  { num: "Safe", label: "No Upload" }
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    className="altf-stat-box"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 120, damping: 10, delay: idx * 0.08 }}
                  >
                    <div className="altf-stat-num">{stat.num}</div>
                    <div className="altf-stat-label">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
              <div className="altf-how-label">How it works</div>
              <div className="altf-steps">
                {info.steps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    className="altf-step"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.32 + idx * 0.08 }}
                  >
                    <span className="altf-step-num">{idx + 1}</span>
                    <span className="altf-step-text">{step}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ACTIVE TOOL CONTAINER */}
          <motion.section
            className="altf-tool-container"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <div className="alabel">Upload Files</div>
            <div className="altf-tool-card">
              {ActiveToolComponent ? (
                <ActiveToolComponent />
              ) : (
                <AltfPdfPanels activePanelId={activeTool.panelId} />
              )}
            </div>
          </motion.section>

          {/* Hidden panel-home to satisfy app.js event binding */}
          <div id="panel-home" style={{ display: "none" }}></div>

          {/* RELATED TOOLS */}
          {relatedTools.length > 0 && (
            <section className="altf-related-section">
              <h3 className="altf-related-title">Related Tools</h3>
              <div className="altf-related-grid">
                {relatedTools.map((t) => (
                  <Link
                    key={t.slug}
                    href={getToolLink(t.slug)}
                    className="altf-related-card"
                  >
                    <div className="altf-related-card-icon">
                      <svg><use href={t.icon} /></svg>
                    </div>
                    <div>
                      <h4>{t.name}</h4>
                      <p>{t.desc}</p>
                    </div>
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
