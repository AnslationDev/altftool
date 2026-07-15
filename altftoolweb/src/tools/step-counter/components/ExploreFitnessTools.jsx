"use client";

import {
  ArrowRight,
  Calculator,
  Droplets,
  Flame,
  Moon,
  Scale,
} from "lucide-react";
import { toneStyle } from "../utils/tones";
import { CARD, CARD_HOVER, FOCUS_RING, SectionHeading } from "./ui.jsx";

const FITNESS_TOOLS = [
  {
    slug: "bmi-calculator",
    name: "BMI Calculator",
    description: "Check your body mass index",
    icon: Calculator,
    tone: "primary",
  },
  {
    slug: "calorie-tdee-calculator",
    name: "Calorie & TDEE",
    description: "Daily calorie needs",
    icon: Flame,
    tone: "warning",
  },
  {
    slug: "water-intake-calculator",
    name: "Water Intake",
    description: "Hydration target",
    icon: Droplets,
    tone: "info",
  },
  {
    slug: "weight-loss-tracker",
    name: "Weight Loss Tracker",
    description: "Log your progress",
    icon: Scale,
    tone: "success",
  },
  {
    slug: "sleep-calculator",
    name: "Sleep Calculator",
    description: "Ideal bed times",
    icon: Moon,
    tone: "primary",
  },
];

export default function ExploreFitnessTools() {
  return (
    <section aria-label="Explore more fitness tools">
      <SectionHeading
        eyebrow="Keep going"
        title="Explore More Fitness Tools"
        aside={
          <a
            href="/tools/all"
            className={`inline-flex items-center gap-1 rounded-[6px] text-sm font-semibold text-(--muted-foreground) transition hover:text-(--primary-hover) dark:hover:text-(--primary) ${FOCUS_RING}`}
          >
            View all tools
            <ArrowRight size={14} aria-hidden="true" />
          </a>
        }
      />

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {FITNESS_TOOLS.map((tool) => (
          <li key={tool.slug}>
            <a
              href={`/tools/all/${tool.slug}`}
              className={`group ${CARD} ${CARD_HOVER} flex h-full items-center gap-3 p-3.5 ${FOCUS_RING}`}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]"
                style={toneStyle(tool.tone)}
              >
                <tool.icon size={18} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 block text-[13px] font-bold leading-snug text-(--foreground) group-hover:text-(--primary-hover) dark:group-hover:text-(--primary)">
                  {tool.name}
                </span>
                <span className="block truncate text-[11px] font-medium text-(--muted-foreground)">
                  {tool.description}
                </span>
              </span>
              <ArrowRight
                size={15}
                aria-hidden="true"
                className="shrink-0 text-(--muted-foreground) transition group-hover:translate-x-0.5 group-hover:text-(--primary-hover) dark:group-hover:text-(--primary)"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
