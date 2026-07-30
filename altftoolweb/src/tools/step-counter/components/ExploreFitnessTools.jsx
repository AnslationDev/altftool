"use client";

/**
 * Explore More Fitness Tools — styled through ./theme.js, which now resolves to
 * the platform's global semantic tokens rather than the tracker's scoped ones
 * (those never reached this component; see theme.js). Card chrome, focus rings
 * and shadows come from the design system so this section matches the rest of
 * the site in both themes; the per-tool icon tints keep the site-wide `--sc-*`
 * tool-accent tokens, which are global and theme-aware.
 */

import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  Droplets,
  Flame,
  Moon,
  Scale,
} from "lucide-react";
import { THEME as C } from "./theme.js";

const ACCENTS = {
  indigo: { bg: "var(--sc-soft-indigo)", fg: "var(--sc-indigo)" },
  orange: { bg: "var(--sc-soft-orange)", fg: "var(--sc-orange)" },
  blue: { bg: "var(--sc-soft-blue)", fg: "var(--sc-blue)" },
  green: { bg: "var(--sc-soft-green)", fg: "var(--sc-green)" },
  violet: { bg: "var(--sc-soft-violet)", fg: "var(--sc-violet)" },
};

const FITNESS_TOOLS = [
  {
    slug: "bmi-calculator",
    name: "BMI Calculator",
    description: "Check your body mass index",
    icon: Calculator,
    accent: "indigo",
  },
  {
    slug: "calorie-tdee-calculator",
    name: "Calorie & TDEE",
    description: "Daily calorie needs",
    icon: Flame,
    accent: "orange",
  },
  {
    slug: "water-intake-calculator",
    name: "Water Intake",
    description: "Hydration target",
    icon: Droplets,
    accent: "blue",
  },
  {
    slug: "weight-loss-tracker",
    name: "Weight Loss Tracker",
    description: "Log your progress",
    icon: Scale,
    accent: "green",
  },
  {
    slug: "sleep-calculator",
    name: "Sleep Calculator",
    description: "Ideal bed times",
    icon: Moon,
    accent: "violet",
  },
];

export default function ExploreFitnessTools() {
  return (
    <section aria-label="Explore more fitness tools">
      {/* section header */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p
            className="text-[12px] font-extrabold uppercase tracking-[0.14em]"
            style={{ color: C.indigo }}
          >
            Keep going
          </p>
          <h2
            className="mt-1 text-[20px] font-extrabold leading-tight md:text-[24px]"
            style={{ color: C.ink }}
          >
            Explore More Fitness Tools
          </h2>
          <p className="mt-1 text-[14px] font-medium" style={{ color: C.muted }}>
            Free tools that pair perfectly with your step goals.
          </p>
        </div>
        <Link
          href="/tools/all"
          className="group inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] font-bold text-white transition active:opacity-90"
          style={{ background: C.grad, boxShadow: "var(--shadow-md)" }}
        >
          View all tools
          <ArrowRight
            size={14}
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      {/* tool cards */}
      <ul className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {FITNESS_TOOLS.map((tool) => {
          const accent = ACCENTS[tool.accent];
          return (
            <li key={tool.slug}>
              {/* horizontal list card on phones; vertical premium card from lg
                  so descriptions never truncate in narrow columns */}
              <Link
                href={`/tools/all/${tool.slug}`}
                className="group relative flex h-full items-center gap-3 rounded-xl border border-(--border) p-4 shadow-(--shadow-sm) transition-all duration-200 hover:-translate-y-0.5 hover:shadow-(--shadow-md) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) motion-reduce:transform-none motion-reduce:transition-none lg:flex-col lg:items-start lg:p-5"
                style={{ backgroundColor: C.card }}
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105"
                  style={{ backgroundColor: accent.bg, color: accent.fg }}
                  aria-hidden="true"
                >
                  <tool.icon size={19} />
                </span>
                <span className="min-w-0 flex-1 lg:flex-none">
                  <span
                    className="line-clamp-2 block text-[15px] font-extrabold leading-snug lg:pr-8"
                    style={{ color: C.ink }}
                  >
                    {tool.name}
                  </span>
                  <span
                    className="block truncate text-[14px] font-medium lg:mt-0.5 lg:line-clamp-2 lg:whitespace-normal"
                    style={{ color: C.muted }}
                  >
                    {tool.description}
                  </span>
                </span>
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-200 group-hover:translate-x-0.5 lg:absolute lg:right-4 lg:top-4"
                  style={{ backgroundColor: C.tile, color: C.indigo }}
                  aria-hidden="true"
                >
                  <ArrowRight size={13} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
