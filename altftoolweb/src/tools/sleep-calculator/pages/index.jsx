"use client";

import { useMemo, useState } from "react";
import { Clock, Moon } from "lucide-react";

const formatTime = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function parseTime(value) {
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

export default function ToolHome() {
  const [mode, setMode] = useState("wake");
  const [time, setTime] = useState("07:00");
  const [fallAsleep, setFallAsleep] = useState(15);

  const options = useMemo(() => {
    const base = parseTime(time);
    return [6, 5, 4, 3].map((cycles) => {
      const minutes = cycles * 90 + fallAsleep;
      const next = mode === "wake" ? addMinutes(base, -minutes) : addMinutes(base, minutes);
      return { cycles, time: formatTime(next), hours: ((cycles * 90) / 60).toFixed(1) };
    });
  }, [fallAsleep, mode, time]);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Moon className="h-4 w-4" />
            Sleep cycles
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Sleep Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Find bedtime or wake-up options based on 90-minute sleep cycles and time to fall asleep.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[360px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid gap-1 rounded-lg bg-[var(--muted)] p-1 sm:grid-cols-2">
              {[
                ["wake", "Wake up at"],
                ["sleep", "Sleep at"],
              ].map(([id, label]) => (
                <button key={id} type="button" onClick={() => setMode(id)} className={`min-h-10 rounded-md px-3 py-2 text-sm font-semibold ${mode === id ? "bg-[var(--card)] text-[var(--primary)] shadow-sm" : "text-[var(--muted-foreground)]"}`}>
                  {label}
                </button>
              ))}
            </div>
            <label className="mt-5 block">
              <span className="text-sm font-semibold">Time</span>
              <input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)]" />
            </label>
            <label className="mt-5 block">
              <span className="text-sm font-semibold">Minutes to fall asleep</span>
              <input type="number" min="0" max="60" value={fallAsleep} onChange={(event) => setFallAsleep(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)]" />
            </label>
          </div>

          <div className="tool-form-grid">
            {options.map((option) => (
              <div key={option.cycles} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                <Clock className="h-6 w-6 text-[var(--primary)]" />
                <p className="tool-money-value tool-hero-value mt-4">{option.time}</p>
                <p className="mt-2 text-sm font-medium text-[var(--muted-foreground)]">{option.cycles} cycles, about {option.hours} hours asleep</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
