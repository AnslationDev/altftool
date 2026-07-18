"use client";

/**
 * Explore More Fitness Tools — styled with the Step Counter app theme
 * (hardcoded indigo/violet palette, see StepApp.jsx) so the whole page
 * reads as one premium product.
 */

import {
  ArrowRight,
  Calculator,
  Droplets,
  Flame,
  Moon,
  Scale,
} from "lucide-react";
import { THEME as C } from "./StepApp.jsx";

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
            className="text-[11px] font-extrabold uppercase tracking-[0.16em]"
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
          <p className="mt-1 text-[12px] font-medium md:text-[13px]" style={{ color: C.muted }}>
            Free tools that pair perfectly with your step goals.
          </p>
        </div>
        <a
          href="/tools/all"
          className="group inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[12px] font-bold text-white transition active:opacity-90"
          style={{ background: C.grad, boxShadow: "0 8px 18px rgba(124,92,246,0.30)" }}
        >
          View all tools
          <ArrowRight
            size={14}
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          />
        </a>
      </div>

      {/* tool cards */}
      <ul className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {FITNESS_TOOLS.map((tool) => {
          const accent = ACCENTS[tool.accent];
          return (
            <li key={tool.slug}>
              {/* horizontal list card on phones; vertical premium card from lg
                  so descriptions never truncate in narrow columns */}
              <a
                href={`/tools/all/${tool.slug}`}
                className="group relative flex h-full items-center gap-3 rounded-[20px] p-4 shadow-(--sc-shadow) transition-all duration-200 hover:-translate-y-0.5 hover:shadow-(--sc-shadow-lg) focus-visible:ring-4 focus-visible:ring-indigo-300 lg:flex-col lg:items-start lg:p-5"
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
                    className="line-clamp-2 block text-[13px] font-extrabold leading-snug lg:pr-8"
                    style={{ color: C.ink }}
                  >
                    {tool.name}
                  </span>
                  <span
                    className="block truncate text-[11px] font-medium lg:mt-0.5 lg:line-clamp-2 lg:whitespace-normal"
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
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
