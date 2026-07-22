import { AlertTriangle, ShieldCheck } from "lucide-react";

export default function ManglikDosha({ result }) {
  const { person1, person2, manglikMatch } = result;
  const both = manglikMatch === "both";
  const none = manglikMatch === "none";

  if (none) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <p className="text-sm font-bold text-emerald-600">No Manglik Dosha detected</p>
        </div>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Neither partner has Mars in a dosha position (1st, 2nd, 4th, 7th, 8th, or 12th house from the Moon).
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-rose-600" />
        <p className="text-sm font-bold text-rose-600">
          {both
            ? "Both partners have Manglik Dosha"
            : `${manglikMatch === "boy" ? person1.name : person2.name} has Manglik Dosha`}
        </p>
      </div>
      <p className="mt-2 text-xs text-[var(--muted-foreground)]">
        {both
          ? "When both partners have Manglik Dosha, the doshas cancel each other — this is generally considered compatible."
          : "A Manglik partner is traditionally advised to marry another Manglik for dosha cancellation. Spiritual remedies like Kumbh Vivah or specific pujas are recommended."}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2">
          <p className="text-xs font-semibold text-[var(--muted-foreground)]">{person1.name}</p>
          <p className="text-sm font-bold">{person1.manglik.hasDosha ? "Manglik ✓" : "No Dosha"}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2">
          <p className="text-xs font-semibold text-[var(--muted-foreground)]">{person2.name}</p>
          <p className="text-sm font-bold">{person2.manglik.hasDosha ? "Manglik ✓" : "No Dosha"}</p>
        </div>
      </div>
    </div>
  );
}
