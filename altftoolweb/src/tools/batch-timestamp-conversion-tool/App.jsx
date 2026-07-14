"use client";

import React, { useEffect, useMemo, useState } from "react";
import moment from "moment-timezone";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Copy,
  Database,
  Download,
  FileJson,
  FileText,
  Filter,
  History,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react";

const STORAGE_KEY = "altftools:batch-timestamp-conversion-tool:v1";
const MAX_ROWS = 2000;
const COMMON_TIMEZONES = [
  { label: "UTC / GMT", value: "UTC" },
  { label: "Local", value: moment.tz.guess() },
  { label: "IST - Kolkata", value: "Asia/Kolkata" },
  { label: "Pacific - Los Angeles", value: "America/Los_Angeles" },
  { label: "Eastern - New York", value: "America/New_York" },
  { label: "London", value: "Europe/London" },
  { label: "Tokyo", value: "Asia/Tokyo" },
];
const DEFAULT_INPUT = "";
const initialState = {
  input: DEFAULT_INPUT,
  timezone: "UTC",
  customTimezone: "",
  filters: { query: "", status: "all", sort: "row" },
  history: [],
};

function safeLoad() {
  if (typeof window === "undefined") return initialState;
  try {
    return { ...initialState, ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) };
  } catch {
    return initialState;
  }
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function tokenizeInput(value) {
  return value
    .split(/\r?\n|[\t ]+/)
    .map((item) => item.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean)
    .slice(0, MAX_ROWS);
}

function detectTimestamp(raw) {
  if (!/^[+-]?\d+(?:\.\d+)?$/.test(raw)) return null;
  const digits = raw.replace(/^[+-]/, "").split(".")[0].length;
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) return null;
  if (digits <= 10) return { type: "Unix seconds", ms: numeric * 1000 };
  if (digits <= 13) return { type: "Unix milliseconds", ms: numeric };
  if (digits <= 16) return { type: "Unix microseconds", ms: numeric / 1000 };
  return { type: "Unix nanoseconds", ms: numeric / 1000000 };
}

function parseHumanDate(raw, timezone) {
  const formats = [
    moment.ISO_8601,
    "YYYY-MM-DD HH:mm:ss",
    "YYYY-MM-DD",
    "MM/DD/YYYY",
    "DD/MM/YYYY",
    "YYYYMMDD",
    "YYYYMMDDHHmmss",
    "DD MMM YYYY HH:mm z",
    "MMM D, YYYY",
    "D MMM YYYY",
    "ddd, DD MMM YYYY HH:mm:ss ZZ",
  ];
  const normalized = raw.trim().replace(/[^\w\s:.,/+:-]/g, "");
  const hasZone = /(?:z|gmt|utc|[+-]\d{2}:?\d{2})$/i.test(normalized);
  const parsed = hasZone ? moment(normalized, formats, true) : moment.tz(normalized, formats, true, timezone || "UTC");
  if (parsed.isValid()) return { type: hasZone ? "Human date with timezone" : "Human date", ms: parsed.valueOf() };
  const loose = hasZone ? moment(normalized) : moment.tz(normalized, timezone || "UTC");
  return loose.isValid() ? { type: "Human date", ms: loose.valueOf() } : null;
}

function formatRow(raw, row, timezone) {
  const timestamp = detectTimestamp(raw);
  const parsed = timestamp || parseHumanDate(raw, timezone);
  if (!parsed) {
    return {
      id: `${row}-${raw}`,
      row,
      original: raw,
      type: "Unsupported",
      status: "invalid",
      timezone,
      converted: "Unable to parse this value",
      unixSeconds: "",
      unixMilliseconds: "",
      iso: "",
      relative: "",
    };
  }
  const date = moment.tz(parsed.ms, timezone);
  if (!date.isValid()) return formatRow("invalid-date-marker", row, timezone);
  const sourceIsTimestamp = Boolean(timestamp);
  return {
    id: `${row}-${raw}`,
    row,
    original: raw,
    type: parsed.type,
    status: "valid",
    timezone,
    converted: sourceIsTimestamp ? date.format("YYYY-MM-DD HH:mm:ss z") : String(Math.floor(parsed.ms / 1000)),
    unixSeconds: String(Math.floor(parsed.ms / 1000)),
    unixMilliseconds: String(Math.round(parsed.ms)),
    iso: date.format(),
    readable: date.format("ddd, DD MMM YYYY HH:mm:ss ZZ"),
    relative: date.fromNow(),
  };
}

