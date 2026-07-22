import { TITHI_DETAILS } from "../constants";

export default function TithiCard({ tithi }) {
  const detail = TITHI_DETAILS[tithi.name];
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)] p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Tithi (Lunar Day)</p>
      <p className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">{tithi.name}</p>
      <p className="text-xs text-[var(--muted-foreground)]">Day {tithi.num} of lunar cycle</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-xs font-semibold text-teal-600">
          {tithi.paksha?.split(" ")[0]}
        </span>
        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600">
          Remaining: {tithi.remaining}%
        </span>
      </div>
      {detail && (
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Deity: {detail.deity} — {detail.activity}
        </p>
      )}
    </div>
  );
}
