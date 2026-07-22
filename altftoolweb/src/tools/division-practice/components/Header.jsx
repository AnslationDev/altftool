"use client";

import { Divide } from "lucide-react";

export default function Header() {
  return (
    <header className="mb-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10">
        <Divide className="h-8 w-8 text-cyan-600" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
        Division Practice
      </h1>
      <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
        Master division with adaptive exercises, step-by-step solutions, hints, and progress tracking.
      </p>
    </header>
  );
}
