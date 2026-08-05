"use client";

import DesignToolCard from "./DesignToolCard";
import DesignToolCardHorizontal from "./DesignToolCardHorizontal";
import ScrollReveal from "./ScrollReveal";
import { useOpenTool } from "../hooks/useOpenTool";

// Categories that use the row-style card (square logo left, text right)
// instead of the standard stacked card. Grid track width just changes to
// fit the wider card — everything else (ScrollReveal, click handling)
// stays the same, and it scales to however many tools the category holds.
const HORIZONTAL_CARD_CATEGORIES = new Set(["design-tools", "ai-design", "logo-design", "animation", "color-tools"]);

export default function AllDesignToolsSection({ categories }) {
  const handleToolClick = useOpenTool();

  return (
    <section id="all-tools" className="px-4 py-16 sm:py-20 bg-[#F3F4FD]">
      <div className="mx-auto max-w-7xl">
        {categories.map((category) => {
          const Icon = category.icon;
          const useHorizontalCard = HORIZONTAL_CARD_CATEGORIES.has(category.id);

          return (
            <div key={category.id} id={category.id} className="mb-20 last:mb-0">
              <div className="mb-8 flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-white/80 shadow-[inset_1.5px_1.5px_1.5px_rgba(255,255,255,0.66),0_20px_40px_rgba(10,5,35,0.03)]">
                  <Icon className="w-5 h-5 text-[#0A0523]/70" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-[24px] font-bold text-[#0A0523]">{category.label}</h3>
                  {category.description ? (
                    <p className="mt-1 text-sm text-[#0A0523]/60">{category.description}</p>
                  ) : null}
                </div>
              </div>

              <div
                className="grid gap-5 justify-center"
                style={{
                  gridTemplateColumns: useHorizontalCard
                    ? "repeat(auto-fill, minmax(min(400px, 100%), 400px))"
                    : "repeat(auto-fill, minmax(min(300px, 100%), 300px))",
                }}
              >
                {category.tools.map((tool, idx) =>
                  useHorizontalCard ? (
                    <ScrollReveal key={tool.name} delay={(idx % 3) * 70}>
                      <DesignToolCardHorizontal tool={tool} index={idx} onClick={() => handleToolClick(tool)} />
                    </ScrollReveal>
                  ) : (
                    <ScrollReveal key={tool.name} delay={(idx % 4) * 70}>
                      <DesignToolCard tool={tool} index={idx} onClick={() => handleToolClick(tool)} />
                    </ScrollReveal>
                  ),
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
