"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Clipboard, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const presets = [
  { id: "every-minute", label: "Every minute" },
  { id: "hourly", label: "Hourly" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "interval", label: "Every N minutes" },
];

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const pad = (value) => String(value).padStart(2, "0");

function nextRuns(preset, hour, minute, dayOfWeek, dayOfMonth, interval) {
  const runs = [];
  const now = new Date();
  let cursor = new Date(now);

  for (let index = 0; runs.length < 5 && index < 5000; index += 1) {
    cursor = new Date(cursor.getTime() + 60000);
    const matches =
      preset === "every-minute" ||
      (preset === "interval" && cursor.getMinutes() % interval === 0) ||
      (preset === "hourly" && cursor.getMinutes() === minute) ||
      (preset === "daily" && cursor.getHours() === hour && cursor.getMinutes() === minute) ||
      (preset === "weekly" &&
        cursor.getDay() === dayOfWeek &&
        cursor.getHours() === hour &&
        cursor.getMinutes() === minute) ||
      (preset === "monthly" &&
        cursor.getDate() === dayOfMonth &&
        cursor.getHours() === hour &&
        cursor.getMinutes() === minute);

    if (matches) runs.push(cursor.toLocaleString());
  }

  return runs;
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[var(--foreground)]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export default function ToolHome() {
  const [preset, setPreset] = useState("daily");
  const [minute, setMinute] = useState(30);
  const [hour, setHour] = useState(9);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [interval, setInterval] = useState(15);
  const [copied, setCopied] = useState(false);

  const cron = useMemo(() => {
    if (preset === "every-minute") return "* * * * *";
    if (preset === "interval") return `*/${interval} * * * *`;
    if (preset === "hourly") return `${minute} * * * *`;
    if (preset === "daily") return `${minute} ${hour} * * *`;
    if (preset === "weekly") return `${minute} ${hour} * * ${dayOfWeek}`;
    return `${minute} ${hour} ${dayOfMonth} * *`;
  }, [dayOfMonth, dayOfWeek, hour, interval, minute, preset]);

  const summary = useMemo(() => {
    if (preset === "every-minute") return "Runs every minute.";
    if (preset === "interval") return `Runs every ${interval} minutes.`;
    if (preset === "hourly") return `Runs every hour at minute ${pad(minute)}.`;
    if (preset === "daily") return `Runs daily at ${pad(hour)}:${pad(minute)}.`;
    if (preset === "weekly") return `Runs every ${weekdays[dayOfWeek]} at ${pad(hour)}:${pad(minute)}.`;
    return `Runs monthly on day ${dayOfMonth} at ${pad(hour)}:${pad(minute)}.`;
  }, [dayOfMonth, dayOfWeek, hour, interval, minute, preset]);

  const upcoming = useMemo(
    () => nextRuns(preset, hour, minute, dayOfWeek, dayOfMonth, interval),
    [dayOfMonth, dayOfWeek, hour, interval, minute, preset],
  );

  const copyCron = async () => {
    setCopied(await safeCopyText(cron));
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <CalendarClock className="h-4 w-4" />
            Scheduler utility
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Cron Expression Generator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Create readable cron expressions for jobs, automations, and server tasks.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[380px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <p className="text-sm font-semibold text-[var(--foreground)]">Schedule preset</p>
              <div className="mt-3 grid gap-2">
                {presets.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPreset(item.id)}
                    className={`min-h-11 rounded-lg border px-3 py-2.5 text-left text-sm font-semibold leading-5 transition sm:px-4 ${
                    preset === item.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-[var(--border)] bg-[var(--background)] hover:bg-[var(--muted)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="tool-form-grid mt-5">
              <Field label="Hour">
                <input type="number" min="0" max="23" value={hour} onChange={(event) => setHour(Number(event.target.value))} className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 outline-none focus:border-[var(--primary)]" />
              </Field>
              <Field label="Minute">
                <input type="number" min="0" max="59" value={minute} onChange={(event) => setMinute(Number(event.target.value))} className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 outline-none focus:border-[var(--primary)]" />
              </Field>
              <Field label="Weekday">
                <select value={dayOfWeek} onChange={(event) => setDayOfWeek(Number(event.target.value))} className="min-h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium leading-5 outline-none focus:border-[var(--primary)]">
                  {weekdays.map((day, index) => <option key={day} value={index}>{day}</option>)}
                </select>
              </Field>
              <Field label="Month day">
                <input type="number" min="1" max="31" value={dayOfMonth} onChange={(event) => setDayOfMonth(Number(event.target.value))} className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 outline-none focus:border-[var(--primary)]" />
              </Field>
              <Field label="Interval minutes">
                <input type="number" min="1" max="59" value={interval} onChange={(event) => setInterval(Math.max(1, Number(event.target.value)))} className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 outline-none focus:border-[var(--primary)]" />
              </Field>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <p className="text-sm font-semibold text-[var(--muted-foreground)]">Cron expression</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-950 p-4 text-white">
              <code className="min-w-0 break-all text-xl font-semibold sm:text-2xl">{cron}</code>
              <button type="button" onClick={copyCron} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950">
                <Clipboard className="h-4 w-4" />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-4 rounded-lg bg-[var(--muted)] p-4 text-sm font-medium text-[var(--foreground)]">{summary}</p>
            <div className="mt-5">
              <p className="text-sm font-semibold text-[var(--foreground)]">Next estimated runs</p>
              <div className="mt-3 grid gap-2">
                {upcoming.map((run) => (
                  <div key={run} className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 font-mono text-sm">
                    {run}
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setPreset("daily");
                setMinute(30);
                setHour(9);
                setDayOfWeek(1);
                setDayOfMonth(1);
                setInterval(15);
              }}
              className="btn-secondary mt-5"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
