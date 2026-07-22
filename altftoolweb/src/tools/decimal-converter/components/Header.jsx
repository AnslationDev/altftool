"use client";

import { ArrowRightLeft } from "lucide-react";

export default function Header() {
  return (
    <header className="mb-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
        <ArrowRightLeft className="h-8 w-8 text-emerald-600" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
        Decimal Converter
      </h1>
      <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
        Convert between fractions, decimals, percentages, and mixed numbers with instant results and step-by-step explanations.
      </p>
    </header>
  );
}
