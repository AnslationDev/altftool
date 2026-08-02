"use client";

import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import InvestorRiskQuiz from "../components/InvestorRiskQuiz";

export default function ToolHome() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto space-y-6">

        {/* Header Card */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <ShieldAlert className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">Investor Risk Profile Quiz</h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Crypto / Invest</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Evaluate your risk tolerance and discover your investor profile with our structured assessment tool.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Risk Assessment", "Investor Profile", "Recommendations"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />{item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="pb-8">
          <InvestorRiskQuiz />
        </div>
      </div>
    </div>
  );
}
