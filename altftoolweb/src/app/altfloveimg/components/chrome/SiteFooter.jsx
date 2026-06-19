"use client";

import Link from "next/link";
import { ShieldCheck, Wifi, Infinity as InfinityIcon, ArrowUpRight } from "lucide-react";
import Logo from "../illustrations/Logo";
import { TOOLS, CATEGORIES, BASE } from "../../data/tools";

const COLS = CATEGORIES.filter((c) => c.id !== "all");

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-8 border-t" style={{ borderColor: "var(--ali-border)", background: "var(--ali-surface)" }}>
      <div className="ali-container py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2.6fr]">
          {/* brand */}
          <div>
            <Link href={BASE} className="flex items-center gap-2.5" aria-label="ALTF Love IMG home">
              <Logo size={36} />
              <span className="text-lg font-bold tracking-tight">
                ALTF <span className="ali-gradient-text">Love IMG</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed" style={{ color: "var(--ali-muted)" }}>
              A premium image toolkit that runs entirely in your browser. Compress, convert, edit and
              enhance — privately, instantly and for free.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { icon: ShieldCheck, label: "Private" },
                { icon: Wifi, label: "Offline-ready" },
                { icon: InfinityIcon, label: "Unlimited" },
              ].map((b) => {
                const BI = b.icon;
                return (
                  <span key={b.label} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium"
                    style={{ borderColor: "var(--ali-border)", color: "var(--ali-muted)" }}>
                    <BI size={13} style={{ color: "var(--ali-blue)" }} /> {b.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* tool columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLS.map((cat) => (
              <div key={cat.id}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ali-muted)" }}>{cat.label}</p>
                <ul className="flex flex-col gap-2.5">
                  {TOOLS.filter((t) => t.category === cat.id).map((t) => (
                    <li key={t.slug}>
                      <Link href={`${BASE}/${t.slug}`} className="text-sm transition-colors hover:text-[var(--ali-blue)]" style={{ color: "var(--ali-text-soft)" }}>
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm sm:flex-row" style={{ borderColor: "var(--ali-border)", color: "var(--ali-muted)" }}>
          <p>© {year} ALTF Love IMG · 100% in-browser, your images never leave your device.</p>
          <a href="/" className="inline-flex items-center gap-1 font-medium transition-colors hover:text-[var(--ali-blue)]">
            An AltFTool product <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
}
