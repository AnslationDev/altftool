import { Dna } from "lucide-react";

export default function Header() {
  return (
    <div className="mb-8 text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-4 py-2">
        <Dna className="h-5 w-5 text-[var(--primary)]" />
        <span className="text-sm font-semibold text-[var(--primary)]">Astrology Tool</span>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
        Kaal Sarp Dosha Checker
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-base text-[var(--muted-foreground)]">
        Check whether all seven planets (Sun through Saturn) are trapped between Rahu and Ketu in your birth chart.
        Identifies the dosha type — Anant, Kulik, Vasuki, Takshak, and 8 more — with planetary positions and remedies.
      </p>
    </div>
  );
}
