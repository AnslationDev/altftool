"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import {
  Clock,
  Copy,
  RotateCcw,
  Calendar,
  Timer,
  ArrowLeftRight,
  RefreshCw,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

/* ============================================================
   DATA
   ============================================================ */

const TIME_UNITS = [
  { id: "ms",     label: "Millisecond", symbol: "ms",   toSec: 0.001 },
  { id: "s",      label: "Second",      symbol: "s",    toSec: 1 },
  { id: "min",    label: "Minute",      symbol: "min",  toSec: 60 },
  { id: "h",      label: "Hour",        symbol: "h",    toSec: 3600 },
  { id: "d",      label: "Day",         symbol: "d",    toSec: 86400 },
  { id: "wk",     label: "Week",        symbol: "wk",   toSec: 604800 },
  { id: "mo",     label: "Month (30d)", symbol: "mo",   toSec: 2592000 },
  { id: "yr",     label: "Year (365d)", symbol: "yr",   toSec: 31536000 },
];

const DATE_FORMATS = [
  { id: "us",       label: "US",        example: "12/31/2025",    format: "MM/DD/YYYY" },
  { id: "eu",       label: "European",  example: "31/12/2025",    format: "DD/MM/YYYY" },
  { id: "iso",      label: "ISO 8601",  example: "2025-12-31",    format: "YYYY-MM-DD" },
  { id: "full",     label: "Full Month", example: "December 31, 2025", format: "Month DD, YYYY" },
  { id: "fulleu",   label: "Day-Month", example: "31 December 2025",   format: "DD Month YYYY" },
  { id: "compact",  label: "Compact",   example: "20251231",      format: "YYYYMMDD" },
  { id: "dmy",      label: "DMY short", example: "31-Dec-2025",   format: "DD-Mon-YYYY" },
  { id: "mdy",      label: "MDY short", example: "Dec 31, 2025",  format: "Mon DD, YYYY" },
];

