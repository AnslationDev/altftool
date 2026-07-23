"use client";

import { useState } from "react";
import {
  Gauge,
  Inbox,
  ShieldAlert,
  HeartPulse,
  XCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Copy,
  Check,
  FileDown,
  FileJson,
  Lightbulb,
  Highlighter,
  Clock3,
  Trash2,
} from "lucide-react";
import { buildReportText, downloadReportTxt, downloadReportJson } from "../lib/reportUtils";
import { safeCopyText } from "@/shared/utils/clipboard";

const TONE = {
  success: { text: "text-success", bg: "bg-success", soft: "bg-success-soft", stroke: "stroke-success" },
  info: { text: "text-info", bg: "bg-info", soft: "bg-info-soft", stroke: "stroke-info" },
  warning: { text: "text-warning", bg: "bg-warning", soft: "bg-warning-soft", stroke: "stroke-warning" },
  danger: { text: "text-danger", bg: "bg-danger", soft: "bg-danger-soft", stroke: "stroke-danger" },
};

function toneForScore(score, invert = false) {
  const v = invert ? 100 - score : score;
  if (v >= 80) return TONE.success;
  if (v >= 60) return TONE.info;
  if (v >= 40) return TONE.warning;
  return TONE.danger;
}

const SEVERITY_META = {
  error: { label: "Error", icon: XCircle, tone: TONE.danger },
  warning: { label: "Warning", icon: AlertTriangle, tone: TONE.warning },
  info: { label: "Info", icon: Info, tone: TONE.info },
};

