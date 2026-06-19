"use client";

import Link from "next/link";
import { ShieldCheck, Wifi, Lock, Zap } from "lucide-react";

const BASE = "/altflovepdf";

const COLUMNS = [
  {
    heading: "Organize",
    links: [
      ["Merge PDF", "merge-pdf"],
      ["Split PDF", "split-pdf"],
      ["Compress PDF", "compress-pdf"],
      ["Rotate PDF", "rotate-pdf"],
      ["Organize Pages", "organize-pdf"],
      ["Crop Pages", "crop-pdf"],
    ],
  },
  {
    heading: "Convert",
    links: [
      ["PDF → Word", "pdf-to-word"],
      ["PDF → Excel", "pdf-to-excel"],
      ["PDF → Image", "pdf-to-image"],
      ["Image → PDF", "image-to-pdf"],
      ["PDF → Text", "pdf-to-text"],
      ["Webpage → PDF", "webpage-to-pdf"],
    ],
  },
  {
    heading: "Edit & Secure",
    links: [
      ["Watermark PDF", "watermark-pdf"],
      ["Page Numbers", "page-numbers"],
      ["Header / Footer", "header-footer"],
      ["Sign PDF", "sign-pdf"],
      ["Redact PDF", "redact-pdf"],
      ["Protect PDF", "protect-pdf"],
    ],
  },
];

function BrandMark() {
  return (
    <span className="alfpdf-brand-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M12 18s-2.6-1.6-2.6-3.3A1.3 1.3 0 0 1 12 13.6a1.3 1.3 0 0 1 2.6 1.1C14.6 16.4 12 18 12 18z" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}

export default function AltfPdfFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="alfpdf-footer">
      <div className="alfpdf-footer-inner">
        <div className="alfpdf-footer-grid">
          {/* Brand column */}
          <div>
            <Link href={BASE} className="alfpdf-brand-logo" aria-label="Altf PDF home">
              <BrandMark />
              <span className="alfpdf-brand-name">
                Altf<span className="alfpdf-heart">❤</span>PDF
              </span>
            </Link>
            <p className="alfpdf-tagline">
              A premium suite of PDF &amp; image tools that run entirely in your browser.
              Every file is processed locally on your device — fast, secure and completely free.
            </p>
            <div className="alfpdf-chips">
              <span className="alfpdf-chip"><Lock size={13} /> 100% Private</span>
              <span className="alfpdf-chip"><Wifi size={13} /> Works Online</span>
              <span className="alfpdf-chip"><ShieldCheck size={13} /> No Uploads</span>
              <span className="alfpdf-chip"><Zap size={13} /> Instant</span>
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.heading} className="alfpdf-col">
              <h4>{col.heading}</h4>
              <ul>
                {col.links.map(([label, slug]) => (
                  <li key={slug}>
                    <Link href={`${BASE}/${slug}`}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="alfpdf-bottom">
        <p>© {year} Altf❤PDF · Your files never leave your device.</p>
        <div className="alfpdf-bottom-links">
          <Link href={BASE}>Home</Link>
          <Link href="/policypages/privacy">Privacy</Link>
          <Link href="/policypages/termsandconditions">Terms</Link>
          <a href="/">An AltFTool product ↗</a>
        </div>
      </div>
    </footer>
  );
}
