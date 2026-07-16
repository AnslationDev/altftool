"use client";

import { BellRing } from "lucide-react";
import { formatDate } from "../utils/dateUtils";
import { Gift3D } from "./illustrations";

export default function NextBirthday({ data }) {
  if (!data) return null;
  return (
    <div className="flex items-center gap-5 rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm sm:p-6">
      <div
        className="hidden shrink-0 place-items-center rounded-2xl p-2 sm:grid"
        style={{
          background:
            "linear-gradient(150deg, color-mix(in srgb, var(--primary) 12%, var(--card)), color-mix(in srgb, #8B5CF6 14%, var(--card)))",
        }}
        aria-hidden="true"
      >
        <Gift3D size={88} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-(--foreground)">Your Next Birthday</p>
        <p className="mt-1 text-4xl font-black leading-none text-(--primary) [font-variant-numeric:tabular-nums] sm:text-5xl">
          {data.days}
        </p>
        <p className="mt-1 text-sm font-bold text-(--foreground)">Days Left</p>
        <p className="mt-1 text-xs font-medium text-(--muted-foreground)">
          {data.weekday}, {formatDate(data.date)} · turning {data.turningAge}
        </p>
        <button
          type="button"
          className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg border border-(--border) bg-(--card) px-4 text-xs font-bold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)"
        >
          <BellRing className="h-3.5 w-3.5" /> Remind Me
        </button>
      </div>
    </div>
  );
}
