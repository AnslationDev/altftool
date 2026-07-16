"use client";

import { Gift, Bell } from "lucide-react";
import { formatDate } from "../utils/dateUtils";

export default function NextBirthday({ data }) {
  if (!data) return null;
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm sm:p-6">
      <span
        className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-(--primary)"
        style={{ background: "color-mix(in srgb, var(--primary) 14%, transparent)" }}
      >
        <Gift className="h-8 w-8" strokeWidth={1.6} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-(--foreground)">Your Next Birthday</p>
        <p className="text-3xl font-black leading-tight text-(--primary)">
          {data.days} <span className="text-base font-bold text-(--foreground)">Days Left</span>
        </p>
        <p className="text-xs font-medium text-(--muted-foreground)">
          {data.weekday}, {formatDate(data.date)} · turning {data.turningAge}
        </p>
      </div>
      <button
        type="button"
        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-(--border) bg-(--card) px-4 text-sm font-bold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)"
      >
        <Bell className="h-4 w-4" /> Remind Me
      </button>
    </div>
  );
}
