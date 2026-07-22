"use client";
import React from "react";
import { Briefcase } from "lucide-react";
import MainSection from "../components/MainSection";

export default function ToolHome() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">

        {/* Standard Header Card */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft group-hover:bg-primary/10 transition-colors duration-300">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground leading-none">Notice Period Calculator</h1>
                <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">HR & Legal Tools</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Calculate employee notice periods and severance pay with accuracy and compliance. Supports all employment types with legal framework integration.
              </p>
            </div>
          </div>
        </section>

        <MainSection />
      </main>
    </div>
  );
}
