"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  ChevronDown,
  Clipboard,
  Copy,
  Download,
  FileJson,
  FileText,
  Filter,
  ListCollapse,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { groupsToCsv, groupsToMarkdown, groupLogs, SAMPLE_LOGS, serializableGroups, splitEntries } from "../utils";

const LEVEL_LABELS = {
  FATAL: "Critical",
  ERROR: "Error",
  WARN: "Warning",
  INFO: "Info",
  DEBUG: "Debug",
  TRACE: "Trace",
  UNKNOWN: "Unknown",
};

const controlClass = "h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--foreground)] outline-none transition-colors focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30";

function formatTime(value) {
  if (!value) return "Timestamp unavailable";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "medium" }).format(new Date(value));
}

function downloadFile(content, type, name) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function ActionButton({ children, onClick, disabled, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="min-w-20 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-center shadow-sm sm:min-w-24">
      <Icon aria-hidden="true" className="mx-auto mb-2 h-4 w-4 text-[var(--primary)]" />
      <p className="text-xl font-bold tabular-nums">{value}</p>
      <p className="text-xs font-semibold text-[var(--muted-foreground)]">{label}</p>
    </div>
  );
}

export default function ErrorLogPatternGrouperPage() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("ALL");
  const [sort, setSort] = useState("frequency");
  const [expanded, setExpanded] = useState({});
  const [notice, setNotice] = useState("");

  const groups = useMemo(() => groupLogs(text), [text]);
  const totalEntries = useMemo(() => splitEntries(text).length, [text]);
  const levels = useMemo(() => ["ALL", ...new Set(groups.map((group) => group.level))], [groups]);
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const matches = groups.filter((group) =>
      (level === "ALL" || group.level === level) &&
      (!normalizedQuery || `${group.pattern} ${group.examples.join(" ")}`.toLocaleLowerCase().includes(normalizedQuery))
    );
    return [...matches].sort((a, b) => sort === "recent" ? b.lastIndex - a.lastIndex : b.count - a.count || a.firstIndex - b.firstIndex);
  }, [groups, level, query, sort]);
  const recurring = groups.filter((group) => group.count > 1).length;

  async function copy(value) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice("Copied to clipboard.");
    } catch {
      setNotice("Clipboard access was blocked. Select and copy the text manually.");
    }
    window.setTimeout(() => setNotice(""), 1800);
  }

  function clearAll() {
    setText("");
    setQuery("");
    setLevel("ALL");
    setExpanded({});
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:py-10">
        <section aria-labelledby="tool-title" className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-8">
          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)]">
                <Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> Local log intelligence
              </span>
              <div>
                <h1 id="tool-title" className="text-3xl font-bold tracking-tight sm:text-4xl">Error Log Pattern Grouper</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)] sm:text-base">Group noisy logs into recurring patterns. Timestamps, identifiers, addresses, URLs, and changing numbers are normalized automatically.</p>
              </div>
              <p className="flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)]"><ShieldCheck aria-hidden="true" className="h-4 w-4 text-[var(--primary)]" />Analysis stays in your browser. Nothing is uploaded.</p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3" aria-label="Analysis summary">
              <Metric icon={BarChart3} label="Entries" value={totalEntries} />
              <Metric icon={ListCollapse} label="Patterns" value={groups.length} />
              <Metric icon={AlertTriangle} label="Recurring" value={recurring} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-4 sm:px-5">
              <div><h2 className="font-bold">Log input</h2><p id="log-help" className="text-xs text-[var(--muted-foreground)]">Paste plain-text logs. Multiline stack traces stay with their entry.</p></div>
              <div className="flex gap-2">
                <ActionButton onClick={() => setText(SAMPLE_LOGS)} label="Load sample logs"><Clipboard aria-hidden="true" className="h-4 w-4" />Sample</ActionButton>
                <ActionButton disabled={!text} onClick={clearAll} label="Clear logs and filters"><Trash2 aria-hidden="true" className="h-4 w-4" /><span className="sr-only">Clear</span></ActionButton>
              </div>
            </div>
            <textarea value={text} onChange={(event) => setText(event.target.value)} spellCheck="false" aria-label="Log text" aria-describedby="log-help" placeholder="Paste application, server, or console logs here…" className="min-h-[32rem] w-full resize-y bg-transparent p-5 font-mono text-sm leading-6 text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary)]/30" />
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
              <label className="relative min-w-0"><span className="sr-only">Search patterns</span><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patterns or examples" className={`${controlClass} w-full pl-10 pr-3`} /></label>
              <label className="relative"><span className="sr-only">Filter by severity</span><Filter aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" /><select value={level} onChange={(event) => setLevel(event.target.value)} className={`${controlClass} w-full appearance-none pl-10 pr-9 font-semibold`}><option value="ALL">All levels</option>{levels.filter((item) => item !== "ALL").map((item) => <option key={item} value={item}>{LEVEL_LABELS[item] || item}</option>)}</select><ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" /></label>
              <label><span className="sr-only">Sort patterns</span><select value={sort} onChange={(event) => setSort(event.target.value)} className={`${controlClass} w-full px-3 font-semibold`}><option value="frequency">Most frequent</option><option value="recent">Most recent</option></select></label>
              <div className="flex flex-wrap gap-2"><ActionButton disabled={!filtered.length} onClick={() => downloadFile(groupsToCsv(filtered), "text/csv;charset=utf-8", "log-patterns.csv")} label="Export filtered patterns as CSV"><Download aria-hidden="true" className="h-4 w-4" />CSV</ActionButton><ActionButton disabled={!filtered.length} onClick={() => downloadFile(JSON.stringify(serializableGroups(filtered), null, 2), "application/json", "log-patterns.json")} label="Export filtered patterns as JSON"><FileJson aria-hidden="true" className="h-4 w-4" />JSON</ActionButton><ActionButton disabled={!filtered.length} onClick={() => downloadFile(groupsToMarkdown(filtered), "text/markdown;charset=utf-8", "log-pattern-report.md")} label="Export filtered patterns as Markdown"><FileText aria-hidden="true" className="h-4 w-4" />MD</ActionButton></div>
            </div>

            <p className="sr-only" role="status" aria-live="polite">{notice}</p>
            {!text.trim() ? (
              <div className="flex min-h-[27rem] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 text-center"><div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]"><ListCollapse aria-hidden="true" className="h-8 w-8" /></div><h2 className="text-xl font-bold">Patterns will appear here</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted-foreground)]">Paste logs or load the sample. Analysis updates locally as you type.</p></div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-10 text-center"><h2 className="font-semibold">No matching patterns</h2><p className="mt-1 text-sm text-[var(--muted-foreground)]">Try a different search term or severity filter.</p></div>
            ) : (
              <div className="space-y-3" aria-label={`${filtered.length} log patterns`}>
                {filtered.map((group, index) => {
                  const isOpen = Boolean(expanded[group.id]);
                  const panelId = `examples-${index}`;
                  return (
                    <article key={group.id} className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
                      <div className="flex gap-3 p-4 sm:p-5"><div className="flex h-10 min-w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-sm font-bold text-[var(--primary)]">{index + 1}</div><div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-soft)] px-2 py-0.5 text-xs font-semibold">{LEVEL_LABELS[group.level] || group.level}</span><span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">{group.count} {group.count === 1 ? "occurrence" : "occurrences"}</span><span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">{group.trend}</span>{group.burst && <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-0.5 text-xs font-semibold">Burst detected</span>}</div><code className="break-words text-sm font-semibold leading-6">{group.pattern}</code><p className="mt-2 text-xs text-[var(--muted-foreground)]">{formatTime(group.firstSeen)} → {formatTime(group.lastSeen)}</p></div><button type="button" onClick={() => copy(group.pattern)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] transition-colors hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30" aria-label={`Copy pattern ${index + 1}`}><Copy aria-hidden="true" className="h-4 w-4" /></button></div>
                      <button type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setExpanded((state) => ({ ...state, [group.id]: !state[group.id] }))} className="flex min-h-11 w-full items-center justify-between border-t border-[var(--border)] px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary)]/30 sm:px-5"><span>View {Math.min(group.examples.length, 5)} example{group.examples.length === 1 ? "" : "s"}</span><ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`} /></button>
                      {isOpen && <div id={panelId} className="space-y-3 border-t border-[var(--border)] bg-[var(--surface-soft)] p-3 sm:p-4"><dl className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm sm:grid-cols-2"><div><dt className="text-xs font-semibold text-[var(--muted-foreground)]">Services / modules</dt><dd className="mt-1 break-words font-medium">{group.contexts.join(", ") || "Not detected"}</dd></div><div><dt className="text-xs font-semibold text-[var(--muted-foreground)]">Common stack frame</dt><dd className="mt-1 break-words font-mono text-xs">{group.commonStackFrame || "Not detected"}</dd></div><div className="sm:col-span-2"><dt className="text-xs font-semibold text-[var(--muted-foreground)]">Heuristic suggestion</dt><dd className="mt-1 leading-6">{group.suggestion}</dd><p className="mt-1 text-xs text-[var(--muted-foreground)]">Automated clue only—not a confirmed root cause. Verify against telemetry and source code.</p></div></dl>{group.examples.slice(0, 5).map((example, exampleIndex) => <div key={`${group.id}-${exampleIndex}`} className="relative rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 pr-11"><pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-5 text-[var(--muted-foreground)]">{example}</pre><button type="button" onClick={() => copy(example)} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30" aria-label={`Copy example ${exampleIndex + 1}`}><Copy aria-hidden="true" className="h-3.5 w-3.5" /></button></div>)}</div>}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
