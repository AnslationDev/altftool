import { YOGA_MEANINGS } from "../constants";

export default function YogaKaranaCard({ yoga, karana }) {
  const yogaMeaning = YOGA_MEANINGS[yoga.name];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)] p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Yoga</p>
        <p className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">{yoga.name}</p>
        {yogaMeaning && (
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">{yogaMeaning}</p>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)] p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Karana</p>
        <p className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">{karana.name}</p>
        <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
          karana.type === "Good" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
        }`}>
          {karana.type}
        </span>
      </div>
    </div>
  );
}
