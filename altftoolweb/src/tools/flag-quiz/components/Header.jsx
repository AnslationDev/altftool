import { Flag } from "lucide-react";

export default function Header() {
  return (
    <div className="mb-8 text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-4 py-2">
        <Flag className="h-5 w-5 text-[var(--primary)]" />
        <span className="text-sm font-semibold text-[var(--primary)]">Flag Challenge</span>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
        Flag Quiz
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-base text-[var(--muted-foreground)]">
        Master world flags with dynamic quizzes — identify flags, match countries, and test your knowledge of 200+ nations.
      </p>
    </div>
  );
}
