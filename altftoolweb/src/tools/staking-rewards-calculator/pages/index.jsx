"use client";
import React from "react";
import { TrendingUp } from "lucide-react";
import StakingCalculator from "../components/StakingCalculator";

export default function ToolHome() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">

        {/* Standard Header Card */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft group-hover:bg-primary/10 transition-colors duration-300">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground leading-none">Staking Rewards Calculator</h1>
                <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Crypto / Finance</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Calculate staking rewards values quickly with a simple, structured workflow. Optimize your crypto investments with real-time calculations.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <StakingCalculator />
        </section>
      </main>
    </div>
  );
}
