"use client";

import { ArrowRight, CalendarDays, Clock, RotateCcw, Sun, Trash2, Cake, ShieldCheck } from "lucide-react";

const chip =
  "inline-flex items-center gap-1.5 rounded-lg border border-(--border) bg-(--card) px-3 py-1.5 text-xs font-bold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)";

export default function AgeForm({
  birthDate,
  birthTime,
  todayString,
  onChangeDate,
  onChangeTime,
  onQuickSet,
  onClear,
  onSubmit,
  error,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-(--foreground)">
            <CalendarDays className="h-4 w-4 text-(--primary)" /> Date of Birth
          </span>
          <input
            type="date"
            value={birthDate}
            max={todayString}
            onChange={(e) => onChangeDate(e.target.value)}
            className="h-11 w-full rounded-lg border border-(--border) bg-(--background) px-3 text-sm font-medium text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)]"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-(--foreground)">
            <Clock className="h-4 w-4 text-(--primary)" /> Time of Birth
            <span className="font-medium text-(--muted-foreground)">(Optional)</span>
          </span>
          <input
            type="time"
            value={birthTime}
            onChange={(e) => onChangeTime(e.target.value)}
            className="h-11 w-full rounded-lg border border-(--border) bg-(--background) px-3 text-sm font-medium text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)]"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" className={chip} onClick={() => onQuickSet("today")}>
          <CalendarDays className="h-3.5 w-3.5" /> Today
        </button>
        <button type="button" className={chip} onClick={() => onQuickSet("yesterday")}>
          <RotateCcw className="h-3.5 w-3.5" /> Yesterday
        </button>
        <button type="button" className={chip} onClick={() => onQuickSet("y2k")}>
          <Sun className="h-3.5 w-3.5" /> 2000
        </button>
        <button type="button" className={chip} onClick={onClear}>
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </button>

        <button
          type="submit"
          className="ml-auto inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-8 text-sm font-bold text-(--primary-foreground) shadow-md transition hover:opacity-95 hover:shadow-lg sm:w-auto sm:min-w-[220px]"
          style={{ background: "var(--anslation-ds-cta-gradient, var(--primary))" }}
        >
          <Cake className="h-4 w-4" /> Calculate Age <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg border border-(--border) bg-[color-mix(in_srgb,var(--danger,#EF4444)_10%,transparent)] px-3 py-2 text-sm font-semibold text-[var(--danger,#EF4444)]">
          {error}
        </p>
      ) : (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-(--muted-foreground)">
          <ShieldCheck className="h-3.5 w-3.5 text-(--primary)" /> We never store your date of birth.
        </p>
      )}
    </form>
  );
}