function csvEscape(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function buildExport(rows, type) {
  if (type === "json") return JSON.stringify(rows, null, 2);
  if (type === "txt") {
    return rows.map((row) => `${row.original} -> ${row.status === "valid" ? row.converted : row.converted}`).join("\n");
  }
  const headers = ["row", "original", "converted", "type", "timezone", "status", "unixSeconds", "unixMilliseconds", "iso"];
  return [headers.join(","), ...rows.map((row) => headers.map((key) => csvEscape(row[key])).join(","))].join("\n");
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function BatchTimestampConversionTool() {
  const [state, setState] = useState(safeLoad);
  const [message, setMessage] = useState("");
  const selectedTimezone = state.customTimezone.trim() || state.timezone || "UTC";
  const validTimezone = moment.tz.zone(selectedTimezone) ? selectedTimezone : "UTC";

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const rows = useMemo(() => tokenizeInput(state.input).map((item, index) => formatRow(item, index + 1, validTimezone)), [state.input, validTimezone]);
  const analytics = useMemo(() => {
    const valid = rows.filter((row) => row.status === "valid").length;
    return { total: rows.length, valid, invalid: rows.length - valid, success: rows.length ? Math.round((valid / rows.length) * 100) : 0 };
  }, [rows]);
  const filteredRows = useMemo(() => {
    const query = state.filters.query.trim().toLowerCase();
    return rows
      .filter((row) => {
        const text = `${row.original} ${row.converted} ${row.type} ${row.iso}`.toLowerCase();
        return (!query || text.includes(query)) && (state.filters.status === "all" || row.status === state.filters.status);
      })
      .sort((a, b) => {
        if (state.filters.sort === "type") return a.type.localeCompare(b.type);
        if (state.filters.sort === "status") return a.status.localeCompare(b.status);
        return a.row - b.row;
      });
  }, [rows, state.filters]);

  function patch(patchValue) {
    setState((current) => ({ ...current, ...patchValue }));
  }

  function notify(text) {
    setMessage(text);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setMessage(""), 2600);
  }

  function saveHistory() {
    if (!rows.length) return notify("Add timestamps or dates before saving history.");
    const snapshot = { id: makeId(), savedAt: new Date().toISOString(), timezone: validTimezone, input: state.input, rows, analytics };
    patch({ history: [snapshot, ...state.history].slice(0, 12) });
    notify("Conversion batch saved.");
  }

  async function copyAll() {
    if (!rows.length) return notify("Nothing to copy yet.");
    await navigator.clipboard.writeText(buildExport(rows, "txt"));
    notify("Converted batch copied.");
  }

  function exportRows(type) {
    if (!rows.length) return notify("Nothing to export yet.");
    const mime = type === "json" ? "application/json" : type === "csv" ? "text/csv" : "text/plain";
    downloadFile(buildExport(rows, type), `batch-timestamp-conversion.${type}`, mime);
    notify(`${type.toUpperCase()} export downloaded.`);
  }

  return (
    <div className="timestamp-tool min-h-screen overflow-x-hidden bg-(--background) px-2 py-5 font-secondary text-(--foreground) sm:px-3">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="relative overflow-hidden rounded-3xl border border-(--border) bg-(--card) p-5 text-center shadow-xl sm:p-7">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-(--primary) to-transparent opacity-50" />
          <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-(--border) bg-(--background) px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-(--primary)">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="break-words">Live epoch and date conversion engine</span>
          </div>
          <h1 className="text-gradient-hero break-words text-3xl font-black leading-[1.14] tracking-tight sm:text-5xl sm:leading-[1.12]">Batch Timestamp Conversion Tool</h1>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Paste seconds, milliseconds, microseconds, ISO dates, or readable dates. Detection, timezone conversion, validation, comparison, and exports update instantly.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            <Stat label="Rows" value={analytics.total} />
            <Stat label="Valid" value={analytics.valid} />
            <Stat label="Invalid" value={analytics.invalid} />
            <Stat label="Success" value={`${analytics.success}%`} />
          </div>
        </header>

        {message && <Toast text={message} onClose={() => setMessage("")} />}

        <main className="grid min-w-0 gap-4 xl:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.35fr)]">
          <section className="min-w-0 space-y-4">
            <Panel title="Batch Input" icon={Clock3}>
              <textarea
                value={state.input}
                onChange={(event) => patch({ input: event.target.value })}
                placeholder={"Paste mixed timestamps and dates. Separate by spaces or line breaks."}
                className="min-h-72 w-full resize-y rounded-2xl border border-(--border) bg-(--background) p-3 text-sm leading-relaxed outline-none transition placeholder:text-(--input-placeholder) focus:border-(--primary)"
              />
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => patch({ input: "" })} className="ActionButton"><RotateCcw className="h-4 w-4" /> Clear</button>
                <button onClick={saveHistory} className="ActionButton"><History className="h-4 w-4" /> Save</button>
              </div>
            </Panel>

            <Panel title="Timezone Controls" icon={Zap}>
              <Select value={state.timezone} onChange={(timezone) => patch({ timezone, customTimezone: "" })} options={COMMON_TIMEZONES.map((item) => [item.value, item.label])} />
              <Field label="Custom IANA timezone" value={state.customTimezone} onChange={(customTimezone) => patch({ customTimezone })} placeholder="Asia/Kolkata, Europe/London" />
              <div className={`rounded-2xl border p-3 text-sm font-bold ${moment.tz.zone(selectedTimezone) ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200" : "border-amber-400/25 bg-amber-400/10 text-amber-700 dark:text-amber-100"}`}>
                {moment.tz.zone(selectedTimezone) ? `Using ${validTimezone}` : `Invalid timezone, falling back to UTC`}
              </div>
            </Panel>

            <Panel title="Export Panel" icon={Download}>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={copyAll} className="ActionButton"><Copy className="h-4 w-4" /> Copy</button>
                <button onClick={() => exportRows("csv")} className="ActionButton"><Database className="h-4 w-4" /> CSV</button>
                <button onClick={() => exportRows("txt")} className="ActionButton"><FileText className="h-4 w-4" /> TXT</button>
                <button onClick={() => exportRows("json")} className="ActionButton"><FileJson className="h-4 w-4" /> JSON</button>
              </div>
            </Panel>
          </section>

          <section className="min-w-0 space-y-4">
            <Panel title="Auto Detection Status" icon={CheckCircle2}>
              <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(130px,1fr))]">
                {["Unix seconds", "Unix milliseconds", "Unix microseconds", "Human date", "Human date with timezone"].map((type) => (
                  <Metric key={type} label={type} value={rows.filter((row) => row.type === type).length} />
                ))}
              </div>
            </Panel>

            <Panel title="Search, Filter & Live Comparison" icon={Filter}>
              <div className="grid gap-3 md:grid-cols-3">
                <SearchInput value={state.filters.query} onChange={(query) => patch({ filters: { ...state.filters, query } })} />
                <Select value={state.filters.status} onChange={(status) => patch({ filters: { ...state.filters, status } })} options={[["all", "All rows"], ["valid", "Valid"], ["invalid", "Invalid"]]} />
                <Select value={state.filters.sort} onChange={(sort) => patch({ filters: { ...state.filters, sort } })} options={[["row", "Input order"], ["type", "Format type"], ["status", "Status"]]} />
              </div>
              <div className="custom-scrollbar max-h-[620px] overflow-auto rounded-2xl border border-(--border)">
                <table className="w-full min-w-[940px] table-fixed border-collapse text-sm">
                  <thead className="sticky top-0 z-10 bg-(--muted) text-left text-[10px] uppercase tracking-[.1em] text-muted-foreground">
                    <tr>
                      <th className="w-14 h-14 p-3 leading-snug">Row</th>
                      <th className="w-[220px] h-14 p-3 leading-snug">Original Input</th>
                      <th className="w-[220px] h-14 p-3 leading-snug">Converted Result</th>
                      <th className="w-[170px] h-14 p-3 leading-snug">Format Type</th>
                      <th className="w-[155px] h-14 p-3 leading-snug">Timezone</th>
                      <th className="w-[220px] h-14 p-3 leading-snug">ISO / Detail</th>
                      <th className="w-[100px] h-14 p-3 leading-snug">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => (
                      <tr key={row.id} className="border-t border-(--border) bg-(--background)/80 transition hover:bg-(--card)">
                        <td className="p-3 align-top font-black text-(--primary)">{row.row}</td>
                        <td className="p-3 align-top"><Cell text={row.original} /></td>
                        <td className="p-3 align-top"><Cell text={row.converted} strong /></td>
                        <td className="p-3 align-top"><Cell text={row.type} /></td>
                        <td className="p-3 align-top"><Cell text={row.timezone} /></td>
                        <td className="p-3 align-top"><Cell text={row.status === "valid" ? `${row.iso} | ${row.readable}` : row.converted} /></td>
                        <td className="p-3 align-top"><Status status={row.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filteredRows.length && <EmptyState text={rows.length ? "No rows match the current filters." : "Converted rows appear as soon as you paste input."} />}
              </div>
            </Panel>

            <section className="grid min-w-0 gap-4 lg:grid-cols-2">
              <Panel title="Validation Panel" icon={AlertTriangle}>
                <div className="max-h-64 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                  {rows.filter((row) => row.status === "invalid").map((row) => (
                    <div key={row.id} className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-3 text-sm font-semibold text-amber-700 dark:text-amber-100">
                      Row {row.row}: <span className="break-all">{row.original}</span>
                    </div>
                  ))}
                  {!analytics.invalid && <EmptyState text={rows.length ? "All parsed rows are valid." : "Invalid rows will be listed here."} />}
                </div>
              </Panel>

              <Panel title="History Section" icon={History}>
                <div className="max-h-64 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                  {state.history.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-(--border) bg-(--background) p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="break-words text-sm font-black">{item.analytics.total} rows | {item.analytics.success}% success</div>
                          <div className="mt-1 break-words text-xs text-muted-foreground">{moment(item.savedAt).format("YYYY-MM-DD HH:mm")} | {item.timezone}</div>
                        </div>
                        <button onClick={() => patch({ history: state.history.filter((entry) => entry.id !== item.id) })} className="shrink-0 rounded-lg p-1.5 text-rose-500 hover:bg-rose-500/10" aria-label="Delete history"><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <button onClick={() => patch({ input: item.input, timezone: item.timezone, customTimezone: "" })} className="ActionButton mt-2 w-full"><Zap className="h-4 w-4" /> Restore</button>
                    </article>
                  ))}
                  {!state.history.length && <EmptyState text="Saved conversion batches will appear here." />}
                </div>
              </Panel>
            </section>
          </section>
        </main>
      </div>

      <style jsx global>{`
        .timestamp-tool,
        .timestamp-tool * {
          min-width: 0;
          overflow-wrap: anywhere;
        }
        .timestamp-tool input,
        .timestamp-tool textarea,
        .timestamp-tool select {
          overflow-wrap: normal;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--primary) 35%, transparent); border-radius: 999px; }
        .ActionButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: .45rem;
          min-height: 2.65rem;
          border-radius: .9rem;
          border: 1px solid var(--secondary-border);
          background: var(--secondary-bg);
          padding: .65rem .75rem;
          color: var(--secondary-foreground);
          font-size: .82rem;
          font-weight: 850;
          line-height: 1.15;
          text-align: center;
          transition: all .2s ease;
        }
        .ActionButton:hover { background: var(--secondary-hover); color: var(--foreground); border-color: var(--primary); }
      `}</style>
    </div>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="min-w-0 overflow-visible rounded-3xl border border-(--border) bg-(--card) p-4 shadow-md transition duration-300 hover:border-(--primary) sm:p-5">
      <div className="mb-3 flex min-w-0 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-(--background) text-(--primary) shadow-sm"><Icon className="h-4 w-4" /></div>
        <h2 className="min-w-0 break-words text-xs font-black uppercase leading-relaxed tracking-[.16em]">{title}</h2>
      </div>
      <div className="min-w-0 space-y-3">{children}</div>
    </section>
  );
}

