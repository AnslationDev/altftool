"use client";

import { ArrowRight } from "lucide-react";
import { TRENDING_PROMPTS } from "../../data/prompts";
import { SectionHeader } from "../shared/section-header";
import { PromptCard } from "../shared/prompt-card";
import { Button } from "../ui/button";

export function TrendingSection() {
  const scrollToCategories = (e) => {
    e.preventDefault();
    document.getElementById("imgprompt-categories")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="imgprompt-trending" className="relative py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeader
            align="left"
            eyebrow="🔥 Trending Today"
            title="Prompts creators can't stop rendering"
            subtitle="Explore strong prompt patterns, then copy, adjust, and use them in your preferred model."
          />
          <Button variant="outline" className="shrink-0" onClick={scrollToCategories}>
            View all trending <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TRENDING_PROMPTS.slice(0, 6).map((p, i) => (
            <PromptCard key={p.id} prompt={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