const CATEGORIES = [
  { id: "time",     label: "Time Units",     icon: Clock,    color: "text-sky-600 dark:text-sky-400" },
  { id: "timestamp", label: "Unix Timestamp", icon: Timer,   color: "text-amber-600 dark:text-amber-400" },
  { id: "format",   label: "Date Format",     icon: Calendar, color: "text-violet-600 dark:text-violet-400" },
  { id: "diff",     label: "Date Difference", icon: Clock,    color: "text-rose-600 dark:text-rose-400" },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/* ============================================================
   HELPERS
   ============================================================ */

function pad(n) { return String(n).padStart(2, "0"); }

function formatDateWithFormat(d, fmt) {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const monName = MONTH_NAMES[d.getMonth()];
  const monAbbr = MONTH_ABBR[d.getMonth()];
  switch (fmt) {
    case "us":      return `${pad(m)}/${pad(day)}/${y}`;
    case "eu":      return `${pad(day)}/${pad(m)}/${y}`;
    case "iso":     return `${y}-${pad(m)}-${pad(day)}`;
    case "full":    return `${monName} ${day}, ${y}`;
    case "fulleu":  return `${day} ${monName} ${y}`;
    case "compact": return `${y}${pad(m)}${pad(day)}`;
    case "dmy":     return `${pad(day)}-${monAbbr}-${y}`;
    case "mdy":     return `${monAbbr} ${day}, ${y}`;
    default:        return d.toISOString();
  }
}

function parseDateString(str) {
  if (!str) return null;
  const s = str.trim();
  let d = null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    d = new Date(s + "T00:00:00");
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const parts = s.split("/");
    d = new Date(`${parts[2]}-${parts[0]}-${parts[1]}T00:00:00`);
  } else if (/^\d{4}\d{2}\d{2}$/.test(s)) {
    d = new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}T00:00:00`);
  } else if (/^\d{1,2}-\w{3}-\d{4}$/i.test(s)) {
    d = new Date(s.replace(/-/g, " ") + " 00:00:00");
  } else {
    d = new Date(s);
  }

  if (d && !isNaN(d.getTime())) return d;
  return null;
}

function pluralize(n, unit) {
  return `${n} ${unit}${n !== 1 ? "s" : ""}`;
}

/* ============================================================
   PANELS
   ============================================================ */

function TimeUnitPanel() {
  const [fromUnit, setFromUnit] = useState("h");
  const [value, setValue] = useState("24");
  const [copiedId, setCopiedId] = useState(null);

  const fromData = TIME_UNITS.find((u) => u.id === fromUnit);
  const inputSec = (parseFloat(value) || 0) * (fromData?.toSec || 1);

  const results = useMemo(() => {
    return TIME_UNITS.map((unit) => ({
      ...unit,
      display: unit.id === fromUnit
        ? value
        : (inputSec / unit.toSec).toLocaleString("en-US", { maximumFractionDigits: 4 }),
    }));
  }, [inputSec, value, fromUnit]);

  const copyValue = async (text, id) => {
    const ok = await safeCopyText(text);
    if (ok) { setCopiedId(id); setTimeout(() => setCopiedId(null), 1200); }
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Value</label>
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 font-mono text-lg outline-none transition-colors focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
          />
        </div>
        <div className="w-40">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Unit</label>
          <div className="relative">
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="h-12 w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm outline-none transition-colors focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
            >
              {TIME_UNITS.map((u) => (
                <option key={u.id} value={u.id}>{u.symbol} — {u.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {results.map((u) => (
          <div
            key={u.id}
            className={`group rounded-xl border p-4 transition-all duration-150 ${
              u.id === fromUnit
                ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-[var(--anslation-ds-shadow-sm)]"
                : "border-[var(--border)] bg-[var(--card)] hover:shadow-[var(--anslation-ds-shadow-md)]"
            }`}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{u.symbol}</span>
              <span className="text-[10px] text-[var(--muted-foreground)]">{u.label}</span>
            </div>
            <p className={`break-all font-mono text-lg font-semibold leading-relaxed ${
              u.id === fromUnit ? "text-[var(--primary)]" : "text-[var(--foreground)]"
            }`}>
              {u.display}
            </p>
            <button
              type="button"
              onClick={() => copyValue(`${u.display} ${u.symbol}`, u.id)}
              className="mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-[var(--muted-foreground)] opacity-0 transition-all hover:bg-[var(--muted)] hover:text-[var(--foreground)] group-hover:opacity-100"
            >
              <Copy className="h-3 w-3" />
              {copiedId === u.id ? "Copied" : "Copy"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimestampPanel() {
  const [mode, setMode] = useState("tsToDate");
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000).toString());
  const [dateInput, setDateInput] = useState(new Date().toISOString().slice(0, 16));
  const [copied, setCopied] = useState(false);

  const now = Math.floor(Date.now() / 1000);

  const tsResult = useMemo(() => {
    if (mode !== "tsToDate") return null;
    const ts = parseInt(timestamp, 10);
    if (isNaN(ts)) return { error: "Enter a valid Unix timestamp." };
    const d = new Date(ts * 1000);
    return {
      utc: d.toUTCString(),
      local: d.toLocaleString(),
      iso: d.toISOString(),
      date: d.toLocaleDateString(),
      time: d.toLocaleTimeString(),
      year: d.getFullYear(),
      month: MONTH_NAMES[d.getMonth()],
      day: d.getDate(),
      weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
      valid: d.getFullYear() >= 1970 ? "After epoch" : "Before epoch",
    };
  }, [timestamp, mode]);

  const dateResult = useMemo(() => {
    if (mode !== "dateToTs") return null;
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return { error: "Enter a valid date/time." };
    const ts = Math.floor(d.getTime() / 1000);
    return {
      ts,
      tsMs: d.getTime(),
      utc: d.toUTCString(),
      weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
    };
  }, [dateInput, mode]);

  const copyValue = async (text) => {
    const ok = await safeCopyText(text);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1200); }
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2 rounded-lg bg-[var(--muted)] p-1">
        {[
          ["tsToDate", "Timestamp → Date"],
          ["dateToTs", "Date → Timestamp"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`flex-1 rounded-md px-4 py-2.5 text-sm font-semibold transition-all ${
              mode === id
                ? "bg-[var(--card)] text-[var(--primary)] shadow-sm"
                : "text-[var(--muted-foreground)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "tsToDate" ? (
        <>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Unix timestamp (seconds)</label>
              <input
                type="text"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 font-mono text-lg outline-none transition-colors focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => setTimestamp(now.toString())}
                className="flex h-12 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
              >
                <RefreshCw className="h-4 w-4" />
                Now
              </button>
            </div>
          </div>
          {tsResult && !tsResult.error && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["UTC", tsResult.utc],
                  ["Local", tsResult.local],
                  ["ISO 8601", tsResult.iso],
                  ["Weekday", tsResult.weekday],
                  ["Date", `${tsResult.weekday}, ${tsResult.month} ${tsResult.day}, ${tsResult.year}`],
                ].map(([label, val]) => (
                  <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-1 break-all font-mono text-sm font-semibold text-[var(--foreground)]">{val}</p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => copyValue(tsResult.iso)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy ISO"}
              </button>
            </div>
          )}
          {tsResult?.error && (
            <p className="text-sm font-medium text-[var(--anslation-ds-danger,#EF4444)]">{tsResult.error}</p>
          )}
        </>
      ) : (
        <>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Date and time</label>
          <div className="flex gap-3">
            <input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="h-12 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 font-mono text-lg outline-none transition-colors focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
            />
            <button
              type="button"
              onClick={() => setDateInput(new Date().toISOString().slice(0, 16))}
              className="flex h-12 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
            >
              <RefreshCw className="h-4 w-4" />
              Now
            </button>
          </div>
          {dateResult && !dateResult.error && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Timestamp (seconds)", dateResult.ts.toLocaleString()],
                  ["Timestamp (milliseconds)", dateResult.tsMs.toLocaleString()],
                  ["UTC", dateResult.utc],
                  ["Weekday", dateResult.weekday],
                ].map(([label, val]) => (
                  <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-1 break-all font-mono text-sm font-semibold text-[var(--foreground)]">{val}</p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => copyValue(dateResult.ts.toString())}
                className="mt-4 inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy timestamp"}
              </button>
            </div>
          )}
          {dateResult?.error && (
            <p className="text-sm font-medium text-[var(--anslation-ds-danger,#EF4444)]">{dateResult.error}</p>
          )}
        </>
      )}
    </div>
  );
}

