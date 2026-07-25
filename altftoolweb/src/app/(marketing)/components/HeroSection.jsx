import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  FlaskConical,
  Layers3,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { EXPERIENCE_CATALOG } from "@altftool/core/experiences";
import { PRODUCT_SUITE_CATALOG } from "@altftool/core/product-suites";
import { CANONICAL_CATEGORIES } from "@/platform/registry/categoryTaxonomy";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import CountUpNumber from "./CountUpNumber";

const catalogFacts = [
  {
    label: "Free tools",
    value: Object.keys(toolMetaMap).length,
    suffix: "+",
    icon: Wrench,
  },
  {
    label: "Tool categories",
    value: CANONICAL_CATEGORIES.length,
    icon: Layers3,
  },
  {
    label: "Product workspaces",
    value: PRODUCT_SUITE_CATALOG.length,
    icon: Boxes,
  },
  {
    label: "Interactive labs",
    value: EXPERIENCE_CATALOG.length,
    icon: FlaskConical,
  },
];

const quickRoutes = [
  { label: "Browse all tools", href: "/tools/all" },
  { label: "Build an automation", href: "/n8n" },
  { label: "Explore business services", href: "/bops" },
];

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden border-b border-border bg-background"
      aria-labelledby="home-title"
    >
      {/* Ambient brand glow + dot grid — pure decoration, token-driven. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_70%)] blur-2xl" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--secondary)_14%,transparent),transparent_70%)] blur-2xl" />
        <div className="absolute inset-0 bg-[radial-gradient(color-mix(in_srgb,var(--border)_70%,transparent)_1px,transparent_1px)] bg-[size:26px_26px] [mask-image:radial-gradient(ellipse_60%_60%_at_30%_35%,black,transparent)]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-[var(--anslation-ds-container)] items-center gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.82fr)] lg:px-8">
        <div className="max-w-3xl">
          <p className="inline-flex min-h-8 items-center gap-2 rounded-full border border-border bg-card px-3 text-xs font-semibold text-primary shadow-sm">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)]" />
            </span>
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Organized tools for real work
          </p>

          <h1
            id="home-title"
            className="mt-5 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Alt<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">F</span>Tool
          </h1>
          <span
            className="mt-4 block h-1 w-16 rounded-full bg-gradient-to-r from-primary to-secondary"
            aria-hidden="true"
          />
          <p className="mt-3 max-w-2xl text-xl font-semibold leading-8 text-foreground sm:text-2xl">
            Find the right tool, workflow, or practical next step.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Search browser utilities, product workspaces, automations, business
            services, guides, deals, and interactive labs from one structured
            platform.
          </p>

          <form
            action="/search"
            className="mt-6 flex max-w-2xl flex-col gap-2 sm:flex-row"
            role="search"
          >
            <label className="relative min-w-0 flex-1" htmlFor="home-global-search">
              <span className="sr-only">Search all of AltFTool</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="home-global-search"
                name="q"
                type="search"
                minLength={2}
                maxLength={100}
                required
                placeholder="Search tools, workflows, guides, deals..."
                className="h-11 w-full rounded-md border border-border bg-card pl-10 pr-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-[3px] focus:ring-primary/25"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-[var(--primary-hover)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
            >
              Search AltFTool
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>

          <nav
            aria-label="Popular starting points"
            className="mt-4 flex flex-wrap gap-x-5 gap-y-2"
          >
            {quickRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="group inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-primary transition-colors duration-150 hover:text-[var(--primary-hover)] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {route.label}
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transform-none"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </nav>

          <dl className="mt-5 grid max-w-2xl grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
            {catalogFacts.map((fact) => {
              const Icon = fact.icon;
              return (
                <div
                  key={fact.label}
                  className="flex min-w-0 flex-col items-start gap-2 sm:min-h-12"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted text-primary">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="flex min-w-0 flex-col-reverse">
                    <dt className="text-xs font-medium leading-4 text-muted-foreground">
                      {fact.label}
                    </dt>
                    <dd className="text-lg font-bold tabular-nums text-foreground">
                      <CountUpNumber value={fact.value} suffix={fact.suffix || ""} />
                    </dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </div>

        <div className="relative mx-auto hidden w-full max-w-xl items-end justify-center lg:flex lg:justify-end">
          <Image
            src="/assets/home-hero-team.webp"
            alt="People using AltFTool workspaces together"
            width={1100}
            height={831}
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1024px) 42vw, 1px"
            className="h-auto w-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}
