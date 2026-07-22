"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AppWindow,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Gamepad2,
  Ghost,
  ImageIcon,
  Landmark,
  Laugh,
  LayoutGrid,
  Library,
  Mail,
  MessageSquarePlus,
  Music4,
  Newspaper,
  PenTool,
  Plane,
  Puzzle,
  Radio,
  ScrollText,
  Sparkles,
  Trophy,
  Waves,
  Wrench,
} from "lucide-react";
import {
  FEATURED_EXPERIMENTS,
  GRID_EXPERIMENTS,
  LAB_GRADUATES,
} from "./data/experiments";

const ICONS = {
  Activity,
  AppWindow,
  BookOpen,
  Brain,
  Gamepad2,
  Ghost,
  ImageIcon,
  Landmark,
  Laugh,
  LayoutGrid,
  Library,
  Music4,
  Newspaper,
  PenTool,
  Plane,
  Puzzle,
  Radio,
  ScrollText,
  Sparkles,
  Trophy,
  Waves,
  Wrench,
};

const TONE_GRADIENTS = {
  teal: "linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--secondary) 75%, var(--primary)))",
  cyan: "linear-gradient(135deg, var(--secondary), color-mix(in srgb, var(--primary) 55%, var(--secondary)))",
  violet:
    "linear-gradient(135deg, var(--anslation-ds-accent), color-mix(in srgb, var(--secondary) 45%, var(--anslation-ds-accent)))",
};

const TONE_TILES = {
  teal: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 26%, var(--card)), color-mix(in srgb, var(--secondary) 14%, var(--card)))",
  cyan: "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 24%, var(--card)), color-mix(in srgb, var(--primary) 12%, var(--card)))",
  violet:
    "linear-gradient(135deg, color-mix(in srgb, var(--anslation-ds-accent) 22%, var(--card)), color-mix(in srgb, var(--secondary) 12%, var(--card)))",
};

function ExperimentIcon({ name, className }) {
  const Icon = ICONS[name] || Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}

