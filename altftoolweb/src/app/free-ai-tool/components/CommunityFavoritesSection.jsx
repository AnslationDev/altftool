"use client";

import { useMemo, useState } from "react";
import ToolLogo from "./ToolLogo";
import ScrollReveal from "./ScrollReveal";
import { ALL_TOOLS_BY_ID, DESIGN_CATEGORIES } from "../data/designTools";
import { useOpenTool } from "../hooks/useOpenTool";

const ALL_TOOLS = [...ALL_TOOLS_BY_ID.values()];
const CATEGORY_OPTIONS = [
  { id: "all", label: "All Categories" },
  ...DESIGN_CATEGORIES.map((category) => ({
    id: category.label,
    label: category.label,
  })),
];

export default function CommunityFavoritesSection() {
  const [category, setCategory] = useState("all");
  const handleToolClick = useOpenTool();
  const tools = useMemo(() => {
    const filtered = category === "all"
      ? ALL_TOOLS
      : ALL_TOOLS.filter((tool) => tool.category === category);
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 12);
  }, [category]);

  return (
    <section className="bg-background px-4 py-16 text-foreground sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-[var(--radius)] bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
            Curated directory
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight">Explore design tools</h2>
          <p className="mt-2 text-base text-muted-foreground">
            Hand-picked official links, grouped by the job each tool helps with.
          </p>
          <label className="mt-6 inline-flex items-center gap-3 text-sm font-semibold">
            <span>Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-10 rounded-[var(--radius)] border border-border bg-card px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, index) => (
            <ScrollReveal key={`${tool.name}-${tool.category}`} delay={index * 35}>
              <button
                type="button"
                onClick={() => handleToolClick(tool)}
                className="flex w-full items-center gap-3 rounded-[var(--radius)] border border-border bg-card p-4 text-left shadow-sm transition hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius)] bg-muted">
                  <ToolLogo name={tool.name} domain={tool.domain} size={24} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-bold">{tool.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{tool.category}</span>
                </span>
              </button>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
