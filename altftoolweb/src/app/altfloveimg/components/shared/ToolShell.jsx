"use client";

import Link from "next/link";
import { ChevronRight, ArrowLeft, ShieldCheck, Zap, Infinity as InfinityIcon, ArrowUpRight } from "lucide-react";
import { BASE, getTool, relatedTools } from "../../data/tools";
import { motion, useReducedMotion, Reveal, RevealGroup, RevealItem, scaleIn } from "../../lib/motion";

/**
 * Consistent premium chrome for every tool page:
 * breadcrumb → header → tool body (children) → related tools.
 */
export default function ToolShell({ slug, children }) {
  const tool = getTool(slug);
  const Icon = tool?.icon;
  const related = relatedTools(slug, 3);
  const reduce = useReducedMotion();
  const accent = tool?.accent || "#2563eb";

  return (
    <div className="relative" style={{ background: "var(--ali-page)", "--ali-accent": accent }}>
      {/* accent glow header backdrop */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-80 w-[120%] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: `radial-gradient(closest-side, color-mix(in srgb, ${accent} 26%, transparent), transparent)` }} />
        <div className="absolute inset-0 ali-grid-bg opacity-40" />
      </div>

      <div className="ali-container relative z-10 pt-6 pb-16">
        {/* breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm" style={{ color: "var(--ali-muted)" }}>
          <Link href={BASE} className="transition-colors hover:text-[var(--ali-blue)]">ALTF Love IMG</Link>
          <ChevronRight size={14} />
          <span className="font-medium" style={{ color: "var(--ali-text)" }}>{tool?.name}</span>
        </nav>

        {/* header */}
        <motion.header
          className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-start gap-4">
            {Icon && (
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${accent}, #4f46e5)`, boxShadow: `0 12px 28px color-mix(in srgb, ${accent} 35%, transparent)` }}>
                <Icon size={30} />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{tool?.name}</h1>
              <p className="mt-1 max-w-2xl text-sm sm:text-base" style={{ color: "var(--ali-muted)" }}>{tool?.description}</p>
            </div>
          </div>
          <Link href={BASE} className="ali-btn ali-btn-ghost shrink-0 self-start">
            <ArrowLeft size={16} /> All tools
          </Link>
        </motion.header>

        {/* trust strip */}
        <div className="mt-5 flex flex-wrap gap-2.5 text-xs font-medium">
          {[
            { icon: ShieldCheck, label: "Processed in your browser" },
            { icon: Zap, label: "Instant, no waiting" },
            { icon: InfinityIcon, label: "Free & unlimited" },
          ].map((t) => {
            const TI = t.icon;
            return (
              <span key={t.label} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5"
                style={{ borderColor: "var(--ali-border)", background: "var(--ali-surface)", color: "var(--ali-muted)" }}>
                <TI size={14} style={{ color: accent }} /> {t.label}
              </span>
            );
          })}
        </div>

        {/* body */}
        <Reveal className="mt-8" delay={0.05}>{children}</Reveal>

        {/* related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-4 text-lg font-semibold">Explore more tools</h2>
            <RevealGroup className="grid gap-4 sm:grid-cols-3" stagger={0.06}>
              {related.map((t) => {
                const RIcon = t.icon;
                return (
                  <RevealItem key={t.slug} variants={scaleIn}>
                    <Link href={`${BASE}/${t.slug}`}
                      className="ali-card ali-card-hover ali-tool-card group flex items-center gap-3 p-4"
                      style={{ "--ali-accent": t.accent }}>
                      <span className="ali-tool-icon shrink-0"><RIcon size={22} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{t.name}</span>
                        <span className="block truncate text-xs" style={{ color: "var(--ali-muted)" }}>{t.tagline}</span>
                      </span>
                      <ArrowUpRight size={16} className="shrink-0 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" style={{ color: "var(--ali-accent)" }} />
                    </Link>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          </section>
        )}
      </div>
    </div>
  );
}

/** Two-column layout: settings sidebar (left) + workspace (right). */
export function ToolLayout({ sidebar, children }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="ali-card p-5">{sidebar}</div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function Panel({ title, children, className = "" }) {
  return (
    <section className={`ali-card p-5 ${className}`}>
      {title && <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--ali-muted)" }}>{title}</h3>}
      {children}
    </section>
  );
}
