import { ShieldCheck, ShieldAlert, Info, Moon, Star, AlertTriangle } from "lucide-react";
import { SEVERITY_COLORS } from "../constants";

export default function DoshaResult({ result }) {
  const { hasDosha, severity, affectedHouses, moon, mars, date } = result;

  if (!result) return null;

  const colors = SEVERITY_COLORS[severity] || SEVERITY_COLORS.Moderate;

  return (
    <div className="space-y-5">
      {/* Status Banner */}
      <div className={`rounded-2xl border p-6 shadow-sm ${
        hasDosha
          ? "border-rose-500/30 bg-gradient-to-br from-rose-500/5 to-rose-500/10"
          : "border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${
            hasDosha ? "bg-rose-600/10" : "bg-emerald-600/10"
          }`}>
            {hasDosha ? (
              <ShieldAlert className="h-7 w-7 text-rose-600" />
            ) : (
              <ShieldCheck className="h-7 w-7 text-emerald-600" />
            )}
          </div>
          <div>
            <p className={`text-xl font-extrabold ${hasDosha ? "text-rose-600" : "text-emerald-600"}`}>
              {hasDosha ? "Manglik Dosha Detected" : "No Manglik Dosha"}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              {hasDosha
                ? `Mars is in a ${severity.toLowerCase()} dosha position relative to your Moon.`
                : "Mars is not in any Manglik house from your Moon sign."}
            </p>
          </div>
        </div>
        {hasDosha && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${colors.bg} ${colors.text}`}>
              Severity: {severity}
            </span>
          </div>
        )}
      </div>

      {/* Planetary Positions */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <h3 className="text-base font-bold text-[var(--foreground)]">Planetary Positions</h3>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)] p-4">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-semibold text-[var(--muted-foreground)]">Moon</p>
            </div>
            <p className="mt-1 text-lg font-extrabold text-[var(--foreground)]">{moon.rashi.english} ({moon.rashi.name})</p>
            <p className="text-xs text-[var(--muted-foreground)]">{moon.degrees}° · {moon.nakshatra} Nakshatra</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)] p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-red-600" />
              <p className="text-xs font-semibold text-[var(--muted-foreground)]">Mars (Mangal)</p>
            </div>
            <p className="mt-1 text-lg font-extrabold text-[var(--foreground)]">{mars.rashi.english} ({mars.rashi.name})</p>
            <p className="text-xs text-[var(--muted-foreground)]">{mars.degrees}°</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)] p-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-[var(--primary)]" />
              <p className="text-xs font-semibold text-[var(--muted-foreground)]">Mars from Moon</p>
            </div>
            <p className="mt-1 text-lg font-extrabold text-[var(--foreground)]">House {mars.houseFromMoon}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{date.day}/{date.month}/{date.year}</p>
          </div>
        </div>
      </div>

      {/* Affected Houses */}
      {hasDosha && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="border-b border-[var(--border)] px-6 py-4">
            <h3 className="text-base font-bold text-[var(--foreground)]">Affected Houses</h3>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {affectedHouses.map((h, i) => {
              const c = SEVERITY_COLORS[h.severity] || SEVERITY_COLORS.Moderate;
              return (
                <div key={i} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
                    <p className="text-sm font-bold text-[var(--foreground)]">{h.name}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${c.bg} ${c.text}`}>
                    {h.severity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
