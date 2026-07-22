"use client";

import { Brain } from "lucide-react";

export default function Header() {
  return (
    <header className="mb-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
        <Brain className="h-8 w-8 text-violet-600" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
        Mental Math Trainer
      </h1>
      <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
        Sharpen your calculation speed with real-time exercises across addition, subtraction, multiplication, percentages, and more.
      </p>
    </header>
  );
}