function Stat({ label, value }) {
  return <div className="min-w-0 rounded-2xl border border-(--border) bg-(--background) px-3 py-2.5 shadow-sm"><div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</div><div className="mt-1 break-words text-xl font-black leading-tight">{value}</div></div>;
}

function Metric({ label, value }) {
  return <div className="min-w-0 rounded-2xl border border-(--border) bg-(--background) px-3 py-2.5 shadow-sm"><div className="break-words text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</div><div className="mt-1 break-words text-base font-black leading-tight">{value}</div></div>;
}

function Field({ label, value, onChange, placeholder }) {
  return <label className="block min-w-0"><span className="mb-1.5 block text-[10px] font-black uppercase tracking-[.16em] text-muted-foreground">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm outline-none transition placeholder:text-(--input-placeholder) focus:border-(--primary)" /></label>;
}

function Select({ value, onChange, options }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 w-full rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm outline-none transition focus:border-(--primary)">{options.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>;
}

function SearchInput({ value, onChange }) {
  return <div className="relative min-w-0"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search rows" className="min-h-12 w-full rounded-xl border border-(--border) bg-(--background) py-2 pl-10 pr-3 text-sm outline-none placeholder:text-(--input-placeholder) focus:border-(--primary)" /></div>;
}

function Cell({ text, strong = false }) {
  return <div className={`max-h-24 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-(--card) px-2 py-1.5 custom-scrollbar ${strong ? "font-black text-(--primary)" : "text-muted-foreground"}`}>{text}</div>;
}

function Status({ status }) {
  const valid = status === "valid";
  return <span className={`inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-widest ${valid ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200" : "border-rose-400/30 bg-rose-400/10 text-rose-600 dark:text-rose-200"}`}>{status}</span>;
}

function EmptyState({ text }) {
  return <div className="flex w-full items-center justify-center rounded-2xl border border-dashed border-(--border) bg-(--background) px-3 py-4 text-center text-sm leading-snug text-muted-foreground">{text}</div>;
}

function Toast({ text, onClose }) {
  return <div className="flex items-start justify-between gap-3 rounded-2xl border border-(--border) bg-(--card) px-3 py-2 text-sm font-semibold shadow-sm"><span className="min-w-0 break-words">{text}</span><button onClick={onClose} className="shrink-0 rounded-full p-1 hover:bg-cyan-500/10" aria-label="Dismiss message"><X className="h-4 w-4" /></button></div>;
}
