"use client";

import { motion } from "framer-motion";
import { toHome } from "../router";

// ---------------------------------------------------------------------------
// Reveal wrapper — stagger-friendly scroll-triggered reveal
// ---------------------------------------------------------------------------
export const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, delay: i * 0.06, ease: [0.2, 0.7, 0.2, 1] },
  }),
};

export function Reveal({ children, delay = 0, className = "", as = "div" }) {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={fadeUp}
      custom={delay}
      className={className}
    >
      {children}
    </Tag>
  );
}

// ---------------------------------------------------------------------------
// Rank digit — the large editorial glyph used throughout the site
// ---------------------------------------------------------------------------
export function RankDigit({ rank, className = "" }) {
  return <span className={`big-digit display ${className}`}>{rank}</span>;
}

// ---------------------------------------------------------------------------
// Eyebrow / kicker
// ---------------------------------------------------------------------------
export function Kicker({ children, className = "" }) {
  return (
    <div className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute ${className}`}>
      <span className="inline-block h-px w-6 bg-ink-mute" />
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section frame
// ---------------------------------------------------------------------------
export function Section({ children, id, className = "", dark = false }) {
  return (
    <section id={id} className={`relative ${dark ? "bg-ink text-paper" : ""} ${className}`}>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Container
// ---------------------------------------------------------------------------
export function Container({ children, className = "", wide = false }) {
  return (
    <div className={`mx-auto ${wide ? "max-w-[1480px]" : "max-w-[1280px]"} px-5 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
export function Button({ children, variant = "primary", className = "", href = "#" }) {
  const styles = {
    primary: "bg-ink text-paper hover:bg-accent",
    ghost: "text-ink hover:text-accent",
    outline: "border border-ink/40 text-ink hover:border-ink hover:bg-ink hover:text-paper",
    dark: "bg-paper text-ink hover:bg-paper/90",
  };

  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium transition-all duration-300 ${styles[variant]} ${className}`}
    >
      <span>{children}</span>
      <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">→</span>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Score bar
// ---------------------------------------------------------------------------
export function ScoreBar({ score }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-[3px] w-20 overflow-hidden rounded-full bg-ink/10">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${(score / 10) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }}
          className="h-full bg-ink"
        />
      </div>
      <span className="num-tabular font-mono text-[11px] text-ink-mute">{score.toFixed(1)}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Logo
// ---------------------------------------------------------------------------
export function Logo({ dark = false }) {
  return (
    <a href={toHome()} className="flex items-baseline gap-[3px]">
      <span className={`display text-[26px] font-light tracking-tight ${dark ? "text-paper" : "text-ink"}`}>
        Top
      </span>
      <span className={`display text-[26px] italic font-normal ${dark ? "text-accent-soft" : "text-accent"}`}>
        3
      </span>
    </a>
  );
}
