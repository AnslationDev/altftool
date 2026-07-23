"use client";

import { useMemo, useState } from "react";
import { COMBO_PACKS } from "../data/comboPacks";
import ComboPackChooser from "./ComboPackChooser";
import ComboSummaryCard from "./ComboSummaryCard";
import ComboWorkflowTimeline from "./ComboWorkflowTimeline";
import SectionHeading from "./SectionHeading";

/**
 * "AI Workflow Combo Packs" — a single-row, auto-scrolling chooser of
 * role-based tool stacks feeding a horizontal, auto-scrolling workflow strip
 * below it.
 */
export default function ComboPacksSection() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeId, setActiveId] = useState(COMBO_PACKS[0].id);

  const filteredPacks = useMemo(() => {
    if (activeFilter === "All") return COMBO_PACKS;
    return COMBO_PACKS.filter((pack) => pack.tags.includes(activeFilter));
  }, [activeFilter]);

  const activePack = COMBO_PACKS.find((pack) => pack.id === activeId) || COMBO_PACKS[0];

  return (
    <section
      id="combo-packs"
      aria-label="AI workflow combo packs"
      className="relative scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="AI Workflow Combo Packs"
          title="The right AI stack for your role"
          subtitle="Pick a profession or use case and follow a proven, step-by-step chain of free AI tools — from first idea to finished output."
        />

        <div className="mt-10">
          <ComboPackChooser
            packs={filteredPacks}
            activeId={activeId}
            onSelect={setActiveId}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>

        <div className="mt-10">
          <ComboWorkflowTimeline pack={activePack} />
        </div>

        <div className="mx-auto mt-6 max-w-3xl">
          <ComboSummaryCard pack={activePack} />
        </div>
      </div>
    </section>
  );
}