function DateFormatPanel() {
  const [input, setInput] = useState("2025-12-31");
  const [copiedId, setCopiedId] = useState(null);

  const parsed = useMemo(() => parseDateString(input), [input]);

  const results = useMemo(() => {
    if (!parsed) return null;
    return DATE_FORMATS.map((f) => ({
      ...f,
      result: formatDateWithFormat(parsed, f.id),
    }));
  }, [parsed]);

  const copyValue = async (text, id) => {
    const ok = await safeCopyText(text);
    if (ok) { setCopiedId(id); setTimeout(() => setCopiedId(null), 1200); }
  };

  return (
    <div className="space-y-5">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Enter any date</label>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g. 2025-12-31, 12/31/2025, Dec 31 2025"
        className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 font-mono text-lg outline-none transition-colors focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
      />
      {!parsed && input && (
        <p className="text-sm font-medium text-[var(--anslation-ds-danger,#EF4444)]">Could not parse date. Try formats like YYYY-MM-DD, MM/DD/YYYY, or Month DD, YYYY.</p>
      )}
      {results && (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((f) => (
            <div
              key={f.id}
              className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] transition-all duration-150 hover:shadow-[var(--anslation-ds-shadow-md)]"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{f.label}</span>
                <span className="text-[10px] font-mono text-[var(--muted-foreground)]">{f.format}</span>
              </div>
              <p className="break-all font-mono text-base font-semibold text-[var(--foreground)]">{f.result}</p>
              <button
                type="button"
                onClick={() => copyValue(f.result, f.id)}
                className="mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-[var(--muted-foreground)] opacity-0 transition-all hover:bg-[var(--muted)] hover:text-[var(--foreground)] group-hover:opacity-100"
              >
                <Copy className="h-3 w-3" />
                {copiedId === f.id ? "Copied" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DateDiffPanel() {
  const today = new Date().toISOString().slice(0, 10);
  const [date1, setDate1] = useState(today);
  const [date2, setDate2] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [copied, setCopied] = useState(false);

  const diff = useMemo(() => {
    const d1 = new Date(date1 + "T00:00:00");
    const d2 = new Date(date2 + "T00:00:00");
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

    const ms = Math.abs(d2.getTime() - d1.getTime());
    const sec = ms / 1000;
    const min = sec / 60;
    const h = min / 60;
    const d = h / 24;
    const wk = d / 7;
    const mo = d / 30.4375;
    const yr = d / 365.25;

    const [y1, m1, day1] = [d1.getFullYear(), d1.getMonth(), d1.getDate()];
    const [y2, m2, day2] = [d2.getFullYear(), d2.getMonth(), d2.getDate()];
    let yearDiff = y2 - y1;
    let monthDiff = m2 - m1;
    let dayDiff = day2 - day1;
    if (dayDiff < 0) { monthDiff--; dayDiff += new Date(y2, m2, 0).getDate(); }
    if (monthDiff < 0) { yearDiff--; monthDiff += 12; }

    const isBefore = d1 < d2 ? "after" : "before";

    return {
      ms: Math.floor(ms),
      sec: Math.floor(sec),
      min: Math.floor(min),
      h: Math.floor(h),
      d: Math.floor(d),
      wk: wk.toFixed(1),
      mo: mo.toFixed(1),
      yr: yr.toFixed(3),
      calendar: `${yearDiff}y ${monthDiff}m ${dayDiff}d`,
      order: isBefore,
    };
  }, [date1, date2]);

  const copyValue = async () => {
    if (!diff) return;
    const text = `From ${date1} to ${date2}: ${diff.calendar} (${diff.d} days, ${diff.h} hours)`;
    const ok = await safeCopyText(text);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1200); }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Start date</label>
          <input
            type="date"
            value={date1}
            onChange={(e) => setDate1(e.target.value)}
            className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 font-mono text-base outline-none transition-colors focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">End date</label>
          <input
            type="date"
            value={date2}
            onChange={(e) => setDate2(e.target.value)}
            className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 font-mono text-base outline-none transition-colors focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
          />
        </div>
      </div>
      {diff && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Duration</p>
              <p className="mt-2 text-3xl font-semibold leading-snug text-[var(--foreground)]">{diff.calendar}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {date1} → {date2} ({diff.order})
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                {[
                  ["Days", diff.d],
                  ["Hours", diff.h.toLocaleString()],
                  ["Minutes", diff.min.toLocaleString()],
                  ["Seconds", diff.sec.toLocaleString()],
                  ["Weeks", diff.wk],
                  ["Months (avg)", diff.mo],
                  ["Years (avg)", diff.yr],
                ].map(([label, val]) => (
                  <span key={label} className="text-[var(--muted-foreground)]">
                    <span className="font-semibold text-[var(--foreground)]">{val}</span> {label}
                  </span>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={copyValue}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MAIN
   ============================================================ */

export default function ToolHome() {
  const [category, setCategory] = useState("time");
  const catColor = CATEGORIES.find((c) => c.id === category)?.color || "text-sky-600";
  const CatIcon = CATEGORIES.find((c) => c.id === category)?.icon || Clock;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 lg:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Clock className="h-4 w-4" />
            Time &amp; date
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Date / Time Conversions</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Convert between time units, Unix timestamps, and date formats. Calculate the exact duration between any two dates.
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[var(--primary)] text-white shadow-sm"
                      : "border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  }`}
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="mb-3 flex items-center gap-2.5">
            <div className={`rounded-lg p-1.5 ${catColor.replace("text", "bg")}/10`}>
              <CatIcon className={`h-4 w-4 ${catColor}`} />
            </div>
            <span className="text-sm font-semibold text-[var(--foreground)]">
              {CATEGORIES.find((c) => c.id === category)?.label}
            </span>
          </div>
          {category === "time" && <TimeUnitPanel />}
          {category === "timestamp" && <TimestampPanel />}
          {category === "format" && <DateFormatPanel />}
          {category === "diff" && <DateDiffPanel />}
        </section>
      </div>
    </main>
  );
}