function ToneChip({ tone, icon, size = "md" }) {
  const dims = size === "lg" ? "h-12 w-12 rounded-xl" : "h-10 w-10 rounded-lg";
  const iconDims = size === "lg" ? "h-6 w-6" : "h-5 w-5";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center text-white ${dims}`}
      style={{ backgroundImage: TONE_GRADIENTS[tone] || TONE_GRADIENTS.teal }}
    >
      <ExperimentIcon name={icon} className={iconDims} />
    </span>
  );
}

function TagPill({ children }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
      style={{
        backgroundColor: "var(--badge-bg)",
        color: "color-mix(in srgb, var(--primary) 55%, var(--foreground))",
      }}
    >
      {children}
    </span>
  );
}

/* ---------------------------------- Header --------------------------------- */

function LabsHeader() {
  const nav = [
    { label: "Experiments", href: "#experiments" },
    { label: "Beyond the Lab", href: "#beyond-the-lab" },
    { label: "Stay connected", href: "#stay-connected" },
  ];
  return (
    <header
      className="sticky top-0 z-40 border-b border-border backdrop-blur-xl"
      style={{ backgroundColor: "color-mix(in srgb, var(--background) 82%, transparent)" }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/labs" className="flex items-center gap-2.5" aria-label="AltFTool Labs home">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
            style={{ backgroundImage: TONE_GRADIENTS.teal }}
          >
            <FlaskConical className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">
            AltFTool <span className="text-primary">Labs</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Labs sections">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          altftool.com
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}

/* ----------------------------------- Hero ---------------------------------- */

/** Deterministic tile wall behind the hero (no media assets needed). */
const HERO_TILES = [...FEATURED_EXPERIMENTS, ...GRID_EXPERIMENTS, ...FEATURED_EXPERIMENTS.slice(0, 2)].map(
  (exp, i) => ({
    key: `${exp.slug}-${i}`,
    tone: exp.tone,
    icon: exp.icon,
    tall: i % 7 === 1 || i % 7 === 4,
  })
);

function HeroTileWall() {
  return (
    <div id="labs-hero-tiles" className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="grid h-full grid-cols-3 gap-3 p-3 sm:grid-cols-4 lg:grid-cols-6 auto-rows-[minmax(90px,1fr)]">
        {HERO_TILES.map((tile) => (
          <div
            key={tile.key}
            className={`flex items-center justify-center rounded-xl ${tile.tall ? "row-span-2" : ""}`}
            style={{ backgroundImage: TONE_TILES[tile.tone] || TONE_TILES.teal }}
          >
            <ExperimentIcon name={tile.icon} className="h-8 w-8" />
          </div>
        ))}
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(72% 68% at 50% 46%, color-mix(in srgb, var(--background) 94%, transparent) 0%, color-mix(in srgb, var(--background) 72%, transparent) 55%, color-mix(in srgb, var(--background) 30%, transparent) 100%)",
        }}
      />
    </div>
  );
}

function HeroCarousel() {
  const items = FEATURED_EXPERIMENTS;
  const [index, setIndex] = useState(0);
  const active = items[index];

  const go = useCallback(
    (delta) => setIndex((v) => (v + delta + items.length) % items.length),
    [items.length]
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = setInterval(() => go(1), 6000);
    return () => clearInterval(timer);
  }, [go]);

  return (
    <section className="relative isolate flex min-h-[78vh] items-center justify-center" aria-label="Featured experiments">
      <HeroTileWall />

      <div key={active.slug} className="labs-fade relative z-10 mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          AltFTool Labs · {active.tag}
        </p>
        <h1
          className="text-balance font-extrabold tracking-tight text-foreground"
          style={{ fontSize: "clamp(2.5rem, 7vw, 4.5rem)", lineHeight: 1.05 }}
          aria-live="polite"
        >
          {active.name}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          {active.tagline}
        </p>
        <div className="mt-8 flex items-center justify-center">
          <Link
            href={active.href}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-md transition-colors hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)]"
          >
            {active.cta}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous experiment"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2" role="tablist" aria-label="Featured experiment selector">
          {items.map((item, i) => (
            <button
              key={item.slug}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show ${item.name}`}
              onClick={() => setIndex(i)}
              className="h-2.5 rounded-full transition-all"
              style={{
                width: i === index ? "1.75rem" : "0.625rem",
                backgroundColor:
                  i === index ? "var(--primary)" : "color-mix(in srgb, var(--muted-foreground) 45%, transparent)",
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next experiment"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

/* ------------------------------ Experiments grid --------------------------- */

function ExperimentsGrid() {
  return (
    <section id="experiments" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Experiments</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Be the first to experiment
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Fresh ideas from the AltFTool workbench — playful, useful and sometimes a little strange.
          Try them early and tell us what deserves to grow.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {GRID_EXPERIMENTS.map((exp) => (
            <Link
              key={exp.slug}
              href={exp.href}
              className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <div className="flex items-start justify-between gap-3">
                <ToneChip tone={exp.tone} icon={exp.icon} />
                <TagPill>{exp.tag}</TagPill>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-card-foreground">{exp.name}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                {exp.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Try it now
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- About blurb ----------------------------- */

function AboutLabs() {
  return (
    <section
      className="border-y border-border py-20"
      style={{ backgroundColor: "var(--section-highlight)" }}
    >
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">About AltFTool Labs</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Where AltFTool tries its boldest ideas
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Every experiment starts with a simple question: what would make the web more useful — or
          more fun? The Labs team builds these ideas in the open, you get early access, and your
          feedback decides which experiments grow into everyday AltFTool products.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------ Beyond the lab ----------------------------- */

function BeyondTheLab() {
  return (
    <section id="beyond-the-lab" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Beyond the Lab</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Life beyond the Lab
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Some experiments outgrow the workbench. These began as Labs ideas and are now part of the
          everyday AltFTool platform.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {LAB_GRADUATES.map((item) => (
            <Link
              key={item.slug}
              href={item.href}
              className="group flex items-start gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <ToneChip tone={item.tone} icon={item.icon} size="lg" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-card-foreground">{item.name}</h3>
                  <TagPill>{item.label}</TagPill>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Visit
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Stay connected ---------------------------- */

function StayConnected() {
  const cards = [
    {
      title: "Never miss a new experiment",
      description: "Get the AltFTool newsletter for early access to whatever leaves the workbench next.",
      href: "/news/newsletter",
      cta: "Sign up for the newsletter",
      icon: Mail,
    },
    {
      title: "Shape what Labs builds next",
      description: "Have an idea for a tool or experiment? Send it in — the best requests get built.",
      href: "/request-a-tool",
      cta: "Request a tool",
      icon: MessageSquarePlus,
    },
  ];
  return (
    <section
      id="stay-connected"
      className="scroll-mt-20 border-t border-border py-20"
      style={{ backgroundColor: "var(--section-highlight)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Stay connected for early access
        </h2>
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <div
              key={card.href}
              className="flex flex-col items-start rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-lg text-white"
                style={{ backgroundImage: TONE_GRADIENTS.teal }}
              >
                <card.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-card-foreground">{card.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                {card.description}
              </p>
              <Link
                href={card.href}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {card.cta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- Footer --------------------------------- */

function LabsFooter() {
  const links = [
    { label: "Tools", href: "/tools/all" },
    { label: "Blogs", href: "/blogs" },
    { label: "News", href: "/news" },
    { label: "About", href: "/policypages/about" },
    { label: "Privacy", href: "/policypages/privacy" },
    { label: "Terms", href: "/policypages/termsandconditions" },
  ];
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 sm:flex-row sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">AltFTool Labs</span>
        </div>
        <nav aria-label="Labs footer">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} AltFTool</p>
      </div>
    </footer>
  );
}

/* ----------------------------------- Page ---------------------------------- */

export default function LabsClient() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <style>{`
        @keyframes labs-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .labs-fade { animation: labs-fade .5s ease; }
        @media (prefers-reduced-motion: reduce) { .labs-fade { animation: none; } }
        #labs-hero-tiles svg { color: color-mix(in srgb, var(--muted-foreground) 60%, transparent); }
      `}</style>
      <LabsHeader />
      <main>
        <HeroCarousel />
        <ExperimentsGrid />
        <AboutLabs />
        <BeyondTheLab />
        <StayConnected />
      </main>
      <LabsFooter />
    </div>
  );
}
