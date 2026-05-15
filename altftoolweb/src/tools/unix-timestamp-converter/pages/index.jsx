"use client";

import { useMemo, useState } from "react";
import { Clock3, Copy, RefreshCw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

function toDateInput(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-2 break-all font-mono text-sm font-semibold text-[var(--foreground)]">{value}</p>
    </div>
  );
}

export default function ToolHome() {
  const [timestamp, setTimestamp] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [dateInput, setDateInput] = useState(() => toDateInput(new Date()));
  const [copied, setCopied] = useState(false);

  const date = useMemo(() => {
    const numeric = Number(timestamp);
    if (!Number.isFinite(numeric)) return null;
    const milliseconds = String(Math.trunc(Math.abs(numeric))).length > 10 ? numeric : numeric * 1000;
    const parsed = new Date(milliseconds);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [timestamp]);

  const updateFromDate = (value) => {
    setDateInput(value);
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) setTimestamp(String(Math.floor(parsed.getTime() / 1000)));
  };

  const setCurrent = () => {
    const current = new Date();
    setTimestamp(String(Math.floor(current.getTime() / 1000)));
    setDateInput(toDateInput(current));
  };

  const copyValue = async (value) => {
    setCopied(await safeCopyText(value));
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Clock3 className="h-4 w-4" />
            Time conversion
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Unix Timestamp Converter</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Convert Unix seconds or milliseconds into readable local, UTC, and ISO date formats.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[380px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <label className="block">
              <span className="text-sm font-semibold">Unix timestamp</span>
              <input
                value={timestamp}
                onChange={(event) => setTimestamp(event.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 font-mono outline-none focus:border-[var(--primary)]"
              />
            </label>
            <label className="mt-5 block">
              <span className="text-sm font-semibold">Date and time</span>
              <input
                type="datetime-local"
                value={dateInput}
                onChange={(event) => updateFromDate(event.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)]"
              />
            </label>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={setCurrent} className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
                <RefreshCw className="h-4 w-4" />
                Now
              </button>
              {date && (
                <button type="button" onClick={() => copyValue(String(Math.floor(date.getTime() / 1000)))} className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold hover:bg-[var(--muted)]">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy seconds"}
                </button>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            {date ? (
              <div className="tool-form-grid">
                <Stat label="Seconds" value={String(Math.floor(date.getTime() / 1000))} />
                <Stat label="Milliseconds" value={String(date.getTime())} />
                <Stat label="Local time" value={date.toLocaleString()} />
                <Stat label="UTC time" value={date.toUTCString()} />
                <Stat label="ISO 8601" value={date.toISOString()} />
                <Stat label="Timezone offset" value={`${date.getTimezoneOffset() * -1} minutes`} />
              </div>
            ) : (
              <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
                Enter a valid timestamp.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
