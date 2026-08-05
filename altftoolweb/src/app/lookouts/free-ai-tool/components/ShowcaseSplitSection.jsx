"use client";

import { ChevronRight } from "lucide-react";
import ToolLogo from "./ToolLogo";
import AnimatedShowcase from "./AnimatedShowcase";
import DesignToolCard from "./DesignToolCard";
import ScrollReveal from "./ScrollReveal";
import { useOpenTool } from "../hooks/useOpenTool";

const PRICING_STYLES = {
  FREE: "bg-[rgba(187,255,133,0.3)]",
  PAID: "bg-[rgba(255,181,80,0.15)]",
  "FREE + PAID": "bg-[rgba(249,248,113,0.35)]",
};

function ToolRow({ tool, onClick }) {
  const pricingClass = PRICING_STYLES[tool.pricing] || "bg-[rgba(10,5,35,0.06)]";
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-2xl bg-white/80 p-4 text-left shadow-[inset_1.5px_1.5px_1.5px_rgba(255,255,255,0.66),0_20px_40px_rgba(10,5,35,0.03)] transition-shadow hover:shadow-[inset_1.5px_1.5px_1.5px_rgba(255,255,255,0.66),0_20px_40px_rgba(10,5,35,0.1)]"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-100">
        <ToolLogo name={tool.name} domain={tool.domain} size={26} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-[#0A0523]">{tool.name}</span>
        <span className="block truncate text-sm text-[#0A0523]/60">{tool.tagline}</span>
      </span>
      <span className={`hidden sm:inline-flex h-7 shrink-0 items-center rounded-full px-3 text-[11px] font-bold uppercase tracking-wide text-[#0A0523]/50 ${pricingClass}`}>
        {tool.pricing}
      </span>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-[#0A0523]/30 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0A0523]/60"
        aria-hidden="true"
      />
    </button>
  );
}

/**
 * Shared tool-list section. With showShowcase, renders the animated preview
 * mockup alongside the list, alternating which side it sits on via
 * showcaseSide (CSS order, not JSX reordering). Without it, the list alone
 * fills the width as a responsive grid — plain routes to each tool, no
 * preview animation.
 */
export default function ShowcaseSplitSection({
  id,
  title,
  subtitle,
  tools,
  showcaseSide = "left",
  theme,
  layout = "a",
  showcaseLabel,
  icons,
  footer,
  showShowcase = true,
}) {
  const handleToolClick = useOpenTool();

  if (!showShowcase) {
    return (
      <section id={id} className="px-4 py-16 sm:py-20 bg-[#F3F4FD]">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-[28px] sm:text-[32px] font-bold text-[#0A0523]">{title}</h2>
          {subtitle ? <p className="mt-2 text-[#0A0523]/60">{subtitle}</p> : null}

          <div
            className="mt-8 grid gap-5 justify-center"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 300px))" }}
          >
            {tools.map((tool, idx) => (
              <ScrollReveal key={tool.name} delay={(idx % 4) * 70}>
                <DesignToolCard tool={tool} index={idx} onClick={() => handleToolClick(tool)} />
              </ScrollReveal>
            ))}
          </div>
          {footer}
        </div>
      </section>
    );
  }

  const showcaseOrder = showcaseSide === "left" ? "lg:order-1" : "lg:order-2";
  const listOrder = showcaseSide === "left" ? "lg:order-2" : "lg:order-1";

  return (
    <section id={id} className="px-4 py-16 sm:py-20 bg-[#F3F4FD]">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-[28px] sm:text-[32px] font-bold text-[#0A0523]">{title}</h2>
        {subtitle ? <p className="mt-2 text-[#0A0523]/60">{subtitle}</p> : null}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          <div className={showcaseOrder}>
            <AnimatedShowcase theme={theme} layout={layout} label={showcaseLabel} icons={icons} />
          </div>

          <div className={`flex flex-col gap-3 ${listOrder}`}>
            {tools.map((tool) => (
              <ToolRow key={tool.name} tool={tool} onClick={() => handleToolClick(tool)} />
            ))}
            {footer}
          </div>
        </div>
      </div>
    </section>
  );
}
