"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { TOOLS, SIDEBAR_CATEGORIES } from "./toolsData";
import { motion } from "framer-motion";

const HOW_TO_STEPS = [
  {
    title: "Upload",
    text: "Select the Word, Excel, PowerPoint, PDF or other file you wish to convert."
  },
  {
    title: "Start processing",
    text: "Our free PDF creator will convert your document to PDF or from PDF in seconds."
  },
  {
    title: "Download",
    text: "Your new document will be ready to download immediately. Nothing is uploaded, so there's nothing left on a server to clean up."
  }
];

const FEATURE_ITEMS = [
  {
    title: "The Best Free PDF Converter",
    text: "No matter what types of files you need to convert, our online file converter is more than just a PDF file converter. It's the go-to solution for all of your file conversion needs.",
    paths: ["M9 8h18l8 8v24H9z", "M27 8v10h10", "M15 25h16", "M15 31h18"]
  },
  {
    title: "Free, with no sign-up",
    text: "Every tool in this suite is free to use, with no account, trial, or subscription required — just open a tool and start converting.",
    paths: ["M24 7l4.8 10.5 11.2 1.3-8.2 7.7 2.2 11-10-5.6-10 5.6 2.2-11L8 18.8l11.2-1.3z"]
  },
  {
    title: "Nothing ever leaves your device",
    text: "Every conversion runs locally in your browser. Your files are never uploaded to a server, so there's nothing for us — or anyone else — to see, store, or secure.",
    paths: ["M14 21v-5a10 10 0 0 1 20 0v5", "M11 21h26v18H11z", "M24 28v5"]
  },
  {
    title: "No accounts, no retention",
    text: "There's no server-side storage to worry about. Close the tab and your files and data are gone — there was never a copy anywhere but your own device.",
    paths: ["M15 16h18", "M19 16v-5h10v5", "M17 20l1.4 19h11.2L31 20", "M22 24v11", "M26 24v11"]
  },
  {
    title: "Universal conversion",
    text: "Our free file converter works on any OS, including Windows, Mac, and Linux. You can convert files to PDF from any device with an Internet connection.",
    paths: ["M24 8a16 16 0 1 0 0 32 16 16 0 0 0 0-32z", "M8 24h32", "M24 8c4 4.5 6 9.7 6 16s-2 11.5-6 16", "M24 8c-4 4.5-6 9.7-6 16s2 11.5 6 16"]
  },
  {
    title: "A suite of helpful file conversion tools",
    text: "Our PDF file converter does more than convert files to PDF. From compression and rotation to merging and splitting, you can edit your PDF files in the blink of an eye.",
    paths: ["M10 12h11v11H10z", "M27 12h11v11H27z", "M10 29h11v11H10z", "M27 29h11v11H27z"]
  }
];

const HEADER_NAV_ITEMS = [
  { label: "Convert", slug: "pdf-to-word", activeOnHome: true },
  { label: "Merge", slug: "merge-pdf" },
  { label: "Split", slug: "split-pdf" },
  { label: "Protect", slug: "protect-pdf" },
  { label: "Unlock", slug: "unlock-pdf" },
  { label: "Compress", slug: "compress-pdf" },
  { label: "Rotate", slug: "rotate-pdf" },
  { label: "Redact", slug: "redact-pdf" },
  { label: "Flatten", slug: "flatten-pdf" },
];

export default function AltfPdfHomepage() {
  const pathname = usePathname();
  const router = useRouter();
  const isSubdir = pathname.startsWith("/altflovepdf");

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Helper to generate correct URLs (supports local development /altflovepdf and production /)
  const getToolLink = (slug) => {
    return isSubdir ? `/altflovepdf/${slug}` : `/${slug}`;
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
          <a href="#page-tools" className="nav-link-item altf-all-tools-link">
            <span className="altf-grid-icon" aria-hidden="true">
              <span></span><span></span><span></span><span></span>
            </span>
            All Tools
          </a>
          <span className="altf-nav-divider" aria-hidden="true"></span>
          {HEADER_NAV_ITEMS.map((item) => (
            <Link
              key={item.slug}
              href={getToolLink(item.slug)}
              className={`nav-link-item ${item.activeOnHome ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="altf-navbar-actions">
          <button
            className="altf-signup"
            type="button"
            onClick={() => router.push(getToolLink("merge-pdf"))}
            suppressHydrationWarning
          >
            Get started
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
                      className="altf-drawer-link"
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

      {/* HERO */}
      <section className="altf-hero">
        <motion.div
          className="altf-reference-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="altf-reference-drop">
            <div className="altf-reference-heading">
              <span className="altf-reference-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M6 3h9l3 3v15H6z" />
                  <path d="M15 3v5h5" />
                  <path d="M9 15h6" />
                </svg>
              </span>
              <h1>Online PDF Converter</h1>
            </div>
            <p className="altf-reference-sub">Easily convert to and from PDF in seconds.</p>
            <button
              type="button"
              className="altf-choose-file-btn"
              onClick={() => router.push(getToolLink("merge-pdf"))}
              suppressHydrationWarning
            >
              <span aria-hidden="true">+</span>
              Choose file
            </button>
            <div className="altf-source-icons" aria-label="File source options">
              {[
                ["Drive", "M12 4 4.5 17h5L17 4z M9.5 17h10L17 4"],
                ["Dropbox", "M7 5l5 3-5 3-5-3z M17 5l5 3-5 3-5-3z M7 13l5 3 5-3 M12 16v3"],
                ["Link", "M10 13a5 5 0 0 0 7.07 0l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15 M14 11a5 5 0 0 0-7.07 0l-2 2A5 5 0 0 0 12 20.07l1.15-1.15"],
              ].map(([label, path]) => (
                <button key={label} type="button" aria-label={label} onClick={() => router.push(getToolLink("merge-pdf"))} suppressHydrationWarning>
                  <svg viewBox="0 0 24 24">
                    <path d={path} />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="altf-how-to" id="how-it-works">
          <h2>How to Convert Files to and from PDF Free</h2>
          <div className="altf-how-steps">
            {HOW_TO_STEPS.map((step, index) => (
              <div key={step.title} className="altf-how-step">
                <span>{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="altf-feature-section" id="features">
        <div className="altf-feature-list-reference">
          {FEATURE_ITEMS.map((feature) => (
            <article key={feature.title} className="altf-feature-item-reference">
              <span className="altf-feature-icon-reference" aria-hidden="true">
                <svg viewBox="0 0 48 48">
                  {feature.paths.map((path) => (
                    <path key={path} d={path} />
                  ))}
                </svg>
              </span>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="altf-product-family" id="page-tools">
        <h2>All PDF tools</h2>
        <div className="altf-product-grid-reference">
          {TOOLS.map((tool) => (
            <Link key={tool.slug} href={getToolLink(tool.slug)} className="altf-product-card-reference">
              <span className="altf-product-icon-reference" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <use href={tool.icon || "#s-convert"} />
                </svg>
              </span>
              <span>{tool.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
