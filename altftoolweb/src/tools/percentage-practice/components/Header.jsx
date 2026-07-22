"use client";

import { Percent } from "lucide-react";

export default function Header() {
  return (
    <header className="mb-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500/10">
        <Percent className="h-8 w-8 text-pink-600" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
        Percentage Practice
      </h1>
      <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
        Master percentage calculations with interactive exercises covering discounts, increases, comparisons, and real-world problems.
      </p>
    </header>
  );
}