function Card({ className = "", children }) {
  return (
    <div className={`rounded-2xl border border-(--card-border) bg-(--card)/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

function RadialScore({ score, label }) {
  const tone = toneForScore(score);
  const size = 160;
  const stroke = 13;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${score} out of 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" className="stroke-(--muted)" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          className={`${tone.stroke} transition-[stroke-dashoffset] duration-700 ease-out`}
          strokeDasharray={c}
          strokeDashoffset={c - (score / 100) * c}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tabular-nums text-(--foreground)">{score}</span>
        <span className="text-[11px] text-(--muted-foreground)">/ 100</span>
      </div>
    </div>
  );
}

function renderHighlighted(text, spans) {
  if (!spans.length) return text;
  const nodes = [];
  let cursor = 0;
  spans.forEach((span, i) => {
    if (span.start > cursor) nodes.push(text.slice(cursor, span.start));
    const tone = span.type === "spam" ? TONE.danger : TONE.warning;
    nodes.push(
      <mark
        key={i}
        className={`rounded px-1 py-0.5 font-medium ${tone.soft} ${tone.text}`}
        title={span.alternative ? `Try: "${span.alternative}"` : span.type === "spam" ? "Spam trigger" : "Urgency phrase"}
      >
        {span.text}
      </mark>,
    );
    cursor = span.end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export default function ResultsPanel({ result, dirty, history, onLoadHistory, onClearHistory }) {
  const [copied, setCopied] = useState(false);
  const [severityFilter, setSeverityFilter] = useState("all");

  if (!result) {
    return (
      <Card className="flex min-h-[380px] flex-col items-center justify-center gap-3 p-8 text-center text-(--muted-foreground)">
        <Gauge className="h-10 w-10 opacity-50" aria-hidden="true" />
        <p className="max-w-xs text-sm">
          Write or paste your email on the left, then click <span className="font-semibold text-(--foreground)">Analyze</span> to see the deliverability prediction.
        </p>
      </Card>
    );
  }

  const overallTone = toneForScore(result.overallScore);
  const spamTone = toneForScore(result.spamRisk, true);
  const inboxTone = toneForScore(result.inboxProbability);
  const filteredIssues = result.issues.filter((i) => severityFilter === "all" || i.severity === severityFilter);

  async function handleCopyReport() {
    const ok = await safeCopyText(buildReportText(result));
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="space-y-4">
      {dirty && (
        <div className="flex items-center gap-2 rounded-xl border border-warning/40 bg-warning-soft px-4 py-2.5 text-xs font-medium text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          Content changed since this analysis — click Analyze to refresh.
        </div>
      )}

      <Card className="p-6">
        <div className="flex flex-col items-center gap-6 lg:flex-row">
          <RadialScore score={result.overallScore} label="Deliverability score" />
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-(--border) bg-(--background) p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-(--muted-foreground)">
                <Inbox className="h-3.5 w-3.5" aria-hidden="true" /> Est. Inbox Probability
              </div>
              <p className={`mt-1.5 text-2xl font-bold tabular-nums ${inboxTone.text}`}>~{result.inboxProbability}%</p>
            </div>
            <div className="rounded-xl border border-(--border) bg-(--background) p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-(--muted-foreground)">
                <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" /> Spam Risk
              </div>
              <p className={`mt-1.5 text-2xl font-bold tabular-nums ${spamTone.text}`}>{result.spamRisk}/100</p>
            </div>
            <div className="rounded-xl border border-(--border) bg-(--background) p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-(--muted-foreground)">
                <HeartPulse className="h-3.5 w-3.5" aria-hidden="true" /> Overall Health
              </div>
              <p className={`mt-1.5 inline-flex rounded-md px-2 py-0.5 text-sm font-bold ${overallTone.soft} ${overallTone.text}`}>{result.riskLevel}</p>
            </div>
            <div className="sm:col-span-3">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-danger-soft px-2 py-0.5 font-semibold text-danger">{result.counts.error} errors</span>
                <span className="rounded-full bg-warning-soft px-2 py-0.5 font-semibold text-warning">{result.counts.warning} warnings</span>
                <span className="rounded-full bg-info-soft px-2 py-0.5 font-semibold text-info">{result.counts.info} info</span>
                <span className="ml-auto flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCopyReport}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-(--border) px-2.5 py-1 font-medium text-(--foreground) hover:border-(--primary) hover:text-(--primary)"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                    {copied ? "Copied" : "Copy report"}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadReportTxt(result)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-(--border) px-2.5 py-1 font-medium text-(--foreground) hover:border-(--primary) hover:text-(--primary)"
                  >
                    <FileDown className="h-3.5 w-3.5" aria-hidden="true" /> TXT
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadReportJson(result)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-(--border) px-2.5 py-1 font-medium text-(--foreground) hover:border-(--primary) hover:text-(--primary)"
                  >
                    <FileJson className="h-3.5 w-3.5" aria-hidden="true" /> JSON
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-(--foreground)">Category breakdown</h3>
        <div className="space-y-3.5">
          {result.categoryScores.map((cat) => {
            const tone = toneForScore(cat.score);
            return (
              <div key={cat.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-(--foreground)">{cat.label}</span>
                  <span className={`font-semibold tabular-nums ${tone.text}`}>{cat.score}/100</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-(--muted)" role="progressbar" aria-valuenow={cat.score} aria-valuemin={0} aria-valuemax={100} aria-label={cat.label}>
                  <div className={`h-2 rounded-full transition-[width] duration-700 ease-out ${tone.bg}`} style={{ width: `${cat.score}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {result.highlights.length > 0 && (
        <Card className="p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-(--foreground)">
            <Highlighter className="h-4 w-4 text-(--primary)" aria-hidden="true" /> Flagged phrases in your content
          </h3>
          <p className="mb-3 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-xl border border-(--border) bg-(--background) p-4 text-sm leading-relaxed text-(--foreground)/90">
            {renderHighlighted(result.plainText, result.highlights)}
          </p>
          <div className="space-y-1.5">
            {[...new Map(result.highlights.filter((h) => h.alternative).map((h) => [h.phrase, h])).values()].slice(0, 6).map((h) => (
              <p key={h.phrase} className="text-xs text-(--muted-foreground)">
                <span className="font-semibold text-danger">&quot;{h.phrase}&quot;</span> → try{" "}
                <span className="font-semibold text-success">&quot;{h.alternative}&quot;</span>
              </p>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-(--foreground)">Issues ({filteredIssues.length}/{result.issues.length})</h3>
          <div className="flex flex-wrap gap-1.5">
            {["all", "error", "warning", "info"].map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${severityFilter === sev ? "bg-(--primary) text-(--primary-foreground)" : "bg-(--muted) text-(--muted-foreground)"}`}
              >
                {sev === "all" ? `All (${result.issues.length})` : `${sev} (${result.counts[sev]})`}
              </button>
            ))}
          </div>
        </div>
        {filteredIssues.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl border border-(--border) bg-(--background) p-4 text-sm text-(--muted-foreground)">
            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
            {result.issues.length === 0 ? "No issues detected — this email passes every content check." : "No issues match this filter."}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((iss, idx) => {
              const meta = SEVERITY_META[iss.severity];
              const SevIcon = meta.icon;
              return (
                <div key={`${iss.id}-${idx}`} className="rounded-xl border border-(--border) bg-(--background) p-4">
                  <div className="flex items-start gap-2.5">
                    <SevIcon className={`mt-0.5 h-4 w-4 shrink-0 ${meta.tone.text}`} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.tone.soft} ${meta.tone.text}`}>{meta.label}</span>
                        <h4 className="font-semibold text-(--foreground)">{iss.title}</h4>
                      </div>
                      {iss.detail && <p className="mt-1.5 text-sm text-(--foreground)/85">{iss.detail}</p>}
                      <p className="mt-1.5 text-xs text-(--muted-foreground)">
                        <strong className="text-(--foreground)/70">Why it matters:</strong> {iss.why}
                      </p>
                      <p className="mt-1 text-xs text-(--muted-foreground)">
                        <strong className="text-(--foreground)/70">Fix:</strong> {iss.fix}
                      </p>
                      {iss.example && (
                        <p className="mt-1.5 rounded-lg bg-(--muted) px-2.5 py-1.5 text-[11px] text-(--foreground)/85">{iss.example}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {result.recommendations.length > 0 && (
        <Card className="p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-(--foreground)">
            <Lightbulb className="h-4 w-4 text-(--primary)" aria-hidden="true" /> Top recommendations
          </h3>
          <ol className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-(--foreground)/90">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--primary)/10 text-[11px] font-bold text-(--primary)">{i + 1}</span>
                {rec}
              </li>
            ))}
          </ol>
        </Card>
      )}

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-(--foreground)">
            <Clock3 className="h-4 w-4" aria-hidden="true" /> Recent analyses ({history.length})
          </h3>
          {history.length > 0 && (
            <button type="button" onClick={onClearHistory} className="inline-flex cursor-pointer items-center gap-1 text-xs text-(--muted-foreground) hover:text-danger">
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Clear
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-(--muted-foreground)">Analyzed emails will show up here for quick recall.</p>
        ) : (
          <div className="space-y-2">
            {history.map((entry) => {
              const tone = toneForScore(entry.score);
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onLoadHistory(entry)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-(--border) bg-(--background) p-3 text-left"
                >
                  <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${tone.soft} ${tone.text}`}>{entry.score}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-(--foreground)">{entry.subject || "(no subject)"}</span>
                    <span className="text-xs text-(--muted-foreground)">{entry.risk} · {new Date(entry.ts).toLocaleString()}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
