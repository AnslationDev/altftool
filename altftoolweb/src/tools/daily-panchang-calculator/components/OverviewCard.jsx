import { Sun, Moon, Sunrise, Sunset } from "lucide-react";
import { getWeekdayName } from "../utils/panchangCalc";

export default function OverviewCard({ panchang }) {
  const weekday = getWeekdayName(panchang.weekday);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
            <Sun className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--muted-foreground)]">Sunrise</p>
            <p className="text-lg font-extrabold text-[var(--foreground)]">{panchang.sunrise}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
            <Sunset className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--muted-foreground)]">Sunset</p>
            <p className="text-lg font-extrabold text-[var(--foreground)]">{panchang.sunset}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
            <Moon className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--muted-foreground)]">Moon Rashi</p>
            <p className="text-lg font-extrabold text-[var(--foreground)]">{panchang.moonRashi.english}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10">
            <Sun className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--muted-foreground)]">Hindu Month</p>
            <p className="text-lg font-extrabold text-[var(--foreground)]">{panchang.hinduMonth}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--border)] px-6 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted-foreground)]">
            {panchang.date.day}/{panchang.date.month}/{panchang.date.year}
          </span>
          <span className="font-bold text-[var(--foreground)]">
            {weekday.english} ({weekday.hindi})
          </span>
          <span className="text-[var(--muted-foreground)]">
            Saka {panchang.sakaYear}
          </span>
        </div>
      </div>
    </div>
  );
}
