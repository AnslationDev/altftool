import { ShieldCheck, ShieldAlert, Dna, Info } from "lucide-react";
import { KSD_TYPES, REMEDIES } from "../constants";

export default function DoshaResult({ result }) {
  if (!result) return null;
  const { hasDosha, type, planetDetails, rahuRashiIndex, date } = result;

  return (
    <div className="space-y-5">
      {/* Status Banner */}
      <div className={`rounded-2xl border p-6 shadow-sm ${
        hasDosha
          ? "border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-violet-500/10"
          : "border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${
            hasDosha ? "bg-violet-600/10" : "bg-emerald-600/10"
          }`}>
            {hasDosha ? (
              <Dna className="h-7 w-7 text-violet-600" />
            ) : (
              <ShieldCheck className="h-7 w-7 text-emerald-600" />
            )}
          </div>
          <div>
            <p className={`text-xl font-extrabold ${hasDosha ? "text-violet-600" : "text-emerald-600"}`}>
              {hasDosha ? "Kaal Sarp Dosha Detected" : "No Kaal Sarp Dosha"}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              {hasDosha
                ? `All 7 planets are between Rahu and Ketu — ${type.meaning} type forming in ${type.rashi}.`
                : `At least one planet escapes the Rahu-Ketu axis — no Kaal Sarp Dosha formed.`}
            </p>
          </div>
        </div>
        {hasDosha && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-lg bg-[var(--card)] px-3 py-2 text-center">
              <p className="text-xs text-[var(--muted-foreground)]">Type</p>
              <p className="text-sm font-extrabold text-[var(--foreground)]">{type.name}</p>
            </div>
            <div className="rounded-lg bg-[var(--card)] px-3 py-2 text-center">
              <p className="text-xs text-[var(--muted-foreground)]">House</p>
              <p className="text-sm font-extrabold text-[var(--foreground)]">{type.house}</p>
            </div>
            <div className="rounded-lg bg-[var(--card)] px-3 py-2 text-center">
              <p className="text-xs text-[var(--muted-foreground)]">Rashi</p>
              <p className="text-sm font-extrabold text-[var(--foreground)]">{type.rashi}</p>
            </div>
            <div className="rounded-lg bg-[var(--card)] px-3 py-2 text-center">
              <p className="text-xs text-[var(--muted-foreground)]">Meaning</p>
              <p className="text-sm font-extrabold text-[var(--foreground)]">{type.meaning}</p>
            </div>
          </div>
        )}
      </div>

      {/* Planet Positions */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-6 py-4">
          <Info className="h-5 w-5 text-[var(--primary)]" />
          <h3 className="text-base font-bold text-[var(--foreground)]">Planetary Positions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs text-[var(--muted-foreground)]">
                <th className="px-4 py-3 text-left font-semibold">Planet</th>
                <th className="px-4 py-3 text-left font-semibold">Rashi</th>
                <th className="px-4 py-3 text-right font-semibold">Longitude</th>
                <th className="px-4 py-3 text-center font-semibold">Between R-K?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {["rahu", "sun", "moon", "mars", "mercury", "venus", "jupiter", "saturn", "ketu"].map((key) => {
                const p = planetDetails[key];
                const isRahuKetu = key === "rahu" || key === "ketu";
                const between = p.betweenRahuKetu;
                return (
                  <tr key={key} className={`${isRahuKetu ? "bg-[var(--section-highlight)]" : ""}`}>
                    <td className="px-4 py-2.5">
                      <span className={`font-bold ${
                        key === "rahu" ? "text-purple-600" :
                        key === "ketu" ? "text-violet-600" :
                        "text-[var(--foreground)]"
                      }`}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[var(--muted-foreground)]">{p.rashi}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[var(--muted-foreground)]">{p.longitude}°</td>
                    <td className="px-4 py-2.5 text-center">
                      {isRahuKetu ? (
                        <span className="text-xs text-[var(--muted-foreground)]">—</span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                          between ? "text-violet-600" : "text-emerald-600"
                        }`}>
                          {between ? "Yes" : "No"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {hasDosha && (
          <div className="border-t border-[var(--border)] px-6 py-3">
            <p className="text-xs text-[var(--muted-foreground)]">
              <strong>Effect:</strong> {type.effect}
            </p>
          </div>
        )}
      </div>

      {/* Remedies */}
      {hasDosha && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-6 py-4">
            <ShieldAlert className="h-5 w-5 text-violet-600" />
            <h3 className="text-base font-bold text-[var(--foreground)]">Remedies</h3>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {REMEDIES.map((r, i) => (
              <div key={i} className="px-6 py-3">
                <p className="text-sm font-bold text-[var(--foreground)]">{r.title}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
