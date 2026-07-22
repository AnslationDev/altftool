"use client";

import { PieChart } from "lucide-react";

export default function Header() {
  return (
    <header className="mb-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
        <PieChart className="h-8 w-8 text-amber-600" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
        Fraction Visualizer
      </h1>
      <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
        Explore fraction concepts visually with interactive pie charts, fraction bars, number lines, and real-time calculations.
      </p>
    </header>
  );
}
