"use client";

import { useState } from "react";
import {
  Braces,
  Check,
  CircleCheck,
  Clock3,
  Copy,
  ExternalLink,
  Lock,
  LockOpen,
  RefreshCw,
  Repeat2,
  Send,
  Table2,
  TriangleAlert,
} from "lucide-react";
import { chainAsText, exportCsv, exportJson, formatMs } from "../utils/trace";
import { toneColor, toneStyle } from "../utils/tones";
import { CARD, FOCUS_RING } from "./ui.jsx";

/* ------------------------------ Redirect Summary ----------------------------- */

function SummaryStat({ icon: Icon, tone, value, label }) {
  return (
    <div className="flex items-center gap-2.5 p-3">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={toneStyle(tone)}
      >
        <Icon size={16} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold leading-tight tabular-nums text-(--foreground)">
          {value}
        </p>
        <p className="truncate text-[11px] font-medium text-(--muted-foreground)">{label}</p>
      </div>
    </div>
  );
}

export function RedirectSummary({ result }) {
  return (
    <section aria-label="Redirect summary" className={`${CARD} p-4 sm:p-5`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold tracking-tight text-(--foreground)">Redirect Summary</h2>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-bold"
          style={
            result.completed
              ? {
                  backgroundColor: "var(--anslation-ds-success-soft)",
                  color: "color-mix(in srgb, var(--anslation-ds-success) 72%, var(--foreground))",
                }
              : {
                  backgroundColor: "var(--anslation-ds-danger-soft)",
                  color: "color-mix(in srgb, var(--anslation-ds-danger) 75%, var(--foreground))",
                }
          }
        >
          {result.completed ? "Completed" : "Failed"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-2 divide-(--border)">
        <SummaryStat icon={RefreshCw} tone="primary" value={result.chain.length - 1} label="Total Redirects" />
        <SummaryStat icon={Clock3} tone="info" value={formatMs(result.totalTime)} label="Total Time" />
        <SummaryStat
          icon={CircleCheck}
          tone={result.finalStep?.kind === "success" ? "success" : "danger"}
          value={result.finalStep?.status ?? "ERR"}
          label="Final Status"
        />
        <SummaryStat
          icon={result.httpsSecure ? Lock : LockOpen}
          tone={result.httpsSecure ? "primary" : "warning"}
          value={result.httpsSecure ? "HTTPS" : "HTTP"}
          label="Secure"
        />
        <SummaryStat
          icon={result.loop ? TriangleAlert : Repeat2}
          tone={result.loop ? "danger" : "danger"}
          value={result.loop ? "Yes" : "No"}
          label="Redirect Loop"
        />
        <SummaryStat icon={Send} tone="info" value={result.method} label="Method" />
      </div>
    </section>
  );
}

/* ------------------------------ Final Destination ----------------------------- */

function DestRow({ label, value, valueStyle, mono }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <dt className="shrink-0 text-xs text-(--muted-foreground)">{label}</dt>
      <dd
        className={`min-w-0 truncate text-right text-xs font-bold text-(--foreground) ${mono ? "font-mono" : ""}`}
        style={valueStyle}
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </dd>
    </div>
  );
}

export function FinalDestination({ result }) {
  const { finalStep } = result;
  const ok = finalStep?.kind === "success";

  return (
    <section aria-label="Final destination" className={`${CARD} p-4 sm:p-5`}>
      <h2 className="mb-3 text-sm font-bold tracking-tight text-(--foreground)">
        Final Destination
      </h2>

      <div className="flex items-start gap-3 rounded-[10px] border border-(--border) bg-(--background) p-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
          style={{
            backgroundColor: ok ? "var(--anslation-ds-success)" : "var(--anslation-ds-danger)",
          }}
          aria-hidden="true"
        >
          {ok ? <Check size={17} strokeWidth={3} /> : <TriangleAlert size={16} />}
        </span>
        <p
          className="min-w-0 break-all pt-1.5 font-mono text-sm font-bold leading-snug"
          style={{ color: toneColor(ok ? "success" : "danger") }}
        >
          {result.finalUrl}
        </p>
      </div>

      <dl className="mt-2 divide-y divide-(--border)">
        <DestRow
          label="Status Code"
          value={`${finalStep?.status ?? "ERR"} ${finalStep?.statusText ?? ""}`}
          valueStyle={{ color: toneColor(ok ? "success" : "danger") }}
        />
        <DestRow label="Content Type" value={result.contentType} mono />
        <DestRow label="Server" value={result.server} mono />
        <DestRow label="Response Time" value={formatMs(finalStep?.responseTime)} />
        <DestRow label="Redirects" value={result.chain.length - 1} />
        <DestRow label="Final URL" value={result.finalUrl} mono />
      </dl>

      <a
        href={result.finalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-(--muted) px-4 text-sm font-bold text-(--foreground) transition hover:bg-(--primary) hover:text-(--primary-foreground) ${FOCUS_RING}`}
      >
        Open Final URL
        <ExternalLink size={14} aria-hidden="true" />
      </a>
    </section>
  );
}

/* ------------------------------ Response Timeline ----------------------------- */

export function ResponseTimeline({ result }) {
  const max = Math.max(...result.chain.map((step) => step.responseTime), 1);
  const niceMax = Math.max(100, Math.ceil(max / 100) * 100);
  const ticks = [0, niceMax / 3, (niceMax / 3) * 2, niceMax].map(Math.round);

  return (
    <section aria-label="Response timeline" className={`${CARD} p-4 sm:p-5`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold tracking-tight text-(--foreground)">Response Timeline</h2>
        <span className="text-[11px] font-bold tabular-nums text-(--muted-foreground)">
          Total: {formatMs(result.totalTime)}
        </span>
      </div>

      <ol className="space-y-2.5">
        {result.chain.map((step, index) => {
          const isLast = index === result.chain.length - 1;
          return (
            <li key={`${step.url}-${index}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
              <p
                className="truncate font-mono text-[11px] font-semibold text-(--foreground)"
                title={step.url}
              >
                {index + 1}. {step.url}
              </p>
              <span className="text-[11px] font-bold tabular-nums text-(--muted-foreground)">
                {formatMs(step.responseTime)}
              </span>
              <div className="col-span-2 h-2 overflow-hidden rounded-full bg-(--muted)">
                <div
                  className="h-full rounded-full motion-safe:transition-[width] motion-safe:duration-500"
                  style={{
                    width: `${Math.max((step.responseTime / niceMax) * 100, 2)}%`,
                    background: isLast
                      ? "var(--anslation-ds-cta-gradient)"
                      : "color-mix(in srgb, var(--primary) 45%, var(--card))",
                  }}
                  role="img"
                  aria-label={`Step ${index + 1}: ${step.responseTime} milliseconds`}
                />
              </div>
            </li>
          );
        })}
      </ol>

      <div
        aria-hidden="true"
        className="mt-2 flex justify-between border-t border-(--border) pt-1.5 text-[10px] font-medium tabular-nums text-(--muted-foreground)"
      >
        {ticks.map((tick) => (
          <span key={tick}>{tick}ms</span>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- Export Results ------------------------------ */

export function ExportResults({ result }) {
  const [copied, setCopied] = useState(false);

  async function handleCopyChain() {
    try {
      await navigator.clipboard.writeText(chainAsText(result));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  }

  const button = `inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-(--border) bg-(--background) px-3.5 text-xs font-bold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary-hover) dark:hover:text-(--primary) ${FOCUS_RING}`;

  return (
    <section aria-label="Export results" className={`${CARD} p-4 sm:p-5`}>
      <h2 className="text-sm font-bold tracking-tight text-(--foreground)">Export Results</h2>
      <p className="mb-3 mt-1 text-xs text-(--muted-foreground)">
        Download or copy the redirect chain and headers.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={handleCopyChain} className={button}>
          {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          {copied ? "Copied" : "Copy Redirect Chain"}
        </button>
        <button type="button" onClick={() => exportJson(result)} className={button}>
          <Braces size={14} aria-hidden="true" />
          Export as JSON
        </button>
        <button type="button" onClick={() => exportCsv(result)} className={button}>
          <Table2 size={14} aria-hidden="true" />
          Export as CSV
        </button>
      </div>
    </section>
  );
}
