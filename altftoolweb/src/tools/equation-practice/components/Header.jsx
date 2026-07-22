import { Sigma } from "lucide-react";

export default function Header() {
  return (
    <div className="mb-8 text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-4 py-2">
        <Sigma className="h-5 w-5 text-[var(--primary)]" />
        <span className="text-sm font-semibold text-[var(--primary)]">Math Tool</span>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
        Equation Practice
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-base text-[var(--muted-foreground)]">
        Practice solving algebraic equations with randomised problems, instant feedback, hints, and performance tracking.
      </p>
    </div>
  );
}
