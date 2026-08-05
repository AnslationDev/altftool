"use client";

import { useMemo } from "react";
import DesignToolCard from "./DesignToolCard";
import ScrollReveal from "./ScrollReveal";
import { useAuth } from "../providers/AuthProvider";
import { useOpenTool } from "../hooks/useOpenTool";
import { ALL_TOOLS_BY_ID } from "../data/designTools";

/** Only renders once a signed-in user actually has saved tools — otherwise
 *  contributes nothing to the layout. */
export default function SavedToolsSection() {
  const { user, savedToolIds } = useAuth();
  const handleToolClick = useOpenTool();

  const savedTools = useMemo(
    () => [...savedToolIds].map((id) => ALL_TOOLS_BY_ID.get(id)).filter(Boolean),
    [savedToolIds],
  );

  if (!user || savedTools.length === 0) return null;

  return (
    <section id="saved-tools" className="px-4 py-16 sm:py-20 bg-[#F3F4FD]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h2 className="text-[28px] sm:text-[32px] font-bold text-[#0A0523]">Your Saved Tools</h2>
          <p className="mt-2 text-[#0A0523]/70 font-medium">
            {savedTools.length} {savedTools.length === 1 ? "tool" : "tools"} you&apos;ve bookmarked.
          </p>
        </div>

        <div
          className="grid gap-5 justify-center"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 300px))" }}
        >
          {savedTools.map((tool, idx) => (
            <ScrollReveal key={tool.name} delay={(idx % 4) * 70}>
              <DesignToolCard tool={tool} index={idx} onClick={() => handleToolClick(tool)} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
