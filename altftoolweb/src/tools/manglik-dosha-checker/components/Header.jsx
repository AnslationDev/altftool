import { Flame } from "lucide-react";

export default function Header() {
  return (
    <div className="mb-8 text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-4 py-2">
        <Flame className="h-5 w-5 text-[var(--primary)]" />
        <span className="text-sm font-semibold text-[var(--primary)]">Astrology Tool</span>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
        Manglik Dosha Checker
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-base text-[var(--muted-foreground)]">
        Check whether Mars (Mangal) is placed in a Manglik house relative to your Moon sign. Enter your birth
        details to see your Manglik status, severity, and traditional remedies.
      </p>
    </div>
  );
}
