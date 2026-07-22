"use client";

import { useMemo, useState } from "react";
import {
  Gauge,
  Layers,
  Paintbrush,
  Accessibility,
  Zap,
  Mail,
  Smartphone,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  ListChecks,
  Download,
  FileJson,
  Clock3,
  Trash2,
} from "lucide-react";

const TONE = {
  success: { text: "text-success", bg: "bg-success", soft: "bg-success-soft" },
  info: { text: "text-info", bg: "bg-info", soft: "bg-info-soft" },
  warning: { text: "text-warning", bg: "bg-warning", soft: "bg-warning-soft" },
  danger: { text: "text-danger", bg: "bg-danger", soft: "bg-danger-soft" },
};

function toneForScore(score) {
  if (score >= 80) return TONE.success;
  if (score >= 60) return TONE.info;
  if (score >= 40) return TONE.warning;
  return TONE.danger;
}

const SEVERITY_META = {
  error: { label: "Error", icon: XCircle, tone: TONE.danger },
  warning: { label: "Warning", icon: AlertTriangle, tone: TONE.warning },
  info: { label: "Info", icon: Info, tone: TONE.info },
};

const CATEGORY_META = {
  structure: { label: "HTML Structure", icon: Layers },
  css: { label: "CSS Compatibility", icon: Paintbrush },
  accessibility: { label: "Accessibility", icon: Accessibility },
  performance: { label: "Performance", icon: Zap },
  compatibility: { label: "Email Client Compatibility", icon: Mail },
  responsive: { label: "Responsive Design", icon: Smartphone },
};

const CLIENT_LABELS = { gmail: "Gmail", outlook: "Outlook", appleMail: "Apple Mail", yahoo: "Yahoo Mail" };

