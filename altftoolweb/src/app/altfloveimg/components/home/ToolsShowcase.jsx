"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, Check } from "lucide-react";
import { TOOLS, CATEGORIES, BASE } from "../../data/tools";
import { Reveal, RevealGroup, RevealItem, scaleIn } from "../../lib/motion";

const FEATURE_POINTS = ["Batch processing", "Before / after compare", "One-click ZIP export"];

export default function ToolsShowcase() {
  const [cat, setCat] = useState("all");
  const visible = cat === "all" ? TOOLS : TOOLS.filter((t) => t.category === cat);
  const featured = cat === "all" ? visible[0] : null;
  const rest = featured ? visible.slice(1) : visible;
  const FIcon = featured?.icon;

  return (
    <section id="tools" className="ali-section relative" style={{ background: "var(--ali-surface)" }}>
      <div className="ali-container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="ali-eyebrow">The toolkit</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            One home for all your <span className="ali-gradient-text">image tasks</span>
          </h2>
          <p className="mt-3 text-base" style={{ color: "var(--ali-muted)" }}>
            Purpose-built tools that run instantly in your browser. Pick one and go.
          </p>
        </Reveal>

        <Reveal className="mt-8 flex flex-wrap justify-center gap-2" delay={0.05}>
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)} data-active={cat === c.id} className="ali-tab">
              {c.label}
            </button>
          ))}
        </Reveal>

        <RevealGroup
          key={cat}
          className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.05}
        >
          {/* featured bento tile */}
          {featured && (
            <RevealItem variants={scaleIn} className="sm:col-span-2 lg:row-span-2">
              <Link
                href={`${BASE}/${featured.slug}`}
                className="ali-card ali-card-hover ali-tool-card group flex h-full flex-col overflow-hidden p-7"
                style={{ "--ali-accent": featured.accent }}
              >
                <div className="relative -mx-7 -mt-7 mb-6 h-32 overflow-hidden" style={{ background: "var(--ali-grad)" }}>
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #fff 0, transparent 40%)" }} />
                  <span className="absolute right-5 top-5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    {featured.badge || "Most popular"}
                  </span>
                  <div className="absolute -bottom-6 left-6 grid h-20 w-20 place-items-center rounded-2xl bg-white text-[var(--ali-accent)] shadow-xl">
                    {FIcon && <FIcon size={36} />}
                  </div>
                </div>
                <h3 className="mt-2 text-2xl font-bold">{featured.name}</h3>
                <p className="mt-2 text-[15px] leading-relaxed" style={{ color: "var(--ali-muted)" }}>
                  {featured.description}
                </p>
                <ul className="mt-5 flex flex-col gap-2.5">
                  {FEATURE_POINTS.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm font-medium">
                      <span className="grid h-5 w-5 place-items-center rounded-full" style={{ background: "color-mix(in srgb, var(--ali-accent) 16%, transparent)", color: "var(--ali-accent)" }}>
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-6 font-semibold" style={{ color: "var(--ali-accent)" }}>
                  Open {featured.name}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </RevealItem>
          )}

          {rest.map((t) => {
            const Icon = t.icon;
            return (
              <RevealItem key={t.slug} variants={scaleIn}>
                <Link
                  href={`${BASE}/${t.slug}`}
                  className="ali-card ali-card-hover ali-tool-card group flex h-full flex-col p-6"
                  style={{ "--ali-accent": t.accent }}
                >
                  <div className="flex items-start justify-between">
                    <span className="ali-tool-icon"><Icon size={24} /></span>
                    <div className="flex items-center gap-2">
                      {t.badge && (
                        <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                          style={{ background: "color-mix(in srgb, var(--ali-accent) 14%, transparent)", color: "var(--ali-accent)" }}>
                          {t.badge}
                        </span>
                      )}
                      <ArrowUpRight size={18}
                        className="opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"
                        style={{ color: "var(--ali-accent)" }} />
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{t.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--ali-muted)" }}>
                    {t.description}
                  </p>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
