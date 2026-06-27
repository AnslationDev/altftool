"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clipboard,
  ExternalLink,
  Link2,
  Network,
  RefreshCw,
  Route,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";

function OpportunityStat({ label, value, tone }) {
  return (
    <div className={`rounded-xl px-2 py-2 text-center ${tone}`}>
      <p className="text-lg font-black">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">{label}</p>
    </div>
  );
}

function SuggestionPill({ suggestion }) {
  return (
    <div className="rounded-lg bg-surface px-2 py-2">
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-1 min-w-0 text-xs font-black text-foreground">{suggestion.title}</p>
        <span className="shrink-0 rounded-md bg-primary-soft px-1.5 py-0.5 text-[10px] font-black text-primary">
          {suggestion.score}
        </span>
      </div>
      <p className="mt-1 truncate font-mono text-[10px] text-muted">{suggestion.href}</p>
      {suggestion.reasons?.length ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {suggestion.reasons.slice(0, 2).map((reason) => (
            <span key={`${suggestion.slug}-${reason}`} className="rounded-md bg-surface-soft px-1.5 py-0.5 text-[10px] font-semibold text-muted">
              {reason}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function OpportunityRow({ applying = false, copiedId, item, onApplyPlan, onCopy, onEdit, previewing = false }) {
  const busy = applying || previewing;

  return (
    <article className="rounded-xl border border-border bg-surface-soft px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-black leading-5 text-foreground">{item.blog.title}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.reasons.slice(0, 3).map((reason) => (
              <span key={`${item.blog.id}-${reason}`} className="rounded-lg bg-surface px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted">
                {reason}
              </span>
            ))}
          </div>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-primary shadow-sm">
          <Route className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-surface px-2 py-2">
          <p className="text-sm font-black text-foreground">{item.inboundCount}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Inbound</p>
        </div>
        <div className="rounded-lg bg-surface px-2 py-2">
          <p className="text-sm font-black text-foreground">{item.outboundCount}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Outbound</p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {item.suggestions.slice(0, 3).map((suggestion) => (
          <SuggestionPill key={`${item.blog.id}-${suggestion.slug}`} suggestion={suggestion} />
        ))}
      </div>

      <button
        type="button"
        onClick={() => onApplyPlan?.({ blogIds: [item.blog.id], limit: 1 })}
        disabled={busy}
        className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-2 text-xs font-semibold text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:bg-surface-soft"
      >
        {applying ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <WandSparkles className="h-3.5 w-3.5" />}
        {applying ? "Applying..." : "Preview apply"}
      </button>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onEdit?.(item.blog, "links")}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2 text-xs font-semibold text-white transition hover:bg-primary"
        >
          <WandSparkles className="h-3.5 w-3.5" />
          Open links
        </button>
        <button
          type="button"
          onClick={() => onCopy?.(item)}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-2 text-xs font-semibold text-foreground transition hover:bg-surface-soft"
        >
          {copiedId === item.blog.id ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <Clipboard className="h-3.5 w-3.5" />}
          Copy plan
        </button>
      </div>
    </article>
  );
}

export default function BlogInternalLinkOpportunityPanel({
  applying = false,
  onApplyPlan,
  onEdit,
  previewing = false,
  report,
}) {
  const [copiedId, setCopiedId] = useState("");
  const summary = report?.summary || {};
  const queue = report?.queue || [];
  const busy = applying || previewing;

  const copyPlan = async (item) => {
    if (!item?.planHtml) return;

    try {
      await navigator.clipboard.writeText(item.planHtml);
      setCopiedId(item.blog.id);
      emitAlert({ type: "success", message: "Internal link plan copied." });
      window.setTimeout(() => setCopiedId(""), 1600);
    } catch {
      emitAlert({ type: "warning", message: "Clipboard is not available in this browser." });
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-muted">Internal link opportunities</p>
          <h2 className="mt-1 text-xl font-black text-foreground">{summary.opportunityCount || 0} plans</h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            Topic-match suggestions for isolated posts and articles with thin outbound paths.
          </p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Network className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <OpportunityStat label="No out" value={summary.missingOutbound || 0} tone="bg-warning-soft text-warning" />
        <OpportunityStat label="Isolated" value={summary.isolated || 0} tone="bg-danger-soft text-danger" />
        <OpportunityStat label="Ideas" value={summary.suggestionCount || 0} tone="bg-primary-soft text-primary" />
      </div>

      {summary.zeroInboundSuggestions ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-success-soft px-3 py-3 text-xs font-semibold leading-5 text-success">
          <Sparkles className="h-4 w-4 shrink-0" />
          {summary.zeroInboundSuggestions} suggestions also rescue posts with zero inbound links.
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onApplyPlan?.({ limit: 4 })}
        disabled={busy || !queue.length}
        className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:bg-surface-soft"
      >
        {applying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
        {applying ? "Applying..." : "Preview top internal links"}
      </button>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted">Suggestion queue</p>
          <span className="rounded-lg bg-surface-soft px-2 py-1 text-[10px] font-black text-muted">{queue.length}</span>
        </div>
        {queue.length ? (
          queue.slice(0, 4).map((item) => (
            <OpportunityRow
              key={`internal-opportunity-${item.blog.id}`}
              copiedId={copiedId}
              item={item}
              applying={applying}
              previewing={previewing}
              onApplyPlan={onApplyPlan}
              onCopy={copyPlan}
              onEdit={onEdit}
            />
          ))
        ) : (
          <div className="rounded-xl bg-success-soft px-3 py-3 text-sm font-semibold text-success">
            <CheckCircle2 className="mr-1 inline h-4 w-4" />
            Current published posts have healthy internal link coverage.
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface-soft px-3 py-3 text-xs font-semibold leading-5 text-muted">
        <ExternalLink className="h-4 w-4 shrink-0 text-muted" />
        Copy plan gives editor-ready HTML; Open links keeps the final insert inside the blog editor.
      </div>
    </section>
  );
}
