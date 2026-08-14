"use client";

import Link from "next/link";
import { ShieldCheck, WifiOff, Lock, Zap, Calculator } from "lucide-react";
import { CALCULATORS, SIDEBAR_CATEGORIES } from "../toolsData";

const BASE = "/altfcalculators";

// Build up to 4 footer columns from the first calculators of each category.
const COLUMNS = SIDEBAR_CATEGORIES.slice(0, 4).map((cat) => ({
  heading: cat,
  links: CALCULATORS.filter((c) => c.sidebarCategory === cat)
    .slice(0, 5)
    .map((c) => [c.name, c.slug]),
}));

export default function AltfCalcFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="afc-footer">
      <div className="afc-footer-inner">
        <div className="afc-footer-grid">
          <div>
            <Link href={BASE} className="afc-brand-logo" aria-label="AltF Calculators home">
              <span className="afc-brand-mark" aria-hidden="true">
                <Calculator size={20} />
              </span>
              <span className="afc-brand-name">
                AltF Calculators
              </span>
            </Link>
            <p className="afc-tagline">
              A clean, fast suite of everyday calculators that run entirely in your browser —
              finance, health, maths, conversions and more. Nothing is uploaded, ever.
            </p>
            <div className="afc-chips">
              <span className="afc-chip"><Lock size={13} /> 100% Private</span>
              <span className="afc-chip"><WifiOff size={13} /> Works Offline</span>
              <span className="afc-chip"><ShieldCheck size={13} /> No Sign-up</span>
              <span className="afc-chip"><Zap size={13} /> Instant</span>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading} className="afc-footer-col">
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

      <div className="afc-footer-bottom">
        <p>© {year} AltFTool · Every calculation happens on your device.</p>
        <div className="afc-footer-bottom-links">
          <Link href={BASE}>Home</Link>
          <Link href="/policypages/privacy">Privacy</Link>
          <Link href="/policypages/termsandconditions">Terms</Link>
          <Link href="/">An AltFTool product ↗</Link>
        </div>
      </div>
    </footer>
  );
}
