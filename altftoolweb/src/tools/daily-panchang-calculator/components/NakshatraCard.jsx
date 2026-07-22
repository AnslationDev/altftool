export default function NakshatraCard({ nakshatra }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)] p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Nakshatra (Lunar Mansion)</p>
      <p className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">{nakshatra.name}</p>
      <p className="text-xs text-[var(--muted-foreground)]">Pada {nakshatra.pada}/4</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-600">
          Deity: {nakshatra.deity}
        </span>
        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600">
          Gana: {nakshatra.gana}
        </span>
      </div>
    </div>
  );
}
