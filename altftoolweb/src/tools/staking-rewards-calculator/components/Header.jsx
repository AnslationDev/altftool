import React from "react";
import { TrendingUp, Info } from "lucide-react";

export default function Header() {
  return (
    <section className="text-center pt-8 pb-10">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-4 py-1.5 text-xs font-semibold text-[var(--primary)] shadow-sm backdrop-blur-md">
        <TrendingUp className="w-3.5 h-3.5" />
        Crypto / Finance
      </div>

      <h1 className="section-title text-[var(--primary)]">
        Staking Rewards Calculator
      </h1>
      <p className="description mx-auto mt-4 max-w-xl text-[var(--secondary-foreground)]">
        Calculate staking rewards values quickly with a simple, structured workflow. Optimize your crypto investments with real-time calculations.
      </p>
    </section>
  );
}