function Card({ className = "", children }) {
  return (
    <div
      className={`rounded-2xl border border-(--card-border) bg-(--card)/80 backdrop-blur-xl shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

export default function ResultsPanel({ audit, onExportPdf, onExportJson, recent, onSelectRecent, onClearRecent }) {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filteredIssues = useMemo(() => {
    const q = query.trim().toLowerCase();
    return audit.issues.filter((issue) => {
      if (severityFilter !== "all" && issue.severity !== severityFilter) return false;
      if (!q) return true;
      return `${issue.title} ${issue.explanation} ${issue.why}`.toLowerCase().includes(q);
    });
  }, [audit.issues, severityFilter, query]);

  const counts = useMemo(() => {
    const base = { error: 0, warning: 0, info: 0 };
    audit.issues.forEach((i) => (base[i.severity] += 1));
    return base;
  }, [audit.issues]);

  if (!audit.html) {
    return (
      <Card className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 p-8 text-center text-(--muted-foreground)">
        <Gauge className="h-10 w-10 opacity-50" aria-hidden="true" />
        <p className="text-sm">Paste or load HTML on the left to see the full audit here.</p>
      </Card>
    );
  }

  const overallTone = toneForScore(audit.overallScore);

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pr-1">
      <Card className="p-6">
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <div className={`flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full ${overallTone.soft}`}>
            <span className={`text-3xl font-bold tabular-nums ${overallTone.text}`}>{audit.overallScore}</span>
            <span className="text-[11px] text-(--muted-foreground)">/ 100</span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className={`rounded-lg px-2.5 py-1 text-sm font-bold ${overallTone.soft} ${overallTone.text}`}>{audit.grade}</span>
              <h2 className="text-xl font-bold text-(--foreground)">Email Quality Score</h2>
            </div>
            <p className="mt-1 text-sm text-(--muted-foreground)">
              {audit.stats.sizeKb}KB · {audit.stats.imageCount} image(s) · {audit.stats.linkCount} link(s) · {audit.stats.tableCount} table(s) ·{" "}
              {audit.stats.wordCount} words
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs sm:justify-start">
              <span className="rounded-full bg-danger-soft px-2 py-0.5 font-semibold text-danger">{counts.error} errors</span>
              <span className="rounded-full bg-warning-soft px-2 py-0.5 font-semibold text-warning">{counts.warning} warnings</span>
              <span className="rounded-full bg-info-soft px-2 py-0.5 font-semibold text-info">{counts.info} info</span>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onExportPdf}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-(--border) px-3 py-1.5 text-xs font-medium text-(--foreground) hover:border-(--primary) hover:text-(--primary)"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" /> PDF
            </button>
            <button
              type="button"
              onClick={onExportJson}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-(--border) px-3 py-1.5 text-xs font-medium text-(--foreground) hover:border-(--primary) hover:text-(--primary)"
            >
              <FileJson className="h-3.5 w-3.5" aria-hidden="true" /> JSON
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.entries(audit.categoryScores).map(([key, score]) => {
            const meta = CATEGORY_META[key];
            const Icon = meta.icon;
            const tone = toneForScore(score);
            return (
              <div key={key} className="rounded-xl border border-(--border) bg-(--background) p-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-(--muted-foreground)">
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{meta.label}</span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className={`text-xl font-bold ${tone.text}`}>{score}</span>
                  <span className="text-xs text-(--muted-foreground)">/100</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-(--muted)">
                  <div className={`h-1.5 rounded-full ${tone.bg}`} style={{ width: `${score}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold text-(--foreground)">Email client compatibility</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(audit.clientScores).map(([client, score]) => {
            const tone = toneForScore(score);
            const unsupported = audit.clientUnsupportedFeatures[client];
            return (
              <div key={client} className="rounded-xl border border-(--border) bg-(--background) p-3">
                <p className="text-xs font-medium text-(--muted-foreground)">{CLIENT_LABELS[client]}</p>
                <p className={`mt-1 text-lg font-bold ${tone.text}`}>{score}<span className="text-xs text-(--muted-foreground)">/100</span></p>
                {unsupported.length > 0 && (
                  <p className="mt-1 line-clamp-2 text-[11px] text-(--muted-foreground)" title={unsupported.join(", ")}>
                    {unsupported.length} unsupported feature{unsupported.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-(--foreground)">Issues ({filteredIssues.length}/{audit.issues.length})</h3>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-(--muted-foreground)" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search issues…"
              className="rounded-lg border border-(--border) bg-(--background) py-1.5 pl-8 pr-3 text-xs text-(--foreground) outline-none focus:border-(--primary)"
            />
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {["all", "error", "warning", "info"].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverityFilter(sev)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                severityFilter === sev ? "bg-(--primary) text-(--primary-foreground)" : "bg-(--muted) text-(--muted-foreground)"
              }`}
            >
              {sev === "all" ? `All (${audit.issues.length})` : `${sev} (${counts[sev]})`}
            </button>
          ))}
        </div>

        {filteredIssues.length === 0 ? (
          <p className="rounded-xl border border-(--border) bg-(--background) p-4 text-sm text-(--muted-foreground)">
            {audit.issues.length === 0 ? "No issues detected — this email passed every check." : "No issues match this filter/search."}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((issue) => {
              const meta = SEVERITY_META[issue.severity];
              const SevIcon = meta.icon;
              return (
                <div key={issue.id} className="rounded-xl border border-(--border) bg-(--background) p-4">
                  <div className="flex items-start gap-2">
                    <SevIcon className={`mt-0.5 h-4 w-4 shrink-0 ${meta.tone.text}`} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.tone.soft} ${meta.tone.text}`}>{meta.label}</span>
                        <h4 className="font-semibold text-(--foreground)">{issue.title}</h4>
                        {issue.clients?.map((c) => (
                          <span key={c} className="rounded-full bg-(--muted) px-2 py-0.5 text-[10px] font-medium text-(--muted-foreground)">
                            {CLIENT_LABELS[c]}
                          </span>
                        ))}
                      </div>
                      {issue.explanation && <p className="mt-1.5 text-sm text-(--foreground)/85">{issue.explanation}</p>}
                      <p className="mt-1.5 text-xs text-(--muted-foreground)">
                        <strong className="text-(--foreground)/70">Why it matters:</strong> {issue.why}
                      </p>
                      <p className="mt-1.5 text-xs text-(--muted-foreground)">
                        <strong className="text-(--foreground)/70">Fix:</strong> {issue.fix}
                      </p>
                      {issue.example && (
                        <pre className="mt-2 overflow-x-auto rounded-lg bg-(--muted) p-2.5 text-[11px] text-(--foreground)/90">
                          <code>{issue.example}</code>
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-(--foreground)">
          <ListChecks className="h-4 w-4" aria-hidden="true" /> Best practices checklist
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {audit.checklist.map((item) => (
            <div key={item.id} className="flex items-center gap-2 rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm">
              {item.passed ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
              )}
              <span className={item.passed ? "text-(--foreground)/85" : "text-(--foreground)"}>{item.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-(--foreground)">
            <Clock3 className="h-4 w-4" aria-hidden="true" /> Recent analyses ({recent.length})
          </h3>
          {recent.length > 0 && (
            <button type="button" onClick={onClearRecent} className="inline-flex items-center gap-1 text-xs text-(--muted-foreground) hover:text-danger">
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Clear
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-(--muted-foreground)">Analyzed HTML will show up here for quick recall.</p>
        ) : (
          <div className="space-y-2">
            {recent.map((entry) => {
              const tone = toneForScore(entry.overallScore);
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onSelectRecent(entry.html)}
                  className="flex w-full items-center gap-3 rounded-xl border border-(--border) bg-(--background) p-3 text-left"
                >
                  <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${tone.soft} ${tone.text}`}>{entry.grade} · {entry.overallScore}</span>
                  <span className="min-w-0 flex-1 truncate text-xs text-(--muted-foreground)">{entry.sizeKb}KB · {new Date(entry.ts).toLocaleString()}</span>
                </button>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
